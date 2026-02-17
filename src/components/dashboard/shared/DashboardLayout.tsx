"use client";

import type { ReactNode } from "react";
import { PageLayout } from "~/components/layout/page-layout";

interface DashboardLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DashboardLayout({
  title,
  description,
  children,
}: DashboardLayoutProps) {
  return (
    <PageLayout title={title}>
      <div className="flex flex-col gap-6 p-6">
        {description && (
          <div className="-mt-2">
            <p className="text-muted-foreground">{description}</p>
          </div>
        )}

        <div className="space-y-8">{children}</div>
      </div>
    </PageLayout>
  );
}
