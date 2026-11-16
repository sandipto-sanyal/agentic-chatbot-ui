import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "strict" });

export function Mermaid({ chart }: { chart: string }) {
  const id = "mmd-" + useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) return <pre style={{ color: "crimson" }}>{error}</pre>;
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}