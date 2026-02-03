"use client"

import { authClient } from "~/server/better-auth/client"

export function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      Sign in with Google
    </button>
  )
}
