import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Webhook,
  Zap,
} from "lucide-react";
import {
  upsertWhatsAppConnection,
  testWhatsAppConnection,
} from "@/lib/whatsapp.functions";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  onConnected?: () => void;
}

type TipoConexao = "manual" | "embedded" | "baileys";

interface FormData {
  waba_id: string;
  phone_number_id: string;
  country_code: string;
  phone: string;
  display_name: string;
  meta_app_id: string;
  app_secret: string;
  access_token: string;
  verify_token: string;
}

const INITIAL: FormData = {
  waba_id: "",
  phone_number_id: "",
  country_code: "55",
  phone: "",
  display_name: "",
  meta_app_id: "",
  app_secret: "",
  access_token: "",
  verify_token: "",
};

function gerarTokenSeguro() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function ConnectMetaManualWizard({
  open,
  onOpenChange,
  workspaceId,
  onConnected,
}: Props) {
  const [etapa, setEtapa] = useState(1);
  const [tipo, setTipo] = useState<TipoConexao>("manual");
  const [form, setForm] = useState<FormData>(INITIAL);
  const [revealSecret, setRevealSecret] = useState(false);
  const [revealToken, setRevealToken] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [connId, setConnId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<
    null | { ok: boolean; message: string }
  >(null);
  const [checks, setChecks] = useState({
    urlCopiada: false,
    tokenCopiado: false,
    messagesAssinado: false,
    numeroLigado: false,
  });

  const upsertFn = useServerFn(upsertWhatsAppConnection);
  const testFn = useServerFn(testWhatsAppConnection);

  const webhookUrl = useMemo(
    () =>
      connId
        ? `https://multizap.dev/api/public/whatsapp/webhook/${connId}`
        : "",
    [connId],
  );

  const reset = () => {
    setEtapa(1);
    setTipo("manual");
    setForm(INITIAL);
    setRevealSecret(false);
    setRevealToken(false);
    setConnId(null);
    setTestResult(null);
    setChecks({
      urlCopiada: false,
      tokenCopiado: false,
      messagesAssinado: false,
      numeroLigado: false,
    });
  };

  const fechar = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const podeAvancarEtapa2 =
    form.waba_id.trim().length >= 5 &&
    form.phone_number_id.trim().length >= 5 &&
    form.country_code.trim().length >= 1 &&
    form.phone.replace(/\D/g, "").length >= 6 &&
    form.display_name.trim().length >= 2;

  const podeAvancarEtapa3 =
    form.meta_app_id.trim().length >= 4 &&
    form.app_secret.trim().length >= 10 &&
    form.access_token.trim().length >= 20 &&
    form.verify_token.trim().length >= 6;

  const copiar = async (txt: string, campo: "url" | "token") => {
    await navigator.clipboard.writeText(txt);
    toast.success("Copiado!");
    setChecks((c) => ({
      ...c,
      urlCopiada: campo === "url" ? true : c.urlCopiada,
      tokenCopiado: campo === "token" ? true : c.tokenCopiado,
    }));
  };

  const salvarESeguir = async () => {
    setSalvando(true);
    try {
      const phoneLimpo = form.phone.replace(/\D/g, "");
      const display = `+${form.country_code} ${phoneLimpo}`;
      const r = await upsertFn({
        data: {
          workspaceId,
          name: form.display_name,
          phone: `${form.country_code}${phoneLimpo}`,
          phone_number_id: form.phone_number_id.trim(),
          waba_id: form.waba_id.trim(),
          access_token: form.access_token.trim(),
          app_secret: form.app_secret.trim(),
          verify_token: form.verify_token.trim(),
          display_phone_number: display,
          meta_app_id: form.meta_app_id.trim(),
          country_code: form.country_code.trim(),
          display_name: form.display_name.trim(),
          connection_mode: "manual",
          initial_status: "pending",
        },
      });
      setConnId(r.id);
      setEtapa(4);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const testar = async () => {
    if (!connId) return;
    setTestando(true);
    setTestResult(null);
    try {
      const r = await testFn({ data: { id: connId } });
      if (r.ok) {
        setTestResult({
          ok: true,
          message: `Conectado! Número ${r.display_phone_number ?? ""} verificado na Meta.`,
        });
      } else {
        setTestResult({
          ok: false,
          message: r.error ?? "Falha ao validar credenciais.",
        });
      }
    } catch (e) {
      setTestResult({
        ok: false,
        message: e instanceof Error ? e.message : "Falha ao validar",
      });
    } finally {
      setTestando(false);
    }
  };

  const finalizar = () => {
    toast.success("Conexão pronta! Aguardando primeiras mensagens.");
    onConnected?.();
    fechar(false);
  };

  const progresso = (etapa / 5) * 100;

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Conectar WhatsApp Oficial da Meta
          </DialogTitle>
          <DialogDescription>
            Conexão direta com a API oficial da Meta. Em 5 passos guiados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Etapa {etapa} de 5</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} />
        </div>

        <div className="min-h-[380px] py-2">
          {etapa === 1 && (
            <Etapa1 tipo={tipo} setTipo={setTipo} />
          )}
          {etapa === 2 && <Etapa2 form={form} setForm={setForm} />}
          {etapa === 3 && (
            <Etapa3
              form={form}
              setForm={setForm}
              revealSecret={revealSecret}
              setRevealSecret={setRevealSecret}
              revealToken={revealToken}
              setRevealToken={setRevealToken}
            />
          )}
          {etapa === 4 && (
            <Etapa4
              webhookUrl={webhookUrl}
              verifyToken={form.verify_token}
              checks={checks}
              setChecks={setChecks}
              copiar={copiar}
            />
          )}
          {etapa === 5 && (
            <Etapa5
              testando={testando}
              testResult={testResult}
              onTestar={testar}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={() => (etapa === 1 ? fechar(false) : setEtapa((e) => e - 1))}
            disabled={salvando || testando}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {etapa === 1 ? "Cancelar" : "Voltar"}
          </Button>

          {etapa === 1 && (
            <Button
              onClick={() => setEtapa(2)}
              disabled={tipo !== "manual"}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Continuar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {etapa === 2 && (
            <Button
              onClick={() => setEtapa(3)}
              disabled={!podeAvancarEtapa2}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {etapa === 3 && (
            <Button
              onClick={salvarESeguir}
              disabled={!podeAvancarEtapa3 || salvando}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Salvar e ver webhook
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
          {etapa === 4 && (
            <Button
              onClick={() => setEtapa(5)}
              disabled={!checks.urlCopiada || !checks.tokenCopiado}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {etapa === 5 && (
            <Button
              onClick={finalizar}
              disabled={!testResult?.ok}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Marcar como conectado
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   ETAPA 1 — Tipo de conexão
   ============================================================ */
function Etapa1({
  tipo,
  setTipo,
}: {
  tipo: TipoConexao;
  setTipo: (t: TipoConexao) => void;
}) {
  const cards: Array<{
    id: TipoConexao;
    titulo: string;
    desc: string;
    icone: typeof Zap;
    badge: { texto: string; cor: string };
    ativo: boolean;
  }> = [
    {
      id: "manual",
      titulo: "Meta Cloud API Manual",
      desc: "Oficial da Meta, ideal pra empresas. Você cola WABA ID, Phone Number ID, App Secret e Access Token do seu painel Meta.",
      icone: ShieldCheck,
      badge: { texto: "Recomendado", cor: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" },
      ativo: true,
    },
    {
      id: "embedded",
      titulo: "Embedded Signup",
      desc: "Login automático via Facebook (Meta autoriza tudo numa janela só). Requer empresa habilitada como Provedor de Tecnologia.",
      icone: Sparkles,
      badge: { texto: "Em breve", cor: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
      ativo: false,
    },
    {
      id: "baileys",
      titulo: "QR Code Próprio (Baileys)",
      desc: "Conexão via QR Code em servidor próprio. Não oficial. Preparado pra quem tem infraestrutura dedicada.",
      icone: Zap,
      badge: { texto: "Em breve", cor: "bg-slate-500/15 text-slate-600 border-slate-500/30" },
      ativo: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Escolha o tipo de conexão</h3>
        <p className="text-sm text-muted-foreground">
          Pra começar agora, use o modo Meta Cloud API Manual.
        </p>
      </div>

      <div className="grid gap-3">
        {cards.map((c) => {
          const Icon = c.icone;
          const sel = tipo === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => c.ativo && setTipo(c.id)}
              disabled={!c.ativo}
              className={cn(
                "text-left rounded-xl border p-4 transition-all flex gap-4 items-start",
                sel && c.ativo
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
                  : c.ativo
                    ? "hover:border-muted-foreground/40 cursor-pointer"
                    : "opacity-60 cursor-not-allowed",
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  sel ? "bg-emerald-500 text-white" : "bg-muted",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{c.titulo}</span>
                  <Badge variant="outline" className={cn("text-xs", c.badge.cor)}>
                    {c.badge.texto}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   ETAPA 2 — Dados da conta
   ============================================================ */
function Etapa2({
  form,
  setForm,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
}) {
  const upd = (k: keyof FormData, v: string) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Dados da Conta WhatsApp Business</h3>
        <p className="text-sm text-muted-foreground">
          Você encontra tudo isso no painel da Meta.
        </p>
      </div>

      <div className="grid gap-4">
        <CampoComAjuda
          label="WABA ID (ID da Conta WhatsApp Business)"
          ajuda="Configurações do negócio → Contas → Contas do WhatsApp → Identificação da conta."
          value={form.waba_id}
          onChange={(v) => upd("waba_id", v)}
          placeholder="101537762426534"
        />
        <CampoComAjuda
          label="Phone Number ID"
          ajuda="WhatsApp Manager → Números de telefone → Identificação do número."
          value={form.phone_number_id}
          onChange={(v) => upd("phone_number_id", v)}
          placeholder="1183861441468281"
        />
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <CampoComAjuda
            label="Código país"
            ajuda="Ex: 55 (Brasil)"
            value={form.country_code}
            onChange={(v) => upd("country_code", v.replace(/\D/g, ""))}
            placeholder="55"
          />
          <CampoComAjuda
            label="Telefone (só números)"
            ajuda="Ex: 8491138279"
            value={form.phone}
            onChange={(v) => upd("phone", v.replace(/\D/g, ""))}
            placeholder="8491138279"
          />
        </div>
        <CampoComAjuda
          label="Nome de exibição da empresa"
          ajuda="Esse nome aparece pra você identificar essa conexão no painel."
          value={form.display_name}
          onChange={(v) => upd("display_name", v)}
          placeholder="Minha Empresa LTDA"
        />
      </div>

      <BlocoAjuda
        titulo="Preciso de ajuda pra encontrar esses dados"
        itens={[
          {
            q: "Como achar o WABA ID?",
            a: "Entre em business.facebook.com → Configurações do negócio → Contas → Contas do WhatsApp. Selecione a conta e copie o número que aparece como Identificação.",
          },
          {
            q: "Como achar o Phone Number ID?",
            a: "Em business.facebook.com → WhatsApp Manager → Números de telefone. Clique no número e copie a Identificação do número de telefone.",
          },
        ]}
      />
    </div>
  );
}

/* ============================================================
   ETAPA 3 — Credenciais do app
   ============================================================ */
function Etapa3({
  form,
  setForm,
  revealSecret,
  setRevealSecret,
  revealToken,
  setRevealToken,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  revealSecret: boolean;
  setRevealSecret: (v: boolean) => void;
  revealToken: boolean;
  setRevealToken: (v: boolean) => void;
}) {
  const upd = (k: keyof FormData, v: string) =>
    setForm({ ...form, [k]: v });

  const tokenSuspeito =
    form.access_token.length > 5 && !/^EAA/.test(form.access_token.trim());

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Credenciais do aplicativo Meta</h3>
        <p className="text-sm text-muted-foreground">
          Esses dados nunca são exibidos completos depois de salvos.
        </p>
      </div>

      <div className="grid gap-4">
        <CampoComAjuda
          label="Meta App ID"
          ajuda="developers.facebook.com → Apps → Configurações → Básico → ID do aplicativo."
          value={form.meta_app_id}
          onChange={(v) => upd("meta_app_id", v)}
          placeholder="1234567890123456"
        />

        <CampoSecret
          label="App Secret"
          ajuda="developers.facebook.com → Apps → Configurações → Básico → Chave secreta do app."
          value={form.app_secret}
          onChange={(v) => upd("app_secret", v)}
          revealed={revealSecret}
          onToggle={() => setRevealSecret(!revealSecret)}
        />

        <div className="space-y-1.5">
          <CampoSecret
            label="Access Token permanente"
            ajuda="Business Settings → Usuários do sistema → Gerar token com permissões whatsapp_business_management e whatsapp_business_messaging."
            value={form.access_token}
            onChange={(v) => upd("access_token", v)}
            revealed={revealToken}
            onToggle={() => setRevealToken(!revealToken)}
          />
          {tokenSuspeito && (
            <p className="text-xs text-amber-600">
              ⚠ Tokens da Meta normalmente começam com "EAA". Confira se copiou
              o token correto.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Verify Token</Label>
          <div className="flex gap-2">
            <Input
              value={form.verify_token}
              onChange={(e) => upd("verify_token", e.target.value)}
              placeholder="ex: token gerado automaticamente"
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => upd("verify_token", gerarTokenSeguro())}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Gerar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use este token pra validar o webhook na Meta.
          </p>
        </div>
      </div>

      <BlocoAjuda
        titulo="Como gerar Access Token permanente"
        itens={[
          {
            q: "Passo a passo",
            a: "business.facebook.com → Configurações do negócio → Usuários → Usuários do sistema. Crie um usuário admin, clique em Gerar novo token, selecione seu app Meta e marque whatsapp_business_management + whatsapp_business_messaging. Copie o token (só aparece uma vez!).",
          },
        ]}
      />
    </div>
  );
}

/* ============================================================
   ETAPA 4 — Webhook
   ============================================================ */
function Etapa4({
  webhookUrl,
  verifyToken,
  checks,
  setChecks,
  copiar,
}: {
  webhookUrl: string;
  verifyToken: string;
  checks: {
    urlCopiada: boolean;
    tokenCopiado: boolean;
    messagesAssinado: boolean;
    numeroLigado: boolean;
  };
  setChecks: (c: typeof checks) => void;
  copiar: (txt: string, campo: "url" | "token") => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Webhook className="h-5 w-5 text-blue-500" />
          Configure o webhook na Meta
        </h3>
        <p className="text-sm text-muted-foreground">
          Cole esses 2 valores no painel WhatsApp da Meta.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Webhook URL
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={webhookUrl}
              className="font-mono text-xs"
            />
            <Button size="sm" variant="outline" onClick={() => copiar(webhookUrl, "url")}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Verify Token
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={verifyToken}
              className="font-mono text-xs"
            />
            <Button size="sm" variant="outline" onClick={() => copiar(verifyToken, "token")}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm">
        <p className="font-medium mb-2">📋 Onde colar na Meta</p>
        <p className="text-muted-foreground">
          No app Meta vá em <strong>WhatsApp → Configuração da produção → Configurar
          webhooks</strong>. Cole a URL e o Verify Token, salve, depois clique em{" "}
          <strong>Gerenciar</strong> e assine o campo <strong>messages</strong>.
        </p>
      </div>

      <div className="space-y-2">
        {[
          { key: "urlCopiada" as const, label: "Webhook URL copiada" },
          { key: "tokenCopiado" as const, label: "Verify Token copiado" },
          { key: "messagesAssinado" as const, label: "Campo messages assinado na Meta" },
          { key: "numeroLigado" as const, label: "Número correto ligado ao webhook" },
        ].map((c) => (
          <label
            key={c.key}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={checks[c.key]}
              onChange={(e) =>
                setChecks({ ...checks, [c.key]: e.target.checked })
              }
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm">{c.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ETAPA 5 — Teste
   ============================================================ */
function Etapa5({
  testando,
  testResult,
  onTestar,
}: {
  testando: boolean;
  testResult: null | { ok: boolean; message: string };
  onTestar: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Teste de conexão</h3>
        <p className="text-sm text-muted-foreground">
          Vamos validar se as credenciais funcionam e o número está ativo na Meta.
        </p>
      </div>

      <div className="rounded-xl border p-6 text-center space-y-4">
        <Button
          onClick={onTestar}
          disabled={testando}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {testando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Validando com a Meta...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verificar credenciais
            </>
          )}
        </Button>

        {testResult && (
          <div
            className={cn(
              "rounded-lg p-4 text-sm text-left",
              testResult.ok
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400",
            )}
          >
            <p className="font-medium flex items-center gap-2">
              {testResult.ok ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>⚠</span>
              )}
              {testResult.ok ? "Sucesso" : "Erro"}
            </p>
            <p className="mt-1">{testResult.message}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>O teste verifica:</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>Se o Access Token consegue ler o WABA ID</li>
          <li>Se o Phone Number ID pertence à WABA</li>
          <li>Se o número está registrado e ativo</li>
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
   Helpers de UI
   ============================================================ */
function CampoComAjuda({
  label,
  ajuda,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  ajuda: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">{ajuda}</p>
    </div>
  );
}

function CampoSecret({
  label,
  ajuda,
  value,
  onChange,
  revealed,
  onToggle,
}: {
  label: string;
  ajuda: string;
  value: string;
  onChange: (v: string) => void;
  revealed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        <Input
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          autoComplete="off"
        />
        <Button type="button" variant="outline" size="sm" onClick={onToggle}>
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{ajuda}</p>
    </div>
  );
}

function BlocoAjuda({
  titulo,
  itens,
}: {
  titulo: string;
  itens: Array<{ q: string; a: string }>;
}) {
  return (
    <Accordion type="single" collapsible className="border rounded-xl">
      <AccordionItem value="ajuda" className="border-0">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="flex items-center gap-2 text-sm font-medium">
            <HelpCircle className="h-4 w-4 text-blue-500" />
            {titulo}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 space-y-3">
          {itens.map((it, i) => (
            <div key={i} className="text-sm">
              <p className="font-medium">{it.q}</p>
              <p className="text-muted-foreground mt-1">{it.a}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
