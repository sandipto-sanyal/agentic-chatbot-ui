import axios from "axios"

// VITE_HTTP_URL is the server origin, e.g. http://127.0.0.1:5000 (see .env).
const http = axios.create({ baseURL: import.meta.env.VITE_HTTP_URL })

export type DashboardMetadata = {
  type?: string
  dashboard_description: string
  database: string
  plotly_code: string
  query: string
  update_timestamp: string
}

export type DashboardCardData = {
  _id: string
  created_at: string
  text: string
  metadata: DashboardMetadata
}

export type DeleteDashboardData = {
  deleted: number
}

export type DashboardRow = Record<string, unknown>

export async function fetchDashboards(database: string): Promise<DashboardCardData[]> {
  const { data } = await http.post<DashboardCardData[]>("/api/get_dashboards", { database })
  return data
}

export async function fetchDashboardData(database: string, query: string): Promise<DashboardRow[]> {
  const { data } = await http.post<DashboardRow[]>("/api/get_data", { database, query })
  return data
}

export async function deleteDashboardData(database: string, dashboardId: string): Promise<DeleteDashboardData> {
  // axios sends DELETE bodies only through the `data` config option.
  const { data } = await http.delete<DeleteDashboardData>("/api/delete_dashboard", {
    data: { database, dashboard_id: dashboardId },
  })
  return data
}
