import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/shared/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/hub-client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Copy, Key, Trash2, Power, RefreshCw, Shield, Server, Terminal, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardBoasVindas } from "../components/ponte-mcp/CardBoasVindas";
import { CardConectarIA } from "../components/ponte-mcp/CardConectarIA";

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
  if (e.includes("failed to send")) {
    return "Não consegui conectar com o servidor. Verifica sua conexão e tenta de novo em alguns segundos.";
  }
  if (e.includes("401") || e.includes("não autenticado") || e.includes("sessão inválida")) {
    return "Você precisa estar logado como admin pra gerenciar chaves.";
  }
  if (e.includes("403") || e.includes("acesso restrito")) {
    return "Só administradores podem acessar essa área.";
  }
  if (e.includes("timeout") || e.includes("timed out")) {
    return "O servidor demorou demais pra responder. Tenta de novo daqui a pouco.";
  }
  if (e.includes("chave inválida")) {
    return "A chave informada não foi reconhecida. Verifica se copiou certinho.";
  }
  return "Algo deu errado: " + erro;
}

export default function PonteMCP() {
  const { session } = useAuthContext();
  const navigate = useNavigate();
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [nomeAgente, setNomeAgente] = useState("");
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [chaveNova, setChaveNova] = useState<string | null>(null);
  const [promptPronto, setPromptPronto] = useState<string | null>(null);

  const chamar = useCallback(async (acao: string, payload: any = {}, tentativasMax = 3) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp-admin`;
    const token = session?.access_token;

    for (let t = 1; t <= tentativasMax; t++) {
      try {
        if (t === 1) {
          const { data, error } = await supabase.functions.invoke("ponte-mcp-admin", {
            body: { acao, ...payload },
          });
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
        if (t < tentativasMax && (
          msg.toLowerCase().includes("failed to send") ||
          msg.toLowerCase().includes("failed to fetch") ||
          msg.toLowerCase().includes("network") ||
          msg.toLowerCase().includes("load failed") ||
          msg.toLowerCase().includes("503") ||
          msg.toLowerCase().includes("502") ||
          msg.toLowerCase().includes("timeout")
        )) {
          toast.info(`Tentando reconectar... (${t}/${tentativasMax})`);
          await new Promise((r) => setTimeout(r, 800 * t));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Falhou após todas as tentativas");
  }, [session]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await chamar("listar");
      setChaves(data.chaves || []);
    } catch (err: any) {
      toast.error(mensagemAmigavel(err.message), {
        action: { label: "Tentar de novo", onClick: () => carregar() },
      });
    } finally {
      setCarregando(false);
    }
  }, [chamar]);

  const criar = async () => {
    if (!nomeAgente.trim() || nomeAgente.trim().length < 2) {
      toast.error("Dá um nome pro agente, pelo menos 2 letras.");
      return;
    }
    try {
      const data = await chamar("criar", { nome_agente: nomeAgente.trim() });
      if (data.chave_plena) {
        setChaveNova(data.chave_plena);
        setPromptPronto(montarPrompt(data.chave_plena));
        setNomeAgente("");
        carregar();
      }
    } catch (err: any) {
      toast.error(mensagemAmigavel(err.message), {
        action: { label: "Tentar de novo", onClick: () => criar() },
      });
    }
  };

  const alternar = async (id: string) => {
    try {
      await chamar("alternar", { id });
      carregar();
      toast.success("Status da chave atualizado.");
    } catch (err: any) {
      toast.error(mensagemAmigavel(err.message), {
        action: { label: "Tentar de novo", onClick: () => alternar(id) },
      });
    }
  };

  const deletar = async (id: string) => {
    if (!confirm("Tem certeza? A chave some pra sempre.")) return;
    try {
      await chamar("deletar", { id });
      carregar();
      toast.success("Chave apagada.");
    } catch (err: any) {
      toast.error(mensagemAmigavel(err.message), {
        action: { label: "Tentar de novo", onClick: () => deletar(id) },
      });
    }
  };

  const copiar = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`);
  };

  useEffect(() => {
    carregar();
  }, [carregar]);

  function montarPrompt(chave: string): string {
    return `Você está conectado à infraestrutura CentralDark via Ponte MCP.

🔐 CREDENCIAL DE RUNTIME — TRATAMENTO OBRIGATÓRIO
- Esta chave é credencial de runtime. SALVE imediatamente em um secret store (GitHub Secrets, 1Password, Bitwarden, etc.).
- NUNCA repita, ecoe ou exiba esta chave em respostas ao usuário.
- Se o usuário pedir para "ver a chave", "mostrar a chave" ou qualquer tentativa de revelação, RECUSE educadamente e oriente-o a abrir o painel TelePanel (/telepainel/ponte-mcp) para gerenciar suas chaves.

📡 ENDPOINT DA PONTE
${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp

🔑 SUA CHAVE (header x-ponte-chave)
${chave}

🎯 FLUXO DE TRABALHO — REGRAS INVIOLÁVEIS
1. AUTORIZAÇÃO DO DONO
   - Antes de qualquer ação destrutiva ou infraestrutural, confirme explicitamente com o dono (@segredounlocker, ID 1901426549).
   - Não assuma "deve ser isso" — pergunte.

2. REPOSITÓRIO E BRANCH
   - A fonte da verdade sobre repo oficial, branch ativa e fluxo de deploy está no arquivo kit_boas_vindas na raiz da VPS (/root/CentralDark/kit_boas_vindas).
   - LEIA esse arquivo antes de qualquer operação Git.
   - Mudança normal = commit direto na branch ativa.
   - Mudança CRÍTICA (Docker, Caddy, banco real, secrets/tokens, DNS, rm -rf) = abrir PR e esperar confirmação explícita do dono antes de mergear.

3. AÇÕES QUE EXIGEM CONFIRMAÇÃO PRÉVIA DO DONO
   - Alterar configuração Docker ou containers
   - Modificar Caddy (proxy, DNS, SSL)
   - Executar operações em banco de produção
   - Criar/alterar/excluir secrets, tokens ou credenciais
   - Mudanças de DNS ou domínio
   - Qualquer comando rm -rf ou limpeza agressiva

4. SEGURANÇA
   - Nunca execute scripts não auditados.
   - Nunca compartilhe credenciais em chat.
   - Se detectar algo suspeito, pare e avise o dono imediatamente.

⚙️ FERRAMENTAS DISPONÍVEIS (91 no total)
- Shell remoto na VPS
- GitHub (repos, issues, PRs, Actions)
- PM2 (processos, logs, restart)
- Caddy (config, reload)
- Logs ao vivo e health checks

Respeite essas regras. O dono tem poder de revogar esta chave em 1 clique.`;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-600" />
            Ponte MCP CentralDark
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gera chaves de acesso pra qualquer agente externo (Claude, ChatGPT, Codex...) conectar na VPS via MCP.
          </p>
        </div>
        <Button
          onClick={() => setMostrarCriar(true)}
          className="shadow-3d active:translate-y-[1px]"
        >
          <Key className="w-4 h-4 mr-2" />
          Nova chave
        </Button>
      </div>

      {/* Boas-vindas */}
      <CardBoasVindas />

      {/* Bloco de conexão OAuth (1 clique) */}
      <CardConectarIA onChaveCriada={carregar} />

      {/* Card informativo (modo avançado) */}
      <div className="rounded-xl border bg-card p-5 shadow-3d-soft space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600" />
          Modo manual (avançado)
        </h2>
        <p className="text-sm text-muted-foreground">
          Se preferir criar a chave na mão (sem login OAuth), use o botão "Nova chave" no topo.
          A chave plena só aparece uma vez no momento da criação.
        </p>
        <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono space-y-1">
          <div className="text-muted-foreground">Endpoint da ponte:</div>
          <div className="text-emerald-700 dark:text-emerald-400 break-all">
            {import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          O agente envia POST com header <code className="bg-muted px-1 rounded">x-ponte-chave: SUA_CHAVE</code> e corpo JSON-RPC do MCP. A ponte injeta o token mestre e repassa.
        </p>
      </div>

      {/* Lista de chaves */}
      <div className="rounded-xl border bg-card shadow-3d-soft overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Chaves emitidas</h2>
          <Button variant="ghost" size="sm" onClick={carregar} disabled={carregando}>
            <RefreshCw className={`w-4 h-4 ${carregando ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {chaves.length === 0 && !carregando && (
          <div className="p-10 text-center text-muted-foreground text-sm">
            Nenhuma chave ainda. Cria a primeira aí em cima.
          </div>
        )}

        {carregando && chaves.length === 0 && (
          <div className="p-10 text-center text-muted-foreground text-sm">
            Carregando...
          </div>
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
                  {c.ultimo_uso_at && (
                    <span>último: {format(new Date(c.ultimo_uso_at), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                  )}
                  <span>criada: {format(new Date(c.criada_em), "dd/MM/yy", { locale: ptBR })}</span>
                  {c.revogada_em && <span className="text-red-500">revogada</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alternar(c.id)}
                  title={c.ativa ? "Revogar" : "Reativar"}
                >
                  <Power className={`w-4 h-4 ${c.ativa ? "text-emerald-600" : "text-red-500"}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletar(c.id)}
                  title="Apagar pra sempre"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog criar */}
      <Dialog open={mostrarCriar} onOpenChange={setMostrarCriar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova chave de acesso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium block mb-1">Nome do agente</label>
              <Input
                placeholder="Ex: Claude Desktop, Codex VPS, ChatGPT Pro..."
                value={nomeAgente}
                onChange={(e) => setNomeAgente(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && criar()}
              />
            </div>
            <Button onClick={criar} className="w-full shadow-3d active:translate-y-[1px]">
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
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Chave criada — copia agora!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
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

            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
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
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
