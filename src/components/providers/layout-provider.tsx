"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useState } from "react"

interface LayoutConfig {
  headerTitle?: string
  headerActions?: ReactNode
  hideSidebar?: boolean
}

interface LayoutContextValue {
  config: LayoutConfig
  setConfig: (config: LayoutConfig) => void
  updateConfig: (partial: Partial<LayoutConfig>) => void
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

/**
 * Layout Provider
 *
 * Provides context for pages to customize their layout:
 * - Header title
 * - Header actions (buttons, etc)
 * - Hide sidebar (optional)
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LayoutConfig>({
    headerTitle: "Dashboard",
    headerActions: undefined,
    hideSidebar: false,
  })

  const updateConfig = useCallback((partial: Partial<LayoutConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  return (
    <LayoutContext.Provider value={{ config, setConfig, updateConfig }}>
      {children}
    </LayoutContext.Provider>
  )
}

/**
 * Hook to access and update layout configuration
 *
 * Usage in pages:
 * ```tsx
 * "use client"
 * import { useLayout } from "~/components/providers/layout-provider"
 *
 * export default function MyPage() {
 *   const { updateConfig } = useLayout()
 *
 *   useEffect(() => {
 *     updateConfig({
 *       headerTitle: "My Page",
 *       headerActions: <Button>Action</Button>
 *     })
 *   }, [updateConfig])
 *
 *   return <div>Content</div>
 * }
 * ```
 */
export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider")
  }
  return context
}
