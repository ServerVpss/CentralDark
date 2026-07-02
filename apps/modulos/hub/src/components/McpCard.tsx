// Card de status do MCP CentralDark — aba Serviços do Hub
// Faz polling em https://mcp.centralldark.com/health e oferece snippet Bearer pronto pra copiar.

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Activity, Cpu, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";

const MCP_URL = "https://mcp.centralldark.com";
const HEALTH_URL = `${MCP_URL}/health`;

interface McpHealth {
  status?: string;
  version?: string;
  tools?: number;
  uptime_min?: number;
  latency_ms?: number;
}

export function McpCard() {
  const { toast } = useToast();
  const [health, setHealth] = useState<McpHealth | null>(null);
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const [loading, setLoading] = useState(false);
  const prevStateRef = useRef<"idle" | "ok" | "fail">("idle");

  async function notifyRecovery(data: McpHealth) {
    try {
      await fetch(
        `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/mcp-status-notify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            previousState: "fail",
            currentState: "ok",
            version: data.version,
            tools: data.tools,
            latency_ms: data.latency_ms,
          }),
        },
      );
      toast({ title: "MCP voltou ao ar", description: "Notificação enviada no Telegram." });
    } catch {
      // silencioso — recuperação já foi detectada visualmente
    }
  }

  async function ping() {
    setLoading(true);
    const started = performance.now();
    try {
      const r = await fetch(HEALTH_URL, { cache: "no-store" });
      const latency = Math.round(performance.now() - started);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json().catch(() => ({}));
      const merged = { ...data, latency_ms: latency };
      setHealth(merged);
      setState("ok");
      if (prevStateRef.current === "fail") {
        notifyRecovery(merged);
      }
      prevStateRef.current = "ok";
    } catch {
      setState("fail");
      setHealth(null);
      prevStateRef.current = "fail";
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    ping();
    const id = setInterval(ping, 30000);
    return () => clearInterval(id);
  }, []);

  const snippet = JSON.stringify(
    {
      mcpServers: {
        centraldark: {
          url: `${MCP_URL}/mcp`,
          transport: "http",
          headers: {
            Authorization: "Bearer SEU_CENTRALDARK_MCP_TOKEN",
          },
        },
      },
    },
    null,
    2,
  );

  function copySnippet() {
    navigator.clipboard.writeText(snippet).then(() => {
      toast({ title: "Config copiada", description: "Cola no claude_desktop_config.json ou no Cursor." });
    });
  }

  const stateCls =
    state === "ok"
      ? "text-primary bg-primary/10 border-primary/25"
      : state === "fail"
        ? "text-destructive bg-destructive/10 border-destructive/25"
        : "text-muted-foreground bg-muted border-border";

  return (
    <Card className="card-premium">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" /> MCP CentralDark
          <Badge className={cn("text-[10px] border rounded-full px-2 ml-auto", stateCls)}>
            {state === "ok" ? "ONLINE" : state === "fail" ? "OFFLINE" : "—"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Info label="Versão" value={health?.version ?? "—"} />
          <Info label="Tools" value={health?.tools ? String(health.tools) : "—"} />
          <Info label="Uptime" value={health?.uptime_min ? `${health.uptime_min}min` : "—"} />
          <Info label="Latência" value={health?.latency_ms ? `${health.latency_ms}ms` : "—"} />
        </div>

        <div className="bg-muted/40 border border-border rounded-md p-2">
          <p className="text-[11px] text-muted-foreground mb-1">
            Config Bearer pra Claude Desktop / Cursor (troque o token pelo seu):
          </p>
          <pre className="text-[10px] font-mono overflow-auto max-h-40 whitespace-pre">{snippet}</pre>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={copySnippet}
            size="sm"
            variant="outline"
            className="gap-2 shadow-3d-soft active:translate-y-[1px]"
          >
            <Copy className="h-3.5 w-3.5" /> Copiar config
          </Button>
          <Button
            onClick={ping}
            disabled={loading}
            size="sm"
            variant="outline"
            className="gap-2 shadow-3d-soft active:translate-y-[1px]"
          >
            <Activity className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Testar agora
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="gap-2 shadow-3d-soft active:translate-y-[1px]"
          >
            <a href={HEALTH_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> /health
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 border border-border rounded-md px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-mono tabular-nums">{value}</p>
    </div>
  );
}
