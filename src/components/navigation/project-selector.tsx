"use client"

import { IconCheck, IconChevronDown, IconMapPin } from "@tabler/icons-react"
import * as React from "react"
import { Badge } from "~/components/ui/badge"
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
import { useProjectList } from "~/hooks"
import { cn } from "~/lib/utils"

export function ProjectSelector() {
  const [open, setOpen] = React.useState(false)
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    string | null
  >(null)

  const { data: projects, isLoading } = useProjectList()

  const selectedProject = projects?.find((p) => p.id === selectedProjectId)

  // Persist selection to localStorage
  React.useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("selectedProjectId", selectedProjectId)
    }
  }, [selectedProjectId])

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedProjectId = localStorage.getItem("selectedProjectId")
    if (savedProjectId && projects?.some((p) => p.id === savedProjectId)) {
      setSelectedProjectId(savedProjectId)
    }
  }, [projects])

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full md:w-full" disabled>
        Loading projects...
      </Button>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <Button variant="outline" className="w-full md:w-full" disabled>
        No projects available
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full md:w-full"
        >
          {selectedProject ? (
            <span className="flex items-center gap-2">
              <IconMapPin className="w-4 h-4" />
              <span className="truncate">{selectedProject.name}</span>
            </span>
          ) : (
            "Select project..."
          )}
          <IconChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 md:w-full" align="start">
        <Command>
          <CommandInput placeholder="Search project..." />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.id}
                  onSelect={(currentValue) => {
                    setSelectedProjectId(
                      currentValue === selectedProjectId ? null : currentValue,
                    )
                    setOpen(false)
                  }}
                >
                  <IconCheck
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProjectId === project.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate">{project.name}</span>
                    {project.location && (
                      <span className="text-xs truncate text-muted-foreground">
                        {project.location}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {project.status}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
