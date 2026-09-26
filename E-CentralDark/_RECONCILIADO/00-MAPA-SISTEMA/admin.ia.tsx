import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bot, ShieldOff, CheckCircle2, XCircle } from "lucide-react";
import { adminListAiKeys, adminForceDisableAiKey } from "@/lib/ai-keys.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/ia")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListAiKeys);
  const disableFn = useServerFn(adminForceDisableAiKey);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ai-keys"],
    queryFn: () => listFn(),
  });

  const disM = useMutation({
    mutationFn: (workspaceId: string) => disableFn({ data: { workspaceId } }),
    onSuccess: () => { toast.success("Chave desativada — empresa volta para a IA da plataforma."); qc.invalidateQueries({ queryKey: ["admin-ai-keys"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">IA — Visão Master</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Empresas que cadastraram chave própria (BYOK). Use o botão "Forçar desativar" para empurrar a empresa de volta pra IA da plataforma (ex: caso de inadimplência ou abuso).
      </p>

      <Card>
        <CardHeader><CardTitle>Chaves ativas ({data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrou chave própria ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Empresa</th>
                  <th>Provedor</th>
                  <th>Status</th>
                  <th>Último teste</th>
                  <th>Atualizado</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.workspace_id} className="border-t">
                    <td className="py-3 font-medium">{r.workspace_name}</td>
                    <td className="uppercase">{r.provider}</td>
                    <td>
                      <span className={`rounded px-2 py-0.5 text-xs ${r.active ? "bg-emerald-500/15 text-emerald-600" : "bg-zinc-500/15 text-zinc-500"}`}>
                        {r.active ? "Ativa" : "Desativada"}
                      </span>
                    </td>
                    <td>
                      {r.last_test_ok === true && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /> OK</span>}
                      {r.last_test_ok === false && <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3.5 w-3.5" /> Falhou</span>}
                      {r.last_test_ok === null && <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {formatDateTimeBR(r.updated_at)}
                    </td>
                    <td className="text-right">
                      {r.active && (
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (confirm(`Desativar chave de ${r.workspace_name}? A empresa volta a usar a IA da plataforma.`)) disM.mutate(r.workspace_id); }} disabled={disM.isPending}>
                          <ShieldOff className="mr-1 h-3.5 w-3.5" /> Forçar desativar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
