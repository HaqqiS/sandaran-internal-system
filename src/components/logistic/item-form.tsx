"use client";

import { useForm } from "@tanstack/react-form";
import { useImperativeHandle } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  normalizeUnit,
  UnitCombobox,
} from "~/components/logistic/unit-combobox";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  useCreateLogisticItem,
  useUpdateLogisticItem,
} from "~/hooks/useLogistic";

const itemSchema = z.object({
  name: z.string().trim().min(1, "Nama barang wajib diisi"),
  unit: z
    .string()
    .trim()
    .min(1, "Satuan pengukuran wajib diisi")
    .max(20, "Satuan maksimal 20 karakter"),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
export type ItemFormDraft = Partial<ItemFormValues>;

interface ItemFormProps {
  projectId: string;
  item?: {
    id: string;
    name: string;
    unit: string;
  };
  draftValues?: ItemFormDraft;
  ref?: React.Ref<{ getValues: () => ItemFormValues }>;
  onSuccess?: () => void;
}

export function LogisticItemForm({
  projectId,
  item,
  draftValues,
  ref,
  onSuccess,
}: ItemFormProps) {
  const createItem = useCreateLogisticItem();
  const updateItem = useUpdateLogisticItem();
  const isEditMode = !!item;

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  const form = useForm({
    defaultValues: {
      name: item?.name ?? draftValues?.name ?? "",
      unit: item?.unit ?? draftValues?.unit ?? "",
    } as ItemFormValues,
    validators: {
      onChange: itemSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const normalizedUnit = normalizeUnit(value.unit);
        if (isEditMode && item) {
          await updateItem.mutateAsync({
            projectId,
            itemId: item.id,
            name: value.name.trim(),
            unit: normalizedUnit,
          });
          toast.success("Data barang berhasil diperbarui");
        } else {
          await createItem.mutateAsync({
            projectId,
            name: value.name.trim(),
            unit: normalizedUnit,
          });
          toast.success("Barang baru berhasil ditambahkan");
        }
        onSuccess?.();
      } catch {
        // Error is handled by global mutation cache
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
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Nama Barang Logistik
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Contoh: Semen Tiga Roda, Paku Payung 5cm"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="unit"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Satuan</FieldLabel>
                <UnitCombobox
                  id={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  invalid={isInvalid}
                />
                <FieldDescription>
                  Pilih dari daftar atau ketik satuan baru untuk barang ini
                </FieldDescription>
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
              {isSubmitting
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Tambah Barang"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
