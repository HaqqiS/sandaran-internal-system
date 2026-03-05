"use client";

import { useForm } from "@tanstack/react-form";
import { useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { useRequestEmergencyFund } from "~/hooks/useEmergency";

const withdrawSchema = z.object({
  amount: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal harus berupa angka lebih dari 0",
    }),
  description: z.string().min(1, "Keterangan / Keperluan wajib diisi"),
});

export type WithdrawFormValues = z.infer<typeof withdrawSchema>;
export type WithdrawFormDraft = Partial<WithdrawFormValues>;

interface RequestFormProps {
  projectId: string;
  projectSlug: string;
  draftValues?: WithdrawFormDraft;
  ref?: React.Ref<{ getValues: () => WithdrawFormValues }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RequestForm({
  projectId,
  projectSlug,
  draftValues,
  ref,
  onSuccess,
  onCancel,
}: RequestFormProps) {
  const requestFund = useRequestEmergencyFund();
  const { upload, isUploading } = useCloudinaryUpload();
  const [proofFile, setProofFile] = useState<File | null>(null);

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  const form = useForm({
    defaultValues: {
      amount: draftValues?.amount ?? "",
      description: draftValues?.description ?? "",
    },
    validators: {
      onChange: withdrawSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        let proofPublicId: string | undefined;

        if (proofFile) {
          const result = await upload(proofFile, {
            projectSlug,
            type: "emergency",
          });
          proofPublicId = result.publicId;
        }

        await requestFund.mutateAsync({
          projectId,
          amount: Number(value.amount),
          description: value.description,
          proofPublicId,
        });

        toast.success("Pengajuan dana berhasil dikirim");
        form.reset();
        setProofFile(null);
        onSuccess?.();
      } catch (error) {
        toast.error("Gagal mengajukan dana");
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
      <form.Field
        name="amount"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Nominal (Rp)</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: 50000"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Keterangan / Keperluan</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: Beli paku tambahan pendukung, Makan siang tukang borongan"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <div className="space-y-2">
        <Label>Bukti Foto / Bon (Opsional)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            className="cursor-pointer"
          />
        </div>
        {proofFile && (
          <p className="text-xs text-muted-foreground">
            Terpilih: {proofFile.name}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={requestFund.isPending || isUploading}>
          {requestFund.isPending || isUploading
            ? "Memproses..."
            : "Ajukan Dana"}
        </Button>
      </div>
    </form>
  );
}
