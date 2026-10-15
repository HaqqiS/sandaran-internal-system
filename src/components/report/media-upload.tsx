"use client";

import {
  IconLoader2,
  IconPhoto,
  IconUpload,
  IconX,
  IconZoomIn,
} from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { MediaPreview } from "~/components/shared/media-preview";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useDeleteReportMedia, useUploadReportMedia } from "~/hooks";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { cn } from "~/lib/utils";

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

interface MediaUploadProps {
  projectId: string;
  projectSlug: string;
  reportId: string;
  existingMedia: {
    id: string;
    publicId: string;
    url: string;
    fileName?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
    resourceType?: string | null;
  }[];
  canEdit?: boolean;
}

export function MediaUpload({
  projectId,
  projectSlug,
  reportId,
  existingMedia,
  canEdit = true,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { upload, progress } = useCloudinaryUpload();
  const uploadMedia = useUploadReportMedia();
  const deleteMedia = useDeleteReportMedia();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canEdit || acceptedFiles.length === 0) return;

      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          // Upload to Cloudinary
          const result = await upload(file, {
            projectSlug,
            type: "reports",
          });

          // Save to database
          await uploadMedia.mutateAsync({
            projectId,
            reportId,
            publicId: result.publicId,
            url: result.secureUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || "image/jpeg",
            resourceType: result.resourceType || "image",
          });
        }
        toast.success(
          `${acceptedFiles.length} foto dokumentasi berhasil diunggah`,
        );
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Gagal mengunggah foto dokumentasi");
      } finally {
        setUploading(false);
      }
    },
    [canEdit, projectSlug, projectId, reportId, upload, uploadMedia],
  );

  const handleDelete = async (mediaId: string) => {
    try {
      await deleteMedia.mutateAsync({
        projectId,
        mediaId,
      });
      toast.success("Foto dokumentasi berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus foto");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    disabled: !canEdit || uploading,
  });

  return (
    <div className="space-y-3">
      {/* Existing Media Cards Grid (@reui/attachment pattern) */}
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {existingMedia.map((media) => (
            <div
              key={media.id}
              className="group relative flex items-center gap-3 rounded-xl border border-border/70 bg-card p-2.5 shadow-xs transition-all hover:border-border"
            >
              {/* Thumbnail Preview */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/40">
                <Image
                  src={media.url}
                  alt={media.fileName ?? "Dokumentasi"}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {media.fileName || "Foto Dokumentasi"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  {media.fileSize ? (
                    <span>{formatFileSize(media.fileSize)}</span>
                  ) : (
                    <span>Tersimpan</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setLightboxImage(media.url)}
                  aria-label="Perbesar foto"
                >
                  <IconZoomIn className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(media.id)}
                    aria-label="Hapus foto"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified Dropzone Upload Area (@reui/file-upload pattern) */}
      {canEdit && (
        <div
          {...getRootProps()}
          className={cn(
            "group relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-7",
            "border-border/80 hover:border-primary hover:bg-muted/40",
            isDragActive && "border-primary bg-primary/5",
            uploading && "cursor-not-allowed opacity-50",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-105 group-hover:bg-primary/10">
              {uploading ? (
                <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
              ) : isDragActive ? (
                <IconUpload className="h-5 w-5 text-primary animate-bounce" />
              ) : (
                <IconPhoto className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {uploading
                  ? "Sedang mengunggah..."
                  : isDragActive
                    ? "Lepaskan foto di sini"
                    : "Seret & lepas atau ketuk untuk menambah foto"}
              </p>
              <p className="text-xs text-muted-foreground">
                Kamera langsung atau galeri (JPG, PNG, WebP) maks. 5MB per
                berkas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mengunggah ke Cloudinary...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Lightbox Preview */}
      <MediaPreview
        url={lightboxImage}
        open={!!lightboxImage}
        onOpenChange={(open: boolean) => !open && setLightboxImage(null)}
      />
    </div>
  );
}
