import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { OAuthButtons } from "~/components/oauth-buttons"
import { Button } from "~/components/ui/button"
import { auth } from "~/server/better-auth"
import { getSession } from "~/server/better-auth/server"
import { HydrateClient } from "~/trpc/server"

export default async function Home() {
  const session = await getSession()

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Sandaran <span className="text-[hsl(280,100%,70%)]">Internal</span>{" "}
            System
          </h1>

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>

              {!session ? (
                <div className="flex flex-col gap-4">
                  <OAuthButtons />
                </div>
              ) : (
                <>
                  <form>
                    <Button
                      type="submit"
                      formAction={async () => {
                        "use server"
                        await auth.api.signOut({
                          headers: await headers(),
                        })
                        redirect("/")
                      }}
                    >
                      Sign out
                    </Button>
                  </form>
                  <Link href="/dashboard">
                    <Button>Dashboard</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  )
}
