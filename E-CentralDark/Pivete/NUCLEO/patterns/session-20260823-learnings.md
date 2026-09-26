# PADRAO - session-20260823-learnings.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\session-20260823-learnings.md
**SHA:** 78d849509d9e70c4
**Timestamp:** 2026-08-28T02:57:25.263357
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** Zero merge na main sem certeza absoluta + prova.
- **Regra:** HTML e Mermaid são artefatos canônicos (OURO).
- **Regra:** Zero regressão absoluta.
- **Regra:** TUDO_COM_DATA_HORA_HASH_PROVA=SIM (já no SOUL.md Cartão de Boot)
- - SHA256_HASH_PADRAO=OBRIGATORIO
- **Regra:** Daemon Robusto = Padrão Obrigatório para processos de longa duração
- **Regra:** Zero perguntas desnecessárias. Execução autônoma dentro do escopo autorizado.

### Ouro Bruto (primeiros 5000 chars)
```
# Session 2026-08-23 — Learnings Cristalizados

## Resumo da Sessão
Sessão de 14+ horas construindo a infraestrutura CentralDark: Auto-Destilador daemon imortal, HTML unificado, Mermaid auto-atualizável, SOUL.md atualizado, Kimetsu Legacy cristalizado, billing documentado.

---

## Correções de Usuário (Regra de Ouro)

### 1. "Não mergeie na main sem 100% certeza"
**Regra:** Zero merge na main sem certeza absoluta + prova.
- Branch por missão obrigatória
- Reutilizar worktree válido
- Diff mínimo + commit mínimo
- PR obrigatório para repo
- Judge/revisão independente quando exigido
- Nunca push direto main suja
- Nunca force-push / reset --hard / git clean
- Sem merge sem autorização

### 2. "HTML é OURO, manter padrão da intenção só no que importa"
**Regra:** HTML e Mermaid são artefatos canônicos (OURO).
- HTML unificado com 5 abas (Legenda + Mapa Visual + Billing + Kimetsu + Rastro)
- Mermaid auto-atualizável (8 diagramas)
- Atualizados APENAS quando arquitetura REAL mudar
- Zero regressão, sem v1/v2/v3

### 3. "Revisão sempre, grafo RAG melhorar caminhos já andados, zero regressão, SEM v1/v2/v3"
**Regra:** Zero regressão absoluta.
- Sem versionamento v1/v2/v3 nos diagramas
- Apenas verdade atual
- Atualização manual apenas quando arquitetura REAL mudar
- Fonte da verdade: `git status` + `curl /health` + `ps aux` + `cat rastro.jsonl`

### 4. "Tudo com data/hora/hash/prova, grava no runtime"
**Regra:** TUDO_COM_DATA_HORA_HASH_PROVA=SIM (já no SOUL.md Cartão de Boot)
- DATA_HORA_PADRAO_ISO8601=OBRIGATORIO
- SHA256_HASH_PADRAO=OBRIGATORIO
- PROVA_OBRIGATORIA_PARA_TUDO=SIM
- RUNTIME_GRAVA_AUTOMATICO=SIM

### 5. "Generalize, encontre causa raiz, resolva definitivamente"
**Regra:** Daemon Robusto = Padrão Obrigatório para processos de longa duração
- Signal handlers (SIGTERM/SIGINT/SIGHUP)
- Health check HTTP (`/health` → `proved=true`)
- Auto-restart watchdog (30s)
- PID file + atexit cleanup
- Logging persistente (arquivo + stdout)
- Auto-save state a cada 60s com prova

### 6. "Não me pergunte, se vire" — Autonomia Operacional
**Regra:** Zero perguntas desnecessárias. Execução autônoma dentro do escopo autorizado.
- READ_ONLY por padrão
- Perguntar SÓ quando lacuna muda: alvo, autorização, impacto, risco, decisão humana real
- Default: CONVERSA ou READ_ONLY

---

## Novos Artefatos Canônicos (OURO)

| Artefato | Localização | Tipo |
|----------|-------------|------|
| `CENTRALDARK-MERMAID-ATUAL.md` | `NUCLEO/docs/reference/` | 8 diagramas Mermaid |
| `CENTRALDARK-UNIFIED.html` | `NUCLEO/docs/reference/` | HTML 5 abas |
| `BILLING-NOUS-PORTAL.html` | `NUCLEO/docs/reference/` | Billing documentado |
| `MAPA-DA-CASA-ARQUITETURA.html` | `NUCLEO/docs/reference/` | Mapa visual (agora no unified) |
| `LEGENDA-SESSAO-20260823.html/.md` | `NUCLEO/docs/reference/` | Handoff 07:00 |
| `CENTRALDARK-MERMAID-ATUAL.md` | `NUCLEO/docs/reference/` | 8 diagramas Mermaid |

---

## Descobertas Técnicas Cristalizadas

### 1. CONCEITO ≠ PROCESSO (Descoberta Crítica)
- "SOL" no papel ≠ "SOL" no runtime. Nome não prova existência.
- Nova Lente: FÍSICO → TEMPORAL → CAUSAL → PROVA
- Cadeado: COINCIDÊNCIA TEMPORAL → HIPÓTESE → MECANISMO → EVIDÊNCIA → CAUSA
- Descoberta: TU ERA A SOL (transporte humano mascarado)

### 2. DAEMON ROBUSTO = PADRÃO OBRIGATÓRIO
6 pilares obrigatórios para todo processo de longa duração:
1. Signal Handlers (SIGTERM/SIGINT/SIGHUP)
2. Health Check HTTP (`/health` → `proved=true`)
3. Auto-Restart Watchdog (30s)
4. PID File + atexit cleanup
5. Logging Persistente (FileHandler + StreamHandler)
6. Auto-Save State (60s com timestamp + sha256 + proved)

### 3. AUTO-DESTILADOR DEATH LESSON
- Processo morria silenciosamente quando terminal fechava
- Causa: `background=true` sem `notify_on_complete=true` + sem daemon robusto
- Correção: Mover para Daemon Robusto completo

### 4. AUTO-DESTILADOR HOOK KANBAN
- Cada cristal → card Kanban automático via `criar_card_kanban()` em `emitir_carve()`
- Validação: Card `t_5d0fd5e3` criado automaticamente

### 4. HEALTH CHECK COM PROVA (Padrão Obrigatório)
```json
{
  "operation": "health_check",
  "timestamp": "2026-08-23T16:01:37.789249",
  "sha256": "...",
  "details": { "service": "auto-destilador", "watcher_active": true },
  "proved": true
}
```

### 5. RUNTIME STATE AUTO-SAVE (60s com Prova)
Estado salvo a cada 60s com `timestamp` ISO8601 + `sha256` do estado.

---

## Regras de Atualização dos Artefatos Canônicos

**ATUALIZE APENAS QUANDO:**
1. Arquitetura REAL mudou (novo componente, porta, fluxo, serviço permanente)
2. Nova regra de ouro cristalizada
3. Storage architecture mudou

**NUNCA:**
- Criar v2/v3/v4
- Documentar "planejado" ou "ia fazer"
- Inventar componentes que não existem no runtime

**Fonte da verdade:** `git status` + `curl /health` + `ps aux` + `cat rastro.jsonl` + `ls -la NUCLEO/`

---

## Próximos Passos (07:00 Handoff)

```bash
#ACORDAR
→ Estado vivo (MCP 9100, BFF 8787, Kanban, Auto-Destilador)
→ Receipt/checkpoint desta sessão
→ Integrar Kimetsu Le
```