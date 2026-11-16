import api from "@/lib/http/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
// import mermaid from "mermaid";

import { Mermaid } from "@/components/orchestrator/mermaid"

export default function OrchestratorFlow() {

    const [mermaid, setMermaid] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // On page load: GET {VITE_HTTP_URL}/api/get_mermaid
    useEffect(() => {
        let cancelled = false
        api.get<{ mermaid: string }>("/api/get_mermaid")
            .then((response) => {
                if (!cancelled) setMermaid(response.data.mermaid)
            })
            .catch(() => {
                if (!cancelled) setError("Could not load the orchestrator flow.")
            })
        return () => {
            cancelled = true
        }
    }, [])

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Orchestrator flow</CardTitle>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : mermaid === null ? (
                        <Spinner className="size-6" />
                    ) : (
                        <Mermaid chart={mermaid}/>
                    )}
                </CardContent>
            </Card>

        </main>
    )
}
