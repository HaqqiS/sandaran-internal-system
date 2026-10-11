"use client";

import type { GlobalRole } from "@prisma/client";
import { IconEye, IconEyeOff, IconKey } from "@tabler/icons-react";
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
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useUpdateUser } from "~/hooks";
import type { UserListItem } from "./user-columns";

const editUserSchema = z
  .object({
    name: z.string().trim().min(1, "Silakan masukkan nama lengkap"),
    phone: z.string(),
    email: z
      .string()
      .refine(
        (val) =>
          !val.trim() || z.string().email().safeParse(val.trim()).success,
        "Format alamat email tidak valid",
      ),
    role: z.enum(["USER", "ADMIN", "EXECUTIVE", "NONE"]),
    isActive: z.boolean(),
    changePassword: z.boolean(),
    newPassword: z.string(),
  })
  .refine((data) => Boolean(data.email.trim() || data.phone.trim()), {
    message: "Harap isi setidaknya salah satu dari Email atau Nomor HP",
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
      message: "Kata sandi baru minimal 6 karakter",
      path: ["newPassword"],
    },
  );

type EditUserFormValues = z.infer<typeof editUserSchema>;

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
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "USER" as GlobalRole,
      isActive: true,
      changePassword: false,
      newPassword: "",
    } as EditUserFormValues,
    validators: {
      onSubmit: editUserSchema,
    },
    onSubmit: async ({ value }) => {
      if (!user) return;

      let formattedPhone: string | undefined;
      if (value.phone.trim()) {
        const cleaned = value.phone.replace(/\D/g, "");
        const normalized = cleaned.startsWith("0") ? cleaned.slice(1) : cleaned;
        formattedPhone = `${selectedCountry.dialCode}${normalized}`;
      }

      updateUser.mutate({
        userId: user.id,
        name: value.name.trim(),
        email: value.email.trim().toLowerCase() || undefined,
        phoneNumber: formattedPhone,
        password:
          value.changePassword && value.newPassword.trim()
            ? value.newPassword.trim()
            : undefined,
        roleGlobal: value.role,
        isActive: value.isActive,
      });
    },
  });

  useEffect(() => {
    if (open && user) {
      const isInternalFallback = user.email.endsWith("@sandaran.internal");
      const parsed = parsePhoneNumber(user.phoneNumber);
      setSelectedCountry(parsed.country);
      setShowPassword(false);

      form.reset({
        name: user.name,
        email: isInternalFallback ? "" : user.email,
        phone: parsed.digits,
        role: user.roleGlobal,
        isActive: user.isActive,
        changePassword: false,
        newPassword: "",
      });
    }
  }, [user, open, form]);

  const updateUser = useUpdateUser({
    onSuccess: () => {
      const currentValues = form.state.values;
      const formattedPhone = currentValues.phone.trim()
        ? `${selectedCountry.dialCode}${currentValues.phone.replace(/\D/g, "").replace(/^0+/, "")}`
        : "";
      const displayIdentifier =
        formattedPhone || currentValues.email.trim() || user?.email || "";

      if (
        currentValues.changePassword &&
        currentValues.newPassword.trim() &&
        navigator.clipboard
      ) {
        const summaryText = `Pembaruan Akun Sandaran Internal:
Nama: ${currentValues.name.trim()}
Login: ${displayIdentifier}
Kata Sandi Baru: ${currentValues.newPassword}
Peran: ${currentValues.role}
Status: ${currentValues.isActive ? "Aktif" : "Nonaktif"}
Tautan: ${typeof window !== "undefined" ? window.location.origin : ""}/login`;

        void navigator.clipboard.writeText(summaryText);
        toast.success(`Data ${currentValues.name} berhasil diperbarui!`, {
          description:
            "Kredensial baru telah disalin ke clipboard untuk dikirimkan via chat.",
        });
      } else {
        toast.success(`Data ${currentValues.name} berhasil diperbarui!`);
      }

      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui data pengguna");
    },
  });

  if (!user) return null;

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setShowPassword(false);
        }
        onOpenChange(nextOpen);
      }}
      title="Edit Data Pengguna"
      description={`Ubah informasi profil, nomor kontak, kata sandi, dan status hak akses ${user.name}.`}
      formId="edit-user-form"
      submitLabel={updateUser.isPending ? "Menyimpan..." : "Simpan Perubahan"}
      isPending={updateUser.isPending}
      dialogClassName="sm:max-w-[480px]"
    >
      <form
        id="edit-user-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Nama Lengkap */}
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-semibold"
              >
                Nama Lengkap <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Nama lengkap"
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Nomor HP dengan CountryPicker */}
        <form.Field name="phone">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-semibold"
              >
                Nomor WhatsApp / HP
              </FieldLabel>
              <div className="relative flex items-center">
                <CountryPicker
                  selectedCountry={selectedCountry}
                  onSelectCountry={setSelectedCountry}
                  disabled={updateUser.isPending}
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
              <p className="text-[10px] text-muted-foreground">
                Format: 812... atau 0812... (Kode {selectedCountry.name}{" "}
                {selectedCountry.dialCode})
              </p>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Email */}
        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-semibold"
              >
                Alamat Email
              </FieldLabel>
              <Input
                id={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="staf@sandaran.com"
              />
              <p className="text-[10px] text-muted-foreground">
                Opsional jika pengguna masuk menggunakan Nomor HP
              </p>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Role Global */}
        <form.Field name="role">
          {(field) => (
            <Field className="pt-1">
              <FieldLabel className="text-xs font-semibold">
                Peran Sistem (Global Role)
              </FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val as GlobalRole)}
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
                    <span className="text-[9px] text-muted-foreground">
                      Staf
                    </span>
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
                    <span className="text-[9px] text-muted-foreground">
                      Kelola
                    </span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="EXECUTIVE"
                    id="edit-role-executive"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="edit-role-executive"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
                  >
                    <span className="font-semibold">EXECUTIVE</span>
                    <span className="text-[9px] text-muted-foreground">
                      View
                    </span>
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
                    <span className="text-[9px] text-muted-foreground">
                      Blokir
                    </span>
                  </Label>
                </div>
              </RadioGroup>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Status Akun (Aktif / Nonaktif) */}
        <form.Field name="isActive">
          {(field) => (
            <Label
              htmlFor={field.name}
              className="flex items-center justify-between rounded-lg border p-3 bg-muted/20 cursor-pointer transition-colors hover:bg-muted/40 active:bg-muted/60 select-none"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold block">
                  Status Akun Aktif
                </span>
                <p className="text-[11px] text-muted-foreground font-normal">
                  {field.state.value
                    ? "Akun dapat masuk dan mengakses fitur internal."
                    : "Akun ditangguhkan (tidak dapat masuk sistem)."}
                </p>
              </div>
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) =>
                  field.handleChange(Boolean(checked))
                }
                onClick={(e) => e.stopPropagation()}
              />
            </Label>
          )}
        </form.Field>

        {/* Reset Kata Sandi */}
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
                        Reset Kata Sandi
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
                <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
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
                        <p className="text-[10px] text-muted-foreground">
                          Kata sandi baru akan otomatis dienkripsi dan siap
                          digunakan untuk masuk.
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
    </ResponsiveFormDialog>
  );
}
