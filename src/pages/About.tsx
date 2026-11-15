import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrchestratorFlowPopover } from "@/components/orchestrator/orchestrator-flow-popover"
import { FlowSteps } from "@/components/orchestrator/flow-steps"
import { PrivacyHighlight } from "@/components/orchestrator/privacy-highlight"
import { DashboardHighlight } from "@/components/orchestrator/dashboard-highlight"

const HIGHLIGHTS = [
  {
    title: "Faster repeat questions",
    description:
      "Questions that look like ones already answered skip query generation and go straight to execution.",
  },
  {
    title: "Schema-aware queries",
    description:
      "Every new query is written against the live database schema, not guessed from the question alone.",
  },
  {
    title: "Live progress",
    description:
      "The chat page streams each step as it happens, so you can see whether an answer came from the cache or was freshly generated.",
  },
]

export default function About() {
  return (
    <main className="flex flex-col">
      <section className="bg-linear-to-b from-brand-primary/5 to-transparent">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 pt-20 pb-14">
          <Badge variant="outline" className="w-fit">
            About
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How the agent answers your question
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            This app pairs a React chat interface with a Flask backend. Behind
            it, an orchestrator turns plain-language tasks into SQL, and
            remembers the queries it has already written so it can reuse them.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <PrivacyHighlight />
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <DashboardHighlight />
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-12 px-6 pb-16 md:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">The query flow</h2>
          <p className="text-muted-foreground">
            Each question passes through the same five stages. The orchestrator
            chooses the order, and each sub-agent does one job.
          </p>
          <div>
            <OrchestratorFlowPopover />
          </div>
        </div>
        <FlowSteps />
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Why it works this way</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-6 pb-24">
        <p className="text-lg text-muted-foreground">Want to see it in action?</p>
        <Button size="lg" render={<Link to="/chat" />}>
          Try the chatbot
        </Button>
      </section>
    </main>
  )
}
