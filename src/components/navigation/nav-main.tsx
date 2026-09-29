"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { ProjectSelector } from "./project-selector";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const isItemActive = (itemUrl: string) => {
    const cleanPath =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
    const cleanUrl =
      itemUrl.length > 1 && itemUrl.endsWith("/")
        ? itemUrl.slice(0, -1)
        : itemUrl;

    // Exact match
    if (cleanPath === cleanUrl) return true;

    // Root path and project list should only match exact
    if (cleanUrl === "/" || cleanUrl === "/projects") return false;

    // Subpath match (e.g. /users/123 should activate /users)
    if (cleanPath.startsWith(`${cleanUrl}/`)) {
      // Check if another item in navMain is a more specific match
      const hasMoreSpecific = items.some((other) => {
        const otherClean =
          other.url.length > 1 && other.url.endsWith("/")
            ? other.url.slice(0, -1)
            : other.url;
        return (
          otherClean !== cleanUrl &&
          (cleanPath === otherClean ||
            cleanPath.startsWith(`${otherClean}/`)) &&
          otherClean.length > cleanUrl.length
        );
      });
      return !hasMoreSpecific;
    }

    return false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="hidden md:block">
          <SidebarMenuItem>
            <ProjectSelector />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const isActive = isItemActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  className={cn(
                    isActive &&
                      "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  )}
                >
                  <Link
                    href={item.url}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
