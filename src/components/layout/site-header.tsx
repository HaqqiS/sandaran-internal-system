import type * as React from "react";

import { ThemeToggle } from "~/components/theme-toggle";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { ParsedBreadcrumbs } from "./breadcrumbs";

interface SiteHeaderProps {
  actions?: React.ReactNode;
}

export function SiteHeader({ actions }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-1 px-3 sm:px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-1 sm:mx-2 shrink-0 data-[orientation=vertical]:h-6 sm:data-[orientation=vertical]:h-8"
        />

        <div className="flex-1 min-w-0 overflow-hidden">
          <ParsedBreadcrumbs />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
