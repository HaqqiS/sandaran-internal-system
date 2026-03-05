"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
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

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  projectId: string;
  itemId: string;
  itemName: string;
  unit: string;
  defaultType?: "IN" | "OUT";
  onSuccess?: () => void;
}

export function TransactionForm({
  projectId,
  itemId,
  itemName,
  unit,
  defaultType = "OUT",
  onSuccess,
}: TransactionFormProps) {
  const recordTransaction = useRecordLogisticTransaction();

  const form = useForm({
    defaultValues: {
      type: defaultType,
      quantity: 1,
      notes: "",
    } as TransactionFormValues,
    validators: {
      onSubmit: transactionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await recordTransaction.mutateAsync({
          projectId,
          itemId,
          type: value.type,
          quantity: value.quantity,
          notes: value.notes,
        });
        toast.success(`Transaksi berhasil dicatat untuk ${itemName}`);
        onSuccess?.();
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
      className="space-y-4"
    >
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <p>
          Mencatat transaksi untuk: <strong>{itemName}</strong>
        </p>
      </div>

      <FieldGroup>
        <form.Field
          name="type"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Tipe Transaksi *</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as "IN" | "OUT")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Stok Masuk (IN)</SelectItem>
                    <SelectItem value="OUT">Stok Keluar (OUT)</SelectItem>
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
                <FieldLabel htmlFor={field.name}>Jumlah ({unit}) *</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
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

      <div className="flex justify-end gap-2 pt-4">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Catat Transaksi"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
