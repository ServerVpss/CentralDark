// Painel "ao vivo" do bot-server (read-only, sanitizado).
// Consome https://api.centralldark.com/v1/whatsapp/sessions e mostra o status
// real das sessões WuzAPI. Não toca em Supabase nem em WhatsApp — só lê.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Loader2, QrCode, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/apiBase";

type SessionStatus = {
  id: string;
  name: string;
  jid: string;
  connected: boolean;
  loggedIn: boolean;
  hasQr: boolean;
  events: string;
};

type HealthPayload = {
  ok: boolean;
  service?: string;
  version?: string;
  uptimeSec?: number;
  timestamp?: string;
};

type SessionsPayload = {
  ok: boolean;
  sessions?: SessionStatus[];
  error?: string;
};

function formatUptime(sec?: number) {
  if (!sec || sec < 0) return "—";
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}min`;
  return `${(sec / 3600).toFixed(1)}h`;
}

export function LiveBotStatus() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [sessions, setSessions] = useState<SessionStatus[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      setErro(null);
      const [h, s] = await Promise.all([
        fetch(`${API_BASE}/health`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`${API_BASE}/v1/whatsapp/sessions`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      setHealth(h as HealthPayload);
      const payload = s as SessionsPayload;
      if (payload.ok) {
        setSessions(payload.sessions ?? []);
      } else {
        setErro(payload.error ?? "Resposta inválida do bot-server");
      }
    } catch (e: any) {
      setErro(e?.message ?? "Falha ao conectar no bot-server");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 15000); // poll suave a cada 15s
    return () => clearInterval(id);
  }, []);

  const tudoOnline =
    health?.ok &&
    sessions.length > 0 &&
    sessions.every((s) => s.connected && s.loggedIn);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 border border-border rounded-2xl p-5 backdrop-blur-sm shadow-lg"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              tudoOnline
                ? "bg-green-500/10 border-green-500/30 text-green-500"
                : erro
                ? "bg-red-500/10 border-red-500/30 text-red-500"
                : "bg-amber-500/10 border-amber-500/30 text-amber-500"
            }`}
          >
            <Activity className={`w-5 h-5 ${carregando ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-wide uppercase text-foreground">
              Bot-server ao vivo
            </h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              {API_BASE.replace("https://", "")} • atualiza a cada 15s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {health && (
            <span className="text-[10px] font-mono text-muted-foreground">
              v{health.version ?? "?"} • uptime {formatUptime(health.uptimeSec)}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={carregar}
            className="h-8 gap-2 border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${carregando ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {erro ? (
        <div className="flex items-center gap-2 text-red-500 text-xs font-mono">
          <WifiOff className="w-4 h-4" /> {erro}
        </div>
      ) : carregando && sessions.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin" /> Consultando sessões…
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-xs text-muted-foreground">
          Nenhuma sessão registrada na WuzAPI.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sessions.map((s) => {
            const status = !s.connected
              ? { cor: "text-red-500 border-red-500/30 bg-red-500/10", txt: "OFFLINE", icone: WifiOff }
              : s.hasQr
              ? { cor: "text-amber-500 border-amber-500/30 bg-amber-500/10", txt: "AGUARDA QR", icone: QrCode }
              : { cor: "text-green-500 border-green-500/30 bg-green-500/10", txt: "CONECTADO", icone: CheckCircle2 };
            const Icone = status.icone;
            return (
              <li
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/40"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {s.jid || "sem jid"} • id {s.id}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border ${status.cor}`}
                >
                  <Icone className="w-3 h-3" />
                  {status.txt}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
