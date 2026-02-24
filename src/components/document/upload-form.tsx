"use client";

import { useForm } from "@tanstack/react-form";
import type { DocumentType } from "generated/prisma";
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

type DocumentFormValues = z.infer<typeof documentSchema>;

interface UploadFormProps {
  projectId: string;
  projectSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UploadForm({
  projectId,
  projectSlug,
  onSuccess,
  onCancel,
}: UploadFormProps) {
  const uploadDocument = useUploadDocument();

  // File state
  const [fileData, setFileData] = useState<{
    url: string;
    publicId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    resourceType: string;
  } | null>(null);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      fileType: "OTHER" as DocumentType,
      version: "",
    } as DocumentFormValues,
    validators: {
      onSubmit: documentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!fileData) {
        toast.error("Harap unggah sebuah file");
        return;
      }

      try {
        await uploadDocument.mutateAsync({
          projectId,
          fileName: fileData.fileName,
          fileType: value.fileType,
          publicId: fileData.publicId,
          url: fileData.url,
          fileSize: fileData.fileSize,
          mimeType: fileData.mimeType,
          resourceType: fileData.resourceType,
          title: value.title || undefined,
          description: value.description || undefined,
          version: value.version || undefined,
        });
        toast.success("Dokumen berhasil diunggah");
        onSuccess?.();

        // Reset file state
        setFileData(null);
      } catch {
        // Error handled by mutation
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
          value={fileData?.url}
          onChange={(url, publicId, fileName, size, mimeType, resourceType) => {
            setFileData({
              url,
              publicId,
              fileName,
              fileSize: size,
              mimeType,
              resourceType,
            });
          }}
          onRemove={() => setFileData(null)}
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
              disabled={!canSubmit || isSubmitting || !fileData}
            >
              {isSubmitting ? "Mengunggah..." : "Unggah Dokumen"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
