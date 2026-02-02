import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/unauthorized", "/waiting-approval"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow static files and API routes (handled by tRPC)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Get session token from cookies (edge-compatible)
  const sessionToken = request.cookies.get("better-auth.session_token")

  // If no session token, redirect to login
  if (!sessionToken) {
    const redirectUrl = new URL("/", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // For admin routes, we'll do additional validation on the page itself
  // since we can't access database in edge middleware
  // The page will check the actual role from the session

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
