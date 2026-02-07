"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { ReportForm } from "./report-form"

interface ReportSheetProps {
  projectId: string
  report?: {
    id: string
    reportDate: Date | string
    taskDescription: string
    progressPercent: number
    issues?: string | null
    weather?: string | null
    totalWorkers: number
    location?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportSheet({
  projectId,
  report,
  open,
  onOpenChange,
}: ReportSheetProps) {
  const isEditMode = !!report

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? "Edit Report" : "Create New Report"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update the daily report details"
              : "Fill in the daily report for this project"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <ReportForm
            projectId={projectId}
            report={report}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
