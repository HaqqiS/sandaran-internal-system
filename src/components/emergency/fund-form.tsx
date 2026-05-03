"use client";

import { useForm } from "@tanstack/react-form";
import { useImperativeHandle } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "~/components/shared/image-upload";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { useAddEmergencyBalance } from "~/hooks/useEmergency";
import { formatNumberIDR } from "~/lib/utils";

const fundSchema = z.object({
  amount: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal harus berupa angka lebih dari 0",
    }),
  description: z.string().min(1, "Keterangan/sumber aliran harus diisi"),
  proofPublicId: z.string().optional(),
  proofUrl: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type FundFormValues = z.infer<typeof fundSchema>;
export type FundFormDraft = Partial<FundFormValues>;

interface FundFormProps {
  projectId: string;
  projectSlug: string;
  draftValues?: FundFormDraft;
  ref?: React.Ref<{ getValues: () => FundFormValues }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FundForm({
  projectId,
  projectSlug,
  draftValues,
  ref,
  onSuccess,
  onCancel,
}: FundFormProps) {
  const addBalance = useAddEmergencyBalance();
  const { upload, isLoading: isUploading } = useCloudinaryUpload();

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  const form = useForm({
    defaultValues: {
      amount: draftValues?.amount ?? "",
      description: draftValues?.description ?? "",
      proofPublicId: draftValues?.proofPublicId ?? "",
      proofUrl: draftValues?.proofUrl ?? "",
    } as FundFormValues,
    validators: {
      onChange: fundSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        let finalUrl = typeof value.proofUrl === "string" ? value.proofUrl : "";
        let finalPublicId = value.proofPublicId || "";

        // Atomic Upload: Perform upload only if it's a File
        if (value.proofUrl instanceof File) {
          const result = await upload(value.proofUrl, {
            projectSlug,
            type: "emergency",
          });
          finalUrl = result.secureUrl;
          finalPublicId = result.publicId;
        }

        await addBalance.mutateAsync({
          projectId,
          amount: Number(value.amount),
          description: value.description,
          proofPublicId: finalPublicId || undefined,
          proofUrl: finalUrl || undefined,
        });
        toast.success("Kas berhasil ditambahkan");
        form.reset();
        onSuccess?.();
      } catch (error) {
        toast.error("Gagal menambahkan dana ke kas");
        console.error(error);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="amount">
        {(field) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={field.name}>Nominal Masuk (Rp) *</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  Rp
                </span>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  inputMode="numeric"
                  value={formatNumberIDR(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    field.handleChange(raw);
                  }}
                  className="pl-10 font-semibold text-lg"
                  placeholder="0"
                />
              </div>
              <FieldDescription>
                Masukkan jumlah dana yang masuk ke kas. Format akan otomatis
                muncul.
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          </FieldGroup>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={field.name}>
                Sumber Dana / Keterangan *
              </FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Contoh: Pencairan Bon dari Akuntan, Titipan Mandor"
                rows={3}
              />
              <FieldDescription>
                Jelaskan asal atau sumber aliran dana masuk ini.
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          </FieldGroup>
        )}
      </form.Field>

      <form.Field name="proofUrl">
        {(field) => (
          <form.Field name="proofPublicId">
            {(publicIdField) => (
              <FieldGroup>
                <Field>
                  <FieldLabel>Bukti Transfer (Opsional)</FieldLabel>
                  <ImageUpload
                    projectSlug={projectSlug}
                    type="emergency"
                    value={field.state.value}
                    onFileChange={(files) => {
                      field.handleChange(files[0] ?? "");
                      publicIdField.handleChange("");
                    }}
                    onRemove={() => {
                      field.handleChange("");
                      publicIdField.handleChange("");
                    }}
                  />
                  <FieldDescription>
                    Lampirkan bukti transfer atau mutasi sebagai bukti aliran
                    dana masuk.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            )}
          </form.Field>
        )}
      </form.Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={addBalance.isPending || isUploading}>
          {addBalance.isPending || isUploading
            ? "Memproses..."
            : "Tambah Kas Masuk"}
        </Button>
      </div>
    </form>
  );
}
