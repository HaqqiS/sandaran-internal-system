"use client";

import { IconPhoto, IconUpload, IconX, IconZoomIn } from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { MediaPreview } from "~/components/shared/media-preview";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { cn } from "~/lib/utils";

export type UploadedFile = { url: string; publicId: string };

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

interface ImageUploadProps {
  /** Project slug for folder structure */
  projectSlug: string;
  /** Upload type: reports, documents, or emergency */
  type: "reports" | "documents" | "emergency";
  /** Current image URL(s) or File object(s) */
  value?: string | File | (string | File | UploadedFile)[];
  /** Callback when single image is uploaded */
  onChange?: (url: string, publicId: string) => void;
  /** Callback when multiple images change */
  onMultipleChange?: (files: UploadedFile[]) => void;
  /** Callback when uploading status changes */
  onUploadChange?: (isUploading: boolean) => void;
  /** Callback when image is removed */
  onRemove?: (fileOrUrl?: string | File, publicIdToRemove?: string) => void;
  /** Optional className */
  className?: string;
  /** Disable upload */
  disabled?: boolean;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Accepted file types */
  accept?: Record<string, string[]>;
  /** Enable multiple file upload */
  multiple?: boolean;
  /** Callback when file selection changes (Atomic Mode) */
  onFileChange?: (files: File[]) => void;
  /** HTML input capture attribute ("environment" | "user" | undefined) */
  capture?: boolean | "user" | "environment";
}

export function ImageUpload({
  projectSlug,
  type,
  value,
  onChange,
  onMultipleChange,
  onRemove,
  className,
  disabled,
  maxSizeMB = 5,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  multiple = false,
  capture,
  onUploadChange,
  onFileChange,
}: ImageUploadProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [multiplePreviews, setMultiplePreviews] = useState<Map<File, string>>(
    new Map(),
  );

  const { upload, remove, isLoading, isCompressing, progress, error, reset } =
    useCloudinaryUpload();

  // Handle local file preview for Atomic Mode (Single)
  useEffect(() => {
    if (!multiple && value instanceof File) {
      const url = URL.createObjectURL(value);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreview(null);
  }, [value, multiple]);

  // Handle local file previews for Atomic Mode (Multiple)
  useEffect(() => {
    if (multiple && Array.isArray(value)) {
      setMultiplePreviews((prev) => {
        const nextMap = new Map(prev);
        let changed = false;

        // Add new files
        for (const item of value) {
          if (item instanceof File && !nextMap.has(item)) {
            nextMap.set(item, URL.createObjectURL(item));
            changed = true;
          }
        }

        // Remove unselected files
        for (const [file, url] of nextMap.entries()) {
          if (!value.includes(file)) {
            URL.revokeObjectURL(url);
            nextMap.delete(file);
            changed = true;
          }
        }

        return changed ? nextMap : prev;
      });
    }
  }, [value, multiple]);

  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      for (const url of multiplePreviews.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, [multiplePreviews]);

  // Notify parent of upload status changes
  useEffect(() => {
    onUploadChange?.(isLoading);
  }, [isLoading, onUploadChange]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const selectedFiles = multiple
        ? acceptedFiles
        : acceptedFiles[0]
          ? [acceptedFiles[0]]
          : [];

      // Atomic Mode: If onFileChange is provided, delegate to parent
      if (onFileChange) {
        onFileChange(selectedFiles);
        return;
      }

      // Direct Upload Mode
      try {
        const uploadedFiles: UploadedFile[] = [];

        for (const file of selectedFiles) {
          const result = await upload(file, {
            projectSlug,
            type,
            maxSizeMB,
          });
          uploadedFiles.push({
            url: result.secureUrl,
            publicId: result.publicId,
          });
        }

        if (multiple && onMultipleChange) {
          const existing = Array.isArray(value)
            ? (value as (string | File | UploadedFile)[]).filter(
                (item): item is UploadedFile =>
                  typeof item === "object" && item !== null && "url" in item,
              )
            : [];
          onMultipleChange([...existing, ...uploadedFiles]);
          toast.success(`${uploadedFiles.length} foto berhasil diunggah`);
        } else if (!multiple && onChange && uploadedFiles[0]) {
          onChange(uploadedFiles[0].url, uploadedFiles[0].publicId);
          toast.success("Foto berhasil diunggah");
        }
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error("Gagal mengunggah foto");
      }
    },
    [
      projectSlug,
      type,
      maxSizeMB,
      onChange,
      onMultipleChange,
      upload,
      multiple,
      value,
      onFileChange,
    ],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? 10 : 1,
    disabled: disabled || isLoading,
  });

  const handleRemove = async (fileToRemove?: File | UploadedFile | string) => {
    const publicId =
      typeof fileToRemove === "object" &&
      fileToRemove !== null &&
      "publicId" in fileToRemove
        ? (fileToRemove as UploadedFile).publicId
        : undefined;

    // Direct mode: if it has publicId, attempt deletion from Cloudinary
    if (publicId) {
      try {
        await remove(publicId);
      } catch (err) {
        console.error("Failed to delete asset from Cloudinary", err);
      }
    }

    if (!multiple) {
      reset();
      onRemove?.();
    } else {
      const identifier =
        fileToRemove instanceof File
          ? fileToRemove
          : typeof fileToRemove === "object"
            ? fileToRemove.url
            : fileToRemove;

      const publicIdToRemove =
        typeof fileToRemove === "object" && "publicId" in fileToRemove
          ? fileToRemove.publicId
          : undefined;

      onRemove?.(identifier, publicIdToRemove);
    }
  };

  // Compile normalized list of items to display
  const displayFiles: {
    url: string;
    publicId: string;
    file?: File;
    name: string;
    size?: number;
    key: string;
  }[] = useMemo(() => {
    const items: {
      url: string;
      publicId: string;
      file?: File;
      name: string;
      size?: number;
      key: string;
    }[] = [];

    if (multiple && Array.isArray(value)) {
      for (const item of value) {
        if (item instanceof File) {
          const url = multiplePreviews.get(item);
          if (url) {
            items.push({
              url,
              publicId: "",
              file: item,
              name: item.name,
              size: item.size,
              key: `file-${item.name}-${item.size}`,
            });
          }
        } else if (typeof item === "object" && item !== null && "url" in item) {
          const uploaded = item as UploadedFile;
          const extractedName =
            uploaded.url.split("/").pop() ?? "Foto Terunggah";
          items.push({
            ...uploaded,
            name: extractedName,
            key: uploaded.publicId || uploaded.url,
          });
        } else if (typeof item === "string" && item) {
          const extractedName = item.split("/").pop() ?? "Foto Terunggah";
          items.push({
            url: item,
            publicId: "",
            name: extractedName,
            key: item,
          });
        }
      }
    } else if (!multiple) {
      if (value instanceof File && filePreview) {
        items.push({
          url: filePreview,
          publicId: "",
          file: value,
          name: value.name,
          size: value.size,
          key: "single-file",
        });
      } else if (typeof value === "string" && value) {
        const extractedName = value.split("/").pop() ?? "Foto Terunggah";
        items.push({
          url: value,
          publicId: "",
          name: extractedName,
          key: "single-url",
        });
      }
    }

    return items;
  }, [value, multiple, filePreview, multiplePreviews]);

  const hasFiles = displayFiles.length > 0;
  const canAddMore = multiple ? displayFiles.length < 10 : !hasFiles;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Attachment Cards Grid (@reui/attachment pattern) */}
      {hasFiles && (
        <div
          className={cn(
            "grid gap-2.5",
            multiple ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
          )}
        >
          {displayFiles.map((file) => (
            <div
              key={file.key}
              className="group relative flex items-center gap-3 rounded-xl border border-border/70 bg-card p-2.5 shadow-xs transition-all hover:border-border"
            >
              {/* Thumbnail Preview */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/40">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  unoptimized={file.url.startsWith("blob:")}
                />
              </div>

              {/* File Information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  {file.size ? (
                    <span>{formatFileSize(file.size)}</span>
                  ) : (
                    <span>Foto</span>
                  )}
                  {isLoading && (
                    <span className="font-medium text-primary">
                      •{" "}
                      {isCompressing
                        ? "Mengompresi..."
                        : `Mengunggah ${progress}%`}
                    </span>
                  )}
                </div>
                {isLoading && (
                  <Progress value={progress} className="mt-1.5 h-1" />
                )}
              </div>

              {/* Action Buttons: Zoom Lightbox & Remove */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setLightboxUrl(file.url)}
                  aria-label="Perbesar gambar"
                >
                  <IconZoomIn className="h-4 w-4" />
                </Button>
                {onRemove && !disabled && !isLoading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      handleRemove(
                        file.file || { url: file.url, publicId: file.publicId },
                      )
                    }
                    aria-label="Hapus gambar"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified Dropzone Area (@reui/file-upload pattern) */}
      {canAddMore && !disabled && (
        <div
          {...getRootProps()}
          className={cn(
            "group relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-7",
            "border-border/80 hover:border-primary hover:bg-muted/40",
            isDragActive && "border-primary bg-primary/5",
            isLoading && "cursor-not-allowed opacity-50",
          )}
        >
          <input
            {...getInputProps()}
            {...(capture !== undefined ? { capture } : {})}
          />

          <div className="flex flex-col items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-105 group-hover:bg-primary/10">
              {isDragActive ? (
                <IconUpload className="h-5 w-5 text-primary animate-bounce" />
              ) : (
                <IconPhoto className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {isDragActive
                  ? "Lepaskan foto di sini"
                  : "Seret & lepas atau ketuk untuk memilih"}
              </p>
              <p className="text-xs text-muted-foreground">
                Kamera langsung atau galeri (JPG, PNG, WebP) hingga {maxSizeMB}
                MB
                {multiple
                  ? ` (Maks. ${10 - displayFiles.length} foto lagi)`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Progress Bar during upload if not attached to a card */}
      {!hasFiles && isLoading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {isCompressing ? "Mengompresi gambar..." : "Mengunggah..."}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">Gagal mengunggah: {error}</p>
      )}

      {/* Lightbox Zoom Preview */}
      <MediaPreview
        url={lightboxUrl}
        open={!!lightboxUrl}
        onOpenChange={(open) => !open && setLightboxUrl(null)}
      />
    </div>
  );
}
