"use client"

import { ChartAreaInteractive, SectionCards } from "~/components/dashboard"
import { PageLayout } from "~/components/layout"

/**
 * Dashboard Page
 *
 * Uses PageLayout to set title.
 * Authentication and layout handled by (internal)/layout.tsx
 */
export default function DashboardPage() {
  return (
    <PageLayout title="Dashboard">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      </div>
    </PageLayout>
  )
}
