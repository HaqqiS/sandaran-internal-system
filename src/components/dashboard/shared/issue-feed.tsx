"use client";

import {
  IconAlertTriangle,
  IconArrowRight,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatWitaDate } from "~/lib/time-utils";
import { cn } from "~/lib/utils";

export interface RecentIssueItem {
  id: string;
  slug: string;
  reportDate: Date | string;
  issues: string;
  projectName: string;
  projectSlug: string;
  reporterName: string;
}

interface IssueFeedProps {
  issues: RecentIssueItem[];
  className?: string;
}

export function IssueFeed({ issues, className }: IssueFeedProps) {
  return (
    <Card
      className={cn("overflow-hidden flex flex-col justify-between", className)}
    >
      <CardHeader className="p-4 md:p-5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="h-4 w-4 text-status-attention shrink-0" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            Kendala Terbaru Dilaporkan
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-semibold px-2 py-0.5",
            issues.length > 0
              ? "border-status-attention bg-status-attention-bg text-status-attention"
              : "text-muted-foreground",
          )}
        >
          {issues.length} Dilaporkan
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {issues.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
            <IconCircleCheck className="h-6 w-6 text-status-success mx-auto opacity-80" />
            <p className="font-medium text-foreground">
              Tidak ada kendala aktif
            </p>
            <p>Tidak ada kendala dilaporkan dalam laporan harian terbaru.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/projects/${issue.projectSlug}/reports/${issue.slug}`}
                className="block p-3.5 hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {issue.projectName}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatWitaDate(issue.reportDate, { shortMonth: true })}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">
                    oleh {issue.reporterName}
                  </span>
                </div>

                <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed bg-status-attention-bg/20 p-2 rounded border border-status-attention/20">
                  {issue.issues}
                </p>

                <div className="flex justify-end mt-1.5">
                  <span className="inline-flex items-center text-[11px] text-primary font-medium">
                    Buka Laporan
                    <IconArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
