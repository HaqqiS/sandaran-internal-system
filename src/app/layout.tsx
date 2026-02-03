import "~/styles/globals.css"

import type { Metadata } from "next"
import { Geist, Inter } from "next/font/google"

import { TRPCReactProvider } from "~/trpc/react"

export const metadata: Metadata = {
  title: "Sandaran Home Living",
  description: "Sandaran Home Living Interior Design",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
