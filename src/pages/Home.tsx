import { Link } from "react-router-dom"
import { Activity, CheckCircle2, LoaderCircle, Network, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrchestratorFlowPopover } from "@/components/orchestrator/orchestrator-flow-popover"
import { PrivacyHighlight } from "@/components/orchestrator/privacy-highlight"
import { DashboardHighlight } from "@/components/orchestrator/dashboard-highlight"

const FEATURES = [
  {
    icon: Activity,
    title: "Live progress",
    description:
      "Watch every step of the agent's work as it streams in over a websocket, instead of waiting for a single final reply.",
  },
  {
    icon: Wrench,
    title: "Tool visibility",
    description:
      "See which tools the agent calls, with the inputs and results, so you always know where an answer came from.",
  },
  {
    icon: Network,
    title: "Orchestrated subagents",
    description:
      "Complex tasks are split across subagents by an orchestrator, and each subagent's progress is shown as it runs.",
  },
]

// Sample run shown in the hero. It illustrates the live progress view and is not real data.
const SAMPLE_RUN = [
  { tool: "get_database_schema", status: "done", note: "12 tables found" },
  { tool: "get_similar_tasks", status: "done", note: "No close match" },
  { tool: "simplify_query", status: "done", note: "SQL written from schema" },
  { tool: "query_runner", status: "done", note: "Rows shown in UI only" },
  { tool: "store_user_task", status: "running", note: "Saving task" },
]

export default function Home() {
  return (
    <main className="flex flex-col">
      <section className="bg-linear-to-b from-brand-primary/5 to-transparent">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit">
              React + Flask · Agentic
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Ask your data in plain English, and watch the agent work
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Follow along as the agent plans, calls tools, and delegates to
              subagents. The final answer arrives with the full trail behind it.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" render={<Link to="/chat" />}>
                Start chatting
              </Button>
              <OrchestratorFlowPopover />
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sample run</CardTitle>
                <Badge variant="secondary">Live</Badge>
              </div>
              <CardDescription>What the progress view looks like while a question runs.</CardDescription>
            </CardHeader>
            <ul className="flex flex-col gap-3 px-4 pb-4">
              {SAMPLE_RUN.map((item) => (
                <li
                  key={item.tool}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5"
                >
                  {item.status === "done" ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-label="done" />
                  ) : (
                    <LoaderCircle
                      className="size-4 shrink-0 animate-spin text-brand-primary"
                      aria-label="running"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs font-medium">{item.tool}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <PrivacyHighlight />
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <DashboardHighlight />
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">What you get</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="pt-2">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
