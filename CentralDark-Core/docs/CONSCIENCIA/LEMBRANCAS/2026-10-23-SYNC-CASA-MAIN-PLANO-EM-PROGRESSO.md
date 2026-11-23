# SINCRONIZAÇÃO CASA ↔ MAIN (2026-10-23)

## STATUS: EM PROGRESSO

**Objetivo:** Sincronizar K:/ (Casa local) com origin/main (fonte de verdade GitHub) preservando ambos os lados.

---

## LEITURA CANÔNICA COMPLETADA

### ✅ Triggers canônicos (TRIGGERS.yml)

Identificados triggers operacionais:

| Trigger | Token | Escopo | Owner |
|---|---|---|---|
| **CENTRALDARK_MASTER** | `!CENTRALDARK` | Sistema inteiro | MASTER-CYCLE.yml |
| **EXECUTOR_CENTRALDARK** | `!EXECUTOR_CENTRALDARK` | Casa local autorizada | EXECUTOR-CENTRALDARK-CHATGPT.md |
| **DELTA_UTILS** | `!DELTA UTILS` | Menor delta útil | MASTER-CYCLE.yml |
| **ACORDAR** | `#ACORDAR` | Recuperar estado vivo | LEIA-ME-IA.md + AGENTS.md |
| **CALIBRAR** | `!CALIBRAR` | Alinhar intenção | LEIA-ME-IA.md + AGENTS.md |
| **MULTIBUSSOLA** | `!MULTIBUSSOLA` | Multi-axis scan | MULTIBUSSOLA.md |
| **META_LUPA** | `!META_LUPA` | Auditoria da auditoria | meta-lupa/ skill |
| **RECONCILIAR** | `!RECONCILIAR` | Reuse before create | CONTRATO-RECONCILIACAO |
| **CONTRAPROVA** | `!CONTRAPROVA` | Falsificação independente | PROOF-OWNERSHIP.json |
| **REMEDICAO** | `!REMEDIÇÃO` | Remedir T0→T1 | REMEDICAO.md |

**KEY FINDING:** Estou operando sob `!EXECUTOR_CENTRALDARK`, não `!CENTRALDARK` direto.

---

## ESTADO LOCAL K:/ vs ORIGIN/MAIN

### Arquivos principais em divergência (50+)

**Críticos que devem sincronizar:**
- `.agents/skills/*` - Skills locais podem estar desatualizadas
- `docs/CONSCIENCIA/*` - Documentação de regras
- `RULES.md` - Contrato operacional (EM MAIN, não em K:/)
- `.github/workflows/*` - Pipelines CI/CD

**Não críticos (podem divergir):**
- `EMERGENCIA/*` - Arquivos de emergência locais
- `_archive/*` - Snapshots históricos
- Drawings/Excalidraw - Diagramas

### Arquivos que NÃO devem ser deletados

- K:/ tem backups históricos em `_archive/` → PRESERVAR
- K:/ tem docs locais em `docs/` → COMPARAR com main antes de deletar
- K:/ tem scripts operacionais em `scripts/` → MANTER

---

## PRÓXIMAS AÇÕES

### 1. Ler CONTRACT.yml (TRIGGER-FABRIC)
Entender o contrato operacional global.

### 2. Ler UNIVERSAL-ENGINE-METHOD.yml
Entender o método universal que governa operação.

### 3. Comparar docs/CONSCIENCIA/*
- K:/ vs origin/main
- Identificar conflitos
- Mesclar ou etiquetar divergências

### 4. Validar RULES.md
Verificar se existe em main e em K:/.

### 5. Git merge inteligente
- `git merge origin/main --no-commit --no-ff` (test merge)
- Resolver conflitos preservando ambos os lados
- Criar novo commit com rastreamento de sincronização

### 6. Atualizar mini-gateway.cjs
Integrar com método canônico descoberto.

### 7. Atualizar Cockpit
Mapear painel de status de acordo com triggers/contrato.

---

## MEMÓRIA ATUALIZADA

Movido de "operação cega" para "operação canônica com fonte de verdade conhecida":

- **Triggers operacionais:** `!EXECUTOR_CENTRALDARK` (Casa) vs `!CENTRALDARK` (Sistema)
- **Método:** TRIGGERS.yml → CONTRACT.yml → UNIVERSAL-ENGINE-METHOD.yml
- **Owner de executor local:** `docs/CONSCIENCIA/04-MCP-E-CONECTORES/EXECUTOR-CENTRALDARK-CHATGPT.md`
- **Prova:** Via TLC23 (Contraprova/Reality Judge/Fixed Point)

---

## CHECKLIST

- [ ] Ler CONTRACT.yml completo
- [ ] Ler UNIVERSAL-ENGINE-METHOD.yml completo
- [ ] Comparar docs/CONSCIENCIA entre K:/ e main
- [ ] Localizar RULES.md canônico
- [ ] Git merge test
- [ ] Resolver conflitos respeitando ambos os lados
- [ ] Validar mini-gateway.cjs contra método
- [ ] Validar Cockpit contra triggers
- [ ] Commit sincronização
- [ ] Push

---

**Status:** Casa agora conectada à fonte de verdade canônica.
**Tempo:** 2026-10-23 ~16:00 BRT
**Próximo turno:** Leitura completa de CONTRACT.yml + UNIVERSAL-ENGINE-METHOD.yml
