import { useEffect, useRef, useState, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import Markdown from "react-markdown"
import remarkGfm from 'remark-gfm'

// API_SPEC: the Flask server exposes the websocket at /ws (the spec writes it as http://; browsers need ws://).
const WS_URL = "ws://127.0.0.1:5000/ws"

const MESSAGE_TYPES = [
  "ProgressMessage",
  "ToolMessage",
  "SubagentMessage",
  "OrchestratorMessage",
] as const

type MessageType = (typeof MESSAGE_TYPES)[number]

// The spec is inconsistent about casing: SubagentMessage uses `toolname`, the others use `toolName`.
type ServerMessage = {
  type_: MessageType
  toolName: string | null
  step: number | null
  content: string
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
  if (typeof item.content !== "string") return null

  const toolName = item.toolName ?? item.toolname
  return {
    type_: type as MessageType,
    toolName: typeof toolName === "string" ? toolName : null,
    step: typeof item.step === "number" ? item.step : null,
    content: item.content,
  }
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
    message.type_ === "OrchestratorMessage"
      ? { ...turn, answer: message.content, status: "done" }
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

    socket.send(JSON.stringify({ task }))
    const id = nextId.current++
    setTurns((prev) => [...prev, { id, task, events: [], answer: null, status: "running" }])
    setDraft("")
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

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question…"
          aria-label="Message"
          disabled={connection !== "open"}
        />
        <Button type="submit" disabled={!canSend}>
          Send
        </Button>
      </form>
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
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs">
        {event.content}
      </pre>
    </div>
  )
}
