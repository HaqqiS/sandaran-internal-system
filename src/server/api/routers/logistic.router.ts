import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, projectProcedure } from "~/server/api/trpc"

/**
 * Logistic Router
 *
 * Handles logistic items and transactions.
 *
 * Permissions:
 * - FINANCE can create/manage items
 * - MANDOR can record IN/OUT transactions
 * - All project members can view
 */

// FINANCE manages items
const financeProcedure = projectProcedure(["FINANCE"])

// MANDOR records transactions
const mandorProcedure = projectProcedure(["MANDOR"])

// All can view
const projectMemberProcedure = projectProcedure([
  "MANDOR",
  "ARCHITECT",
  "FINANCE",
])

export const logisticRouter = createTRPCRouter({
  /**
   * Create a new logistic item
   * Only FINANCE can create items
   */
  createItem: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1),
        unit: z.string().min(1), // e.g., "Sack", "Pcs", "Kg"
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const item = await ctx.db.logisticItem.create({
        data: {
          projectId: ctx.projectId,
          name: input.name,
          unit: input.unit,
          slug: `${slug}-${Date.now()}`,
        },
      })

      return item
    }),

  /**
   * Get all logistic items for a project
   * All project members can view
   */
  getItems: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const items = await ctx.db.logisticItem.findMany({
        where: {
          projectId: ctx.projectId,
        },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })

      return items
    }),

  /**
   * Update a logistic item
   * Only FINANCE can update
   */
  updateItem: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        itemId: z.string(),
        name: z.string().min(1).optional(),
        unit: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to this project
      const item = await ctx.db.logisticItem.findFirst({
        where: {
          id: input.itemId,
          projectId: ctx.projectId,
        },
      })

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Logistic item not found in this project",
        })
      }

      const updated = await ctx.db.logisticItem.update({
        where: { id: input.itemId },
        data: {
          name: input.name,
          unit: input.unit,
        },
      })

      return updated
    }),

  /**
   * Delete a logistic item
   * Only FINANCE can delete
   */
  deleteItem: financeProcedure
    .input(
      z.object({
        projectId: z.string(),
        itemId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to this project
      const item = await ctx.db.logisticItem.findFirst({
        where: {
          id: input.itemId,
          projectId: ctx.projectId,
        },
      })

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Logistic item not found in this project",
        })
      }

      await ctx.db.logisticItem.delete({
        where: { id: input.itemId },
      })

      return { success: true }
    }),

  /**
   * Record a logistic transaction (IN or OUT)
   * MANDOR can record transactions
   */
  recordTransaction: mandorProcedure
    .input(
      z.object({
        projectId: z.string(),
        itemId: z.string(),
        type: z.enum(["IN", "OUT"]),
        quantity: z.number().positive(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to this project
      const item = await ctx.db.logisticItem.findFirst({
        where: {
          id: input.itemId,
          projectId: ctx.projectId,
        },
      })

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Logistic item not found in this project",
        })
      }

      const transaction = await ctx.db.logisticTransaction.create({
        data: {
          itemId: input.itemId,
          userId: ctx.session.user.id,
          type: input.type,
          quantity: input.quantity,
          notes: input.notes,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          item: true,
        },
      })

      return transaction
    }),

  /**
   * Get all transactions for an item
   * All project members can view
   */
  getTransactions: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        itemId: z.string().optional(),
        type: z.enum(["IN", "OUT"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // If itemId provided, verify it belongs to this project
      if (input.itemId) {
        const item = await ctx.db.logisticItem.findFirst({
          where: {
            id: input.itemId,
            projectId: ctx.projectId,
          },
        })

        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Logistic item not found in this project",
          })
        }
      }

      // Get all items for this project
      const projectItems = await ctx.db.logisticItem.findMany({
        where: { projectId: ctx.projectId },
        select: { id: true },
      })

      const projectItemIds = projectItems.map((item) => item.id)

      const transactions = await ctx.db.logisticTransaction.findMany({
        where: {
          itemId: {
            in: input.itemId ? [input.itemId] : projectItemIds,
          },
          ...(input.type && { type: input.type }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          item: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return transactions
    }),

  /**
   * Get stock summary for all items
   * All project members can view
   */
  getStockSummary: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const items = await ctx.db.logisticItem.findMany({
        where: {
          projectId: ctx.projectId,
        },
        include: {
          transactions: true,
        },
      })

      // Calculate stock for each item
      const summary = items.map((item) => {
        const totalIn = item.transactions
          .filter((t) => t.type === "IN")
          .reduce((sum, t) => sum + Number(t.quantity), 0)

        const totalOut = item.transactions
          .filter((t) => t.type === "OUT")
          .reduce((sum, t) => sum + Number(t.quantity), 0)

        const currentStock = totalIn - totalOut

        return {
          id: item.id,
          name: item.name,
          unit: item.unit,
          slug: item.slug,
          totalIn,
          totalOut,
          currentStock,
        }
      })

      return summary
    }),
})
