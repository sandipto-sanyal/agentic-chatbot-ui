import React, { type ComponentType } from "react"
import Plot from "react-plotly.js"
import { transform } from "sucrase"
import type { DashboardRow } from "@/lib/dashboardApi"

export type DashboardComponentProps = { data: DashboardRow[] }

// Modules the generated dashboard code is allowed to import.
const ALLOWED_MODULES: Record<string, unknown> = {
  react: { __esModule: true, default: React, ...React },
  "react-plotly.js": { __esModule: true, default: Plot },
}

// Converts the server-provided plotly code (JSX + ES imports + default export)
// into a React component. The code runs with only the modules above in scope.
export function compilePlotlyCode(source: string): ComponentType<DashboardComponentProps> {
  // Sucrase turns JSX and ES imports/exports into CommonJS that the Function below can run.
  const js = transform(source, { transforms: ["jsx", "imports"] }).code
  const exports: { default?: ComponentType<DashboardComponentProps> } = {}
  const require = (name: string) => {
    if (!(name in ALLOWED_MODULES)) throw new Error(`Module "${name}" is not allowed in dashboard code`)
    return ALLOWED_MODULES[name]
  }
  new Function("require", "exports", js)(require, exports)
  if (!exports.default) throw new Error("Dashboard code has no default export")
  return exports.default
}
