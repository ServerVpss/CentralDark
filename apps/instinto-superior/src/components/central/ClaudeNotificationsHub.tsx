import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, Pause, Play, RotateCcw, Zap, Terminal, MessageSquare, CheckCircle2 } from "lucide-react";

/**
 * CLAUDE NOTIFICATIONS HUB
 *
 * Setor destacável que mostra:
 * - Notificações em tempo real do Claude
 * - Outputs do PowerShell (tudo que sai de jobs)
 * - Estado do Hermes (execução + revisão)
 * - Dream Reviewer (aprendizado offline)
 *
 * Modos: ao vivo | pausado | rolagem
 * Comportamentos: destacar | redimensionar | recuperar estado
 */

interface NotificacaoClause {
  id: string;
  tipo: "claude" | "powershell" | "hermes" | "dream";
  mensagem: string;
  timestamp: string;
  status: "novo" | "lido" | "acao";
}

interface EstadoHub {
  modo: "vivo" | "pausado" | "replay";
  destacado: boolean;
  posicao: { x: number; y: number };
  tamanho: { w: number; h: number };
}

const NOTIFICACOES_EXEMPLO: NotificacaoClause[] = [
  {
    id: "1",
    tipo: "claude",
    mensagem: "Raio-X Vivo integrado ao Cockpit ✅",
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString("pt-BR"),
    status: "lido",
  },
  {
    id: "2",
    tipo: "powershell",
    mensagem: "[Forja] Setor HERMES sincronizado (SHA: abc123)",
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString("pt-BR"),
    status: "lido",
  },
  {
    id: "3",
    tipo: "hermes",
    mensagem: "Dream Reviewer: +3 padrões detectados",
    timestamp: new Date().toLocaleTimeString("pt-BR"),
    status: "novo",
  },
  {
    id: "4",
    tipo: "powershell",
    mensagem: "[Output] Build finalizado: 2.10s, 0 erros",
    timestamp: new Date().toLocaleTimeString("pt-BR"),
    status: "novo",
  },
];

export function ClaudeNotificationsHub() {
  const [estado, setEstado] = useState<EstadoHub>({
    modo: "vivo",
    destacado: false,
    posicao: { x: 0, y: 0 },
    tamanho: { w: 400, h: 600 },
  });

  const [notificacoes, setNotificacoes] = useState<NotificacaoClause[]>(NOTIFICACOES_EXEMPLO);
  const [filtro, setFiltro] = useState<"tudo" | "claude" | "powershell" | "hermes" | "dream">("tudo");

  const notificacoesFiltradas =
    filtro === "tudo" ? notificacoes : notificacoes.filter((n) => n.tipo === filtro);

  const IconePorTipo = (tipo: string) => {
    switch (tipo) {
      case "claude":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "powershell":
        return <Terminal className="w-4 h-4 text-green-600" />;
      case "hermes":
        return <Zap className="w-4 h-4 text-purple-600" />;
      case "dream":
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      default:
        return null;
    }
  };

  const CorPorTipo = (tipo: string) => {
    switch (tipo) {
      case "claude":
        return "bg-blue-50/40 border-blue-500/20";
      case "powershell":
        return "bg-green-50/40 border-green-500/20";
      case "hermes":
        return "bg-purple-50/40 border-purple-500/20";
      case "dream":
        return "bg-indigo-50/40 border-indigo-500/20";
      default:
        return "bg-muted/40";
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col rounded-lg border ${
        estado.destacado
          ? "fixed inset-0 m-4 shadow-2xl z-50 bg-background border-blue-500/50"
          : "relative border-border/60 bg-background/40"
      }`}
      style={
        estado.destacado
          ? {
              width: `${estado.tamanho.w}px`,
              height: `${estado.tamanho.h}px`,
              left: `${estado.posicao.x}px`,
              top: `${estado.posicao.y}px`,
            }
          : undefined
      }
    >
      {/* Header com Controles */}
      <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold">🔔 Claude Notifications</h2>
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-mono">
            {notificacoes.filter((n) => n.status === "novo").length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Modo Vivo/Pausado */}
          <button
            onClick={() => setEstado((prev) => ({ ...prev, modo: prev.modo === "vivo" ? "pausado" : "vivo" }))}
            className={`p-2 rounded transition ${
              estado.modo === "vivo"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
            title={estado.modo === "vivo" ? "Pausar" : "Retomar ao vivo"}
          >
            {estado.modo === "vivo" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Botão Destacar/Encaixar */}
          <button
            onClick={() => setEstado((prev) => ({ ...prev, destacado: !prev.destacado }))}
            className="p-2 rounded hover:bg-muted transition"
            title={estado.destacado ? "Encaixar" : "Destacar"}
          >
            {estado.destacado ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 p-3 border-b border-border/60 bg-muted/10 overflow-x-auto">
        {["tudo", "claude", "powershell", "hermes", "dream"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f as typeof filtro)}
            className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
              filtro === f
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "tudo" ? "Tudo" : f === "claude" ? "Claude" : f === "powershell" ? "PowerShell" : f === "hermes" ? "Hermes" : "Dream"}
          </button>
        ))}
      </div>

      {/* Área de Notificações (scrollável) */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {notificacoesFiltradas.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Nenhuma notificação neste filtro
          </div>
        ) : (
          notificacoesFiltradas.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-3 text-sm transition ${CorPorTipo(notif.tipo)} ${
                notif.status === "novo" ? "ring-1 ring-yellow-500" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{IconePorTipo(notif.tipo)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-xs mb-1">{notif.mensagem}</div>
                  <div className="text-xs text-muted-foreground">{notif.timestamp}</div>
                </div>
                {notif.status === "novo" && (
                  <span className="flex-shrink-0 px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                    NOVO
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer — Modo de Operação */}
      <div className="p-3 border-t border-border/60 bg-muted/10 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>
            Modo: <strong>{estado.modo === "vivo" ? "🟢 AO VIVO" : "⏸️ PAUSADO"}</strong>
          </span>
          <span>
            Total: <strong>{notificacoes.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
