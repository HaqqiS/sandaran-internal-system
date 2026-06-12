import { api } from "~/trpc/react";

/**
 * Logistic Hooks
 *
 * tRPC hooks for logistic item and transaction management
 */
export function useLogisticsAnalytics() {
  return api.logistic.getAnalytics.useQuery();
}

export function useLogisticItems(projectId: string) {
  return api.logistic.getItems.useQuery(
    { projectId },
    { enabled: !!projectId },
  );
}

export function useLogisticTransactions(projectId: string, itemId?: string) {
  return api.logistic.getTransactions.useInfiniteQuery(
    { projectId, itemId, limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!projectId,
    },
  );
}

export function useLogisticStockSummary(projectId: string) {
  return api.logistic.getStockSummary.useQuery(
    { projectId },
    { enabled: !!projectId },
  );
}

export function useCreateLogisticItem() {
  const utils = api.useUtils();
  return api.logistic.createItem.useMutation({
    onMutate: async (newItem) => {
      await utils.logistic.getItems.cancel({ projectId: newItem.projectId });
      const previousItems = utils.logistic.getItems.getData({
        projectId: newItem.projectId,
      });

      // Optimistically update
      if (previousItems) {
        utils.logistic.getItems.setData(
          { projectId: newItem.projectId },
          [
            ...previousItems,
            {
              id: `temp-id-${Date.now()}`,
              projectId: newItem.projectId,
              name: newItem.name,
              unit: newItem.unit,
              slug: `temp-slug-${Date.now()}`,
              createdAt: new Date(),
              _count: { transactions: 0 },
            },
          ].sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
      return { previousItems };
    },
    onError: (_err, newItem, context) => {
      if (context?.previousItems) {
        utils.logistic.getItems.setData(
          { projectId: newItem.projectId },
          context.previousItems,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      void utils.logistic.getItems.invalidate({
        projectId: variables.projectId,
      });
      void utils.logistic.getStockSummary.invalidate({
        projectId: variables.projectId,
      });
    },
  });
}

export function useUpdateLogisticItem() {
  const utils = api.useUtils();
  return api.logistic.updateItem.useMutation({
    onMutate: async (updatedItem) => {
      await utils.logistic.getItems.cancel({
        projectId: updatedItem.projectId,
      });
      const previousItems = utils.logistic.getItems.getData({
        projectId: updatedItem.projectId,
      });

      if (previousItems) {
        utils.logistic.getItems.setData(
          { projectId: updatedItem.projectId },
          previousItems.map((item) =>
            item.id === updatedItem.itemId
              ? {
                  ...item,
                  name: updatedItem.name ?? item.name,
                  unit: updatedItem.unit ?? item.unit,
                }
              : item,
          ),
        );
      }
      return { previousItems };
    },
    onError: (_err, updatedItem, context) => {
      if (context?.previousItems) {
        utils.logistic.getItems.setData(
          { projectId: updatedItem.projectId },
          context.previousItems,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      void utils.logistic.getItems.invalidate({
        projectId: variables.projectId,
      });
      void utils.logistic.getStockSummary.invalidate({
        projectId: variables.projectId,
      });
    },
  });
}

export function useDeleteLogisticItem() {
  const utils = api.useUtils();
  return api.logistic.deleteItem.useMutation({
    onMutate: async (deletedItem) => {
      await utils.logistic.getItems.cancel({
        projectId: deletedItem.projectId,
      });
      const previousItems = utils.logistic.getItems.getData({
        projectId: deletedItem.projectId,
      });

      if (previousItems) {
        utils.logistic.getItems.setData(
          { projectId: deletedItem.projectId },
          previousItems.filter((item) => item.id !== deletedItem.itemId),
        );
      }
      return { previousItems };
    },
    onError: (_err, deletedItem, context) => {
      if (context?.previousItems) {
        utils.logistic.getItems.setData(
          { projectId: deletedItem.projectId },
          context.previousItems,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      void utils.logistic.getItems.invalidate({
        projectId: variables.projectId,
      });
      void utils.logistic.getStockSummary.invalidate({
        projectId: variables.projectId,
      });
    },
  });
}

export function useRecordLogisticTransaction() {
  const utils = api.useUtils();
  return api.logistic.recordTransaction.useMutation({
    onMutate: async (newTx) => {
      await utils.logistic.getTransactions.cancel();
      await utils.logistic.getStockSummary.cancel({
        projectId: newTx.projectId,
      });

      const previousSummary = utils.logistic.getStockSummary.getData({
        projectId: newTx.projectId,
      });

      if (previousSummary) {
        utils.logistic.getStockSummary.setData(
          { projectId: newTx.projectId },
          previousSummary.map((item) => {
            if (item.id === newTx.itemId) {
              const currentStock =
                newTx.type === "IN"
                  ? item.currentStock + newTx.quantity
                  : item.currentStock - newTx.quantity;
              const totalIn =
                newTx.type === "IN"
                  ? item.totalIn + newTx.quantity
                  : item.totalIn;
              const totalOut =
                newTx.type === "OUT"
                  ? item.totalOut + newTx.quantity
                  : item.totalOut;
              return { ...item, currentStock, totalIn, totalOut };
            }
            return item;
          }),
        );
      }
      return { previousSummary };
    },
    onError: (_err, newTx, context) => {
      if (context?.previousSummary) {
        utils.logistic.getStockSummary.setData(
          { projectId: newTx.projectId },
          context.previousSummary,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      void utils.logistic.getTransactions.invalidate({
        projectId: variables.projectId,
      });
      void utils.logistic.getStockSummary.invalidate({
        projectId: variables.projectId,
      });
    },
  });
}
