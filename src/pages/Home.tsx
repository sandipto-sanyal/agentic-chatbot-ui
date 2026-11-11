import { Link } from "react-router-dom"
import { Activity, Network, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function Home() {
  return (
    <main className="flex flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center">
        <Badge variant="outline">React + Flask</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          An agentic chatbot that shows its work
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Ask a question and follow along as the agent plans, calls tools, and
          delegates to subagents. The final answer arrives with the full trail
          behind it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link to="/chat" />}>
            Start chatting
          </Button>
          <Button size="lg" variant="outline" render={<Link to="/about" />}>
            Learn more
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
