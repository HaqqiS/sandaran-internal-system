"use client";

import type { DocumentType, ProjectDocument } from "@prisma/client";
import {
  IconFile,
  IconFileTypePdf,
  IconFileTypeXls,
  IconPhoto,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FileUpload } from "~/components/shared/file-upload";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { useUpdateDocument } from "~/hooks/useDocument";

const editDocumentSchema = z.object({
  title: z.string().optional(),
  fileType: z.enum([
    "DESIGN",
    "DRAWING",
    "REFERENCE",
    "SPECIFICATION",
    "OTHER",
  ]),
  version: z.string().optional(),
  description: z.string().optional(),
});

export type EditDocumentFormValues = z.infer<typeof editDocumentSchema>;

interface EditFormProps {
  projectId: string;
  projectSlug: string;
  document: ProjectDocument;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(mimeType?: string | null) {
  if (mimeType?.startsWith("image/")) {
    return <IconPhoto className="h-6 w-6 text-blue-500" />;
  }
  if (mimeType === "application/pdf") {
    return <IconFileTypePdf className="h-6 w-6 text-red-500" />;
  }
  if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) {
    return <IconFileTypeXls className="h-6 w-6 text-green-500" />;
  }
  return <IconFile className="h-6 w-6 text-muted-foreground" />;
}

export function EditForm({
  projectId,
  projectSlug,
  document: doc,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const updateDocument = useUpdateDocument();
  const { upload, isLoading: isUploading, remove } = useCloudinaryUpload();

  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  const formattedSize = formatBytes(doc.fileSize);

  const form = useForm({
    defaultValues: {
      title: doc.title ?? "",
      fileType: doc.fileType,
      version: doc.version ?? "",
      description: doc.description ?? "",
    } as EditDocumentFormValues,
    validators: {
      onSubmit: editDocumentSchema,
    },
    onSubmit: async ({ value }) => {
      let newPublicId: string | null = null;

      try {
        let fileUpdateData = {};

        if (isReplacingFile && newFile) {
          const isImage = newFile.type.startsWith("image/");
          const resourceType = isImage ? "image" : "raw";

          const uploadResult = await upload(newFile, {
            projectSlug,
            type: "documents",
            resourceType,
          });
          newPublicId = uploadResult.publicId;

          fileUpdateData = {
            fileName: newFile.name,
            publicId: uploadResult.publicId,
            url: uploadResult.secureUrl,
            fileSize: uploadResult.bytes || newFile.size,
            mimeType: newFile.type || undefined,
            resourceType: uploadResult.resourceType || resourceType,
          };
        }

        await updateDocument.mutateAsync({
          projectId,
          documentId: doc.id,
          title: value.title || undefined,
          fileType: value.fileType,
          version: value.version || undefined,
          description: value.description || undefined,
          ...fileUpdateData,
        });

        toast.success("Dokumen berhasil diperbarui");
        onSuccess?.();
      } catch (error) {
        if (newPublicId) {
          try {
            await remove(newPublicId);
          } catch (cleanupErr) {
            console.error("Failed to cleanup Cloudinary asset:", cleanupErr);
          }
        }
        toast.error(
          error instanceof Error ? error.message : "Gagal memperbarui dokumen",
        );
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* File Selection / Overview */}
      <div className="space-y-2">
        {!isReplacingFile ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
                {getFileIcon(doc.mimeType)}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium text-foreground"
                  title={doc.fileName}
                >
                  {doc.fileName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {formattedSize && <span>{formattedSize}</span>}
                  {formattedSize && <span>•</span>}
                  <span>{format(new Date(doc.createdAt), "dd MMM yyyy")}</span>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReplacingFile(true)}
              className="shrink-0"
            >
              Ganti File
            </Button>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <FieldLabel className="mb-0">File Baru</FieldLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsReplacingFile(false);
                  setNewFile(null);
                }}
                className="h-8 px-2 text-xs"
              >
                Batal Ganti File
              </Button>
            </div>
            <FileUpload
              projectSlug={projectSlug}
              type="documents"
              value={newFile ?? undefined}
              onFileChange={(file) => setNewFile(file)}
              onRemove={() => setNewFile(null)}
              disabled={isUploading}
            />
          </div>
        )}
      </div>

      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="title"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Judul (Opsional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Judul dokumen"
                />
              </Field>
            )}
          />

          <form.Field
            name="fileType"
            children={(field) => (
              <Field>
                <FieldLabel>Tipe Dokumen *</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as DocumentType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESIGN">File Desain/Denah</SelectItem>
                    <SelectItem value="DRAWING">Gambar Teknis</SelectItem>
                    <SelectItem value="SPECIFICATION">Spesifikasi</SelectItem>
                    <SelectItem value="REFERENCE">Referensi</SelectItem>
                    <SelectItem value="OTHER">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <form.Field
          name="version"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Versi (Opsional)</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="cth: v1.0, Revisi A"
              />
            </Field>
          )}
        />

        <form.Field
          name="description"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Deskripsi (Opsional)</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Deskripsi singkat mengenai isi dokumen..."
                rows={3}
              />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateDocument.isPending}
        >
          Batal
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={
                !canSubmit ||
                isSubmitting ||
                updateDocument.isPending ||
                isUploading ||
                (isReplacingFile && !newFile)
              }
            >
              {isSubmitting || updateDocument.isPending || isUploading
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
