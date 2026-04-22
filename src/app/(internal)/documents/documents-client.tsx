"use client";

import {
  IconDownload,
  IconFile,
  IconFolder,
  IconHistory,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageLayout } from "~/components/layout";
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
import { useDocumentsAnalytics, useGetDownloadUrl } from "~/hooks/useDocument";

export function DocumentsClient() {
  const { data: projects, isLoading } = useDocumentsAnalytics();
  const getDownloadUrl = useGetDownloadUrl();

  const handleDownload = async (projectId: string, documentId: string) => {
    toast.promise(getDownloadUrl.mutateAsync({ projectId, documentId }), {
      loading: "Menyiapkan unduhan...",
      success: (data) => {
        if (data.url) {
          window.open(data.url, "_blank");
        }
        return "Dokumen siap diunduh";
      },
      error: (err: unknown) => {
        return err instanceof Error ? err.message : "Gagal mengunduh dokumen";
      },
    });
  };

  if (isLoading) {
    return (
      <PageLayout title="Ringkasan Dokumen">
        <div className="flex h-[50vh] items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!projects?.length) {
    return (
      <PageLayout title="Ringkasan Dokumen">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-center">
          <IconFolder className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Belum Ada Proyek</h3>
          <p className="text-sm text-muted-foreground">
            Anda belum memiliki akses ke proyek aktif yang memiliki dokumen.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Ringkasan Dokumen">
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
              <CardDescription>Ringkasan Dokumen</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-4 text-sm">
                <span className="text-muted-foreground">Total Dokumen</span>
                <Badge variant="secondary" className="rounded-full">
                  {project.totalDocuments}
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dokumen Terbaru
                </p>
                {project.recentDocuments.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    <IconHistory className="h-4 w-4" />
                    Belum ada dokumen
                  </div>
                ) : (
                  project.recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center gap-3 rounded-md border p-2 text-sm transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10">
                        <IconFile className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {doc.title || doc.fileName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 shrink-0 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                        onClick={() => handleDownload(project.id, doc.id)}
                        disabled={getDownloadUrl.isPending}
                        title="Unduh Dokumen"
                      >
                        {getDownloadUrl.isPending &&
                        getDownloadUrl.variables?.documentId === doc.id ? (
                          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <IconDownload className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/projects/${project.slug}/documents`}>
                  Lihat Dokumen
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
