import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Phone, ShieldCheck, HelpCircle, Wand2, Copy, CheckCircle2, XCircle, Loader2, AlertTriangle, Webhook,
} from "lucide-react";
import {
  registerNewPhoneOnMeta,
  getMyWebhookCredentials,
  validateMyWebhook,
} from "@/lib/whatsapp.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { VerifyPinPanel } from "@/components/whatsapp/VerifyPinPanel";
import { toast } from "sonner";
import { friendlyToastMessage } from "@/lib/whatsapp-error-translate";

export function RegisterAndVerifyPhone({
  workspaceId,
  onConnected,
}: {
  workspaceId: string;
  onConnected?: () => void;
}) {
  const registerFn = useServerFn(registerNewPhoneOnMeta);

  const [step, setStep] = useState<"form" | "code">("form");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [form, setForm] = useState({
    waba_id: "",
    access_token: "",
    app_secret: "",
    cc: "55",
    phone_number: "",
    verified_name: "",
  });

  const registerM = useMutation({
    mutationFn: () => registerFn({ data: { workspaceId, ...form } }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(friendlyToastMessage(r.error));
      setConnectionId(r.connectionId);
      setStep("code");
      toast.success(r.subscribed ? "Número cadastrado! Já configuramos o ouvinte de mensagens." : "Número cadastrado! Falta só validar o código.");
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  if (step === "code" && connectionId) {
    return (
      <div className="space-y-4">
        <ConnectionSteps current={1} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Passo 1 — Validar o número por SMS/ligação
            </CardTitle>
            <CardDescription>
              Peça o código por SMS ou ligação e digite os 6 dígitos abaixo. Isso só
              <strong> valida o número na Meta</strong> — ainda falta configurar o webhook
              pra começar a receber mensagens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyPinPanel
              connectionId={connectionId}
              onDone={onConnected}
            />
            <Button variant="ghost" className="mt-2" onClick={() => setStep("form")}>Voltar</Button>
          </CardContent>
        </Card>
        <WebhookConfigPanel connectionId={connectionId} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Phone className="h-4 w-4 text-blue-500" /> Cadastrar um número novo
        </CardTitle>
        <CardDescription>
          Use só se você já tem uma conta WhatsApp Business na Meta. Vamos pedir 3 chaves que você copia do site da Meta — depois o sistema cuida de tudo sozinho.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>ID da sua Conta WhatsApp Business</Label>
            <Input value={form.waba_id} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} placeholder="123456789012345" />
            <p className="mt-1 text-[11px] text-muted-foreground">No site da Meta chamam de <span className="font-mono">WABA ID</span>. Fica em "Contas do WhatsApp Business".</p>
          </div>
          <div className="col-span-2">
            <Label>Token de acesso (chave permanente)</Label>
            <Input type="password" value={form.access_token} onChange={(e) => setForm({ ...form, access_token: e.target.value })} placeholder="EAAB..." />
            <p className="mt-1 text-[11px] text-muted-foreground">Gere um token de "Usuário do Sistema" em Configurações da Empresa → Usuários do Sistema.</p>
          </div>
          <div className="col-span-2">
            <Label>Senha do aplicativo (App Secret)</Label>
            <Input type="password" value={form.app_secret} onChange={(e) => setForm({ ...form, app_secret: e.target.value })} />
            <p className="mt-1 text-[11px] text-muted-foreground">Está em Meta for Developers → seu App → Configurações Básicas.</p>
          </div>
          <div>
            <Label>Código do país</Label>
            <Input value={form.cc} onChange={(e) => setForm({ ...form, cc: e.target.value.replace(/\D/g, "") })} placeholder="55" maxLength={4} />
          </div>
          <div>
            <Label>Telefone (só números)</Label>
            <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, "") })} placeholder="84999998888" />
          </div>
          <div className="col-span-2">
            <Label>Nome da empresa (como vai aparecer no WhatsApp)</Label>
            <Input value={form.verified_name} onChange={(e) => setForm({ ...form, verified_name: e.target.value })} placeholder="Minha Empresa LTDA" />
          </div>
        </div>
        <Button
          className="w-full"
          onClick={() => registerM.mutate()}
          disabled={
            registerM.isPending ||
            !form.waba_id || !form.access_token || !form.app_secret ||
            !form.cc || !form.phone_number || !form.verified_name
          }
        >
          {registerM.isPending ? "Registrando…" : "Registrar e pedir código de validação"}
        </Button>
        <p className="text-xs text-muted-foreground">
          O WhatsApp vai te mandar um código de 6 dígitos por SMS ou ligação. Quando você confirmar, o sistema já liga o "ouvinte" pra começar a receber as conversas — você não precisa configurar mais nada.
        </p>

        <VerifyTokenHelper />
      </CardContent>
    </Card>
  );
}

// ============================================================
// Painel principal: mostra URL e token reais da conexão,
// botão pra testar o handshake do webhook ANTES de colar no Meta,
// e checklist dos campos que precisam estar marcados.
// ============================================================
function WebhookConfigPanel({ connectionId }: { connectionId: string }) {
  const credsFn = useServerFn(getMyWebhookCredentials);
  const validateFn = useServerFn(validateMyWebhook);

  const { data: creds, isLoading } = useQuery({
    queryKey: ["wa-webhook-creds", connectionId],
    queryFn: () => credsFn({ data: { connectionId } }),
  });

  const validateM = useMutation({
    mutationFn: () => validateFn({ data: { connectionId } }),
  });

  const copiar = (txt: string, label: string) =>
    navigator.clipboard?.writeText(txt).then(() => toast.success(`${label} copiado.`));

  const status = validateM.data;

  return (
    <Card className="border-blue-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Webhook className="h-4 w-4 text-blue-500" /> Configurar o webhook no Meta
        </CardTitle>
        <CardDescription>
          Copie a URL e o token abaixo e cole no painel do Meta. Antes de colar, dá pra <strong>testar aqui</strong> que tá tudo OK.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isLoading || !creds ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando credenciais…
          </div>
        ) : (
          <>
            {/* URL real */}
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">URL de retorno de chamada</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border bg-background p-2">
                <code className="flex-1 break-all text-[11px] font-mono">{creds.webhookUrl}</code>
                <Button type="button" variant="ghost" size="sm" onClick={() => copiar(creds.webhookUrl, "URL")}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Verify token real */}
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Token de verificação</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border bg-background p-2">
                <code className="flex-1 break-all text-[11px] font-mono">{creds.verifyToken}</code>
                <Button type="button" variant="ghost" size="sm" onClick={() => copiar(creds.verifyToken, "Token")}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Botão testar */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => validateM.mutate()}
                disabled={validateM.isPending}
                className="w-full sm:w-auto"
              >
                {validateM.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando…</>
                ) : (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> Testar URL e token agora</>
                )}
              </Button>

              {status && status.ok && (
                <div className="flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <strong>Funcionou!</strong> O Meta vai conseguir validar essa URL e esse token. Pode colar lá com tranquilidade.
                  </div>
                </div>
              )}

              {status && !status.ok && (
                <div className="space-y-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                  <div className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="space-y-1">
                      <strong>Não passou no teste.</strong>
                      <p>{status.hint}</p>
                    </div>
                  </div>
                  <details className="pl-6 text-[11px] opacity-80">
                    <summary className="cursor-pointer">O que checar (passo a passo)</summary>
                    <ol className="mt-2 list-decimal space-y-1 pl-4">
                      <li><strong>URL:</strong> precisa ser exatamente a que está acima, com o id correto desta conexão. Sem espaço no começo/fim.</li>
                      <li><strong>Token:</strong> precisa ser exatamente o que está acima. Se você inventou um diferente no Meta, cole o desta tela.</li>
                      <li><strong>Id da conexão:</strong> é o pedacinho no final da URL — se você apagar essa conexão e criar outra, a URL muda.</li>
                      <li>Status HTTP recebido: <code>{status.status || "—"}</code>{status.echoed ? ` · Resposta: "${status.echoed}"` : ""}</li>
                    </ol>
                  </details>
                </div>
              )}
            </div>

            {/* Checklist de campos */}
            <WebhookFieldsChecklist />
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Checklist visual dos campos que o usuário precisa marcar no Meta.
// Não envia nada — é só pra ele conferir item por item enquanto configura.
function WebhookFieldsChecklist() {
  const required = [
    { id: "messages", label: "messages", desc: "OBRIGATÓRIO — recebe mensagens novas, lidas, áudio, mídia, etc." },
  ];
  const recommended = [
    { id: "message_template_status_update", label: "message_template_status_update", desc: "Avisa quando seu template é aprovado/rejeitado pela Meta." },
    { id: "messaging_handovers", label: "messaging_handovers", desc: "Útil se você passa conversa entre apps." },
    { id: "account_update", label: "account_update", desc: "Mudanças na conta (status, qualidade, limites)." },
    { id: "account_alerts", label: "account_alerts", desc: "Avisos de bloqueio, banimento ou pagamento." },
    { id: "phone_number_quality_update", label: "phone_number_quality_update", desc: "Quando a qualidade do número muda (verde/amarelo/vermelho)." },
  ];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-3">
      <div className="flex items-start gap-2 text-xs">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>
          Depois de salvar a URL no Meta, clique em <strong>Gerenciar</strong> ao lado de "Campos do webhook" e marque pelo menos o campo <code className="font-mono">messages</code>. Use a lista abaixo pra não esquecer:
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Obrigatório</p>
        <div className="mt-1 space-y-1.5">
          {required.map((f) => (
            <label key={f.id} className="flex items-start gap-2 text-xs cursor-pointer">
              <Checkbox checked={!!checked[f.id]} onCheckedChange={() => toggle(f.id)} className="mt-0.5" />
              <div>
                <code className="font-mono">{f.label}</code>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recomendado (opcional)</p>
        <div className="mt-1 space-y-1.5">
          {recommended.map((f) => (
            <label key={f.id} className="flex items-start gap-2 text-xs cursor-pointer">
              <Checkbox checked={!!checked[f.id]} onCheckedChange={() => toggle(f.id)} className="mt-0.5" />
              <div>
                <code className="font-mono">{f.label}</code>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Esses checkboxes são só pra <em>você</em> se organizar — quem marca de verdade é você lá no painel do Meta.
      </p>
    </div>
  );
}

// Bloco de ajuda do Webhook Verify Token (passo a passo Meta) — mostrado ANTES
// do cadastro, sem URL real ainda (a URL real aparece depois do registro).
function VerifyTokenHelper() {
  const [token, setToken] = useState("");

  const gerarToken = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const b64 = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    setToken(b64);
    navigator.clipboard?.writeText(b64).catch(() => {});
    toast.success("Token gerado e copiado pra área de transferência.");
  };

  const copiar = (txt: string, label: string) =>
    navigator.clipboard?.writeText(txt).then(() => toast.success(`${label} copiado.`));

  return (
    <Collapsible className="rounded-lg border bg-muted/40">
      <CollapsibleTrigger asChild>
        <button type="button" className="flex w-full items-center gap-2 p-3 text-left text-sm font-medium">
          <HelpCircle className="h-4 w-4 text-blue-500" />
          Como funciona o "Webhook Verify Token" (passo a passo)
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t p-4 text-sm">
        <div className="rounded-md bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <strong>Boa notícia:</strong> quando você cadastra o número aqui em cima, o sistema já <strong>cria o Verify Token automaticamente</strong> e mostra a <strong>URL real</strong> com um botão pra <strong>testar antes</strong> de colar no Meta. Não precisa esperar abrir o Diagnóstico.
        </div>

        <div>
          <p className="font-medium">O que é, em uma frase</p>
          <p className="text-muted-foreground text-xs mt-1">
            É uma senha que <em>você</em> inventa. A Meta manda essa senha pro nosso sistema na hora de "apresentar" o webhook. Se bater, ela confirma que o webhook é seu mesmo.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Quer gerar uma senha forte agora?</p>
          <div className="flex gap-2">
            <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Clique no botão pra gerar" className="font-mono text-xs" />
            <Button type="button" variant="outline" size="sm" onClick={gerarToken}>
              <Wand2 className="mr-1 h-3.5 w-3.5" /> Gerar pra mim
            </Button>
            {token && (
              <Button type="button" variant="ghost" size="sm" onClick={() => copiar(token, "Token")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Use essa senha só se quiser definir manualmente. Se preferir, deixa quieto — o sistema gera sozinho ao cadastrar.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Onde colar no Meta</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-xs text-muted-foreground">
            <li>Entre em <span className="font-mono">developers.facebook.com</span> → <strong>seu App</strong> → menu lateral <strong>WhatsApp → Configuração</strong>.</li>
            <li>Na seção <strong>Webhook</strong>, clique em <strong>Editar</strong>.</li>
            <li>Em <strong>URL de retorno de chamada</strong>, cole a URL que vamos te mostrar logo após cadastrar o número.</li>
            <li>Em <strong>Token de verificação</strong>, cole o token (também mostrado depois do cadastro).</li>
            <li>Clique em <strong>Verificar e salvar</strong>. Se der verde, deu certo.</li>
            <li>Depois, ao lado de <strong>Campos do webhook</strong>, clique em <strong>Gerenciar</strong> e ative pelo menos <span className="font-mono">messages</span>.</li>
          </ol>
        </div>

        <div className="rounded-md border-l-2 border-amber-500 bg-amber-500/5 p-2 text-[11px] text-amber-700 dark:text-amber-400">
          ⚠ Se a Meta reclamar "não foi possível validar a URL", o teste daqui de dentro mostra exatamente o motivo: token errado, URL com id errado, ou nosso servidor fora do ar.
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Indicador visual dos 5 passos da conexão Meta Cloud API.
// `current` = índice do passo ativo (0 a 4). Passos anteriores ficam marcados como concluídos.
function ConnectionSteps({ current }: { current: number }) {
  const passos = [
    "Validar número (SMS/ligação)",
    "Configurar chaves da Meta",
    "Gerar Webhook URL + Verify Token",
    "Assinar o campo messages",
    "Receber 1ª mensagem de teste",
  ];
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Conexão WhatsApp — 5 passos
      </p>
      <ol className="grid gap-2 sm:grid-cols-5">
        {passos.map((p, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={p}
              className={[
                "flex items-start gap-2 rounded-md border p-2 text-[11px] leading-snug",
                done ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "",
                active ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300" : "",
                !done && !active ? "text-muted-foreground" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                  done ? "border-emerald-500 bg-emerald-500 text-white" : "",
                  active ? "border-blue-500 bg-blue-500 text-white" : "",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </span>
              <span>{p}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
