import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 pt-4 pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:px-6 min-w-0",
        className,
      )}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <h1 className="text-lg capitalize font-semibold tracking-tight break-words">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
