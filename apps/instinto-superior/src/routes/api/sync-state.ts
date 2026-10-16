import { json } from '@tanstack/react-start'

/**
 * API Route: /api/sync-state
 * Máquina de estado única para Forja Viva
 * Sincronização de skills + Conflitos + Notificações Gmail
 * MAIN_SYNCED → RUNTIME_MIRRORED → SKILL_LOADED → CAPABILITY_PROVEN
 */

interface SkillSync {
  name: string
  state: 'MAIN_SYNCED' | 'RUNTIME_MIRRORED' | 'SKILL_LOADED' | 'CAPABILITY_PROVEN'
  lastSync: string
  owner: 'Casa' | 'VPS' | 'Main'
  sha: string
}

interface ConflictAlert {
  id: string
  skill: string
  type: 'merge_conflict' | 'state_divergence' | 'dependency_mismatch'
  source: 'Git' | 'Gmail' | 'Manual'
  resolved: boolean
  resolvedAt?: string
  resolution: 'ours' | 'theirs' | 'manual'
}

interface MachineState {
  timestamp: string
  casa: 'online' | 'offline'
  vps: 'online' | 'offline'
  main: 'synced' | 'degraded' | 'offline'
  skillsTotal: number
  skillsSynced: number
  skillsLoaded: number
  skillsProven: number
  conflictsPending: number
  conflictsResolved: number
  mailAlertsToday: number
  deltasPending: number
  lastStateChange: string
  previousState: string
}

// Estado global (em produção seria no Redis/DB)
let machineState: MachineState = {
  timestamp: new Date().toISOString(),
  casa: 'online',
  vps: 'online',
  main: 'synced',
  skillsTotal: 11,
  skillsSynced: 11,
  skillsLoaded: 8,
  skillsProven: 6,
  conflictsPending: 0,
  conflictsResolved: 1,
  mailAlertsToday: 3,
  deltasPending: 2,
  lastStateChange: new Date().toISOString(),
  previousState: 'RUNNING:Casa+VPS online'
}

const skills: SkillSync[] = [
  {
    name: 'centraldark-boot',
    state: 'CAPABILITY_PROVEN',
    lastSync: new Date().toISOString(),
    owner: 'Main',
    sha: 'a620cf258f'
  },
  {
    name: 'centraldark-operational-method',
    state: 'SKILL_LOADED',
    lastSync: new Date().toISOString(),
    owner: 'VPS',
    sha: 'a620cf258f'
  },
  {
    name: 'skill-synchronization',
    state: 'RUNTIME_MIRRORED',
    lastSync: new Date().toISOString(),
    owner: 'VPS',
    sha: 'a620cf258f'
  }
]

const conflicts: ConflictAlert[] = [
  {
    id: 'CONF-001',
    skill: 'centraldark-autonomous-conflict-costura',
    type: 'merge_conflict',
    source: 'Gmail',
    resolved: true,
    resolvedAt: new Date(Date.now() - 3600000).toISOString(),
    resolution: 'ours'
  }
]

/**
 * GET /api/sync-state
 * Retorna estado atual da máquina de estado
 */
export async function GET() {
  try {
    return json({
      machineState,
      skills: skills.slice(0, 5),
      conflicts: conflicts.filter(c => c.resolved),
      operationalStatus: {
        casa: machineState.casa,
        vps: machineState.vps,
        main: machineState.main,
        resilience: calculateResilience(machineState)
      }
    })
  } catch (error) {
    console.error('[SYNC-STATE] Erro ao ler estado:', error)
    return json({ error: 'Erro ao ler estado da máquina' }, { status: 500 })
  }
}

/**
 * POST /api/sync-state
 * Atualiza estado + sincroniza skills + resolve conflitos
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action: 'sync_skill' | 'resolve_conflict' | 'update_location_status'
      skillName?: string
      targetState?: string
      conflictId?: string
      newStatus?: 'online' | 'offline'
      location?: 'casa' | 'vps' | 'main'
    }

    const { action, skillName, targetState, conflictId, newStatus, location } = body

    if (action === 'sync_skill' && skillName && targetState) {
      // Sincronizar skill para novo estado
      const skill = skills.find(s => s.name === skillName)
      if (skill && isValidStateTransition(skill.state, targetState)) {
        skill.state = targetState as any
        skill.lastSync = new Date().toISOString()

        if (targetState === 'CAPABILITY_PROVEN') {
          machineState.skillsProven++
        }

        return json({
          success: true,
          message: `Skill ${skillName} sincronizada para ${targetState}`,
          newState: skill
        })
      }
    }

    if (action === 'resolve_conflict' && conflictId) {
      // Resolver conflito
      const conflict = conflicts.find(c => c.id === conflictId)
      if (conflict) {
        conflict.resolved = true
        conflict.resolvedAt = new Date().toISOString()
        machineState.conflictsResolved++

        return json({
          success: true,
          message: `Conflito ${conflictId} resolvido`,
          conflict
        })
      }
    }

    if (action === 'update_location_status' && location && newStatus) {
      // Atualizar status de locação (Casa/VPS/Main)
      const previousState = machineState.previousState
      machineState[location as keyof MachineState] = newStatus
      machineState.previousState = previousState
      machineState.lastStateChange = new Date().toISOString()

      // Calcular resiliência
      const resilience = calculateResilience(machineState)

      return json({
        success: true,
        message: `Status de ${location} atualizado para ${newStatus}`,
        resilience,
        machineState
      })
    }

    return json({ error: 'Ação inválida ou incompleta' }, { status: 400 })
  } catch (error) {
    console.error('[SYNC-STATE] Erro ao processar sync:', error)
    return json({ error: 'Erro ao processar sincronização' }, { status: 500 })
  }
}

/**
 * Validar transição de estado de skill
 * MAIN_SYNCED → RUNTIME_MIRRORED → SKILL_LOADED → CAPABILITY_PROVEN
 */
function isValidStateTransition(current: string, target: string): boolean {
  const transitions: Record<string, string[]> = {
    'MAIN_SYNCED': ['RUNTIME_MIRRORED'],
    'RUNTIME_MIRRORED': ['SKILL_LOADED'],
    'SKILL_LOADED': ['CAPABILITY_PROVEN'],
    'CAPABILITY_PROVEN': [] // Terminal state
  }

  return transitions[current]?.includes(target) ?? false
}

/**
 * Calcular resiliência da Forja
 */
function calculateResilience(state: MachineState): {
  level: 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  canContinue: boolean
} {
  const { casa, vps, main } = state

  if (casa === 'online' && vps === 'online' && main === 'synced') {
    return {
      level: 'HIGH',
      description: 'Casa + VPS + Main online — Sincronização distribuída',
      canContinue: true
    }
  }

  if (vps === 'online' && main === 'synced') {
    return {
      level: 'MEDIUM',
      description: 'VPS online (Casa offline) — Hermes continua trabalhos independentes',
      canContinue: true
    }
  }

  if (casa === 'online') {
    return {
      level: 'MEDIUM',
      description: 'Casa online com cache local — Execução offline possível',
      canContinue: true
    }
  }

  return {
    level: 'LOW',
    description: 'Aguardando reconexão para reconciliar deltas',
    canContinue: false
  }
}

export { POST as sync, GET as status }
