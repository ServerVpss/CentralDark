import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { lerStatusSync, executarSync } from '@/lib/sync.functions'
import { solicitarPromocaoSegura } from '@/lib/admin.functions'
import { supabase } from '@/integrations/supabase/client'
import { SyncLoopIcon } from '@/components/central/SyncLoopIcon'
import { SyncActionButton } from '@/components/central/SyncActionButton'

interface SyncStatus {
  timestamp: string | null
  status: 'idle' | 'syncing' | 'success' | 'failed' | 'conflict'
  human_readable: string
  target?: string
  details?: string
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

  const getStatus = useServerFn(lerStatusSync)
  const runSync = useServerFn(executarSync)
  const dispatchPromotion = useServerFn(solicitarPromocaoSegura)

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

  const handleSync = async (target: 'windows' | 'main' | 'vps' | 'all' = 'all') => {
    setIsSyncing(true)
    try {
      const data = await runSync({ data: { target } } as any)
      setSyncStatus(data)
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus(prev => ({ ...prev, status: 'failed' }))
    } finally {
      setIsSyncing(false)
    }
  }

  // Aciona o promotor canônico, sem pular autorização ou gates do GitHub.
  const handleMicroDeploy = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncStatus(prev => ({ ...prev, status: 'syncing', human_readable: 'Solicitando execução ao promotor do GitHub...' }))
    try {
      const { data, error } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (error || !token) throw new Error('SESSION_MISSING')
      const result = await dispatchPromotion({ headers: { Authorization: `Bearer ${token}` } })
      if (result.state === 'DISPATCHED') {
        setSyncStatus(prev => ({ ...prev, status: 'syncing', human_readable: 'Pedido recebido pelo GitHub. Conferir workflow e gates; integração e deploy não comprovados.' }))
      } else {
        const motivo = result.reason === 'DISPATCH_TOKEN_NOT_CONFIGURED'
          ? 'O servidor do Cockpit não tem credencial para solicitar a automação. Nenhuma execução foi iniciada.'
          : `O GitHub não confirmou a solicitação: ${result.reason}. Nenhuma integração foi comprovada.`
        setSyncStatus(prev => ({ ...prev, status: 'failed', human_readable: motivo }))
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
              <p className="text-sm font-semibold text-foreground">Auto Sync: Casa / Main / VPS</p>
              <p className="text-xs text-muted-foreground">{syncStatus.human_readable}</p>
              {syncStatus.details && syncStatus.status !== 'idle' && (
                <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 max-w-xs truncate" title={syncStatus.details}>
                  {syncStatus.details}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleSync('windows')} disabled={isSyncing} size="sm" variant="outline">
              Windows
            </Button>
            <Button onClick={() => handleSync('main')} disabled={isSyncing} size="sm" variant="outline">
              Main
            </Button>
            <Button onClick={() => handleSync('vps')} disabled={isSyncing} size="sm" variant="outline">
              VPS
            </Button>
            <SyncActionButton
              label="Sincronizar Tudo"
              onClick={() => handleSync('all')}
              isFetching={isSyncing}
              autoSyncEnabled
              lastError={syncStatus.status === 'failed' ? syncStatus.human_readable : null}
              variant="default"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 border border-amber-500/40 bg-amber-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-foreground">Automação CentralDark · execução segura</p>
              <p className="text-xs text-amber-200/80">Solicita o promotor existente no GitHub. Ele verifica os gates e decide a integração. Não sincroniza Casa/VPS nem faz deploy.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs border border-amber-500/40 rounded bg-background text-foreground">
              GitHub main · sem deploy
            </span>

            <Button onClick={handleMicroDeploy} disabled={isSyncing} size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700">
              <Zap className="w-4 h-4" />
              {isSyncing ? 'Solicitando...' : 'Solicitar avaliação'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AutoSyncButton
