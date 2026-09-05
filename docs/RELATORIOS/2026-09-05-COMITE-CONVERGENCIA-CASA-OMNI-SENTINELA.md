# 👑 COMITÊ — CONVERGÊNCIA CASA + OMNI + SENTINELA

Data: 2026-09-05
Estado: BASELINE_MAIN_CRISTALIZADA / RUNTIME_AINDA_REQUER_PROVA
Marker: centraldark-hud-committee-sync

## Intenção vigente

Toda superfície CentralDark — site, Desktop/.exe, SOL, Hermes, Codex, browser, terminal, Obsidian, MCP e demais braços — deve convergir para o mesmo organismo lógico, a mesma intenção e o mesmo GOAL. Nenhuma superfície pode escolher provider direto ou manter uma Casa paralela por conveniência.

## Comitê

- 👑 SEGREDO/CHEFE = intenção, GOAL e autorização.
- ☀️ SOL = coordenação e reconciliação.
- 🧭 MULTIBÚSSOLA = percorre múltiplas direções e setores; não reduzir a três eixos rígidos.
- ⊛ META LUPA = discrimina causalidade, owner, CURRENT vs HISTORY e primeiro elo quebrado.
- 🧿 SENTINELA = detecta desalinhamento em qualquer superfície e aponta o cone causal.
- 🐚 CARACOL REVERSO = retorna ao último cursor provado, preservando provas independentes.
- ☿ HERMES/PIVETE = executa dentro do owner e da autoridade comprovados.
- ⚖ REALITY JUDGE = decide PASS/FAIL/UNKNOWN; comentário, HUD ou narrativa não substituem execução.

## Fluxo único

👑 INTENÇÃO + GOAL
↓
#ACORDAR
↓
GOAL LOCK
↓
CENTRALDARK_AI_BOOT
↓
HISTORY RENDEZVOUS
↓
CAPABILITY LINEAGE
↓
SENSOR DISCOVERY
↓
MINIMUM SUFFICIENT OBSERVATION
↓
NORMALIZE + DEDUPE
↓
🧿 SENTINELA / ALIGNMENT CHECK
↓
EXISTING OWNER
↓
☀️ SOL
↓
🧭 MULTIBÚSSOLA
↓
⊛ META LUPA
↓
ONE WRITER
↓
☿ HERMES
↓
CONTRAPROVA
↓
REMEDIÇÃO
↓
⚖ REALITY JUDGE
↓
FIXED_POINT
↓
GRAFO / RECEIPT / CURSOR
↓
BOOT CONTINUITY

Qualquer divergência material ativa 🐚 CARACOL REVERSO e retorna somente pelo cone causal afetado.

## Lei da Casa no Windows

- `E:\CentralDark` = CASA OPERACIONAL VIVA.
- `C:\CentralDark` = LEGADO / ENTRADA PARA RECONCILIAÇÃO, salvo contraprova explícita posterior.
- `C:\Program Files` e `C:\Users\...\AppData` podem continuar hospedando software/perfis externos do Windows. Isso não os torna segunda Casa.
- Dado próprio da CentralDark sob `C:\CentralDark` deve emitir `HOUSE_PATH_DRIFT` antes de qualquer movimentação.
- Nenhum movimento/apagamento automático de dado é autorizado somente pela detecção; primeiro classificar owner e dependências.

## Lei da porta única

Superfície local:

Desktop / SOL / Codex / componentes locais
→ `http://127.0.0.1:8099`
→ CentralDark Omni Router
→ provider/braço selecionado pelo router
→ receipt

Superfície pública:

Site / clientes remotos
→ `https://api.centralldark.com/v1`
→ fachada CentralDark
→ mesmo Omni Router lógico
→ provider/braço selecionado pelo router
→ receipt

Hermes é braço interno. Provider direto não é porta oficial da Casa.

## Codex reconciliado

O caminho antigo `model_provider = "abacus"` exigia `ABACUS_API_KEY` na própria superfície Codex e podia falhar antes de chegar à CentralDark.

O caminho oficial candidato agora é:

Codex
→ provider `centraldark`
→ `http://127.0.0.1:8099/v1`
→ `wire_api = "responses"`
→ Omni Router
→ cadeia de providers permitidos
→ receipt.

Credenciais de Abacus, xAI, Nous, Google, OpenAI e demais upstreams pertencem ao router/owner do provider. A superfície só conhece a porta CentralDark e, quando habilitado, o token próprio do router.

## Failover materializado no Omni

O Omni Router agora possui:

- `POST /v1/chat/completions`;
- `POST /v1/responses`;
- cadeia configurável por `CENTRALDARK_FALLBACK_CHAIN`;
- `CENTRALDARK_AUTO_FALLBACK` ligado por padrão;
- `CENTRALDARK_FREE_ONLY` para política de somente rotas gratuitas permitidas;
- descoberta dinâmica de modelo Nous `:free` quando `NOUS_MODEL` não está fixado;
- skip explícito de provider não configurado;
- skip explícito de provider rejeitado pela política de preço;
- tentativa sequencial até primeira rota permitida com PASS;
- `fallback_used` e `attempts` no receipt;
- `model_touch` por tentativa;
- falha final somente depois de esgotar as rotas permitidas.

Isso prova implementação na baseline. Não prova que o runtime atual já foi reiniciado com esse código nem que uma cadeia real já completou failover em produção/local.

## Assinaturas materializadas

- `PROVIDER_SPENDING_LIMIT` — provider sem crédito/assinatura; marcar rota quebrada e medir próximo provider permitido.
- `MODEL_EXPIRED` — modelo antigo/gratuito expirou; atualizar catálogo, marcar rota quebrada e tentar próximo modelo/engine permitido.
- `MISSING_PROVIDER_KEY` — chave de provider opcional ausente; não promover a ausência a falha global quando a superfície usa a porta única.
- `SURFACE_ROUTE_DRIFT` — superfície contornou Omni Router.
- `HOUSE_PATH_DRIFT` — dado da Casa apontou para `C:\CentralDark` em vez da Casa vigente.
- `HTTP_403` — 403 genérico ainda exige META LUPA para localizar a camada.
- `PYTHON_LOCK_RELEASE` — bug local de estado de lock.
- `TOOL_PROTOCOL_LEAK` — protocolo de ferramenta vazou na UI humana.

## Selos semânticos da Sentinela

- 🛠️ `TOOL_ERROR`
- 🧪 `TEST_FAILURE` / `RETEST`
- 🏗️ `CI_RUNNER_ROUTE_FAILURE`
- ⚔️ `CONTRADICTION_FOUND`
- 🛰️ `RUNTIME_DRIFT`
- 🌿 `ANY_PR_OR_COMMIT`
- 🔄 `STATE_CHANGED`
- ✍️ `WRITER_CONFLICT`
- 🧱 `BOUNDARY_TOUCHED`
- 🎯 `PROOF_TARGET_MISMATCH`
- ⚖️ `EVIDENCE_CONFLICT`
- 🧠 `MODEL_UNAVAILABLE`
- 🧩 `DEPENDENCY_FAILURE`
- ⊛ `META_LUPA`
- 🐚 `CARACOL_REVERSO`
- 🪡 `RECONCILIAR`
- 🔀 `FAILOVER_ALLOWED_ROUTE`

Selo representa intenção semântica; não substitui prova.

## Estados nesta passagem

PROVADO NO REPOSITÓRIO:
- Desktop conhece `OMNI_ROUTER_BASE_URL` e `E:\CentralDark` como house root padrão.
- SOL projeta CentralDark/Omni, não Hermes como porta principal.
- LLMManager entra em modo `CENTRALDARK_ONE_ROUTER` por padrão para impedir providers diretos como estrada normal.
- Mapa vivo do Obsidian aponta para `E:\CentralDark\Pivete\CentralDark\docs\BRAIN`.
- Sentinela classifica spending-limit, modelo expirado, chave opcional ausente, route drift e house path drift.
- Sentinela projeta selos semânticos nas rotas.
- Omni implementa cadeia de failover e Responses API.
- documentação Codex aponta para a porta única CentralDark em vez de Abacus direto.

AINDA NÃO PROVADO EM RUNTIME:
- Caddy público realmente encaminhando os endpoints de IA para o Omni atual.
- processo Omni atual executando o commit novo.
- failover end-to-end observado após `PROVIDER_SPENDING_LIMIT` ou `MODEL_EXPIRED`.
- `.exe` atual construído a partir deste HEAD e executando com esta política.
- Sentinela rodando continuamente e recebendo eventos de todas as superfícies.
- migração física completa de todo dado próprio residual de `C:\CentralDark` para `E:\CentralDark`.

## Veredito

ARCHITECTURE_CONVERGENCE = PROVADO_NA_MAIN
RUNTIME_CONVERGENCE = EVIDENCIA_FALTANTE
HOUSE_E_POLICY = PROVADO_NA_MAIN
C_DRIVE_FULL_RECONCILIATION = EVIDENCIA_FALTANTE
SINGLE_ROUTER_POLICY = PROVADO_NA_MAIN
OMNI_RESPONSES_API_CODE = PROVADO_NA_MAIN
OMNI_FAILOVER_CODE = PROVADO_NA_MAIN
OMNI_FAILOVER_END_TO_END = EVIDENCIA_FALTANTE
CODEX_SINGLE_ROUTER_POLICY = PROVADO_NA_MAIN
GLOBAL_FIXED_POINT = NOT_PROVEN

A realidade julga: commit na main prova baseline estrutural; não prova deploy, processo vivo nem migração física do disco.
