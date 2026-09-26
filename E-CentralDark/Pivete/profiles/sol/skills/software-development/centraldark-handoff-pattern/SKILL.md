---
name: centraldark-handoff-pattern
description: >
  Reusable handoff pattern for CentralDark sessions. Produces a
  FILTERED, ONLY-UTIL handoff in the canonical === HANDOFF CHATGPT ===
  format for the CHEFE to deliver to ChatGPT. Saves/keeps simple,
  learns what it can, blocks on blockers instead of returning "state
  understood + question".
version: 1.0.0
tags: [handoff, centraldark, pattern, reusable, filtered]
category: handoff
---

# CentralDark Handoff Pattern

## O que é

Padrão reutilizável de handoff para sessões do CentralDark. Produz um handoff
**filtrado, só o útil**, no formato canônico `=== HANDOFF CHATGPT ===` ...
`=== END HANDOFF ===`, pronto para o CHEFE copiar e entregar na conversa do
ChatGPT quando quiser.

Não é entrega automática. Hermes prepara inteligência; CHEFE decide quando
entregar.

## Gatilhos de uso

Use quando:
- sessão com dados minerados/reconciliados/compactados prontos para handoff
- CHEFE pede "handoff", "padrão de handoff", "monstrar pra copiar"
- qualquer situação que precise de handoff filtrado, não plano

Não use para:
- trabalho que ainda não tem material para filtrar (deixe como OPEN_GAPS)
- coisa que ainda não foi validada (deixe como pendente ou blocker)

## Gatilhos que ativa ou reutiliza

Este padrão é um output, não um gatilho independente. Ele se ancora nos
gatilhos canônicos:

- `#ACORDAR` + `!CALIBRAR`: recuperar estado real antes, alinhar interpretação
- `!MULTIBUSSOLA`: quando precisa de matriz multidirecional (owner MULTIBUSSOLA.md)
- `#CRISTALIZAR`: quando cliente quer cristalizar aprendizado (alias
  centraldark-pattern-intelligence)
- `#FABLE_LOOP`: quando operação é autoload distribuído sobre !CENTRALDARK
  master funnel (skill fable-loop)

## Regras do padrão (hard rules)

1. Nada inventado. Se falta material, é OPEN_GAPS, não inventado.
2. Lacunas explícitas: UNKNOWN, OPEN_GAPS, SUPERSEDED_HISTORY para o que mudou.
3. Handoff completo, BLOCKER REAL ou DECISÃO HUMANA MATERIAL — nunca plano ("estado
   + pergunta").
4. Filtro útil vs lixo: só entra o útil; lixo fica fora.
5. Zero regressão: verificar que nada que já funcionava quebrou. Se não verificado,
   registrar como pendente/UNKNOWN, não afirmar "provado".
6. Meta Lupa / contraprova antes de fechar. Se não aplicada, registrar como pendente.
7. Consumidor final = ChatGPT do CHEFE. Figma/Slack = só apoio, não destino.
8. Writer único por escopo. PR #1381 é owner vivo do escopo de reconciliação
   fixed point (declared by CHEFE). Sem escrita sem declaração.
9. Gatilhos fixos mapeados e carregados, não inventados.

## Formato do handoff (template de saída)

Ver template: `references/HANDOFF_TEMPLATE.md`

Campos obrigatórios:

- MEASURED_AT
- CENTRALDARK_BRANCH
- CENTRALDARK_HEAD
- ACTIVE_PR
- WRITER_SCOPE
- NOTEPAD (WINDOWS_FOUND, TABS_FOUND, UNSAVED_TABS, FILE_BACKED_TABS)
- DEDUPED_ITEMS
- SENSITIVE_QUARANTINED
- HISTORICAL_ITEMS
- CURRENT_CANDIDATES
- FORMAT_VERIFIED
- CURRENT_FACTS
- SUPERSEDED_HISTORY
- OPEN_GAPS
- CONTRADICTIONS
- IPNAMES_DELTA
- UNKNOWN
- NEXT_SAFE_ACTION

## Como evoluir (aprender o que der)

Todo dia o padrão:
- Salva o handoff filtrado, só o útil, no formato.
- Registra o que puder (owners, protocolos, regras, gatilhos, evidências).
- Mantém simples. Remove o que não serve.
- Aprende o que der (novos campos, novos gatilhos, novas regras). Não acumula lixo.
- Quando surge gap real (ex: critério de filtro, acesso a material), registra como
  OPEN_GAPS ou BLOCKER, não inventa.

## Integrantes reais (owners)

- **session-intelligence-harvester**: mineração Notepad (120 .bin, 42 tabs, 4.641
  linhas, 3 sensíveis). Estrutura WindowState/TabState. Protocolo extrair→classificar→reconciliar.
- **knowledge-compiler**: FORJA INGEST→EXTRACT→DEDUPE→COUNTERPROOF→ARBITRATE_CONFLICTS→CLASSIFY→SELECT→BUILD→VERIFY→CRYSTALIZE→FLASH_READY.
- **meta-lupa**: counterproof/falsification sobre cristais ou sobre o próprio pipeline.
- **PR #1381**: owner vivo do escopo de reconciliação fixed point (branch
  feat/fixed-point-fabric-proof-20260831, HEAD informado da89bb30, writer único).
- **PR #1393**: SOUL Reanchor Bootstrap (sol/soul-reanchor-bootstrap-20260901, OPEN/UNSTABLE).

## Histórico relevante (sem detalhes inventados)

- handoff anterior (2026-08-28): afirmações de Notepad LocalState (2 janelas, 30 abas) —
  INVALIDADAS porque LocalState não existe mais nesse ambiente (mudança real de
  ambiente, SUPERSEDED_HISTORY). "NENHUMA CONTRADIÇÃO ENCONTRADA" também invalidado.
- CLASSIFICAÇÃO_RASTRO (execução anterior):
  14.252 itens, 8.790 SHAs únicos, 2.875 grupos duplicados, 8.337 linhas DUPLICATE,
  62 SENSITIVE_QUARANTINE, 5.877 HISTORICAL_REFERENCE, CURRENT_CANDIDATE=0;
  hash SHA256: 514d4ce7ae4cd2a07c26fe910f1efa52122f6000da181d07c464e48716da2483.
  Se usado, registrado como HISTORICAL ou revalidado, não CURRENT_LIVE.

## Dicas de uso

- Quando o CHEFE pede o handoff, entrega no formato. Sem panorama, sem "estado
  compreendido", sem plano. Só o que tem.
- Se faltar material para filtrar, diz o que falta (OPEN_GAPS) e para — não inventa.
- Se quiser filtrar o Notepad agora, me dá o conteúdo das tabs ou o critério de filtro.
- Sem emoji inventado. Sem papagaio. Sem "observei que você abriu cinco fronts".
- Escrever direto, sem montar.

## Exemplo de uso

```
#ACORDAR
!CALIBRAR
... (medir estado, reconciliar)
#CRISTALIZAR (se quiser cristalizar aprendizado)
... (gerar handoff filtrado no formato)
```

---

## Status

- Status: CANÔNICO (padrão de sessão, não projeto)
- Atualizado: 2026-09-01
- Owner: Casa (Hermes-Casa + SEGREDO/CHEFE)
- Consumidor final: conversa ChatGPT do CHEFE

---

## Regra simples de uso

Todo dia: salvar o handoff filtrado, só o útil, no padrão.
Registrar o que puder. Manter simples. Aprender o que der.
