---
title: "Guardião modo propor — decisão histórica"
status: "HISTORICAL_DECISION"
updated: 2026-08-14
---

# Guardião da Consciência — decisão histórica

Este arquivo registrou uma regra de 25/06/2026 com janela temporal que já passou. Ele **não deve mais se apresentar como regra oficial vigente sem medir código/runtime atual**.

## Identidade

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
PIVETE/HERMES = executor, preservação e continuidade
```

O `Pivete (dono do projeto)` citado historicamente é `LEGACY_ALIAS_OF_SEGREDO_CHEFE`.

## O que permanece como princípio

- mudança automática de organização exige causa, teste, observabilidade e rollback;
- data antiga por si só não prova que modo `auto` foi ativado;
- logs/testes documentados precisam ser confirmados no código/runtime atual antes de afirmar PASS.

## O que NÃO pode ser herdado como estado atual

```text
DATA_LIBERACAO_AUTO
modo atual do Guardião
PM2 atual
tests atuais
heartbeat/painel atual
aprovação pendente antiga
```

Para operar o Guardião hoje:

```text
#ACORDAR
→ abrir infra/guardiao/ atual
→ medir configuração/runtime
→ reconciliar docs
→ aplicar autorização vigente de SEGREDO/CHEFE
```

O conteúdo anterior permanece no histórico Git para proveniência.
