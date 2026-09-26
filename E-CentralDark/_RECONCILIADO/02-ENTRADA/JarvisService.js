/**
 * JarvisService — motor agentic do Jarvis para o sidecar Tauri (C-050.1).
 *
 * Caminho: @anthropic-ai/claude-agent-sdk (query() streaming) com login
 * OAuth do Claude CLI (~/.claude). 10 tools Overclock expostas como MCP
 * server in-process via createSdkMcpServer, despachando pelo
 * findRegisteredTool/buildOverclockToolRegistry existente.
 *
 * Cortado vs referência Electron (_refs/overclock-jarvis): safeStorage,
 * fallback @anthropic-ai/sdk por API key.
 * Auth: OAuth only — emite jarvis:event error se não houver login CLI.
 *
 * F-056: GeminiLiveSession (voz full-duplex) portada de volta — ver
 * ./GeminiLiveSession.ts + ./jarvisLivePrompt.ts. 'delegar' (a única das 4
 * voice tools que executa trabalho real) encaminha pro MESMO brain Agent SDK
 * abaixo via send(); consultar/ler/navegar respondem direto via runTool.
 */
import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { existsSync, readFileSync, writeFileSync, renameSync, realpathSync } from 'node:fs';
import { join, basename } from 'node:path';
import { z } from 'zod';
import { query as sdkQuery, createSdkMcpServer, tool as sdkTool } from '@anthropic-ai/claude-agent-sdk';
import { findRegisteredTool, shouldClearCallerMapping } from '@overclock-app/mcp';
import { parseHumanResult } from '@overclock-app/mcp';
import { buildJarvisSystemPrompt, isDevSidecarInstance, resolveNativeBinary } from '@overclock-app/core';
import { GeminiLiveSession } from './GeminiLiveSession.js';
import { getLivePrompt } from './jarvisLivePrompt.js';
import { JarvisMemory } from './JarvisMemory.js';
import { voiceSafeText } from './voiceSafeText.js';
import { acquireWakeLock, releaseWakeLock } from './JarvisWakeLock.js';
// ── Constants ────────────────────────────────────────────────────────────────
const JARVIS_MODEL = 'claude-haiku-4-5-20251001';
// F-099: 8 era curto pro caminho legítimo de lançar/delegar via wizard
// (mission-new → mode → wizard-fire → pane_list → pane_write, + narrações
// entre passos já roça 8 e estoura error_max_turns antes de disparar). 12 dá
// folga sem soltar rédea: o caminho correto de delegar-pra-missão-ativa gasta
// só 2 tools (pane_list + pane_write) graças à guarda de missão ativa abaixo.
const MAX_TOOL_ITERATIONS = 12;
// F-059: 30s sem NENHUMA mensagem do SDK = turno pendurado (spawn do CLI travado,
// stream morto). O watchdog aborta → outcome 'timeout' → erro narrado + estado volta.
const SDK_PROGRESS_TIMEOUT_MS = 30_000;
const CONFIRM_TIMEOUT_MS = 120_000;
/** Breadcrumb permanente do brain no log do dev (stderr do sidecar → /tmp/ovc-tauri-dev.log). */
function blog(msg) {
    process.stderr.write(`[jarvis-brain] ${msg}\n`);
}
// F-105.1: fronteira determinística envelope↔conteúdo no ditado. O prompt PÓS-INÍCIO manda o
// brain delegar "envia como primeiro prompt pro pane orquestrador da missão ...: <conteúdo>" —
// o envelope é ROTEAMENTO (resolve o ALVO; o paneId já é escolha do brain) e não deve viajar no
// payload do pane. Este verbo de envio na 3ª pessoa é o que fazia a instrução chegar meta-lixo
// ("envia pro orquestrador ...") em vez de instrução direta executável. Aqui, quando o texto
// COMEÇA com um envelope de despacho (verbo de envio + alvo de roteamento) seguido de ':',
// devolvemos SÓ o conteúdo pós-fronteira, byte-a-byte — SEM paráfrase LLM (F-105 garante a
// fidelidade; esta fase 2 só remove o envelope). Conservador: só corta quando o prefixo ANTES do
// ':' casa o padrão de envelope E é curto (envelope é curto); ':' de conteúdo ("Design System:
// X", "hora: 14h") não dispara porque o prefixo dele não tem verbo-de-envio + alvo-de-roteamento.
const ENVELOPE_DISPATCH_RE = /^\s*(envi|mand|passa|passe|encaminh|repass|diz|fala)/i;
const ENVELOPE_ROUTE_RE = /\b(pane|orquestrador|orquestrad|chefe|piloto|miss[aã]o|prompt|worker|agente)\b/i;
export function stripDelegationEnvelope(raw) {
    const idx = raw.indexOf(':');
    if (idx < 0 || idx > 140)
        return raw;
    const prefix = raw.slice(0, idx);
    const isEnvelope = (ENVELOPE_DISPATCH_RE.test(prefix) || /primeiro prompt/i.test(prefix))
        && ENVELOPE_ROUTE_RE.test(prefix);
    if (!isEnvelope)
        return raw;
    const content = raw.slice(idx + 1).replace(/^\s+/, '');
    return content.length ? content : raw;
}
/** Tools that require confirmation before executing. */
const CONFIRMATION_TOOLS = new Set(['pane_spawn', 'pane_write', 'mission_spawn_pane', 'squad_open']);
/** F-111/C-091: rótulo falável do papel, derivado dos MESMOS campos persistidos que
 *  paneRoleBadge (renderer) — duplicado aqui de propósito: sidecar não pode depender do
 *  pacote do shell/renderer. */
function savedPaneRoleWord(p) {
    if (p.delegateOnly && p.squadRole === 'orchestrator')
        return 'piloto';
    if (p.delegateOnly && p.squadRole)
        return `chefe (${p.squadRole})`;
    if (p.squadRole || p.leaf || p.callerPaneId)
        return 'worker';
    return 'pane';
}
// ── Helpers ───────────────────────────────────────────────────────────────────
/** Detecta login OAuth do Claude CLI sem tocar no keychain (sem prompt). */
function detectCliAuth() {
    try {
        if (existsSync(join(homedir(), '.claude', '.credentials.json')))
            return true;
        const configPath = join(homedir(), '.claude.json');
        if (existsSync(configPath))
            return readFileSync(configPath, 'utf-8').includes('"oauthAccount"');
    }
    catch { /* sem auth detectável */ }
    return false;
}
/**
 * Pre-seed do trust dialog do Claude CLI pro workspace: grava
 * projects[realpath].hasTrustDialogAccepted=true em ~/.claude.json
 * para que o CLI não pare aguardando input. Write atômico. Best-effort.
 */
function ensureCliTrust(workspace) {
    try {
        const configPath = join(homedir(), '.claude.json');
        if (!existsSync(configPath))
            return;
        let real = workspace;
        try {
            real = realpathSync(workspace);
        }
        catch { /* path pode não existir */ }
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        if (!config || typeof config !== 'object')
            return;
        config.projects ??= {};
        const entry = config.projects[real];
        if (entry?.hasTrustDialogAccepted === true)
            return;
        config.projects[real] = { ...(entry ?? {}), hasTrustDialogAccepted: true };
        const tmpPath = join(homedir(), `.claude.json.jarvis-${process.pid}.tmp`);
        writeFileSync(tmpPath, JSON.stringify(config, null, 2));
        renameSync(tmpPath, configPath);
    }
    catch { /* best-effort */ }
}
function withWorkspaceContext(workspace, screen, missionId, text, visiblePaneIds = [], focusedPaneId, isHome = false, homeWorkspaceNames = [], missionEntitiesLine = '', gridEntitiesLine = '', missionTitle) {
    // F-058: nome + path completo por turno — o agente responde SEMPRE no contexto
    // do workspace onde o usuário está (mission_list/pane_list já vêm escopados).
    // C-056.1: + a tela que o usuário está VENDO — comandos resolvem contra ela.
    const screenLine = screen ? `\n[tela atual: ${screen}]` : '';
    // C-090 (contrato de screen-state, pilar 1 — PUSH): na HOME GLOBAL o brain recebe as
    // ENTIDADES reais (a lista de workspaces da tela) + as AÇÕES disponíveis (abrir/criar),
    // rotuladas como DADO. Sem isto o brain via só o texto da tela e podia afirmar/abrir um
    // workspace que não está na lista, ou supor missão/pane numa tela que não os tem. Espelha,
    // no push por turno, o mesmo escopo que o `consultar` já dá na HOME (F-118).
    const homeLine = isHome
        ? `\n[TELA HOME (lista de workspaces) — ENTIDADES reais visíveis: ${homeWorkspaceNames.length ? homeWorkspaceNames.join(', ') : '(nenhum workspace recente)'}. AÇÕES disponíveis: abrir um workspace DESTA lista, ou criar um novo workspace. Só afirme/abra o que está NESTA lista — um alvo fora dela NÃO existe na tela: negue citando os que existem. NENHUMA missão, pane ou squad existe nesta tela (só surgem depois de abrir um workspace).]`
        : '';
    // F-102: panes VISÍVEIS na tela + o focado (ids reais) — sinal determinístico do
    // renderer. Sem isso o brain achava que estava na home enquanto o usuário tinha um
    // pane aberto na frente, e não resolvia pane_write contra o pane que ele vê.
    const paneLine = visiblePaneIds.length
        ? `\n[PANES VISÍVEIS NA TELA: ${visiblePaneIds.join(', ')}${focusedPaneId ? ` — pane em foco: ${focusedPaneId}` : ''} — para comandar um pane que o usuário está vendo, use o id EXATO desta lista (o usuário costuma dizer só o número, ex. "331" = "pane-331").]`
        : '';
    // F-099: missão ativa na tela é sinal DETERMINÍSTICO (vem do estado do renderer,
    // não de suposição do LLM). Sem esse sinal, o brain, num pedido de trabalho com
    // missão já aberta, RE-abria o wizard / montava squad do zero e estourava
    // max_turns (a UI revertia pro wizard — loop). Com o sinal, o caminho certo é
    // delegar o pedido pro orquestrador DA missão ativa: 2 tools, nunca re-navegar.
    // F-130 (mesma doença, lado PUSH): a linha é lida pelo brain e ecoada na fala — cita o
    // TÍTULO visível quando conhecido; id nanoid só como fallback.
    const missionLabel = missionTitle ? `"${missionTitle}"` : missionId;
    const missionLine = missionId
        ? `\n[MISSÃO ATIVA NA TELA: ${missionLabel} — se este for um pedido de TRABALHO, ele é o PRIMEIRO PROMPT desta missão: mande-o pro pane orquestrador DELA com pane_list (já vem escopado a esta missão) para achar o pane + pane_write com a tarefa, terminando em "Ao terminar, chame a tool handoff_submit com um resumo do resultado." NÃO chame navigate(mission-new/wizard-set/wizard-fire), NÃO crie missão nova, NÃO rode squad_list — a missão JÁ está lançada. Isso são no máximo 2 tools.]`
        : '';
    // C-090.3 (contrato de screen-state, fatia MISSÃO — PUSH): ENTIDADES reais da tela de missão
    // (panes ativos com papel/status F-111 + panes salvos C-091) + AÇÕES disponíveis, no mesmo
    // formato rotulado do homeLine — pré-computado por buildMissionEntitiesLine (async) porque a
    // fonte é pane_list/loadSavedPanes, não estado sync do reporter.
    // C-090.2 (contrato de screen-state, fatia GRID — PUSH): ENTIDADES reais do workspace sem
    // missão focada (missões com status real ativa/parada + panes salvos C-091) + AÇÕES
    // disponíveis, no mesmo formato rotulado do homeLine — pré-computado por
    // buildGridEntitiesLine (async, mesma razão do missionEntitiesLine acima).
    return `[workspace ativo: ${basename(workspace) || workspace} — path: ${workspace}]${screenLine}${homeLine}${paneLine}${missionLine}${missionEntitiesLine}${gridEntitiesLine}\n${text}`;
}
// F-110: heurística p/ detectar um pane delegado BLOQUEADO numa pergunta (AskUserQuestion /
// menu numerado) no tail do pane_read — sem isso, um pane que abre menu de opções em vez de
// terminar nunca acorda o watcher do F-101 (não há handoff_submit). Exige ≥2 linhas de opção
// numerada ("1. ...", "2. ...") + uma linha não-vazia antes delas (a pergunta) — conservador o
// bastante pra não disparar em qualquer lista numerada incidental de output normal.
const QUESTION_OPTION_LINE_RE = /^\s*(?:❯\s*)?\d+[.)]\s+\S/;
// F-110 r2: linha "inerte" pro efeito de tail ATIVO — em branco ou só o cursor de prompt
// (❯/>), nunca conteúdo real. Usada pra exigir que o menu esteja NA PONTA do scrollback
// (senão uma pergunta já respondida, ainda dentro da janela de lastN, re-dispara).
const INERT_TAIL_LINE_RE = /^\s*(?:[❯>]\s*)?$/;
export function detectPendingQuestion(tail) {
    return detectPendingQuestionParts(tail)?.spoken ?? null;
}
export function detectPendingQuestionParts(tail) {
    const lines = tail.split('\n').map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trimEnd());
    const optionIdx = [];
    for (let i = 0; i < lines.length; i++) {
        if (QUESTION_OPTION_LINE_RE.test(lines[i]))
            optionIdx.push(i);
    }
    if (optionIdx.length < 2)
        return null;
    // F-110 r2: usa o ÚLTIMO grupo de linhas-opção contíguas (gap ≤1) — pega o grupo MAIS
    // PRÓXIMO do fim do tail, não o primeiro do buffer inteiro (que pode ser um menu velho
    // já respondido, com o menu novo — ou nada — mais perto do fim).
    const runs = [[optionIdx[0]]];
    for (let k = 1; k < optionIdx.length; k++) {
        if (optionIdx[k] - optionIdx[k - 1] <= 1)
            runs[runs.length - 1].push(optionIdx[k]);
        else
            runs.push([optionIdx[k]]);
    }
    const lastRun = runs[runs.length - 1];
    if (lastRun.length < 2)
        return null;
    const lastOpt = lastRun[lastRun.length - 1];
    // Exige que NADA de conteúdo real venha depois do menu — pergunta ATIVA é a que ainda está
    // na ponta do tail (aguardando input AGORA), não uma já respondida e ultrapassada por
    // output novo do pane.
    for (let i = lastOpt + 1; i < lines.length; i++) {
        if (!INERT_TAIL_LINE_RE.test(lines[i]))
            return null;
    }
    const firstOpt = lastRun[0];
    let question = '';
    for (let i = firstOpt - 1; i >= 0 && i >= firstOpt - 6; i--) {
        const l = lines[i].trim();
        if (!l)
            continue;
        question = l;
        break;
    }
    if (!question)
        return null;
    // F-132: sem teto de 4 — enumera TODAS as opções, cada uma comprimida pro rótulo
    // curto (menu de escolha exige completude; o detalhe de cada opção fica de fora).
    const opts = lastRun.map((i) => menuOptionLabel(lines[i].trim()));
    const spoken = `${question} Opções: ${opts.join('; ')}`.replace(/\s+/g, ' ').trim();
    // C-092.11 (finding 12): hash com as linhas CRUAS (sufixos inclusos) — colisão de rótulos
    // comprimidos não engole o 2º menu no dedup narrada/respondida.
    const hash = `${question} ${lastRun.map((i) => lines[i].trim()).join('; ')}`
        .replace(/\s+/g, ' ').trim().slice(0, 300);
    return { spoken, hash };
}
// F-132: rótulo curto e falável de uma linha-opção de menu — remove o prefixo numerado,
// corta no primeiro separador visual (— – · | : parêntese) e num teto de chars, mas
// PRESERVA o número da opção (é como o usuário responde). Detalhe do card fica de fora
// por design: menu de ESCOLHA narra rótulos, não descrições.
const MENU_OPTION_PREFIX_RE = /^\s*(?:❯\s*)?(\d+)[.)]\s+/;
const MENU_LABEL_CUT_RE = /\s+(?:—|–|·|\||\().*$|:\s.*$/;
export function menuOptionLabel(line) {
    const num = line.match(MENU_OPTION_PREFIX_RE)?.[1];
    const body = line.replace(MENU_OPTION_PREFIX_RE, '').trim().replace(MENU_LABEL_CUT_RE, '').trim();
    const short = body.length > 60 ? `${body.slice(0, 57).trimEnd()}…` : body;
    return num ? `${num}. ${short}` : short;
}
// F-132: compressão ESTRUTURA-AWARE de menu ANTES dos caps cegos de narração (500/600
// chars). Uma resposta-menu longa cortada no meio faz a voz narrar só as 2 primeiras
// opções e engolir a pergunta final — num menu de ESCOLHA, completude é o requisito.
// ≥3 linhas-opção numeradas em sequência ASCENDENTE = menu (gaps de linhas de descrição
// entre opções são permitidos — cards multi-linha; por isso NÃO reusa o gap≤1 do
// detectPendingQuestion, que é pra menus compactos de AskUserQuestion no tail vivo).
// Devolve "Menu com N opções: 1. A; 2. B; …. Pergunta final: X" — cabe em qualquer cap
// e preserva TODAS as opções. Não-menu → null (caller mantém flatten+cap atual).
export function compressMenuForNarration(raw) {
    const lines = raw
        .split('\n')
        .map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
        .filter((l) => l);
    const entries = [];
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(MENU_OPTION_PREFIX_RE);
        if (m && QUESTION_OPTION_LINE_RE.test(lines[i]))
            entries.push({ idx: i, n: Number(m[1]) });
    }
    if (entries.length < 3)
        return null;
    // maior sequência de números estritamente ascendentes = o menu (texto solto com
    // números incidentais raramente forma ≥3 ascendentes no começo de linha).
    const streaks = [[entries[0]]];
    for (let k = 1; k < entries.length; k++) {
        if (entries[k].n > entries[k - 1].n)
            streaks[streaks.length - 1].push(entries[k]);
        else
            streaks.push([entries[k]]);
    }
    const menu = streaks.reduce((a, b) => (b.length >= a.length ? b : a));
    if (menu.length < 3)
        return null;
    const labels = menu.map((e) => menuOptionLabel(lines[e.idx]));
    // pergunta final: última linha interrogativa DEPOIS do menu ("Qual card?"); fallback:
    // a linha imediatamente ANTES da primeira opção (formato pergunta-em-cima do F-110).
    let question = '';
    for (let i = lines.length - 1; i > menu[menu.length - 1].idx; i--) {
        if (lines[i].endsWith('?')) {
            question = lines[i];
            break;
        }
    }
    if (!question && menu[0].idx > 0 && lines[menu[0].idx - 1].endsWith('?')) {
        question = lines[menu[0].idx - 1];
    }
    const q = question ? ` Pergunta final: ${question}` : '';
    return `Menu com ${labels.length} opções: ${labels.join('; ')}.${q}`;
}
// C-092.8 (DOSE 1): Gemini = boca/ouvido; Claude/determinístico = cérebro de texto. A frase
// FINAL é composta do lado nosso (custo ~zero na assinatura) e a Live recebe SÓ o que falar,
// com moldura mínima — a doutrina (leis 1/9/10 de 1ª pessoa, anti-costura, menu) já vive no
// livePrompt e NÃO é re-explicada por injeção (era o grosso do input TEXT rebillado: 250-700
// chars de instrução POR narração). As marcas curtas só apontam a lei que se aplica AGORA.
export function speakPayload(frase, opts = {}) {
    const marks = [];
    if (opts.self)
        marks.push('é VOCÊ — 1ª pessoa, lei 9');
    if (opts.menu)
        marks.push('menu: TODAS as opções, na ordem');
    if (opts.deployClaim)
        marks.push('deploy é relato não verificado — diga que ainda vai confirmar');
    return `FALE${marks.length ? ` (${marks.join('; ')})` : ''}: ${frase}`;
}
// F-135 (lei 2), agora DETERMINÍSTICO (C-092.8): a nota de relato-pendente só viaja quando o
// summary de fato alega publicação/deploy — antes o aviso inteiro (~230 chars) ia em TODO handoff.
const DEPLOY_CLAIM_RE = /\bno ar\b|publicad|deploy|\bem produ[çc][ãa]o\b|\blive\b|\bsubiu\b/i;
// F-110 r3: pergunta ABERTA (prompt livre, sem menu numerado) — ex. "1/3 — Fontes: onde ficam
// overclock-web e brain.html? Path local, URL, ou os dois?". Sem linhas-opção, o caminho r1/r2
// (≥2 opções) fica mudo pra sempre. Detecta linha interrogativa ("...?") ou marcador de passo
// ("1/3 — ...") na PONTA do tail, com as MESMAS proteções r2: só a pergunta mais próxima do fim
// (janela de 3 linhas de conteúdo — pergunta mais funda é scrollback já ultrapassado), tail
// inerte depois dela (tolerando chrome curto de status do CLI, ex. "Worked for 12s"), e o dedup
// narrada/respondida fica no caller (mesmos narratedQuestionHash/answeredQuestionHash do r2).
const OPEN_QUESTION_LINE_RE = /\?\s*$/;
const STEP_MARKER_LINE_RE = /\b\d+\s*\/\s*\d+\s*[—–-]\s*\S/;
// C-092.11 (finding 8, F-110 r3): moldura de TUI box (Claude Code desenha ╭─╮│╰╯ em volta do
// input abaixo da pergunta) é INERTE — sem isto, a linha de moldura >60 chars logo após a
// pergunta zerava a detecção exatamente nos CLIs-alvo.
const TUI_FRAME_LINE_RE = /^[╭╰╯╮│┃─═┌┐└┘┏┓┗┛┤├\s>❯·]+$/u;
export function detectOpenQuestion(tail) {
    const content = tail
        .split('\n')
        .map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
        .filter((l) => l && !INERT_TAIL_LINE_RE.test(l) && !TUI_FRAME_LINE_RE.test(l));
    if (content.length === 0)
        return null;
    let qIdx = -1;
    for (let i = content.length - 1; i >= 0 && i >= content.length - 3; i--) {
        const l = content[i];
        // opção numerada na ponta = menu (caminho r1/r2 do detectPendingQuestion) — não competir.
        if (QUESTION_OPTION_LINE_RE.test(l))
            return null;
        if (OPEN_QUESTION_LINE_RE.test(l)) {
            qIdx = i;
            break;
        }
        // C-092.11 (finding 6, F-110 r3): marcador de passo sozinho ("Passo 2/3 — gerando…",
        // "Step 2/4 - Building image") é PROGRESSO, não pergunta — só conta como pergunta quando
        // há interrogativa na própria linha ou na vizinha imediata. Sem interrogativa, o marcador
        // é o pane TRABALHANDO: nada de pergunta ativa neste tail (nem acima — foi ultrapassada).
        if (STEP_MARKER_LINE_RE.test(l)) {
            const hasQuestionMark = l.includes('?')
                || (content[i - 1] ?? '').includes('?')
                || (content[i + 1] ?? '').includes('?');
            if (hasQuestionMark) {
                qIdx = i;
                break;
            }
            return null;
        }
    }
    if (qIdx === -1)
        return null;
    const qLine = content[qIdx];
    // anti-falso-positivo: precisa parecer PROSA de pergunta, não código/log terminando em "?".
    if (qLine.length < 12 || !/\s/.test(qLine) || !/[a-zA-Zà-úÀ-Ú]{3}/.test(qLine))
        return null;
    // depois da pergunta, só chrome CURTO de status (nunca frase nova terminada em pontuação) —
    // output real depois dela = pergunta já ultrapassada (proteção r2 de tail ativo).
    for (let i = qIdx + 1; i < content.length; i++) {
        const l = content[i];
        if (l.length > 60 || /[.!?…:]$/.test(l))
            return null;
    }
    // contexto: até 2 linhas de cima (pergunta quebrada em linhas / preâmbulo "Faltam gaps...").
    return content.slice(Math.max(0, qIdx - 2), qIdx + 1).join(' ').replace(/\s+/g, ' ').trim().slice(0, 400);
}
class CliAuthError extends Error {
}
function isCliAuthFailure(err) {
    if (err instanceof CliAuthError)
        return true;
    return err instanceof Error && /authentication|unauthorized|not logged in|login|api key|oauth/i.test(err.message);
}
function summarize(result) {
    const flat = result.replace(/\s+/g, ' ').trim();
    return flat.length > 200 ? `${flat.slice(0, 200)}…` : flat;
}
// ── JarvisService ─────────────────────────────────────────────────────────────
export class JarvisService {
    deps;
    busy = false;
    /** C-092.8: 1 one-shot de resumo de voz em voo por vez (composeVoiceSummary). */
    voiceSummaryBusy = false;
    pendingSends = [];
    sdkSessionId = null;
    sdkLive = null;
    alwaysAllowed = new Set();
    pendingConfirmations = new Map();
    pendingCallIds = new Map();
    /** confirmBeforeTools=false matches reference current behavior (UI removed). */
    confirmBeforeTools = false;
    liveSession = null;
    /** F-107 r2: sessão em GRACE — WS quente destacado após o stopLive (o usuário desligou o orb).
     *  Fica FORA do `liveSession` de propósito: toda a lógica de produto lê `liveSession` como
     *  "voz ligada", então durante o grace ela vê "desligada" (correto: mic parado, nada narrado).
     *  O socket só volta a ser `liveSession` num re-toggle rápido (reuso quente, sem reconexão →
     *  prosódia preservada). Expirou → o próprio softStop encerra o WS. */
    graceSession = null;
    /** F-059: última reply do brain no turno corrente — narrada via Live no fim do turno. */
    lastAssistantReply = '';
    /** Memória persistida do Jarvis (C-055) — fatos/preferências sobrevivem a restart. */
    memory;
    /** C-072: turnos falados (Live) recentes — sobrevive à queda/reconexão da GeminiLiveSession
     *  (aquele objeto morre no stopLive; isto não). Cap curto — só pra dar contexto de retomada,
     *  não é histórico persistido (isso é C-055/memory). */
    liveHistory = [];
    static LIVE_HISTORY_MAX = 40;
    /** C-072: timestamp do último stopLive — define a janela de retomada no re-wake. */
    liveDisconnectedAt = null;
    static RESUME_WINDOW_MS = 5 * 60 * 1000;
    /** F-107 r2: janela de grace do stopLive — WS fica vivo pra o re-toggle rápido reusar a MESMA
     *  conexão (native-audio re-sorteia prosódia a cada conexão nova). Curto o bastante pra não
     *  segurar sessão ociosa demais; longo o bastante pra cobrir a pausa entre turnos. */
    static LIVE_GRACE_MS = 90 * 1000;
    /** C-092.9 (DOSE 2) + F-139: sessão Live SOB DEMANDA com DORMÊNCIA — sem interação real (fala
     *  final / tool; mic contínuo NÃO conta) por IDLE_TIMEOUT_MS, a SESSÃO fecha de verdade
     *  (onIdleTimeout: WS e histórico morrem, billing zera) mas o MODO fica armado: orb ligado,
     *  mic local ouvindo, e a PRÓXIMA fala religa transparente (pushLiveMic). 90s da 1ª versão
     *  desligava o modo no meio da conversa e o "religa no wake" não cobria passiveListening=false
     *  (F-139, "parece travado") — janela recalibrada pra 5min (custo de sessão ociosa curta é
     *  baixo com sliding window; a dormência é quem zera o custo de verdade). Trade-off aceito
     *  (Laschuk 2026-07-04): ~1s de latência na 1ª fala pós-dormência. */
    idleTimer = null;
    static IDLE_TIMEOUT_MS = 5 * 60 * 1000;
    /** F-139: sessão fechada por ociosidade com MODO ainda ligado — a próxima fala religa. */
    liveDormant = false;
    /** F-139: argumentos do último startLive — a religa da dormência reconecta com eles
     *  (persona já persiste em livePersona; sem greetOnConnect: religa não cumprimenta). */
    lastLiveArgs = null;
    constructor(deps) {
        this.deps = deps;
        this.memory = new JarvisMemory(() => deps.getSharedMemory?.());
    }
    // ── Gemini Live (F-056) ───────────────────────────────────────────────────────
    /** C-070: persona da Live (nome do usuário/assistente + instruções custom). */
    livePersona;
    /** Inicia a sessão Gemini Live (única — o workspace dado é só o contexto inicial). */
    async startLive(workspace, voiceName, persona) {
        // F-117: wake/mic é recurso compartilhado entre instâncias dev↔prod na mesma máquina —
        // sem mutex, as duas escutam e respondem a mesma fala ("2 Jarvis falando comigo"). Reuso
        // quente (grace) NÃO conta como novo start — já detemos o lock desde o primeiro startLive.
        if (!this.liveSession && !this.graceSession) {
            const lock = acquireWakeLock(isDevSidecarInstance());
            if (!lock.ok) {
                return {
                    ok: false,
                    error: `Jarvis já está ativo na outra instância (${lock.ownerIsDev ? 'dev' : 'produção'}) — desligue o orb lá primeiro.`,
                };
            }
        }
        if (persona)
            this.livePersona = persona;
        // F-139: qualquer start sai da dormência e guarda os args pra próxima religa transparente.
        this.liveDormant = false;
        this.lastLiveArgs = { workspace, voiceName };
        // F-107 r2: reuso QUENTE — o softStop do stopLive deixou um WS vivo em `graceSession`.
        // Promove-o de volta a `liveSession`: é uma CONTINUAÇÃO (mesma conexão, prosódia preservada),
        // não uma reconexão — pula a injeção de contexto do C-072 (a sessão nunca perdeu o fio) e não
        // zera o liveHistory. Grace já expirado/morto → descarta e segue pro caminho normal.
        let warmReuse = false;
        if (this.graceSession) {
            if (this.graceSession.isReusable()) {
                this.liveSession = this.graceSession;
                this.graceSession = null;
                warmReuse = true;
            }
            else {
                // F-138: grace com sessão INELEGÍVEL (stop deliberado marcou stopped, slot singleton
                // perdido, ou WS morto) — reusá-la era a ZUMBI do boot: "reuso quente" logado, chunks
                // de mic pro vácuo, zero resposta. Descarta COM stop() (mata WS/timers que sobraram;
                // idempotente) e segue pra conexão fresh.
                process.stderr.write('[gemini-live] grace descartado (inelegível: stopped/slot/WS) → conexão fresh (F-138)\n');
                this.graceSession.stop();
                this.graceSession = null;
            }
        }
        if (!this.liveSession) {
            this.liveSession = new GeminiLiveSession({
                getGoogleKey: () => this.deps.getGoogleKey(),
                // C-072: intercepta os transcripts finais pra alimentar o liveHistory (sobrevive
                // à morte deste objeto no próximo stopLive) — forward intacto pro renderer.
                emit: (event) => {
                    if (event.type === 'live_transcript' && event.text.trim()) {
                        // F-114 r2: captura em TODO chunk (parcial ou final) — o toolCall do modelo pode
                        // chegar antes do turnComplete=true; esperar só a fala FINAL deixava o gate testar
                        // string stale/vazia do turno anterior. `inputTranscription` chega como texto
                        // acumulado do turno corrente, então sobrescrever a cada chunk já reflete o dito
                        // até aqui.
                        if (event.role === 'user')
                            this.lastUserLiveUtterance = event.text.trim();
                        if (event.final) {
                            this.liveHistory.push({ role: event.role, text: event.text.trim(), createdAt: Date.now() });
                            if (this.liveHistory.length > JarvisService.LIVE_HISTORY_MAX)
                                this.liveHistory.shift();
                            this.armIdleTimer(); // C-092.7 (d): turno real de fala = sessão ativa; adia a ociosidade
                            // C-085 r3: fala FINAL do usuário com pergunta pendente narrada num pane rastreado
                            // é POR CONSTRUÇÃO a continuação daquele diálogo — roteia técnico, não pelo modelo.
                            if (event.role === 'user')
                                void this.maybeRouteAnswerToPendingQuestion(event.text.trim());
                        }
                    }
                    this.deps.emit(event);
                },
                // Sessão única cross-workspace: a função roda no workspace ATIVO no
                // momento da chamada, não no congelado quando a Live conectou.
                runFunction: (name, args) => this.runLiveFunction(this.deps.getWorkspace(), name, args),
                // C-055: memória persistida entra no system prompt da voz — sem editar o
                // jarvisLivePrompt (a voz não tem tool de memória própria: gravar/esquecer
                // passa pelo 'delegar' → brain, que tem memory_remember/memory_forget).
                getLivePrompt: (workspace) => {
                    const memBlock = this.memory.contextBlock();
                    const memHint = this.memory.available
                        ? '\n\nPra GRAVAR fato/preferência novo dito pelo usuário ou ESQUECER um ("esquece isso"), use delegar com briefing "lembre que ..." / "esqueça ...".'
                        : '';
                    return getLivePrompt(workspace, this.livePersona) + (memBlock ? `\n\n${memBlock}` : '') + memHint;
                },
            });
        }
        // C-072: re-wake dentro da janela de retomada → injeta as últimas falas + a pergunta
        // pendente do PRÓPRIO Jarvis (não só transcript do usuário) ANTES do greet — pendingContext
        // é FIFO, então a ordem de push aqui vira a ordem de flush no setupComplete.
        // F-107 r2: só na RECONEXÃO real (a sessão morreu). No reuso quente (grace) a conexão está
        // viva e o modelo não perdeu contexto — injetar "[reconexão]" seria fantasma.
        const withinResumeWindow = this.liveDisconnectedAt !== null
            && (Date.now() - this.liveDisconnectedAt) < JarvisService.RESUME_WINDOW_MS;
        if (!warmReuse && withinResumeWindow && this.liveHistory.length > 0) {
            const recent = this.liveHistory.slice(-6);
            const transcript = recent.map((m) => `${m.role === 'user' ? 'Usuário' : 'Você'}: ${m.text}`).join('\n');
            const lastAssistant = [...this.liveHistory].reverse().find((m) => m.role === 'assistant');
            const pendingNote = lastAssistant
                ? ` Sua ÚLTIMA fala antes da queda foi: "${lastAssistant.text}". Se a próxima fala do usuário for uma resposta curta e direta a ela (um valor, um nome, "sim"/"não", uma palavra solta), trate como RESPOSTA a essa pergunta pendente — NÃO pergunte de novo, NÃO reinterprete como outro comando (ex. navegação de workspace).`
                : '';
            this.liveSession.injectContext(`[reconexão] A sessão de voz caiu e reconectou dentro da janela de continuidade — RETOME a conversa, não recomece do zero. Últimas falas antes da queda:\n${transcript}${pendingNote}`);
        }
        else if (!warmReuse && this.liveHistory.length > 0) {
            // Fora da janela: começa limpo — sem contexto velho fantasma (item 3 do dossiê).
            this.liveHistory = [];
        }
        // C-092.9 (DOSE 2): reabertura SOB DEMANDA — a sessão nova (não reuso quente) nasce sabendo o
        // MÍNIMO pra ser útil na 1ª fala: tela atual em 1 linha + âncora de missão. Nunca o histórico
        // morto (esse morreu no idle-end; o C-072 acima só cobre retomada com histórico ainda vivo).
        // Gate `liveHistory.length === 0`: é o sinal confiável de "nasceu limpo" (o onIdleTimeout zera
        // e nada repõe; liveDisconnectedAt NÃO serve — o eco-stop do renderer o re-carimba) e garante
        // que esta injeção é o caso ELSE da retomada C-072 — nunca as duas juntas.
        if (!warmReuse && this.liveHistory.length === 0 && this.lastScreen) {
            const anchor = this.lastScreenMissionId ? ` — MISSÃO ${this.screenMissionLabel()} aberta` : '';
            this.liveSession.injectContext(`[update] Tela do usuário agora: ${voiceSafeText(this.lastScreen)}${anchor}`);
        }
        // C-070: wake=HIT → saudação falada ao conectar. Enfileirado ANTES do start —
        // o injectContext guarda em pendingContext e o flush roda no setupComplete.
        if (persona?.greetOnConnect) {
            const who = persona.userName?.trim();
            this.liveSession.injectContext(`[wake] O usuário acabou de te acordar pela wake word. Cumprimente-o AGORA em voz alta: diga exatamente "Olá${who ? `, ${who}` : ''}." e nada mais; depois aguarde o pedido.`);
        }
        this.armIdleTimer(); // C-092.7 (d): sessão nova/reusada nasce com o relógio de ociosidade armado
        return this.liveSession.start(workspace, voiceName);
    }
    /**
     * Para a sessão Gemini Live. F-107 r2: parada SUAVE — DESTACA o socket pra `graceSession` e o
     * mantém vivo por LIVE_GRACE_MS. `liveSession` volta a null (a lógica de produto vê "voz
     * desligada", como antes), mas um re-toggle rápido do orb promove o socket de volta e reusa a
     * MESMA conexão — o native-audio não re-sorteia a prosódia. Expirou sem reuso → o próprio
     * softStop encerra o WS; o startLive seguinte descarta o `graceSession` morto e reconecta.
     */
    stopLive() {
        // F-139: parada (deliberada ou de erro) mata a dormência — o modo caiu, não há o que religar
        // por fala; a volta é pelo orb/wake como sempre.
        this.liveDormant = false;
        if (this.liveSession) {
            // Se já havia um grace pendente (raro — dois off seguidos), encerra o antigo de vez.
            this.graceSession?.stop();
            this.graceSession = this.liveSession;
            this.liveSession = null;
            this.graceSession.softStop(JarvisService.LIVE_GRACE_MS);
        }
        else {
            // F-117: sem sessão viva nem grace pra reter o lock (softStop expirado/nunca ligou) —
            // libera o wake pra outra instância poder assumir. Só remove se ESTA instância é a dona
            // (releaseWakeLock confere PID) — nunca derruba a posse alheia.
            if (!this.graceSession)
                releaseWakeLock();
        }
        // C-092.7 (d): parada = sem sessão pra vigiar. O timer religa no próximo startLive.
        this.clearIdleTimer();
        // C-072: marca a queda — startLive() decide se o próximo wake retoma ou começa limpo.
        this.liveDisconnectedAt = Date.now();
    }
    /** C-092.7 (d): (re)arma o timer de ociosidade — chamado a cada TURNO real (fala final / tool). */
    armIdleTimer() {
        if (this.idleTimer)
            clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.onIdleTimeout(), JarvisService.IDLE_TIMEOUT_MS);
    }
    clearIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }
    /** C-092.9 (DOSE 2) + F-139: sessão viva parada por IDLE_TIMEOUT_MS sem interação → DORMÊNCIA.
     *  A SESSÃO fecha de verdade (sem grace — o grace F-107 é pro re-toggle deliberado do orb):
     *  WS morre, histórico morre, próxima sessão nasce instância nova (resumeHandle zerado, nada
     *  a rebillar). O MODO fica armado: NÃO emite 'ended' (derrubaria o jarvisMode; com
     *  passiveListening=false o usuário ficava sem rota de volta — o "parece travado" do F-139),
     *  NÃO libera o wake lock (F-117: esta instância segue dona do mic local que continua
     *  ouvindo). A próxima fala religa transparente em pushLiveMic. */
    onIdleTimeout() {
        this.idleTimer = null;
        if (!this.liveSession)
            return;
        process.stderr.write(`[jarvis-tokens] sessão Live ociosa ${Math.round(JarvisService.IDLE_TIMEOUT_MS / 60000)}min sem interação — dormência (F-139): sessão e histórico morrem, modo fica armado; próxima fala religa\n`);
        const session = this.liveSession;
        this.liveSession = null;
        session.stop();
        // Histórico morto NÃO volta: o C-072 (retomada no re-wake) só re-injeta o que estiver aqui.
        this.liveHistory = [];
        this.liveDisconnectedAt = null;
        this.liveDormant = true;
        // o stop() acima emitiu 'closed' (renderer: state=idle, modo intacto); restaura o visual de
        // escuta — a dormência é invisível pro usuário: localmente o Jarvis ESTÁ ouvindo.
        this.deps.emit({ type: 'live_state', state: 'listening' });
    }
    /** Encaminha um chunk PCM (Int16, 16kHz mono) do mic do renderer pro WS Live.
     *  F-139: chunk com sessão DORMENTE religa transparente — o gate de VAD do renderer
     *  (liveMicGate, C-092.10) só envia chunk com fala real, então chunk aqui = usuário falando.
     *  startLive cria a instância SINCRONAMENTE; este e os próximos chunks entram no pendingMic
     *  (C-071.1c) e fazem flush no setupComplete — nada da 1ª frase se perde (~1s de latência,
     *  trade-off aceito). Sem greet: religa não cumprimenta, só responde ao que foi dito. */
    pushLiveMic(chunk) {
        if (!this.liveSession && this.liveDormant && this.lastLiveArgs) {
            this.liveDormant = false;
            process.stderr.write('[jarvis-tokens] fala com sessão dormente — religando Live transparente (F-139)\n');
            void this.startLive(this.lastLiveArgs.workspace, this.lastLiveArgs.voiceName);
        }
        this.liveSession?.pushMic(chunk);
    }
    endLiveMicTurn() {
        this.liveSession?.endMicTurn();
    }
    // ── Contexto de tela (C-056.1) ────────────────────────────────────────────────
    lastScreen = '';
    /** F-094 r2: missão aberta NA TELA (undefined = grid/home/sem missão) — escopa o
     *  inventário de panes (consultar/pane_list/ler) à missão que o usuário está vendo. */
    lastScreenMissionId;
    /** F-130: TÍTULO da missão na tela (o que o usuário VÊ, ex. "Landing premium") — toda linha
     *  FALÁVEL cita o título, nunca o id nanoid (C-062: a voz não soletra código). Extraído do
     *  texto do reporter (contrato com useScreenReporter.ts — SCREEN_MISSION_TITLE_RE);
     *  undefined = sem título (fallback: id, comportamento antigo). */
    lastScreenMissionTitle;
    /** F-102: panes VISÍVEIS na tela reportados pelo renderer (ids reais, ex. "pane-331") +
     *  o pane FOCADO. Fonte determinística do que o usuário efetivamente vê — o escopo
     *  mission-only do pane_list pode estar stale/vazio enquanto um pane está aberto na frente
     *  dele. `comandar`/`withWorkspaceContext` resolvem contra estes, não contra suposição. */
    lastScreenVisiblePaneIds = [];
    lastScreenFocusedPaneId;
    /** F-118: true quando a tela reportada é a HOME GLOBAL (lista de workspaces) — distingue de
     *  "workspace aberto sem missão na tela". Consultar/contexto do brain devolvem SÓ a lista de
     *  workspaces na home, nunca missões/panes de um workspace que não está mais na tela. */
    isGlobalHomeScreen = false;
    /** F-118: nomes reais dos workspaces mostrados na HOME — rotulados no payload (dado, não
     *  instrução) pra o Jarvis reconhecer TODOS os itens da lista, não só "alguns". */
    homeWorkspaceNames = [];
    /** C-090.2: missões REAIS da TELA GRID (workspace sem missão focada) — status real
     *  (live = tem pane vivo agora) + quantos panes salvos (C-091) cada uma tem. Mesmo
     *  padrão do homeWorkspaceNames: dado do renderer, rotulado, sem o Jarvis inferir. */
    lastScreenGridMissions = [];
    /** F-099 r2: com missão ATIVA na tela, um pedido de trabalho é delegado ao pane
     *  orquestrador DELA (pane_write) — o delegar é TERMINAL. Este flag vira true assim
     *  que o brain delega no turno; enquanto true, o gate NEGA navigate p/ abrir wizard
     *  (mission-new, wizard-set, wizard-fire, run-agentic, run-squad) — o brain não pode
     *  delegar E TAMBÉM reabrir o wizard agêntico no mesmo turno (delegar XOR wizard).
     *  Resetado a cada turno do brain. */
    delegatedThisTurn = false;
    /** F-105: texto RAW do pedido do usuário no turno corrente (o que entrou em send/delegar).
     *  O gate FORÇA o pane_write do brain a carregar ISTO verbatim, não a paráfrase do haiku —
     *  brain = roteador fino (escolhe o pane), fidelidade do payload é técnica, não de prompt.
     *  Em request grande o haiku resumia e o pane recebia versão lossy. */
    pendingDelegationText = null;
    /** F-109: 1 pane_write por turno de delegar — o segundo write (pane espúrio recebendo
     *  o mesmo prompt do piloto correto) é o duplicado observado no trace. Resetado junto
     *  com pendingDelegationText a cada turno. */
    delegationPaneWriteDone = false;
    /** F-114: fala FINAL do usuário no turno de voz corrente (Live inputTranscription) — o gate
     *  de intent do 'navegar' testa este texto, não a decisão do modelo Live, pra saber se o
     *  pedido é LITERALMENTE de missão/wizard ou um pedido de trabalho que o Live mapeou errado. */
    lastUserLiveUtterance = '';
    /** F-114: true assim que 'navegar' abre o wizard (mission-new) com sucesso — enquanto ligado,
     *  o walk LEGÍTIMO dentro do wizard (wizard-set/wizard-fire/run-agentic/run-squad) segue livre
     *  do gate de intent (só a ABERTURA exige a fala conter token de missão). Navegar pra fora do
     *  wizard (home/back/mission/workspace/screen/pane) desarma. */
    liveWizardOpen = false;
    /** F-101: panes a que o brain do Jarvis delegou trabalho (via pane_write / squad_open /
     *  spawn). Quando um deles submete um handoff (o pane TERMINOU), o Jarvis narra
     *  proativamente — fechando a promessa do 'delegar' ("vou narrar quando houver
     *  novidades"). Sem isso, o sinal pane-done acorda o orquestrador (wireCallerMapListener)
     *  mas NUNCA a camada de voz, e o Jarvis ficava mudo até o usuário perguntar. */
    delegatedPanes = new Set();
    /** F-101: o listener de handoff→narração é ligado UMA vez (registry vive o processo). */
    handoffNarrationWired = false;
    /** F-110: timer único de poll dos panes delegados em busca de pergunta pendente (sem
     *  handoff — AskUserQuestion nativo do CLI não passa pelo HandoffRegistry). Ligado sob
     *  demanda no primeiro delegar, igual ao handoffNarrationWired. */
    questionPollTimer = null;
    static QUESTION_POLL_MS = 8_000;
    /** F-110: última pergunta narrada por pane (dedup — só narra de novo se o conteúdo mudou). */
    narratedQuestionHash = new Map();
    /** C-092.11 (finding 3): QUANDO cada pergunta foi narrada — pergunta narrada há mais que o TTL
     *  sem resposta não intercepta mais a fala do usuário (o diálogo esfriou; fluxo normal decide). */
    narratedQuestionAt = new Map();
    static NARRATED_QUESTION_TTL_MS = 3 * 60 * 1000;
    /** F-110 r2: hash da última pergunta JÁ RESPONDIDA por pane (usuário mandou a resposta via
     *  `comandar`) — sobrevive mesmo que o mesmo menu velho reapareça no re-poll (scrollback com
     *  pouco output novo). Sem isso, o dedup em `narratedQuestionHash` (limpo só no handoff) não
     *  cobre o ciclo "narrada → respondida → re-detectada", e o Jarvis renarra a pergunta antiga. */
    answeredQuestionHash = new Map();
    /** F-110 r3: pergunta ABERTA candidata vista no poll ANTERIOR por pane — só narra quando o
     *  MESMO conteúdo estabiliza em dois polls consecutivos (~16s), mesma construção anti-spam do
     *  lastProgressSig (C-085): streaming que por acaso termina em "?" muda entre polls e nunca
     *  estabiliza, então não vira narração fantasma. */
    pendingOpenQuestionHash = new Map();
    /** C-085 r3: dedup do roteamento determinístico de resposta a pergunta pendente — a MESMA
     *  fala chega 2x (o interceptor de transcript roteia primeiro; o modelo Live ainda pode chamar
     *  perguntar/comandar/delegar com o mesmo conteúdo). Janela curta: função com texto equivalente
     *  vira ack, sem 2º pane_write. */
    routedAnswerPaneId = null;
    routedAnswerText = '';
    routedAnswerAt = 0;
    static ROUTED_ANSWER_DEDUP_MS = 15_000;
    /** C-085: assinatura do tail lido no poll ANTERIOR por pane. O progresso só é narrado quando a
     *  assinatura ESTABILIZA entre dois polls (~16s) — spinner/streaming muda a cada poll e nunca
     *  estabiliza, então não vira spam. */
    lastProgressSig = new Map();
    /** C-085: último estado de progresso JÁ narrado por pane (dedup — não repete o mesmo estado). */
    narratedProgressSig = new Map();
    /** C-085.2: squadRole real (registry F-111: 'orchestrator'=piloto, 'builder'=chefe) do pane que
     *  o Jarvis delegou — narrações citam "o chefe"/"o piloto" em vez de "um pane" genérico
     *  (requisito Laschuk 2026-07-03: "ele tem que reconhecer q é um chefe aquele cara"). */
    delegatedPaneRole = new Map();
    /** C-085.2: workers de um chefe/piloto delegado já narrados como HOP (repasse) — chefePaneId ->
     *  Set(workerPaneId). Evita renarrar o mesmo repasse a cada poll de 8s. */
    narratedHopWorkers = new Map();
    /** C-085.2: workerPaneId -> chefePaneId que o spawnou — narra a ENTREGA voltando pra cadeia
     *  ("o pesquisador terminou, o chefe tá revisando") quando o worker submete handoff. */
    hopWorkerChefe = new Map();
    /** F-118.1: missão que estava NA TELA (lastScreenMissionId) no momento em que o pane foi
     *  delegado — a ORIGEM do evento. Narração proativa persiste enquanto o usuário segue na
     *  MESMA interface; ao sair, eventos daquela origem são descartados (unsubscribe implícito
     *  por navegação, não fila-pra-depois). Decisão Laschuk 2026-07-03. */
    delegatedPaneMissionId = new Map();
    /** C-050.4 (episódio 2026-07-04 "o pane responde e o Jarvis leva horas pra se dar conta"):
     *  panes com resposta AGUARDADA — o usuário perguntou explicitamente ('perguntar'), acabou
     *  de responder uma pergunta pendente ('comandar' pós-F-110) ou teve a resposta roteada
     *  técnica (C-085 r3). Poll curto dedicado (1,5s) SÓ nesses panes até a resposta chegar
     *  (conteúdo novo ≠ baseline, estável por 2 ticks ≈ 3s); o poll de 8s + estabilização de
     *  ~16s (QUESTION_POLL_MS + maybeNarrateProgress) segue INTOCADO pro progresso espontâneo. */
    awaitedAnswer = new Map();
    awaitedAnswerTimer = null;
    static ANSWER_POLL_MS = 1_500;
    static ANSWER_POLL_MAX_MS = 120_000;
    /** F-130: contrato com o texto do reporter de missão (useScreenReporter.ts) — o título
     *  viaja DENTRO do texto porque o transporte Tauri (shim/core) derruba campos novos. */
    static SCREEN_MISSION_TITLE_RE = /— MISSÃO "(.+)" aberta \(\d+ panes desta missão\)$/;
    /** F-130: rótulo FALÁVEL da missão na tela — o título entre aspas quando conhecido.
     *  C-092.11 (finding 9): sem título resolvível, fallback FALÁVEL "a missão aberta na tela" —
     *  NUNCA o id nanoid (a voz não soletra código, C-062) e nunca string vazia (o label lido
     *  pós-await podia virar '' e a fala saía "Situação da missão :"). */
    screenMissionLabel() {
        return this.lastScreenMissionTitle ? `"${this.lastScreenMissionTitle}"` : 'a missão aberta na tela';
    }
    /** Tela visível reportada pelo renderer — vira contexto da Live ([update]) e do brain.
     *  F-102: recebe também os panes visíveis + o pane focado (ids reais) — o estado de tela
     *  percebido passa a refletir o pane que o usuário tem aberto na frente, não só a missão. */
    updateScreen(text, missionId, visiblePaneIds, focusedPaneId, isHome, workspaceNames) {
        const t = (text || '').trim().slice(0, 300);
        const home = isHome === true;
        const names = Array.isArray(workspaceNames) ? workspaceNames.filter((n) => typeof n === 'string') : [];
        // F-118: HOME GLOBAL zera missão/panes herdados do último workspace visto — sem isso o
        // consultar respondia com missões/panes de um workspace que não está mais na tela.
        const effMissionId = home ? undefined : missionId;
        // F-130: título vem DENTRO do texto do reporter — parse no texto CRU (antes do slice de 300);
        // título igual ao id (fallback do renderer p/ missão fora do store) conta como "sem título".
        const parsedTitle = effMissionId ? (text || '').trim().match(JarvisService.SCREEN_MISSION_TITLE_RE)?.[1] : undefined;
        const effMissionTitle = parsedTitle && parsedTitle !== effMissionId ? parsedTitle : undefined;
        const vis = home ? [] : (Array.isArray(visiblePaneIds) ? visiblePaneIds.filter((id) => typeof id === 'string') : []);
        const foc = home ? undefined : (typeof focusedPaneId === 'string' && focusedPaneId ? focusedPaneId : undefined);
        const paneChanged = vis.join(',') !== this.lastScreenVisiblePaneIds.join(',')
            || foc !== this.lastScreenFocusedPaneId;
        // F-116: TELA mudou (t/missionId) é evento de NAVEGAÇÃO — narrável. Pane abrir/fechar só
        // muda `paneChanged` (o mesmo useEffect do reporter reemite no re-render) e NÃO é navegação
        // — o Jarvis narrava "mudou pra workspace" fantasma porque tratava as duas causas igual.
        // F-118: entrar/sair da HOME GLOBAL também conta como troca de tela, mesmo que o texto e
        // o missionId (sempre undefined na home) não mudem.
        const screenChanged = t !== this.lastScreen || effMissionId !== this.lastScreenMissionId
            || home !== this.isGlobalHomeScreen;
        if (!t || (!screenChanged && !paneChanged))
            return;
        // F-108 r2: breadcrumb do ciclo de vida do lastScreenMissionId — prova ao vivo que o
        // renderer emite missionId em navegação normal (clique na sidebar), não só via voz/wizard.
        if (effMissionId !== this.lastScreenMissionId) {
            process.stderr.write(`[jarvis-screen] lastScreenMissionId ${this.lastScreenMissionId ?? 'undefined'} -> ${effMissionId ?? 'undefined'}\n`);
        }
        // F-127: breadcrumb de TELA — home↔workspace-sem-missão tem missionId undefined dos dois
        // lados e ficava invisível no log; sem isto não dá pra distinguir "reporter não emitiu"
        // de "payload home se perdeu" quando o consultar erra a tela.
        if (screenChanged) {
            process.stderr.write(`[jarvis-screen] tela: "${t.slice(0, 60)}" home=${home} mission=${effMissionId ?? '-'}\n`);
        }
        this.isGlobalHomeScreen = home;
        this.homeWorkspaceNames = home ? names : [];
        this.lastScreen = t;
        this.lastScreenMissionId = effMissionId;
        this.lastScreenMissionTitle = effMissionTitle; // F-130: título falável acompanha a âncora
        this.lastScreenVisiblePaneIds = vis;
        this.lastScreenFocusedPaneId = foc;
        // C-090.2: saiu do grid (foi pra home ou entrou numa missão) — o cache de missões/status
        // fica stale; zera pra `consultar` não narrar dado de uma tela que não está mais visível.
        if (home || effMissionId)
            this.lastScreenGridMissions = [];
        // F-116: só injeta turno FALÁVEL na Live quando a TELA de fato mudou. Mutação de grid
        // (pane add/remove) sem troca de tela atualiza o estado acima (pull-based, lido por
        // consultar/pane_spawn/pane_write) SEM gerar narração — nada de [update] pro Live nesse caso.
        if (!screenChanged)
            return;
        // injeta só com sessão viva (injectContext enfileiraria updates stale numa sessão fechada).
        // C-062: voice-safe — a tela pode conter wake de handoff com sintaxe mcp__/JSON; a voz
        // nunca soletra código, então o contexto falável recebe só a parte humana.
        // C-092.7 (b): [update] de tela vai pelo caminho COALESCIDO — a rajada do wizard emitia 6
        // quase-idênticos, cada um uma geração rebillando o contexto. injectScreenUpdate debounce +
        // dedup: só o ÚLTIMO estado vira turno (comportamento preservado, custo cortado).
        if (this.liveSession)
            this.liveSession.injectScreenUpdate(`[update] Tela do usuário agora: ${voiceSafeText(t)}`);
    }
    /** Última tela reportada — o send() injeta no contexto de cada turno do brain. */
    getScreen() {
        return this.lastScreen;
    }
    /** C-090 (contrato de screen-state, pilar 3 — READ-BACK): espera a TELA de fato mudar
     *  depois de uma ação que deveria trocá-la (abrir workspace/missão/pane). Resolve `true`
     *  quando o screen-state reportado pelo renderer sai de `beforeScreen` dentro do timeout;
     *  `false` se a tela nunca mudou (ação sem efeito real — NÃO anuncie sucesso). Reusa o
     *  próprio sinal determinístico de tela (updateScreen), sem plumbing de ack novo — é a
     *  primitiva genérica de read-back que as fatias .2-.4 chamam pra qualquer ação com efeito
     *  de tela, generalizando o ack round-trip do wizard (F-091/F-120). */
    async awaitScreenChange(beforeScreen, timeoutMs = 2000) {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            if (this.lastScreen !== beforeScreen)
                return true;
            await new Promise((resolve) => setTimeout(resolve, 80));
        }
        return this.lastScreen !== beforeScreen;
    }
    /** C-090.3 (contrato de screen-state, fatia MISSÃO — aplica o desenho de C-090.1 à tela de
     *  missão): ENTIDADES reais visíveis nela — panes ATIVOS (papel real F-111 + status) + panes
     *  SALVOS (C-091) — e as AÇÕES disponíveis (delegar/perguntar/restaurar/voltar), no mesmo
     *  formato rotulado do homeLine. Sem missão ancorada, string vazia (nada a reportar). */
    async buildMissionEntitiesLine(workspace) {
        const missionId = this.lastScreenMissionId;
        if (!missionId)
            return '';
        try {
            const [liveResult, saved] = await Promise.all([
                this.runTool(workspace, 'pane_list', { missionId }),
                this.deps.loadSavedPanes
                    ? this.deps.loadSavedPanes(workspace, missionId).catch(() => [])
                    : Promise.resolve([]),
            ]);
            const panes = parseHumanResult(liveResult)?.panes ?? [];
            const liveList = panes.length
                ? panes.map((p) => `${p.paneId} (${savedPaneRoleWord(p)}, ${p.status ?? 'desconhecido'})`).join(', ')
                : 'nenhum';
            const savedList = saved.length
                ? saved.map((p) => `${p.paneId} (${savedPaneRoleWord(p)}) — salvo`).join(', ')
                : '';
            const entities = `panes ativos: ${liveList}${savedList ? `; panes salvos: ${savedList}` : ''}`;
            return `\n[TELA MISSÃO ${this.screenMissionLabel()} — ENTIDADES reais visíveis: ${entities}. AÇÕES disponíveis: delegar (mandar trabalho ao pane orquestrador da missão), perguntar (repassar pergunta a um pane específico), restaurar (reabrir panes salvos), voltar (sair da missão). Só afirme/comande um pane que está NESTA lista — um alvo fora dela NÃO existe: negue citando os que existem.]`;
        }
        catch {
            // best-effort — sem este bloco, o brain ainda tem missionLine/paneLine (degrada, não quebra).
            return '';
        }
    }
    /** C-090.2/C-091: status REAL (live = tem pane vivo agora) + panes salvos de cada missão do
     *  workspace — fonte única reusada tanto pelo PUSH por turno (buildGridEntitiesLine) quanto
     *  pelo `consultar` sob demanda, pra nunca divergir. */
    async gridMissionRows(workspace) {
        const missionsResult = await this.runTool(workspace, 'mission_list', {});
        const missions = parseHumanResult(missionsResult)?.missions ?? [];
        return Promise.all(missions.map(async (m) => {
            const [liveResult, saved] = await Promise.all([
                this.runTool(workspace, 'pane_list', { missionId: m.id }),
                this.deps.loadSavedPanes
                    ? this.deps.loadSavedPanes(workspace, m.id).catch(() => [])
                    : Promise.resolve([]),
            ]);
            const livePanes = parseHumanResult(liveResult)?.panes ?? [];
            return { id: m.id, title: m.title, live: livePanes.length > 0, savedCount: saved.length };
        }));
    }
    /** C-090.2 (contrato de screen-state, fatia GRID — aplica o desenho de C-090.1 ao workspace
     *  sem missão focada): ENTIDADES reais — missões com status REAL (ativa = tem pane vivo
     *  agora; parada = não tem) + panes salvos (C-091) de cada uma — e as AÇÕES disponíveis
     *  (abrir missão, nova missão, spawnar pane, restaurar). Fecha F-118 caso 3 (missão parada
     *  narrada como aberta) e a lacuna de panes salvos fora de uma missão já aberta. Só roda
     *  fora da home e sem missão ancorada (senão a .1/.3 já cobrem a tela). */
    async buildGridEntitiesLine(workspace) {
        if (this.isGlobalHomeScreen || this.lastScreenMissionId)
            return '';
        try {
            // C-090.1 r2 (REABERTO ao vivo — travamento de turno, suspeita no PUSH async): esta
            // fatia soma mission_list + N missões × (pane_list + loadSavedPanes) — mais round-trips
            // que buildMissionEntitiesLine. Timeout curto degrada pra "sem bloco" em vez de travar
            // o turno inteiro esperando o workspace inteiro responder.
            const timeout = new Promise((resolve) => setTimeout(() => resolve([]), 2500));
            const rows = await Promise.race([this.gridMissionRows(workspace), timeout]);
            this.lastScreenGridMissions = rows;
            if (rows.length === 0)
                return '';
            const list = rows
                .map((r) => `"${r.title}" (${r.live ? 'ativa' : 'parada'}${r.savedCount > 0 ? `, ${r.savedCount} pane(s) salvo(s)` : ''})`)
                .join(', ');
            return `\n[TELA GRID (workspace sem missão focada) — ENTIDADES reais: missões: ${list}. AÇÕES disponíveis: abrir uma missão desta lista, criar nova missão, spawnar um pane, restaurar panes salvos de uma missão parada. Responda o status REAL de cada missão (ativa = tem pane rodando agora; parada = não tem) — NUNCA diga "aberta" pra uma missão parada; só afirme/abra o que está NESTA lista.]`;
        }
        catch {
            // best-effort — sem este bloco, o brain ainda tem o consultar sob demanda (degrada, não quebra).
            return '';
        }
    }
    /**
     * Executa uma função da voz Live: 'delegar' encaminha o briefing pro brain
     * Agent SDK (send) e retorna confirmação imediata; 'navegar'/'ler'/'consultar'
     * respondem direto via runTool (sem passar pelo LLM — resposta de voz rápida).
     */
    async runLiveFunction(workspace, name, args) {
        const detail = typeof args['briefing'] === 'string' ? args['briefing']
            : typeof args['query'] === 'string' ? args['query']
                : typeof args['pergunta'] === 'string' ? args['pergunta']
                    : typeof args['paneId'] === 'string' ? `pane ${args['paneId']}` : '';
        blog(`live-fn: ${name} "${detail.slice(0, 80)}"`);
        this.armIdleTimer(); // C-092.7 (d): tool call é interação real — adia a ociosidade da sessão
        const result = await this.runLiveFunctionInner(workspace, name, args);
        blog(`live-fn: ${name} → ${result.replace(/\s+/g, ' ').slice(0, 100)}`);
        try {
            this.deps.emit({
                type: 'activity',
                activity: {
                    id: randomUUID(),
                    fn: name,
                    workspace: basename(workspace) || workspace,
                    detail: detail.slice(0, 140),
                    outcome: result.slice(0, 200),
                    ok: !/^erro|^não achei|nenhum|inválid|desconhecid|ignorado/i.test(result.trim()),
                    createdAt: Date.now(),
                },
            });
        }
        catch { /* observabilidade não pode quebrar o fluxo */ }
        return result;
    }
    /** C-086 r2: ack natural em 1ª pessoa (lei 1/9 — nunca etiqueta de sistema tipo "Enviado.").
     *  Variação leve entre chamadas pra não virar tique de fala; sem ecoar o pedido. */
    static pickAck(variants) {
        return variants[Math.floor(Math.random() * variants.length)];
    }
    async runLiveFunctionInner(workspace, name, args) {
        if (name === 'delegar') {
            const briefing = typeof args['briefing'] === 'string' ? args['briefing'] : JSON.stringify(args);
            // C-085 r3: mesma fala já roteada tecnicamente ao pane com pergunta pendente — ack, sem duplicar.
            // C-092.11 (findings 1/5): delegar não nomeia pane — exige que o pane roteado ainda seja da
            // interface atual; ack via pickAck (sem tique literal).
            if (this.wasAnswerJustRouted(briefing) && this.routedAnswerPaneOnScreen()) {
                return JarvisService.pickAck(['Pera aí, deixa eu ver…', 'Já mandei, tô de olho.', 'Tá indo — já te falo.']);
            }
            // Sem checagem de busy: send() ENFILEIRA se ocupado (nada de "servidor ocupado").
            void this.send({ text: briefing, workspacePath: workspace }).catch(() => { });
            // C-086 r2 (Laschuk: "DETESTO ELE DIZER ENVIADO! ele deveria dizer, ok.. vamos ver.."):
            // ack natural em 1ª pessoa, sem ecoar o pedido, sem etiqueta de sistema; o resultado
            // chega depois via narração do [update]. Só compromisso ("deixa comigo"), nunca status
            // inventado (lei 1 — o send() foi só ENFILEIRADO aqui).
            return JarvisService.pickAck(['Ok, vamos ver…', 'Deixa comigo.', 'Tá, já olho isso.', 'Fechou, já te conto.']);
        }
        if (name === 'navegar') {
            const target = typeof args['target'] === 'string' ? args['target'] : '';
            const query = typeof args['query'] === 'string' ? args['query'] : '';
            // F-057 (+wizard-cancel F-120): mission-new/wizard-fire/wizard-cancel dirigem o wizard
            // sem query; os demais exigem.
            const NO_QUERY_TARGETS = new Set(['mission-new', 'wizard-fire', 'wizard-cancel', 'home', 'back']);
            if (!target || (!query && !NO_QUERY_TARGETS.has(target))) {
                return 'Para navegar preciso de target (workspace/mission/mission-new/screen/pane/wizard-set/wizard-fire/wizard-cancel) e query (exceto mission-new/wizard-fire/wizard-cancel).';
            }
            // F-114: gate de INTENT na ENTRADA do wizard agêntico. O modelo Live decide sozinho o
            // target — sem isto, "cria uma landing page" (pedido de TRABALHO) e "cria uma nova
            // missão" (pedido de MISSÃO) são indistinguíveis pro gate F-099 (que só bloqueia
            // wizard APÓS delegar no mesmo turno). Exige que a FALA do usuário que disparou o
            // turno contenha token literal de missão — só na ABERTURA (wizard ainda não aberto);
            // o walk legítimo DENTRO do wizard já aberto segue livre.
            const WIZARD_OPEN_TARGETS = new Set(['mission-new', 'wizard-set', 'wizard-fire', 'run-agentic', 'run-squad']);
            // F-119: o wizard "já aberto" NÃO pode depender só de `liveWizardOpen` — esse flag só
            // liga quando FOI o próprio 'navegar' da Live que abriu. Quando o wizard sobe por OUTRO
            // caminho (o brain Agent SDK chamou a tool navigate no 'delegar' — o caso do trace: "abre
            // uma nova missão" virou send→brain→navigate, nunca passou por aqui), o flag fica false e
            // TODO passo do walk por voz ("mode:livre", "count:4") caía no gate e era negado — o
            // assistente ficava "mudo"/travado dentro da Nova Missão. A tela reportada pelo renderer
            // (reportScreen "Modal Nova Missão — passo …") é a verdade de "o modal está aberto",
            // independente de quem abriu. Se o modal está na tela, o walk é legítimo — sem gate.
            const wizardOnScreen = /nova miss[aã]o/i.test(this.lastScreen);
            if (WIZARD_OPEN_TARGETS.has(target) && !this.liveWizardOpen && !wizardOnScreen) {
                const MISSION_INTENT_RE = /miss[aã]o|squad|wizard|nova miss/i;
                const utterance = this.lastUserLiveUtterance.trim();
                // F-114 r2: negar só quando (1) TEMOS a fala do turno, (2) ela NÃO contém token de
                // missão, E (3) existe pane vivo pra rotear o trabalho. Sem fala capturada (race/dado
                // ausente) ou sem pane na tela (não há braço "trabalho→pane"), fail-open — o gate
                // existe pra bloquear trabalho CONFIRMADO indo pro wizard, não pra ausência de sinal.
                const hasPane = this.lastScreenVisiblePaneIds.length > 0;
                if (utterance && hasPane && !MISSION_INTENT_RE.test(utterance)) {
                    // F-119: breadcrumb — bloqueio nunca mais é silencioso; o trace mostra a decisão e o
                    // estado que a motivou (utterance sem token + pane vivo + wizard não detectado na tela).
                    blog(`live-fn: navegar GATE F-114 negou target=${target} — utterance="${utterance.slice(0, 40)}" hasPane=${hasPane} wizardOnScreen=${wizardOnScreen} liveWizardOpen=${this.liveWizardOpen}`);
                    return 'Isso parece um pedido de trabalho, não de criar uma missão nova — vou repassar ao pane em vez de abrir o assistente de Nova Missão. Use "delegar" ou "perguntar".';
                }
            }
            try {
                // C-090 (pilar 3 — READ-BACK): captura o estado ANTES pra confirmar o efeito real da ação.
                const wasHome = this.isGlobalHomeScreen;
                const wasMissionId = this.lastScreenMissionId;
                const beforeScreen = this.lastScreen;
                const result = await this.runTool(workspace, 'navigate', query ? { target, query } : { target });
                if (WIZARD_OPEN_TARGETS.has(target))
                    this.liveWizardOpen = true;
                else if (['home', 'back', 'mission', 'workspace', 'screen', 'pane', 'wizard-cancel'].includes(target))
                    this.liveWizardOpen = false;
                // C-090 (pilar 3 — READ-BACK): abrir um workspace a partir da HOME só é anunciado como
                // "aberto" quando a TELA muda DE VERDADE. O navigate devolve ok:true assim que EMITE o
                // evento — não confirma que a aba trocou (mesma classe de false-success que o ack
                // round-trip fechou no wizard, F-120/F-091). Aqui a confirmação vem do próprio
                // screen-state: se a tela não sair da home, não afirmamos sucesso.
                const opensWorkspace = target === 'workspace' || target === 'workspace-open';
                if (wasHome && opensWorkspace && /"ok"\s*:\s*true/.test(result)) {
                    const changed = await this.awaitScreenChange(beforeScreen);
                    if (!changed) {
                        blog(`live-fn: navegar READ-BACK C-090 — workspace-open não mudou a tela (query="${query}")`);
                        return `Tentei abrir "${query}", mas a tela não mudou — não confirmo que abriu. Quer que eu tente de novo ou liste os workspaces?`;
                    }
                }
                // C-090.3 (pilar 3 — READ-BACK, fatia MISSÃO): "voltar"/"home" saindo de uma missão só
                // é anunciado como feito quando a tela de fato sai da missão — mesma classe de
                // false-success que o read-back de workspace-open já fecha, agora pro "voltar" do item.
                const leavesMission = (target === 'back' || target === 'home') && !!wasMissionId;
                if (leavesMission && /"ok"\s*:\s*true/.test(result)) {
                    const changed = await this.awaitScreenChange(beforeScreen);
                    if (!changed) {
                        blog(`live-fn: navegar READ-BACK C-090.3 — voltar/home não saiu da missão ${wasMissionId}`);
                        return 'Tentei voltar, mas a tela não mudou — não confirmo que saí da missão.';
                    }
                }
                // C-090.2 (pilar 3 — READ-BACK, fatia GRID): abrir uma missão a partir do grid só é
                // anunciada como feita quando a tela de fato entra NA missão — mesma classe de
                // false-success que workspace-open (linha acima) já fecha, agora pro "abrir missão".
                const opensMission = target === 'mission' && !wasMissionId;
                if (opensMission && /"ok"\s*:\s*true/.test(result)) {
                    const changed = await this.awaitScreenChange(beforeScreen);
                    if (!changed) {
                        blog(`live-fn: navegar READ-BACK C-090.2 — abrir missão não mudou a tela (query="${query}")`);
                        return `Tentei abrir a missão "${query}", mas a tela não mudou — não confirmo que abriu.`;
                    }
                }
                return result;
            }
            catch (err) {
                return `Erro ao navegar: ${err instanceof Error ? err.message : 'desconhecido'}`;
            }
        }
        if (name === 'encerrar') {
            // F-057: despedida por voz — deixa o áudio de "até mais" fluir e derruba a Live.
            // 'ended' (não 'closed') sinaliza fim REAL: o renderer sai do jarvisMode e rearma o wake.
            // Guard de geração: se o dock recriou a sessão dentro da janela de 2,5s (troca de
            // workspace, toggle rápido), o timer NÃO pode matar a sessão nova.
            const sessionAtFarewell = this.liveSession;
            setTimeout(() => {
                if (this.liveSession !== sessionAtFarewell)
                    return;
                try {
                    this.stopLive();
                }
                catch { /* já parada */ }
                this.deps.emit({ type: 'live_state', state: 'ended' });
            }, 2500);
            // C-086 r2: despedida natural em 1ª pessoa — "Sessão de voz encerrando" é fala de máquina.
            return JarvisService.pickAck(['Falou! Até a próxima.', 'Até a próxima.', 'Fechado — até mais.']);
        }
        if (name === 'ler') {
            const rawId = typeof args['paneId'] === 'string' ? args['paneId'].trim() : '';
            try {
                let paneId = rawId;
                let prefix = '';
                if (!paneId || /^(ativo|active|atual)$/i.test(paneId)) {
                    // F-094 r2: "pane ativo" resolve contra a missão NA TELA quando há uma aberta.
                    const list = await this.runTool(workspace, 'pane_list', this.paneInventoryArgs());
                    const ids = [...list.matchAll(/"paneId"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
                    if (ids.length === 0)
                        return 'Nenhum pane aberto pra ler neste workspace.';
                    paneId = ids[ids.length - 1];
                    if (ids.length > 1)
                        prefix = `(Li o pane ${paneId}, o mais recente de ${ids.length}.) `;
                }
                const lastN = typeof args['lastN'] === 'number' ? args['lastN'] : 80;
                const out = await this.runTool(workspace, 'pane_read', { paneId, lastN });
                return prefix + out;
            }
            catch (err) {
                return `Erro ao ler o pane: ${err instanceof Error ? err.message : 'desconhecido'}`;
            }
        }
        if (name === 'comandar') {
            const texto = typeof args['texto'] === 'string' ? args['texto'].trim() : '';
            if (!texto)
                return 'Preciso do texto exato pra digitar no pane.';
            try {
                const rawId = typeof args['paneId'] === 'string' ? args['paneId'].trim() : '';
                const resolved = await this.resolveLivePaneId(workspace, rawId);
                if (!resolved.paneId)
                    return resolved.error ?? 'Não achei o pane.';
                // C-085 r3: mesma fala já roteada tecnicamente ao pane pendente — ack, sem 2º write.
                // C-092.11 (finding 5): ack variado (pickAck), sem tique literal.
                if (this.wasAnswerJustRouted(texto, resolved.paneId)) {
                    return JarvisService.pickAck(['Pera aí, deixa eu ver…', 'Já mandei, tô de olho.', 'Tá lá, já acompanho.']);
                }
                const out = await this.runTool(workspace, 'pane_write', { paneId: resolved.paneId, text: texto });
                // F-110 r2: usuário mandou texto pro pane — se havia pergunta pendente narrada, ela foi
                // RESPONDIDA agora. Marca o hash como respondido (não renarra o mesmo menu velho se o
                // scrollback ainda o mostrar) e libera o slot pra narrar a PRÓXIMA pergunta como nova.
                const answeredHash = this.narratedQuestionHash.get(resolved.paneId);
                if (answeredHash) {
                    this.answeredQuestionHash.set(resolved.paneId, answeredHash);
                    this.narratedQuestionHash.delete(resolved.paneId);
                    this.narratedQuestionAt.delete(resolved.paneId); // C-092.11 (finding 3)
                    // C-050.4: usuário respondeu a pergunta pendente — a réplica do pane é evento
                    // aguardado; mesmo watch curto do 'perguntar'.
                    void this.watchForAnswer(workspace, resolved.paneId);
                }
                // C-086 r2: sucesso limpo → ack natural em 1ª pessoa em vez de despejar o humanResult
                // ("▸ Enviou prompt a pane-X") na voz. Aviso/erro/payload = informação NOVA (lei 8):
                // segue devolvendo o resultado bruto — fail-safe se o formato do paneWrite mudar.
                if (/^▸ Enviou prompt/.test(out) && !out.includes('aviso')) {
                    return resolved.prefix + JarvisService.pickAck(['Mandei.', 'Escrevi, tá lá.', 'Tá lá.']);
                }
                return resolved.prefix + out;
            }
            catch (err) {
                return `Erro ao mandar comando pro pane: ${err instanceof Error ? err.message : 'desconhecido'}`;
            }
        }
        if (name === 'perguntar') {
            // C-085: pergunta de TRABALHO/domínio → roteia ao pane com que o usuário interage (F-102) e
            // narra a RESPOSTA DELE. O brain da voz NÃO inventa resposta de domínio — o conhecimento
            // vive no pane que executa. Ack imediato (o agente do pane leva tempo pra responder); a
            // resposta e o progresso posterior chegam pela narração proativa do poll
            // (maybeNarrateProgress / onDelegatedHandoff).
            const pergunta = typeof args['pergunta'] === 'string' ? args['pergunta'].trim() : '';
            if (!pergunta)
                return 'Preciso da pergunta pra repassar ao pane.';
            // r2 (REABERTO — "qual a situação" respondia inventário): pergunta de STATUS/SITUAÇÃO é
            // ANCORADA na missão ativa — sweep de TODOS os panes dela, nunca 1 pane só nem inventário
            // de missões. Só sai daqui por troca EXPLÍCITA de missão/workspace (muda lastScreenMissionId).
            if (JarvisService.isStatusQuestion(pergunta)) {
                return await this.sweepMissionStatus(workspace);
            }
            try {
                const rawId = typeof args['paneId'] === 'string' ? args['paneId'].trim() : '';
                const resolved = await this.resolveLivePaneId(workspace, rawId);
                // Confirmo #3: sem pane ativo → não inventa; diz que não há pane.
                if (!resolved.paneId)
                    return resolved.error ?? 'Não há pane ativo pra repassar a pergunta. Sem missão aberta, posso responder só o que vejo na tela.';
                // C-085 r3: mesma fala já roteada tecnicamente ao pane pendente — ack, sem 2º write.
                if (this.wasAnswerJustRouted(pergunta, resolved.paneId))
                    return `${resolved.prefix}Perguntei, já te falo.`;
                // C-085.1 r2: payload = 100% o ditado, ZERO anexo — pane recebe exatamente o que o
                // usuário falou. A adaptação pra voz (formato curto/falável) fica do lado do Jarvis
                // (narrateToLive/maybeNarrateProgress leem o output do pane e narram).
                await this.runTool(workspace, 'pane_write', { paneId: resolved.paneId, text: pergunta });
                // Rastreia o pane pra narrar a resposta/progresso (mesma infra do F-110/F-101).
                this.trackDelegatedPane('pane_write', { paneId: resolved.paneId }, '');
                // C-050.4: resposta a pergunta EXPLÍCITA não espera a estabilização de 2×8s —
                // watch dedicado de 1,5s só neste pane até a resposta chegar.
                void this.watchForAnswer(workspace, resolved.paneId);
                // C-086 r2: ack natural em 1ª pessoa, sem repetir a pergunta; variação leve.
                return `${resolved.prefix}${JarvisService.pickAck(['Perguntei, já te falo.', 'Boa — fui perguntar, já te conto.', 'Perguntei aqui; assim que sair, te falo.'])}`;
            }
            catch (err) {
                return `Erro ao repassar a pergunta ao pane: ${err instanceof Error ? err.message : 'desconhecido'}`;
            }
        }
        if (name === 'consultar') {
            // r2 (REABERTO — "qual a situação" respondia "temos 9 missões na tela"): o modelo Live às
            // vezes classifica pergunta de STATUS como "consultar" em vez de "perguntar" — mesmo gate
            // aqui, ANTES do inventário genérico. Com missão ancorada na tela, status/situação NUNCA é
            // o inventário de missões: é o sweep dos panes DELA. Sem missão ancorada, cai no consultar
            // normal (inventário — é o comportamento certo pra "quais missões existem?").
            const perguntaArg = typeof args['pergunta'] === 'string' ? args['pergunta'].trim() : '';
            if (this.lastScreenMissionId && JarvisService.isStatusQuestion(perguntaArg)) {
                return await this.sweepMissionStatus(workspace);
            }
            // F-118: HOME GLOBAL — a tela mostra SÓ a lista de workspaces, nada de missão/pane/squad
            // de um workspace que não está mais na tela. Curto-circuita antes de tocar mission_list/
            // pane_list/squad_list (que resolvem contra `workspace`, potencialmente um path stale).
            if (this.isGlobalHomeScreen) {
                const list = this.homeWorkspaceNames.length > 0
                    ? this.homeWorkspaceNames.join(', ')
                    : '(nenhum workspace recente)';
                return `TELA: HOME — workspaces disponíveis nesta tela: ${list}. Nenhuma missão, pane ou squad nesta tela — isso só existe depois de abrir um workspace.`;
            }
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
            try {
                // F-058: mission_list/pane_list já vêm escopados ao workspace atual pelo registry.
                // F-094 r2: com missão aberta NA TELA, o inventário de panes é o DELA (o usuário
                // pergunta sobre o que está vendo) — nunca os panes de outra missão do workspace.
                // squads entram pro wizard walk por voz (F-057: "qual squad?" no modo Squad).
                const paneLabel = this.lastScreenMissionId ? 'Panes ativos (da missão na tela)' : 'Panes ativos';
                // F-108: mission_list volta a lista INTEIRA do workspace sem marcar qual é a
                // ativa na tela — o modelo Live respondia pela primeira da lista. Rotula no
                // payload (dado, não instrução de prompt) qual é a missão que o usuário vê.
                // F-118 CASO 3: sem missão na tela, rotula EXPLICITAMENTE a ausência — sem isso o
                // modelo inferia "a primeira da lista está aberta" por conta própria.
                // C-092.11 (finding 10): sem título conhecido, a instrução não pode mandar "citar o
                // TÍTULO" entregando id — o fallback falável do screenMissionLabel ("a missão aberta na
                // tela") vale nos dois ramos; a instrução se adapta ao que existe.
                const activeMissionLine = this.lastScreenMissionId
                    ? `MISSÃO ATIVA NA TELA AGORA: ${this.screenMissionLabel()} (responda sobre ESTA quando perguntarem "qual missão" — ${this.lastScreenMissionTitle ? 'cite o TÍTULO, nunca o id técnico' : 'sem título conhecido: chame-a de "a missão aberta na tela", nunca cite id técnico'}).\n\n`
                    : 'NENHUMA MISSÃO ABERTA NA TELA — a lista abaixo é do workspace inteiro; responda o STATUS real de cada uma (ex. "parada"), NUNCA diga que alguma está "aberta".\n\n';
                // C-091: panes SALVOS (fechados) da missão na tela entram no contexto — sem isso o
                // Jarvis só enxerga panes abertos e "restaura os panes" não tem o que restaurar.
                const savedPanes = this.lastScreenMissionId && this.deps.loadSavedPanes
                    ? this.deps.loadSavedPanes(workspace, this.lastScreenMissionId).catch(() => [])
                    : Promise.resolve([]);
                // C-090.2: sem missão ancorada (grid), o gap era panes SALVOS ficarem invisíveis fora de
                // uma missão já aberta — busca status real (ativa/parada) + salvos de TODAS as missões
                // do workspace, mesma fonte do buildGridEntitiesLine (PUSH por turno).
                const gridRows = this.lastScreenMissionId
                    ? Promise.resolve([])
                    : this.gridMissionRows(workspace).catch(() => []);
                return await Promise.race([
                    Promise.all([
                        this.runTool(workspace, 'mission_list', {}),
                        this.runTool(workspace, 'pane_list', this.paneInventoryArgs()),
                        this.runTool(workspace, 'squad_list', {}),
                        savedPanes,
                        gridRows,
                    ]).then(([missions, panes, squads, saved, grid]) => {
                        const savedBlock = saved.length > 0
                            ? `\n\nPanes SALVOS desta missão (fechados agora, restauráveis por voz — "restaura os panes" ou "restaura o <papel>"):\n${saved.map((p) => `- ${p.paneId} (${savedPaneRoleWord(p)}${p.model ? `, ${p.model}` : ''}) — salvo`).join('\n')}`
                            : '';
                        const gridBlock = grid.length > 0
                            ? `\n\nStatus real de cada missão (grid) + panes salvos:\n${grid.map((m) => `- "${m.title}": ${m.live ? 'ativa' : 'parada'}${m.savedCount > 0 ? `, ${m.savedCount} pane(s) salvo(s) (restauráveis por voz)` : ''}`).join('\n')}`
                            : '';
                        return `${activeMissionLine}Missões (workspace atual):\n${missions}\n\n${paneLabel}:\n${panes}\n\nSquads salvos:\n${squads}${savedBlock}${gridBlock}`;
                    }),
                    timeout,
                ]);
            }
            catch (err) {
                return `Erro ao consultar: ${err instanceof Error ? err.message : 'desconhecido'}`;
            }
        }
        if (name === 'restaurar') {
            // C-091: aciona a MESMA rota do botão "Restaurar todos" (MissionRestoreCards) — o
            // sidecar não reimplementa spawn; só pede pro renderer, dono da lista e do handler.
            const missionId = this.lastScreenMissionId;
            if (!missionId)
                return 'Não há missão aberta na tela — sem missão não há panes salvos pra restaurar.';
            const alvo = typeof args['alvo'] === 'string' ? args['alvo'].trim() : '';
            const ackId = randomUUID();
            this.deps.emit({ type: 'restore_panes', workspacePath: workspace, missionId, filter: alvo || undefined, ackId });
            if (!this.deps.waitForAck)
                return 'Pedi pra restaurar.';
            const ack = await this.deps.waitForAck(ackId, 20000);
            if (!ack)
                return 'Não achei painel de panes salvos nesta tela pra restaurar.';
            // C-086 r2: 'Restaurado.' vindo do renderer é etiqueta de sistema — naturaliza no seam
            // da voz (o renderer não é deste item); mensagens com informação (contagem, "não achei")
            // passam intactas.
            const restoreMsg = ack.message === 'Restaurado.' ? '' : (ack.message ?? '');
            return restoreMsg || (ack.applied ? JarvisService.pickAck(['Pronto, restaurei.', 'Pronto, tá de volta.']) : 'Não consegui restaurar.');
        }
        return `Função desconhecida: ${name}`;
    }
    /** F-094 r2: args default do inventário de panes — missão NA TELA quando há uma aberta
     *  (paneList aceita missionId explícito), senão escopo padrão (workspace do caller). */
    paneInventoryArgs() {
        return this.lastScreenMissionId ? { missionId: this.lastScreenMissionId } : {};
    }
    /** r2 (C-085 REABERTO): "qual a situação?" / "como tá?" / "o que tá acontecendo?" — pergunta
     *  de STATUS DO TRABALHO, nunca de UI. Detectada aqui (código, não só prompt — doutrina
     *  "técnica > prompt") pra travar o roteamento independente de o modelo Live escolher
     *  "perguntar" ou "consultar". */
    static STATUS_QUESTION_RE = /situa[çc][ãa]o|como (?:t[áa]|anda|est[áa]|vai)|o que (?:t[áa]|est[áa]) (?:acontecendo|rolando)|qual (?:o |a )?status/i;
    static isStatusQuestion(pergunta) {
        return JarvisService.STATUS_QUESTION_RE.test(pergunta);
    }
    /**
     * r2 (C-085 REABERTO): sweep dos panes da MISSÃO ANCORADA (lastScreenMissionId) — a resposta
     * de "qual a situação?" é SEMPRE sobre ela (nunca inventário de missões, nunca 1 pane só).
     * A âncora só muda com troca EXPLÍCITA de missão/workspace ou navegação manual (o que já
     * atualiza lastScreenMissionId via reportScreen) — aqui só lemos o estado corrente dela.
     */
    async sweepMissionStatus(workspace) {
        const missionId = this.lastScreenMissionId;
        if (!missionId) {
            // Sem missão ancorada: cai pro pane ativo isolado (mesma doutrina do 'perguntar' de 1 pane
            // — confirmo #3 do item, nunca inventa progresso sem sinal).
            const resolved = await this.resolveLivePaneId(workspace, '');
            if (!resolved.paneId)
                return resolved.error ?? 'Não há missão nem pane ativo pra checar a situação.';
            const out = await this.runTool(workspace, 'pane_read', { paneId: resolved.paneId, lastN: 60 });
            // C-092.8: síntese em vez do tail bruto (dose (e) da C-092.7) — a Live fala o pronto.
            return `${resolved.prefix}Situação (sem missão ancorada, pane único): ${JarvisService.synthesizePaneTail(out)}`;
        }
        // C-092.11 (finding 9): captura o label FALÁVEL ANTES dos awaits — a tela pode mudar durante
        // o sweep e o label lido depois sairia de outra missão (ou do fallback).
        const missionLabel = this.screenMissionLabel();
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
        try {
            return await Promise.race([
                (async () => {
                    const list = parseHumanResult(await this.runTool(workspace, 'pane_list', { missionId }));
                    const panes = list?.panes ?? [];
                    if (panes.length === 0)
                        return `Situação da missão ${missionLabel}: nenhum pane ativo agora.`;
                    // C-092.8 (era o injetor mais gordo: 40 linhas cruas × N panes por sweep): cada pane
                    // vira 1-2 linhas SINTETIZADAS aqui (determinístico) — a Live recebe o parágrafo
                    // pronto pra narrar, nunca o tail bruto nem instrução de "resumir".
                    const reads = await Promise.all(panes.map(async (p) => {
                        try {
                            const out = await this.runTool(workspace, 'pane_read', { paneId: p.paneId, lastN: 40 });
                            const role = p.squadRole ? ` (${p.squadRole})` : '';
                            return `— pane ${p.paneId}${role}, ${p.status ?? 'status desconhecido'}: ${JarvisService.synthesizePaneTail(out)}`;
                        }
                        catch {
                            return `— pane ${p.paneId}: erro ao ler.`;
                        }
                    }));
                    return `Situação da missão ${missionLabel} (${panes.length} pane(s)) — narre esta síntese:\n${reads.join('\n')}`;
                })(),
                timeout,
            ]);
        }
        catch (err) {
            return `Erro ao varrer a situação da missão: ${err instanceof Error ? err.message : 'desconhecido'}`;
        }
    }
    /**
     * C-092.8: estado FALÁVEL de um pane a partir do tail — pergunta pendente > menu > última
     * linha de conteúdo. Reusa os detectores canônicos (F-110/F-132); o tail bruto NUNCA viaja
     * pra Live (dose (e) da C-092.7: "manda só uma síntese").
     */
    static synthesizePaneTail(tail) {
        const question = detectPendingQuestion(tail) ?? detectOpenQuestion(tail);
        if (question)
            return `esperando uma resposta sua: ${question.slice(0, 220)}`;
        const menu = compressMenuForNarration(tail);
        if (menu)
            return `esperando uma escolha sua — ${menu.slice(0, 260)}`;
        const lines = tail
            .replace(/\x1b\[[0-9;]*m/g, '')
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l && !INERT_TAIL_LINE_RE.test(l));
        const last = lines[lines.length - 1] ?? '';
        return last ? `última atividade: ${last.replace(/\s+/g, ' ').slice(0, 160)}` : 'sem output recente';
    }
    /** F-102: só os dígitos de um id/fala ("pane 331" / "pane-331" → "331"); "" se nenhum. */
    static paneNumber(s) {
        return s.replace(/\D/g, '');
    }
    /** F-111: "piloto"/"orquestrador" e "chefe" são PAPÉIS (squadRole real do pane), nunca
     *  o usuário nem um chute por posição/número. Casa a fala com o squadRole gravado no
     *  spawn (core.ts: 'orchestrator' = piloto; 'builder' = chefe) — mesma doutrina F-108/F-109. */
    static ROLE_ALIASES = {
        piloto: 'orchestrator',
        orquestrador: 'orchestrator',
        orquestrado: 'orchestrator',
        orchestrator: 'orchestrator',
        chefe: 'builder',
        builder: 'builder',
    };
    /**
     * C-074: resolve o paneId alvo de 'comandar' — vazio/"ativo"/"focado" = o pane em foco
     * na tela (F-102), senão o mais recente do escopo; senão bate literal como paneId, por
     * PAPEL real (F-111: "piloto"/"orquestrador" = squadRole gravado, nunca chute), por
     * NÚMERO (F-102: "331" = "pane-331"), e por fim como trecho do agent ("codex").
     */
    async resolveLivePaneId(workspace, rawId) {
        const parse = (list) => {
            const payload = parseHumanResult(list);
            return payload?.panes ?? [];
        };
        const panes = parse(await this.runTool(workspace, 'pane_list', this.paneInventoryArgs()));
        // F-102: os panes que o renderer diz estarem VISÍVEIS são a verdade do que o usuário vê —
        // o escopo mission-only acima pode estar stale/vazio enquanto um pane está aberto na frente
        // dele. Garante que todo pane visível seja candidato, buscando o agent num list amplo
        // (workspace do caller) só quando o escopo estreito o perdeu.
        const known = new Set(panes.map((p) => p.paneId));
        const missingVisible = this.lastScreenVisiblePaneIds.filter((id) => !known.has(id));
        if (missingVisible.length > 0) {
            const all = parse(await this.runTool(workspace, 'pane_list', { scope: 'caller_workspace' }));
            for (const id of missingVisible) {
                const found = all.find((p) => p.paneId === id);
                if (found) {
                    panes.push(found);
                    known.add(id);
                }
            }
        }
        if (panes.length === 0)
            return { paneId: null, prefix: '', error: 'Nenhum pane aberto neste workspace.' };
        // ativo/focado → o pane FOCADO reportado pela tela (determinístico), senão o mais recente.
        if (!rawId || /^(ativo|active|atual|focado)$/i.test(rawId)) {
            const focused = this.lastScreenFocusedPaneId && known.has(this.lastScreenFocusedPaneId)
                ? this.lastScreenFocusedPaneId
                : panes[panes.length - 1].paneId;
            const prefix = panes.length > 1 ? `(Mandei pro pane ${focused}, o que você tem em foco.) ` : '';
            return { paneId: focused, prefix };
        }
        const exact = panes.find((p) => p.paneId === rawId);
        if (exact)
            return { paneId: exact.paneId, prefix: '' };
        // F-111: casa por PAPEL real (squadRole gravado no spawn) ANTES de número/nome — "piloto"/
        // "orquestrador"/"chefe" nunca resolvem por posição ou chute, só pelo dado rotulado.
        const roleWanted = JarvisService.ROLE_ALIASES[rawId.trim().toLowerCase()];
        if (roleWanted) {
            const byRole = panes.filter((p) => p.squadRole === roleWanted);
            if (byRole.length === 1)
                return { paneId: byRole[0].paneId, prefix: '' };
            if (byRole.length > 1) {
                return {
                    paneId: null,
                    prefix: '',
                    error: `Mais de um pane com papel "${rawId}" no escopo (${byRole.map((p) => p.paneId).join(', ')}) — especifique o id.`,
                };
            }
            // Nenhum pane com esse papel: NÃO cai pro chute por número/nome — role explícito sem
            // match é erro claro, não adivinhação silenciosa.
            return { paneId: null, prefix: '', error: `Nenhum pane com papel "${rawId}" no escopo atual.` };
        }
        // F-102: casa por NÚMERO — o usuário fala "pane 331", o id real é "pane-331". Prefere um
        // pane VISÍVEL com esse número; senão qualquer pane do escopo com o mesmo número.
        const num = JarvisService.paneNumber(rawId);
        if (num) {
            const visibleSet = new Set(this.lastScreenVisiblePaneIds);
            const numMatches = panes.filter((p) => JarvisService.paneNumber(p.paneId) === num);
            const byNum = numMatches.find((p) => visibleSet.has(p.paneId)) ?? numMatches[0];
            if (byNum)
                return { paneId: byNum.paneId, prefix: '' };
        }
        const byName = panes.find((p) => p.agent.toLowerCase().includes(rawId.toLowerCase()));
        if (byName)
            return { paneId: byName.paneId, prefix: '' };
        return { paneId: null, prefix: '', error: `Não achei pane "${rawId}" no escopo atual.` };
    }
    // ── Config ──────────────────────────────────────────────────────────────────
    getConfig() {
        return {
            anthropicAuth: detectCliAuth() ? 'oauth-cli' : 'none',
            confirmBeforeTools: this.confirmBeforeTools,
        };
    }
    setConfig(patch) {
        if (typeof patch.confirmBeforeTools === 'boolean') {
            this.confirmBeforeTools = patch.confirmBeforeTools;
        }
        return { ok: true };
    }
    // ── History (SQLite log opcional nesta fatia) ───────────────────────────────
    // C-072/F-089: contrato consertado (preload manda { workspacePath }); sessão Live é única
    // cross-workspace (comentário de startLive), então devolve o liveHistory recente sem filtro.
    history(_workspacePath) {
        const messages = this.liveHistory.map((m) => ({
            id: randomUUID(),
            role: m.role,
            content: m.text,
            createdAt: m.createdAt,
        }));
        return { ok: true, messages };
    }
    // ── Confirmation inline ──────────────────────────────────────────────────────
    confirm(input) {
        const pending = this.pendingConfirmations.get(input.callId);
        if (!pending)
            return { ok: false };
        clearTimeout(pending.timer);
        this.pendingConfirmations.delete(input.callId);
        pending.resolve({ approved: Boolean(input.approved), always: Boolean(input.always) });
        return { ok: true };
    }
    waitForConfirmation(callId) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                this.pendingConfirmations.delete(callId);
                resolve({ approved: false, always: false });
            }, CONFIRM_TIMEOUT_MS);
            this.pendingConfirmations.set(callId, { resolve, timer });
        });
    }
    // ── confirmEnabled: false — matches reference (UI de confirmação removida) ──
    confirmEnabled() { return false; }
    // ── State emit helper ────────────────────────────────────────────────────────
    setState(state) {
        this.deps.emit({ type: 'state', state });
    }
    // ── Main send loop ───────────────────────────────────────────────────────────
    async send(input) {
        const text = input.text?.trim();
        const workspace = input.workspacePath?.trim() || this.deps.getWorkspace();
        if (!text)
            return { ok: false, error: 'texto vazio' };
        if (this.busy) {
            blog(`send: ocupado — enfileirado "${text.slice(0, 80)}" (fila=${this.pendingSends.length + 1})`);
            this.pendingSends.push(input);
            return { ok: true };
        }
        if (!resolveNativeBinary('claude')) {
            blog('send: Claude CLI não encontrado no sistema');
            this.deps.emit({ type: 'error', message: 'claude_cli_missing' });
            return { ok: false, error: 'claude_cli_missing' };
        }
        if (!detectCliAuth()) {
            blog('send: sem auth OAuth do Claude CLI');
            this.deps.emit({
                type: 'error',
                message: 'Faça login no Claude CLI (claude login) para usar o Jarvis.',
            });
            return { ok: false, error: 'no_auth' };
        }
        blog(`send: "${text.slice(0, 80)}" ws=${basename(workspace) || workspace}`);
        this.busy = true;
        const startedAt = Date.now();
        try {
            await this.runAgentSdkTurn(workspace, text);
            return { ok: true };
        }
        catch (err) {
            if (isCliAuthFailure(err)) {
                blog(`send: falha de auth (${err instanceof Error ? err.message : String(err)})`);
                this.deps.emit({ type: 'error', message: 'Faça login no Claude CLI (claude login) para usar o Jarvis.' });
                this.narrateToLive(speakPayload('Tive um problema de autenticação — preciso que você rode claude login.', { self: true }));
                return { ok: false, error: 'no_auth' };
            }
            blog(`send: erro inesperado (${err instanceof Error ? err.message : String(err)})`);
            this.deps.emit({ type: 'error', message: 'Falha inesperada ao falar com o Jarvis. Tente novamente.' });
            this.narrateToLive(speakPayload('Tive um problema inesperado aqui — tenta repetir o pedido.', { self: true }));
            return { ok: false, error: 'api_error' };
        }
        finally {
            blog(`send: fim em ${Date.now() - startedAt}ms (fila=${this.pendingSends.length})`);
            this.busy = false;
            this.setState('idle');
            const next = this.pendingSends.shift();
            if (next)
                void this.send(next);
        }
    }
    /**
     * F-059: fecha o loop de voz — a resposta/erro do brain vira contexto da sessão
     * Live pro Gemini NARRAR ("Vou narrar quando houver novidades" agora é real).
     * Sem sessão Live (modo texto puro), no-op: o renderer já mostra o texto.
     */
    narrateToLive(instruction, originPaneId, preResolvedOrigin) {
        if (!this.liveSession)
            return;
        // F-118.1: gate de ESCOPO VIVO — só narra proativamente se a origem do evento (missão que
        // estava na tela quando o pane foi delegado) ainda é a interface atual.
        // F-135: `tracked=false` agora falha FECHADO — resolve a missão/workspace REAL do pane via
        // bridge (pane_list) e aplica o MESMO gate origem==tela; sem resolução ⇒ NÃO narra (o evento
        // fica consultável sob demanda). Chamada SEM paneId (voz do próprio turno do Jarvis) narra
        // sempre. `preResolvedOrigin` = origem capturada ANTES de um cleanup que apagaria o carimbo
        // (handoffs terminais — patch 3/4 do F-135).
        if (originPaneId) {
            const origin = preResolvedOrigin ?? this.originMissionIdFor(originPaneId);
            if (!origin.tracked) {
                void this.narrateIfPaneOnScreen(originPaneId, instruction);
                return;
            }
            if (origin.missionId !== this.lastScreenMissionId) {
                process.stderr.write(`[jarvis-narrate] descartado — origem ${origin.missionId ?? 'home'} != tela atual ${this.lastScreenMissionId ?? 'home'} (pane ${originPaneId})\n`);
                return;
            }
        }
        this.injectNarrationSafe(instruction);
    }
    /** F-135: fail-CLOSED do gate de origem — pane não-rastreado resolve a missão/workspace REAL
     *  via bridge.listPanes() e só narra se a origem coincide com a interface na tela (comparação
     *  feita DEPOIS da resolução — a tela pode ter mudado). Pane fora da lista, de outro workspace
     *  ou bridge indisponível ⇒ silêncio: o evento fica pro consultar, nunca vaza pra voz.
     *
     *  C-092.11 (finding 13) — DECISÕES ANOTADAS:
     *  1. Dead-pane: pane RASTREADO que morre NARRA ("caiu") — a origem é hoisted ANTES do cleanup
     *     nos handoffs terminais (onDelegatedHandoff/onHopWorkerHandoff) e segue o gate tracked,
     *     nunca este caminho. Só o pane NÃO-RESOLVÍVEL (morto E fora do listPanes, sem carimbo de
     *     origem) fica mudo — não há como provar a que interface ele pertencia, e narrar "caiu"
     *     cross-missão é pior que o silêncio consultável.
     *  2. Ordering: este caminho é async (await listPanes) — uma narração síncrona posterior pode
     *     sair ANTES desta. Aceito por design: só o fallback não-rastreado paga o await, os eventos
     *     são independentes entre panes, e a fila da injectNarration serializa na chegada. */
    async narrateIfPaneOnScreen(paneId, instruction) {
        let pane;
        try {
            pane = (await this.deps.bridge.listPanes()).find((p) => p.paneId === paneId);
        }
        catch { /* bridge indisponível — fail-closed abaixo */ }
        const sameMission = !!pane && pane.missionId === this.lastScreenMissionId;
        const sameWorkspace = !!pane && (!pane.workspacePath || pane.workspacePath === this.deps.getWorkspace());
        if (!sameMission || !sameWorkspace) {
            process.stderr.write(`[jarvis-narrate] descartado (fail-closed F-135) — pane ${paneId} ${pane ? `origem ${pane.missionId ?? 'home'}` : 'não resolvido'} != tela atual ${this.lastScreenMissionId ?? 'home'}\n`);
            return;
        }
        this.injectNarrationSafe(instruction);
    }
    injectNarrationSafe(instruction) {
        if (!this.liveSession)
            return;
        try {
            // C-062: voice-safe — nunca entregar sintaxe de tool/código pro TTS narrar.
            // F-113: injectNarration embrulha no envelope (o modelo não lê a instrução crua) e
            // serializa na fila (sem utterances intercaladas). Sem o prefixo técnico "[update]".
            this.liveSession.injectNarration(voiceSafeText(instruction));
        }
        catch { /* narração é best-effort */ }
    }
    /** F-118.1: resolve a missão de ORIGEM de um pane delegado (o que estava na tela quando o
     *  Jarvis o delegou). Worker de um chefe/piloto herda a origem do chefe (hopWorkerChefe).
     *  `tracked=false` = pane desconhecido — caller resolve a origem real e falha FECHADO
     *  (F-135, narrateIfPaneOnScreen). */
    originMissionIdFor(paneId) {
        if (this.delegatedPaneMissionId.has(paneId)) {
            return { tracked: true, missionId: this.delegatedPaneMissionId.get(paneId) };
        }
        const chefePaneId = this.hopWorkerChefe.get(paneId);
        if (chefePaneId && this.delegatedPaneMissionId.has(chefePaneId)) {
            return { tracked: true, missionId: this.delegatedPaneMissionId.get(chefePaneId) };
        }
        return { tracked: false, missionId: undefined };
    }
    /**
     * F-101: liga (uma vez) a ponte handoff-done → narração da voz. O sinal é o MESMO
     * 'submit' do HandoffRegistry que acorda o orquestrador (família F-024/035/037); aqui
     * a Live é só mais um "caller" sem pane próprio. Chamado de trackDelegatedPane no
     * primeiro delegar do brain — só custa quando há trabalho delegado.
     */
    ensureHandoffNarration() {
        if (this.handoffNarrationWired)
            return;
        const registry = this.deps.getHandoffRegistry();
        if (!registry)
            return;
        this.handoffNarrationWired = true;
        registry.on('submit', (entry) => this.onDelegatedHandoff(entry));
    }
    /**
     * F-101: registra o pane alvo de uma delegação do brain pra narrar o handoff dele
     * depois. pane_write carrega o paneId no arg; squad_open/spawn devolvem no resultado.
     */
    trackDelegatedPane(jarvisName, args, result) {
        let paneId;
        if (jarvisName === 'pane_write' && typeof args['paneId'] === 'string') {
            paneId = args['paneId'];
        }
        else if (jarvisName === 'squad_open' || jarvisName === 'pane_spawn' || jarvisName === 'mission_spawn_pane') {
            const m = result.match(/"(?:paneId|orchestratorPaneId)"\s*:\s*"([^"]+)"/);
            paneId = m?.[1];
        }
        if (!paneId)
            return;
        this.delegatedPanes.add(paneId);
        // F-118.1: carimba a origem (missão na tela AGORA, no momento da delegação) — não a atual
        // no momento de narrar depois. Delegar de novo pro mesmo pane conta como nova origem.
        this.delegatedPaneMissionId.set(paneId, this.lastScreenMissionId);
        this.ensureHandoffNarration();
        this.ensureQuestionPolling();
        // C-085.2: rotula o papel real do alvo (best-effort, não bloqueia o tracking).
        void this.captureDelegatedPaneRole(paneId);
    }
    /** C-085.2: consulta o bridge (sem passar por MCP) pelo squadRole do pane recém-delegado. */
    async captureDelegatedPaneRole(paneId) {
        try {
            const panes = await this.deps.bridge.listPanes();
            const found = panes.find((p) => p.paneId === paneId);
            if (found?.squadRole)
                this.delegatedPaneRole.set(paneId, found.squadRole);
        }
        catch { /* rotulagem de papel é best-effort — narração cai pro genérico sem ela */ }
    }
    /** C-085.2: rótulo falável do papel real do pane (squadRole F-111) — "o chefe (pane X)" em vez
     *  de "o pane X" genérico. `capitalize` controla o artigo pra meio de frase vs início. */
    paneRoleLabel(paneId, capitalize = true) {
        const role = this.delegatedPaneRole.get(paneId);
        const article = capitalize ? 'O' : 'o';
        if (role === 'orchestrator')
            return `${article} piloto (pane ${paneId})`;
        if (role === 'builder')
            return `${article} chefe (pane ${paneId})`;
        return `${article} pane ${paneId}`;
    }
    /** F-134 (lei 1): o pane PILOTO/orquestrador da missão ancorada É o próprio Jarvis — interface
     *  pura do piloto. Narrá-lo em 3ª pessoa ("o piloto está trabalhando") viola a lei 1; rótulo de
     *  papel em 3ª pessoa fica SÓ pra cadeia ABAIXO dele (chefe→worker, exceção lei 7). O gate
     *  F-118.1 do narrateToLive já descarta narração cuja missão de ORIGEM não é a tela atual, então
     *  role==='orchestrator' que chega a narrar = piloto da missão ancorada. Pane sem role rastreado
     *  (captureDelegatedPaneRole falhou / não delegado por aqui) cai no genérico — comportamento antigo. */
    isSelfPilot(paneId) {
        return this.delegatedPaneRole.get(paneId) === 'orchestrator';
    }
    /**
     * C-085.2: poll dos workers que cada chefe/piloto delegado repassou trabalho (spawn/dispatch —
     * `bridge.workersOfCaller`, mesma fonte do wireCallerMapListener em core.ts). Narra o HOP
     * ("o chefe passou pro pesquisador, tá rodando") e registra o worker pra narrar a entrega
     * voltando quando ele submeter handoff (onDelegatedHandoff). Dedup por chefePaneId+workerPaneId.
     */
    async pollDelegatedPaneHops() {
        if (this.delegatedPanes.size === 0 || !this.liveSession)
            return;
        const workersOfCaller = this.deps.bridge.workersOfCaller;
        if (!workersOfCaller)
            return;
        let panesCache = null;
        for (const chefePaneId of [...this.delegatedPanes]) {
            let workers;
            try {
                workers = workersOfCaller(chefePaneId) ?? [];
            }
            catch {
                continue;
            }
            if (workers.length === 0)
                continue;
            const seen = this.narratedHopWorkers.get(chefePaneId) ?? new Set();
            const fresh = workers.filter((w) => w !== chefePaneId && !seen.has(w));
            if (fresh.length === 0)
                continue;
            if (!panesCache) {
                try {
                    panesCache = await this.deps.bridge.listPanes();
                }
                catch {
                    panesCache = [];
                }
            }
            for (const workerPaneId of fresh) {
                seen.add(workerPaneId);
                this.hopWorkerChefe.set(workerPaneId, chefePaneId);
                const workerAgent = panesCache?.find((p) => p.paneId === workerPaneId)?.agent;
                const workerLabel = workerAgent ? `um executor ${workerAgent}` : 'um worker';
                // F-134 (lei 1): chefe da cadeia = piloto da missão ancorada ⇒ o repasse é MEU — 1ª pessoa.
                // C-092.8: frase pronta composta AQUI; a lei 1/9 vive no livePrompt (marca `self` aponta).
                this.narrateToLive(this.isSelfPilot(chefePaneId)
                    ? speakPayload(`Repassei uma parte pro ${workerLabel} (pane ${workerPaneId}), tá rodando.`, { self: true })
                    : speakPayload(`${this.paneRoleLabel(chefePaneId)} repassou trabalho pro ${workerLabel} (pane ${workerPaneId}), que está rodando agora.`), chefePaneId);
            }
            this.narratedHopWorkers.set(chefePaneId, seen);
        }
    }
    /** F-110: liga (uma vez) o poll periódico dos panes delegados em busca de pergunta pendente. */
    ensureQuestionPolling() {
        if (this.questionPollTimer)
            return;
        this.questionPollTimer = setInterval(() => {
            void this.pollDelegatedPanesForQuestions();
            // C-085.2: mesmo timer de 8s também varre hops chefe→worker (repasse dentro da cadeia).
            void this.pollDelegatedPaneHops();
        }, JarvisService.QUESTION_POLL_MS);
    }
    /**
     * F-110: pane BLOQUEADO numa pergunta ≠ done — não há handoff pra acordar onDelegatedHandoff.
     * Poll no pane_read do tail de cada pane delegado; detecta menu de pergunta (detectPendingQuestion)
     * e narra PROATIVAMENTE, com dedup por hash de conteúdo (não renarra a cada poll).
     */
    async pollDelegatedPanesForQuestions() {
        if (this.delegatedPanes.size === 0 || !this.liveSession)
            return;
        const workspace = this.deps.getWorkspace();
        for (const paneId of [...this.delegatedPanes]) {
            try {
                const tail = await this.runTool(workspace, 'pane_read', { paneId, lastN: 40 });
                // C-092.11 (finding 12): dedup pelo hash CRU (sufixos inclusos), fala pelo spoken curto.
                const menuParts = detectPendingQuestionParts(tail);
                const menuQuestion = menuParts?.spoken ?? null;
                // F-110 r3: sem menu numerado → tenta pergunta ABERTA (prompt livre) no tail ativo.
                const openQuestion = menuQuestion ? null : detectOpenQuestion(tail);
                const question = menuQuestion ?? openQuestion;
                if (question) {
                    const hash = menuParts?.hash ?? question.slice(0, 300);
                    // F-110 r2: mesma pergunta JÁ RESPONDIDA reaparecendo no scrollback (pouco output
                    // novo desde a resposta) — não é fantasma de nova pergunta, só progresso a acompanhar.
                    if (this.answeredQuestionHash.get(paneId) === hash) {
                        this.maybeNarrateProgress(paneId, tail);
                        continue;
                    }
                    if (this.narratedQuestionHash.get(paneId) === hash)
                        continue;
                    if (openQuestion) {
                        // F-110 r3: pergunta aberta é heurística mais frouxa que menu — exige o MESMO
                        // conteúdo em 2 polls consecutivos antes de narrar (pane realmente parado nela).
                        // Menu segue narrado no PRIMEIRO poll (caminho r1/r2, timing intocado).
                        if (this.pendingOpenQuestionHash.get(paneId) !== hash) {
                            this.pendingOpenQuestionHash.set(paneId, hash);
                            continue;
                        }
                    }
                    this.pendingOpenQuestionHash.delete(paneId);
                    this.narratedQuestionHash.set(paneId, hash);
                    this.narratedQuestionAt.set(paneId, Date.now()); // C-092.11 (finding 3): TTL do interceptor
                    // C-085: pergunta pendente tem prioridade — reseta a assinatura de progresso (o estado
                    // pós-resposta é conteúdo novo a acompanhar) e não trata o menu como "progresso".
                    this.lastProgressSig.delete(paneId);
                    // F-134 (lei 1): o próprio piloto bloqueado = EU preciso da resposta — 1ª pessoa.
                    // F-132: menu de escolha exige COMPLETUDE — marca `menu` do speakPayload.
                    // F-110 r3: pergunta ABERTA não tem opções — fala a pergunta direto e pede a resposta.
                    // C-092.8: frase pronta composta AQUI; doutrina (leis 1/5/9) mora no livePrompt.
                    const selfPilot = this.isSelfPilot(paneId);
                    const frase = selfPilot
                        ? `Preciso que você ${menuQuestion ? 'decida uma coisa' : 'me responda uma coisa'} pra eu continuar: ${question}`
                        : `${this.paneRoleLabel(paneId)} que você delegou está esperando uma resposta sua: ${question}`;
                    this.narrateToLive(speakPayload(frase, { self: selfPilot, menu: Boolean(menuQuestion) }), paneId);
                    continue;
                }
                // F-110 r3: tail sem pergunta — candidata aberta do poll anterior morre (não estabilizou).
                this.pendingOpenQuestionHash.delete(paneId);
                // C-085 (escopo ampliado): sem pergunta pendente → acompanhar o PROGRESSO real do pane,
                // narrando um resumo curto conforme o trabalho avança.
                this.maybeNarrateProgress(paneId, tail);
            }
            catch { /* pane_read falhou — tenta no próximo poll */ }
        }
    }
    /** C-050.4: começa a aguardar a RESPOSTA de um pane a uma pergunta explícita do usuário.
     *  Baseline = assinatura do tail ATUAL (pergunta já ecoada pelo pane_write); a resposta é
     *  conteúdo NOVO (≠ baseline) que estabiliza entre 2 ticks curtos. */
    async watchForAnswer(workspace, paneId) {
        let baseline = '';
        try {
            baseline = JarvisService.progressSig(JarvisService.tailContentLines(await this.runTool(workspace, 'pane_read', { paneId, lastN: 40 })));
        }
        catch { /* sem baseline — qualquer conteúdo estável conta como resposta */ }
        this.awaitedAnswer.set(paneId, {
            baseline,
            prev: null,
            deadline: Date.now() + JarvisService.ANSWER_POLL_MAX_MS,
        });
        this.ensureAnswerPolling();
    }
    /** C-050.4: liga o tick curto sob demanda (só existe enquanto houver resposta aguardada). */
    ensureAnswerPolling() {
        if (this.awaitedAnswerTimer)
            return;
        this.awaitedAnswerTimer = setInterval(() => {
            void this.pollAwaitedAnswers();
        }, JarvisService.ANSWER_POLL_MS);
    }
    /** C-050.4: tick de 1,5s SÓ dos panes com resposta aguardada. Resposta = conteúdo novo
     *  (≠ baseline) estável por 2 ticks (~3s). Menu de pergunta novo no tail = a "resposta" é
     *  OUTRA pergunta — narra pelo MESMO caminho/dedup do F-110 (narratedQuestionHash /
     *  answeredQuestionHash), nunca dois narradores pro mesmo menu. Ao narrar, sincroniza o
     *  dedup do caminho lento (lastProgressSig/narratedProgressSig) pra o poll de 8s não
     *  renarrar o mesmo estado. */
    async pollAwaitedAnswers() {
        // Expira relógios mesmo sem voz — entrada não fica pendurada além do deadline.
        for (const [paneId, watch] of this.awaitedAnswer) {
            if (Date.now() > watch.deadline)
                this.awaitedAnswer.delete(paneId);
        }
        if (this.awaitedAnswer.size === 0) {
            if (this.awaitedAnswerTimer) {
                clearInterval(this.awaitedAnswerTimer);
                this.awaitedAnswerTimer = null;
            }
            return;
        }
        if (!this.liveSession)
            return; // voz desligada — mesmo comportamento do poll F-110
        const workspace = this.deps.getWorkspace();
        for (const [paneId, watch] of [...this.awaitedAnswer]) {
            try {
                const tail = await this.runTool(workspace, 'pane_read', { paneId, lastN: 40 });
                // C-092.11 (finding 12): mesmo hash CRU do poll de 8s — os dois caminhos precisam
                // computar o dedup da MESMA forma, senão renarração/engolimento cruzado.
                const parts = detectPendingQuestionParts(tail);
                const question = parts?.spoken ?? null;
                if (question && parts) {
                    const hash = parts.hash;
                    // Menu VELHO já respondido ainda na ponta (input não consumido) — segue aguardando.
                    if (this.answeredQuestionHash.get(paneId) === hash)
                        continue;
                    this.awaitedAnswer.delete(paneId);
                    // O poll de 8s já narrou ESTE menu — nada a renarrar.
                    if (this.narratedQuestionHash.get(paneId) === hash)
                        continue;
                    this.narratedQuestionHash.set(paneId, hash);
                    this.narratedQuestionAt.set(paneId, Date.now()); // C-092.11 (finding 3): TTL do interceptor
                    this.lastProgressSig.delete(paneId);
                    // F-132/F-134: mesma redação composta do poll de 8s — completude do menu + 1ª pessoa
                    // quando o pane é o próprio piloto da missão ancorada. C-092.8: frase pronta.
                    this.narrateToLive(this.isSelfPilot(paneId)
                        ? speakPayload(`A resposta veio como OUTRA pergunta — preciso que você decida: ${question}`, { self: true, menu: true })
                        : speakPayload(`${this.paneRoleLabel(paneId)} respondeu com uma pergunta: ${question}`, { menu: true }), paneId);
                    continue;
                }
                const lines = JarvisService.tailContentLines(tail);
                const sig = lines.length ? JarvisService.progressSig(lines) : '';
                if (!sig || sig === watch.baseline) {
                    watch.prev = null;
                    continue;
                } // ainda sem conteúdo novo
                if (watch.prev !== sig) {
                    watch.prev = sig;
                    continue;
                } // ainda digitando — espera 1 tick
                // Conteúdo novo ESTÁVEL = a resposta chegou.
                this.awaitedAnswer.delete(paneId);
                this.lastProgressSig.set(paneId, sig);
                this.narratedProgressSig.set(paneId, sig);
                // F-132: resposta-menu não passa pelo cap cego (mesma compressão do caminho lento).
                // C-092.8: menu = determinístico (instantâneo); resposta livre = resumo no brain Claude
                // ANTES de injetar, fallback = delta curto — a Live nunca recebe delta gordo + instrução.
                // C-092.11 (finding 11): mesma janela ampliável do caminho lento — menu cortado no meio
                // pelas 12 linhas não jura completude com opções faltando.
                const rawMenu = compressMenuForNarration(JarvisService.menuNarrationWindow(lines).join('\n'));
                // C-092.11 (finding 7): menu JÁ RESPONDIDO no scrollback não renasce como "resposta" —
                // cai pro caminho livre (a resposta real é o conteúdo novo, não o menu velho).
                const menu = rawMenu && !this.menuMatchesAnswered(paneId, rawMenu) ? rawMenu : null;
                const selfPilot = this.isSelfPilot(paneId);
                if (menu) {
                    this.narrateToLive(speakPayload(menu, { self: selfPilot, menu: true }), paneId);
                    continue;
                }
                const delta = lines.slice(-12).join(' ').replace(/\s+/g, ' ').slice(0, 800);
                const persona = selfPilot
                    ? 'A resposta à pergunta do usuário chegou — fale a essência dela em 1-2 frases curtas, em 1ª PESSOA (você é quem respondeu).'
                    : `A resposta de ${this.paneRoleLabel(paneId, false)} à pergunta do usuário chegou — fale a essência dela em 1-2 frases curtas, conteúdo direto.`;
                void this.composeVoiceSummary(persona, delta).then((pronta) => {
                    this.narrateToLive(speakPayload(pronta ?? delta.slice(0, 400), { self: selfPilot }), paneId);
                });
            }
            catch { /* pane_read falhou — tenta no próximo tick */ }
        }
        if (this.awaitedAnswer.size === 0 && this.awaitedAnswerTimer) {
            clearInterval(this.awaitedAnswerTimer);
            this.awaitedAnswerTimer = null;
        }
    }
    /** C-092.11 (finding 7): o menu detectado na janela de progresso é o menu JÁ RESPONDIDO
     *  ressuscitado do scrollback? Compara os rótulos de opção (menuOptionLabel dos dois lados —
     *  o answeredQuestionHash guarda `pergunta Opções: a; b; …` do detectPendingQuestion, e o
     *  compressMenuForNarration produz `Menu com N opções: a; b; ….`): ≥2 rótulos presentes no
     *  hash respondido = mesmo menu, não renarra como progresso. */
    menuMatchesAnswered(paneId, menu) {
        const answered = this.answeredQuestionHash.get(paneId);
        if (!answered)
            return false;
        const labels = menu
            .replace(/^Menu com \d+ opções:\s*/, '')
            .replace(/\.?\s*Pergunta final:.*$/, '')
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean);
        if (labels.length === 0)
            return false;
        const hits = labels.filter((l) => answered.includes(l)).length;
        return hits >= Math.min(2, labels.length);
    }
    /** C-050.4: linhas de conteúdo do tail (sem ANSI, sem vazias) — base única da assinatura
     *  de progresso, compartilhada entre o caminho lento (maybeNarrateProgress) e o watch curto. */
    static tailContentLines(tail) {
        return tail
            .replace(/\x1b\[[0-9;]*m/g, '')
            .split('\n')
            .map((l) => l.trimEnd())
            .filter((l) => l.trim());
    }
    static progressSig(lines) {
        return lines.slice(-6).join('\n').slice(0, 400);
    }
    /** C-092.11 (finding 11): janela de narração de menu — se as 12 linhas cortam o menu no MEIO
     *  (1ª linha da janela é opção com número >1, i.e. o menu começa acima), amplia pra 30 pra
     *  narrar TODAS as opções em vez de jurar completude com as 1-4 cortadas. A ampliação só
     *  dispara nesse corte-no-meio — menu velho INTEIRO no scrollback não renasce por aqui. */
    static menuNarrationWindow(lines) {
        const win = lines.slice(-12);
        const m = win[0]?.match(MENU_OPTION_PREFIX_RE);
        if (m && Number(m[1]) > 1)
            return lines.slice(-30);
        return win;
    }
    /**
     * C-085: narra PROATIVAMENTE o progresso novo de um pane acompanhado — o Jarvis lê o output
     * real (pane_read) e comunica o resumo por voz conforme o trabalho avança. Anti-spam POR
     * CONSTRUÇÃO: só narra quando a assinatura do tail ESTABILIZA entre dois polls (~16s) — spinner
     * e streaming mudam a cada poll e nunca estabilizam, então não viram ruído; e o dedup do estado
     * já narrado evita repetir o mesmo progresso.
     *
     * C-092.8 (DOSE 1): o resumo NÃO é mais do Gemini (que recebia delta cru de 600 chars +
     * instrução de ~250 e pensava PAGO) — menu comprime determinístico (F-132) e o caso livre
     * vai pro brain Claude (assinatura, composeVoiceSummary); a Live recebe a frase pronta.
     */
    maybeNarrateProgress(paneId, tail) {
        // C-050.4: assinatura extraída pros helpers compartilhados (byte-igual à computação antiga)
        // — o watch curto sincroniza o dedup daqui gravando a MESMA assinatura.
        const lines = JarvisService.tailContentLines(tail);
        if (lines.length === 0)
            return;
        const sig = JarvisService.progressSig(lines);
        const prev = this.lastProgressSig.get(paneId);
        this.lastProgressSig.set(paneId, sig);
        // Ainda mudando entre polls (agente digitando / spinner) → aguarda estabilizar antes de narrar.
        if (prev !== sig)
            return;
        // Estável, mas é o mesmo estado já narrado → nada novo a comunicar.
        if (this.narratedProgressSig.get(paneId) === sig)
            return;
        this.narratedProgressSig.set(paneId, sig);
        // F-132: menu no output recente → compressão estrutura-aware em vez do cap cego.
        // Janela = as MESMAS 12 linhas narradas (nunca o tail inteiro — um menu velho no
        // scrollback não pode renascer como "progresso"). C-092.11 (finding 11): amplia SÓ
        // quando a janela corta o menu vivo no meio.
        const windowLines = JarvisService.menuNarrationWindow(lines);
        const menu = compressMenuForNarration(windowLines.join('\n'));
        // C-092.11 (finding 7): menu JÁ RESPONDIDO ainda na janela de 12 linhas não renasce como
        // "progresso" — estado dominado pelo menu velho = nada novo a narrar.
        if (menu && this.menuMatchesAnswered(paneId, menu))
            return;
        // F-134 (lei 1): pane acompanhado = piloto da missão ancorada ⇒ o progresso é MEU — 1ª pessoa
        // ("tô trabalhando na estrutura do site"), nunca "o piloto está trabalhando…".
        const selfPilot = this.isSelfPilot(paneId);
        if (menu) {
            this.narrateToLive(speakPayload(menu, { self: selfPilot, menu: true }), paneId);
            return;
        }
        // Caso livre: resumo no brain ANTES de injetar; falhou/ocupado → fallback determinístico
        // (última linha de conteúdo) — nunca fica mudo, nunca manda o delta gordo pra Live.
        const delta = windowLines.join(' ').replace(/\s+/g, ' ').slice(0, 800);
        const persona = selfPilot
            ? 'Resuma o progresso em 1 frase curta em 1ª PESSOA — você é quem está fazendo o trabalho (ex. "tô montando a estrutura do site").'
            : `Resuma em 1 frase curta o progresso do trabalho de ${this.paneRoleLabel(paneId, false)} (ex. "o chefe tá montando a estrutura do site").`;
        void this.composeVoiceSummary(persona, delta).then((pronta) => {
            const frase = pronta ?? `Avancei aqui — última atividade: ${(windowLines[windowLines.length - 1] ?? '').replace(/\s+/g, ' ').slice(0, 140)}`;
            this.narrateToLive(speakPayload(frase, { self: selfPilot }), paneId);
        });
    }
    /**
     * C-092.8: one-shot no brain Claude (mesma auth OAuth de assinatura do brain principal —
     * custo marginal ~zero) pra compor a FRASE de voz de um texto livre. Sem tools, 1 turno,
     * timeout curto. 1 chamada em voo por vez (busy → null); null = caller usa o fallback
     * determinístico. NUNCA lança.
     */
    async composeVoiceSummary(persona, context) {
        if (this.voiceSummaryBusy || !detectCliAuth())
            return null;
        this.voiceSummaryBusy = true;
        const abort = new AbortController();
        const timer = setTimeout(() => abort.abort(), 10_000);
        try {
            const workspace = this.deps.getWorkspace();
            ensureCliTrust(workspace);
            const options = {
                abortController: abort,
                model: JARVIS_MODEL,
                cwd: workspace,
                systemPrompt: 'Você escreve a próxima FALA do assistente de voz Jarvis (pt-BR coloquial). Responda SÓ a frase final falável — curta e natural, sem código, sem paths, sem sintaxe, sem aspas, sem preâmbulo.',
                thinking: { type: 'disabled' },
                effort: 'low',
                maxTurns: 1,
                tools: [],
                permissionMode: 'default',
                persistSession: false,
                pathToClaudeCodeExecutable: resolveNativeBinary('claude') ?? undefined,
            };
            let text = '';
            for await (const msg of sdkQuery({ prompt: `${persona}\n\nOUTPUT RECENTE DO TERMINAL:\n${context}`, options })) {
                const typedMsg = msg;
                if (typedMsg.type === 'assistant' && !typedMsg.parent_tool_use_id) {
                    const blocks = typedMsg.message.content;
                    const t = blocks.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('');
                    if (t)
                        text = t;
                }
            }
            const line = text.replace(/\s+/g, ' ').trim();
            return line ? line.slice(0, 300) : null;
        }
        catch {
            return null;
        }
        finally {
            clearTimeout(timer);
            this.voiceSummaryBusy = false;
        }
    }
    /** C-085 r3: comandos de UI/estado do app NÃO são resposta ao diálogo pendente — ficam com o
     *  modelo Live (navegar/consultar/encerrar/restaurar/troca de âncora). Conservador: só o que
     *  casa aqui escapa do roteamento determinístico. */
    static UI_UTTERANCE_RE = /\b(abre|abra|abrir|fecha|feche|fechar|mostra|mostre|volta|voltar|navega|entra|sai|troca|restaura|cancela|desliga|encerra)\b|\b(tela|workspace|cat[áa]logo|settings|configura|grid|wizard|nova miss[aã]o)\b|\bmiss[õo]es\b|\blista\b|\bquantos?\b|tchau|at[ée] mais|[ée] s[óo] isso|valeu/i;
    isUiUtterance(text) {
        return JarvisService.UI_UTTERANCE_RE.test(text) || JarvisService.isStatusQuestion(text);
    }
    /** C-085 r3: pane rastreado com pergunta pendente NARRADA (narratedQuestionHash) cuja origem
     *  (F-118.1) ainda é a interface atual — prefere o pane em FOCO; senão o de pergunta mais
     *  recente (Map preserva ordem de inserção). null = nenhum diálogo pendente vivo nesta tela. */
    pendingQuestionPaneId() {
        let candidate = null;
        for (const paneId of this.narratedQuestionHash.keys()) {
            const origin = this.originMissionIdFor(paneId);
            if (origin.tracked && origin.missionId !== this.lastScreenMissionId)
                continue;
            candidate = paneId;
            if (paneId === this.lastScreenFocusedPaneId)
                return paneId;
        }
        return candidate;
    }
    /**
     * C-085 r3 (caso determinístico da régua A): com pergunta pendente narrada, a PRÓXIMA fala do
     * usuário que NÃO é comando de UI é POR CONSTRUÇÃO a resposta àquele diálogo — pane_write
     * verbatim (voz→pane, C-062/Lei de fidelidade), técnico, sem passar pela decisão do modelo
     * Live (que já respondeu genérico da própria cabeça — reprovação ao vivo 2026-07-04). Ack
     * curto via fila F-113; a resposta real chega pela infra existente do perguntar (poll 8s /
     * handoff). O caso GERAL (sem pergunta pendente) segue a decisão de design nº 1 do C-092 —
     * NÃO implementado aqui.
     */
    async maybeRouteAnswerToPendingQuestion(utterance) {
        if (!utterance || !this.liveSession)
            return;
        const paneId = this.pendingQuestionPaneId();
        if (!paneId)
            return;
        if (this.isUiUtterance(utterance))
            return;
        // Endereçamento explícito ("manda pro pane 2: ...") escolhe outro alvo — fica com o modelo.
        if (stripDelegationEnvelope(utterance) !== utterance)
            return;
        // C-092.11 (finding 2): só rotear o que PARECE resposta ao diálogo pendente — pedido
        // imperativo longo novo ("pesquisa os preços das GPUs...") segue o fluxo normal.
        if (!this.looksLikePendingAnswer(utterance, paneId))
            return;
        // C-092.11 (finding 3): pergunta narrada há tempo demais sem resposta = diálogo frio —
        // não sequestra mais a fala; limpa o pendente pro fluxo normal decidir.
        const narratedAt = this.narratedQuestionAt.get(paneId) ?? 0;
        if (Date.now() - narratedAt > JarvisService.NARRATED_QUESTION_TTL_MS) {
            this.narratedQuestionHash.delete(paneId);
            this.narratedQuestionAt.delete(paneId);
            return;
        }
        // C-092.11 (finding 3): revalida que a pergunta AINDA está ativa no tail — o usuário pode
        // ter respondido NO TERMINAL (a pergunta sumiu) e a utterance seguinte é outra coisa.
        const workspace = this.deps.getWorkspace();
        try {
            const tail = await this.runTool(workspace, 'pane_read', { paneId, lastN: 40 });
            if (!detectPendingQuestion(tail) && !detectOpenQuestion(tail)) {
                this.narratedQuestionHash.delete(paneId);
                this.narratedQuestionAt.delete(paneId);
                return;
            }
        }
        catch { /* pane_read falhou — segue: pior caso é o comportamento antigo */ }
        // Pós-await: o modelo pode ter respondido via 'comandar' nesse meio-tempo (que consome o
        // narratedQuestionHash) — se consumiu, o write já aconteceu; não duplica.
        if (!this.narratedQuestionHash.has(paneId))
            return;
        // C-092.11 (finding 4): marcador setado ANTES (sincronamente) do write — function call
        // rápida do modelo com o mesmo conteúdo não duplica o write; rollback se o write falhar.
        this.routedAnswerPaneId = paneId;
        this.routedAnswerText = utterance;
        this.routedAnswerAt = Date.now();
        try {
            await this.runTool(workspace, 'pane_write', { paneId, text: utterance });
        }
        catch {
            // pane_write falhou — desfaz o marcador e deixa o fluxo normal (modelo/poll) seguir.
            this.routedAnswerPaneId = null;
            this.routedAnswerText = '';
            return;
        }
        // F-110 r2: mesma semântica do 'comandar' — a pergunta narrada foi RESPONDIDA agora.
        const answeredHash = this.narratedQuestionHash.get(paneId);
        if (answeredHash) {
            this.answeredQuestionHash.set(paneId, answeredHash);
            this.narratedQuestionHash.delete(paneId);
            this.narratedQuestionAt.delete(paneId);
        }
        // C-050.4: a réplica do pane à resposta roteada é evento AGUARDADO — watch curto de 1,5s
        // (o ack "pera aí, deixa eu ver…" promete resposta em instantes; 2×8s não cumpre).
        void this.watchForAnswer(workspace, paneId);
        blog(`live-route r3: resposta a pergunta pendente roteada ao ${paneId} (${utterance.length} chars)`);
        // C-092.8: gate comportamental terso — este é instrução (não narração de dado), mas a
        // versão longa re-explicava a Lei 7 r3 inteira que já vive no livePrompt.
        // C-092.11 (finding 5): sugestão de ack variada — sem tique literal fixo.
        const ack = JarvisService.pickAck(['Pera aí, deixa eu ver…', 'Um segundo, já vejo.', 'Deixa comigo, já olho.']);
        this.narrateToLive(`A fala do usuário JÁ foi repassada ao trabalho — NÃO responda o conteúdo. Diga SÓ um ack curtíssimo ("${ack}") e aguarde a resposta chegar.`, paneId);
    }
    /** C-092.11 (finding 2): heurística de resposta-plausível ao diálogo pendente — curta (fala
     *  típica de resposta por voz), ou referenciando opção/número, ou compartilhando palavra
     *  significativa com a pergunta narrada. Pedido imperativo longo sem relação = trabalho NOVO. */
    looksLikePendingAnswer(utterance, paneId) {
        const clean = utterance.trim();
        if (clean.length <= 80)
            return true;
        const question = this.narratedQuestionHash.get(paneId) ?? '';
        if (!question)
            return false;
        if (/\bop[çc][ãa]o\b|\bn[úu]mero\b/i.test(clean))
            return true;
        const qWords = new Set(question.toLowerCase().match(/[\p{L}]{5,}/gu) ?? []);
        const uWords = clean.toLowerCase().match(/[\p{L}]{5,}/gu) ?? [];
        return uWords.some((w) => qWords.has(w));
    }
    /** C-085 r3: a MESMA fala já foi roteada tecnicamente ao pane pendente? (o modelo Live pode
     *  chamar perguntar/comandar/delegar com o mesmo conteúdo logo depois — vira ack, sem 2º write).
     *  C-092.11 (finding 1): containment simétrico sem fronteira engolia fala nova que só CONTINHA
     *  a resposta curta roteada ("sim", "2") — agora igualdade estrita, ou containment apenas com
     *  fragmento ≥15 chars E em fronteira de palavra. */
    wasAnswerJustRouted(text, paneId) {
        if (!this.routedAnswerPaneId)
            return false;
        if (Date.now() - this.routedAnswerAt > JarvisService.ROUTED_ANSWER_DEDUP_MS)
            return false;
        if (paneId && paneId !== this.routedAnswerPaneId)
            return false;
        const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
        const a = norm(text);
        const b = norm(this.routedAnswerText);
        if (!a || !b)
            return false;
        if (a === b)
            return true;
        const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
        if (shorter.length < 15)
            return false;
        return longer.startsWith(`${shorter} `)
            || longer.endsWith(` ${shorter}`)
            || longer.includes(` ${shorter} `);
    }
    /** C-092.11 (finding 1): o 'delegar' não nomeia pane — o dedup dele só vale quando o pane que
     *  RECEBEU o roteamento ainda pertence à interface atual (mesma missão na tela, ou visível).
     *  Pane de outra tela não pode engolir um briefing novo com ack falso. */
    routedAnswerPaneOnScreen() {
        const paneId = this.routedAnswerPaneId;
        if (!paneId)
            return false;
        if (this.lastScreenVisiblePaneIds.includes(paneId))
            return true;
        const origin = this.originMissionIdFor(paneId);
        return origin.tracked && origin.missionId === this.lastScreenMissionId;
    }
    /**
     * F-101: um pane delegado submeteu handoff → narra PROATIVAMENTE pro usuário. Ignora
     * panes que o Jarvis não delegou (workers internos de outra missão) e mortes pedidas
     * (closed_by_caller). F-164: só closed_by_caller limpa o mapeamento — 'done' mantém
     * (worker persistente re-submete e cada entrega volta a ser narrada; mesma semântica
     * do wireCallerMapListener).
     */
    onDelegatedHandoff(entry) {
        // C-085.2: worker de um chefe/piloto delegado (não o delegado direto do Jarvis) — narra a
        // ENTREGA voltando pra cadeia, não "o pane X terminou" genérico.
        const chefePaneId = this.hopWorkerChefe.get(entry.paneId);
        if (chefePaneId) {
            this.onHopWorkerHandoff(entry, chefePaneId);
            return;
        }
        if (!this.delegatedPanes.has(entry.paneId))
            return;
        if (entry.status === 'closed_by_caller')
            return;
        if (entry.status === 'progress')
            return; // update intermediário — menos ruído
        // F-134: captura identidade/rótulo ANTES do cleanup abaixo (que deleta delegatedPaneRole —
        // sem o hoist, todo 'done' degradava pro genérico "O pane X").
        const selfPilot = this.isSelfPilot(entry.paneId);
        const roleLabel = this.paneRoleLabel(entry.paneId);
        // F-135: captura a origem ANTES do cleanup — o delete de delegatedPaneMissionId logo abaixo
        // apagava o carimbo e a narração final do 'done' caía como não-rastreada (era o fail-open,
        // a rota principal do vazamento cross-missão observado).
        const origin = this.originMissionIdFor(entry.paneId);
        if (shouldClearCallerMapping(entry.status)) {
            this.delegatedPanes.delete(entry.paneId);
            this.delegatedPaneRole.delete(entry.paneId); // C-085.2: chefe fechou — libera o rótulo de papel
            this.narratedHopWorkers.delete(entry.paneId); // C-085.2: idem — para de rastrear hops dele
            this.narratedQuestionHash.delete(entry.paneId); // F-110: libera dedup pro próximo delegar
            this.narratedQuestionAt.delete(entry.paneId); // C-092.11 (finding 3): timestamp acompanha o hash
            this.answeredQuestionHash.delete(entry.paneId); // F-110 r2: idem — pane não reusa estado velho
            this.pendingOpenQuestionHash.delete(entry.paneId); // F-110 r3: candidata aberta não sobrevive ao pane
            this.lastProgressSig.delete(entry.paneId); // C-085: pane terminou — para de acompanhar progresso
            this.awaitedAnswer.delete(entry.paneId); // C-050.4: pane fechou o turno — o handoff É a resposta
            this.narratedProgressSig.delete(entry.paneId);
            this.delegatedPaneMissionId.delete(entry.paneId); // F-118.1: libera a origem — próxima delegação recarimba
        }
        if (!this.liveSession)
            return; // voz encerrada — nada a narrar
        // F-132: summary-menu (pane devolveu opções + pergunta) não passa pelo cap cego —
        // comprime pra rótulos + pergunta final ANTES do slice.
        const menu = compressMenuForNarration(entry.summary || '');
        const summary = menu ?? (entry.summary || '').replace(/\s+/g, ' ').trim().slice(0, 500);
        const label = entry.status === 'done' ? 'terminou'
            : entry.status === 'awaiting_clarification' ? 'está esperando uma resposta sua'
                : entry.status === 'stalled' ? 'parece travado'
                    : entry.status === 'dead' ? 'caiu'
                        : entry.status === 'blocked' ? 'está bloqueado'
                            : 'falhou';
        // F-134 (lei 1): delegado = piloto da missão ancorada ⇒ o desfecho é MEU — 1ª pessoa.
        // F-135 (lei 2): claim de deploy vira marca condicional (DEPLOY_CLAIM_RE) — só viaja quando
        // o summary de fato alega publicação. C-092.8: summary do worker JÁ é a frase pronta —
        // moldura mínima, sem re-instrução longa.
        this.narrateToLive(speakPayload(selfPilot
            ? `Você mesmo ${label}. Resultado: ${summary}`
            : `${roleLabel} que você delegou ${label}. Resultado: ${summary}`, { self: selfPilot, menu: Boolean(menu), deployClaim: DEPLOY_CLAIM_RE.test(summary) }), entry.paneId, origin);
    }
    /**
     * C-085.2: handoff de um WORKER que um chefe/piloto delegado repassou trabalho pra (via
     * pollDelegatedPaneHops) — narra a entrega voltando pra cadeia ("o pesquisador terminou,
     * o chefe tá revisando"), nunca "o pane X terminou" isolado do contexto de quem delegou.
     */
    onHopWorkerHandoff(entry, chefePaneId) {
        if (entry.status === 'closed_by_caller')
            return;
        if (entry.status === 'progress')
            return;
        // F-135: captura a origem ANTES do cleanup — o delete de hopWorkerChefe logo abaixo quebrava
        // a herança de origem do worker e a narração terminal caía como não-rastreada (fail-open).
        const origin = this.originMissionIdFor(entry.paneId);
        if (shouldClearCallerMapping(entry.status)) {
            this.hopWorkerChefe.delete(entry.paneId);
            this.narratedHopWorkers.get(chefePaneId)?.delete(entry.paneId);
        }
        if (!this.liveSession)
            return;
        const menu = compressMenuForNarration(entry.summary || ''); // F-132
        const summary = menu ?? (entry.summary || '').replace(/\s+/g, ' ').trim().slice(0, 500);
        const label = entry.status === 'done' ? 'terminou'
            : entry.status === 'awaiting_clarification' ? 'está esperando uma resposta'
                : entry.status === 'stalled' ? 'parece travado'
                    : entry.status === 'dead' ? 'caiu'
                        : entry.status === 'blocked' ? 'está bloqueado'
                            : 'falhou';
        // F-134 (lei 1): chefe da cadeia = piloto ⇒ a entrega volta pra MIM — 1ª pessoa; o worker
        // continua com rótulo de papel (exceção lei 7, cadeia ABAIXO do piloto).
        // F-135 (lei 2): claim de deploy = marca condicional (DEPLOY_CLAIM_RE), como no
        // onDelegatedHandoff. C-092.8: summary pronto do worker + moldura mínima.
        this.narrateToLive(speakPayload(this.isSelfPilot(chefePaneId)
            ? `O worker (pane ${entry.paneId}) que você repassou trabalho ${label} — a entrega voltou pra você. Resultado: ${summary}`
            : `O worker (pane ${entry.paneId}) que ${this.paneRoleLabel(chefePaneId, false)} repassou trabalho ${label} — a entrega voltou pra cadeia. Resultado: ${summary}`, { self: this.isSelfPilot(chefePaneId), menu: Boolean(menu), deployClaim: DEPLOY_CLAIM_RE.test(summary) }), entry.paneId, origin);
    }
    // ── Agent SDK turn ──────────────────────────────────────────────────────────
    async runAgentSdkTurn(workspace, text) {
        const startedAt = Date.now();
        this.setState('thinking');
        if (this.sdkLive && !this.sdkLive.dead && this.sdkLive.workspace !== workspace) {
            blog('turn: workspace mudou — descartando sessão SDK anterior');
            this.sdkLive.dispose();
        }
        if (!this.sdkLive || this.sdkLive.dead) {
            blog(`turn: criando sessão SDK (resume=${this.sdkSessionId ? this.sdkSessionId.slice(0, 8) : 'nova'})`);
            this.sdkLive = await this.createLiveSession(workspace);
        }
        this.lastAssistantReply = '';
        this.delegatedThisTurn = false;
        // F-105: guarda o pedido RAW deste turno — o gate força o pane_write do brain a
        // carregá-lo verbatim (pass-through de ditado), descartando a paráfrase do haiku.
        this.pendingDelegationText = text;
        this.delegationPaneWriteDone = false;
        // C-090.3: entidades da tela de MISSÃO (panes ativos+salvos, papel/status reais) — busca
        // async (pane_list/loadSavedPanes) feita ANTES do turno, então withWorkspaceContext continua
        // síncrona e só recebe a string já pronta.
        const missionEntitiesLine = await this.buildMissionEntitiesLine(workspace);
        // C-090.2: entidades da tela GRID (missões status real + panes salvos) — mesma razão do
        // missionEntitiesLine acima; buildGridEntitiesLine já curto-circuita fora do grid.
        const gridEntitiesLine = await this.buildGridEntitiesLine(workspace);
        const outcome = await this.sdkLive.runTurn(withWorkspaceContext(workspace, this.lastScreen, this.lastScreenMissionId, text, this.lastScreenVisiblePaneIds, this.lastScreenFocusedPaneId, this.isGlobalHomeScreen, this.homeWorkspaceNames, missionEntitiesLine, gridEntitiesLine, this.lastScreenMissionTitle), startedAt);
        blog(`turn: outcome=${outcome.kind} em ${Date.now() - startedAt}ms`);
        switch (outcome.kind) {
            case 'done':
                // F-059: round-trip de voz — a reply final do brain é narrada pelo Gemini.
                if (this.lastAssistantReply) {
                    // F-132: reply-menu (o brain repassou o menu do pane) não passa pelo cap cego.
                    const menu = compressMenuForNarration(this.lastAssistantReply);
                    const flat = menu ?? this.lastAssistantReply.replace(/\s+/g, ' ').trim().slice(0, 600);
                    // C-092.8: a reply do brain JÁ é a frase pronta (Claude compôs) — moldura mínima.
                    this.narrateToLive(speakPayload(flat, { self: true, menu: Boolean(menu) }));
                }
                return;
            case 'timeout':
                this.deps.emit({ type: 'error', message: 'O Jarvis demorou demais para responder. Tente novamente.' });
                this.narrateToLive(speakPayload(`Não consegui terminar em ${Math.round(SDK_PROGRESS_TIMEOUT_MS / 1000)} segundos e abortei — tenta repetir o pedido.`, { self: true }));
                return;
            case 'auth':
                throw new CliAuthError(outcome.detail);
            case 'stream_error':
                throw outcome.error instanceof Error ? outcome.error : new Error(String(outcome.error));
        }
    }
    /**
     * System prompt do brain = prompt canônico + camada de memória (C-055):
     * instruções de uso das tools memory_* e o bloco de fatos persistidos.
     * Montado AQUI (não no buildJarvisSystemPrompt do core) — o bloco é dinâmico
     * por sessão e a camada de memória é do sidecar.
     */
    composeSystemPrompt() {
        const base = buildJarvisSystemPrompt();
        if (!this.memory.available)
            return base;
        const instructions = [
            '',
            'MEMÓRIA PERSISTIDA (única exceção à regra de nunca agir você mesmo — memória é SUA, não é trabalho):',
            '  • Usuário disse preferência ou fato durável ("sempre sonnet", "meu projeto principal é X", "default 3 panes") → memory_remember(key curta estável, conteúdo). Grave UMA vez, sem anunciar cerimônia — 1 frase: "Anotado."',
            '  • Fluxo interrompido no meio (wizard pela metade, missão adiada) → memory_remember com key do fluxo (ex.: "wizard-missao-x") e o passo onde parou; ao retomar ("continua aquela missão"), memory_recall e siga do passo gravado — depois memory_forget da key do fluxo.',
            '  • "Esquece X" / "não lembra mais disso" → memory_forget(X) e confirme: "Esquecido."',
            '  • Ao APLICAR uma memória, seja honesto: "lembro que você prefere X". NUNCA finja lembrar o que não está na memória.',
            '  • As memórias atuais já estão listadas abaixo — use direto, não chame memory_recall pra ver o que já está visível.',
        ].join('\n');
        const block = this.memory.contextBlock();
        return base + instructions + (block ? `\n\n${block}` : '\n\n(memória vazia por enquanto)');
    }
    async createLiveSession(workspace) {
        const createdAt = Date.now();
        ensureCliTrust(workspace);
        const resume = this.sdkSessionId ?? undefined;
        const abortController = new AbortController();
        const mcpServer = this.buildOverclockMcpServer();
        const options = {
            abortController,
            model: JARVIS_MODEL,
            cwd: workspace,
            systemPrompt: this.composeSystemPrompt(),
            thinking: { type: 'disabled' },
            effort: 'low',
            maxTurns: MAX_TOOL_ITERATIONS,
            tools: [],
            permissionMode: 'default',
            includePartialMessages: true,
            persistSession: true,
            mcpServers: { overclock: mcpServer },
            canUseTool: this.makeCanUseTool(),
            pathToClaudeCodeExecutable: resolveNativeBinary('claude') ?? undefined,
            ...(resume ? { resume } : {}),
        };
        const queue = [];
        let wakeInput = null;
        let closed = false;
        async function* userInput() {
            while (!closed) {
                const next = queue.shift();
                if (next !== undefined) {
                    yield { type: 'user', message: { role: 'user', content: next }, parent_tool_use_id: null };
                    continue;
                }
                await new Promise((resolve) => { wakeInput = resolve; });
                wakeInput = null;
            }
        }
        const turnRef = { current: null };
        let dead = false;
        const armWatchdog = () => {
            const turn = turnRef.current;
            if (!turn)
                return;
            if (turn.watchdog)
                clearTimeout(turn.watchdog);
            turn.watchdog = setTimeout(() => {
                blog(`watchdog: ${SDK_PROGRESS_TIMEOUT_MS}ms sem progresso do SDK — abortando turno`);
                turn.timedOut = true;
                abortController.abort();
            }, SDK_PROGRESS_TIMEOUT_MS);
        };
        const finishTurn = (outcome) => {
            const turn = turnRef.current;
            if (!turn)
                return;
            turnRef.current = null;
            if (turn.watchdog)
                clearTimeout(turn.watchdog);
            turn.resolve(outcome);
        };
        const killSession = () => {
            dead = true;
            closed = true;
            wakeInput?.();
            try {
                abortController.abort();
            }
            catch { /* já abortada */ }
        };
        void (async () => {
            let streamError = null;
            try {
                for await (const msg of sdkQuery({ prompt: userInput(), options })) {
                    const typedMsg = msg;
                    if (turnRef.current)
                        armWatchdog();
                    if (typedMsg.type === 'system' && typedMsg.subtype === 'init') {
                        blog(`sdk: init session=${typedMsg.session_id.slice(0, 8)} (${Date.now() - createdAt}ms após create)`);
                        this.sdkSessionId = typedMsg.session_id;
                    }
                    else if (typedMsg.type === 'stream_event') {
                        if (typedMsg.parent_tool_use_id)
                            continue;
                        const turn = turnRef.current;
                        if (!turn)
                            continue;
                        const ev = typedMsg.event;
                        if (ev.type === 'message_start') {
                            turn.messageId = randomUUID();
                            turn.sawText = false;
                            this.setState('thinking');
                        }
                        else if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
                            if (!turn.sawText) {
                                turn.sawText = true;
                                this.setState('speaking');
                            }
                            this.deps.emit({ type: 'text_delta', messageId: turn.messageId, delta: ev.delta.text });
                        }
                    }
                    else if (typedMsg.type === 'assistant') {
                        if (typedMsg.parent_tool_use_id)
                            continue;
                        if (typedMsg.error === 'authentication_failed' || typedMsg.error === 'oauth_org_not_allowed') {
                            throw new CliAuthError(`agent sdk auth error: ${typedMsg.error}`);
                        }
                        const contentBlocks = typedMsg.message.content;
                        const assistantText = contentBlocks
                            .filter((b) => b.type === 'text')
                            .map((b) => b.text)
                            .join('');
                        if (assistantText) {
                            blog(`sdk: assistant reply (${assistantText.length} chars): "${assistantText.replace(/\s+/g, ' ')}"`);
                            this.lastAssistantReply = assistantText;
                            const msg = {
                                id: turnRef.current?.messageId ?? randomUUID(),
                                role: 'assistant',
                                content: assistantText,
                                createdAt: Date.now(),
                            };
                            this.deps.emit({ type: 'message_complete', message: msg });
                        }
                    }
                    else if (typedMsg.type === 'result') {
                        blog(`sdk: result subtype=${typedMsg.subtype}`);
                        this.sdkSessionId = typedMsg.session_id;
                        if (typedMsg.subtype === 'error_max_turns') {
                            this.deps.emit({ type: 'error', message: 'Jarvis atingiu o limite de passos. Tente um pedido mais específico.' });
                        }
                        else if (typedMsg.subtype !== 'success') {
                            const errs = 'errors' in typedMsg ? typedMsg.errors : [];
                            const detail = Array.isArray(errs) && errs.length > 0 ? errs.join('; ') : typedMsg.subtype;
                            if (isCliAuthFailure(new Error(detail)))
                                throw new CliAuthError(detail);
                            this.deps.emit({ type: 'error', message: 'Falha inesperada ao falar com o Jarvis. Tente novamente.' });
                        }
                        finishTurn({ kind: 'done' });
                    }
                }
            }
            catch (err) {
                streamError = err;
            }
            blog(`sdk: stream encerrou (error=${streamError instanceof Error ? streamError.message.slice(0, 120) : streamError ? String(streamError).slice(0, 120) : 'não'})`);
            const turn = turnRef.current;
            killSession();
            if (turn) {
                if (turn.timedOut)
                    finishTurn({ kind: 'timeout' });
                else if (streamError && isCliAuthFailure(streamError)) {
                    finishTurn({ kind: 'auth', detail: streamError instanceof Error ? streamError.message : 'auth failure' });
                }
                else if (streamError)
                    finishTurn({ kind: 'stream_error', error: streamError });
                else
                    finishTurn({ kind: 'stream_error', error: new Error('sessão do Agent SDK encerrou inesperadamente') });
            }
        })();
        return {
            get dead() { return dead; },
            workspace,
            dispose: killSession,
            runTurn: (text, startedAt) => {
                return new Promise((resolve) => {
                    turnRef.current = {
                        startedAt,
                        resolve,
                        watchdog: null,
                        timedOut: false,
                        messageId: randomUUID(),
                        sawText: false,
                    };
                    armWatchdog();
                    queue.push(text);
                    wakeInput?.();
                });
            },
        };
    }
    // ── MCP server in-process com as tools do Jarvis (10 orquestração + 3 memória C-055) ──
    buildOverclockMcpServer() {
        const exec = (name, args) => this.executeSdkTool(this.deps.getWorkspace(), name, args);
        const agentEnum = z.enum(['claude', 'codex', 'gemini', 'kimi']);
        return createSdkMcpServer({
            name: 'overclock',
            version: '1.0.0',
            tools: [
                sdkTool('squad_list', 'Lista os squads salvos (id, nome, membros). Leitura, executa direto.', {}, (args) => exec('squad_list', args)),
                sdkTool('squad_open', 'Abre um squad salvo: cria missão + spawna orquestrador + envia briefing. Para TODO trabalho substancial. Requer confirmação.', {
                    name: z.string().describe('Nome do squad (match aproximado).'),
                    briefing: z.string().describe('Descrição completa da tarefa para o orquestrador.'),
                    mission_title: z.string().optional().describe('Título curto da missão. Omita para auto-nomear.'),
                }, (args) => exec('squad_open', args)),
                sdkTool('mission_create', 'Cria uma missão no Overclock. Use quando não houver squad adequado. Executa direto.', {
                    title: z.string().optional().describe('Título curto da missão. Omita — auto-nomeada.'),
                    description: z.string().optional().describe('Resumo opcional.'),
                }, (args) => exec('mission_create', args)),
                sdkTool('mission_list', 'Lista as missões do workspace ATUAL (id, título, status). Passe all_workspaces=true SÓ quando o usuário pedir explicitamente outras/todas as missões.', { all_workspaces: z.boolean().optional().describe('true = missões de todos os workspaces.') }, (args) => exec('mission_list', args.all_workspaces ? { allWorkspaces: true } : {})),
                sdkTool('pane_list', 'Lista os panes ativos da MISSÃO aberta na tela do usuário (ou do workspace ATUAL se nenhuma missão está aberta), já rotulados com o papel (squadRole: orchestrator=piloto, builder=chefe). F-111: narre PRIMEIRO os panes desta missão (citando o papel de cada um) — só suba pro workspace/geral com all_workspaces=true se o usuário pedir explicitamente.', { all_workspaces: z.boolean().optional().describe('true = panes de todos os workspaces.') }, 
                // F-094 r2: default = missão NA TELA — "quantos panes temos?" conta os da missão
                // que o usuário está vendo, nunca os de outra missão do mesmo workspace.
                (args) => exec('pane_list', args.all_workspaces ? { scope: 'all_workspaces' } : this.paneInventoryArgs())),
                sdkTool('pane_read', 'Lê as últimas linhas do terminal de um pane. Leitura, executa direto.', {
                    paneId: z.string().describe('Id do pane.'),
                    lastN: z.number().optional().describe('Linhas finais. Default 80.'),
                }, (args) => exec('pane_read', args)),
                sdkTool('pane_spawn', 'Abre um pane AVULSO (sem squad). Apenas quando explicitamente pedido. Requer confirmação.', {
                    agent: agentEnum.optional().describe('CLI a abrir.'),
                    model: z.string().optional().describe('Modelo opcional.'),
                    effort: z.enum(['low', 'medium', 'high', 'max']).optional().describe('Reasoning effort.'),
                    cwd: z.string().optional().describe('Diretório de trabalho absoluto opcional.'),
                }, (args) => exec('pane_spawn', args)),
                sdkTool('pane_write', 'Digita e envia um prompt no terminal de um pane existente. Requer confirmação.', {
                    paneId: z.string().describe('Pane alvo.'),
                    text: z.string().describe('Texto a enviar.'),
                }, (args) => exec('pane_write', args)),
                sdkTool('mission_spawn_pane', 'Abre um pane genérico vinculado a uma missão. Requer confirmação.', {
                    missionId: z.string().describe('Id da missão.'),
                    agent: agentEnum.optional(),
                    model: z.string().optional().describe('Modelo opcional.'),
                    effort: z.enum(['low', 'medium', 'high', 'max']).optional(),
                }, (args) => exec('mission_spawn_pane', args)),
                sdkTool('memory_remember', 'Grava/atualiza um fato ou preferência durável do usuário na memória persistida (sobrevive a restart). Mesma key = atualiza. Executa direto.', {
                    key: z.string().describe('Identificador curto e estável do fato (ex.: "modelo-preferido", "default-panes").'),
                    content: z.string().describe('O fato em 1 frase, do jeito que deve ser relembrado.'),
                }, (args) => exec('memory_remember', args)),
                sdkTool('memory_recall', 'Busca fatos na memória persistida (as memórias atuais já vêm no contexto — use só pra buscar algo omitido). Leitura, executa direto.', { query: z.string().optional().describe('Substring a buscar em key/conteúdo. Vazio = lista tudo.') }, (args) => exec('memory_recall', args)),
                sdkTool('memory_forget', 'Esquece de verdade um fato da memória persistida (key exata ou trecho do conteúdo). Executa direto.', { target: z.string().describe('Key exata ou trecho do fato a esquecer.') }, (args) => exec('memory_forget', args)),
                sdkTool('navigate', 'Navega a UI do Overclock: workspace, missão, tela (grid|catalog|settings), pane; mission-new abre o modal Nova Missão; wizard-set ("key:value", key ∈ mode|count|clis|squad|goal|midia|style|model|account — ex. "style:torre-de-controle", "model:fable-5", "account:conta-2", "clis:none" limpa; midia aceita provider OU nome de modelo, "midia:seedance" fixa o sub-modelo), wizard-fire dispara o Iniciar e wizard-cancel clica Cancelar (ambos sem query) dirigem o wizard aberto; run-agentic/run-squad disparam o wizard visível. Valores de wizard-set só de fala explícita do usuário — nunca invente. F-120: com o wizard aberto, "cancela"/"fecha a missão" é wizard-cancel DIRETO — nunca pergunte "pra onde". Se wizard-set/wizard-fire vier com ok:false, a mensagem diz o que falta — corrija e re-tente você mesmo, NUNCA peça pro usuário reiniciar. Leitura/UI, executa direto.', {
                    target: z.enum(['workspace', 'mission', 'mission-new', 'screen', 'pane', 'run-squad', 'run-agentic', 'wizard-set', 'wizard-fire', 'wizard-cancel']).describe('O que navegar.'),
                    query: z.string().optional().describe('Id/nome do alvo (dispensável em mission-new/wizard-fire/wizard-cancel; em wizard-set use "key:value").'),
                }, (args) => exec('navigate', args)),
            ],
        });
    }
    // ── Tool dispatch ─────────────────────────────────────────────────────────────
    /**
     * Despacha a tool Jarvis pelo nome para o registro interno do Overclock.
     * Mapeamento de nomes Jarvis → nomes do registry:
     *   squad_list → overclock_squad_list
     *   squad_open → compound: list + spawn + write
     *   mission_create → overclock_mission_create
     *   mission_list → overclock_mission_list
     *   mission_spawn_pane → overclock_mission_spawn_pane
     *   navigate → overclock_navigate
     *   pane_* → pane_* (mesmos nomes)
     */
    async runTool(workspace, jarvisName, args) {
        const ctx = {
            bridge: this.deps.bridge,
            resolveWorkspace: () => workspace,
            defaults: this.deps.defaults,
            handoffRegistry: this.deps.getHandoffRegistry(),
        };
        // memory_* (C-055): motor interno do Jarvis — despacha direto pro JarvisMemory,
        // NUNCA pro registry (não re-expor no MCP público).
        if (jarvisName === 'memory_remember') {
            const key = typeof args['key'] === 'string' ? args['key'] : '';
            const content = typeof args['content'] === 'string' ? args['content'] : '';
            if (!key || !content.trim())
                return JSON.stringify({ ok: false, error: 'memory_remember exige key e content.' });
            return JSON.stringify(this.memory.remember(key, content));
        }
        if (jarvisName === 'memory_recall') {
            const query = typeof args['query'] === 'string' ? args['query'] : undefined;
            const entries = this.memory.recall(query);
            return JSON.stringify({ ok: true, count: entries.length, entries });
        }
        if (jarvisName === 'memory_forget') {
            const target = typeof args['target'] === 'string' ? args['target'] : '';
            if (!target.trim())
                return JSON.stringify({ ok: false, error: 'memory_forget exige target.' });
            return JSON.stringify(this.memory.forget(target));
        }
        // squad_open: compound — list → find → spawn → write
        if (jarvisName === 'squad_open') {
            return this.runSquadOpen(workspace, ctx, args);
        }
        const registryName = JARVIS_TO_REGISTRY[jarvisName] ?? jarvisName;
        const registered = findRegisteredTool(registryName);
        if (!registered)
            return JSON.stringify({ ok: false, error: `tool não encontrada: ${registryName}` });
        return registered.invoke(args, ctx);
    }
    /**
     * squad_open: compound que lista squads, acha o melhor match por nome,
     * spawna via overclock_squad_spawn (createMission=true) e envia o briefing.
     */
    async runSquadOpen(workspace, ctx, args) {
        const targetName = typeof args['name'] === 'string' ? args['name'].toLowerCase() : '';
        const briefing = typeof args['briefing'] === 'string' ? args['briefing'] : '';
        const missionTitle = typeof args['mission_title'] === 'string' ? args['mission_title'] : undefined;
        // 1. List squads
        const listTool = findRegisteredTool('overclock_squad_list');
        if (!listTool)
            return JSON.stringify({ ok: false, error: 'overclock_squad_list não disponível' });
        const listRaw = await listTool.invoke({}, ctx);
        let squads = [];
        try {
            const parsed = JSON.parse(listRaw);
            squads = parsed.squads ?? [];
        }
        catch { /* squad list mal-formado */ }
        // 2. Find best match
        const match = squads.find((s) => s.name.toLowerCase().includes(targetName))
            ?? squads.find((s) => targetName.includes(s.name.toLowerCase()));
        if (!match) {
            return JSON.stringify({
                ok: false,
                error: `Squad "${args['name']}" não encontrado. Squads disponíveis: ${squads.map((s) => s.name).join(', ') || '(nenhum)'}`,
            });
        }
        // 3. Spawn squad (creates mission automatically)
        const spawnTool = findRegisteredTool('overclock_squad_spawn');
        if (!spawnTool)
            return JSON.stringify({ ok: false, error: 'overclock_squad_spawn não disponível' });
        const spawnRaw = await spawnTool.invoke({ squadId: match.id, createMission: true, input: briefing, ...(missionTitle ? { missionTitle } : {}) }, ctx);
        let paneId = null;
        try {
            const spawned = JSON.parse(spawnRaw);
            paneId = spawned.paneId ?? spawned.orchestratorPaneId ?? null;
        }
        catch {
            // Try regex fallback
            const m = spawnRaw.match(/"paneId"\s*:\s*"([^"]+)"/);
            paneId = m?.[1] ?? null;
        }
        if (!paneId) {
            return JSON.stringify({ ok: true, squad: match.name, spawnResult: spawnRaw, briefingSent: false });
        }
        // 4. Write briefing to orchestrator pane
        const writeTool = findRegisteredTool('pane_write');
        if (writeTool && briefing) {
            await writeTool.invoke({ paneId, text: briefing }, ctx).catch(() => { });
        }
        return JSON.stringify({ ok: true, squad: match.name, paneId, briefingSent: Boolean(briefing && writeTool) });
    }
    // ── executeSdkTool — wraps runTool com callId tracking e emit ────────────────
    async executeSdkTool(workspace, jarvisName, args) {
        const callId = this.takeCallId(jarvisName, args);
        this.setState('executing');
        const toolStart = Date.now();
        try {
            const result = await this.runTool(workspace, jarvisName, args);
            const summary = summarize(result);
            blog(`tool: ${jarvisName} ok em ${Date.now() - toolStart}ms — ${summary.slice(0, 100)}`);
            // F-101: se foi uma delegação (write/spawn/squad), passa a rastrear o pane pra
            // narrar o handoff-done dele proativamente na Live.
            this.trackDelegatedPane(jarvisName, args, result);
            this.deps.emit({ type: 'tool_result', callId, ok: true, summary });
            return { content: [{ type: 'text', text: result }] };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            blog(`tool: ${jarvisName} FALHOU em ${Date.now() - toolStart}ms — ${msg.slice(0, 100)}`);
            this.deps.emit({ type: 'tool_result', callId, ok: false, summary: msg.slice(0, 200) });
            return { content: [{ type: 'text', text: msg }], isError: true };
        }
    }
    // ── canUseTool — permission gate do Agent SDK ─────────────────────────────────
    makeCanUseTool() {
        return async (toolName, input, { toolUseID }) => {
            const plainName = toolName.replace(/^mcp__overclock__/, '');
            // F-105: PASS-THROUGH VERBATIM de ditado de trabalho. Quando o brain delega via
            // pane_write, o TEXTO enviado ao pane é FORÇADO ao pedido RAW do usuário (o que
            // entrou em send/delegar) — a reescrita do haiku é descartada. Brain = roteador
            // fino: escolhe QUAL pane; a fidelidade do payload é técnica (gate), não confiada
            // ao prompt. Em request grande o haiku resumia → pane recebia versão lossy; agora
            // recebe 100%. Só o path do brain passa por aqui: 'comandar' (pane_write literal)
            // usa runTool direto e não é tocado. Fase 1 do split ditado↔routing (ver F-105.1:
            // eventual = tirar o brain inteiro do path de ditado).
            // F-109: turno de delegar (pendingDelegationText setado) com missão ATIVA na tela =
            // o alvo é SEMPRE o pane orquestrador DELA — spawn de pane novo é espúrio (brain
            // "esquece" que o piloto já existe e abre um 2º pane aleatório, ex. haiku·low
            // default). Nega pane_spawn quando pane_list confirma pane(s) vivos na missão;
            // spawn só passa quando a missão está de fato vazia — e aí força model/effort
            // default do provider (nunca herda um default agressivo tipo haiku·low sem o
            // usuário ter pedido modelo explicitamente no ditado).
            if (plainName === 'pane_spawn' && this.pendingDelegationText?.trim() && this.lastScreenMissionId) {
                const list = await this.runTool(this.deps.getWorkspace(), 'pane_list', this.paneInventoryArgs());
                const hasLivePane = /"paneId"\s*:\s*"/.test(list);
                if (hasLivePane) {
                    this.deps.emit({ type: 'tool_call', toolName: plainName, args: input, callId: toolUseID, requiresConfirmation: false });
                    this.deps.emit({ type: 'tool_result', callId: toolUseID, ok: false, summary: 'Bloqueado: missão já tem pane — roteia com pane_write.' });
                    return {
                        behavior: 'deny',
                        message: 'A missão ATIVA na tela JÁ TEM pane(s) vivos (pane_list confirma). NÃO abra pane novo — chame pane_write no pane existente da missão.',
                    };
                }
                const askedModel = /haiku|sonnet|opus|gemini|codex|gpt-|kimi|modelo/i.test(this.pendingDelegationText);
                if (!askedModel && input && typeof input === 'object') {
                    const { model: _model, effort: _effort, ...rest } = input;
                    input = rest;
                }
            }
            if (plainName === 'pane_write' && this.pendingDelegationText?.trim()) {
                if (this.delegationPaneWriteDone) {
                    this.deps.emit({ type: 'tool_call', toolName: plainName, args: input, callId: toolUseID, requiresConfirmation: false });
                    this.deps.emit({ type: 'tool_result', callId: toolUseID, ok: false, summary: 'Bloqueado: já delegado neste turno.' });
                    return {
                        behavior: 'deny',
                        message: 'O pedido deste turno JÁ foi delegado a um pane (pane_write anterior). NÃO envie o mesmo prompt a um 2º pane — encerre o turno.',
                    };
                }
                this.delegationPaneWriteDone = true;
                const rawTurn = this.pendingDelegationText.trim();
                // F-105.1: tira o envelope de roteamento ("envia pro pane X: <conteúdo>") — o alvo já é
                // o paneId escolhido pelo brain; só o conteúdo pós-fronteira viaja, byte-a-byte.
                const raw = stripDelegationEnvelope(rawTurn).trim();
                const stripped = raw !== rawTurn;
                const current = typeof input.text === 'string'
                    ? input.text
                    : '';
                if (current.trim() !== raw) {
                    // C-085.1 r2: payload = 100% o ditado, ZERO anexo — nem fecho de handoff, nem marca
                    // de origem. O pane recebe exatamente o que o usuário falou; a adaptação pra voz
                    // (formato/narração) fica inteira do lado do Jarvis (narrateToLive/maybeNarrateProgress
                    // leem o output do pane e narram — handoff_submit, quando a entrega precisar, é
                    // acionado pelo próprio pane a partir do seu system prompt normal, não injetado aqui).
                    input = { ...input, text: raw };
                    blog(`delegar: pane_write forçado verbatim (${raw.length} chars raw${stripped ? ', envelope de roteamento stripado' : ''}; paráfrase do brain descartada)`);
                }
            }
            // F-099 r2: delegar XOR wizard. Com missão ATIVA na tela, delegar o pedido pro
            // pane orquestrador (pane_write) é TERMINAL pra aquele intent — o brain NÃO pode,
            // no MESMO turno, também reabrir o wizard agêntico (navigate mission-new/wizard-*/
            // run-*). O fix r1 (diretiva HARD em withWorkspaceContext) reduziu mas não fechou:
            // o brain delegava E navegava (aditivo). Aqui a exclusão é técnica, não de prompt:
            // 1º pane_write com missão ativa arma o flag; enquanto armado, navigate p/ abrir
            // wizard é NEGADO no gate. Navegação pura ("nova missão" sem delegar) não arma o
            // flag → segue permitida.
            if (plainName === 'pane_write' && this.lastScreenMissionId) {
                this.delegatedThisTurn = true;
            }
            const WIZARD_NAV_TARGETS = new Set(['mission-new', 'wizard-set', 'wizard-fire', 'run-agentic', 'run-squad']);
            if (plainName === 'navigate'
                && this.lastScreenMissionId
                && this.delegatedThisTurn
                && WIZARD_NAV_TARGETS.has(String(input?.target ?? ''))) {
                this.deps.emit({ type: 'tool_call', toolName: plainName, args: input, callId: toolUseID, requiresConfirmation: false });
                this.deps.emit({ type: 'tool_result', callId: toolUseID, ok: false, summary: 'Bloqueado: pedido já delegado à missão ativa.' });
                return {
                    behavior: 'deny',
                    message: 'O pedido JÁ foi delegado ao pane orquestrador da missão ativa (que já está lançada). NÃO abra o wizard Nova Missão nem re-navegue o modo agêntico — a delegação foi terminal para este pedido. Encerre o turno com um resumo curto do que foi delegado.',
                };
            }
            const requiresConfirmation = this.confirmEnabled() && CONFIRMATION_TOOLS.has(plainName) && !this.alwaysAllowed.has(plainName);
            this.queueCallId(plainName, toolUseID);
            this.deps.emit({ type: 'tool_call', toolName: plainName, args: input, callId: toolUseID, requiresConfirmation });
            if (!requiresConfirmation)
                return { behavior: 'allow', updatedInput: input };
            const { approved, always } = await this.waitForConfirmation(toolUseID);
            if (!approved) {
                this.dropCallId(plainName, toolUseID);
                this.deps.emit({ type: 'tool_result', callId: toolUseID, ok: false, summary: 'Negado pelo usuário.' });
                return {
                    behavior: 'deny',
                    message: 'O usuário negou a execução desta ferramenta.',
                };
            }
            if (always)
                this.alwaysAllowed.add(plainName);
            this.setState('executing');
            return { behavior: 'allow', updatedInput: input };
        };
    }
    queueCallId(toolName, callId) {
        const q = this.pendingCallIds.get(toolName) ?? [];
        q.push(callId);
        this.pendingCallIds.set(toolName, q);
    }
    dropCallId(toolName, callId) {
        const q = this.pendingCallIds.get(toolName);
        if (!q)
            return;
        const idx = q.indexOf(callId);
        if (idx >= 0)
            q.splice(idx, 1);
    }
    takeCallId(toolName, args) {
        const q = this.pendingCallIds.get(toolName);
        const callId = q?.shift();
        if (callId)
            return callId;
        const fallbackId = randomUUID();
        this.deps.emit({ type: 'tool_call', toolName, args, callId: fallbackId, requiresConfirmation: false });
        return fallbackId;
    }
    // ── Dispose ───────────────────────────────────────────────────────────────────
    dispose() {
        this.sdkLive?.dispose();
        this.sdkLive = null;
        // F-107 r2: shutdown = teardown DURO (não grace) — nada de WS/timer pendurado ao morrer,
        // inclusive um socket em grace destacado.
        this.liveSession?.stop();
        this.liveSession = null;
        this.graceSession?.stop();
        this.graceSession = null;
        if (this.questionPollTimer) {
            clearInterval(this.questionPollTimer);
            this.questionPollTimer = null;
        } // F-110
        if (this.awaitedAnswerTimer) {
            clearInterval(this.awaitedAnswerTimer);
            this.awaitedAnswerTimer = null;
        } // C-050.4
        this.awaitedAnswer.clear();
        for (const { resolve, timer } of this.pendingConfirmations.values()) {
            clearTimeout(timer);
            resolve({ approved: false, always: false });
        }
        this.pendingConfirmations.clear();
    }
}
// ── Mapeamento de nomes de tool Jarvis → nomes no registry ──────────────────────
const JARVIS_TO_REGISTRY = {
    squad_list: 'overclock_squad_list',
    // squad_open handled separately (compound)
    mission_create: 'overclock_mission_create',
    mission_list: 'overclock_mission_list',
    mission_spawn_pane: 'overclock_mission_spawn_pane',
    navigate: 'overclock_navigate',
    // pane_list, pane_read, pane_spawn, pane_write: same name in registry
};
//# sourceMappingURL=JarvisService.js.map