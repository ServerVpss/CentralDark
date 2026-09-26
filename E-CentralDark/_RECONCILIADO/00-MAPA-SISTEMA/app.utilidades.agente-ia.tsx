import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles, KeyRound, CheckCircle2, AlertTriangle, Trash2, Zap } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { getMyAiKey, setMyAiKey, testMyAiKey, deleteMyAiKey, toggleMyAiKey } from "@/lib/ai-keys.functions";
import { getWorkspacePlanAndUsage } from "@/lib/plans.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/utilidades/agente-ia")({ component: Page });

function Page() {
  const { data: ws } = useCurrentWorkspace();
  return (
    <PageScaffold
      title="Agente de IA"
      description="Configure agentes de IA por setor para responder automaticamente."
      icon={Sparkles}
      adminHref="/admin/ia"
    >
      {ws ? <AiKeySection workspaceId={ws.id} /> : <div className="p-6 text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>}
    </PageScaffold>
  );
}

function AiKeySection({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const getKey = useServerFn(getMyAiKey);
  const setKey = useServerFn(setMyAiKey);
  const testKey = useServerFn(testMyAiKey);
  const delKey = useServerFn(deleteMyAiKey);
  const togKey = useServerFn(toggleMyAiKey);
  const usageFn = useServerFn(getWorkspacePlanAndUsage);

  const { data: keyData, isLoading } = useQuery({
    queryKey: ["my-ai-key", workspaceId],
    queryFn: () => getKey({ data: { workspaceId } }),
  });
  const { data: planData } = useQuery({
    queryKey: ["my-plan-usage", workspaceId],
    queryFn: () => usageFn({ data: { workspaceId } }),
  });

  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [apiKey, setApiKey] = useState("");

  const saveM = useMutation({
    mutationFn: () => setKey({ data: { workspaceId, provider, apiKey } }),
    onSuccess: () => { toast.success("Chave salva."); setApiKey(""); qc.invalidateQueries({ queryKey: ["my-ai-key", workspaceId] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const testM = useMutation({
    mutationFn: () => testKey({ data: { workspaceId } }),
    onSuccess: (r) => { r.ok ? toast.success("Chave funcionando!") : toast.error(r.error ?? "Falhou"); qc.invalidateQueries({ queryKey: ["my-ai-key", workspaceId] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const delM = useMutation({
    mutationFn: () => delKey({ data: { workspaceId } }),
    onSuccess: () => { toast.success("Chave removida."); qc.invalidateQueries({ queryKey: ["my-ai-key", workspaceId] }); },
  });
  const togM = useMutation({
    mutationFn: (active: boolean) => togKey({ data: { workspaceId, active } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-ai-key", workspaceId] }),
  });

  const usingOwnKey = keyData?.key?.active;
  const aiUsed = planData?.usage.ai_responses ?? 0;
  const aiLimit = planData?.limits?.max_messages_per_month ?? 0;
  const pct = aiLimit > 0 ? Math.min(100, (aiUsed / aiLimit) * 100) : 0;

  return (
    <div className="grid gap-6 p-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" /> Consumo do mês</CardTitle>
          <CardDescription>Quantas respostas a IA já gerou este mês.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {usingOwnKey ? (
            <div className="rounded-lg border bg-emerald-500/10 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Usando sua própria chave</div>
              <p className="mt-1 text-muted-foreground">Consumo ilimitado e cobrado direto no seu provedor.</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{aiUsed.toLocaleString("pt-BR")}</span>
                <span className="text-sm text-muted-foreground">de {aiLimit.toLocaleString("pt-BR")}</span>
              </div>
              <Progress value={pct} />
              <p className="text-xs text-muted-foreground">
                {pct >= 90 ? "Quase no limite — considere upgrade ou usar sua própria chave." : "Usando a IA da plataforma (incluída no seu plano)."}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Chave própria de IA</CardTitle>
          <CardDescription>
            {keyData?.allowsByok
              ? "Disponível no seu plano Premium. Cole sua chave OpenAI ou Gemini para consumo ilimitado."
              : "Disponível só no plano Premium. Faça upgrade para usar sua própria chave."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
          ) : keyData?.key ? (
            <div className="space-y-3">
              <div className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{keyData.key.provider?.toUpperCase()} — {keyData.key.api_key_masked}</div>
                    <div className="text-xs text-muted-foreground">
                      {keyData.key.last_test_ok === true && <span className="text-emerald-500">✓ testada</span>}
                      {keyData.key.last_test_ok === false && <span className="text-red-500">✗ {keyData.key.last_test_error}</span>}
                      {keyData.key.last_test_ok === null && "Não testada ainda"}
                    </div>
                  </div>
                  <Switch
                    checked={!!keyData.key.active}
                    onCheckedChange={(v) => togM.mutate(v)}
                    disabled={togM.isPending}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => testM.mutate()} disabled={testM.isPending}>
                  <Zap className="mr-1 h-4 w-4" /> Testar agora
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("Remover chave?")) delM.mutate(); }} disabled={delM.isPending}>
                  <Trash2 className="mr-1 h-4 w-4" /> Remover
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Para trocar a chave, remova a atual e cadastre outra.</p>
            </div>
          ) : keyData?.allowsByok ? (
            <div className="space-y-3">
              <div>
                <Label>Provedor</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as "openai" | "gemini")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="gemini">Google (Gemini)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chave da API</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === "openai" ? "sk-…" : "AIza…"}
                />
              </div>
              <Button onClick={() => saveM.mutate()} disabled={!apiKey || saveM.isPending}>
                <KeyRound className="mr-2 h-4 w-4" /> Salvar chave
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border bg-amber-500/10 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium text-amber-700"><AlertTriangle className="h-4 w-4" /> Recurso do Premium</div>
              <p className="mt-1 text-muted-foreground">No seu plano atual, a IA usa nossa chave com cota mensal. Faça upgrade para usar a sua.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
