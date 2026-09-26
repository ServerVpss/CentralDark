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

## Inventário Parcial Executado (2026-08-22)

### Raízes Mapeadas
| Raiz | Papel | Status |
|------|-------|--------|
| `C:\CentralDark` | Repo canônico local (git clean) | `KEEP_C` — fonte da verdade estrutural |
| `E:\CentralDark` | Casa / Persistência / NUCLEO | `KEEP_E` — persistência, NUCLEO, vault, config.yaml, SOUL.md |
| `C:\Users\danda` | UserProfile / Tool State | `KEEP_USERPROFILE` — .codex, .claude, .hermes, .obsidian, configs de apps |

### Duplicações Estruturais Detectadas
| Item | C:\CentralDark | E:\CentralDark\Pivete | Classificação Preliminar |
|------|----------------|----------------------|-------------------------|
| `.claude/` | ✅ | ✅ | `DUPLICATE_DIVERGED` (precisa hash) |
| `.hermes/` | ✅ | ✅ | `DUPLICATE_DIVERGED` |
| `.obsidian/` | ✅ | ✅ (vault separado) | `DUPLICATE_DIVERGED` |
| `_MAPA_CASA/` | ✅ | ✅ | `DUPLICATE_DIVERGED` |
| `apps/modulos/` | ✅ | ❌ | `KEEP_C` (canônico) |
| `docs/` | ✅ | ❌ | `KEEP_C` (canônico) |
| `NUCLEO/` | ❌ | ✅ | `KEEP_E` (memória operacional) |
| `config.yaml` | ❌ | ✅ | `KEEP_E` (Hermes profile) |
| `SOUL.md` | ❌ | ✅ | `KEEP_E` (identidade) |

### Legacy Runtime Confirmado
**Localização:** `C:\CentralDark\apps\modulos\elite-gateway\scripts\`
**Arquivos (15):** `elite_http_gateway.py` (32KB), `elite_ws_gateway.py`, `gateway_admin.py`, `humanizer.py`, `mapeamento_humano*.py`, `debug_dom.py`, `diagnostico_dom.py`, `openai_http_gateway.py`, `pivete_routes.py`, `send_and_dump*.py`, `test_ws.py`, `zentinel_health.py`

**Stack:** `zendriver` → `chatgpt.com` (browser automation com perfil persistente)
**Classificação:** `LEGACY_RUNTIME_CANDIDATE` ✅
**Freeze aplicado:** `NO_NEW_USE_ZENDRIVER_CHATGPT_GATEWAY=TRUE`

### Estado Vivo Atual
| Componente | Estado |
|------------|--------|
| Hermes Profile | `pivete` (config.yaml: model `z-ai/glm-5.2`, provider `nous`) |
| SOUL Ativo | `HERMES-CASA` (carregado nesta sessão) |
| NUCLEO | `E:\CentralDark\Pivete\NUCLEO\` — hermes-mente, skills, motor (10 módulos) |
| Obsidian Vault | `E:\CentralDark\vault\` (vazio — só config) + `C:\CentralDark\.obsidian\` (config) |
| Quarentena | `E:\CentralDark\_QUARANTINE\` (vazio) + `C:\CentralDark\_QUARANTINE\` (vazio) |
| Git | `E:\CentralDark\Pivete\CentralDark` — 1 untracked (`.github/workflows/tauri-sign.yml`) |
| PM2 Local | Daemon rodando, **nenhum app ativo** |
| MCP | Não verificado (precisa testar capability) |

---

## Próximos Passos Naturais (Fases D–H)

1. **FASE D** — Freeze validado do antigo (investigar dependências do elite-gateway)
2. **FASE E** — Autoridade canônica (matriz completa ITEM/PATH/CANONICAL_PATH/OWNER/HASH/CONSUMERS/RISK/CLASSIFICATION/ACTION/EVIDENCE)
3. **FASE F** — Contraprova (consumidor? config? processo? junction? worktree? segredo?)
4. **FASE G** — Reconciliação (deltas mínimos: MOVE_REVERSIBLE > COPY > DELETE)
5. **FASE H** — Testes (Hermes inicia, profile carrega, SOUL carrega, skills resolvem, MCP lê roots, Git íntegro, Obsidian abre, NUCLEO acessível, site íntegro, scripts encontram caminhos, legado não usado)

---

## VALIDAÇÃO EXECUTADA — Sessão 2026-08-22 (Continuação)

### Protocolo Executado Integralmente
Todas as fases A→H + Forja + Fixed Point completadas sem reiniciar, sem instalar, sem apagar permanentemente, sem perguntar "continuo?" entre fases.

### Resultados Confirmados

#### SOUL Divergence Documentada (Runtime Block)
| Arquivo | Canônico | Runtime | Status |
|---------|----------|---------|--------|
| `SOUL.md` | `E:\CentralDark\Pivete\SOUL.md` (HERMES-CASA, 09/08) | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\SOUL.md` (HERMES legacy, 05/08) | **DOCUMENTED_DIVERGENCE** — não movido (runtime lê UserProfile) |
| `config.yaml` | `E:\CentralDark\Pivete\config.yaml` (z-ai/glm-5.2, nous) | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml` (gpt-5.5, openai-codex) | **DOCUMENTED_DIVERGENCE** — não movido (runtime lê UserProfile) |

**Lição:** Divergências em caminhos que o runtime Hermes **lê ativamente** (AppData\Local\hermes\profiles\pivete) **não podem ser movidas** — apenas documentadas. A contraprova bloqueia o movimento.

#### Quarentena Reversível Validada
- Item: `E:\CentralDark\.claude` → `_QUARANTINE/reconciliation-20260822/from-E/dot-claude`
- Rollback testado: `mv` de volta funcionou → `QUARANTINE_ROLLBACK_OK`
- Manifest: `MANIFEST.jsonl` com `rollback_path` para cada item

#### NUCLEO Cristalização Structure
Estrutura criada e validada:
```
NUCLEO/
├── decisions/      # decisões arquiteturais com evidência
├── learnings/      # padrões reutilizáveis
├── patterns/       # templates de solução
├── failures/       # falhas documentadas (não repetir)
├── contracts/      # interfaces/contratos
├── skills/         # skills extraídas
├── missions/       # checkpoints de missão
└── checkpoints/    # snapshots de fixed point
```

Arquivos cristalizados nesta sessão:
- `decisions/2026-08-22-reconciliacao-centraldark-freeze-legacy.md`
- `checkpoints/2026-08-22-reconciliacao-centraldark-checkpoint.md`

#### Legacy Freeze Confirmado
| Verificação | Resultado |
|-------------|-----------|
| Processos zendriver/chatgpt ativos | **NENHUM** (ps aux, pm2 list limpos) |
| Consumidores no repo | **NENHUM** (grep imports/refs = 0) |
| Config references | **NENHUM** (config.yaml, SOUL.md, manifests) |
| Código preservado | **SIM** (C:\CentralDark\apps\modulos\elite-gateway\scripts\) |
| Status final | `LEGACY_DISABLED` ✅ |

#### Tri-Root Authority Matrix Resolvida
| Raiz | Autoridade | Itens Canônicos |
|------|------------|-----------------|
| `C:\CentralDark` | `CANONICAL_REPO` | .claude, .obsidian, _MAPA_CASA, apps/modulos/, docs/, AGENTS.md, CLAUDE.md |
| `E:\CentralDark\Pivete` | `OPERATIONAL_HOME` | SOUL.md, config.yaml, NUCLEO/, skills/, cron/, _QUARANTINE/, vault/ |
| `C:\Users\danda` | `TOOL_STATE` | .codex, .claude, .hermes (runtime), .obsidian, .config, .cargo, etc. |

---

## Lição de Ouro — CONTINUAR_ATÉ_FIXED_POINT

Quando o CHEFE emite `!CONTINUAR_ATÉ_FIXED_POINT` com autorização explícita para todas as fases:

```text
NÃO PARE ENTRE FASES
NÃO PEÇA CONFIRMAÇÃO PARA: leitura, busca, hash, comparação, classificação, análise de dependência, teste não destrutivo, documentação, cristalização comprovada, movimentação reversível já autorizada
PARE SOMENTE SE: deleção permanente, instalação, execução suspeita, exposição de segredo, conflito de Writer irresolvível, risco irreversível, UNKNOWN material irresolvível
```

Isso transforma o protocolo de "gatilho por fase" em "execução contínua até critério de parada objetivo" — eliminando o overhead de handshake entre fases quando a missão é clara e autorizada.

---

## Referências Cruzadas
- `references/delta-cadeado-trancado-quickref.md` — integração por REUSE_BEFORE_CREATE
- `references/regenerative-self-refinement-engine.md` — motor regenerativo Hermes
- `references/kimetsu-legacy-fixed-point-predicate.md` — predicado Fixed Point
- `references/modo-operacional-loop.md` — LOOP evidência primeiro