import type { TablerIcon } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: TablerIcon
  description?: string
  trend?: {
    value: number | string
    label: string
    positive?: boolean
  }
  className?: string
  action?: React.ReactNode
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  action,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {action && <div>{action}</div>}
        </div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  "mr-2 font-medium",
                  trend.positive === true && "text-green-600",
                  trend.positive === false && "text-red-600",
                )}
              >
                {trend.value}
              </span>
            )}
            {trend && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
            {!trend && description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
