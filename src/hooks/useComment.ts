import { api } from "~/trpc/react";

/**
 * Comment Hooks
 *
 * tRPC hooks for report comments
 */

export function useCommentsByReport(projectId: string, reportId: string) {
  return api.comment.getByReport.useQuery(
    { projectId, reportId },
    { enabled: !!projectId && !!reportId },
  );
}

export function useCreateComment(options?: {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}) {
  const utils = api.useUtils();
  return api.comment.create.useMutation({
    onSuccess: (_data, variables) => {
      void utils.comment.getByReport.invalidate({
        projectId: variables.projectId,
        reportId: variables.reportId,
      });
      void utils.report.getBySlug.invalidate();
      void utils.report.getRecentByProject.invalidate();
      void utils.report.getByProject.invalidate({
        projectId: variables.projectId,
      });
      void utils.dashboard.invalidate();
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function useUpdateComment(options?: {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}) {
  const utils = api.useUtils();
  return api.comment.update.useMutation({
    onSuccess: () => {
      // Invalidate all since we don't have reportId in variables
      void utils.comment.getByReport.invalidate();
      void utils.report.getBySlug.invalidate();
      void utils.dashboard.invalidate();
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function useDeleteComment(options?: {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}) {
  const utils = api.useUtils();
  return api.comment.delete.useMutation({
    onSuccess: (_data, variables) => {
      // Invalidate all since we don't have reportId in variables
      void utils.comment.getByReport.invalidate({
        projectId: variables.projectId,
      });
      void utils.report.getBySlug.invalidate();
      void utils.report.getRecentByProject.invalidate();
      void utils.report.getByProject.invalidate({
        projectId: variables.projectId,
      });
      void utils.dashboard.invalidate();
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
