import { z } from "zod"
import {
  deleteCloudinaryAsset,
  generateUploadSignature,
} from "~/lib/cloudinary"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

export const uploadRouter = createTRPCRouter({
  /**
   * Get signed upload params for client-side upload
   * Returns signature, timestamp, folder, cloudName, apiKey
   */
  getSignedUploadParams: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
        type: z.enum(["reports", "documents", "emergency"]),
      }),
    )
    .mutation(({ input }) => {
      const params = generateUploadSignature({
        projectSlug: input.projectSlug,
        type: input.type,
      })
      return params
    }),

  /**
   * Delete uploaded asset by publicId
   */
  deleteAsset: protectedProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(async ({ input }) => {
      await deleteCloudinaryAsset(input.publicId)
      return { success: true }
    }),
})
