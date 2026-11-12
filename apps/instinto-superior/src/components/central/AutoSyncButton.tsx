// #OBSERVACOES# @owner: cockpit-sync @doc_ref: apps/instinto-superior/README.md
// @last_updated: 2026-11-01T19:58:27.552347+00:00 @implementado: divergencia e drift bloqueiam falso verde/publicacao cega; restante preservado.
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Clock, Zap } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { lerEstadoCentralDark } from '@/lib/cockpit.functions'
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
export const AutoSyncButton: React.FC = () => {
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
  const [hidratado, setHidratado] = useState(false)

  const getStatus = useServerFn(lerStatusSync)
  const runSync = useServerFn(executarSync)
  const readTracker = useServerFn(lerRastreadorCasa)
  const readEstadoVivo = useServerFn(lerEstadoCentralDark)
  const dispatchPromotion = useServerFn(solicitarPromocaoSegura)
  const queryClient = useQueryClient()
  // Reutiliza a MESMA consulta do Estado atual do sistema; não cria outro sensor ou executor.
  const estadoVivo = useQuery({
    queryKey: ['centraldark', 'estado-vivo'],
    queryFn: () => readEstadoVivo(),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    retry: false,
  })
  useEffect(() => { setHidratado(true) }, [])

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

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/40'
      case 'syncing': return 'bg-sky-500/10 border-sky-500/40'
      case 'failed': return 'bg-red-500/10 border-red-500/40'
      case 'conflict': return 'bg-amber-500/10 border-amber-500/40'
      default: return 'bg-muted/30 border-border'
    }
  }

  // Os SHAs são leituras do Git atual. Sucesso anterior do botão NÃO prova sincronização atual.
  // Sem readback fresco da Casa e da VMware, o estado é desconhecido, nunca SIM.
  const atual = hidratado && !estadoVivo.isError && estadoVivo.data
    && Date.now() - estadoVivo.dataUpdatedAt < 45_000 ? estadoVivo.data : null
  const mainSha = atual?.mainSha ?? null
  const vpsSha = atual?.vpsSha ?? null
  const vpsMesmoCommit: boolean | null = mainSha && vpsSha ? mainSha === vpsSha : null
  const dataTracker = trackerStatus?.at ? Date.parse(trackerStatus.at) : Number.NaN
  const trackerEmDia = !trackerError && Number.isFinite(dataTracker)
    && Date.now() - dataTracker >= 0 && Date.now() - dataTracker < 120_000
  // Doctor mede o checkout do servidor do Cockpit; Linux não é a Casa Windows.
  const casaMesmoCommit: boolean | null = trackerStatus?.hostOS === 'windows' && trackerEmDia
    && !!mainSha && !!trackerStatus.head && trackerStatus.githubMain === mainSha
    && trackerStatus.dirtyTracked !== null
    ? trackerStatus.head === mainSha && trackerStatus.dirtyTracked === false : null
  const todosMesmoCommit: boolean | null = casaMesmoCommit === false || vpsMesmoCommit === false
    ? false : casaMesmoCommit === true && vpsMesmoCommit === true ? true : null
  const rotulo = (igual: boolean | null) => igual === true ? 'SIM' : igual === false ? 'NÃO' : 'NÃO VERIFICADO'

  return (
    <div className="space-y-3">
      <Card className={`p-4 border ${getStatusColor()}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
               <p className="text-sm font-semibold text-foreground">Sincronização do código · Casa / Main / VMware</p>
              <p className="text-xs text-muted-foreground">Última tentativa: {syncStatus.human_readable}</p>
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
              label="Sincronizar Casa/Main"
               onClick={() => handleSync('local')}
              isFetching={isSyncing}
              autoSyncEnabled
              lastError={syncStatus.status === 'failed' ? syncStatus.human_readable : null}
              variant="default"
              title="Executa Casa/Windows e consulta Main. Não sincroniza a VPS."
              aria-label="Sincronizar Casa e Main, sem incluir a VPS"
            />
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3" role="status" aria-live="polite" aria-label="Comparação atual de commits">
          <div className="rounded-md border border-border/60 p-2 text-xs">
            <span className="text-muted-foreground">Casa Windows ↔ Main</span>
            <p className="font-semibold">Mesmo commit? {rotulo(casaMesmoCommit)}</p>
            <p className="break-all font-mono text-[10px] text-muted-foreground">{trackerStatus?.hostOS === 'windows' && trackerEmDia ? trackerStatus.head?.slice(0, 8) ?? 'sem SHA' : 'Casa sem leitura própria'} / {mainSha?.slice(0, 8) ?? 'main sem leitura'}</p>
          </div>
          <div className="rounded-md border border-border/60 p-2 text-xs">
            <span className="text-muted-foreground">VMware (VPS) ↔ Main</span>
            <p className="font-semibold">Mesmo commit? {rotulo(vpsMesmoCommit)}</p>
            <p className="break-all font-mono text-[10px] text-muted-foreground">{vpsSha?.slice(0, 8) ?? 'VPS sem leitura'} / {mainSha?.slice(0, 8) ?? 'main sem leitura'}</p>
          </div>
          <div className="rounded-md border border-border/60 p-2 text-xs">
            <span className="text-muted-foreground">Todos os commits iguais</span>
            <p className="font-semibold">{rotulo(todosMesmoCommit)}</p>
            <p className="text-[10px] text-muted-foreground">Não comprova deploy nem arquivos locais não enviados.</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Triton: executa modelos de IA; não baixa nem sincroniza código do GitHub. Git e SSH são os responsáveis. Leituras da Forja Linux não substituem uma leitura da Casa Windows.</p>
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
      </Card>

      <Card className="p-4 border border-amber-500/40 bg-amber-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 text-amber-400 ${isSyncing ? 'motion-safe:animate-pulse' : ''}`} aria-label="Automação CentralDark" />
            <div>
              <p className="text-sm font-semibold text-foreground">Automação CentralDark · execução segura</p>
              <p className="text-xs text-amber-200/80">Despacha o promotor existente. GitHub decide gates e squash; deploy exige recibo.</p>
            </div>
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
      </Card>
    </div>
  )
}

export default AutoSyncButton
