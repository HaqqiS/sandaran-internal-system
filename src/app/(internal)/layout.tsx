import type { ReactNode } from "react"
import { InternalLayoutClient } from "~/components/layout"
import { SessionInitializer } from "~/components/providers/session-initializer"
import { requireAuth } from "~/lib/server-auth"

interface InternalLayoutProps {
  children: ReactNode
}

/**
 * Protected layout for all internal pages
 *
 * This layout:
 * 1. Validates session using requireAuth() (redirects if unauthorized)
 * 2. Initializes client-side Zustand store with session data
 * 3. Provides shared DashboardLayout (sidebar, header) for all pages
 *
 * All pages under /dashboard, /projects, etc. inherit this protection and UI shell
 */
export default async function InternalLayout({
  children,
}: InternalLayoutProps) {
  // Validate session and redirect if unauthorized
  // This uses validateSessionAccess from auth-guards.ts
  const session = await requireAuth()

  return (
    <>
      {/* Initialize client store with server session */}
      <SessionInitializer session={session} />
      {/* Render shared layout (sidebar, header) + child pages */}
      <InternalLayoutClient>{children}</InternalLayoutClient>
    </>
  )
}
