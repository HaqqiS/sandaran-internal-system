"use client";

import { IconDots, IconSearch, IconUserPlus, IconX } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "~/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTable } from "~/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { ApproveUserDialog } from "~/components/user/approve-user-dialog";
import { BulkActionsToolbar } from "~/components/user/bulk-actions-toolbar";
import { CreateUserDialog } from "~/components/user/create-user-dialog";
import { DeleteUserDialog } from "~/components/user/delete-user-dialog";
import { EditUserDialog } from "~/components/user/edit-user-dialog";
import { RejectUserDialog } from "~/components/user/reject-user-dialog";
import { RoleBadge } from "~/components/user/role-badge";
import {
  getUserColumnsWithActions,
  getUserStatus,
  type UserListItem,
} from "~/components/user/user-columns";
import { UserFilterDropdown } from "~/components/user/user-filter-dropdown";
import { UserFilterTabs } from "~/components/user/user-filter-tabs";
import { UserStatusBadge } from "~/components/user/user-status-badge";
import { useBulkApprove, useUserListWithFilter } from "~/hooks";
import { useIsMobile } from "~/hooks/use-mobile";

type FilterValue = "all" | "pending" | "active" | "rejected";

export function UsersClient() {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const { data: users, isLoading } = useUserListWithFilter({
    filter,
    search: "",
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const bulkApprove = useBulkApprove({
    onSuccess: (data) => {
      toast.success(`Berhasil menyetujui ${data.count} pengguna`);
      setRowSelection({});
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menyetujui pengguna");
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

  const handleEditUser = (user: UserListItem) => {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
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
    onEditUser: handleEditUser,
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
    <PageLayout
      title="Manajemen Pengguna"
      actions={
        <Button
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="flex items-center gap-1.5 font-semibold shadow-xs"
        >
          <IconUserPlus size={16} />
          <span>Tambah Pengguna</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 w-full max-w-screen-2xl mx-auto">
        {/* Filter Controls - Responsive */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
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
        </div>

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedCount}
          onApproveAll={handleBulkApprove}
          onClearSelection={() => setRowSelection({})}
          isLoading={bulkApprove.isPending}
        />

        {/* Content: Loading, Data, or Empty States */}
        {isLoading ? (
          <div className="space-y-4">
            {/* Mobile Skeletons */}
            <div className="md:hidden space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table Skeletons */}
            <div className="hidden md:block space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : users && users.length > 0 ? (
          <>
            {/* ── Mobile: Card List View ────────────────── */}
            <div className="md:hidden space-y-3">
              {/* Mobile Search Bar */}
              <div className="relative flex items-center">
                <IconSearch className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Cari nama, email, no HP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-10 text-base"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 size-8"
                    onClick={() => setSearchQuery("")}
                    aria-label="Hapus pencarian"
                  >
                    <IconX className="size-4" />
                  </Button>
                )}
              </div>

              {filteredUsers.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                  <p className="text-sm font-medium">
                    Pengguna tidak ditemukan
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tidak ada hasil yang sesuai dengan &ldquo;{searchQuery}
                    &rdquo;
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => {
                    const status = getUserStatus(
                      user.isActive,
                      user.reviewedAt,
                    );
                    const isSelected = !!rowSelection[user.id];

                    return (
                      <div
                        key={user.id}
                        className={`rounded-xl border bg-card p-4 text-card-foreground shadow-xs transition-colors space-y-3 ${
                          isSelected ? "border-primary/50 bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="pt-0.5">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(val) =>
                                  setRowSelection((prev) => ({
                                    ...prev,
                                    [user.id]: !!val,
                                  }))
                                }
                                aria-label={`Pilih ${user.name}`}
                              />
                            </div>
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage
                                src={user.image ?? undefined}
                                alt={user.name}
                              />
                              <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="font-semibold text-sm truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email.endsWith("@sandaran.internal")
                                  ? "(Daftar via No. HP)"
                                  : user.email}
                              </p>
                              {user.phoneNumber && (
                                <p className="text-xs font-mono text-muted-foreground truncate">
                                  {user.phoneNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Dropdown Menu */}
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                                aria-label={`Menu tindakan untuk ${user.name}`}
                              >
                                <IconDots className="size-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                                className="cursor-pointer"
                              >
                                Edit Pengguna
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                className="text-destructive cursor-pointer"
                                disabled={user.isActive}
                              >
                                Hapus Pengguna
                                {user.isActive && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (Nonaktif saja)
                                  </span>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Badges & Meta info */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                          <RoleBadge role={user.roleGlobal} />
                          <UserStatusBadge status={status} />
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-muted-foreground">
                            {user._count.projectMembers} proyek
                          </span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {/* Quick Actions for pending users */}
                        {status === "pending" && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              className="flex-1 min-h-10"
                              onClick={() => handleApprove(user)}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 min-h-10"
                              onClick={() => handleReject(user)}
                            >
                              Tolak
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Desktop: TanStack DataTable View ───────── */}
            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={users}
                filterColumn="name"
                filterPlaceholder="Cari pengguna berdasarkan nama..."
                state={{ rowSelection }}
                onRowSelectionChange={setRowSelection}
              />
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium">Pengguna tidak ditemukan</p>
              <p className="text-sm text-muted-foreground">
                {filter === "pending"
                  ? "Tidak ada pengguna yang menunggu persetujuan"
                  : filter === "active"
                    ? "Tidak ada pengguna aktif"
                    : filter === "rejected"
                      ? "Tidak ada pengguna yang ditolak"
                      : "Belum ada pengguna di sistem"}
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

      <EditUserDialog
        user={selectedUser}
        open={editUserDialogOpen}
        onOpenChange={setEditUserDialogOpen}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </PageLayout>
  );
}
