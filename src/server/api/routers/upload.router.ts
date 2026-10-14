import { z } from "zod";
import {
  deleteCloudinaryAsset,
  generateUploadSignature,
} from "~/lib/cloudinary";
import { extractShortIdFromSlug } from "~/lib/slug-utils";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const uploadRouter = createTRPCRouter({
  /**
   * Get signed upload params for client-side upload
   * Resolves the project permanent storageKey to prevent broken URLs upon project renames
   * Returns signature, timestamp, folder, cloudName, apiKey
   */
  getSignedUploadParams: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
        type: z.enum(["reports", "documents", "emergency"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const shortId = extractShortIdFromSlug(input.projectSlug);
      const project = await ctx.db.project.findFirst({
        where: {
          OR: [...(shortId ? [{ shortId }] : []), { slug: input.projectSlug }],
        },
        select: { storageKey: true, slug: true },
      });

      const storageKey =
        project?.storageKey ?? project?.slug ?? input.projectSlug;

      const params = generateUploadSignature({
        projectSlug: storageKey,
        type: input.type,
      });
      return params;
    }),

  /**
   * Delete uploaded asset by publicId
   */
  deleteAsset: protectedProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(async ({ input }) => {
      await deleteCloudinaryAsset(input.publicId);
      return { success: true };
    }),
});
