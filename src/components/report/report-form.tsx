"use client";

import {
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { id as idLocale } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
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
import { Stepper, StepperContent, StepperPanel } from "~/components/ui/stepper";
import { Textarea } from "~/components/ui/textarea";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import {
  useCreateReport,
  useUpdateReport,
  useUploadReportMedia,
} from "~/hooks/useReport";
import { formatWitaDate } from "~/lib/time-utils";
import { cn } from "~/lib/utils";

const WEATHER_OPTIONS = [
  { value: "Cerah", label: "Cerah (Clear)" },
  { value: "Mendung", label: "Mendung (Cloudy)" },
  { value: "Hujan", label: "Hujan (Rain)" },
  { value: "Hujan Deras", label: "Hujan Deras (Heavy Rain)" },
  { value: "custom", label: "Lainnya (Custom)" },
];

export const step1Schema = z
  .object({
    reportDate: z.date({
      message: "Tanggal laporan wajib diisi",
    }),
    location: z.string().optional(),
    weather: z.string().optional(),
    customWeather: z.string().optional(),
    totalWorkers: z
      .number({ message: "Jumlah pekerja harus berupa angka" })
      .min(0, "Jumlah pekerja minimal 0"),
  })
  .refine(
    (data) => {
      if (data.weather === "custom") {
        return !!data.customWeather && data.customWeather.trim().length > 0;
      }
      return true;
    },
    {
      message: "Kondisi cuaca wajib diisi jika memilih Lainnya",
      path: ["customWeather"],
    },
  );

export const step2Schema = z.object({
  taskDescription: z.string().min(1, "Deskripsi pekerjaan wajib diisi"),
  progressPercent: z
    .number({ message: "Progres harus berupa angka" })
    .min(0, "Progres minimal 0%")
    .max(100, "Progres maksimal 100%"),
});

export const step3Schema = z.object({
  issues: z.string().optional(),
  images: z.array(z.union([z.string(), z.instanceof(File)])).optional(),
});

export const reportSchema = z
  .object({
    reportDate: z.date({
      message: "Tanggal laporan wajib diisi",
    }),
    taskDescription: z.string().min(1, "Deskripsi pekerjaan wajib diisi"),
    progressPercent: z
      .number({ message: "Progres harus berupa angka" })
      .min(0, "Progres minimal 0%")
      .max(100, "Progres maksimal 100%"),
    issues: z.string().optional(),
    weather: z.string().optional(),
    customWeather: z.string().optional(),
    totalWorkers: z
      .number({ message: "Jumlah pekerja harus berupa angka" })
      .min(0, "Jumlah pekerja minimal 0"),
    location: z.string().optional(),
    images: z.array(z.union([z.string(), z.instanceof(File)])).optional(),
  })
  .refine(
    (data) => {
      if (data.weather === "custom") {
        return !!data.customWeather && data.customWeather.trim().length > 0;
      }
      return true;
    },
    {
      message: "Kondisi cuaca wajib diisi jika memilih Lainnya",
      path: ["customWeather"],
    },
  );

export type ReportFormValues = z.infer<typeof reportSchema>;
export type ReportFormDraft = Partial<ReportFormValues>;

export interface ReportFormHandle {
  getValues: () => ReportFormValues;
  submit: () => void;
  validateStep: (step?: number) => boolean;
  goToNextStep: () => boolean;
  goToPrevStep: () => void;
  activeStep: number;
}

export const STEPS = [
  {
    step: 1,
    title: "Lapangan",
  },
  {
    step: 2,
    title: "Progres",
  },
  {
    step: 3,
    title: "Dokumentasi",
  },
];

/**
 * Clean & minimal horizontal stepper placed at the bottom.
 * Follows classic stepper design: small numbered circles connected by a thin line with clean label text.
 */
export function SimpleStepper({
  currentStep,
  onStepClick,
  className,
}: {
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between w-full max-w-xs mx-auto px-1",
        className,
      )}
    >
      {STEPS.map((s, idx) => {
        const isCompleted = s.step < currentStep;
        const isActive = s.step === currentStep;
        return (
          <div key={s.step} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onStepClick?.(s.step)}
              className="flex flex-col items-center gap-0.5 group cursor-pointer focus:outline-none"
            >
              <div
                className={cn(
                  "size-5 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-muted/40 text-muted-foreground group-hover:border-foreground/30",
                )}
              >
                {isCompleted ? (
                  <IconCheck className="size-3 stroke-[2.5]" />
                ) : (
                  s.step
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight font-medium transition-colors",
                  isActive
                    ? "text-primary font-semibold"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
            </button>

            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1.5 -mt-3.5 transition-colors rounded-full",
                  s.step < currentStep ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  activeStep?: number;
  onStepChange?: (step: number) => void;
  ref?: React.Ref<ReportFormHandle>;
  onSuccess?: () => void;
  id?: string;
  onPendingChange?: (isPending: boolean) => void;
  showNavigation?: boolean;
}

export function ReportForm({
  projectId,
  projectSlug,
  report,
  draftValues,
  activeStep: propActiveStep,
  onStepChange,
  ref,
  onSuccess,
  id = "report-form",
  onPendingChange,
  showNavigation = false,
}: ReportFormProps) {
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const uploadMedia = useUploadReportMedia();
  const router = useRouter();

  const [internalStep, setInternalStep] = useState(1);
  const currentStep = propActiveStep ?? internalStep;

  const setCurrentStep = useCallback(
    (step: number) => {
      if (propActiveStep === undefined) {
        setInternalStep(step);
      }
      onStepChange?.(step);
    },
    [propActiveStep, onStepChange],
  );

  const isEditMode = !!report;
  const isPending =
    createReport.isPending || updateReport.isPending || uploadMedia.isPending;

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  // Check if existing weather is a custom value
  const isCustomWeather =
    report?.weather &&
    !WEATHER_OPTIONS.slice(0, -1).some((opt) => opt.value === report.weather);

  const { upload } = useCloudinaryUpload();

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
        // Determine final weather value
        const weather =
          value.weather === "custom" ? value.customWeather : value.weather;

        let currentReportId = report?.id;

        if (isEditMode && currentReportId) {
          await updateReport.mutateAsync({
            projectId,
            reportId: currentReportId,
            reportDate: value.reportDate,
            taskDescription: value.taskDescription,
            progressPercent: value.progressPercent,
            issues: value.issues || undefined,
            weather: weather || undefined,
            totalWorkers: value.totalWorkers,
            location: value.location || undefined,
          });
          toast.success("Laporan berhasil diperbarui");
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

        const uploadedMedia: {
          url: string;
          publicId: string;
          fileName: string;
          fileSize: number;
          mimeType: string;
          resourceType: string;
        }[] = [];

        if (imagesToUpload.length > 0) {
          toast.info(`Mengunggah ${imagesToUpload.length} foto...`);
          for (const file of imagesToUpload) {
            const res = await upload(file, {
              projectSlug,
              type: "reports",
            });
            uploadedMedia.push({
              url: res.secureUrl,
              publicId: res.publicId,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || "image/jpeg",
              resourceType: res.resourceType || "image",
            });
          }
        }

        // Attach all newly uploaded images to the database
        if (currentReportId && uploadedMedia.length > 0) {
          toast.info("Menyimpan foto ke database...");
          for (const img of uploadedMedia) {
            await uploadMedia.mutateAsync({
              projectId,
              reportId: currentReportId,
              publicId: img.publicId,
              url: img.url,
              fileName: img.fileName,
              fileSize: img.fileSize,
              mimeType: img.mimeType,
              resourceType: img.resourceType,
            });
          }
          toast.success("Semua foto berhasil disimpan!");
        }

        onSuccess?.();
        if (!isEditMode) {
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan saat menyimpan laporan");
      }
    },
  });

  const validateStep = useCallback(
    (stepToValidate = currentStep): boolean => {
      if (stepToValidate === 1) {
        const dateErr = form.validateField("reportDate", "change");
        const workersErr = form.validateField("totalWorkers", "change");
        let customWeatherErr: unknown;
        if (form.state.values.weather === "custom") {
          customWeatherErr = form.validateField("customWeather", "change");
        }
        const hasError = Boolean(
          (Array.isArray(dateErr) && dateErr.length > 0) ||
            (Array.isArray(workersErr) && workersErr.length > 0) ||
            (Array.isArray(customWeatherErr) && customWeatherErr.length > 0),
        );
        return !hasError;
      }

      if (stepToValidate === 2) {
        const descErr = form.validateField("taskDescription", "change");
        const progErr = form.validateField("progressPercent", "change");
        const hasError = Boolean(
          (Array.isArray(descErr) && descErr.length > 0) ||
            (Array.isArray(progErr) && progErr.length > 0),
        );
        return !hasError;
      }

      return true;
    },
    [currentStep, form],
  );

  const goToNextStep = useCallback((): boolean => {
    const isValid = validateStep(currentStep);
    if (!isValid) {
      toast.error(
        "Mohon lengkapi field wajib pada langkah ini terlebih dahulu",
      );
      return false;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return true;
    }
    return true;
  }, [currentStep, setCurrentStep, validateStep]);

  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  const handleStepClick = useCallback(
    (targetStep: number) => {
      if (targetStep === currentStep) return;

      if (targetStep < currentStep) {
        setCurrentStep(targetStep);
        return;
      }

      // Check all steps between currentStep and targetStep - 1
      for (let s = currentStep; s < targetStep; s++) {
        const isValid = validateStep(s);
        if (!isValid) {
          toast.error(
            "Mohon lengkapi field wajib pada langkah ini terlebih dahulu",
          );
          return;
        }
      }

      setCurrentStep(targetStep);
    },
    [currentStep, setCurrentStep, validateStep],
  );

  useImperativeHandle(ref, () => ({
    getValues: () => form.state.values,
    submit: () => void form.handleSubmit(),
    validateStep: (step?: number) => validateStep(step ?? currentStep),
    goToNextStep,
    goToPrevStep,
    activeStep: currentStep,
  }));

  const stepperIndicators = useMemo(
    () => ({
      completed: <IconCheck className="size-3.5 stroke-[2.5]" />,
    }),
    [],
  );

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentStep < 3) {
          goToNextStep();
          return;
        }
        void form.handleSubmit();
      }}
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          currentStep < 3 &&
          (e.target as HTMLElement).tagName === "INPUT"
        ) {
          e.preventDefault();
          goToNextStep();
        }
      }}
      className="space-y-4"
    >
      <Stepper
        value={currentStep}
        onValueChange={handleStepClick}
        indicators={stepperIndicators}
        className="space-y-4"
      >
        <StepperPanel>
          {/* STEP 1: Kondisi Lapangan */}
          <StepperContent value={1} forceMount>
            <div className="space-y-4">
              {/* Report Date */}
              <form.Field
                name="reportDate"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Tanggal laporan wajib diisi" : undefined,
                }}
              >
                {(field) => (
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Tanggal Laporan *</FieldLabel>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.state.value && "text-muted-foreground",
                            )}
                          >
                            <IconCalendar className="mr-2 h-4 w-4" />
                            {field.state.value
                              ? formatWitaDate(field.state.value)
                              : "Pilih tanggal"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            locale={idLocale}
                            selected={field.state.value}
                            onSelect={(date) =>
                              date && field.handleChange(date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>
                        Waktu standar WITA (UTC+8)
                      </FieldDescription>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  </FieldGroup>
                )}
              </form.Field>

              {/* Workers and Location Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field
                  name="totalWorkers"
                  validators={{
                    onChange: ({ value }) =>
                      typeof value !== "number" ||
                      Number.isNaN(value) ||
                      value < 0
                        ? "Jumlah pekerja minimal 0"
                        : undefined,
                  }}
                >
                  {(field) => (
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Jumlah Pekerja *</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(
                              Math.max(0, Number(e.target.value) || 0),
                            )
                          }
                          onBlur={field.handleBlur}
                          placeholder="0"
                        />
                        <FieldDescription>
                          Total tenaga kerja aktif di lokasi
                        </FieldDescription>
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    </FieldGroup>
                  )}
                </form.Field>

                <form.Field name="location">
                  {(field) => (
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Lokasi / Area (Opsional)</FieldLabel>
                        <Input
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="cth: Villa A, Lantai 2"
                        />
                        <FieldDescription>
                          Area spesifik pekerjaan harian
                        </FieldDescription>
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    </FieldGroup>
                  )}
                </form.Field>
              </div>

              {/* Weather Select */}
              <form.Field name="weather">
                {(field) => (
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Kondisi Cuaca (Opsional)</FieldLabel>
                      <Select
                        value={field.state.value || ""}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kondisi Cuaca" />
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

              {/* Custom Weather Input */}
              <form.Subscribe selector={(state) => state.values.weather}>
                {(weather) =>
                  weather === "custom" && (
                    <form.Field
                      name="customWeather"
                      validators={{
                        onChange: ({ value }) =>
                          !value || value.trim().length === 0
                            ? "Kondisi cuaca wajib diisi jika memilih Lainnya"
                            : undefined,
                      }}
                    >
                      {(field) => (
                        <FieldGroup>
                          <Field>
                            <FieldLabel>Cuaca Lainnya *</FieldLabel>
                            <Input
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              placeholder="Masukkan kondisi cuaca spesifik..."
                            />
                            <FieldError errors={field.state.meta.errors} />
                          </Field>
                        </FieldGroup>
                      )}
                    </form.Field>
                  )
                }
              </form.Subscribe>
            </div>
          </StepperContent>

          {/* STEP 2: Progres & Rincian Tugas */}
          <StepperContent value={2} forceMount>
            <div className="space-y-4">
              {/* Task Description */}
              <form.Field
                name="taskDescription"
                validators={{
                  onChange: ({ value }) =>
                    !value || value.trim().length === 0
                      ? "Deskripsi pekerjaan wajib diisi"
                      : undefined,
                }}
              >
                {(field) => (
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Deskripsi Pekerjaan *</FieldLabel>
                      <Textarea
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Jelaskan pekerjaan yang diselesaikan hari ini..."
                        rows={4}
                      />
                      <FieldDescription>
                        Deskripsikan tugas-tugas utama yang diselesaikan hari
                        ini
                      </FieldDescription>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  </FieldGroup>
                )}
              </form.Field>

              {/* Progress and Visual Bar (Single Color: Primary) */}
              <form.Field
                name="progressPercent"
                validators={{
                  onChange: ({ value }) => {
                    if (typeof value !== "number" || Number.isNaN(value)) {
                      return "Progres harus berupa angka";
                    }
                    if (value < 0 || value > 100) {
                      return "Progres harus di antara 0% dan 100%";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const progressValue = field.state.value ?? 0;
                  return (
                    <FieldGroup>
                      <Field>
                        <div className="flex items-center justify-between">
                          <FieldLabel>Progres Harian (%) *</FieldLabel>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                            {progressValue}% Selesai
                          </span>
                        </div>

                        <div className="grid gap-3">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(
                                Math.min(
                                  100,
                                  Math.max(0, Number(e.target.value) || 0),
                                ),
                              )
                            }
                            onBlur={field.handleBlur}
                            placeholder="0"
                          />

                          {/* Visual Progress Bar - Single Color (Primary) */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-300 rounded-full"
                              style={{
                                width: `${Math.min(Math.max(progressValue, 0), 100)}%`,
                              }}
                            />
                          </div>

                          {/* Preset Quick Chips */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground mr-1">
                              Pintasan:
                            </span>
                            {[0, 25, 50, 75, 100].map((preset) => (
                              <Button
                                key={preset}
                                type="button"
                                variant={
                                  field.state.value === preset
                                    ? "default"
                                    : "outline"
                                }
                                size="xs"
                                className="h-6 text-[11px] px-2 rounded-md"
                                onClick={() => field.handleChange(preset)}
                              >
                                {preset}%
                              </Button>
                            ))}
                          </div>
                        </div>

                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    </FieldGroup>
                  );
                }}
              </form.Field>

              {/* Checklist / Sub-tugas Callout */}
              <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2.5">
                <IconInfoCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  Rincian sub-tugas dan checklist pekerjaan spesifik dapat
                  ditambahkan setelah laporan harian ini disimpan.
                </span>
              </div>
            </div>
          </StepperContent>

          {/* STEP 3: Dokumentasi & Kendala */}
          <StepperContent value={3} forceMount>
            <div className="space-y-4">
              {/* Image Upload for Report */}
              {!isEditMode ? (
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
                          Pilih beberapa foto dari galeri atau ambil langsung
                          dengan kamera HP Anda.
                        </FieldDescription>
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    </FieldGroup>
                  )}
                </form.Field>
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2.5">
                  <IconInfoCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    Foto dokumentasi dapat dikelola langsung pada halaman detail
                    laporan setelah disimpan.
                  </span>
                </div>
              )}

              {/* Issues */}
              <form.Field name="issues">
                {(field) => (
                  <FieldGroup>
                    <Field>
                      <FieldLabel>
                        Kendala / Masalah Lapangan (Opsional)
                      </FieldLabel>
                      <Textarea
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Tuliskan kendala material, cuaca buruk, atau hambatan lainnya..."
                        rows={3}
                      />
                      <FieldDescription>
                        Catat hambatan atau isu lapangan yang perlu
                        ditindaklanjuti
                      </FieldDescription>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  </FieldGroup>
                )}
              </form.Field>
            </div>
          </StepperContent>
        </StepperPanel>
      </Stepper>

      {/* Stepper indicator placed at the very bottom of the form content */}
      <div className="border-t pt-2">
        <SimpleStepper
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Standalone Bottom Navigation Bar (used when not rendered inside Dialog with customFooter) */}
      {showNavigation && (
        <div className="flex items-center justify-between gap-2 pt-2">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevStep}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              <IconChevronLeft className="mr-1.5 h-4 w-4" />
              Kembali
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              Lanjutkan
              <IconChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditMode ? (
                "Simpan Perubahan"
              ) : (
                "Kirim Laporan"
              )}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
