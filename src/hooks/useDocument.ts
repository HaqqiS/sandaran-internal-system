import type { DocumentType } from "generated/prisma"
import { api } from "~/trpc/react"

/**
 * Document Hooks
 *
 * tRPC hooks for project documents
 */

export function useDocumentsByProject(
  projectId: string,
  fileType?: DocumentType,
) {
  return api.document.getByProject.useQuery(
    { projectId, fileType },
    { enabled: !!projectId },
  )
}

export function useDocument(projectId: string, documentId: string) {
  return api.document.getById.useQuery(
    { projectId, documentId },
    { enabled: !!projectId && !!documentId },
  )
}

export function useUploadDocument() {
  const utils = api.useUtils()
  return api.document.upload.useMutation({
    onSuccess: (_data, variables) => {
      void utils.document.getByProject.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}

export function useUpdateDocument() {
  const utils = api.useUtils()
  return api.document.update.useMutation({
    onSuccess: (data) => {
      void utils.document.getById.invalidate({
        projectId: data.projectId,
        documentId: data.id,
      })
      void utils.document.getByProject.invalidate({
        projectId: data.projectId,
      })
    },
  })
}

export function useDeleteDocument() {
  const utils = api.useUtils()
  return api.document.delete.useMutation({
    onSuccess: (_data, variables) => {
      void utils.document.getByProject.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}
