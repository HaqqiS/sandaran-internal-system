"use client";

import { IconDots } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import type { GlobalRole } from "generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { RoleBadge } from "./role-badge";
import { UserStatusBadge } from "./user-status-badge";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  roleGlobal: GlobalRole;
  isActive: boolean;
  reviewedAt: Date | null;
  reviewedBy: { name: string; email: string } | null;
  createdAt: Date;
  _count: { projectMembers: number };
};

type UserStatus = "pending" | "approved" | "rejected";

function getUserStatus(isActive: boolean, reviewedAt: Date | null): UserStatus {
  if (!reviewedAt) return "pending";
  return isActive ? "approved" : "rejected";
}

export function getUserColumns(): ColumnDef<UserListItem>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const { isActive, reviewedAt } = row.original;
        const status = getUserStatus(isActive, reviewedAt);
        return <UserStatusBadge status={status} />;
      },
    },
    {
      accessorKey: "roleGlobal",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.roleGlobal} />,
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        );
      },
    },
    {
      id: "projects",
      header: "Projects",
      cell: ({ row }) => {
        const count = row.original._count.projectMembers;
        return (
          <span className="text-sm text-muted-foreground">
            {count} {count === 1 ? "project" : "projects"}
          </span>
        );
      },
    },
  ];
}

// Version with actions for page usage
interface GetUserColumnsWithActionsProps {
  onApprove?: (user: UserListItem) => void;
  onReject?: (user: UserListItem) => void;
  onEditRole?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
}

export function getUserColumnsWithActions({
  onApprove,
  onReject,
  onEditRole,
  onDelete,
}: GetUserColumnsWithActionsProps): ColumnDef<UserListItem>[] {
  const baseColumns = getUserColumns();

  const actionsColumn: ColumnDef<UserListItem> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const status = getUserStatus(user.isActive, user.reviewedAt);

      // Show approve/reject buttons for pending users
      if (status === "pending") {
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onApprove?.(user)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject?.(user)}
            >
              Reject
            </Button>
          </div>
        );
      }

      // Show dropdown menu for approved/rejected users
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditRole?.(user)}>
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(user)}
              className="text-destructive"
              disabled={user.isActive}
            >
              Delete User
              {user.isActive && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Inactive only)
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  return [...baseColumns, actionsColumn];
}
