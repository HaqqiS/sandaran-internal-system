import { TRPCError } from "@trpc/server"
import { z } from "zod"
import {
  adminProcedure,
  createTRPCRouter,
  projectProcedure,
  protectedProcedure,
} from "~/server/api/trpc"

/**
 * Project Router
 *
 * Handles project CRUD and member management.
 *
 * Permissions:
 * - ADMIN can create, update, delete projects
 * - ADMIN can manage project members
 * - All project members can view project details
 * - CEO can view all projects (read-only)
 */

// All project members can view
const projectMemberProcedure = projectProcedure([
  "MANDOR",
  "ARCHITECT",
  "FINANCE",
])

export const projectRouter = createTRPCRouter({
  /**
   * Create a new project
   * Only ADMIN can create projects
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        location: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["ACTIVE", "DONE", "PAUSED"]).default("ACTIVE"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existing = await ctx.db.project.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project with this slug already exists",
        })
      }

      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          location: input.location,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status,
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      })

      return project
    }),

  /**
   * Get all projects
   * - CEO can view all projects
   * - USER sees only their projects
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId, roleGlobal } = ctx.session.user

    // CEO and ADMIN can see all projects
    if (roleGlobal === "CEO" || roleGlobal === "ADMIN") {
      const projects = await ctx.db.project.findMany({
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              dailyReports: true,
              documents: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return projects
    }

    // Regular USER sees only their projects
    const projects = await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            dailyReports: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return projects
  }),

  /**
   * Get project by ID
   * Project members + CEO can view
   */
  getById: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: ctx.projectId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  roleGlobal: true,
                },
              },
            },
          },
          emergencyFund: true,
          _count: {
            select: {
              dailyReports: true,
              documents: true,
              logistics: true,
            },
          },
        },
      })

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

      return project
    }),

  /**
   * Update project
   * Only ADMIN can update projects
   */
  update: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["ACTIVE", "DONE", "PAUSED"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.update({
        where: { id: input.projectId },
        data: {
          name: input.name,
          description: input.description,
          location: input.location,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status,
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      })

      return project
    }),

  /**
   * Delete project
   * Only ADMIN can delete projects
   */
  delete: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.project.delete({
        where: { id: input.projectId },
      })

      return { success: true }
    }),

  /**
   * Add member to project
   * Only ADMIN can add members
   */
  addMember: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.enum(["MANDOR", "ARCHITECT", "FINANCE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Check if project exists
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      })

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

      // Check if already a member
      const existing = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: input.userId,
            projectId: input.projectId,
          },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already a member of this project",
        })
      }

      const member = await ctx.db.projectMember.create({
        data: {
          userId: input.userId,
          projectId: input.projectId,
          role: input.role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      return member
    }),

  /**
   * Update member role
   * Only ADMIN can update member roles
   */
  updateMemberRole: adminProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(["MANDOR", "ARCHITECT", "FINANCE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.projectMember.update({
        where: { id: input.memberId },
        data: {
          role: input.role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      return member
    }),

  /**
   * Remove member from project
   * Only ADMIN can remove members
   */
  removeMember: adminProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.projectMember.delete({
        where: { id: input.memberId },
      })

      return { success: true }
    }),

  /**
   * Get project members
   * All project members can view
   */
  getMembers: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const members = await ctx.db.projectMember.findMany({
        where: {
          projectId: ctx.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              roleGlobal: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      return members
    }),
})
