"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useApproveUser, useProjectList } from "~/hooks";

const approveUserSchema = z
  .object({
    role: z.enum(["USER", "EXECUTIVE", "ADMIN"]),
    assignProject: z.boolean(),
    projectId: z.string(),
    projectRole: z.enum(["SUPERVISOR", "ARCHITECT", "FINANCE", "LOGISTIC"]),
  })
  .refine(
    (data) => {
      if (
        data.role === "USER" &&
        data.assignProject &&
        !data.projectId.trim()
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Silakan pilih proyek tujuan",
      path: ["projectId"],
    },
  );

type ApproveUserFormValues = z.infer<typeof approveUserSchema>;

interface ApproveUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveUserDialog({
  user,
  open,
  onOpenChange,
}: ApproveUserDialogProps) {
  const form = useForm({
    defaultValues: {
      role: "USER" as "USER" | "EXECUTIVE" | "ADMIN",
      assignProject: false,
      projectId: "",
      projectRole: "SUPERVISOR" as
        | "SUPERVISOR"
        | "ARCHITECT"
        | "FINANCE"
        | "LOGISTIC",
    } as ApproveUserFormValues,
    validators: {
      onSubmit: approveUserSchema,
    },
    onSubmit: async ({ value }) => {
      if (!user) return;

      approve.mutate(
        {
          userId: user.id,
          roleGlobal: value.role,
          projectAssignment:
            value.role === "USER" && value.assignProject && value.projectId
              ? {
                  projectId: value.projectId,
                  role: value.projectRole,
                }
              : undefined,
        },
        {
          onSuccess: () => {
            toast.success(`${user.name} berhasil disetujui`);
            onOpenChange(false);
            form.reset();
          },
          onError: (error) => {
            toast.error(error.message || "Gagal menyetujui pengguna");
          },
        },
      );
    },
  });

  const isAssignProjectActive = useStore(
    form.store,
    (s) => s.values.role === "USER" && s.values.assignProject,
  );

  const { data: projects } = useProjectList({
    enabled: open && isAssignProjectActive,
  });

  const approve = useApproveUser();

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
        }
        onOpenChange(nextOpen);
      }}
      title="Setujui Pengguna"
      description={`Setujui ${user?.name || "pengguna"} dan tetapkan peran global`}
      formId="approve-user-form"
      submitLabel={approve.isPending ? "Menyetujui..." : "Setujui Pengguna"}
      isPending={approve.isPending}
      dialogClassName="sm:max-w-[440px]"
    >
      <form
        id="approve-user-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Informasi Pengguna</Label>
          <div className="rounded-lg border bg-muted/40 p-3 text-xs">
            <div className="font-semibold text-foreground">{user?.name}</div>
            <div className="text-muted-foreground">{user?.email}</div>
          </div>
        </div>

        <form.Field name="role">
          {(field) => (
            <Field className="space-y-2">
              <FieldLabel className="text-xs font-semibold">
                Pilih Peran Global
              </FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={(v: string) => {
                  field.handleChange(v as "USER" | "EXECUTIVE" | "ADMIN");
                  if (v !== "USER") {
                    form.setFieldValue("assignProject", false);
                  }
                }}
                className="gap-2"
              >
                <div className="flex items-center space-x-2.5 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="USER" id="approve-role-user" />
                  <Label
                    htmlFor="approve-role-user"
                    className="text-xs font-normal cursor-pointer"
                  >
                    <span className="font-semibold">USER</span> - Akses reguler
                    ke proyek yang ditugaskan
                  </Label>
                </div>
                <div className="flex items-center space-x-2.5 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem
                    value="EXECUTIVE"
                    id="approve-role-executive"
                  />
                  <Label
                    htmlFor="approve-role-executive"
                    className="text-xs font-normal cursor-pointer"
                  >
                    <span className="font-semibold">EXECUTIVE</span> - Akses
                    baca seluruh proyek
                  </Label>
                </div>
                <div className="flex items-center space-x-2.5 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="ADMIN" id="approve-role-admin" />
                  <Label
                    htmlFor="approve-role-admin"
                    className="text-xs font-normal cursor-pointer"
                  >
                    <span className="font-semibold">ADMIN</span> - Akses penuh
                    sistem
                  </Label>
                </div>
              </RadioGroup>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.values.role, state.values.assignProject]}
        >
          {([currentRole, currentAssignProject]) =>
            currentRole === "USER" && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
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
                        Tambahkan ke Proyek (Opsional)
                      </Label>
                    </div>
                  )}
                </form.Field>

                {currentAssignProject && (
                  <div className="grid gap-3 pt-1">
                    <form.Field name="projectId">
                      {(field) => (
                        <Field>
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold"
                          >
                            Proyek
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(val) => field.handleChange(val)}
                          >
                            <SelectTrigger
                              id={field.name}
                              className="w-full text-xs"
                            >
                              <SelectValue placeholder="Pilih proyek" />
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
                            Peran Proyek
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(v) =>
                              field.handleChange(
                                v as
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
                                Supervisor
                              </SelectItem>
                              <SelectItem value="ARCHITECT">Arsitek</SelectItem>
                              <SelectItem value="FINANCE">Keuangan</SelectItem>
                              <SelectItem value="LOGISTIC">Logistik</SelectItem>
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
