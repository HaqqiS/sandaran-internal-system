"use client"

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"

type FilterValue = "all" | "pending" | "active" | "rejected"

interface UserFilterTabsProps {
  value: FilterValue
  onValueChange: (value: FilterValue) => void
  counts?: {
    all: number
    pending: number
    active: number
    rejected: number
  }
}

export function UserFilterTabs({
  value,
  onValueChange,
  counts,
}: UserFilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as FilterValue)}>
      <TabsList>
        <TabsTrigger value="all">All {counts && `(${counts.all})`}</TabsTrigger>
        <TabsTrigger value="pending">
          Pending {counts && `(${counts.pending})`}
        </TabsTrigger>
        <TabsTrigger value="active">
          Active {counts && `(${counts.active})`}
        </TabsTrigger>
        <TabsTrigger value="rejected">
          Rejected {counts && `(${counts.rejected})`}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
