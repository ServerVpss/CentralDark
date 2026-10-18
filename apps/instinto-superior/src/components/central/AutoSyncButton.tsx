import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { lerStatusSync, executarSync } from '@/lib/sync.functions'

interface SyncStatus {
  timestamp: string | null
  status: 'idle' | 'syncing' | 'success' | 'failed' | 'conflict'
  human_readable: string
  target?: string
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
  const [microDeployMode, setMicroDeployMode] = useState<'main-only' | 'full'>('main-only')

  const getStatus = useServerFn(lerStatusSync)
  const runSync = useServerFn(executarSync)

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

  // #OBSERVACOES# MICRODEPLOY_GUARD_20261018
  // Auto Sync não comprova publicação, PID, health nem recibo de deploy.
  // Até existir um adapter autorizado com readback, não despachar como deploy.
  const handleMicroDeploy = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'failed',
      human_readable: `Micro-Deploy ${microDeployMode} BLOQUEADO: sem executor autorizado, receipt e health da VPS.`
    }))
  }

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'syncing': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'conflict': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'syncing': return 'bg-blue-50 border-blue-200'
      case 'failed': return 'bg-red-50 border-red-200'
      case 'conflict': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-3">
      <Card className={`p-4 border ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-semibold">Auto Sync: Casa / Main / VPS</p>
              <p className="text-xs text-gray-600">{syncStatus.human_readable}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleSync('windows')} disabled={isSyncing} size="sm" variant="outline">
              Windows
            </Button>
            <Button onClick={() => handleSync('main')} disabled={isSyncing} size="sm" variant="outline">
              Main
            </Button>
            <Button onClick={() => handleSync('vps')} disabled={isSyncing} size="sm" variant="outline">
              VPS
            </Button>
            <Button onClick={() => handleSync('all')} disabled={isSyncing} size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 border border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">Micro-Deploy: Instinto Superior + Auto Sync</p>
              <p className="text-xs text-amber-700">Sync Git não prova deploy. Publicação bloqueada até existir recibo do runtime.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={microDeployMode}
              onChange={(e) => setMicroDeployMode(e.target.value as 'main-only' | 'full')}
              disabled={isSyncing}
              className="px-2 py-1 text-xs border border-amber-300 rounded bg-white"
            >
              <option value="main-only">Main Only (rapido)</option>
              <option value="full">Full (Casa/VPS/Main)</option>
            </select>

            <Button onClick={handleMicroDeploy} disabled={isSyncing} size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700">
              <Zap className="w-4 h-4" />
              {isSyncing ? 'Deployando...' : 'Micro-Deploy Agora'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AutoSyncButton
