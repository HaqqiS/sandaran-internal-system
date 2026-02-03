import type * as React from "react"

/**
 * Dashboard Type Definitions
 */

export interface NavItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export interface NavDocument {
  name: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface UserData {
  name: string
  email: string
  avatar?: string
}

export interface SidebarConfig {
  user: UserData
  navMain: NavItem[]
  navDocuments?: NavDocument[]
  navSecondary?: NavItem[]
  companyName?: string
  companyIcon?: React.ComponentType<{ className?: string }>
}
