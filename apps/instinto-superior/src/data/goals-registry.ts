// Goals Registry — Painel vivo de objetivos da CentralDark
// Owner: Instinto Superior
// Persistência: localStorage + IndexedDB
// Função: Rastrear, exibir e correlacionar goals

export type GoalStatus = "pending" | "in_progress" | "in_testing" | "completed" | "blocked" | "unknown";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  owner?: string;
  tags?: string[];
  criteria?: string[];
  evidence?: string[];
  next_cursor?: string;
}

export interface GoalsRegistry {
  total_count: number;
  active_count: number;
  completed_count: number;
  blocked_count: number;
  goals: Goal[];
  last_updated: string;
}

// Goals Vigentes
export const GOALS_REGISTRY: GoalsRegistry = {
  total_count: 1,
  active_count: 1,
  completed_count: 0,
  blocked_count: 0,
  last_updated: new Date().toISOString(),
  goals: [
    {
      id: "goal-001",
      title: "Painel Vivo dos Agentes",
      description: "Dashboard com perfis, fotos, rankings 5/15/20/30 dias, uso real, sugestões de melhoria. Integrado no Instinto Superior.",
      status: "in_progress",
      created_at: "2026-10-15T19:15:00Z",
      updated_at: new Date().toISOString(),
      owner: "SOL_EXECUTORA",
      tags: ["cockpit", "agents", "dashboard", "live-data"],
      criteria: [
        "Perfis de agentes com fotos",
        "Rankings de 5/15/20/30 dias",
        "Uso real (capacidades ativadas)",
        "Sugestões de melhoria",
        "Reutilizar DesignCenter + SistemaCentralDark"
      ],
      evidence: [
        "HERMES-SECTOR-MAP.json mapeado (20 módulos)",
        "MapaOwners.tsx evoluído com arquitetura mental",
        "Cockpit Shell com 7 abas funcionais"
      ],
      next_cursor: "Refinar critérios técnicos + implementar dashboard"
    }
  ]
};

// Função para adicionar goal
export function addGoal(goal: Goal): void {
  GOALS_REGISTRY.goals.push(goal);
  GOALS_REGISTRY.total_count += 1;
  updateGoalCounts();
  persistGoals();
}

// Função para atualizar status
export function updateGoalStatus(goalId: string, status: GoalStatus): void {
  const goal = GOALS_REGISTRY.goals.find(g => g.id === goalId);
  if (goal) {
    goal.status = status;
    goal.updated_at = new Date().toISOString();
    updateGoalCounts();
    persistGoals();
  }
}

// Recalcular contadores
function updateGoalCounts(): void {
  GOALS_REGISTRY.active_count = GOALS_REGISTRY.goals.filter(g => g.status === "in_progress" || g.status === "pending").length;
  GOALS_REGISTRY.completed_count = GOALS_REGISTRY.goals.filter(g => g.status === "completed").length;
  GOALS_REGISTRY.blocked_count = GOALS_REGISTRY.goals.filter(g => g.status === "blocked").length;
  GOALS_REGISTRY.last_updated = new Date().toISOString();
}

// Persistência (localStorage)
function persistGoals(): void {
  try {
    localStorage.setItem("centraldark_goals_registry", JSON.stringify(GOALS_REGISTRY));
  } catch (e) {
    console.warn("Falha ao persistir goals registry:", e);
  }
}

// Recuperar goals
export function loadGoals(): GoalsRegistry {
  try {
    const stored = localStorage.getItem("centraldark_goals_registry");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Falha ao carregar goals registry:", e);
  }
  return GOALS_REGISTRY;
}

export default GOALS_REGISTRY;
