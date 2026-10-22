import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { deleteCloudinaryAsset, isValidCloudinaryUrl } from "~/lib/cloudinary";
import {
  createTRPCRouter,
  projectProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

/**
 * Emergency Fund Router
 *
 * Handles emergency fund management and transactions.
 *
 * Permissions:
 * - SUPERVISOR can request funds (Withdraw)
 * - FINANCE can add balance (Deposit) and verify requests
 * - All project members can view
 */

// SUPERVISOR can request
const supervisorProcedure = projectProcedure(["SUPERVISOR"]);
const mandorProcedure = supervisorProcedure; // Backward compatibility

// FINANCE can manage
const financeProcedure = projectProcedure(["FINANCE"]);

// All can view
const projectMemberProcedure = projectProcedure([
  "SUPERVISOR",
  "ARCHITECT",
  "FINANCE",
  "LOGISTIC",
]);

export const emergencyRouter = createTRPCRouter({
  /**
   * Get emergency fund analytics: Balances & Monthly Activity per Project
   */
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const isAdminOrExecutive =
      user.roleGlobal === "ADMIN" || user.roleGlobal === "EXECUTIVE";

    const projects = await ctx.db.project.findMany({
      where: isAdminOrExecutive
        ? { status: "ACTIVE" }
        : {
            status: "ACTIVE",
            members: {
              some: {
                userId: user.id,
                role: "FINANCE",
              },
            },
          },
      select: {
        id: true,
        name: true,
        slug: true,
        emergencyFund: {
          select: {
            currentBalance: true,
          },
        },
      },
    });

    const projectIds = projects.map((p) => p.id);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const transactions = await ctx.db.emergencyTransaction.findMany({
      where: {
        fund: { projectId: { in: projectIds } },
        createdAt: { gte: sixMonthsAgo },
        status: "REVIEWED",
      },
      select: {
        amount: true,
        type: true,
        createdAt: true,
        fund: {
          select: { projectId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const getEmptyMonths = () => {
      const months = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        months.push({
          month: d.toLocaleString("default", { month: "short" }),
          key: `${d.getFullYear()}-${d.getMonth()}`,
          deposit: 0,
          withdrawal: 0,
          order: i,
        });
      }
      return months;
    };

    const projectsWithAnalytics = projects.map((project) => {
      const monthlyData = getEmptyMonths();
      const monthMap = new Map(monthlyData.map((m) => [m.key, m]));

      const projectTx = transactions.filter(
        (tx) => tx.fund.projectId === project.id,
      );

      projectTx.forEach((tx) => {
        const d = new Date(tx.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const entry = monthMap.get(key);

        if (entry) {
          if (tx.type === "DEPOSIT") {
            entry.deposit += Number(tx.amount);
          } else if (tx.type === "WITHDRAWAL") {
            entry.withdrawal += Number(tx.amount);
          }
        }
      });

      return {
        id: project.id,
        name: project.name,
        slug: project.slug,
        balance: project.emergencyFund?.currentBalance ?? 0,
        monthlyActivity: Array.from(monthMap.values()).sort(
          (a, b) => a.order - b.order,
        ),
      };
    });

    return {
      projects: projectsWithAnalytics,
    };
  }),
  /**
   * Get emergency fund for a project
   * All project members can view
   */
  getByProject: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const fund = await ctx.db.emergencyFund.findUnique({
        where: {
          projectId: ctx.projectId,
        },
        include: {
          transactions: {
            include: {
              requester: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              verifier: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      // Create fund if doesn't exist
      if (!fund) {
        const newFund = await ctx.db.emergencyFund.create({
          data: { projectId: ctx.projectId, currentBalance: 0 },
          include: { transactions: true },
        });
        return newFund;
      }
      return fund;
    }),

  /**
   * Add balance to emergency fund (Top-up)
   * Only FINANCE can add balance
   */
  addBalance: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        amount: z.number().positive(),
        description: z.string().trim().min(1).max(2000),
        proofPublicId: z
          .string()
          .refine((p) => p.startsWith("astaloka/") && !p.includes(".."), {
            message: "Format publicId tidak valid",
          })
          .optional(),
        proofUrl: z
          .string()
          .refine((val) => !val || isValidCloudinaryUrl(val), {
            message: "URL bukti harus berupa URL Cloudinary yang valid",
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // Get or create fund atomically
        let fund = await tx.emergencyFund.findUnique({
          where: { projectId: ctx.projectId },
        });

        if (!fund) {
          fund = await tx.emergencyFund.create({
            data: {
              projectId: ctx.projectId,
              currentBalance: 0,
            },
          });
        }

        // Create transaction and update balance atomically
        const transaction = await tx.emergencyTransaction.create({
          data: {
            fundId: fund.id,
            requestedById: ctx.session.user.id,
            amount: input.amount,
            description: input.description,
            publicId: input.proofPublicId,
            url: input.proofUrl,
            type: "DEPOSIT",
            status: "UNREVIEWED",
            verifiedById: null,
            verifiedAt: null,
          },
        });

        // Update fund balance
        await tx.emergencyFund.update({
          where: { id: fund.id },
          data: {
            currentBalance: {
              increment: input.amount,
            },
          },
        });

        return transaction;
      });
    }),

  /**
   * Request emergency fund (Withdraw)
   * MANDOR can request
   */
  request: mandorProcedure
    .input(
      z.object({
        projectId: z.string(),
        amount: z.number().positive(),
        description: z.string().trim().min(1).max(2000),
        proofPublicId: z
          .string()
          .refine((p) => p.startsWith("astaloka/") && !p.includes(".."), {
            message: "Format publicId tidak valid",
          })
          .optional(),
        proofUrl: z
          .string()
          .refine((val) => !val || isValidCloudinaryUrl(val), {
            message: "URL bukti harus berupa URL Cloudinary yang valid",
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // 1. Get fund
        const fund = await tx.emergencyFund.findUnique({
          where: { projectId: ctx.projectId },
        });

        if (!fund) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Emergency fund not found for this project",
          });
        }

        // 2. Atomic conditional decrement to eliminate TOCTOU race conditions
        const updateResult = await tx.emergencyFund.updateMany({
          where: {
            id: fund.id,
            currentBalance: {
              gte: input.amount,
            },
          },
          data: {
            currentBalance: {
              decrement: input.amount,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saldo kas darurat tidak mencukupi untuk penarikan ini",
          });
        }

        // 3. Create transaction record only if balance was successfully reserved
        const transaction = await tx.emergencyTransaction.create({
          data: {
            fundId: fund.id,
            requestedById: ctx.session.user.id,
            amount: input.amount,
            description: input.description,
            publicId: input.proofPublicId,
            url: input.proofUrl,
            type: "WITHDRAWAL",
            status: "UNREVIEWED",
          },
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        return transaction;
      });
    }),

  /**
   * Verify (Review) or Undo Review emergency fund request
   * Only FINANCE can verify/unverify
   */
  verify: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        transactionId: z.string(),
        status: z.enum(["REVIEWED", "UNREVIEWED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get transaction
      const transaction = await ctx.db.emergencyTransaction.findUnique({
        where: { id: input.transactionId },
        include: {
          fund: true,
        },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      // Verify transaction belongs to this project
      if (transaction.fund.projectId !== ctx.projectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Transaction does not belong to this project",
        });
      }

      if (input.status === "REVIEWED") {
        // Check if already verified
        if (transaction.status !== "UNREVIEWED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Transaksi sudah ditinjau",
          });
        }
      } else {
        // Undo Review (UNREVIEWED)
        if (transaction.status !== "REVIEWED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Transaksi belum ditinjau",
          });
        }
      }

      // Update transaction status
      // Balance was already deducted during request creation, so we don't change it here
      const updated = await ctx.db.emergencyTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: input.status,
          verifiedById:
            input.status === "REVIEWED" ? ctx.session.user.id : null,
          verifiedAt: input.status === "REVIEWED" ? new Date() : null,
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          verifier: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return updated;
    }),

  /**
   * Edit an emergency transaction
   * Owner can edit their own transactions:
   * - MANDOR can edit their own UNREVIEWED WITHDRAWALs
   * - FINANCE can edit their own DEPOSITs
   * - ADMIN can edit any transaction (with balance safety)
   */
  edit: projectProcedure(["SUPERVISOR", "FINANCE"])
    .input(
      z.object({
        projectId: z.string(),
        transactionId: z.string(),
        amount: z.number().positive(),
        description: z.string().trim().min(1).max(2000),
        proofPublicId: z
          .string()
          .refine(
            (val) =>
              !val || (val.startsWith("astaloka/") && !val.includes("..")),
            { message: "Format publicId tidak valid" },
          )
          .nullable()
          .optional(),
        proofUrl: z
          .string()
          .refine((val) => !val || isValidCloudinaryUrl(val), {
            message: "URL bukti harus berupa URL Cloudinary yang valid",
          })
          .nullable()
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId, roleGlobal } = ctx.session.user;
      const isAdminUser = roleGlobal === "ADMIN";

      // Get the existing transaction
      const transaction = await ctx.db.emergencyTransaction.findUnique({
        where: { id: input.transactionId },
        include: { fund: true },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      // Verify transaction belongs to this project
      if (transaction.fund.projectId !== ctx.projectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Transaction does not belong to this project",
        });
      }

      // Ownership check: only the creator or ADMIN can edit
      if (!isAdminUser && transaction.requestedById !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Anda hanya bisa mengedit transaksi milik sendiri",
        });
      }

      // Status check: WITHDRAWAL can only be edited if UNREVIEWED
      if (
        transaction.type === "WITHDRAWAL" &&
        transaction.status !== "UNREVIEWED"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Penarikan yang sudah ditinjau tidak dapat diedit",
        });
      }

      // Issue 3: If transaction is REVIEWED, image cannot be changed
      if (
        transaction.status === "REVIEWED" &&
        ((input.proofPublicId !== undefined &&
          input.proofPublicId !== transaction.publicId) ||
          (input.proofUrl !== undefined && input.proofUrl !== transaction.url))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Bukti foto transaksi yang sudah ditinjau tidak dapat diubah",
        });
      }

      // Issue 4: When editing image, delete old image from Cloudinary
      const isImageReplaced =
        input.proofPublicId !== undefined &&
        input.proofPublicId !== transaction.publicId;

      if (isImageReplaced && transaction.publicId) {
        await deleteCloudinaryAsset(transaction.publicId).catch((err) => {
          console.error("Failed to delete old Cloudinary asset on edit:", err);
        });
      }

      // Calculate and apply atomic balance adjustment inside transaction
      const oldAmount = Number(transaction.amount);
      const newAmount = input.amount;

      return ctx.db.$transaction(async (tx) => {
        if (transaction.type === "DEPOSIT") {
          const diff = newAmount - oldAmount;
          if (diff > 0) {
            await tx.emergencyFund.update({
              where: { id: transaction.fundId },
              data: { currentBalance: { increment: diff } },
            });
          } else if (diff < 0) {
            const decrease = Math.abs(diff);
            const updateResult = await tx.emergencyFund.updateMany({
              where: {
                id: transaction.fundId,
                currentBalance: { gte: decrease },
              },
              data: { currentBalance: { decrement: decrease } },
            });

            if (updateResult.count === 0) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "Perubahan ini akan menyebabkan saldo menjadi negatif karena dana telah terpakai. Operasi dibatalkan.",
              });
            }
          }
        } else {
          // WITHDRAWAL
          const diff = newAmount - oldAmount;
          if (diff > 0) {
            // Withdrawing more money requires sufficient current balance
            const extra = diff;
            const updateResult = await tx.emergencyFund.updateMany({
              where: {
                id: transaction.fundId,
                currentBalance: { gte: extra },
              },
              data: { currentBalance: { decrement: extra } },
            });

            if (updateResult.count === 0) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "Saldo kas darurat tidak mencukupi untuk menambah jumlah penarikan ini.",
              });
            }
          } else if (diff < 0) {
            // Withdrawing less money returns the difference to the balance
            const refund = Math.abs(diff);
            await tx.emergencyFund.update({
              where: { id: transaction.fundId },
              data: { currentBalance: { increment: refund } },
            });
          }
        }

        const updated = await tx.emergencyTransaction.update({
          where: { id: input.transactionId },
          data: {
            amount: newAmount,
            description: input.description,
            publicId:
              input.proofPublicId !== undefined
                ? input.proofPublicId
                : transaction.publicId,
            url:
              input.proofUrl !== undefined ? input.proofUrl : transaction.url,
          },
          include: {
            requester: {
              select: { id: true, name: true, image: true },
            },
            verifier: {
              select: { id: true, name: true, image: true },
            },
          },
        });

        return updated;
      });
    }),

  /**
   * Delete an emergency transaction
   * Owner can delete their own transactions:
   * - MANDOR can delete their own UNREVIEWED WITHDRAWALs
   * - FINANCE can delete their own DEPOSITs
   * - ADMIN can delete any transaction (with balance safety)
   */
  delete: projectProcedure(["SUPERVISOR", "FINANCE"])
    .input(
      z.object({
        projectId: z.string(),
        transactionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId, roleGlobal } = ctx.session.user;
      const isAdminUser = roleGlobal === "ADMIN";

      // Get the existing transaction
      const transaction = await ctx.db.emergencyTransaction.findUnique({
        where: { id: input.transactionId },
        include: { fund: true },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      // Verify transaction belongs to this project
      if (transaction.fund.projectId !== ctx.projectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Transaction does not belong to this project",
        });
      }

      // Ownership check: only the creator or ADMIN can delete
      if (!isAdminUser && transaction.requestedById !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Anda hanya bisa menghapus transaksi milik sendiri",
        });
      }

      // Status check: WITHDRAWAL can only be deleted if UNREVIEWED
      if (
        transaction.type === "WITHDRAWAL" &&
        transaction.status !== "UNREVIEWED"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Penarikan yang sudah ditinjau tidak dapat dihapus",
        });
      }

      const amount = Number(transaction.amount);

      // Atomic delete + balance update
      await ctx.db.$transaction(async (tx) => {
        if (transaction.type === "DEPOSIT") {
          const updateResult = await tx.emergencyFund.updateMany({
            where: {
              id: transaction.fundId,
              currentBalance: { gte: amount },
            },
            data: { currentBalance: { decrement: amount } },
          });

          if (updateResult.count === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Menghapus transaksi deposit ini akan menyebabkan saldo kas menjadi negatif karena dana telah terpakai. Operasi dibatalkan.",
            });
          }
        } else {
          // WITHDRAWAL: restoring reserved funds back to the fund
          await tx.emergencyFund.update({
            where: { id: transaction.fundId },
            data: { currentBalance: { increment: amount } },
          });
        }

        await tx.emergencyTransaction.delete({
          where: { id: input.transactionId },
        });
      });

      // Delete asset from Cloudinary only after database transaction successfully commits
      if (transaction.publicId) {
        await deleteCloudinaryAsset(transaction.publicId).catch((err) => {
          console.error(
            "Failed to delete Cloudinary asset for emergency transaction:",
            err,
          );
        });
      }

      return { success: true };
    }),

  /**
   * Get all transactions for a project
   * All project members can view
   */
  getTransactions: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z.enum(["UNREVIEWED", "REVIEWED"]).optional(),
        type: z.enum(["DEPOSIT", "WITHDRAWAL"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get fund
      const fund = await ctx.db.emergencyFund.findUnique({
        where: { projectId: ctx.projectId },
      });

      if (!fund) {
        return [];
      }

      const transactions = await ctx.db.emergencyTransaction.findMany({
        where: {
          fundId: fund.id,
          ...(input.status && { status: input.status }),
          ...(input.type && { type: input.type }),
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          verifier: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return transactions;
    }),

  /**
   * Get recent transactions for Finance dashboard
   * Returns transactions with project context for all projects where user is FINANCE
   */
  getRecentTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(15).optional(),
        status: z.enum(["UNREVIEWED", "REVIEWED"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get projects where user is FINANCE
      const projectIds = await ctx.db.projectMember
        .findMany({
          where: { userId, role: "FINANCE" },
          select: { projectId: true },
        })
        .then((members) => members.map((m) => m.projectId));

      if (!projectIds.length) return [];

      // Get emergency funds for these projects
      const fundIds = await ctx.db.emergencyFund
        .findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
        })
        .then((funds) => funds.map((f) => f.id));

      if (!fundIds.length) return [];

      // Get transactions
      const transactions = await ctx.db.emergencyTransaction.findMany({
        where: {
          fundId: { in: fundIds },
          ...(input.status && { status: input.status }),
        },
        take: input.limit ?? 15,
        orderBy: { createdAt: "desc" },
        include: {
          fund: {
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          verifier: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return transactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        type: tx.type,
        status: tx.status,
        proofPublicId: tx.publicId,
        createdAt: tx.createdAt,
        verifiedAt: tx.verifiedAt,
        project: tx.fund.project,
        requester: tx.requester,
        verifier: tx.verifier,
      }));
    }),
});
