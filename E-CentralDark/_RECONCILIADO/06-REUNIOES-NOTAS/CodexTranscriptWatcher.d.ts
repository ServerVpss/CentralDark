/**
 * CodexTranscriptWatcher (sidecar) — análogo do ClaudeTranscriptWatcher para o Codex CLI.
 *
 * O Codex grava rollouts em ~/.codex/sessions/YYYY/MM/DD/rollout-<ts>-<uuid>.jsonl
 * (um arquivo por sessão, organizado por DATA — NÃO por workspace slug como o Claude).
 * Cada turno emite um evento `type:"event_msg"` com `payload.type:"token_count"`, cujo
 * `payload.info.last_token_usage` traz o burn DAQUELE turno (o `total_token_usage` é
 * acumulado — usamos o LAST p/ não dobrar). O cwd da sessão vem do `session_meta` (topo
 * do arquivo) e o modelo do `turn_context`.
 *
 * Diferença estrutural vs Claude: como os arquivos não vivem sob o slug do workspace,
 * observamos o ROOT global de sessões UMA vez e resolvemos workspace+pane por arquivo
 * (cwd lido do session_meta → slug → lookupPane). O resto (offsets em bytes, seed que
 * pula histórico, atribuição 1x/sessão, gravação via recordTokenUsage) espelha o Claude.
 *
 * Mapa de campos Codex → schema token_usage:
 *   input_tokens − cached_input_tokens → input (fresco)
 *   cached_input_tokens               → cache_read
 *   output_tokens                     → output   (já inclui reasoning_output_tokens)
 *   (sem equivalente)                 → cache_write = 0
 */
import type { DatabaseSync } from 'node:sqlite';
/** Lookup: dado o cwd da sessão, acha o paneId codex que a originou (ou null). */
export type CodexPaneLookup = (input: {
    cwd: string;
    firstSeenAt: number;
}) => string | null;
export declare class CodexTranscriptWatcher {
    private readonly dbForWorkspace;
    private readonly lookupPane;
    /** Disparado quando ≥1 linha de usage foi gravada (→ broadcast tokens:updated). */
    private readonly onRecorded;
    /** Roots de sessões (multi-conta: cada CODEX_HOME tem seu sessions/). Default = ~/.codex/sessions. */
    private readonly sessionsRoots;
    /** Disparado 1x/sessão quando um rollout (uuid no filename) resolve um pane codex vivo.
     *  O core grava cfg.session p/ o restore conseguir `codex resume <id>` em vez de cold-boot. */
    private readonly onSessionDetected;
    private watchers;
    private watchedRoots;
    private pendingRoots;
    private offsets;
    private meta;
    constructor(dbForWorkspace: (workspacePath: string) => DatabaseSync, lookupPane?: CodexPaneLookup, 
    /** Disparado quando ≥1 linha de usage foi gravada (→ broadcast tokens:updated). */
    onRecorded?: () => void, 
    /** Roots de sessões (multi-conta: cada CODEX_HOME tem seu sessions/). Default = ~/.codex/sessions. */
    sessionsRoots?: () => string[], 
    /** Disparado 1x/sessão quando um rollout (uuid no filename) resolve um pane codex vivo.
     *  O core grava cfg.session p/ o restore conseguir `codex resume <id>` em vez de cold-boot. */
    onSessionDetected?: (paneId: string, sessionId: string) => void);
    /** Começa a observar os rollouts do Codex em todos os roots de conta. Idempotente. */
    start(): Promise<void>;
    private startRoot;
    /** Lê o head do arquivo (≤64KB) p/ extrair cwd (session_meta) e modelo (turn_context). */
    private readHeadMeta;
    private ingestFile;
    stop(): void;
}
//# sourceMappingURL=CodexTranscriptWatcher.d.ts.map