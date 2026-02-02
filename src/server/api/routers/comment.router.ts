import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { requireOwnership } from "~/server/api/helpers/permission"
import { createTRPCRouter, projectProcedure } from "~/server/api/trpc"

/**
 * Report Comment Router
 *
 * Handles comments on daily reports.
 *
 * Permissions:
 * - All project members can create comments (CEO ALLOWED!)
 * - All project members can view comments
 * - Only comment owner can edit/delete
 */

// All project members can comment (CEO allowed!)
const commentProcedure = projectProcedure(["MANDOR", "ARCHITECT", "FINANCE"], {
  allowCEO: true,
})

// For viewing (no mutation, so CEO can access)
const projectMemberProcedure = projectProcedure([
  "MANDOR",
  "ARCHITECT",
  "FINANCE",
])

export const commentRouter = createTRPCRouter({
  /**
   * Create a comment on a report
   * All project members can comment (CEO ALLOWED!)
   */
  create: commentProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify report exists in this project
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          id: input.reportId,
          projectId: ctx.projectId,
        },
      })

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found in this project",
        })
      }

      const comment = await ctx.db.reportComment.create({
        data: {
          reportId: input.reportId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              roleGlobal: true,
            },
          },
        },
      })

      return comment
    }),

  /**
   * Get all comments for a report
   * All project members can view
   */
  getByReport: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        reportId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify report exists in this project
      const report = await ctx.db.dailyReport.findFirst({
        where: {
          id: input.reportId,
          projectId: ctx.projectId,
        },
      })

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found in this project",
        })
      }

      const comments = await ctx.db.reportComment.findMany({
        where: {
          reportId: input.reportId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              roleGlobal: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return comments
    }),

  /**
   * Update a comment
   * Only comment owner can update (CEO ALLOWED if they own it!)
   */
  update: commentProcedure
    .input(
      z.object({
        projectId: z.string(),
        commentId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get comment to check ownership
      const comment = await ctx.db.reportComment.findUnique({
        where: { id: input.commentId },
        include: {
          report: true,
        },
      })

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        })
      }

      // Verify comment belongs to a report in this project
      if (comment.report.projectId !== ctx.projectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Comment does not belong to this project",
        })
      }

      // Check ownership (ADMIN bypasses this)
      requireOwnership(
        comment,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      )

      const updated = await ctx.db.reportComment.update({
        where: { id: input.commentId },
        data: {
          content: input.content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              roleGlobal: true,
            },
          },
        },
      })

      return updated
    }),

  /**
   * Delete a comment
   * Only comment owner can delete (CEO ALLOWED if they own it!)
   */
  delete: commentProcedure
    .input(
      z.object({
        projectId: z.string(),
        commentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get comment to check ownership
      const comment = await ctx.db.reportComment.findUnique({
        where: { id: input.commentId },
        include: {
          report: true,
        },
      })

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        })
      }

      // Verify comment belongs to a report in this project
      if (comment.report.projectId !== ctx.projectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Comment does not belong to this project",
        })
      }

      // Check ownership (ADMIN bypasses this)
      requireOwnership(
        comment,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      )

      await ctx.db.reportComment.delete({
        where: { id: input.commentId },
      })

      return { success: true }
    }),
})
