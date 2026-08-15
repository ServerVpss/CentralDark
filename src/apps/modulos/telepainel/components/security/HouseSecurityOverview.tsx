import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { supabase } from "@/integrations/supabase/hub-client";

type SecurityStatus = "PASS" | "WARN" | "FAIL" | "UNKNOWN" | "UNPROVEN";

type SecurityControl = {
  id: string;
  surface: string;
  name: string;
  status: SecurityStatus;
  summary: string;
  observed_at: string | null;
  evidence_ref: string | null;
};

type SecurityOverview = {
  controls: SecurityControl[];
  open_incidents: number;
  revoked_sessions: number;
  last_restore_test: string | null;
};

type SecurityRpcClient = {
  rpc: (fn: "get_private_security_overview") => PromiseLike<{
    data: unknown;
    error: unknown;
  }>;
};

const EMPTY_COUNTS: Record<SecurityStatus, number> = {
  PASS: 0,
  WARN: 0,
  FAIL: 0,
  UNKNOWN: 0,
  UNPROVEN: 0,
};

export function HouseSecurityOverview() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [runtimeState, setRuntimeState] = useState<"MEASURED" | "UNPROVEN_NOT_DEPLOYED">(
    "UNPROVEN_NOT_DEPLOYED"
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const securityRpc = supabase as unknown as SecurityRpcClient;
    const { data, error } = await securityRpc.rpc("get_private_security_overview");

    if (error || !data || typeof data !== "object") {
      setOverview(null);
      setRuntimeState("UNPROVEN_NOT_DEPLOYED");
      setLoading(false);
      return;
    }

    setOverview(data as SecurityOverview);
    setRuntimeState("MEASURED");
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    const next = { ...EMPTY_COUNTS };
    for (const control of overview?.controls ?? []) {
      if (control.status in next) next[control.status] += 1;
    }
    return next;
  }, [overview]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Casa / House Security</h2>
            <p className="text-sm text-muted-foreground">
              Paz por fora, Zero Trust por dentro. Projeção de estado; a realidade medida continua sendo o árbitro.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar / Refresh
        </Button>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-xs text-muted-foreground">RUNTIME_STATE</div>
        <div className="font-mono text-sm font-medium">{runtimeState}</div>
        {runtimeState !== "MEASURED" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Fundação presente no código não equivale a migration aplicada. Nenhum status foi promovido a PASS.
          </p>
        )}
      </div>

      {overview && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.entries(counts) as Array<[SecurityStatus, number]>).map(([status, total]) => (
              <div key={status} className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">{status}</div>
                <div className="text-2xl font-semibold">{total}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Incidentes abertos</div>
              <div className="text-xl font-semibold">{overview.open_incidents}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Sessões revogadas</div>
              <div className="text-xl font-semibold">{overview.revoked_sessions}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Último restore provado</div>
              <div className="text-sm font-medium">{overview.last_restore_test ?? "UNPROVEN"}</div>
            </div>
          </div>

          <div className="divide-y rounded-xl border">
            {overview.controls.map((control) => (
              <article key={control.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-medium">{control.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {control.surface} · {control.summary}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    evidence: {control.evidence_ref ?? "UNPROVEN"}
                  </div>
                </div>
                <span className="w-fit rounded-full border px-2 py-1 font-mono text-xs">{control.status}</span>
              </article>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Secrets: status-only. Valores de credenciais nunca são renderizados por este painel. Ações sensíveis continuam no backend autorizado.
      </p>
    </section>
  );
}
