"use client"

import {
  IconCoin,
  IconDashboard,
  IconFileText,
  IconFolder,
  IconInnerShadowTop,
  IconNews,
  IconPackage,
  IconReport,
  IconUsers,
} from "@tabler/icons-react"
import type { GlobalRole } from "generated/prisma"
import type { ReactNode } from "react"
import { DashboardLayout } from "~/components/layout"
import {
  LayoutProvider,
  useLayout,
} from "~/components/providers/layout-provider"
import { useSession } from "~/stores/use-session-store"
import type { SidebarConfig } from "~/types/dashboard"

/**
 * Internal Layout Client Component
 *
 * Provides shared DashboardLayout (sidebar + header) for all internal pages.
 * Pages can customize layout via useLayout() hook.
 */

interface InternalLayoutClientProps {
  children: ReactNode
}

function getSidebarConfig(
  user: {
    name: string | null
    email: string
    image?: string | null
  },
  role: GlobalRole,
): SidebarConfig {
  // Base configuration
  const baseConfig: SidebarConfig = {
    user: {
      name: user.name ?? "User",
      email: user.email,
      avatar: user.image ?? "/avatars/default.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
    ],
    navDocuments: [],
    companyName: "Sandaran Home Living",
    companyIcon: IconInnerShadowTop,
  }

  // Role-specific navigation
  switch (role) {
    case "USER":
      return {
        ...baseConfig,
        navMain: [
          ...baseConfig.navMain,
          {
            title: "My Reports",
            url: "/reports",
            icon: IconReport,
          },
          {
            title: "Emergency Funds",
            url: "/emergency",
            icon: IconCoin,
          },
          {
            title: "Logistics",
            url: "/logistics",
            icon: IconPackage,
          },
        ],
      }

    case "CEO":
      return {
        ...baseConfig,
        navMain: [
          ...baseConfig.navMain,
          {
            title: "All Projects",
            url: "/ceo/projects",
            icon: IconFolder,
          },
          {
            title: "Reports",
            url: "/ceo/reports",
            icon: IconNews,
          },
        ],
      }

    case "ADMIN":
      return {
        ...baseConfig,
        navMain: [
          ...baseConfig.navMain,
          {
            title: "Projects",
            url: "/projects",
            icon: IconFolder,
          },
          {
            title: "Users",
            url: "/users",
            icon: IconUsers,
          },
          {
            title: "Documents",
            url: "/documents",
            icon: IconFileText,
          },
        ],
      }

    default:
      return baseConfig
  }
}

function LayoutContent({ children }: { children: ReactNode }) {
  // Get session from Zustand store
  const { user, role } = useSession()

  // Get layout config from context
  const { config } = useLayout()

  // Ensure we have user data (should always be true due to layout auth guard)
  if (!user) {
    return null
  }

  // Ensure roleGlobal is a valid GlobalRole, fallback to "USER"
  const validRole = (role ?? "USER") as GlobalRole
  const sidebarConfig = getSidebarConfig(
    {
      name: user.name,
      email: user.email,
      image: user.image,
    },
    validRole,
  )

  return (
    <DashboardLayout
      sidebarConfig={sidebarConfig}
      headerTitle={config.headerTitle}
      headerActions={config.headerActions}
    >
      {children}
    </DashboardLayout>
  )
}

export function InternalLayoutClient({ children }: InternalLayoutClientProps) {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  )
}
