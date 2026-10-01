import "~/styles/globals.css";

import type { Metadata, Viewport } from "next";
import {
  Geist,
  Inter,
  Playfair_Display,
  Space_Mono,
  Syne,
} from "next/font/google";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Astaloka",
  description: "Astaloka Interior Design",
  icons: [{ rel: "icon", url: "/icon.webp" }],
};

// Required for env(safe-area-inset-*) to work correctly on iOS (notch / home indicator)
export const viewport: Viewport = {
  viewportFit: "cover",
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
      suppressHydrationWarning
      className={`${inter.variable} ${geist.variable} ${syne.variable} ${playfair.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <Toaster richColors position="top-center" duration={5000} />
            {children}
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
