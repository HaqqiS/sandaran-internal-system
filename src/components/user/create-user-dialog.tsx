"use client";

import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconLoader2,
  IconMail,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Country, DEFAULT_COUNTRY } from "~/app/login/_data/countries";
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

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(DEFAULT_COUNTRY);
  const [password, setPassword] = useState("Sandaran123!");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"USER" | "ADMIN" | "CEO">("USER");
  const [assignProject, setAssignProject] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [projectRole, setProjectRole] = useState<
    "MANDOR" | "ARCHITECT" | "FINANCE"
  >("MANDOR");

  const { data: projects } = useProjectList({
    enabled: open && assignProject,
  });

  const createUser = useCreateUserWithCredentials({
    onSuccess: () => {
      // Prepare clipboard text for WhatsApp
      const identifier = phone.trim() || email.trim();
      const summaryText = `Akun Sandaran Internal System:
Nama: ${name.trim()}
Login: ${identifier}
Kata Sandi: ${password}
Peran: ${role}
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

      handleReset();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal membuat pengguna");
    },
  });

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSelectedCountry(DEFAULT_COUNTRY);
    setPassword("Sandaran123!");
    setShowPassword(false);
    setRole("USER");
    setAssignProject(false);
    setProjectId("");
    setProjectRole("MANDOR");
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    toast.info(`Kata sandi acak dibuat: ${gen}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Silakan masukkan nama lengkap");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      toast.error("Harap isi setidaknya salah satu dari Email atau Nomor HP");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return;
    }

    if (assignProject && !projectId) {
      toast.error("Silakan pilih proyek yang akan ditugaskan");
      return;
    }

    // Format phone number with selected country dial code
    let formattedPhone: string | undefined;
    if (phone.trim()) {
      const cleaned = phone.replace(/\D/g, "");
      const normalized = cleaned.startsWith("0") ? cleaned.slice(1) : cleaned;
      formattedPhone = `${selectedCountry.dialCode}${normalized}`;
    }

    createUser.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase() || undefined,
      phoneNumber: formattedPhone,
      password,
      roleGlobal: role,
      projectAssignment:
        assignProject && projectId
          ? {
              projectId,
              role: projectRole,
            }
          : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto"
        data-lenis-prevent
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUserPlus className="size-5 text-primary" />
            <span>Tambah Pengguna Baru</span>
          </DialogTitle>
          <DialogDescription>
            Buatkan akun baru secara langsung untuk staf atau pekerja lapangan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="create-name" className="text-xs font-semibold">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. Budi Prakoso"
                className="pl-9 h-10 text-sm"
                required
              />
            </div>
          </div>

          {/* Nomor HP */}
          <div className="space-y-1.5">
            <Label htmlFor="create-phone" className="text-xs font-semibold">
              Nomor WhatsApp / HP
            </Label>
            <div className="relative flex items-center">
              <CountryPicker
                selectedCountry={selectedCountry}
                onSelectCountry={setSelectedCountry}
                disabled={createUser.isPending}
              />
              <Input
                id="create-phone"
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
            <Label htmlFor="create-email" className="text-xs font-semibold">
              Alamat Email
            </Label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="create-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staf@sandaran.com"
                className="pl-9 h-10 text-sm"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Opsional jika Nomor HP sudah diisi
            </p>
          </div>

          {/* Password Awal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="create-password"
                className="text-xs font-semibold"
              >
                Kata Sandi Awal <span className="text-destructive">*</span>
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
                id="create-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-10 text-sm font-mono"
                required
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
          </div>

          {/* Role Global */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold">
              Peran Sistem (Global Role)
            </Label>
            <RadioGroup
              value={role}
              onValueChange={(val) => setRole(val as "USER" | "ADMIN" | "CEO")}
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
                    Staf / Mandor
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
                  value="CEO"
                  id="role-ceo"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="role-ceo"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2.5 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-xs font-medium text-center transition-all"
                >
                  <span className="font-semibold">CEO</span>
                  <span className="text-[10px] text-muted-foreground">
                    Eksekutif / View
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Penugasan Proyek Langsung */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-assign-project"
                checked={assignProject}
                onCheckedChange={(checked) =>
                  setAssignProject(Boolean(checked))
                }
              />
              <Label
                htmlFor="create-assign-project"
                className="text-xs font-medium cursor-pointer"
              >
                Langsung tugaskan ke proyek
              </Label>
            </div>

            {assignProject && (
              <div className="space-y-3 pl-6 border-l-2 border-primary/20 pt-1">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="create-project"
                    className="text-xs font-semibold"
                  >
                    Pilih Proyek
                  </Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger id="create-project" className="h-9 text-xs">
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
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="create-project-role"
                    className="text-xs font-semibold"
                  >
                    Peran di Proyek
                  </Label>
                  <Select
                    value={projectRole}
                    onValueChange={(val) =>
                      setProjectRole(val as "MANDOR" | "ARCHITECT" | "FINANCE")
                    }
                  >
                    <SelectTrigger
                      id="create-project-role"
                      className="h-9 text-xs"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANDOR">MANDOR</SelectItem>
                      <SelectItem value="ARCHITECT">ARCHITECT</SelectItem>
                      <SelectItem value="FINANCE">FINANCE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createUser.isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createUser.isPending}
              className="text-xs font-semibold"
            >
              {createUser.isPending ? (
                <>
                  <IconLoader2 className="mr-1.5 size-4 animate-spin" />
                  <span>Membuat Akun...</span>
                </>
              ) : (
                <>
                  <IconUserPlus className="mr-1.5 size-4" />
                  <span>Buat Akun Sekarang</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
