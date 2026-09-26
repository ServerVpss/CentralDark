# COMANDO - tri-root-inventory-legacy-freeze.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\tri-root-inventory-legacy-freeze.md
**SHA:** f0b6980e79452163
**Timestamp:** 2026-08-28T02:57:25.508342
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** `MESMO_NOME != DUPLICADO`

### Ouro Bruto (primeiros 5000 chars)
```
# TRI-ROOT INVENTORY + LEGACY FREEZE PROTOCOL
*Sessão 2026-08-22 — Missão de Reconciliação CentralDark*

---

## Contexto
Missão de reconciliação tri-root (C:\CentralDark / E:\CentralDark / C:\Users\danda) com descoberta de runtime legado `elite-gateway` (zendriver + chatgpt.com browser automation). Comando canônico recebido do CHEFE exigindo freeze explícito do legado sem apagar, cristalização da arquitetura operacional, e continuação até FIXED_POINT.

---

## FASE B — Inventário Tri-Root (Metodologia Padronizada)

### 1. Listar Raízes
```bash
ls -la /c/CentralDark
ls -la /e/CentralDark
ls -la "/c/Users/danda"
```
**Não presumir estrutura** — medir cada raiz explicitamente.

### 2. Matriz de Classificação por Item Material
Para cada diretório/arquivo relevante:

```
PATH=
TYPE=
PURPOSE=
HASH=
OWNER=
CURRENT_CONSUMERS=
REFERENCES=
GIT_STATE=
ACTIVE_OR_LEGACY=
CANONICAL_CANDIDATE=
CONFIDENCE=
EVIDENCE=
```

### 3. Detecção de Duplicações Estruturais
**Regra:** `MESMO_NOME != DUPLICADO`
Provar com: `HASH + SIZE + CONTENT + PURPOSE + REFERENCES + GIT_HISTORY`

### 4. Mapeamento de Legacy Runtime Candidates
Exemplo detectado:
```
ELITE_GATEWAY = LEGACY_RUNTIME_CANDIDATE
ZENDRIVER_CHATGPT_ROUTE = LEGACY_TRANSPORT_CANDIDATE
```

### 5. Freeze Imediato no Legado
```text
NO_NEW_USE_ZENDRIVER_CHATGPT_GATEWAY=TRUE
NO_NEW_BROWSER_AUTOMATION_CHATGPT=TRUE
NO_NEW_ELITE_GATEWAY_SESSION=TRUE
LEGACY_DELETE=DENIED
```

### 6. Matriz de Autoridade Canônica
Classificação final por item:
- `KEEP_C` / `KEEP_E` / `KEEP_USERPROFILE`
- `MOVE_TO_C` / `MOVE_TO_E`
- `DUPLICATE_EXACT` / `DUPLICATE_DIVERGED`
- `LEGACY_RUNTIME` / `LEGACY_USEFUL`
- `CACHE_REGENERABLE` / `TEMPORARY` / `DOWNLOAD_INSTALLER`
- `SENSITIVE` / `SUSPICIOUS` / `QUARANTINE_CANDIDATE`
- `DO_NOT_TOUCH` / `UNKNOWN`

**Invariantes:**
```
PATH != AUTHORITY
NAME != AUTHORITY
LAST_MODIFIED != AUTHORITY
MEMORY != LIVE_STATE
HISTORY != CURRENT_STATE
```

---

## FASE C — Mapa de Runtime (Descoberta Explícita)

Descobrir e registrar:
```
WHAT_STARTS_HERMES=
CURRENT_ENTRYPOINT=
CURRENT_SOUL_SOURCE=
CURRENT_PROFILE=
CURRENT_RUNTIME=
CURRENT_MODEL=
CURRENT_MCP=
CURRENT_STORAGE_ROOT=
CURRENT_MEMORY_ROOT=
IS_ELITE_GATEWAY_ACTIVE=
IS_ZENDRIVER_ACTIVE=
IS_CHATGPT_BROWSER_ROUTE_ACTIVE=
```
**Não inferir — medir.**

---

## LEGACY RUNTIME FREEZE PROTOCOL

### Classificação Inicial
```text
ELITE_GATEWAY = LEGACY_RUNTIME_CANDIDATE
ZENDRIVER_CHATGPT_ROUTE = LEGACY_TRANSPORT_CANDIDATE
```

### Freeze Imediato
```text
NO_NEW_USE_ZENDRIVER_CHATGPT_GATEWAY=TRUE
NO_NEW_BROWSER_AUTOMATION_CHATGPT=TRUE
NO_NEW_ELITE_GATEWAY_SESSION=TRUE
LEGACY_DELETE=DENIED
```

### Investigação Obrigatória Antes de Desligar
```
ACTIVE_PROCESS?
ACTIVE_CONSUMER?
CURRENT_DEPENDENCY?
CONFIG_REFERENCE?
HISTORICAL_ONLY?
SAFE_TO_DISABLE?
```

### Decisão
| Condição | Ação |
|----------|------|
| Inativo | `STATUS=LEGACY_DISABLED` |
| Ativo mas desnecessário | `STOP_NEW_TRAFFIC` → `DISABLE_ROUTE_REVERSIBLY` → `TEST` → `REMEASURE` |
| Dependência ativa | `LEGACY_ACTIVE_DEPENDENCY=TRUE` → encontrar rota de desligamento segura |

**Nunca** assumir que legado é autoridade atual. **Nunca** destruir sem contraprova de dependência.

---

## OBSIDIAN OWNERSHIP MODEL (Correção Validada pelo CHEFE)

```text
HERMES (PIVETE/HERMES-CASA) = ORGANIZA / MANTÉM / CRISTALIZA
OBSIDIAN (E:\CentralDark\vault) = SEGUNDO CÉREBRO VISÍVEL DO HERMES
CHEFE (SEGREDO) = CONSULTA / NAVEGA / INTERVÉM MANUALMENTE QUANDO QUISER
```

### Implicações Operacionais
- Hermes escreve/cristaliza no vault automaticamente (Forja → cristalização)
- Usuário **não** é curador obrigatório — só edita quando quer
- Obsidian **não** é: lixeira, quarentena, runtime truth
- Obsidian recebe **somente**: decisions, architecture, learnings, patterns, missions, important relationships, evidence synthesis

---

## SOUL/HERMES-CASA IDENTITY — Modelo ≠ Autoridade

```text
MODELO ATUAL (nvidia/nemotron-3-ultra) = MOTOR TEMPORÁRIO SEM AUTORIDADE PRÓPRIA
PAPEL OPERACIONAL = HERMES-CASA (preserva método, continuidade, execução)
SEGREDO/CHEFE = AUTORIDADE HUMANA FINAL
SOL = COORDENADORA QUANDO PRESENTE
```

### Boot Declaration Obrigatória
```yaml
CURRENT_MODEL: "nvidia/nemotron-3-ultra-550b-a55b"
CURRENT_PROVIDER: "nvidia"
CURRENT_RUNTIME: "Hermes TUI"
CURRENT_SOUL: "HERMES-CASA"
CURRENT_PROFILE: "pivete"
```

**Nunca** transformar modelo, gateway, navegador ou interface em autoridade arquitetural.

---

## FIXED POINT CONTINUATION — Não Reiniciar Missão

Quando gatilhos `#ACORDAR` / `!CALIBRAR` / `!RELOAD` disparam em missão já em execução:

```text
NÃO RECOMEÇAR DO ZERO
LIVE_STATE + NEW_DELTA > RESTART_FROM_ZERO

RECUPERAR:
  → missão atual (MISSION_ID)
  → session history disponível
  → arquivos canônicos
  → Git (branch/HEAD/PR/worktree)
  → NUCLEO / Obsidian / maps / evidence / configs atuais

MEMORY = REFERENCE
LIVE_STATE = FINAL_JUDGE

CONTINUAR do checkpoint comprovado mais avançado.
NO_NEW_INFORMATION → NO_CHANGE → CONTINUE_CURRENT_THREAD
```

---

## Inventário Parcial
```