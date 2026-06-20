import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Loader2, Play, PlayCircle, RotateCw } from "lucide-react";
import { toast } from "sonner";

type Modulo = {
  module_key: string;
  category: string;
  label: string | null;
  enabled: boolean;
};

type Resultado = {
  outcome: string;
  http: number;
  ms: number;
  tem_dados: boolean;
  erro: string;
  body_keys: string[] | null;
  input: string;
  testedAt: number;
};

// Fallbacks de input por tipo — TODO refinar com dados reais por região
const FALLBACK_BY_CATEGORY: Record<string, string> = {
  pessoa: "11144477735",
  documento: "11144477735",
  contato: "11999999999",
  empresa: "00000000000191",
  veiculo: "ABC1D23",
  foto: "11144477735",
  financeiro: "11144477735",
  governo: "11144477735",
  justica: "11144477735",
};

const FALLBACK_BY_KEY: Record<string, string> = {
  cep: "01001000",
  email: "teste@exemplo.com",
  telefone: "11999999999",
  cnpj: "00000000000191",
  placa: "ABC1D23",
  chassi: "9BWZZZ377VT004251",
  renavam: "00123456789",
  motor: "ABC123456",
  oab: "123456",
  advogadooab: "123456",
  advogadooabuf: "SP123456",
  nome: "JOAO DA SILVA",
  mae: "MARIA DA SILVA",
  pai: "JOSE DA SILVA",
  nomeabreviadofiltros: "J SILVA",
  nasc: "01/01/1990",
};

function getFallbackInput(m: Modulo): string {
  return FALLBACK_BY_KEY[m.module_key] ?? FALLBACK_BY_CATEGORY[m.category] ?? "11144477735";
}

const OUTCOME_COLORS: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  notfound: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  module_disabled: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
  timeout: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  provider_error: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  http_error: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

export default function TesteModulos() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, Resultado>>({});
  const [filter, setFilter] = useState("");
  const [runningAll, setRunningAll] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("query_modules")
        .select("module_key, category, label, enabled")
        .order("category")
        .order("module_key");
      if (error) {
        toast.error("Erro carregando módulos: " + error.message);
        return;
      }
      const ms = (data ?? []) as Modulo[];
      setModulos(ms);

      // Pega último input usado em cada módulo
      const { data: hist } = await supabase
        .from("query_history")
        .select("query_type, query_input, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);

      const lastByModule: Record<string, string> = {};
      for (const h of hist ?? []) {
        if (h.query_type && h.query_input && !lastByModule[h.query_type]) {
          lastByModule[h.query_type] = String(h.query_input);
        }
      }
      const init: Record<string, string> = {};
      for (const m of ms) {
        init[m.module_key] = lastByModule[m.module_key] || getFallbackInput(m);
      }
      setInputs(init);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return modulos;
    return modulos.filter(
      (m) =>
        m.module_key.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.label ?? "").toLowerCase().includes(q),
    );
  }, [modulos, filter]);

  async function testarUm(key: string) {
    setLoading((l) => ({ ...l, [key]: true }));
    const input = inputs[key] || "";
    try {
      const { data, error } = await supabase.functions.invoke("dev-test-modules", {
        body: { modules: [key], inputs: { [key]: input }, delay_ms: 0 },
      });
      if (error) throw error;
      const r = data?.results?.[0];
      if (r) {
        setResults((prev) => ({
          ...prev,
          [key]: {
            outcome: r.outcome,
            http: r.http,
            ms: r.ms,
            tem_dados: r.tem_dados,
            erro: r.erro,
            body_keys: r.body_keys,
            input,
            testedAt: Date.now(),
          },
        }));
        if (r.outcome === "success") toast.success(`${key}: sucesso (${r.ms}ms)`);
        else if (r.outcome === "notfound") toast(`${key}: sem dados`);
        else toast.error(`${key}: ${r.outcome}`);
      }
    } catch (e: any) {
      toast.error(`${key}: ${e?.message || e}`);
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }

  async function testarTodos() {
    if (runningAll) return;
    setRunningAll(true);
    toast(`Testando ${filtered.length} módulos — 10s entre cada`);
    for (const m of filtered) {
      await testarUm(m.module_key);
      await new Promise((r) => setTimeout(r, 10000));
    }
    setRunningAll(false);
    toast.success("Bateria de testes concluída");
  }

  const totals = useMemo(() => {
    const t = { success: 0, notfound: 0, error: 0, total: 0 };
    for (const k of Object.keys(results)) {
      t.total++;
      const o = results[k].outcome;
      if (o === "success") t.success++;
      else if (o === "notfound") t.notfound++;
      else t.error++;
    }
    return t;
  }, [results]);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Teste de Módulos</h1>
            <p className="text-sm text-muted-foreground">
              Testa cada um dos {modulos.length} módulos de consulta. Clique em "Testar" no módulo desejado.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Filtrar (ex: cpf, foto, sp...)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="md:w-64"
            />
            <Button onClick={testarTodos} disabled={runningAll} className="shadow-3d-primary">
              {runningAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              <span className="ml-2">Testar todos</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Testados</div><div className="text-xl font-bold">{totals.total}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Sucesso</div><div className="text-xl font-bold text-emerald-600">{totals.success}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Sem dados</div><div className="text-xl font-bold text-amber-600">{totals.notfound}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Erros</div><div className="text-xl font-bold text-red-600">{totals.error}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Módulos ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((m) => {
                const r = results[m.module_key];
                const isLoading = loading[m.module_key];
                return (
                  <div key={m.module_key} className="p-3 flex flex-col md:flex-row md:items-center gap-2">
                    <div className="md:w-48 shrink-0">
                      <div className="font-mono text-sm font-semibold">/{m.module_key}</div>
                      <div className="text-xs text-muted-foreground">{m.category}{m.label ? ` · ${m.label}` : ""}</div>
                    </div>
                    <Input
                      value={inputs[m.module_key] ?? ""}
                      onChange={(e) => setInputs((p) => ({ ...p, [m.module_key]: e.target.value }))}
                      placeholder="input"
                      className="md:w-56 font-mono text-xs"
                    />
                    <div className="flex-1 min-w-0">
                      {r ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="outline" className={OUTCOME_COLORS[r.outcome] || ""}>{r.outcome}</Badge>
                          <span className="text-muted-foreground">HTTP {r.http} · {r.ms}ms</span>
                          {r.tem_dados && <span className="text-emerald-600">com dados</span>}
                          {r.erro && <span className="text-red-600 truncate max-w-md" title={r.erro}>{r.erro}</span>}
                          {r.body_keys && r.body_keys.length > 0 && (
                            <span className="text-muted-foreground font-mono">[{r.body_keys.join(",")}]</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">não testado</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={r?.outcome === "success" ? "outline" : "default"}
                      onClick={() => testarUm(m.module_key)}
                      disabled={isLoading || runningAll}
                      className="shadow-3d-soft"
                    >
                      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : r ? <RotateCw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      <span className="ml-1.5">{r ? "Refazer" : "Testar"}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
