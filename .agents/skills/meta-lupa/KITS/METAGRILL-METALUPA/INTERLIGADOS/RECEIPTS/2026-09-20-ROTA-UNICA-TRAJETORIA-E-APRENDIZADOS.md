# 🪬 ROTA ÚNICA — trajetória operacional e aprendizados integrados

PR_MOTHER=#1562  
ROLE=RENDEZVOUS_LEDGER_NOT_RUNTIME_WRITER  
AUTHORITY=SEGREDO/CHEFE  
SOURCE_CHILD_PR=#1597  
SOURCE_CHILD_CURRENT_HEAD=1486cf565dea87b3195a6d1105c9a343b8f67fec  
MISSION=INTEGRAR_TRAJETORIA_E_APRENDIZADOS_NA_MESMA_ROTA  
ONE_SYSTEM_ONLY=true  
REUSE_BEFORE_CREATE=true  
CURRENT_OVER_HISTORY=true  
UNKNOWN_IS_NOT_PASS=true  
REALITY_IS_JUDGE=true

## Objetivo

Preservar a trajetória completa desta execução como memória operacional reutilizável sem transformar o PR-MÃE em owner de runtime, sem abrir arquitetura paralela e sem fazer cada agente redescobrir o mesmo caminho.

A rota é única. O PR-MÃE preserva genealogia, decisões, deltas, contraprovas e NEXT_CURSOR. A mutação material continua no PR-filho e no owner correspondente.

## Rota canônica única

1. 👑 Intenção do CHEFE.
2. 👑🪬 !CENTRALDARK.
3. 🔒 PR-MÃE #1562 como rendezvous/ledger.
4. 🧩 Resolver owner existente e PR-filho.
5. 📡 T0 em GitHub + Casa + VPS + API + CI aplicável.
6. 🔄 Reconciliar cross-surface antes de mutar.
7. 🛡️ Global Entry Gate.
8. ✍️ ONE WRITER no mesmo escopo.
9. 🪡 Patch mínimo causal.
10. 🧪 Preflight no owner correto.
11. ⚖️ Contraprova.
12. 🐙 Push no PR-filho.
13. 🏗️ SAME-HEAD CI.
14. 🔬 Investigar vermelho pelo mesmo HEAD.
15. 🪡 Corrigir somente a ferida provada.
16. ✅ Promoção canônica quando elegível.
17. 🏠☁️ Convergir Casa + VPS.
18. ⚙️ Runtime/package/launch quando aplicável.
19. 📡 T1 no mesmo alvo.
20. ⚖️ REALITY JUDGE.
21. 🧾 Receipt volta ao PR-MÃE.
22. 🧭 NEXT_CURSOR.
23. 🔁 Continuar o mesmo delta.

PR_MOTHER = trajetória + rendezvous + ledger.  
CHILD_PR = writer + mutation track.  
GITHUB = registro.  
CI = same-head gate.  
CASA/VPS/API = sensores e runtime.  
HERMES = toil e execução autorizada.  
REALITY = juiz.

## Trajetória desta missão

### 1. Malha básica conectada, Fixed Point global não

Foi medido:

- CASA_REMOTE=ONLINE.
- VPS_REMOTE=ONLINE.
- MCP_VPS_HEALTH=200.
- MCP_PUBLIC_HEALTH=200.
- ADMIN_PUBLIC_HEALTH=200.
- HERMES_VPS=RUNNING.
- GITHUB_PR_CI=CONNECTED.

Ao mesmo tempo:

- CASA_HEAD=7d4fdaf54f8e0b45da10e20fb852d6eb4b7213a1.
- VPS_ROOT_HEAD=f3c00f9c73c6691ef044bb237623e88ce57aaf38.
- VPS_CANONICAL_MAIN=cead445aa2a9386352d701070a56dfe5c8e066b4.
- GLOBAL_SAME_HEAD=false.
- DESKTOP_DIST=false.
- CENTRALDARK_EXE_RUNTIME=NOT_PROVEN.
- HERMES_BUNDLED_SIDECAR=UNKNOWN.
- GLOBAL_KERNEL_FIXED_POINT=false.

Aprendizado: CONNECTED_FOR_WORK != SAME_HEAD != DEPLOYED != GLOBAL_FIXED_POINT. REMOTE_ONLINE também não prova que todo agente individual esteja conectado.

### 2. Desktop/kernel lógico entrou no contrato global

No filho #1597, commit b09517b865e2850de121079d574869fa8c171650, o Desktop foi ligado ao contrato global.

Fronteiras preservadas:

- CENTRALDARK_CORE = LOGICAL_AGENTIC_KERNEL.
- NATIVE_OS_KERNEL = camada diferente.
- SOURCE_PRESENT != RUNTIME_PASS.
- CONTRACT_TEST_PASS != PACKAGED_PASS.
- EXE_EXISTS != FIXED_POINT.
- REMOTE_BRIDGE_ONLINE != GLOBAL_FIXED_POINT.

Para Fixed Point Desktop, package, SHA, launch, renderer, Omni, Hermes sidecar, MCP e T1 permanecem obrigatórios.

### 3. SAME-HEAD CI revelou três feridas reais

No HEAD b09517b:

- GATILHO_APRENDIZADO_SYNC=FAIL.
- PORTA_CANONICA=FAIL.
- MCP_DIST_MATCH=FAIL.

Causas provadas:

1. LOG_INCIDENT_MATERIAL e VPS_KERNEL_DELTA_MATERIAL entraram sem atualização de aprendizado no mesmo diff.
2. docs/CONSCIENCIA/CONTRATO-HIBRIDO-GRAFO-LOGS-LOCAL.md estava canônico, porém órfão da porta.
3. O dist versionado do MCP não correspondia ao build do source.

Um vermelho separado do auto-review anterior foi causado por rate-limit da instalação GitHub. Falha externa de provedor não foi promovida a regressão de produto.

### 4. Correção causal no mesmo filho

Foi produzido o commit 1486cf565dea87b3195a6d1105c9a343b8f67fec, fix(contract): reconciliar gates do delta global.

Preflight antes do push:

- GLOBAL_CONTRACT_ENTRY=PASS.
- GATILHO_APRENDIZADO_SYNC=PASS.
- PORTA_OK=1.
- CANONICOS=22.
- ALCANCAVEIS=22.
- ERROS=0.
- UNIVERSAL_ENGINE_METHOD_SELF_TEST=PASS.
- AGENT_CALL=82/82 PASS.
- DESKTOP_CONTRACT=8/8 PASS.
- DIST_ARTIFACT_MATCH=PASS.
- GLOBAL_CONTRACT_EXIT=PASS.
- EPHEMERAL_WORKTREE_REMOVED=true.

O dist foi reconciliado com os arquivos exatos do artefato compilado pelo CI do HEAD anterior, com hashes conferidos antes da cópia.

Aprendizado: build artifact diferente de committed dist bloqueia PASS. Reproduzir/consumir build exato, conferir hash, versionar e voltar ao SAME-HEAD CI.

### 5. O pipeline avançou e revelou a próxima camada

No CURRENT 1486cf565, já passaram:

- porta-de-entrada.
- lupa-conformance.
- Hermes Core Signal Watch.
- artefato de aprendizado automático.
- Pipeline Telegram + Painel.
- PR Title Contract.
- nivel-7-tests.
- Lupa Drift Guard.
- CodeQL.

Novos vermelhos só ficaram visíveis porque a esteira avançou.

#### Mermaid / Trigger Fabric

Causa observada: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.mmd, linha 84, contém sintaxe de nó inválida com identificador iniciado por colchete, produzindo MERMAID_PARSE_ERROR.

Aprendizado: falha em gate posterior pode ser dívida latente exposta por progresso; não reclassificar toda a missão como regressão.

#### Grafo Vivo Markdown

docs/CONSCIENCIA/APRENDIZADOS.md entrou no diff. O gate passou a validar o arquivo legado inteiro e expôs dívida pré-existente de conformidade, incluindo MD047, MD022, MD024 e MD009.

Aprendizado: TOUCH_LEGACY_MONOLITH pode ativar FULL_FILE_CONFORMANCE_GATES. Não desligar o gate para esconder dívida; corrigir ou isolar a causa dentro do owner correto.

#### Scanner de segredo

O scanner marcou SECRET_SUSPECT=true em apps/modulos/mcp/dist/modes/admin/tools/admin-provider-control.js, sem sensitive-path match.

Diagnóstico sem exposição de valores apontou três BARE_ASSIGNMENT em atribuições token do código gerado. O source correspondente usa chamadas de função para carregar credenciais, incluindo loadSecretFromFiles, loadTailscaleKey e loadBuildkiteToken. Não há evidência, nesses três matches, de credencial literal exposta.

Aprendizado: o scanner deve distinguir LITERAL_SECRET de ENV_REFERENCE, FUNCTION_CALL e RUNTIME_SECRET_LOADER_REFERENCE, mantendo fail-closed para literal real e adicionando self-test discriminante.

### 6. Erros do próprio executor também viram aprendizado

Uma primeira tentativa de wrapper remoto falhou antes de qualquer mutação por problema de quoting. Foi provado REMOTE_MUTATION_EXECUTED=false antes do retry.

Aprendizado: TOOL_WRAPPER_FAILURE != TARGET_FAILURE. Antes de repetir, provar zero mutação, corrigir o invólucro e repetir o mesmo escopo.

Também houve teste Desktop executado de CWD errado, retornando ENOENT; reteste no owner correto apps/modulos/Bolt/source passou 8/8.

Aprendizado: WRONG_CWD_FAILURE != PRODUCT_FAILURE. PROOF_TARGET_MUST_MATCH_CLAIM=true.

## PEGATUDO — todas as peças pela mesma rota

- OBSIDIAN / GRAFO VIVO → control surface e knowledge projection.
- APP VOZ → interface/capability.
- MULTI_ACCOUNT_HUB → account/session capability.
- SCREENPIPE → optional local sensor.
- DESKTOP COMMANDER → human desktop bridge/fallback.
- GPU / CPU / AUDIO / VIDEO → capacidades locais mensuráveis.
- AIOS / WATCH → observabilidade e learning candidates.
- MODELOS / AGENTES → braços/workers substituíveis.
- HERMES → authorized execution toil.
- MCP / CONTROL API → rota machine-facing única.
- PR-MÃE → rendezvous, genealogia e ledger.

NEW_OWNER=false.  
NEW_KERNEL=false.  
NEW_ADMIN=false.  
NEW_CONTROL_PLANE=false.  
RAMIFICAR_CHAT != RAMIFICAR_SISTEMA.

## Aprendizados duráveis

1. CURRENT > HISTORY.
2. UNKNOWN != PASS.
3. CONNECTED != CONVERGED.
4. SOURCE != RUNTIME.
5. TEST_PASS != PACKAGED_RUNTIME.
6. HTTP_200 != GLOBAL_PASS.
7. DOCUMENTED != EXECUTED.
8. CANONICAL_BUT_UNREACHABLE = CANONICAL_ORPHAN.
9. NEW_TRIGGER_REQUIRES_LEARNING_BINDING.
10. COMMITTED_DIST_MUST_MATCH_REPRODUCIBLE_BUILD.
11. FAILURE_AT_LATER_GATE_CAN_BE_LATENT_DEBT_EXPOSED_BY_PROGRESS.
12. PROVIDER_RATE_LIMIT != PRODUCT_REGRESSION.
13. TOOL_WRAPPER_FAILURE != TARGET_FAILURE.
14. WRONG_CWD_FAILURE != PRODUCT_FAILURE.
15. TOUCH_LEGACY_MONOLITH MAY ACTIVATE WHOLE_FILE_GATES.
16. SECRET_SCANNER MUST DIFFERENTIATE LITERAL FROM EXECUTABLE_REFERENCE.
17. ONE_WRITER_PER_MUTABLE_SCOPE.
18. PARALLEL_READS_REQUIRE_RENDEZVOUS_BEFORE_MUTATION.
19. PR_MOTHER_RECORDS; CHILD_PR_MUTATES.
20. REALITY_JUDGE_CLOSES_THE_CLAIM.

## Continuidade para qualquer agente futuro

Qualquer modelo/agente que recuperar esta trajetória deve:

1. recuperar o PR-MÃE;
2. ler o receipt mais recente;
3. verificar o HEAD CURRENT do PR-filho;
4. ler o SAME-HEAD CI atual;
5. carregar apenas deltas ainda não resolvidos;
6. reutilizar o owner existente;
7. mutar somente no escopo do filho;
8. devolver receipt ao PR-MÃE.

Se o HEAD mudou, receipt antigo vira HISTORY e o novo HEAD precisa ser remedido.

Erro resolvido não deve ressuscitar sem contraprova.

Erro novo entra como NEW_DELTA_SAME_MISSION, não como nova arquitetura ou novo cérebro.

## CURRENT não fechado

No momento desta cristalização:

- CHILD_PR=#1597.
- CHILD_HEAD=1486cf565dea87b3195a6d1105c9a343b8f67fec.
- CHILD_MERGEABLE=true.
- SAME_HEAD_PASS_PARTIAL=true.
- TRIGGER_FABRIC=FAIL_MERMAID_PARSE.
- PR_AUTO_REVIEW=FAIL_SECRET_SCANNER_CLASSIFICATION.
- GRAFO_VIVO_MARKDOWN=FAIL_LEGACY_FILE_CONFORMANCE.
- CODEX_VALIDATE=QUEUED_AT_LAST_OBSERVATION.
- GLOBAL_SAME_HEAD=false.
- GLOBAL_KERNEL_FIXED_POINT=false.

Este receipt registra trajetória e direção; não declara promoção nem Fixed Point.

## NEXT_CURSOR

#1597 CURRENT → corrigir ARCHITECTURE.mmd no mesmo owner → corrigir APRENDIZADOS.md sem enfraquecer o Grafo Vivo gate → corrigir scanner para function-call/reference sem liberar literal real → self-tests discriminantes → SAME-HEAD CI → investigar apenas vermelhos restantes → promoção canônica quando elegível → convergir Casa + VPS → package/launch Desktop → Omni + Hermes + MCP T1 → rendezvous GitHub + Casa + VPS + API → Reality Judge → receipt volta ao #1562.

## Fixed point deste receipt

ROUTE_INTEGRATED=true.  
TRAJECTORY_PRESERVED=true.  
LEARNINGS_PRESERVED=true.  
PARALLEL_ARCHITECTURE_CREATED=false.  
RUNTIME_CLAIM_PROMOTED=false.  
GLOBAL_FIXED_POINT=false.  
NEXT_CURSOR_PRESERVED=true.
