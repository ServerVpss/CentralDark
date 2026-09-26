import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingDots } from "@/components/ui/loading-dots";
import { formatDateTimeBR } from "@/lib/datetime";
import { listAiAuditLogs } from "@/lib/ai-admin-audit.functions";

export const Route = createFileRoute("/admin/auditoria/ia")({ component: Page });


function Page() {
  const fn = useServerFn(listAiAuditLogs);
  const { data, isLoading } = useQuery({
    queryKey: ["ai-admin-audit-logs"],
    queryFn: () => fn(),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-emerald-500" />
        <h1 className="text-2xl font-bold">Auditoria — Segredo IA</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Tudo que a Segredo IA fez ou tentou fazer. Inclui tentativas bloqueadas, confirmações e rotas abertas.
      </p>

      <Card>
        <CardHeader><CardTitle>Últimos 200 comandos</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum comando registrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Quando</th>
                    <th>Comando</th>
                    <th>Intenção</th>
                    <th>Status</th>
                    <th>Rota</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.id} className="border-t align-top">
                      <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTimeBR(r.created_at)}
                      </td>
                      <td className="max-w-md py-2">{r.command_text}</td>
                      <td className="py-2 text-xs">{r.intent ?? "—"}</td>
                      <td className="py-2">
                        {r.status === "blocked" && <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Bloqueado</Badge>}
                        {r.status === "ok" && <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15"><ShieldCheck className="mr-1 h-3 w-3" />OK</Badge>}
                        {r.status === "error" && <Badge variant="destructive">Erro</Badge>}
                        {r.status === "pending" && <Badge variant="secondary">Pendente</Badge>}
                      </td>
                      <td className="py-2 text-xs">{r.route_opened ?? "—"}</td>
                      <td className="py-2 text-xs text-muted-foreground">{r.ip ?? "—"}</td>
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
