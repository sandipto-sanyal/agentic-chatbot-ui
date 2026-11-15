import { ArrowDown, ArrowRight, Bot, Database, Monitor, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const GUARANTEES = [
  "The planner sees the user's question, the table and column names, and the SQL it wrote.",
  "Result rows are masked before the orchestrator sees them. It only gets a status message.",
  "Rows are streamed to the UI over the websocket, so your data stays in your environment.",
]

function Node({
  icon: Icon,
  title,
  caption,
  dashed = false,
}: {
  icon: typeof Database
  title: string
  caption: string
  dashed?: boolean
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-2 rounded-xl bg-background p-4 text-center ring-1 ring-foreground/10 ${
        dashed ? "border border-dashed border-border" : ""
      }`}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}

function Connector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground">
      <ArrowRight className="hidden size-4 md:block" aria-hidden="true" />
      <ArrowDown className="size-4 md:hidden" aria-hidden="true" />
      <span className="max-w-32">{label}</span>
    </div>
  )
}

export function PrivacyHighlight() {
  return (
    <Card className="overflow-hidden bg-linear-to-br from-emerald-50 via-card to-card p-0 dark:from-emerald-950/40">
      <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
        <div className="flex flex-col gap-4">
          <Badge className="w-fit bg-emerald-600 text-white">
            <ShieldCheck aria-hidden="true" />
            Data privacy
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your enterprise data never goes to the LLM
          </h2>
          <p className="text-muted-foreground">
            The model plans every next step, but it never reads the rows your
            query returns. Only the question, the schema, and the SQL leave the
            query path.
          </p>
          <ul className="flex flex-col gap-2.5 text-sm">
            {GUARANTEES.map((item) => (
              <li key={item} className="flex gap-2.5">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-4 md:gap-5">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <Node icon={Database} title="Your database" caption="Rows are produced here" dashed />
            <Connector label="rows" />
            <Node icon={ShieldCheck} title="Flask backend" caption="Keeps rows out of the LLM" />
            <Connector label="rows" />
            <Node icon={Monitor} title="Your screen" caption="Rows are shown here only" />
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide">What the planner receives</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <Node icon={Bot} title="Planner LLM" caption="Gets the task, schema, SQL and a masked status" dashed />
          </div>
        </div>
      </div>
    </Card>
  )
}
