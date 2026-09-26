import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Cloud,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Play,
  QrCode,
  Save,
  ShieldCheck,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import {
  upsertWhatsAppConnection,
  testWhatsAppConnection,
} from "@/lib/whatsapp.functions";
import { FriendlyErrorBox } from "@/components/whatsapp/FriendlyErrorBox";
import connectionImage from "@/assets/whatsapp-meta-connection.png";

interface Props {
  workspaceId: string;
  onConnected?: () => void;
}

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

const STEPS = [
  { n: 1, label: "Tipo de conexão" },
  { n: 2, label: "Dados da conta" },
  { n: 3, label: "Credenciais Meta" },
  { n: 4, label: "Webhook" },
  { n: 5, label: "Teste" },
];

function gerarTokenSeguro() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  return `mz_verify_${hex}`;
}

export function MetaManualConnectionPanel({ workspaceId, onConnected }: Props) {
  const [form, setForm] = useState<FormData>({
    ...INITIAL,
    verify_token: gerarTokenSeguro(),
  });
  const [revealSecret, setRevealSecret] = useState(false);
  const [revealToken, setRevealToken] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [connId, setConnId] = useState<string | null>(null);
  const [urlCopiada, setUrlCopiada] = useState(false);
  const [tokenWebhookCopiado, setTokenWebhookCopiado] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; message: string }>(null);

  const upsertFn = useServerFn(upsertWhatsAppConnection);
  const testFn = useServerFn(testWhatsAppConnection);

  const webhookUrl = useMemo(
    () =>
      connId
        ? `https://multizap.dev/api/public/whatsapp/webhook/${connId}`
        : "https://app.multizap.com.br/api/webhooks/meta/whatsapp/(gerar-rascunho-primeiro)",
    [connId],
  );

  const upd = (k: keyof FormData, v: string) => {
    let valor = v;
    if (k === "access_token") {
      valor = valor.replace(/^\s*bearer\s+/i, "").replace(/\s+/g, "");
    }
    setForm((f) => ({ ...f, [k]: valor }));
  };

  const tokenAviso = useMemo<string | null>(() => {
    const t = form.access_token;
    if (!t) return null;
    if (/\s/.test(t)) return "O token está com espaços ou quebras de linha. Cole de novo.";
    if (t.length < 50)
      return "Esse token parece curto demais. Tokens da Meta normalmente têm 150+ caracteres.";
    if (!/^[A-Za-z0-9_-]+$/.test(t))
      return "O token tem caracteres estranhos. Cole direto da Meta, sem aspas nem 'Bearer '.";
    return null;
  }, [form.access_token]);

  // Qual passo destacar no stepper esquerdo
  const stepAtual = useMemo<number>(() => {
    if (!form.waba_id || !form.phone_number_id) return 2;
    if (!form.access_token) return 3;
    if (!connId) return 4;
    if (!testResult?.ok) return 5;
    return 5;
  }, [form, connId, testResult]);

  const copiar = async (txt: string, label: string, marcar?: () => void) => {
    await navigator.clipboard.writeText(txt);
    toast.success(`${label} copiado!`);
    marcar?.();
  };

  const salvarRascunho = async () => {
    if (form.waba_id.trim().length < 5 || form.phone_number_id.trim().length < 5) {
      toast.error("Preencha pelo menos WABA ID e Phone Number ID.");
      return null;
    }
    setSalvando(true);
    try {
      const phoneLimpo = form.phone.replace(/\D/g, "");
      const display = `+${form.country_code} ${phoneLimpo}`;
      const r = await upsertFn({
        data: {
          workspaceId,
          name: form.display_name || "WhatsApp Oficial",
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
      toast.success("Rascunho salvo!");
      return r.id;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
      return null;
    } finally {
      setSalvando(false);
    }
  };

  const verificarConexao = async () => {
    let id = connId;
    if (!id) id = await salvarRascunho();
    if (!id) return;
    setTestando(true);
    setTestResult(null);
    try {
      const r = await testFn({ data: { id } });
      if (r.ok) {
        setTestResult({
          ok: true,
          message: `Conectado! Número ${r.display_phone_number ?? ""} verificado.`,
        });
        toast.success("Conexão validada!");
        onConnected?.();
      } else {
        setTestResult({ ok: false, message: r.error ?? "Falha ao validar credenciais." });
        toast.error(r.error ?? "Falha ao validar.");
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

  const tokenValido = form.access_token.length >= 50 && !tokenAviso;
  const webhookPronto = !!connId;

  return (
    <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-[#050B0F] via-[#071014] to-[#03070A] p-5 text-slate-100 shadow-2xl">
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        {/* =================== COLUNA ESQUERDA =================== */}
        <aside className="space-y-5">
          {/* Stepper vertical */}
          <nav className="space-y-1.5">
            {STEPS.map((s) => {
              const ativo = s.n === stepAtual;
              const feito = s.n < stepAtual;
              return (
                <div
                  key={s.n}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    ativo && "bg-emerald-500/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      ativo &&
                        "bg-emerald-500 text-[#06120D] shadow-[0_0_14px_rgba(16,185,129,0.55)]",
                      feito && !ativo && "bg-emerald-500/20 text-emerald-300",
                      !ativo && !feito && "border border-white/10 bg-white/[0.02] text-slate-500 text-sm",
                    )}
                  >
                    {feito ? <Check className="h-3 w-3" /> : s.n}
                  </span>
                  <span
                    className={cn(
                      "truncate",
                      ativo ? "font-medium text-white" : feito ? "text-slate-300" : "text-slate-500 text-sm",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </nav>

          {/* Tipo de conexão */}
          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-white">Tipo de conexão</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 text-sm">
                Escolha como deseja conectar seu número ao MultiZap.
              </p>
            </div>
            <div className="space-y-2">
              <ConnectionTypeCard
                icon={Cloud}
                title="Meta Cloud API Manual"
                desc="Configuração manual via Meta Cloud API."
                selected
              />
              <ConnectionTypeCard
                icon={Sparkles}
                title="Embedded Signup"
                desc="Fluxo automático de cadastro na Meta (beta)."
                badge="beta"
                disabled
              />
              <ConnectionTypeCard
                icon={QrCode}
                title="QR Code Próprio"
                desc="Conexão via QR Code do seu WhatsApp."
                badge="Em breve"
                disabled
              />
            </div>
          </div>
        </aside>

        {/* =================== COLUNA CENTRAL =================== */}
        <main className="space-y-5">
          {/* [2] Dados da Conta WhatsApp Business */}
          <SectionCard step={2} title="Dados da Conta WhatsApp Business">
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <LabelLine text="WABA ID" hint />
                <Input
                  value={form.waba_id}
                  onChange={(v) => upd("waba_id", v)}
                  placeholder="123456789012345"
                  mono
                />
                <Hint>
                  Encontre no Gerenciador de Negócios da Meta &gt; Conta WhatsApp &gt; Visão geral.
                </Hint>
              </div>

              <div className="lg:col-span-4">
                <LabelLine text="Phone Number ID" />
                <Input
                  value={form.phone_number_id}
                  onChange={(v) => upd("phone_number_id", v)}
                  placeholder="987654321098765"
                  mono
                />
                <Hint>Encontre em Números de telefone &gt; Número de telefone.</Hint>
              </div>

              <div className="lg:col-span-2">
                <LabelLine text="Código do país" />
                <div className="relative">
                  <select
                    value={form.country_code}
                    onChange={(e) => upd("country_code", e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-[#0A1218] px-3 py-2.5 pr-8 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option value="55">55</option>
                    <option value="1">1</option>
                    <option value="44">44</option>
                    <option value="351">351</option>
                    <option value="34">34</option>
                    <option value="52">52</option>
                    <option value="54">54</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 text-sm" />
                </div>
              </div>

              <div className="lg:col-span-2">
                <LabelLine text="Telefone" />
                <Input
                  value={form.phone}
                  onChange={(v) => upd("phone", v)}
                  placeholder="1198765-4321"
                  mono
                />
              </div>

              <div className="lg:col-span-6 lg:col-start-7">
                <LabelLine text="Nome da empresa" />
                <Input
                  value={form.display_name}
                  onChange={(v) => upd("display_name", v)}
                  placeholder="Minha Empresa LTDA"
                />
                <Hint>Este nome será exibido para os seus clientes.</Hint>
              </div>
            </div>
          </SectionCard>

          {/* [3] Credenciais do aplicativo Meta */}
          <SectionCard step={3} title="Credenciais do aplicativo Meta">
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <LabelLine text="Meta App ID" />
                <Input
                  value={form.meta_app_id}
                  onChange={(v) => upd("meta_app_id", v)}
                  placeholder="1234567890123456"
                  mono
                />
                <Hint>
                  Encontre no Painel do seu app no desenvolvedores.facebook.com.
                </Hint>
              </div>

              <div>
                <LabelLine text="App Secret" />
                <div className="relative">
                  <Input
                    type={revealSecret ? "text" : "password"}
                    value={form.app_secret}
                    onChange={(v) => upd("app_secret", v)}
                    placeholder="••••••••••••••••"
                    mono
                    paddingRight
                  />
                  <button
                    type="button"
                    onClick={() => setRevealSecret(!revealSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 text-sm hover:text-emerald-300"
                  >
                    {revealSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Hint>Clique em "Mostrar" para copiar o App Secret do seu aplicativo.</Hint>
              </div>

              <div>
                <LabelLine text="Access Token permanente" />
                <div className="relative">
                  <Input
                    type={revealToken ? "text" : "password"}
                    value={form.access_token}
                    onChange={(v) => upd("access_token", v)}
                    placeholder="••••••••••••••••••••••••••••••••"
                    mono
                    paddingRight
                  />
                  <button
                    type="button"
                    onClick={() => setRevealToken(!revealToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 text-sm hover:text-emerald-300"
                  >
                    {revealToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Hint>
                  Gere um token com as permissões: whatsapp_business_messaging,
                  whatsapp_business_management.
                </Hint>
              </div>

              <div className="lg:col-span-2">
                <LabelLine text="Verify Token" />
                <div className="flex gap-2">
                  <Input
                    value={form.verify_token}
                    onChange={(v) => upd("verify_token", v)}
                    mono
                  />
                  <button
                    type="button"
                    onClick={() => upd("verify_token", gerarTokenSeguro())}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-medium text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Gerar token seguro
                  </button>
                </div>
                <Hint>Token usado para validar as requisições do Webhook.</Hint>
              </div>
            </div>

            {tokenAviso && (
              <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                ⚠ {tokenAviso}
              </div>
            )}
          </SectionCard>

          {/* [4] Webhook */}
          <SectionCard step={4} title="Webhook">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div>
                  <LabelLine text="Callback URL" />
                  <div className="flex gap-2">
                    <Input value={webhookUrl} mono readOnly onChange={() => {}} />
                    <button
                      onClick={() =>
                        connId
                          ? copiar(webhookUrl, "URL", () => setUrlCopiada(true))
                          : toast.info("Salve o rascunho primeiro para gerar a URL.")
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
                    >
                      {urlCopiada ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copiar URL
                    </button>
                  </div>
                </div>

                <div>
                  <LabelLine text="Verify Token" />
                  <div className="flex gap-2">
                    <Input value={form.verify_token} mono readOnly onChange={() => {}} />
                    <button
                      onClick={() =>
                        copiar(form.verify_token, "Token", () => setTokenWebhookCopiado(true))
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
                    >
                      {tokenWebhookCopiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copiar token
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-sm">
                  ⓘ Configure este URL e o Verify Token no campo Webhook da sua aplicação na Meta.
                </p>
              </div>

              {/* Checklist lateral */}
              <div className="rounded-xl border border-white/8 bg-[#050B0F]/60 p-4">
                <p className="mb-3 text-xs font-semibold text-white">Checklist do Webhook</p>
                <ul className="space-y-2 text-xs">
                  <ChecklistItem ok={testResult?.ok ?? false} label="Campo messages assinado" />
                  <ChecklistItem ok={false} pending label="Webhook validado" />
                  <ChecklistItem ok={false} label="Número ativo" />
                </ul>
              </div>
            </div>
          </SectionCard>

          {/* [5] Teste de conexão */}
          <SectionCard step={5} title="Teste de conexão">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Pill icon={MessageCircle} label="Meta Oficial" tone="emerald" />
                  <Pill icon={Sparkles} label="Modo Manual" tone="violet" />
                  <Pill icon={ShieldCheck} label="Seguro" tone="emerald" />
                </div>
                <p className="text-[11px] text-slate-500 text-sm">
                  ⓘ Clique em "Verificar conexão" para validar suas credenciais e testar o envio e
                  recebimento de mensagens.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-white">Status da conexão</p>
                <div className="space-y-1.5">
                  <StatusRow state={tokenValido ? "ok" : "idle"} label="Token válido" />
                  <StatusRow state={webhookPronto ? "ok" : "pending"} label="Webhook pendente" />
                  <StatusRow state={testResult?.ok ? "ok" : "idle"} label="Pronto para testar" />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={verificarConexao}
                disabled={testando || salvando}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#03070A] shadow-[0_0_24px_rgba(34,197,94,0.45)] hover:bg-emerald-400 disabled:opacity-60"
              >
                {testando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                Verificar conexão
              </button>
              <button
                onClick={salvarRascunho}
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 hover:border-white/20 hover:bg-white/10 disabled:opacity-60"
              >
                {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar rascunho
              </button>
            </div>

            {testResult?.ok && (
              <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                {testResult.message}
              </div>
            )}
            {testResult && !testResult.ok && (
              <div className="mt-4">
                <FriendlyErrorBox error={testResult.message} />
              </div>
            )}
          </SectionCard>
        </main>

        {/* =================== COLUNA DIREITA =================== */}
        <aside className="space-y-5">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Resumo da conexão</h3>
            <ConnectionIllustration />

            <div className="mt-5 space-y-4">
              <SummaryBlock
                icon={MessageCircle}
                title="Sem Embedded Signup"
                desc="Conexão 100% manual usando Meta Cloud API."
              />
              <SummaryBlock
                icon={Sparkles}
                title="Configuração guiada"
                desc="Siga o passo a passo e conecte seu número com segurança."
              />
              <SummaryBlock
                icon={ShieldCheck}
                title="Compatível com Meta Cloud API"
                desc="Integração oficial e estável com a plataforma da Meta."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#0A1218]/80 p-4">
            <p className="text-sm font-semibold text-white">Precisa de ajuda?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Acesse nossa central de ajuda ou fale com o suporte.
            </p>
            <a
              href="https://multizap.dev/ajuda"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
            >
              Abrir ajuda
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ===================== Subcomponentes ===================== */

function SectionCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-emerald-500/10 bg-gradient-to-b from-[#0B1620]/90 to-[#0A1218]/80 p-5 shadow-[0_0_0_1px_rgba(16,185,129,0.03),0_20px_60px_-40px_rgba(16,185,129,0.25)]">
      <header className="mb-4 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-[#06120D] shadow-[0_0_14px_rgba(16,185,129,0.45)]">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function ConnectionTypeCard({
  icon: Icon,
  title,
  desc,
  selected,
  disabled,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  selected?: boolean;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 transition-all",
        selected
          ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_18px_rgba(34,197,94,0.2)]"
          : "border-white/8 bg-[#0A1218]/60",
        disabled && "opacity-50",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            selected ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-400",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-medium text-white">{title}</p>
            {selected && <Check className="h-3 w-3 shrink-0 text-emerald-400" />}
            {badge && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-300">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function LabelLine({ text, hint }: { text: string; hint?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
      {text}
      {hint && (
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-500 text-[9px] text-slate-400">
          ?
        </span>
      )}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  mono,
  readOnly,
  type = "text",
  paddingRight,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  readOnly?: boolean;
  type?: string;
  paddingRight?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      autoComplete="off"
      className={cn(
        "w-full rounded-lg border border-white/10 bg-[#0A1218] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30",
        mono && "font-mono",
        paddingRight && "pr-10",
        readOnly && "cursor-default",
      )}
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 text-sm">{children}</p>;
}

function ChecklistItem({ ok, pending, label }: { ok?: boolean; pending?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <Check className="h-2.5 w-2.5" />
        </span>
      ) : pending ? (
        <span className="h-4 w-4 rounded-full border border-amber-500/40 bg-amber-500/10" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-white/15 bg-white/[0.02]" />
      )}
      <span className={cn("text-[11px]", ok ? "text-slate-200" : "text-slate-400")}>{label}</span>
    </li>
  );
}

function Pill({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "emerald" | "violet" | "slate";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        tone === "emerald" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        tone === "violet" && "border-violet-500/30 bg-violet-500/10 text-violet-300",
        tone === "slate" && "border-white/10 bg-white/5 text-slate-300",
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function StatusRow({ state, label }: { state: "ok" | "pending" | "idle"; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          state === "ok" && "bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]",
          state === "pending" && "bg-amber-400",
          state === "idle" && "bg-slate-600",
        )}
      />
      <span className={cn(state === "idle" ? "text-slate-500 text-sm" : "text-slate-300")}>{label}</span>
    </div>
  );
}

function SummaryBlock({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function ConnectionIllustration() {
  return (
    <div className="relative flex h-[200px] items-center justify-center overflow-hidden rounded-xl border border-emerald-500/10 bg-gradient-to-b from-[#071014] to-[#03070A]">
      <div className="absolute h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
      <img
        src={connectionImage}
        alt="Conexão WhatsApp via Meta"
        className="relative h-full w-auto object-contain"
      />
    </div>
  );
}
