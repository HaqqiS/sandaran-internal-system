"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "~/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { IconCheck } from "@tabler/icons-react";
import {
  useCreateLogisticItem,
  useUpdateLogisticItem,
} from "~/hooks/useLogistic";

const itemSchema = z.object({
  name: z.string().min(1, "Nama barang wajib diisi"),
  unit: z.string().min(1, "Satuan pengukuran wajib diisi"),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  projectId: string;
  item?: {
    id: string;
    name: string;
    unit: string;
  };
  onSuccess?: () => void;
}

const COMMON_UNITS = [
  "Pcs",
  "Box",
  "Sak",
  "Kg",
  "Ton",
  "Meter",
  "M2",
  "M3",
  "Unit",
  "Set",
  "Roll",
  "Batang",
  "Lembar",
];

export function LogisticItemForm({
  projectId,
  item,
  onSuccess,
}: ItemFormProps) {
  const createItem = useCreateLogisticItem();
  const updateItem = useUpdateLogisticItem();
  const isEditMode = !!item;
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      unit: item?.unit ?? "",
    } as ItemFormValues,
    validators: {
      onSubmit: itemSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode && item) {
          await updateItem.mutateAsync({
            projectId,
            itemId: item.id,
            name: value.name,
            unit: value.unit,
          });
          toast.success("Data barang berhasil diperbarui");
        } else {
          await createItem.mutateAsync({
            projectId,
            name: value.name,
            unit: value.unit,
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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverAnchor asChild>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        if (!open) setOpen(true);
                      }}
                      onFocus={() => setOpen(true)}
                      aria-invalid={isInvalid}
                      placeholder="Contoh: Sak, Kg, Pcs"
                      autoComplete="off"
                    />
                  </PopoverAnchor>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                      if (
                        e.target instanceof Element &&
                        e.target.closest(`#${field.name}`)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <Command shouldFilter={false}>
                      <CommandList>
                        <CommandGroup>
                          {COMMON_UNITS.filter((u) =>
                            u
                              .toLowerCase()
                              .includes(
                                (field.state.value || "").toLowerCase(),
                              ),
                          ).map((unit) => (
                            <CommandItem
                              key={unit}
                              value={unit}
                              onSelect={() => {
                                field.handleChange(unit);
                                setOpen(false);
                              }}
                            >
                              {unit}
                              {field.state.value === unit && (
                                <IconCheck className="ml-auto flex size-4 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                          {COMMON_UNITS.filter((u) =>
                            u
                              .toLowerCase()
                              .includes(
                                (field.state.value || "").toLowerCase(),
                              ),
                          ).length === 0 && (
                            <div className="py-6 text-center text-sm text-muted-foreground p-4">
                              "{field.state.value}" akan disimpan sebagai satuan
                              baru.
                            </div>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FieldDescription>
                  Pilih dari daftar atau ketik kepanjangan satuan untuk barang
                  ini
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
