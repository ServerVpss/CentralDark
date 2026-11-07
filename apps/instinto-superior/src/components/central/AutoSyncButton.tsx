// #OBSERVACOES# @owner: cockpit-sync @doc_ref: apps/instinto-superior/README.md
// @last_updated: 2026-11-01T19:58:27.552347+00:00 @implementado: divergencia e drift bloqueiam falso verde/publicacao cega; restante preservado.
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap, ChevronDown, Bot, GitBranch, History, BookOpenText, ScrollText, ShieldAlert, Eye, ShieldCheck, Workflow, Activity, Sparkles, Brain } from 'lucide-react'
// O componente de checkpoint só é carregado ao abrir a contraprova; não inicializar RPC no topo.
const CheckpointCentralDark = React.lazy(() => import('@/components/central/CheckpointCentralDark').then(modulo => ({ default: modulo.CheckpointCentralDark })))
import { Card } from '@/components/ui/card'
import { AlertCircle, Clock, Zap } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { useQueryClient } from '@tanstack/react-query'
import { lerStatusSync, executarSync } from '@/lib/sync.functions'
import { lerRastreadorCasa, type EstadoRastreadorCasa } from '@/lib/sync.functions'
import { solicitarPromocaoSegura } from '@/lib/admin.functions'
import { supabase } from '@/integrations/supabase/client'
import { SyncLoopIcon } from '@/components/central/SyncLoopIcon'
import { SyncActionButton } from '@/components/central/SyncActionButton'
import { CockpitActionButton } from '@/components/central/CockpitActionButton'

interface SyncStatus {
  timestamp: string | null
  status: 'idle' | 'syncing' | 'success' | 'failed' | 'conflict'
  human_readable: string
  target?: string
  details?: string
  phase?: string
  progress?: number
  files?: string[]
}

type SyncRunner = (args: { data: { target: 'local' | 'all' } }) => Promise<SyncStatus>;

function AnimatedDoneIcon({ size = 20, className = '', label }: { size?: number; className?: string; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <circle className="cd-done-ring" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path className="cd-done-check" d="m7.5 12.5 3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

async function prepararAutomacao(modo: 'main-only' | 'full', executarSync: SyncRunner) {
  const target = modo === 'full' ? 'all' : 'local';
  const escopo = modo === 'full' ? 'Casa/Main/VPS' : 'Casa/Main';
  const sync = await executarSync({ data: { target } });
  return { sync, escopo };
}

/**
 * AutoSyncButton — Cockpit Control for Bidirectional Sync + Micro-Deploy
 * Casa <-> Main <-> VPS (continuous, single-writer Hermes)
 * Rota: sync.functions.ts (createServerFn) -> AUTO-SYNC-MASTER.py -> .auto-sync/status.json
 */
export const AutoSyncButton: React.FC<{ onNavigate?: (aba: string) => void; autenticado?: boolean }> = ({ onNavigate, autenticado = false }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    timestamp: null,
    status: 'idle',
    human_readable: 'Nunca sincronizado'
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [trackerStatus, setTrackerStatus] = useState<EstadoRastreadorCasa | null>(null)
  const [trackerReading, setTrackerReading] = useState(false)
  const [trackerError, setTrackerError] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ value: 0, label: 'Preparando sincronização...' })
  const [microDeployMode, setMicroDeployMode] = useState<'main-only' | 'full'>('main-only')
  const [checkpointAberto, setCheckpointAberto] = useState(false)

  const getStatus = useServerFn(lerStatusSync)
  const runSync = useServerFn(executarSync)
  const readTracker = useServerFn(lerRastreadorCasa)
  const dispatchPromotion = useServerFn(solicitarPromocaoSegura)
  const queryClient = useQueryClient()

  // Fetch status on mount + poll every 30s
  useEffect(() => {
    fetchSyncStatus()
    const interval = setInterval(fetchSyncStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const data = await getStatus()
      setSyncStatus(data)
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  const handleSync = async (target: 'local' | 'windows' | 'main' | 'vps' | 'all' = 'local') => {
    setIsSyncing(true)
    const phases = ['Lendo estado local...', 'Consultando origin/main...', 'Conferindo alterações...', 'Enviando arquivos autorizados...', 'Confirmando o mesmo SHA...']
    let phaseIndex = 0
    setSyncProgress({ value: 8, label: (phases[phaseIndex] ?? 'Lendo estado local...') })
    const progressTimer = setInterval(() => {
      phaseIndex = Math.min(phaseIndex + 1, phases.length - 1)
      setSyncProgress((current) => ({ value: Math.min(current.value + 16, 88), label: (phases[phaseIndex] ?? 'Lendo estado local...') }))
    }, 700)
    const medirJunto = target === 'local' || target === 'all'
      ? queryClient.refetchQueries({ queryKey: ['centraldark', 'estado-vivo'] })
      : Promise.resolve()
    try {
      const data = await runSync({ data: { target } } as any)
      setSyncStatus(data)
      setSyncProgress({ value: data.progress ?? 100, label: data.phase ?? data.human_readable })
      await medirJunto
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus(prev => ({ ...prev, status: 'failed' }))
      setSyncProgress({ value: 100, label: 'Falha na sincronização' })
    } finally {
      clearInterval(progressTimer)
      setIsSyncing(false)
    }
  }

  const checkTracker = async () => {
    if (trackerReading) return
    setTrackerReading(true)
    try {
      setTrackerStatus(await readTracker())
      setTrackerError(false)
    } catch {
      setTrackerStatus(null)
      setTrackerError(true)
    } finally {
      setTrackerReading(false)
    }
  }

  // Aciona o promotor canônico, sem pular autorização ou gates do GitHub.
  const handleMicroDeploy = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    const syncLabel = microDeployMode === 'full' ? 'Casa/Main/VPS' : 'Casa/Main'
    setSyncStatus(prev => ({ ...prev, status: 'syncing', human_readable: `Estabilizando ${syncLabel} antes da promoção...` }))
    try {
      const { sync } = await prepararAutomacao(microDeployMode, runSync as unknown as SyncRunner)
      if (sync.status !== 'success') {
        setSyncStatus({
          ...sync,
          status: sync.status === 'conflict' ? 'conflict' : 'failed',
          human_readable: `Promoção bloqueada: sincronização ${syncLabel} não fechou (${sync.human_readable})`,
        })
        return
      }
      const { data, error } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (error || !token) throw new Error('SESSION_MISSING')
      const result = await dispatchPromotion({ headers: { Authorization: `Bearer ${token}` } })
      if (result.state === 'DISPATCHED') {
        setSyncStatus(prev => ({ ...prev, status: 'syncing', human_readable: `${syncLabel} estabilizada. Promotor acionado; aguardando gates verdes, squash e recibo. deploy ainda não comprovado.` }))
      } else {
        setSyncStatus(prev => ({ ...prev, status: 'failed', human_readable: `Promoção não confirmada: ${result.reason}` }))
      }
    } catch {
      setSyncStatus(prev => ({ ...prev, status: 'failed', human_readable: 'Sessão/autorização indisponível; nenhuma promoção confirmada.' }))
    } finally {
      setIsSyncing(false)
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'success': return <AnimatedDoneIcon className="w-5 h-5 text-green-500" label="Sincronização confirmada" />
      case 'syncing': return <SyncLoopIcon autoSyncEnabled isFetching size={20} />
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'conflict': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  // Um painel, três funções. O status da sincronização é o único sinal lido aqui.
  // Sem recibo de sessão do Hermes, fila, revisão e recuperação são DESCONHECIDOS.
  const desconhecido = 'Aguardando recibo do Hermes'

  return (
    <section aria-label="Continuidade da CentralDark" className="overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#0b1426] via-[#111d35] to-[#122743] p-4 text-slate-100 shadow-[0_12px_40px_-18px_rgba(14,165,233,0.25)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-500/25 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-cyan-400/35 bg-cyan-400/10 text-cyan-300"><Bot className="size-6" aria-hidden="true" /></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/85">Corpo único · CentralDark</p>
            <h2 className="text-base font-semibold text-white sm:text-lg">🪬 Continuidade do Hermes</h2>
            <p className="text-xs text-slate-300">Sessão, sincronização e publicação no mesmo cartão.</p>
          </div>
        </div>
        <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">Sessão: não medida</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Sessão atual', valor: desconhecido, Icone: Bot },
          { label: 'Fila e tarefas', valor: 'Sem leitura da fila', Icone: History },
          { label: 'Último recibo', valor: 'Não consultado', Icone: ScrollText },
          { label: 'Dream Review', valor: 'Consumo não medido', Icone: BookOpenText },
        ].map(({ label, valor, Icone }) => (
          <div key={label} className="min-w-0 rounded-xl border border-sky-200/15 bg-slate-950/35 p-3">
            <div className="flex items-center gap-2 text-cyan-200"><Icone className="size-4 shrink-0" aria-hidden="true" /><span className="text-[11px] font-semibold">{label}</span></div>
            <p className="mt-2 text-xs leading-5 text-amber-200">{valor}</p>
  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/40'
      case 'syncing': return 'bg-sky-500/10 border-sky-500/40'
      case 'failed': return 'bg-red-500/10 border-red-500/40'
      case 'conflict': return 'bg-amber-500/10 border-amber-500/40'
      default: return 'bg-muted/30 border-border'
    }
  }

  return (
    <div className="space-y-3">
      <Card className={`p-4 border ${getStatusColor()}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
               <p className="text-sm font-semibold text-foreground">Auto Sync: Casa / Main · VPS manual</p>
              <p className="text-xs text-muted-foreground">{syncStatus.human_readable}</p>
              {syncStatus.details && syncStatus.status !== 'idle' && (
                <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 max-w-xs truncate" title={syncStatus.details}>
                  {syncStatus.details}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CockpitActionButton hint="Casa/Forja: verifica alterações e bloqueia publicação sem escopo revisado" onClick={() => handleSync('windows')} disabled={isSyncing} size="sm" variant="outline">
              Casa / Forja
            </CockpitActionButton>
            <CockpitActionButton hint="Main: consulta o remoto e compara os SHAs local e origin/main" onClick={() => handleSync('main')} disabled={isSyncing} size="sm" variant="outline">
              Main
            </CockpitActionButton>
            <CockpitActionButton hint="VPS: atualiza o checkout remoto por SSH com fast-forward; conflito bloqueia" onClick={() => handleSync('vps')} disabled={isSyncing} size="sm" variant="outline">
              VPS
            </CockpitActionButton>
            <SyncActionButton
              label="Sincronizar Tudo"
               onClick={() => handleSync('local')}
              isFetching={isSyncing}
              autoSyncEnabled
              lastError={syncStatus.status === 'failed' ? syncStatus.human_readable : null}
              variant="default"
              title="Executa Casa/Windows e consulta Main. Não sincroniza a VPS."
              aria-label="Sincronizar Casa e Main, sem incluir a VPS"
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onNavigate?.('hermes')} disabled={!onNavigate} className="border-sky-300/30 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white">🪬 Abrir Hermes</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onNavigate?.('recibos')} disabled={!onNavigate} className="border-sky-300/30 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white">🧾 Recibos</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onNavigate?.('dream-reviewer')} disabled={!onNavigate} className="border-sky-300/30 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white">📚 Biblioteca</Button>
      </div>

      {/* Corpo Único: apresentação compacta na frente, detalhes e prova atrás. */}
      <div className="mt-4 rounded-2xl border border-sky-200/15 bg-slate-950/20 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">🧠 Harness · mente clara</h3>
          <span className="rounded-full border border-sky-300/25 px-2 py-1 text-[11px] text-sky-200">Uma intenção · um executor · um recibo</span>
        </div>
<<<<<<< HEAD
        <ol className="mt-3 grid grid-cols-2 items-stretch gap-2 text-center text-xs sm:grid-cols-4">
          {[
            { rotulo: '👑 CHEFE', detalhe: 'Define a intenção' },
            { rotulo: '🪬 COCKPIT', detalhe: 'Superfície única' },
            { rotulo: '🧠 MCP', detalhe: 'Descobrir · PID · solicitar' },
            { rotulo: '🧾 RECIBO', detalhe: 'Resultado comprovado' },
          ].map((etapa, indice) => (
            <li key={etapa.rotulo} className="relative rounded-xl border border-cyan-300/20 bg-slate-950/45 p-3">
              <span className="text-xs font-semibold text-white">{etapa.rotulo}</span>
              <p className="mt-1 text-[11px] leading-4 text-slate-300">{etapa.detalhe}</p>
              {indice < 3 ? <span aria-hidden="true" className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-cyan-300 sm:block">→</span> : null}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-amber-200">🟡 Integração MCP ↔ VS Code: versão de código em validação; execução no PID da Casa ainda sem recibo confirmado.</p>
      </div>

      <details className="group mt-3 rounded-xl border border-sky-300/20 bg-slate-950/30">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-cyan-100 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2"><Eye className="size-4 text-cyan-300" aria-hidden="true" /> 🔬 Visão Contraprova · 7 funções internas</span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid gap-2 border-t border-sky-300/15 p-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { titulo: '🧠 Mente Clara', texto: 'Quatro passos na frente, detalhes internos sob demanda.', Icone: Brain },
            { titulo: '🔬 Visão Contraprova', texto: 'Expande transporte, dispositivo, terminal e evidências.', Icone: Eye },
            { titulo: '💎 Selo da Realidade', texto: 'PASS só depois de execução e leitura de confirmação.', Icone: ShieldCheck },
            { titulo: '🧬 Trilho de Execução', texto: 'Uma correlação: solicitar → autorizar → executar → provar.', Icone: Workflow },
            { titulo: '🫀 Pulso de Continuidade', texto: 'Último PASS, NEXT_CURSOR e recibo do checkpoint canônico.', Icone: Activity },
            { titulo: '🛡️ Guardião Silencioso', texto: 'Aprovação local preservada; sem comando remoto por aparência.', Icone: ShieldAlert },
            { titulo: '🌙 Memória Viva', texto: 'Dream Review e Biblioteca existentes; consumo ainda a medir.', Icone: Sparkles },
          ].map(({ titulo, texto, Icone }) => (
            <div key={titulo} className="rounded-xl border border-cyan-300/15 bg-slate-900/45 p-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white"><Icone aria-hidden="true" className="size-4 shrink-0 text-cyan-300" />{titulo}</h4>
              <p className="mt-2 text-xs leading-5 text-slate-300">{texto}</p>
=======
        {isSyncing && (
          <div className="mt-3 rounded-md border border-white/10 bg-background/30 px-3 py-2" aria-live="polite">
            <div className="mb-1 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
              <span className="truncate">{isSyncing ? syncProgress.label : syncStatus.phase ?? syncProgress.label}</span>
              <span className="font-mono">{isSyncing ? syncProgress.value : syncStatus.progress ?? syncProgress.value}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${syncStatus.status === 'failed' || syncStatus.status === 'conflict' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${isSyncing ? syncProgress.value : syncStatus.progress ?? syncProgress.value}%` }}
              />
            </div>
          </div>
        )}
        {!isSyncing && syncStatus.status === 'success' && (
          <div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[10px] text-emerald-200" aria-live="polite">
            <div className="flex items-center gap-2">
              <AnimatedDoneIcon size={14} className="h-3.5 w-3.5 text-emerald-300" />
              <span className="font-semibold">{syncStatus.target === "main" || syncStatus.details?.includes("Casa já está em dia") ? "Main em dia · mesmo SHA confirmado" : "Sincronizado · mesmo SHA confirmado"}</span>
            </div>
            {syncStatus.files && syncStatus.files.length > 0 && (
              <div className="mt-1 truncate font-mono text-muted-foreground" title={syncStatus.files.join(' · ')}>
                Arquivos considerados: {syncStatus.files.join(' · ')}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-3 border border-sky-500/30 bg-sky-500/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Rastreador de mudanças · CentralDark / openKylin</p>
            <p className="text-xs text-muted-foreground">
              {trackerReading ? 'Consultando monitor...' : trackerStatus?.tracker === 'active'
                ? 'Ativo · registra criação, edição, movimentação e exclusão no journal privado da Casa.'
                : trackerError ? 'Diagnóstico indisponível nesta sessão.'
                : trackerStatus ? 'Estado não comprovado; nenhuma sincronização foi disparada.'
                : 'Consulta de leitura, independente da sincronização.'}
            </p>
            {trackerStatus && (
              <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                SSH: {trackerStatus.ssh === true ? 'OK' : 'UNKNOWN'} · gh: {trackerStatus.githubAuthenticated === true ? 'OK' : 'UNKNOWN'}
                {' · '}HEAD: {trackerStatus.head?.slice(0, 8) ?? 'UNKNOWN'} · main: {trackerStatus.githubMain?.slice(0, 8) ?? 'UNKNOWN'}
                {' · '}SHA: {trackerStatus.sameSha === true ? 'igual' : trackerStatus.sameSha === false ? 'divergente' : 'UNKNOWN'}
              </p>
            )}
          </div>
          <CockpitActionButton
            hint="Diagnóstico read-only da Casa, GitHub e rastreador. Não sincroniza nem publica."
            onClick={checkTracker} disabled={trackerReading || isSyncing} size="sm" variant="outline"
          >
            {trackerReading ? 'Lendo...' : 'Diagnosticar'}
          </CockpitActionButton>
        </div>
>>>>>>> origin/main
      </Card>

      <Card className="p-4 border border-amber-500/40 bg-amber-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 text-amber-400 ${isSyncing ? 'motion-safe:animate-pulse' : ''}`} aria-label="Automação CentralDark" />
            <div>
              <p className="text-sm font-semibold text-foreground">Automação CentralDark · execução segura</p>
              <p className="text-xs text-amber-200/80">Despacha o promotor existente. GitHub decide gates e squash; deploy exige recibo.</p>
            </div>
          ))}
        </div>
        <div className="border-t border-sky-300/15 px-4 py-3 text-xs leading-5 text-slate-300">
          Segurança interna preservada: Tailscale privado, identidade do dispositivo, PID, autorização no VS Code, resultado e recibo.
          A interface é compacta; o caminho técnico não foi removido.
        </div>
      </details>

      <details className="group mt-3 rounded-xl border border-amber-300/25 bg-amber-400/5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-amber-100 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2"><History className="size-4 text-amber-200" aria-hidden="true" /> 🧪 Diagnóstico Cline · última evidência recebida</span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid gap-2 border-t border-amber-200/15 p-3 text-xs sm:grid-cols-2">
          {[
            { tipo: 'PROVA HISTÓRICA', rotulo: 'Casa → VPS por SSH', texto: 'Conexão autenticada observada nos registros enviados em 20/10/2026.' },
            { tipo: 'FALHA LOCAL', rotulo: 'PowerShell → Bash', texto: 'CRLF e redirecionamento quebraram scripts; transferência por stdin com cmd /c foi observada.' },
            { tipo: 'FALHA DE TESTE', rotulo: 'verify_argv', texto: 'AssertionError na comparação do .output com um release esperado; conferir o release ativo antes de corrigir.' },
            { tipo: 'GAP DE INTEGRAÇÃO', rotulo: 'Checkpoint no CockpitShell', texto: 'O componente existia, mas a montagem visual não foi localizada na versão investigada.' },
          ].map(item => (
            <article key={item.rotulo} className="rounded-lg border border-amber-300/15 bg-slate-950/40 p-3">
              <span className="text-[10px] font-bold tracking-wider text-amber-200">{item.tipo}</span>
              <h4 className="mt-1 text-sm font-semibold text-white">{item.rotulo}</h4>
              <p className="mt-1 leading-5 text-slate-300">{item.texto}</p>
            </article>
          ))}
        </div>
        <p className="border-t border-amber-300/15 px-4 py-3 text-xs text-amber-100/85">
          Fonte: capturas e saída do Cline recebidas em 20/10/2026. Não são sensores ao vivo; nenhuma correção ou execução é certificada por este cartão.
          Sem segunda investigação quando o recibo anterior já serve.
        </p>
      </details>

      <details className="group mt-3 rounded-xl border border-emerald-300/20 bg-slate-950/30" onToggle={event => setCheckpointAberto(event.currentTarget.open)}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-cyan-100 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2"><ScrollText className="size-4 text-cyan-300" aria-hidden="true" /> 🫀 Checkpoint raiz · missão / último PASS / próximo cursor</span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-sky-300/15 p-3">
          <p className="mb-3 text-xs text-slate-300">Leitura real pelo owner já existente, sob autenticação administrativa. O último verde não se perde quando a medição atual falha.</p>
          {checkpointAberto ? <React.Suspense fallback={<p role="status" className="text-xs text-slate-300">Carregando checkpoint existente…</p>}><CheckpointCentralDark autenticado={autenticado} /></React.Suspense> : null}
        </div>
      </details>

      <details className="group mt-4 rounded-xl border border-cyan-400/20 bg-slate-950/30">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-cyan-100 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2"><GitBranch className="size-4" aria-hidden="true" /> Casa ↔ Main ↔ VPS · ferramentas de sincronização</span>
          <span className="flex items-center gap-2 text-xs text-slate-300">Abrir controles <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" /></span>
        </summary>
        <div className="space-y-3 border-t border-slate-500/20 px-3 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-400/25 bg-sky-300/5 p-3">
            <div className="flex min-w-0 items-center gap-2">
              {getStatusIcon()}
              <div><p className="text-sm font-semibold text-white">Auto Sync · Casa / Main / VPS</p><p className="break-words text-xs text-slate-300">{syncStatus.human_readable}</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['windows','main','vps'] as const).map(target => <Button key={target} type="button" size="sm" variant="outline" disabled={isSyncing} onClick={() => handleSync(target)} className="border-slate-500/60 bg-slate-950/50 text-slate-100 hover:bg-slate-800 hover:text-white">{target === 'windows' ? 'Windows' : target === 'main' ? 'Main' : 'VPS'}</Button>)}
              <Button type="button" size="sm" disabled={isSyncing} onClick={() => handleSync('all')} className="gap-2 bg-cyan-600 text-white hover:bg-cyan-500"><RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />{isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}</Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-amber-300/5 p-3">
            <div className="flex min-w-0 items-center gap-2"><ShieldAlert className="size-5 shrink-0 text-amber-300" aria-hidden="true" /><div><p className="text-sm font-semibold text-white">Micro-Deploy · publicação protegida</p><p className="text-xs text-amber-100/85">Sync Git não comprova publicação. Sem recibo real, deploy bloqueado.</p></div></div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="centraldark-microdeploy-mode">Modo de micro-deploy</label>
              <select id="centraldark-microdeploy-mode" value={microDeployMode} onChange={e => setMicroDeployMode(e.target.value as 'main-only' | 'full')} disabled={isSyncing} className="min-h-9 rounded-md border border-amber-300/40 bg-slate-950 px-3 text-xs text-slate-100"><option value="main-only">Somente Main</option><option value="full">Completo (Casa/VPS/Main)</option></select>
              <Button type="button" size="sm" disabled={isSyncing} onClick={handleMicroDeploy} className="gap-2 bg-amber-600 text-white hover:bg-amber-500"><Zap className="size-4" aria-hidden="true" />Micro-Deploy Agora</Button>
            </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={microDeployMode}
              onChange={(e) => setMicroDeployMode(e.target.value as 'main-only' | 'full')}
              disabled={isSyncing}
              aria-label="Escopo da automação"
              title="Escolha se a pré-sincronização inclui somente Casa/Main ou também a VPS"
              className="px-2 py-1 text-xs border border-amber-500/40 rounded bg-background text-foreground"
            >
              <option value="main-only">Main Only · Casa/Main</option>
              <option value="full">Full · Casa/VPS/Main</option>
            </select>

            <CockpitActionButton hint="Primeiro sincroniza o escopo escolhido. Depois solicita o workflow canônico, que exige gates verdes e faz squash. Deploy só é confirmado por receipt." onClick={handleMicroDeploy} disabled={isSyncing} size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700">
              <Zap className={`w-4 h-4 ${isSyncing ? 'motion-safe:animate-pulse' : ''}`} aria-hidden="true" />
              {isSyncing ? 'Solicitando...' : 'Executar Automação'}
            </CockpitActionButton>
          </div>
        </div>
      </details>
      <p className="mt-3 text-[11px] text-slate-400">ℹ️ O status do Auto Sync usa sua leitura existente. O checkpoint só é consultado ao expandir, sob login admin. Os diagnósticos Cline são históricos, não telemetria ao vivo.</p>
    </section>
  )
}

export default AutoSyncButton
