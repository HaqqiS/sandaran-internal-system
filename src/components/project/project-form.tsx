/** biome-ignore-all lint/correctness/noChildrenProp: <children prop is used> */
"use client";

import { IconCalendar } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useEffect, useImperativeHandle } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useCreateProject, useUpdateProject } from "~/hooks";
import {
  buildCosmeticSlug,
  deriveShortId,
  extractShortIdFromSlug,
  slugify,
} from "~/lib/slug-utils";
import { cn } from "~/lib/utils";

const projectSchema = z.object({
  name: z.string().min(1, "Nama proyek wajib diisi"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung",
    ),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["ACTIVE", "DONE", "PAUSED"]),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export type ProjectFormDraft = Partial<ProjectFormValues>;

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    slug: string;
    shortId?: string | null;
    description?: string | null;
    location?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    status: "ACTIVE" | "DONE" | "PAUSED";
  };
  draftValues?: ProjectFormDraft;
  ref?: React.Ref<{ getValues: () => ProjectFormValues }>;
  onSuccess?: () => void;
  id?: string;
  onPendingChange?: (isPending: boolean) => void;
}

export function ProjectForm({
  project,
  draftValues,
  ref,
  onSuccess,
  id = "project-form",
  onPendingChange,
}: ProjectFormProps) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditMode = !!project;
  const isPending = createProject.isPending || updateProject.isPending;

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const form = useForm({
    defaultValues: {
      name: project?.name ?? draftValues?.name ?? "",
      slug: project?.slug ?? draftValues?.slug ?? "",
      description: project?.description ?? draftValues?.description ?? "",
      location: project?.location ?? draftValues?.location ?? "",
      startDate: project?.startDate ?? draftValues?.startDate ?? undefined,
      endDate: project?.endDate ?? draftValues?.endDate ?? undefined,
      status: project?.status ?? draftValues?.status ?? "ACTIVE",
    } as ProjectFormValues,
    validators: {
      onSubmit: projectSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode && project) {
          await updateProject.mutateAsync({
            projectId: project.id,
            name: value.name,
            slug: value.slug,
            description: value.description || undefined,
            location: value.location || undefined,
            startDate: value.startDate,
            endDate: value.endDate,
            status: value.status,
          });
          toast.success("Proyek berhasil diperbarui");
        } else {
          await createProject.mutateAsync({
            name: value.name,
            slug: value.slug,
            description: value.description || undefined,
            location: value.location || undefined,
            startDate: value.startDate,
            endDate: value.endDate,
            status: value.status,
          });
          toast.success("Proyek berhasil dibuat");
        }
        onSuccess?.();
      } catch {
        // Error is handled by global mutation cache
      }
    },
  });

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault();
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
                <FieldLabel htmlFor={field.name}>Nama Proyek *</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const newName = e.target.value;
                    field.handleChange(newName);

                    if (isEditMode && project) {
                      const effectiveShortId =
                        project.shortId ||
                        extractShortIdFromSlug(project.slug) ||
                        deriveShortId(project.id, 10);
                      const cosmeticSlug = buildCosmeticSlug(
                        newName,
                        effectiveShortId,
                      );
                      form.setFieldValue("slug", cosmeticSlug);
                    } else {
                      const newSlug = slugify(newName);
                      form.setFieldValue("slug", newSlug);
                    }
                  }}
                  aria-invalid={isInvalid}
                  placeholder="Proyek Konstruksi Saya"
                  autoComplete="off"
                />
                <FieldDescription>
                  Nama yang akan ditampilkan untuk proyek Anda.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="slug"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  readOnly
                  aria-invalid={isInvalid}
                  placeholder="my-construction-project"
                  autoComplete="off"
                  className="bg-muted cursor-not-allowed"
                />
                <FieldDescription>
                  {isEditMode
                    ? "Slug kosmetik diperbarui otomatis dengan ID unik permanen."
                    : "Slug URL awal. ID unik 10 karakter akan ditambahkan otomatis saat proyek disimpan."}
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Deskripsi (Opsional)
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Jelaskan secara singkat mengenai proyek Anda..."
                  rows={3}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="location"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Lokasi (Opsional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Jakarta, Indonesia"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="startDate"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const currentYear = new Date().getFullYear();
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Tanggal Mulai (Opsional)</FieldLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.state.value && "text-muted-foreground",
                        )}
                      >
                        <IconCalendar className="mr-2 h-4 w-4" />
                        {field.state.value
                          ? format(field.state.value, "PPP")
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      sideOffset={4}
                    >
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        startMonth={new Date(currentYear - 10, 0)}
                        endMonth={new Date(currentYear + 10, 11)}
                        selected={field.state.value}
                        onSelect={(date) => field.handleChange(date)}
                        defaultMonth={field.state.value ?? new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="endDate"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const currentYear = new Date().getFullYear();
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Tanggal Selesai (Opsional)</FieldLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.state.value && "text-muted-foreground",
                        )}
                      >
                        <IconCalendar className="mr-2 h-4 w-4" />
                        {field.state.value
                          ? format(field.state.value, "PPP")
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      sideOffset={4}
                    >
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        startMonth={new Date(currentYear - 10, 0)}
                        endMonth={new Date(currentYear + 10, 11)}
                        selected={field.state.value}
                        onSelect={(date) => field.handleChange(date)}
                        defaultMonth={field.state.value ?? new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <form.Field
          name="status"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Status *</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as "ACTIVE" | "DONE" | "PAUSED")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status proyek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="PAUSED">Dijeda</SelectItem>
                    <SelectItem value="DONE">Selesai</SelectItem>
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
