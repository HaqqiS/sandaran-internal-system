import { api } from "~/trpc/react"

/**
 * Project Management Hooks
 *
 * tRPC hooks for project CRUD and member management
 */

export function useProjectList() {
  return api.project.getAll.useQuery()
}

export function useProject(projectId: string) {
  return api.project.getById.useQuery({ projectId }, { enabled: !!projectId })
}

export function useProjectMembers(projectId: string) {
  return api.project.getMembers.useQuery(
    { projectId },
    { enabled: !!projectId },
  )
}

export function useCreateProject() {
  const utils = api.useUtils()
  return api.project.create.useMutation({
    onSuccess: () => {
      void utils.project.getAll.invalidate()
    },
  })
}

export function useUpdateProject() {
  const utils = api.useUtils()
  return api.project.update.useMutation({
    onSuccess: (data) => {
      void utils.project.getById.invalidate({ projectId: data.id })
      void utils.project.getAll.invalidate()
    },
  })
}

export function useDeleteProject() {
  const utils = api.useUtils()
  return api.project.delete.useMutation({
    onSuccess: () => {
      void utils.project.getAll.invalidate()
    },
  })
}

export function useAddProjectMember() {
  const utils = api.useUtils()
  return api.project.addMember.useMutation({
    onSuccess: (data) => {
      void utils.project.getMembers.invalidate({ projectId: data.projectId })
      void utils.project.getById.invalidate({ projectId: data.projectId })
    },
  })
}

export function useUpdateMemberRole() {
  const utils = api.useUtils()
  return api.project.updateMemberRole.useMutation({
    onSuccess: (data) => {
      void utils.project.getMembers.invalidate({ projectId: data.projectId })
    },
  })
}

export function useRemoveMember() {
  const utils = api.useUtils()
  return api.project.removeMember.useMutation({
    onSuccess: () => {
      // Invalidate all since we don't have projectId in response
      void utils.project.getMembers.invalidate()
    },
  })
}
