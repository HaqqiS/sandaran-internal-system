import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { requireOwnership } from "~/server/api/helpers/permission"
import { createTRPCRouter, projectProcedure } from "~/server/api/trpc"

/**
 * Daily Report Router
 *
 * Handles daily reports, task breakdowns, and media uploads.
 *
 * Permissions:
 * - MANDOR, ARCHITECT can create reports
 * - All project members can view
 * - Only report owner can edit/delete
 */

// Procedures for different role combinations
const reportCreatorProcedure = projectProcedure(["MANDOR", "ARCHITECT"])
const projectMemberProcedure = projectProcedure([
  "MANDOR",
  "ARCHITECT",
  "FINANCE",
])

export const reportRouter = createTRPCRouter({
  /**
   * Create a new daily report
   * Only MANDOR and ARCHITECT can create
   */
  create: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportDate: z.date().optional(),
        taskDescription: z.string().min(1),
        progressPercent: z.number().min(0).max(100).default(0),
        weather: z.string().optional(),
        totalWorkers: z.number().int().min(0).default(0),
        location: z.string().optional(),
        issues: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Generate slug from date
      const date = input.reportDate || new Date()
      const slug = `report-${date.toISOString().split("T")[0]}-${Date.now()}`

      const report = await ctx.db.dailyReport.create({
        data: {
          slug,
          projectId: ctx.projectId,
          userId: ctx.session.user.id,
          reportDate: date,
          taskDescription: input.taskDescription,
          progressPercent: input.progressPercent,
          weather: input.weather,
          totalWorkers: input.totalWorkers,
          location: input.location,
          issues: input.issues,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tasks: true,
          media: true,
        },
      })

      return report
    }),

  /**
   * Get report by ID
   * All project members can view
   */
  getById: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          id: input.reportId,
          projectId: ctx.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tasks: {
            orderBy: { createdAt: "asc" },
          },
          media: {
            orderBy: { createdAt: "asc" },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      })

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        })
      }

      return report
    }),

  /**
   * Get all reports for a project
   * All project members can view
   */
  getByProject: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const reports = await ctx.db.dailyReport.findMany({
        where: {
          projectId: ctx.projectId,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { reportDate: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tasks: true,
          media: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (reports.length > input.limit) {
        const nextItem = reports.pop()
        nextCursor = nextItem?.id
      }

      return {
        reports,
        nextCursor,
      }
    }),

  /**
   * Get report by slug
   * All project members can view
   */
  getBySlug: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          slug: input.reportSlug,
          projectId: ctx.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tasks: {
            orderBy: { createdAt: "asc" },
          },
          media: {
            orderBy: { createdAt: "asc" },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      })

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        })
      }

      return report
    }),

  /**
   * Update a daily report
   * Only report owner can update
   */
  update: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportId: z.string(),
        taskDescription: z.string().min(1).optional(),
        progressPercent: z.number().min(0).max(100).optional(),
        weather: z.string().optional(),
        totalWorkers: z.number().int().min(0).optional(),
        location: z.string().optional(),
        issues: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get report to check ownership
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          id: input.reportId,
          projectId: ctx.projectId,
        },
      })

      // Check ownership (ADMIN bypasses this)
      requireOwnership(report, ctx.session.user.id, ctx.session.user.roleGlobal)

      const updated = await ctx.db.dailyReport.update({
        where: { id: input.reportId },
        data: {
          taskDescription: input.taskDescription,
          progressPercent: input.progressPercent,
          weather: input.weather,
          totalWorkers: input.totalWorkers,
          location: input.location,
          issues: input.issues,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tasks: true,
          media: true,
        },
      })

      return updated
    }),

  /**
   * Delete a daily report
   * Only report owner can delete
   */
  delete: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get report to check ownership
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          id: input.reportId,
          projectId: ctx.projectId,
        },
      })

      // Check ownership (ADMIN bypasses this)
      requireOwnership(report, ctx.session.user.id, ctx.session.user.roleGlobal)

      await ctx.db.dailyReport.delete({
        where: { id: input.reportId },
      })

      return { success: true }
    }),

  /**
   * Add task breakdown to report
   * Only report owner can add tasks
   */
  addTask: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportId: z.string(),
        taskName: z.string().min(1),
        workerCount: z.number().int().min(0).default(0),
        progress: z.number().min(0).max(100).default(0),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get report to check ownership
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          id: input.reportId,
          projectId: ctx.projectId,
        },
      })

      // Check ownership
      requireOwnership(report, ctx.session.user.id, ctx.session.user.roleGlobal)

      const task = await ctx.db.dailyReportTask.create({
        data: {
          reportId: input.reportId,
          taskName: input.taskName,
          workerCount: input.workerCount,
          progress: input.progress,
          notes: input.notes,
        },
      })

      return task
    }),

  /**
   * Update task breakdown
   * Only report owner can update tasks
   */
  updateTask: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        taskId: z.string(),
        taskName: z.string().min(1).optional(),
        workerCount: z.number().int().min(0).optional(),
        progress: z.number().min(0).max(100).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get task with report to check ownership
      const task = await ctx.db.dailyReportTask.findUnique({
        where: { id: input.taskId },
        include: {
          report: true,
        },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      // Check ownership of the report
      requireOwnership(
        task.report,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      )

      const updated = await ctx.db.dailyReportTask.update({
        where: { id: input.taskId },
        data: {
          taskName: input.taskName,
          workerCount: input.workerCount,
          progress: input.progress,
          notes: input.notes,
        },
      })

      return updated
    }),

  /**
   * Delete task breakdown
   * Only report owner can delete tasks
   */
  deleteTask: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        taskId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get task with report to check ownership
      const task = await ctx.db.dailyReportTask.findUnique({
        where: { id: input.taskId },
        include: {
          report: true,
        },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      // Check ownership of the report
      requireOwnership(
        task.report,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      )

      await ctx.db.dailyReportTask.delete({
        where: { id: input.taskId },
      })

      return { success: true }
    }),

  /**
   * Upload media to report
   * Only report owner can upload media
   *
   * Note: Actual file upload to Cloudinary should be done client-side
   * This endpoint just saves the Cloudinary URL to database
   */
  uploadMedia: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportId: z.string(),
        publicId: z.string(),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get report to check ownership
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          id: input.reportId,
          projectId: ctx.projectId,
        },
      })

      // Check ownership
      requireOwnership(report, ctx.session.user.id, ctx.session.user.roleGlobal)

      const media = await ctx.db.reportMedia.create({
        data: {
          reportId: input.reportId,
          publicId: input.publicId,
          url: input.url,
        },
      })

      return media
    }),

  /**
   * Delete media from report
   * Only report owner can delete media
   */
  deleteMedia: reportCreatorProcedure
    .input(
      z.object({
        projectId: z.string(),
        mediaId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get media with report to check ownership
      const media = await ctx.db.reportMedia.findUnique({
        where: { id: input.mediaId },
        include: {
          report: true,
        },
      })

      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        })
      }

      // Check ownership of the report
      requireOwnership(
        media.report,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      )

      await ctx.db.reportMedia.delete({
        where: { id: input.mediaId },
      })

      return { success: true }
    }),
})
