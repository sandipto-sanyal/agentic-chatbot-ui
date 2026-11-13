// Colours used for chart traces, in order. Traces past the end of the list cycle back to the start.
export const PLOTLY_PALETTE = [
  "#4f46e5",
  "#14b8a6",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
]

export function paletteColor(index: number): string {
  return PLOTLY_PALETTE[index % PLOTLY_PALETTE.length]
}
