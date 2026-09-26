import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Check, Crown } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { listAvailablePlans, getWorkspacePlanAndUsage, startCheckout } from "@/lib/plans.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/planos/lista")({ component: Page });

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const listFn = useServerFn(listAvailablePlans);
  const usageFn = useServerFn(getWorkspacePlanAndUsage);
  const checkoutFn = useServerFn(startCheckout);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans-list"],
    queryFn: () => listFn(),
  });
  const { data: planUsage } = useQuery({
    queryKey: ["my-plan-usage", ws?.id],
    enabled: !!ws,
    queryFn: () => usageFn({ data: { workspaceId: ws!.id } }),
  });

  const checkoutM = useMutation({
    mutationFn: (planId: string) => checkoutFn({ data: { workspaceId: ws!.id, planId, gateway: "manual" } }),
    onSuccess: (r) => toast.info(r.message ?? "Pagamento em manutenção."),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const currentPlanId = planUsage?.subscription?.plan_id;

  return (
    <PageScaffold
      title="Planos"
      description="Escolha o plano ideal para seu time."
      icon={ListChecks}
      adminHref="/admin/planos"
      badge="Pagamento em breve"
    >
      <div className="space-y-6 p-6">
        {planUsage?.limits && (
          <Card>
            <CardHeader>
              <CardTitle>Seu uso este mês — {planUsage.limits.plan_name ?? planUsage.limits.plan_slug}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <UsageBar label="Atendentes" used={planUsage.counts.users} limit={planUsage.limits.max_users} />
              <UsageBar label="Conexões WhatsApp" used={planUsage.counts.connections} limit={planUsage.limits.max_connections} />
              <UsageBar label="Setores" used={planUsage.counts.sectors} limit={planUsage.limits.max_sectors} />
              <UsageBar label="Respostas IA" used={planUsage.usage.ai_responses} limit={planUsage.limits.max_messages_per_month} />
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando planos" /></p>
        ) : !plans?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum plano cadastrado.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => {
              const isCurrent = p.id === currentPlanId;
              const isPremium = p.allow_byok;
              return (
                <Card key={p.id} className={isCurrent ? "border-primary border-2" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {isPremium && <Crown className="h-5 w-5 text-amber-500" />}
                        {p.name}
                      </span>
                      <span className="text-base font-normal text-muted-foreground">
                        {(p.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: p.currency })}
                        <span className="text-xs">/{p.interval === "month" ? "mês" : p.interval}</span>
                      </span>
                    </CardTitle>
                    {isCurrent && <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Plano atual</span>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    <ul className="space-y-1.5 text-sm">
                      <Feat>{p.max_users} atendente(s)</Feat>
                      <Feat>{p.max_connections} conexão(ões) WhatsApp</Feat>
                      <Feat>{p.max_sectors} setor(es)</Feat>
                      <Feat>{p.max_messages_per_month.toLocaleString("pt-BR")} respostas de IA/mês</Feat>
                      {p.max_campaigns_per_month > 0 ? <Feat>{p.max_campaigns_per_month} campanhas/mês</Feat> : <li className="text-muted-foreground">— sem campanhas em massa</li>}
                      {p.allow_byok && <Feat>Usar sua própria chave OpenAI/Gemini</Feat>}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || checkoutM.isPending}
                      onClick={() => checkoutM.mutate(p.id)}
                    >
                      {isCurrent ? "Plano atual" : "Assinar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageScaffold>
  );
}

function Feat({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {children}</li>;
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const danger = pct >= 90;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={danger ? "font-medium text-red-500" : "font-medium"}>{used}/{limit}</span>
      </div>
      <Progress value={pct} className={danger ? "[&>div]:bg-red-500" : ""} />
    </div>
  );
}
