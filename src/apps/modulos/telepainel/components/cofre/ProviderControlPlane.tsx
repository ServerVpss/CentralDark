import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Cloud, RefreshCw, Server, ShieldCheck, WalletCards } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { supabase } from "@/integrations/supabase/hub-client";

const PROVIDER_ADMIN_URL = "https://mcp.centralldark.com/admin/provider";

type CapabilityStatus =
  | "READ_SUPPORTED"
  | "WRITE_SUPPORTED"
  | "DESTRUCTIVE_SUPPORTED"
  | "FINANCIAL_READ_SUPPORTED"
  | "FINANCIAL_WRITE_SUPPORTED"
  | "UNSUPPORTED_BY_PUBLIC_API"
  | "DEPRECATED"
  | "UNKNOWN";

type ProviderCapability = {
  provider: "cloudflare" | "contabo";
  capability: string;
  status: CapabilityStatus;
  controlPlaneStatus: string;
  financial: boolean;
  deprecated: boolean;
  alpha: boolean;
  restricted: boolean;
  secretBearing?: boolean;
  requiredParams: string[];
  permission: string | null;
  evidenceRef: string;
  lastVerifiedAt: string;
};

type ProviderCredentials = Record<string, Record<string, "CONFIGURED" | "MISSING">>;

type Budget = {
  provider: string;
  currency: string;
  monthly_budget: number;
  warn_percent: number;
  alert_percent: number;
  block_optional_percent: number;
  enabled: boolean;
};

type RuntimeState = "MEASURED" | "UNPROVEN_NOT_DEPLOYED" | "ERROR";

type ProviderBudgetRpcClient = {
  rpc: (fn: "get_provider_budget_overview") => PromiseLike<{
    data: unknown;
    error: unknown;
  }>;
};

async function adminProviderCall<T>(tool: string, input: Record<string, unknown> = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("AUTH_REQUIRED");
  const response = await fetch(PROVIDER_ADMIN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ tool, input }),
  });
  const payload = await response.json().catch(() => ({ ok: false, status: `HTTP_${response.status}` }));
  if (!response.ok || payload?.ok === false) {
    throw new Error(String(payload?.status || `HTTP_${response.status}`));
  }
  return payload as T;
}

function statusVariant(status: CapabilityStatus) {
  if (status === "UNSUPPORTED_BY_PUBLIC_API") return "secondary" as const;
  if (status === "DEPRECATED") return "outline" as const;
  return "default" as const;
}

function ProviderIcon({ provider }: { provider: string }) {
  return provider === "cloudflare" ? <Cloud className="h-5 w-5" /> : <Server className="h-5 w-5" />;
}

export function ProviderControlPlane() {
  const [capabilities, setCapabilities] = useState<ProviderCapability[]>([]);
  const [credentials, setCredentials] = useState<ProviderCredentials>({});
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("UNPROVEN_NOT_DEPLOYED");
  const [loading, setLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState<"cloudflare" | "contabo">("cloudflare");
  const [params, setParams] = useState<Record<string, Record<string, string>>>({});
  const [result, setResult] = useState<{ capability: string; payload: unknown } | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLastError(null);
    try {
      const [matrix, credentialState] = await Promise.all([
        adminProviderCall<{ capabilities: ProviderCapability[] }>("provider_capabilities"),
        adminProviderCall<{ credentials: ProviderCredentials }>("provider_credentials_status"),
      ]);
      setCapabilities(Array.isArray(matrix.capabilities) ? matrix.capabilities : []);
      setCredentials(credentialState.credentials ?? {});
      setRuntimeState("MEASURED");
    } catch (error) {
      const message = error instanceof Error ? error.message : "PROVIDER_RUNTIME_UNPROVEN";
      setCapabilities([]);
      setCredentials({});
      setRuntimeState(message.includes("404") ? "UNPROVEN_NOT_DEPLOYED" : "ERROR");
      setLastError(message);
    }

    try {
      const budgetRpc = supabase as unknown as ProviderBudgetRpcClient;
      const { data, error } = await budgetRpc.rpc("get_provider_budget_overview");
      if (!error && data && typeof data === "object") {
        const payload = data as { budgets?: Budget[] };
        setBudgets(Array.isArray(payload.budgets) ? payload.budgets : []);
      } else {
        setBudgets([]);
      }
    } catch {
      setBudgets([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const providerCapabilities = useMemo(
    () => capabilities.filter((item) => item.provider === activeProvider),
    [activeProvider, capabilities],
  );

  const counts = useMemo(() => {
    const rows = providerCapabilities;
    return {
      reads: rows.filter((item) => ["READ_SUPPORTED", "FINANCIAL_READ_SUPPORTED"].includes(item.status)).length,
      writes: rows.filter((item) => ["WRITE_SUPPORTED", "DESTRUCTIVE_SUPPORTED", "FINANCIAL_WRITE_SUPPORTED"].includes(item.status)).length,
      unsupported: rows.filter((item) => item.status === "UNSUPPORTED_BY_PUBLIC_API").length,
      deprecated: rows.filter((item) => item.deprecated).length,
    };
  }, [providerCapabilities]);

  const readCapability = async (capability: ProviderCapability) => {
    const byCapability = params[capability.capability] ?? {};
    const missing = capability.requiredParams.filter((name) => !byCapability[name]?.trim());
    if (missing.length) {
      setLastError(`PARAM_REQUIRED:${missing.join(",")}`);
      return;
    }
    setExecuting(capability.capability);
    setLastError(null);
    try {
      const payload = await adminProviderCall("provider_read", {
        provider: capability.provider,
        capability: capability.capability,
        params: byCapability,
      });
      setResult({ capability: capability.capability, payload });
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "PROVIDER_READ_FAILED");
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-3d-soft rounded-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Infrastructure Control Plane</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Um cockpit, um MCP/backend, providers como adapters. Ações nascem somente de capacidades oficiais provadas.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant={runtimeState === "MEASURED" ? "default" : "secondary"}>RUNTIME={runtimeState}</Badge>
          <Badge variant="outline">SECRETS=SERVER_ONLY</Badge>
          <Badge variant="outline">PAYMENT=CAPABILITY_DRIVEN</Badge>
          <Badge variant="outline">MUTATION=QUARANTINED_UNTIL_PROVEN</Badge>
        </div>
        {lastError && <p className="mt-3 font-mono text-xs text-muted-foreground">{lastError}</p>}
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(["cloudflare", "contabo"] as const).map((provider) => {
          const credentialRows = Object.entries(credentials[provider] ?? {});
          const configured = credentialRows.filter(([, value]) => value === "CONFIGURED").length;
          return (
            <button
              type="button"
              key={provider}
              onClick={() => setActiveProvider(provider)}
              className={`rounded-xl border p-4 text-left transition-colors ${activeProvider === provider ? "bg-muted/40" : "bg-card"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold capitalize">
                  <ProviderIcon provider={provider} />
                  {provider}
                </div>
                <Badge variant="outline">{configured}/{credentialRows.length || "?"} credenciais</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Valores nunca são retornados; o painel recebe apenas CONFIGURED/MISSING.
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-3"><div className="text-xs text-muted-foreground">READ</div><div className="text-2xl font-semibold">{counts.reads}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">WRITE / DESTRUCTIVE</div><div className="text-2xl font-semibold">{counts.writes}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">UNSUPPORTED</div><div className="text-2xl font-semibold">{counts.unsupported}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">DEPRECATED</div><div className="text-2xl font-semibold">{counts.deprecated}</div></Card>
      </div>

      <Card className="overflow-hidden shadow-3d-soft rounded-xl">
        <div className="border-b p-4">
          <h4 className="font-semibold capitalize">{activeProvider} — capability matrix</h4>
          <p className="text-xs text-muted-foreground">A UI é derivada da matriz do backend; endpoint não documentado não ganha botão.</p>
        </div>
        <div className="divide-y">
          {providerCapabilities.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">
              Nenhuma capability medida no runtime. Repo presente não equivale a deploy.
            </div>
          ) : providerCapabilities.map((capability) => {
            const readable = ["READ_SUPPORTED", "FINANCIAL_READ_SUPPORTED", "DEPRECATED"].includes(capability.status)
              && capability.secretBearing !== true;
            const mutationReady = capability.controlPlaneStatus === "READY";
            const localParams = params[capability.capability] ?? {};
            return (
              <div key={`${capability.provider}:${capability.capability}`} className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium">{capability.capability}</span>
                      <Badge variant={statusVariant(capability.status)}>{capability.status}</Badge>
                      {capability.financial && <Badge variant="outline"><WalletCards className="mr-1 h-3 w-3" />finance</Badge>}
                      {capability.secretBearing && <Badge variant="secondary">SECRET_BEARING_BLOCKED</Badge>}
                      {capability.alpha && <Badge variant="outline">ALPHA</Badge>}
                      {capability.restricted && <Badge variant="outline">RESTRICTED</Badge>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {capability.permission ?? "sem permissão pública aplicável"} · verified {capability.lastVerifiedAt}
                    </div>
                    {capability.requiredParams.length > 0 && readable && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {capability.requiredParams.map((name) => (
                          <Input
                            key={name}
                            value={localParams[name] ?? ""}
                            onChange={(event) => setParams((current) => ({
                              ...current,
                              [capability.capability]: {
                                ...(current[capability.capability] ?? {}),
                                [name]: event.target.value,
                              },
                            }))}
                            placeholder={name}
                            aria-label={name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {readable ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={executing === capability.capability}
                        onClick={() => void readCapability(capability)}
                      >
                        {executing === capability.capability ? "Medindo…" : "Ler estado"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled={!mutationReady}>
                        {capability.status === "UNSUPPORTED_BY_PUBLIC_API"
                          ? "Não disponível"
                          : capability.secretBearing
                            ? "Bloqueado"
                            : mutationReady
                              ? "Confirmar ação"
                              : "Aguardando prova runtime"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 shadow-3d-soft rounded-xl">
        <div className="flex items-center gap-2">
          <WalletCards className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Budget Guard</h4>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Orçamento é observação e proteção contra gasto opcional inesperado; nunca vira autorização automática de compra.
        </p>
        {budgets.length === 0 ? (
          <div className="mt-3 rounded-lg border p-3 text-sm text-muted-foreground">BUDGET_RUNTIME=UNPROVEN_NOT_DEPLOYED</div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {budgets.map((budget) => (
              <div key={budget.provider} className="rounded-lg border p-3">
                <div className="flex items-center justify-between"><span className="font-medium capitalize">{budget.provider}</span><Badge variant="outline">{budget.currency}</Badge></div>
                <div className="mt-2 text-xl font-semibold">{budget.monthly_budget}</div>
                <div className="mt-1 text-xs text-muted-foreground">WARN {budget.warn_percent}% · ALERT {budget.alert_percent}% · BLOCK OPTIONAL {budget.block_optional_percent}%</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-5 shadow-3d-soft rounded-xl">
          <div className="mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h4 className="font-semibold">Última leitura: {result.capability}</h4></div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted/30 p-3 text-xs">{JSON.stringify(result.payload, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
