"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Button } from "~/components/ui/button";
import {
  ReportForm,
  type ReportFormDraft,
  type ReportFormHandle,
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
  const [activeStep, setActiveStep] = useState(1);
  const [draft, setDraft] = useState<ReportFormDraft>({});
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<ReportFormHandle>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && formRef.current) {
      setDraft(formRef.current.getValues());
    }
    if (!isOpen) {
      setActiveStep(1);
    }
    onOpenChange(isOpen);
  };

  const handleSuccess = () => {
    setDraft({});
    setActiveStep(1);
    onOpenChange(false);
  };

  const title = isEditMode ? "Edit Laporan" : "Buat Laporan Baru";
  const description = isEditMode
    ? "Perbarui detail laporan harian"
    : "Isi laporan harian untuk proyek ini";

  const submitLabel = isEditMode ? "Simpan Perubahan" : "Kirim Laporan";

  const handleNext = () => {
    if (formRef.current?.goToNextStep()) {
      // Step advanced
    }
  };

  const handlePrev = () => {
    formRef.current?.goToPrevStep();
  };

  const customFooter = (
    <div className="flex w-full items-center justify-between gap-2">
      {activeStep === 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
          disabled={isPending}
          className="flex-1 sm:flex-none"
        >
          Batal
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={isPending}
          className="flex-1 sm:flex-none"
        >
          <IconChevronLeft className="mr-1.5 h-4 w-4" />
          Kembali
        </Button>
      )}

      {activeStep < 3 ? (
        <Button
          type="button"
          onClick={handleNext}
          disabled={isPending}
          className="flex-1 sm:flex-none"
        >
          Lanjutkan
          <IconChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          form="report-form"
          disabled={isPending}
          className="flex-1 sm:flex-none"
        >
          {isPending ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      )}
    </div>
  );

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      customFooter={customFooter}
      isPending={isPending}
    >
      <ReportForm
        id="report-form"
        ref={formRef}
        projectId={projectId}
        projectSlug={projectSlug || "project"}
        report={report}
        draftValues={draft}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onPendingChange={setIsPending}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
