import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const STEPS = [
  {
    title: "Read the schema",
    description:
      "The user's task and the database schema are read at the same time, so the agent knows which tables and columns exist before it writes any SQL.",
    tags: ["get_database_schema"],
  },
  {
    title: "Look for a similar past task",
    description:
      "The task is compared against tasks that were answered before. If a close match exists, its SQL is returned from the cache.",
    tags: ["get_similar_tasks", "QuerySimilarityCache"],
  },
  {
    title: "Reuse or generate",
    description:
      "On a cache hit, the saved query goes straight to the runner. On a miss, the agent simplifies the question into a query using the schema.",
    tags: ["query_runner", "simplify_query"],
  },
  {
    title: "Remember the answer",
    description:
      "After a fresh query is generated, the task and its query are stored so the next similar question can skip generation.",
    tags: ["store_user_task"],
  },
]

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
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 pt-16 pb-10">
        <Badge variant="outline" className="w-fit">About</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          How the agent answers your question
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          This app pairs a React chat interface with a Flask backend. Behind it,
          an orchestrator turns plain-language tasks into SQL, and remembers
          the queries it has already written so it can reuse them.
        </p>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">The query flow</h2>
        <ol className="grid gap-6 md:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <CardHeader>
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {step.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-mono">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-10">
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

      <section className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-6 pt-4 pb-20">
        <p className="text-muted-foreground">Want to see it in action?</p>
        <Button size="lg" render={<Link to="/chat" />}>
          Try the chatbot
        </Button>
      </section>
    </main>
  )
}
