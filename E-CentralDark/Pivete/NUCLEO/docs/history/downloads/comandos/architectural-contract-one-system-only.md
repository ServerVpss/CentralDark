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
> "isto pertence ao shell/router/owner existente?"
> SIM → integrar | NÃO → provar GAP_REAL antes de criar

### 12. REUSE_CURRENT_WORK=true
Trabalho visual atual (Forge theme) NÃO deve ser refeito. Preservar:
- chocolate shell, gold/bronze framing, foil/parchment
- contraste dark-text/light-surface
- tokens novos (ink-text, ink-mute)
- correções hardcoded navy, contraste
- theme switcher, persistência
- estrutura Mapa Canônico

---

## Critérios de Finalização (ALL MUST PASS)

| Critério | Status |
|----------|--------|
| ONE_CANONICAL_UI=true | ⬜ |
| ONE_CANONICAL_RUNTIME=true | ⬜ |
| ONE_THEME_ENGINE=true | ⬜ |
| THREE_GLOBAL_THEMES=true | ⬜ |
| TEMP_IS_NOT_OWNER=true | ⬜ |
| NO_V1_V2_V3=true | ⬜ |
| NO_PARALLEL_PRODUCT=true | ⬜ |
| CLAUDE_WORK_ABSORBED=true | ⬜ |
| HERMES_CAN_CONTINUE=true | ⬜ |
| SKILL_DELTA_RECONCILED=true | ⬜ |
| BOOT_LOADS_CANONICAL_STATE=true | ⬜ |
| VISUAL_TESTED=true | ⬜ |
| FUNCTIONAL_TESTED=true | ⬜ |
| NO_REGRESSION_OBSERVED=true | ⬜ |

**Se alguma linha não puder ser provada → UNKNOWN/PENDING. Não inventar PASS.**

---

## Referências da Sessão
- `centraldark-mapa.html` (scratchpad temp)
- `forja-de-cartas.html` (scratchpad temp)
- CSS/tokens/theme switcher implementados
- Correções contraste + hardcoded navy
- Trabalho visual Forge preservado (REUSE_CURRENT_WORK)

---

## Sessão 2026-08-24 — Consolidação CentralDark Completa

### Contexto
Contrato completo imposto pelo SEGREDO/CHEFE para convergir todo trabalho visual, runtime, skills e aprendizado para uma única CentralDark canônica, continuando do estado atual sem reiniciar.

### Estado Observado (Inventário Seção 5)

| Categoria | Itens |
|-----------|-------|
| **CANONICAL** | hermes-webui (8787), auto-destilador (8788), MCP (9100), skills NUCLEO, CARVE rastro, SOUL canônico (E:\) |
| **REUSABLE_DELTA** | 4 HTMLs + 1 MD em `NUCLEO/docs/reference/` → absorver no hermes-webui |
| **DUPLICATE** | `LEGENDA-SESSAO-20260823.md` (duplica .html) |
| **REFERENCE** | `DIAGNOSTICO-*.md`, `PACOTAO-*.md`, `README.md` |
| **TEMP** | localhost 8917 (preview Forja), scratchpads Claude |
| **LEGACY** | `elite-gateway/zendriver` (congelado), SOUL divergente (AppData) |
| **BLOCKED** | Vite build (dependência `vite` não extrai) |
| **UNKNOWN** | `1.txt`, porta 8917 atual, VPS SSH |

### Gaps Críticos Identificados

1. **Vite build quebrado** — `npm install` não extrai `vite` para `node_modules/` (bug npm Windows + cache)
2. **hermes-webui sem rotas** para Mapa/Forja/Billing/Legenda/Mermaid — são apenas HTMLs soltos
3. **Theme engine não existe** — 3 temas (OPERATIONAL/EMERALD/FORGE) não implementados globalmente
4. **Cloudflare panel não integrado** — capacidade existe no MCP mas não no frontend
5. **SOUL divergente** — Runtime lê AppData (HERMES legacy), canônico em E:\ (HERMES-CASA)

### HERMES_OPERATIONAL_STACK Composta

```
CENTRALDARK_OPERATIONAL_METHOD  → contexto, regras, comportamento da Casa
KIMETSU_LEGACY_OPERATIONAL_METHOD  → 17 Respirações / Fixed Point / Motor de Seleção
META_LUPA  → falsificação, causalidade, AutoLupa, evidência
OPERATIONAL_COMMUNICATION  → SOUL/gates/evidence/receipt/closure
REALITY_JUDGE  → prova técnica antes de aceitação humana
FIXED_POINT  → 5 condições obrigatórias
RECEIPT  → fechamento estruturado
LEARNING  → cristalização só com prova
```

**Integração MetaLupa dentro de Kimetsu:** proporcional ao risco (FRIA/MÉDIA/QUENTE).

### Boot Fingerprint (atualizado)

```yaml
CENTRALDARK_AI_BOOT:
  governance: LOADED
  github_dictionary: LOADED
  delta_method: LOADED
  history_preservation: ACTIVE
  source_of_truth: "ServerVpss/CentralDark"
  observed_evidence: "branch=feat/gatilhos-execucao-reversivel-remediacao HEAD=51e3cd4ca4011ff2bbc31ecf33c7e6998c2c354f"
  alignment: "SEGREDO/CHEFE > SOL/COORDENADOR > PIVETE/HERMES + ESPECIALISTAS"
  role: "HERMES_LOCAL_RUNTIME_WRITER"
  writer: "AUTO_DESTILADOR"
  meta_lupa_sha: "42691e008ba50ee55646ca81113bf0abfde87af2"
  kimetsu_fixed_point: TRUE
```

### Vite/Windows npm Cache Fix (Recorrente - Documentado)

**Problema:** `npm install` reporta "up to date" mas `vite` não extraído para `node_modules/`. `vite build` falha com `ERR_MODULE_NOT_FOUND`.

**Root Cause:** Cache npm corrompido / config global interferindo no Windows.

**Fix Sequence Validado:**
```bash
# 1. Nuclear clean
cmd /c "rmdir /s /q node_modules 2>nul && del package-lock.json 2>nul"
npm cache clean --force
rmdir /s /q "%LOCALAPPDATA%\npm-cache\_cacache" 2>nul

# 2. Remover config global problemática
npm config delete globalconfig 2>nul
del "%USERPROFILE%\.npmrc" 2>nul

# 3. Reinstalar limpo
npm install --legacy-peer-deps

# 4. Verificar extração
dir node_modules\vite

# 5. Build
vite build
```

**Prevenção:** Nunca usar `--force` / `--legacy-peer-deps` como solução permanente. Corrigir causa raiz (cache/config).

### Próximo Passo: Respiração SOL

Iniciar meta-orquestração para convergir tudo no hermes-webui:
1. Descobrir router/layout/app shell real do hermes-webui (porta 8787)
2. Criar rotas: `/mapa`, `/forja`, `/billing`, `/legenda`, `/mermaid`, `/dashboard`
3. Implementar Theme Engine global (3 temas, tokens semânticos)
4. Integrar Cloudflare panel em Settings
5. Absorver 4 HTMLs + 1 MD como views internas