"use client";

import type { DocumentType, ProjectDocument } from "@prisma/client";
import {
  IconDownload,
  IconEdit,
  IconFile,
  IconFileTypePdf,
  IconFileTypeXls,
  IconLoader2,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export type DocumentWithUploader = ProjectDocument & {
  uploader: {
    name: string;
    image: string | null;
  };
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentType, string> = {
  DESIGN: "Desain/Denah",
  DRAWING: "Gambar Teknis",
  SPECIFICATION: "Spesifikasi",
  REFERENCE: "Referensi",
  OTHER: "Lainnya",
};

export function getSmallFileIcon(mimeType: string | null) {
  if (mimeType?.startsWith("image/")) {
    return <IconPhoto className="size-4 shrink-0 text-blue-500" />;
  }
  if (mimeType === "application/pdf") {
    return <IconFileTypePdf className="size-4 shrink-0 text-red-500" />;
  }
  if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) {
    return <IconFileTypeXls className="size-4 shrink-0 text-emerald-600" />;
  }
  return <IconFile className="size-4 shrink-0 text-muted-foreground" />;
}

export interface DocumentColumnsProps {
  currentUserId: string;
  isAdmin?: boolean;
  downloadingId: string | null;
  onDownload: (doc: DocumentWithUploader) => void;
  onEdit: (doc: ProjectDocument) => void;
  onDelete: (doc: ProjectDocument) => void;
}

export function getDocumentColumns({
  currentUserId,
  isAdmin,
  downloadingId,
  onDownload,
  onEdit,
  onDelete,
}: DocumentColumnsProps): ColumnDef<DocumentWithUploader>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => `${row.title ?? ""} ${row.fileName}`,
      header: "Nama Dokumen",
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-2.5 max-w-[260px]">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/30">
              {getSmallFileIcon(doc.mimeType)}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-medium text-foreground"
                title={doc.title || doc.fileName}
              >
                {doc.title || doc.fileName}
              </p>
              <p
                className="truncate text-xs text-muted-foreground"
                title={doc.fileName}
              >
                {doc.fileName}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "fileType",
      header: "Kategori",
      cell: ({ row }) => {
        const cat = row.original.fileType;
        return (
          <Badge variant="secondary" className="text-xs font-normal">
            {DOCUMENT_CATEGORY_LABELS[cat] ?? cat}
          </Badge>
        );
      },
    },
    {
      accessorKey: "version",
      header: "Versi",
      cell: ({ row }) =>
        row.original.version ? (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.version}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      id: "uploader",
      accessorFn: (row) => row.uploader.name,
      header: "Diunggah Oleh",
      cell: ({ row }) => {
        const uploader = row.original.uploader;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={uploader.image || undefined} />
              <AvatarFallback className="text-[10px]">
                {uploader.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[130px]">{uploader.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {format(new Date(row.original.createdAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      enableHiding: false,
      cell: ({ row }) => {
        const doc = row.original;
        const canModify = doc.userId === currentUserId || !!isAdmin;
        const isThisDownloading = downloadingId === doc.id;

        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs"
              onClick={() => onDownload(doc)}
              disabled={isThisDownloading}
              title="Unduh Dokumen"
            >
              {isThisDownloading ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconDownload className="size-3.5" />
              )}
              <span className="hidden lg:inline">Unduh</span>
            </Button>
            {canModify && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onEdit(doc)}
                  title="Edit Dokumen"
                >
                  <IconEdit className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(doc)}
                  title="Hapus Dokumen"
                >
                  <IconTrash className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];
}
