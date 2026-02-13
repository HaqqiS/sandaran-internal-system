"use client"

import { IconCalendar, IconCheckbox, IconMapPin } from "@tabler/icons-react"
import { format } from "date-fns"
import type { ProjectStatus } from "generated/prisma"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

interface ProjectInfoSectionProps {
  project: {
    name: string
    description: string | null
    location: string | null
    startDate: Date | string | null
    endDate: Date | string | null
    status: ProjectStatus
  }
}

export function ProjectInfoSection({ project }: ProjectInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCheckbox className="h-4 w-4" />
            <span>Status</span>
          </div>
          <Badge
            variant={
              project.status === "ACTIVE"
                ? "default"
                : project.status === "DONE"
                  ? "secondary"
                  : "outline"
            }
          >
            {project.status}
          </Badge>
        </div>

        {/* Location */}
        {project.location && (
          <div className="flex items-start gap-2">
            <IconMapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">
                {project.location}
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-start gap-2">
          <IconCalendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Timeline</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Start:</span>{" "}
                {project.startDate
                  ? format(new Date(project.startDate), "dd MMM yyyy")
                  : "-"}
              </div>
              <div>
                <span className="font-medium">End:</span>{" "}
                {project.endDate
                  ? format(new Date(project.endDate), "dd MMM yyyy")
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-1">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
