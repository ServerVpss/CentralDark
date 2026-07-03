// apps/modulos/hub/src/components/catalog/CatalogTab.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Tool {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  version: string
  is_deprecated: boolean
}

interface SyncRun {
  id: string
  status: string
  started_at: string
  finished_at: string
  tools_found: number
  tools_added: number
  tools_updated: number
}

export const CatalogTab: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([])
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([])
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTools()
    loadSyncRuns()
  }, [])

  const loadTools = async () => {
    const { data } = await supabase
      .from('catalog.tools')
      .select('*')
      .order('name')
    if (data) setTools(data)
  }

  const loadSyncRuns = async () => {
    const { data } = await supabase
      .from('catalog.sync_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5)
    if (data) setSyncRuns(data)
  }

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-sync`,
        { method: 'POST' }
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      await loadTools()
      await loadSyncRuns()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Catálogo MCP</h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {syncRuns.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Últimas Sincronizações</h3>
          <div className="space-y-2">
            {syncRuns.map(run => (
              <div key={run.id} className="bg-gray-100 p-2 rounded text-sm">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  run.status === 'completed' ? 'bg-green-500' :
                  run.status === 'running' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {run.status} — {run.tools_found} ferramentas encontradas
                ({run.tools_added} novas, {run.tools_updated} atualizadas)
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {tools.map(tool => (
          <div key={tool.id} className="border rounded p-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
              <div className="flex gap-2">
                {tool.category && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {tool.category}
                  </span>
                )}
                {tool.is_deprecated && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    Deprecated
                  </span>
                )}
                {tool.version && (
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                    v{tool.version}
                  </span>
                )}
              </div>
            </div>
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {tool.tags.map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
