"use client";

import { type ReactNode, useEffect } from "react";
import { useLayout } from "~/components/providers/layout-provider";

interface PageLayoutProps {
  title: string;
  actions?: ReactNode;
  navActions?: ReactNode;
  children: ReactNode;
}

/**
 * Page Layout Helper Component
 *
 * Simplifies setting page title and actions.
 *
 * Usage:
 * ```tsx
 * "use client"
 * import { PageLayout } from "~/components/layout/page-layout"
 *
 * export default function MyPage() {
 *   return (
 *     <PageLayout
 *       title="My Page"
 *       actions={<Button>Title Action</Button>}
 *       navActions={<Button>Nav Action</Button>}
 *     >
 *       <div>Page content</div>
 *     </PageLayout>
 *   )
 * }
 * ```
 */
import { PageHeader } from "~/components/layout/page-header";

export function PageLayout({
  title,
  actions,
  navActions,
  children,
}: PageLayoutProps) {
  const { updateConfig } = useLayout();

  useEffect(() => {
    updateConfig({
      headerActions: navActions,
    });
  }, [navActions, updateConfig]);

  return (
    <>
      <PageHeader title={title} actions={actions} />
      {children}
    </>
  );
}
