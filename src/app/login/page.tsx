import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "../../components/login/login-form";

export const metadata: Metadata = {
  title: "Masuk | Astaloka Internal System",
  description:
    "Masuk ke portal internal Sandaran / Astaloka Architecture & Interior",
};

export default function LoginPage() {
  return (
    <main className="relative flex h-svh max-h-svh w-full flex-col justify-between overflow-hidden bg-background p-4 sm:p-6 select-none">
      {/* Subtle Background Accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between">
        <Link
          href="/"
          className="group inline-flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          <IconArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Brand Mark */}
        <div className="flex items-center gap-2">
          <Image
            src="/icon.webp"
            alt="Astaloka Logo"
            width={28}
            height={28}
            className="size-7 rounded-md object-contain shadow-xs"
            priority
          />
          <span className="text-sm font-bold tracking-widest text-foreground">
            ASTALOKA
          </span>
        </div>
      </header>

      {/* Form Container (Tepat di tengah layar, tidak ada overflow) */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-2 min-h-0">
        <div className="w-full max-w-[390px]">
          <LoginForm />
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="relative z-10 shrink-0 text-center text-[11px] text-muted-foreground">
        &copy; {new Date().getFullYear()} PT Sandaran Astaloka Indonesia. Hak
        cipta dilindungi.
      </footer>
    </main>
  );
}
