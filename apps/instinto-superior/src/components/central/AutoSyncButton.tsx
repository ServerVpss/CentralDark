import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { useQueryClient } from '@tanstack/react-query'
import { lerStatusSync, executarSync } from '@/lib/sync.functions'
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
  const [syncProgress, setSyncProgress] = useState({ value: 0, label: 'Preparando sincronização...' })
  const [microDeployMode, setMicroDeployMode] = useState<'main-only' | 'full'>('main-only')

  const getStatus = useServerFn(lerStatusSync)
  const runSync = useServerFn(executarSync)
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
    setSyncProgress({ value: 8, label: phases[phaseIndex] })
    const progressTimer = setInterval(() => {
      phaseIndex = Math.min(phaseIndex + 1, phases.length - 1)
      setSyncProgress((current) => ({ value: Math.min(current.value + 16, 88), label: phases[phaseIndex] }))
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
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
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
            <CockpitActionButton hint="Casa/Windows: envia as alterações locais para o GitHub com commit e push" onClick={() => handleSync('windows')} disabled={isSyncing} size="sm" variant="outline">
              Windows
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
        </div>
        {(isSyncing || syncProgress.value > 0) && (
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
            {syncStatus.files && syncStatus.files.length > 0 && !isSyncing && (
              <div className="mt-2 text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">Arquivos considerados:</span>{' '}
                <span className="font-mono">{syncStatus.files.join(' · ')}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-4 border border-amber-500/40 bg-amber-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400" />
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
              <Zap className="w-4 h-4" />
              {isSyncing ? 'Solicitando...' : 'Executar Automação'}
            </CockpitActionButton>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AutoSyncButton
