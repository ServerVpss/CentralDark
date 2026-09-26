import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Package, CheckCircle2 } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { adminListSubscriptions, adminMarkSubscriptionPaid, listAvailablePlans } from "@/lib/plans.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateBR } from "@/lib/datetime";
export const Route = createFileRoute("/admin/planos")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const subsFn = useServerFn(adminListSubscriptions);
  const plansFn = useServerFn(listAvailablePlans);
  const markFn = useServerFn(adminMarkSubscriptionPaid);

  const { data: plans } = useQuery({ queryKey: ["admin-plans-list"], queryFn: () => plansFn() });
  const { data: subs, isLoading } = useQuery({ queryKey: ["admin-subscriptions"], queryFn: () => subsFn() });

  const markM = useMutation({
    mutationFn: (id: string) => markFn({ data: { subscriptionId: id, days: 30 } }),
    onSuccess: () => { toast.success("Assinatura marcada como paga (30 dias)."); qc.invalidateQueries({ queryKey: ["admin-subscriptions"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <PageScaffold title="Master · Planos & Assinaturas" description="Catálogo de planos e assinaturas ativas." icon={Package}>
      <div className="p-6">
        <Tabs defaultValue="subs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subs">Assinaturas ({subs?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="plans">Planos ({plans?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="subs">
            <Card>
              <CardHeader><CardTitle>Empresas e situação de pagamento</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
                ) : !subs?.length ? (
                  <p className="text-sm text-muted-foreground">Nenhuma assinatura ainda.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2">Empresa</th>
                        <th>Plano</th>
                        <th>Status</th>
                        <th>Vence em</th>
                        <th>Valor</th>
                        <th>Gateway</th>
                        <th className="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="py-3 font-medium">{s.workspace_name}</td>
                          <td>{s.plan?.name ?? "—"}</td>
                          <td>
                            <span className={`rounded px-2 py-0.5 text-xs ${
                              s.status === "active" ? "bg-emerald-500/15 text-emerald-600" :
                              s.status === "past_due" ? "bg-red-500/15 text-red-600" :
                              s.status === "trialing" ? "bg-blue-500/15 text-blue-600" :
                              "bg-amber-500/15 text-amber-600"
                            }`}>{s.status}</span>
                          </td>
                          <td className="text-xs text-muted-foreground">{s.current_period_end ? formatDateBR(s.current_period_end) : "—"}</td>
                          <td>{s.amount_cents != null ? (s.amount_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</td>
                          <td className="text-muted-foreground">{s.gateway ?? "—"}</td>
                          <td className="text-right">
                            {s.status !== "active" && (
                              <Button size="sm" variant="outline" onClick={() => { if (confirm(`Marcar pagamento manual (libera 30 dias) para ${s.workspace_name}?`)) markM.mutate(s.id); }} disabled={markM.isPending}>
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Marcar pago (30d)
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
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader><CardTitle>Planos cadastrados</CardTitle></CardHeader>
              <CardContent>
                {!plans?.length ? (
                  <p className="text-sm text-muted-foreground">Nenhum plano cadastrado.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2">Plano</th>
                        <th>Preço</th>
                        <th>Atendentes</th>
                        <th>Conexões</th>
                        <th>Setores</th>
                        <th>IA/mês</th>
                        <th>Camp.</th>
                        <th>BYOK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="py-3 font-medium">{p.name} <span className="text-xs text-muted-foreground">({p.slug})</span></td>
                          <td>{(p.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: p.currency })}</td>
                          <td>{p.max_users}</td>
                          <td>{p.max_connections}</td>
                          <td>{p.max_sectors}</td>
                          <td>{p.max_messages_per_month.toLocaleString("pt-BR")}</td>
                          <td>{p.max_campaigns_per_month || "—"}</td>
                          <td>{p.allow_byok ? "✓" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageScaffold>
  );
}
