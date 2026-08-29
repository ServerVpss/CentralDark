---
title: "03 FLUXO DEPLOY"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-08-14
---

# 03 — Fluxo de deploy

## Regra principal

A CentralDark deve ficar **visível e observável cedo**. O fluxo de desenvolvimento autorizado é:

```text
SUBIR
→ SEGREDO/CHEFE VER
→ CLICAR
→ APONTAR DELTA
→ LOCALIZAR CAUSA
→ CORRIGIR MENOR ESCOPO
→ REDEPLOY
→ PROVAR NO RUNTIME/LOG
→ REPETIR
```

`PRODUCTION_FIRST` não significa falso verde. Significa usar o runtime real como fonte de observação sem exigir perfeição global antes da primeira visualização.

## Deploy causal / menor blast radius

```text
DEPLOY_STRATEGY=CAUSAL_SCOPE_FIRST
FULL_DEPLOY_BY_DEFAULT=false
```

Se somente um componente está quebrado e a arquitetura permite promoção isolada:

```text
FALHA_LOCAL
→ COMPONENTE_CAUSAL
→ DEPENDENCIAS_AFETADAS
→ CORRECAO_LOCAL
→ BUILD/TESTE_DO_ESCOPO
→ DEPLOY_DO_COMPONENTE
→ PROVA_LOCAL
→ RESTANTE_CONTINUA_VIVO
```

Full deploy somente quando houver causa técnica real:

- dependência compartilhada mudou;
- contrato/schema global mudou;
- artefato é monolítico/indivisível;
- migração exige coordenação global;
- runtime não suporta promoção isolada;
- deploy parcial criaria incompatibilidade maior.

Não confundir `workflow atual redeploya tudo` com `necessidade técnica exige tudo`.

## O que não bloqueia a primeira visualização

Não exigir antes do primeiro runtime visível:

- UI perfeita;
- todas as integrações READY;
- todas as APIs configuradas;
- dívida histórica zerada;
- convergência adversarial global;
- MetaLupa global completa.

Integração opcional ausente fica `MISSING/LOCKED`; o restante continua vivo.

## Critério de LIVE

Não declarar LIVE só por:

```text
HTTP 200
PM2 online
DNS resolvendo
workflow verde
health verde
```

Para a camada que está sendo publicada, provar o suficiente para o SEGREDO/CHEFE observar e depurar:

```text
domínio/rota acessível
UI/runtime real renderiza
SHA/artefato/runtime identificável
uma ação mínima real funciona
log/auditoria registra a ação
rollback/redeploy existe
```

Erro controlado deve aparecer sanitizado quando aplicável.

## Logs obrigatórios

Reutilizar logging/auditoria canônicos. Não criar segundo sistema de log sem GAP_REAL.

No recibo de deploy, quando aplicável:

```text
DEPLOY_ID=
COMPONENT=
SOURCE_SHA=
ARTIFACT=
STARTED_AT=
FINISHED_AT=
RESULT=
PREVIOUS_RUNTIME=
NEW_RUNTIME=
ROLLBACK_TARGET=
LOG_SOURCE=
LOG_RUNTIME_PATH=
LOG_COMMAND=
ADMIN_LOG_VIEW=
LAST_ERROR_LOCATION=
```

Nunca logar token, senha, Authorization, cookie ou valor de secret.

## Convergência e Judge

Validação operacional proporcional continua obrigatória; **convergência adversarial total não é gate automático de deploy**.

```text
ROTINA_AUTORIZADA
→ teste aplicável
→ segurança
→ rollback
→ log
→ prova do runtime
→ LIVE/ERRO_REAL

CONVERGENCIA_TOTAL
→ somente quando SEGREDO/CHEFE solicitar
   para provar autonomia, arquitetura, robustez ou generalização
```

MetaLupa pode tentar falsificar internamente um resultado crítico e bloquear falso verde sem abrir swarm/assembleia.

## Autorização vigente

As autorizações persistentes aplicáveis estão em `docs/CONSCIENCIA/02-PERMISSOES.md`. Não pedir novamente autorização já concedida para o mesmo escopo e classe de ação.

Estado mensurável por GitHub/VPS/Cloudflare/Contabo/tools deve ser medido pela máquina, não devolvido ao SEGREDO/CHEFE como tarefa manual.

## Instalador

Mudança que afete dependência, porta, variável, serviço, pasta, rota ou migração deve atualizar o mecanismo de instalação/documentação correspondente quando ele for consumidor real da mudança.

## Regra final

```text
MENOR_CODIGO
+ MENOR_BUILD
+ MENOR_DEPLOY
+ MENOR_BLAST_RADIUS
+ PROVA_NO_RUNTIME
= MENOS_E_MAIS
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
