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
import { toast } from "sonner";
import { z } from "zod";
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
  document: doc,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const updateDocument = useUpdateDocument();
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
      try {
        await updateDocument.mutateAsync({
          projectId,
          documentId: doc.id,
          title: value.title || undefined,
          fileType: value.fileType,
          version: value.version || undefined,
          description: value.description || undefined,
        });

        toast.success("Dokumen berhasil diperbarui");
        onSuccess?.();
      } catch (error) {
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
      {/* File Overview (Read-Only) */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
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
              disabled={!canSubmit || isSubmitting || updateDocument.isPending}
            >
              {isSubmitting || updateDocument.isPending
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
