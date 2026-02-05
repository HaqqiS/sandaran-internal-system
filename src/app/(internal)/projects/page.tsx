"use client"

import { IconPlus } from "@tabler/icons-react"
import { PageLayout } from "~/components/layout"
import { Button } from "~/components/ui/button"

/**
 * Projects Page
 *
 * Example showing how to customize layout:
 * - Custom title via PageLayout
 * - Custom actions (button) in header
 */
export default function ProjectsPage() {
  return (
    <PageLayout
      title="Projects"
      actions={
        <Button>
          <IconPlus className="mr-2 size-4" />
          New Project
        </Button>
      }
    >
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Manage your construction projects
          </p>
        </div>

        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Project list will go here...</p>
        </div>
      </div>
    </PageLayout>
  )
}
