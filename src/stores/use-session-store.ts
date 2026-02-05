import { create } from "zustand"
import type { auth } from "~/server/better-auth"

type Session = typeof auth.$Infer.Session

interface SessionState {
  session: Session | null
  setSession: (session: Session | null) => void
}

/**
 * Zustand store for client-side session state
 *
 * Usage:
 * ```tsx
 * // Get full session
 * const session = useSessionStore((state) => state.session)
 *
 * // Get specific fields
 * const user = useSessionStore((state) => state.session?.user)
 * const role = useSessionStore((state) => state.session?.user?.roleGlobal)
 * ```
 */
export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}))

/**
 * Convenience hook to get session data
 *
 * Usage:
 * ```tsx
 * const { session, user, role, isActive } = useSession()
 * ```
 */
export function useSession() {
  const session = useSessionStore((state) => state.session)

  return {
    session,
    user: session?.user ?? null,
    role: (session?.user?.roleGlobal as string) ?? null,
    isActive: session?.user?.isActive ?? false,
  }
}
