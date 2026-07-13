// Mega Painel — feed unificado em tempo real do ecossistema CentralDark.
// Lê de notifications_log via Supabase Realtime. Mesmo design do projeto
// (Sistema 3D Tátil "Esmeralda"): shadow-3d, rounded-xl, tema emerald.
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Radio,
  RefreshCw,
  Siren,
  XCircle,
  Filter,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import {
  useNotificationsLog,
  type NotifyTipo,
  type PeriodoFiltro,
} from "@/shared/hooks/useNotificationsLog";

const TIPO_META: Record<
  NotifyTipo,
  { label: string; emoji: string; Icon: typeof Info; cls: string; badgeCls: string }
> = {
  info: {
    label: "Info",
    emoji: "ℹ️",
    Icon: Info,
    cls: "text-sky-500",
    badgeCls: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  sucesso: {
    label: "Sucesso",
    emoji: "✅",
    Icon: CheckCircle2,
    cls: "text-emerald-500",
    badgeCls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  aviso: {
    label: "Aviso",
    emoji: "⚠️",
    Icon: AlertTriangle,
    cls: "text-amber-500",
    badgeCls: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  erro: {
    label: "Erro",
    emoji: "❌",
    Icon: XCircle,
    cls: "text-rose-500",
    badgeCls: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  critico: {
    label: "Crítico",
    emoji: "🚨",
    Icon: Siren,
    cls: "text-red-600",
    badgeCls: "bg-red-600/15 text-red-700 border-red-600/30",
  },
};

const TIPOS: NotifyTipo[] = ["info", "sucesso", "aviso", "erro", "critico"];

export default function MegaPainel() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("24h");
  const [filtroTipo, setFiltroTipo] = useState<NotifyTipo | "todos">("todos");
  const [filtroOrigem, setFiltroOrigem] = useState<string>("todas");

  const { items, loading, stats, lastEventAt, refresh } = useNotificationsLog({
    periodo,
    tipo: filtroTipo === "todos" ? null : filtroTipo,
    origem: filtroOrigem === "todas" ? null : filtroOrigem,
  });

  const origensUnicas = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => s.add(i.origem));
    return Array.from(s).sort();
  }, [items]);

  const onlineDesde = lastEventAt
    ? formatDistanceToNow(lastEventAt, { addSuffix: true, locale: ptBR })
    : "—";

  return (
    <DashboardLayout>
      <Helmet>
        <title>Mega Painel — CentralDark</title>
      </Helmet>

      <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Mega Painel
            </h1>
            <p className="text-sm text-muted-foreground">
              Feed unificado do ecossistema em tempo real — VPS, bots, edge functions, Lovable.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 shadow-3d-soft">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-mono text-foreground">AO VIVO</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                · último evento {onlineDesde}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="rounded-xl shadow-3d-soft active:translate-y-[1px]"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="rounded-xl border-border/40 shadow-3d-soft">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">FILTROS</span>
            </div>

            <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoFiltro)}>
              <TabsList className="h-8 rounded-lg">
                <TabsTrigger value="1h" className="text-xs px-3">1h</TabsTrigger>
                <TabsTrigger value="24h" className="text-xs px-3">24h</TabsTrigger>
                <TabsTrigger value="7d" className="text-xs px-3">7d</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs px-3">30d</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select
              value={filtroTipo}
              onValueChange={(v) => setFiltroTipo(v as NotifyTipo | "todos")}
            >
              <SelectTrigger className="h-8 w-[140px] rounded-lg text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_META[t].emoji} {TIPO_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger className="h-8 w-[180px] rounded-lg text-xs">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as origens</SelectItem>
                {origensUnicas.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "evento" : "eventos"}
            </div>
          </CardContent>
        </Card>

        {/* Grid: Feed (esquerda) + Resumo (direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* FEED AO VIVO */}
          <Card className="lg:col-span-3 rounded-xl border-border/40 shadow-3d-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                Feed ao vivo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[640px]">
                {loading && items.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Carregando...
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    Nenhuma notificação ainda. Quando o sistema disparar algo, aparece aqui.
                  </div>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {items.map((it, idx) => {
                      const meta = TIPO_META[it.tipo] ?? TIPO_META.info;
                      const Icon = meta.Icon;
                      const time = formatDistanceToNow(new Date(it.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      });
                      const isNew = idx === 0 && lastEventAt &&
                        new Date(it.created_at).getTime() === lastEventAt.getTime();
                      return (
                        <li
                          key={it.id}
                          className={cn(
                            "p-4 flex gap-3 transition-colors hover:bg-muted/30",
                            isNew && "animate-in fade-in slide-in-from-top-2 duration-500 bg-primary/5",
                          )}
                        >
                          <div className={cn("mt-0.5", meta.cls)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] px-1.5 py-0", meta.badgeCls)}
                              >
                                {meta.label}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 font-mono"
                              >
                                {it.origem}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {time}
                              </span>
                              {!it.sent_ok && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                  falhou no Telegram
                                </Badge>
                              )}
                              {(() => {
                                const rep = (it.metadata as Record<string, unknown> | null)?.repeated as number | undefined;
                                if (rep && rep > 1) {
                                  return (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                      ×{rep}
                                    </Badge>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-foreground">
                              {it.titulo}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                              {it.mensagem}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* RESUMO */}
          <div className="lg:col-span-2 space-y-4">
            {/* Saúde geral */}
            <Card className="rounded-xl border-border/40 shadow-3d-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saúde geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-4xl font-bold text-foreground">
                      {stats.sucessoPct}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      entregues no Telegram
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">total no período</div>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${stats.sucessoPct}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Por tipo */}
            <Card className="rounded-xl border-border/40 shadow-3d-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Por tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TIPOS.map((t) => {
                  const meta = TIPO_META[t];
                  const n = stats.porTipo[t];
                  const pct = stats.total > 0 ? (n / stats.total) * 100 : 0;
                  return (
                    <div key={t} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <meta.Icon className={cn("h-3.5 w-3.5", meta.cls)} />
                          {meta.label}
                        </span>
                        <span className="font-mono text-muted-foreground">{n}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full transition-all", meta.cls.replace("text-", "bg-"))}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top origens */}
            <Card className="rounded-xl border-border/40 shadow-3d-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top origens</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topOrigens.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Sem dados ainda.</div>
                ) : (
                  <ul className="space-y-2">
                    {stats.topOrigens.map(([nome, qtd]) => (
                      <li key={nome} className="flex items-center justify-between text-xs">
                        <span className="font-mono">{nome}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {qtd}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Último crítico */}
            {stats.ultimoCritico && (
              <Card className="rounded-xl border-red-500/40 shadow-3d-soft animate-pulse">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                    <Siren className="h-4 w-4" />
                    Último crítico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold">{stats.ultimoCritico.titulo}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.ultimoCritico.mensagem}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-2 font-mono">
                    {stats.ultimoCritico.origem} ·{" "}
                    {formatDistanceToNow(new Date(stats.ultimoCritico.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
