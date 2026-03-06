"use client";

import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { cn } from "~/lib/utils";

interface FileUploadProps {
  /** Project slug for folder structure */
  projectSlug: string;
  /** Upload type: documents */
  type: "documents";
  /** Current file URL */
  value?: string;
  /** Callback when file is uploaded */
  onChange: (
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
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const { upload, isLoading, progress, error, reset } = useCloudinaryUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);

      try {
        const isImage = file.type.startsWith("image/");
        const resourceType = isImage ? "image" : "raw";

        console.log("📤 Uploading file:", {
          name: file.name,
          type: file.type,
          size: file.size,
          resourceType,
        });

        // Debug toast
        toast.info(`Uploading as ${resourceType}...`);

        const result = await upload(file, {
          projectSlug,
          type,
          maxSizeMB,
          resourceType,
        });

        console.log("✅ Upload success:", {
          url: result.secureUrl,
          publicId: result.publicId,
          resourceType: result.resourceType,
          format: result.format,
          bytes: result.bytes,
        });

        onChange(
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
      }
    },
    [projectSlug, type, maxSizeMB, onChange, upload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: disabled || isLoading,
  });

  const handleRemove = () => {
    setFileName(null);
    reset();
    onRemove?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-background border">
              <IconFile className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid gap-0.5">
              <p className="text-sm font-medium truncate max-w-[200px]">
                {fileName || "Uploaded File"}
              </p>
              <p className="text-xs text-muted-foreground">Siap</p>
            </div>
          </div>

          {onRemove && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
            >
              <IconX className="h-4 w-4" />
              <span className="sr-only">Hapus berkas</span>
            </Button>
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
              <IconFile className="h-10 w-10 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Lepaskan berkas di sini"
                : "Seret & lepas atau klik untuk mengunggah"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, Excel, Gambar hingga {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mengunggah...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">Gagal mengunggah: {error}</p>
      )}
    </div>
  );
}
