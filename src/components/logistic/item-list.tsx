"use client";

import {
  IconBox,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/shared/confirm-delete-dialog";
import { DataGrid } from "~/components/ui/data-grid";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useDeleteLogisticItem,
  useLogisticStockSummary,
} from "~/hooks/useLogistic";
import { useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";
import { ItemActions } from "./item-actions";
import { getLogisticColumns, type LogisticStockItem } from "./item-columns";
import { TransactionDialog } from "./transaction-dialog";

interface ItemListProps {
  projectId: string;
}

// ── Skeleton ──────────────────────────────────────────────────
function ItemListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <Skeleton className="h-9 w-full rounded-lg" />

      {/* Mobile card skeletons */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        <div className="bg-muted/30 p-3 flex gap-6 border-b">
          {([160, 60, 60, 60, 60] as const).map((w, i) => (
            <Skeleton
              key={`head-${i}-${w}`}
              className="h-3"
              style={{ width: w }}
            />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 flex gap-6 items-center border-b last:border-b-0"
          >
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-10 font-bold" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function ItemList({ projectId }: ItemListProps) {
  const { data: items, isLoading } = useLogisticStockSummary(projectId);
  const { data: members } = useProjectMembers(projectId);
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const [transactionDialog, setTransactionDialog] = useState<{
    isOpen: boolean;
    type: "IN" | "OUT";
    item: { id: string; name: string; unit: string } | null;
  }>({
    isOpen: false,
    type: "OUT",
    item: null,
  });

  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;
  const canRecordTransaction =
    role === "SUPERVISOR" ||
    role === "LOGISTIC" ||
    session?.user?.roleGlobal === "ADMIN";

  const deleteItem = useDeleteLogisticItem();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem.mutateAsync({
        projectId,
        itemId: deleteTarget.id,
      });
      toast.success("Barang berhasil dihapus");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menghapus barang",
      );
    }
  };

  const handleTransactionSuccess = () => {
    setTransactionDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Sort items by activity (totalIn + totalOut desc)
  const sortedItems = useMemo(() => {
    if (!items) return [];
    return [...items].sort(
      (a, b) => b.totalIn + b.totalOut - (a.totalIn + a.totalOut),
    );
  }, [items]);

  // Apply mobile search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems;
    const q = searchQuery.toLowerCase().trim();
    return sortedItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [sortedItems, searchQuery]);

  const columns = useMemo(
    () =>
      getLogisticColumns({
        projectId,
        canRecordTransaction: !!canRecordTransaction,
        onOpenTransaction: (item, type) =>
          setTransactionDialog({
            isOpen: true,
            type,
            item,
          }),
        onDelete: (item) => setDeleteTarget(item),
      }),
    [projectId, canRecordTransaction],
  );

  if (isLoading) return <ItemListSkeleton />;

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-3">
          <IconBox className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h3 className="text-sm font-semibold">Belum ada barang logistik</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tambahkan barang untuk mulai memantau stok di proyek ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Mobile Search ──────────────── */}
      <div className="relative flex-1 md:hidden">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cari barang..."
          className="pl-9 pr-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Mobile: Card View ─────────────────────── */}
      <div className="md:hidden space-y-2">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
            <IconSearch className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">Tidak ada hasil ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">
              Coba ubah kata kunci pencarian
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border bg-card p-3.5 transition-colors hover:bg-muted/30"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Satuan: {item.unit}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold leading-tight">
                    {item.currentStock}
                  </p>
                  <p className="text-[10px] text-muted-foreground">tersisa</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconTrendingUp className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600 font-medium dark:text-green-400">
                      {item.totalIn}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <IconTrendingDown className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-red-600 font-medium dark:text-red-400">
                      {item.totalOut}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {canRecordTransaction && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setTransactionDialog({
                            isOpen: true,
                            type: "IN",
                            item,
                          })
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-600 transition-all hover:bg-green-100 active:scale-95 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                        aria-label={`Tambah stok ${item.name}`}
                      >
                        <IconPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTransactionDialog({
                            isOpen: true,
                            type: "OUT",
                            item,
                          })
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-green-900 dark:bg-red-950 dark:text-red-400"
                        aria-label={`Kurangi stok ${item.name}`}
                      >
                        <IconMinus className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <ItemActions
                    projectId={projectId}
                    item={item}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: DataGrid View ───────────────────── */}
      <div className="hidden md:block">
        <DataGrid
          columns={columns}
          data={sortedItems as LogisticStockItem[]}
          filterColumn="name"
          filterPlaceholder="Cari nama barang..."
          initialColumnPinning={{
            left: ["name"],
            right: ["actions"],
          }}
          exportFilename="inventaris-logistik"
          csvColumns={[
            { header: "Nama Barang", accessor: (row) => row.name },
            { header: "Satuan", accessor: (row) => row.unit },
            { header: "Masuk", accessor: (row) => row.totalIn },
            { header: "Keluar", accessor: (row) => row.totalOut },
            { header: "Stok Tersisa", accessor: (row) => row.currentStock },
          ]}
          emptyMessage="Tidak ada barang logistik yang cocok dengan pencarian."
        />
      </div>

      <TransactionDialog
        projectId={projectId}
        isOpen={transactionDialog.isOpen}
        onOpenChange={(open: boolean) =>
          setTransactionDialog((prev) => ({ ...prev, isOpen: open }))
        }
        type={transactionDialog.type}
        item={transactionDialog.item}
        onSuccess={handleTransactionSuccess}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Barang"
        itemName={deleteTarget?.name}
        description={
          <>
            Apakah Anda yakin ingin menghapus{" "}
            <strong className="text-foreground">{deleteTarget?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua riwayat
            transaksi terkait.
          </>
        }
        onConfirm={handleDeleteItem}
        isPending={deleteItem.isPending}
      />
    </div>
  );
}
