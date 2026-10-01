"use client";

import type { GlobalRole } from "@prisma/client";
import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconLoader2,
  IconLock,
  IconMail,
  IconUser,
  IconUserCheck,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  COUNTRIES,
  type Country,
  DEFAULT_COUNTRY,
} from "~/app/login/_data/countries";
import { CountryPicker } from "~/components/login/country-picker";
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useUpdateUser } from "~/hooks";
import { useIsMobile } from "~/hooks/use-mobile";
import type { UserListItem } from "./user-columns";

interface EditUserDialogProps {
  user: UserListItem | null;
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

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [role, setRole] = useState<GlobalRole>("USER");
  const [isActive, setIsActive] = useState(true);

  // Password reset state
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      // If email is fallback (@sandaran.internal), display as empty for cleaner editing
      const isInternalFallback = user.email.endsWith("@sandaran.internal");
      setEmail(isInternalFallback ? "" : user.email);

      const parsed = parsePhoneNumber(user.phoneNumber);
      setSelectedCountry(parsed.country);
      setPhone(parsed.digits);

      setRole(user.roleGlobal);
      setIsActive(user.isActive);

      setChangePassword(false);
      setNewPassword("");
      setShowPassword(false);
    }
  }, [user, open]);

  const updateUser = useUpdateUser({
    onSuccess: () => {
      const formattedPhone = phone.trim()
        ? `${selectedCountry.dialCode}${phone.replace(/\D/g, "").replace(/^0+/, "")}`
        : "";
      const displayIdentifier =
        formattedPhone || email.trim() || user?.email || "";

      if (changePassword && newPassword.trim() && navigator.clipboard) {
        const summaryText = `Pembaruan Akun Sandaran Internal:
Nama: ${name.trim()}
Login: ${displayIdentifier}
Kata Sandi Baru: ${newPassword}
Peran: ${role}
Status: ${isActive ? "Aktif" : "Nonaktif"}
Tautan: ${typeof window !== "undefined" ? window.location.origin : ""}/login`;

        void navigator.clipboard.writeText(summaryText);
        toast.success(`Data ${name} berhasil diperbarui!`, {
          description:
            "Kredensial baru telah disalin ke clipboard untuk dikirimkan via chat.",
        });
      } else {
        toast.success(`Data ${name} berhasil diperbarui!`);
      }

      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui data pengguna");
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
    if (!user) return;

    if (!name.trim()) {
      toast.error("Silakan masukkan nama lengkap");
      return;
    }

    if (!email.trim() && !phone.trim() && !user.phoneNumber) {
      toast.error("Harap isi setidaknya salah satu dari Email atau Nomor HP");
      return;
    }

    if (changePassword && (!newPassword || newPassword.length < 6)) {
      toast.error("Kata sandi baru minimal 6 karakter");
      return;
    }

    let formattedPhone: string | undefined;
    if (phone.trim()) {
      const cleaned = phone.replace(/\D/g, "");
      const normalized = cleaned.startsWith("0") ? cleaned.slice(1) : cleaned;
      formattedPhone = `${selectedCountry.dialCode}${normalized}`;
    }

    updateUser.mutate({
      userId: user.id,
      name: name.trim(),
      email: email.trim().toLowerCase() || undefined,
      phoneNumber: formattedPhone,
      password: changePassword && newPassword.trim() ? newPassword : undefined,
      roleGlobal: role,
      isActive,
    });
  };

  if (!user) return null;

  const formContent = (
    <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Lengkap */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-name" className="text-xs font-semibold">
          Nama Lengkap <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap"
            className="pl-9 h-10 text-sm"
            required
          />
        </div>
      </div>

      {/* Nomor HP dengan CountryPicker */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-phone" className="text-xs font-semibold">
          Nomor WhatsApp / HP
        </Label>
        <div className="relative flex items-center">
          <CountryPicker
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            disabled={updateUser.isPending}
          />
          <Input
            id="edit-phone"
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
        <p className="text-[10px] text-muted-foreground">
          Format: 812... atau 0812... (Kode {selectedCountry.name}{" "}
          {selectedCountry.dialCode})
        </p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-email" className="text-xs font-semibold">
          Alamat Email
        </Label>
        <div className="relative">
          <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staf@sandaran.com"
            className="pl-9 h-10 text-sm"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Opsional jika pengguna masuk menggunakan Nomor HP
        </p>
      </div>

      {/* Role Global */}
      <div className="space-y-2 pt-1">
        <Label className="text-xs font-semibold">
          Peran Sistem (Global Role)
        </Label>
        <RadioGroup
          value={role}
          onValueChange={(val) => setRole(val as GlobalRole)}
          className="grid grid-cols-4 gap-2"
        >
          <div>
            <RadioGroupItem
              value="USER"
              id="edit-role-user"
              className="peer sr-only"
            />
            <Label
              htmlFor="edit-role-user"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
            >
              <span className="font-semibold">USER</span>
              <span className="text-[9px] text-muted-foreground">Staf</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="ADMIN"
              id="edit-role-admin"
              className="peer sr-only"
            />
            <Label
              htmlFor="edit-role-admin"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
            >
              <span className="font-semibold">ADMIN</span>
              <span className="text-[9px] text-muted-foreground">Kelola</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="CEO"
              id="edit-role-ceo"
              className="peer sr-only"
            />
            <Label
              htmlFor="edit-role-ceo"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
            >
              <span className="font-semibold">CEO</span>
              <span className="text-[9px] text-muted-foreground">View</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="NONE"
              id="edit-role-none"
              className="peer sr-only"
            />
            <Label
              htmlFor="edit-role-none"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 cursor-pointer text-xs font-medium text-center transition-all"
            >
              <span className="font-semibold text-destructive">NONE</span>
              <span className="text-[9px] text-muted-foreground">Blokir</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Status Akun (Aktif / Nonaktif) */}
      <Label
        htmlFor="edit-is-active"
        className="flex items-center justify-between rounded-lg border p-3 bg-muted/20 cursor-pointer transition-colors hover:bg-muted/40 active:bg-muted/60 select-none"
      >
        <div className="space-y-0.5">
          <span className="text-xs font-semibold block">Status Akun Aktif</span>
          <p className="text-[11px] text-muted-foreground font-normal">
            {isActive
              ? "Akun dapat masuk dan mengakses fitur internal."
              : "Akun ditangguhkan (tidak dapat masuk sistem)."}
          </p>
        </div>
        <Checkbox
          id="edit-is-active"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(Boolean(checked))}
          onClick={(e) => e.stopPropagation()}
        />
      </Label>

      {/* Seksi Ubah Kata Sandi */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-change-password"
            checked={changePassword}
            onCheckedChange={(checked) => setChangePassword(Boolean(checked))}
          />
          <Label
            htmlFor="edit-change-password"
            className="text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <IconLock size={14} className="text-primary" />
            <span>Reset / Ganti Kata Sandi Pengguna</span>
          </Label>
        </div>

        {changePassword && (
          <div className="space-y-2 pl-6 border-l-2 border-primary/20 pt-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="edit-new-password"
                className="text-xs font-semibold"
              >
                Kata Sandi Baru <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <IconKey size={12} />
                <span>Acak Sandi</span>
              </button>
            </div>
            <div className="relative">
              <Input
                id="edit-new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="pr-10 h-10 text-sm font-mono"
                required={changePassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <IconEyeOff size={16} />
                ) : (
                  <IconEye size={16} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Kata sandi baru akan otomatis dienkripsi dan siap digunakan untuk
              masuk.
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
        disabled={updateUser.isPending}
        className="text-xs min-h-11 sm:min-h-10 px-4"
      >
        Batal
      </Button>
      <Button
        type="submit"
        form="edit-user-form"
        disabled={updateUser.isPending}
        className="text-xs font-semibold min-h-11 sm:min-h-10 px-4"
      >
        {updateUser.isPending ? (
          <>
            <IconLoader2 className="mr-1.5 size-4 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <IconUserCheck className="mr-1.5 size-4" />
            <span>Simpan Perubahan</span>
          </>
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
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <IconUserCheck className="size-5 text-primary" />
              <span>Edit Data Pengguna</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ubah informasi profil, nomor kontak, kata sandi, dan status hak
              akses {user.name}.
            </DialogDescription>
          </DialogHeader>

          {formContent}

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
          <DrawerTitle className="flex items-center gap-2 text-base font-semibold">
            <IconUserCheck className="size-5 text-primary" />
            <span>Edit Data Pengguna</span>
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground mt-1">
            Ubah informasi profil, nomor kontak, kata sandi, dan status hak
            akses {user.name}.
          </DrawerDescription>
        </DrawerHeader>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-6 py-4 scroll-pb-24"
          data-vaul-no-drag
          data-lenis-prevent
        >
          {formContent}
        </div>

        <DrawerFooter className="shrink-0 border-t mt-0 px-6 py-3 flex flex-row justify-end gap-2 bg-background pb-safe">
          {footerButtons}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
