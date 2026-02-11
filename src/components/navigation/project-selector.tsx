"use client"

import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import { useParams, useRouter } from "next/navigation"
import * as React from "react"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Skeleton } from "~/components/ui/skeleton"
import { useProjectList } from "~/hooks"
import { cn } from "~/lib/utils"

export function ProjectSelector() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const params = useParams()
  const urlProjectSlug = params?.slug as string | undefined

  const [selectedProjectId, setSelectedProjectId] = React.useState<
    string | null
  >(null)

  const { data: projects, isLoading } = useProjectList()

  const selectedProject = projects?.find((p) => p.id === selectedProjectId)

  // Sync state with URL and LocalStorage
  React.useEffect(() => {
    if (urlProjectSlug && projects) {
      // Case 1: URL has a project slug (User is in a project)
      const project = projects.find((p) => p.slug === urlProjectSlug)
      if (project) {
        setSelectedProjectId(project.id)
        localStorage.setItem("selectedProjectId", project.id)
      }
    } else {
      // Case 2: URL does NOT have a project slug (User is on global page like /dashboard)
      // We explicitly clear the selection state here to allow "Unselect" behavior.
      setSelectedProjectId(null)

      // Only clear localStorage if we are NOT on the root path.
      // We want to keep localStorage for the "Root Redirect" case below.
      if (window.location.pathname !== "/") {
        localStorage.removeItem("selectedProjectId")
      }
    }
  }, [urlProjectSlug, projects])

  // Handle initial navigation from localStorage (ROOT PATH ONLY)
  React.useEffect(() => {
    // Only redirect if we are exactly on the root "/" or maybe "/login" success landing.
    // We do NOT redirect if the user is on "/dashboard" or any other specific page.
    if (window.location.pathname === "/" && projects) {
      const savedProjectId = localStorage.getItem("selectedProjectId")
      if (savedProjectId) {
        const savedProject = projects.find((p) => p.id === savedProjectId)
        if (savedProject) {
          router.push(`/projects/${savedProject.slug}`)
        }
      }
    }
  }, [projects, router])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-lg h-14 w-full">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton className="h-4 w-4 shrink-0" />
      </div>
    )
  }

  // Group projects by status
  const groupedProjects = projects?.reduce(
    (acc, project) => {
      const status = project.status || "OTHERS"
      if (!acc[status]) acc[status] = []
      acc[status].push(project)
      return acc
    },
    {} as Record<string, typeof projects>,
  )

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2 px-3 bg-sidebar-accent/50 hover:bg-sidebar-accent border-sidebar-border"
        >
          {selectedProject ? (
            <div className="flex items-center gap-3 text-left min-w-0">
              <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {/* Fallback to initials since image URL might be missing or not in schema yet */}
                <AvatarFallback className="rounded-lg font-semibold text-xs">
                  {getInitials(selectedProject.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-medium text-sm leading-none">
                  {selectedProject.name}
                </span>
                <span className="truncate text-xs text-muted-foreground mt-1">
                  {selectedProject.location || "No location"}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Select project...</span>
          )}
          <IconChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search project..." />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            {groupedProjects &&
              Object.entries(groupedProjects).map(([status, groupProjects]) => (
                <CommandGroup key={status} heading={status}>
                  {groupProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => {
                        setSelectedProjectId(project.id)
                        setOpen(false)
                        router.push(`/projects/${project.slug}`)
                      }}
                      className="gap-3 py-2 cursor-pointer"
                    >
                      <Avatar className="h-6 w-6 rounded-md bg-muted text-muted-foreground">
                        <AvatarFallback className="rounded-md text-[10px]">
                          {getInitials(project.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">
                          {project.name}
                        </span>
                        {project.location && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {project.location}
                          </span>
                        )}
                      </div>
                      <IconCheck
                        className={cn(
                          "ml-auto h-4 w-4 text-primary transition-opacity",
                          selectedProjectId === project.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
