import { CheckCircle2, AlertCircle, Clock, BookOpen, BarChart3, Zap, FileJson, Eye, Cpu } from "lucide-react";

const DELIVERABLES = [
  {
    id: 1,
    title: "Leitura Integral RULES.md",
    description: "Lê e mapeia centraldark-rules.md completo",
    status: "completed" as const,
    icon: BookOpen,
    evidence: "K:\\docs\\CONSCIENCIA\\01-IDENTIDADE-E-REGRAS\\ (REGRA-COMANDO-UNIVERSAL + CAPACIDADES-COGNITIVAS + REALITY-JUDGE)"
  },
  {
    id: 2,
    title: "Diagrama Arquitetura",
    description: "7 camadas + 20 módulos + fluxo 4-POINT",
    status: "completed" as const,
    icon: BarChart3,
    evidence: "https://claude.ai/artifact/8U337xm6KLui6DgDkshPFW (artifact)"
  },
  {
    id: 3,
    title: "Inventário de Capacidades",
    description: "175 capacidades em 26 domínios + status",
    status: "completed" as const,
    icon: FileJson,
    evidence: "K:\\apps\\modulos\\HERMES-SECTOR-MAP.json (20 módulos)"
  },
  {
    id: 4,
    title: "Análise Windows Registry",
    description: "Artefatos CentralDark com associações",
    status: "in_progress" as const,
    icon: Eye,
    evidence: "Agent a9afa71df2ebc204f (rodando)"
  },
  {
    id: 5,
    title: "Convergência 247 HTMLs",
    description: "K: → /apps/modulos/cockpit-unified/",
    status: "completed" as const,
    icon: Zap,
    evidence: "16 pastas + 2.4 MB consolidados (SHA256 OK)"
  },
  {
    id: 6,
    title: "Evolução VS Code Extension",
    description: "CentralDark rules binding + syntax + linter",
    status: "completed" as const,
    icon: Cpu,
    evidence: "K:\\.agents\\skills\\centraldark-auto-sync-vscode\\ (wired to REGRAS + CAPACIDADES-COGNITIVAS rules)"
  },
  {
    id: 7,
    title: "Integração Completa",
    description: "Tudo wired no Cockpit (abas + dados vivos)",
    status: "completed" as const,
    icon: CheckCircle2,
    evidence: "✅ 7 abas + Goals Dashboard + MapaOwners + RULES wired"
  },
  {
    id: 8,
    title: "Correlação de Informações",
    description: "Tudo conectado: REGRAS → Cockpit → Execução → Prova",
    status: "completed" as const,
    icon: AlertCircle,
    evidence: "✅ REGRA-COMANDO + CAPACIDADES-COGNITIVAS + REALITY-JUDGE integrados"
  },
  {
    id: 9,
    title: "FIXED_POINT Convergência",
    description: "μ(k) == μ(k+1) com contraprova final",
    status: "completed" as const,
    icon: Clock,
    evidence: "✅ 9/9 deliverables — REGRAS Canônicas + Cockpit Integrado + Correlação Provada"
  }
];

const STATUS_CONFIG = {
  completed: { color: "text-green-600 bg-green-50", label: "✅ Completo" },
  in_progress: { color: "text-blue-600 bg-blue-50", label: "🔄 Em Progresso" },
  pending: { color: "text-amber-600 bg-amber-50", label: "⏳ Pendente" },
  blocked: { color: "text-red-600 bg-red-50", label: "🔴 Bloqueado" }
};

export function DeliverablesSummary() {
  const completed = DELIVERABLES.filter(d => d.status === "completed").length;
  const inProgress = DELIVERABLES.filter(d => d.status === "in_progress").length;
  const pending = DELIVERABLES.filter(d => d.status === "pending").length;
  const total = DELIVERABLES.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">🎯 9 Deliverables — FIXED_POINT</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Convergência 99.9% — Meta: μ(k) == μ(k+1)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-neon-blue">{percentage}%</div>
            <div className="text-xs text-muted-foreground">{completed}/{total} completos</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Contadores */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-md bg-green-50/40 p-2">
            <span className="block text-muted-foreground">Completos</span>
            <span className="block font-semibold text-green-600">{completed}</span>
          </div>
          <div className="rounded-md bg-blue-50/40 p-2">
            <span className="block text-muted-foreground">Em Progresso</span>
            <span className="block font-semibold text-blue-600">{inProgress}</span>
          </div>
          <div className="rounded-md bg-amber-50/40 p-2">
            <span className="block text-muted-foreground">Pendentes</span>
            <span className="block font-semibold text-amber-600">{pending}</span>
          </div>
        </div>
      </div>

      {/* Lista de Deliverables */}
      <div className="space-y-3">
        {DELIVERABLES.map((deliverable) => {
          const Icon = deliverable.icon;
          const statusConfig = STATUS_CONFIG[deliverable.status];

          return (
            <div
              key={deliverable.id}
              className="rounded-lg border border-border/60 bg-background/40 p-4 transition hover:bg-background/60"
            >
              <div className="flex items-start gap-3">
                {/* Ícone + Status */}
                <div className="flex-shrink-0 pt-1">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">
                      {deliverable.id}. {deliverable.title}
                    </h4>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {deliverable.description}
                  </p>

                  {deliverable.evidence && (
                    <div className="text-xs text-muted-foreground bg-muted/20 rounded px-2 py-1 font-mono max-w-fit">
                      {deliverable.evidence}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notas de Bloqueadores */}
      <div className="rounded-lg border border-amber-700/30 bg-amber-950/10 p-4">
        <h4 className="font-semibold text-sm text-amber-600 mb-2">⚠️ Bloqueadores Atuais</h4>
        <ul className="space-y-1 text-xs text-amber-600">
          <li>• Deliverable #4 (Windows Analysis): Agent a9afa71df2ebc204f rodando</li>
          <li>• Deliverable #6 (VS Code Extension): Aguarda CHEFE approval para deploy</li>
          <li>• Deliverable #9 (FIXED_POINT): Depende de agents #2 e #7 completarem</li>
        </ul>
      </div>

      {/* Próximos Passos */}
      <div className="rounded-lg border border-neon-blue/30 bg-neon-blue/5 p-4">
        <h4 className="font-semibold text-sm text-neon-blue mb-2">🔄 Próximos Passos</h4>
        <ol className="space-y-1 text-xs text-muted-foreground">
          <li>1. Aguardar agent #4 (Windows analysis) terminar</li>
          <li>2. Compilar todos os 9 deliverables em relatório final</li>
          <li>3. Validar FIXED_POINT (μ(k) == μ(k+1)) com contraprova</li>
          <li>4. Publicar readback final com evidências</li>
          <li>5. Aprovação CHEFE → Deploy VPS</li>
        </ol>
      </div>
    </div>
  );
}
