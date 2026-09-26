# COMANDO - architectural-contract-one-system-only.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\architectural-contract-one-system-only.md
**SHA:** 0b2f0fef396cdb1c
**Timestamp:** 2026-08-28T02:57:24.093453
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** Para cada artefato:
- REGRA: INTERMEDIATE_ARTIFACT != FINAL_PRODUCT

### Ouro Bruto (primeiros 5000 chars)
```
# Contrato Arquitetural Canônico — ONE_SYSTEM_ONLY + HERMES-WEBUI Base

## Origem
Sessão 2026-08-24 — Contrato estabelecido pelo SEGREDO/CHEFE para convergir todo trabalho visual, runtime, skills e aprendizado para uma única CentralDark canônica.

## Princípios Fundamentais

### 1. ONE SYSTEM ONLY
```
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
NO_V1_V2_V3=true
NO_PARALLEL_FRONTEND=true
NO_PARALLEL_RUNTIME=true
NO_PARALLEL_THEME_ENGINE=true
NO_TEMP_AS_FINAL=true
```

**Regra:** Para cada artefato:
- Já existe owner? → Melhorar owner
- É duplicata? → Absorver delta e remover necessidade da duplicata
- É apenas preview? → Preview permanece descartável
- É capacidade nova real? → Integrar no sistema existente
- **NÃO** resolver duplicação criando terceiro sistema

### 2. HERMES-WEBUI É A BASE (Shell Único)
- Usar `hermes-webui` (porta 8787) como shell/interface base
- Não criar segundo produto visual para: Mapa, Forja, Dashboard, Chat, Sessões, Arquivos, Memória, Council, Builder
- Transformar em: **ROTAS / VIEWS / TABS / PAINÉIS / MÓDULOS** dentro da mesma Casa
- Descobrir primeiro o router/layout/app shell real existente — **não inventar caminho paralelo**

### 3. LOCALHOST ÚNICO COMO PRODUTO
```
Pode existir porta auxiliar DURANTE diagnóstico/build/teste.
MAS: AUXILIARY_PORT != PRODUCT_SURFACE
```

**Classificação de portas:**
| Porta | Classificação |
|-------|---------------|
| 8787 | CANONICAL_RUNTIME (hermes-webui) |
| 8917 | DEV_SERVER / STATIC_PREVIEW (temporário) |
| 8788 | TEMPORARY_TOOL (auto-destilador health) |
| 9100 | CANONICAL_RUNTIME (MCP) |

**Objetivo:** Um único origin principal para o usuário:
```
http://127.0.0.1:<CANONICAL_PORT>/
    /chat
    /mapa
    /forja
    /workspace
    /sessions
    /settings
    /...
```

### 4. THEME ENGINE ÚNICO — 3 Temas Globais

**Temas Oficiais:**
| Tema | Identidade Visual |
|------|-------------------|
| OPERATIONAL | Azul/ciano/red |
| EMERALD | Verde institucional |
| FORGE | Chocolate shell + gold/bronze frame + foil/parchment |

**Estrutura:**
```
CENTRAL THEME REGISTRY
        │
        ├── operational tokens
        ├── emerald tokens
        └── forge tokens
```

**Tokens Semânticos Obrigatórios:**
```
--surface
--surface-elevated
--panel
--panel-text
--shell
--shell-text
--accent
--accent-secondary
--border
--danger
--success
--muted
--glow
--foil
--ink-text
--ink-mute
```

**Regras:**
- TODOS os componentes consomem tokens semânticos
- **NÃO** hardcode azul, verde ou dourado espalhado
- FORGE deve preservar: dark chocolate shell + gold/bronze frame + light/holographic foil surfaces + dark readable text nas faces claras
- Troca de tema: GLOBAL, INSTANTÂNEA, PERSISTIDA, SEM RELOAD, SEM MUDAR DOM/ARQUITETURA/CONTEÚDO

### 5. CHEFE = ACCEPTANCE JUDGE VISUAL
- CHEFE observa: tela, print, vídeo, setas, comparação visual, comportamento
- CHEFE aponta delta
- **NÃO** argumentar contra gosto/intenção explícita com preferência automática do modelo
- Separar: CHEFE = julgamento intenção/aceitação visual | RUNTIME/TEST/CI/LOG = julgamento fato técnico

### 6. CLAUDE NÃO POSSUI CONHECIMENTO — HERMES HERDA
```
CLAUDE = ENGINE (substituível)
HERMES = ENGINE/EXECUTOR
CONHECIMENTO ÚTIL → reconciliação com owners canônicos
```

**Fluxo:**
```
OBSERVAÇÃO → PROVA → DELTA ÚTIL → OWNER EXISTENTE → CRISTALIZAÇÃO → TESTE → HERMES HERDA
```
**Não criar "Claude memory" paralela.**

### 7. HERANÇA DE SKILLS — Reconciliação Obrigatória
Para cada skill usada:
```
SKILL= | ORIGIN= | PATH= | VERSION/HASH= | CAPABILITY= | CENTRALDARK_ALREADY_HAS= | DELTA= | PORTABLE=
```
- Se skill já existe → melhorar/reutilizar
- Se capacidade existe com outro nome → absorver delta no owner existente
- Se realmente nova e reutilizável → mecanismo canônico de skills
- **COPY_PRIVATE_PLATFORM_MAGIC=false** — capacidade privada de plataforma não copiável vira adapter/capacidade equivalente

### 8. BOOT FINGERPRINT VERIFICÁVEL
```yaml
BOOT_FINGERPRINT=
SKILL_MANIFEST_HASH=
CANONICAL_STATE_SHA=
LAST_GOOD_STATE_ID=
```
Na inicialização: runtime mede → se mudou → reload/reconcile | se não mudou → não reaprender.

### 9. HANDOFF AUTOMÁTICO CLAUDE → HERMES
**Receipt estruturado obrigatório:**
```
INTENT=
CURRENT_STATE=
FILES_CHANGED=
CANONICAL_PATHS=
TEMP_ARTIFACTS=
DELTA_ABSORBED=
SKILLS_USED=
SKILLS_LEARNED=
TESTS=
VISUAL_STATE=
KNOWN_ERRORS=
LAST_GOOD_STATE=
NEXT_ACTION=
BLOCKERS=
HASHES=
```

### 10. TEMP SCRATCHPAD → DIFF → ABSORB → VERIFY → RECEIPT
- Scratchpad = bancada (experimento, protótipo, teste, preview, comparação)
- **PROIBIDO:** ser owner final, ser única cópia boa, conter correção não absorvida, conter conhecimento necessário só à sessão
- **ANTES DO FIM:** TEMP → DIFF → ABSORB → VERIFY → RECEIPT

### 11. APRENDIZADO DE ERRO
```
ERRO: criar páginas/servidores temporários e tratá-los como entregas isoladas
CAUSA: tarefa intermediária confundida com produto final
REGRA: INTERMEDIATE_ARTIFACT != FINAL_PRODUCT
```

**Gate interno antes de criar nova superfície:**
> "isto pertence ao 
```