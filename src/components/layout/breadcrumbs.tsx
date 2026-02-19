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
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.length === 0 ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (isMobile && !isLast) {
              return null;
            }

            return (
              <React.Fragment key={breadcrumb.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href}>
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
