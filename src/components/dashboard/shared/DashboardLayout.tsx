"use client";

import type { ReactNode } from "react";
import { PageLayout } from "~/components/layout/page-layout";
import { cn } from "~/lib/utils";

interface DashboardLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  navActions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({
  title,
  description,
  actions,
  navActions,
  children,
  className,
}: DashboardLayoutProps) {
  return (
    <PageLayout title={title} actions={actions} navActions={navActions}>
      <div className={cn("flex flex-col gap-6 p-4 md:p-6", className)}>
        {description && (
          <div className="-mt-2">
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}

        {children}
      </div>
    </PageLayout>
  );
}
