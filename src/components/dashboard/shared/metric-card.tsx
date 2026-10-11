"use client";

import type { TablerIcon } from "@tabler/icons-react";
import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconRefresh,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export interface MetricCardProps {
  label: string;
  value: number | string;
  caption?: string;
  previous?: {
    value: number;
    periodLabel: string;
  };
  href?: string;
  tone?: "default" | "attention";
  icon?: TablerIcon | ComponentType<{ className?: string }>;
  action?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  caption,
  previous,
  href,
  tone = "default",
  icon: Icon,
  action,
  isLoading = false,
  isError = false,
  onRetry,
  className,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card
        className={cn(
          "flex flex-col justify-between overflow-hidden p-4 md:p-5 transition-colors",
          className,
        )}
      >
        <CardHeader className="p-0 space-y-0 pb-3 flex flex-row items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-5 rounded-md" />
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3.5 w-36" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card
        className={cn(
          "flex flex-col justify-between overflow-hidden border-destructive/40 bg-destructive/5 p-4 md:p-5",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <IconAlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-destructive">
              Gagal memuat data
            </p>
          </div>
        </div>
        {onRetry && (
          <div className="mt-3 pt-2 border-t border-destructive/20 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-95"
            >
              <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          </div>
        )}
      </Card>
    );
  }

  // Hitung delta numerik internal jika previous diberikan
  let deltaInfo: {
    delta: number;
    formatted: string;
    isPositive: boolean;
    isZero: boolean;
  } | null = null;

  if (previous !== undefined) {
    const currentNum =
      typeof value === "number" ? value : Number.parseFloat(String(value));
    if (!Number.isNaN(currentNum)) {
      const delta = currentNum - previous.value;
      deltaInfo = {
        delta,
        formatted: delta > 0 ? `+${delta}` : `${delta}`,
        isPositive: delta > 0,
        isZero: delta === 0,
      };
    }
  }

  const isAttention = tone === "attention";

  const cardInner = (
    <Card
      className={cn(
        "flex flex-col justify-between overflow-hidden p-4 md:p-5 transition-all duration-150 ease-out",
        href &&
          "cursor-pointer hover:border-primary/50 hover:shadow-sm active:scale-[0.99]",
        isAttention &&
          "border-status-attention/60 bg-status-attention-bg/40 text-foreground",
        className,
      )}
    >
      <CardHeader className="p-0 space-y-0 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-medium text-muted-foreground line-clamp-1">
          {label}
        </CardTitle>
        <div className="flex items-center gap-1.5">
          {action}
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4",
                isAttention
                  ? "text-status-attention"
                  : "text-muted-foreground/70",
              )}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "text-xl md:text-2xl font-bold tracking-tight text-foreground",
              isAttention && "text-status-attention",
            )}
          >
            {value}
          </span>
          {isAttention && (
            <Badge
              variant="outline"
              className="border-status-attention/60 bg-status-attention-bg text-status-attention text-[11px] px-1.5 py-0 font-medium"
            >
              Perlu Atensi
            </Badge>
          )}
        </div>

        {(caption || deltaInfo) && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            {deltaInfo && !deltaInfo.isZero && (
              <span
                className={cn(
                  "inline-flex items-center font-medium",
                  deltaInfo.isPositive
                    ? "text-status-success"
                    : "text-status-attention",
                )}
              >
                {deltaInfo.isPositive ? (
                  <IconArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                ) : (
                  <IconArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                )}
                {deltaInfo.formatted}
              </span>
            )}
            {deltaInfo && previous && (
              <span className="text-muted-foreground/90">
                {previous.periodLabel}
              </span>
            )}
            {!deltaInfo && caption && (
              <span className="line-clamp-1 text-muted-foreground">
                {caption}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}
