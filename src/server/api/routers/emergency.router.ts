import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, projectProcedure } from "~/server/api/trpc"

/**
 * Emergency Fund Router
 *
 * Handles emergency fund management and transactions.
 *
 * Permissions:
 * - MANDOR can request funds
 * - FINANCE can add balance and verify transactions
 * - All project members can view
 */

// MANDOR can request
const mandorProcedure = projectProcedure(["MANDOR"])

// FINANCE can manage
const financeProcedure = projectProcedure(["FINANCE"])

// All can view
const projectMemberProcedure = projectProcedure([
  "MANDOR",
  "ARCHITECT",
  "FINANCE",
])

export const emergencyRouter = createTRPCRouter({
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
      })

      // Create fund if doesn't exist
      if (!fund) {
        const newFund = await ctx.db.emergencyFund.create({
          data: { projectId: ctx.projectId, currentBalance: 0 },
          include: { transactions: true },
        })
        return newFund
      }
      return fund
    }),

  /**
   * Add balance to emergency fund
   * Only FINANCE can add balance
   */
  addBalance: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        amount: z.number().positive(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create fund
      let fund = await ctx.db.emergencyFund.findUnique({
        where: { projectId: ctx.projectId },
      })

      if (!fund) {
        fund = await ctx.db.emergencyFund.create({
          data: {
            projectId: ctx.projectId,
            currentBalance: 0,
          },
        })
      }

      // Create transaction and update balance
      const transaction = await ctx.db.emergencyTransaction.create({
        data: {
          fundId: fund.id,
          requestedById: ctx.session.user.id,
          amount: input.amount,
          description: input.description,
          status: "APPROVED", // Auto-approved for balance additions
          verifiedById: ctx.session.user.id,
          verifiedAt: new Date(),
        },
      })

      // Update fund balance
      await ctx.db.emergencyFund.update({
        where: { id: fund.id },
        data: {
          currentBalance: {
            increment: input.amount,
          },
        },
      })

      return transaction
    }),

  /**
   * Request emergency fund
   * MANDOR can request
   */
  request: mandorProcedure
    .input(
      z.object({
        projectId: z.string(),
        amount: z.number().positive(),
        description: z.string().min(1),
        proofPublicId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get fund
      const fund = await ctx.db.emergencyFund.findUnique({
        where: { projectId: ctx.projectId },
      })

      if (!fund) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Emergency fund not found for this project",
        })
      }

      // Check if sufficient balance
      if (Number(fund.currentBalance) < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient emergency fund balance",
        })
      }

      const transaction = await ctx.db.emergencyTransaction.create({
        data: {
          fundId: fund.id,
          requestedById: ctx.session.user.id,
          amount: input.amount,
          description: input.description,
          proofPublicId: input.proofPublicId,
          status: "PENDING",
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
      })

      return transaction
    }),

  /**
   * Verify (approve/reject) emergency fund request
   * Only FINANCE can verify
   */
  verify: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        transactionId: z.string(),
        status: z.enum(["APPROVED", "REJECTED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get transaction
      const transaction = await ctx.db.emergencyTransaction.findUnique({
        where: { id: input.transactionId },
        include: {
          fund: true,
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        })
      }

      // Verify transaction belongs to this project
      if (transaction.fund.projectId !== ctx.projectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Transaction does not belong to this project",
        })
      }

      // Check if already verified
      if (transaction.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transaction already verified",
        })
      }

      // Update transaction
      const updated = await ctx.db.emergencyTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: input.status,
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
      })

      // If approved, deduct from balance
      if (input.status === "APPROVED") {
        await ctx.db.emergencyFund.update({
          where: { id: transaction.fundId },
          data: {
            currentBalance: {
              decrement: transaction.amount,
            },
          },
        })
      }

      return updated
    }),

  /**
   * Get all transactions for a project
   * All project members can view
   */
  getTransactions: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get fund
      const fund = await ctx.db.emergencyFund.findUnique({
        where: { projectId: ctx.projectId },
      })

      if (!fund) {
        return []
      }

      const transactions = await ctx.db.emergencyTransaction.findMany({
        where: {
          fundId: fund.id,
          ...(input.status && { status: input.status }),
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
      })

      return transactions
    }),
})
