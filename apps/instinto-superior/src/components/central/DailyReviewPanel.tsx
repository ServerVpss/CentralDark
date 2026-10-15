import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react'

interface SkillState {
  name: string
  state: 'MAIN_SYNCED' | 'RUNTIME_MIRRORED' | 'SKILL_LOADED' | 'CAPABILITY_PROVEN'
  lastSync: string
  owner: 'Casa' | 'VPS' | 'Main'
  priority: 'Essencial' | 'Importante' | 'Suporte'
}

interface DailyReview {
  date: string
  skillsSynced: number
  skillsLoaded: number
  skillsProven: number
  deltaPending: number
  conflictsResolved: number
  mailAlerts: number
  previousState: string
  currentState: string
  changes: string[]
}

/**
 * DailyReviewPanel — Revisões Diárias no Cockpit
 * Estado anterior vs estado atual
 * Sincronização de skills: MAIN_SYNCED → CAPABILITY_PROVEN
 * Conflitos + Notificações Gmail integradas
 */
export const DailyReviewPanel: React.FC = () => {
  const [review, setReview] = useState<DailyReview>({
    date: new Date().toISOString().split('T')[0],
    skillsSynced: 11,
    skillsLoaded: 8,
    skillsProven: 6,
    deltaPending: 2,
    conflictsResolved: 1,
    mailAlerts: 3,
    previousState: 'RUNNING:Casa+VPS online',
    currentState: 'RUNNING:Casa online, VPS syncing',
    changes: [
      'centraldark-boot: CAPABILITY_PROVEN ✓',
      'centraldark-operational-method: SKILL_LOADED ✓',
      'skill-synchronization: RUNTIME_MIRRORED ✓',
      'centraldark-autonomous-conflict-costura: MAIN_SYNCED ✓',
      'Gmail alerts: 3 conflitos auto-resolvidos',
      'Delta pending: 2 (reconciliar quando Casa+VPS online)'
    ]
  })

  const [skillStates, setSkillStates] = useState<SkillState[]>([
    {
      name: 'centraldark-boot',
      state: 'CAPABILITY_PROVEN',
      lastSync: new Date().toISOString(),
      owner: 'Main',
      priority: 'Essencial'
    },
    {
      name: 'centraldark-operational-method',
      state: 'SKILL_LOADED',
      lastSync: new Date().toISOString(),
      owner: 'VPS',
      priority: 'Essencial'
    },
    {
      name: 'skill-synchronization',
      state: 'RUNTIME_MIRRORED',
      lastSync: new Date().toISOString(),
      owner: 'VPS',
      priority: 'Essencial'
    },
    {
      name: 'centraldark-reuse-runtime',
      state: 'SKILL_LOADED',
      lastSync: new Date().toISOString(),
      owner: 'Casa',
      priority: 'Essencial'
    },
    {
      name: 'main-pinned-runtime-fast-path',
      state: 'MAIN_SYNCED',
      lastSync: new Date().toISOString(),
      owner: 'Main',
      priority: 'Essencial'
    }
  ])

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'CAPABILITY_PROVEN':
        return 'bg-green-100 text-green-800'
      case 'SKILL_LOADED':
        return 'bg-blue-100 text-blue-800'
      case 'RUNTIME_MIRRORED':
        return 'bg-cyan-100 text-cyan-800'
      case 'MAIN_SYNCED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'CAPABILITY_PROVEN':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'SKILL_LOADED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'RUNTIME_MIRRORED':
        return <Clock className="w-4 h-4 text-cyan-600" />
      case 'MAIN_SYNCED':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Daily Summary Card */}
      <Card className="p-4 border border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              📋 Revisão Diária — {review.date}
            </h3>
            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-300">
              {skillStates.length} skills mapeadas
            </span>
          </div>

          {/* Estado Anterior vs Atual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-1">Estado Anterior</p>
              <p className="text-sm font-mono text-slate-800">{review.previousState}</p>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-1">Estado Atual</p>
              <p className="text-sm font-mono text-slate-800">{review.currentState}</p>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <p className="text-lg font-bold text-green-700">{review.skillsProven}</p>
              <p className="text-xs text-green-600">Provadas</p>
            </div>
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-lg font-bold text-blue-700">{review.skillsLoaded}</p>
              <p className="text-xs text-blue-600">Carregadas</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-lg font-bold text-yellow-700">{review.deltaPending}</p>
              <p className="text-xs text-yellow-600">Deltas</p>
            </div>
          </div>

          {/* Mudanças */}
          <div className="p-3 bg-white rounded border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-2">Mudanças Compiladas</p>
            <ul className="space-y-1">
              {review.changes.map((change, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">▪</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-amber-50 rounded border border-amber-200">
              <p className="font-semibold text-amber-700">{review.conflictsResolved} Conflito(s)</p>
              <p className="text-amber-600">Auto-resolvido(s) via Git</p>
            </div>
            <div className="p-2 bg-purple-50 rounded border border-purple-200">
              <p className="font-semibold text-purple-700">{review.mailAlerts} Gmail Alert(s)</p>
              <p className="text-purple-600">Notificações integradas</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Skill State Progression */}
      <Card className="p-4 border border-slate-200">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">
            🔄 Progressão de Skills — MAIN_SYNCED → CAPABILITY_PROVEN
          </h4>

          <div className="space-y-2">
            {skillStates.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center gap-2 flex-1">
                  {getStateIcon(skill.state)}
                  <span className="text-xs font-mono text-slate-800 flex-1">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getStateColor(skill.state)}`}>
                    {skill.state}
                  </span>
                  <span className="text-xs text-slate-500 w-12 text-right">{skill.owner}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="pt-2 border-t border-slate-200 text-xs space-y-1 text-slate-600">
            <p>🟢 <strong>CAPABILITY_PROVEN</strong> — Skill testada e funcionando em produção</p>
            <p>🔵 <strong>SKILL_LOADED</strong> — Skill carregada no Hermes, pronta para usar</p>
            <p>🔷 <strong>RUNTIME_MIRRORED</strong> — Cópia sincronizada em ~/.hermes/skills/</p>
            <p>🟡 <strong>MAIN_SYNCED</strong> — Última versão sincronizada de main</p>
          </div>
        </div>
      </Card>

      {/* Forja Resilience Status */}
      <Card className="p-4 border border-emerald-200 bg-emerald-50">
        <p className="text-xs font-semibold text-emerald-700 mb-2">🛡️ Forja Resiliente</p>
        <ul className="space-y-1 text-xs text-emerald-700">
          <li>✓ Casa online, VPS online → Sincronização distribuída</li>
          <li>✓ Casa offline, VPS online → Hermes continua nos trabalhos independentes</li>
          <li>✓ Internet indisponível → Execução local com skills em cache</li>
          <li>✓ Reconexão → Reconciliar deltas sem sobrescrever divergências</li>
        </ul>
      </Card>
    </div>
  )
}

export default DailyReviewPanel
