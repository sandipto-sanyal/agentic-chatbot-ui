import { useEffect, useRef, useState, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import Markdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast, Toaster } from "@/components/ui/toast"
import { DATABASES } from "@/common/databases"




// API_SPEC: the Flask server exposes the websocket at /ws (the spec writes it as http://; browsers need ws://).
// Set in .env as VITE_WS_URL.
const WS_URL = import.meta.env.VITE_WS_URL

const MESSAGE_TYPES = [
  "ProgressMessage",
  "ToolMessage",
  "SubagentMessage",
  "OrchestratorMessage",
  "QueryRunnerMessage"
] as const

type MessageType = (typeof MESSAGE_TYPES)[number]

// Tool results arrive as a list of objects, e.g. get_similar_tasks returns the matching
// task text plus the SQL it used (under metadata.query) and a similarity score.
type ToolResult = {
  text: string
  metadata?: Record<string, unknown>
  score?: number
}

// The spec is inconsistent about casing: SubagentMessage uses `toolname`, the others use `toolName`.
type ServerMessage = {
  type_: MessageType
  toolName: string | null
  step: number | null
  content: string | ToolResult[]
}

type Turn = {
  id: number
  task: string
  events: ServerMessage[]
  answer: string | null
  status: "running" | "done" | "error"
  error?: string
}

type Connection = "connecting" | "open" | "closed"

function normalize(raw: unknown): ServerMessage | null {
  if (typeof raw !== "object" || raw === null) return null
  const item = raw as Record<string, unknown>
  const type = item.type_
  if (typeof type !== "string" || !(MESSAGE_TYPES as readonly string[]).includes(type)) return null
  const content = item.content
  const isText = typeof content === "string"
  const isResultList = Array.isArray(content)
  if (!isText && !isResultList) return null

  const toolName = item.toolName ?? item.toolname
  return {
    type_: type as MessageType,
    toolName: typeof toolName === "string" ? toolName : null,
    step: typeof item.step === "number" ? item.step : null,
    content: isText ? content : (content as ToolResult[]),
  }
}

// Flatten either content shape to plain text (used for the final answer).
function contentToText(content: string | ToolResult[]): string {
  if (typeof content === "string") return content
  return content.map((result) => result.text).join("\n\n")
}

// The server sends either a single message or an array of them per frame.
function parseFrame(data: unknown): ServerMessage[] {
  if (typeof data !== "string") return []
  let json: unknown
  try {
    json = JSON.parse(data)
  } catch {
    return []
  }
  const items = Array.isArray(json) ? json : [json]
  return items.flatMap((item) => {
    const message = normalize(item)
    return message ? [message] : []
  })
}

// Route a server message to the turn currently waiting for an answer.
function applyMessage(turns: Turn[], message: ServerMessage): Turn[] {
  const index = turns.findLastIndex((turn) => turn.status === "running")
  if (index === -1) return turns

  const turn = turns[index]
  const updated: Turn =
    message.type_ === "QueryRunnerMessage"
      ? { ...turn, answer: contentToText(message.content), status: "done" }
      : { ...turn, events: [...turn.events, message] }

  return turns.map((t, i) => (i === index ? updated : t))
}

const STATUS_LABEL: Record<Connection, string> = {
  connecting: "Connecting…",
  open: "Connected",
  closed: "Disconnected",
}

export default function Chat() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState("")
  const [connection, setConnection] = useState<Connection>("connecting")
  const [database, setDatabase] = useState<string>("")
  const socketRef = useRef<WebSocket | null>(null)
  const nextId = useRef(1)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    socketRef.current = socket

    socket.onopen = () => setConnection("open")
    socket.onmessage = (event) => {
      const messages = parseFrame(event.data)
      if (messages.length === 0) return
      setTurns((prev) => messages.reduce(applyMessage, prev))
    }
    socket.onclose = () => {
      setConnection("closed")
      setTurns((prev) =>
        prev.map((turn) =>
          turn.status === "running"
            ? { ...turn, status: "error", error: "Connection closed before the answer arrived." }
            : turn,
        ),
      )
    }

    return () => {
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      socket.close()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [turns])

  const busy = turns.some((turn) => turn.status === "running")
  const canSend = connection === "open" && !busy && draft.trim().length > 0

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const task = draft.trim()
    const socket = socketRef.current
    if (!task || busy || !socket || socket.readyState !== WebSocket.OPEN) return
    if (database === "") {
      toast.add({
        type:"error",
        description:"A database must be selected",
        priority: "high"
      })
      return
    }
    socket.send(JSON.stringify({ 
      "task" : task,
      "database":database
    }))
    const id = nextId.current++
    setTurns((prev) => [...prev, { id, task, events: [], answer: null, status: "running" }])
    setDraft("")
  }


  function renderDatabases() {
    return (
      <Select items={DATABASES} 
      onValueChange={(e) => {setDatabase(e as string)}} 
      defaultValue={DATABASES[0].value}>
        <SelectTrigger className="h-9 w-44 shrink-0 border-0 bg-transparent px-3 shadow-none data-[size=default]:h-9 focus-visible:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Databases</SelectLabel>
            {DATABASES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }
  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-3xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chat</h1>
        <Badge variant={connection === "open" ? "default" : "secondary"}>
          {STATUS_LABEL[connection]}
        </Badge>
      </header>

      <ScrollArea className="min-h-0 flex-1 rounded-lg border">
        <div className="flex flex-col gap-6 p-4">
          {turns.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask a question about the database, e.g. “Department wise Average Salaries”.
            </p>
          )}
          {turns.map((turn) => (
            <TurnView key={turn.id} turn={turn} />
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border bg-card p-2 shadow-sm">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question..."
          aria-label="Message"
          disabled={connection !== "open"}
          className="h-9 flex-1 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
        {renderDatabases()}
        <Button type="submit" disabled={!canSend} className="h-9 shrink-0 px-4">
          Send
        </Button>
      </form>
      <Toaster />
      <div className="hidden">
        <pre>
          {JSON.stringify(database, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function TurnView({ turn }: { turn: Turn }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
        {turn.task}
      </div>

      {turn.events.length > 0 && <ActivityPanel events={turn.events} />}

      {turn.status === "running" && (
        <p className="text-sm text-muted-foreground">Working…</p>
      )}

      {turn.answer !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm"><Markdown remarkPlugins={[remarkGfm]}>{turn.answer}</Markdown></CardContent>
        </Card>
      )}

      {turn.status === "error" && (
        <Card className="border-destructive">
          <CardContent className="text-sm text-destructive">{turn.error}</CardContent>
        </Card>
      )}
    </div>
  )
}

// Intermediate messages (progress, tool, subagent) are collapsed by default so the
// chat stays readable; the header shows the latest event as a one-line preview.
function ActivityPanel({ events }: { events: ServerMessage[] }) {
  const [open, setOpen] = useState(false)
  const latest = events[events.length - 1]

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-md border bg-muted/30 text-sm"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground">
        <span className="flex min-w-0 items-center gap-2">
          <span className="font-medium">Activity</span>
          <Badge variant="secondary">{events.length}</Badge>
          {!open && (
            <span className="truncate font-mono">
              {latest.toolName ?? latest.type_}
            </span>
          )}
        </span>
        <span aria-hidden="true">{open ? "Hide" : "Show"}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-2 border-t px-3 py-2">
        {events.map((event, i) => (
          <EventRow key={i} event={event} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function EventRow({ event }: { event: ServerMessage }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{event.type_}</Badge>
        {event.toolName && <span className="font-mono">{event.toolName}</span>}
        {event.step !== null && <span>step {event.step}</span>}
      </div>
      {event.type_ === "ToolMessage" || event.type_ === "SubagentMessage" ? (
        <MarkdownBody content={event.content} />
      ) : typeof event.content === "string" ? (
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs">
          {event.content}
        </pre>
      ) : (
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs">
          {contentToText(event.content)}
        </pre>
      )}
    </div>
  )
}

// Tool and subagent output is Markdown: render it with the same renderer as answers. Result
// lists show each result's text, its score, and the SQL from metadata.query as a fenced block.
function MarkdownBody({ content }: { content: string | ToolResult[] }) {
  if (typeof content === "string") {
    return <ToolMarkdown>{content}</ToolMarkdown>
  }

  return (
    <div className="flex flex-col gap-2">
      {content.map((result, i) => {
        const query = result.metadata?.query
        return (
          <div key={i} className="flex flex-col gap-1 rounded-md border bg-background p-2">
            {typeof result.score === "number" && (
              <div className="flex justify-end">
                <Badge variant="outline">{result.score.toFixed(2)}</Badge>
              </div>
            )}
            <ToolMarkdown>{result.text}</ToolMarkdown>
            {typeof query === "string" && (
              <ToolMarkdown>{"```sql\n" + query + "\n```"}</ToolMarkdown>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ToolMarkdown({ children }: { children: string }) {
  return (
    <div className="text-xs [&_code]:font-mono [&_p]:my-1 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_table]:text-left">
      <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>
    </div>
  )
}
