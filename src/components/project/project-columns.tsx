"use client"

import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

// Type for project data from getAll query
export type ProjectListItem = {
  id: string
  name: string
  slug: string
  status: "ACTIVE" | "DONE" | "PAUSED"
  location: string | null
  startDate: Date | null
  endDate: Date | null
  _count: {
    dailyReports: number
    documents: number
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }>
}

interface ProjectColumnsProps {
  onEdit?: (project: ProjectListItem) => void
  onDelete?: (project: ProjectListItem) => void
  canManage?: boolean
}

export function getProjectColumns({
  onEdit,
  onDelete,
  canManage = false,
}: ProjectColumnsProps): ColumnDef<ProjectListItem>[] {
  return [
    {
      accessorKey: "name",
      header: "Project Name",
      cell: ({ row }) => (
        <Link
          href={`/projects/${row.original.slug}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            variant={
              status === "ACTIVE"
                ? "default"
                : status === "DONE"
                  ? "secondary"
                  : "outline"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.original.location || "-",
    },
    {
      id: "members",
      header: "Members",
      cell: ({ row }) => row.original.members.length,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) =>
        row.original.startDate
          ? format(new Date(row.original.startDate), "PP")
          : "-",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const project = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.slug}`}>
                  <IconEye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(project)}>
                    <IconPencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(project)}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
