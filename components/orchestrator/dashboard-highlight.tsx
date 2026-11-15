import { BarChart3, Save, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const STEPS = [
  {
    icon: Sparkles,
    title: "Chart code is generated",
    description: "The agent writes Plotly code from the question and the SQL that answered it.",
  },
  {
    icon: Save,
    title: "Saved with the query",
    description: "The chart code, description and SQL are stored with the task, so no one has to rebuild it.",
  },
  {
    icon: BarChart3,
    title: "Rendered on the dashboard",
    description: "The Dashboard page re-runs the saved query and draws the chart for the selected database.",
  },
]

export function DashboardHighlight() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            <BarChart3 aria-hidden="true" />
            Automated dashboards
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Every answer can become a dashboard, without manual chart work
          </h2>
          <p className="text-muted-foreground">
            When the orchestrator answers a question, it also builds the chart
            for it. Saved charts appear on the Dashboard page automatically, and
            they stay up to date because each one re-runs its query.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 md:gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-2 self-stretch">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {index < STEPS.length - 1 && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-2">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
