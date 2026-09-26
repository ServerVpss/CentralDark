import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListVoiceAi } from "@/lib/admin-utilidades.functions";
import { listAllWorkspaces } from "@/lib/admin.functions";
import { AdminFilters, exportCsv } from "@/components/admin/workspace-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Mic } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/utilidades/voice-ia")({ component: Page });

function Page() {
  const fn = useServerFn(adminListVoiceAi);
  const fnWs = useServerFn(listAllWorkspaces);
  const [ws, setWs] = useState("all");
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-voice-ai"], queryFn: () => fn() });
  const { data: workspaces = [] } = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => fnWs() });

  const filtered = useMemo(() => data.filter((r: any) =>
    (ws === "all" || r.workspace_id === ws) && (!q || r.workspace_name.toLowerCase().includes(q.toLowerCase()))
  ), [data, ws, q]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Mic className="h-6 w-6" /> Voice IA</h1>
          <p className="text-sm text-muted-foreground">Configurações de voz e transcrição por workspace.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv("voice-ia.csv", filtered)}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <AdminFilters workspaces={workspaces} workspaceId={ws} onWorkspace={setWs} search={q} onSearch={setQ} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Provedor</th><th className="px-4 py-3">Idioma</th><th className="px-4 py-3">Voz</th><th className="px-4 py-3">Transcrever</th><th className="px-4 py-3">Responder voz</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center"><div className="flex justify-center"><LoadingDots size="sm" /></div></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum workspace configurado.</td></tr>}
            {filtered.map((r: any) => (
              <tr key={r.workspace_id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.workspace_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.provider ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.language ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.voice ?? "—"}</td>
                <td className="px-4 py-3"><Badge variant={r.transcribe_incoming ? "secondary" : "outline"}>{r.transcribe_incoming ? "Sim" : "Não"}</Badge></td>
                <td className="px-4 py-3"><Badge variant={r.reply_with_voice ? "secondary" : "outline"}>{r.reply_with_voice ? "Sim" : "Não"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
