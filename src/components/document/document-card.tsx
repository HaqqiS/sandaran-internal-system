"use client"

import {
  IconDownload,
  IconEdit,
  IconFile,
  IconFileTypePdf,
  IconFileTypeXls,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { useGetDownloadUrl } from "~/hooks/useDocument"
import type { ProjectDocument } from "../../../generated/prisma"

interface DocumentCardProps {
  document: ProjectDocument & {
    uploader: {
      name: string
      image: string | null
    }
  }
  currentUserId: string
  onEdit: (document: ProjectDocument) => void
  onDelete: (document: ProjectDocument) => void
}

export function DocumentCard({
  document,
  currentUserId,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const isOwner = document.userId === currentUserId
  const { mutateAsync: getDownloadUrl, isPending: isDownloading } =
    useGetDownloadUrl()

  // Determine icon based on mimeType or fileType
  const getFileIcon = () => {
    if (document.mimeType?.startsWith("image/")) {
      return <IconPhoto className="h-8 w-8 text-blue-500" />
    }
    if (document.mimeType === "application/pdf") {
      return <IconFileTypePdf className="h-8 w-8 text-red-500" />
    }
    if (
      document.mimeType?.includes("excel") ||
      document.mimeType?.includes("spreadsheet")
    ) {
      return <IconFileTypeXls className="h-8 w-8 text-green-500" />
    }
    return <IconFile className="h-8 w-8 text-gray-500" />
  }

  const handleDownload = async () => {
    try {
      const { url } = await getDownloadUrl({
        projectId: document.projectId,
        documentId: document.id,
      })
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("Failed to get download URL", error)
    }
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex-row gap-4 items-start space-y-0 pb-2">
        <div className="rounded-lg border p-2 bg-muted/20 w-fit">
          {getFileIcon()}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-base truncate"
              title={document.title || document.fileName}
            >
              {document.title || document.fileName}
            </CardTitle>
            {document.version && (
              <Badge variant="outline" className="ml-2 shrink-0">
                {document.version}
              </Badge>
            )}
          </div>

          <CardDescription
            className="truncate text-xs mt-1"
            title={document.fileName}
          >
            {document.fileName}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        {document.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {document.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={document.uploader.image || undefined} />
            <AvatarFallback>{document.uploader.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{document.uploader.name}</span>
          <span>•</span>
          <span>{format(new Date(document.createdAt), "dd MMM yyyy")}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t bg-muted/5 gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-8"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : (
            <IconDownload className="mr-2 h-3.5 w-3.5" />
          )}
          Download
        </Button>

        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() => onEdit(document)}
            >
              <IconEdit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(document)}
            >
              <IconTrash className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
