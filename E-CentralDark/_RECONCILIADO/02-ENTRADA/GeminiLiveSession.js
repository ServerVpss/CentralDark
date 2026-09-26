/**
 * GeminiLiveSession — full-duplex voice transport for Jarvis (F-056).
 *
 * Ported from _refs/overclock-jarvis/packages/shell/src/main/GeminiLiveSession.ts
 * (Electron reference) to the Tauri sidecar. Behavior preserved 1:1; only the
 * logger (electron-log → process.stderr.write) and the JarvisEvent import
 * (local sidecar type vs shared/jarvis.ts) changed.
 *
 * The Live session exposes 4 coarse voice tools (delegar/consultar/ler/navegar)
 * declared inline below — NOT the 10-tool Agent SDK catalog. 'delegar' hands
 * real work off to the Claude Agent SDK brain (JarvisService.send); the other 3
 * are answered directly so the voice loop never blocks on the slower LLM turn.
 */
import WebSocket from 'ws';
const LIVE_MODEL = 'models/gemini-3.1-flash-live-preview';
const WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
// F-059: WS que abre mas nunca recebe setupComplete deixava a sessão presa em
// 'connecting' (→ state=thinking no renderer) PRA SEMPRE — sem error, sem close,
// sem retry. Timeout força terminate() → 'close' → attemptReconnect → exaustão
// emite o 'error' final que derruba o jarvisMode e rearma o wake.
const SETUP_TIMEOUT_MS = 10_000;
// F-113: cada injeção de contexto/narração vira um turno falável. Sem serialização,
// narrações concorrentes (watcher + handoff-done + updateScreen) chegam juntas e as
// utterances se intercalam. A fila manda 1 turno por vez e libera no turnComplete do
// servidor; TURN_MAX_MS é o disjuntor caso um turno nunca sinalize fim (não trava a fila).
const TURN_MAX_MS = 15_000;
// F-113: o modelo native-audio às vezes ECOAVA a instrução crua ("...Narre o desfecho pro
// usuário em 1 frase") em vez de executá-la. O envelope separa DIRETIVA (constante, fora do
// que se fala) de EVENTO (payload marcado como dado), instruindo a nunca ler o texto literal.
const NARRATION_ENVELOPE = 'CONTEXTO INTERNO — NÃO leia nada disto em voz alta, não repita rótulos nem instruções. '
    + 'A partir do EVENTO abaixo, conte pro usuário, com suas próprias palavras e em 1 frase '
    + 'curta e natural, só a novidade que ele precisa saber.\n\nEVENTO:\n';
// C-092.7 (b): a rajada de navegação (wizard) emitia N [update] de tela quase-idênticos, cada um
// um turno = uma geração rebillando o contexto INTEIRO. Coalescing: só o ÚLTIMO estado dentro
// desta janela vira turno; idêntico ao anterior é descartado.
const SCREEN_UPDATE_DEBOUNCE_MS = 1_500;
// C-092.7 (guard-rail): orçamento de input estimado por sessão. Estourou → avisa no log (histórico
// crescendo = compressão/idle não estão segurando). ~4 chars/token é a aproximação padrão do Gemini.
const GUARD_RAIL_TOKEN_BUDGET = 600_000;
function estTokens(text) {
    return Math.ceil(text.length / 4);
}
function llog(msg) {
    process.stderr.write(`[gemini-live] ${msg}\n`);
}
/** F-121: hash barato (djb2) só pra breadcrumb de diagnóstico — não é criptográfico. */
function cheapHash(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++)
        h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16);
}
/** F-126: normaliza texto pra comparação de eco — minúsculas, sem acento/pontuação, espaços
 *  colapsados. O eco do TTS volta pelo STT com pequenas variações; a normalização estabiliza. */
export function normEcho(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
const ECHO_MIN_CHARS = 6;
/** F-126: matcher PURO (test\u00e1vel sem WS) \u2014 o input transcrito \u00e9 eco do TTS rec\u00e9m-falado?
 *  `recentSpokenNorm` j\u00e1 vem normalizado (janela deslizante); `input` \u00e9 o transcript cru do mic.
 *  Eco = substring cont\u00edguo da fala recente, OU \u226580% das palavras significativas (>2 chars)
 *  presentes nela. Curto demais / janela vazia \u2192 n\u00e3o \u00e9 eco (deixa passar). Barge-in real (fala
 *  diferente do TTS) n\u00e3o casa \u2192 false. */
export function isEchoOf(recentSpokenNorm, input) {
    const norm = normEcho(input);
    if (norm.length < ECHO_MIN_CHARS)
        return false;
    if (!recentSpokenNorm)
        return false;
    if (recentSpokenNorm.includes(norm))
        return true;
    const words = norm.split(' ').filter((w) => w.length > 2);
    if (words.length < 2)
        return false;
    const hits = words.filter((w) => recentSpokenNorm.includes(w)).length;
    return hits / words.length >= 0.8;
}
// F-133: SINGLETON de sessão Live — NO MÁXIMO 1 sessão viva por processo do sidecar. Duas
// GeminiLiveSession reconectando em paralelo = "2 Jarvis falando ao mesmo tempo" (remount do
// engine + reuso quente vazam a velha). Toda conexão nova REIVINDICA este slot e mata a anterior
// (inclusive a em grace); a órfã que não é a corrente se AUTO-ENCERRA antes de reconectar
// (checagem de identidade). Regra do repo: recurso compartilhado = isolar por identidade.
let currentLiveSession = null;
export class GeminiLiveSession {
    deps;
    ws = null;
    resumeHandle = undefined;
    reconnectAttempts = 0;
    maxReconnectAttempts = 3;
    stopped = false;
    /** F-138: timestamp da última mensagem do SERVIDOR — socket local OPEN não prova sessão viva
     *  do lado do Gemini; freshness disponível pro reuso de grace decidir cadáver vs vivo. */
    lastServerMsgAt = 0;
    pendingToolCalls = new Set();
    pendingContext = [];
    // F-113: fila de turnos injetados (contexto/narração) serializada — 1 por vez, próximo
    // libera no turnComplete do servidor. Evita utterances intercaladas de narrações concorrentes.
    sendQueue = [];
    turnBusy = false;
    turnTimer = null;
    // F-121: breadcrumb barato por turno de fala (áudio x transcript) — pra decidir, no PRÓXIMO
    // episódio de fala duplicada, se foi (a) retry/reenvio (áudio E transcript dobram), (b)
    // injeção dupla, ou (c) transcript duplicado sem áudio real (log/UI, cosmético). Reseta no
    // turnComplete/interrupted (fim de turno).
    turnAudioChunks = 0;
    turnTranscriptEmits = 0;
    turnLastAssistantFinal = null;
    // C-071.1c: chunks de mic entre o wake-HIT e o setupComplete (~1-3s cegos) — mesmo
    // padrão do pendingContext; flush na conexão. Cap por bytes (16kHz Int16 = 32KB/s).
    pendingMic = [];
    pendingMicBytes = 0;
    static PENDING_MIC_MAX_BYTES = 160_000; // ~5s de áudio
    voiceName = 'Charon';
    droppedMicChunks = 0;
    // F-107 r2: parada SUAVE — o usuário separa turnos clicando o orb (stopLive → startLive
    // por mensagem). Cada RECONEXÃO faz o native-audio re-sortear a prosódia (tom/ritmo/energia)
    // — timbre é fixo (Charon), mas a "atuação" muda. Manter o MESMO WS vivo por uma janela de
    // grace faz o re-toggle rápido reusar a conexão em vez de abrir outra → prosódia estável.
    graceTimer = null;
    softStopped = false;
    // F-126: janela deslizante do texto FALADO recente (transcript de saída do TTS, normalizado).
    // Input transcrito que é substring/alto-overlap disto = ECO do próprio Jarvis voltando pelo mic
    // (AEC nativo não converge), NÃO fala do usuário — descartado como turno de usuário. Barge-in
    // real (fala DIFERENTE do TTS) não casa e segue normal. Mitigação (b) do F-126; AEC real fica
    // na fila áudio. NOTA: a interrupção/recomeço é server-side no Gemini — o descarte aqui impede
    // o eco de VIRAR COMANDO (lastUserLiveUtterance) e limpa a UI; não desfaz a interrupção do modelo.
    recentSpokenNorm = '';
    static ECHO_WINDOW_CHARS = 300;
    // C-092.7 (b): coalescing de [update] de tela — só o ÚLTIMO estado dentro da janela de debounce
    // vira turno; dedup contra o último efetivamente injetado (rajada do wizard = 6 quase-idênticos).
    screenUpdatePending = null;
    screenUpdateTimer = null;
    lastScreenUpdateSent = '';
    // C-092.7 (instrumentação + guard-rail): custo de INPUT estimado desta sessão. O system prompt é
    // rebillado a cada geração; cada turno injetado soma ao histórico que também rebilla. tokenBySource
    // dá o ranking real da fatura (medir antes de cortar mais).
    systemPromptTokens = 0;
    tokenBySource = { update: 0, narrate: 0, context: 0, user: 0, tool: 0 };
    sessionEstInputTokens = 0;
    runningInjectedTokens = 0;
    guardRailTripped = false;
    constructor(deps) {
        this.deps = deps;
    }
    /** F-126: o input transcrito é eco do próprio TTS recém-falado? Delega ao matcher puro. */
    isEcho(input) {
        return isEchoOf(this.recentSpokenNorm, input);
    }
    /** F-107 r2: o WS está aberto e utilizável (nem parado nem em grace expirado). */
    isLive() {
        return !this.stopped && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
    /** F-138: elegível pra REUSO QUENTE? Stop deliberado é TERMINAL (stopped=true), perda do slot
     *  singleton (F-133) desqualifica, e conexão SEM FRESCOR (servidor mudo há mais que o
     *  threshold — cadáver server-side com socket local OPEN, o caso real do log: "reuso quente"
     *  + 37 chunks pro vácuo + zero resposta, sem ws close) também. Só grace REAL (softStopped)
     *  + WS aberto + dona do slot + servidor recém-falante; qualquer outra coisa → conexão fresh
     *  (sempre segura; custo = re-sorteio de prosódia, aceito). NOTA: a âncora é a última msg do
     *  SERVIDOR (não o softStop) de propósito — re-carimbar no off mascararia servidor já morto
     *  antes do off (o zumbi real do F-138). Consequência aceita: silêncio pré-off + espera no
     *  grace somando >120s rejeita um reuso possivelmente legítimo e conecta fresh. */
    static REUSE_FRESHNESS_MAX_MS = 120_000;
    // TEMP (2026-07-04): reuso quente DESLIGADO — 120s de frescor era otimista demais; sessão
    // com servidor mudo há 55s já tava morta do lado do Gemini (mic mandando pro vácuo, zero
    // resposta). Até medir o timeout real do servidor, sempre fresh (custo = re-sorteio de
    // prosódia; seguro).
    isReusable() {
        return false;
    }
    async start(workspace, voiceName) {
        // F-107 r2: reuso QUENTE — um softStop recente deixou o WS vivo em grace. Reconectar
        // re-sortearia a prosódia do native-audio; reusar a MESMA conexão preserva tom/ritmo
        // entre turnos que o usuário separou clicando o orb. Sem reconexão, sem setup novo.
        // F-138: elegibilidade estrita (isReusable) — sessão stopped ou sem o slot singleton
        // NUNCA é reusada; cai no caminho fresh abaixo.
        if (this.isReusable()) {
            this.cancelGrace();
            this.softStopped = false;
            // F-133: reuso quente é a MESMA conexão — reafirma o slot singleton (a instância já era
            // a corrente; explícito pra não vazar caso algo tenha reivindicado o slot no intervalo).
            currentLiveSession = this;
            llog(`reuso quente da sessão Live (grace) — sem reconexão, prosódia preservada (última msg do servidor há ${Math.round((Date.now() - this.lastServerMsgAt) / 1000)}s)`);
            this.deps.emit({ type: 'live_state', state: 'listening' });
            this.flushPendingContext();
            this.flushPendingMic();
            return { ok: true };
        }
        this.stopped = false;
        this.softStopped = false;
        this.cancelGrace();
        this.reconnectAttempts = 0;
        if (voiceName && /^[A-Za-z]+$/.test(voiceName))
            this.voiceName = voiceName;
        this.claimSingleton();
        return this.connect(workspace);
    }
    /** F-133: reivindica o slot singleton — mata QUALQUER sessão Live anterior (inclusive a em
     *  grace) antes de conectar a nova. Só a instância corrente reconecta; as outras se
     *  auto-encerram no attemptReconnect (checagem de identidade). É a regra do repo "recurso
     *  compartilhado = isolar por identidade" aplicada à sessão de voz. */
    claimSingleton() {
        if (currentLiveSession && currentLiveSession !== this) {
            llog('singleton: encerrando sessão Live anterior antes de conectar a nova (F-133)');
            currentLiveSession.stop();
        }
        currentLiveSession = this;
    }
    stop() {
        this.cancelGrace();
        this.softStopped = false;
        this.stopped = true;
        this.pendingMic = [];
        this.pendingMicBytes = 0;
        this.recentSpokenNorm = '';
        this.clearScreenUpdate();
        this.resetTurnQueue();
        if (this.ws) {
            this.ws.terminate();
            this.ws = null;
        }
        // F-133: libera o slot singleton se ESTA é a sessão corrente — a próxima conexão o reivindica
        // limpo. Não mexe se outra instância já assumiu (não derruba a posse alheia).
        if (currentLiveSession === this)
            currentLiveSession = null;
        this.deps.emit({ type: 'live_state', state: 'closed' });
    }
    /**
     * F-107 r2: parada SUAVE — mantém o WS vivo por `graceMs` pra um re-toggle rápido reusar a
     * MESMA conexão (native-audio re-sorteia prosódia a cada conexão nova). Expirou sem reuso →
     * `stop()` real. Se o WS já não está vivo, cai direto no hard stop.
     */
    softStop(graceMs) {
        if (!this.isLive()) {
            this.stop();
            return;
        }
        if (this.softStopped)
            return;
        this.softStopped = true;
        // mic para no renderer no modeOff; zera o buffer pré-conexão pra não vazar fala velha no reuso.
        this.pendingMic = [];
        this.pendingMicBytes = 0;
        llog(`softStop — sessão em grace ${graceMs}ms (WS vivo p/ reuso; sem reconexão)`);
        this.deps.emit({ type: 'live_state', state: 'closed' });
        this.cancelGrace();
        this.graceTimer = setTimeout(() => {
            this.graceTimer = null;
            if (this.softStopped) {
                llog('grace expirou sem reuso — encerrando WS de vez');
                this.stop();
            }
        }, graceMs);
    }
    cancelGrace() {
        if (this.graceTimer) {
            clearTimeout(this.graceTimer);
            this.graceTimer = null;
        }
    }
    pushMic(chunk) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if (this.stopped)
                return;
            // C-071.1c: enfileira em vez de descartar — fala emendada logo após o wake
            // chegava antes do setupComplete e caía no vazio. Cap descarta o mais VELHO
            // (o fim da fala importa mais que o começo num buffer estourado).
            this.pendingMic.push(chunk);
            this.pendingMicBytes += chunk.length;
            while (this.pendingMicBytes > GeminiLiveSession.PENDING_MIC_MAX_BYTES && this.pendingMic.length > 1) {
                const oldest = this.pendingMic.shift();
                this.pendingMicBytes -= oldest.length;
                // F-059: mic caindo no vazio era invisível — 1 linha a cada 100 chunks (~8s).
                this.droppedMicChunks++;
                if (this.droppedMicChunks % 100 === 1)
                    llog(`pushMic: buffer pré-conexão cheio — ${this.droppedMicChunks} chunks descartados`);
            }
            return;
        }
        this.droppedMicChunks = 0;
        this.sendMicChunk(chunk);
    }
    endMicTurn() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.stopped || this.softStopped)
            return;
        this.ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
    }
    sendMicChunk(chunk) {
        const msg = {
            realtimeInput: {
                audio: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: chunk.toString('base64'),
                },
            },
        };
        this.ws?.send(JSON.stringify(msg));
    }
    flushPendingMic() {
        if (this.pendingMic.length === 0)
            return;
        const queued = this.pendingMic.splice(0);
        this.pendingMicBytes = 0;
        llog(`flush de ${queued.length} chunks de mic bufferizados pré-setupComplete`);
        for (const chunk of queued) {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
                return;
            this.sendMicChunk(chunk);
        }
    }
    /**
     * Injects SILENT context (reconnect transcript, workspace restore) as a live turn.
     * F-113: enfileirado — nunca intercala com narrações concorrentes.
     */
    injectContext(text) {
        this.routeTurn(text);
    }
    /**
     * F-113: injeta uma NARRAÇÃO — o payload (evento delegado, progresso, handoff) vai
     * embrulhado no envelope que separa diretiva de dado, pra o modelo NUNCA ler a instrução
     * crua em voz alta. Também entra na fila serializada.
     */
    injectNarration(payload) {
        this.routeTurn(`${NARRATION_ENVELOPE}${payload}`);
    }
    /**
     * C-092.7 (b): screen [update] COALESCIDO. A rajada de navegação (wizard) emitia N turnos de
     * tela quase-idênticos — cada um uma geração rebillando o contexto inteiro. Debounce curto:
     * só o ÚLTIMO estado dentro da janela vira turno; idêntico ao anterior é descartado. O
     * comportamento (Jarvis sabe a tela) é preservado — o último estado é o que vale.
     */
    injectScreenUpdate(text) {
        this.screenUpdatePending = text;
        if (this.screenUpdateTimer)
            clearTimeout(this.screenUpdateTimer);
        this.screenUpdateTimer = setTimeout(() => this.flushScreenUpdate(), SCREEN_UPDATE_DEBOUNCE_MS);
    }
    flushScreenUpdate() {
        if (this.screenUpdateTimer) {
            clearTimeout(this.screenUpdateTimer);
            this.screenUpdateTimer = null;
        }
        const text = this.screenUpdatePending;
        this.screenUpdatePending = null;
        if (!text)
            return;
        // dedup: rajada onde o estado final é igual ao já injetado = zero turno novo.
        if (normEcho(text) === normEcho(this.lastScreenUpdateSent)) {
            llog('[jarvis-tokens] screen [update] coalescido — estado final idêntico ao último, descartado');
            return;
        }
        this.lastScreenUpdateSent = text;
        this.routeTurn(text);
    }
    /** C-092.7 (instrumentação): classifica a FONTE do turno pelo prefixo pra o breadcrumb de custo. */
    classifySource(text) {
        if (text.startsWith(NARRATION_ENVELOPE))
            return 'narrate';
        if (text.startsWith('[update]'))
            return 'update';
        if (text.startsWith('[wake]') || text.startsWith('[reconexão]'))
            return 'context';
        return 'user';
    }
    /** F-113: pré-conexão vai pro buffer; conectado entra na fila serializada.
     *  F-138: sessão em GRACE (softStopped) NÃO recebe turno — injeção de tela numa sessão
     *  suave-parada fazia o Gemini FALAR com o modo desligado (zumbi falante); buffera e o
     *  reuso/reconexão faz o flush. */
    routeTurn(text) {
        if (this.softStopped || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.pendingContext.push(text);
            return;
        }
        this.sendQueue.push(text);
        this.drainSendQueue();
    }
    /** F-113: manda o próximo turno só quando nenhum está em voo. Libera no turnComplete. */
    drainSendQueue() {
        if (this.turnBusy || this.sendQueue.length === 0)
            return;
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        const text = this.sendQueue.shift();
        this.instrumentInput(this.classifySource(text), text);
        this.turnBusy = true;
        this.ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true } }));
        if (this.turnTimer)
            clearTimeout(this.turnTimer);
        this.turnTimer = setTimeout(() => { this.releaseTurn(); }, TURN_MAX_MS);
    }
    /** F-113: turno atual terminou (turnComplete ou disjuntor) → libera e drena o próximo. */
    releaseTurn() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
        if (!this.turnBusy)
            return;
        this.turnBusy = false;
        this.drainSendQueue();
    }
    /** F-113: zera a fila entre conexões pra não carregar turnBusy stale pro socket novo. */
    resetTurnQueue() {
        this.sendQueue = [];
        this.turnBusy = false;
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
    }
    /** C-092.7 (b): descarta um [update] de tela pendente (debounce em voo) — entre conexões ou no
     *  stop, o estado bufferizado é stale e não deve virar turno na sessão nova. */
    clearScreenUpdate() {
        if (this.screenUpdateTimer) {
            clearTimeout(this.screenUpdateTimer);
            this.screenUpdateTimer = null;
        }
        this.screenUpdatePending = null;
    }
    /**
     * C-092.7 (instrumentação + guard-rail): contabiliza um pedaço de INPUT (turno injetado ou
     * tool-response). Cada geração rebilla o system prompt + o histórico acumulado — por isso o
     * custo estimado da sessão cresce a cada turno mesmo com payloads pequenos. Breadcrumb
     * `[jarvis-tokens]` dá o ranking por fonte (medir antes de cortar mais).
     */
    instrumentInput(source, text, name) {
        const tok = estTokens(text);
        this.tokenBySource[source] += tok;
        this.runningInjectedTokens += tok;
        // aproximação do que a Live rebilla nesta geração: system (fixo) + tudo injetado até aqui.
        this.sessionEstInputTokens += this.systemPromptTokens + this.runningInjectedTokens;
        const b = this.tokenBySource;
        llog(`[jarvis-tokens] ${source}${name ? `:${name}` : ''} chars=${text.length} ~tok=${tok}`
            + ` | sess~in=${Math.round(this.sessionEstInputTokens / 1000)}k`
            + ` inj{update=${b.update} narrate=${b.narrate} ctx=${b.context} user=${b.user} tool=${b.tool}}`);
        if (!this.guardRailTripped && this.sessionEstInputTokens > GUARD_RAIL_TOKEN_BUDGET) {
            this.guardRailTripped = true;
            llog(`[jarvis-tokens] GUARD-RAIL: input estimado da sessão passou de `
                + `${Math.round(GUARD_RAIL_TOKEN_BUDGET / 1000)}k tokens — histórico crescendo; `
                + `verifique compressão (sliding window) e o timeout de ociosidade`);
        }
    }
    flushPendingContext() {
        if (this.pendingContext.length === 0)
            return;
        const queued = this.pendingContext.splice(0);
        for (const text of queued)
            this.sendQueue.push(text);
        this.drainSendQueue();
    }
    async connect(workspace) {
        const key = this.deps.getGoogleKey();
        if (!key) {
            const err = 'Chave Google AI não configurada. Configure em Jarvis > Configurações.';
            this.deps.emit({ type: 'error', message: err });
            this.deps.emit({ type: 'live_state', state: 'error' });
            return { ok: false, error: err };
        }
        this.deps.emit({ type: 'live_state', state: 'connecting' });
        llog(`connect: attempt=${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        // F-113: socket novo — turnos que ficaram na fila do socket morto voltam pro buffer
        // pré-conexão (reenviados no setupComplete) e o estado busy/timer zera.
        if (this.sendQueue.length > 0)
            this.pendingContext.unshift(...this.sendQueue);
        this.resetTurnQueue();
        return new Promise((resolve) => {
            // key vai como query param; nunca logar a URL completa
            const ws = new WebSocket(`${WS_BASE}?key=${key}`);
            this.ws = ws;
            let setupDone = false;
            let resolved = false;
            let setupTimer = null;
            const clearSetupTimer = () => {
                if (setupTimer) {
                    clearTimeout(setupTimer);
                    setupTimer = null;
                }
            };
            const doResolve = (result) => {
                if (!resolved) {
                    resolved = true;
                    resolve(result);
                }
            };
            // F-059: armado já na criação — cobre também o TCP/TLS que nunca abre.
            setupTimer = setTimeout(() => {
                if (setupDone || this.stopped)
                    return;
                llog(`setup timeout (${SETUP_TIMEOUT_MS}ms sem setupComplete) — terminate → reconnect`);
                // Sem doResolve de propósito: ok:false no attempt 0 faria o renderer derrubar o
                // jarvisMode enquanto os retries ainda podem salvar (mesma razão do F-057 no
                // handler de error). O terminate dispara 'close' → attemptReconnect; a exaustão
                // é quem emite o 'error' final.
                ws.terminate();
            }, SETUP_TIMEOUT_MS);
            ws.on('open', () => {
                if (this.stopped) {
                    clearSetupTimer();
                    ws.terminate();
                    doResolve({ ok: false, error: 'sessão parada antes de conectar' });
                    return;
                }
                llog('ws open — enviando setup');
                ws.send(JSON.stringify(this.buildSetup(workspace)));
            });
            ws.on('message', (raw) => {
                let msg;
                try {
                    msg = JSON.parse(raw.toString());
                }
                catch {
                    return;
                }
                this.lastServerMsgAt = Date.now(); // F-138: freshness pro reuso de grace
                if (!setupDone && 'setupComplete' in msg) {
                    setupDone = true;
                    clearSetupTimer();
                    this.reconnectAttempts = 0;
                    llog('setupComplete — sessão viva (listening)');
                    this.deps.emit({ type: 'live_state', state: 'listening' });
                    doResolve({ ok: true });
                    this.flushPendingContext();
                    this.flushPendingMic();
                    return;
                }
                this.handleMessage(msg, workspace);
            });
            ws.on('error', (err) => {
                clearSetupTimer();
                if (this.stopped) {
                    doResolve({ ok: false, error: 'sessão parada' });
                    return;
                }
                if (!setupDone) {
                    const message = `Erro ao conectar ao Gemini Live: ${err.message}`;
                    llog(`connect error: ${err.message}`);
                    // F-057: durante RECONEXÃO (attempts > 0) não emitir 'error' — o renderer derruba o
                    // jarvisMode em live_state 'error' e mataria a conversa enquanto os retries 2/3 ainda
                    // podem salvar a sessão. A exaustão (attemptReconnect) é quem emite o 'error' final.
                    if (this.reconnectAttempts === 0) {
                        this.deps.emit({ type: 'error', message });
                        this.deps.emit({ type: 'live_state', state: 'error' });
                    }
                    doResolve({ ok: false, error: message });
                }
            });
            ws.on('close', (code) => {
                clearSetupTimer();
                this.ws = null;
                llog(`ws close (code=${code} setupDone=${setupDone} stopped=${this.stopped})`);
                if (this.stopped)
                    return;
                // F-107 r2: WS caiu DURANTE o grace (ex. goAway do servidor numa sessão ociosa que o
                // usuário desligou) — NÃO reconectar. Reconexão aqui ressuscitaria uma sessão off e
                // re-sortearia a prosódia; o próximo toggle-on abre uma conexão nova por conta própria.
                if (this.softStopped) {
                    this.softStopped = false;
                    this.cancelGrace();
                    llog('WS caiu durante grace — sessão encerrada sem reconexão');
                    this.deps.emit({ type: 'live_state', state: 'closed' });
                    return;
                }
                this.attemptReconnect(workspace);
            });
        });
    }
    buildSetup(workspace) {
        const resumption = {};
        if (this.resumeHandle)
            resumption.handle = this.resumeHandle;
        // C-092.7: o system prompt é rebillado a cada geração — medir o tamanho é a base do custo.
        const systemText = this.deps.getLivePrompt(workspace);
        this.systemPromptTokens = estTokens(systemText);
        llog(`[jarvis-tokens] system prompt chars=${systemText.length} ~tok=${this.systemPromptTokens} (rebillado a cada geração)`);
        return {
            setup: {
                model: LIVE_MODEL,
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    // F-090 r2: voiceName já era pinado (voz fixa entre turnos/reconexões); o que
                    // variava era a PROSÓDIA — native-audio sorteia timbre/energia por geração com
                    // temperatura default alta. Temperatura baixa estabiliza a "vibração" da voz.
                    // F-107: 0.6 REDUZIU mas não estabilizou o tom/ritmo entre falas. Baixado a 0.3
                    // (faixa mín. que ainda não vira monótono/robótico) + direção de ATUAÇÃO fixa no
                    // prompt da Live (jarvisLivePrompt › ENTREGA DE VOZ) — os dois levers atacam o
                    // mesmo sorteio acústico por config + instrução. seed/topP e half-cascade (voz
                    // TTS determinística, decisão de produto) ficam pra frente seguinte se ainda variar.
                    temperature: 0.3,
                    // F-090: languageCode pina pt-BR nos modelos half-cascade; modelos native-audio
                    // ignoram o campo e auto-detectam — pra esses, a instrução de idioma no prompt
                    // da Live (jarvisLivePrompt) é quem segura o sotaque brasileiro.
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: this.voiceName } },
                        languageCode: 'pt-BR',
                    },
                },
                systemInstruction: { parts: [{ text: systemText }] },
                tools: [
                    {
                        functionDeclarations: [
                            {
                                name: 'delegar',
                                description: 'Delega trabalho substancial ao cérebro Claude (squad/panes do Overclock). Use para pedidos de TRABALHO real (codar, pesquisar, criar/rodar tarefa). NÃO use para abrir/mostrar/ir para missão, tela ou workspace — isso é "navegar", não trabalho.',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: { briefing: { type: 'STRING', description: 'Descrição completa e fiel da tarefa.' } },
                                    required: ['briefing'],
                                },
                            },
                            {
                                name: 'consultar',
                                description: 'Consulta estado do Overclock (missões, panes, squads) e devolve resumo textual.',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: { pergunta: { type: 'STRING', description: 'O que o usuário quer saber.' } },
                                    required: ['pergunta'],
                                },
                            },
                            {
                                name: 'ler',
                                description: 'Lê o output recente de um pane (o que o agente/Claude respondeu ali). Use quando o usuário perguntar "o que o pane respondeu / qual o resultado / o que apareceu". Sem paneId → lê o pane ativo.',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: { paneId: { type: 'STRING', description: 'Id do pane, ou "ativo" para o pane atual.' } },
                                    required: [],
                                },
                            },
                            {
                                name: 'navegar',
                                description: 'Navega a UI do Overclock: abre/foca um workspace, missão, tela (grid/catalog/settings) ou pane. Também dirige o modal Nova Missão: target "mission-new" abre o modal; "wizard-set" com query "key:value" (mode/count/clis/squad/goal/midia/style/model/account) preenche um passo; "wizard-fire" aperta o Iniciar do modo atual; "wizard-cancel" clica Cancelar e fecha o modal (F-120: com o wizard aberto, "cancela"/"fecha a missão" é ESSE target direto — NUNCA pergunte "pra onde eu quero ir"). Valores de wizard-set vêm SÓ de fala explícita do usuário — NUNCA invente valor; na dúvida, pergunte. Se a navegação voltar ok:false, a mensagem diz exatamente o que falta — corrija com um novo wizard-set/wizard-fire e re-tente; NUNCA peça pro usuário reiniciar/recomeçar a missão. Use SEMPRE que o usuário pedir para abrir/mostrar/ir/criar missão. NÃO delegue navegação.',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: {
                                        target: { type: 'STRING', description: "O que navegar: 'workspace', 'mission', 'mission-new', 'screen', 'pane', 'wizard-set', 'wizard-fire' ou 'wizard-cancel'." },
                                        query: { type: 'STRING', description: 'Nome/título ou id do alvo; em wizard-set, "key:value" (ex.: "mode:livre", "count:4", "clis:claude,codex", "squad:nome", "goal:objetivo", "midia:google,replicate", "style:torre-de-controle" ("torre de controle"→scout-dispatch · "cadeia de comando"→one-one-n), "model:fable-5" (modelo dos panes do Livre), "account:conta-2" (conta/provider dos panes — use DÍGITO, nunca por extenso)). "clis:none" limpa o campo de CLIs. Vazio em mission-new/wizard-fire/wizard-cancel.' },
                                    },
                                    required: ['target'],
                                },
                            },
                            {
                                name: 'encerrar',
                                description: 'Encerra a sessão de voz (o usuário se despediu: "tchau", "é só isso", "valeu", "pode desligar"). Responda 1 frase curta de despedida E chame esta função — nunca desligue sem chamá-la.',
                                parameters: { type: 'OBJECT', properties: {} },
                            },
                            {
                                name: 'comandar',
                                // C-074: equivalente por voz do pane_write — digita e submete um comando/prompt
                                // LITERAL num pane vivo. Só chame com pedido EXPLÍCITO do usuário (nunca inventar
                                // comando) — mesma doutrina F-057 item 3 do 'delegar'.
                                description: 'Digita e envia (Enter) um comando/prompt literal no terminal de um pane já aberto — ex. "/model opus", "/effort high", ou uma pergunta rápida. Use quando o usuário pedir EXPLICITAMENTE para mandar/digitar algo NUM PANE JÁ ABERTO (ex. "muda esse pane pra opus", "manda um /clear pro pane do codex"). NÃO use para abrir pane novo (isso é "delegar") nem para trabalho substancial (isso também é "delegar"). NUNCA invente o texto — use exatamente o que o usuário pediu para mandar.',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: {
                                        paneId: { type: 'STRING', description: 'Id do pane alvo, "ativo" para o pane focado/mais recente, ou um trecho do nome/agente (ex. "codex", "orquestrador") para resolver por nome. C-088: o usuário pode dizer "terminal N" — é sinônimo de "pane N", resolve igual. Vazio = pane ativo.' },
                                        texto: { type: 'STRING', description: 'O comando/prompt EXATO a digitar e enviar, do jeito que o usuário pediu (ex. "/model opus").' },
                                    },
                                    required: ['texto'],
                                },
                            },
                            {
                                name: 'restaurar',
                                // C-091: mesma ação do botão "Restaurar todos" — a missão na tela tem panes
                                // SALVOS (fechados) listados; a voz aciona a MESMA rota, nunca reimplementa o spawn.
                                description: 'Restaura pane(s) SALVOS (fechados) da missão na tela — mesma ação do botão "Restaurar todos". Use quando o usuário pedir pra restaurar/reabrir panes salvos ("restaura os panes", "restaura o piloto", "restaura o chefe scout"). Sem alvo = restaura todos.',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: {
                                        alvo: { type: 'STRING', description: 'Quem restaurar: vazio ou "todos" = todos os salvos; um papel ("piloto"/"orquestrador", "chefe scout", "worker"); ou um número/id de pane. Só de fala explícita — nunca invente.' },
                                    },
                                    required: [],
                                },
                            },
                            {
                                name: 'perguntar',
                                // C-085: pergunta de TRABALHO/domínio (não UI) → roteia ao pane que o usuário está
                                // usando e narra a RESPOSTA DELE. Jarvis = interface/roteador, não pensador: o
                                // conhecimento do trabalho vive no pane que executa, não no brain da voz.
                                description: 'Repassa uma pergunta de TRABALHO/domínio ao pane que o usuário está usando e narra a RESPOSTA do pane (nunca invente a resposta você mesmo). Use quando o usuário, com uma missão/pane ativo, perguntar sobre o TRABALHO em si — o progresso, o conteúdo, o resultado, um detalhe técnico do que o agente está fazendo (ex. "como tá o build?", "achou o bug?", "o auth já funciona?", "o que falta pra terminar?"). "Qual a situação?"/"como tá?"/"o que tá acontecendo?" TAMBÉM é esta função — a resposta é o sweep de TODOS os panes da missão ancorada, NUNCA a contagem/lista de missões do workspace. NÃO use para perguntas de UI/estado do app (que tela é essa, quais missões/panes existem) — isso é "consultar"/"navegar" e você responde direto. NÃO use para mandar um comando literal (isso é "comandar").',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: {
                                        pergunta: { type: 'STRING', description: 'A pergunta do usuário, fiel, pra repassar ao pane.' },
                                        paneId: { type: 'STRING', description: 'Id do pane, ou "ativo" para o pane em foco/que o usuário está usando. C-088: "terminal N" = "pane N", mesmo sinônimo. Vazio = pane ativo.' },
                                    },
                                    required: ['pergunta'],
                                },
                            },
                        ],
                    },
                ],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                sessionResumption: resumption,
                // C-092.7 (a) — MAIOR alavanca: sem isto a Live rebilla o contexto INTEIRO (system +
                // histórico crescente) a cada geração; numa sessão de horas o input explode (12,9M tok/noite
                // = 94% da fatura). slidingWindow deixa a API truncar o histórico automaticamente, mantendo
                // o system prompt e a janela recente — comportamento preservado, custo por turno estanca.
                contextWindowCompression: { slidingWindow: {} },
            },
        };
    }
    handleMessage(msg, workspace) {
        if (this.stopped)
            return;
        if ('serverContent' in msg) {
            this.handleServerContent(msg.serverContent);
            return;
        }
        if ('toolCall' in msg) {
            this.handleToolCall(msg.toolCall, workspace);
            return;
        }
        if ('toolCallCancellation' in msg) {
            const cancel = msg.toolCallCancellation;
            if (Array.isArray(cancel.ids))
                cancel.ids.forEach((id) => this.pendingToolCalls.delete(id));
            return;
        }
        if ('sessionResumptionUpdate' in msg) {
            const update = msg.sessionResumptionUpdate;
            if (update.resumable === true && typeof update.newHandle === 'string')
                this.resumeHandle = update.newHandle;
            return;
        }
        if ('goAway' in msg) {
            llog('goAway do servidor — fechando pra reconectar');
            this.ws?.close();
            return;
        }
    }
    /** F-121: breadcrumb de fim de turno — N audio_chunks vs M transcript-emissions + hash do
     *  último texto final. Lido junto no próximo episódio de fala duplicada pra decidir a causa:
     *  audio_chunks E transcript_emits dobrando juntos = (a)/(b) real (retry ou injeção dupla);
     *  só transcript_emits dobrando (audio_chunks normal) = (c) confirmado (cosmético/log). */
    logTurnBreadcrumb(reason) {
        const hash = this.turnLastAssistantFinal ? cheapHash(this.turnLastAssistantFinal) : '-';
        llog(`turno de fala (${reason}): audio_chunks=${this.turnAudioChunks} transcript_emits=${this.turnTranscriptEmits} hash-final=${hash}`);
        this.turnAudioChunks = 0;
        this.turnTranscriptEmits = 0;
        this.turnLastAssistantFinal = null;
    }
    handleServerContent(sc) {
        const modelTurn = sc.modelTurn;
        if (modelTurn?.parts) {
            for (const part of modelTurn.parts) {
                if (part.inlineData?.data) {
                    this.turnAudioChunks++; // F-121: breadcrumb — conta chunks de áudio real deste turno
                    this.deps.emit({ type: 'audio_chunk', data: part.inlineData.data, done: false });
                    this.deps.emit({ type: 'live_state', state: 'speaking' });
                }
            }
        }
        const inputTx = sc.inputTranscription;
        if (inputTx?.text) {
            // F-126: eco do próprio TTS voltando pelo mic → descarta como turno de usuário (não emite
            // transcript, não alimenta lastUserLiveUtterance → não vira comando fantasma). Só loga.
            if (this.isEcho(inputTx.text)) {
                llog(`[jarvis-echo] suprimido (eco do TTS, não fala do usuário): "${inputTx.text.slice(0, 80)}"`);
            }
            else {
                llog(`user disse: "${inputTx.text.slice(0, 120)}"`);
                this.deps.emit({ type: 'live_transcript', role: 'user', text: inputTx.text, final: sc.turnComplete === true });
            }
        }
        const outputTx = sc.outputTranscription;
        if (outputTx?.text) {
            // F-126: alimenta a janela de fala recente (o que o TTS está dizendo) pra detectar o eco
            // no input seguinte. Acumula parcial+final; cap no fim (últimos ECHO_WINDOW_CHARS).
            const spoken = normEcho(outputTx.text);
            if (spoken)
                this.recentSpokenNorm = `${this.recentSpokenNorm} ${spoken}`.trim().slice(-GeminiLiveSession.ECHO_WINDOW_CHARS);
            this.turnTranscriptEmits++; // F-121: breadcrumb — conta emissões de transcript deste turno
            const isFinal = sc.turnComplete === true;
            // F-121 mitigação-de-log: transcript final IDÊNTICO ao já emitido como final NESTE MESMO
            // turno é suprimido (só o evento de texto/UI — nunca toca áudio, fila ou grace). Se a
            // duplicação for hipótese (c) (transcript duplicado sem áudio real), isto já limpa a UI;
            // se for (a)/(b) (retry/injeção dupla real), o breadcrumb abaixo no turnComplete continua
            // acusando via turnAudioChunks/turnTranscriptEmits — não escondemos o sintoma da métrica.
            const isDupFinal = isFinal && this.turnLastAssistantFinal === outputTx.text;
            if (isDupFinal) {
                llog(`jarvis falou (transcript final DUPLICADO suprimido, ver breadcrumb): "${outputTx.text.replace(/\s+/g, ' ')}"`);
            }
            else {
                llog(`jarvis falou: "${outputTx.text.replace(/\s+/g, ' ')}"`);
                this.deps.emit({ type: 'live_transcript', role: 'assistant', text: outputTx.text, final: isFinal });
                if (isFinal)
                    this.turnLastAssistantFinal = outputTx.text;
            }
        }
        if (sc.interrupted === true) {
            // C-071.1b: done:true só marca streamDone — os buffers JÁ agendados tocariam
            // até drenar. O evento dedicado manda o renderer dar player.stop() (flush).
            this.deps.emit({ type: 'audio_chunk', data: '', done: true });
            this.deps.emit({ type: 'interrupted' });
            this.deps.emit({ type: 'live_state', state: 'listening' });
            this.logTurnBreadcrumb('interrupted');
            this.releaseTurn(); // F-113: turno abortado libera a fila
        }
        if (sc.turnComplete === true) {
            this.deps.emit({ type: 'audio_chunk', data: '', done: true });
            this.deps.emit({ type: 'live_state', state: 'listening' });
            this.logTurnBreadcrumb('turnComplete');
            this.releaseTurn(); // F-113: turno concluído → drena o próximo da fila
        }
    }
    handleToolCall(tc, workspace) {
        if (!tc.functionCalls)
            return;
        llog(`toolCall: ${tc.functionCalls.map((c) => c.name).join(', ')}`);
        this.deps.emit({ type: 'live_state', state: 'executing' });
        for (const call of tc.functionCalls) {
            this.pendingToolCalls.add(call.id);
            this.deps.runFunction(call.name, { ...call.args, _workspace: workspace })
                .then((output) => {
                if (!this.pendingToolCalls.has(call.id))
                    return;
                this.pendingToolCalls.delete(call.id);
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
                    return;
                // C-092.7 dose (e): tool-response é INPUT rebillado — `ler`/`consultar`/`perguntar`
                // injetam TAIL BRUTO de pane (até 80 linhas × N panes). Instrumentado como fonte
                // separada (source=tool, name=<função>) pra a fatura de pane-read ficar visível.
                this.instrumentInput('tool', output, call.name);
                this.ws.send(JSON.stringify({
                    toolResponse: { functionResponses: [{ id: call.id, name: call.name, response: { output } }] },
                }));
                if (this.pendingToolCalls.size === 0)
                    this.deps.emit({ type: 'live_state', state: 'listening' });
            })
                .catch((err) => {
                this.pendingToolCalls.delete(call.id);
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
                    return;
                this.ws.send(JSON.stringify({
                    toolResponse: { functionResponses: [{ id: call.id, name: call.name, response: { error: err.message ?? 'Erro ao executar função.' } }] },
                }));
                if (this.pendingToolCalls.size === 0)
                    this.deps.emit({ type: 'live_state', state: 'listening' });
            });
        }
    }
    attemptReconnect(workspace) {
        if (this.stopped)
            return;
        // F-133: instância ÓRFÃ (não é a sessão Live corrente do registro) NUNCA reconecta —
        // auto-encerra. Sem isto, uma sessão que vazou (remount do engine / grace destacado)
        // segue com retry próprio (`stopped=false`) e reconecta em paralelo = 2 vozes.
        if (currentLiveSession !== this) {
            llog('reconexão abortada — instância não é a sessão Live corrente (F-133); auto-encerrando órfã');
            this.stop();
            return;
        }
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            llog('reconexão esgotada (3x) — live_state=error (renderer derruba jarvisMode + rearma wake)');
            this.deps.emit({ type: 'error', message: 'Sessão Live encerrada após 3 tentativas de reconexão.' });
            this.deps.emit({ type: 'live_state', state: 'error' });
            return;
        }
        const delay = Math.pow(2, this.reconnectAttempts) * 1000;
        this.reconnectAttempts++;
        setTimeout(() => {
            // F-133: re-checa identidade no disparo — o slot pode ter sido reivindicado por outra
            // sessão durante o backoff (nova conexão enquanto esta esperava).
            if (this.stopped || currentLiveSession !== this)
                return;
            this.connect(workspace).catch(() => { });
        }, delay);
    }
}
//# sourceMappingURL=GeminiLiveSession.js.map