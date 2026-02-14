"use client"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

type FilterValue = "all" | "pending" | "active" | "rejected"

interface UserFilterDropdownProps {
  value: FilterValue
  onValueChange: (value: FilterValue) => void
}

const filterLabels: Record<FilterValue, string> = {
  all: "All Users",
  pending: "Pending",
  active: "Active",
  rejected: "Rejected",
}

export function UserFilterDropdown({
  value,
  onValueChange,
}: UserFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          Filter: {filterLabels[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => onValueChange(v as FilterValue)}
        >
          <DropdownMenuRadioItem value="all">All Users</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rejected">
            Rejected
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
