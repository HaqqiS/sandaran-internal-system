"use client";

import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface StatsGridProps {
  children: ReactNode;
  cols?: {
    mobile?: 1 | 2 | 3 | 4;
    tablet?: 1 | 2 | 3 | 4;
    desktop?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  className?: string;
}

const mobileColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const tabletColsMap: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const desktopColsMap: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export function StatsGrid({
  children,
  cols = { mobile: 2, tablet: 3, desktop: 4 },
  className,
}: StatsGridProps) {
  const mobileClass = cols.mobile
    ? (mobileColsMap[cols.mobile] ?? "grid-cols-2")
    : "grid-cols-2";
  const tabletClass = cols.tablet
    ? (tabletColsMap[cols.tablet] ?? "md:grid-cols-3")
    : "md:grid-cols-3";
  const desktopClass = cols.desktop
    ? (desktopColsMap[cols.desktop] ?? "lg:grid-cols-4")
    : "lg:grid-cols-4";

  return (
    <div
      className={cn(
        "grid gap-3 md:gap-4",
        mobileClass,
        tabletClass,
        desktopClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
