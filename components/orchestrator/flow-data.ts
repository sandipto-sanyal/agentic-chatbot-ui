import { Bot, GitBranch, Play, Save, Search, type LucideIcon } from "lucide-react"

// Mirrors public/orchestrator_flow_plotly.mmd. Keep the two in sync when the flow changes.

export type FlowBranch = {
  label: string
  detail: string
  tools: string[]
}

export type FlowStage = {
  title: string
  description: string
  icon: LucideIcon
  tools: string[]
  parallel?: boolean
  branches?: FlowBranch[]
  // Marks the step where result rows are produced. They go to the UI and are masked from the LLM.
  keepsDataLocal?: boolean
}

export const FLOW_STAGES: FlowStage[] = [
  {
    title: "Receive the task",
    description:
      "The orchestrator reads the user's question and decides which sub-agent to call first.",
    icon: Bot,
    tools: ["user_task"],
  },
  {
    title: "Gather context",
    description:
      "The database schema is read and past tasks are searched for a match, at the same time.",
    icon: Search,
    tools: ["get_database_schema", "get_similar_tasks"],
    parallel: true,
  },
  {
    title: "Choose a query path",
    description:
      "A similar past task reuses its saved SQL. Otherwise a new query is written from the schema.",
    icon: GitBranch,
    tools: [],
    branches: [
      {
        label: "Similar task found",
        detail: "Reuse the saved query and its MongoDB object id",
        tools: ["mongodb_object_id", "query"],
      },
      {
        label: "No match",
        detail: "Simplify the question into SQL using the schema",
        tools: ["simplify_query"],
      },
    ],
  },
  {
    title: "Run the query",
    description:
      "The SQL runs inside your database. Result rows are streamed to the UI only. The orchestrator receives a masked status message instead.",
    icon: Play,
    tools: ["query_runner"],
    keepsDataLocal: true,
  },
  {
    title: "Remember and visualise",
    description:
      "The task and its query are stored, and Plotly chart code is generated and attached to the saved record.",
    icon: Save,
    tools: ["store_user_task", "generate_plotly_vizualizer_code", "put_plotly_code_in_metadata"],
    parallel: true,
  },
]
