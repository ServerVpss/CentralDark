import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  listAccessibleWabas,
  subscribeAppToWaba,
  unsubscribeAppFromWaba,
  bindWabaToConnection,
} from "@/lib/whatsapp.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, ArrowRightLeft, Link2, X, Compass, ExternalLink, ChevronDown, Copy, XCircle } from "lucide-react";
import { toast } from "sonner";
import { friendlyToastMessage } from "@/lib/whatsapp-error-translate";

export function WabaWebhookAssistant({ connectionId }: { connectionId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listAccessibleWabas);
  const subFn = useServerFn(subscribeAppToWaba);
  const unsubFn = useServerFn(unsubscribeAppFromWaba);
  const bindFn = useServerFn(bindWabaToConnection);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const q = useQuery({
    queryKey: ["waba-assistant", connectionId],
    queryFn: () => listFn({ data: { connectionId } }),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["waba-assistant", connectionId] });
    qc.invalidateQueries({ queryKey: ["wa-diag", connectionId] });
  };

  const subscribe = useMutation({
    mutationFn: (wabaId: string) => subFn({ data: { connectionId, wabaId } }),
    onMutate: (wabaId) => setBusyKey(`sub-${wabaId}`),
    onSettled: () => setBusyKey(null),
    onSuccess: (r) => {
      if (r.ok) {
        toast.success("Pronto! O MultiZap agora recebe mensagens desta conta.");
        refresh();
      } else toast.error(friendlyToastMessage(r.error ?? "Falhou"));
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  const unsubscribe = useMutation({
    mutationFn: (wabaId: string) => unsubFn({ data: { connectionId, wabaId } }),
    onMutate: (wabaId) => setBusyKey(`unsub-${wabaId}`),
    onSettled: () => setBusyKey(null),
    onSuccess: (r) => {
      if (r.ok) {
        toast.success("MultiZap parou de receber desta conta.");
        refresh();
      } else toast.error(friendlyToastMessage(r.error ?? "Falhou"));
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  const bind = useMutation({
    mutationFn: (v: { wabaId: string; phoneNumberId: string; displayPhoneNumber?: string }) =>
      bindFn({ data: { connectionId, ...v } }),
    onMutate: (v) => setBusyKey(`bind-${v.phoneNumberId}`),
    onSettled: () => setBusyKey(null),
    onSuccess: () => {
      toast.success("Número definido como principal desta conexão.");
      refresh();
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  if (q.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        <span className="min-w-0">Consultando a Meta pra ver quais contas seu token vê…</span>
      </div>
    );
  }

  const data = q.data;

  // Helper de cópia
  const copyId = (id: string, label: string) => {
    navigator.clipboard.writeText(id).then(() => toast.success(`${label} copiado`));
  };

  // Bloco reutilizado: passos do diagnóstico vindos do servidor
  const DiagnosticsPanel = ({ diag }: { diag?: { steps: Array<{ step: string; ok: boolean; detail: string }>; tokenTail: string | null; currentWabaId: string | null; failedStep: string | null } }) => {
    if (!diag) return null;
    return (
      <details className="rounded border bg-muted/30 text-xs">
        <summary className="cursor-pointer p-2 font-medium flex items-center justify-between gap-2">
          <span>Diagnóstico passo a passo {diag.failedStep ? `(falhou em: ${diag.failedStep})` : "(tudo verificado)"}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </summary>
        <div className="border-t p-2 space-y-1.5">
          {diag.tokenTail && (
            <div className="text-muted-foreground">Token usado: <code className="font-mono">{diag.tokenTail}</code></div>
          )}
          {diag.currentWabaId && (
            <div className="text-muted-foreground flex items-center gap-1 flex-wrap">
              WABA salva nesta conexão: <code className="font-mono">{diag.currentWabaId}</code>
              <button onClick={() => copyId(diag.currentWabaId!, "WABA ID")} className="inline-flex items-center text-primary hover:underline">
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="space-y-1 pt-1">
            {diag.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                {s.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <div className="font-medium">{s.step}</div>
                  <div className="text-muted-foreground break-words">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>
    );
  };

  if (!data?.ok) {
    const reasonText =
      data?.reason === "no_token"
        ? "Esta conexão não tem token salvo. Cadastre o token desta conexão e tente de novo."
        : data?.reason === "token_invalid"
        ? `A Meta rejeitou o token (provavelmente expirou ou foi revogado). ${data?.error ?? ""}`
        : data?.reason === "current_waba_inaccessible"
        ? `O token salvo não enxerga nem a WABA atual desta conexão. ${data?.error ?? ""}`
        : `Não consegui consultar a Meta com o token salvo. ${data?.error ?? ""}`;
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <Compass className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-medium">Assistente de Webhook</div>
                <div className="text-xs text-muted-foreground mt-1 break-words">{reasonText}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => q.refetch()}
              disabled={q.isFetching}
              className="shrink-0"
            >
              {q.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span className="ml-1">Revalidar token</span>
            </Button>
          </div>
        </div>
        <DiagnosticsPanel diag={(data as { diagnostics?: Parameters<typeof DiagnosticsPanel>[0]["diag"] })?.diagnostics} />
      </div>
    );
  }

  const allWabas = data.businesses.flatMap((b) => b.wabas.map((w) => ({ ...w, business_name: b.name })));
  const limited = "limited" in data && data.limited === true;
  const diag = (data as { diagnostics?: Parameters<typeof DiagnosticsPanel>[0]["diag"] }).diagnostics;

  return (
    <div className="space-y-3">
      {/* Header interno (sem Card duplicado) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Pra onde mandar as mensagens?</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 break-words">
            {limited
              ? `Mostrando só a conta atual desta conexão. Pro assistente listar todas as suas WhatsApp Business, o token precisa da permissão business_management.`
              : `Achei ${allWabas.length} conta(s) WhatsApp Business no seu token. Escolha de qual o MultiZap deve receber.`}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => q.refetch()}
          disabled={q.isFetching}
          className="shrink-0 w-full sm:w-auto"
        >
          {q.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span className="ml-1">Revalidar token</span>
        </Button>
      </div>

      {allWabas.length === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-medium">O token não enxerga nenhuma WhatsApp Business</div>
              <div className="text-xs text-muted-foreground mt-1">
                A Meta respondeu OK, mas não retornou nenhuma WABA pra esse token. Isso quase sempre é uma das três coisas:
              </div>
            </div>
          </div>

          {diag?.currentWabaId && (
            <div className="rounded border bg-background/50 p-2 text-xs">
              <div className="text-muted-foreground">A WABA salva nesta conexão é:</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <code className="font-mono text-sm font-medium">{diag.currentWabaId}</code>
                <button
                  onClick={() => copyId(diag.currentWabaId!, "WABA ID")}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Copy className="h-3 w-3" /> copiar
                </button>
              </div>
              <div className="text-muted-foreground mt-1">
                Confira os passos abaixo usando esse ID.
              </div>
            </div>
          )}

          <ol className="list-decimal list-inside space-y-2 text-xs">
            <li>
              No <a href="https://business.facebook.com/settings/whatsapp-business-accounts" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Business Manager → Contas do WhatsApp <ExternalLink className="h-3 w-3" /></a>, verifique se a WABA <code className="font-mono">{diag?.currentWabaId ?? "—"}</code> aparece <strong>dentro do mesmo Business</strong> que dono do app cujo token está salvo. Se ela estiver em outro Business, o token nunca vai enxergar.
            </li>
            <li>
              Em <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Meta for Developers → Seu app → Funções <ExternalLink className="h-3 w-3" /></a>, confira se o app está <strong>vinculado ao Business Manager</strong> certo (App → Configurações → Básico → Verificar Negócio).
            </li>
            <li>
              Se o token foi gerado por um <strong>Usuário do Sistema</strong>, ele precisa ter o papel de <strong>Admin do app</strong> e estar com <strong>"Acesso completo" à WABA</strong> (Business Manager → Usuários → Usuários do Sistema → Atribuir ativos).
            </li>
            <li>
              Confirme as permissões do token: <code className="font-mono">whatsapp_business_management</code> + <code className="font-mono">whatsapp_business_messaging</code> + <code className="font-mono">business_management</code> (esta última é o que deixa o assistente listar todos os negócios).
            </li>
            <li>
              Por fim, refaça o <strong>Embedded Signup</strong> até o último passo ("Finalizar"). Parar antes deixa a WABA órfã.
            </li>
          </ol>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching} className="w-full sm:w-auto">
              {q.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span className="ml-1">Revalidar token agora</span>
            </Button>
            <a
              href="https://business.facebook.com/settings/whatsapp-business-accounts"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 text-xs text-primary hover:underline px-3 py-2"
            >
              Abrir Business Manager <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      <DiagnosticsPanel diag={diag} />



      {allWabas.map((w) => {
        const isCurrent = w.this_is_current_waba;
        const subCount = w.subscribed_apps.length;
        const hasAny = subCount > 0;
        return (
          <div
            key={w.id}
            className={`rounded-lg border p-3 ${
              isCurrent ? "border-emerald-500/40 bg-emerald-500/5" : hasAny ? "border-amber-500/30 bg-amber-500/5" : "bg-card"
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm">
                {isCurrent ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <span className="truncate font-medium">{w.name}</span>
                {isCurrent && <Badge variant="default" className="text-[10px] shrink-0">Atual</Badge>}
              </div>
              <div className="mt-1 text-xs text-muted-foreground break-all">
                {w.business_name} · WABA <code className="font-mono">{w.id}</code>
              </div>
            </div>

            {/* Apps inscritos */}
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Apps inscritos: </span>
              {hasAny ? (
                <span className="inline-flex flex-wrap gap-1 align-middle">
                  {w.subscribed_apps.map((a, idx) => (
                    <Badge key={a.id ?? idx} variant="outline" className="text-[10px]">
                      {a.name ?? a.id ?? "app"}
                    </Badge>
                  ))}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">nenhum app inscrito</span>
              )}
            </div>

            {/* Números */}
            {w.phones.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {w.phones.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded border bg-background/50 p-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.display_phone_number ?? p.id}</div>
                      <div className="text-muted-foreground truncate">
                        {p.verified_name ?? "—"} · qualidade: {p.quality_rating ?? "?"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyKey === `bind-${p.id}`}
                      onClick={() => bind.mutate({ wabaId: w.id, phoneNumberId: p.id, displayPhoneNumber: p.display_phone_number })}
                      className="w-full sm:w-auto shrink-0"
                    >
                      {busyKey === `bind-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2 className="h-3 w-3" />}
                      <span className="ml-1">Usar como principal</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Ações */}
            <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                disabled={busyKey === `sub-${w.id}`}
                onClick={() => subscribe.mutate(w.id)}
              >
                {busyKey === `sub-${w.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRightLeft className="h-3.5 w-3.5" />}
                <span className="ml-1">Receber aqui no MultiZap</span>
              </Button>
              {hasAny && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive w-full sm:w-auto"
                  disabled={busyKey === `unsub-${w.id}`}
                  onClick={() => {
                    if (confirm("Tem certeza? Isto vai desinscrever este app desta WABA na Meta.")) unsubscribe.mutate(w.id);
                  }}
                >
                  {busyKey === `unsub-${w.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  <span className="ml-1">Parar de receber</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {/* Instruções pra remover outro app */}
      <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between h-auto py-2 text-left">
            <span className="text-xs whitespace-normal break-words">Como remover outro app (ex: Recargas Brasil Bot) da Meta</span>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${showInstructions ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="rounded border bg-muted/30 p-3 text-xs space-y-2">
            <p className="text-muted-foreground">
              Por segurança, a Meta só deixa um app se desinscrever a si mesmo. Pra tirar outro app (ex: o Recargas Brasil Bot) você precisa fazer isso no painel da Meta:
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra <a href="https://business.facebook.com/wa/manage" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">WhatsApp Manager <ExternalLink className="h-3 w-3" /></a>.</li>
              <li>Escolha a WABA → aba <strong>Configurações</strong> → <strong>Webhooks</strong> (ou <strong>Apps integrados</strong>).</li>
              <li>Ao lado do app que você quer tirar, clique em <strong>Remover</strong> / desative <strong>Assinar webhooks</strong>.</li>
            </ol>
            <p className="text-muted-foreground">
              Enquanto não remover, os dois apps continuam recebendo cópia das mensagens — mas o MultiZap já recebe normalmente.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
