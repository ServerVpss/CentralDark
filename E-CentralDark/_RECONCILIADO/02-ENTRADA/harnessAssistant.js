/**
 * harnessAssistant — C-081 Harness › Ingredientes/Receitas LLM passes.
 *
 * Two one-shot calls to the DEFAULT authenticated model (claude-agent-sdk, OAuth-CLI login —
 * same engine JarvisService uses, but this file is independent so it never touches JarvisService.ts
 * / GeminiLiveSession.ts, which stay live for the voice pane):
 *   - enrichCatalog: reads agent+skill names → assigns each a role + short "when/how to use" blurb.
 *   - proposeRecipes: reads the ENABLED ingredient set → proposes buildable deliverables
 *     ("what can I cook with these?"), each with favorite LLM + ordered steps (skill×agent).
 *
 * Both force a JSON-only reply and parse defensively. Failures degrade to an empty result — the
 * renderer keeps working with the raw catalog / saved recipes.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { query as sdkQuery } from '@anthropic-ai/claude-agent-sdk';
import { resolveAgentDef } from '@overclock-app/mcp';
import { resolveNativeBinary } from '@overclock-app/core';
// House default: workers run only opus-4.8 / sonnet-5 — sonnet is the cheap default for these
// annotate/propose passes.
const DEFAULT_MODEL = 'claude-sonnet-5';
const DEFAULT_EFFORT = 'low';
const ONE_SHOT_TIMEOUT_MS = 60_000;
// Enrich the catalog in small chunks. The full arsenal (65 agents + 180 skills) overran the
// single-turn budget → the SDK threw "Reached maximum number of turns (1)" and F5 surfaced nothing
// (C-081 r8, observed live). Each chunk stays small enough to finish in one turn; chunks run in
// bounded-parallel and a chunk that fails degrades to empty instead of failing the whole pass.
const ENRICH_CHUNK_SIZE = 40;
const ENRICH_CHUNK_CONCURRENCY = 4;
const VALID_TIERS = new Set(['scout', 'builder', 'reviewer']);
// C-081 r8 (ponto 10): o tier de certos itens é DERIVAÇÃO DIRETA DO NOME — determinístico, sem LLM.
// Os 3 chefes fixos (oc-chef-scout/builder/reviewer) são donos do seu tier: o enrich nunca os
// classifica errado nem deixa vazio. Retorna o tier derivado, ou null se o nome não codifica um.
export function deterministicTier(name) {
    const m = /^oc-chef-(scout|builder|reviewer)$/.exec(name.trim());
    if (m)
        return m[1];
    // C-081.13 (c): workers first-party BAKED têm tier determinístico do AgentDef.role — agora que o
    // catálogo os surfa (merge no bridge/Arsenal), o enrich nunca os classifica errado nem os omite.
    const def = resolveAgentDef(name.trim());
    return def ? def.role : null;
}
// The house default; also the value the UI surfaces / can override (C-081 r8 #3).
export function harnessDefaultModel() {
    return DEFAULT_MODEL;
}
// Full engine surface for the UI: model + effort (account is resolved renderer-side from providers).
export function harnessEngine() {
    return { model: DEFAULT_MODEL, effort: DEFAULT_EFFORT };
}
const VALID_EFFORTS = new Set(['low', 'medium', 'high']);
async function runOneShot(systemPrompt, userPrompt, model, effort) {
    const claudePath = resolveNativeBinary('claude');
    if (!claudePath) {
        const err = new Error('claude_cli_missing');
        err.code = 'claude_cli_missing';
        throw err;
    }
    const abortController = new AbortController();
    const timer = setTimeout(() => { try {
        abortController.abort();
    }
    catch { /* já abortada */ } }, ONE_SHOT_TIMEOUT_MS);
    const eff = effort && VALID_EFFORTS.has(effort) ? effort : DEFAULT_EFFORT;
    const options = {
        abortController,
        model: model && model.trim() ? model.trim() : DEFAULT_MODEL,
        systemPrompt,
        thinking: { type: 'disabled' },
        effort: eff,
        // Was 1 — a long JSON answer needs the SDK to allow a follow-up turn, else it throws
        // "Reached maximum number of turns (1)" before yielding usable text (C-081 r8).
        maxTurns: 4,
        tools: [],
        permissionMode: 'default',
        persistSession: false,
        pathToClaudeCodeExecutable: claudePath,
    };
    let text = '';
    try {
        for await (const msg of sdkQuery({ prompt: userPrompt, options })) {
            const m = msg;
            if (m.type === 'assistant' && Array.isArray(m.message?.content)) {
                text += m.message.content
                    .filter((b) => b.type === 'text' && typeof b.text === 'string')
                    .map((b) => b.text)
                    .join('');
            }
        }
    }
    finally {
        clearTimeout(timer);
    }
    return text;
}
/** Strip ```json fences / prose and parse the first JSON object in the reply. */
function parseJsonObject(reply) {
    const trimmed = reply.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    try {
        return JSON.parse(trimmed);
    }
    catch {
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(trimmed.slice(start, end + 1));
            }
            catch { /* fall through */ }
        }
        return null;
    }
}
const ENRICH_SYSTEM = 'Você classifica cada agent e skill de um IDE multi-agente (Overclock) na topologia agêntica de ' +
    '3 CHEFES FIXOS. Todo item (agent E skill) pertence a EXATAMENTE UM dos 3: ' +
    '"scout" (pesquisa/descoberta/leitura/análise — levanta contexto, referências, dados, requisitos), ' +
    '"builder" (execução/construção — escreve código, gera mídia, escreve copy, monta o entregável), ' +
    '"reviewer" (revisão/QA/validação/teste — verifica qualidade, testa, audita, aprova). ' +
    'Para CADA item atribua OBRIGATORIAMENTE um tier ∈ {scout, builder, reviewer} — a qual dos 3 ' +
    'chefes ele pertence — e um blurb de quando/como usar (1 frase, ~120 chars). Responda SOMENTE com ' +
    'JSON válido, sem cercas de código, no formato: ' +
    '{"items":[{"name":"...","kind":"agent"|"skill","tier":"scout"|"builder"|"reviewer","blurb":"..."}]}. ' +
    'Use exatamente os nomes recebidos. Não invente itens. TODO item DEVE ter um tier.';
// One chunk of the catalog → LLM annotation. Kept small so it finishes in a single turn.
async function enrichChunk(agents, skills, model, effort) {
    if (agents.length === 0 && skills.length === 0)
        return [];
    const userPrompt = `AGENTS (${agents.length}):\n${agents.map((a) => `- ${a}`).join('\n') || '(nenhum)'}\n\n` +
        `SKILLS (${skills.length}):\n${skills.map((s) => `- ${s}`).join('\n') || '(nenhum)'}\n\n` +
        'Organize e anote cada um.';
    const reply = await runOneShot(ENRICH_SYSTEM, userPrompt, model, effort);
    const parsed = parseJsonObject(reply);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    const knownAgents = new Set(agents);
    const knownSkills = new Set(skills);
    const out = [];
    const seen = new Set();
    for (const it of items) {
        const name = typeof it.name === 'string' ? it.name : '';
        if (!name)
            continue;
        const kind = it.kind === 'agent' || knownAgents.has(name) ? 'agent' : it.kind === 'skill' || knownSkills.has(name) ? 'skill' : 'skill';
        if (!knownAgents.has(name) && !knownSkills.has(name))
            continue; // no fabricated items
        // tier é OBRIGATÓRIO (agent E skill) e ∈ {scout, builder, reviewer} — contrato de dado (7b/7c/7d).
        // Determinístico do nome vence o LLM (ponto 10): os 3 chefes nunca classificam errado.
        // Fallback → builder quando o modelo não classifica (nunca fica sem tier).
        const det = deterministicTier(name);
        const tierRaw = typeof it.tier === 'string' ? it.tier.toLowerCase() : '';
        const tier = det ?? (VALID_TIERS.has(tierRaw) ? tierRaw : 'builder');
        out.push({ name, kind, tier, blurb: typeof it.blurb === 'string' ? it.blurb : '' });
        seen.add(name);
    }
    // Garante que os itens de tier determinístico (chefes) SEMPRE saem — mesmo se o LLM os omitiu.
    for (const name of [...agents, ...skills]) {
        const det = deterministicTier(name);
        if (det && !seen.has(name)) {
            out.push({ name, kind: knownAgents.has(name) ? 'agent' : 'skill', tier: det, blurb: '' });
            seen.add(name);
        }
    }
    return out;
}
export async function enrichCatalog(input) {
    const agents = (input.agents ?? []).filter(Boolean);
    const skills = (input.skills ?? []).filter(Boolean);
    if (agents.length === 0 && skills.length === 0)
        return [];
    // Split the combined catalog into small chunks (agents + skills interleaved by slice), each a
    // one-shot that completes in a single turn. Run ENRICH_CHUNK_CONCURRENCY at a time; a chunk that
    // throws degrades to [] so a single failure never blanks the whole enrichment (F5 still surfaces
    // the chunks that succeeded).
    const combined = [
        ...agents.map((name) => ({ name, kind: 'agent' })),
        ...skills.map((name) => ({ name, kind: 'skill' })),
    ];
    const chunks = [];
    for (let i = 0; i < combined.length; i += ENRICH_CHUNK_SIZE)
        chunks.push(combined.slice(i, i + ENRICH_CHUNK_SIZE));
    const out = [];
    for (let i = 0; i < chunks.length; i += ENRICH_CHUNK_CONCURRENCY) {
        const wave = chunks.slice(i, i + ENRICH_CHUNK_CONCURRENCY);
        const settled = await Promise.all(wave.map((chunk) => enrichChunk(chunk.filter((x) => x.kind === 'agent').map((x) => x.name), chunk.filter((x) => x.kind === 'skill').map((x) => x.name), input.model, input.effort).catch((err) => {
            if (err.code === 'claude_cli_missing')
                throw err;
            return [];
        })));
        for (const items of settled)
            out.push(...items);
    }
    return out;
}
const PROPOSE_SYSTEM = 'Você é o PILOTO/ORQUESTRADOR de um IDE multi-agente (Overclock). A topologia é FIXA e é DADO DO ' +
    'SISTEMA (não sua escolha): existem exatamente 3 CHEFES — scout (pesquisa/descoberta), builder ' +
    '(execução/construção), reviewer (revisão/QA). Cada chefe É uma constante do produto; você NUNCA ' +
    'inventa chefe nem troca a identidade/skill dele — você SÓ propõe os ACIONAMENTOS de worker dentro ' +
    'de cada chefe. Recebe a "despensa" de ingredientes ' +
    'HABILITADOS (agents, skills, modelos de mídia, LLMs). Proponha de 2 a 4 ENTREGÁVEIS construíveis ' +
    'com ESSES ingredientes. Cada receita é um PLANO DE ORQUESTRAÇÃO EXECUTÁVEL, narrado na ORDEM ' +
    'REAL da missão — NÃO uma lista genérica. Para cada receita dê:\n' +
    '- name, deliverable (1 frase), favoriteModel (um dos LLMs habilitados);\n' +
    '- questions: as PERGUNTAS que você (orquestrador) faz ao usuário no início pra travar o escopo;\n' +
    '- chefes: as delegações NA ORDEM — cada uma {chefe: "scout"|"builder"|"reviewer", receives: o que ' +
    'esse chefe recebe, activations: a sequência de acionamentos de worker}. Cada acionamento = ' +
    '{worker: o papel acionado, skill: a SKILL REAL habilitada (ex. "overclock-design-dna" — NUNCA um ' +
    'papel como "scout"), agent: UM agent habilitado, model: o LLM+effort daquela etapa (ex. ' +
    '"claude-opus-4-8 · high"), tools: as ferramentas/MCP que usa, produces: o ARTEFATO concreto que ' +
    'sai, parallel: true se roda em paralelo com os irmãos}. Marque parallel=true quando várias frentes ' +
    'rodam ao mesmo tempo. Alinhe modelo·effort à etapa (mecânico → sonnet · low|medium; denso/debug → ' +
    'opus · high);\n' +
    '- delivery: a ENTREGA FINAL definida.\n' +
    'Use SÓ skills/agents da despensa. Responda SOMENTE com JSON válido, sem cercas, no formato: ' +
    '{"recipes":[{"name":"...","deliverable":"...","favoriteModel":"...","questions":["..."],"chefes":' +
    '[{"chefe":"scout"|"builder"|"reviewer","receives":"...","activations":[{"skill":"...",' +
    '"agent":"...","model":"...","tools":["..."],"produces":"...","parallel":false}]}],"delivery":"..."}]}. ' +
    'IMPORTANTE: o worker É o próprio agent (ex. overclock-worker-design-extractor) — NUNCA invente ' +
    'um nome/rótulo de worker (nada de "scout:research"). Cada acionamento aponta o agent real e a ' +
    'skill real que ele carrega. Todo nome de agent e de skill DEVE ser cópia EXATA de um item da ' +
    'despensa — nome fora dela é REJEITADO no save da receita.';
export async function proposeRecipes(input) {
    const agents = (input.agents ?? []).filter(Boolean);
    const skills = (input.skills ?? []).filter(Boolean);
    const media = (input.media ?? []).filter(Boolean);
    const llms = (input.llms ?? []).filter(Boolean);
    if (agents.length === 0 && skills.length === 0)
        return [];
    const userPrompt = `DESPENSA (ingredientes habilitados):\n` +
        `AGENTS: ${agents.join(', ') || '(nenhum)'}\n` +
        `SKILLS: ${skills.join(', ') || '(nenhum)'}\n` +
        `MÍDIA: ${media.join(', ') || '(nenhuma)'}\n` +
        `LLMs: ${llms.join(', ') || '(nenhum)'}\n\n` +
        'Proponha os planos de orquestração (perguntas → delegação por chefe → acionamentos worker+skill+agent+produz, com paralelismo → entrega final).';
    const reply = await runOneShot(PROPOSE_SYSTEM, userPrompt, input.model, input.effort);
    const parsed = parseJsonObject(reply);
    const recipes = Array.isArray(parsed?.recipes) ? parsed.recipes : [];
    const strArr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
    // C-081.13 (F-105: dado > prompt): valida o retorno do LLM contra a despensa REAL em vez de
    // confiar no prompt. Acionamento que pinou agent/skill fora do catálogo ganha `gap` explícito —
    // fica visível na proposta e o lint do save aceita (gap declarado) ou rejeita (sem gap).
    const agentSet = new Set(agents);
    const skillSet = new Set(skills);
    const gapOf = (agent, skill) => {
        const parts = [];
        if (agent && !agentSet.has(agent))
            parts.push(`agent '${agent}' fora do catálogo habilitado`);
        if (skill && !skillSet.has(skill))
            parts.push(`skill '${skill}' fora do catálogo habilitado`);
        return parts.length > 0 ? parts.join('; ') : undefined;
    };
    const out = [];
    for (const r of recipes) {
        const name = typeof r.name === 'string' ? r.name : '';
        if (!name)
            continue;
        const rawChefes = Array.isArray(r.chefes) ? r.chefes : [];
        // Ponto 11b: os 3 chefes são FIXOS POR CONSTRUÇÃO. O LLM só propõe acionamentos; aqui a gente
        // ENFORCE a estrutura — funde os acionamentos nos 3 buckets canônicos (scout/builder/reviewer),
        // na ordem fixa da topologia, deduplicando qualquer chefe inventado pelo tier a que pertence.
        const buckets = new Map();
        for (const c of rawChefes) {
            const chefeRaw = typeof c.chefe === 'string' ? c.chefe.toLowerCase() : '';
            const chefe = VALID_TIERS.has(chefeRaw) ? chefeRaw : 'builder';
            const rawActs = Array.isArray(c.activations) ? c.activations : [];
            const acts = rawActs.map((a) => {
                const skill = typeof a.skill === 'string' ? a.skill : '';
                const agent = typeof a.agent === 'string' ? a.agent : '';
                const gap = gapOf(agent, skill);
                return {
                    skill,
                    agent,
                    model: typeof a.model === 'string' ? a.model : '',
                    tools: strArr(a.tools),
                    produces: typeof a.produces === 'string' ? a.produces : '',
                    parallel: a.parallel === true,
                    ...(gap ? { gap } : {}),
                };
            });
            const existing = buckets.get(chefe);
            if (existing) {
                existing.activations.push(...acts);
                if (!existing.receives && typeof c.receives === 'string')
                    existing.receives = c.receives;
            }
            else {
                buckets.set(chefe, { chefe, receives: typeof c.receives === 'string' ? c.receives : '', activations: acts });
            }
        }
        const chefes = ['scout', 'builder', 'reviewer']
            .map((t) => buckets.get(t))
            .filter((c) => !!c);
        out.push({
            name,
            deliverable: typeof r.deliverable === 'string' ? r.deliverable : '',
            favoriteModel: typeof r.favoriteModel === 'string' ? r.favoriteModel : (llms[0] ?? DEFAULT_MODEL),
            questions: strArr(r.questions),
            chefes,
            delivery: typeof r.delivery === 'string' ? r.delivery : '',
        });
    }
    return out;
}
// ── Persisted enriched catalog (C-081 r7) ───────────────────────────────────────────────────────
// F5's enrichment must SURVIVE the pass: it is persisted to a JSON store that the MCP reads during
// agentic mission creation, so at runtime the orchestrator picks the right skill per role/tier. This
// is the loop that makes the harness REAL (not display-only).
const CATALOG_FILE = 'harness-enriched-catalog.json';
export function enrichedCatalogPath(dataDir) {
    return join(dataDir, CATALOG_FILE);
}
export function loadEnrichedCatalog(dataDir) {
    try {
        const raw = JSON.parse(readFileSync(enrichedCatalogPath(dataDir), 'utf8'));
        const map = {};
        for (const it of raw.items ?? [])
            if (it?.name)
                map[it.name] = it;
        return map;
    }
    catch {
        return {};
    }
}
// Merge the freshly enriched items over whatever was persisted before (partial enrich accumulates).
export function saveEnrichedCatalog(dataDir, items) {
    const map = loadEnrichedCatalog(dataDir);
    for (const it of items)
        if (it?.name)
            map[it.name] = it;
    const payload = { version: 1, updatedAt: new Date().toISOString(), items: Object.values(map) };
    const path = enrichedCatalogPath(dataDir);
    try {
        mkdirSync(dirname(path), { recursive: true });
    }
    catch { /* dir já existe */ }
    writeFileSync(path, JSON.stringify(payload, null, 2), 'utf8');
}
//# sourceMappingURL=harnessAssistant.js.map