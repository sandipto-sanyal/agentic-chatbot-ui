import { useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DATABASES } from "@/common/databases"
import { DashboardCards } from "@/components/dashboard/DashboardCards"
import { DashboardView } from "@/components/dashboard/DashboardView"
import {
  deleteDashboardData,
  fetchDashboardData,
  fetchDashboards,
  type DashboardCardData,
  type DashboardRow,
} from "@/lib/dashboardApi"

// The database option with an empty value is only a placeholder, so it is not a real choice.
const SELECTABLE_DATABASES = DATABASES.filter((db) => db.value !== "")

export default function Dashboard() {
  const [database, setDatabase] = useState("")
  const [dashboards, setDashboards] = useState<DashboardCardData[]>([])
  const [selected, setSelected] = useState<DashboardCardData | null>(null)
  const [rows, setRows] = useState<DashboardRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!database) return
    void loadDashboards(database, setDashboards, setError, setLoading, setSelected)
  }, [database])

  async function handleSelect(dashboard: DashboardCardData) {
    setSelected(dashboard)
    setRows([])
    await loadRows(dashboard, setRows, setError, setLoading)
  }

  async function handleDelete(dashboard: DashboardCardData) {
    setError(null)
    try {
      await deleteDashboardData(dashboard.metadata.database, dashboard._id)
      setDashboards((current) => current.filter((item) => item._id !== dashboard._id))
    } catch (err) {
      setError(describeError(err, "Could not delete dashboard"))
    }
  }

  if (selected) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-8">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading data…</p>
        ) : (
          <DashboardView dashboard={selected} rows={rows} onBack={() => setSelected(null)} />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DatabaseSelect value={database} onChange={setDatabase} />
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading dashboards…</p>}
      {!loading && database && dashboards.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">No dashboards for this database yet.</p>
      )}
      {!database && <p className="text-sm text-muted-foreground">Choose a database to see its dashboards.</p>}

      <DashboardCards dashboards={dashboards} onSelect={handleSelect} onDelete={handleDelete} />
    </div>
  )
}

function DatabaseSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select items={SELECTABLE_DATABASES} value={value} onValueChange={(next) => onChange(next ?? "")}>
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
  )
}

async function loadDashboards(
  database: string,
  setDashboards: (value: DashboardCardData[]) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void,
  setSelected: (value: DashboardCardData | null) => void,
) {
  setLoading(true)
  setError(null)
  setSelected(null)
  try {
    setDashboards(await fetchDashboards(database))
  } catch (err) {
    setDashboards([])
    setError(describeError(err, "Could not load dashboards"))
  } finally {
    setLoading(false)
  }
}

async function loadRows(
  dashboard: DashboardCardData,
  setRows: (value: DashboardRow[]) => void,
  setError: (value: string | null) => void,
  setLoading: (value: boolean) => void,
) {
  setLoading(true)
  setError(null)
  try {
    setRows(await fetchDashboardData(dashboard.metadata.database, dashboard.metadata.query))
  } catch (err) {
    setError(describeError(err, "Could not load dashboard data"))
  } finally {
    setLoading(false)
  }
}

function describeError(err: unknown, fallback: string): string {
  return err instanceof Error ? `${fallback}: ${err.message}` : fallback
}
