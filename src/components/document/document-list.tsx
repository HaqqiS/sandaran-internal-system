"use client";

import type { DocumentType, ProjectDocument } from "@prisma/client";
import {
  IconFileText,
  IconLayoutGrid,
  IconList,
  IconLoader2,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataGrid, type DataGridCsvColumn } from "~/components/ui/data-grid";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useDocumentsByProject, useGetDownloadUrl } from "~/hooks/useDocument";
import { cn } from "~/lib/utils";
import { DocumentCard } from "./document-card";
import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentWithUploader,
  getDocumentColumns,
} from "./document-columns";

interface DocumentListProps {
  projectId: string;
  currentUserId: string;
  isAdmin?: boolean;
  onEdit: (document: ProjectDocument) => void;
  onDelete: (document: ProjectDocument) => void;
}

export function DocumentList({
  projectId,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
}: DocumentListProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: documents, isLoading } = useDocumentsByProject(
    projectId,
    activeTab === "ALL" ? undefined : (activeTab as DocumentType),
  );
  const { mutateAsync: getDownloadUrl } = useGetDownloadUrl();

  const hasDocuments = documents && documents.length > 0;

  const handleDownload = useCallback(
    async (doc: DocumentWithUploader) => {
      try {
        setDownloadingId(doc.id);
        const toastId = toast.loading("Mengunduh...");

        const { url } = await getDownloadUrl({
          projectId: doc.projectId,
          documentId: doc.id,
        });

        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = doc.fileName || "download";
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        toast.dismiss(toastId);
        toast.success("Unduhan dimulai");
      } catch (error) {
        console.error("Failed to download", error);
        toast.error("Gagal mengunduh file");
      } finally {
        setDownloadingId(null);
      }
    },
    [getDownloadUrl],
  );

  const csvColumns = useMemo<DataGridCsvColumn<DocumentWithUploader>[]>(
    () => [
      { header: "Judul Dokumen", accessor: (d) => d.title || d.fileName },
      { header: "Nama File", accessor: (d) => d.fileName },
      {
        header: "Kategori",
        accessor: (d) => DOCUMENT_CATEGORY_LABELS[d.fileType] ?? d.fileType,
      },
      { header: "Versi", accessor: (d) => d.version ?? "-" },
      { header: "Diunggah Oleh", accessor: (d) => d.uploader.name },
      {
        header: "Tanggal Unggah",
        accessor: (d) => format(new Date(d.createdAt), "yyyy-MM-dd HH:mm"),
      },
    ],
    [],
  );

  const columns = useMemo(
    () =>
      getDocumentColumns({
        currentUserId,
        isAdmin,
        downloadingId,
        onDownload: handleDownload,
        onEdit,
        onDelete,
      }),
    [currentUserId, downloadingId, handleDownload, isAdmin, onDelete, onEdit],
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 sm:w-auto">
            <TabsTrigger value="ALL" className="px-3 py-2 shrink-0">
              Semua File
            </TabsTrigger>
            <TabsTrigger value="DESIGN" className="px-3 py-2 shrink-0">
              Desain/Denah
            </TabsTrigger>
            <TabsTrigger value="DRAWING" className="px-3 py-2 shrink-0">
              Gambar Teknis
            </TabsTrigger>
            <TabsTrigger value="SPECIFICATION" className="px-3 py-2 shrink-0">
              Spesifikasi
            </TabsTrigger>
            <TabsTrigger value="REFERENCE" className="px-3 py-2 shrink-0">
              Referensi
            </TabsTrigger>
            <TabsTrigger value="OTHER" className="px-3 py-2 shrink-0">
              Lainnya
            </TabsTrigger>
          </TabsList>

          {/* Segmented View Switcher: Grid vs Table */}
          <fieldset
            aria-label="Mode tampilan dokumen"
            className="inline-flex items-center self-start sm:self-auto rounded-lg border border-border/70 bg-muted/50 p-0.5 shadow-2xs"
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <IconLayoutGrid className="size-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-pressed={viewMode === "table"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <IconList className="size-3.5" />
              <span>Tabel</span>
            </button>
          </fieldset>
        </div>

        <div className="mt-6 min-h-50">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !hasDocuments ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-muted/20">
              <IconFileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                Tidak ada dokumen ditemukan di kategori ini.
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Silakan pilih kategori lain atau tambahkan dokumen baru.
              </p>
            </div>
          ) : viewMode === "table" ? (
            <DataGrid
              columns={columns}
              data={documents as DocumentWithUploader[]}
              filterColumn="title"
              filterPlaceholder="Cari judul atau nama file dokumen..."
              initialColumnPinning={{
                left: ["title"],
                right: ["actions"],
              }}
              exportFilename="dokumen-proyek"
              csvColumns={csvColumns}
              emptyMessage="Tidak ada dokumen yang cocok dengan pencarian."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
