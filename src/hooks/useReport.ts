import { api } from "~/trpc/react"

/**
 * Daily Report Hooks
 *
 * tRPC hooks for daily reports, tasks, and media
 */

export function useReport(projectId: string, reportId: string) {
  return api.report.getById.useQuery(
    { projectId, reportId },
    { enabled: !!projectId && !!reportId },
  )
}

export function useReportsByProject(
  projectId: string,
  limit = 20,
  cursor?: string,
) {
  return api.report.getByProject.useQuery(
    { projectId, limit, cursor },
    { enabled: !!projectId },
  )
}

export function useCreateReport() {
  const utils = api.useUtils()
  return api.report.create.useMutation({
    onSuccess: (_data, variables) => {
      void utils.report.getByProject.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}

export function useUpdateReport() {
  const utils = api.useUtils()
  return api.report.update.useMutation({
    onSuccess: (data) => {
      void utils.report.getById.invalidate({
        projectId: data.projectId,
        reportId: data.id,
      })
      void utils.report.getByProject.invalidate({ projectId: data.projectId })
    },
  })
}

export function useDeleteReport() {
  const utils = api.useUtils()
  return api.report.delete.useMutation({
    onSuccess: (_data, variables) => {
      void utils.report.getByProject.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}

export function useAddReportTask() {
  const utils = api.useUtils()
  return api.report.addTask.useMutation({
    onSuccess: (_data, variables) => {
      void utils.report.getById.invalidate({
        projectId: variables.projectId,
        reportId: variables.reportId,
      })
    },
  })
}

export function useUpdateReportTask() {
  const utils = api.useUtils()
  return api.report.updateTask.useMutation({
    onSuccess: () => {
      // Invalidate all since we don't have reportId in variables
      void utils.report.getById.invalidate()
    },
  })
}

export function useDeleteReportTask() {
  const utils = api.useUtils()
  return api.report.deleteTask.useMutation({
    onSuccess: () => {
      // Invalidate all since we don't have reportId in variables
      void utils.report.getById.invalidate()
    },
  })
}

export function useUploadReportMedia() {
  const utils = api.useUtils()
  return api.report.uploadMedia.useMutation({
    onSuccess: (_data, variables) => {
      void utils.report.getById.invalidate({
        projectId: variables.projectId,
        reportId: variables.reportId,
      })
    },
  })
}

export function useDeleteReportMedia() {
  const utils = api.useUtils()
  return api.report.deleteMedia.useMutation({
    onSuccess: () => {
      // Invalidate all since we don't have reportId in variables
      void utils.report.getById.invalidate()
    },
  })
}
