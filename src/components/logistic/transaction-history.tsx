"use client";

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconClipboardList,
  IconLoader2,
} from "@tabler/icons-react";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useLogisticTransactions } from "~/hooks/useLogistic";

interface TransactionHistoryProps {
  projectId: string;
  itemId: string;
}

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

export function TransactionHistory({
  projectId,
  itemId,
}: TransactionHistoryProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLogisticTransactions(projectId, itemId);

  const transactions = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Desktop skeleton */}
        <div className="hidden md:block rounded-xl border overflow-hidden">
          <div className="p-3 border-b bg-muted/30 flex gap-4">
            {([80, 60, 60, 100, 120] as const).map((w, i) => (
              <Skeleton
                key={`head-${i}-${w}`}
                className="h-3"
                style={{ width: w }}
              />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 border-b flex gap-4 items-center">
              {([80, 60, 60, 100, 120] as const).map((w, j) => (
                <Skeleton
                  key={`row-${i}-${j}-${w}`}
                  className="h-3"
                  style={{ width: w }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden">
          <TransactionSkeleton />
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <IconClipboardList className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <div>
          <p className="text-sm font-medium">Belum ada transaksi</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Riwayat masuk dan keluar barang akan muncul di sini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Mobile: Activity Feed ─────────────────────── */}
      <div className="md:hidden space-y-2">
        {transactions.map((tx) => {
          const isIn = tx.type === "IN";
          return (
            <div
              key={tx.id}
              className="flex items-start gap-3 rounded-xl border p-3 text-sm transition-colors"
            >
              {/* Direction icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isIn
                    ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                    : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                }`}
              >
                {isIn ? (
                  <IconArrowDownLeft className="h-4 w-4" />
                ) : (
                  <IconArrowUpRight className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-semibold ${isIn ? "text-green-600" : "text-red-600"}`}
                  >
                    {isIn ? "+" : "−"}
                    {tx.quantity} {tx.item.unit}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      isIn
                        ? "text-[10px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                        : "text-[10px] px-1.5 py-0 h-4 bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                    }
                  >
                    {isIn ? "Masuk" : "Keluar"}
                  </Badge>
                </div>
                {tx.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {tx.notes}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={tx.user.image || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {tx.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {tx.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">
                    ·
                  </span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">
                    {formatDistanceToNow(new Date(tx.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: Table ────────────────────────────── */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-medium">Tanggal</TableHead>
              <TableHead className="text-xs font-medium">Tipe</TableHead>
              <TableHead className="text-xs font-medium text-right">
                Jumlah
              </TableHead>
              <TableHead className="text-xs font-medium">
                Dicatat Oleh
              </TableHead>
              <TableHead className="text-xs font-medium">Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const isIn = tx.type === "IN";
              return (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        isIn
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                      }
                    >
                      {isIn ? (
                        <IconArrowDownLeft className="mr-1 h-3 w-3" />
                      ) : (
                        <IconArrowUpRight className="mr-1 h-3 w-3" />
                      )}
                      {isIn ? "Masuk" : "Keluar"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold text-sm ${isIn ? "text-green-600" : "text-red-600"}`}
                    >
                      {isIn ? "+" : "−"}
                      {tx.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {tx.item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={tx.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {tx.user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{tx.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                    <span className="line-clamp-1">{tx.notes || "—"}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="gap-2"
          >
            {isFetchingNextPage && (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {isFetchingNextPage ? "Memuat..." : "Muat Lebih Banyak"}
          </Button>
        </div>
      )}
    </div>
  );
}
