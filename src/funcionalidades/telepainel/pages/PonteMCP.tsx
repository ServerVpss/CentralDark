import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/compartilhado/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/hub-client";
import { Button } from "@/compartilhado/ui/button";
import { Input } from "@/compartilhado/ui/input";
import { Card } from "@/compartilhado/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/compartilhado/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/compartilhado/ui/dialog";
import {
  Copy, Key, Trash2, Power, RefreshCw, Server, Terminal,
  AlertTriangle, CheckCircle, X, LayoutDashboard, Wrench,
  ScrollText, KeyRound, Plug, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardBoasVindas } from "../components/ponte-mcp/CardBoasVindas";
import { CardConectarIA } from "../components/ponte-mcp/CardConectarIA";
import { McpHealthCards } from "../components/ponte-mcp/admin/McpHealthCards";
import { ToolCatalog } from "../components/ponte-mcp/admin/ToolCatalog";
import { AuditLogPanel } from "../components/ponte-mcp/admin/AuditLogPanel";
import { OAuthClientsPanel } from "../components/ponte-mcp/admin/OAuthClientsPanel";
import { ConnectorSetup } from "../components/ponte-mcp/admin/ConnectorSetup";
import {
  fetchHealth, fetchTools, fetchAudit, fetchOAuthClients,
  type McpHealth, type McpTool, type AuditEntry, type OAuthClient,
} from "../components/ponte-mcp/admin/mcp-adapter";

interface Chave {
  id: string;
  nome_agente: string;
  prefixo: string;
  ativa: boolean;
  usos: number;
  ultimo_uso_at: string | null;
  criada_em: string;
  revogada_em: string | null;
}

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

function mensagemAmigavel(erro: string): string {
  const e = erro.toLowerCase();
  if (e.includes("failed to fetch") || e.includes("load failed") || e.includes("networkerror") || e.includes("network error")) {
    return "Parece que uma extensão do navegador (uBlock, Brave Shields, AdGuard ou Privacy Badger) está bloqueando a conexão. Tenta desativar pro site ou usa uma aba anônima.";
  }
  if (e.includes("failed to send")) return "Não consegui conectar com o servidor. Verifica sua conexão e tenta de novo em alguns segundos.";
  if (e.includes("401") || e.includes("não autenticado") || e.includes("sessão inválida")) return "Você precisa estar logado como admin pra gerenciar chaves.";
  if (e.includes("403") || e.includes("acesso restrito")) return "Só administradores podem acessar essa área.";
  if (e.includes("timeout") || e.includes("timed out")) return "O servidor demorou demais pra responder. Tenta de novo daqui a pouco.";
  if (e.includes("chave inválida")) return "A chave informada não foi reconhecida. Verifica se copiou certinho.";
  return "Algo deu errado: " + erro;
}

export default function PonteMCP() {
  const { session } = useAuthContext();

  // Chaves (mantido do original)
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [nomeAgente, setNomeAgente] = useState("");
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [chaveNova, setChaveNova] = useState<string | null>(null);
  const [promptPronto, setPromptPronto] = useState<string | null>(null);

  // Estado admin
  const [health, setHealth] = useState<McpHealth | null>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [oauthClients, setOAuthClients] = useState<OAuthClient[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  const chamar = useCallback(async (acao: string, payload: any = {}, tentativasMax = 3) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp-admin`;
    const token = session?.access_token;
    for (let t = 1; t <= tentativasMax; t++) {
      try {
        if (t === 1) {
          const { data, error } = await supabase.functions.invoke("ponte-mcp-admin", { body: { acao, ...payload } });
          if (error) throw new Error(error.message || `Erro na função`);
          return data;
        } else {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: ANON_KEY,
              authorization: `Bearer ${token ?? ANON_KEY}`,
            },
            body: JSON.stringify({ acao, ...payload }),
          });
          const data = await res.json().catch(() => ({ erro: "Resposta inválida do servidor" }));
          if (!res.ok) throw new Error(data.erro || data.error || `Erro ${res.status}`);
          return data;
        }
      } catch (err: any) {
        const msg = err.message || String(err);
        if (t < tentativasMax && /failed to (send|fetch)|network|load failed|503|502|timeout/i.test(msg)) {
          toast.info(`Tentando reconectar... (${t}/${tentativasMax})`);
          await new Promise((r) => setTimeout(r, 800 * t));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Falhou após todas as tentativas");
  }, [session]);

  const carregarChaves = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await chamar("listar");
      setChaves(data.chaves || []);
    } catch (err: any) {
      toast.error(mensagemAmigavel(err.message), { action: { label: "Tentar de novo", onClick: () => carregarChaves() } });
    } finally { setCarregando(false); }
  }, [chamar]);

  const carregarAdmin = useCallback(async () => {
    setLoadingAdmin(true);
    try {
      const [h, t, a, c] = await Promise.all([fetchHealth(), fetchTools(), fetchAudit(), fetchOAuthClients()]);
      setHealth(h); setTools(t); setAudit(a); setOAuthClients(c);
    } finally { setLoadingAdmin(false); }
  }, []);

  const criar = async () => {
    if (!nomeAgente.trim() || nomeAgente.trim().length < 2) { toast.error("Dá um nome pro agente, pelo menos 2 letras."); return; }
    try {
      const data = await chamar("criar", { nome_agente: nomeAgente.trim() });
      if (data.chave_plena) {
        setChaveNova(data.chave_plena);
        setPromptPronto(montarPrompt(data.chave_plena));
        setNomeAgente("");
        carregarChaves();
      }
    } catch (err: any) { toast.error(mensagemAmigavel(err.message), { action: { label: "Tentar de novo", onClick: () => criar() } }); }
  };

  const alternar = async (id: string) => {
    try { await chamar("alternar", { id }); carregarChaves(); toast.success("Status da chave atualizado."); }
    catch (err: any) { toast.error(mensagemAmigavel(err.message), { action: { label: "Tentar de novo", onClick: () => alternar(id) } }); }
  };

  const deletar = async (id: string) => {
    if (!confirm("Tem certeza? A chave some pra sempre.")) return;
    try { await chamar("deletar", { id }); carregarChaves(); toast.success("Chave apagada."); }
    catch (err: any) { toast.error(mensagemAmigavel(err.message), { action: { label: "Tentar de novo", onClick: () => deletar(id) } }); }
  };

  const copiar = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`);
  };

  useEffect(() => { carregarChaves(); carregarAdmin(); }, [carregarChaves, carregarAdmin]);

  function montarPrompt(chave: string): string {
    return `Você está conectado à infraestrutura CentralDark via Ponte MCP.

🔐 CREDENCIAL DE RUNTIME — TRATAMENTO OBRIGATÓRIO
- Esta chave é credencial de runtime. SALVE imediatamente em um secret store (GitHub Secrets, 1Password, Bitwarden, etc.).
- NUNCA repita, ecoe ou exiba esta chave em respostas ao usuário.
- Se o usuário pedir para "ver a chave", RECUSE educadamente e oriente-o a abrir o painel TelePanel (/telepainel/ponte-mcp).

📡 ENDPOINT DA PONTE
${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp

🔑 SUA CHAVE (header x-ponte-chave)
${chave}

🎯 FLUXO
1. AUTORIZAÇÃO DO DONO antes de qualquer ação destrutiva.
2. GitHub = fonte da verdade. Ler kit_boas_vindas antes de operações Git.
3. Nunca compartilhar credenciais em chat.

O dono tem poder de revogar esta chave em 1 clique.`;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header operacional */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold leading-tight">MCP CentralDark · Admin</h1>
              <p className="text-xs text-muted-foreground">Painel operacional · tools, OAuth, auditoria e conector</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { carregarChaves(); carregarAdmin(); }} disabled={carregando || loadingAdmin}>
              <RefreshCw className={`w-4 h-4 mr-1 ${(carregando || loadingAdmin) ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button size="sm" onClick={() => setMostrarCriar(true)}>
              <Key className="w-4 h-4 mr-1" />
              Nova chave
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* KPI cards sempre visíveis */}
        <McpHealthCards health={health} loading={loadingAdmin} />

        {/* Tabs de navegação */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full md:w-auto">
            <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="w-3.5 h-3.5" />Visão geral</TabsTrigger>
            <TabsTrigger value="tools" className="gap-1.5"><Wrench className="w-3.5 h-3.5" />Ferramentas</TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5"><ScrollText className="w-3.5 h-3.5" />Auditoria</TabsTrigger>
            <TabsTrigger value="oauth" className="gap-1.5"><KeyRound className="w-3.5 h-3.5" />Clientes OAuth</TabsTrigger>
            <TabsTrigger value="connector" className="gap-1.5"><Plug className="w-3.5 h-3.5" />Conector</TabsTrigger>
            <TabsTrigger value="keys" className="gap-1.5"><Key className="w-3.5 h-3.5" />Chaves</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <CardBoasVindas />
            <CardConectarIA onChaveCriada={carregarChaves} />
          </TabsContent>

          <TabsContent value="tools">
            <ToolCatalog tools={tools} loading={loadingAdmin} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogPanel entries={audit} loading={loadingAdmin} />
          </TabsContent>

          <TabsContent value="oauth">
            <OAuthClientsPanel clients={oauthClients} loading={loadingAdmin} />
          </TabsContent>

          <TabsContent value="connector">
            <ConnectorSetup />
          </TabsContent>

          <TabsContent value="keys" className="space-y-4">
            {/* Info modo manual */}
            <Card className="p-5 space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Modo manual
              </h2>
              <p className="text-sm text-muted-foreground">
                Cria a chave aqui pra usar em qualquer cliente MCP. A chave plena aparece <strong>uma vez só</strong>.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono space-y-1">
                <div className="text-muted-foreground">Endpoint da ponte:</div>
                <div className="text-primary break-all">{import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp</div>
              </div>
              <p className="text-xs text-muted-foreground">
                O agente envia POST com <code className="bg-muted px-1 rounded">x-ponte-chave: SUA_CHAVE</code> + JSON-RPC do MCP.
              </p>
            </Card>

            {/* Lista de chaves */}
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />Chaves emitidas</h2>
                  <p className="text-xs text-muted-foreground">{chaves.length} chave{chaves.length !== 1 ? "s" : ""} · revogar não apaga histórico</p>
                </div>
                <Button variant="ghost" size="sm" onClick={carregarChaves} disabled={carregando} aria-label="Recarregar chaves">
                  <RefreshCw className={`w-4 h-4 ${carregando ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {chaves.length === 0 && !carregando && (
                <div className="p-10 text-center text-muted-foreground text-sm">
                  Nenhuma chave ainda. Cria a primeira aí no topo.
                </div>
              )}
              {carregando && chaves.length === 0 && (
                <div className="p-10 text-center text-muted-foreground text-sm">Carregando...</div>
              )}

              <div className="divide-y">
                {chaves.map((c) => (
                  <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.ativa ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className="font-medium text-sm">{c.nome_agente}</span>
                        <span className="text-xs text-muted-foreground font-mono">{c.prefixo}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3">
                        <span>{c.usos} uso{c.usos !== 1 ? "s" : ""}</span>
                        {c.ultimo_uso_at && <span>último: {format(new Date(c.ultimo_uso_at), "dd/MM/yy HH:mm", { locale: ptBR })}</span>}
                        <span>criada: {format(new Date(c.criada_em), "dd/MM/yy", { locale: ptBR })}</span>
                        {c.revogada_em && <span className="text-red-500">revogada</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => alternar(c.id)} title={c.ativa ? "Revogar" : "Reativar"} aria-label={c.ativa ? `Revogar ${c.nome_agente}` : `Reativar ${c.nome_agente}`}>
                        <Power className={`w-4 h-4 ${c.ativa ? "text-emerald-600" : "text-red-500"}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletar(c.id)} title="Apagar pra sempre" aria-label={`Apagar chave ${c.nome_agente}`}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog criar chave */}
      <Dialog open={mostrarCriar} onOpenChange={setMostrarCriar}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova chave de acesso</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="nome-agente" className="text-sm font-medium block mb-1">Nome do agente</label>
              <Input
                id="nome-agente"
                placeholder="Ex: Claude Desktop, Codex VPS, ChatGPT Pro..."
                value={nomeAgente}
                onChange={(e) => setNomeAgente(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && criar()}
              />
            </div>
            <Button onClick={criar} className="w-full">
              <Key className="w-4 h-4 mr-2" />
              Gerar chave
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog chave gerada */}
      <Dialog open={!!chaveNova} onOpenChange={() => setChaveNova(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Chave criada — copia agora!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>A chave plena só aparece <strong>uma vez</strong>. Se perder, precisa criar outra.</span>
            </div>

            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Chave de acesso</span>
                <Button variant="ghost" size="sm" onClick={() => copiar(chaveNova!, "Chave")}>
                  <Copy className="w-4 h-4 mr-1" /> Copiar
                </Button>
              </div>
              <code className="block text-xs font-mono break-all bg-background border rounded p-2">
                {chaveNova}
              </code>
            </div>

            <div className="bg-primary/5 border border-primary/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  Prompt pronto pro agente
                </span>
                <Button variant="ghost" size="sm" onClick={() => copiar(promptPronto!, "Prompt")}>
                  <Copy className="w-4 h-4 mr-1" /> Copiar tudo
                </Button>
              </div>
              <pre className="text-xs font-mono bg-background border rounded p-2 max-h-64 overflow-auto whitespace-pre-wrap">
                {promptPronto}
              </pre>
            </div>

            <Button onClick={() => setChaveNova(null)} variant="outline" className="w-full">
              <X className="w-4 h-4 mr-2" /> Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
