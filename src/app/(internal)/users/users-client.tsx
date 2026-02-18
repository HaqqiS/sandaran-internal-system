"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "~/components/layout";
import { DataTable } from "~/components/ui/data-table";
import { Skeleton } from "~/components/ui/skeleton";
import { ApproveUserDialog } from "~/components/user/approve-user-dialog";
import { BulkActionsToolbar } from "~/components/user/bulk-actions-toolbar";
import { DeleteUserDialog } from "~/components/user/delete-user-dialog";
import { EditRoleDialog } from "~/components/user/edit-role-dialog";
import { RejectUserDialog } from "~/components/user/reject-user-dialog";
import {
  getUserColumnsWithActions,
  type UserListItem,
} from "~/components/user/user-columns";
import { UserFilterDropdown } from "~/components/user/user-filter-dropdown";
import { UserFilterTabs } from "~/components/user/user-filter-tabs";
import { useBulkApprove, useUserListWithFilter } from "~/hooks";
import { useIsMobile } from "~/hooks/use-mobile";

type FilterValue = "all" | "pending" | "active" | "rejected";

export function UsersClient() {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const { data: users, isLoading } = useUserListWithFilter({
    filter,
    search: "",
  });

  const bulkApprove = useBulkApprove({
    onSuccess: (data) => {
      toast.success(`Successfully approved ${data.count} user(s)`);
      setRowSelection({});
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve users");
    },
  });

  const handleApprove = (user: UserListItem) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  const handleReject = (user: UserListItem) => {
    setSelectedUser(user);
    setRejectDialogOpen(true);
  };

  const handleEditRole = (user: UserListItem) => {
    setSelectedUser(user);
    setEditRoleDialogOpen(true);
  };

  const handleDelete = (user: UserListItem) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleBulkApprove = () => {
    const selectedIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id],
    );
    if (selectedIds.length === 0) return;

    bulkApprove.mutate({
      userIds: selectedIds,
      roleGlobal: "USER",
    });
  };

  const columns = getUserColumnsWithActions({
    onApprove: handleApprove,
    onReject: handleReject,
    onEditRole: handleEditRole,
    onDelete: handleDelete,
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  // Calculate counts for filter tabs
  const counts = users
    ? {
        all: users.length,
        pending: users.filter((u) => !u.reviewedAt).length,
        active: users.filter((u) => u.isActive && u.reviewedAt).length,
        rejected: users.filter((u) => !u.isActive && u.reviewedAt).length,
      }
    : undefined;

  return (
    <PageLayout title="User Management">
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Manage user approvals, roles, and permissions
          </p>
        </div>

        {/* Filter Controls - Responsive */}
        <div className="flex items-center gap-4">
          {isMobile ? (
            <UserFilterDropdown value={filter} onValueChange={setFilter} />
          ) : (
            <UserFilterTabs
              value={filter}
              onValueChange={setFilter}
              counts={counts}
            />
          )}
        </div>

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedCount}
          onApproveAll={handleBulkApprove}
          onClearSelection={() => setRowSelection({})}
          isLoading={bulkApprove.isPending}
        />

        {/* Table or Loading/Empty States */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : users && users.length > 0 ? (
          <DataTable
            columns={columns}
            data={users}
            filterColumn="name"
            filterPlaceholder="Search users by name or email..."
            state={{ rowSelection }}
            onRowSelectionChange={setRowSelection}
          />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground">
                {filter === "pending"
                  ? "No pending users at the moment"
                  : filter === "active"
                    ? "No active users found"
                    : filter === "rejected"
                      ? "No rejected users found"
                      : "No users in the system"}
              </p>
            </div>
          </div>
        )}
      </div>

      <ApproveUserDialog
        user={selectedUser}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
      />

      <RejectUserDialog
        user={selectedUser}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
      />

      <EditRoleDialog
        user={selectedUser}
        open={editRoleDialogOpen}
        onOpenChange={setEditRoleDialogOpen}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </PageLayout>
  );
}
