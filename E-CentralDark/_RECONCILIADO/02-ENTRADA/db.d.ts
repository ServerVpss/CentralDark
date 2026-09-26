/**
 * db.ts — Camada de banco de dados do sidecar usando node:sqlite (Node 22.12+, built-in).
 *
 * Responsabilidades:
 * - Abrir e cachear DatabaseSync por workspace path (messages.db em <ws>/.overclock-app/).
 * - Rodar as migrations de token_usage + activity_log_v2 (portadas do packages/bus/src/migrator.ts).
 * - Funções de query para aggregateTokensByTask/ByPane/ByWorkspace e listActivityLog.
 *
 * node:sqlite emite ExperimentalWarning — esperado.
 * Deps: nenhuma (node:sqlite é built-in do Node 22.12+).
 */
import { DatabaseSync } from 'node:sqlite';
export interface TokenAggregate {
    input: number;
    output: number;
    cache_read: number;
    cache_write: number;
    cost_usd: number;
}
export interface WorkspaceTokenRow {
    model: string;
    input: number;
    output: number;
    cost_usd: number;
}
export type LogCategory = 'pilot' | 'pane' | 'file' | 'cost' | 'error' | 'system';
export type LogLevel = 'info' | 'success' | 'warn' | 'error';
export interface LogEntry {
    id: number;
    ts: number;
    category: LogCategory;
    level: LogLevel;
    activity_id: string | null;
    subtask_id: string | null;
    message: string;
    metadata: Record<string, unknown> | null;
}
/** Fecha handles ociosos há mais de IDLE_TTL_MS. `nowMs` injetável p/ teste. */
export declare function sweepIdleWorkspaceDbs(nowMs?: number): void;
/** Fecha todos os handles do pool (shutdown/teste). */
export declare function closeAllWorkspaceDbs(): void;
/** Handles abertos no pool (instrumentação/teste). */
export declare function openWorkspaceDbCount(): number;
/**
 * Abre (e mantém no pool LRU/TTL) o DatabaseSync de
 * <workspacePath>/.overclock-app/messages.db e roda as migrations de
 * token_usage + activity_log_v2.
 *
 * Idempotente enquanto o handle vive no pool; handle evictado (LRU/TTL) é
 * reaberto transparentemente na próxima chamada.
 */
export declare function getWorkspaceDb(workspacePath: string): DatabaseSync;
export declare function aggregateTokensByTask(db: DatabaseSync, taskId: string): TokenAggregate;
/**
 * Agrega tokens por pane (agent_name = `pane:<paneId>`, espelha TokenUsage.aggregateByPane do bus).
 * NOTA (C-037): o badge do pane usa aggregateTokensBySession (fonte única por sessão) — este por-pane
 * soma TODAS as vidas do id e por isso herdava extrato de pane morto homônimo (F-013). Mantido para
 * agregações que ainda chaveiam por agent_name.
 */
export declare function aggregateTokensByPane(db: DatabaseSync, paneId: string): TokenAggregate;
/**
 * Agrega tokens por SESSÃO (C-037: fonte única do badge). session_id = a sessão atual do pane
 * (claudeSessionId / session.id). Sub-agentes de workflow herdam o session_id do pai, então o
 * burn do workflow soma na sessão que o disparou. Pane com id reusado nasce zerado porque a
 * sessão é outra → F-013 morto por construção.
 */
export declare function aggregateTokensBySession(db: DatabaseSync, sessionId: string): TokenAggregate;
/**
 * Agrega tokens por workspace desde sinceMs (ms), agrupado por model
 * (espelha TokenUsage.aggregateByWorkspace do bus).
 */
export declare function aggregateTokensByWorkspace(db: DatabaseSync, sinceMs: number): WorkspaceTokenRow[];
export interface TokenUsageInsert {
    model: string;
    session_id: string;
    task_id?: string | null;
    agent_name?: string | null;
    /** Chave de dedup (message.id do transcript). Mesmo (session_id, message_id) faz upsert do
     *  ÚLTIMO snapshot — o CLI regrava a mesma mensagem por content block no streaming. NULL
     *  (codex / callers legados) fica fora do índice UNIQUE → insere normal. */
    message_id?: string | null;
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens?: number;
    /** Balde legado (single-bucket). Callers novos usam o split 5m/1h; codex passa 0. */
    cache_write_tokens?: number;
    cache_write_5m_tokens?: number;
    cache_write_1h_tokens?: number;
}
/**
 * Insere/atualiza uma linha de token_usage (cost_usd auto-calculado, preço de tabela).
 * Upsert por (session_id, message_id): o último snapshot vence (dedup do streaming, T-008).
 * created_at em ms.
 */
export declare function recordTokenUsage(db: DatabaseSync, entry: TokenUsageInsert): void;
/**
 * Lista entradas do activity_log_v2 com filtros opcionais.
 * Newest-first, espelha ActivityLog.list() do bus.
 */
export declare function listActivityLog(db: DatabaseSync, opts?: {
    limit?: number;
    activityId?: string;
    category?: string;
    sinceMs?: number;
}): LogEntry[];
//# sourceMappingURL=db.d.ts.map