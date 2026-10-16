---
title: "Reconciliação de Escopos de PR — CentralDark Instinto Superior"
date: 2026-10-15
status: "FERIDAS MAPEADAS"
---

# 🔍 Reconciliação de Escopos — PRs com Sobreposição

## Contexto

Após integrar PR #1806 (Instinto Superior) na main, foram identificadas três áreas críticas com múltiplas PRs tocando o mesmo componente. Isso viola o princípio **ONE_WRITER_PER_SCOPE**.

---

## 🚨 Ferida 1: HUD / Observabilidade

| PR | Título | Status | Data Merge | Owner |
|----|--------|--------|-----------|-------|
| #1551 | HUD unificado integrado ao cockpit existente | ✅ MERGED | ? | ? |
| #1709 | convergência do owner visual do Instinto Superior | ✅ MERGED | ? | ? |
| #1748 | protótipo instalável AionUi/CentralDark | ✅ MERGED | ? | `apps/modulos/AionUi` |
| #1757 | HUD (histórico) | ❌ CLOSED | ? | (substituído) |

### Diagnóstico

- Três implementações visuais distintas (AionUi, Cockpit Shell, Instinto Visual)
- Não está claro qual é consumida pelo **CentralDark.exe** instalado
- #1757 foi marcada como "substituída", mas não consta qual PR a substitui

### Ação Necessária

1. Identificar qual implementação é a **fonte de verdade** para HUD no .exe
2. Verificar `public/central-dark-instinct-2` vs `CentralDarkCockpitShell.client.tsx` vs AionUi
3. Documentar qual PR é o **writer atual** para HUD
4. Remover duplicações (se houver)

---

## 🚨 Ferida 2: Cockpit Desktop

| Componente | Local | Status | Writer |
|------------|-------|--------|--------|
| CockpitShell | `CentralDarkCockpitShell.client.tsx` | ✅ Existe | ? |
| Instinto Desktop | `apps/instinto-superior/` | ✅ Existe | #1709 |
| Cristal Gabinete | PR #1617 | ✅ MERGED | ? |

### Diagnóstico

- Existem **dois cockpits** potencialmente distintos
- `CentralDarkCockpitShell` é do Remix/Bolt
- Instinto Superior tem seu próprio cockpit Desktop
- Não está claro qual é **consumido pelo .exe** quando inicia

### Ação Necessária

1. Verificar qual cockpit **realmente abre** quando CentralDark.exe inicia
2. Se há dois, qual é o **writer designado** para cada?
3. Devem ser consolidados em **um único cockpit** (conforme intenção)
4. Documentar a decisão de arquitetura

---

## 🚨 Ferida 3: Hermes / Executor

| PR | Título | Status | Toca |
|----|--------|--------|------|
| #1804 | consumidor cognitivo (HUD/Reality Judge) | ? | Hermes executor |
| #1816 | FIX(AI-ANDARILHO): BIND CASA TRAVERSAL | ✅ MERGED | Hermes executor |

### Diagnóstico

- #1804 menciona "consumidor cognitivo" mas status é desconhecido
- #1816 mexe em traversal da Casa (parte da ponte Hermes)
- Ambas **tocam no mesmo executor único** (violação ONE_WRITER_PER_SCOPE)
- Não consta se #1804 foi mergeada ou reconciliada com #1816

### Ação Necessária

1. Verificar se PR #1804 está mergeada, aberta ou rejeitada
2. Se ambas estão mergeadas, verificar se há conflitos de lógica
3. Identificar qual é o **writer designado** para Hermes
4. Reconciliar traversal e lógica cognitiva em um escritor único

---

## 📊 Tabela de Reconciliação

```
Componente      | Writer Atual | Status      | Próximo Passo
────────────────┼──────────────┼─────────────┼──────────────────
HUD             | ? (CONFLITO) | FERIDA      | Consolidar → 1 owner
Cockpit         | ? (CONFLITO) | FERIDA      | Consolidar → 1 owner
Hermes Executor | ? (POSSÍVEL) | VERIFICAR   | Reconciliar PRs
```

---

## 🎯 Princípios Vigentes

- **ONE_WRITER_PER_SCOPE:** Cada componente tem um owner exclusivo
- **REUSE_BEFORE_CREATE:** Não criar nova implementação se existe uma viável
- **ONE_SYSTEM_ONLY:** Não há paralelismo de executores ou cockpits

---

## ✅ Próximas Ações

1. **Build do Instinto com PR #1806 mergeada** ⏳ (em progresso)
2. **Testar CentralDark.exe com novo build** → verificar qual cockpit abre
3. **Reconciliar HUD** → identificar implementação consumida
4. **Verificar PR #1804** → status e compatibilidade com #1816
5. **Documentar decisão de arquitetura** → um cockpit, um HUD, um writer por escopo

---

## Registrador

**Data:** 2026-10-15 03:35 UTC-02  
**Por:** SOL / COORDENAÇÃO  
**Referência:** `docs/CONSCIENCIA/RECONCILIACAO-ESCOPOS-PR-20261015.md`  
**Status:** FERIDAS MAPEADAS — AGUARDANDO BUILD + VERIFICAÇÃO RUNTIME

<!-- #OBSERVACOES# | CENTRALDARK.HUD.PAPAGAIO_ON
@owner: docs/CONSCIENCIA/RECONCILIACAO-ESCOPOS-PR-20261015.md
@code_ref: apps/instinto-superior/src/components/central/CockpitShell.tsx
@code_ref: apps/instinto-superior/src/components/central/PapagaioHudMcp.tsx
@last_updated: 2026-10-16T12:19:56.233Z
@estado: SOURCE_IN_PR; CI_BUILD_RUNTIME_NOT_YET_VERIFIED
@next_cursor: medir frontend e recibos MCP antes de promover main.
-->

## 🦜 PAPAGAIO ON · 10 missões e 7 seções dentro do HUD existente (16/10/2026)

**Owner** `CockpitShell.tsx`; componente exclusivamente visual `PapagaioHudMcp.tsx`. Mesma consulta `lerEstadoCentralDark`, mesmos tokens/peles, sem novo app/serviço/sensor/cache ou segunda autoridade. Não confundir este componente com uma segunda implementação de HUD: é a **seção adicional dentro do HUD de estado** existente.

**Invariantes do GIF aprovado:** 01 Placar Geral → 02 Mapa das Missões na ordem original (10) → 03 Raio-X → 04 Chefões → 05 Radar de Provas → 06 Próxima Jogada → 07 Vitória. Ref imagem: `CENTRALDARK-PAPAGAIO-ON-HUD-FIXO-20261016.png` exibida na conversa (não é caminho publicado em produção).

**Melhoria concreta:** leitura histórica 50% (5 concluídas, 2 em andamento, 3 pendentes, datada de 13/10) marcada explicitamente `HISTORICAL`, nunca como CURRENT. Todos os estados de missão são `SEM READBACK` até existirem receipts por missão. O componente usa dados do hook existente `lerEstadoCentralDark` e somente aceita sensores frescos (até 90 segundos, sem erro); falha/stale vira UNKNOWN. PRs e status CI aqui são referência datada de 16/10 com links, **não** APIs de checks em tempo real. Não confundir billing de GitHub Actions com estado das gates.

**Rastro e cadeado:** `TOCOU→#OBSERVACOES#+DOC→TESTE→CONTRAPROVA→RECEIPT→SELO`. Novos estados e percentuais apenas mediante prova; skin Esmeralda continua regida pelo `usePeleCockpit` existente. Responsividade, contraste e navegação via `<details>` do HTML sem criar outro mecanismo.

**Pendente:** build real de frontend e render mobile/desktop nas quatro peles, readback do cockpit publicado, owner MCP para 10 recibos individuais, atualização live por PR se já existir API no cockpit, PR CI e integração main; não reivindicar instalação ou selo.
