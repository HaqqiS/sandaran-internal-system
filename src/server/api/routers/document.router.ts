import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { requireOwnership } from "~/server/api/helpers/permission"
import { createTRPCRouter, projectProcedure } from "~/server/api/trpc"

/**
 * Project Document Router
 *
 * Handles project documents uploaded by ARCHITECT.
 *
 * Permissions:
 * - Only ARCHITECT can upload documents
 * - All project members can view documents
 * - Only document owner (ARCHITECT) can edit/delete
 */

// Only ARCHITECT can upload/manage documents
const architectProcedure = projectProcedure(["ARCHITECT"])

// All project members can view
const projectMemberProcedure = projectProcedure([
  "MANDOR",
  "ARCHITECT",
  "FINANCE",
])

export const documentRouter = createTRPCRouter({
  /**
   * Upload a new document
   * Only ARCHITECT can upload
   *
   * Note: Actual file upload to Cloudinary should be done client-side
   * This endpoint just saves the Cloudinary URL to database
   */
  upload: architectProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileName: z.string(),
        fileType: z.enum([
          "DESIGN",
          "DRAWING",
          "REFERENCE",
          "SPECIFICATION",
          "OTHER",
        ]),
        publicId: z.string(),
        url: z.string().url(),
        fileSize: z.number().int().optional(),
        mimeType: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        version: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.projectDocument.create({
        data: {
          projectId: ctx.projectId,
          userId: ctx.session.user.id,
          fileName: input.fileName,
          fileType: input.fileType,
          publicId: input.publicId,
          url: input.url,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          title: input.title,
          description: input.description,
          version: input.version,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      return document
    }),

  /**
   * Get all documents for a project
   * All project members can view
   */
  getByProject: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileType: z
          .enum(["DESIGN", "DRAWING", "REFERENCE", "SPECIFICATION", "OTHER"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.projectDocument.findMany({
        where: {
          projectId: ctx.projectId,
          ...(input.fileType && { fileType: input.fileType }),
        },
        include: {
          uploader: {
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

      return documents
    }),

  /**
   * Get document by ID
   * All project members can view
   */
  getById: projectMemberProcedure
    .input(
      z.object({
        projectId: z.string(),
        documentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.projectDocument.findFirst({
        where: {
          id: input.documentId,
          projectId: ctx.projectId,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        })
      }

      return document
    }),

  /**
   * Update document metadata
   * Only document owner (ARCHITECT) can update
   */
  update: architectProcedure
    .input(
      z.object({
        projectId: z.string(),
        documentId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        version: z.string().optional(),
        fileType: z
          .enum(["DESIGN", "DRAWING", "REFERENCE", "SPECIFICATION", "OTHER"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get document to check ownership
      const document = await ctx.db.projectDocument.findFirst({
        where: {
          id: input.documentId,
          projectId: ctx.projectId,
        },
      })

      // Check ownership (ADMIN bypasses this)
      requireOwnership(
        document,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      )

      const updated = await ctx.db.projectDocument.update({
        where: { id: input.documentId },
        data: {
          title: input.title,
          description: input.description,
          version: input.version,
          fileType: input.fileType,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      return updated
    }),

  /**
   * Delete a document
   * Only document owner (ARCHITECT) can delete
   */
  delete: architectProcedure
    .input(
      z.object({
        projectId: z.string(),
        documentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get document to check ownership
      const document = await ctx.db.projectDocument.findFirst({
        where: {
          id: input.documentId,
          projectId: ctx.projectId,
        },
      })

      // Check ownership (ADMIN bypasses this)
      requireOwnership(
        document,
        ctx.session.user.id,
        ctx.session.user.roleGlobal,
      )

      await ctx.db.projectDocument.delete({
        where: { id: input.documentId },
      })

      return { success: true }
    }),
})
