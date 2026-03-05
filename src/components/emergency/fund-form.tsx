"use client";

import { useForm } from "@tanstack/react-form";
import { useImperativeHandle } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useAddEmergencyBalance } from "~/hooks/useEmergency";

const fundSchema = z.object({
  amount: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Nominal harus berupa angka lebih dari 0",
    }),
  description: z.string().min(1, "Keterangan/sumber aliran harus diisi"),
});

export type FundFormValues = z.infer<typeof fundSchema>;
export type FundFormDraft = Partial<FundFormValues>;

interface FundFormProps {
  projectId: string;
  draftValues?: FundFormDraft;
  ref?: React.Ref<{ getValues: () => FundFormValues }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FundForm({
  projectId,
  draftValues,
  ref,
  onSuccess,
  onCancel,
}: FundFormProps) {
  const addBalance = useAddEmergencyBalance();

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  const form = useForm({
    defaultValues: {
      amount: draftValues?.amount ?? "",
      description: draftValues?.description ?? "",
    },
    validators: {
      onChange: fundSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await addBalance.mutateAsync({
          projectId,
          amount: Number(value.amount),
          description: value.description,
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
      <form.Field
        name="amount"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Nominal Masuk (Rp)</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: 1000000"
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
            <Label htmlFor={field.name}>Sumber Dana / Keterangan</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: Pencairan Bon dari Akuntan, Titipan Mandor"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={addBalance.isPending}>
          {addBalance.isPending ? "Memproses..." : "Tambah Kas Masuk"}
        </Button>
      </div>
    </form>
  );
}
