"use client"

import { IconLoader2, IconPlus, IconX } from "@tabler/icons-react"
import NextImage from "next/image"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { useDeleteReportMedia, useUploadReportMedia } from "~/hooks"
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload"
import { cn } from "~/lib/utils"

interface MediaUploadProps {
  projectId: string
  projectSlug: string
  reportId: string
  existingMedia: { id: string; publicId: string; url: string }[]
  canEdit?: boolean
}

export function MediaUpload({
  projectId,
  projectSlug,
  reportId,
  existingMedia,
  canEdit = true,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { upload, progress } = useCloudinaryUpload()
  const uploadMedia = useUploadReportMedia()
  const deleteMedia = useDeleteReportMedia()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canEdit) return

      setUploading(true)
      try {
        for (const file of acceptedFiles) {
          // Upload to Cloudinary
          const result = await upload(file, {
            projectSlug,
            type: "reports",
          })

          // Save to database
          await uploadMedia.mutateAsync({
            projectId,
            reportId,
            publicId: result.publicId,
            url: result.secureUrl,
          })
        }
        toast.success(`${acceptedFiles.length} image(s) uploaded successfully`)
      } catch (error) {
        console.error("Upload failed:", error)
        toast.error("Failed to upload images")
      } finally {
        setUploading(false)
      }
    },
    [canEdit, projectSlug, projectId, reportId, upload, uploadMedia],
  )

  const handleDelete = async (mediaId: string) => {
    try {
      await deleteMedia.mutateAsync({
        projectId,
        mediaId,
      })
      toast.success("Image deleted")
    } catch {
      toast.error("Failed to delete image")
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    disabled: !canEdit || uploading,
  })

  return (
    <div className="space-y-4">
      {/* Existing Media Grid */}
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {existingMedia.map((media) => (
            <div
              key={media.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <NextImage
                src={media.url}
                alt="Report media"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              {canEdit && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(media.id)}
                >
                  <IconX className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canEdit && (
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            "hover:border-primary hover:bg-muted/50",
            isDragActive && "border-primary bg-muted/50",
            uploading && "cursor-not-allowed opacity-50",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <IconPlus className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop images here"
                : uploading
                  ? "Uploading..."
                  : "Drop images or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP up to 5MB each
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {uploading && <Progress value={progress} className="h-2" />}
    </div>
  )
}
