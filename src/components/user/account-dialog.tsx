"use client";

import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconLoader2,
  IconShield,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  COUNTRIES,
  type Country,
  DEFAULT_COUNTRY,
} from "~/app/login/_data/countries";
import { CountryPicker } from "~/components/login/country-picker";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useCurrentUser, useUpdateProfile } from "~/hooks";
import { RoleBadge } from "./role-badge";

const accountSchema = z
  .object({
    name: z.string().trim().min(1, "Nama lengkap tidak boleh kosong"),
    email: z
      .string()
      .refine(
        (val) =>
          !val.trim() || z.string().email().safeParse(val.trim()).success,
        "Format alamat email tidak valid",
      ),
    phone: z.string(),
    changePassword: z.boolean(),
    currentPassword: z.string().optional(),
    newPassword: z.string(),
  })
  .refine((data) => Boolean(data.email.trim() || data.phone.trim()), {
    message: "Minimal harus memiliki alamat Email atau Nomor WhatsApp/HP",
    path: ["phone"],
  })
  .refine(
    (data) => {
      if (data.changePassword) {
        return Boolean(
          data.newPassword.trim() && data.newPassword.trim().length >= 6,
        );
      }
      return true;
    },
    {
      message: "Kata sandi minimal 6 karakter",
      path: ["newPassword"],
    },
  );

type AccountFormValues = z.infer<typeof accountSchema>;

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
  const { data: currentUser, isLoading } = useCurrentUser();
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      changePassword: false,
      currentPassword: "",
      newPassword: "",
    } as AccountFormValues,
    validators: {
      onSubmit: accountSchema,
    },
    onSubmit: async ({ value }) => {
      const formattedPhone = value.phone.trim()
        ? `${selectedCountry.dialCode}${value.phone.replace(/\D/g, "").replace(/^0+/, "")}`
        : "";

      updateProfile.mutate({
        name: value.name.trim(),
        email: value.email.trim() || undefined,
        phoneNumber: formattedPhone || undefined,
        currentPassword:
          value.changePassword && value.currentPassword?.trim()
            ? value.currentPassword.trim()
            : undefined,
        password: value.changePassword ? value.newPassword.trim() : undefined,
      });
    },
  });

  useEffect(() => {
    if (open && currentUser) {
      const isInternalFallback =
        currentUser.email.endsWith("@sandaran.internal");
      const parsed = parsePhoneNumber(currentUser.phoneNumber);
      setSelectedCountry(parsed.country);
      setShowPassword(false);

      form.reset({
        name: currentUser.name || "",
        email: isInternalFallback ? "" : currentUser.email,
        phone: parsed.digits,
        changePassword: false,
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [currentUser, open, form]);

  const updateProfile = useUpdateProfile({
    onSuccess: () => {
      const currentValues = form.state.values;
      if (
        currentValues.changePassword &&
        currentValues.newPassword.trim() &&
        navigator.clipboard
      ) {
        void navigator.clipboard.writeText(currentValues.newPassword);
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

  const initials = currentUser?.name?.substring(0, 2).toUpperCase() || "US";

  const formContent = (
    <form
      id="account-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* User Identity & Role Card */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border shadow-xs">
            <AvatarImage
              src={currentUser?.image || undefined}
              alt={currentUser?.name || "User"}
            />
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
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-xs font-semibold">
              Nama Lengkap <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Nama Lengkap"
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      {/* Email */}
      <form.Field name="email">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-xs font-semibold">
              Alamat Email
            </FieldLabel>
            <Input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="nama@sandaran.com"
            />
            <p className="text-[11px] text-muted-foreground">
              Digunakan untuk login dan notifikasi email resmi.
            </p>
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      {/* Nomor HP dengan CountryPicker */}
      <form.Field name="phone">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-xs font-semibold">
              Nomor WhatsApp / HP
            </FieldLabel>
            <div className="relative flex items-center">
              <CountryPicker
                selectedCountry={selectedCountry}
                onSelectCountry={setSelectedCountry}
                disabled={updateProfile.isPending}
              />
              <Input
                id={field.name}
                type="tel"
                inputMode="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="812-3456-7890"
                style={{
                  paddingLeft: `${selectedCountry.dialCode.length * 8 + 72}px`,
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Format: 812... atau 0812... (Kode {selectedCountry.name}{" "}
              {selectedCountry.dialCode})
            </p>
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      {/* Ganti Kata Sandi Toggle */}
      <form.Subscribe selector={(state) => state.values.changePassword}>
        {(isChangePassword) => (
          <div className="rounded-xl border p-3.5 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <form.Field name="changePassword">
                {(field) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor={field.name}
                      className="text-xs font-medium cursor-pointer flex items-center gap-1.5"
                    >
                      <IconKey className="h-3.5 w-3.5 text-muted-foreground" />
                      Ubah Kata Sandi
                    </Label>
                  </div>
                )}
              </form.Field>

              {isChangePassword && (
                <form.Field name="newPassword">
                  {(field) => (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const chars =
                          "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
                        let gen = "";
                        for (let i = 0; i < 10; i++) {
                          gen += chars.charAt(
                            Math.floor(Math.random() * chars.length),
                          );
                        }
                        field.handleChange(gen);
                        toast.info(`Kata sandi acak dibuat: ${gen}`);
                      }}
                      className="h-7 text-xs px-2"
                    >
                      Buat Acak
                    </Button>
                  )}
                </form.Field>
              )}
            </div>

            {isChangePassword && (
              <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <form.Field name="currentPassword">
                  {(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-xs font-semibold"
                      >
                        Kata Sandi Saat Ini
                      </FieldLabel>
                      <div className="relative flex items-center">
                        <Input
                          id={field.name}
                          type="password"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Masukkan kata sandi saat ini"
                          className="font-mono text-xs"
                          autoComplete="current-password"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Diperlukan untuk memverifikasi akun sebelum mengubah kata sandi.
                      </p>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="newPassword">
                  {(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-xs font-semibold"
                      >
                        Kata Sandi Baru
                      </FieldLabel>
                      <div className="relative flex items-center">
                        <Input
                          id={field.name}
                          type={showPassword ? "text" : "password"}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Masukkan kata sandi baru (min 6 karakter)"
                          className="pr-8 font-mono"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <IconEyeOff className="size-3.5" />
                          ) : (
                            <IconEye className="size-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Gunakan minimal 6 karakter kombinasi huruf dan angka.
                      </p>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.Field>
              </div>
            )}
          </div>
        )}
      </form.Subscribe>
    </form>
  );

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setShowPassword(false);
        }
        onOpenChange(nextOpen);
      }}
      title="Pengaturan Akun"
      description="Kelola informasi pribadi dan keamanan akun Anda."
      formId="account-form"
      submitLabel={
        updateProfile.isPending ? "Menyimpan..." : "Simpan Perubahan"
      }
      isPending={updateProfile.isPending}
      submitDisabled={isLoading}
      dialogClassName="sm:max-w-[480px]"
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        formContent
      )}
    </ResponsiveFormDialog>
  );
}
