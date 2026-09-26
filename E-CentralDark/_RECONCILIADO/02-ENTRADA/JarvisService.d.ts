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
import type { OverclockBridge, SpawnPaneDefaults } from '@overclock-app/mcp';
import type { HandoffRegistry } from '@overclock-app/mcp';
import type { SharedMemory } from '@overclock-app/bus';
import { type LivePersona } from './jarvisLivePrompt.js';
export declare function stripDelegationEnvelope(raw: string): string;
export type JarvisRole = 'user' | 'assistant';
export interface JarvisMessage {
    id: string;
    role: JarvisRole;
    content: string;
    createdAt: number;
}
export type JarvisState = 'idle' | 'thinking' | 'speaking' | 'executing';
export type JarvisLiveState = 'connecting' | 'listening' | 'speaking' | 'executing' | 'closed' | 'ended' | 'error';
export interface JarvisActivity {
    id: string;
    fn: string;
    workspace: string;
    detail: string;
    outcome: string;
    ok: boolean;
    createdAt: number;
}
export type JarvisEvent = {
    type: 'state';
    state: JarvisState;
} | {
    type: 'text_delta';
    messageId: string;
    delta: string;
} | {
    type: 'message_complete';
    message: JarvisMessage;
} | {
    type: 'tool_call';
    toolName: string;
    args: unknown;
    callId: string;
    requiresConfirmation: boolean;
} | {
    type: 'tool_result';
    callId: string;
    ok: boolean;
    summary: string;
} | {
    type: 'error';
    message: string;
} | {
    type: 'audio_chunk';
    data: string;
    done: boolean;
} | {
    type: 'interrupted';
} | {
    type: 'live_state';
    state: JarvisLiveState;
} | {
    type: 'live_transcript';
    role: 'user' | 'assistant';
    text: string;
    final: boolean;
} | {
    type: 'activity';
    activity: JarvisActivity;
} | {
    type: 'restore_panes';
    workspacePath: string;
    missionId: string;
    filter?: string;
    ackId: string;
};
export interface JarvisSendInput {
    text: string;
    workspacePath: string;
}
export interface JarvisConfirmInput {
    callId: string;
    approved: boolean;
    always?: boolean;
}
export interface JarvisConfigPublic {
    anthropicAuth: 'oauth-cli' | 'none';
    confirmBeforeTools: boolean;
}
export interface JarvisConfigPatch {
    confirmBeforeTools?: boolean;
}
export interface JarvisServiceDeps {
    bridge: OverclockBridge;
    defaults?: SpawnPaneDefaults;
    getWorkspace: () => string;
    getHandoffRegistry: () => HandoffRegistry | undefined;
    emit: (event: JarvisEvent) => void;
    /** Chave da Google AI Studio p/ o Gemini Live (ServiceKeysStore 'gemini-live'). */
    getGoogleKey: () => string | undefined;
    /** Motor de memória persistida (C-055) — o SharedMemory do MCPServerHost. */
    getSharedMemory?: () => SharedMemory | undefined;
    /** C-091: panes SALVOS (fechados) desta missão, pra rotular no contexto/consultar — mesma
     *  fonte de dados que MissionRestoreCards (SessionManager.loadAll filtrado por missionId). */
    loadSavedPanes?: (workspacePath: string, missionId: string) => Promise<SavedPaneSummary[]>;
    /** C-091: aguarda o ack REAL de uma ação disparada no renderer (mesmo mecanismo genérico do
     *  wizard-set/wizard-fire — waitWizardSetAck em core.ts) — evita "fingir" sucesso (Lei 1). */
    waitForAck?: (ackId: string, timeoutMs?: number) => Promise<{
        applied: boolean;
        message: string;
    } | null>;
}
/** C-090.2: forma mínima de uma missão da TELA GRID pro contexto de voz — status real
 *  (live) + panes salvos (C-091), a mesma dupla de sinais que fecha F-118 caso 3
 *  (missão parada narrada como aberta) e a lacuna de saved panes fora de missão aberta. */
export interface GridMissionSummary {
    id: string;
    title: string;
    live: boolean;
    savedCount: number;
}
/** C-091: forma mínima de um pane salvo pro contexto de voz (sem os campos de UI). */
export interface SavedPaneSummary {
    paneId: string;
    agent: string;
    squadRole?: string;
    delegateOnly?: boolean;
    leaf?: boolean;
    callerPaneId?: string;
    model?: string;
}
/** C-092.11 (finding 12): resultado do detector com HASH separado do FALADO — dois menus cujos
 *  rótulos comprimidos são idênticos (diferem só no sufixo cortado pelo menuOptionLabel) são
 *  menus DIFERENTES pro dedup; o hash carrega as linhas CRUAS das opções, a fala segue curta. */
export interface PendingQuestionParts {
    spoken: string;
    hash: string;
}
export declare function detectPendingQuestion(tail: string): string | null;
export declare function detectPendingQuestionParts(tail: string): PendingQuestionParts | null;
export declare function menuOptionLabel(line: string): string;
export declare function compressMenuForNarration(raw: string): string | null;
export declare function speakPayload(frase: string, opts?: {
    self?: boolean;
    menu?: boolean;
    deployClaim?: boolean;
}): string;
export declare function detectOpenQuestion(tail: string): string | null;
export declare class JarvisService {
    private readonly deps;
    private busy;
    /** C-092.8: 1 one-shot de resumo de voz em voo por vez (composeVoiceSummary). */
    private voiceSummaryBusy;
    private pendingSends;
    private sdkSessionId;
    private sdkLive;
    private alwaysAllowed;
    private pendingConfirmations;
    private pendingCallIds;
    /** confirmBeforeTools=false matches reference current behavior (UI removed). */
    private confirmBeforeTools;
    private liveSession;
    /** F-107 r2: sessão em GRACE — WS quente destacado após o stopLive (o usuário desligou o orb).
     *  Fica FORA do `liveSession` de propósito: toda a lógica de produto lê `liveSession` como
     *  "voz ligada", então durante o grace ela vê "desligada" (correto: mic parado, nada narrado).
     *  O socket só volta a ser `liveSession` num re-toggle rápido (reuso quente, sem reconexão →
     *  prosódia preservada). Expirou → o próprio softStop encerra o WS. */
    private graceSession;
    /** F-059: última reply do brain no turno corrente — narrada via Live no fim do turno. */
    private lastAssistantReply;
    /** Memória persistida do Jarvis (C-055) — fatos/preferências sobrevivem a restart. */
    private readonly memory;
    /** C-072: turnos falados (Live) recentes — sobrevive à queda/reconexão da GeminiLiveSession
     *  (aquele objeto morre no stopLive; isto não). Cap curto — só pra dar contexto de retomada,
     *  não é histórico persistido (isso é C-055/memory). */
    private liveHistory;
    private static readonly LIVE_HISTORY_MAX;
    /** C-072: timestamp do último stopLive — define a janela de retomada no re-wake. */
    private liveDisconnectedAt;
    private static readonly RESUME_WINDOW_MS;
    /** F-107 r2: janela de grace do stopLive — WS fica vivo pra o re-toggle rápido reusar a MESMA
     *  conexão (native-audio re-sorteia prosódia a cada conexão nova). Curto o bastante pra não
     *  segurar sessão ociosa demais; longo o bastante pra cobrir a pausa entre turnos. */
    private static readonly LIVE_GRACE_MS;
    /** C-092.9 (DOSE 2) + F-139: sessão Live SOB DEMANDA com DORMÊNCIA — sem interação real (fala
     *  final / tool; mic contínuo NÃO conta) por IDLE_TIMEOUT_MS, a SESSÃO fecha de verdade
     *  (onIdleTimeout: WS e histórico morrem, billing zera) mas o MODO fica armado: orb ligado,
     *  mic local ouvindo, e a PRÓXIMA fala religa transparente (pushLiveMic). 90s da 1ª versão
     *  desligava o modo no meio da conversa e o "religa no wake" não cobria passiveListening=false
     *  (F-139, "parece travado") — janela recalibrada pra 5min (custo de sessão ociosa curta é
     *  baixo com sliding window; a dormência é quem zera o custo de verdade). Trade-off aceito
     *  (Laschuk 2026-07-04): ~1s de latência na 1ª fala pós-dormência. */
    private idleTimer;
    private static readonly IDLE_TIMEOUT_MS;
    /** F-139: sessão fechada por ociosidade com MODO ainda ligado — a próxima fala religa. */
    private liveDormant;
    /** F-139: argumentos do último startLive — a religa da dormência reconecta com eles
     *  (persona já persiste em livePersona; sem greetOnConnect: religa não cumprimenta). */
    private lastLiveArgs;
    constructor(deps: JarvisServiceDeps);
    /** C-070: persona da Live (nome do usuário/assistente + instruções custom). */
    private livePersona;
    /** Inicia a sessão Gemini Live (única — o workspace dado é só o contexto inicial). */
    startLive(workspace: string, voiceName?: string, persona?: LivePersona & {
        greetOnConnect?: boolean;
    }): Promise<{
        ok: boolean;
        error?: string;
    }>;
    /**
     * Para a sessão Gemini Live. F-107 r2: parada SUAVE — DESTACA o socket pra `graceSession` e o
     * mantém vivo por LIVE_GRACE_MS. `liveSession` volta a null (a lógica de produto vê "voz
     * desligada", como antes), mas um re-toggle rápido do orb promove o socket de volta e reusa a
     * MESMA conexão — o native-audio não re-sorteia a prosódia. Expirou sem reuso → o próprio
     * softStop encerra o WS; o startLive seguinte descarta o `graceSession` morto e reconecta.
     */
    stopLive(): void;
    /** C-092.7 (d): (re)arma o timer de ociosidade — chamado a cada TURNO real (fala final / tool). */
    private armIdleTimer;
    private clearIdleTimer;
    /** C-092.9 (DOSE 2) + F-139: sessão viva parada por IDLE_TIMEOUT_MS sem interação → DORMÊNCIA.
     *  A SESSÃO fecha de verdade (sem grace — o grace F-107 é pro re-toggle deliberado do orb):
     *  WS morre, histórico morre, próxima sessão nasce instância nova (resumeHandle zerado, nada
     *  a rebillar). O MODO fica armado: NÃO emite 'ended' (derrubaria o jarvisMode; com
     *  passiveListening=false o usuário ficava sem rota de volta — o "parece travado" do F-139),
     *  NÃO libera o wake lock (F-117: esta instância segue dona do mic local que continua
     *  ouvindo). A próxima fala religa transparente em pushLiveMic. */
    private onIdleTimeout;
    /** Encaminha um chunk PCM (Int16, 16kHz mono) do mic do renderer pro WS Live.
     *  F-139: chunk com sessão DORMENTE religa transparente — o gate de VAD do renderer
     *  (liveMicGate, C-092.10) só envia chunk com fala real, então chunk aqui = usuário falando.
     *  startLive cria a instância SINCRONAMENTE; este e os próximos chunks entram no pendingMic
     *  (C-071.1c) e fazem flush no setupComplete — nada da 1ª frase se perde (~1s de latência,
     *  trade-off aceito). Sem greet: religa não cumprimenta, só responde ao que foi dito. */
    pushLiveMic(chunk: Buffer): void;
    endLiveMicTurn(): void;
    private lastScreen;
    /** F-094 r2: missão aberta NA TELA (undefined = grid/home/sem missão) — escopa o
     *  inventário de panes (consultar/pane_list/ler) à missão que o usuário está vendo. */
    private lastScreenMissionId;
    /** F-130: TÍTULO da missão na tela (o que o usuário VÊ, ex. "Landing premium") — toda linha
     *  FALÁVEL cita o título, nunca o id nanoid (C-062: a voz não soletra código). Extraído do
     *  texto do reporter (contrato com useScreenReporter.ts — SCREEN_MISSION_TITLE_RE);
     *  undefined = sem título (fallback: id, comportamento antigo). */
    private lastScreenMissionTitle;
    /** F-102: panes VISÍVEIS na tela reportados pelo renderer (ids reais, ex. "pane-331") +
     *  o pane FOCADO. Fonte determinística do que o usuário efetivamente vê — o escopo
     *  mission-only do pane_list pode estar stale/vazio enquanto um pane está aberto na frente
     *  dele. `comandar`/`withWorkspaceContext` resolvem contra estes, não contra suposição. */
    private lastScreenVisiblePaneIds;
    private lastScreenFocusedPaneId;
    /** F-118: true quando a tela reportada é a HOME GLOBAL (lista de workspaces) — distingue de
     *  "workspace aberto sem missão na tela". Consultar/contexto do brain devolvem SÓ a lista de
     *  workspaces na home, nunca missões/panes de um workspace que não está mais na tela. */
    private isGlobalHomeScreen;
    /** F-118: nomes reais dos workspaces mostrados na HOME — rotulados no payload (dado, não
     *  instrução) pra o Jarvis reconhecer TODOS os itens da lista, não só "alguns". */
    private homeWorkspaceNames;
    /** C-090.2: missões REAIS da TELA GRID (workspace sem missão focada) — status real
     *  (live = tem pane vivo agora) + quantos panes salvos (C-091) cada uma tem. Mesmo
     *  padrão do homeWorkspaceNames: dado do renderer, rotulado, sem o Jarvis inferir. */
    private lastScreenGridMissions;
    /** F-099 r2: com missão ATIVA na tela, um pedido de trabalho é delegado ao pane
     *  orquestrador DELA (pane_write) — o delegar é TERMINAL. Este flag vira true assim
     *  que o brain delega no turno; enquanto true, o gate NEGA navigate p/ abrir wizard
     *  (mission-new, wizard-set, wizard-fire, run-agentic, run-squad) — o brain não pode
     *  delegar E TAMBÉM reabrir o wizard agêntico no mesmo turno (delegar XOR wizard).
     *  Resetado a cada turno do brain. */
    private delegatedThisTurn;
    /** F-105: texto RAW do pedido do usuário no turno corrente (o que entrou em send/delegar).
     *  O gate FORÇA o pane_write do brain a carregar ISTO verbatim, não a paráfrase do haiku —
     *  brain = roteador fino (escolhe o pane), fidelidade do payload é técnica, não de prompt.
     *  Em request grande o haiku resumia e o pane recebia versão lossy. */
    private pendingDelegationText;
    /** F-109: 1 pane_write por turno de delegar — o segundo write (pane espúrio recebendo
     *  o mesmo prompt do piloto correto) é o duplicado observado no trace. Resetado junto
     *  com pendingDelegationText a cada turno. */
    private delegationPaneWriteDone;
    /** F-114: fala FINAL do usuário no turno de voz corrente (Live inputTranscription) — o gate
     *  de intent do 'navegar' testa este texto, não a decisão do modelo Live, pra saber se o
     *  pedido é LITERALMENTE de missão/wizard ou um pedido de trabalho que o Live mapeou errado. */
    private lastUserLiveUtterance;
    /** F-114: true assim que 'navegar' abre o wizard (mission-new) com sucesso — enquanto ligado,
     *  o walk LEGÍTIMO dentro do wizard (wizard-set/wizard-fire/run-agentic/run-squad) segue livre
     *  do gate de intent (só a ABERTURA exige a fala conter token de missão). Navegar pra fora do
     *  wizard (home/back/mission/workspace/screen/pane) desarma. */
    private liveWizardOpen;
    /** F-101: panes a que o brain do Jarvis delegou trabalho (via pane_write / squad_open /
     *  spawn). Quando um deles submete um handoff (o pane TERMINOU), o Jarvis narra
     *  proativamente — fechando a promessa do 'delegar' ("vou narrar quando houver
     *  novidades"). Sem isso, o sinal pane-done acorda o orquestrador (wireCallerMapListener)
     *  mas NUNCA a camada de voz, e o Jarvis ficava mudo até o usuário perguntar. */
    private delegatedPanes;
    /** F-101: o listener de handoff→narração é ligado UMA vez (registry vive o processo). */
    private handoffNarrationWired;
    /** F-110: timer único de poll dos panes delegados em busca de pergunta pendente (sem
     *  handoff — AskUserQuestion nativo do CLI não passa pelo HandoffRegistry). Ligado sob
     *  demanda no primeiro delegar, igual ao handoffNarrationWired. */
    private questionPollTimer;
    private static readonly QUESTION_POLL_MS;
    /** F-110: última pergunta narrada por pane (dedup — só narra de novo se o conteúdo mudou). */
    private narratedQuestionHash;
    /** C-092.11 (finding 3): QUANDO cada pergunta foi narrada — pergunta narrada há mais que o TTL
     *  sem resposta não intercepta mais a fala do usuário (o diálogo esfriou; fluxo normal decide). */
    private narratedQuestionAt;
    private static readonly NARRATED_QUESTION_TTL_MS;
    /** F-110 r2: hash da última pergunta JÁ RESPONDIDA por pane (usuário mandou a resposta via
     *  `comandar`) — sobrevive mesmo que o mesmo menu velho reapareça no re-poll (scrollback com
     *  pouco output novo). Sem isso, o dedup em `narratedQuestionHash` (limpo só no handoff) não
     *  cobre o ciclo "narrada → respondida → re-detectada", e o Jarvis renarra a pergunta antiga. */
    private answeredQuestionHash;
    /** F-110 r3: pergunta ABERTA candidata vista no poll ANTERIOR por pane — só narra quando o
     *  MESMO conteúdo estabiliza em dois polls consecutivos (~16s), mesma construção anti-spam do
     *  lastProgressSig (C-085): streaming que por acaso termina em "?" muda entre polls e nunca
     *  estabiliza, então não vira narração fantasma. */
    private pendingOpenQuestionHash;
    /** C-085 r3: dedup do roteamento determinístico de resposta a pergunta pendente — a MESMA
     *  fala chega 2x (o interceptor de transcript roteia primeiro; o modelo Live ainda pode chamar
     *  perguntar/comandar/delegar com o mesmo conteúdo). Janela curta: função com texto equivalente
     *  vira ack, sem 2º pane_write. */
    private routedAnswerPaneId;
    private routedAnswerText;
    private routedAnswerAt;
    private static readonly ROUTED_ANSWER_DEDUP_MS;
    /** C-085: assinatura do tail lido no poll ANTERIOR por pane. O progresso só é narrado quando a
     *  assinatura ESTABILIZA entre dois polls (~16s) — spinner/streaming muda a cada poll e nunca
     *  estabiliza, então não vira spam. */
    private lastProgressSig;
    /** C-085: último estado de progresso JÁ narrado por pane (dedup — não repete o mesmo estado). */
    private narratedProgressSig;
    /** C-085.2: squadRole real (registry F-111: 'orchestrator'=piloto, 'builder'=chefe) do pane que
     *  o Jarvis delegou — narrações citam "o chefe"/"o piloto" em vez de "um pane" genérico
     *  (requisito Laschuk 2026-07-03: "ele tem que reconhecer q é um chefe aquele cara"). */
    private delegatedPaneRole;
    /** C-085.2: workers de um chefe/piloto delegado já narrados como HOP (repasse) — chefePaneId ->
     *  Set(workerPaneId). Evita renarrar o mesmo repasse a cada poll de 8s. */
    private narratedHopWorkers;
    /** C-085.2: workerPaneId -> chefePaneId que o spawnou — narra a ENTREGA voltando pra cadeia
     *  ("o pesquisador terminou, o chefe tá revisando") quando o worker submete handoff. */
    private hopWorkerChefe;
    /** F-118.1: missão que estava NA TELA (lastScreenMissionId) no momento em que o pane foi
     *  delegado — a ORIGEM do evento. Narração proativa persiste enquanto o usuário segue na
     *  MESMA interface; ao sair, eventos daquela origem são descartados (unsubscribe implícito
     *  por navegação, não fila-pra-depois). Decisão Laschuk 2026-07-03. */
    private delegatedPaneMissionId;
    /** C-050.4 (episódio 2026-07-04 "o pane responde e o Jarvis leva horas pra se dar conta"):
     *  panes com resposta AGUARDADA — o usuário perguntou explicitamente ('perguntar'), acabou
     *  de responder uma pergunta pendente ('comandar' pós-F-110) ou teve a resposta roteada
     *  técnica (C-085 r3). Poll curto dedicado (1,5s) SÓ nesses panes até a resposta chegar
     *  (conteúdo novo ≠ baseline, estável por 2 ticks ≈ 3s); o poll de 8s + estabilização de
     *  ~16s (QUESTION_POLL_MS + maybeNarrateProgress) segue INTOCADO pro progresso espontâneo. */
    private awaitedAnswer;
    private awaitedAnswerTimer;
    private static readonly ANSWER_POLL_MS;
    private static readonly ANSWER_POLL_MAX_MS;
    /** F-130: contrato com o texto do reporter de missão (useScreenReporter.ts) — o título
     *  viaja DENTRO do texto porque o transporte Tauri (shim/core) derruba campos novos. */
    private static readonly SCREEN_MISSION_TITLE_RE;
    /** F-130: rótulo FALÁVEL da missão na tela — o título entre aspas quando conhecido.
     *  C-092.11 (finding 9): sem título resolvível, fallback FALÁVEL "a missão aberta na tela" —
     *  NUNCA o id nanoid (a voz não soletra código, C-062) e nunca string vazia (o label lido
     *  pós-await podia virar '' e a fala saía "Situação da missão :"). */
    private screenMissionLabel;
    /** Tela visível reportada pelo renderer — vira contexto da Live ([update]) e do brain.
     *  F-102: recebe também os panes visíveis + o pane focado (ids reais) — o estado de tela
     *  percebido passa a refletir o pane que o usuário tem aberto na frente, não só a missão. */
    updateScreen(text: string, missionId?: string, visiblePaneIds?: string[], focusedPaneId?: string, isHome?: boolean, workspaceNames?: string[]): void;
    /** Última tela reportada — o send() injeta no contexto de cada turno do brain. */
    getScreen(): string;
    /** C-090 (contrato de screen-state, pilar 3 — READ-BACK): espera a TELA de fato mudar
     *  depois de uma ação que deveria trocá-la (abrir workspace/missão/pane). Resolve `true`
     *  quando o screen-state reportado pelo renderer sai de `beforeScreen` dentro do timeout;
     *  `false` se a tela nunca mudou (ação sem efeito real — NÃO anuncie sucesso). Reusa o
     *  próprio sinal determinístico de tela (updateScreen), sem plumbing de ack novo — é a
     *  primitiva genérica de read-back que as fatias .2-.4 chamam pra qualquer ação com efeito
     *  de tela, generalizando o ack round-trip do wizard (F-091/F-120). */
    private awaitScreenChange;
    /** C-090.3 (contrato de screen-state, fatia MISSÃO — aplica o desenho de C-090.1 à tela de
     *  missão): ENTIDADES reais visíveis nela — panes ATIVOS (papel real F-111 + status) + panes
     *  SALVOS (C-091) — e as AÇÕES disponíveis (delegar/perguntar/restaurar/voltar), no mesmo
     *  formato rotulado do homeLine. Sem missão ancorada, string vazia (nada a reportar). */
    private buildMissionEntitiesLine;
    /** C-090.2/C-091: status REAL (live = tem pane vivo agora) + panes salvos de cada missão do
     *  workspace — fonte única reusada tanto pelo PUSH por turno (buildGridEntitiesLine) quanto
     *  pelo `consultar` sob demanda, pra nunca divergir. */
    private gridMissionRows;
    /** C-090.2 (contrato de screen-state, fatia GRID — aplica o desenho de C-090.1 ao workspace
     *  sem missão focada): ENTIDADES reais — missões com status REAL (ativa = tem pane vivo
     *  agora; parada = não tem) + panes salvos (C-091) de cada uma — e as AÇÕES disponíveis
     *  (abrir missão, nova missão, spawnar pane, restaurar). Fecha F-118 caso 3 (missão parada
     *  narrada como aberta) e a lacuna de panes salvos fora de uma missão já aberta. Só roda
     *  fora da home e sem missão ancorada (senão a .1/.3 já cobrem a tela). */
    private buildGridEntitiesLine;
    /**
     * Executa uma função da voz Live: 'delegar' encaminha o briefing pro brain
     * Agent SDK (send) e retorna confirmação imediata; 'navegar'/'ler'/'consultar'
     * respondem direto via runTool (sem passar pelo LLM — resposta de voz rápida).
     */
    private runLiveFunction;
    /** C-086 r2: ack natural em 1ª pessoa (lei 1/9 — nunca etiqueta de sistema tipo "Enviado.").
     *  Variação leve entre chamadas pra não virar tique de fala; sem ecoar o pedido. */
    private static pickAck;
    private runLiveFunctionInner;
    /** F-094 r2: args default do inventário de panes — missão NA TELA quando há uma aberta
     *  (paneList aceita missionId explícito), senão escopo padrão (workspace do caller). */
    private paneInventoryArgs;
    /** r2 (C-085 REABERTO): "qual a situação?" / "como tá?" / "o que tá acontecendo?" — pergunta
     *  de STATUS DO TRABALHO, nunca de UI. Detectada aqui (código, não só prompt — doutrina
     *  "técnica > prompt") pra travar o roteamento independente de o modelo Live escolher
     *  "perguntar" ou "consultar". */
    private static readonly STATUS_QUESTION_RE;
    private static isStatusQuestion;
    /**
     * r2 (C-085 REABERTO): sweep dos panes da MISSÃO ANCORADA (lastScreenMissionId) — a resposta
     * de "qual a situação?" é SEMPRE sobre ela (nunca inventário de missões, nunca 1 pane só).
     * A âncora só muda com troca EXPLÍCITA de missão/workspace ou navegação manual (o que já
     * atualiza lastScreenMissionId via reportScreen) — aqui só lemos o estado corrente dela.
     */
    private sweepMissionStatus;
    /**
     * C-092.8: estado FALÁVEL de um pane a partir do tail — pergunta pendente > menu > última
     * linha de conteúdo. Reusa os detectores canônicos (F-110/F-132); o tail bruto NUNCA viaja
     * pra Live (dose (e) da C-092.7: "manda só uma síntese").
     */
    private static synthesizePaneTail;
    /** F-102: só os dígitos de um id/fala ("pane 331" / "pane-331" → "331"); "" se nenhum. */
    private static paneNumber;
    /** F-111: "piloto"/"orquestrador" e "chefe" são PAPÉIS (squadRole real do pane), nunca
     *  o usuário nem um chute por posição/número. Casa a fala com o squadRole gravado no
     *  spawn (core.ts: 'orchestrator' = piloto; 'builder' = chefe) — mesma doutrina F-108/F-109. */
    private static readonly ROLE_ALIASES;
    /**
     * C-074: resolve o paneId alvo de 'comandar' — vazio/"ativo"/"focado" = o pane em foco
     * na tela (F-102), senão o mais recente do escopo; senão bate literal como paneId, por
     * PAPEL real (F-111: "piloto"/"orquestrador" = squadRole gravado, nunca chute), por
     * NÚMERO (F-102: "331" = "pane-331"), e por fim como trecho do agent ("codex").
     */
    private resolveLivePaneId;
    getConfig(): JarvisConfigPublic;
    setConfig(patch: JarvisConfigPatch): {
        ok: boolean;
        error?: string;
    };
    history(_workspacePath?: string): {
        ok: boolean;
        messages: JarvisMessage[];
    };
    confirm(input: JarvisConfirmInput): {
        ok: boolean;
    };
    private waitForConfirmation;
    private confirmEnabled;
    private setState;
    send(input: JarvisSendInput): Promise<{
        ok: boolean;
        error?: string;
    }>;
    /**
     * F-059: fecha o loop de voz — a resposta/erro do brain vira contexto da sessão
     * Live pro Gemini NARRAR ("Vou narrar quando houver novidades" agora é real).
     * Sem sessão Live (modo texto puro), no-op: o renderer já mostra o texto.
     */
    private narrateToLive;
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
    private narrateIfPaneOnScreen;
    private injectNarrationSafe;
    /** F-118.1: resolve a missão de ORIGEM de um pane delegado (o que estava na tela quando o
     *  Jarvis o delegou). Worker de um chefe/piloto herda a origem do chefe (hopWorkerChefe).
     *  `tracked=false` = pane desconhecido — caller resolve a origem real e falha FECHADO
     *  (F-135, narrateIfPaneOnScreen). */
    private originMissionIdFor;
    /**
     * F-101: liga (uma vez) a ponte handoff-done → narração da voz. O sinal é o MESMO
     * 'submit' do HandoffRegistry que acorda o orquestrador (família F-024/035/037); aqui
     * a Live é só mais um "caller" sem pane próprio. Chamado de trackDelegatedPane no
     * primeiro delegar do brain — só custa quando há trabalho delegado.
     */
    private ensureHandoffNarration;
    /**
     * F-101: registra o pane alvo de uma delegação do brain pra narrar o handoff dele
     * depois. pane_write carrega o paneId no arg; squad_open/spawn devolvem no resultado.
     */
    private trackDelegatedPane;
    /** C-085.2: consulta o bridge (sem passar por MCP) pelo squadRole do pane recém-delegado. */
    private captureDelegatedPaneRole;
    /** C-085.2: rótulo falável do papel real do pane (squadRole F-111) — "o chefe (pane X)" em vez
     *  de "o pane X" genérico. `capitalize` controla o artigo pra meio de frase vs início. */
    private paneRoleLabel;
    /** F-134 (lei 1): o pane PILOTO/orquestrador da missão ancorada É o próprio Jarvis — interface
     *  pura do piloto. Narrá-lo em 3ª pessoa ("o piloto está trabalhando") viola a lei 1; rótulo de
     *  papel em 3ª pessoa fica SÓ pra cadeia ABAIXO dele (chefe→worker, exceção lei 7). O gate
     *  F-118.1 do narrateToLive já descarta narração cuja missão de ORIGEM não é a tela atual, então
     *  role==='orchestrator' que chega a narrar = piloto da missão ancorada. Pane sem role rastreado
     *  (captureDelegatedPaneRole falhou / não delegado por aqui) cai no genérico — comportamento antigo. */
    private isSelfPilot;
    /**
     * C-085.2: poll dos workers que cada chefe/piloto delegado repassou trabalho (spawn/dispatch —
     * `bridge.workersOfCaller`, mesma fonte do wireCallerMapListener em core.ts). Narra o HOP
     * ("o chefe passou pro pesquisador, tá rodando") e registra o worker pra narrar a entrega
     * voltando quando ele submeter handoff (onDelegatedHandoff). Dedup por chefePaneId+workerPaneId.
     */
    private pollDelegatedPaneHops;
    /** F-110: liga (uma vez) o poll periódico dos panes delegados em busca de pergunta pendente. */
    private ensureQuestionPolling;
    /**
     * F-110: pane BLOQUEADO numa pergunta ≠ done — não há handoff pra acordar onDelegatedHandoff.
     * Poll no pane_read do tail de cada pane delegado; detecta menu de pergunta (detectPendingQuestion)
     * e narra PROATIVAMENTE, com dedup por hash de conteúdo (não renarra a cada poll).
     */
    private pollDelegatedPanesForQuestions;
    /** C-050.4: começa a aguardar a RESPOSTA de um pane a uma pergunta explícita do usuário.
     *  Baseline = assinatura do tail ATUAL (pergunta já ecoada pelo pane_write); a resposta é
     *  conteúdo NOVO (≠ baseline) que estabiliza entre 2 ticks curtos. */
    private watchForAnswer;
    /** C-050.4: liga o tick curto sob demanda (só existe enquanto houver resposta aguardada). */
    private ensureAnswerPolling;
    /** C-050.4: tick de 1,5s SÓ dos panes com resposta aguardada. Resposta = conteúdo novo
     *  (≠ baseline) estável por 2 ticks (~3s). Menu de pergunta novo no tail = a "resposta" é
     *  OUTRA pergunta — narra pelo MESMO caminho/dedup do F-110 (narratedQuestionHash /
     *  answeredQuestionHash), nunca dois narradores pro mesmo menu. Ao narrar, sincroniza o
     *  dedup do caminho lento (lastProgressSig/narratedProgressSig) pra o poll de 8s não
     *  renarrar o mesmo estado. */
    private pollAwaitedAnswers;
    /** C-092.11 (finding 7): o menu detectado na janela de progresso é o menu JÁ RESPONDIDO
     *  ressuscitado do scrollback? Compara os rótulos de opção (menuOptionLabel dos dois lados —
     *  o answeredQuestionHash guarda `pergunta Opções: a; b; …` do detectPendingQuestion, e o
     *  compressMenuForNarration produz `Menu com N opções: a; b; ….`): ≥2 rótulos presentes no
     *  hash respondido = mesmo menu, não renarra como progresso. */
    private menuMatchesAnswered;
    /** C-050.4: linhas de conteúdo do tail (sem ANSI, sem vazias) — base única da assinatura
     *  de progresso, compartilhada entre o caminho lento (maybeNarrateProgress) e o watch curto. */
    private static tailContentLines;
    private static progressSig;
    /** C-092.11 (finding 11): janela de narração de menu — se as 12 linhas cortam o menu no MEIO
     *  (1ª linha da janela é opção com número >1, i.e. o menu começa acima), amplia pra 30 pra
     *  narrar TODAS as opções em vez de jurar completude com as 1-4 cortadas. A ampliação só
     *  dispara nesse corte-no-meio — menu velho INTEIRO no scrollback não renasce por aqui. */
    private static menuNarrationWindow;
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
    private maybeNarrateProgress;
    /**
     * C-092.8: one-shot no brain Claude (mesma auth OAuth de assinatura do brain principal —
     * custo marginal ~zero) pra compor a FRASE de voz de um texto livre. Sem tools, 1 turno,
     * timeout curto. 1 chamada em voo por vez (busy → null); null = caller usa o fallback
     * determinístico. NUNCA lança.
     */
    private composeVoiceSummary;
    /** C-085 r3: comandos de UI/estado do app NÃO são resposta ao diálogo pendente — ficam com o
     *  modelo Live (navegar/consultar/encerrar/restaurar/troca de âncora). Conservador: só o que
     *  casa aqui escapa do roteamento determinístico. */
    private static readonly UI_UTTERANCE_RE;
    private isUiUtterance;
    /** C-085 r3: pane rastreado com pergunta pendente NARRADA (narratedQuestionHash) cuja origem
     *  (F-118.1) ainda é a interface atual — prefere o pane em FOCO; senão o de pergunta mais
     *  recente (Map preserva ordem de inserção). null = nenhum diálogo pendente vivo nesta tela. */
    private pendingQuestionPaneId;
    /**
     * C-085 r3 (caso determinístico da régua A): com pergunta pendente narrada, a PRÓXIMA fala do
     * usuário que NÃO é comando de UI é POR CONSTRUÇÃO a resposta àquele diálogo — pane_write
     * verbatim (voz→pane, C-062/Lei de fidelidade), técnico, sem passar pela decisão do modelo
     * Live (que já respondeu genérico da própria cabeça — reprovação ao vivo 2026-07-04). Ack
     * curto via fila F-113; a resposta real chega pela infra existente do perguntar (poll 8s /
     * handoff). O caso GERAL (sem pergunta pendente) segue a decisão de design nº 1 do C-092 —
     * NÃO implementado aqui.
     */
    private maybeRouteAnswerToPendingQuestion;
    /** C-092.11 (finding 2): heurística de resposta-plausível ao diálogo pendente — curta (fala
     *  típica de resposta por voz), ou referenciando opção/número, ou compartilhando palavra
     *  significativa com a pergunta narrada. Pedido imperativo longo sem relação = trabalho NOVO. */
    private looksLikePendingAnswer;
    /** C-085 r3: a MESMA fala já foi roteada tecnicamente ao pane pendente? (o modelo Live pode
     *  chamar perguntar/comandar/delegar com o mesmo conteúdo logo depois — vira ack, sem 2º write).
     *  C-092.11 (finding 1): containment simétrico sem fronteira engolia fala nova que só CONTINHA
     *  a resposta curta roteada ("sim", "2") — agora igualdade estrita, ou containment apenas com
     *  fragmento ≥15 chars E em fronteira de palavra. */
    private wasAnswerJustRouted;
    /** C-092.11 (finding 1): o 'delegar' não nomeia pane — o dedup dele só vale quando o pane que
     *  RECEBEU o roteamento ainda pertence à interface atual (mesma missão na tela, ou visível).
     *  Pane de outra tela não pode engolir um briefing novo com ack falso. */
    private routedAnswerPaneOnScreen;
    /**
     * F-101: um pane delegado submeteu handoff → narra PROATIVAMENTE pro usuário. Ignora
     * panes que o Jarvis não delegou (workers internos de outra missão) e mortes pedidas
     * (closed_by_caller). F-164: só closed_by_caller limpa o mapeamento — 'done' mantém
     * (worker persistente re-submete e cada entrega volta a ser narrada; mesma semântica
     * do wireCallerMapListener).
     */
    private onDelegatedHandoff;
    /**
     * C-085.2: handoff de um WORKER que um chefe/piloto delegado repassou trabalho pra (via
     * pollDelegatedPaneHops) — narra a entrega voltando pra cadeia ("o pesquisador terminou,
     * o chefe tá revisando"), nunca "o pane X terminou" isolado do contexto de quem delegou.
     */
    private onHopWorkerHandoff;
    private runAgentSdkTurn;
    /**
     * System prompt do brain = prompt canônico + camada de memória (C-055):
     * instruções de uso das tools memory_* e o bloco de fatos persistidos.
     * Montado AQUI (não no buildJarvisSystemPrompt do core) — o bloco é dinâmico
     * por sessão e a camada de memória é do sidecar.
     */
    private composeSystemPrompt;
    private createLiveSession;
    private buildOverclockMcpServer;
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
    private runTool;
    /**
     * squad_open: compound que lista squads, acha o melhor match por nome,
     * spawna via overclock_squad_spawn (createMission=true) e envia o briefing.
     */
    private runSquadOpen;
    private executeSdkTool;
    private makeCanUseTool;
    private queueCallId;
    private dropCallId;
    private takeCallId;
    dispose(): void;
}
//# sourceMappingURL=JarvisService.d.ts.map