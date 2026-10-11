"use client";

import {
  IconAlertTriangle,
  IconArrowRight,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export interface AttentionItem {
  key: string;
  count: number;
  label: string;
  href?: string;
  actionLabel?: string;
  severity?: "warning" | "destructive" | "info";
}

export interface AttentionListProps {
  title?: string;
  items: AttentionItem[];
  className?: string;
  showAllClear?: boolean;
}

export function AttentionList({
  title = "Perlu Tindakan",
  items,
  className,
  showAllClear = false,
}: AttentionListProps) {
  const activeItems = items.filter((item) => item.count > 0);

  if (activeItems.length === 0) {
    if (!showAllClear) return null;

    return (
      <Card
        className={cn(
          "border-status-success-border/60 bg-status-success-bg/30 p-4 transition-colors",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <IconCircleCheck className="h-5 w-5 text-status-success shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Semua operasional berjalan lancar
            </p>
            <p className="text-xs text-muted-foreground">
              Tidak ada antrean darurat, laporan terlambat, atau stok minus yang
              membutuhkan tindakan segera.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-status-attention/60 bg-status-attention-bg/25 overflow-hidden",
        className,
      )}
    >
      <CardHeader className="p-4 pb-2 border-b border-status-attention/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="h-4 w-4 text-status-attention shrink-0" />
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
            {title}
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="border-status-attention/60 bg-status-attention-bg text-status-attention text-xs font-semibold px-2 py-0.5"
        >
          {activeItems.reduce((acc, curr) => acc + curr.count, 0)} Isu
        </Badge>
      </CardHeader>

      <CardContent className="p-2 md:p-3 divide-y divide-status-attention/15">
        {activeItems.map((item) => {
          const actionBtn = (
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 md:min-h-9 px-3 text-xs font-medium text-foreground hover:bg-status-attention/15 hover:text-foreground active:scale-95 transition-transform"
            >
              {item.actionLabel ?? "Tinjau"}
              <IconArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          );

          return (
            <div
              key={item.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-status-attention/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-attention text-xs font-bold text-white dark:text-black">
                  {item.count}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              </div>

              {item.href ? (
                <div className="self-end sm:self-auto">
                  <Link href={item.href} className="inline-block">
                    {actionBtn}
                  </Link>
                </div>
              ) : (
                <div className="self-end sm:self-auto">{actionBtn}</div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
