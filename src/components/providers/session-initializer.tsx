"use client"

import { useEffect } from "react"
import type { auth } from "~/server/better-auth"
import { useSessionStore } from "~/stores/use-session-store"

type Session = typeof auth.$Infer.Session

interface SessionInitializerProps {
  session: Session | null
}

/**
 * Client component that initializes Zustand session store
 * with data from server-side session
 *
 * This bridges the gap between server components (which fetch session)
 * and client components (which need session data)
 *
 * Usage in layout:
 * ```tsx
 * export default async function Layout({ children }) {
 *   const session = await requireAuth()
 *   return (
 *     <>
 *       <SessionInitializer session={session} />
 *       {children}
 *     </>
 *   )
 * }
 * ```
 */
export function SessionInitializer({ session }: SessionInitializerProps) {
  const setSession = useSessionStore((state) => state.setSession)

  useEffect(() => {
    setSession(session)
  }, [session, setSession])

  // This component doesn't render anything
  return null
}
