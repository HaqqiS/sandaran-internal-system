"use client";

import { IconCalendar } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "~/components/shared/image-upload";
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
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import {
  useCreateReport,
  useUpdateReport,
  useUploadReportMedia,
} from "~/hooks/useReport";
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
  taskDescription: z.string().min(1, "Deskripsi pekerjaan wajib diisi"),
  progressPercent: z.number().min(0).max(100),
  issues: z.string().optional(),
  weather: z.string().optional(),
  customWeather: z.string().optional(),
  totalWorkers: z.number().min(0),
  location: z.string().optional(),
  images: z.array(z.union([z.string(), z.instanceof(File)])).optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
export type ReportFormDraft = Partial<ReportFormValues>;

interface ReportFormProps {
  projectId: string;
  projectSlug: string;
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
  draftValues?: ReportFormDraft;
  ref?: React.Ref<{ getValues: () => ReportFormValues }>;
  onSuccess?: () => void;
}

export function ReportForm({
  projectId,
  projectSlug,
  report,
  draftValues,
  ref,
  onSuccess,
}: ReportFormProps) {
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const uploadMedia = useUploadReportMedia();
  const router = useRouter();

  const isEditMode = !!report;

  // Check if existing weather is a custom value
  const isCustomWeather =
    report?.weather &&
    !WEATHER_OPTIONS.slice(0, -1).some((opt) => opt.value === report.weather);

  const { upload, isLoading: isUploadingMedia } = useCloudinaryUpload();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  useImperativeHandle(ref, () => ({ getValues: () => form.state.values }));

  const form = useForm({
    defaultValues: {
      reportDate: report?.reportDate
        ? new Date(report.reportDate)
        : (draftValues?.reportDate ?? new Date()),
      taskDescription:
        report?.taskDescription ?? draftValues?.taskDescription ?? "",
      progressPercent:
        report?.progressPercent ?? draftValues?.progressPercent ?? 0,
      issues: report?.issues ?? draftValues?.issues ?? "",
      weather: isCustomWeather
        ? "custom"
        : (report?.weather ?? draftValues?.weather ?? ""),
      customWeather: isCustomWeather
        ? (report?.weather ?? "")
        : (draftValues?.customWeather ?? ""),
      totalWorkers: report?.totalWorkers ?? draftValues?.totalWorkers ?? 0,
      location: report?.location ?? draftValues?.location ?? "",
      images: draftValues?.images ?? [],
    } as ReportFormValues,
    validators: {
      onSubmit: reportSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmittingForm(true);
        // Determine final weather value
        const weather =
          value.weather === "custom" ? value.customWeather : value.weather;

        let currentReportId = report?.id;

        if (isEditMode && currentReportId) {
          await updateReport.mutateAsync({
            projectId,
            reportId: currentReportId,
            taskDescription: value.taskDescription,
            progressPercent: value.progressPercent,
            issues: value.issues || undefined,
            weather: weather || undefined,
            totalWorkers: value.totalWorkers,
            location: value.location || undefined,
          });
          toast.success("Teks laporan berhasil diperbarui");
        } else {
          const newReport = await createReport.mutateAsync({
            projectId,
            reportDate: value.reportDate,
            taskDescription: value.taskDescription,
            progressPercent: value.progressPercent,
            issues: value.issues || undefined,
            weather: weather || undefined,
            totalWorkers: value.totalWorkers,
            location: value.location || undefined,
          });
          currentReportId = newReport.id;
          toast.success("Laporan berhasil dibuat");
        }

        // Handle Atomic Upload for multiple images
        const imagesToUpload = (value.images || []).filter(
          (img): img is File => img instanceof File,
        );

        const uploadedMedia: { url: string; publicId: string }[] = [];

        if (imagesToUpload.length > 0) {
          toast.info(`Mengunggah ${imagesToUpload.length} foto...`);
          for (const file of imagesToUpload) {
            const res = await upload(file, {
              projectSlug,
              type: "reports",
            });
            uploadedMedia.push({ url: res.secureUrl, publicId: res.publicId });
          }
        }

        // Attach all newly uploaded images to the database
        if (currentReportId && uploadedMedia.length > 0) {
          toast.info(`Menyimpan foto ke database...`);
          for (const img of uploadedMedia) {
            await uploadMedia.mutateAsync({
              projectId,
              reportId: currentReportId,
              publicId: img.publicId,
              url: img.url,
            });
          }
          toast.success("Semua foto berhasil disimpan!");
        }

        onSuccess?.();
        if (!isEditMode) {
          // Redirect or refresh to clear the form properly
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan saat menyimpan laporan");
      } finally {
        setIsSubmittingForm(false);
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
                    <SelectValue placeholder="Pilih Cuaca" />
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

      {/* Image Upload for Report WhatsApp Style */}
      {!isEditMode && (
        <form.Field name="images">
          {(field) => (
            <FieldGroup>
              <Field>
                <FieldLabel>Dokumentasi Foto (Opsional)</FieldLabel>
                <ImageUpload
                  projectSlug={projectSlug || "project"}
                  type="reports"
                  multiple={true}
                  value={field.state.value}
                  onFileChange={(files) => {
                    field.handleChange([
                      ...(field.state.value || []),
                      ...files,
                    ]);
                  }}
                  onRemove={(fileOrUrl) => {
                    field.handleChange(
                      (field.state.value || []).filter(
                        (img) => img !== fileOrUrl,
                      ),
                    );
                  }}
                />
                <FieldDescription>
                  Pilih beberapa foto sekaligus atau ambil langsung dari kamera
                  HP Anda.
                </FieldDescription>
              </Field>
            </FieldGroup>
          )}
        </form.Field>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmittingForm || isUploadingMedia}>
          {isSubmittingForm || isUploadingMedia
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Kirim Laporan"}
        </Button>
      </div>
    </form>
  );
}
