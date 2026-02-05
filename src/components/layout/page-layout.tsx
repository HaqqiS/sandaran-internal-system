"use client"

import { type ReactNode, useEffect } from "react"
import { useLayout } from "~/components/providers/layout-provider"

interface PageLayoutProps {
  title: string
  actions?: ReactNode
  children: ReactNode
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
 *     <PageLayout title="My Page" actions={<Button>Action</Button>}>
 *       <div>Page content</div>
 *     </PageLayout>
 *   )
 * }
 * ```
 */
export function PageLayout({ title, actions, children }: PageLayoutProps) {
  const { updateConfig } = useLayout()

  useEffect(() => {
    updateConfig({
      headerTitle: title,
      headerActions: actions,
    })
  }, [title, actions, updateConfig])

  return <>{children}</>
}
