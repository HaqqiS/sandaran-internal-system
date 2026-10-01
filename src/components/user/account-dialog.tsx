"use client";

import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconLoader2,
  IconLock,
  IconMail,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  COUNTRIES,
  type Country,
  DEFAULT_COUNTRY,
} from "~/app/login/_data/countries";
import { CountryPicker } from "~/components/login/country-picker";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useCurrentUser, useUpdateProfile } from "~/hooks";
import { useIsMobile } from "~/hooks/use-mobile";
import { RoleBadge } from "./role-badge";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parsePhoneNumber(rawPhone?: string | null): {
  country: Country;
  digits: string;
} {
  if (!rawPhone) return { country: DEFAULT_COUNTRY, digits: "" };
  const clean = rawPhone.trim();
  const matched = [...COUNTRIES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => clean.startsWith(c.dialCode));

  if (matched) {
    return { country: matched, digits: clean.slice(matched.dialCode.length) };
  }
  return { country: DEFAULT_COUNTRY, digits: clean.replace(/\D/g, "") };
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const isMobile = useIsMobile();
  const { data: currentUser, isLoading } = useCurrentUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);

  // Password change state
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.name || "");
      const isInternalFallback =
        currentUser.email.endsWith("@sandaran.internal");
      setEmail(isInternalFallback ? "" : currentUser.email);

      const parsed = parsePhoneNumber(currentUser.phoneNumber);
      setSelectedCountry(parsed.country);
      setPhone(parsed.digits);

      setChangePassword(false);
      setNewPassword("");
      setShowPassword(false);
    }
  }, [currentUser, open]);

  const updateProfile = useUpdateProfile({
    onSuccess: () => {
      if (changePassword && newPassword.trim() && navigator.clipboard) {
        void navigator.clipboard.writeText(newPassword);
        toast.success("Profil dan kata sandi berhasil diperbarui!", {
          description: "Kata sandi baru telah disalin ke clipboard Anda.",
        });
      } else {
        toast.success("Profil akun berhasil diperbarui!");
      }
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui profil akun");
    },
  });

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(gen);
    toast.info(`Kata sandi acak dibuat: ${gen}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama lengkap tidak boleh kosong");
      return;
    }

    if (!email.trim() && !phone.trim() && !currentUser?.phoneNumber) {
      toast.error("Minimal harus memiliki alamat Email atau Nomor WhatsApp/HP");
      return;
    }

    if (changePassword) {
      if (!newPassword.trim()) {
        toast.error("Silakan masukkan kata sandi baru");
        return;
      }
      if (newPassword.trim().length < 6) {
        toast.error("Kata sandi minimal 6 karakter");
        return;
      }
    }

    const formattedPhone = phone.trim()
      ? `${selectedCountry.dialCode}${phone.replace(/\D/g, "").replace(/^0+/, "")}`
      : "";

    updateProfile.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      phoneNumber: formattedPhone || undefined,
      password: changePassword ? newPassword.trim() : undefined,
    });
  };

  const initials =
    name.trim().substring(0, 2).toUpperCase() ||
    currentUser?.name?.substring(0, 2).toUpperCase() ||
    "US";

  const formContent = (
    <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
      {/* User Identity & Role Card */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border shadow-xs">
            <AvatarImage src={currentUser?.image || undefined} alt={name} />
            <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid text-left text-xs leading-tight">
            <span className="font-semibold text-foreground truncate">
              {currentUser?.name}
            </span>
            <span className="text-muted-foreground truncate">
              {currentUser?.email.endsWith("@sandaran.internal")
                ? "(Akun Login via No. HP)"
                : currentUser?.email}
            </span>
          </div>
        </div>

        {/* Role Read-Only Badge */}
        <div className="flex flex-col items-end gap-1">
          {currentUser?.roleGlobal && (
            <RoleBadge role={currentUser.roleGlobal} />
          )}
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <IconShield className="h-3 w-3" />
            Peran Akun
          </span>
        </div>
      </div>

      {/* Nama Lengkap */}
      <div className="space-y-1.5">
        <Label htmlFor="account-name" className="text-xs font-semibold">
          Nama Lengkap <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <IconUser className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="account-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Lengkap"
            className="pl-9 h-10 text-sm"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="account-email" className="text-xs font-semibold">
          Alamat Email
        </Label>
        <div className="relative">
          <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="account-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@sandaran.com"
            className="pl-9 h-10 text-sm"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Digunakan untuk login dan notifikasi email resmi.
        </p>
      </div>

      {/* Nomor HP dengan CountryPicker */}
      <div className="space-y-1.5">
        <Label htmlFor="account-phone" className="text-xs font-semibold">
          Nomor WhatsApp / HP
        </Label>
        <div className="relative flex items-center">
          <CountryPicker
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            disabled={updateProfile.isPending}
          />
          <Input
            id="account-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="812-3456-7890"
            style={{
              paddingLeft: `${selectedCountry.dialCode.length * 8 + 72}px`,
            }}
            className="h-10 text-sm"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Format: 812... atau 0812... (Kode {selectedCountry.name}{" "}
          {selectedCountry.dialCode})
        </p>
      </div>

      {/* Ganti Kata Sandi Toggle */}
      <div className="rounded-xl border p-3.5 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="account-change-pwd"
              checked={changePassword}
              onCheckedChange={(checked) => setChangePassword(Boolean(checked))}
            />
            <Label
              htmlFor="account-change-pwd"
              className="text-xs font-medium cursor-pointer flex items-center gap-1.5"
            >
              <IconKey className="h-3.5 w-3.5 text-muted-foreground" />
              Ubah Kata Sandi
            </Label>
          </div>

          {changePassword && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeneratePassword}
              className="h-7 text-xs px-2"
            >
              Buat Acak
            </Button>
          )}
        </div>

        {changePassword && (
          <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <Label
              htmlFor="account-new-password"
              className="text-xs font-semibold"
            >
              Kata Sandi Baru
            </Label>
            <div className="relative">
              <IconLock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="account-new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru (min 6 karakter)"
                className="pl-9 pr-9 h-10 text-sm font-mono"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <IconEyeOff className="h-4 w-4" />
                ) : (
                  <IconEye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gunakan minimal 6 karakter kombinasi huruf dan angka.
            </p>
          </div>
        )}
      </div>
    </form>
  );

  const footerButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={updateProfile.isPending}
        className="text-xs min-h-11 sm:min-h-10 px-4"
      >
        Batal
      </Button>
      <Button
        type="submit"
        form="account-form"
        disabled={updateProfile.isPending || isLoading}
        className="text-xs font-semibold min-h-11 sm:min-h-10 px-4"
      >
        {updateProfile.isPending ? (
          <>
            <IconLoader2 className="mr-1.5 size-4 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>Simpan Perubahan</span>
        )}
      </Button>
    </>
  );

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto"
          data-lenis-prevent
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconUser className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Pengaturan Akun
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Kelola informasi pribadi dan keamanan akun Anda.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            formContent
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            {footerButtons}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col max-h-[90dvh] rounded-t-2xl">
        <DrawerHeader className="text-left shrink-0 border-b pb-3 px-6 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconUser className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle className="text-base font-semibold">
                Pengaturan Akun
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                Kelola informasi pribadi dan keamanan akun Anda.
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div
            className="flex-1 min-h-0 overflow-y-auto px-6 py-4 scroll-pb-24"
            data-vaul-no-drag
            data-lenis-prevent
          >
            {formContent}
          </div>
        )}

        <DrawerFooter className="shrink-0 border-t mt-0 px-6 py-3 flex flex-row justify-end gap-2 bg-background pb-safe">
          {footerButtons}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
