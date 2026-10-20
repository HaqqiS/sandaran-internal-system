"use client";

import type { EmergencyTransaction } from "@prisma/client";
import {
  IconArrowBackUp,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconZoomIn,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type EmergencyTransactionWithRelations = EmergencyTransaction & {
  requester?: { id: string; name: string; image: string | null } | null;
  verifier?: { id: string; name: string; image: string | null } | null;
};

export interface EmergencyColumnsProps {
  canReview: boolean;
  canEditDelete: (row: EmergencyTransactionWithRelations) => boolean;
  onVerify: (target: { id: string; mode: "review" | "undo" }) => void;
  onEdit: (row: EmergencyTransactionWithRelations) => void;
  onDelete: (target: { id: string; description: string }) => void;
  onPreviewImage: (url: string) => void;
}

export function getEmergencyTransactionColumns({
  canReview,
  canEditDelete,
  onVerify,
  onEdit,
  onDelete,
  onPreviewImage,
}: EmergencyColumnsProps): ColumnDef<EmergencyTransactionWithRelations>[] {
  return [
    {
      accessorKey: "description",
      header: "Keterangan",
      cell: ({ row }) => (
        <div
          className="max-w-[260px] truncate font-medium"
          title={row.getValue("description")}
        >
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PP p"),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant={type === "DEPOSIT" ? "default" : "secondary"}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Jumlah",
      cell: ({ row }) => {
        const amount = Number(row.getValue("amount"));
        const type = row.getValue("type") as string;
        const color = type === "DEPOSIT" ? "text-green-600" : "text-red-600";
        return (
          <div className={`font-medium tabular-nums ${color}`}>
            {type === "DEPOSIT" ? "+" : "-"}
            Rp {amount.toLocaleString("id-ID")}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "REVIEWED" ? "outline" : "destructive"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "publicId",
      header: "Bukti",
      cell: ({ row }) => {
        const proofUrl = row.original.url;
        if (!proofUrl) return <span className="text-muted-foreground">-</span>;
        return (
          <button
            type="button"
            className="group relative h-10 w-10 overflow-hidden rounded border bg-muted flex items-center justify-center cursor-pointer"
            onClick={() => onPreviewImage(proofUrl)}
          >
            {/* biome-ignore lint: using img for Cloudinary external URLs */}
            <img
              src={proofUrl}
              alt="Proof"
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <IconZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      enableHiding: false,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const showReview = canReview && status === "UNREVIEWED";
        const showUndoReview = canReview && status === "REVIEWED";
        const showEditDelete = canEditDelete(row.original);

        if (!showReview && !showUndoReview && !showEditDelete) return null;

        return (
          <div className="flex items-center justify-center gap-1">
            {showReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onVerify({ id: row.original.id, mode: "review" })
                }
              >
                Tinjau
              </Button>
            )}
            {(showEditDelete || showUndoReview) && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Aksi lainnya"
                  >
                    <IconDotsVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {showUndoReview && (
                    <DropdownMenuItem
                      onClick={() =>
                        onVerify({ id: row.original.id, mode: "undo" })
                      }
                    >
                      <IconArrowBackUp className="mr-2 h-4 w-4" />
                      Batalkan Tinjauan
                    </DropdownMenuItem>
                  )}
                  {showEditDelete && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(row.original)}>
                        <IconEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          onDelete({
                            id: row.original.id,
                            description: row.original.description,
                          })
                        }
                      >
                        <IconTrash className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];
}
