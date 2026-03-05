"use client";

import { IconBox, IconHistory, IconLoader2 } from "@tabler/icons-react";
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
import { useLogisticsAnalytics } from "~/hooks";

export function LogisticsClient() {
  const { data: projects, isLoading } = useLogisticsAnalytics();

  if (isLoading) {
    return (
      <PageLayout title="Ringkasan Logistik">
        <div className="flex h-[50vh] items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!projects?.length) {
    return (
      <PageLayout title="Ringkasan Logistik">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-center">
          <IconBox className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Belum Ada Proyek</h3>
          <p className="text-sm text-muted-foreground">
            Anda belum memiliki akses ke proyek aktif yang memiliki data
            logistik.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Ringkasan Logistik">
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
              <CardDescription>Ringkasan Logistik</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <IconBox className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Barang
                  </p>
                  <p className="text-2xl font-bold">{project.totalItems}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <IconHistory className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Aktivitas Terbaru (30h)
                  </p>
                  <p className="text-2xl font-bold">
                    {project.recentActivityCount}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/projects/${project.slug}/logistics`}>
                  Lihat Detail
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
