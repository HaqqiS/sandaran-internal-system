import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { ReportForm } from "./report-form";

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

  const title = isEditMode ? "Edit Report" : "Create New Report";
  const description = isEditMode
    ? "Update the daily report details"
    : "Fill in the daily report for this project";

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ReportForm
            projectId={projectId}
            projectSlug={projectSlug || "project"}
            report={report}
            onSuccess={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto no-scrollbar flex-1">
          <ReportForm
            projectId={projectId}
            projectSlug={projectSlug || "project"}
            report={report}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
