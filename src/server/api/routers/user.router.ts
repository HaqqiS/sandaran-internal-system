import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  adminOrCeoProcedure,
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  /**
   * Get all users with enhanced filtering (admin + CEO read-only)
   */
  getAllUsersWithFilter: adminOrCeoProcedure
    .input(
      z.object({
        filter: z.enum(["all", "pending", "active", "rejected"]).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build where clause based on filter
      const where: {
        isActive?: boolean;
        reviewedAt?: { not: null } | null;
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          email?: { contains: string; mode: "insensitive" };
        }>;
      } = {};

      if (input.filter === "pending") {
        where.isActive = false;
        where.reviewedAt = null;
      } else if (input.filter === "active") {
        where.isActive = true;
        where.reviewedAt = { not: null };
      } else if (input.filter === "rejected") {
        where.isActive = false;
        where.reviewedAt = { not: null };
      }
      // if filter === 'all' or undefined, no filter applied

      // Add search filter
      if (input.search && input.search.trim() !== "") {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return ctx.db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          roleGlobal: true,
          isActive: true,
          reviewedAt: true,
          reviewedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          createdAt: true,
          _count: {
            select: {
              projectMembers: true,
            },
          },
        },
      });
    }),

  /**
   * Get user details by ID (admin + CEO read-only)
   */
  getUserDetails: adminOrCeoProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          reviewedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          projectMembers: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              reports: true,
              requests: true,
              documents: true,
            },
          },
        },
      });
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
        reviewedAt: true,
        createdAt: true,
      },
    });
  }),

  /**
   * Search users (for adding members)
   * Returns users not strictly restricted
   */
  search: protectedProcedure
    .input(z.object({ query: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const query = input.query || "";

      return ctx.db.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });
    }),

  /**
   * Approve user and optionally assign to project
   */
  approveUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        roleGlobal: z.enum(["ADMIN", "CEO", "USER", "NONE"]).default("USER"),
        projectAssignment: z
          .object({
            projectId: z.string(),
            role: z.enum(["MANDOR", "ARCHITECT", "FINANCE"]),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, roleGlobal, projectAssignment } = input;
      const approverId = ctx.session.user.id;

      // Validation: cannot approve self to ADMIN unless already ADMIN
      if (roleGlobal === "ADMIN" && userId === approverId) {
        if (ctx.session.user.roleGlobal !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot self-promote to ADMIN",
          });
        }
      }

      // Update user global role & status
      const user = await ctx.db.user.update({
        where: { id: userId },
        data: {
          roleGlobal,
          isActive: true,
          reviewedAt: new Date(),
          reviewedById: approverId,
        },
      });

      // Handle project assignment if provided
      if (projectAssignment) {
        // Check if project exists
        const project = await ctx.db.project.findUnique({
          where: { id: projectAssignment.projectId },
        });

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        // Upsert project member
        await ctx.db.projectMember.upsert({
          where: {
            userId_projectId: {
              userId,
              projectId: projectAssignment.projectId,
            },
          },
          create: {
            userId,
            projectId: projectAssignment.projectId,
            role: projectAssignment.role,
          },
          update: {
            role: projectAssignment.role,
          },
        });
      }

      return user;
    }),

  /**
   * Reject user (soft delete)
   */
  rejectUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const reviewerId = ctx.session.user.id;

      // Validation: cannot reject self
      if (userId === reviewerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot reject yourself",
        });
      }

      return ctx.db.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          roleGlobal: "NONE",
          reviewedAt: new Date(),
          reviewedById: reviewerId,
        },
      });
    }),

  /**
   * Bulk approve users
   */
  bulkApprove: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        roleGlobal: z.enum(["ADMIN", "CEO", "USER"]).default("USER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userIds, roleGlobal } = input;
      const approverId = ctx.session.user.id;

      // Filter out self if trying to approve self to ADMIN
      const validUserIds =
        roleGlobal === "ADMIN"
          ? userIds.filter((id) => id !== approverId)
          : userIds;

      if (validUserIds.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid users to approve",
        });
      }

      return ctx.db.user.updateMany({
        where: {
          id: { in: validUserIds },
        },
        data: {
          roleGlobal,
          isActive: true,
          reviewedAt: new Date(),
          reviewedById: approverId,
        },
      });
    }),

  /**
   * Update user global role (with validations)
   */
  updateGlobalRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        roleGlobal: z.enum(["ADMIN", "CEO", "USER", "NONE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, roleGlobal } = input;
      const currentUserId = ctx.session.user.id;

      // Get the target user
      const targetUser = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { roleGlobal: true },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Validation 1: Prevent self-demotion from ADMIN
      if (userId === currentUserId && targetUser.roleGlobal === "ADMIN") {
        if (roleGlobal !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot demote yourself from ADMIN role",
          });
        }
      }

      // Validation 2: Protect last admin
      if (targetUser.roleGlobal === "ADMIN" && roleGlobal !== "ADMIN") {
        const adminCount = await ctx.db.user.count({
          where: {
            roleGlobal: "ADMIN",
            isActive: true,
          },
        });

        if (adminCount <= 1) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "Cannot demote the last admin. Promote another user to ADMIN first.",
          });
        }
      }

      return ctx.db.user.update({
        where: { id: userId },
        data: { roleGlobal },
      });
    }),

  /**
   * Delete user (soft delete for inactive users only)
   */
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const currentUserId = ctx.session.user.id;

      // Validation: Cannot delete self
      if (userId === currentUserId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete yourself",
        });
      }

      // Get user to validate inactive status
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { isActive: true, roleGlobal: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Validation: Only delete inactive users
      if (user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can only delete inactive users. Reject the user first.",
        });
      }

      // Delete the user (hard delete or you can mark as deleted)
      return ctx.db.user.delete({
        where: { id: userId },
      });
    }),
});
