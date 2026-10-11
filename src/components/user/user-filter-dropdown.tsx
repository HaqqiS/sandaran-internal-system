"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type FilterValue = "all" | "pending" | "active" | "rejected";

interface UserFilterDropdownProps {
  value: FilterValue;
  onValueChange: (value: FilterValue) => void;
}

const filterLabels: Record<FilterValue, string> = {
  all: "Semua Pengguna",
  pending: "Menunggu",
  active: "Aktif",
  rejected: "Ditolak",
};

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
          <DropdownMenuRadioItem value="all">
            Semua Pengguna
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending">
            Menunggu
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="active">Aktif</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rejected">
            Ditolak
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
