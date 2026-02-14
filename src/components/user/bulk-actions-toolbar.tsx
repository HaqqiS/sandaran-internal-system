"use client"

import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"

interface BulkActionsToolbarProps {
  selectedCount: number
  onApproveAll: () => void
  onClearSelection: () => void
  isLoading?: boolean
}

export function BulkActionsToolbar({
  selectedCount,
  onApproveAll,
  onClearSelection,
  isLoading = false,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-3">
      <div className="flex-1 text-sm">
        <span className="font-medium">{selectedCount}</span> user
        {selectedCount !== 1 ? "s" : ""} selected
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onApproveAll} disabled={isLoading}>
          {isLoading ? "Approving..." : "Approve All"}
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={isLoading}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
