"use client"

import {
  IconChevronRight,
  IconFile,
  IconFileText,
  IconLoader2,
} from "@tabler/icons-react"
import { format } from "date-fns"
import type { DocumentType } from "generated/prisma"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useDocumentsByProject } from "~/hooks/useDocument"

interface DocumentsSectionProps {
  projectId: string
  projectSlug: string
}

// Helper to get document type label
const getDocumentTypeLabel = (type: DocumentType) => {
  const labels: Record<DocumentType, string> = {
    DESIGN: "Design",
    DRAWING: "Drawing",
    SPECIFICATION: "Specification",
    REFERENCE: "Reference",
    OTHER: "Other",
  }
  return labels[type]
}

// Helper to get document type badge variant
const getDocumentTypeBadge = (type: DocumentType) => {
  const variants: Record<DocumentType, "default" | "secondary" | "outline"> = {
    DESIGN: "default",
    DRAWING: "secondary",
    SPECIFICATION: "outline",
    REFERENCE: "outline",
    OTHER: "outline",
  }
  return variants[type]
}

export function DocumentsSection({
  projectId,
  projectSlug,
}: DocumentsSectionProps) {
  const { data: allDocuments, isLoading } = useDocumentsByProject(projectId)

  // Group documents by type and get recent ones
  const documentsByType: Partial<Record<DocumentType, typeof allDocuments>> = {}

  if (allDocuments) {
    allDocuments.forEach((doc) => {
      if (!documentsByType[doc.fileType]) {
        documentsByType[doc.fileType] = []
      }
      documentsByType[doc.fileType]?.push(doc)
    })
  }

  const totalCount = allDocuments?.length ?? 0
  const typeCount = Object.keys(documentsByType).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle>Documents</CardTitle>
          <span className="text-sm text-muted-foreground">
            ({totalCount} files)
          </span>
        </div>
        <Link href={`/projects/${projectSlug}/documents`}>
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : totalCount > 0 ? (
          <div className="space-y-4">
            {/* Document Type Summary */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Object.entries(documentsByType).map(([type, docs]) => (
                <div key={type} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    {getDocumentTypeLabel(type as DocumentType)}
                  </p>
                  <p className="text-xl font-bold mt-1">{docs?.length ?? 0}</p>
                </div>
              ))}
            </div>

            {/* Recent Documents */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Uploads</p>
              <div className="space-y-2">
                {allDocuments?.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-md border p-3 text-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {doc.resourceType === "image" ? (
                        <IconFile className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <IconFileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {doc.title || doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={getDocumentTypeBadge(doc.fileType)}
                          className="text-xs"
                        >
                          {getDocumentTypeLabel(doc.fileType)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(doc.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconFileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
