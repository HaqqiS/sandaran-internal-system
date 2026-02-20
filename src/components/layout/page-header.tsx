interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-1 px-4 lg:px-6 pt-4 pb-0 ${className}`}>
      <h1 className="text-lg capitalize font-semibold tracking-tight">
        {title}
      </h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
