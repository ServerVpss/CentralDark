import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Moon, BookOpenText, FolderInput, GitMerge, LibraryBig, Sparkles, ShieldCheck, MessagesSquare, ExternalLink, ArrowRight, FileClock, FileCheck2, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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


// #OBSERVACOES# @owner=apps/instinto-superior/src/components/central/DreamReviewer.tsx
// @doc_ref=docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/README.md
// Catálogo de owners verificados em source; NENHUMA carta afirma consumo em runtime.
const PECAS_BIBLIOTECA = [
  { passo: "01", titulo: "Garimpar conversas", descricao: "Extrai lições de sessões que foram autorizadas e disponibilizadas.", Icone: SearchCheck, arquivo: ".agents/skills/session-intelligence-harvester/SKILL.md" },
  { passo: "02", titulo: "Receber experiências", descricao: "Entrada única para eventos e relatos, sem publicar conversas privadas.", Icone: FolderInput, arquivo: "scripts/memory-linker/inbox/README.md" },
  { passo: "03", titulo: "Revisar enquanto descansa", descricao: "Separa aprendizados candidatos; execução automática ainda não verificada.", Icone: Moon, arquivo: "scripts/memory-linker/dream-review-run.mjs" },
  { passo: "04", titulo: "Conferir contraprovas", descricao: "Compara lições parecidas e evita acreditar em repetição como prova.", Icone: GitMerge, arquivo: "scripts/memory-linker/pattern-discovery.mjs" },
  { passo: "05", titulo: "Guardar padrões", descricao: "Organiza os padrões no mesmo catálogo, sem criar outro cérebro.", Icone: LibraryBig, arquivo: "scripts/memory-linker/pattern-library.mjs" },
  { passo: "06", titulo: "Abrir a Biblioteca", descricao: "Conserva origem, referências e vínculos do conhecimento aprovado.", Icone: BookOpenText, arquivo: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/README.md" },
  { passo: "07", titulo: "Aprimorar com testes", descricao: "Compara resultados com métricas; não treina pesos de IA automaticamente.", Icone: Sparkles, arquivo: "apps/modulos/proxy/self_evolve.py" },
  { passo: "08", titulo: "Conversar com Hermes", descricao: "O prompt aponta para aprendizado; uso da nova lição ainda exige prova.", Icone: MessagesSquare, arquivo: "apps/modulos/HERMES-CORE/prompts/hermes-core.md" },
  { passo: "09", titulo: "Revisar o agendamento", descricao: "Gatilho declarado; execução noturna ainda não comprovada.", Icone: FileClock, arquivo: "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml" },
] as const;

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

export function DreamReviewer({ onNavigate }: { onNavigate?: (aba: string) => void } = {}) {

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
              Biblioteca existente, propostas de aprendizado e provas de consumo • Modo somente leitura
            </p>
          </div>
        </div>
      </div>


      {/* Biblioteca canônica: catálogo de peças, não métricas inventadas. */}
      <section aria-labelledby="biblioteca-dream-title" className="relative isolate overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-[#071327] via-[#101a3c] to-[#190d35] p-5 text-[#d0e8f5] shadow-[0_20px_80px_-35px_rgba(39,122,240,0.55)] sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 size-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            <LibraryBig className="size-4" aria-hidden="true" /> Biblioteca da CentralDark · uma só
          </div>
          <h2 id="biblioteca-dream-title" className="flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            <BookOpenText className="size-8 shrink-0 text-cyan-300" aria-hidden="true" />
            As 9 peças do aprendizado
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-sky-100/85">
            Veja onde cada parte mora. O código existe no repositório, mas isto não comprova que o Hermes
            já usou as lições ou que a revisão aconteceu durante a noite.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PECAS_BIBLIOTECA.map(({ passo, titulo, descricao, Icone, arquivo }) => (
              <article key={passo} className="group flex min-h-48 flex-col rounded-2xl border border-sky-300/20 bg-slate-950/45 p-4 shadow-lg shadow-blue-950/15 transition-colors hover:border-cyan-300/60 focus-within:border-cyan-300/60">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
                    <Icone className="size-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-sky-300/20 px-2 py-1 font-mono text-xs text-sky-200/80">{passo} / 09</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{titulo}</h3>
                <p className="mt-2 flex-1 text-sm leading-5 text-sky-100/75">{descricao}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-sky-300/15 pt-3">
                  <span className="text-[11px] font-semibold text-amber-200">Código localizado · uso a verificar</span>
                  <a className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-cyan-200 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300" href={`https://github.com/ServerVpss/CentralDark/blob/main/${arquivo}`} target="_blank" rel="noopener noreferrer" aria-label={`Ver arquivo de origem: ${titulo}`}>
                    Ver origem <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-400/5 p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <ShieldCheck className="size-5 text-amber-200" aria-hidden="true" /> Como conferir se o Hermes utilizou?
            </h3>
            <p className="mt-2 text-sm text-sky-100/85">
              A Biblioteca está localizada. Ainda falta conferir o carregamento pelo Hermes, a execução do Dream Review
              e um recibo da resposta real. Abrir as telas existentes não conta, por si só, como prova.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="border-cyan-200/40 bg-cyan-300/10 text-[#d0e8f5] hover:bg-cyan-300/20 hover:text-white" onClick={() => onNavigate?.("hermes")} disabled={!onNavigate}>
                <MessagesSquare className="mr-2 size-4" aria-hidden="true" /> Abrir Hermes <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>
              <Button type="button" variant="outline" className="border-cyan-200/40 bg-cyan-300/10 text-[#d0e8f5] hover:bg-cyan-300/20 hover:text-white" onClick={() => onNavigate?.("recibos")} disabled={!onNavigate}>
                <FileCheck2 className="mr-2 size-4" aria-hidden="true" /> Conferir recibos
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-amber-100/90">
              <span>🟡 Revisão noturna: ainda não verificada</span>
              <span>🟡 Hermes usou a lição: ainda não verificado</span>
              <span>🟢 Peças encontradas no código</span>
            </div>
          </div>
        </div>
      </section>

      <details className="rounded-xl border border-border bg-muted/10 p-4">
        <summary className="cursor-pointer text-sm font-semibold">Ver dados ilustrativos da interface — PRÉVIA, não são medições reais</summary>
        <div className="mt-5 space-y-6">
      {/* Estado do Hermes */}
      <Card className="p-6 bg-gradient-to-r from-purple-50/10 to-blue-50/10">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Prévia visual — sem dados medidos
        </h2>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">Sessões Analisadas</div>
            <div className="text-3xl font-bold text-purple-600">—</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">Padrões Detectados</div>
            <div className="text-3xl font-bold text-blue-600">—</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">Taxa de Corrigibilidade</div>
            <div className="text-3xl font-bold text-green-600">—</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground bg-muted/20 p-3 rounded">
          <strong>Status:</strong> Execução agendada e sessões processadas: ainda não verificadas. Números abaixo são exemplos.
        </div>
      </Card>

      {/* Aprendizados Detectados */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">🧠 Exemplos de aprendizados — não medidos</h2>

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
        <h2 className="font-semibold text-lg mb-4">📊 Exemplos de sessões — não são histórico real</h2>

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

        </div>
      </details>

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
              <strong>Privacidade:</strong> Este painel não coleta conversas ou segredos; o motor só deve receber fontes autorizadas e sanitizadas
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              <strong>Revisor Humano:</strong> Aprendizados candidatos exigem revisão e promoção autorizada
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>
              <strong>Reality Judge:</strong> Um aprendizado só é confirmado com origem, data e evidência verificadas
            </span>
          </li>
        </ul>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-6">
        <p>🌙 Biblioteca em revisão · execução real do Hermes ainda precisa de contraprova</p>
        <p>🧿 Fontes e recibos devem ser conferidos antes de marcar aprendizado utilizado</p>
      </div>
    </div>
  );
}
