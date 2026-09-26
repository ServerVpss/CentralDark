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
import { watch } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { slugifyClaudeProjectPath } from '@overclock-app/core';
import { recordTokenUsage } from './db.js';
export class ClaudeTranscriptWatcher {
    dbForWorkspace;
    lookupPane;
    onRecorded;
    extraProjectsRoots;
    onSessionDetected;
    watchers = [];
    // diretórios com watcher de arquivos ativo (idempotência — start() pode ser chamado por spawn)
    watchedDirs = new Set();
    // diretórios ainda inexistentes, com watcher no parent aguardando o nascimento
    pendingDirs = new Set();
    // arquivo → último byte offset já parseado
    offsets = new Map();
    // arquivo → cauda da fila de ingest (F-019): fs.watch dispara N eventos por append e
    // ingestFile é async — 2 chamadas concorrentes liam do MESMO prevOffset e gravavam a mesma
    // fatia 2-3× (com dedup por message_id vira no-op, mas rows sem id — codex — triplicavam).
    ingestTail = new Map();
    // session_id → paneId resolvido (lazy, no 1º evento de usage)
    sessionPane = new Map();
    // sessões DITADAS no spawn (`--session-id`): nunca são "histórico" — o seed de offsets NÃO
    // as pina (F-019: transcript nascido/escrito durante o seed era pinado no tamanho cheio e
    // a sessão inteira sumia do badge). Ingerem do byte 0; dedup por message_id torna idempotente.
    freshSessions = new Set();
    // slug → workspacePath (p/ resolver qual DB gravar)
    slugToWorkspace = new Map();
    constructor(dbForWorkspace, lookupPane = () => null, 
    /** Disparado quando ≥1 linha de usage foi gravada (→ broadcast tokens:updated). */
    onRecorded = () => { }, 
    /** Roots extras de projetos (multi-conta Claude: <CLAUDE_CONFIG_DIR>/projects). */
    extraProjectsRoots = () => [], 
    /** Disparado 1x/sessão quando o transcript (filename = uuid da sessão) resolve um
     *  pane vivo. O core grava cfg.claudeSessionId p/ o restore conseguir --resume. */
    onSessionDetected = () => { }) {
        this.dbForWorkspace = dbForWorkspace;
        this.lookupPane = lookupPane;
        this.onRecorded = onRecorded;
        this.extraProjectsRoots = extraProjectsRoots;
        this.onSessionDetected = onSessionDetected;
    }
    pathToSlug(workspacePath) {
        // Single source: the CLI replaces EVERY non-alphanumeric char with '-'
        // (verified against cli.js 2.1.202) — replacing only /\: missed dirs for
        // paths with '.', '_' or spaces, so sid capture/telemetry never attached
        // (F-157: on Windows the pane then dropped from restore).
        return slugifyClaudeProjectPath(workspacePath);
    }
    /** Começa a observar os transcripts de um workspace em todos os roots de conta. Idempotente.
     * configDir: o CLAUDE_CONFIG_DIR DESTE pane (multi-conta ou override de shell do usuário).
     * Sem ele a captura/telemetria ficaria cega a um config relocado ("configured elsewhere" bug):
     * o transcript vive em <CLAUDE_CONFIG_DIR>/projects/<slug>/, não em ~/.claude. */
    /** Marca uma sessão ditada no spawn como "fresca": o seed nunca pula o transcript dela.
     *  Chamar ANTES do start() do pane. */
    expectFreshSession(sessionId) {
        if (sessionId)
            this.freshSessions.add(sessionId);
    }
    async start(workspacePath, configDir) {
        if (!workspacePath || workspacePath.startsWith('ssh://'))
            return;
        let extras = [];
        try {
            extras = this.extraProjectsRoots();
        }
        catch { /* provider store indisponível */ }
        // Root env-derivado: configDir do pane > CLAUDE_CONFIG_DIR do shell > ~/.claude.
        const baseDir = configDir || process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
        const roots = [...new Set([join(baseDir, 'projects'), join(homedir(), '.claude', 'projects'), ...extras])];
        this.slugToWorkspace.set(this.pathToSlug(workspacePath), workspacePath);
        await Promise.all(roots.map((root) => this.startRoot(root, workspacePath)));
        // Catch-up determinístico das sessões ditadas (F-027): o transcript pode nascer DURANTE o
        // seed (readdir de milhares de entries) e o evento de criação precede o fs.watch — sem
        // isto a sessão fica invisível até o próximo append. O path é conhecido (filename = uuid
        // ditado): proba com retries curtos; ingestFile é serializado+offset-based (idempotente).
        for (const root of roots)
            this.scheduleFreshCatchUp(join(root, this.pathToSlug(workspacePath)));
    }
    scheduleFreshCatchUp(dir) {
        for (const id of this.freshSessions) {
            const file = join(dir, `${id}.jsonl`);
            for (const delay of [2_000, 8_000, 20_000, 45_000]) {
                setTimeout(() => { this.ingestFile(file).catch(() => { }); }, delay);
            }
        }
    }
    async startRoot(projectsRoot, workspacePath) {
        const slug = this.pathToSlug(workspacePath);
        const dir = join(projectsRoot, slug);
        if (this.watchedDirs.has(dir))
            return;
        let exists = false;
        try {
            await stat(dir);
            exists = true;
        }
        catch {
            exists = false;
        }
        if (!exists) {
            // dir ainda não existe — observa o parent, que dispara quando ele nascer
            if (this.pendingDirs.has(dir))
                return;
            this.pendingDirs.add(dir);
            try {
                const watcher = watch(projectsRoot, (_event, filename) => {
                    if (filename && filename === slug) {
                        this.pendingDirs.delete(dir);
                        this.startRoot(projectsRoot, workspacePath).catch(() => { });
                    }
                });
                this.watchers.push(watcher);
            }
            catch {
                this.pendingDirs.delete(dir);
            }
            return;
        }
        this.watchedDirs.add(dir);
        // Seed de offsets: PULA conteúdo histórico — só parseia linhas novas a partir de agora.
        // Evita re-inserir tudo a cada restart + double-billing de sessões antigas.
        // Recursivo: cobre os transcripts top-level (<sessionId>.jsonl) E os sub-agentes de
        // workflow/Task em <sessionId>/subagents/**/agent-*.jsonl (onde o burn de multi-agente
        // realmente acontece — antes invisível porque o watch era não-recursivo).
        // F-027: watch nasce ANTES do seed. Em dir grande (~6k sessões) o seed leva MINUTOS e o
        // watch-depois criava uma janela cega pós-boot: pane spawnado nela nunca aparecia no badge
        // (evento de criação perdido; offset depois pinado no tamanho cheio). Evento durante o seed
        // ingere do byte 0 — inofensivo: dedup por message_id torna re-ingest idempotente.
        try {
            const watcher = watch(dir, { recursive: true }, (_event, filename) => {
                if (!filename)
                    return;
                const rel = String(filename);
                if (!this.isTrackedTranscript(rel))
                    return;
                this.ingestFile(join(dir, rel)).catch(() => { });
            });
            this.watchers.push(watcher);
        }
        catch { /* ignore — host sem watch recursivo cai no seed-only */ }
        const catchUp = [];
        try {
            const entries = await readdir(dir, { recursive: true });
            const toSeed = [];
            for (const rel of entries) {
                const r = String(rel);
                if (!this.isTrackedTranscript(r))
                    continue;
                const full = join(dir, r);
                // F-019: sessão ditada no spawn não é histórico — não pina offset; ingere do byte 0
                // depois que o watch subir (cobre o seed-race E o watch que só nasceu depois do 1º turno).
                const base = r.split('/').pop() ?? '';
                if (this.freshSessions.has(base.replace(/\.jsonl$/, ''))) {
                    catchUp.push(full);
                    continue;
                }
                // Evento já pinou o offset deste arquivo durante o seed → não sobrescrever (regredir
                // offset re-ingere; avançar por stat posterior PULARIA bytes não lidos).
                if (this.offsets.has(full))
                    continue;
                toSeed.push(full);
            }
            // Pool limitado (F-027): stat sequencial = minutos de janela cega em dir com ~6k
            // sessões; Promise.all irrestrito = EMFILE (o readFile do ingest falhava silencioso
            // durante o seed e o evento era consumido sem avançar offset — sessão sumia pra sempre).
            const CONC = 64;
            let next = 0;
            const worker = async () => {
                while (next < toSeed.length) {
                    const full = toSeed[next++];
                    try {
                        const st = await stat(full);
                        if (!this.offsets.has(full))
                            this.offsets.set(full, st.size);
                    }
                    catch { /* ignore */ }
                }
            };
            await Promise.all(Array.from({ length: Math.min(CONC, toSeed.length) }, worker));
        }
        catch { /* ignore */ }
        // Catch-up: transcripts frescos que JÁ existiam no seed entram inteiros agora.
        for (const f of catchUp)
            this.ingestFile(f).catch(() => { });
    }
    // Aceita só os 2 formatos que carregam usage: o transcript top-level da sessão
    // (<sessionId>.jsonl, sem subdir) e os sub-agentes (em .../subagents/.../agent-<id>.jsonl).
    isTrackedTranscript(rel) {
        if (!rel.endsWith('.jsonl'))
            return false;
        const base = rel.split('/').pop() ?? '';
        if (rel.includes('/subagents/'))
            return base.startsWith('agent-');
        return !rel.includes('/'); // top-level: nenhum subdir
    }
    /** Serializa ingests do mesmo arquivo (F-019) — ver ingestTail acima. */
    ingestFile(file) {
        const next = (this.ingestTail.get(file) ?? Promise.resolve())
            .then(() => this.doIngestFile(file))
            .catch(() => { });
        this.ingestTail.set(file, next);
        return next;
    }
    async doIngestFile(file) {
        // Offsets are tracked in BYTES (seeded from stat().size), so read the file as a
        // Buffer and slice/compare by byte length. Reading as a utf8 string and using
        // String.length (UTF-16 units) desynced the offset on multibyte content,
        // re-emitting or skipping lines. Appends are complete UTF-8 writes ending in
        // '\n', so a byte offset always lands on a char boundary.
        let buf;
        try {
            buf = await readFile(file);
        }
        catch {
            return;
        }
        const prevOffset = this.offsets.get(file) ?? 0;
        if (prevOffset >= buf.length)
            return;
        const slice = buf.toString('utf8', prevOffset);
        this.offsets.set(file, buf.length);
        // Acha o dir-raiz observado deste workspace (prefixo do path) → slug + caminho relativo.
        // Necessário porque agora os arquivos podem ser aninhados (<sessionId>/subagents/...).
        let dir = null;
        for (const d of this.watchedDirs) {
            if (file.startsWith(d + '/')) {
                dir = d;
                break;
            }
        }
        if (!dir)
            return;
        const slug = dir.split('/').pop() ?? '';
        const workspacePath = this.slugToWorkspace.get(slug);
        if (!workspacePath)
            return;
        const rel = file.slice(dir.length + 1);
        const isSubagent = rel.includes('/subagents/');
        // Atribuição: sub-agente herda o pane da SESSÃO-PAI (1º segmento do path, = <sessionId>
        // do transcript top-level), não do filename agent-<id>. Assim o burn do workflow cai no
        // mesmo badge do pane que disparou o workflow. session_id do registro = o id de atribuição.
        const sessionId = isSubagent
            ? (rel.split('/')[0] ?? 'unknown')
            : (rel.replace('.jsonl', '') || 'unknown');
        // 1º ingest real da sessão ditada: sai do set (para os retries de catch-up de spawns
        // futuros e devolve a sessão à semântica normal de offset).
        if (!isSubagent)
            this.freshSessions.delete(sessionId);
        // Atribuição por pane resolvida 1x por sessão (lookup por slug + tempo de spawn).
        if (!this.sessionPane.has(sessionId)) {
            const resolvedPane = this.lookupPane({ slug, firstSeenAt: Date.now(), sessionId });
            this.sessionPane.set(sessionId, resolvedPane);
            // Captura do session_id p/ --resume: o filename do transcript top-level É o uuid da
            // sessão. NÃO dispara p/ sub-agente (seu id não é resumível; o pai já dispara o seu).
            if (resolvedPane && !isSubagent)
                this.onSessionDetected(resolvedPane, sessionId);
        }
        const paneId = this.sessionPane.get(sessionId) ?? null;
        let db;
        try {
            db = this.dbForWorkspace(workspacePath);
        }
        catch {
            return;
        }
        let recorded = 0;
        for (const line of slice.split('\n')) {
            if (!line.trim())
                continue;
            let obj;
            try {
                obj = JSON.parse(line);
            }
            catch {
                continue;
            }
            if (!obj || typeof obj !== 'object')
                continue;
            const o = obj;
            // Só linhas type==="assistant" com usage (T-008 regra 1) — evita contar linhas user/ai-title.
            if (o.type !== 'assistant')
                continue;
            const msg = o.message;
            const usage = msg?.usage;
            if (!usage)
                continue;
            const model = msg?.model ?? 'claude-unknown';
            const inputTokens = usage.input_tokens ?? 0;
            const outputTokens = usage.output_tokens ?? 0;
            const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
            // Split do cache write por TTL (T-008 regra 3). O breakdown vive em usage.cache_creation
            // (ephemeral_5m/_1h); sem ele (schema antigo) o CLI usa TTL 1h → joga tudo no balde 1h (2×).
            const cc = usage.cache_creation;
            const legacyWrite = usage.cache_creation_input_tokens ?? 0;
            const cacheWrite5m = cc ? (cc.ephemeral_5m_input_tokens ?? 0) : 0;
            const cacheWrite1h = cc ? (cc.ephemeral_1h_input_tokens ?? 0) : legacyWrite;
            if (inputTokens + outputTokens + cacheReadTokens + cacheWrite5m + cacheWrite1h === 0)
                continue;
            // Dedup do streaming (T-008 regra 2): o CLI regrava a mesma mensagem por content block.
            // message.id (fallback requestId) chaveia o upsert → fica o último snapshot. Sem id →
            // uuid único (não deduplica, mas não colide).
            const messageId = msg?.id
                ?? o.requestId
                ?? randomUUID();
            const agentName = paneId ? `pane:${paneId}` : 'claude-cli-pane';
            try {
                recordTokenUsage(db, {
                    model,
                    session_id: sessionId,
                    task_id: null,
                    agent_name: agentName,
                    message_id: messageId,
                    input_tokens: inputTokens,
                    output_tokens: outputTokens,
                    cache_read_tokens: cacheReadTokens,
                    cache_write_5m_tokens: cacheWrite5m,
                    cache_write_1h_tokens: cacheWrite1h,
                });
                recorded += 1;
            }
            catch { /* ignore dup / schema mismatch */ }
        }
        if (recorded > 0)
            this.onRecorded();
    }
    stop() {
        for (const w of this.watchers) {
            try {
                w.close();
            }
            catch { /* ignore */ }
        }
        this.watchers = [];
        this.offsets.clear();
        this.ingestTail.clear();
        this.watchedDirs.clear();
        this.pendingDirs.clear();
        this.sessionPane.clear();
        this.slugToWorkspace.clear();
        this.freshSessions.clear();
    }
}
//# sourceMappingURL=ClaudeTranscriptWatcher.js.map