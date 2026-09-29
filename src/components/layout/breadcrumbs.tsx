"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";

function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);
  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join("/")}`;
    const label =
      path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
    return { href, label };
  });
}

export function ParsedBreadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const isMobile = useIsMobile();

  return (
    <Breadcrumb className="min-w-0 w-full">
      <BreadcrumbList className="flex-nowrap min-w-0 overflow-hidden">
        {breadcrumbs.length === 0 ? (
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-medium">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (isMobile && !isLast) {
              return null;
            }

            return (
              <React.Fragment key={breadcrumb.href}>
                <BreadcrumbItem className={cn("min-w-0", isLast && "flex-1")}>
                  {isLast ? (
                    <BreadcrumbPage
                      title={breadcrumb.label}
                      className="truncate block max-w-full font-medium"
                    >
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={breadcrumb.href}
                      className="truncate max-w-[120px] sm:max-w-[200px]"
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="shrink-0" />}
              </React.Fragment>
            );
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
