import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardCardData } from "@/lib/dashboardApi"
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardCardsProps = {
  dashboards: DashboardCardData[]
  onSelect: (dashboard: DashboardCardData) => void
  onDelete: (dashboard: DashboardCardData) => void
}

export function DashboardCards({ dashboards, onSelect, onDelete }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <DashboardCard key={dashboard._id} dashboard={dashboard} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  )
}

function DashboardCard({
  dashboard,
  onSelect,
  onDelete,
}: {
  dashboard: DashboardCardData
  onSelect: (dashboard: DashboardCardData) => void
  onDelete: (dashboard: DashboardCardData) => void
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(dashboard)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect(dashboard)
      }}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardHeader>
        <CardTitle>{dashboard.text}</CardTitle>
        <CardDescription>{dashboard.metadata.dashboard_description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around">
          <p className="text-xs text-muted-foreground">Updated {dashboard.metadata.update_timestamp}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              // Stop the click from bubbling to the Card, which would open the dashboard.
              e.stopPropagation()
              onDelete(dashboard)
            }}
            onKeyDown={(e) => e.stopPropagation()}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
