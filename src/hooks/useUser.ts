import { api } from "~/trpc/react";

/**
 * User Hooks
 */

export function useUserList() {
  return api.user.getAllUsersWithFilter.useQuery({});
}

export function useUserListWithFilter(options: {
  filter: "all" | "pending" | "active" | "rejected";
  search: string;
}) {
  return api.user.getAllUsersWithFilter.useQuery(
    {
      filter: options.filter,
      search: options.search,
    },
    {
      enabled: !!options.filter || !!options.search,
    },
  );
}

export function useUserDetails(userId: string) {
  return api.user.getUserDetails.useQuery(
    { userId },
    {
      enabled: !!userId,
    },
  );
}

export function useCurrentUser() {
  return api.user.getCurrentUser.useQuery();
}

export function useSearchUsers(query: string = "") {
  // Always enabled now, server handles empty string
  return api.user.search.useQuery({ query });
}

export function useApproveUser() {
  const utils = api.useUtils();
  return api.user.approveUser.useMutation({
    onSuccess: () => {
      void utils.user.invalidate();
    },
  });
}

export function useRejectUser() {
  const utils = api.useUtils();
  return api.user.rejectUser.useMutation({
    onSuccess: () => {
      void utils.user.invalidate();
    },
  });
}

export function useUpdateUserRole() {
  const utils = api.useUtils();
  return api.user.updateGlobalRole.useMutation({
    onSuccess: () => {
      void utils.user.invalidate();
    },
  });
}

export function useDeleteUser() {
  const utils = api.useUtils();
  return api.user.deleteUser.useMutation({
    onSuccess: () => {
      void utils.user.invalidate();
    },
  });
}

export function useBulkApprove(options?: {
  onSuccess?: (data: { count: number }) => void;
  onError?: (error: { message: string }) => void;
}) {
  const utils = api.useUtils();
  return api.user.bulkApprove.useMutation({
    onSuccess: (data) => {
      void utils.user.invalidate();
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
}
