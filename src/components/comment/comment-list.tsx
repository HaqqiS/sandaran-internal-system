"use client";

import { IconMessageCircle } from "@tabler/icons-react";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

interface CommentListProps {
  projectId: string;
  reportId: string;
}

export function CommentList({ projectId, reportId }: CommentListProps) {
  const { data: comments, isLoading } = api.comment.getByReport.useQuery({
    projectId,
    reportId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommentForm projectId={projectId} reportId={reportId} />

      <div className="space-y-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <IconMessageCircle className="h-5 w-5" />
          Comments ({comments?.length ?? 0})
        </h3>

        <div className="space-y-6">
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
            />
          ))}

          {comments?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No comments yet. Be the first to discuss this report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
