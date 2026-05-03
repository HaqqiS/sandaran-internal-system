import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
 * - MANDOR can request funds (Withdraw)
 * - FINANCE can add balance (Deposit) and verify requests
 * - All project members can view
 */

// MANDOR can request
const mandorProcedure = projectProcedure(["MANDOR"]);

// FINANCE can manage
const financeProcedure = projectProcedure(["FINANCE"]);

// All can view
const projectMemberProcedure = projectProcedure([
  "MANDOR",
  "ARCHITECT",
  "FINANCE",
]);

export const emergencyRouter = createTRPCRouter({
  /**
   * Get emergency fund analytics: Balances & Monthly Activity per Project
   */
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const isAdminOrCEO =
      user.roleGlobal === "ADMIN" || user.roleGlobal === "CEO";

    const projects = await ctx.db.project.findMany({
      where: isAdminOrCEO
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
        description: z.string(),
        proofPublicId: z.string().optional(),
        proofUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create fund
      let fund = await ctx.db.emergencyFund.findUnique({
        where: { projectId: ctx.projectId },
      });

      if (!fund) {
        fund = await ctx.db.emergencyFund.create({
          data: {
            projectId: ctx.projectId,
            currentBalance: 0,
          },
        });
      }

      // Create transaction and update balance
      const transaction = await ctx.db.emergencyTransaction.create({
        data: {
          fundId: fund.id,
          requestedById: ctx.session.user.id,
          amount: input.amount,
          description: input.description,
          publicId: input.proofPublicId,
          url: input.proofUrl,
          type: "DEPOSIT",
          status: "REVIEWED", // Auto-approved for balance additions
          verifiedById: ctx.session.user.id,
          verifiedAt: new Date(),
        },
      });

      // Update fund balance
      await ctx.db.emergencyFund.update({
        where: { id: fund.id },
        data: {
          currentBalance: {
            increment: input.amount,
          },
        },
      });

      return transaction;
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
        description: z.string().min(1),
        proofPublicId: z.string().optional(),
        proofUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get fund
      const fund = await ctx.db.emergencyFund.findUnique({
        where: { projectId: ctx.projectId },
      });

      if (!fund) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Emergency fund not found for this project",
        });
      }

      // Check if sufficient balance
      // NOTE: Balance decreases immediately upon request creation
      if (Number(fund.currentBalance) < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient emergency fund balance",
        });
      }

      const transaction = await ctx.db.emergencyTransaction.create({
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

      // Deduct balance immediately
      await ctx.db.emergencyFund.update({
        where: { id: fund.id },
        data: {
          currentBalance: {
            decrement: input.amount,
          },
        },
      });

      return transaction;
    }),

  /**
   * Verify (Review) emergency fund request
   * Only FINANCE can verify
   */
  verify: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        transactionId: z.string(),
        status: z.enum(["REVIEWED"]),
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

      // Check if already verified
      if (transaction.status !== "UNREVIEWED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transaction already reviewed",
        });
      }

      // Update transaction status
      // Balance was already deducted during request creation, so we don't change it here
      const updated = await ctx.db.emergencyTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: input.status, // "REVIEWED"
          verifiedById: ctx.session.user.id,
          verifiedAt: new Date(),
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
