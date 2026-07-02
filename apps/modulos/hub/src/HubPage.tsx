// apps/hub/src/HubPage.tsx
// Hub de Segurança CentralDark — integrado ao TelePanel
// Supabase: schema hub em lyoigsqluyktoclwdaft (via hubClient)

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  LayoutDashboard, Plug, ShieldCheck, CheckSquare,
  History, Network, Cpu, Activity, Check, X,
  Clock, Database, Lock, Shield, Route,
  Send, FileText, HardDrive, Github, Server, Zap,
} from "lucide-react";
import { hubClient } from "@/integrations/supabase/hub-client";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";

// ── Tipos ──────────────────────────────────────────────────────────
interface Connector {
  id: string; slug: string; name: string; description: string;
  category: string; status: 'enabled' | 'disabled' | 'new';
  kind: 'app' | 'mcp' | 'chat'; sort_order: number;
}
interface Policy {
  id: string; tool: string; environment: string;
  tier: 0|1|2|3|4; needs_approval: boolean; enabled: boolean;
}
interface Approval {
  id: string; agent_identity: string; tool: string;
  args_hash: string; resource: string | null; environment: string;
  nonce: string;
  status: 'pending'|'approved'|'rejected'|'expired'|'consumed';
  requested_at: string; expires_at: string;
  decided_at: string | null;
}
interface AuditEntry {
  id: number; ts: string; agent_identity: string | null;
  tool: string | null; decision: string | null;
  tier: number | null; row_hash: string;
}

// ── Helpers de cor ────────────────────────────────────────────────
const tierCls = (t: number) => ({
  0: 'bg-primary/10 text-primary border-primary/25',
  1: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25',
  2: 'bg-warning/10 text-warning border-warning/25',
  3: 'bg-orange-500/10 text-orange-600 border-orange-500/25',
  4: 'bg-destructive/10 text-destructive border-destructive/25',
}[t] ?? 'bg-muted text-muted-foreground border-border');

const decCls = (d: string) => ({
  allow:            'bg-primary/10 text-primary border-primary/25',
  deny:             'bg-destructive/10 text-destructive border-destructive/25',
  require_approval: 'bg-warning/10 text-warning border-warning/25',
}[d] ?? 'bg-muted text-muted-foreground border-border');

const stsCls = (s: string) => ({
  enabled:  'bg-primary/10 text-primary border-primary/25',
  disabled: 'bg-muted text-muted-foreground border-border',
  new:      'bg-cyan-500/10 text-cyan-700 border-cyan-500/25',
  approved: 'bg-primary/10 text-primary border-primary/25',
  rejected: 'bg-destructive/10 text-destructive border-destructive/25',
  pending:  'bg-warning/10 text-warning border-warning/25',
  expired:  'bg-muted text-muted-foreground border-border',
  consumed: 'bg-muted text-muted-foreground border-border',
}[s] ?? 'bg-muted text-muted-foreground border-border');

const fmt = (iso: string, withDate = false) => {
  const d = new Date(iso);
  const t = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return withDate
    ? `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${t}`
    : t;
};

// ── Tabs ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: 'Overview',    Icon: LayoutDashboard },
  { id: 'conectores',  label: 'Conectores',  Icon: Plug },
  { id: 'politicas',   label: 'Políticas',   Icon: ShieldCheck },
  { id: 'aprovacoes',  label: 'Aprovações',  Icon: CheckSquare },
  { id: 'auditoria',   label: 'Auditoria',   Icon: History },
  { id: 'arquitetura', label: 'Arquitetura', Icon: Network },
] as const;
type TabId = typeof TABS[number]['id'];

// ── Componente principal ──────────────────────────────────────────
export default function HubPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>('overview');
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [policies,   setPolicies]   = useState<Policy[]>([]);
  const [approvals,  setApprovals]  = useState<Approval[]>([]);
  const [auditLog,   setAuditLog]   = useState<AuditEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, p, a, au] = await Promise.all([
        hubClient.from('connectors').select('*').order('sort_order'),
        hubClient.from('policies').select('*').order('tier'),
        hubClient.from('approvals').select('*')
          .order('requested_at', { ascending: false }).limit(20),
        hubClient.from('audit_log').select('*')
          .order('id', { ascending: false }).limit(50),
      ]);
      if (c.data) setConnectors(c.data as Connector[]);
      if (p.data) setPolicies(p.data as Policy[]);
      if (a.data) setApprovals(a.data as Approval[]);
      if (au.data) setAuditLog(au.data as AuditEntry[]);
    } catch (e) {
      const errMsg = String(e);
      setError(errMsg);
      toast({ title: 'Erro ao carregar Hub', description: errMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Realtime — aprovações (DESATIVADO: estava travando o carregamento inicial)
  // useEffect(() => {
  //   const ch = hubClient
  //     .channel('hub-approvals')
  //     .on('postgres_changes', { event: '*', schema: 'api', table: 'approvals' }, loadAll)
  //     .subscribe();
  //   return () => { hubClient.removeChannel(ch); };
  // }, [loadAll]);

  const decide = async (id: string, verdict: 'approved' | 'rejected') => {
    const { error } = await hubClient.rpc('approval_decide', {
      p_approval_id: id,
      p_verdict: verdict,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: verdict === 'approved' ? 'Aprovado ✓' : 'Rejeitado ✗' });
      loadAll();
    }
  };

  const pending = approvals.filter(a => a.status === 'pending');

  // ── Seções ────────────────────────────────────────────────────────
  const Overview = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: 'Conectores ativos', v: connectors.filter(c => c.status === 'enabled').length, Icon: Plug,     cls: 'text-primary' },
          { l: 'Pendentes',         v: pending.length, Icon: Clock,    cls: pending.length > 0 ? 'text-warning' : 'text-muted-foreground' },
          { l: 'Permitidos',        v: auditLog.filter(a => a.decision === 'allow').length,  Icon: Check,    cls: 'text-primary' },
          { l: 'Negados',           v: auditLog.filter(a => a.decision === 'deny').length,   Icon: X,        cls: 'text-destructive' },
        ].map(({ l, v, Icon, cls }) => (
          <Card key={l} className="card-premium">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{l}</span>
                <div className={cn('icon-glow h-7 w-7 rounded-lg', cls)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <span className={cn('text-3xl font-bold tracking-tight tabular-nums', cls)}>{v}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-premium">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Atividade recente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Hora','Agente','Tool','Decisão','Tier'].map(h => (
                  <th key={h} className="text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] px-4 pb-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLog.slice(0,6).map(r => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="px-4 py-2 font-mono text-muted-foreground">{r.ts ? fmt(r.ts) : '—'}</td>
                  <td className="px-4 py-2 text-muted-foreground truncate max-w-[120px]">{r.agent_identity || '—'}</td>
                  <td className="px-4 py-2 font-mono">{r.tool || '—'}</td>
                  <td className="px-4 py-2">
                    {r.decision && <Badge className={cn('text-[10px] border rounded-full px-2', decCls(r.decision))}>{r.decision}</Badge>}
                  </td>
                  <td className="px-4 py-2">
                    {r.tier != null && <Badge className={cn('text-[10px] border rounded-full px-2', tierCls(r.tier))}>T{r.tier}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Princípios ativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['Default-Deny','Fail-Closed','Tier 4 desativado','IA nunca aprova a si mesma','Audit append-only','Secret invisível à IA'].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm">
                <div className="h-4 w-4 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </div>{p}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Route className="h-4 w-4 text-primary" />Fases MVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { l: 'Fase 0 — Fronteira + chokepoint + migrations', done: true },
              { l: 'Fase 1 — Approval Service (Telegram)', act: true },
              { l: 'Fase 2 — Secret Provider', done: false },
              { l: 'Fase 3 — Endurecimento + admin-mcp', done: false },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className={cn('h-4 w-4 rounded-md flex items-center justify-center flex-shrink-0 border',
                  f.done ? 'bg-primary/10 border-primary/25' : f.act ? 'bg-primary/10 border-primary/25' : 'border-border'
                )}>
                  {f.done && <Check className="h-2.5 w-2.5 text-primary" />}
                  {!f.done && f.act && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                </div>
                <span className={f.done ? 'text-muted-foreground' : f.act ? '' : 'text-muted-foreground/60'}>{f.l}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const Conectores = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {connectors.map(c => (
        <Card key={c.slug} className="card-premium">
          <CardContent className="pt-5">
            <div className="flex justify-between mb-4">
              <div className="icon-glow h-10 w-10 rounded-xl"><Cpu className="h-5 w-5" /></div>
              <Badge className={cn('text-[10px] border rounded-full px-2', stsCls(c.status))}>
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current inline-block" />{c.status}
              </Badge>
            </div>
            <p className="font-semibold tracking-tight mb-1">{c.name}</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{c.description}</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px]">{c.kind}</Badge>
              <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const Politicas = () => (
    <Card className="card-premium">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4 text-primary" />hub.policies</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {policies.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Nenhuma política cadastrada
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">
              {['Tool','Ambiente','Tier','Aprovação','Ativo'].map(h => (
                <th key={h} className="text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] px-4 pb-2">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="px-4 py-2 font-mono">{p.tool}</td>
                  <td className="px-4 py-2 font-mono text-muted-foreground">{p.environment}</td>
                  <td className="px-4 py-2"><Badge className={cn('text-[10px] border rounded-full px-2', tierCls(p.tier))}>Tier {p.tier}</Badge></td>
                  <td className="px-4 py-2">{p.needs_approval
                    ? <Badge className="text-[10px] border rounded-full px-2 bg-warning/10 text-warning border-warning/25">sim</Badge>
                    : <Badge className="text-[10px] border rounded-full px-2 bg-primary/10 text-primary border-primary/25">não</Badge>}
                  </td>
                  <td className="px-4 py-2">{p.enabled
                    ? <Badge className="text-[10px] border rounded-full px-2 bg-primary/10 text-primary border-primary/25">ativo</Badge>
                    : <Badge className="text-[10px] border rounded-full px-2 bg-destructive/10 text-destructive border-destructive/25">desativado</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );

  const Aprovacoes = () => {
    const hist = approvals.filter(a => a.status !== 'pending');
    return (
      <div className="space-y-4">
        {pending.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold">Pendentes</span>
              <Badge className="bg-warning text-warning-foreground">{pending.length}</Badge>
            </div>
            <div className="space-y-3">
              {pending.map(ap => (
                <Card key={ap.id} className="card-premium border-primary/25">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <code className="font-mono text-sm">{ap.tool}</code>
                      <Badge className={cn('text-[10px] border rounded-full px-2', stsCls(ap.status))}>{ap.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4 text-xs">
                      {([
                        ['agente', ap.agent_identity, false],
                        ['recurso', ap.resource || '—', true],
                        ['ambiente', ap.environment, false],
                        ['nonce', ap.nonce, true],
                        ['hash', ap.args_hash, true],
                        ['expira', fmt(ap.expires_at, true), false],
                      ] as [string, string, boolean][]).map(([k, v, mono]) => (
                        <div key={k}>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{k}</div>
                          <div className={mono ? 'font-mono' : ''}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 border-t border-border pt-3">
                      <Button size="sm" onClick={() => decide(ap.id, 'approved')}
                        className="flex-1 h-8 bg-primary text-primary-foreground shadow-3d-primary active:translate-y-[1px]">
                        <Check className="h-3.5 w-3.5 mr-1" />Aprovar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decide(ap.id, 'rejected')}
                        className="flex-1 h-8 border-destructive/30 text-destructive hover:bg-destructive/5">
                        <X className="h-3.5 w-3.5 mr-1" />Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="card-premium">
            <CardContent className="py-10 text-center text-muted-foreground text-sm">Nenhuma aprovação pendente</CardContent>
          </Card>
        )}
        {hist.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Histórico</p>
            <div className="space-y-2">
              {hist.map(ap => (
                <Card key={ap.id} className="card-premium">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-sm">{ap.tool}</code>
                      <span className="text-xs text-muted-foreground">{fmt(ap.requested_at, true)}</span>
                    </div>
                    <Badge className={cn('text-[10px] border rounded-full px-2', stsCls(ap.status))}>{ap.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const Auditoria = () => (
    <div className="space-y-4">
      <Card className="card-premium">
        <CardContent className="p-0">
          <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
            <thead><tr className="border-b border-border">
              {['#','Hora','Agente','Tool','Decisão','Tier','Hash'].map(h => (
                <th key={h} className="text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] px-3 pb-2">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {auditLog.map(r => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="px-3 py-2 text-muted-foreground">{r.id}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{r.ts ? fmt(r.ts, true) : '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground truncate">{r.agent_identity || '—'}</td>
                  <td className="px-3 py-2 font-mono truncate">{r.tool || '—'}</td>
                  <td className="px-3 py-2">{r.decision && <Badge className={cn('text-[10px] border rounded-full px-2', decCls(r.decision))}>{r.decision}</Badge>}</td>
                  <td className="px-3 py-2">{r.tier != null && <Badge className={cn('text-[10px] border rounded-full px-2', tierCls(r.tier))}>T{r.tier}</Badge>}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground truncate">{(r.row_hash || '').slice(0,10)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card className="card-premium border-dashed">
        <CardContent className="p-4 text-xs text-muted-foreground flex items-start gap-2">
          <Lock className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
          <span>Role <code className="font-mono">mcp_agent</code> tem apenas <code className="font-mono">INSERT</code> — <code className="font-mono">REVOKE UPDATE, DELETE ON hub.audit_log</code>. A IA nunca apaga rastro.</span>
        </CardContent>
      </Card>
    </div>
  );

  const Arquitetura = () => {
    const [sel, setSel] = useState<string|null>(null);
    const nodes = [
      { id:'mcp',       l:'MCP Adapter',      s:'Recepção',         Icon:Plug,        cls:'text-cyan-700', desc:'Expõe as tools. Não decide, não executa. Repassa ao PEP.' },
      { id:'pep',       l:'PEP',              s:'Guarda na porta',  Icon:ShieldCheck,  cls:'text-primary',  desc:'Único chokepoint. Emite capability assinada — chave nunca no processo da IA.' },
      { id:'pdp',       l:'PDP',              s:'Juiz',             Icon:Database,     cls:'text-warning',  desc:'Função pura: ALLOW / DENY / REQUIRE_APPROVAL + tier. Sem efeito colateral.' },
      { id:'approval',  l:'Approval Service', s:'Assinatura',       Icon:CheckSquare,  cls:'text-warning',  desc:'Aprovação humana via Telegram. SHA-256(identidade+tool+args+recurso+ambiente+nonce+exp). Uso único.' },
      { id:'connector', l:'Connector Hub',    s:'Execução',         Icon:Network,      cls:'text-primary',  desc:'Executa conectores. Só aceita capability válida assinada pelo PEP.' },
      { id:'secret',    l:'Secret Provider',  s:'Cofre',            Icon:Lock,         cls:'text-destructive', desc:'Só o Connector Hub lê, na execução. Sem tool no MCP da IA que retorne secret.' },
      { id:'audit',     l:'Audit Service',    s:'Câmera',           Icon:History,      cls:'text-muted-foreground', desc:'Log append-only encadeado por hash. mcp_agent tem apenas INSERT.' },
    ];
    const selected = sel ? nodes.find(n => n.id === sel) : null;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {nodes.map(n => (
            <button key={n.id} onClick={() => setSel(n.id === sel ? null : n.id)}
              className={cn('card-premium p-4 text-left transition-all hover-lift rounded-xl', sel === n.id && 'ring-2 ring-primary')}>
              <div className={cn('icon-glow h-9 w-9 rounded-lg mb-3', n.cls)}><n.Icon className="h-4 w-4" /></div>
              <p className="font-semibold text-sm tracking-tight mb-0.5">{n.l}</p>
              <p className={cn('text-xs font-medium', n.cls)}>{n.s}</p>
            </button>
          ))}
        </div>
        {selected && (
          <Card className="card-premium border-primary/25">
            <CardContent className="pt-4 flex gap-3">
              <div className={cn('icon-glow h-9 w-9 rounded-lg flex-shrink-0', selected.cls)}>
                <selected.Icon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn('text-sm font-semibold mb-1', selected.cls)}>{selected.l} — {selected.s}</p>
                <p className="text-sm leading-relaxed">{selected.desc}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Route className="h-4 w-4 text-primary" />Fluxo completo — tool sensível</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['IA chama a tool via MCP','MCP repassa ao PEP','PEP calcula hash canônico + consulta PDP','ALLOW → PEP emite capability (TTL 5min)','DENY → recusa + Audit','REQUIRE_APPROVAL → pedido + Telegram','Humano aprova aquele hash exato','PEP verifica + emite capability','Connector Hub valida nonce + puxa secret + executa','Audit grava hash-chain imutável'].map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                <span className="text-sm leading-relaxed">{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const SECTIONS: Record<TabId, () => JSX.Element> = {
    overview: Overview, conectores: Conectores, politicas: Politicas,
    aprovacoes: Aprovacoes, auditoria: Auditoria, arquitetura: Arquitetura,
  };
  const Section = SECTIONS[tab];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
              <ShieldCheck className="h-6 w-6 text-primary" /> Hub de Segurança
            </h1>
            <p className="text-sm text-muted-foreground">PDP · PEP · Aprovações · Audit hash-chain · <code className="font-mono text-xs">lyoigsqluyktoclwdaft</code></p>
          </div>
          <Button onClick={loadAll} variant="outline" size="sm" className="gap-2 shadow-3d-soft active:translate-y-[1px]">
            <Activity className="h-4 w-4" /> Atualizar
          </Button>
        </div>

        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                tab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}>
              <Icon className="h-3.5 w-3.5" />{label}
              {id === 'aprovacoes' && pending.length > 0 && (
                <span className="ml-1 rounded-full bg-warning text-warning-foreground text-[10px] font-bold px-1.5">{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Activity className="h-5 w-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : error ? (
          <Card className="card-premium border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">Erro ao carregar Hub de Segurança</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </div>
              <Button onClick={loadAll} size="sm" className="gap-2">
                <Activity className="h-4 w-4" /> Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : <Section />}
      </div>
    </DashboardLayout>
  );
}
