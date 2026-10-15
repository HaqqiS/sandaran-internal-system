"use client";

import {
  IconFile,
  IconPhoto,
  IconUpload,
  IconX,
  IconZoomIn,
} from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { MediaPreview } from "~/components/shared/media-preview";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { cn } from "~/lib/utils";

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

interface FileUploadProps {
  /** Project slug for folder structure */
  projectSlug: string;
  /** Upload type: documents */
  type: "documents";
  /** Current file URL or File object */
  value?: string | File;
  /** Callback when file is uploaded */
  onChange?: (
    url: string,
    publicId: string,
    originalFilename: string,
    size: number,
    mimeType: string,
    resourceType: string,
  ) => void;
  /** Callback when file is removed */
  onRemove?: () => void;
  /** Optional className */
  className?: string;
  /** Disable upload */
  disabled?: boolean;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Accepted file types */
  accept?: Record<string, string[]>;
  /** Callback when file selection changes (Atomic Mode) */
  onFileChange?: (file: File | null) => void;
}

export function FileUpload({
  projectSlug,
  type,
  value,
  onChange,
  onRemove,
  className,
  disabled,
  maxSizeMB = 10,
  accept = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "application/vnd.ms-excel": [".xls"],
    "image/*": [".jpg", ".jpeg", ".png", ".webp"],
  },
  onFileChange,
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [blobPreview, setBlobPreview] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const { upload, isLoading, progress, error, reset } = useCloudinaryUpload();

  // Manage local file preview for Atomic Mode & cleanup blobs
  useEffect(() => {
    if (value instanceof File) {
      setFileName(value.name);
      setFileSize(value.size);
      if (value.type.startsWith("image/")) {
        const url = URL.createObjectURL(value);
        setBlobPreview(url);
        return () => URL.revokeObjectURL(url);
      }
      setBlobPreview(null);
    } else if (typeof value === "string" && value) {
      const extractedName = value.split("/").pop() ?? "Berkas Terunggah";
      setFileName(extractedName);
      setBlobPreview(value);
    } else {
      setFileName(null);
      setFileSize(null);
      setBlobPreview(null);
    }
  }, [value]);

  const isImage = useMemo(() => {
    if (value instanceof File) {
      return value.type.startsWith("image/");
    }
    if (typeof value === "string" && value) {
      return (
        /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(value) ||
        value.includes("/image/upload/")
      );
    }
    return false;
  }, [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setFileSize(file.size);

      // Atomic Mode: If onFileChange is provided, don't upload immediately
      if (onFileChange) {
        onFileChange(file);
        return;
      }

      // Legacy Mode: Immediate Upload
      try {
        const isImg = file.type.startsWith("image/");
        const resourceType = isImg ? "image" : "raw";

        toast.info(`Mengunggah berkas (${resourceType})...`);

        const result = await upload(file, {
          projectSlug,
          type,
          maxSizeMB,
          resourceType,
        });

        toast.success("Berkas berhasil diunggah");

        onChange?.(
          result.secureUrl,
          result.publicId,
          file.name,
          result.bytes,
          file.type,
          result.resourceType,
        );
      } catch (err) {
        console.error("Upload failed:", err);
        setFileName(null);
        setFileSize(null);
        toast.error("Gagal mengunggah berkas");
      }
    },
    [projectSlug, type, maxSizeMB, onChange, upload, onFileChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: disabled || isLoading,
  });

  const handleRemove = () => {
    setFileName(null);
    setFileSize(null);
    setBlobPreview(null);
    reset();
    onFileChange?.(null);
    onRemove?.();
  };

  const hasValue = !!value;

  return (
    <div className={cn("space-y-3", className)}>
      {hasValue ? (
        /* Attachment Card / Chip Pattern (@reui/attachment) */
        <div className="group relative flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs transition-all hover:border-border">
          {/* Thumbnail / Icon Preview */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/40 flex items-center justify-center">
            {isImage && blobPreview ? (
              <Image
                src={blobPreview}
                alt={fileName ?? "Lampiran"}
                fill
                className="object-cover"
                unoptimized={blobPreview.startsWith("blob:")}
              />
            ) : (
              <IconFile className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* File Information & Upload Progress */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs sm:text-sm font-medium text-foreground">
              {fileName || "Berkas Terpilih"}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              {fileSize && <span>{formatFileSize(fileSize)}</span>}
              {isLoading ? (
                <span className="font-medium text-primary">
                  • Mengunggah {progress}%
                </span>
              ) : (
                <span>• Siap</span>
              )}
            </div>
            {isLoading && (
              <Progress value={progress} className="mt-1.5 h-1.5" />
            )}
          </div>

          {/* Action Buttons: Zoom & Delete */}
          <div className="flex items-center gap-1 shrink-0">
            {isImage && blobPreview && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setLightboxUrl(blobPreview)}
                aria-label="Perbesar gambar"
              >
                <IconZoomIn className="h-4 w-4" />
              </Button>
            )}
            {onRemove && !disabled && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-destructive hover:bg-destructive/10"
                onClick={handleRemove}
                aria-label="Hapus berkas"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Unified Dropzone Area (@reui/file-upload pattern) */
        <div
          {...getRootProps()}
          className={cn(
            "group relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8",
            "border-border/80 hover:border-primary hover:bg-muted/40",
            isDragActive && "border-primary bg-primary/5",
            (disabled || isLoading) && "cursor-not-allowed opacity-50",
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-105 group-hover:bg-primary/10">
              {isDragActive ? (
                <IconUpload className="h-6 w-6 text-primary animate-bounce" />
              ) : (
                <IconPhoto className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isDragActive
                  ? "Lepaskan berkas di sini"
                  : "Seret & lepas atau ketuk untuk memilih"}
              </p>
              <p className="text-xs text-muted-foreground">
                Kamera langsung, galeri foto, atau dokumen hingga {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress during initial upload if still in dropzone mode */}
      {!hasValue && isLoading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mengunggah...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">Gagal mengunggah: {error}</p>
      )}

      {/* Lightbox Preview */}
      <MediaPreview
        url={lightboxUrl}
        open={!!lightboxUrl}
        onOpenChange={(open) => !open && setLightboxUrl(null)}
      />
    </div>
  );
}
