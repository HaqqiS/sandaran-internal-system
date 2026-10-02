"use client";

import { IconCheck, IconDoorExit, IconInfoCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useProjectList } from "~/hooks";
import { cn } from "~/lib/utils";
import { useProjectStore } from "~/stores/project-store";

interface ProjectSwitcherDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRoute?: {
    tabLabel: string;
    pathSuffix?: string;
  } | null;
  onDeselect?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif",
  DONE: "Selesai",
  PAUSED: "Dijeda",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SkeletonList() {
  return (
    <div className="space-y-3 p-2">
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton placeholder array
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectSwitcherDrawer({
  open,
  onOpenChange,
  targetRoute,
  onDeselect,
}: ProjectSwitcherDrawerProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const { data: projects, isLoading } = useProjectList();
  const {
    selectedProjectSlug,
    selectedProjectName,
    setSelectedProject,
    clearSelectedProject,
  } = useProjectStore();

  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    const query = search.toLowerCase().trim();
    if (!query) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.location?.toLowerCase().includes(query) ?? false),
    );
  }, [projects, search]);

  const groupedByStatus = React.useMemo(() => {
    return filteredProjects.reduce<Record<string, typeof filteredProjects>>(
      (acc, project) => {
        const key = project.status || "OTHERS";
        if (!acc[key]) acc[key] = [];
        acc[key].push(project);
        return acc;
      },
      {},
    );
  }, [filteredProjects]);

  const handleSelect = (project: { slug: string; name: string }) => {
    // Toggle deselect: clicking the already-active project deselects it
    // (mirrors project-selector.tsx behavior)
    if (selectedProjectSlug === project.slug) {
      onDeselect?.();
      clearSelectedProject();
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedProjectId");
      }
      onOpenChange(false);
      router.push("/dashboard");
      toast.success("Keluar dari proyek", {
        description: "Kembali ke Dashboard",
        position: "top-center",
      });
      return;
    }

    setSelectedProject(project.slug, project.name);
    onOpenChange(false);
    const destination = targetRoute?.pathSuffix
      ? `/projects/${project.slug}/${targetRoute.pathSuffix}`
      : `/projects/${project.slug}`;
    router.push(destination);
  };

  const handleDeselect = () => {
    onDeselect?.();
    clearSelectedProject();
    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedProjectId");
    }
    onOpenChange(false);
    router.push("/dashboard");
    toast.success("Keluar dari proyek", {
      description: "Kembali ke Dashboard",
      position: "top-center",
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80dvh] flex flex-col">
        <DrawerHeader className="text-left shrink-0 border-b pb-3 px-6 pt-4">
          <DrawerTitle>Pilih Proyek</DrawerTitle>
          {selectedProjectName && (
            <p className="text-xs text-muted-foreground mt-1">
              Aktif: {selectedProjectName}
            </p>
          )}
        </DrawerHeader>

        {/* Guidance Banner when opened from disabled tab */}
        {targetRoute && (
          <div className="mx-4 mt-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-xs text-primary font-medium shrink-0">
            <IconInfoCircle className="size-4 shrink-0" />
            <span>
              Pilih proyek terlebih dahulu untuk membuka {targetRoute.tabLabel}
            </span>
          </div>
        )}

        {/* Quick action: Keluar dari proyek / Deselect to Dashboard */}
        {selectedProjectSlug && (
          <div className="px-4 pt-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate text-muted-foreground">
                  Aktif:{" "}
                  <strong className="text-foreground font-medium">
                    {selectedProjectName}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleDeselect}
                className="flex items-center gap-1.5 shrink-0 text-destructive hover:text-destructive/80 font-medium min-h-9 px-2.5 py-1.5 rounded-md hover:bg-destructive/10 active:scale-95 transition-all text-xs"
              >
                <IconDoorExit size={15} />
                <span>Keluar ke Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <Input
            placeholder="Cari proyek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus={false}
          />
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-2 pb-safe scroll-pb-24"
          data-vaul-no-drag
        >
          {isLoading ? (
            <SkeletonList />
          ) : filteredProjects.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Proyek tidak ditemukan
            </p>
          ) : (
            Object.entries(groupedByStatus).map(([status, items]) => (
              <div key={status} className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
                  {STATUS_LABELS[status] ?? status}
                </p>
                <div className="space-y-1">
                  {items.map((project) => (
                    <button
                      type="button"
                      key={project.id}
                      onClick={() => handleSelect(project)}
                      aria-label={
                        selectedProjectSlug === project.slug
                          ? `Batalkan pilihan ${project.name}`
                          : `Pilih ${project.name}`
                      }
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left min-h-12",
                        "active:scale-[0.98] transition-transform hover:bg-accent",
                        selectedProjectSlug === project.slug &&
                          "bg-primary/10 text-primary",
                      )}
                    >
                      <Avatar className="h-8 w-8 rounded-lg shrink-0">
                        <AvatarFallback className="rounded-lg text-xs font-semibold">
                          {getInitials(project.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate font-medium text-sm">
                          {project.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {project.location ?? "Lokasi tidak tersedia"}
                        </span>
                      </div>
                      {selectedProjectSlug === project.slug && (
                        <div className="ml-auto flex flex-col items-center gap-0.5 shrink-0">
                          <IconCheck className="size-4 text-primary" />
                          <span className="text-[9px] text-muted-foreground leading-none">
                            Keluar
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
