"use client";

import {
  IconFile,
  IconFolder,
  IconHistory,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import { PageLayout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useDocumentsAnalytics } from "~/hooks/useDocument";

export function DocumentsClient() {
  const { data: projects, isLoading } = useDocumentsAnalytics();

  if (isLoading) {
    return (
      <PageLayout title="Documents Overview">
        <div className="flex h-[50vh] items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!projects?.length) {
    return (
      <PageLayout title="Documents Overview">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-center">
          <IconFolder className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No Projects Found</h3>
          <p className="text-sm text-muted-foreground">
            You don't have access to any active projects with documents.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Documents Overview">
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
              <CardDescription>Documents Overview</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <IconFile className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Documents
                  </p>
                  <p className="text-2xl font-bold">{project.totalDocuments}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <IconHistory className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recent Uploads (30d)
                  </p>
                  <p className="text-2xl font-bold">
                    {project.recentUploadsCount}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/projects/${project.slug}/documents`}>
                  View Documents
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
