"use client";

import { IconBox, IconMinus, IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useLogisticStockSummary } from "~/hooks/useLogistic";
import { useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";
import { ItemActions } from "./item-actions";
import { TransactionDialog } from "./transaction-dialog";

interface ItemListProps {
  projectId: string;
}

export function ItemList({ projectId }: ItemListProps) {
  const { data: items, isLoading } = useLogisticStockSummary(projectId);
  const { data: members } = useProjectMembers(projectId);
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  // Transaction Dialog State
  const [transactionDialog, setTransactionDialog] = useState<{
    isOpen: boolean;
    type: "IN" | "OUT";
    item: { id: string; name: string; unit: string } | null;
  }>({
    isOpen: false,
    type: "OUT",
    item: null,
  });

  // Find user's role
  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;

  // MANDOR and FINANCE can record transactions
  const canRecordTransaction =
    role === "MANDOR" ||
    role === "FINANCE" ||
    session?.user?.roleGlobal === "ADMIN";

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTransactionSuccess = () => {
    setTransactionDialog((prev) => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Memuat barang...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <IconBox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Belum ada barang</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Belum ada barang logistik di proyek ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari barang..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Nama Barang</TableHead>
              <TableHead className="text-right">Masuk</TableHead>
              <TableHead className="text-right">Keluar</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Tidak ada hasil ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Satuan: {item.unit}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    +{item.totalIn}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -{item.totalOut}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {item.currentStock}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canRecordTransaction && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              setTransactionDialog({
                                isOpen: true,
                                type: "IN",
                                item,
                              })
                            }
                            title="Stock In"
                          >
                            <IconPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setTransactionDialog({
                                isOpen: true,
                                type: "OUT",
                                item,
                              })
                            }
                            title="Stock Out"
                          >
                            <IconMinus className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <ItemActions projectId={projectId} item={item} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
