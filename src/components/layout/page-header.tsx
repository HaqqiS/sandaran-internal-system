import type { ReactNode } from "react";

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
      className={`flex flex-row items-center justify-between gap-4 px-4 lg:px-6 pt-4 pb-0 ${className}`}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-lg capitalize font-semibold tracking-tight">
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
