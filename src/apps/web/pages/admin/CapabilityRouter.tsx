import { useEffect, useState } from "react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Route, PlayCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/hub-client";

interface ContractInfo {
  skill: string;
  status: string;
  owner: string;
  boot_required: boolean;
  schema: string;
  source: string;
}

const EXAMPLE_PAYLOAD = {
  task: {
    task_id: "exemplo-1",
    required_capabilities: ["deliver", "verify"],
    optional_capabilities: ["audit"],
    writer_scope: "docs/exemplo",
    proof_target: "receipt",
  },
  candidates: [
    { id: "hermes", capabilities: ["deliver", "verify"] },
    { id: "reviewer", capabilities: ["verify", "audit"] },
  ],
};

export default function CapabilityRouter() {
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [contractErr, setContractErr] = useState<string | null>(null);

  const [selfTest, setSelfTest] = useState<any>(null);
  const [selfTestLoading, setSelfTestLoading] = useState(false);

  const [payloadText, setPayloadText] = useState(JSON.stringify(EXAMPLE_PAYLOAD, null, 2));
  const [routeResult, setRouteResult] = useState<any>(null);
  const [routeErr, setRouteErr] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    supabase.functions
      .invoke("capability-router", { body: { action: "contract_info" } })
      .then(({ data, error }) => {
        if (error) throw error;
        setContract(data?.data ?? null);
      })
      .catch((e: any) => setContractErr(e?.message ?? "erro desconhecido"));
  }, []);

  const runSelfTest = async () => {
    setSelfTestLoading(true);
    setSelfTest(null);
    try {
      const { data, error } = await supabase.functions.invoke("capability-router", {
        body: { action: "self_test" },
      });
      if (error) throw error;
      setSelfTest(data?.data ?? null);
    } catch (e: any) {
      setSelfTest({ status: "FAIL", failures: [{ error: e?.message ?? "erro desconhecido" }] });
    } finally {
      setSelfTestLoading(false);
    }
  };

  const runRoute = async () => {
    setRouteLoading(true);
    setRouteResult(null);
    setRouteErr(null);
    try {
      const payload = JSON.parse(payloadText);
      const { data, error } = await supabase.functions.invoke("capability-router", {
        body: { action: "route", payload },
      });
      if (error) throw error;
      setRouteResult(data?.data ?? null);
    } catch (e: any) {
      setRouteErr(e?.message ?? "JSON inválido ou erro de rede");
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Route className="h-6 w-6 text-primary" />
            Capability Contract Router
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta a mesma lógica de{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              .agents/skills/capability-contract-router/scripts/route_capabilities.py
            </code>{" "}
            — roteamento determinístico de tarefa para capacidade, sem modelo/IA envolvido.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Contrato canônico
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {contractErr && (
              <p className="text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> {contractErr}
              </p>
            )}
            {!contract && !contractErr && <p className="text-muted-foreground">Carregando…</p>}
            {contract && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-muted-foreground">skill</span>
                <span>{contract.skill}</span>
                <span className="text-muted-foreground">status</span>
                <span><Badge variant="secondary">{contract.status}</Badge></span>
                <span className="text-muted-foreground">owner</span>
                <span>{contract.owner}</span>
                <span className="text-muted-foreground">boot_required</span>
                <span>{String(contract.boot_required)}</span>
                <span className="text-muted-foreground">schema</span>
                <span className="font-mono text-xs">{contract.schema}</span>
                <span className="text-muted-foreground">source</span>
                <span className="font-mono text-xs">{contract.source}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-primary" />
              Self-test (3 fixtures, mesmos do script Python)
            </CardTitle>
            <CardDescription className="text-xs">
              Prova que a lógica da Edge Function bate com a lógica canônica — não é
              opinião de modelo, é comparação de resultado fixo esperado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={runSelfTest} disabled={selfTestLoading} size="sm">
              {selfTestLoading ? "Rodando…" : "Rodar self-test"}
            </Button>
            {selfTest && (
              <div className="text-sm">
                <Badge variant={selfTest.status === "PASS" ? "default" : "destructive"}>
                  {selfTest.status}
                </Badge>{" "}
                <span className="text-muted-foreground">
                  {selfTest.fixtures} fixtures, {selfTest.failures?.length ?? 0} falhas
                </span>
                {selfTest.failures?.length > 0 && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(selfTest.failures, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Testar roteamento manual</CardTitle>
            <CardDescription className="text-xs">
              Edita o JSON (task + candidates) e roda contra a lógica real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={14}
              className="font-mono text-xs"
            />
            <Button onClick={runRoute} disabled={routeLoading} size="sm">
              {routeLoading ? "Roteando…" : "Rodar roteamento"}
            </Button>
            {routeErr && <p className="text-destructive text-sm">{routeErr}</p>}
            {routeResult && (
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(routeResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
