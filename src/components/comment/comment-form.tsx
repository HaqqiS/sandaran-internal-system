"use client";

import { IconSend } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

const commentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong"),
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
      onChange: commentSchema,
    },
    onSubmit: async ({ value }) => {
      createComment.mutate({
        projectId,
        reportId,
        content: value.content,
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
      className="space-y-4"
    >
      <form.Field
        name="content"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="sr-only">
              Komentar *
            </Label>
            <Textarea
              id={field.name}
              placeholder="Tulis komentar..."
              className="min-h-[80px] resize-none"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  form.handleSubmit();
                }
              }}
            />
            {field.state.meta.errors ? (
              <p className="text-sm font-medium text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      />

      <div className="flex justify-end">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit || isSubmitting || createComment.isPending}
            >
              {createComment.isPending ? (
                "Mengirim..."
              ) : (
                <>
                  <IconSend className="mr-2 h-4 w-4" />
                  Kirim Komentar
                </>
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
