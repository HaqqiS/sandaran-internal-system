"use client"

import { IconCloudUpload, IconFileText } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { api } from "~/trpc/react"
import { StatCard } from "./stat-card"

export function ArchitectView() {
  const { data: stats, isLoading } = api.dashboard.getArchitectStats.useQuery()

  if (isLoading) {
    return <div>Loading Architect dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Projects"
          value={stats?.projectCount ?? 0}
          icon={IconFileText}
          description="Projects needing design docs"
        />
        <StatCard
          title="Uploaded Documents"
          value={stats?.uploadedDocuments ?? 0} // Placeholder
          icon={IconCloudUpload}
          trend={{ value: "+2", label: "this week", positive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Upload design documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/documents/upload">
                <IconCloudUpload className="mr-2 h-4 w-4" />
                Upload New Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
