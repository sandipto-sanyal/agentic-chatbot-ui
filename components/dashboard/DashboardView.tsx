import { useMemo } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { DashboardCardData, DashboardRow } from "@/lib/dashboardApi"
import { compilePlotlyCode } from "@/lib/compilePlotlyCode"
import Plot from 'react-plotly.js';

const PREVIEW_ROWS = 20

type DashboardViewProps = {
  dashboard: DashboardCardData
  rows: DashboardRow[]
  onBack: () => void
}

// One entry of the server's plotly code: column names to read from the rows for each trace.
type PlotlyDirective = {
  x: string
  y: string
  text?: string
  type: string
}


type PlotlyDataType = {
  x: Array<string | number>;
  y: Array<string | number>;
  text?: Array<string>;
  type: string;

}
export function DashboardView({ dashboard, rows, onBack }: DashboardViewProps) {
  return (
    <section className="flex flex-col gap-4">
      <Button variant="outline" className="w-fit" onClick={onBack}>
        ← Back to dashboards
      </Button>
      <h2 className="text-xl font-semibold">{dashboard.text}</h2>
      <p className="text-sm text-muted-foreground">{dashboard.metadata.dashboard_description}</p>
      {/* <PlotPanel code={dashboard.metadata.plotly_code} rows={rows} /> */}
      {PlotGraph(rows, dashboard.metadata.plotly_code)}
      <DataPreview rows={rows} />
    </section>
  )
}

// Removes Markdown code fences such as ``` or ```json that the model may wrap around the JSON.
function stripCodeFences(text: string): string {
  return text.replace(/```(?:json)?/gi, "").trim()
}

function PlotGraph(rows: DashboardRow[], code: string) {
  var data: PlotlyDataType[] = []
  var layoutBase = {}
  try {
    const plotlyDirectives: PlotlyDirective[] = JSON.parse(stripCodeFences(code));


    for (const directive of plotlyDirectives) {
      var d: PlotlyDataType = {
        x: rows.map(row => (row[directive.x] ?? "") as string | number),
        y: rows.map(row => (row[directive.y] ?? "") as string | number),
        type: directive.type
      }
      // Add text later, if required
      try {
        if (directive.text) {
          d.text = rows.map(row => String(row[directive.text!] ?? ""));
        }
        data.push(d)
      }
      catch (error) {
        console.log("Error while putting text on plot", error);
      }
    }
    layoutBase = {
      autosize: true,
      margin: { t: 40, r: 20, b: 40, l: 50 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      xaxis: { title: { text: plotlyDirectives[0].x } },
      yaxis: { title: { text: plotlyDirectives[0].y } }
    };
  }
  catch (error) {
    console.error("Error processing Plotly directives:", error);
  }


  return (
    <Plot
      data={data}
      layout={layoutBase}
      useResizeHandler
      style={{ width: "100%", height: 320 }}
      config={{ responsive: true, displaylogo: false }}
    />
  )
}


// One trace per directive; each axis reads its values from the matching column of every row.
function buildTraces(rows: DashboardRow[], directives: PlotlyDirective[]) {
  return directives.map((directive) => ({
    type: directive.type ?? "bar",
    x: columnValues(rows, directive.x),
    y: columnValues(rows, directive.y),
    ...(directive.text ? { text: columnValues(rows, directive.text) } : {}),
  }))
}

function columnValues(rows: DashboardRow[], column: string): unknown[] {
  return rows.map((row) => row[column])
}

function PlotPanel({ code, rows }: { code: string; rows: DashboardRow[] }) {
  // Compile the server's plotly code once per dashboard; a bad snippet shows an error instead of crashing the page.
  const compiled = useMemo(() => {
    try {
      return { Component: compilePlotlyCode(code), error: null }
    } catch (error) {
      return { Component: null, error: error instanceof Error ? error.message : String(error) }
    }
  }, [code])

  if (compiled.error || !compiled.Component) {
    return <p className="text-sm text-destructive">Could not render chart: {compiled.error}</p>
  }
  const { Component } = compiled
  return (
    <div className="rounded-lg border p-4">
      <Component data={rows} />
    </div>
  )
}

function DataPreview({ rows }: { rows: DashboardRow[] }) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []
  const preview = rows.slice(0, PREVIEW_ROWS)

  return (
    <Accordion className="rounded-lg border px-4">
      <AccordionItem value="data">
        <AccordionTrigger>Data (first {PREVIEW_ROWS} rows)</AccordionTrigger>
        <AccordionContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data returned.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column}>{formatCell(row[column])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  return typeof value === "object" ? JSON.stringify(value) : String(value)
}
