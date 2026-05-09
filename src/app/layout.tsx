import "~/styles/globals.css";

import type { Metadata } from "next";
import {
  Geist,
  Inter,
  Playfair_Display,
  Space_Mono,
  Syne,
} from "next/font/google";
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

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${syne.variable} ${playfair.variable} ${spaceMono.variable}`}
    >
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
