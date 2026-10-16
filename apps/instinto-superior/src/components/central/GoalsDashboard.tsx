import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { GOALS_REGISTRY, loadGoals, addGoal, updateGoalStatus, type Goal, type GoalStatus } from "@/data/goals-registry";

const STATUS_COLORS: Record<GoalStatus, string> = {
  pending: "text-amber-600 bg-amber-50",
  in_progress: "text-blue-600 bg-blue-50",
  in_testing: "text-purple-600 bg-purple-50",
  completed: "text-green-600 bg-green-50",
  blocked: "text-red-600 bg-red-50",
  unknown: "text-gray-600 bg-gray-50",
};

const STATUS_ICONS: Record<GoalStatus, JSX.Element> = {
  pending: <Clock className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4" />,
  in_testing: <AlertCircle className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  blocked: <AlertCircle className="h-4 w-4" />,
  unknown: <AlertCircle className="h-4 w-4" />,
};

export function GoalsDashboard() {
  const [registry, setRegistry] = useState(GOALS_REGISTRY);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<GoalStatus>("pending");

  useEffect(() => {
    const loaded = loadGoals();
    setRegistry(loaded);
  }, []);

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle,
      description: newGoalDesc || undefined,
      status: selectedStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner: "CHEFE",
      tags: ["cockpit", "goal"],
    };

    addGoal(newGoal);
    const updated = loadGoals();
    setRegistry(updated);
    setNewGoalTitle("");
    setNewGoalDesc("");
    setSelectedStatus("pending");
    setIsAddingGoal(false);
  };

  const handleStatusChange = (goalId: string, newStatus: GoalStatus) => {
    updateGoalStatus(goalId, newStatus);
    const updated = loadGoals();
    setRegistry(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header com Contadores */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">🎯 Goals Vigentes</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhamento de objetivos da CentralDark
            </p>
          </div>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="flex items-center gap-2 rounded-md bg-neon-blue/10 px-3 py-2 text-xs font-semibold text-neon-blue hover:bg-neon-blue/20 transition"
          >
            <Plus className="h-4 w-4" />
            Novo Goal
          </button>
        </div>

        {/* Métricas */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <div className="rounded-md bg-background/40 p-3">
            <span className="block font-mono text-muted-foreground">Total</span>
            <span className="block text-lg font-semibold text-foreground">
              {registry.total_count}
            </span>
          </div>
          <div className="rounded-md bg-blue-50/40 p-3">
            <span className="block font-mono text-muted-foreground">Em Progresso</span>
            <span className="block text-lg font-semibold text-blue-600">
              {registry.active_count}
            </span>
          </div>
          <div className="rounded-md bg-green-50/40 p-3">
            <span className="block font-mono text-muted-foreground">Completado</span>
            <span className="block text-lg font-semibold text-green-600">
              {registry.completed_count}
            </span>
          </div>
          <div className="rounded-md bg-red-50/40 p-3">
            <span className="block font-mono text-muted-foreground">Bloqueado</span>
            <span className="block text-lg font-semibold text-red-600">
              {registry.blocked_count}
            </span>
          </div>
        </div>
      </div>

      {/* Form Novo Goal */}
      {isAddingGoal && (
        <div className="rounded-lg border border-neon-blue/30 bg-neon-blue/5 p-4">
          <h4 className="font-semibold text-sm mb-3">Criar Novo Goal</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título do goal..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
            <textarea
              placeholder="Descrição (opcional)..."
              value={newGoalDesc}
              onChange={(e) => setNewGoalDesc(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue"
              rows={2}
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as GoalStatus)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue"
            >
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Progresso</option>
              <option value="in_testing">Em Testes</option>
              <option value="completed">Completado</option>
              <option value="blocked">Bloqueado</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                className="flex-1 rounded-md bg-neon-blue text-background px-3 py-2 text-xs font-semibold hover:bg-neon-blue/90 transition"
              >
                Salvar Goal
              </button>
              <button
                onClick={() => setIsAddingGoal(false)}
                className="flex-1 rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-semibold hover:bg-muted/30 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Goals */}
      <div className="space-y-3">
        {registry.goals.length === 0 ? (
          <div className="rounded-lg border border-border/60 bg-muted/10 p-6 text-center">
            <p className="text-xs text-muted-foreground">Nenhum goal criado ainda.</p>
          </div>
        ) : (
          registry.goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border border-border/60 bg-background/40 p-4 transition hover:bg-background/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-sm">{goal.title}</h5>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${STATUS_COLORS[goal.status]}`}>
                      {STATUS_ICONS[goal.status]}
                      {goal.status.replace("_", " ")}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground mb-2">{goal.description}</p>
                  )}
                  {goal.criteria && goal.criteria.length > 0 && (
                    <div className="text-xs mb-2">
                      <span className="font-mono text-muted-foreground">Critérios:</span>
                      <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                        {goal.criteria.slice(0, 2).map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                        {goal.criteria.length > 2 && (
                          <li>+{goal.criteria.length - 2} critérios...</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Owner: {goal.owner || "—"}</span>
                    <span>·</span>
                    <span>{new Date(goal.updated_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex flex-col gap-2">
                  <select
                    value={goal.status}
                    onChange={(e) => handleStatusChange(goal.id, e.target.value as GoalStatus)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="in_testing">Em Testes</option>
                    <option value="completed">Completado</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer com Status */}
      <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
        <p className="text-xs text-muted-foreground text-center">
          Última atualização: {new Date(registry.last_updated).toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
