/**
 * ClaudeTranscriptWatcher (sidecar) — port do _archive/electron-main/main/ClaudeTranscriptWatcher.ts.
 *
 * Observa ~/.claude/projects/<workspace-slug>/*.jsonl (transcripts emitidos pelos
 * panes Claude Code CLI), faz parse dos campos `usage` por turno do assistant e
 * grava no token_usage do messages.db do workspace — é o que faz o badge de custo /
 * XP do mascote refletir o burn real dos panes vivos.
 *
 * Diferença vs Electron: a gravação usa o DB node:sqlite do sidecar (db.ts
 * recordTokenUsage) em vez do bus better-sqlite3. O resto (slug, seed de offsets,
 * atribuição por pane, parse de usage) é fiel ao original. Gravamos telemetria de
 * tokens AQUI; a captura do session_id p/ --resume é forwarded via onSessionDetected
 * (o core grava cfg.claudeSessionId → panes.json → o restore consegue --resume).
 *
 * Slug: caminho absoluto com `/` → `-`, ex. `/tmp/x` → `-tmp-x`.
 */
import type { DatabaseSync } from 'node:sqlite';
/** Lookup: dado o slug do workspace (e o uuid da sessão, = filename do transcript), acha o
 *  paneId que originou aquela sessão (ou null). sessionId permite atribuição DETERMINÍSTICA
 *  quando o pane foi spawnado com `--session-id` ditado (F-001: sem isso, spawns paralelos no
 *  mesmo cwd caíam todos no "spawn mais recente"). */
export type PaneLookup = (input: {
    slug: string;
    firstSeenAt: number;
    sessionId?: string;
}) => string | null;
export declare class ClaudeTranscriptWatcher {
    private readonly dbForWorkspace;
    private readonly lookupPane;
    /** Disparado quando ≥1 linha de usage foi gravada (→ broadcast tokens:updated). */
    private readonly onRecorded;
    /** Roots extras de projetos (multi-conta Claude: <CLAUDE_CONFIG_DIR>/projects). */
    private readonly extraProjectsRoots;
    /** Disparado 1x/sessão quando o transcript (filename = uuid da sessão) resolve um
     *  pane vivo. O core grava cfg.claudeSessionId p/ o restore conseguir --resume. */
    private readonly onSessionDetected;
    private watchers;
    private watchedDirs;
    private pendingDirs;
    private offsets;
    private ingestTail;
    private sessionPane;
    private freshSessions;
    private slugToWorkspace;
    constructor(dbForWorkspace: (workspacePath: string) => DatabaseSync, lookupPane?: PaneLookup, 
    /** Disparado quando ≥1 linha de usage foi gravada (→ broadcast tokens:updated). */
    onRecorded?: () => void, 
    /** Roots extras de projetos (multi-conta Claude: <CLAUDE_CONFIG_DIR>/projects). */
    extraProjectsRoots?: () => string[], 
    /** Disparado 1x/sessão quando o transcript (filename = uuid da sessão) resolve um
     *  pane vivo. O core grava cfg.claudeSessionId p/ o restore conseguir --resume. */
    onSessionDetected?: (paneId: string, sessionId: string) => void);
    private pathToSlug;
    /** Começa a observar os transcripts de um workspace em todos os roots de conta. Idempotente.
     * configDir: o CLAUDE_CONFIG_DIR DESTE pane (multi-conta ou override de shell do usuário).
     * Sem ele a captura/telemetria ficaria cega a um config relocado ("configured elsewhere" bug):
     * o transcript vive em <CLAUDE_CONFIG_DIR>/projects/<slug>/, não em ~/.claude. */
    /** Marca uma sessão ditada no spawn como "fresca": o seed nunca pula o transcript dela.
     *  Chamar ANTES do start() do pane. */
    expectFreshSession(sessionId: string): void;
    start(workspacePath: string, configDir?: string): Promise<void>;
    private scheduleFreshCatchUp;
    private startRoot;
    private isTrackedTranscript;
    /** Serializa ingests do mesmo arquivo (F-019) — ver ingestTail acima. */
    private ingestFile;
    private doIngestFile;
    stop(): void;
}
//# sourceMappingURL=ClaudeTranscriptWatcher.d.ts.map