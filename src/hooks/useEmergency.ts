import type { TransactionStatus } from "generated/prisma"
import { api } from "~/trpc/react"

/**
 * Emergency Fund Hooks
 *
 * tRPC hooks for emergency fund management
 */

export function useEmergencyFund(projectId: string) {
  return api.emergency.getByProject.useQuery(
    { projectId },
    { enabled: !!projectId },
  )
}

export function useEmergencyTransactions(
  projectId: string,
  status?: TransactionStatus,
) {
  return api.emergency.getTransactions.useQuery(
    { projectId, status },
    { enabled: !!projectId },
  )
}

export function useAddEmergencyBalance() {
  const utils = api.useUtils()
  return api.emergency.addBalance.useMutation({
    onSuccess: (_data, variables) => {
      void utils.emergency.getByProject.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}

export function useRequestEmergencyFund() {
  const utils = api.useUtils()
  return api.emergency.request.useMutation({
    onSuccess: (_data, variables) => {
      void utils.emergency.getByProject.invalidate({
        projectId: variables.projectId,
      })
      void utils.emergency.getTransactions.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}

export function useVerifyEmergencyRequest() {
  const utils = api.useUtils()
  return api.emergency.verify.useMutation({
    onSuccess: (_data, variables) => {
      void utils.emergency.getByProject.invalidate({
        projectId: variables.projectId,
      })
      void utils.emergency.getTransactions.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}
