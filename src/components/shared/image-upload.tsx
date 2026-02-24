"use client";

import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import NextImage from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { cn } from "~/lib/utils";

export type UploadedFile = { url: string; publicId: string };

interface ImageUploadProps {
  /** Project slug for folder structure */
  projectSlug: string;
  /** Upload type: reports, documents, or emergency */
  type: "reports" | "documents" | "emergency";

  /** Current image URL(s) */
  value?: string | UploadedFile[];

  /** Callback when single image is uploaded */
  onChange?: (url: string, publicId: string) => void;
  /** Callback when multiple images change */
  onMultipleChange?: (files: UploadedFile[]) => void;

  /** Callback when uploading status changes */
  onUploadChange?: (isUploading: boolean) => void;

  /** Callback when image is removed */
  onRemove?: (urlToRemove?: string, publicIdToRemove?: string) => void;

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
  onUploadChange,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const { upload, remove, isLoading, isCompressing, progress, error, reset } =
    useCloudinaryUpload();

  // Notify parent of upload status changes
  useEffect(() => {
    onUploadChange?.(isLoading);
  }, [isLoading, onUploadChange]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const filesToUpload = multiple
        ? acceptedFiles
        : acceptedFiles[0]
          ? [acceptedFiles[0]]
          : [];

      const newPreviews = filesToUpload.map((f) => URL.createObjectURL(f));
      setPreviews((prev) =>
        multiple ? [...prev, ...newPreviews] : newPreviews,
      );

      try {
        const uploadedFiles: UploadedFile[] = [];

        for (const file of filesToUpload) {
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
          const existing = Array.isArray(value) ? value : [];
          onMultipleChange([...existing, ...uploadedFiles]);
        } else if (!multiple && onChange && uploadedFiles[0]) {
          onChange(uploadedFiles[0].url, uploadedFiles[0].publicId);
        }

        for (const p of newPreviews) URL.revokeObjectURL(p);
        setPreviews([]);
      } catch (err) {
        console.error("Upload failed:", err);
        for (const p of newPreviews) URL.revokeObjectURL(p);
        setPreviews([]);
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
    ],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? 10 : 1,
    disabled: disabled || isLoading,
  });

  const handleRemove = async (fileToRemove?: UploadedFile) => {
    // If it has a publicId, try to delete it from cloudinary first
    if (fileToRemove?.publicId) {
      try {
        await remove(fileToRemove.publicId);
      } catch (err) {
        console.error("Failed to delete asset from Cloudinary", err);
      }
    }

    if (!multiple) {
      setPreviews([]);
      reset();
      onRemove?.();
    } else {
      onRemove?.(fileToRemove?.url, fileToRemove?.publicId);
    }
  };

  const displayFiles: UploadedFile[] = [];
  if (multiple) {
    if (Array.isArray(value)) {
      displayFiles.push(...value);
    }
  } else {
    if (typeof value === "string" && value) {
      displayFiles.push({ url: value, publicId: "" });
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {((multiple ? displayFiles.length > 0 : !!value) ||
        previews.length > 0) && (
        <div
          className={cn(
            "grid gap-4",
            multiple
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1",
          )}
        >
          {multiple &&
            displayFiles.map((file) => (
              <div
                key={file.url}
                className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
              >
                <NextImage
                  src={file.url}
                  alt="Uploaded image"
                  fill
                  className="object-cover"
                  unoptimized={file.url.startsWith("blob:")}
                />
                {onRemove && !isLoading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => handleRemove(file)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

          {!multiple && typeof value === "string" && value && (
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              <NextImage
                src={value}
                alt="Upload preview"
                fill
                className="object-cover"
                unoptimized={value.startsWith("blob:")}
              />
              {onRemove && !isLoading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => handleRemove()}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {previews.map((previewUrl) => (
            <div
              key={previewUrl}
              className="relative aspect-video overflow-hidden rounded-lg border bg-muted opacity-60"
            >
              <NextImage
                src={previewUrl}
                alt="Loading preview"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <p className="text-xs font-semibold text-white">
                  {isCompressing ? "Compressing..." : "Uploading..."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          "hover:border-primary hover:bg-muted/50",
          isDragActive && "border-primary bg-muted/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <input {...getInputProps()} capture="environment" />
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <IconUpload className="h-10 w-10 text-muted-foreground" />
          ) : (
            <IconPhoto className="h-10 w-10 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the image(s) here"
              : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP up to {maxSizeMB}MB{" "}
            {multiple ? "(Bisa pilih banyak foto)" : ""}
          </p>
        </div>
      </div>

      {isLoading && <Progress value={progress} className="h-2" />}

      {error && (
        <p className="text-sm text-destructive">Upload failed: {error}</p>
      )}
    </div>
  );
}
