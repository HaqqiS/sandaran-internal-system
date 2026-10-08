"use client";

import { IconLoader2, IconSend } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { FieldError } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

const commentSchema = z.object({
  content: z.string().trim().min(1, "Komentar tidak boleh kosong"),
});

interface CommentFormProps {
  projectId: string;
  reportId: string;
  onSuccess?: () => void;
}

export function CommentForm({
  projectId,
  reportId,
  onSuccess,
}: CommentFormProps) {
  const utils = api.useUtils();
  const createComment = api.comment.create.useMutation({
    onSuccess: () => {
      toast.success("Komentar berhasil dikirim");
      utils.comment.getByReport.invalidate({ projectId, reportId });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onSubmit: commentSchema,
    },
    onSubmit: async ({ value }) => {
      const trimmed = value.content.trim();
      if (!trimmed) return;
      createComment.mutate({
        projectId,
        reportId,
        content: trimmed,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="w-full"
    >
      <form.Field
        name="content"
        children={(field) => (
          <div className="space-y-1">
            <Label htmlFor={field.name} className="sr-only">
              Tulis komentar
            </Label>
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-muted/40 p-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition-all">
              <Textarea
                id={field.name}
                placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent p-2 text-sm leading-relaxed shadow-none focus-visible:ring-0 focus-visible:outline-none"
                rows={1}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (
                      field.state.value.trim().length > 0 &&
                      !createComment.isPending
                    ) {
                      form.handleSubmit();
                    }
                  }
                }}
              />

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => {
                  const hasContent = field.state.value.trim().length > 0;
                  const isDisabled =
                    !canSubmit ||
                    isSubmitting ||
                    createComment.isPending ||
                    !hasContent;

                  return (
                    <Button
                      type="submit"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl transition-all active:scale-95"
                      disabled={isDisabled}
                      aria-label="Kirim komentar"
                    >
                      {createComment.isPending ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconSend className="h-4 w-4" />
                      )}
                    </Button>
                  );
                }}
              />
            </div>

            <FieldError
              errors={field.state.meta.errors}
              className="px-2 text-xs"
            />
          </div>
        )}
      />
    </form>
  );
}
