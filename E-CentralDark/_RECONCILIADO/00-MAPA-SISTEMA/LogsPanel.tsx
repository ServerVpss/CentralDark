import { Trash2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTimeWithSecondsBR } from "@/lib/datetime";

type LogEntry = { time: string; tag: string; tagColor: string; msg: string };

const seed: LogEntry[] = [
  { time: "14:35:20", tag: "INFO", tagColor: "text-primary", msg: 'Instância "Instância 01" conectada com sucesso' },
  { time: "14:35:21", tag: "MESSAGE", tagColor: "text-info", msg: 'De: +55 11 98888-7777   "Olá, quero mais informações"' },
  { time: "14:35:22", tag: "FLOW", tagColor: "text-primary", msg: 'Fluxo "Boas Vindas" executado' },
  { time: "14:35:23", tag: "MESSAGE", tagColor: "text-info", msg: 'Para: +55 11 98888-7777   "Olá! 👋 Seja bem-vindo!"' },
  { time: "14:35:24", tag: "API", tagColor: "text-warning", msg: "WhatsApp API response: 200 OK" },
  { time: "14:35:25", tag: "INFO", tagColor: "text-primary", msg: "Mensagem enviada com sucesso" },
];

const stream: Omit<LogEntry, "time">[] = [
  { tag: "MESSAGE", tagColor: "text-info", msg: 'De: +55 11 97777-1234   "Quanto custa?"' },
  { tag: "FLOW", tagColor: "text-primary", msg: 'Fluxo "Vendas" iniciado' },
  { tag: "API", tagColor: "text-warning", msg: "WhatsApp API response: 200 OK" },
  { tag: "INFO", tagColor: "text-primary", msg: "Webhook disparado para https://crm.local/event" },
  { tag: "MESSAGE", tagColor: "text-info", msg: 'Para: +55 11 97777-1234   "Nosso plano começa em R$ 99/mês"' },
  { tag: "WARN", tagColor: "text-warning", msg: "Rate limit a 80% (CDN-A)" },
  { tag: "INFO", tagColor: "text-primary", msg: 'Instância "Instância 03" reconectada' },
  { tag: "ERROR", tagColor: "text-destructive", msg: "Falha ao entregar mensagem (timeout)" },
  { tag: "FLOW", tagColor: "text-primary", msg: 'Auto-resposta "Fora do horário" executada' },
];

export function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>(seed);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const item = stream[Math.floor(Math.random() * stream.length)];
      const time = formatTimeWithSecondsBR();
      setLogs((prev) => [...prev.slice(-200), { ...item, time }]);
    }, 1800);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
  }, [logs]);

  return (
    <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm border-glow overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${paused ? "bg-warning" : "bg-primary animate-pulse"}`} />
          <h3 className="font-display font-bold text-sm tracking-wide">Logs em Tempo Real</h3>
          <span className="text-[10px] font-mono text-muted-foreground">({logs.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-muted-foreground text-xs hover:text-primary hover:border-primary/40 transition"
          >
            <Trash2 className="w-3 h-3" /> Limpar
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            title={paused ? "Retomar" : "Pausar"}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
          >
            {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="p-4 font-mono text-xs space-y-1.5 bg-background/40 h-[260px] overflow-auto scanline"
      >
        {logs.map((l, i) => (
          <div key={i} className="flex gap-3 hover:bg-primary/5 px-1 rounded animate-fade-in">
            <span className="text-muted-foreground shrink-0">{l.time}</span>
            <span className={`${l.tagColor} font-bold shrink-0 w-20`}>[{l.tag}]</span>
            <span className="text-foreground/90">{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
