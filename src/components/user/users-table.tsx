"use client";

import { DataTable } from "~/components/ui/data-table";
import { getUserColumns, type UserListItem } from "./user-columns";

interface UsersTableProps {
  data: UserListItem[];
}

export function UsersTable({ data }: UsersTableProps) {
  const columns = getUserColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      filterColumn="name"
      filterPlaceholder="Cari pengguna berdasarkan nama..."
      initialColumnPinning={{
        left: ["select", "name"],
        right: ["actions"],
      }}
      exportFilename="daftar-pengguna"
    />
  );
}
