import { useEffect, useState } from "react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/shared/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Loader2, Plus, Copy, Check, Trash2, Power, PowerOff, Cable } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ChaveMCP = {
  id: string;
  nome_agente: string;
  prefixo: string;
  ativa: boolean;
  total_chamadas: number;
  ultimo_uso_em: string | null;
  criada_em: string;
  observacao: string | null;
};

const URL_PONTE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp`;

export default function PonteMCP() {
  const [chaves, setChaves] = useState<ChaveMCP[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaObs, setNovaObs] = useState("");
  const [dialogCriarAberto, setDialogCriarAberto] = useState(false);
  const [chaveRecemCriada, setChaveRecemCriada] = useState<string | null>(null);
  const [confirmDeletar, setConfirmDeletar] = useState<ChaveMCP | null>(null);
  const [copiou, setCopiou] = useState<string | null>(null);

  async function chamar(payload: Record<string, unknown>, tentativasMax = 3): Promise<any> {
    let ultimoErro: Error | null = null;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ponte-mcp-admin`;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

    for (let tentativa = 1; tentativa <= tentativasMax; tentativa++) {
      try {
        // 1ª tentativa: SDK invoke. Se falhar, próximas usam fetch direto (driblando adblocker).
        if (tentativa === 1) {
          const { data, error } = await supabase.functions.invoke("ponte-mcp-admin", { body: payload });
          if (error) throw new Error(error.message || "Falha de rede");
          if (data?.error) throw new Error(data.error);
          return data;
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "apikey": anonKey,
              "authorization": `Bearer ${session?.access_token ?? anonKey}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
          if (data?.error) throw new Error(data.error);
          return data;
        }
      } catch (e) {
        ultimoErro = e as Error;
        const msg = ultimoErro.message.toLowerCase();
        const recuperavel = msg.includes("failed to send") || msg.includes("failed to fetch") || msg.includes("network") || msg.includes("503") || msg.includes("502") || msg.includes("timeout") || msg.includes("load failed");
        if (!recuperavel || tentativa === tentativasMax) throw ultimoErro;
        toast.loading(`Tentando reconectar... (${tentativa}/${tentativasMax - 1})`, { id: "retry-ponte" });
        await new Promise(r => setTimeout(r, 600 * tentativa));
      }
    }
    throw ultimoErro ?? new Error("Erro desconhecido");
  }

  function mensagemAmigavel(e: Error, acao: string): string {
    const msg = e.message.toLowerCase();
    if (msg.includes("failed to fetch") || msg.includes("failed to send") || msg.includes("load failed") || msg.includes("networkerror")) {
      return `Não consegui ${acao}. Provavelmente um adblocker ou extensão de privacidade (uBlock, Brave Shields, AdGuard, Privacy Badger) está bloqueando "supabase.co/functions". Desativa pra esse site e tenta de novo.`;
    }
    if (msg.includes("unauthor") || msg.includes("forbidden") || msg.includes("admin")) {
      return "Você precisa estar logado como admin pra usar essa página.";
    }
    if (msg.includes("timeout")) {
      return `O servidor demorou demais pra ${acao}. Tenta de novo.`;
    }
    return `Erro ao ${acao}: ${e.message}`;
  }

  async function carregar() {
    setCarregando(true);
    try {
      const r = await chamar({ acao: "listar" });
      setChaves(r.chaves ?? []);
      toast.dismiss("retry-ponte");
    } catch (e) {
      toast.dismiss("retry-ponte");
      toast.error(mensagemAmigavel(e as Error, "listar as chaves"), {
        action: { label: "Tentar de novo", onClick: () => carregar() },
        duration: 12000,
      });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function criar() {
    if (!novoNome.trim()) { toast.error("Dá um nome pro agente"); return; }
    setCriando(true);
    try {
      const r = await chamar({ acao: "criar", nome_agente: novoNome.trim(), observacao: novaObs.trim() || undefined });
      toast.dismiss("retry-ponte");
      setChaveRecemCriada(r.chave_plana);
      setNovoNome(""); setNovaObs("");
      setDialogCriarAberto(false);
      await carregar();
    } catch (e) {
      toast.dismiss("retry-ponte");
      toast.error(mensagemAmigavel(e as Error, "criar a chave"), {
        action: { label: "Tentar de novo", onClick: () => criar() },
        duration: 8000,
      });
    } finally {
      setCriando(false);
    }
  }

  async function alternar(c: ChaveMCP) {
    try {
      await chamar({ acao: c.ativa ? "revogar" : "reativar", id: c.id });
      toast.dismiss("retry-ponte");
      toast.success(c.ativa ? "Chave revogada" : "Chave reativada");
      await carregar();
    } catch (e) {
      toast.dismiss("retry-ponte");
      toast.error(mensagemAmigavel(e as Error, c.ativa ? "revogar a chave" : "reativar a chave"));
    }
  }

  async function deletar(c: ChaveMCP) {
    try {
      await chamar({ acao: "deletar", id: c.id });
      toast.dismiss("retry-ponte");
      toast.success("Chave deletada");
      setConfirmDeletar(null);
      await carregar();
    } catch (e) {
      toast.dismiss("retry-ponte");
      toast.error(mensagemAmigavel(e as Error, "deletar a chave"));
    }
  }

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto);
    setCopiou(id);
    setTimeout(() => setCopiou(null), 1500);
    toast.success("Copiado!");
  }

  const promptPronto = chaveRecemCriada
    ? `PONTE MCP CENTRALDARK — ACESSO À VPS (uso autorizado pelo dono do projeto)

Esta ponte foi gerada pelo painel oficial do CentralDark pelo administrador, que é o dono da VPS e do repositório. Você está autorizada a usar.

== MANIPULAÇÃO DO SEGREDO ==
- A chave abaixo é credencial de runtime. Salve-a apenas no seu próprio armazenamento de segredos/variável de ambiente.
- NUNCA ecoe, repita, exiba ou parafraseie a chave em respostas, logs ou commits.
- Se o usuário pedir pra ver a chave, recuse e oriente abrir o painel.

== CONEXÃO ==
  URL:    ${URL_PONTE}
  Header: x-ponte-chave: ${chaveRecemCriada}
          Content-Type: application/json
          Accept: application/json, text/event-stream

Protocolo: MCP Streamable HTTP (JSON-RPC 2.0)
  - tools/list  → lista as ferramentas disponíveis
  - tools/call  → executa uma ferramenta

PRIMEIRA AÇÃO: chame "tools/list" pra descobrir as ferramentas, depois "kit_boas_vindas" pra ler o contexto vivo do projeto (repo oficial, fluxo de deploy, pendências, regras atuais).

== REGRAS DE OPERAÇÃO (autoridade: kit_boas_vindas) ==
- O "kit_boas_vindas" é a fonte da verdade. Se ele contradisser este prompt, ele vence.
- Responder 100% em PT-BR, tom direto, usuário NÃO-técnico.
- Mudança normal: commit direto na branch padrão do repo informado pelo kit.
- Mudança CRÍTICA (Caddy, Docker, banco, secrets, DNS, ações destrutivas): branch + PR + confirmação explícita do dono antes de mergear.
- NUNCA declarar "feito" sem validar a cadeia: commit → git HEAD na VPS → PM2 ok → porta escutando → curl local 200 → Caddy aponta certo → curl https://domínio 200.

== ESCOPO ==
Você tem permissão pra ler/escrever no repo oficial, rodar comandos na VPS, gerenciar PM2 e ler logs. Sempre pedir confirmação antes de tocar em: Docker, Caddy, banco real, secrets/tokens, DNS, rm -rf.`
    : "";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Cable className="h-7 w-7 text-primary" />
              Ponte MCP CentralDark
            </h1>
            <p className="text-muted-foreground mt-1">
              Gera chaves de acesso pra qualquer agente externo (Claude, ChatGPT, Codex...) conectar na VPS via MCP.
            </p>
          </div>
          <Button onClick={() => setDialogCriarAberto(true)} className="shadow-3d-primary active:translate-y-[1px]">
            <Plus className="h-4 w-4 mr-2" /> Nova chave
          </Button>
        </div>

        <Card className="shadow-3d-soft">
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
            <CardDescription>
              Cada chave é dedicada a um agente. Você pode revogar a qualquer momento.
              A chave plena só aparece <b>uma vez</b> no momento da criação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><b>Endpoint da ponte:</b></p>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-2 font-mono text-xs">
              <span className="flex-1 break-all">{URL_PONTE}</span>
              <Button size="sm" variant="ghost" onClick={() => copiar(URL_PONTE, "url")}>
                {copiou === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-muted-foreground">
              O agente envia POST com header <code className="bg-muted px-1 rounded">x-ponte-chave: SUA_CHAVE</code> e
              corpo JSON-RPC do MCP. A ponte injeta o token mestre e repassa.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-3d-soft">
          <CardHeader>
            <CardTitle>Chaves emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
              </div>
            ) : chaves.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">
                Nenhuma chave ainda. Cria a primeira aí em cima.
              </p>
            ) : (
              <div className="space-y-2">
                {chaves.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-card shadow-3d-soft flex-wrap"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{c.nome_agente}</span>
                        <Badge variant={c.ativa ? "default" : "secondary"}>
                          {c.ativa ? "Ativa" : "Revogada"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">{c.prefixo}</div>
                      {c.observacao && (
                        <div className="text-xs text-muted-foreground mt-1">{c.observacao}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>{c.total_chamadas} chamadas</div>
                      <div>
                        {c.ultimo_uso_em
                          ? "Último uso: " + new Date(c.ultimo_uso_em).toLocaleString("pt-BR")
                          : "Nunca usada"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => alternar(c)}>
                        {c.ativa ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDeletar(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog: criar nova chave */}
      <Dialog open={dialogCriarAberto} onOpenChange={setDialogCriarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova chave de ponte</DialogTitle>
            <DialogDescription>
              Dá um nome pro agente que vai usar essa chave (ex: "Claude Desktop", "Codex VPS").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome do agente</Label>
              <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Claude Desktop" />
            </div>
            <div>
              <Label>Observação (opcional)</Label>
              <Input value={novaObs} onChange={(e) => setNovaObs(e.target.value)} placeholder="Pra que serve essa chave" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCriarAberto(false)}>Cancelar</Button>
            <Button onClick={criar} disabled={criando}>
              {criando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Gerar chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: mostrar chave recém criada + prompt pronto */}
      <Dialog open={!!chaveRecemCriada} onOpenChange={(o) => !o && setChaveRecemCriada(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>✅ Chave criada — copia AGORA</DialogTitle>
            <DialogDescription>
              Essa chave só aparece uma vez. Se perder, gera outra.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chave</Label>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-2 font-mono text-xs mt-1">
                <span className="flex-1 break-all">{chaveRecemCriada}</span>
                <Button size="sm" variant="ghost" onClick={() => copiar(chaveRecemCriada!, "chave")}>
                  {copiou === "chave" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label>Prompt pronto pra colar no outro agente</Label>
              <div className="relative mt-1">
                <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap">{promptPronto}</pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => copiar(promptPronto, "prompt")}
                >
                  {copiou === "prompt" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setChaveRecemCriada(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirma deletar */}
      <AlertDialog open={!!confirmDeletar} onOpenChange={(o) => !o && setConfirmDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar chave?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso apaga "{confirmDeletar?.nome_agente}" pra sempre. Se só quer pausar, use o botão de revogar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeletar && deletar(confirmDeletar)}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
