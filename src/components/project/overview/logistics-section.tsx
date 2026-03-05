"use client";

import {
  IconBox,
  IconChevronRight,
  IconLoader2,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { TransactionDialog } from "~/components/logistic/transaction-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useLogisticStockSummary } from "~/hooks/useLogistic";
import { useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";

interface LogisticsSectionProps {
  projectId: string;
  projectSlug: string;
}

export function LogisticsSection({
  projectId,
  projectSlug,
}: LogisticsSectionProps) {
  const { data: items, isLoading } = useLogisticStockSummary(projectId);
  const { data: members } = useProjectMembers(projectId);
  const { session } = useSession();

  const [transactionDialog, setTransactionDialog] = useState<{
    isOpen: boolean;
    type: "IN" | "OUT";
    item: { id: string; name: string; unit: string } | null;
  }>({
    isOpen: false,
    type: "OUT",
    item: null,
  });

  const lowStockItems = items?.filter((item) => item.currentStock < 10) ?? [];
  const totalItems = items?.length ?? 0;

  // Find user's role
  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;
  const canRecordTransaction =
    role === "MANDOR" ||
    role === "FINANCE" ||
    session?.user?.roleGlobal === "ADMIN";

  const handleTransactionSuccess = () => {
    setTransactionDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <IconBox className="h-4 w-4 text-foreground" />
          <CardTitle className="text-base font-semibold">Logistik</CardTitle>
          <span className="text-sm text-muted-foreground">
            ({totalItems} barang)
          </span>
        </div>
        <Link href={`/projects/${projectSlug}/logistics`}>
          <Button variant="ghost" size="sm" className="gap-1">
            Lihat Semua
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-4">
            {/* Stock Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Total Barang</p>
                <p className="text-2xl font-bold mt-1">{totalItems}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Stok Rendah</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">
                  {lowStockItems.length}
                </p>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Stok Menipis</p>
                  <Badge variant="destructive" className="text-xs">
                    Perhatian!
                  </Badge>
                </div>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/50 p-3 text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Satuan: {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">
                          {item.currentStock}
                        </p>
                        <p className="text-xs text-muted-foreground">tersisa</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity - Top 3 items with recent changes */}
            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Ringkasan Stok</p>
                <div className="space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.unit}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-green-600">
                            <IconPlus className="h-3 w-3" />
                            <span>{item.totalIn}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <IconMinus className="h-3 w-3" />
                            <span>{item.totalOut}</span>
                          </div>
                          <div className="font-bold">= {item.currentStock}</div>
                        </div>

                        {canRecordTransaction && (
                          <div className="flex items-center gap-1 text-xs">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-green-600 hover:text-green-700"
                              onClick={() =>
                                setTransactionDialog({
                                  isOpen: true,
                                  type: "IN",
                                  item,
                                })
                              }
                            >
                              <IconPlus className="mr-1 h-3 w-3" />
                              Masuk
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-red-600 hover:text-red-700"
                              onClick={() =>
                                setTransactionDialog({
                                  isOpen: true,
                                  type: "OUT",
                                  item,
                                })
                              }
                            >
                              <IconMinus className="mr-1 h-3 w-3" />
                              Keluar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconBox className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada barang logistik
            </p>
          </div>
        )}
      </CardContent>

      <TransactionDialog
        projectId={projectId}
        isOpen={transactionDialog.isOpen}
        onOpenChange={(open) =>
          setTransactionDialog((prev) => ({ ...prev, isOpen: open }))
        }
        type={transactionDialog.type}
        item={transactionDialog.item}
        onSuccess={handleTransactionSuccess}
      />
    </Card>
  );
}
