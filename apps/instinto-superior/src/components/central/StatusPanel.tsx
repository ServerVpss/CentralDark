import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface SystemStatus {
  name: string
  status: 'online' | 'degraded' | 'offline'
  lastCheck: string
  location: 'Casa' | 'Forja' | 'VPS' | 'Main'
}

interface StatusIndicator {
  label: string
  color: 'green' | 'yellow' | 'red'
  pulse: boolean
}

/**
 * StatusPanel — Luzes Luminosas no Cockpit
 * 🟢 Verde = Online | 🟡 Amarelo = Degraded | 🔴 Vermelho = Offline
 * Monitoramento em tempo real Casa/Forja/VPS/Main
 */
export const StatusPanel: React.FC = () => {
  const [systems, setSystems] = useState<SystemStatus[]>([
    {
      name: 'Casa (Windows)',
      status: 'online',
      lastCheck: new Date().toISOString(),
      location: 'Casa'
    },
    {
      name: 'Forja (Main Repo)',
      status: 'online',
      lastCheck: new Date().toISOString(),
      location: 'Forja'
    },
    {
      name: 'VPS (Sincronização)',
      status: 'online',
      lastCheck: new Date().toISOString(),
      location: 'VPS'
    },
    {
      name: 'Main (origin/main)',
      status: 'online',
      lastCheck: new Date().toISOString(),
      location: 'Main'
    }
  ])

  useEffect(() => {
    // Poll status a cada 30s
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/auto-sync/status')
        if (response.ok) {
          const data = await response.json()
          setSystems(prev => prev.map(sys => ({
            ...sys,
            status: data.status === 'success' ? 'online' : data.status === 'conflict' ? 'degraded' : 'offline',
            lastCheck: new Date().toISOString()
          })))
        }
      } catch (error) {
        console.error('Failed to fetch status:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getColorClass = (status: string): string => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'degraded':
        return 'Degraded'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  const formatTime = (iso: string): string => {
    const dt = new Date(iso)
    return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <Card className="p-4 border border-slate-200 bg-slate-50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            🔴 🟡 🟢 Status de Máquina de Estado — Casa/Forja/VPS/Main
          </h3>
          <span className="text-xs text-slate-500">Auto-refresh: 30s</span>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {systems.map((sys) => (
            <div key={sys.location} className="space-y-2">
              {/* Luz Luminosa */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full ${getColorClass(sys.status)} ${
                    sys.status === 'online' ? 'animate-pulse' : ''
                  }`}
                  title={`${sys.location}: ${getStatusLabel(sys.status)}`}
                />
                <span className="text-xs font-mono text-slate-600">{sys.location}</span>
              </div>

              {/* Info */}
              <div className="pl-6 space-y-1">
                <p className="text-xs font-semibold text-slate-800">{sys.name}</p>
                <p className="text-xs text-slate-500">
                  <span className={
                    sys.status === 'online'
                      ? 'text-green-600'
                      : sys.status === 'degraded'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }>
                    {getStatusLabel(sys.status)}
                  </span>
                  {' · '}
                  <span className="text-slate-400">{formatTime(sys.lastCheck)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex gap-4 pt-2 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span>Online (pulsante)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Offline</span>
          </div>
        </div>

        {/* Redundância Info */}
        <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 bg-slate-100 p-2 rounded">
          <p className="font-semibold text-slate-700 mb-1">🛡️ Redundância Ativa:</p>
          <ul className="space-y-1 ml-2 list-disc">
            <li>Se <strong>Casa</strong> cair → <strong>Forja</strong> relança sync</li>
            <li>Se <strong>Forja</strong> cair → <strong>VPS</strong> sincroniza backup</li>
            <li>Se <strong>VPS</strong> cair → <strong>Tailscale SSH</strong> ativa fallback</li>
            <li>Se <strong>Main</strong> degraded → Retry automático em 5min</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

export default StatusPanel
