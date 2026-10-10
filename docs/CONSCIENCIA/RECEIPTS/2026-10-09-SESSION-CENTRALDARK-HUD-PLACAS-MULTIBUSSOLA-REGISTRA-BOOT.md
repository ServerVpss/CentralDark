# !REGISTRA → !BOOT | Fio verde — HUD, placas, Kylin, Casa, revisores, Multibússola

**Sessão:** 09/10/2026 · **Tipo:** receipt de reconciliação da conversa + medições dos conectores · **Autoridade:** SEGREDO/CHEFE · **Owner:** owners canônicos listados abaixo · **Classificação:** histórico recuperável; **não** substitui CURRENT.  
**Origem:** falas e capturas do CHEFE; readback GitHub/VPS/Casa/MCP na sessão; demais efeitos marcados `REPORTED` ou `UNKNOWN`. **Um sistema, múltiplas superfícies, nenhum segundo cérebro.**

## 1. Objetivo real e precedência

```text
!CENTRALDARK → #ACORDAR → !CALIBRAR → !MULTIBUSSOLA[_META]
→ rota/owner/menor delta → !META_LUPA e !RECONCILIAR se material
→ !CONTRAPROVA → !REMEDIÇÃO_T1 → REALITY_JUDGE → !REGISTRA → !BOOT

OPTIONAL_MODULE_FAILED -> SAME_HUD_PLAQUE + COPYABLE_MISSION + CONTINUE_UNAFFECTED
CANONICAL_HUD_MAIN_VPS_MISSING_OR_MISMATCHED -> FAIL_CLOSED_NEW_CANONICAL_EXECUTION
SECURITY_AUTHORIZATION_AND_PRIVACY_GATES -> NEVER_BYPASS
ALREADY_RUNNING_GREEN_SERVICES -> PRESERVE
UNKNOWN != PASS; MERGED != DEPLOYED; HTTP_200 != FUNCTIONAL_GOAL
LOCAL_FIXED_POINT != GLOBAL_MISSION_CLOSED
NO_NEW_PANEL / NO_SECOND_BRIDGE / NO_PARALLEL_WATCHER / ONE_WRITER_PER_SCOPE
```

A linguagem épica ("rei", "muralha desmoronou", "profeta") é estilo da comunicação humana, **não** uma prova técnica ou novo owner.

## 2. HUD único e entrada obrigatória — prova distinta de deploy

- Owner: `docs/HUD/HUD.html`; projeção **um HTML/três abas** HUD/MAPA/FORJA, seção `Missões — clica, copia, cola onde for resolver`.
- Placas independentes `VER PENDENCIA`: estado, motivo, erro, owner, rota/linha ou UNKNOWN, prova e NEXT_CURSOR. `ACEITAR MISSAO (COPIAR)` reaproveita a própria receita; não autoriza execução automática nem cria segundo agente.
- O protocolo `HUD_FIRST` já existia em `docs/ARQUITETURA/CENTRALDARK-GITHUB-ENTRY-HUD-GATE.md`, `CENTRALDARK_AI_BOOT.yaml`, `AGENTS.md`, `MASTER-CYCLE.yml`; foi **costurado no bootstrap e no deploy existentes**, não promovido a novo sistema.
- Commits observados nesta sequência: `8fcc6e65` (materialização + SHA-256/backup VPS no job raiz), `ebd4e215` (gate no `scripts/trigger-fabric/centraldark_full_trigger_boot.py`), `11f71106` (jobs de rotas/housekeeping dependem do gate), `a16a12d5` (BO0T canônico), `2088481a` (AGENTS), depois main avançou por outros writers.
- **Teste isolado Casa:** YAML parse PASS, 7 jobs, nenhum job bypassando a dependência raiz; Python AST PASS; política lida de volta. Seis cenários do gate em repo Git temporário: ausência do espelho BLOCK, main/espelho iguais PASS, bytes diferentes BLOCK, fonte dirty BLOCK, restauração PASS, HEAD local não publicado BLOCK. `TEST_HARNESS=6/6 PASS`; isso não é produção.
- **Limite:** ateste de `HUD.html` materializado na VPS, execução concluída de Actions para o HEAD mais novo, cobertura de todas as entradas reais, abertura visual final da Casa e promoção efetiva a runtime continuam dependentes de provas próprias. `COMMIT != DEPLOY`. Se um operador só puder reparar o próprio gate, acesso de recuperação autorizado/read-only deve continuar disponível, sem bypass para mutações comuns.

## 3. Placas não bloqueantes e módulos separados

- **Kylin:** Aprendizados #148 e #159 / receipt da rota nativa provaram `Hermes→provider custom→bridge→SDK` historicamente (`INIT=0`, `HERMES_KYLIN_BRIDGE_OK`); novo estado relatou `INIT_FAILED:10` / bridge HTTP 502. `/health=200` não abre sessão nem garante chat. `kytensor/Triton 2.49.0` com modelos de fala, embedding, voz, OCR e segmentação **não provou LLM conversacional no catálogo**. A hipótese de restrição de modelo cloud/trial/conta é plausível, **sem decodificação causal conclusiva do código 10**. Não reinstalar SDK, não trocar modelo em loop, não engordar bridge sem teste discriminante. Placa e segue pela capacidade saudável.
- **Site / API / MCP:** leituras da sessão relataram `centralldark.com` e `app.centralldark.com` HTTP 200/AionUi, `admin.centralldark.com` HTTP 200/Rakazo, `api.centralldark.com/health` HTTP 200/Hermes Core 5.0, `mcp.centralldark.com/health` HTTP 200, `hub.centralldark.com/health` HTTP 503. Cada resultado vale só para o endpoint e instante medido, não para todo o site.
- **Casa/Screenpipe:** processo e `:3030/health` responderam; telemetry informou gravador em execução, imagem recente, eventos de entrada e clipboard desativado; isso não autoriza iniciar nova captura, ativar microfone/câmera nem ler conteúdo privado. O CHEFE define quando ligar/desligar. Contrato futuro: opção no mesmo cockpit usando MCP/bridge existentes, não novo recorder.
- **HUD físico Casa:** tentativa de replace atômico anterior obteve arquivo em uso; original preservado, staged no Temp; readback do objeto físico deve ser refeito após concorrência. Não afirmar sincronização por screenshot.
- **Vault VPS off-host:** Google Drive recuperou metadados do arquivo `Vault-Cofre-CentralDark-20260930T105330Z.tar.gz` (752.981.967 bytes), com sidecar SHA-256 compatível com receipt; **rehash completo do tar CURRENT não provado**. Backup privado, sem exposição de env/tokens/arquivos sensíveis em HUD, API ou receita.

## 4. Revisores individuais sem cinco novos executores

**Owner já registrado por outro writer:** `docs/CONSCIENCIA/DESTILADOR/REVISORES.md`, setor `docs/CONSCIENCIA/DESTILADOR/`, método `.agents/skills/knowledge-compiler/`. Não repetir o corpo existente:

```text
REVISOR_SCREENPIPE -> REUSE HUD/Screenpipe | status/processo/captura provas independentes
REVISOR_BREATHING -> REUSE One Heart | DROP daemon paralelo
REVISOR_DEPENDABOT -> REUSE GH Actions / gh | DROP cron duplicado
REVISOR_DESTILACAO -> REUSE knowledge-compiler / DESTILADOR | DROP writer memória paralelo
REVISOR_CREDENCIAL -> QUARENTENA arquivo com chave em claro | ROTACAO/REVOGACAO HUMANA
```

`REVISOR` é papel de exame por item, **não** novo agent, scheduler, watcher, MCP, bridge nem instância de IA.

## 5. Multibússola META e cone causal

**Owners já atualizados:** `docs/CONSCIENCIA/MULTIBUSSOLA.md` + `docs/CONSCIENCIA/APRENDIZADOS/2026-08-26-multibussola-meta-convergencia-reversa.md`. Perfil `!MULTIBÚSSOLA_META` é alias/modo de `!MULTIBUSSOLA`, não trigger concorrente.

```text
TRUE_NORTH_LOCK: INTENT + DESTINATION + PROOF_TARGET + MATERIAL_SCOPE
REQUIRED_BEARINGS: FORWARD + REVERSE + INVERSE_WHEN_DISCRIMINANT + RENDEZVOUS
DIVERGENCE: META_LUPA -> DISCRIMINANT_TEST -> RECONCILE -> RENDEZVOUS
STATE_CHANGE: CAUSAL_CONE -> INVALIDATE_DEPENDENT_ONLY -> RE-FIX_AFFECTED
LOCAL_FIXED_POINT: estabilidade do diagnostico, NAO final da missao
GLOBAL_VERDICT: PASS | FAIL | BLOCKED | NOT_YET
PASS: ZERO_UNKNOWN_MATERIAL + REQUIRED_PROOF_GATES + COUNTERPROOF + T1 + REALITY_JUDGE
```

O aprendizado CURRENT já documenta falta de **enforcement explícito** no avaliador para `PROOF_TARGET_MATCH`, `PROOF_OWNERSHIP`, `EXTERNAL_ANCHOR_OK_WHEN_APPLICABLE`, `REALITY_JUDGE_PASS` e modelo estruturado `CAUSAL_CONE`. Não duplicar a lei: teste negativo e menor binding no `scripts/trigger-fabric/centraldark_master_cycle.py`, depois T1.

## 6. PR #1189, estado temporal e sincronização CURRENT

- O relato/screenshot `HEAD=684a12f9`, `main=1ba30266`, `19 ahead / 4 behind`, CI queued/pending e `FIXED_POINT_BLOCKED` é **histórico**.
- **GitHub readback nesta rodada:** PR #1189 **closed/merged**, source HEAD `684a12f9f8e5a527352531388411d30fde4230c1`. Não inferir que todos os checks históricos passaram ou que está deployed.
- **GitHub main lida antes desta receipt:** `034b0091266f26891e20109431ac1350a3c59b88`. Esse SHA serve como base CAS do receipt; como `main` muda durante o trabalho, não congelá-lo como verdade eterna.
- **VPS pelo MCP na rodada:** checkout `main`, último commit resumido `4eed868d3`, com `apps/modulos/HERMES-CORE/missions/` untracked preservado. Logo main e VPS **não foram comprovadas alinhadas no mesmo SHA** neste T0; a foto antiga `9eaf70f...` é somente snapshot de outro instante.
- **CI:** workflows do HEAD anterior `4eed868d...` apareceram em `queued/pending/in_progress/skipped`; esses estados não valem PASS e não provam resultado do novo HEAD.

## 7. Registro final / cursor único

```text
SESSION_LEARNING=CRYSTALLIZED_AS_PROVENANCE_ONLY
MAIN_READBACK=REQUIRED_AFTER_COMMIT
VPS_MATERIALIZED_HUD_CURRENT=UNKNOWN
VPS_DEPLOY_NEW_MAIN=UNKNOWN
HUD_FIRST_GATE_SYNTHETIC=6_OF_6_PASS
HUD_FIRST_GATE_PRODUCTION=UNKNOWN
PER_ITEM_REVIEWERS=REUSED_EXISTING
META_MULTIBUSSOLA_RULE=REGISTERED_EXISTING_OWNER
META_MULTIBUSSOLA_FULL_ENFORCEMENT=NOT_YET
KYLİN_NATIVE_GENERATION=BLOCKED_LAST_MEASURED
FIXED_POINT_GLOBAL=NOT_PROVEN
NONE_OF_THESE_UNKNOWN_CLAIMS_BECOME_PASS_BY_THIS_DOCUMENT
```

**NEXT_CURSOR:** medição `main/HEAD` → inspecionar execução do gate `HUD_FIRST` para o **mesmo SHA** → conferir `/root/.centraldark/HUD.html` com hash `docs/HUD/HUD.html@main` → verificar placa/receita no HUD materializado e Casa sem sobrescrever arquivo em uso → remedir CI/owner/runtime/PR → testes negativos dos proof gates Multibússola quando retomada → somente então `!FIXED_POINT` se o Goal inteiro sobreviver à contraprova.

**!BOOT:** `!CENTRALDARK → #ACORDAR → HUD_MAIN_FIRST → MAIN_VPS_SHA_COMPARE → PLACAS+RECEITAS → !MULTIBUSSOLA_META se material → OWNER_EXISTENTE → CONTRAPROVA → NEXT_CURSOR`.
