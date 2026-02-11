"use client"

import {
  IconArrowUpRight,
  IconChartBar,
  IconChecklist,
  IconFolder,
} from "@tabler/icons-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { api } from "~/trpc/react"
import { StatCard } from "./stat-card"

export function CEOView() {
  const { data: stats, isLoading } = api.dashboard.getCEOStats.useQuery()

  if (isLoading) {
    return <div>Loading CEO dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects ?? 0}
          icon={IconFolder}
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects ?? 0}
          icon={IconChecklist}
        />
        <StatCard
          title="Overall Progress"
          value="75%"
          icon={IconChartBar}
          description="Average across active projects"
          trend={{ value: "+5%", label: "this month", positive: true }}
        />
        <StatCard
          title="Financial Health"
          value="Healthy"
          icon={IconArrowUpRight}
          description="Based on budget utilization"
          trend={{ value: "On Track", label: "", positive: true }}
        />
      </div>

      {/* Projects Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects Overview</CardTitle>
          <CardDescription>
            High-level status of all ongoing projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports (Total)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${
                        project.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : project.status === "DONE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </TableCell>
                  <TableCell>{project._count.dailyReports}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-primary hover:underline"
                    >
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
