"use client"

import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload"
import { cn } from "~/lib/utils"

interface ImageUploadProps {
  /** Project slug for folder structure */
  projectSlug: string
  /** Upload type: reports, documents, or emergency */
  type: "reports" | "documents" | "emergency"
  /** Current image URL */
  value?: string
  /** Callback when image is uploaded */
  onChange: (url: string, publicId: string) => void
  /** Callback when image is removed */
  onRemove?: () => void
  /** Optional className */
  className?: string
  /** Disable upload */
  disabled?: boolean
  /** Max file size in MB */
  maxSizeMB?: number
  /** Accepted file types */
  accept?: Record<string, string[]>
}

export function ImageUpload({
  projectSlug,
  type,
  value,
  onChange,
  onRemove,
  className,
  disabled,
  maxSizeMB = 5,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const { upload, isLoading, isCompressing, progress, error, reset } =
    useCloudinaryUpload()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      try {
        const result = await upload(file, {
          projectSlug,
          type,
          maxSizeMB,
        })
        onChange(result.secureUrl, result.publicId)
        // Cleanup preview URL
        URL.revokeObjectURL(previewUrl)
        setPreview(null)
      } catch (err) {
        console.error("Upload failed:", err)
        URL.revokeObjectURL(previewUrl)
        setPreview(null)
      }
    },
    [projectSlug, type, maxSizeMB, onChange, upload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: disabled || isLoading,
  })

  const handleRemove = () => {
    setPreview(null)
    reset()
    onRemove?.()
  }

  const displayUrl = value || preview

  return (
    <div className={cn("space-y-2", className)}>
      {displayUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          <img
            src={displayUrl}
            alt="Upload preview"
            className="h-full w-full object-cover"
          />
          {onRemove && !isLoading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={handleRemove}
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isCompressing ? "Compressing..." : "Uploading..."}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            "hover:border-primary hover:bg-muted/50",
            isDragActive && "border-primary bg-muted/50",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isDragActive ? (
              <IconUpload className="h-10 w-10 text-muted-foreground" />
            ) : (
              <IconPhoto className="h-10 w-10 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {isLoading && <Progress value={progress} className="h-2" />}

      {error && (
        <p className="text-sm text-destructive">Upload failed: {error}</p>
      )}
    </div>
  )
}
