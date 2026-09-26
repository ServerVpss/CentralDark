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
// node:sqlite usa DatabaseSync (API síncrona).
// @ts-ignore — built-in Node 22.12+; sem @types/node:sqlite ainda.
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
// ---------------------------------------------------------------------------
// Migrations (portadas de packages/bus/src/migrator.ts, migration id 3 + id 8)
// Apenas as tabelas token_usage e activity_log_v2 — o resto (tasks, agents,
// messages, catalog_items, etc.) não é usado pelo sidecar; mantemos o schema
// mínimo para não gerar lock contention no messages.db compartilhado.
// ---------------------------------------------------------------------------
function runMigrations(db) {
    // user_version como mecanismo de versão (idêntico ao bus/migrator).
    const v = db.prepare('PRAGMA user_version').get().user_version ?? 0;
    // Migration 1 (equivale ao id=3 do bus): token_usage + activity_log (v1, não usada aqui)
    // + activity_log_v2 (id=8 do bus). Juntamos em 1 passo idempotente — o sidecar só lê,
    // não escreve; criar as tabelas com IF NOT EXISTS é seguro mesmo se já existirem.
    if (v < 1) {
        db.exec(`
      CREATE TABLE IF NOT EXISTS token_usage (
        id                 INTEGER PRIMARY KEY AUTOINCREMENT,
        model              TEXT    NOT NULL,
        session_id         TEXT    NOT NULL,
        task_id            TEXT,
        agent_name         TEXT,
        input_tokens       INTEGER NOT NULL DEFAULT 0,
        output_tokens      INTEGER NOT NULL DEFAULT 0,
        cache_read_tokens  INTEGER DEFAULT 0,
        cache_write_tokens INTEGER DEFAULT 0,
        cost_usd           REAL,
        created_at         INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX IF NOT EXISTS idx_token_usage_task    ON token_usage(task_id);
      CREATE INDEX IF NOT EXISTS idx_token_usage_session ON token_usage(session_id);

      CREATE TABLE IF NOT EXISTS activity_log_v2 (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        ts          INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        category    TEXT    NOT NULL,
        level       TEXT    NOT NULL,
        activity_id TEXT,
        subtask_id  TEXT,
        message     TEXT    NOT NULL,
        metadata    TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_act_log_v2_ts       ON activity_log_v2(ts DESC);
      CREATE INDEX IF NOT EXISTS idx_act_log_v2_activity ON activity_log_v2(activity_id, ts DESC);
      CREATE INDEX IF NOT EXISTS idx_act_log_v2_category ON activity_log_v2(category, ts DESC);
    `);
        db.exec('PRAGMA user_version = 1');
    }
    // Migration 2 (C-037): telemetria por SESSÃO + algoritmo T-008.
    //  - message_id: dedup do streaming (o CLI regrava a MESMA mensagem N vezes por content
    //    block; sem dedup a soma infla ~2×). UNIQUE(session_id, message_id) → upsert do ÚLTIMO
    //    snapshot. message_id NULL (codex / rows legadas) fica fora do índice (NULLs distintos).
    //  - cache_write_5m_tokens / cache_write_1h_tokens: split por TTL. O CLI Claude usa TTL 1h
    //    (2× input) — sem o split o balde mais caro (75% da fatura real) fica subcontado. A coluna
    //    legada cache_write_tokens fica pra rows antigas; rows novas gravam só o split (zero na
    //    legada) → a agregação soma as três sem dupla contagem.
    //
    // F-019/F-020: guard por SCHEMA, não por user_version. O messages.db do workspace é
    // COMPARTILHADO com o bus (era Electron), cujo migrator usa o MESMO contador (chega a 11) —
    // um guard `v < 2` nunca dispara num DB do bus, deixando o schema sem as colunas: INSERT
    // novo falha silencioso (telemetria para de gravar) e o CACHE_WRITE_SUM explode o prepare
    // (badge sempre vazio). As colunas são aditivas (writer do bus lista colunas por nome, não
    // é afetado) e o user_version fica intocado — o contador não é nosso.
    const cols = new Set(db.prepare('PRAGMA table_info(token_usage)').all().map((c) => c.name));
    if (!cols.has('cache_write_5m_tokens'))
        db.exec('ALTER TABLE token_usage ADD COLUMN cache_write_5m_tokens INTEGER DEFAULT 0');
    if (!cols.has('cache_write_1h_tokens'))
        db.exec('ALTER TABLE token_usage ADD COLUMN cache_write_1h_tokens INTEGER DEFAULT 0');
    if (!cols.has('message_id'))
        db.exec('ALTER TABLE token_usage ADD COLUMN message_id TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_token_usage_msg ON token_usage(session_id, message_id)');
}
/** Teto de handles abertos simultâneos (workspace ativo + últimos tocados). */
const MAX_OPEN_DBS = 8;
/** Handle ocioso além disso é fechado pelo sweep. */
const IDLE_TTL_MS = 5 * 60_000;
const SWEEP_INTERVAL_MS = 60_000;
// Ordem de inserção do Map = ordem LRU (hit re-insere no fim).
const dbPool = new Map();
function closeEntry(entry) {
    // Checkpoint disciplinado: trunca o WAL antes de soltar o handle.
    try {
        entry.db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    }
    catch { /* best-effort */ }
    try {
        entry.db.close();
    }
    catch { /* já fechado */ }
}
/** Fecha handles ociosos há mais de IDLE_TTL_MS. `nowMs` injetável p/ teste. */
export function sweepIdleWorkspaceDbs(nowMs = Date.now()) {
    for (const [path, entry] of dbPool) {
        if (nowMs - entry.lastUsedAt >= IDLE_TTL_MS) {
            dbPool.delete(path);
            closeEntry(entry);
        }
    }
}
/** Fecha todos os handles do pool (shutdown/teste). */
export function closeAllWorkspaceDbs() {
    for (const [path, entry] of dbPool) {
        dbPool.delete(path);
        closeEntry(entry);
    }
}
/** Handles abertos no pool (instrumentação/teste). */
export function openWorkspaceDbCount() {
    return dbPool.size;
}
const sweepTimer = setInterval(() => sweepIdleWorkspaceDbs(), SWEEP_INTERVAL_MS);
if (typeof sweepTimer.unref === 'function')
    sweepTimer.unref();
/**
 * Abre (e mantém no pool LRU/TTL) o DatabaseSync de
 * <workspacePath>/.overclock-app/messages.db e roda as migrations de
 * token_usage + activity_log_v2.
 *
 * Idempotente enquanto o handle vive no pool; handle evictado (LRU/TTL) é
 * reaberto transparentemente na próxima chamada.
 */
export function getWorkspaceDb(workspacePath) {
    const hit = dbPool.get(workspacePath);
    if (hit) {
        hit.lastUsedAt = Date.now();
        // Re-insere no fim do Map → vira o mais recentemente usado.
        dbPool.delete(workspacePath);
        dbPool.set(workspacePath, hit);
        return hit.db;
    }
    const dbDir = join(workspacePath, '.overclock-app');
    const dbPath = join(dbDir, 'messages.db');
    // Garante que o diretório existe (mesmo comportamento do Electron).
    try {
        mkdirSync(dbDir, { recursive: true });
    }
    catch { /* já existe */ }
    const db = new DatabaseSync(dbPath);
    // WAL mode: reduz lock contention com o processo Electron/bus que também escreve.
    db.exec('PRAGMA journal_mode=WAL');
    db.exec('PRAGMA synchronous=NORMAL');
    runMigrations(db);
    // LRU: estourou o teto → fecha o menos recentemente usado antes de inserir.
    while (dbPool.size >= MAX_OPEN_DBS) {
        const oldestKey = dbPool.keys().next().value;
        const oldest = dbPool.get(oldestKey);
        dbPool.delete(oldestKey);
        closeEntry(oldest);
    }
    dbPool.set(workspacePath, { db, lastUsedAt: Date.now() });
    return db;
}
// ---------------------------------------------------------------------------
// Queries de token_usage
// ---------------------------------------------------------------------------
const EMPTY_TOKEN_AGG = { input: 0, output: 0, cache_read: 0, cache_write: 0, cost_usd: 0 };
function normalizeTokenRow(row) {
    if (!row)
        return EMPTY_TOKEN_AGG;
    return {
        input: Number(row['input'] ?? 0),
        output: Number(row['output'] ?? 0),
        cache_read: Number(row['cache_read'] ?? 0),
        cache_write: Number(row['cache_write'] ?? 0),
        cost_usd: Number(row['cost_usd'] ?? 0),
    };
}
/**
 * Agrega tokens por task_id (espelha TokenUsage.aggregateByTask do bus).
 */
// cache_write agregado = legado (rows antigas) + split 5m/1h (rows novas). Sem dupla contagem:
// rows novas gravam 0 no legado; rows antigas têm 0 no split.
const CACHE_WRITE_SUM = 'SUM(cache_write_tokens + cache_write_5m_tokens + cache_write_1h_tokens)';
export function aggregateTokensByTask(db, taskId) {
    const stmt = db.prepare(`
    SELECT
      SUM(input_tokens)       AS input,
      SUM(output_tokens)      AS output,
      SUM(cache_read_tokens)  AS cache_read,
      ${CACHE_WRITE_SUM}      AS cache_write,
      SUM(cost_usd)           AS cost_usd
    FROM token_usage
    WHERE task_id = ?
  `);
    return normalizeTokenRow(stmt.get(taskId));
}
/**
 * Agrega tokens por pane (agent_name = `pane:<paneId>`, espelha TokenUsage.aggregateByPane do bus).
 * NOTA (C-037): o badge do pane usa aggregateTokensBySession (fonte única por sessão) — este por-pane
 * soma TODAS as vidas do id e por isso herdava extrato de pane morto homônimo (F-013). Mantido para
 * agregações que ainda chaveiam por agent_name.
 */
export function aggregateTokensByPane(db, paneId) {
    const stmt = db.prepare(`
    SELECT
      SUM(input_tokens)       AS input,
      SUM(output_tokens)      AS output,
      SUM(cache_read_tokens)  AS cache_read,
      ${CACHE_WRITE_SUM}      AS cache_write,
      SUM(cost_usd)           AS cost_usd
    FROM token_usage
    WHERE agent_name = ?
  `);
    return normalizeTokenRow(stmt.get(`pane:${paneId}`));
}
/**
 * Agrega tokens por SESSÃO (C-037: fonte única do badge). session_id = a sessão atual do pane
 * (claudeSessionId / session.id). Sub-agentes de workflow herdam o session_id do pai, então o
 * burn do workflow soma na sessão que o disparou. Pane com id reusado nasce zerado porque a
 * sessão é outra → F-013 morto por construção.
 */
export function aggregateTokensBySession(db, sessionId) {
    // F-019: enquanto uma instância ANTIGA do app coexistir (prod pré-C-037), ela grava as
    // MESMAS mensagens sem message_id e sem dedup (linhas repetidas por rewrite de streaming)
    // — somar tudo infla a sessão ~2-3× e o badge nunca bate com o /cost (aceite: ±5%).
    // Se a sessão tem rows dedupadas (watcher novo), elas são a verdade — as NULL são eco do
    // escritor legado e ficam FORA. Sessão só-NULL (codex / gravada só pelo legado) soma tudo.
    const stmt = db.prepare(`
    SELECT
      SUM(input_tokens)       AS input,
      SUM(output_tokens)      AS output,
      SUM(cache_read_tokens)  AS cache_read,
      ${CACHE_WRITE_SUM}      AS cache_write,
      SUM(cost_usd)           AS cost_usd
    FROM token_usage
    WHERE session_id = ?
      AND (message_id IS NOT NULL
           OR NOT EXISTS (SELECT 1 FROM token_usage t2
                          WHERE t2.session_id = token_usage.session_id
                            AND t2.message_id IS NOT NULL))
  `);
    return normalizeTokenRow(stmt.get(sessionId));
}
/**
 * Agrega tokens por workspace desde sinceMs (ms), agrupado por model
 * (espelha TokenUsage.aggregateByWorkspace do bus).
 */
export function aggregateTokensByWorkspace(db, sinceMs) {
    const stmt = db.prepare(`
    SELECT
      model,
      SUM(input_tokens)  AS input,
      SUM(output_tokens) AS output,
      SUM(cost_usd)      AS cost_usd
    FROM token_usage
    WHERE created_at >= ?
    GROUP BY model
  `);
    const rows = stmt.all(sinceMs);
    return rows.map((r) => ({
        model: String(r['model'] ?? ''),
        input: Number(r['input'] ?? 0),
        output: Number(r['output'] ?? 0),
        cost_usd: Number(r['cost_usd'] ?? 0),
    }));
}
const LIST_PRICES = [
    [/opus/, [5, 25, 0.5, 6.25, 10]],
    [/sonnet/, [3, 15, 0.3, 3.75, 6]],
    [/haiku/, [1, 5, 0.1, 1.25, 2]],
    [/fable|mythos/, [10, 50, 1, 12.5, 20]],
    // Codex CLI (OpenAI). prefix match cobre gpt-5, gpt-5.5, gpt-5-codex etc. Codex não
    // reporta cache_write; cacheRead = preço do cached_input.
    [/gpt-?5/, [1.25, 10, 0.125, 1.25, 1.25]],
];
const DEFAULT_PRICES = [3, 15, 0.3, 3.75, 6]; // sonnet
function pricesFor(model) {
    for (const [re, p] of LIST_PRICES)
        if (re.test(model))
            return p;
    return DEFAULT_PRICES;
}
function computeCost(model, input, output, cacheRead, cacheWrite5m, cacheWrite1h) {
    const [pi, po, pr, p5, p1] = pricesFor(model);
    const M = 1_000_000;
    return (input * pi + output * po + cacheRead * pr + cacheWrite5m * p5 + cacheWrite1h * p1) / M;
}
/**
 * Insere/atualiza uma linha de token_usage (cost_usd auto-calculado, preço de tabela).
 * Upsert por (session_id, message_id): o último snapshot vence (dedup do streaming, T-008).
 * created_at em ms.
 */
export function recordTokenUsage(db, entry) {
    const cacheRead = entry.cache_read_tokens ?? 0;
    const cw5m = entry.cache_write_5m_tokens ?? 0;
    // caller legado (codex) informa cache_write_tokens; o CLI Claude usa TTL 1h → dobra pro 1h.
    const cw1h = (entry.cache_write_1h_tokens ?? 0) + (entry.cache_write_tokens ?? 0);
    const cost = computeCost(entry.model, entry.input_tokens, entry.output_tokens, cacheRead, cw5m, cw1h);
    const stmt = db.prepare(`
    INSERT INTO token_usage (
      model, session_id, task_id, agent_name, message_id,
      input_tokens, output_tokens, cache_read_tokens,
      cache_write_tokens, cache_write_5m_tokens, cache_write_1h_tokens,
      cost_usd, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    ON CONFLICT(session_id, message_id) DO UPDATE SET
      model                 = excluded.model,
      task_id               = excluded.task_id,
      agent_name            = excluded.agent_name,
      -- F-019: usage por mensagem é CUMULATIVO no streaming — snapshot atrasado/fora-de-ordem
      -- (2 fontes do mesmo message_id) chegava MENOR e fazia o agregado oscilar. Guarda de
      -- monotonicidade: cada balde só anda pra frente.
      input_tokens          = MAX(token_usage.input_tokens,          excluded.input_tokens),
      output_tokens         = MAX(token_usage.output_tokens,         excluded.output_tokens),
      cache_read_tokens     = MAX(token_usage.cache_read_tokens,     excluded.cache_read_tokens),
      cache_write_5m_tokens = MAX(token_usage.cache_write_5m_tokens, excluded.cache_write_5m_tokens),
      cache_write_1h_tokens = MAX(token_usage.cache_write_1h_tokens, excluded.cache_write_1h_tokens),
      cost_usd              = MAX(token_usage.cost_usd,              excluded.cost_usd),
      created_at            = excluded.created_at
  `);
    stmt.run(entry.model, entry.session_id, entry.task_id ?? null, entry.agent_name ?? null, entry.message_id ?? null, entry.input_tokens, entry.output_tokens, cacheRead, cw5m, cw1h, cost, Date.now());
}
// ---------------------------------------------------------------------------
// Queries de activity_log_v2
// ---------------------------------------------------------------------------
function parseLogRow(row) {
    let metadata = null;
    if (typeof row['metadata'] === 'string' && row['metadata']) {
        try {
            metadata = JSON.parse(row['metadata']);
        }
        catch {
            metadata = null;
        }
    }
    return {
        id: Number(row['id'] ?? 0),
        ts: Number(row['ts'] ?? 0),
        category: String(row['category'] ?? ''),
        level: String(row['level'] ?? ''),
        activity_id: typeof row['activity_id'] === 'string' ? row['activity_id'] : null,
        subtask_id: typeof row['subtask_id'] === 'string' ? row['subtask_id'] : null,
        message: String(row['message'] ?? ''),
        metadata,
    };
}
/**
 * Lista entradas do activity_log_v2 com filtros opcionais.
 * Newest-first, espelha ActivityLog.list() do bus.
 */
export function listActivityLog(db, opts = {}) {
    const conditions = [];
    const params = [];
    if (opts.sinceMs !== undefined) {
        conditions.push('ts >= ?');
        params.push(opts.sinceMs);
    }
    if (opts.activityId !== undefined) {
        conditions.push('activity_id = ?');
        params.push(opts.activityId);
    }
    if (opts.category !== undefined) {
        conditions.push('category = ?');
        params.push(opts.category);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = opts.limit ?? 500;
    // node:sqlite: stmt.all(...params) — parâmetros posicionais (sem @named como better-sqlite3).
    const stmt = db.prepare(`SELECT * FROM activity_log_v2 ${where} ORDER BY ts DESC LIMIT ${limit}`);
    const rows = (params.length > 0 ? stmt.all(...params) : stmt.all());
    return rows.map(parseLogRow);
}
//# sourceMappingURL=db.js.map