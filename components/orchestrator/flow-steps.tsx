import { ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FLOW_STAGES } from "./flow-data"

export function FlowSteps() {
  return (
    <ol className="flex flex-col">
      {FLOW_STAGES.map((stage, index) => {
        const Icon = stage.icon
        const isLast = index === FLOW_STAGES.length - 1
        return (
          <li key={stage.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-6"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">
                  <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
                  {stage.title}
                </p>
                {stage.parallel && <Badge variant="secondary">parallel</Badge>}
                {stage.keepsDataLocal && (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    <ShieldCheck aria-hidden="true" />
                    Rows never reach the LLM
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>

              {stage.tools.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stage.tools.map((tool) => (
                    <Badge key={tool} variant="outline" className="font-mono">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}

              {stage.branches && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {stage.branches.map((branch) => (
                    <div
                      key={branch.label}
                      className="rounded-lg border border-dashed border-border bg-muted/40 p-3"
                    >
                      <p className="text-sm font-medium">{branch.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{branch.detail}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {branch.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="font-mono">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
