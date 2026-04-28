import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  TimerReset,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PixTx {
  id: string;
  external_id: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  description: string | null;
  bot_id: string | null;
}

interface Sub {
  id: string;
  context: string;
  plan_name: string;
  plan_days: number;
  value: number;
  txid: string | null;
  status: string;
  started_at: string;
  expires_at: string;
  created_at: string;
}

interface TimelineEvent {
  ts: Date;
  kind: "payment" | "sub_created" | "overwrite" | "stack";
  title: string;
  detail: string;
  meta?: Record<string, string>;
  severity: "ok" | "warn" | "danger" | "info";
}

const fmt = (d: Date | string | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
};

const fmtHours = (ms: number) => {
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  return `${ms < 0 ? "-" : ""}${h}h ${m}m`;
};

export default function SubscriptionAudit() {
  const [userIdInput, setUserIdInput] = useState("");
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sub-audit", activeUserId],
    enabled: !!activeUserId,
    queryFn: async () => {
      const tgId = Number(activeUserId);
      const [pixRes, subRes] = await Promise.all([
        supabase
          .from("pix_transactions")
          .select("id, external_id, amount, status, paid_at, created_at, description, bot_id")
          .eq("telegram_user_id", tgId)
          .order("created_at", { ascending: true }),
        supabase
          .from("telegram_subscriptions")
          .select("id, context, plan_name, plan_days, value, txid, status, started_at, expires_at, created_at")
          .eq("telegram_user_id", tgId)
          .order("created_at", { ascending: true }),
      ]);
      return {
        payments: (pixRes.data || []) as PixTx[],
        subs: (subRes.data || []) as Sub[],
      };
    },
  });

  // Build timeline + detect overwrites
  const timeline: TimelineEvent[] = [];
  let suspectedOverwrites = 0;
  let stackedRenewals = 0;

  if (data) {
    const paid = data.payments.filter((p) => p.status === "paid" && p.paid_at);

    paid.forEach((p, i) => {
      timeline.push({
        ts: new Date(p.paid_at!),
        kind: "payment",
        title: `Pagamento #${i + 1} confirmado`,
        detail: `R$ ${Number(p.amount).toFixed(2)} • ${p.description || "Assinatura PIX"}`,
        meta: { TXID: p.external_id?.slice(0, 16) + "…" || "—" },
        severity: "ok",
      });

      // detecção de overwrite: se existe pagamento anterior e a assinatura atual
      // tem started_at = paid_at deste pagamento (resetou)
      if (i > 0) {
        const prevPaid = paid[i - 1];
        const sub = data.subs.find((s) => s.txid === p.external_id);
        if (sub) {
          const startedAt = new Date(sub.started_at);
          const currentPaidAt = new Date(p.paid_at!);
          const prevPaidAt = new Date(prevPaid.paid_at!);
          const diffFromCurrent = Math.abs(startedAt.getTime() - currentPaidAt.getTime());
          const diffFromPrev = Math.abs(startedAt.getTime() - prevPaidAt.getTime());

          // Se started_at está perto do pagamento ATUAL (dentro de 5 min) e
          // o pagamento anterior ainda estava válido (< plan_days desde prev),
          // significa que sobrescreveu
          const prevWouldStillBeValid =
            currentPaidAt.getTime() - prevPaidAt.getTime() < prevPaid && false; // placeholder
          
          if (diffFromCurrent < 5 * 60 * 1000 && diffFromPrev > 60 * 60 * 1000) {
            suspectedOverwrites++;
            timeline.push({
              ts: new Date(p.paid_at!),
              kind: "overwrite",
              title: "⚠️ Possível sobrescrita detectada",
              detail: `started_at foi resetado para ${fmt(sub.started_at)} ignorando pagamento anterior de ${fmt(prevPaid.paid_at)}`,
              meta: {
                "Tempo perdido estimado": fmtHours(diffFromPrev),
              },
              severity: "danger",
            });
          } else {
            stackedRenewals++;
            timeline.push({
              ts: new Date(p.paid_at!),
              kind: "stack",
              title: "✅ Renovação empilhada corretamente",
              detail: `expires_at extendido preservando started_at original (${fmt(sub.started_at)})`,
              severity: "ok",
            });
          }
        }
      }
    });

    data.subs.forEach((s) => {
      timeline.push({
        ts: new Date(s.created_at),
        kind: "sub_created",
        title: `Assinatura registrada (${s.context})`,
        detail: `${s.plan_name} • ${s.plan_days} dias • R$ ${Number(s.value).toFixed(2)}`,
        meta: {
          started_at: fmt(s.started_at),
          expires_at: fmt(s.expires_at),
          status: s.status,
        },
        severity: s.status === "active" ? "info" : "warn",
      });
    });

    timeline.sort((a, b) => a.ts.getTime() - b.ts.getTime());
  }

  const activeSubs = data?.subs.filter((s) => s.status === "active") || [];
  const totalPaid = (data?.payments || [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-xl p-6 shadow-elegant">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Auditoria de Assinaturas</h1>
              <p className="text-sm text-muted-foreground">
                Timeline cruzada entre pagamentos PIX e assinaturas, com detecção de sobrescritas indevidas.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="border-border/50 backdrop-blur-xl">
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userIdInput.trim()) setActiveUserId(userIdInput.trim());
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Telegram User ID (ex: 7261820077)"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Auditar</Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && activeUserId && (
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <CreditCard className="h-3.5 w-3.5" /> Pagamentos confirmados
                  </div>
                  <div className="text-2xl font-bold">
                    {data.payments.filter((p) => p.status === "paid").length}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Total pago
                  </div>
                  <div className="text-2xl font-bold">R$ {totalPaid.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className={cn("border-border/50", suspectedOverwrites > 0 && "border-destructive/40 bg-destructive/5")}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Sobrescritas suspeitas
                  </div>
                  <div className={cn("text-2xl font-bold", suspectedOverwrites > 0 && "text-destructive")}>
                    {suspectedOverwrites}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <TimerReset className="h-3.5 w-3.5" /> Renovações empilhadas
                  </div>
                  <div className="text-2xl font-bold text-emerald-500">{stackedRenewals}</div>
                </CardContent>
              </Card>
            </div>

            {/* Active subs */}
            {activeSubs.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" /> Assinaturas ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeSubs.map((s) => {
                    const remainingMs = new Date(s.expires_at).getTime() - Date.now();
                    return (
                      <div
                        key={s.id}
                        className="rounded-xl border border-border/40 bg-muted/20 p-4 flex flex-wrap gap-4 justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{s.context}</Badge>
                            <span className="font-semibold">{s.plan_name}</span>
                            <Badge>{s.plan_days} dias</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div>Início: {fmt(s.started_at)}</div>
                            <div>Expira: {fmt(s.expires_at)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Tempo restante</div>
                          <div className={cn("text-lg font-bold", remainingMs < 0 ? "text-destructive" : "text-emerald-500")}>
                            {remainingMs < 0 ? "Expirado" : fmtHours(remainingMs)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Nenhum evento encontrado para este usuário.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                    {timeline.map((ev, i) => {
                      const colors = {
                        ok: "bg-emerald-500",
                        info: "bg-blue-500",
                        warn: "bg-amber-500",
                        danger: "bg-destructive",
                      };
                      return (
                        <div key={i} className="relative">
                          <span
                            className={cn(
                              "absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-background",
                              colors[ev.severity]
                            )}
                          />
                          <div
                            className={cn(
                              "rounded-xl border p-3.5",
                              ev.severity === "danger"
                                ? "border-destructive/40 bg-destructive/5"
                                : "border-border/40 bg-muted/20"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div className="font-semibold text-sm">{ev.title}</div>
                              <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {fmt(ev.ts)}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">{ev.detail}</div>
                            {ev.meta && (
                              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                                {Object.entries(ev.meta).map(([k, v]) => (
                                  <div key={k} className="flex gap-1.5">
                                    <span className="text-muted-foreground">{k}:</span>
                                    <span className="font-mono">{v}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!activeUserId && (
          <Card className="border-dashed border-border/50">
            <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
              Insira um Telegram User ID acima para visualizar a auditoria completa.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
