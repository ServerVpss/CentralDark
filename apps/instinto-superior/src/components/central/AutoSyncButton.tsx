import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface SyncStatus {
  timestamp: string | null
  status: 'idle' | 'syncing' | 'success' | 'failed' | 'conflict'
  human_readable: string
}

/**
 * AutoSyncButton — Cockpit Control for Bidirectional Sync
 * Windows ↔ Main Repo ↔ VPS (continuous, single-writer Hermes)
 */
export const AutoSyncButton: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    timestamp: null,
    status: 'idle',
    human_readable: 'Nunca sincronizado'
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncTarget, setSyncTarget] = useState<'all' | 'windows' | 'main' | 'vps'>('all')

  // Fetch status on mount
  useEffect(() => {
    fetchSyncStatus()
    // Poll every 30s
    const interval = setInterval(fetchSyncStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/auto-sync/status')
      if (response.ok) {
        const data: SyncStatus = await response.json()
        setSyncStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/auto-sync/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: syncTarget })
      })

      if (response.ok) {
        const data: SyncStatus = await response.json()
        setSyncStatus(data)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus(prev => ({
        ...prev,
        status: 'failed'
      }))
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'conflict':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'syncing':
        return 'bg-blue-50 border-blue-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      case 'conflict':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className={`p-4 border ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-semibold">Auto Sync: Casa ↔ Main ↔ VPS</p>
            <p className="text-xs text-gray-600">{syncStatus.human_readable}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={syncTarget}
            onChange={(e) => setSyncTarget(e.target.value as any)}
            disabled={isSyncing}
            className="px-2 py-1 text-xs border rounded"
          >
            <option value="all">Sincronizar Tudo</option>
            <option value="windows">Windows → Main</option>
            <option value="main">Main ← origin/main</option>
            <option value="vps">Main → VPS</option>
          </select>

          <Button
            onClick={handleSync}
            disabled={isSyncing || syncStatus.status === 'syncing'}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default AutoSyncButton
