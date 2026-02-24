"use client";

import { IconCalendar } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
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
import { useCreateReport, useUpdateReport } from "~/hooks";
import { cn } from "~/lib/utils";

const WEATHER_OPTIONS = [
  { value: "Cerah", label: "Cerah (Clear)" },
  { value: "Mendung", label: "Mendung (Cloudy)" },
  { value: "Hujan", label: "Hujan (Rain)" },
  { value: "Hujan Deras", label: "Hujan Deras (Heavy Rain)" },
  { value: "custom", label: "Lainnya (Custom)" },
];

const reportSchema = z.object({
  reportDate: z.date(),
  taskDescription: z.string().min(1, "Task description is required"),
  progressPercent: z.number().min(0).max(100),
  issues: z.string().optional(),
  weather: z.string().optional(),
  customWeather: z.string().optional(),
  totalWorkers: z.number().min(0),
  location: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportFormProps {
  projectId: string;
  report?: {
    id: string;
    reportDate: Date | string;
    taskDescription: string;
    progressPercent: number;
    issues?: string | null;
    weather?: string | null;
    totalWorkers: number;
    location?: string | null;
  };
  onSuccess?: () => void;
}

export function ReportForm({ projectId, report, onSuccess }: ReportFormProps) {
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const isEditMode = !!report;

  // Check if existing weather is a custom value
  const isCustomWeather =
    report?.weather &&
    !WEATHER_OPTIONS.slice(0, -1).some((opt) => opt.value === report.weather);

  const form = useForm({
    defaultValues: {
      reportDate: report?.reportDate ? new Date(report.reportDate) : new Date(),
      taskDescription: report?.taskDescription ?? "",
      progressPercent: report?.progressPercent ?? 0,
      issues: report?.issues ?? "",
      weather: isCustomWeather ? "custom" : (report?.weather ?? ""),
      customWeather: isCustomWeather ? (report?.weather ?? "") : "",
      totalWorkers: report?.totalWorkers ?? 0,
      location: report?.location ?? "",
    } as ReportFormValues,
    validators: {
      onSubmit: reportSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Determine final weather value
        const weather =
          value.weather === "custom" ? value.customWeather : value.weather;

        if (isEditMode && report) {
          await updateReport.mutateAsync({
            projectId,
            reportId: report.id,
            taskDescription: value.taskDescription,
            progressPercent: value.progressPercent,
            issues: value.issues || undefined,
            weather: weather || undefined,
            totalWorkers: value.totalWorkers,
            location: value.location || undefined,
          });
          toast.success("Laporan berhasil diperbarui");
        } else {
          await createReport.mutateAsync({
            projectId,
            reportDate: value.reportDate,
            taskDescription: value.taskDescription,
            progressPercent: value.progressPercent,
            issues: value.issues || undefined,
            weather: weather || undefined,
            totalWorkers: value.totalWorkers,
            location: value.location || undefined,
          });
          toast.success("Laporan berhasil dibuat");
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
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* Report Date */}
      <form.Field name="reportDate">
        {(field) => (
          <FieldGroup>
            <Field>
              <FieldLabel>Tanggal Laporan *</FieldLabel>
              <Popover>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.state.value}
                    onSelect={(date) => date && field.handleChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          </FieldGroup>
        )}
      </form.Field>

      {/* Task Description */}
      <form.Field name="taskDescription">
        {(field) => (
          <FieldGroup>
            <Field>
              <FieldLabel>Deskripsi Pekerjaan *</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Jelaskan pekerjaan yang diselesaikan hari ini..."
                rows={4}
              />
              <FieldDescription>
                Deskripsikan tugas-tugas utama yang diselesaikan hari ini
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          </FieldGroup>
        )}
      </form.Field>

      {/* Progress and Workers Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="progressPercent">
          {(field) => (
            <FieldGroup>
              <Field>
                <FieldLabel>Progres (%) *</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value) || 0)
                  }
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            </FieldGroup>
          )}
        </form.Field>

        <form.Field name="totalWorkers">
          {(field) => (
            <FieldGroup>
              <Field>
                <FieldLabel>Jumlah Pekerja *</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value) || 0)
                  }
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            </FieldGroup>
          )}
        </form.Field>
      </div>

      {/* Weather and Location Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="weather">
          {(field) => (
            <FieldGroup>
              <Field>
                <FieldLabel>Cuaca (Opsional)</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cuaca" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEATHER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            </FieldGroup>
          )}
        </form.Field>

        <form.Field name="location">
          {(field) => (
            <FieldGroup>
              <Field>
                <FieldLabel>Lokasi (Opsional)</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="cth: Villa A, Lantai 2"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            </FieldGroup>
          )}
        </form.Field>
      </div>

      {/* Custom Weather Input (shown when "custom" is selected) */}
      <form.Subscribe selector={(state) => state.values.weather}>
        {(weather) =>
          weather === "custom" && (
            <form.Field name="customWeather">
              {(field) => (
                <FieldGroup>
                  <Field>
                    <FieldLabel>Cuaca Lainnya *</FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Masukkan kondisi cuaca lainnya"
                    />
                  </Field>
                </FieldGroup>
              )}
            </form.Field>
          )
        }
      </form.Subscribe>

      {/* Issues */}
      <form.Field name="issues">
        {(field) => (
          <FieldGroup>
            <Field>
              <FieldLabel>Kendala / Masalah (Opsional)</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Tuliskan kendala atau masalah yang dihadapi..."
                rows={3}
              />
              <FieldDescription>
                Opsional: Catat kendala atau hambatan pekerjaan di lapangan
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          </FieldGroup>
        )}
      </form.Field>

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Buat Laporan"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
