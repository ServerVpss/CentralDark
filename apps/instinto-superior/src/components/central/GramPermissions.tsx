import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Copy, CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react";
import {
  delegacaoParaGOAL,
  enviarGOALAoHermes,
  monitorarGOALNoHermes,
  type GOALObject,
  type GramRecibo,
  criarRecibo,
} from "@/lib/gram-goals-system";

/**
 * GRAM PERMISSIONS — Governança de agentes
 *
 * Interface incremental para delegar capacidades ao Hermes
 * com autorização, escopo temporal e rastreamento.
 */

interface DelegacaoSolicitada {
  id: string;
  executor: string;
  ambiente: string;
  capacidade: string;
  prazo: "sessao" | "24h" | "persistente";
  criada_em: string;
  status: "pendente" | "aprovada" | "negada" | "executada";
}

const EXECUTORES = ["Hermes", "Claude", "Copiloto"];
const AMBIENTES = ["Casa", "VPS", "GitHub", "Local"];
const CAPACIDADES = [
  "Ler código e diagnosticar",
  "Executar scripts",
  "Modificar arquivos",
  "Consultar git",
  "Deploy",
];

const PRAZOS = [
  { id: "sessao", label: "Sessão atual", desc: "Válido apenas nesta sessão" },
  { id: "24h", label: "24 horas", desc: "Válido por 24 horas" },
  { id: "persistente", label: "Persistente, com revogação", desc: "Permanente até revogação manual" },
];

export function GramPermissions() {
  const [executor, setExecutor] = useState("Hermes");
  const [ambiente, setAmbiente] = useState("Casa");
  const [capacidade, setCapacidade] = useState("Ler código e diagnosticar");
  const [prazo, setPrazo] = useState<"sessao" | "24h" | "persistente">("sessao");
  const [solicitacoes, setSolicitacoes] = useState<DelegacaoSolicitada[]>([]);
  const [copiado, setCopiado] = useState(false);

  // Novo: Estados para GOAL ↔ Hermes
  const [goalAtivo, setGoalAtivo] = useState<GOALObject | null>(null);
  const [reciboAtivo, setReciboAtivo] = useState<GramRecibo | null>(null);
  const [enviandoAoHermes, setEnviandoAoHermes] = useState(false);

  const criarSolicitacao = () => {
    const novaId = `del-${Date.now()}`;
    const solicitud: DelegacaoSolicitada = {
      id: novaId,
      executor,
      ambiente,
      capacidade,
      prazo,
      criada_em: new Date().toLocaleTimeString("pt-BR"),
      status: "pendente",
    };

    setSolicitacoes([solicitud, ...solicitacoes]);
  };

  const estruturaSolicitacao = {
    executor,
    ambiente,
    capacidade,
    prazo,
    timestamp: new Date().toISOString(),
    tipo: "delegacao_hermes_v1",
  };

  const copiarSolicitacao = () => {
    navigator.clipboard.writeText(JSON.stringify(estruturaSolicitacao, null, 2));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const enviarGoalAoHermes = async () => {
    setEnviandoAoHermes(true);
    try {
      // Converter solicitação → GOAL
      const goal = delegacaoParaGOAL(estruturaSolicitacao);
      setGoalAtivo(goal);

      // Enviar ao Hermes
      const resposta = await enviarGOALAoHermes(goal);

      if (resposta.status === "enviado" && resposta.hermeSessionId) {
        // Monitorar execução
        const goalCompleto = await monitorarGOALNoHermes(goal, resposta.hermeSessionId);
        setGoalAtivo(goalCompleto);

        // Criar recibo
        const recibo = criarRecibo(goalCompleto);
        setReciboAtivo(recibo);
      }
    } catch (erro) {
      console.error("Erro ao enviar ao Hermes:", erro);
    } finally {
      setEnviandoAoHermes(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-950/10 p-6">
        <h1 className="text-2xl font-bold">Permissões da Forja</h1>
        <p className="text-sm text-muted-foreground">Admin CentralDark · Governança de agentes</p>
      </div>

      {/* Formulário */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Executor */}
          <div>
            <label className="block text-sm font-semibold mb-2">Executor</label>
            <select
              value={executor}
              onChange={(e) => setExecutor(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {EXECUTORES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          {/* Ambiente */}
          <div>
            <label className="block text-sm font-semibold mb-2">Ambiente</label>
            <select
              value={ambiente}
              onChange={(e) => setAmbiente(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {AMBIENTES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capacidade */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Capacidade a autorizar</label>
          <select
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {CAPACIDADES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Prazo */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">Prazo solicitado</label>
          <div className="space-y-2">
            {PRAZOS.map((p) => (
              <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="prazo"
                  value={p.id}
                  checked={prazo === p.id}
                  onChange={(e) => setPrazo(e.target.value as typeof prazo)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-semibold text-sm">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-950/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-amber-600 mb-1">Candidata à execução automática</div>
              <div className="text-xs text-muted-foreground">
                Leitura de arquivos, Git status e diagnóstico
                <br />
                Permissão efetiva: não aplicada. O HUB e o executor ainda precisam validá-la.
              </div>
            </div>
          </div>
        </div>

        {/* Botão Copiar */}
        <button
          onClick={copiarSolicitacao}
          className="w-full rounded-full bg-white text-black px-6 py-3 font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copiado ? "Copiado!" : "Copiar solicitação estruturada"}
        </button>

        <button
          onClick={enviarGoalAoHermes}
          disabled={enviandoAoHermes}
          className="w-full mt-4 rounded-full bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {enviandoAoHermes ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando ao Hermes...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              🚀 Enviar GOAL ao Hermes
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Fase 1: Cria GOAL → Envia ao Hermes executor → Retorna com recibo
        </p>
      </Card>

      {/* Status do GOAL em Execução */}
      {goalAtivo && (
        <Card className="p-6 border-blue-500/30 bg-blue-50/5">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            GOAL em Execução
          </h2>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">ID do GOAL</span>
                <p className="font-mono text-xs mt-1">{goalAtivo.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-semibold mt-1 text-blue-600">{goalAtivo.status.toUpperCase()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sessão Hermes</span>
                <p className="font-mono text-xs mt-1">{goalAtivo.hermeSessionId?.slice(0, 12) || "aguardando..."}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Criada em</span>
                <p className="text-xs mt-1">{goalAtivo.criada_em}</p>
              </div>
            </div>
            {goalAtivo.resultado && (
              <div className="mt-4 rounded border border-green-500/20 bg-green-50/5 p-3">
                <div className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Resultado: {goalAtivo.resultado.status.toUpperCase()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{goalAtivo.resultado.mensagem}</p>
                {goalAtivo.resultado.evidencia && (
                  <p className="text-xs font-mono text-muted-foreground mt-1">📌 {goalAtivo.resultado.evidencia}</p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recibo Final */}
      {reciboAtivo && (
        <Card className="p-6 border-green-500/30 bg-green-50/5">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            ✅ Recibo da Execução
          </h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">ID do Recibo</span>
                <p className="font-mono text-xs mt-1">{reciboAtivo.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-semibold mt-1 text-green-600">{reciboAtivo.status.toUpperCase()}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Resultado</span>
                <p className="mt-1">{reciboAtivo.resultado}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Timestamp</span>
                <p className="font-mono text-xs mt-1">{reciboAtivo.timestamp}</p>
              </div>
            </div>
            {reciboAtivo.assinado && (
              <div className="mt-3 text-xs text-green-600 font-semibold">
                🔐 Assinado e válido para rastreamento
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Histórico de Solicitações */}
      {solicitacoes.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Solicitações Recentes</h2>
          <div className="space-y-3">
            {solicitacoes.map((s) => (
              <div key={s.id} className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">
                      {s.executor} → {s.ambiente}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{s.capacidade}</div>
                    <div className="text-xs text-muted-foreground">
                      Prazo: {s.prazo === "sessao" ? "Sessão atual" : s.prazo === "24h" ? "24 horas" : "Persistente"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-2">{s.criada_em}</div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        s.status === "pendente"
                          ? "bg-amber-100 text-amber-800"
                          : s.status === "aprovada"
                            ? "bg-green-100 text-green-800"
                            : s.status === "executada"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {s.status === "pendente"
                        ? "⏳ Pendente"
                        : s.status === "aprovada"
                          ? "✅ Aprovada"
                          : s.status === "executada"
                            ? "✓ Executada"
                            : "✗ Negada"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* JSON estruturado para debug */}
      <Card className="p-4 bg-muted/20">
        <div className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
          {JSON.stringify(estruturaSolicitacao, null, 2)}
        </div>
      </Card>
    </div>
  );
}
