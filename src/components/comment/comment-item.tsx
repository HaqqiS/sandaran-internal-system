"use client";

import { IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/shared/confirm-delete-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Bubble, BubbleContent } from "~/components/ui/bubble";
import { Button } from "~/components/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "~/components/ui/message";
import { useDeleteComment } from "~/hooks/useComment";
import { cn } from "~/lib/utils";
import { useSessionStore } from "~/stores/use-session-store";
import type { RouterOutputs } from "~/trpc/react";

type Comment = RouterOutputs["comment"]["getByReport"][number];

interface CommentItemProps {
  comment: Comment;
  projectId: string;
}

export function CommentItem({ comment, projectId }: CommentItemProps) {
  const session = useSessionStore((state) => state.session);

  const deleteComment = useDeleteComment({
    onSuccess: () => {
      toast.success("Komentar dihapus");
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

  const createdAtDate = new Date(comment.createdAt);
  const witaTime = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
  }).format(createdAtDate);

  const timeAgo = formatDistanceToNow(createdAtDate, {
    addSuffix: true,
    locale: id,
  });

  return (
    <>
      <Message
        align={isAuthor ? "end" : "start"}
        className="group/comment items-end gap-2.5"
      >
        <MessageAvatar
          className={cn(
            "size-8 ring-1 group-has-data-[slot=message-footer]/message:-translate-y-5",
            isAuthor ? "ring-primary/20" : "ring-border/50",
          )}
        >
          <Avatar className="size-8">
            <AvatarImage
              src={comment.author.image ?? undefined}
              alt={comment.author.name}
            />
            <AvatarFallback className="text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>

        <MessageContent
          className={cn(
            "max-w-[85%] gap-1 sm:max-w-[75%]",
            isAuthor ? "items-end" : "items-start",
          )}
        >
          <MessageHeader
            className={cn(
              "gap-1.5 px-1",
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
          </MessageHeader>

          <div
            data-slot="message-row"
            className={cn(
              "flex max-w-full items-center gap-1.5",
              isAuthor ? "flex-row-reverse" : "flex-row",
            )}
          >
            <Bubble
              variant={isAuthor ? "default" : "muted"}
              align={isAuthor ? "end" : "start"}
              className="max-w-full"
            >
              <BubbleContent
                className={cn(
                  "px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-xs transition-colors select-text",
                  isAuthor
                    ? "rounded-2xl rounded-br-xs"
                    : "rounded-2xl rounded-bl-xs border border-border/50 text-foreground",
                )}
              >
                {comment.content}
              </BubbleContent>
            </Bubble>

            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full text-muted-foreground opacity-80 transition-opacity hover:bg-destructive/10 hover:text-destructive active:scale-95 sm:opacity-0 sm:group-hover/comment:opacity-100 focus-visible:opacity-100"
                onClick={() => setShowDeleteDialog(true)}
                aria-label="Hapus komentar"
              >
                <IconTrash className="size-3.5" />
              </Button>
            )}
          </div>

          <MessageFooter className="gap-1.5 px-1 text-[11px] font-normal text-muted-foreground">
            <span>{witaTime} WITA</span>
            <span className="text-muted-foreground/60">•</span>
            <span>{timeAgo}</span>
          </MessageFooter>
        </MessageContent>
      </Message>

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
    </>
  );
}
