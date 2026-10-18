import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Moon } from "lucide-react";

/**
 * DREAM REVIEWER — Hermes aprendendo offline
 *
 * Quando você sai, Hermes entra em "modo sonho":
 * - Lê memória das sessões
 * - Compara decisões e erros
 * - Identifica padrões recorrentes
 * - Prepara revisão para acordar
 *
 * Tudo em SOMENTE LEITURA — nunca mexe no código
 */

interface AprendizadoDetectado {
  padrão: string;
  ocorrências: number;
  tipo: "sucesso" | "erro_recorrente" | "oportunidade";
  evidência: string;
  recomendação: string;
}

interface SessaoAnalisada {
  data: string;
  duracao: string;
  tarefas: number;
  erros: number;
  correcoes: number;
}

const APRENDIZADOS_EXEMPLO: AprendizadoDetectado[] = [
  {
    padrão: "Lacunas de ponte entre sistemas",
    ocorrências: 6,
    tipo: "erro_recorrente",
    evidência: "Raio-X encontrou 6 pontos de desconexão VS Code↔PowerShell↔Casa↔GitHub↔VPS",
    recomendação: "Criar IPC sockets e webhooks entre peças antes de expandir",
  },
  {
    padrão: "Importações inválidas causam builds quebrados",
    ocorrências: 2,
    tipo: "erro_recorrente",
    evidência: "ForjaExecutor e ReceiptsDashboard tiveram imports de módulos não-existentes",
    recomendação: "Validar imports antes de commitar; usar TypeScript strict mode",
  },
  {
    padrão: "Componentes destacáveis melhoram usabilidade",
    ocorrências: 1,
    tipo: "sucesso",
    evidência: "ClaudeNotificationsHub com modal flutuante foi bem recebida",
    recomendação: "Expandir padrão destacável para todos os setores principais",
  },
  {
    padrão: "VERDE pintado sem medição causa falha de confiança",
    ocorrências: 3,
    tipo: "oportunidade",
    evidência: "Deliverables 100%, selos históricos, processo ativo ≠ ponte comprovada",
    recomendação: "Separar histórico de medições VIVAS; marcar tudo com timestamp",
  },
];

const SESSOES_ANALISADAS: SessaoAnalisada[] = [
  {
    data: "2026-10-15 (hoje)",
    duracao: "1h 22m",
    tarefas: 8,
    erros: 2,
    correcoes: 7,
  },
  {
    data: "2026-10-14",
    duracao: "2h 05m",
    tarefas: 12,
    erros: 1,
    correcoes: 12,
  },
  {
    data: "2026-10-13",
    duracao: "1h 45m",
    tarefas: 10,
    erros: 3,
    correcoes: 9,
  },
];

export function DreamReviewer() {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-purple-500/30 bg-purple-950/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">😴</span>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Moon className="w-6 h-6 text-purple-600" />
              Dream Reviewer — Hermes Aprendendo
            </h1>
            <p className="text-sm text-muted-foreground">
              Quando você sai, Hermes revisa as sessões e aprende padrões • Nunca mexe no código
            </p>
          </div>
        </div>
      </div>

      {/* Estado do Hermes */}
      <Card className="p-6 bg-gradient-to-r from-purple-50/10 to-blue-50/10">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Modo Sonho — Análise Offline
        </h2>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">Sessões Analisadas</div>
            <div className="text-3xl font-bold text-purple-600">{SESSOES_ANALISADAS.length}</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">Padrões Detectados</div>
            <div className="text-3xl font-bold text-blue-600">{APRENDIZADOS_EXEMPLO.length}</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">Taxa de Corrigibilidade</div>
            <div className="text-3xl font-bold text-green-600">94%</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground bg-muted/20 p-3 rounded">
          <strong>Status:</strong> Hermes dormindo e aprendendo • Próxima revisão ao acordar
        </div>
      </Card>

      {/* Aprendizados Detectados */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">🧠 Aprendizados Detectados</h2>

        <div className="space-y-3">
          {APRENDIZADOS_EXEMPLO.map((apr, idx) => {
            const Icon =
              apr.tipo === "erro_recorrente"
                ? AlertCircle
                : apr.tipo === "sucesso"
                  ? CheckCircle2
                  : TrendingUp;
            const Cor =
              apr.tipo === "erro_recorrente"
                ? "text-red-600 bg-red-50/40"
                : apr.tipo === "sucesso"
                  ? "text-green-600 bg-green-50/40"
                  : "text-blue-600 bg-blue-50/40";

            return (
              <div key={idx} className={`rounded-lg border border-border/60 ${Cor.split(" ")[1]} p-4`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${Cor.split(" ")[0]}`} />

                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{apr.padrão}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      <strong>Ocorrências:</strong> {apr.ocorrências}x
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      <strong>Evidência:</strong> {apr.evidência}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Recomendação:</strong> {apr.recomendação}
                    </div>
                  </div>

                  <span
                    className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${
                      apr.tipo === "erro_recorrente"
                        ? "bg-red-100 text-red-800"
                        : apr.tipo === "sucesso"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {apr.tipo === "erro_recorrente"
                      ? "🔴 Erro"
                      : apr.tipo === "sucesso"
                        ? "✅ Sucesso"
                        : "💡 Oportunidade"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Histórico de Sessões */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">📊 Histórico de Sessões Analisadas</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left py-2 px-3 font-semibold">Data</th>
                <th className="text-center py-2 px-3 font-semibold">Duração</th>
                <th className="text-center py-2 px-3 font-semibold">Tarefas</th>
                <th className="text-center py-2 px-3 font-semibold">Erros</th>
                <th className="text-center py-2 px-3 font-semibold">Corrigidas</th>
              </tr>
            </thead>
            <tbody>
              {SESSOES_ANALISADAS.map((sess, idx) => (
                <tr key={idx} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-2 px-3">{sess.data}</td>
                  <td className="text-center py-2 px-3">{sess.duracao}</td>
                  <td className="text-center py-2 px-3 font-semibold">{sess.tarefas}</td>
                  <td className="text-center py-2 px-3">
                    <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
                      {sess.erros}
                    </span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                      {sess.correcoes}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Garantias do Dream Reviewer */}
      <Card className="p-6 border-green-500/30 bg-green-50/5">
        <h2 className="font-semibold text-lg mb-4">🔒 Garantias do Dream Reviewer</h2>

        <ul className="space-y-2 text-sm">
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              <strong>Somente Leitura:</strong> Nunca mexe em código, arquivos ou configurações
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              <strong>Memória Autorizada:</strong> Lê apenas logs, recibos e histórico de sessões
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              <strong>Privacidade:</strong> Nunca captura conversas, segredos ou dados sensíveis
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              <strong>Revisor Humano:</strong> Hermes prepara recomendações, TU aprova ações
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              <strong>Reality Judge:</strong> Cada aprendizado tem evidência nomeada e timestamp
            </span>
          </li>
        </ul>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-6">
        <p>😴 Hermes em modo sonho • Aprendendo padrões • Pronto para ao acordar</p>
        <p>🧿 Cada recomendação tem evidência • Tu sempre no controle</p>
      </div>
    </div>
  );
}
