"use client"

import { useMemo } from "react"
import { DataTable } from "~/components/ui/data-table"
import { getProjectColumns, type ProjectListItem } from "./project-columns"

interface ProjectTableProps {
  data: ProjectListItem[]
  onEdit?: (project: ProjectListItem) => void
  onDelete?: (project: ProjectListItem) => void
  canManage?: boolean
}

export function ProjectTable({
  data,
  onEdit,
  onDelete,
  canManage = false,
}: ProjectTableProps) {
  const columns = useMemo(
    () => getProjectColumns({ onEdit, onDelete, canManage }),
    [onEdit, onDelete, canManage],
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      filterColumn="name"
      filterPlaceholder="Search projects..."
    />
  )
}
