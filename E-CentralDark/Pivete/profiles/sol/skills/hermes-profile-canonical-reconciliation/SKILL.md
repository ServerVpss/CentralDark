---
name: hermes-profile-canonical-reconciliation
description: "Trigger: bootstrap, drift, pre-commit, mission. Adapts SOUL."
trigger:
  - profile_bootstrap
  - drift_detected
  - pre_commit_quality_gate
  - mission_sync
phases: "MEASURE → DIAGNOSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT"
runtime_checks:
  - canonical_soul_present
  - profile_soul_present
  - mtime_measured
  - sha256_measured
  - governance_concept_present
  - casa_boot_executes
  - inventory_generated
failure_signature: "HERMES_PROFILE_CANONICAL_RECONCILIATION_GOLD_STANDARD_v1"
remediation_escalation: "verify_concept > fix_delta > regenerate_inventory > nuclear_reclone"
provenance:
  sources:
    - "skills/hermes-profile-canonical-reconciliation/SKILL.md|sha256:dbea9ac4bad68f7bca3049ed331b5a2389805a8c82509499d225336459382f29"
    - "scripts/casa_boot.py|sha256:3955df49a860af3ac6c9ef4751ad3521378e7edfcc6fe22bd1836252ca3a0616"
    - "scripts/absorver_pasta_trancada.py|sha256:1c23057cf8eb1aeaf96c9125eeb5d006aee054d80193f46eff4559b6188e41cb"
  tests:
    - "uv run --no-project python scripts/casa_boot.py|sha256:1e619d9f1fe83d5c21fb052c4e6460ed222a198e68c92f6e59dc0e93ae77932b"
    - "uv run --no-project python scripts/absorver_pasta_trancada.py --dry-run|sha256:3b67201272d50b2eab1ec1a1b124b64240dc6589e85c59c96c3ebbfb88ec3892"
  receipts:
    - "centraldark.runtime.receipt.v1|sha256:8474e6cdc35b0433d74808d8783989bf7070d19e77cd629eea1c5d6175d64870"
    - "RECONCILE_FIXED_POINT validation|sha256:PENDING_GENERATION"
counterproof: "Clean execution of casa_boot.py returns status=OK with no drift"
fixed_point_contribution: "Resolves phase denominators: governance, delta_method, history_preservation, source_of_truth, adapter_contract"
mantra: "MINERAR UMA VEZ, CRISTALIZAR UMA VEZ, REUTILIZAR N VEZES. NUNCA ASSUMIR: DECLARED=INSTALLED, LOCKED=INSTALLED, INSTALLED=WORKING, BUILD_STARTED=BUILD_PASS. PERFIL=ADAPTADOR NUNCA CÓPIA. MEASURE→DIAGNOSE→MINIMAL→RETEST→COUNTERPROOF→RECEIPT."
---

# Hermes Profile → Canonical SOUL Reconciliation — Gold Standard

## Three Planes

| Plane | Content |
|-------|---------|
| KNOWLEDGE | failure_signatures, compat_matrix, remediation_procedures, local-first retrieval (crystals) |
| EXECUTION | runtime measurement, Reality Judge validation, ecosystem-specific post-conditions |
| CONFIG ORIGIN | config source tracking (project/user/global/env), fix at right layer |

## Three Dimensions

| Dimension | Definition | Reopen Trigger |
|-----------|------------|----------------|
| DEPENDÊNCIA | What runtime/project requires | manifest/lockfile change, skill manifest update |
| DECADÊNCIA | Knowledge/compat became stale | version change, test failure, source change, counterproof failure |
| CADÊNCIA | When to revalidate | event-driven: profile_bootstrap, drift_detected, daily_review, mission_sync, counterproof_failure |

## Core Loop (mandatory)

```text
INTENT
  → DETECT ECOSYSTEM (hermes profile + centraldark clone)
  → READ MANIFEST + LOCKFILE (SOUL-SOL.md canonical + profile SOUL.md)
  → MEASURE INSTALLED STATE (physical: mtime + sha256 of both)
  → CONSULT LOCAL KNOWLEDGE (crystals: governance concepts, adapter contract)
  → COMPARE EXPECTED × ACTUAL (concept presence, not literal match)
  → DIAGNOSE (discriminant: OK | DRIFT | UNKNOWN)
  → MINIMAL REMEDIATION (fix delta in profile, never copy canonical)
  → RETEST (casa_boot.py → status=OK)
  → COUNTERPROOF (clean execution without flags)
  → RECEIPT + CRYSTALLIZE (INVENTARIO.json for locked folders)
  → LEARN (update knowledge plane)
```

## Princípio Central (Non-Negotiable)

**PERFIL = ADAPTADOR / BOOTLOADER, nunca cópia da SOUL canônica.**

```text
SOUL-SOL.md (canônico, edição do SEGREDO/CHEFE)
   ↓
CANONICAL BOOT (LEIA-ME-IA → AGENTS → SOUL-SOL)
   ↓
SOL = coordenação quando presente
   ↓
HERMES PROFILE = adaptação ao runtime (APONTA pro canônico)
   ↓
HERMES-CASA = execução
```

Não copiar o corpo da SOUL-SOL para dentro do perfil. Copiar cria DRIFT silencioso:
se o canônico muda, o perfil fica com cópia velha e o próximo #ACORDAR não percebe.

## Passos (Reconcile)

1. **Localizar** SOUL canônica LOCAL (clone CentralDark) e SOUL do perfil (AppData `profiles/<p>/SOUL.md`).
2. **Medir** `mtime` + `sha256` de ambos.
3. **Checar PRESENÇA DE CONCEITO** de governança no perfil — NÃO linha literal do canônico.
   - Linguagem própria do perfil é CORRETA, não DRIFT:
     `SINGLE_WRITER_PER_SCOPE=ENFORCED` ≠ `ONE_WRITER_PER_SCOPE=true` → OK.
   - DRIFT real só se o perfil OMITIR o conceito (ex: faltar `MENOS_E_MAIS`).
4. **Harness** `scripts/casa_boot.py` imprime `status`: `OK` | `DRIFT` | `UNKNOWN`.
5. **Em DRIFT**, corrigir o delta conflitante no perfil (referência + âncora), nunca colar canônico.
6. **Para pasta externa**: inventário read-only (sha256, `git ls-files` dedupe) ANTES de extrair.

## Passos (Inventory de Pasta Trancada)

1. **Listar** arquivos (ZIPs etc.) da pasta — SEM extrair.
2. **Medir** `sha256` + tamanho + mtime de cada.
3. **Dedupe** contra o repo via `git -C <repo> ls-files` (por nome normalizado).
4. **Marcar** `DONO_CANONICO_UNKNOWN` pros itens que não existem no repo.
5. **Gerar** `INVENTARIO.json` na própria pasta. Fase 2 (extração/absorção) é R2/R3 e
   exige comando explícito + `WRITER` único + prova de gap — NÃO assumir.

## Cross-Model Persistence Lock (obrigatório para profile pivete)

Para que NENHUM modelo consiga perder a identidade Hermes-CASA ao trocar de engine
(grok→tencent, etc), o SOUL do perfil deve estar GRAVADO em disco e TRAVADO:

1. **Detectar SOUL genérico**: se `profiles/<p>/SOUL.md` tem ~513 bytes em inglês
   (conteúdo default Nous "You are Hermes Agent..."), é DRIFT — qualquer modelo novo
   perde a identidade Hermes-CASA ao entrar no perfil.
2. **Escrever SOUL adaptador** (Hermes-CASA, NÃO cópia de SOUL-SOL) em `profiles/<p>/SOUL.md`.
3. **Travar no profile.yaml**: adicionar bloco
   ```yaml
   soul:
     file: "SOUL.md"
     role: "HERMES-CASA"
     authority_final: "SEGREDO/CHEFE"
     locked: true
     canonical_ref: "<caminho SOUL-SOL.md>"
     porta_universal: "<caminho LEIA-ME-IA.md>"
   ```
4. **Provar no disco**: `wc -l` + `sha256sum` (Windows: `certutil -hashfile SOUL.md SHA256`).
5. **Efeito**: qualquer modelo que carregue o perfil herda o SOUL; `locked: true` impede
   autoalteração por modelo. Só SEGREDO/CHEFE edita o arquivo.

Isso resolve parcialmente o denominador `profile_loaded_not_verified_at_boot`:
o SOUL vem do disco, não do system prompt da sessão. O CHEFE confirmou explicitamente
("TRAVA ISSO EM TODO LUGAR ONDE NEM UM MODELO CONSEGUE MUDAR") — trava é intenção dele.

**ANEXO F — HERMES_DIALECT_CONTRACT (parte do SOUL travado):** o profile SOUL
agora carrega `ANEXO F` com o contrato de dialeto do CHEFE (baianês como camada de
comunicação, NÃO persona/papagaio; filtro de ouro antes de responder; cada frase deve
acrescentar informação/causalidade/evidência/próximo passo ou DROP). Esse anexo é
CONTEÚDO DO SOUL e deve SOBREVIVER a qualquer reconcile — nunca removê-lo ao "corrigir drift".
Condensado em `references/dialect-contract-pivete.md`.

## Preflight Obrigatório (before any reconcile)

```bash
CANONICAL_SOUL_PRESENT     # SOUL-SOL.md exists in CentralDark clone
PROFILE_SOUL_PRESENT       # SOUL.md exists in Hermes profile
MTIME_MEASURED             # stat on both files
SHA256_MEASURED            # hash on both files
GOVERNANCE_CONCEPT_CHECK   # concept presence in profile (not literal)
CASA_BOOT_EXECUTES         # uv run --no-project python scripts/casa_boot.py
INVENTORY_READY            # absorver_pasta_trancada.py --dry-run succeeds
```

**NUNCA ASSUMIR:** DECLARED=INSTALLED, LOCKED=INSTALLED, INSTALLED=WORKING, BUILD_STARTED=BUILD_PASS

## Knowledge Lookup (local first - enforced)

```text
1. Search local crystals by failure_signature
2. Verify crystal validity (version, tests, provenance)
3. Apply compatible knowledge
4. Measure runtime

EXTERNAL SEARCH ONLY IF:
  - MISSING_KNOWLEDGE
  - VERSION_CHANGED
  - CRYSTAL_STALE
  - NEW_FAILURE
  - COUNTERPROOF_FAILED
  - SECURITY_ADVISORY
  - OFFICIAL_BEHAVIOR_CHANGED

SOURCE PRIORITY:
  1. Official docs / registry metadata
  2. Official repo / spec
  3. Only then secondary sources
```

## Crystallization Format (every skill produces this)

```yaml
failure_signature: HERMES_PROFILE_CANONICAL_RECONCILIATION_GOLD_STANDARD_v1
ecosystem: hermes
knowledge:
  source_type: official
  source_version: "hermes-profile-canonical-reconciliation@1.0"
  last_verified: "2026-08-25T00:00:00Z"
  stale_after: "version_change|test_failure|source_change|counterproof_failure"
compatibility:
  runtime: [">=python3.11"]
  package_manager: ["uv"]
  peers: ["centraldark-operational-method", "auto-destilador"]
  plugins: []
runtime_checks:
  - canonical_soul_present
  - profile_soul_present
  - mtime_measured
  - sha256_measured
  - governance_concept_present
  - casa_boot_executes
  - inventory_generated
known_failures:
  - signature: PYTHON_NOT_IN_PATH_UV_PRESENT
    candidates: ["uv run --no-project python script.py"]
  - signature: OS_WALK_TIMEOUT_ON_CENTRALDARK_CLONE
    candidates: ["git -C <repo> ls-files for dedupe", "exclude .cache.zip, node_modules, BACKUPS"]
  - signature: ASSUMED_TRANSPORT_BETWEEN_SURFACES
    candidates: ["require causal channel proof + WRITER unique", "mark UNKNOWN not PASS"]
  - signature: REASKING_AUTHORIZATION_WHEN_GIVEN
    candidates: ["execute with certainty + evidence", "stop only on material blocker"]
  - signature: EMOJI_LOCKED_FOLDER_PATH
    candidates: ["find exact name before hardcoding", "os.path.isdir works but verify"]
remediation:
  first: verify_concept_presence
  destructive_last_resort: true
provenance:
  sources:
    - "skills/hermes-profile-canonical-reconciliation/SKILL.md|sha256:dbea9ac4bad68f7bca3049ed331b5a2389805a8c82509499d225336459382f29"
    - "scripts/casa_boot.py|sha256:3955df49a860af3ac6c9ef4751ad3521378e7edfcc6fe22bd1836252ca3a0616"
    - "scripts/absorver_pasta_trancada.py|sha256:1c23057cf8eb1aeaf96c9125eeb5d006aee054d80193f46eff4559b6188e41cb"
  tests:
    - "uv run --no-project python scripts/casa_boot.py|sha256:1e619d9f1fe83d5c21fb052c4e6460ed222a198e68c92f6e59dc0e93ae77932b"
    - "uv run --no-project python scripts/absorver_pasta_trancada.py --dry-run|sha256:3b67201272d50b2eab1ec1a1b124b64240dc6589e85c59c96c3ebbfb88ec3892"
  receipts:
    - "centraldark.runtime.receipt.v1|sha256:8474e6cdc35b0433d74808d8783989bf7070d19e77cd629eea1c5d6175d64870"
    - "RECONCILE_FIXED_POINT validation|sha256:PENDING_GENERATION"
```

## Minimal Remediation Escada (fixed order)

```text
1. VERIFY CONCEPT PRESENCE — check governance concepts exist in profile (no config mutation)
2. FIX DELTA IN PROFILE — anchor reference to canonical, use profile's own language
3. REGENERATE INVENTORY — re-run absorver_pasta_trancada.py for locked folders
4. NUCLEAR RECLONE — ONLY with proven cause + rollback (reclone CentralDark, re-bootstrap profile)
```

## Reality Judge (ecosystem-specific post-conditions)

| Ecosystem | Post-Conditions |
|-----------|-----------------|
| hermes | `uv run --no-project python scripts/casa_boot.py` → `{"status": "OK"}` && `uv run --no-project python scripts/absorver_pasta_trancada.py --dry-run` succeeds |

## Config Origin Tracking (enforced)

```bash
hermes config get key --profile=pivete
# Fix at most specific layer that introduced the issue
```

## Vista SOL Health Panel (every skill contributes)

```text
DEPENDENCY HEALTH
├── KNOWN       ✅ cristal reutilizável disponível
├── STALE       ⚠️ versão/source mudou
├── MISSING     ❌ sem cristal
├── BROKEN      ❌ cristal falhou no retest
├── CONFLICT    ⚠️ múltiplos cristais discordam
└── UNKNOWN     🔍 precisa diagnóstico
```

## Auto-Review Engine (runs on every skill change)

```text
VALIDATE_SKILL(skill):
  1. description ≤60 chars, trigger-first, ends with period
  2. trigger explicit and specific
  3. phases follow MEASURE→DIAGNOSE→MINIMAL→RETEST→COUNTERPROOF→RECEIPT
  4. runtime_checks executable and ecosystem-specific
  5. failure_signature unique and crystallizable
  6. remediation_escalation follows fixed order
  7. provenance has sources+tests+receipts with SHA256
  8. counterproof defined (clean execution without flags)
  9. fixed_point_contribution maps to phase denominators
  10. three planes present (knowledge, execution, config_origin)
  11. three dimensions defined (dependência, decadência, cadência)
  12. mantra present

IF ANY FAIL:
  → AUTO_FIX if deterministic (format, missing section)
  → FLAG FOR HUMAN if judgment needed
  → BLOCK COMMIT if critical (no trigger, no post-conditions)
```

## Fixed Point Predicate (for skill itself)

```text
SKILL_FIXED_POINT TRUE IFF:
  1. objective_closed (skill complete per gold standard)
  2. counterproof_survived (skill validates against known failures)
  3. applicable_invariants_hold (three planes, three dimensions, core loop)
  4. no_material_unknown (all sections filled)
  5. no_new_material_failure (validates against dogfood)
  6. no_new_information (stable)
  7. no_candidate_beats_baseline (gold standard is baseline)
  8. regression_denominator_passed (all skill validations pass)
```

## Continuous Review (auto-scheduled)

```text
SCHEDULE:
  - On skill create/update: immediate validation
  - Daily: review all skills for STALE/DECADÊNCIA
  - On mission bootstrap: full skill inventory validation
  - On counterproof failure: re-crystallize affected skills

AUTO_ACTIONS:
  - Format fixes → apply silently
  - Missing sections → generate from template
  - Stale crystals → flag for revalidation
  - Duplicate signatures → merge/consolidate
  - Missing provenance → flag for human
```

## Pitfalls (Crystallized from Battle Scars)

| Pitfall | Signature | Remediation |
|---------|-----------|-------------|
| Python fora do PATH no Windows, mas `uv` presente | PYTHON_NOT_IN_PATH_UV_PRESENT | Rode `uv run --no-project python script.py`. Não procure `python.exe`. |
| `os.walk` sobre clone CentralDark TRAVA (180s timeout) por causa de `.cache.zip` (1.5gb), `node_modules`, `BACKUPS` | OS_WALK_TIMEOUT_ON_CENTRALDARK_CLONE | Use `git -C <repo> ls-files` para dedupe por nome — O(1) barato. |
| Não assumir transporte entre superfícies (ex: VS Code Mistral Vibe → Hermes) | ASSUMED_TRANSPORT_BETWEEN_SURFACES | Sem canal causal provado + `WRITER` único, a passagem é `UNKNOWN`, não `PASS`. |
| Autorização já dada + certeza + evidência = NÃO re-perguntar | REASKING_AUTHORIZATION_WHEN_GIVEN | O CHEFE corrigiu: "se voce tem certeza e so faazer permito segredo!". Execute; pare só em bloqueio material real. |
| Caminho de pasta com emoji/cadeado (ex: `🔒PASTA TRANCADA APELO CHEFE🔒`) | EMOJI_LOCKED_FOLDER_PATH | `os.path.isdir` funciona, mas confirme o nome exato com `find` antes de hardcodar. |
| `casa_boot.py` roda on-demand mas não há prova de execução no bootstrap da sessão | PROFILE_LOADED_NOT_VERIFIED_AT_BOOT | Hook de boot no Hermes Desktop que execute `casa_boot.py` e valide `status=OK` antes de liberar agente |
| `config.yaml` do profile declara model/provider X; runtime resolve Y sem rastreio | MODEL_BINDING_DRIFT_CONFIG_VS_RUNTIME | Log estruturado no `agent.log` com `resolved_model`, `resolved_provider`, `fallback_chain`; skill `provider-swap` pode monitorar |
| Session info retorna `system_prompt: ""` — SOUL não injetada no prompt do modelo | SYSTEM_PROMPT_EMPTY_AT_BOOT | Verificar `system_prompt` building no Hermes Desktop; garantir que profile SOUL seja injetada se `profile_name == "pivete"` |
| Arquivos no disco ≠ consumo em memória do processo vivo | ASSUMED_TRANSPORT_BOOT_TO_RUNTIME | Exigir evidência de processo: PID, argv, env var `HERMES_PROFILE=pivete`, ou log de `casa_boot.py` com timestamp de boot |
| SOUL genérico (~513B inglês "You are Hermes Agent") no `profiles/<p>/SOUL.md` → modelo novo perde identidade Hermes-CASA ao trocar engine | GENERIC_SOUL_DEFAULT_MODEL_SWAP_LOSS | Escrever SOUL adaptador Hermes-CASA em `profiles/<p>/SOUL.md` (não cópia de SOUL-SOL) + bloco `soul: locked:true` no `profile.yaml`. Provar com `wc -l` + `sha256sum`. |
| Bot Telegram / Guardião na VPS são processos SEPARADOS do Hermes local — não herdam o SOUL do perfil automaticamente | VPS_BOT_NOT_BOUND_TO_PROFILE_SOUL | O `unified-bot.cjs` / `guardiao.py` precisam ler LEIA-ME-IA+SOUL no boot próprio; `hermes status` mostra Telegram `✗ not configured` no Hermes local mesmo com Gateway `✓ running`. Não confundir as duas instâncias. |
| Trava de segurança VPS aparenta defasada mas código ainda a impõe; remover só a trava não destrava | VPS_SECURITY_TRava_STALE_CODE_MISMATCH | Antes de remover/destravar: (1) `git log` do arquivo → AUTOR + DATA; (2) ler o doc-regra — pode já estar `HISTORICAL_DECISION`/aposentado enquanto o PM2/ecosystem ainda trava; (3) VERIFICAR SE O MODO ALVO FOI IMPLEMENTADO no código. Caso real: `guardiao.py` só tem lógica `propor`; `auto` NUNCA foi implementado (linha ~81 força propor). Remover a trava sozinha = no-op + confusão. O CHEFE corrigiu explicitamente: "VERIFICA ANTES PRA NAO ESTRAGA VEJA E SE E INTENCIONAL". Sempre confirmar intenção do CHEFE antes de mexer em VPS (R4). |
| Ao citar arquivo/pasta, não dar caminho clicável | CLICKABLE_PATH_LINKS | O CHEFE mandou: "KD O LINK QUANDO FOR FALAR DE ALGO TEM QUE TERO LINK PRA EU ABRI". Sempre emitir o caminho absoluto completo (ex: `E:\CentralDark\Pivete\profiles\pivete\SOUL.md`) como texto — não só o nome do arquivo. Vale em qualquer resposta que aponte algo no disco. |
| Em conversa casual, responder com tabela/receipt estruturado | OVER_FORMATTED_CHAT | O CHEFE reagiu ("vc mudo seu jeito pq?") quando o agente soltou tabela de receipt no meio de papo. ANEXO F do SOUL manda baianês como camada de comunicação, NÃO quadro estruturado em conversa. Tabela/receipt só em manifesto técnico ou quando ele pede prova estruturada. Caso contrário: baianês natural, direto, sem mesa de PDF. |
| Agir/mutar antes de entender a intenção do CHEFE | ACT_BEFORE_INTENT | Ordem recorrente do CHEFE: "entende a intenção primeiro depois faz", "não faz nada vc primeiro entende a intenção". Ler imagem/comando, medir READ_ONLY, só depois propor/mutar. Imagem anexada = gatilho pra medição ao vivo, não pra disparar ação. |
| Não absorver o estilo de fala do CHEFE sem que ele peça toda vez | STYLE_LEARN_AUTONOMOUS | CHEFE: "as coisa que eu falo tu aprende? tipo o meu jeito de fala algumas cosa tu salva? sozinho?" → salvar estilo (baianês, direto, sem firula, prova primeiro) em SOUL/memória SEM lembrete por mensagem. Não perguntar "devo salvar?" toda vez. |
| `cd E:\\CentralDark\\X` falha em bash; pasta `_RECONCILIATION` existe mas `CentralDark_RECONCILIATION` não | WINDOWS_PATH_GOTCHA_CD | Usar barras `/` (`cd E:/CentralDark/_RECONCILIATION`); prefixo é underline, não nome composto. `find`/os.walk grande no clone trava (180s) — usar `ls` direto de subpasta conhecida ou `git -C <repo> ls-files`. |
| "permito" do CHEFE autoriza ação pontual, mas NÃO reescreve lei canônica já registrada | PERMITO_DONT_OVERRIDE_CANON | Lei da Casa (ex: "Nunca pm2 restart all" no MCP CentralDark + skill centraldark-esteira-motor) vigora mesmo com "permito". Se valesse sempre, a regra seria letra morta. Bloquear o comando, apontar a lei, não desobedecer. Mudar a lei = PR no contrato, não grito pontual. |
| Skill/Gatilho existe no COFRE (`E:/CentralDark/_RECONCILIATION/OURO/...`) mas NÃO na `main` do repo | COFRE_SKILL_NOT_IN_MAIN | Não promover cego: medir se já tem dono canônico na main antes de criar/empurrar. Ex: `casa-github-sync` tava no cofre, `tecnicadalupa` duplicava `meta-lupa` (grep provou). REUSE_BEFORE_CREATE vigente. |
| MCP `mcp.centralldark.com` = 502 → VPS inalcançável da sessão Casa; só o braço que tá lá (Claude) opera | MCP_502_VPS_UNREACHABLE | Sem SSH/MCP daqui, VPS = UNKNOWN. Não fingir execução (`ACTION != PROOF`). Router CentralDark local responde em `127.0.0.1:8099/v1/chat/completions` com `model` no payload (ex: `nous/tencent/hy3:free`). Ver `references/router-vps-access.md`. |
| `curl -X POST ... -d '{"json"}'` inline com aspas dá 501/erro no Git Bash (quoting) | CURL_INLINE_JSON_QUOTING | Usar arquivo: `curl -X POST url -H "Content-Type: application/json" -d @req.json`. Confirmado em 8099: com arquivo funciona de primeira, inline falha. |
| Local `verify_repo_contract.py` PASS não prova CI remoto PASS (checkout local divergiu de `origin/main`) | LOCAL_REPO_CONTRACT_PASS_NOT_REMOTE_PROOF | Runner faz checkout de `origin/main` (fetch-depth:0); branch local pode NÃO ter arquivos que existem no remoto (ex: workflows VPS com `ubuntu-latest`). Antes de concluir base verde/vermelha, conferir `git ls-tree origin/main --name-only .github/workflows/` e `git cat-file -e origin/main:<path>`. Só o runner enxerga o que a CI valida — `ls` local ausente ≠ arquivo ausente no remoto. |
| Re-run local contraditório virou o veredito anterior (falso-verde de medição) | FALSE_GREEN_VERDICT_FLIP_LOOP | Ao re-medir e ver resultado oposto ao derivado de remoto, NÃO declarar diagnóstico anterior "inválido" na hora. Re-medir estado remoto (`git ls-tree origin/main`, `gh run view <id> --log`) antes de virar o veredito. Runner self-hosted é fonte de verdade p/ gates de CI, não o checkout local. Ver receita em `references/repo-contract-local-remote-mismatch.md`. |

## Scripts (scripts/)

- `scripts/casa_boot.py` — harness de reconcile perfil↔canônico (OK|DRIFT|UNKNOWN). Nunca edita o canônico.
- `scripts/absorver_pasta_trancada.py` — inventário read-only de pasta trancada (sha256, `git ls-files` dedupe, sem extrair).

## References (references/)

- `references/gold-standard-patching.md` — 12-criteria checklist, provenance SHA256 format, mantra template, description template for gold standard patching.
- `references/runtime-verification-2026-08-25.md` — Evidência completa de verificação de runtime: sessão Hermes Desktop profile `pivete`, execução `casa_boot.py`, logs `desktop.log`/`agent.log`/`gateway_state.json`, gaps residuais (boot execution, system_prompt, model binding drift), 4 novos failure signatures.
- `references/vps-guardiao-trava-investigation.md` — Investigação 2026-08-27: trava GUARDIAO_MODO=propor na VPS, doc aposentado mas código não seguiu, modo 'auto' nunca implementado; fluxo de verificar intenção antes de destravar (R4).
- `references/dialect-contract-pivete.md` — ANEXO F do SOUL perfil pivete: HERMES_DIALECT_CONTRACT (baianês=camada, não persona; filtro de ouro; PAPAGAIO_OFF). Cristalizado de correção direta do CHEFE sobre verbosidade/estilo.
- `references/router-vps-access.md` — Router CentralDark local (8099 chat, 8199 health), MCP 502 = VPS inalcançável da Casa, "permito" não reescreve lei, curl inline JSON quebra → usar `-d @arquivo`. Sessão 2026-08-27.
- `references/repo-contract-local-remote-mismatch.md` — Por que `verify_repo_contract.py` dá PASS local mas FAIL no runner; receita de verificação contra `origin/main` e disciplina de veredito. Sessão 2026-08-27. |

## Verificação

Após editar o perfil:
```bash
uv run --no-project python scripts/casa_boot.py
# esperado: "status": "OK"
```

Para pasta trancada:
```bash
uv run --no-project python scripts/absorver_pasta_trancada.py --dry-run
# gera INVENTARIO.json sem extrair
```

---

**Cristalizado pelo HERMES-CASA sob autoridade do CHEFE/SEGREDO.**  
**Ouro registrado. Catraca girando.**