import { api } from "~/trpc/react"

/**
 * User Hooks
 */

export function useSearchUsers(query: string = "") {
  // Always enabled now, server handles empty string
  return api.user.search.useQuery({ query })
}
