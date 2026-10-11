"use client";

import { useRef, useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import {
  ReportForm,
  type ReportFormDraft,
  type ReportFormValues,
} from "./report-form";

interface ReportDialogProps {
  projectId: string;
  projectSlug?: string;
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({
  projectId,
  projectSlug,
  report,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const isEditMode = Boolean(report);
  const [draft, setDraft] = useState<ReportFormDraft>({});
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<{
    getValues: () => ReportFormValues;
  }>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && formRef.current) {
      setDraft(formRef.current.getValues());
    }
    onOpenChange(isOpen);
  };

  const handleSuccess = () => {
    setDraft({});
    onOpenChange(false);
  };

  const title = isEditMode ? "Edit Laporan" : "Buat Laporan Baru";
  const description = isEditMode
    ? "Perbarui detail laporan harian"
    : "Isi laporan harian untuk proyek ini";

  const submitLabel = isEditMode ? "Simpan Perubahan" : "Kirim Laporan";

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      formId="report-form"
      submitLabel={submitLabel}
      isPending={isPending}
    >
      <ReportForm
        id="report-form"
        ref={formRef}
        projectId={projectId}
        projectSlug={projectSlug || "project"}
        report={report}
        draftValues={draft}
        onPendingChange={setIsPending}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
