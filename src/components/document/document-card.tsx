"use client";

import {
  IconDownload,
  IconEdit,
  IconFile,
  IconFileTypePdf,
  IconFileTypeXls,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useGetDownloadUrl } from "~/hooks/useDocument";
import type { ProjectDocument } from "../../../generated/prisma";

interface DocumentCardProps {
  document: ProjectDocument & {
    uploader: {
      name: string;
      image: string | null;
    };
  };
  currentUserId: string;
  onEdit: (document: ProjectDocument) => void;
  onDelete: (document: ProjectDocument) => void;
}

export function DocumentCard({
  document: doc,
  currentUserId,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const isOwner = doc.userId === currentUserId;
  const { mutateAsync: getDownloadUrl, isPending: isDownloading } =
    useGetDownloadUrl();

  // Determine icon based on mimeType or fileType
  const getFileIcon = () => {
    if (doc.mimeType?.startsWith("image/")) {
      return <IconPhoto className="h-8 w-8 text-blue-500" />;
    }
    if (doc.mimeType === "application/pdf") {
      return <IconFileTypePdf className="h-8 w-8 text-red-500" />;
    }
    if (
      doc.mimeType?.includes("excel") ||
      doc.mimeType?.includes("spreadsheet")
    ) {
      return <IconFileTypeXls className="h-8 w-8 text-green-500" />;
    }
    return <IconFile className="h-8 w-8 text-gray-500" />;
  };

  const handleDownload = async () => {
    try {
      const toastId = toast.loading("Downloading...");

      const { url } = await getDownloadUrl({
        projectId: doc.projectId,
        documentId: doc.id,
      });

      // Fetch blob to enforce filename
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = doc.fileName || "download"; // Force original filename
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.dismiss(toastId);
      toast.success("Download started");
    } catch (error) {
      console.error("Failed to download", error);
      toast.error("Failed to download file");
    }
  };

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
              title={doc.title || doc.fileName}
            >
              {doc.title || doc.fileName}
            </CardTitle>
            {doc.version && (
              <Badge variant="outline" className="ml-2 shrink-0">
                {doc.version}
              </Badge>
            )}
          </div>

          <CardDescription
            className="truncate text-xs mt-1"
            title={doc.fileName}
          >
            {doc.fileName}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        {doc.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {doc.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={doc.uploader.image || undefined} />
            <AvatarFallback>{doc.uploader.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{doc.uploader.name}</span>
          <span>•</span>
          <span>{format(new Date(doc.createdAt), "dd MMM yyyy")}</span>
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
              onClick={() => onEdit(doc)}
            >
              <IconEdit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(doc)}
            >
              <IconTrash className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
