---
title: "03 FLUXO DEPLOY"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-09-05
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

## Micro-commits + micro-deploys — padrão oficial da Casa

A Casa promove deltas pequenos e causais sempre que a topologia permitir. O objetivo é reduzir ruído, blast radius e tempo entre observação → correção → prova.

```text
MICRO_COMMIT_POLICY=CANONICAL
MICRO_DEPLOY_POLICY=CANONICAL
ONE_INTENT_PER_MICRO_COMMIT=true
DEPLOY_SCOPE_MUST_MATCH_CAUSAL_SCOPE=true
FULL_DEPLOY_BY_DEFAULT=false
```

### Ordem explícita do CHEFE: main + micro-deploy obrigatório

Quando o SEGREDO/CHEFE der ordem explícita para uma mudança dentro do escopo
autorizado, o trabalho não termina no commit nem no merge:

```text
ORDEM_EXPLICITA_DO_CHEFE
→ MENOR_COMMIT_NA_MAIN
→ BUILD/TESTE_NO_SHA_EXATO
→ MICRO_DEPLOY_DO_MESMO_SHA
→ PROVA_NO_RUNTIME
→ RECEIPT
→ FIXED_POINT
```

```text
EXPLICIT_ORDER_WITHIN_SCOPE=true
COMMIT_TO_MAIN_REQUIRED=true
MICRO_DEPLOY_SAME_COMMIT_REQUIRED=true
MERGED_WITHOUT_MICRO_DEPLOY=MISSION_OPEN
COMMIT_WITHOUT_RUNTIME_PROOF=NOT_FINISHED
DEPLOY_FAILURE=REMEDIATE_AND_CONTINUE
```

O commit fica preservado na `main` mesmo se a primeira tentativa de promoção
falhar; a falha abre remediação do deploy, não invalida nem abandona o delta
correto. Só um bloqueio material após todas as rotas autorizadas pode encerrar
a tentativa com receipt exato; nunca converter `FAILED` em conclusão.

Fluxo oficial:

```text
👑 INTENÇÃO + GOAL
→ 🧿 DELTA MATERIAL
→ ⊛ CAUSA / OWNER
→ 🪡 MENOR CORREÇÃO COMPATÍVEL
→ 🧾 MICRO-COMMIT COM SELO SEMÂNTICO
→ 🧪 GATES APLICÁVEIS NO HEAD EXATO
→ 📦 ARTEFATO/COMPONENTE DO MESMO SHA
→ 🚀 MICRO-DEPLOY DO ESCOPO CAUSAL
→ 🔬 PROVA NO RUNTIME/LOG
→ 🧾 RECEIPT SHA→ARTEFATO→DEPLOY→RUNTIME
→ 🐚 CURSOR PARA CONTINUAR OU REVERTER
```

### Leis de não-confusão

```text
MICRO_COMMIT != MICRO_DEPLOY
MICRO_DEPLOY != GLOBAL_READY
COMMITTED != DEPLOYED
MERGED != DEPLOYED
DEPLOYED_COMPONENT != WHOLE_SYSTEM_DEPLOYED
WORKFLOW_GREEN != RUNTIME_PROOF
OLD_HEAD != PROOF_FOR_NEW_HEAD
UNKNOWN != PASS
```

Um micro-commit registra uma intenção material e reconstruível no Git. Um micro-deploy promove somente o componente/artefato compatível com aquele delta. Nenhum dos dois autoriza dizer que o organismo inteiro está pronto.

### Quando micro-deploy é permitido

Micro-deploy é preferido quando:

- o componente tem owner identificável;
- o artefato pode ser construído/provido isoladamente;
- contratos compartilhados não foram quebrados;
- dependências afetadas são conhecidas;
- rollback do mesmo escopo existe;
- a prova do runtime consegue ligar o resultado ao SHA promovido.

### Quando escalar para deploy maior

Escalar somente quando houver causa técnica real:

- dependência compartilhada mudou;
- contrato/schema global mudou;
- artefato é monolítico/indivisível;
- migração exige coordenação global;
- runtime não suporta promoção isolada;
- deploy parcial criaria incompatibilidade maior;
- o Reality Judge provar que o cone causal atravessa mais de um componente.

### Micro-commit legível no Git

Mensagens automáticas e humanas devem seguir o padrão da Casa:

```text
<SELO> <escopo>: <ação curta ou resultado material>
```

Exemplos:

```text
🤖 deps: atualizar dependências do Bolt
📊 painel: registrar estado da main
🪡 reconciliar: absorver conflito do Dependabot
🧭 router: corrigir failover de modelo
🔊 voz: usar API oficial antes do fallback
🧿 sentinela: detectar drift de rota
🚀 deploy: promover componente do SHA provado
```

O selo é pista semântica, não prova. O SHA, os gates aplicáveis e o receipt do runtime continuam sendo a prova.

### Receipt obrigatório de micro-deploy

Quando houver promoção real, registrar quando aplicável:

```text
MICRO_DEPLOY_ID=
INTENT_GOAL=
COMPONENT=
OWNER=
SOURCE_SHA=
ARTIFACT=
GATES_HEAD_EXATO=
PREVIOUS_RUNTIME=
NEW_RUNTIME=
RESULT=
ROLLBACK_TARGET=
LOG_SOURCE=
RUNTIME_RECEIPT=
NEXT_CURSOR=
```

Se algum campo material estiver desconhecido, manter `UNKNOWN`; não preencher por inferência.

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
+ MICRO_COMMIT_RECONSTRUIVEL
+ MENOR_BUILD
+ MICRO_DEPLOY_CAUSAL
+ MENOR_BLAST_RADIUS
+ PROVA_NO_RUNTIME
= MENOS_E_MAIS
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[PADRAO-RESPOSTA-SEGREDO-CHEFE]] — linguagem e perfis oficiais
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
