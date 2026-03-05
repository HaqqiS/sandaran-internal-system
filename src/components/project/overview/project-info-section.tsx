"use client";

import {
  IconCalendar,
  IconClipboardList,
  IconMapPin,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { ProjectStatus } from "generated/prisma";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface ProjectInfoSectionProps {
  project: {
    name: string;
    description: string | null;
    location: string | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
    status: ProjectStatus;
  };
}

export function ProjectInfoSection({ project }: ProjectInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <IconClipboardList className="h-4 w-4 text-foreground" />
          <CardTitle className="text-base font-semibold">
            Detail Proyek
          </CardTitle>
        </div>
        <Badge
          className="text-xs"
          variant={
            project.status === "ACTIVE"
              ? "default"
              : project.status === "DONE"
                ? "secondary"
                : "outline"
          }
        >
          {project.status === "ACTIVE"
            ? "Aktif"
            : project.status === "DONE"
              ? "Selesai"
              : "Dijeda"}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-y-4 gap-x-6 text-sm sm:grid-cols-2">
        {/* Location */}
        <div className="flex items-start gap-2">
          <IconMapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block">
              Lokasi
            </span>
            <p className="font-medium leading-none">
              {project.location || "-"}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-start gap-2">
          <IconCalendar className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block">
              Jangka Waktu
            </span>
            <p className="font-medium leading-none">
              {project.startDate
                ? format(new Date(project.startDate), "dd MMM yyyy", {
                    locale: id,
                  })
                : "-"}{" "}
              —{" "}
              {project.endDate
                ? format(new Date(project.endDate), "dd MMM yyyy", {
                    locale: id,
                  })
                : "Berlangsung"}
            </p>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="col-span-2 border-t pt-3 mt-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block mb-1.5">
              Deskripsi
            </span>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {project.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
