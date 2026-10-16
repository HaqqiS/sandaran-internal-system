"use client";

import { IconMessageCircle } from "@tabler/icons-react";
import { useEffect, useMemo, useRef } from "react";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
} from "~/components/ui/message";
import { ScrollArea } from "~/components/ui/scroll-area";
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Reverse so older comments are at top and newer are at bottom (chronological)
  const orderedComments = useMemo(
    () => (comments ? [...comments].reverse() : []),
    [comments],
  );

  useEffect(() => {
    if (orderedComments.length > 0) {
      if (isFirstRender.current) {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
        isFirstRender.current = false;
      } else {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [orderedComments.length]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="flex items-center gap-2 font-semibold text-sm sm:text-base text-foreground">
          <IconMessageCircle className="h-5 w-5 text-primary" />
          Diskusi ({comments?.length ?? 0})
        </h3>
      </div>

      {/* Comment Body / ScrollArea */}
      {isLoading ? (
        <MessageGroup className="h-[280px] sm:h-[320px] gap-4 py-2 pr-3">
          {/* Bubble Skeleton 1: Left */}
          <Message align="start" className="items-end gap-2.5">
            <MessageAvatar className="size-8 bg-transparent">
              <Skeleton className="size-8 rounded-full shrink-0" />
            </MessageAvatar>
            <MessageContent className="w-2/3 max-w-[75%] gap-1.5 items-start">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-14 w-full rounded-2xl rounded-bl-xs" />
              <Skeleton className="h-2.5 w-24" />
            </MessageContent>
          </Message>

          {/* Bubble Skeleton 2: Right */}
          <Message align="end" className="items-end gap-2.5">
            <MessageAvatar className="size-8 bg-transparent">
              <Skeleton className="size-8 rounded-full shrink-0" />
            </MessageAvatar>
            <MessageContent className="w-1/2 max-w-[75%] gap-1.5 items-end">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-2xl rounded-br-xs" />
              <Skeleton className="h-2.5 w-20" />
            </MessageContent>
          </Message>

          {/* Bubble Skeleton 3: Left */}
          <Message align="start" className="items-end gap-2.5">
            <MessageAvatar className="size-8 bg-transparent">
              <Skeleton className="size-8 rounded-full shrink-0" />
            </MessageAvatar>
            <MessageContent className="w-3/5 max-w-[75%] gap-1.5 items-start">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-12 w-full rounded-2xl rounded-bl-xs" />
              <Skeleton className="h-2.5 w-24" />
            </MessageContent>
          </Message>
        </MessageGroup>
      ) : (
        <ScrollArea className="h-[280px] sm:h-[320px] pr-3">
          <MessageGroup className="gap-4 py-2">
            {orderedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                projectId={projectId}
              />
            ))}

            {orderedComments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[280px] text-center p-6 text-muted-foreground">
                <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center mb-2.5">
                  <IconMessageCircle className="h-5 w-5 text-muted-foreground/70" />
                </div>
                <p className="font-medium text-foreground text-sm">
                  Belum ada komentar
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  Mulai obrolan untuk berdiskusi mengenai pekerjaan laporan
                  harian ini.
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </MessageGroup>
        </ScrollArea>
      )}

      {/* Footer / Bottom Input */}
      <div className="pt-2 border-t">
        <CommentForm
          projectId={projectId}
          reportId={reportId}
          onSuccess={() => {
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        />
      </div>
    </div>
  );
}
