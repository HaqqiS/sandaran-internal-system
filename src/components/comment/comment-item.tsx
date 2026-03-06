"use client";

import { IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
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

  return (
    <div className="flex gap-4 group">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.image ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: id,
              })}
            </span>
          </div>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IconTrash className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Hapus komentar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Komentar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() =>
                      deleteComment.mutate({
                        projectId,
                        commentId: comment.id,
                      })
                    }
                    disabled={deleteComment.isPending}
                  >
                    {deleteComment.isPending ? "Menghapus..." : "Hapus"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
