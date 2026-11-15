import { useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DATABASES } from "@/common/databases"
import { paletteColor } from "@/common/plotly_palette"
import { Toaster, toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button"

import api from "@/lib/http/client"
import { Label } from "@/components/ui/label"
import { Trash, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import Plot from 'react-plotly.js';
import type { Layout } from "plotly.js"

import { Spinner } from "@/components/ui/spinner"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface DashboardMetadata {
  dashboard_description: string;
  database: string;
  plotly_code: string;       // JSON-encoded PlotlyTraceSpec[]
  query: string;             // SQL
  update_timestamp: string;  // "YYYY-MM-DD HH:mm:ss"
}

interface DashboardRecord {
  _id: string;
  created_at: string;        // RFC 1123, e.g. "Sun, 15 Nov 2026 04:34:04 GMT"
  metadata: DashboardMetadata;
  text: string;              // dashboard title
}

type GetData_DataType = Record<string, string | number>[]
type GetData_Traces = {
  name: string;
  text: string;
  type: string;
  x: Array<string | number>;
  y: Array<string | number>;
  marker?: { color?: string };
}
type GetData_Layout = {

}
type GetDataResponse = {
  data: GetData_DataType;
  traces: GetData_Traces[];
  layout: Partial<Layout>;
}

// The database option with an empty value is only a placeholder, so it is not a real choice.
const SELECTABLE_DATABASES = DATABASES.filter((db) => db.value !== "")

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
]

// Regenerate button with a popover that collects an optional instruction for the LLM.
// The popover is portaled, so clicks inside it are stopped here to keep them from
// selecting the card underneath.
function RegenerateButton({
  onRegenerate,
}: {
  onRegenerate: (extraInstruction: string) => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [extraInstruction, setExtraInstruction] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsRegenerating(true)
    try {
      const result = await onRegenerate(extraInstruction.trim())
      if (result) {
        setOpen(false)
        setExtraInstruction("")
      }
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button variant="ghost" onClick={(e) => e.stopPropagation()}>
          <RotateCcw size={15} />
        </Button>
      } />
      <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Label htmlFor="extra-instruction">Regenerate dashboard</Label>
          <Input
            id="extra-instruction"
            value={extraInstruction}
            onChange={(e) => setExtraInstruction(e.target.value)}
            placeholder="Extra instruction, e.g. use a bar chart colored by department"
            disabled={isRegenerating}
          />
          <Button type="submit" disabled={isRegenerating}>
            {isRegenerating ? <Spinner className="size-4" /> : "Regenerate"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default function Dashboard() {
  const [databaseSelected, setDatabaseSelected] = useState<String | null>(null);
  const [dashboardCards, setDashboardCards] = useState<DashboardRecord[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [getDataResponse, setGetDataResponse] = useState<GetDataResponse | null>(null);
  async function getDashboards(database: string) {

    const response = await api.post("/api/get_dashboards",
      { "database": database }
    )
    if (response.status === 200) {
      setDashboardCards(response.data)
    }
    else {
      toast.add({
        "description": `Error while retrieving dashboards for Database ${database}`,
        "type": "error"
      })
    }
  }
  async function deleteDashboard(dashboardCard: DashboardRecord) {
    const response = await api.delete("/api/delete_dashboard", {
      data: { "database": dashboardCard.metadata.database, "dashboard_id": dashboardCard._id }
    })
    if (response.status === 200) {
      setDashboardCards((cards) => cards.filter((card) => card._id !== dashboardCard._id))
    }
    else {
      toast.add({
        "description": `Error while deleting dashboard ${dashboardCard.text}`,
        "type": "error"
      })
    }
  }

  async function fetchDashboardData(
    database: string,
    query: string,
    plotly_code: string

  ) {
    setIsLoadingData(true)
    try {
      const response = await api.post(
        "/api/get_data",
        { "database": database, "query": query, "plotly_code": plotly_code },
      )
      if (response.status === 200) {
        setGetDataResponse(response.data)
        setPageIndex(0)
      }
      else {
        toast.add({
          description: "Error while fetching data for selected dashboard",
          type: "error"
        })
      }
    }
    finally {
      setIsLoadingData(false)
    }
  }

  async function tryDashboardRegeneration(
    dashboardCard: DashboardRecord,
    extraInstruction: string
  ) {
    try {
      const response = await api.post(
        "/api/try_dashboard_regeneration",
        {
          "mongodb_object_id": dashboardCard._id,
          "query": dashboardCard.metadata.query,
          "task": dashboardCard.text,
          "extra_instruction": extraInstruction
        },
      )
      if (response.status === 200 && response.data.matched === 1) {
        // Regeneration rewrites the saved chart code, so reload the cards to show it.
        await getDashboards(databaseSelected as string)
        return response.data
      }
      toast.add({
        description: "Dashboard could not be regenerated",
        type: "error"
      })
    }
    catch {
      toast.add({
        description: "Error while regenerating dashboard",
        type: "error"
      })
    }
  }
  function DatabaseSelect() {
    return (
      <div>
        <Label htmlFor="selectDatabase" className="mb-3">Select a Database</Label>
        <Select id="selectDatabase" items={SELECTABLE_DATABASES}
          onValueChange={(val) => {
            setDatabaseSelected(val as string);
            getDashboards(val as string);
          }}>
          <SelectTrigger className="h-9 w-44 shrink-0">
            <SelectValue placeholder="Select Database" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Databases</SelectLabel>
              {SELECTABLE_DATABASES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    )
  }

  function renderDashboardCard(dashboardCard: DashboardRecord) {
    return (
      <div className="h-full">
        <Card className={`h-full w-full cursor-pointer transition-shadow ${selectedCardId === dashboardCard._id
          ? "border-primary ring-2 ring-primary shadow-[0_0_20px_2px] shadow-primary/60"
          : ""
          }`} onClick={() => {
            setSelectedCardId(dashboardCard._id)
            fetchDashboardData(databaseSelected as string,
              dashboardCard.metadata.query,
              dashboardCard.metadata.plotly_code)
          }}>
          <CardHeader>
            <CardTitle>{dashboardCard.text}</CardTitle>
            <CardDescription>
              {dashboardCard.metadata.dashboard_description}
            </CardDescription>
            <CardAction>
              <Button variant="destructive" onClick={(e) => {
                e.stopPropagation();
                deleteDashboard(dashboardCard)
              }}><Trash /></Button>
            </CardAction>
          </CardHeader>
          <CardContent>
          </CardContent>
          <CardFooter className="text-xs font-light">
            <div className="flex justify-end gap-5">
              {`Updated On: ${dashboardCard.metadata.update_timestamp}`}
              <RegenerateButton
                onRegenerate={(extraInstruction) => tryDashboardRegeneration(dashboardCard, extraInstruction)}
              />
            </div>

          </CardFooter>
        </Card>
      </div>
    )
  }

  function renderPaginatedDataTable() {
    if (!getDataResponse) return null
    const rows = getDataResponse.data
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
    const start = pageIndex * pageSize
    const pageRows = rows.slice(start, start + pageSize)
    return (
      <div>
        <Label htmlFor="dataTable">Data</Label>
        <div className="max-h-96 overflow-auto rounded-md border [&_[data-slot=table-container]]:overflow-visible">
          <Table id="dataTable">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="sticky top-0 z-10 bg-background">{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row, rowIndex) => (
                <TableRow key={start + rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column}>{String(row[column])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Label>Records per page</Label>
            <Select items={PAGE_SIZE_OPTIONS} value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPageIndex(0);
              }}>
              <SelectTrigger className="h-9 w-24 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm">Page {pageIndex + 1} of {pageCount}</span>
          <Button variant="outline" size="sm" disabled={pageIndex === 0}
            onClick={() => setPageIndex((p) => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={pageIndex >= pageCount - 1}
            onClick={() => setPageIndex((p) => p + 1)}>Next</Button>
        </div>
      </div>
    )
  }

  function renderPlotly() {
    return (
      (getDataResponse?.traces) && (
        <div>
          <Label htmlFor="dashboardPlot">Graph</Label>
          <Plot divId="dashboardPlot"
            data={getDataResponse.traces.map((trace, index) => ({
              ...trace,
              text: null,
              marker: { ...trace.marker, color: paletteColor(index) },
            }))}
            layout={getDataResponse.layout}
          ></Plot>
        </div>
      )
    )
  }
  return (
    // main area
    <>
      <div className="mt-5">
        <div className="flex justify-center">{DatabaseSelect()}</div>
        {/* Shows at most 3 dashboard cards at once on wide screens; the rest scroll sideways. */}
        <div className="mt-5 px-12">
          <Carousel opts={{
            align: "start",
          }}
            className="w-full">
            <CarouselContent>
              {dashboardCards.map((dashboardCard) => (
                <CarouselItem key={dashboardCard._id} className="basis-full sm:basis-1/2 xl:basis-1/3">
                  {renderDashboardCard(dashboardCard)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <hr className="mt-10"></hr>
        <div id="plotArea" className="flex justify-around mt-5">
          {isLoadingData ? (
            <div className="flex w-full justify-center py-10">
              <Spinner className="size-8" />
            </div>
          ) : (
            <>
              <div>
                {renderPlotly()}
              </div>
              <div>{renderPaginatedDataTable()}</div>
            </>
          )}
        </div>
      </div>



      <div className="hidden">
        <pre>{JSON.stringify(getDataResponse, null, 2)}</pre>
      </div>
      <Toaster></Toaster>
    </>
  )
}




