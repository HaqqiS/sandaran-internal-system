import { redirect } from "next/navigation"
import { validateSessionAccess } from "~/lib/auth-guards"
import { getSession } from "~/server/better-auth/server"

/**
 * Server-side page protection helper
 * Use this in page.tsx to validate session and redirect if needed
 */
export async function requireAuth() {
  const session = await getSession()
  const validation = validateSessionAccess(session)

  if (!validation.isValid) {
    redirect(validation.redirectTo ?? "/")
  }

  return session
}

/**
 * Require admin access
 * Use this in admin pages
 */
export async function requireAdmin() {
  const session = await requireAuth()

  const role = session?.user?.roleGlobal
  if (role !== "ADMIN" && role !== "CEO") {
    redirect("/unauthorized")
  }

  return session
}
