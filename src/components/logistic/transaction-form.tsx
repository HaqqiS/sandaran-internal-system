"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useImperativeHandle } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useRecordLogisticTransaction } from "~/hooks/useLogistic";

const transactionSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().positive("Jumlah harus lebih dari 0"),
  notes: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type TransactionFormDraft = Partial<TransactionFormValues>;

interface TransactionFormProps {
  projectId: string;
  itemId: string;
  itemName: string;
  unit: string;
  defaultType?: "IN" | "OUT";
  draftValues?: TransactionFormDraft;
  ref?: React.Ref<{ getValues: () => TransactionFormValues }>;
  onSuccess?: () => void;
  id?: string;
  onPendingChange?: (isPending: boolean) => void;
}

export function TransactionForm({
  projectId,
  itemId,
  itemName,
  unit,
  defaultType = "OUT",
  draftValues,
  ref,
  onSuccess,
  id = "transaction-form",
  onPendingChange,
}: TransactionFormProps) {
  const recordTransaction = useRecordLogisticTransaction();
  const isPending = recordTransaction.isPending;

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const form = useForm({
    defaultValues: {
      type: draftValues?.type ?? defaultType,
      quantity: draftValues?.quantity ?? 1,
      notes: draftValues?.notes ?? "",
    } as TransactionFormValues,
    validators: {
      onChange: transactionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await recordTransaction.mutateAsync({
          projectId,
          itemId,
          type: value.type,
          quantity: value.quantity,
          notes: value.notes || undefined,
        });

        toast.success(
          value.type === "IN"
            ? "Barang masuk berhasil dicatat"
            : "Barang keluar berhasil dicatat",
        );
        onSuccess?.();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Terjadi kesalahan",
        );
      }
    },
  });

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="rounded-lg border bg-muted/40 p-3 text-xs">
        <div className="text-muted-foreground">Barang</div>
        <div className="font-semibold text-foreground text-sm">{itemName}</div>
        <div className="text-muted-foreground mt-0.5">Satuan: {unit}</div>
      </div>

      <FieldGroup>
        <form.Field
          name="type"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Jenis Transaksi</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(val) =>
                    field.handleChange(val as "IN" | "OUT")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Masuk (Penambahan Stok)</SelectItem>
                    <SelectItem value="OUT">
                      Keluar (Pengurangan Stok)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="quantity"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Jumlah ({unit})</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  step="0.01"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  aria-invalid={isInvalid}
                  placeholder="0"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="notes"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Catatan (Opsional)</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Tambahkan catatan untuk transaksi ini..."
                  rows={3}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
