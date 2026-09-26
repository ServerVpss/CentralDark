import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminListAiUsage } from "@/lib/admin-master.functions";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/ia-usage")({ component: Page });

function Page() {
  const fn = useServerFn(adminListAiUsage);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-ai-usage"],
    queryFn: () => fn({ data: { limit: 200 } }),
    refetchInterval: 30_000,
  });

  const providers = Object.entries(data?.byProvider ?? {});

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-emerald-500" />
        <h1 className="text-2xl font-bold">Telemetria de IA (Master)</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Tudo que a plataforma gastou em IA — por provedor, modelo e workspace. Últimos 7 dias agregados, últimos 200 eventos detalhados.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {providers.length === 0 && !isLoading && (
          <Card><CardContent className="py-6 text-sm text-muted-foreground">Nenhum uso registrado ainda.</CardContent></Card>
        )}
        {providers.map(([prov, v]) => (
          <Card key={prov}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="uppercase">{prov}</span>
                <Badge variant="secondary">{v.calls} chamadas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> {v.tokens.toLocaleString("pt-BR")} tokens
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" /> US$ {v.costUsd.toFixed(4)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Últimos eventos</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
          ) : !data?.rows?.length ? (
            <p className="text-sm text-muted-foreground">Sem eventos ainda. Quando a IA for chamada, aparece aqui.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Quando</th>
                    <th>Provedor</th>
                    <th>Modelo</th>
                    <th>Contexto</th>
                    <th className="text-right">Tokens</th>
                    <th className="text-right">Custo</th>
                    <th className="text-right">Latência</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTimeBR(r.created_at)}
                      </td>
                      <td className="uppercase text-xs">{r.provider}</td>
                      <td className="text-xs">{r.model}</td>
                      <td className="text-xs text-muted-foreground">{r.context ?? "—"}</td>
                      <td className="py-2 text-right">{r.total_tokens.toLocaleString("pt-BR")}</td>
                      <td className="py-2 text-right">US$ {Number(r.cost_usd).toFixed(4)}</td>
                      <td className="py-2 text-right text-xs text-muted-foreground">{r.latency_ms ? `${r.latency_ms}ms` : "—"}</td>
                      <td>
                        {r.status === "ok" && <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">OK</Badge>}
                        {r.status === "error" && <Badge variant="destructive">Erro</Badge>}
                        {r.status === "blocked" && <Badge variant="destructive">Bloqueado</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
