// F-005 — pool LRU/TTL de handles de messages.db por workspace.
// O incidente: agregadores globais tocam ~65 workspaces e o cache antigo nunca
// fechava handle (204 handles vivos). O pool limita handles simultâneos (LRU)
// e fecha ociosos (TTL), reabrindo transparentemente quando tocado de novo.
import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-ignore — built-in Node 22.12+; sem @types/node:sqlite ainda.
import { DatabaseSync } from 'node:sqlite';
import { getWorkspaceDb, sweepIdleWorkspaceDbs, closeAllWorkspaceDbs, openWorkspaceDbCount, recordTokenUsage, aggregateTokensByPane, aggregateTokensBySession, aggregateTokensByWorkspace, } from './db.js';
const MAX_OPEN_DBS = 8; // espelha a constante do pool
const IDLE_TTL_MS = 5 * 60_000;
describe('workspace db pool (F-005)', () => {
    const roots = [];
    function makeWorkspace() {
        const p = mkdtempSync(join(tmpdir(), 'f005-ws-'));
        roots.push(p);
        return p;
    }
    afterEach(() => {
        closeAllWorkspaceDbs();
        for (const p of roots.splice(0))
            rmSync(p, { recursive: true, force: true });
    });
    it('reusa o mesmo handle enquanto vivo no pool', () => {
        const ws = makeWorkspace();
        const a = getWorkspaceDb(ws);
        const b = getWorkspaceDb(ws);
        expect(b).toBe(a);
        expect(openWorkspaceDbCount()).toBe(1);
    });
    it('LRU: tocar N > MAX workspaces mantém o pool no teto e fecha o mais antigo', () => {
        const N = MAX_OPEN_DBS + 4;
        const paths = Array.from({ length: N }, () => makeWorkspace());
        const first = getWorkspaceDb(paths[0]);
        for (const p of paths.slice(1))
            getWorkspaceDb(p);
        expect(openWorkspaceDbCount()).toBe(MAX_OPEN_DBS);
        // handle mais antigo foi fechado — usar depois do close lança
        expect(() => first.prepare('SELECT 1')).toThrow();
        // reabrir o workspace evictado funciona transparentemente
        const reopened = getWorkspaceDb(paths[0]);
        expect(reopened.prepare('SELECT 1 AS x').get()).toEqual({ x: 1 });
        expect(openWorkspaceDbCount()).toBe(MAX_OPEN_DBS);
    });
    it('TTL: sweep preserva handle dentro do TTL e fecha o que ociosou', () => {
        const ws = makeWorkspace();
        const db = getWorkspaceDb(ws);
        const t0 = Date.now();
        // dentro do TTL → nada fecha
        sweepIdleWorkspaceDbs(t0 + IDLE_TTL_MS - 1_000);
        expect(openWorkspaceDbCount()).toBe(1);
        expect(db.prepare('SELECT 1 AS x').get()).toEqual({ x: 1 });
        // passou o TTL → fecha
        sweepIdleWorkspaceDbs(t0 + IDLE_TTL_MS + 1_000);
        expect(openWorkspaceDbCount()).toBe(0);
        expect(() => db.prepare('SELECT 1')).toThrow();
        // reabertura pós-sweep funciona
        const again = getWorkspaceDb(ws);
        expect(again.prepare('SELECT 1 AS x').get()).toEqual({ x: 1 });
    });
    it('dados sobrevivem ao ciclo abrir→evict→reabrir (mesmo arquivo em disco)', () => {
        const ws = makeWorkspace();
        const db = getWorkspaceDb(ws);
        recordTokenUsage(db, {
            model: 'claude-sonnet-4-6', session_id: 's1', agent_name: 'pane:p1',
            input_tokens: 100, output_tokens: 50,
        });
        expect(existsSync(join(ws, '.overclock-app', 'messages.db'))).toBe(true);
        // evict via TTL
        sweepIdleWorkspaceDbs(Date.now() + IDLE_TTL_MS + 1_000);
        expect(openWorkspaceDbCount()).toBe(0);
        const reopened = getWorkspaceDb(ws);
        const agg = aggregateTokensByPane(reopened, 'p1');
        expect(agg.input).toBe(100);
        expect(agg.output).toBe(50);
    });
});
// C-037 — telemetria por sessão + algoritmo T-008 (dedup por message.id, 5 baldes, preço de tabela).
describe('token_usage — algoritmo T-008 (C-037)', () => {
    const roots = [];
    function makeWorkspace() {
        const p = mkdtempSync(join(tmpdir(), 'c037-ws-'));
        roots.push(p);
        return p;
    }
    afterEach(() => {
        closeAllWorkspaceDbs();
        for (const p of roots.splice(0))
            rmSync(p, { recursive: true, force: true });
    });
    function rowCount(db, sessionId) {
        const r = db.prepare('SELECT COUNT(*) AS n FROM token_usage WHERE session_id = ?').get(sessionId);
        return r.n;
    }
    it('dedup: mesmo (session_id, message_id) faz upsert do ÚLTIMO snapshot (não soma)', () => {
        const db = getWorkspaceDb(makeWorkspace());
        // streaming: o CLI regrava a mesma mensagem com usage crescente.
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's1', message_id: 'msg-1', input_tokens: 100, output_tokens: 10 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's1', message_id: 'msg-1', input_tokens: 100, output_tokens: 200 });
        expect(rowCount(db, 's1')).toBe(1); // 1 linha por message.id
        const agg = aggregateTokensBySession(db, 's1');
        expect(agg.input).toBe(100); // não 200
        expect(agg.output).toBe(200); // último snapshot, não 10+200
    });
    // F-019 (oscilação): snapshot atrasado/fora-de-ordem chegava MENOR e sobrescrevia o maior —
    // badge subia e descia entre valores próximos. Usage por mensagem é cumulativo: MAX por balde.
    it('monotonicidade: snapshot fora-de-ordem menor NÃO rebaixa o acumulado', () => {
        const db = getWorkspaceDb(makeWorkspace());
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's-mono', message_id: 'm', input_tokens: 100, output_tokens: 200, cache_read_tokens: 500 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's-mono', message_id: 'm', input_tokens: 100, output_tokens: 40, cache_read_tokens: 300 });
        const agg = aggregateTokensBySession(db, 's-mono');
        expect(agg.output).toBe(200); // não rebaixa pra 40
        expect(agg.cache_read).toBe(500); // não rebaixa pra 300
    });
    it('message_id distinto na mesma sessão = linhas separadas (somam)', () => {
        const db = getWorkspaceDb(makeWorkspace());
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's2', message_id: 'a', input_tokens: 100, output_tokens: 50 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's2', message_id: 'b', input_tokens: 80, output_tokens: 30 });
        expect(rowCount(db, 's2')).toBe(2);
        expect(aggregateTokensBySession(db, 's2').output).toBe(80);
    });
    // F-019 (reaberto): escritor legado (instância antiga em paralelo) grava as MESMAS mensagens
    // sem message_id e sem dedup — somar tudo infla a sessão e o badge nunca bate o /cost (±5%).
    it('sessão com rows dedupadas IGNORA as NULL legadas; sessão só-NULL soma tudo', () => {
        const db = getWorkspaceDb(makeWorkspace());
        // sessão claude: watcher novo (dedup) + eco legado triplicado da MESMA mensagem
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 'mix', message_id: 'm1', input_tokens: 100, output_tokens: 50 });
        for (let i = 0; i < 3; i++)
            recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 'mix', input_tokens: 100, output_tokens: 50 });
        const mix = aggregateTokensBySession(db, 'mix');
        expect(mix.input).toBe(100); // só a dedupada — não 400
        expect(mix.output).toBe(50);
        // sessão codex (só NULL): continua somando normal
        recordTokenUsage(db, { model: 'gpt-5-codex', session_id: 'only-null', input_tokens: 10, output_tokens: 5 });
        recordTokenUsage(db, { model: 'gpt-5-codex', session_id: 'only-null', input_tokens: 20, output_tokens: 8 });
        expect(aggregateTokensBySession(db, 'only-null').input).toBe(30);
    });
    it('message_id NULL (codex/legado) não colide — cada insert é uma linha', () => {
        const db = getWorkspaceDb(makeWorkspace());
        recordTokenUsage(db, { model: 'gpt-5-codex', session_id: 's3', input_tokens: 10, output_tokens: 5, cache_read_tokens: 2 });
        recordTokenUsage(db, { model: 'gpt-5-codex', session_id: 's3', input_tokens: 20, output_tokens: 8, cache_read_tokens: 4 });
        expect(rowCount(db, 's3')).toBe(2);
        expect(aggregateTokensBySession(db, 's3').output).toBe(13);
    });
    it('cache write 1h precifica a 2× input (T-008) — opus 4.8 preço de tabela', () => {
        const db = getWorkspaceDb(makeWorkspace());
        // opus list: in $5, cacheWrite1h $10 (=2×). 1M in + 1M write1h → $5 + $10 = $15.
        recordTokenUsage(db, {
            model: 'claude-opus-4-8', session_id: 's4', message_id: 'm',
            input_tokens: 1_000_000, output_tokens: 0, cache_write_1h_tokens: 1_000_000,
        });
        const agg = aggregateTokensBySession(db, 's4');
        expect(agg.cache_write).toBe(1_000_000); // balde exposto no agregado
        expect(agg.cost_usd).toBeCloseTo(15, 5);
    });
    it('split 5m vs 1h tem preço diferente (opus: 6.25 vs 10 $/MTok)', () => {
        const db = getWorkspaceDb(makeWorkspace());
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's5m', message_id: 'x', input_tokens: 0, output_tokens: 0, cache_write_5m_tokens: 1_000_000 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's1h', message_id: 'y', input_tokens: 0, output_tokens: 0, cache_write_1h_tokens: 1_000_000 });
        expect(aggregateTokensBySession(db, 's5m').cost_usd).toBeCloseTo(6.25, 5);
        expect(aggregateTokensBySession(db, 's1h').cost_usd).toBeCloseTo(10, 5);
    });
    it('agrega por sessão isola vidas do mesmo pane (F-013): sessões diferentes não somam', () => {
        const db = getWorkspaceDb(makeWorkspace());
        // pane reusa o id, mas duas sessões distintas: o badge (por sessão) vê só a atual.
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 'dead', agent_name: 'pane:p9', message_id: 'd', input_tokens: 999, output_tokens: 999 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 'alive', agent_name: 'pane:p9', message_id: 'a', input_tokens: 10, output_tokens: 5 });
        expect(aggregateTokensBySession(db, 'alive').input).toBe(10); // sessão atual → limpo
        expect(aggregateTokensByPane(db, 'p9').input).toBe(1009); // por-pane ainda soma tudo (por isso o badge migrou p/ sessão)
    });
    // F-019/F-020: o messages.db do workspace é COMPARTILHADO com o bus (era Electron), cujo
    // migrator usa o MESMO PRAGMA user_version (chega a 11). O guard `v < 2` da migração C-037
    // nunca disparava num DB do bus → sem message_id/split: INSERT novo falhava silencioso
    // (dev parava de gravar — F-020) e o CACHE_WRITE_SUM explodia o prepare (badge sempre
    // vazio → só o spinner ao vivo, que zera no Esc — F-019).
    it('F-019: DB versionado pelo bus (user_version=11) ganha as colunas C-037 e grava/agrega', () => {
        const ws = makeWorkspace();
        const dir = join(ws, '.overclock-app');
        mkdirSync(dir, { recursive: true });
        const raw = new DatabaseSync(join(dir, 'messages.db'));
        raw.exec(`
      CREATE TABLE token_usage (
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
    `);
        // row legada (pré-C-037, sem message_id) — não pode sumir do agregado
        raw.exec(`INSERT INTO token_usage (model, session_id, input_tokens, output_tokens, created_at)
              VALUES ('claude-opus-4-8', 's-bus', 7, 3, 1)`);
        raw.exec('PRAGMA user_version = 11');
        raw.close();
        const db = getWorkspaceDb(ws);
        // dedup por message_id funciona (upsert do último snapshot)…
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's-bus', message_id: 'm1', input_tokens: 100, output_tokens: 10 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's-bus', message_id: 'm1', input_tokens: 100, output_tokens: 200 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 's-bus', message_id: 'm2', input_tokens: 50, output_tokens: 20 });
        // …e o agregado por sessão conta SÓ as dedupadas (a row legada NULL vira eco do escritor
        // antigo — regra do F-019 reaberto: sessão com dedup ignora NULL)
        const agg = aggregateTokensBySession(db, 's-bus');
        expect(agg.input).toBe(150); // 100 + 50 (legada de 7 fora)
        expect(agg.output).toBe(220); // 200 + 20
        // o contador user_version é do bus — fica intocado
        const v = db.prepare('PRAGMA user_version').get().user_version;
        expect(v).toBe(11);
    });
    it('F-009: byWorkspace agrega o WORKSPACE inteiro (várias sessões/panes) — mascote lê daqui', () => {
        const db = getWorkspaceDb(makeWorkspace());
        // duas sessões, dois panes, mesmo modelo → o total do workspace soma AS DUAS (a mudança
        // pra session-key no badge não pode encolher isto: o mascote reflete o level real do ws).
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 'sw-a', agent_name: 'pane:p1', message_id: 'a', input_tokens: 100, output_tokens: 40 });
        recordTokenUsage(db, { model: 'claude-opus-4-8', session_id: 'sw-b', agent_name: 'pane:p2', message_id: 'b', input_tokens: 60, output_tokens: 20 });
        const rows = aggregateTokensByWorkspace(db, 0).filter((r) => r.model === 'claude-opus-4-8');
        expect(rows).toHaveLength(1); // agrupado por modelo
        expect(rows[0].input + rows[0].output).toBe(220); // 140 + 80, workspace-wide
    });
});
//# sourceMappingURL=db.test.js.map