# SOL — CONTRAPROVA INDEPENDENTE DO CASCO VIVO

Status: CANDIDATE_FOR_REVIEW
Author-Surface: SOL / ChatGPT
Intent-Authority: SEGREDO/CHEFE
Base-Measured: `main@01135a7eca5ed6375860e35578a6db23deed34f9`
Mode: PAPAGAIO_MODE=OFF | POMBO_MODE=CHECKSUM_ON

## Objetivo

Registrar uma contraprova independente do perfil CASCO VIVO sem transformar o próprio autor do claim em juiz final. Este artefato não declara runtime universal, deploy ou fixed point global.

## Claim sob teste

O CASCO VIVO pode absorver perturbação alterando meios operacionais sem deformar autoridade, intenção, fronteira, writer, padrão de prova ou REALITY_IS_JUDGE.

## Contraprovas

### 1. Flexibilidade externa não autoriza substituição cega

`MODEL_UNAVAILABLE -> SWITCH_ENGINE` só é válido após prova de capacidade suficiente para o alvo. Motor substituível não significa motor equivalente.

### 2. Dependência caída não implica degradação segura

Dependência crítica deve `FAIL_CLOSED`/`CONTAIN`. Dependência não crítica só pode degradar se o modo degradado tiver segurança e semântica compatíveis provadas.

### 3. UNKNOWN deve bloquear o delta afetado, não congelar a Casa inteira

`UNKNOWN_MATERIAL` invalida PASS e bloqueia mutação causalmente dependente daquele desconhecido. Trabalho independente, reversível e comprovadamente seguro pode continuar.

### 4. Zero absoluto exige denominador

Claims como `HIDDEN_PATHS=ZERO`, `SHADOW_AUTHORITY=ZERO` e `SECRET_OVERRIDE=ZERO` não são PASS global sem inventário/denominador e teste correspondente. Sem isso: `NOT_PROVEN`.

### 5. Contrato no Git não prova herança de runtime

`MERGED_TO_MAIN != DEPLOYED`

`DOCUMENTED != EXECUTED`

`TRIGGER_DECLARED != TRIGGER_FIRED`

`PROFILE_PRESENT != UNIVERSAL_RUNTIME_INHERITANCE`

### 6. Writer não julga a própria mutação

A superfície que propõe/escreve este delta não pode converter a própria escrita em prova final. O PR, checks/review aplicáveis e realidade observável constituem o caminho de julgamento.

## Invariantes que devem sobreviver à perturbação

```text
CHEFE_AUTHORITY
INTENT / DESTINATION_LOCK
BOUNDARY
ONE_WRITER_PER_SCOPE
PROOF_STANDARD
REALITY_IS_JUDGE
UNKNOWN_IS_NOT_PASS
```

## Meios que podem mudar quando a evidência permitir

```text
MODEL
TOOL
ROUTE
ORDER
FREQUENCY
WORKER
RETRY_STRATEGY
OBSERVATION_CHANNEL
```

## Delta amarrado — SIGNAL / SONIC EVENT ADAPTER

Material de inspiração fornecido pelo SEGREDO/CHEFE: `https://www.tibiawiki.com.br/wiki/Instrumentos_Musicais`.

A matéria externa não cria novo cérebro, novo agente, novo Judge ou novo owner por si só. O princípio reutilizável é tratar instrumentos/sinais como **emissores observáveis** que alimentam percepção e correlação temporal da mesma Casa.

```text
GAP_DE_CEREBRO = FALSE
GAP_DE_OWNER = FALSE
GAP_DE_ARQUITETURA_PARALELA = FALSE
DELTA_DE_CAPACIDADE = TRUE
REUSE_BEFORE_CREATE = TRUE
```

### Abstração operacional

```text
EMITTER
+ SIGNATURE
+ TIMESTAMP
+ SOURCE
+ CONTEXT
+ EXPECTED_EFFECT
+ OBSERVED_EFFECT
```

O canal pode ser som, voz, legenda, evento do navegador, terminal, CI, webhook, log, mudança visual ou sensor futuro. O canal é meio substituível; não governa a intenção nem o veredito.

### Fluxo integrado no CASCO VIVO

```text
SEGREDO/CHEFE
  -> INTENT / DESTINATION_LOCK
  -> #ACORDAR / !CALIBRAR / !MULTIBUSSOLA
  -> SOL
  -> GRAFO + VIGIA + ORQUESTRACAO
  -> SIGNAL_EVENT_ADAPTER
       -> AUDIO
       -> EVENT
       -> VISUAL
  -> T0 -> EVENT -> T1
  -> META_LUPA
  -> BOUNDARY/GATE
  -> WRITER_UNICO
  -> HERMES
  -> EFEITO_OBSERVAVEL
  -> JUDGE
  -> PROVA + CONTRAPROVA
  -> RECEIPT + NEXT_CURSOR
  -> PROXIMO #ACORDAR
```

### Cadeado causal

Sinal não é prova de execução.

```text
SOM_TOCADO != ACAO_EXECUTADA
NOTIFICACAO_APARECEU != CI_PASSOU
VOZ_DISSE_PRONTO != DESTINO_PROVADO
EVENTO_OBSERVADO != CAUSA_PROVADA
```

Todo sinal entra primeiro como observação/hypótese e só sobe para causalidade após correlação, teste discriminante e efeito observável compatível.

### Classificação mínima de sinais

```text
SIGNAL_ONLY
STATE_CHANGE
ACTION_TRIGGER
DECORATIVE
UNKNOWN_EFFECT
```

`UNKNOWN_EFFECT` permanece `NOT_PROVEN` para qualquer claim que dependa de seu significado.

### Pombo com sinal transportável

O receipt pode carregar telemetria adicional sem substituir as provas já existentes:

```text
RECEIPT
+ HEAD/SHA
+ TIMESTAMP
+ EVENT_SIGNATURE
+ SOURCE
+ EXPECTED_EFFECT
+ OBSERVED_EFFECT
+ T0/T1
+ RESIDUAL_UNKNOWN
```

Isso amplia `POMBO_MODE=CHECKSUM_ON`: transportar contexto verificável entre superfícies sem transformar narrativa, áudio ou evento em verdade automática.

### Owner e mutação

Este PR **não promove** `SIGNAL_EVENT_ADAPTER` a owner novo. A implementação futura deve resolver o owner canônico existente de percepção/observabilidade e só criar matéria nova se `GAP_REAL` for provado. Até lá, este bloco é contrato arquitetural candidato dentro da mesma família do CASCO VIVO.

## Teste discriminante

```text
T0 = baseline medido
PERTURBATION = evento classificado
ADAPTATION = delta mínimo e reversível
T1 = estado re-medido

PASS somente se:
DESTINATION_PRESERVED
AND INNER_HULL_INVARIANTS_PRESERVED
AND BOUNDARY_PRESERVED
AND WRITER_CLEAN
AND CLAIM_PROVEN
AND COUNTERPROOF_SURVIVED
AND NO_MATERIAL_UNKNOWN_FOR_THE_VERDICT
```

Para eventos/sinais, acrescentar quando aplicável:

```text
SIGNAL_SOURCE_IDENTIFIED
AND SIGNAL_TIMESTAMPED
AND EXPECTED_EFFECT_DECLARED
AND OBSERVED_EFFECT_MEASURED
AND SIGNAL_IS_NOT_USED_AS_CAUSAL_PROOF_BY_ITSELF
```

Caso contrário:

```text
NOT_FIXED_POINT
-> LOCALIZE_RESIDUAL
-> OWNER_EXISTENTE
-> MINIMUM_DELTA
-> REMEASURE
```

## Veredito desta SOL

O desenho CASCO VIVO é coerente como perfil da Trigger Fabric quando interpretado como adaptação de meios sob invariantes rígidos. A contraprova rejeita generalizações universais sem denominador e rejeita inferir runtime/deploy a partir do merge documental.

O delta `SIGNAL / SONIC EVENT ADAPTER` é coerente como extensão de percepção/observabilidade **sem novo governo**: evento vira dado; dado vira hipótese; somente teste e efeito observável podem sustentar causalidade.

Este veredito é uma proposta auditável em PR, não auto-prova.

## BOOT

`CLAIM -> COUNTERPROOF -> PR -> EXTERNAL_JUDGE -> REALITY`

## Fio

`pressão -> sinal -> hipótese -> tentativa de derrubar -> efeito observável -> limites explícitos -> revisão independente -> somente então promoção`
