"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useCloudinaryUpload } from "~/hooks/useCloudinaryUpload";
import { useRequestEmergencyFund } from "~/hooks/useEmergency";

const withdrawSchema = z.object({
  amount: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  description: z.string().min(1, "Description is required"),
});

interface RequestFormProps {
  projectId: string;
  projectSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RequestForm({
  projectId,
  projectSlug,
  onSuccess,
  onCancel,
}: RequestFormProps) {
  const requestFund = useRequestEmergencyFund();
  const { upload, isUploading } = useCloudinaryUpload();
  const [proofFile, setProofFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      amount: "",
      description: "",
    },
    validators: {
      onChange: withdrawSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        let proofPublicId: string | undefined;

        if (proofFile) {
          const result = await upload(proofFile, {
            projectSlug,
            type: "emergency",
          });
          proofPublicId = result.publicId;
        }

        await requestFund.mutateAsync({
          projectId,
          amount: Number(value.amount),
          description: value.description,
          proofPublicId,
        });

        toast.success("Withdrawal requested successfully");
        form.reset();
        setProofFile(null);
        onSuccess?.();
      } catch (error) {
        toast.error("Failed to request funds");
        console.error(error);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="amount"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Amount (Rp)</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. 50000"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Beli Paku, Makan Siang Tukang"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <div className="space-y-2">
        <Label>Proof (Optional)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            className="cursor-pointer"
          />
        </div>
        {proofFile && (
          <p className="text-xs text-muted-foreground">
            Selected: {proofFile.name}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={requestFund.isPending || isUploading}>
          {requestFund.isPending || isUploading ? "Submitting..." : "Request"}
        </Button>
      </div>
    </form>
  );
}
