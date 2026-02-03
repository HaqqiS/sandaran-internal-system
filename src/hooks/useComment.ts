import { api } from "~/trpc/react"

/**
 * Comment Hooks
 *
 * tRPC hooks for report comments
 */

export function useCommentsByReport(projectId: string, reportId: string) {
  return api.comment.getByReport.useQuery(
    { projectId, reportId },
    { enabled: !!projectId && !!reportId },
  )
}

export function useCreateComment() {
  const utils = api.useUtils()
  return api.comment.create.useMutation({
    onSuccess: (_data, variables) => {
      void utils.comment.getByReport.invalidate({
        projectId: variables.projectId,
        reportId: variables.reportId,
      })
    },
  })
}

export function useUpdateComment() {
  const utils = api.useUtils()
  return api.comment.update.useMutation({
    onSuccess: () => {
      // Invalidate all since we don't have reportId in variables
      void utils.comment.getByReport.invalidate()
    },
  })
}

export function useDeleteComment() {
  const utils = api.useUtils()
  return api.comment.delete.useMutation({
    onSuccess: () => {
      // Invalidate all since we don't have reportId in variables
      void utils.comment.getByReport.invalidate()
    },
  })
}
