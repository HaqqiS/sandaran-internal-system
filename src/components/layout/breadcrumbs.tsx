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
import { extractShortIdFromSlug } from "~/lib/slug-utils";
import { cn } from "~/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  projects: "Proyek",
  reports: "Laporan",
  logistics: "Logistik",
  documents: "Dokumen",
  emergency: "Kas Darurat",
  users: "Pengguna",
  dashboard: "Dashboard",
  settings: "Pengaturan",
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function toTitleCase(str: string): string {
  return str
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatBreadcrumbLabel(segment: string, prevSegment?: string): string {
  const lower = segment.toLowerCase();

  // 1. Label statis bawaan rute
  if (ROUTE_LABELS[lower]) {
    return ROUTE_LABELS[lower];
  }

  // 2. Segmen Detail Laporan (berada setelah "/reports/")
  if (prevSegment === "reports") {
    // Hilangkan timestamp milidetik di akhir: e.g. -1791953865327
    const cleanedReport = segment.replace(/-\d{10,14}$/, "");

    // Jika mengandung tanggal YYYY-MM-DD
    const dateMatch = cleanedReport.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      const monthIdx = Number.parseInt(month ?? "1", 10) - 1;
      const monthLabel = MONTH_NAMES[monthIdx] ?? month;
      return `Laporan ${Number.parseInt(day ?? "1", 10)} ${monthLabel} ${year}`;
    }

    return toTitleCase(cleanedReport);
  }

  // 3. Segmen Proyek (berada setelah "/projects/")
  if (prevSegment === "projects") {
    const shortId = extractShortIdFromSlug(segment);
    if (
      shortId &&
      segment.toLowerCase().endsWith(`-${shortId.toLowerCase()}`)
    ) {
      const base = segment.slice(0, -(shortId.length + 1));
      if (base) return toTitleCase(base);
    }
    return toTitleCase(segment);
  }

  // 4. Default format
  return toTitleCase(segment);
}

function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);
  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join("/")}`;
    const prevPath = index > 0 ? paths[index - 1] : undefined;
    const label = formatBreadcrumbLabel(path, prevPath);
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
