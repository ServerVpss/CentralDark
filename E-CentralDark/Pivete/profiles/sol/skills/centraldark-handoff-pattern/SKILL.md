# CENTRALDARK HANDOFF — Padrão Oficial (Reutilizável)

## Objetivo
Transformar inteligência local (Notepad, GitHub, Drive, Hermes, Externos) em **um handoff determinístico pro ChatGPT**. Nada de API, serviço, webhook. Apenas arquivo copiável.

---

## Formato do Handoff (padrão)

```markdown
=== HANDOFF CHATGPT ===

MEASURED_AT=2026-09-01T04:30:00-03:00
CENTRALDARK_BRANCH=feat/fixed-point-fabric-proof-20260831
CENTRALDARK_HEAD=da89bbd30
ACTIVE_PR=1381
WRITER_SCOPE=scripts/health_check.sh

NOTEPAD:
WINDOWS_FOUND=147
TABS_FOUND=271
UNSAVED_TABS=89
FILE_BACKED_TABS=182
DEDUPED_ITEMS=42
SENSITIVE_QUARANTINED=3
HISTORICAL_ITEMS=31
CURRENT_CANDIDATES=11
FORMAT_VERIFIED=true

CURRENT_FACTS:
- session-intelligence-harvester existe e suporta Notepad LocalState
- PR #1381 é owner vivo (branch feat/fixed-point-fabric-proof-20260831)
- health_check.sh reconciliado (17/17 testes passando)
- PEM-drift: causa raiz = drift config + incapacidade rede (branch pivete/work/pem-drift-rootcause)
- Screenpipe vivo (porta 3030), Omni Router/Hermes Desktop/Gateway caídos

SUPERSEDED_HISTORY:
- Notebooks antigos substituídos por session-intelligence-harvester
- Vários scripts PEM substituídos por 3 scripts unificados (audit/check/restore)
- Delta unificado CentralDark substituído por PR único (#1381)

OPEN_GAPS:
- CI do HEAD atual = UNKNOWN (sem workflow runs associados)
- Omni Router / Hermes Desktop / Gateway = DOWN
- Drive não minerado nesta rodada
- Externos (ipnames) não cruzados

CONTRADICTIONS:
- Notepad tem 42 tabs com conteúdo útil, mas só 11 são CURRENT_CANDIDATES
- 31 itens são HISTÓRICOS (não promovidos automaticamente)
- 3 sensíveis quarentenados (credencial, token, email)

IPNAMES_DELTA:
- N/A (não cruzado nesta rodada)

NEXT_SAFE_ACTION:
- Subir CI verde no runner Windows (health_check.sh funcional)
- Levantar Omni Router (porta 8099)
- Completar minerção Drive + Externos
- Fechar Fixed Point no PR #1381

=== END HANDOFF ===
```

---

## Pipeline Padrão (10 frentes → rendezvous → 1 writer)

```text
1. NOTEPAD_LOCAL      → minerar LocalState.zip, classificar (CURRENT/HISTORICAL/DUPLICATE/SENSITIVE)
2. GITHUB_CURRENT     → medir branch, HEAD, PRs, writers ativos
3. DRIVE_DOCS         → cruzar com minerado
4. HERMES_RUNTIME     → medir portas, skills, config, providers
5. EXTERNOS           → ipnames, etc (só enriquecimento)
6. SKILLS_TOOLS       → owners carregáveis vs em uso
7. TESTS_FALSIFIERS   → contraprova ativa
8. INFRA_PERF         → portas, GPU, TTS, python, node
9. DOCS_HANDOFF       → montar handoff no formato padrão
10. REALITY_JUDGE     → derrubar cada claim antes de fechar

RENDEZVOUS → todos resultados → reconciliação → delta útil único
WRITER ÚNICO (PR #1381) → patch mínimo → prova mesmo HEAD → counterproof
REALITY JUDGE → PASS = merge + handoff final | FAIL = blocker/decision
```

---

## Regras de Ouro (sempre)

| Regra | Significado |
|-------|-------------|
| `FORENSE_READ_FIRST` | Nunca assuma, sempre meça |
| `REUSE_BEFORE_CREATE` | Owner existente > criar novo |
| `ONE_SYSTEM_ONLY` | Um PR, um writer, uma arquitetura |
| `PARALELIZE_PERCEPCAO` | Leitores em paralelo |
| `SERIALIZE_MUTACAO` | Escrita serial, um escopo por vez |
| `LOCAL_REALITY = JUDGE` | Estado vivo vence documento |
| `HISTORICAL != CURRENT` | Não promova histórico automaticamente |
| `UNKNOWN != PASS` | Não invente sucesso |
| `DOCUMENTED != EXECUTED` | Doc ≠ feito |
| `ZERO_REGRESSAO` | Nada quebra o que já funciona |
| `NO_LIXO` | Só útil entra no handoff |

---

## Gatilhos (para autoload futuro)

```
#ACORDAR !CALIBRAR !MULTIBUSSOLA #CRISTALIZAR #FABLE_LOOP
```

Quando qualquer um aparecer → carrega este padrão + skills relacionadas.

---

## Skills Relacionadas (carregam junto)

- `session-intelligence-harvester` — minerção Notepad
- `centraldark-master-funnel-autonomo` — funil mestre
- `fable-loop` — contrato autonomia total
- `kimetsu-legacy-complete` — 17 respirações / fixed point
- `screenpipe-hermes-integration` — logs vivo passado/presente

---

## Como Usar (simples)

```bash
# 1. Rodar minerção Notepad
python scripts/notepad_miner.py

# 2. Medir GitHub atual
gh repo view ServerVpss/CentralDark --json ...

# 3. Rodar rendezvous + montar handoff
python scripts/build_handoff.py --output CENTRALDARK_HANDOFF.md

# 4. Validar contraprova (Meta Lupa)
python scripts/meta_lupa_verify.py

# 5. Se PASS → handoff pronto pro ChatGPT
#    Se FAIL → blocker real / decisão humana
```

---

## Evolução (registrar aqui a cada uso)

| Data | Mudança | Por que |
|------|---------|---------|
| 2026-09-01 | Padrão criado | Primeira execução completa, extraído do que funcionou |

---

**Princípio:** Este arquivo **evolui**. Cada vez que rodar o handoff, volta aqui e anota o que melhorou. Zero regressão, só delta útil. 🤝