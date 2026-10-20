"use client";

import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { ItemActions } from "./item-actions";

export interface LogisticStockItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  totalIn: number;
  totalOut: number;
}

export interface LogisticColumnsProps {
  projectId: string;
  canRecordTransaction: boolean;
  onOpenTransaction: (item: LogisticStockItem, type: "IN" | "OUT") => void;
  onDelete: (item: LogisticStockItem) => void;
}

export function getLogisticColumns({
  projectId,
  canRecordTransaction,
  onOpenTransaction,
  onDelete,
}: LogisticColumnsProps): ColumnDef<LogisticStockItem>[] {
  return [
    {
      accessorKey: "name",
      header: "Nama Barang",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="font-medium text-sm">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              Satuan: {item.unit}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalIn",
      header: "Masuk",
      cell: ({ row }) => (
        <span className="text-sm text-green-600 font-medium tabular-nums dark:text-green-400">
          +{row.original.totalIn}
        </span>
      ),
    },
    {
      accessorKey: "totalOut",
      header: "Keluar",
      cell: ({ row }) => (
        <span className="text-sm text-red-600 font-medium tabular-nums dark:text-red-400">
          −{row.original.totalOut}
        </span>
      ),
    },
    {
      accessorKey: "currentStock",
      header: "Stok",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="text-sm font-bold tabular-nums">
            {item.currentStock}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            {canRecordTransaction && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={() => onOpenTransaction(item, "IN")}
                  aria-label={`Tambah stok ${item.name}`}
                >
                  <IconPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => onOpenTransaction(item, "OUT")}
                  aria-label={`Kurangi stok ${item.name}`}
                >
                  <IconMinus className="h-4 w-4" />
                </Button>
              </>
            )}
            <ItemActions
              projectId={projectId}
              item={item}
              onDelete={() => onDelete(item)}
            />
          </div>
        );
      },
    },
  ];
}
