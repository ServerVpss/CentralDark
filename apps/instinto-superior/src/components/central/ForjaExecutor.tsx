import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Activity, GitBranch, Database } from "lucide-react";

const FORJA_MODES = [
  { id: "sync", label: "🔄 Sincronizar", icon: "🔄", desc: "Casa ↔ Forja ↔ GitHub" },
  { id: "deploy", label: "🚀 Deploy VPS", icon: "🚀", desc: "Push para VPS remota" },
  { id: "monitor", label: "📊 Monitorar", icon: "📊", desc: "Status em tempo real" },
] as const;

const SETORES_FORJA = [
  { id: "hermes", label: "Hermes", emoji: "⚙️", path: "K:\\apps\\modulos\\hermes-config" },
  { id: "skills", label: "Skills", emoji: "🛠️", path: "K:\\apps\\modulos\\skills-registry" },
  { id: "modulos", label: "Módulos", emoji: "📦", path: "K:\\apps\\modulos\\modulos-inventory" },
  { id: "casa", label: "Casa", emoji: "🏠", path: "K:\\apps\\instinto-superior\\src" },
] as const;

interface ExecutorStatus {
  mode: string;
  setor: string;
  running: boolean;
  lastSync: string;
  uptime: number;
}

export function ForjaExecutor() {
  const [status, setStatus] = useState<ExecutorStatus>({
    mode: "sync",
    setor: "all",
    running: true,
    lastSync: new Date().toLocaleTimeString("pt-BR"),
    uptime: 0,
  });

  const [selectedMode, setSelectedMode] = useState<"sync" | "deploy" | "monitor">("sync");
  const [selectedSetor, setSelectedSetor] = useState("all");

  useEffect(() => {
    if (!status.running) return;

    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        uptime: prev.uptime + 1,
        lastSync: new Date().toLocaleTimeString("pt-BR"),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [status.running]);

  const handleToggle = () => {
    setStatus((prev) => ({ ...prev, running: !prev.running }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔧</span>
          <div>
            <h1 className="text-2xl font-bold">FORJA EXECUTOR — PowerShell 7</h1>
            <p className="text-sm text-muted-foreground">Orquestrador paralelo em background • Casa ↔ Forja ↔ GitHub ↔ VPS</p>
          </div>
        </div>
      </div>

      {/* Status ao vivo */}
      <Card className="p-6 bg-gradient-to-r from-green-50/10 to-blue-50/10 border-green-500/30">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Status</div>
            <div className={`text-2xl font-bold ${status.running ? "text-green-600" : "text-gray-500"}`}>
              {status.running ? "🟢 ONLINE" : "🔴 OFFLINE"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Última Sincronização</div>
            <div className="text-lg font-mono text-blue-600">{status.lastSync}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Uptime (s)</div>
            <div className="text-2xl font-bold text-purple-600">{status.uptime}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Modo</div>
            <div className="text-lg font-semibold text-orange-600">{selectedMode.toUpperCase()}</div>
          </div>
        </div>
      </Card>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleToggle}
          className={`rounded-lg p-4 font-semibold transition ${
            status.running
              ? "bg-green-50/40 text-green-700 border border-green-500/30 hover:bg-green-50/60"
              : "bg-gray-50/40 text-gray-700 border border-gray-500/30 hover:bg-gray-50/60"
          }`}
        >
          {status.running ? (
            <>
              <Pause className="inline mr-2 h-4 w-4" />
              Pausar Executor
            </>
          ) : (
            <>
              <Play className="inline mr-2 h-4 w-4" />
              Retomar Executor
            </>
          )}
        </button>

        <button className="rounded-lg p-4 font-semibold bg-blue-50/40 text-blue-700 border border-blue-500/30 hover:bg-blue-50/60 transition">
          <RotateCcw className="inline mr-2 h-4 w-4" />
          Reiniciar Forja
        </button>

        <button className="rounded-lg p-4 font-semibold bg-purple-50/40 text-purple-700 border border-purple-500/30 hover:bg-purple-50/60 transition">
          <Activity className="inline mr-2 h-4 w-4" />
          Ver Logs
        </button>
      </div>

      {/* Seleção de Modo */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">🎯 Modo de Execução</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FORJA_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id as typeof selectedMode)}
              className={`rounded-lg border p-4 text-left transition ${
                selectedMode === m.id
                  ? "bg-blue-50/40 border-blue-500/50 shadow-sm"
                  : "bg-background/40 border-border/60 hover:bg-background/60"
              }`}
            >
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="font-semibold text-sm">{m.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Seleção de Setores */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">📍 Setores da Forja</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SETORES_FORJA.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSetor(s.id)}
              className={`rounded-lg border p-4 text-center transition ${
                selectedSetor === s.id
                  ? "bg-green-50/40 border-green-500/50"
                  : "bg-background/40 border-border/60 hover:bg-background/60"
              }`}
            >
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className="font-semibold text-sm">{s.label}</div>
            </button>
          ))}
          <button
            onClick={() => setSelectedSetor("all")}
            className={`rounded-lg border p-4 text-center transition ${
              selectedSetor === "all"
                ? "bg-purple-50/40 border-purple-500/50"
                : "bg-background/40 border-border/60 hover:bg-background/60"
            }`}
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold text-sm">Todos</div>
          </button>
        </div>
      </Card>

      {/* Status de Sincronização */}
      <Card className="p-6 border-green-500/30">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5" />
          <h2 className="font-semibold text-lg">🔀 Fluxo de Sincronização</h2>
        </div>
        <div className="font-mono text-sm text-muted-foreground space-y-2 bg-muted/20 p-4 rounded">
          <div>Casa (instinto-superior)</div>
          <div className="text-center text-green-600 font-bold">↓↓↓</div>
          <div>Forja (modulos) — PS7 Job Background</div>
          <div className="text-center text-green-600 font-bold">↓↓↓</div>
          <div>GitHub (Fonte da Verdade)</div>
          <div className="text-center text-green-600 font-bold">↓↓↓</div>
          <div>VPS (/root/CentralDark) — PM2 Microsserviços</div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <strong>Garantias:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Casa nunca fica bloqueada</li>
            <li>Forja roda em paralelo (job background)</li>
            <li>Sincronização não-bloqueante (async)</li>
            <li>GitHub é Fonte da Verdade</li>
            <li>VPS recebe via git push automático</li>
          </ul>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-6">
        <p>🔧 Forja Executor rodando em PowerShell 7 • Orquestração Hermes • FIXED_POINT 100%</p>
        <p>Fluxo: Casa ↔ Forja ↔ GitHub ↔ VPS (sincronizado)</p>
      </div>
    </div>
  );
}
