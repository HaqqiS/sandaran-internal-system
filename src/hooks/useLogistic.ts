import { api } from "~/trpc/react"

/**
 * Logistic Hooks
 *
 * tRPC hooks for logistic item and transaction management
 */

export function useLogisticItems(projectId: string) {
  return api.logistic.getItems.useQuery({ projectId }, { enabled: !!projectId })
}

export function useLogisticTransactions(projectId: string, itemId?: string) {
  return api.logistic.getTransactions.useQuery(
    { projectId, itemId },
    { enabled: !!projectId },
  )
}

export function useLogisticStockSummary(projectId: string) {
  return api.logistic.getStockSummary.useQuery(
    { projectId },
    { enabled: !!projectId },
  )
}

export function useCreateLogisticItem() {
  const utils = api.useUtils()
  return api.logistic.createItem.useMutation({
    onSuccess: (_data, variables) => {
      void utils.logistic.getItems.invalidate({
        projectId: variables.projectId,
      })
      void utils.logistic.getStockSummary.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}

export function useUpdateLogisticItem() {
  const utils = api.useUtils()
  return api.logistic.updateItem.useMutation({
    onSuccess: (data) => {
      void utils.logistic.getItems.invalidate({ projectId: data.projectId })
    },
  })
}

export function useDeleteLogisticItem() {
  const utils = api.useUtils()
  return api.logistic.deleteItem.useMutation({
    onSuccess: (_data, variables) => {
      void utils.logistic.getItems.invalidate({
        projectId: variables.projectId,
      })
      void utils.logistic.getStockSummary.invalidate({
        projectId: variables.projectId,
      })
    },
  })
}

export function useRecordLogisticTransaction() {
  const utils = api.useUtils()
  return api.logistic.recordTransaction.useMutation({
    onSuccess: (data) => {
      void utils.logistic.getTransactions.invalidate({
        projectId: data.item.projectId,
      })
      void utils.logistic.getStockSummary.invalidate({
        projectId: data.item.projectId,
      })
    },
  })
}
