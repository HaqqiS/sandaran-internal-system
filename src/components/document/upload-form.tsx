"use client";

import type { DocumentType } from "@prisma/client";
import { useForm } from "@tanstack/react-form";
import { useImperativeHandle, useState } from "react";
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
import { useUploadDocument } from "~/hooks/useDocument";

const documentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fileType: z.enum([
    "DESIGN",
    "DRAWING",
    "REFERENCE",
    "SPECIFICATION",
    "OTHER",
  ]),
  version: z.string().optional(),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
export type DocumentFormDraft = Partial<DocumentFormValues>;

interface UploadFormProps {
  projectId: string;
  projectSlug: string;
  draftValues?: DocumentFormDraft;
  ref?: React.Ref<{ getValues: () => DocumentFormValues }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UploadForm({
  projectId,
  projectSlug,
  draftValues,
  ref,
  onSuccess,
  onCancel,
}: UploadFormProps) {
  const uploadDocument = useUploadDocument();
  const { upload, isLoading: isUploading, remove } = useCloudinaryUpload();

  const [file, setFile] = useState<File | null>(null);

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  const form = useForm({
    defaultValues: {
      title: draftValues?.title ?? "",
      description: draftValues?.description ?? "",
      fileType: draftValues?.fileType ?? ("OTHER" as DocumentType),
      version: draftValues?.version ?? "",
    } as DocumentFormValues,
    validators: {
      onSubmit: documentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!file) {
        toast.error("Harap unggah sebuah file");
        return;
      }

      let uploadedPublicId: string | null = null;

      try {
        const isImage = file.type.startsWith("image/");
        const resourceType = isImage ? "image" : "raw";

        // Atomic Mode: Upload to Cloudinary only when form is submitted
        const uploadResult = await upload(file, {
          projectSlug,
          type: "documents",
          resourceType,
        });
        uploadedPublicId = uploadResult.publicId;

        // Save document metadata to database
        await uploadDocument.mutateAsync({
          projectId,
          fileName: file.name,
          fileType: value.fileType,
          publicId: uploadResult.publicId,
          url: uploadResult.secureUrl,
          fileSize: uploadResult.bytes || file.size,
          mimeType: file.type || undefined,
          resourceType: uploadResult.resourceType || resourceType,
          title: value.title || undefined,
          description: value.description || undefined,
          version: value.version || undefined,
        });

        toast.success("Dokumen berhasil diunggah");
        setFile(null);
        onSuccess?.();
      } catch (error) {
        console.error("Upload document failed:", error);
        // Rollback: if upload to Cloudinary succeeded but DB mutation failed, clean up Cloudinary asset
        if (uploadedPublicId) {
          try {
            await remove(uploadedPublicId);
          } catch (cleanupErr) {
            console.error("Failed to cleanup Cloudinary asset:", cleanupErr);
          }
        }
        toast.error(
          error instanceof Error ? error.message : "Gagal mengunggah dokumen",
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
      {/* File Upload Section */}
      <div className="space-y-2">
        <FieldLabel>File *</FieldLabel>
        <FileUpload
          projectSlug={projectSlug}
          type="documents"
          value={file ?? undefined}
          onFileChange={(selectedFile) => setFile(selectedFile)}
          onRemove={() => setFile(null)}
          disabled={isUploading}
        />
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || isUploading || !file}
            >
              {isSubmitting || isUploading ? "Mengunggah..." : "Unggah Dokumen"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
