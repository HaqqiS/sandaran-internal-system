"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

interface ActionItem {
  label: string
  icon?: ReactNode
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
}

interface QuickActionCardProps {
  title: string
  description?: string
  actions: ActionItem[]
}

export function QuickActionCard({
  title,
  description,
  actions,
}: QuickActionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action) => {
          const buttonContent = (
            <>
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </>
          )

          if (action.href) {
            return (
              <Button
                key={action.label}
                asChild
                className="w-full"
                variant={action.variant ?? "outline"}
              >
                <Link href={action.href}>{buttonContent}</Link>
              </Button>
            )
          }

          return (
            <Button
              key={action.label}
              className="w-full"
              variant={action.variant ?? "outline"}
              onClick={action.onClick}
            >
              {buttonContent}
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
