"use client";

import { IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/shared/confirm-delete-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useSessionStore } from "~/stores/use-session-store";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type Comment = RouterOutputs["comment"]["getByReport"][number];

interface CommentItemProps {
  comment: Comment;
  projectId: string;
}

export function CommentItem({ comment, projectId }: CommentItemProps) {
  const session = useSessionStore((state) => state.session);
  const utils = api.useUtils();

  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => {
      toast.success("Komentar dihapus");
      utils.comment.getByReport.invalidate({
        projectId,
        reportId: comment.reportId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Check permissions
  const isAuthor = session?.user?.id === comment.userId;
  const isAdmin = session?.user?.roleGlobal === "ADMIN";
  const canDelete = isAuthor || isAdmin;

  const initials = comment.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: id,
  });

  return (
    <div
      className={cn(
        "group/comment flex items-end gap-2.5 w-full",
        isAuthor ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar for other users (on left) */}
      {!isAuthor && (
        <Avatar className="h-8 w-8 shrink-0 mb-1 ring-1 ring-border/50">
          <AvatarImage
            src={comment.author.image ?? undefined}
            alt={comment.author.name}
          />
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Bubble container */}
      <div
        className={cn(
          "flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%]",
          isAuthor ? "items-end" : "items-start",
        )}
      >
        {/* Header meta */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-1 text-xs",
            isAuthor ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span className="font-semibold text-foreground">
            {isAuthor ? "Anda" : comment.author.name}
          </span>

          {!isAuthor && comment.author.roleGlobal && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[10px] font-semibold tracking-wide uppercase"
            >
              {comment.author.roleGlobal}
            </Badge>
          )}

          <span className="text-muted-foreground/60">•</span>
          <span className="text-muted-foreground text-[11px]">{timeAgo}</span>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-80 sm:opacity-0 sm:group-hover/comment:opacity-100 transition-opacity active:scale-95"
              onClick={() => setShowDeleteDialog(true)}
              aria-label="Hapus komentar"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Chat Bubble */}
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed shadow-xs transition-colors break-words whitespace-pre-wrap select-text",
            isAuthor
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-xs"
              : "bg-muted/80 text-foreground border border-border/50 rounded-2xl rounded-bl-xs",
          )}
        >
          {comment.content}
        </div>
      </div>

      {/* Avatar for author (on right) */}
      {isAuthor && (
        <Avatar className="h-8 w-8 shrink-0 mb-1 ring-1 ring-primary/20">
          <AvatarImage
            src={comment.author.image ?? undefined}
            alt={comment.author.name}
          />
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Delete confirmation dialog */}
      {canDelete && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Hapus Komentar"
          description="Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={() =>
            deleteComment.mutate({
              projectId,
              commentId: comment.id,
            })
          }
          isPending={deleteComment.isPending}
        />
      )}
    </div>
  );
}
