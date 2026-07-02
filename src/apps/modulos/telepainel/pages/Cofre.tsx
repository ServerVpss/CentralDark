// Painel Mestre do Administrador — rota /cofre
// Nome neutro pra não entregar que é a central de controle do dono.
// Reaproveita design Esmeralda (3D tátil). Admin-only (AdminRoute).
import { useState } from "react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Shield,
  Bot as BotIcon,
  Bell,
  KeyRound,
  Package,
  Download,
  Trash2,
  TestTube,
  Plus,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { useTelegramBots } from "@/shared/hooks/useTelegramBots";
import {
  useNotificationRoutes,
  TIPOS_EVENTO,
  type TipoEvento,
} from "@/shared/hooks/useNotificationRoutes";
import { useNotificationsLog } from "@/shared/hooks/useNotificationsLog";
import { supabase } from "@/integrations/supabase/hub-client";
import { toast } from "sonner";

const ADMIN_CHAT_ID_DEFAULT = "1901426549";

export default function Cofre() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-3d-soft">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cofre</h1>
              <p className="text-sm text-muted-foreground">
                Central de controle do dono — tudo passa por aqui
              </p>
            </div>
          </div>
          <Badge variant="outline" className="shadow-3d-soft">
            admin · acesso restrito
          </Badge>
        </header>

        <Tabs defaultValue="visao" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full shadow-3d-soft">
            <TabsTrigger value="visao">
              <Activity className="w-4 h-4 mr-1" />
              Visão
            </TabsTrigger>
            <TabsTrigger value="bots">
              <BotIcon className="w-4 h-4 mr-1" />
              Bots
            </TabsTrigger>
            <TabsTrigger value="rotas">
              <Bell className="w-4 h-4 mr-1" />
              Rotas
            </TabsTrigger>
            <TabsTrigger value="contas">
              <KeyRound className="w-4 h-4 mr-1" />
              Contas
            </TabsTrigger>
            <TabsTrigger value="modulos">
              <Package className="w-4 h-4 mr-1" />
              Módulos
            </TabsTrigger>
            <TabsTrigger value="instalador">
              <Download className="w-4 h-4 mr-1" />
              Instalador
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao" className="mt-6">
            <VisaoGeralTab />
          </TabsContent>
          <TabsContent value="bots" className="mt-6">
            <BotsTab />
          </TabsContent>
          <TabsContent value="rotas" className="mt-6">
            <RotasTab />
          </TabsContent>
          <TabsContent value="contas" className="mt-6">
            <ContasTab />
          </TabsContent>
          <TabsContent value="modulos" className="mt-6">
            <ModulosTab />
          </TabsContent>
          <TabsContent value="instalador" className="mt-6">
            <InstaladorTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/* ─────────────── VISÃO GERAL ─────────────── */
function VisaoGeralTab() {
  const { stats, items } = useNotificationsLog({ periodo: "24h" });
  const { bots } = useTelegramBots();
  const ativos = bots.filter((b) => b.is_active).length;
  const ultimo = items[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Notificações 24h" value={stats.total} subtitle={`${stats.sucessoPct}% sucesso`} />
      <StatCard title="Bots ativos" value={ativos} subtitle={`${bots.length} cadastrados`} />
      <StatCard
        title="Último crítico"
        value={stats.ultimoCritico ? "🚨" : "—"}
        subtitle={stats.ultimoCritico?.titulo ?? "sem críticos recentes"}
      />
      <Card className="md:col-span-3 p-6 shadow-3d-soft rounded-xl">
        <h3 className="font-semibold mb-3">Última notificação</h3>
        {ultimo ? (
          <div className="text-sm space-y-1">
            <div className="font-medium">{ultimo.titulo}</div>
            <div className="text-muted-foreground">{ultimo.mensagem}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {ultimo.origem} · {new Date(ultimo.created_at).toLocaleString("pt-BR")}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma notificação ainda.</p>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card className="p-5 shadow-3d-soft rounded-xl">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Card>
  );
}

/* ─────────────── BOTS ─────────────── */
function BotsTab() {
  const { bots, loading } = useTelegramBots();

  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-3d-soft rounded-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">Bots do Telegram</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Token fica seguro no banco. Pra trocar o token de um bot, vá em <b>TelePainel → Bots</b>.
              Aqui você só visualiza e marca o principal pro fallback.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/telepainel/bots">Gerenciar tokens</a>
          </Button>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando bots...</p>
      ) : bots.length === 0 ? (
        <Card className="p-6 shadow-3d-soft rounded-xl text-center">
          <p className="text-sm text-muted-foreground">Nenhum bot cadastrado.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bots.map((b) => (
            <Card key={b.id} className="p-4 shadow-3d-soft rounded-xl flex items-center gap-3">
              {b.bot_photo_url ? (
                <img src={b.bot_photo_url} alt="" className="w-12 h-12 rounded-lg" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <BotIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{b.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  @{b.bot_username ?? "—"}
                </div>
              </div>
              <Badge variant={b.is_active ? "default" : "secondary"}>
                {b.is_active ? "ativo" : "off"}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── ROTAS DE NOTIFICAÇÃO ─────────────── */
function RotasTab() {
  const { routes, loading, addRoute, toggleRoute, deleteRoute } = useNotificationRoutes();
  const { bots } = useTelegramBots();

  const [tipo, setTipo] = useState<TipoEvento>("critico");
  const [botId, setBotId] = useState<string>("");
  const [chatId, setChatId] = useState<string>(ADMIN_CHAT_ID_DEFAULT);
  const [label, setLabel] = useState("");
  const [testing, setTesting] = useState(false);

  const handleAdd = async () => {
    if (!botId) {
      toast.error("Escolha um bot");
      return;
    }
    const cid = Number(chatId);
    if (!cid) {
      toast.error("chat_id inválido");
      return;
    }
    const ok = await addRoute(tipo, botId, cid, label || undefined);
    if (ok) {
      setLabel("");
    }
  };

  const handleTest = async (t: TipoEvento) => {
    setTesting(true);
    const { error } = await supabase.functions.invoke("notify-self-test", {
      body: { tipos: [t] },
    });
    setTesting(false);
    if (error) toast.error("Erro no teste: " + error.message);
    else toast.success(`Teste do tipo "${t}" disparado`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-3d-soft rounded-xl">
        <h3 className="font-semibold">Como funciona</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Cada tipo de evento pode ter uma ou mais rotas (bot + chat). Se um tipo não tiver
          rota cadastrada, cai automaticamente no <b>@srver1bot → seu DM</b>.
        </p>
      </Card>

      <Card className="p-5 shadow-3d-soft rounded-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova rota
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoEvento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS_EVENTO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Bot</Label>
            <Select value={botId} onValueChange={setBotId}>
              <SelectTrigger><SelectValue placeholder="escolher" /></SelectTrigger>
              <SelectContent>
                {bots.filter((b) => b.is_active).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    @{b.bot_username ?? b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Chat ID</Label>
            <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="ID numérico" />
          </div>
          <div>
            <Label className="text-xs">Rótulo (opcional)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex: grupo vendas" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} className="w-full shadow-3d-primary">
              Adicionar
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Pra pegar o Chat ID do seu DM, mande <code>/id</code> pro bot.
          Pra grupo, é negativo (ex: <code>-100123...</code>).
        </p>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando rotas...</p>
      ) : (
        <div className="space-y-3">
          {TIPOS_EVENTO.map((t) => {
            const rotas = routes.filter((r) => r.tipo === t.value);
            return (
              <Card key={t.value} className="p-4 shadow-3d-soft rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">
                    {t.emoji} {t.label}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({rotas.length} rota{rotas.length === 1 ? "" : "s"})
                    </span>
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={testing}
                    onClick={() => handleTest(t.value)}
                  >
                    <TestTube className="w-3 h-3 mr-1" />
                    Testar
                  </Button>
                </div>
                {rotas.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    sem rota cadastrada — usa fallback @srver1bot
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rotas.map((r) => {
                      const bot = bots.find((b) => b.id === r.bot_id);
                      return (
                        <div
                          key={r.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                        >
                          <Switch
                            checked={r.ativo}
                            onCheckedChange={(v) => toggleRoute(r.id, v)}
                          />
                          <div className="flex-1 text-sm">
                            <span className="font-medium">
                              @{bot?.bot_username ?? "bot removido"}
                            </span>
                            <span className="text-muted-foreground"> → </span>
                            <code className="text-xs">{r.chat_id}</code>
                            {r.label && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({r.label})
                              </span>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteRoute(r.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────── CONTAS / OAUTH ─────────────── */
function ContasTab() {
  const contas = [
    { nome: "GitHub", status: "conectado", desc: "Sync de código e deploys", link: "/telepainel/ponte-mcp" },
    { nome: "Google", status: "disponível", desc: "Login social no portal", link: null },
    { nome: "Telegram (conta pessoal)", status: "em breve", desc: "Userbot via QR Code — fase futura", link: null },
  ];
  return (
    <div className="space-y-3">
      <Card className="p-5 shadow-3d-soft rounded-xl">
        <h3 className="font-semibold">Central de Contas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Um lugar só pra plugar suas contas. Tudo via OAuth — sem digitar senha.
        </p>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {contas.map((c) => (
          <Card key={c.nome} className="p-4 shadow-3d-soft rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{c.nome}</h4>
              <Badge variant={c.status === "conectado" ? "default" : "secondary"}>
                {c.status === "conectado" ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {c.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
            {c.link ? (
              <Button asChild size="sm" variant="outline" className="w-full">
                <a href={c.link}>Abrir</a>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="w-full" disabled>
                Indisponível
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── MÓDULOS & VENDAS ─────────────── */
function ModulosTab() {
  const atalhos = [
    { nome: "Planos & preços", link: "/telepainel/plans", desc: "Configurar planos de assinatura" },
    { nome: "Transações PIX", link: "/telepainel/pix", desc: "Histórico de vendas e gateways" },
    { nome: "Usuários", link: "/telepainel/usuarios-painel", desc: "Lista e gestão de clientes" },
    { nome: "Auditoria", link: "/telepainel/audit", desc: "Logs de assinaturas e eventos" },
  ];
  return (
    <div className="space-y-3">
      <Card className="p-5 shadow-3d-soft rounded-xl">
        <h3 className="font-semibold">Módulos & Vendas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Atalhos pras telas que já existem no TelePainel. Em breve tudo aqui dentro.
        </p>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {atalhos.map((a) => (
          <Card key={a.link} className="p-4 shadow-3d-soft rounded-xl">
            <h4 className="font-medium">{a.nome}</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-3">{a.desc}</p>
            <Button asChild size="sm" variant="outline">
              <a href={a.link}>Abrir</a>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── INSTALADOR ─────────────── */
function InstaladorTab() {
  return (
    <div className="space-y-3">
      <Card className="p-5 shadow-3d-soft rounded-xl">
        <h3 className="font-semibold">Instalador da VPS</h3>
        <p className="text-sm text-muted-foreground mt-1">
          O <code>install.sh</code> da raiz é o instalador oficial. A cada feature
          nova, ele é atualizado pra refletir o que existe hoje.
        </p>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-4 shadow-3d-soft rounded-xl">
          <h4 className="font-medium mb-2">install.sh</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Script idempotente que sobe Caddy, PM2, Node, Deno e a stack toda.
          </p>
          <Button asChild size="sm" variant="outline">
            <a href="/docs#instalador">Ver documentação</a>
          </Button>
        </Card>
        <Card className="p-4 shadow-3d-soft rounded-xl">
          <h4 className="font-medium mb-2">Pacote portátil</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Geração de ZIP com tudo necessário pra migrar de VPS — em construção.
          </p>
          <Button size="sm" variant="outline" disabled>
            Em breve
          </Button>
        </Card>
      </div>
    </div>
  );
}
