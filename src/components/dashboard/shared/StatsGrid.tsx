"use client";

import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface StatsGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

export function StatsGrid({
  children,
  cols = { mobile: 2, tablet: 3, desktop: 4 },
  className,
}: StatsGridProps) {
  const gridCols: Record<number, string> = {
    2: "grid-cols-2",
    3: "md:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const mobileClass = cols.mobile
    ? (gridCols[cols.mobile] ?? "grid-cols-2")
    : "grid-cols-2";
  const tabletClass = cols.tablet
    ? (gridCols[cols.tablet] ?? "md:grid-cols-3")
    : "md:grid-cols-3";
  const desktopClass = cols.desktop
    ? (gridCols[cols.desktop] ?? "lg:grid-cols-4")
    : "lg:grid-cols-4";

  return (
    <div
      className={cn(
        "grid gap-4",
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
