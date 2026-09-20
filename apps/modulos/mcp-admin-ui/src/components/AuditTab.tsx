import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { api, type LogLine, ApiError } from "@/lib/api";
import { cn } from "@/shared/lib/utils";

// Aba "Auditoria" — consome GET /admin/api/logs (real, buffer circular de logs
// em memória do servidor, filtrável por rota/cid/level/texto livre).
export function AuditTab() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({ rota: "", cid: "", level: "", q: "" });

  async function buscar() {
    setLoading(true);
    setErro(null);
    try {
      const r = await api.logs({ ...filtros, limit: 200 });
      setLogs(r.logs);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao carregar logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const levelColor: Record<string, string> = {
    error: "text-destructive",
    warn: "text-warning",
    info: "text-foreground",
    debug: "text-muted-foreground",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auditoria de logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Input
            placeholder="rota (ex: /health)"
            value={filtros.rota}
            onChange={(e) => setFiltros((f) => ({ ...f, rota: e.target.value }))}
          />
          <Input
            placeholder="cid"
            value={filtros.cid}
            onChange={(e) => setFiltros((f) => ({ ...f, cid: e.target.value }))}
          />
          <Input
            placeholder="level (error/warn/info)"
            value={filtros.level}
            onChange={(e) => setFiltros((f) => ({ ...f, level: e.target.value }))}
          />
          <Input
            placeholder="texto livre"
            value={filtros.q}
            onChange={(e) => setFiltros((f) => ({ ...f, q: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={buscar}>Buscar</Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFiltros({ rota: "", cid: "", level: "", q: "" });
              setLogs([]);
            }}
          >
            Limpar
          </Button>
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <div className="rounded-lg border border-border bg-secondary/40 font-mono text-[11.5px] leading-relaxed max-h-[420px] overflow-y-auto p-3">
          {loading ? (
            <div className="text-muted-foreground">carregando…</div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground">(nenhum log encontrado)</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className={cn("py-0.5", levelColor[l.level] ?? "text-foreground")}>
                [{new Date(l.t).toLocaleTimeString("pt-BR")}] [{l.level.toUpperCase()}] {l.rota ?? "-"} cid={l.cid ?? "-"} · {l.msg}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
