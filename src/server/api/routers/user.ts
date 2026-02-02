import { z } from "zod"
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc"

export const userRouter = createTRPCRouter({
  /**
   * Get all users (admin only)
   */
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        roleGlobal: true,
        isActive: true,
        approvedAt: true,
        approvedById: true,
        approvedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
  }),

  /**
   * Get pending users (not approved yet)
   */
  getPending: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      where: {
        OR: [{ isActive: false }, { roleGlobal: "NONE" }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roleGlobal: true,
        isActive: true,
        createdAt: true,
      },
    })
  }),

  /**
   * Approve user and assign role
   */
  approveUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "CEO", "USER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, role } = input
      const approverId = ctx.session.user.id

      return ctx.db.user.update({
        where: { id: userId },
        data: {
          roleGlobal: role,
          isActive: true,
          approvedAt: new Date(),
          approvedById: approverId,
        },
      })
    }),

  /**
   * Reject/deactivate user
   */
  deactivateUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          isActive: false,
          roleGlobal: "NONE",
        },
      })
    }),

  /**
   * Update user role
   */
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "CEO", "USER", "NONE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          roleGlobal: input.role,
        },
      })
    }),

  /**
   * Get current user info
   */
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        roleGlobal: true,
        isActive: true,
        approvedAt: true,
        createdAt: true,
      },
    })
  }),
})
