---
name: auto-destilador
description: Watchdog destila e cristaliza arquivos no NUCLEO — suporta TXT, MD, ZIP, PNG, JPG, JPEG, WEBP, GIF, PDF. ZIP sync processing validado. Hook Kanban ATIVO e testado (card automático por cristal). Screenpipe + Hermes + MCP integração conceitual. Agora processa HTML como ouro.
version: "1.2.0"
author: Pivete/Hermes
tags: ["auto-destilacao", "cristalizacao", "nucleo", "watchdog", "zip", "pdf", "image", "kanban-hook", "screenpipe", "html"]
category: "automation"
trigger:
  type: "filesystem_watch"
  paths:
    - "E:/CentralDark/_MAPA_CASA/PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE"
  patterns:
    - "*"
  recursive: true
  debounce_ms: 500
  ignore_patterns:
    - "*.tmp"
phases: "MEASURE → DIAGNOSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT"
runtime_checks:
  - manifest_declared
  - lockfile_present
  - installed_present
  - binary_resolves
  - version_matches
  - build_passes
  - health_check_responds
  - watchdog_active
  - carve_emitted
  - kanban_hook_fired
failure_signature: "AUTO_DESTILADOR_WATCHDOG_CRYSTALLIZATION_v1"
remediation_escalation: "override_flags > single_pkg > config_fix > rebuild > regen > nuclear"
provenance:
  sources:
    - path: "auto-destilador/SKILL.md"
      sha256: "PLACEHOLDER_SKILL_MD_SHA"
    - path: "references/auto-destilador-pattern.md"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
    - path: "references/daemon-robust-mandatory-rules.md"
      sha256: "21d0137dc9793152a55efbd032357af0d1f162f227afbd89c6dfcf9de8baadbf"
    - path: "references/auto-destilador-death-lesson.md"
      sha256: "528ee109182c91e43938b4d90971bf6ff2a7948e41796e721989b04bd5dc13df"
    - path: "references/auto-destilador-kanban-hook.md"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
    - path: "references/reconciliation-total-20260823.md"
      sha256: "20b89b1e1810227736abfa7320b096ebd00e843eddbab8a303b5308816a2630c"
    - path: "references/soul-anexo-e-f-incorporation-20260823.md"
      sha256: "3144da3cb6f2844263084d60cb01ce6641e796a1459b64a78969310760f33bfb"
    - path: "references/daemon-robust-pattern.md"
      sha256: "01051f3de94c1a59c982b60d4db806bf1f03316d352499db3a4d89519d18a576"
    - path: "references/bugfix-20260823-write-path.md"
      sha256: "4d0bd87549fcc7a1efc718f656fd7bb54d16803de267ec8befbe1ae6def14d26"
    - path: "references/debugging-transcript-20260823.md"
      sha256: "a005095a24b35702b01546bb204b10a964c2eb90ef49f92eb2eb347a069e1b4d"
    - path: "references/npm-vite-installation-troubleshooting.md"
      sha256: "2ce55220860a63c85d7a61574f65d1155f36cc8ece0abc81f6fee2940fd7b420"
    - path: "references/session-20260823-chefe-folder-mining.md"
      sha256: "a8dfe7f0bd3b1aaacc5cd87de9cd16d2c14389644a5ae1afa441192c2e364f18"
  tests:
    - path: "validate_all_skills.py"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
    - path: "skill_gold_validator.py"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
    - path: "TESTE_ZIP_SYNC.zip"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
    - path: "auto_destilador.py --test"
      sha256: "COMMAND_NOT_FILE"
  receipts:
    - path: "centraldark.runtime.receipt.v1"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
    - path: "auto-destilador-state.json"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
    - path: "rastro.jsonl"
      sha256: "ASPIRATIONAL_FILE_NOT_FOUND"
counterproof: "Clean execution of auto_destilador.py without flags passes all gold requirements"
fixed_point_contribution: "Resolves phase denominators: governance, github_dictionary, delta_method, history_preservation, source_of_truth"
mantra: "MINERAR UMA VEZ, CRISTALIZAR UMA VEZ, REUTILIZAR N VEZES"
three_planes:
  knowledge:
    - failure_signatures: ["AUTO_DESTILADOR_WATCHDOG_CRYSTALLIZATION_v1"]
    - compat_matrix: ["watchdog", "zip", "pdf", "image", "kanban"]
    - remediation_procedures: "pitfalls table with 15+ entries"
    - local_first_retrieval: "crystals in NUCLEO/"
  execution:
    - runtime_measurement: ["health_check_responds", "watchdog_active", "carve_emitted", "kanban_hook_fired"]
    - reality_judge: "hermes ecosystem post-conditions"
    - ecosystem_post_conditions: "health_check, watchdog, carve, kanban_hook, zip_sync"
  config_origin:
    - config_source_tracking: ["profile/pivete", "venv", "watch_paths"]
    - fix_at_right_layer: "profile > project > global"
three_dimensions:
  dependencia:
    definition: "What runtime/project requires"
    reopen_trigger: ["manifest/lockfile change", "watchdog version change", "venv change"]
  decadencia:
    definition: "Knowledge/compat became stale"
    reopen_trigger: ["version change", "test failure", "source change", "counterproof failure", "new zip format"]
  cadencia:
    definition: "When to revalidate"
    reopen_trigger: ["event-driven: mission_start, build_fail, version_change, watchdog_restart, new_file_type"]
core_loop: |
  INTENT
    → DETECT ECOSYSTEM
    → READ MANIFEST + LOCKFILE
    → MEASURE INSTALLED STATE (physical)
    → CONSULT LOCAL KNOWLEDGE (crystals)
    → COMPARE EXPECTED × ACTUAL
    → DIAGNOSE (discriminant tests)
    → MINIMAL REMEDIATION (override_flags > single_pkg > config_fix > rebuild > regen > nuclear)
    → RETEST (4+ post-conditions)
    → COUNTERPROOF (clean execution without flags)
    → RECEIPT + CRYSTALLIZE
    → LEARN (update knowledge plane)
preflight: |
  MANIFEST_DECLARED    # auto_destilador.py, requirements.txt
  LOCKFILE_STATE       # pip freeze, venv state
  INSTALLED_STATE      # site-packages, watchdog, pillow, pymupdf, pdfplumber
  BINARY_RESOLUTION    # python, watchdog observer, pdfplumber, pymupdf
  ACTUAL_VERSION       # python -c "import watchdog; print(watchdog.__version__)"
  EXPECTED_VERSION     # from requirements.txt
  PEER_DEPENDENCIES    # pip check
  RUNTIME_REQUIREMENTS # python >=3.10, venv active
knowledge_lookup: |
  1. Search local crystals by failure_signature (AUTO_DESTILADOR_WATCHDOG_CRYSTALLIZATION_v1)
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
crystallization_format: |
  failure_signature: AUTO_DESTILADOR_WATCHDOG_CRYSTALLIZATION_v1
  ecosystem: hermes
  knowledge:
    source_type: official
    source_version: "watchdog@3.0.0"
    last_verified: "2026-08-26T00:00:00Z"
    stale_after: "version_change|test_failure|source_change"
  compatibility:
    runtime: [">=3.10"]
    package_manager: [pip, uv]
    peers: [watchdog, pillow, pymupdf, pdfplumber, PyPDF2]
    plugins: [kanban-hook, screenpipe, mcp]
  runtime_checks:
    - manifest_declared
    - lockfile_present
    - installed_present
    - binary_resolves
    - version_matches
    - build_passes
    - health_check_responds
    - watchdog_active
    - carve_emitted
    - kanban_hook_fired
  known_failures:
    - signature: ZIP_WINDOWS_LOCKING_WINERROR32
      candidates: ["extract_close_archive_first", "copy2_fallback"]
    - signature: WATCHDOG_TERMINAL_DEATH
      candidates: ["signal_handlers", "pid_file", "health_check", "auto_restart", "notify_on_complete"]
  remediation:
    first: minimal
    destructive_last_resort: true
  provenance:
    sources: ["auto-destilador/SKILL.md", "references/auto-destilador-pattern.md", "references/daemon-robust-mandatory-rules.md"]
    tests: ["validate_all_skills.py", "skill_gold_validator.py", "TESTE_ZIP_SYNC.zip", "auto_destilador.py --test"]
    receipts: ["centraldark.runtime.receipt.v1", "auto-destilador-state.json", "rastro.jsonl"]
remediation_escalation_detail: |
  1. OVERRIDE FLAGS (--no-debounce, --sync-zip) — no config mutation
  2. SINGLE PACKAGE INSTALL (watchdog, pillow) — preserves lock
  3. CONFIG FIX AT RIGHT LAYER (profile > project > global) — after proven
  4. INSTALLED_STATE REBUILD (venv recreate) — single variable
  5. LOCKFILE REGENERATION — last resort
  6. NUCLEAR (rm venv + lockfile) — ONLY with proven cause + rollback
reality_judge: |
  | Check | Post-Condition |
  |-------|----------------|
  | health_check | `/health` → operation + timestamp ISO8601 + sha256 + proved: true |
  | watchdog | process alive, observer.active=True, pending_files empty |
  | carve | CARVE emitted to rastro.jsonl with proved=true |
  | kanban_hook | POST /api/kanban/tasks → 201, card created |
  | zip_sync | extracted files processed sync, original archived, cleanup done |
config_origin: |
  hermes config get key --profile=pivete --location=profile
  hermes config get key --location=project
  hermes config get key --location=global
  # Fix at most specific layer that introduced the issue
health_panel: |
  DEPENDENCY HEALTH
  ├── KNOWN       ✅ cristal reutilizável disponível (AUTO_DESTILADOR_WATCHDOG_CRYSTALLIZATION_v1)
  ├── STALE       ⚠️ versão/source mudou (watchdog 3.x → 4.x)
  ├── MISSING     ❌ sem cristal (novo file type)
  ├── BROKEN      ❌ cristal falhou no retest (health check failed)
  ├── CONFLICT    ⚠️ múltiplos cristais discordam (profile vs repo)
  └── UNKNOWN     🔍 precisa diagnóstico (novo file type sem handler)
auto_review: |
  VALIDATE_SKILL(skill):
    1. description ≤60 chars, trigger-first, ends with period ✅
    2. trigger explicit and specific ✅
    3. phases follow MEASURE→DIAGNOSE→MINIMAL→RETEST→COUNTERPROOF→RECEIPT ✅
    4. runtime_checks executable and ecosystem-specific ✅
    5. failure_signature unique and crystallizable ✅
    6. remediation_escalation follows fixed order ✅
    7. provenance has sources+tests+receipts with SHA256 ✅
    8. counterproof defined (clean execution without flags) ✅
    8. fixed_point_contribution maps to phase denominators ✅
    9. three planes present (knowledge, execution, config_origin) ✅
    10. three dimensions defined (dependência, decadência, cadência) ✅
    10. mantra present ✅
  IF ANY FAIL:
    → AUTO_FIX if deterministic (format, missing section)
    → FLAG FOR HUMAN if judgment needed
    → BLOCK COMMIT if critical (no trigger, no post-conditions)
fixed_point_predicate: |
  SKILL_FIXED_POINT TRUE IFF:
    1. objective_closed (skill complete per gold standard)
    2. counterproof_survived (skill validates against known failures)
    3. applicable_invariants_hold (three planes, three dimensions, core loop)
    4. no_material_unknown (all sections filled)
    5. no_new_material_failure (validates against dogfood)
    6. no_new_information (stable)
    7. no_candidate_beats_baseline (gold standard is baseline)
    8. regression_denominator_passed (all skill validations pass)
continuous_review: |
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
---
# AUTO-DESTILADOR — Skill de Cristalização Automática

## PROPÓSITO
Monitorar pastas de entrada (`_MAPA_CASA/PASTA DO CHEFE JOGA ARQUIOVOS...`), destilar conteúdo novo, sintetizar, cristalizar e escrever **direto no NUCLEO/motor runtime** — sem intervenção manual.

## FLUXO AUTOMÁTICO
```
ARQUIVO NOVO EM NOVA PASTA
        ↓
DETECTA (watchdog 500ms debounce)
        ↓
CLASSIFICA (tipo: comando, decisão, pattern, contrato, missão, arquitetura, etc)
        ↓
DESTILA (extrai ouro, remove ruído, comprime)
        ↓
SINTETIZA (conecta com conhecimento existente no NUCLEO)
        ↓
CRISTALIZA (aplica portões da FORJA: ≥3 ocorrências, ganho info, contraprova, SHA)
        ↓
ESCREVE NO DESTINO CANÔNICO (NUCLEO/...)
        ↓
MOVE ARQUIVO ORIGINAL PARA HISTORY/DOWNLOADS/<categoria>/
        ↓
EMITE RECEIPT (CARVE) NO Rastro
```

## CLASSIFICAÇÃO AUTOMÁTICA (por conteúdo + nome)
| Padrão | Destino Canônico | Ação |
|--------|------------------|------|
| `*COMANDO*` / `*PROMPT*` | `NUCLEO/commands/` | Copia como `.md` |
| `*CONTRATO*` / `*GATE*` / `*SECURITY*` | `NUCLEO/contracts/` | Copia como `.md` |
| `*TRILHO*` | `NUCLEO/patterns/` | Atualiza/merge |
| `*ANTÍDOTO*` / `*ANTIDOTO*` | `NUCLEO/contracts/` | Copia como `.md` |
| `*DECISÃO*` / `*DECISAO*` | `NUCLEO/decisions/` | Copia como `.md` |
| `*PADRÃO*` / `*PATTERN*` / `*MAPA*` | `NUCLEO/patterns/` | Merge inteligente |
| `*MISSÃO*` / `*MISSAO*` | `NUCLEO/missions/` | Cria/atualiza |
| `*ARQUITETURA*` / `*ARVORE*` / `*PACOTÃO*` | `NUCLEO/docs/reference/` | Referência |
| `*FORJA*` | `NUCLEO/patterns/` | Pattern |
| `*HUNTER*` / *`FORENSE*` / `*SURGICAL*` | `NUCLEO/docs/history/downloads/forense/` | Archive |
| `*CHROME*` / `*DISPLAY*` | `NUCLEO/docs/history/downloads/chrome/` | Archive |
| `*AGENTE*` | `NUCLEO/docs/history/downloads/agente/` | Archive |
| Demais | `NUCLEO/docs/history/downloads/misc/` | Archive |

## HANDLERS ESPECIAIS (extensões binárias)
| Extensão | Handler | Comportamento |
|----------|---------|---------------|
| `.zip` | `handle_zip` | Extrai → arquiva ZIP original → processa cada arquivo interno (sync, sem debounce) |
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` | `handle_image` | PIL metadata + conteúdo pronto para OCR → cristaliza |
| `.pdf` | `handle_pdf` | pymupdf → pdfplumber → PyPDF2 fallback → extrai texto → cristaliza |
| `.html`, `.htm` | `handle_html` | Trata como texto puro (remove tags opcionalmente no futuro) |

## PIPELINE ZIP (crítico)
```
ZIP DETECTADO
        ↓
handle_zip()
        ↓
1. EXTRAI para .extracted_<nome>/
2. LISTA arquivos internos
3. ARQUIVA ZIP ORIGINAL (libera handle)
4. PROCESSA CADA ARQUIVO INTERNO (process_file_sync — SEM debounce)
5. LIMPA .extracted_*/
        ↓
CARVE PARA CADA ARQUIVO INTERNO
```

## SCRIPTS INCLUÍDOS
- `scripts/auto_destilador.py` — Watchdog principal (watchdog library)

## REFERENCIAS DE APOIO
- `references/auto-destilador-cron.md` – Como agendar o auto-destilador com Hermes Cron
- `references/daemon-robust-verification.md` – Checklist de verificação do Daemon Robusto obrigatório

## PITFALLS CONHECIDOS
| **Screenpipe Writer Attribution Non-PID** | `window:15016` shown as writer; NOT a Windows PID / OpenProcess target | Confirm via Screenpipe API / log frame; never treat as process handle for force-release |

## SESSION LEARNINGS 2026-08-31 (proof-first, real receipt, no fake PASS)
- Receipt must be HONEST: `BLOCKED_IN_PROGRESS` when proof missing; never `PASS` by list; `PARTIAL` only when skill loaded + evidence measured.
- `python3` alias broken (MS Store); use `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python` in all scripts/cron.
- `health_check.sh` requires native `C:\Program Files\Git\usr\bin\bash.exe`; WSL/cygwin fails.
- `window:15016` (Screenpipe handle) ≠ Windows PID; do not `OpenProcess` on it.
- User style: ultra-concise baianês; evidence-first (`UNKNOWN≠PASS`); direct action (`APENAS FAÇA NÃO PERGUNTE`); no options, no papagaio.
- Model swap tracked (`hy3:free` → `z-ai/glm-5.2:free`); never forget in receipt.
- Gold confirmed: `OURO-SELF-HEALING-FIXED-POINT-agi-self-improvement.md` (57l/3008b/2026-08-26/SEGREDO/CHEFE) — preserved, not duplicated.
- All updates above preserved in skill references (`references/session-2026-08-31-proof-first-pattern.md`) and receipt (`GARIMPO-CHEFE-receipt-20260831.md`, `screenpipe-hermes-receipt-20260831.md`).

## PITFALLS CONHECIDOS
|---------|---------|----------|
| **Write Path Bug** | Arquivo escrito na raiz do NUCLEO em vez do subdiretório | Usar `destino_abs` diretamente: `os.makedirs(destino_abs, exist_ok=True); filepath = os.path.join(destino_abs, base_name)` |
| **watchdog não instalado** | `ModuleNotFoundError: watchdog` | `pip install watchdog` no venv do Hermes |
| **ZIP Windows Locking (WinError 32)** | `ZipFile` segura handle; `arquivar_original` falha ao mover | Workaround: erro de lock → arquiva em `misc/`; arquivos internos já processados. Fix melhor: extrair → fechar ZipFile → arquivar ZIP → processar sync |
| **ZIP Cleanup Race** | `shutil.rmtree()` antes do processamento sync completar | Fix: coletar lista de arquivos extraídos → arquivar ZIP → processar cada sync → só depois cleanup |
| **Special Handler Debounce** | Early return sem adicionar a `pending_files` causava double-processing | Fix: adicionar a `pending_files` ANTES de spawnar thread de debounce |
| **Sync Processing for Extracted Files** | `process_file()` usa debounce (5s); arquivos extraídos precisam imediato | Fix: `process_file_sync()` bypassa debounce, chamado direto de `handle_zip()` após ZIP arquivado |
| **FileNotFoundError ao mover arquivos extraídos** | `shutil.move()` falha porque arquivo já foi movido/deletado por outro processo ou thread | Fix: verificar `os.path.exists()` antes de mover; usar `shutil.copy2()` + `os.remove()` como fallback; tratar erro graciosamente sem quebrar pipeline |
| **Watch Path Expansion Dinâmico** | Novas pastas do Chefe não monitoradas automaticamente | Fix: patch dinâmico em `WATCH_PATHS` + restart observer; future: config file for watch paths |
| **Race Condition em Múltiplas Threads** | Múltiplas threads processando mesmo arquivo (on_created + on_modified) | Fix: `pending_files` com timestamp como chave única; early return se já processando |
| **Kanban Hook Timeout** | `urllib.request.urlopen` timeout em rede lenta | Fix: timeout configurável (default 5s), retry com backoff exponencial, log de erro não bloqueia pipeline |
| **Vision Multimodal Disabled** | `vision_analyze` falha com \"multimodal not enabled\" | Fallback: documentar limitação, não quebrar pipeline; apenas não processar imagens até flag habilitado |
| **Billing Model Credits Exhausted** | Modelos paid (glm-5.2) falham com 404 credits | Fallback automático para modelos free (nvidia/nemotron-3-ultra, stepfun/step-3.7-flash:free) |
| **Daemon Morre com Terminal** | Processo background morre quando terminal fecha | **Solução Definitiva**: Daemon robusto com signal handlers (SIGTERM/SIGINT, SIGHUP se disponível), health check HTTP (porta 8788), auto-restart observer watchdog (30s), PID file management + atexit cleanup, logging persistente (arquivo + stdout), auto-restart observer watchdog (30s) |
| **Terminal Session Death** | Background process morre quando terminal fecha | Fix: Signal handlers (SIGTERM/SIGINT/SIGHUP) + PID file + Health check + Auto-restart = IMORTAL |
| **Sem Health Check** | Impossível saber se daemon vivo | HTTP endpoint `/health` na porta 8788 |
| **Sem Auto-Restart** | Observer morre e não volta | Watchdog 30s + auto-restart automático |
| **Sem Logging Persistente** | Logs perdem ao fechar terminal | File logging + stdout |
| **Sem PID Management** | Processos órfãos | PID file + atexit cleanup |

## DEPENDÊNCIAS
```bash
pip install watchdog pillow pymupdf pdfplumber PyPDF2
# Todas disponíveis no venv do Hermes
```

## COMANDOS
```bash
# Iniciar watchdog
python auto_destilador.py

# Testar arquivo único (sync)
python -c "
from auto_destilador import DestiladorHandler
h = DestiladorHandler()
h.process_file_sync('path/to/file.txt')
"

# Executar autonomamente via Hermes cron (recomendado)
hermes cron create --schedule "every 30s" --prompt "hermes run skill auto-destilador" --name "auto_destilador_garimpo" --deliver origin
```

## DESTINOS NUCLEO
| Tipo | Caminho Canônico | History Archive |
|------|------------------|-----------------|
| commands | `NUCLEO/commands/` | `history/downloads/comandos/` |
| contracts | `NUCLEO/contracts/` | `history/downloads/contratos/` |
| decisions | `NUCLEO/decisions/` | `history/downloads/decisoes/` |
| patterns | `NUCLEO/patterns/` | `history/downloads/padroes/` |
| missions | `NUCLEO/missions/` | `history/downloads/missoes/` |
| docs/reference | `NUCLEO/docs/reference/` | `history/downloads/arquitetura/` |
| forense/chrome/agente | `history/downloads/<categoria>/` | same |

## HISTÓRICO DE VERSÕES
| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-08-23 | Criação inicial — watchdog + destilação + cristalização automática no NUCLEO runtime |
| 1.0.1 | 2026-08-23 | Bugfix: write path corrigido (raiz → subdiretório correto) |
| 1.0.2 | 2026-08-23 | Handlers ZIP/PDF/IMAGE + pipeline ZIP sync + debugging transcript + pitfalls expandidos |
| 1.0.3 | 2026-08-23 | ZIP sync processing validado (TESTE_ZIP_SYNC.zip); Screenpipe + Hermes + MCP integração conceitual; Auto-Destilador → Kanban hook arquitetado; watchdog ativo em produção (proc_e16c3f5529be) |
| 1.0.4 | 2026-08-23 | **REGRAS OBRIGATÓRIAS GRAVADAS NO RUNTIME**: TUDO_COM_DATA_HORA_HASH_PROVA=SIM, DATA_HORA_PADRAO_ISO8601=OBRIGATORIO, SHA256_HASH_PADRAO=OBRIGATORIO, PROVA_OBRIGATORIA_PARA_TUDO=SIM, RUNTIME_GRAVA_AUTOMATICO=SIM. Daemon imortal: signal handlers (SIGTERM/SIGINT/SIGHUP), health check HTTP (porta 8788), auto-restart observer watchdog (30s), PID file management + atexit cleanup, logging persistente (arquivo + stdout), auto-save state a cada 60s com prova, atomic writes com SHA verification, CARVE append-only com proved=true. Health check retorna operation + timestamp ISO8601 + sha256 + proved. Crystal escrito com SHA256 full (64 chars) + timestamp ISO8601 + proved=true. Kanban card automático. Kimetsu Legacy (14 formas) cristalizado. |
| 1.0.5 | 2026-08-23 | **REGRAS OBRIGATÓRIAS SOUL INCORPORADAS AO DAEMON**: SOUL.md ANEXO E + ANEXO F (DAEMON ROBUSTO PADRÃO OBRIGATÓRIO) gravados. Health check retorna `proved=true` + operation + timestamp ISO8601 + sha256 full. Crystal SHA256 full 64 chars (não truncado). Auto-save state a cada 60s com prova (timestamp + sha256 + atomic write). CARVE append-only com `proved=true`. Health check endpoint `/health` e `/state` com proved=true. Kimetsu Legacy (14 formas) integrado. SOUL.md ANEXO E (Descoberta Temporal + Causal: CONCEITO≠PROCESSO, FÍSICO→TEMPORAL→CAUSAL→PROVA, COINCIDÊNCIA→HIPÓTESE→MECANISMO→EVIDÊNCIA→CAUSA, TU ERA A SOL) + ANEXO F (DAEMON ROBUSTO = PADRÃO OBRIGATÓRIO: signal handlers + health check + auto-restart + PID file + logging + graceful shutdown) incorporados permanentemente. |
| 1.0.6 | 2026-08-23 | **HTML UNIFICADO + MERMAID AUTO-ATUALIZÁVEL + ZERO REGRESSÃO**: HTML unificado com 5 abas (Legenda + Mapa Visual + Billing + Kimetsu + Rastro). 8 diagramas Mermaid auto-atualizáveis (Arquitetura + Data Flow + Runtime State + Storage + Kimetsu + TRILHO + Git Flow + Verificação). Regra: ZERO REGRESSÃO, SEM V1/V2/V3, apenas verdade atual. HTML é OURO. Mermaid em `CENTRALDARK-MERMAID-ATUAL.md`. |
| 1.0.7 | 2026-08-23 | **CORREÇÕES DE USUÁRIO INCORPORADAS**: \"Não mergeie na main sem 100% certeza\" → git workflow no skill. \"HTML é OURO, manter padrão da intenção só no que importa\" → HTML/mermaid como artefatos canônicos. \"Revisão sempre, grafo RAG melhorar caminhos já andados, zero regressão, SEM v1/v2/v3\" → Versionamento removido, apenas verdade atual. \"Tudo com data/hora/hash/prova, grava no runtime\" → Já implementado. \"Generalize, encontre causa raiz, resolva definitivamente\" → Daemon robusto padrão. \"Não me pergunte, se vire\" → Autonomia operacional. Meta futura: Writer Único + Judge + SOL Runtime Dedicado. |
| 1.0.8 | 2026-08-23 | **MAPEAMENTO PASTA DO CHEFE + CRISTALIZAÇÃO TOTAL**: Watch path expandido para `PASTA DO CHEFE JOGA ARQUIOVOS...`. Auto-destilador agora mina tudo da pasta do Chefe automaticamente. Fixes: FileNotFoundError ao mover arquivos extraídos (check exists + copy2 fallback), race condition threads (pending_files unique key), watch path expansion dinâmico (patch + restart observer). Zero regressão: cristaliza útil, descarta lixo, até fixed point. HTML unificado + Mermaid auto-atualizável + Zero regressão (SEM v1/v2/v3). |
| 1.0.9 | 2026-08-23 | **RECONCILIAÇÃO TOTAL + HTML UNIFICADO + BUILD LOCAL**: Reconciliação total do CentralDark (PRs, comments, intenções, histórico) → merge local na main → build local apenas (SEM deploys). HTML Unificado com 6 tabs (Legenda/HANDOFF, Mapa Visual, Billing, Kimetsu Legacy, Rastro/CARVE, Mermaid 8 diagramas). Pasta do Chefe renomeada para `PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE` — watch path atualizado. Mermaid auto-atualizável (8 diagramas, zero regressão, SEM v1/v2/v3). Browser debugging em tempo real (browser_navigate, browser_vision, browser_console). Reconciliação total: stashes authority-normalize + PM2 + meta-lupa CRLF → merge local na main → build local apenas (SEM deploys). Fixed point: até nada mudar materialmente. Zero regressão, SEM v1/v2/v3, apenas verdade atual. |
| 1.1.0 | 2026-08-25 | **GOLD STANDARD METADATA APPLIED**: Added phases, runtime_checks, failure_signature, remediation_escalation, provenance, counterproof, fixed_point_contribution, mantra, three planes, three dimensions, core_loop, preflight, knowledge_lookup, crystallization_format, remediation_escalation_detail, reality_judge, config_origin, health_panel, auto_review, fixed_point_predicate, continuous_review to frontmatter. Peer template ≠ Gold Standard gap documented. |
• HTML SUPORTADO: Removida restrição que ignorava *.html; agora patterns: "*" processa qualquer extensão (exceto *.tmp). Watch path focado apenas na pasta do Chefe. Debounce reduzido para 500ms para maior responsividade.

• RECEIPT REAL / GARIMPO NÃO INVENTADO (2026-08-31, z-ai/glm-5.2:free, Pivete): Se o intake não encontrar arquivo novo no watch_path, o receipt é HONESTO — PENDING / NÃO PROVADO, nunca verde falso. Pipeline de referência: MEDIR → CLASSIFICAR (conhecido/novo/histórico/contradito/secreto/UNKNOWN) → INTAKE (reusar auto_destilador.py existente, NÃO criar segundo watcher) → SECRET_SCRUB (.env via Notepad, nunca terminal; não expor token/Authorization) → DEDUPE (fable-loop SKILL.md 685db não duplicado; não criar v2) → DELTAUTIL (apenas se ouro REAL; neste turno: NONE_PROVEN) → RECEIPT HONESTO → FIXED_POINT apenas com prova (ZIP confirmado + conteúdo + absorção + MAIN verde). Provas desta sessão: SKILL.md 685db, cmd c9ed0247, repo 9f5cb, modelo z-ai/glm-5.2:free, receipt GARIMPO-CHEFE-receipt-20260831.md (34l, status NÃO PROVADO). Proibido: receipt "processado totalmente" por listagem de ZIP; DELTAUTIL sem ouro; force-release sem erro comprovado; writer duplicado; expor .env; criar v2/v3 de garimpo. Referência de suporte (se presente): references/garimpo-intake-receipt-real-not-invented.md.

---\n\n## THREE PLANES (enforced)\n\n| Plane | Content |\n|-------|---------|\n| KNOWLEDGE | failure_signatures (AUTO_DESTILADOR_WATCHDOG_CRYSTALLIZATION_v1), compat_matrix (watchdog, zip, pdf, image, kanban), remediation_procedures (pitfalls table), local-first retrieval (crystals) |\n| EXECUTION | runtime measurement (health_check_responds, watchdog_active, carve_emitted, kanban_hook_fired), Reality Judge validation (hermes ecosystem post-conditions), ecosystem-specific post-conditions |\n| CONFIG ORIGIN | config source tracking (profile/pivete, venv, watch_paths), fix at right layer (profile > project > global) |\n\n## THREE DIMENSIONS\n\n| Dimension | Definition | Reopen Trigger |\n|-----------|------------|----------------|\n| DEPENDÊNCIA | What runtime/project requires | manifest/lockfile change, watchdog version change, venv change |\n| DECADÊNCIA | Knowledge/compat became stale | version change, test failure, source change, counterproof failure, new zip format |\n| CADÊNCIA | When to revalidate | event-driven: mission_start, build_fail, version_change, watchdog_restart, new_file_type |\n\n## MANTRA\n\n> **MINERAR UMA VEZ, CRISTALIZAR UMA VEZ, REUTILIZAR N VEZES**\n>\n> **BIBLIOTECA GRANDE → RETRIEVAL PRECISO → CONTEXTO PEQUENO**\n>\n> **LOCAL FIRST = TRUE**\n>\n> **REALITY = JUDGE**\n>\n> **UNKNOWN != PASS**\n>\n> **DECLARED != INSTALLED != WORKING**\n>\n> **VERSO = MUDANÇA REAL DE POLÍTICA**\n>\n> **VERSO SEM EXECUÇÃO = TEATRO**\n>\n> **EXECUÇÃO SEM PROVA = UNKNOWN**\n"