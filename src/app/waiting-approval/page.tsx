import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "~/server/better-auth"

export default async function WaitingApprovalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If not logged in, redirect to home
  if (!session?.user) {
    redirect("/")
  }

  // If already approved and active, redirect to dashboard or home
  if (session.user.isActive && session.user.roleGlobal !== "NONE") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Waiting Approval</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Menunggu Persetujuan
          </h1>

          {/* User Info */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Akun Anda:</p>
            <p className="font-semibold text-gray-900">{session.user.email}</p>
          </div>

          {/* Message */}
          <div className="space-y-4 text-gray-600">
            <p>Akun Anda sedang menunggu persetujuan dari administrator.</p>
            <p>
              Silakan hubungi administrator untuk mengaktifkan akses Anda ke
              sistem internal.
            </p>
          </div>

          {/* Status Badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-600"></span>
            Status: Pending Approval
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <form>
              <button
                type="submit"
                formAction={async () => {
                  "use server"
                  await auth.api.signOut({
                    headers: await headers(),
                  })
                  redirect("/")
                }}
                className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Log out
              </button>
            </form>

            <Link
              href="/"
              className="block text-sm text-gray-600 hover:text-gray-900"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
