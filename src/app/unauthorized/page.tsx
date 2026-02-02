import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "~/server/better-auth"

export default async function UnauthorizedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If not logged in, redirect to home
  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Unauthorized Access</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Akses Ditolak
          </h1>

          {/* User Info */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Akun Anda:</p>
            <p className="font-semibold text-gray-900">{session.user.email}</p>
          </div>

          {/* Message */}
          <div className="space-y-4 text-gray-600">
            <p className="font-semibold text-red-600">
              Anda tidak memiliki izin untuk mengakses sistem internal ini.
            </p>
            <p>
              Sistem ini hanya dapat diakses oleh pengguna yang telah disetujui
              oleh administrator.
            </p>
            <p className="text-sm">
              Jika Anda merasa ini adalah kesalahan, silakan hubungi
              administrator untuk mendapatkan akses.
            </p>
          </div>

          {/* Status Badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <title>Unauthorized Access</title>
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Unauthorized Access
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
