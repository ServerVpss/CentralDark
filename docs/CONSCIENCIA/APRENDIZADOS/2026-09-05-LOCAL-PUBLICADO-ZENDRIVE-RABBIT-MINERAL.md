---
title: "2026 09 05 LOCAL PUBLICADO ZENDRIVE RABBIT MINERAL"
date: 2026-09-07
tags: ["consciencia"]
updated: 2026-09-07
---

# 2026-09-05 — Casa local, superfície publicada, Zendrive/Rabbit e minério

📜 **“Examinai tudo; retende o que é bom.”**

## Intenção preservada

A CentralDark é construída para trabalhar na Casa/local com ampla autoridade operacional do Chefe. Essa liberdade local não deve ser confundida com a política das superfícies que serão publicadas, vendidas, entregues a clientes ou oferecidas como plataforma.

## Fronteira operacional

### CASA_LOCAL

- owner humano: SEGREDO/CHEFE;
- pode executar, testar, reconciliar, copiar a própria Casa, abrir múltiplas janelas/agentes e usar múltiplas contas/perfis locais;
- credenciais e sessões ficam no ambiente local autorizado, não no repositório;
- `ZENDRIVER_PROFILE_PATH` e `CENTRALDARK_ZENDRIVE_PROFILES_JSON` permitem adicionar perfis sem criar código novo por conta;
- nenhuma regra de publicação deve amputar a capacidade operacional local sem causa concreta.

### PUBLICADO_CLIENTE_PLATAFORMA

Sites gerados pelo build, produtos vendidos, ambientes de cliente e eventual plataforma pública entram em outra superfície:

- menor privilégio;
- segregação de credenciais;
- proteção de dados do cliente;
- gates de release/deploy;
- receipts presos ao artefato/HEAD;
- rollback e observabilidade;
- nenhuma sessão pessoal do Chefe vira credencial de cliente/publicação.

`CASA_LOCAL != SUPERFICIE_PUBLICADA`.

## Zendrive / ChatGPT

Papel atual: **REVIEW_ONLY**.

Fluxo:

`PR/código → Zendrive em sessão local autenticada → revisão → coderabbit-bridge → Signal Watcher → Hermes reproduz/testa/contraprova`.

Regras:

- Zendrive não faz merge;
- Zendrive não é juiz;
- Zendrive pode usar qualquer perfil local explicitamente configurado pelo Chefe;
- cada perfil/sessão preserva provenance;
- ausência de sessão/receipt = `UNKNOWN`, nunca PASS;
- revisão é finding, não prova.

## CodeRabbit / Rabbit da Casa

O CodeRabbit continua revisor externo read-only. A bridge local agrega sinais do Rabbit e da revisão Zendrive e os envia ao Signal Watcher.

`RABBIT_REVIEW + ZENDRIVE_REVIEW → CANDIDATE`.

Hermes é quem deve executar o teste discriminante e produzir receipt.

## Lei do minério

Nada útil é descartado:

- `CANDIDATE + PROVA → CRYSTAL_GOLD`;
- `CANDIDATE + CONTRAPROVA → REFUTED_MINERAL`;
- `UNKNOWN/BLOCKED → UNRESOLVED_MINERAL`;
- `NO_DELTA/OBSERVED → MEMORY_MINERAL`.

Minério não promove código, mas preserva:

- hipótese;
- por que falhou;
- evidência;
- owner;
- next cursor;
- condição de reabertura.

`REFUTED != LIXO`.

## Dependabot Radar

O owner existente foi estendido para:

1. tentar `Update branch` mesmo com checks pendentes;
2. quando houver conflito provado, chamar `scripts/dependabot/resolve-conflicts.sh`;
3. usar worktree isolado para não trocar a branch da Casa principal;
4. varrer todos os PRs Dependabot abertos, oldest-first, incluindo antigos;
5. nunca usar essa reconciliação como autorização de merge;
6. permitir auto-merge apenas para PATCH sob a política já existente.

## Zero Trust reverso contra papagaio

Para cada afirmação de funcionamento:

`DESTINO → RECEIPT → AÇÃO → INPUT → SOURCE → OWNER`.

Se a cadeia não volta até uma fonte mensurável, o claim não sobe para PROVADO.

Ao mesmo tempo, claim já selado não é reaberto por rotina:

`SEALED_CLAIM + NO_NEW_CAUSE → REUSE_PROOF`.

Só reabre com `REOPEN_CAUSE_REF` ou mudança temporal que exija re-medição.

## BOOT desta frente

`!CENTRALDARK → CENTRALDARK_AI_BOOT → FIXED_POINT`

O FIXED_POINT só fecha depois de:

- source atual;
- teste/contraprova quando aplicável;
- receipt;
- residual explícito;
- NEXT_CURSOR.

## Pendência externa separada

Permissões de Workspace/Drive, quando necessárias para sincronizar artefatos, são uma dependência de integração externa. Não devem transformar a Casa local em bloqueada nem virar desculpa para reabrir capacidades locais já comprovadas.
