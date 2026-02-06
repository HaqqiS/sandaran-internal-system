"use client"

import type * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"
import { useMediaQuery } from "~/hooks/use-media-query"
import { ProjectForm } from "./project-form"

interface ProjectDialogProps {
  project?: {
    id: string
    name: string
    slug: string
    description?: string | null
    location?: string | null
    startDate?: Date | null
    endDate?: Date | null
    status: "ACTIVE" | "DONE" | "PAUSED"
  }
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  children,
}: ProjectDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const isEditMode = !!project

  const title = isEditMode ? "Edit Project" : "New Project"
  const description = isEditMode
    ? "Make changes to your project."
    : "Create a new construction project."

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={project}
            onSuccess={() => onOpenChange?.(false)}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <ProjectForm
            project={project}
            onSuccess={() => onOpenChange?.(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
