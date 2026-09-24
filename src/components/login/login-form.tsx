"use client";

import {
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconLock,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { authClient } from "~/server/better-auth/client";
import { type Country, DEFAULT_COUNTRY } from "../../app/login/_data/countries";
import { CountryPicker } from "./country-picker";
import { TermsPrivacyModal } from "./terms-privacy-modal";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<"terms" | "privacy">(
    "terms",
  );

  const openLegalModal = (tab: "terms" | "privacy") => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/login",
      });
    } catch {
      toast.error("Gagal menghubungkan ke Google. Silakan coba lagi.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (authMode === "email") {
      if (!email.trim()) {
        toast.error("Silakan masukkan alamat email");
        return;
      }
      if (!password) {
        toast.error("Silakan masukkan kata sandi");
        return;
      }

      setIsLoading(true);
      try {
        const res = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
          rememberMe,
          callbackURL: "/dashboard",
        });

        if (res.error) {
          toast.error(
            res.error.message || "Email atau kata sandi tidak valid.",
          );
          setIsLoading(false);
          return;
        }

        toast.success("Berhasil masuk! Mengalihkan ke dashboard...");
        window.location.href = "/dashboard";
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Terjadi kesalahan saat masuk";
        toast.error(errorMsg);
        setIsLoading(false);
      }
    } else {
      if (!phone.trim()) {
        toast.error("Silakan masukkan nomor telepon");
        return;
      }
      if (!password) {
        toast.error("Silakan masukkan kata sandi");
        return;
      }

      const cleanedPhone = phone.replace(/\D/g, "");
      const normalizedPhone = cleanedPhone.startsWith("0")
        ? cleanedPhone.slice(1)
        : cleanedPhone;
      const fullPhoneNumber = `${selectedCountry.dialCode}${normalizedPhone}`;

      setIsLoading(true);
      try {
        const res = await authClient.signIn.phoneNumber({
          phoneNumber: fullPhoneNumber,
          password,
          rememberMe,
        });

        if (res.error) {
          toast.error(
            res.error.message || "Nomor telepon atau kata sandi tidak valid.",
          );
          setIsLoading(false);
          return;
        }

        toast.success("Berhasil masuk! Mengalihkan ke dashboard...");
        window.location.href = "/dashboard";
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Terjadi kesalahan saat masuk";
        toast.error(errorMsg);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-3.5", className)} {...props}>
      <Card className="border-border/60 bg-card/95 shadow-xl backdrop-blur-sm rounded-2xl py-3 gap-0">
        <CardHeader className="space-y-1 text-center px-5 pt-1 pb-3">
          <CardTitle className="text-xl font-bold tracking-tight">
            Selamat Datang
          </CardTitle>
          <CardDescription className="text-xs">
            Masuk untuk mengakses sistem internal Sandaran
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3.5 px-5 pb-3">
          {/* Google Quick Sign-In */}
          <Button
            type="button"
            variant="outline"
            disabled={isGoogleLoading || isLoading}
            onClick={handleGoogleSignIn}
            className="border-input hover:bg-muted/60 relative h-10 w-full gap-2.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            {isGoogleLoading ? (
              <IconLoader2 size={16} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>Masuk dengan Google</span>
          </Button>

          {/* Divider */}
          <div className="relative text-center text-[10px] uppercase after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="bg-card text-muted-foreground relative z-10 px-2.5 tracking-wider">
              Atau masuk dengan
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Identifier Tabs (Email vs Phone) */}
            <div className="space-y-1.5">
              <Tabs
                value={authMode}
                onValueChange={(val) => setAuthMode(val as "email" | "phone")}
                className="w-full"
              >
                <TabsList className="bg-muted/80 grid h-8 w-full grid-cols-2 p-0.5">
                  <TabsTrigger
                    value="email"
                    className="flex h-7 items-center gap-1.5 text-xs font-medium"
                  >
                    <IconMail size={14} />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="phone"
                    className="flex h-7 items-center gap-1.5 text-xs font-medium"
                  >
                    <IconPhone size={14} />
                    <span>Nomor HP</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Email or Phone Input */}
            {authMode === "email" ? (
              <div className="space-y-1">
                <Label htmlFor="login-email" className="text-xs font-medium">
                  Alamat Email
                </Label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
                    <IconMail size={16} />
                  </div>
                  <Input
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nama@sandaran.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-lg pl-9 text-xs transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="login-phone" className="text-xs font-medium">
                  Nomor Handphone
                </Label>
                <div className="relative flex items-center">
                  <CountryPicker
                    selectedCountry={selectedCountry}
                    onSelectCountry={setSelectedCountry}
                    disabled={isLoading}
                  />
                  <Input
                    id="login-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="812-3456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      paddingLeft: `${selectedCountry.dialCode.length * 8 + 72}px`,
                    }}
                    className="h-10 rounded-lg text-xs transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1">
              <Label htmlFor="login-password" className="text-xs font-medium">
                Kata Sandi
              </Label>

              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
                  <IconLock size={16} />
                </div>
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 rounded-lg pl-9 pr-10 text-xs transition-colors"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-foreground text-muted-foreground absolute right-0 flex h-10 w-10 items-center justify-center transition-colors"
                >
                  {showPassword ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                className="size-3.5"
              />
              <Label
                htmlFor="remember-me"
                className="cursor-pointer text-[11px] font-normal text-muted-foreground"
              >
                Ingat saya di perangkat ini selama 7 hari
              </Label>
            </div>

            {/* Primary Submit */}
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full text-xs font-semibold transition-all active:scale-[0.98] mt-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </Button>
          </form>

          {/* Account Request / Contact Admin */}
          <div className="text-center text-[11px] text-muted-foreground pt-0.5">
            Belum memiliki akses?{" "}
            <span className="text-foreground font-medium">
              Hubungi Administrator
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Footer Legal Disclaimer Modal Trigger (Semua text adalah click zone) */}
      <button
        type="button"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.dataset.legal === "privacy") {
            openLegalModal("privacy");
          } else {
            openLegalModal("terms");
          }
        }}
        className="w-full text-balance px-2 text-center text-[10px] leading-relaxed text-muted-foreground cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-ring rounded py-0.5"
      >
        Dengan melanjutkan, Anda menyetujui{" "}
        <span
          data-legal="terms"
          className="font-medium text-foreground/85 underline underline-offset-4 transition-colors hover:text-primary"
        >
          Ketentuan Layanan
        </span>{" "}
        serta{" "}
        <span
          data-legal="privacy"
          className="font-medium text-foreground/85 underline underline-offset-4 transition-colors hover:text-primary"
        >
          Kebijakan Privasi
        </span>{" "}
        Sandaran.
      </button>

      {/* Terms & Privacy Policy Dialog Modal */}
      <TermsPrivacyModal
        open={legalModalOpen}
        onOpenChange={setLegalModalOpen}
        defaultTab={legalModalTab}
      />
    </div>
  );
}
