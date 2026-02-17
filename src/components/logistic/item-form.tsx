"use client";

import { useForm } from "@tanstack/react-form";
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
  useCreateLogisticItem,
  useUpdateLogisticItem,
} from "~/hooks/useLogistic";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required"),
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
  "Sack",
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
          toast.success("Item updated successfully");
        } else {
          await createItem.mutateAsync({
            projectId,
            name: value.name,
            unit: value.unit,
          });
          toast.success("Item created successfully");
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
                <FieldLabel htmlFor={field.name}>Item Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="e.g. Semen Tiga Roda"
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
                <FieldLabel htmlFor={field.name}>Unit</FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g. Sack"
                    autoComplete="off"
                    list="units-list"
                  />
                  <datalist id="units-list">
                    {COMMON_UNITS.map((unit) => (
                      <option key={unit} value={unit} />
                    ))}
                  </datalist>
                </div>
                <FieldDescription>
                  Unit of measurement (e.g. Sack, Kg, Pcs)
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
                ? "Saving..."
                : isEditMode
                  ? "Update Item"
                  : "Create Item"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
