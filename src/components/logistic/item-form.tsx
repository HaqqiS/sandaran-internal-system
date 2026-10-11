"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useImperativeHandle } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  normalizeUnit,
  UnitCombobox,
} from "~/components/logistic/unit-combobox";
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
  id?: string;
  onPendingChange?: (isPending: boolean) => void;
}

export function LogisticItemForm({
  projectId,
  item,
  draftValues,
  ref,
  onSuccess,
  id = "item-form",
  onPendingChange,
}: ItemFormProps) {
  const createItem = useCreateLogisticItem();
  const updateItem = useUpdateLogisticItem();
  const isEditMode = !!item;
  const isPending = createItem.isPending || updateItem.isPending;

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

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
          toast.success("Barang berhasil diperbarui");
        } else {
          await createItem.mutateAsync({
            projectId,
            name: value.name.trim(),
            unit: normalizedUnit,
          });
          toast.success("Barang berhasil ditambahkan");
        }
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
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Nama Barang</FieldLabel>
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
    </form>
  );
}
