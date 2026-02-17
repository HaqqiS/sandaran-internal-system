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
      filterPlaceholder="Search users by name or email..."
    />
  );
}
