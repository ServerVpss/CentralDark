// Consciência Viva — feed ao vivo do que os agentes de IA fazem no ecossistema.
// Lê de public.agent_events via Supabase Realtime. Estilo terminal Jarvis.
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, AlertTriangle, CheckCircle2, Info, Shield, XCircle, Radio, Filter } from "lucide-react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/shared/lib/utils";

interface AgentEvent {
  id: number;
  ts: string;
  agent: string;
  area: string;
  acao: string;
  alvo: string | null;
  status: "info" | "sucesso" | "erro" | "aviso" | "protegido";
  metadata: Record<string, unknown>;
}

const STATUS_META = {
  info:      { Icon: Info,           cls: "text-sky-500",     badge: "bg-sky-500/10 text-sky-600 border-sky-500/20",         label: "info" },
  sucesso:   { Icon: CheckCircle2,   cls: "text-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "ok" },
  erro:      { Icon: XCircle,        cls: "text-red-500",     badge: "bg-red-500/10 text-red-600 border-red-500/20",         label: "erro" },
  aviso:     { Icon: AlertTriangle,  cls: "text-amber-500",   badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",   label: "aviso" },
  protegido: { Icon: Shield,         cls: "text-purple-500",  badge: "bg-purple-500/10 text-purple-600 border-purple-500/20", label: "protegido" },
} as const;

export default function ConscienciaViva() {
  const [eventos, setEventos] = useState<AgentEvent[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAgente, setFiltroAgente] = useState<string>("todos");
  const [filtroArea, setFiltroArea] = useState<string>("todos");

  // Carga inicial + subscribe realtime
  useEffect(() => {
    let ativo = true;
    (async () => {
      const { data } = await supabase
        .from("agent_events")
        .select("*")
        .order("ts", { ascending: false })
        .limit(200);
      if (ativo && data) setEventos(data as AgentEvent[]);
      setCarregando(false);
    })();

    const canal = supabase
      .channel("agent_events_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_events" },
        (payload) => {
          setEventos((prev) => [payload.new as AgentEvent, ...prev].slice(0, 300));
        },
      )
      .subscribe();

    return () => {
      ativo = false;
      supabase.removeChannel(canal);
    };
  }, []);

  const agentes = useMemo(
    () => Array.from(new Set(eventos.map((e) => e.agent))).sort(),
    [eventos],
  );
  const areas = useMemo(
    () => Array.from(new Set(eventos.map((e) => e.area))).sort(),
    [eventos],
  );

  const filtrados = useMemo(
    () =>
      eventos.filter(
        (e) =>
          (filtroAgente === "todos" || e.agent === filtroAgente) &&
          (filtroArea === "todos" || e.area === filtroArea),
      ),
    [eventos, filtroAgente, filtroArea],
  );

  const totaisHoje = useMemo(() => {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const hoje = eventos.filter((e) => new Date(e.ts) >= inicioDia);
    return {
      total: hoje.length,
      erros: hoje.filter((e) => e.status === "erro").length,
      protegidos: hoje.filter((e) => e.status === "protegido").length,
      agentes: new Set(hoje.map((e) => e.agent)).size,
    };
  }, [eventos]);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Consciência Viva | CentralDark</title>
        <meta name="description" content="Feed ao vivo dos agentes de IA operando no ecossistema CentralDark." />
      </Helmet>

      <div className="space-y-4 p-4 md:p-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 shadow-3d-soft">
              <Radio className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Consciência Viva</h1>
              <p className="text-sm text-muted-foreground">
                Tudo que os agentes de IA estão fazendo agora — como o painel do Homem de Ferro.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            AO VIVO
          </Badge>
        </div>

        {/* Estatísticas do dia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="shadow-3d-soft">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Eventos hoje</p>
              <p className="text-2xl font-bold">{totaisHoje.total}</p>
            </CardContent>
          </Card>
          <Card className="shadow-3d-soft">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Agentes ativos</p>
              <p className="text-2xl font-bold">{totaisHoje.agentes}</p>
            </CardContent>
          </Card>
          <Card className="shadow-3d-soft">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Erros hoje</p>
              <p className="text-2xl font-bold text-red-500">{totaisHoje.erros}</p>
            </CardContent>
          </Card>
          <Card className="shadow-3d-soft">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Áreas protegidas tocadas</p>
              <p className="text-2xl font-bold text-purple-500">{totaisHoje.protegidos}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="shadow-3d-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <Select value={filtroAgente} onValueChange={setFiltroAgente}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os agentes</SelectItem>
                {agentes.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroArea} onValueChange={setFiltroArea}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as áreas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filtroAgente !== "todos" || filtroArea !== "todos") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFiltroAgente("todos"); setFiltroArea("todos"); }}
              >
                Limpar
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Feed terminal */}
        <Card className="shadow-3d bg-zinc-950 text-zinc-100 border-zinc-800">
          <CardHeader className="pb-2 border-b border-zinc-800">
            <CardTitle className="text-sm font-mono text-emerald-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              consciencia@centraldark:~$ tail -f agent_events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[560px]">
              <div className="p-4 space-y-1 font-mono text-xs">
                {carregando && (
                  <p className="text-zinc-500">carregando feed...</p>
                )}
                {!carregando && filtrados.length === 0 && (
                  <p className="text-zinc-500">
                    Nenhum evento ainda. Assim que qualquer agente (MCP, VPS, bot) chamar a edge function
                    <span className="text-emerald-400"> agent-log</span>, aparece aqui em tempo real.
                  </p>
                )}
                {filtrados.map((e) => {
                  const meta = STATUS_META[e.status] ?? STATUS_META.info;
                  return (
                    <div key={e.id} className="flex items-start gap-2 hover:bg-zinc-900/60 rounded px-1 py-0.5">
                      <span className="text-zinc-500 shrink-0">
                        {new Date(e.ts).toLocaleTimeString("pt-BR", { hour12: false })}
                      </span>
                      <Badge variant="outline" className={cn("shrink-0 h-4 px-1 py-0 text-[10px]", meta.badge)}>
                        <meta.Icon className="h-2.5 w-2.5 mr-0.5" />
                        {meta.label}
                      </Badge>
                      <span className="text-cyan-400 shrink-0">[{e.agent}]</span>
                      <span className="text-purple-400 shrink-0">{e.area}</span>
                      <span className="text-zinc-100 break-all">
                        {e.acao}
                        {e.alvo && <span className="text-zinc-400"> → {e.alvo}</span>}
                      </span>
                      <span className="text-zinc-600 shrink-0 ml-auto">
                        {formatDistanceToNow(new Date(e.ts), { locale: ptBR, addSuffix: false })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Rodapé: como plugar novos agentes */}
        <Card className="shadow-3d-soft border-dashed">
          <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Como plugar um novo agente neste feed:</p>
            <p>
              Qualquer script/bot na VPS chama esta edge function com um POST simples:
            </p>
            <pre className="bg-muted/50 p-2 rounded font-mono overflow-x-auto">
{`curl -X POST https://<projeto>.supabase.co/functions/v1/agent-log \\
  -H "X-Agent-Secret: $AGENT_LOG_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"agent":"MCP","area":"VPS","acao":"editou nginx.conf","status":"sucesso"}'`}
            </pre>
            <p>
              O segredo <code className="text-primary">AGENT_LOG_SECRET</code> está guardado seguro na Cloud e
              já foi disponibilizado — peça pro seu Claude/MCP na VPS puxar dele.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
