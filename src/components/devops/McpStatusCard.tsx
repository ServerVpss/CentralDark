import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, Server, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { SyncStatusIcon, type SyncStatus } from "@/components/ui/sync-status-icon";


interface Connector {
  name: string;
  level: "ok" | "warn" | "error" | string;
  detail?: string;
  latencyMs?: number;
}

interface McpStatus {
  ok: boolean;
  service: string;
  uptimeSec?: number;
  catalog?: { toolCount: number; catalogVersion: string };
  catalogDiff?: { level: string; detail: string };
  connectors?: Connector[];
}

function fmtUptime(sec?: number) {
  if (!sec) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function LevelIcon({ level }: { level: string }) {
  if (level === "ok") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
  if (level === "warn") return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
  return <XCircle className="h-3.5 w-3.5 text-rose-600" />;
}

export function McpStatusCard({ className }: { className?: string }) {
  const [data, setData] = useState<McpStatus | null>(null);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [err, setErr] = useState<string | null>(null);

  const load = async (isRefresh = false) => {
    setStatus(isRefresh ? "syncing" : data ? "syncing" : "loading");
    setErr(null);
    // Timeout de 20s — se estourar, vira estado "timeout"
    const timeoutId = setTimeout(() => {
      setStatus((s) => (s === "ready" ? s : "timeout"));
    }, 20_000);
    try {
      // Usa edge function como proxy (CORS bloqueia chamada direta do browser)
      const { data: json, error } = await supabase.functions.invoke("mcp-status-proxy");
      if (error) throw error;
      setData(json as McpStatus);
      setStatus("ready");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const loading = status === "loading" || status === "syncing";

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 60_000); // atualiza a cada 1min
    return () => clearInterval(t);
  }, []);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              MCP CentralDark
              {data && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border font-medium",
                    data.ok
                      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                      : "text-amber-600 bg-amber-50 border-amber-200",
                  )}
                >
                  {data.ok ? "ONLINE" : "ATENÇÃO"}
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Status ao vivo de <code className="text-[10px]">mcp.centralldark.com</code>
            </CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => load(true)}
            aria-label="Atualizar status do MCP"
            disabled={loading}
          >
            <SyncStatusIcon status={status} size={16} />
          </Button>

        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {err && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-2">
            Erro ao consultar: {err}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground uppercase">Uptime</div>
                <div className="text-sm font-semibold">{fmtUptime(data.uptimeSec)}</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground uppercase">Tools</div>
                <div className="text-sm font-semibold flex items-center justify-center gap-1">
                  <Wrench className="h-3 w-3" />
                  {data.catalog?.toolCount ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground uppercase">Catálogo</div>
                <div
                  className={cn(
                    "text-sm font-semibold",
                    data.catalogDiff?.level === "ok" ? "text-emerald-600" : "text-amber-600",
                  )}
                >
                  {data.catalogDiff?.level === "ok" ? "Sync ✓" : "Drift"}
                </div>
              </div>
            </div>

            {data.connectors && data.connectors.length > 0 && (
              <div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase mb-1">
                  Conectores
                </div>
                <ul className="space-y-1">
                  {data.connectors.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-center gap-2 text-xs py-1 border-b border-border/30 last:border-0"
                    >
                      <LevelIcon level={c.level} />
                      <span className="flex-1 truncate">{c.name}</span>
                      {typeof c.latencyMs === "number" && (
                        <span className="text-[10px] text-muted-foreground">{c.latencyMs}ms</span>
                      )}
                      <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                        {c.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
