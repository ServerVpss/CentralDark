import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap, ChevronDown, Bot, GitBranch, History, BookOpenText, ScrollText, ShieldAlert } from 'lucide-react'
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
export const AutoSyncButton: React.FC<{ onNavigate?: (aba: string) => void }> = ({ onNavigate }) => {
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
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onNavigate?.('hermes')} disabled={!onNavigate} className="border-sky-300/30 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white">🪬 Abrir Hermes</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onNavigate?.('recibos')} disabled={!onNavigate} className="border-sky-300/30 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white">🧾 Recibos</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onNavigate?.('dream-reviewer')} disabled={!onNavigate} className="border-sky-300/30 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white">📚 Biblioteca</Button>
      </div>
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
          </div>
        </div>
      </details>
      <p className="mt-3 text-[11px] text-slate-400">ℹ️ Este cartão reutiliza o status do Auto Sync. Não consulta sessões nem inventa progresso do Hermes; a verificação acontece nos setores existentes.</p>
    </section>
  )
}

export default AutoSyncButton
