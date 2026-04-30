import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SmoothScrollProvider } from "~/components/providers/smooth-scroll-provider";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Astaloka",
  description: "Astaloka Interior Design",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <SmoothScrollProvider>
            <Toaster richColors position="top-center" duration={5000} />
            {children}
          </SmoothScrollProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
