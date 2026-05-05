import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const isEditMode = !!report;
  const [draft, setDraft] = useState<ReportFormDraft>({});
  const formRef = useRef<{
    getValues: () => ReportFormValues;
    submit: () => void;
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

  const handleSubmit = () => {
    formRef.current?.submit();
  };

  const title = isEditMode ? "Edit Report" : "Create New Report";
  const description = isEditMode
    ? "Update the daily report details"
    : "Fill in the daily report for this project";

  const submitLabel = isEditMode ? "Simpan Perubahan" : "Kirim Laporan";

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {/*
          DialogContent base class has `display:grid` which cannot be reliably
          overridden via Tailwind (class order in CSS bundle is non-deterministic).

          Strategy: Keep DialogContent as-is (grid with 1 child).
          A single-child grid is effectively a block — the child fills it.
          All layout logic lives inside the wrapper div which uses
          pure flexbox that is NOT affected by the outer grid.

          The wrapper controls:
            - max-h-[90dvh]: cap the total dialog height
            - flex flex-col: stack header / body / footer vertically
          The body uses:
            - flex-1: grows to fill remaining space
            - min-h-0: CRITICAL — overrides flex/grid default min-height:auto
                       which would otherwise allow the body to grow past flex-1 allocation
            - overflow-y-auto: actual scroll container (now correctly bounded)
        */}
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <div className="flex flex-col max-h-[90dvh]">
            {/* Fixed header */}
            <div className="shrink-0 px-4 pt-4 pb-3 pr-12 border-b">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {description}
              </DialogDescription>
            </div>

            {/* Scrollable body — min-h-0 is the key fix */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
              data-lenis-prevent
            >
              <ReportForm
                ref={formRef}
                projectId={projectId}
                projectSlug={projectSlug || "project"}
                report={report}
                draftValues={draft}
                onSuccess={handleSuccess}
              />
            </div>

            {/* Fixed footer */}
            <div className="shrink-0 border-t bg-muted/50 px-4 py-3 flex justify-end rounded-b-xl">
              <Button onClick={handleSubmit}>{submitLabel}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {/*
        DrawerContent already uses display:flex flex-col (from Vaul internals).
        Same min-h-0 fix applies to flex children too.
      */}
      <DrawerContent className="flex flex-col h-[85dvh]">
        <DrawerHeader className="text-left shrink-0 border-b pb-3">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <ReportForm
            ref={formRef}
            projectId={projectId}
            projectSlug={projectSlug || "project"}
            report={report}
            draftValues={draft}
            onSuccess={handleSuccess}
          />
        </div>

        <DrawerFooter className="shrink-0 border-t mt-0">
          <Button onClick={handleSubmit} className="w-full">
            {submitLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
