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
import { watch } from 'node:fs';
import { readFile, readdir, stat, open } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { recordTokenUsage } from './db.js';
// uuid da sessão = sufixo do filename `rollout-<ts>-<uuid>.jsonl`.
const UUID_RE = /-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.jsonl$/;
export class CodexTranscriptWatcher {
    dbForWorkspace;
    lookupPane;
    onRecorded;
    sessionsRoots;
    onSessionDetected;
    watchers = [];
    watchedRoots = new Set();
    pendingRoots = new Set();
    // arquivo → último byte offset já parseado
    offsets = new Map();
    // arquivo → metadados resolvidos (cwd/model/pane), 1x por sessão
    meta = new Map();
    constructor(dbForWorkspace, lookupPane = () => null, 
    /** Disparado quando ≥1 linha de usage foi gravada (→ broadcast tokens:updated). */
    onRecorded = () => { }, 
    /** Roots de sessões (multi-conta: cada CODEX_HOME tem seu sessions/). Default = ~/.codex/sessions. */
    sessionsRoots = () => [join(homedir(), '.codex', 'sessions')], 
    /** Disparado 1x/sessão quando um rollout (uuid no filename) resolve um pane codex vivo.
     *  O core grava cfg.session p/ o restore conseguir `codex resume <id>` em vez de cold-boot. */
    onSessionDetected = () => { }) {
        this.dbForWorkspace = dbForWorkspace;
        this.lookupPane = lookupPane;
        this.onRecorded = onRecorded;
        this.sessionsRoots = sessionsRoots;
        this.onSessionDetected = onSessionDetected;
    }
    /** Começa a observar os rollouts do Codex em todos os roots de conta. Idempotente. */
    async start() {
        let roots = [];
        try {
            roots = this.sessionsRoots();
        }
        catch {
            roots = [join(homedir(), '.codex', 'sessions')];
        }
        await Promise.all(roots.map((root) => this.startRoot(root)));
    }
    async startRoot(root) {
        if (this.watchedRoots.has(root))
            return;
        let exists = false;
        try {
            await stat(root);
            exists = true;
        }
        catch {
            exists = false;
        }
        if (!exists) {
            // sessions/ ainda não existe (codex nunca rodou nesta conta) — observa o parent ~/.codex,
            // que dispara quando sessions/ nascer. Mirror do pending-dir do Claude.
            if (this.pendingRoots.has(root))
                return;
            this.pendingRoots.add(root);
            const parent = join(root, '..');
            try {
                const watcher = watch(parent, (_event, filename) => {
                    if (filename === 'sessions') {
                        this.pendingRoots.delete(root);
                        this.startRoot(root).catch(() => { });
                    }
                });
                this.watchers.push(watcher);
            }
            catch {
                this.pendingRoots.delete(root);
            }
            return;
        }
        this.watchedRoots.add(root);
        // Seed de offsets: PULA conteúdo histórico (mesma razão do Claude — evita re-billing).
        // readdir recursivo: a estrutura é sessions/YYYY/MM/DD/rollout-*.jsonl.
        try {
            const entries = await readdir(root, { recursive: true });
            for (const rel of entries) {
                if (!rel.endsWith('.jsonl') || !rel.includes('rollout-'))
                    continue;
                const full = join(root, rel);
                try {
                    const st = await stat(full);
                    this.offsets.set(full, st.size);
                }
                catch { /* ignore */ }
            }
        }
        catch { /* ignore */ }
        // Watch recursivo: novos arquivos caem em sessions/<hoje>/. macOS/Windows suportam
        // {recursive:true} nativo; Linux desde Node 20. filename vem como path relativo ao root.
        try {
            const watcher = watch(root, { recursive: true }, (_event, filename) => {
                if (!filename)
                    return;
                const rel = String(filename);
                if (!rel.endsWith('.jsonl') || !rel.includes('rollout-'))
                    return;
                this.ingestFile(join(root, rel)).catch(() => { });
            });
            this.watchers.push(watcher);
        }
        catch { /* ignore — host sem watch recursivo cai no seed-only */ }
    }
    /** Lê o head do arquivo (≤64KB) p/ extrair cwd (session_meta) e modelo (turn_context). */
    async readHeadMeta(file) {
        let cwd = null;
        let model = 'gpt-unknown';
        try {
            const fh = await open(file, 'r');
            try {
                const buf = Buffer.alloc(64 * 1024);
                const { bytesRead } = await fh.read(buf, 0, buf.length, 0);
                const head = buf.toString('utf8', 0, bytesRead);
                for (const line of head.split('\n')) {
                    if (!line.trim())
                        continue;
                    let o;
                    try {
                        o = JSON.parse(line);
                    }
                    catch {
                        continue;
                    }
                    const p = o.payload;
                    if (o.type === 'session_meta' && p && typeof p.cwd === 'string')
                        cwd = p.cwd;
                    if (o.type === 'turn_context' && p && typeof p.model === 'string') {
                        model = p.model;
                        break;
                    }
                }
            }
            finally {
                await fh.close();
            }
        }
        catch { /* ignore */ }
        return { cwd, model };
    }
    async ingestFile(file) {
        // Offsets em BYTES (igual Claude): lê como Buffer e fatia por byte. String.length
        // (UTF-16) dessincroniza em conteúdo multibyte.
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
        // Resolve metadados da sessão 1x. Um arquivo pré-existente (seed=size) só recebe
        // APPENDS de token_count — sem session_meta no slice — então o cwd tem de vir do head.
        let m = this.meta.get(file);
        if (!m) {
            const sessionId = file.match(UUID_RE)?.[1] ?? file.split('/').pop()?.replace('.jsonl', '') ?? 'unknown';
            const head = await this.readHeadMeta(file);
            m = { sessionId, cwd: head.cwd, model: head.model, paneId: null, resolved: false, lastSig: null };
            this.meta.set(file, m);
        }
        const slice = buf.toString('utf8', prevOffset);
        this.offsets.set(file, buf.length);
        if (!m.cwd)
            return; // sem cwd não dá pra resolver workspace/pane — descarta o turno
        // Atribuição por pane resolvida 1x por sessão (cwd + janela de spawn).
        if (!m.resolved) {
            m.paneId = this.lookupPane({ cwd: m.cwd, firstSeenAt: Date.now() });
            m.resolved = true;
            // Captura do session_id p/ resume: o uuid do rollout. Assim que resolve um pane
            // codex vivo, manda pro core gravar cfg.session (→ panes.json → restore `codex resume`).
            if (m.paneId)
                this.onSessionDetected(m.paneId, m.sessionId);
        }
        let db;
        try {
            db = this.dbForWorkspace(m.cwd);
        }
        catch {
            return;
        }
        let recorded = 0;
        for (const line of slice.split('\n')) {
            if (!line.trim())
                continue;
            let o;
            try {
                o = JSON.parse(line);
            }
            catch {
                continue;
            }
            const p = o.payload;
            if (!p)
                continue;
            // modelo pode mudar mid-sessão (turn_context recorrente) — mantém o mais recente.
            if (o.type === 'turn_context' && typeof p.model === 'string')
                m.model = p.model;
            if (o.type !== 'event_msg' || p.type !== 'token_count')
                continue;
            const info = p.info;
            const lu = (info?.last_token_usage ?? info?.total_token_usage);
            if (!lu)
                continue;
            const inputRaw = (lu.input_tokens ?? 0);
            const cached = (lu.cached_input_tokens ?? 0);
            const output = (lu.output_tokens ?? 0);
            const freshIn = Math.max(0, inputRaw - cached);
            if (freshIn + output + cached === 0)
                continue;
            // Dedup defensivo: token_count repetido sem turno novo (mesmo last) não dobra.
            const sig = `${inputRaw}:${cached}:${output}`;
            if (sig === m.lastSig)
                continue;
            m.lastSig = sig;
            const agentName = m.paneId ? `pane:${m.paneId}` : 'codex-cli-pane';
            try {
                recordTokenUsage(db, {
                    model: m.model,
                    session_id: m.sessionId,
                    task_id: null,
                    agent_name: agentName,
                    input_tokens: freshIn,
                    output_tokens: output,
                    cache_read_tokens: cached,
                    cache_write_tokens: 0,
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
        this.watchedRoots.clear();
        this.pendingRoots.clear();
        this.meta.clear();
    }
}
//# sourceMappingURL=CodexTranscriptWatcher.js.map