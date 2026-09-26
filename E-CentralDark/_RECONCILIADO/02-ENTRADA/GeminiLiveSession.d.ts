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
import type { JarvisEvent } from './JarvisService.js';
/** F-126: normaliza texto pra comparação de eco — minúsculas, sem acento/pontuação, espaços
 *  colapsados. O eco do TTS volta pelo STT com pequenas variações; a normalização estabiliza. */
export declare function normEcho(text: string): string;
/** F-126: matcher PURO (test\u00e1vel sem WS) \u2014 o input transcrito \u00e9 eco do TTS rec\u00e9m-falado?
 *  `recentSpokenNorm` j\u00e1 vem normalizado (janela deslizante); `input` \u00e9 o transcript cru do mic.
 *  Eco = substring cont\u00edguo da fala recente, OU \u226580% das palavras significativas (>2 chars)
 *  presentes nela. Curto demais / janela vazia \u2192 n\u00e3o \u00e9 eco (deixa passar). Barge-in real (fala
 *  diferente do TTS) n\u00e3o casa \u2192 false. */
export declare function isEchoOf(recentSpokenNorm: string, input: string): boolean;
export interface GeminiLiveSessionDeps {
    getGoogleKey: () => string | undefined;
    emit: (event: JarvisEvent) => void;
    runFunction: (name: string, args: Record<string, unknown>) => Promise<string>;
    getLivePrompt: (workspace: string) => string;
}
export declare class GeminiLiveSession {
    private deps;
    private ws;
    private resumeHandle;
    private reconnectAttempts;
    private readonly maxReconnectAttempts;
    private stopped;
    /** F-138: timestamp da última mensagem do SERVIDOR — socket local OPEN não prova sessão viva
     *  do lado do Gemini; freshness disponível pro reuso de grace decidir cadáver vs vivo. */
    private lastServerMsgAt;
    private pendingToolCalls;
    private pendingContext;
    private sendQueue;
    private turnBusy;
    private turnTimer;
    private turnAudioChunks;
    private turnTranscriptEmits;
    private turnLastAssistantFinal;
    private pendingMic;
    private pendingMicBytes;
    private static readonly PENDING_MIC_MAX_BYTES;
    private voiceName;
    private droppedMicChunks;
    private graceTimer;
    private softStopped;
    private recentSpokenNorm;
    private static readonly ECHO_WINDOW_CHARS;
    private screenUpdatePending;
    private screenUpdateTimer;
    private lastScreenUpdateSent;
    private systemPromptTokens;
    private readonly tokenBySource;
    private sessionEstInputTokens;
    private runningInjectedTokens;
    private guardRailTripped;
    constructor(deps: GeminiLiveSessionDeps);
    /** F-126: o input transcrito é eco do próprio TTS recém-falado? Delega ao matcher puro. */
    private isEcho;
    /** F-107 r2: o WS está aberto e utilizável (nem parado nem em grace expirado). */
    isLive(): boolean;
    /** F-138: elegível pra REUSO QUENTE? Stop deliberado é TERMINAL (stopped=true), perda do slot
     *  singleton (F-133) desqualifica, e conexão SEM FRESCOR (servidor mudo há mais que o
     *  threshold — cadáver server-side com socket local OPEN, o caso real do log: "reuso quente"
     *  + 37 chunks pro vácuo + zero resposta, sem ws close) também. Só grace REAL (softStopped)
     *  + WS aberto + dona do slot + servidor recém-falante; qualquer outra coisa → conexão fresh
     *  (sempre segura; custo = re-sorteio de prosódia, aceito). NOTA: a âncora é a última msg do
     *  SERVIDOR (não o softStop) de propósito — re-carimbar no off mascararia servidor já morto
     *  antes do off (o zumbi real do F-138). Consequência aceita: silêncio pré-off + espera no
     *  grace somando >120s rejeita um reuso possivelmente legítimo e conecta fresh. */
    private static readonly REUSE_FRESHNESS_MAX_MS;
    isReusable(): boolean;
    start(workspace: string, voiceName?: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    /** F-133: reivindica o slot singleton — mata QUALQUER sessão Live anterior (inclusive a em
     *  grace) antes de conectar a nova. Só a instância corrente reconecta; as outras se
     *  auto-encerram no attemptReconnect (checagem de identidade). É a regra do repo "recurso
     *  compartilhado = isolar por identidade" aplicada à sessão de voz. */
    private claimSingleton;
    stop(): void;
    /**
     * F-107 r2: parada SUAVE — mantém o WS vivo por `graceMs` pra um re-toggle rápido reusar a
     * MESMA conexão (native-audio re-sorteia prosódia a cada conexão nova). Expirou sem reuso →
     * `stop()` real. Se o WS já não está vivo, cai direto no hard stop.
     */
    softStop(graceMs: number): void;
    private cancelGrace;
    pushMic(chunk: Buffer): void;
    endMicTurn(): void;
    private sendMicChunk;
    private flushPendingMic;
    /**
     * Injects SILENT context (reconnect transcript, workspace restore) as a live turn.
     * F-113: enfileirado — nunca intercala com narrações concorrentes.
     */
    injectContext(text: string): void;
    /**
     * F-113: injeta uma NARRAÇÃO — o payload (evento delegado, progresso, handoff) vai
     * embrulhado no envelope que separa diretiva de dado, pra o modelo NUNCA ler a instrução
     * crua em voz alta. Também entra na fila serializada.
     */
    injectNarration(payload: string): void;
    /**
     * C-092.7 (b): screen [update] COALESCIDO. A rajada de navegação (wizard) emitia N turnos de
     * tela quase-idênticos — cada um uma geração rebillando o contexto inteiro. Debounce curto:
     * só o ÚLTIMO estado dentro da janela vira turno; idêntico ao anterior é descartado. O
     * comportamento (Jarvis sabe a tela) é preservado — o último estado é o que vale.
     */
    injectScreenUpdate(text: string): void;
    private flushScreenUpdate;
    /** C-092.7 (instrumentação): classifica a FONTE do turno pelo prefixo pra o breadcrumb de custo. */
    private classifySource;
    /** F-113: pré-conexão vai pro buffer; conectado entra na fila serializada.
     *  F-138: sessão em GRACE (softStopped) NÃO recebe turno — injeção de tela numa sessão
     *  suave-parada fazia o Gemini FALAR com o modo desligado (zumbi falante); buffera e o
     *  reuso/reconexão faz o flush. */
    private routeTurn;
    /** F-113: manda o próximo turno só quando nenhum está em voo. Libera no turnComplete. */
    private drainSendQueue;
    /** F-113: turno atual terminou (turnComplete ou disjuntor) → libera e drena o próximo. */
    private releaseTurn;
    /** F-113: zera a fila entre conexões pra não carregar turnBusy stale pro socket novo. */
    private resetTurnQueue;
    /** C-092.7 (b): descarta um [update] de tela pendente (debounce em voo) — entre conexões ou no
     *  stop, o estado bufferizado é stale e não deve virar turno na sessão nova. */
    private clearScreenUpdate;
    /**
     * C-092.7 (instrumentação + guard-rail): contabiliza um pedaço de INPUT (turno injetado ou
     * tool-response). Cada geração rebilla o system prompt + o histórico acumulado — por isso o
     * custo estimado da sessão cresce a cada turno mesmo com payloads pequenos. Breadcrumb
     * `[jarvis-tokens]` dá o ranking por fonte (medir antes de cortar mais).
     */
    private instrumentInput;
    private flushPendingContext;
    private connect;
    private buildSetup;
    private handleMessage;
    /** F-121: breadcrumb de fim de turno — N audio_chunks vs M transcript-emissions + hash do
     *  último texto final. Lido junto no próximo episódio de fala duplicada pra decidir a causa:
     *  audio_chunks E transcript_emits dobrando juntos = (a)/(b) real (retry ou injeção dupla);
     *  só transcript_emits dobrando (audio_chunks normal) = (c) confirmado (cosmético/log). */
    private logTurnBreadcrumb;
    private handleServerContent;
    private handleToolCall;
    private attemptReconnect;
}
//# sourceMappingURL=GeminiLiveSession.d.ts.map