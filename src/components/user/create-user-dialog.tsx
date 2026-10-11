"use client";

import { IconEye, IconEyeOff, IconKey } from "@tabler/icons-react";
import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { type Country, DEFAULT_COUNTRY } from "~/app/login/_data/countries";
import { CountryPicker } from "~/components/login/country-picker";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useCreateUserWithCredentials, useProjectList } from "~/hooks";

const createUserSchema = z
  .object({
    name: z.string().trim().min(1, "Nama lengkap wajib diisi"),
    phone: z.string(),
    email: z
      .string()
      .refine(
        (val) =>
          !val.trim() || z.string().email().safeParse(val.trim()).success,
        "Format alamat email tidak valid",
      ),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    role: z.enum(["USER", "ADMIN", "EXECUTIVE"]),
    assignProject: z.boolean(),
    projectId: z.string(),
    projectRole: z.enum(["SUPERVISOR", "ARCHITECT", "FINANCE", "LOGISTIC"]),
  })
  .refine((data) => Boolean(data.email.trim() || data.phone.trim()), {
    message: "Minimal harus memasukkan Email atau Nomor WhatsApp/HP",
    path: ["phone"],
  })
  .refine(
    (data) => {
      if (data.assignProject && !data.projectId.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Silakan pilih proyek tujuan",
      path: ["projectId"],
    },
  );

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "Sandaran123!",
      role: "USER" as "USER" | "ADMIN" | "EXECUTIVE",
      assignProject: false,
      projectId: "",
      projectRole: "SUPERVISOR" as
        | "SUPERVISOR"
        | "ARCHITECT"
        | "FINANCE"
        | "LOGISTIC",
    } as CreateUserFormValues,
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: async ({ value }) => {
      let formattedPhone: string | undefined;
      if (value.phone.trim()) {
        const cleaned = value.phone.replace(/\D/g, "");
        const normalized = cleaned.startsWith("0") ? cleaned.slice(1) : cleaned;
        formattedPhone = `${selectedCountry.dialCode}${normalized}`;
      }

      createUser.mutate({
        name: value.name.trim(),
        email: value.email.trim().toLowerCase() || undefined,
        phoneNumber: formattedPhone,
        password: value.password,
        roleGlobal: value.role,
        projectAssignment:
          value.assignProject && value.projectId
            ? {
                projectId: value.projectId,
                role: value.projectRole,
              }
            : undefined,
      });
    },
  });

  const isAssignProjectActive = useStore(
    form.store,
    (s) => s.values.role === "USER" && s.values.assignProject,
  );

  const { data: projects } = useProjectList({
    enabled: open && isAssignProjectActive,
  });

  const createUser = useCreateUserWithCredentials({
    onSuccess: () => {
      const currentValues = form.state.values;
      const identifier =
        currentValues.phone.trim() || currentValues.email.trim();
      const summaryText = `Akun Sandaran Internal System:
Nama: ${currentValues.name.trim()}
Login: ${identifier}
Kata Sandi: ${currentValues.password}
Peran: ${currentValues.role}
Tautan: ${typeof window !== "undefined" ? window.location.origin : ""}/login`;

      if (navigator.clipboard) {
        void navigator.clipboard.writeText(summaryText);
        toast.success("Pengguna berhasil dibuat!", {
          description:
            "Detail login telah disalin ke clipboard untuk dikirimkan via chat.",
        });
      } else {
        toast.success("Pengguna berhasil dibuat!");
      }

      form.reset();
      setSelectedCountry(DEFAULT_COUNTRY);
      setShowPassword(false);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal membuat pengguna");
    },
  });

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
          setSelectedCountry(DEFAULT_COUNTRY);
          setShowPassword(false);
        }
        onOpenChange(nextOpen);
      }}
      title="Tambah Pengguna Baru"
      description="Buatkan akun baru secara langsung untuk staf atau pekerja lapangan."
      formId="create-user-form"
      submitLabel={
        createUser.isPending ? "Membuat Akun..." : "Buat Akun Sekarang"
      }
      isPending={createUser.isPending}
      dialogClassName="sm:max-w-[480px]"
    >
      <form
        id="create-user-form"
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
                placeholder="cth. Budi Prakoso"
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Nomor HP */}
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
                  disabled={createUser.isPending}
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
                Opsional jika menggunakan nomor WhatsApp/HP untuk login.
              </p>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Kata Sandi Awal */}
        <form.Field name="password">
          {(field) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-semibold"
                >
                  Kata Sandi Masuk <span className="text-destructive">*</span>
                </FieldLabel>
                <Button
                  type="button"
                  variant="ghost"
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
                  className="h-6 text-[11px] text-primary px-1.5 hover:bg-primary/10"
                >
                  <IconKey className="mr-1 size-3" />
                  Buat Acak
                </Button>
              </div>
              <div className="relative flex items-center">
                <Input
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="pr-8 font-mono"
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
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Peran Sistem Global */}
        <form.Field name="role">
          {(field) => (
            <Field className="pt-1 border-t">
              <FieldLabel className="text-xs font-semibold">
                Peran Sistem (Global Role)
              </FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={(val) =>
                  field.handleChange(val as "USER" | "ADMIN" | "EXECUTIVE")
                }
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem
                    value="USER"
                    id="role-user"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="role-user"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2.5 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
                  >
                    <span className="font-semibold">USER</span>
                    <span className="text-[10px] text-muted-foreground">
                      Staf / Tim Lapangan
                    </span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="ADMIN"
                    id="role-admin"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="role-admin"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2.5 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
                  >
                    <span className="font-semibold">ADMIN</span>
                    <span className="text-[10px] text-muted-foreground">
                      Kelola Sistem
                    </span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="EXECUTIVE"
                    id="role-executive"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="role-executive"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2.5 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
                  >
                    <span className="font-semibold">EXECUTIVE</span>
                    <span className="text-[10px] text-muted-foreground">
                      Eksekutif / View
                    </span>
                  </Label>
                </div>
              </RadioGroup>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Opsi Penugasan Proyek Langsung (Hanya jika role USER) */}
        <form.Subscribe
          selector={(state) => [state.values.role, state.values.assignProject]}
        >
          {([currentRole, currentAssignProject]) =>
            currentRole === "USER" && (
              <div className="rounded-xl border p-3 bg-muted/20 space-y-3">
                <form.Field name="assignProject">
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
                        className="text-xs font-medium cursor-pointer"
                      >
                        Tugaskan ke proyek sekarang (Opsional)
                      </Label>
                    </div>
                  )}
                </form.Field>

                {currentAssignProject && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <form.Field name="projectId">
                      {(field) => (
                        <Field>
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold"
                          >
                            Pilih Proyek
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(val) => field.handleChange(val)}
                          >
                            <SelectTrigger
                              id={field.name}
                              className="w-full text-xs"
                            >
                              <SelectValue placeholder="Pilih proyek..." />
                            </SelectTrigger>
                            <SelectContent>
                              {projects?.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="projectRole">
                      {(field) => (
                        <Field>
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold"
                          >
                            Peran di Proyek
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(val) =>
                              field.handleChange(
                                val as
                                  | "SUPERVISOR"
                                  | "ARCHITECT"
                                  | "FINANCE"
                                  | "LOGISTIC",
                              )
                            }
                          >
                            <SelectTrigger
                              id={field.name}
                              className="w-full text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SUPERVISOR">
                                SUPERVISOR
                              </SelectItem>
                              <SelectItem value="ARCHITECT">
                                ARCHITECT
                              </SelectItem>
                              <SelectItem value="FINANCE">FINANCE</SelectItem>
                              <SelectItem value="LOGISTIC">LOGISTIC</SelectItem>
                            </SelectContent>
                          </Select>
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )}
                    </form.Field>
                  </div>
                )}
              </div>
            )
          }
        </form.Subscribe>
      </form>
    </ResponsiveFormDialog>
  );
}
