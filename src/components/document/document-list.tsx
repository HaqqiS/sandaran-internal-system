"use client";

import type { DocumentType, ProjectDocument } from "@prisma/client";
import { IconFileText, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useDocumentsByProject } from "~/hooks/useDocument";
import { DocumentCard } from "./document-card";

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
  const { data: documents, isLoading } = useDocumentsByProject(
    projectId,
    activeTab === "ALL" ? undefined : (activeTab as DocumentType),
  );

  const hasDocuments = documents && documents.length > 0;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50">
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
