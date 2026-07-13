// Painel do Hermes — chat direto com cascata visual ao vivo (Flash → Pro → GPT → Elite)
import { useCallback, useMemo, useRef, useState } from "react";
import { Send, Zap, Sparkles, Brain, Crown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/compartilhado/ui/button";
import { Textarea } from "@/compartilhado/ui/textarea";
import { Card } from "@/compartilhado/ui/card";
import { toast } from "sonner";

type EstadoCerebro = "aguardando" | "processando" | "ok" | "erro";

interface Cerebro {
  id: string;
  nome: string;
  cor: string;
  icone: React.ComponentType<{ className?: string }>;
  estado: EstadoCerebro;
  resposta?: string;
  erro?: string;
  ms?: number;
}

const CEREBROS_INICIAIS: Cerebro[] = [
  { id: "flash", nome: "Flash", cor: "#22d3ee", icone: Zap, estado: "aguardando" },
  { id: "pro", nome: "Pro", cor: "#a78bfa", icone: Sparkles, estado: "aguardando" },
  { id: "gpt", nome: "GPT", cor: "#34d399", icone: Brain, estado: "aguardando" },
  { id: "elite", nome: "Elite", cor: "#f59e0b", icone: Crown, estado: "aguardando" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function HermesPanel() {
  const [missao, setMissao] = useState("");
  const [cerebros, setCerebros] = useState<Cerebro[]>(CEREBROS_INICIAIS);
  const [rodando, setRodando] = useState(false);
  const [historico, setHistorico] = useState<{ missao: string; ts: number }[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const atualizar = useCallback((id: string, patch: Partial<Cerebro>) => {
    setCerebros((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const executar = useCallback(async () => {
    const texto = missao.trim();
    if (!texto || rodando) return;

    setCerebros(CEREBROS_INICIAIS.map((c) => ({ ...c, estado: "aguardando", resposta: undefined, erro: undefined, ms: undefined })));
    setRodando(true);
    setHistorico((h) => [{ missao: texto, ts: Date.now() }, ...h].slice(0, 10));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/hermes-cascade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "apikey": SUPABASE_KEY,
        },
        body: JSON.stringify({ missao: texto }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status}: ${txt.slice(0, 200)}`);
      }

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });

        const blocos = buffer.split("\n\n");
        buffer = blocos.pop() ?? "";

        for (const bloco of blocos) {
          const linhas = bloco.split("\n");
          let evento = "";
          let dados = "";
          for (const l of linhas) {
            if (l.startsWith("event:")) evento = l.slice(6).trim();
            else if (l.startsWith("data:")) dados += l.slice(5).trim();
          }
          if (!evento || !dados) continue;

          try {
            const payload = JSON.parse(dados);
            if (evento === "processando") {
              atualizar(payload.id, { estado: "processando" });
            } else if (evento === "resposta") {
              atualizar(payload.id, { estado: "ok", resposta: payload.resposta, ms: payload.ms });
            } else if (evento === "erro_cerebro") {
              atualizar(payload.id, { estado: "erro", erro: payload.erro, ms: payload.ms });
            }
          } catch {
            // ignora bloco malformado
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg !== "AbortError") toast.error(`Cascata falhou: ${msg}`);
    } finally {
      setRodando(false);
      abortRef.current = null;
    }
  }, [missao, rodando, atualizar]);

  const abortar = useCallback(() => {
    abortRef.current?.abort();
    setRodando(false);
  }, []);

  const respostaFinal = useMemo(() => {
    const elite = cerebros.find((c) => c.id === "elite");
    return elite?.estado === "ok" ? elite.resposta : undefined;
  }, [cerebros]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              Hermes — Cascata dos 4 Cérebros
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Você digita a missão. Ela passa por Flash → Pro → GPT → Elite ao vivo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${rodando ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="text-xs text-slate-400">{rodando ? "Cascateando..." : "Pronto"}</span>
          </div>
        </div>

        {/* Grid dos 4 cérebros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {cerebros.map((c) => (
            <CerebroCard key={c.id} cerebro={c} />
          ))}
        </div>

        {/* Resposta final destacada */}
        {respostaFinal && (
          <Card className="bg-gradient-to-br from-amber-950/40 to-slate-900/60 border-amber-500/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-amber-400" />
              <h2 className="font-semibold text-amber-200">Resposta final (Elite)</h2>
            </div>
            <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">{respostaFinal}</p>
          </Card>
        )}

        {/* Chat input */}
        <Card className="bg-slate-900/60 border-slate-800 p-4">
          <Textarea
            value={missao}
            onChange={(e) => setMissao(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                executar();
              }
            }}
            placeholder="Digite a missão... (Ctrl+Enter pra disparar)"
            className="bg-slate-950 border-slate-800 text-slate-100 min-h-[100px] resize-none focus-visible:ring-cyan-500"
            disabled={rodando}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-slate-500">{missao.length} caracteres</span>
            <div className="flex gap-2">
              {rodando && (
                <Button variant="outline" onClick={abortar} className="border-slate-700 text-slate-300">
                  Abortar
                </Button>
              )}
              <Button
                onClick={executar}
                disabled={rodando || !missao.trim()}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
              >
                {rodando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cascateando
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Disparar missão
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Histórico rápido */}
        {historico.length > 0 && (
          <Card className="bg-slate-900/40 border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Últimas missões</h3>
            <div className="space-y-1">
              {historico.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setMissao(h.missao)}
                  className="block w-full text-left text-xs text-slate-400 hover:text-cyan-300 truncate px-2 py-1 rounded hover:bg-slate-800/50"
                >
                  <span className="text-slate-600 mr-2">{new Date(h.ts).toLocaleTimeString("pt-BR")}</span>
                  {h.missao}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function CerebroCard({ cerebro }: { cerebro: Cerebro }) {
  const Icone = cerebro.icone;
  const ativo = cerebro.estado === "processando";
  const ok = cerebro.estado === "ok";
  const erro = cerebro.estado === "erro";

  return (
    <Card
      className="relative overflow-hidden border-slate-800 bg-slate-900/60 p-4 transition-all duration-300"
      style={{
        boxShadow: ativo
          ? `0 0 24px ${cerebro.cor}66, inset 0 0 12px ${cerebro.cor}22`
          : ok
          ? `0 0 12px ${cerebro.cor}33`
          : undefined,
        borderColor: ativo || ok ? cerebro.cor : erro ? "#ef4444" : undefined,
      }}
    >
      {/* Barra de status no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all"
        style={{
          background: ativo
            ? `linear-gradient(90deg, transparent, ${cerebro.cor}, transparent)`
            : ok
            ? cerebro.cor
            : erro
            ? "#ef4444"
            : "#1e293b",
          animation: ativo ? "pulse 1.5s ease-in-out infinite" : undefined,
        }}
      />

      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-2 rounded-lg transition-all"
          style={{
            background: `${cerebro.cor}22`,
            color: cerebro.cor,
          }}
        >
          {ativo ? <Loader2 className="h-5 w-5 animate-spin" /> : erro ? <AlertCircle className="h-5 w-5 text-red-400" /> : <Icone className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-100 text-sm">{cerebro.nome}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">
            {cerebro.estado === "aguardando" && "aguardando"}
            {cerebro.estado === "processando" && "pensando..."}
            {cerebro.estado === "ok" && `✓ ${cerebro.ms}ms`}
            {cerebro.estado === "erro" && "✗ falhou"}
          </p>
        </div>
      </div>

      <div className="min-h-[80px] text-xs text-slate-300 leading-relaxed">
        {cerebro.resposta && <p className="whitespace-pre-wrap line-clamp-6">{cerebro.resposta}</p>}
        {cerebro.erro && <p className="text-red-400">{cerebro.erro}</p>}
        {!cerebro.resposta && !cerebro.erro && (
          <p className="text-slate-600 italic">
            {ativo ? "Processando a missão..." : "Aguardando cascata..."}
          </p>
        )}
      </div>
    </Card>
  );
}
