"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

// ─── Types & Schema ──────────────────────────────────────────────────────────

const exportSchema = z.object({
  month: z.string().min(1, "Pilih bulan terlebih dahulu"),
});

type ExportFormValues = z.infer<typeof exportSchema>;

interface ExportReportDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(value: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ExportReportDialog({
  projectId,
  open,
  onOpenChange,
}: ExportReportDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExport = async (monthValue: string) => {
    setIsDownloading(true);
    const toastId = toast.loading("Sedang membuat laporan Excel…");

    try {
      const res = await fetch(
        `/api/projects/${projectId}/export?month=${monthValue}`,
      );

      if (!res.ok) {
        let errorMsg = "Gagal mengekspor laporan.";
        try {
          const json = (await res.json()) as { error?: string };
          if (json.error) errorMsg = json.error;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMsg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `laporan_${monthValue}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success(
        `Laporan ${formatMonthLabel(monthValue)} berhasil diunduh!`,
        { id: toastId },
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
        { id: toastId },
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const form = useForm({
    defaultValues: {
      month: getCurrentMonth(),
    } as ExportFormValues,
    validators: {
      onSubmit: exportSchema,
    },
    onSubmit: async ({ value }) => {
      await handleExport(value.month);
    },
  });

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
        }
        onOpenChange(nextOpen);
      }}
      title="Ekspor Laporan ke Excel"
      description="Pilih periode bulan yang ingin diekspor. File Excel akan mencakup seluruh daily report beserta task dan foto dokumentasi."
      formId="export-report-form"
      submitLabel={isDownloading ? "Membuat Laporan…" : "Unduh Laporan"}
      isPending={isDownloading}
      dialogClassName="sm:max-w-md"
    >
      <form
        id="export-report-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="month">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Periode Bulan</FieldLabel>
              <Input
                id={field.name}
                type="month"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                max={getCurrentMonth()}
                disabled={isDownloading}
              />
              {field.state.value && (
                <p className="text-xs text-muted-foreground">
                  Mengekspor laporan bulan{" "}
                  <span className="font-medium text-foreground">
                    {formatMonthLabel(field.state.value)}
                  </span>
                </p>
              )}
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            ⚠️ Proses ekspor mungkin membutuhkan beberapa detik karena memuat
            foto dokumentasi dari server.
          </p>
        </div>
      </form>
    </ResponsiveFormDialog>
  );
}
