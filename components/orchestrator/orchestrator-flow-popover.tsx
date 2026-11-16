import { ExternalLink, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FlowSteps } from "./flow-steps"

export function OrchestratorFlowPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button size="lg" variant="outline" />}>
        <Workflow data-icon="inline-start" aria-hidden="true" />
        See the orchestrator flow
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-[75vh] w-[min(30rem,calc(100vw-2rem))] gap-4 overflow-y-auto p-5"
      >
        <PopoverHeader>
          <PopoverTitle className="text-base">Orchestrator flow</PopoverTitle>
          <PopoverDescription>
            How one question moves through the sub-agents.
          </PopoverDescription>
        </PopoverHeader>

        <FlowSteps />

        <a
          href="/orchestrator_flow"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
        >
          Open the Mermaid source
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </PopoverContent>
    </Popover>
  )
}
