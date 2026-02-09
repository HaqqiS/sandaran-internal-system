"use client"

import { IconLoader2 } from "@tabler/icons-react"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useDocumentsByProject } from "~/hooks/useDocument"
import type { DocumentType, ProjectDocument } from "../../../generated/prisma"
import { DocumentCard } from "./document-card"

interface DocumentListProps {
  projectId: string
  currentUserId: string
  onEdit: (document: ProjectDocument) => void
  onDelete: (document: ProjectDocument) => void
}

export function DocumentList({
  projectId,
  currentUserId,
  onEdit,
  onDelete,
}: DocumentListProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL")
  const { data: documents, isLoading } = useDocumentsByProject(
    projectId,
    activeTab === "ALL" ? undefined : (activeTab as DocumentType),
  )

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasDocuments = documents && documents.length > 0

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ALL">All Files</TabsTrigger>
          <TabsTrigger value="DESIGN">Designs</TabsTrigger>
          <TabsTrigger value="DRAWING">Drawings</TabsTrigger>
          <TabsTrigger value="SPECIFICATION">Specs</TabsTrigger>
          <TabsTrigger value="REFERENCE">References</TabsTrigger>
          <TabsTrigger value="OTHER">Other</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {!hasDocuments ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground">
                No documents found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  currentUserId={currentUserId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
