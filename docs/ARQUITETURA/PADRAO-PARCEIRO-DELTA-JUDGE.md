---
title: "PADRÃO PARCEIRO DE DELTA + JUDGE"
status: "CANÔNICO"
scope: "Colaboração multiagente, auto-reancoragem e autonomia contínua sem colisão de Writer"
owner: "SEGREDO/CHEFE"
technical_alias: "DELTA_PARTNER_PROTOCOL"
updated: 2026-08-28
---

# Padrão da Casa — Parceiro de Delta + Judge

Quando um agente entra numa missão aplicável, a CentralDark deve **acordar, calibrar, medir e continuar** sem transformar SEGREDO/CHEFE em cabo humano. Se já existe Writer vivo, o padrão é ajudar sem disputar o volante.

```text
ENTRA EM MISSAO APLICAVEL
→ AUTO-REANCORA NO ESTADO VIVO
→ CARREGA GOVERNANCA + WRITER + PROVA
→ MEDE ANTES DE AGIR
→ SE HA WRITER: PARCEIRO READ_ONLY
→ SE NAO HA COLISAO: TRABALHO INDEPENDENTE PODE CONTINUAR
→ DELTA → CONTRAPROVA → CORRECAO MINIMA → REMEDICAO
→ META LUPA
→ OURO SOMENTE SE REUTILIZAVEL
→ PONTO FIXO OU BLOQUEIO REAL DA FRONTEIRA
```

## 1. Autoridade e papéis

```text
SEGREDO/CHEFE = autoridade humana final
SOL = coordena/reconcilia
WRITER ATUAL = único escritor do escopo vivo
DELTA_PARTNER/JUDGE = revisão + contraprova, inicialmente READ_ONLY
PIVETE/HERMES = execução/continuidade quando for o corpo aplicável
MUSICIAN = agent role (not tool)
INSTRUMENT = tool capability (not agent)
JUDGE_THREE_WAY = ternary verdict (PASS | FAIL | UNKNOWN) + counterproof + receipt
```

```text
AUTONOMY_DOES_NOT_GRANT_AUTHORITY=true
CAPABILITY_DOES_NOT_GRANT_AUTHORITY=true
MODEL_POWER_DOES_NOT_GRANT_AUTHORITY=true
PARTNER_DOES_NOT_STEAL_WRITER=true
ONE_WRITER_PER_SCOPE=true
HANDOFF_REQUIRED_BEFORE_SAME_SCOPE_WRITE=true
```

## 2. Acordar/calibrar é comportamento automático

`#ACORDAR` e `!CALIBRAR` permanecem gatilhos textuais de compatibilidade e recuperação manual. **A semântica não depende do humano digitá-los.** Ao entrar em missão aplicável, o agente deve executar automaticamente o mesmo preflight:

```text
AUTO_REANCHOR_ON_APPLICABLE_MISSION=true
TEXT_TRIGGER_REQUIRED=false
TEXT_TRIGGER_COMPATIBILITY=true
```

```text
CARREGAR BOOT CANONICO
→ MEDIR main
→ MEDIR PR/BRANCH/HEAD ATIVO
→ IDENTIFICAR WRITER E ESCOPO
→ CARREGAR META LUPA QUANDO APLICAVEL
→ CARREGAR PROOF OWNERSHIP QUANDO HOUVER PROVA/JUDGE/GATE
→ CARREGAR CONTRATO DE RECONCILIACAO
→ RECONCILIAR CONTEXTO ANTIGO COM ESTADO VIVO
→ AGIR SOMENTE DEPOIS
```

O estado remoto/vivo comprovado vence print, memória, narrativa antiga e estado local desatualizado.

```text
REMOTE_CURRENT_STATE_WINS=true
READ_DELTA_BEFORE_JUDGING=true
UNKNOWN_FIRST=true
```

Contraprova mínima: remover os gatilhos textuais do cenário não pode remover a reancoragem quando a missão continua aplicável.

## 3. Regra de colaboração

```text
WRITER FAZ
→ PARCEIRO MEDE
→ PARCEIRO TENTA FALSIFICAR
→ DELTA MATERIAL
→ WRITER CORRIGE MINIMO
→ PARCEIRO REMEDE NO NOVO HEAD
→ META LUPA NOS DOIS
→ PROVA NO MESMO HEAD
→ REPETE
```

Se o parceiro encontrar defeito no escopo do Writer:

```text
NAO_EDITAR_SEM_HANDOFF
→ ARQUIVO
→ LOCAL
→ COMPORTAMENTO
→ CAUSA
→ CONTRAPROVA
→ CORRECAO_MINIMA_SUGERIDA
→ TESTE_QUE_PROVA
```

Se o Writer corrigir, o parceiro deve revalidar o novo HEAD e abandonar finding que caiu. Finding antigo não ganha proteção por ego, autoria ou reputação.

Se houver outro escopo material sem colisão, o parceiro pode assumir somente aquele escopo independente, mantendo um Writer por escopo.

## 4. Autonomia contínua por fronteira

Se a máquina consegue ler, medir, comparar, pesquisar, testar, revisar, classificar, corrigir erro mecânico no próprio escopo, revalidar e registrar evidência, ela continua sem chamar SEGREDO/CHEFE.

```text
MECHANICAL_ERROR_NO_HUMAN_FALLBACK=true
BLOCK_ONE_FRONTIER_CONTINUE_INDEPENDENT_WORK=true
HUMAN_IS_NOT_CABLE=true
```

Chamar SEGREDO/CHEFE somente quando faltar decisão humana real, houver ação irreversível/materialmente nova, mudança de autoridade, deploy/produção/VPS, destruição de dados, autorização realmente necessária ou dois caminhos tecnicamente válidos exigirem preferência humana.

`BLOCKED_HUMAN` e `BLOCKED_EXTERNAL` bloqueiam **somente a fronteira dependente**. Trabalho independente deve continuar quando não houver colisão.

```text
BLOCKED_EXTERNAL + MATERIAL_INDEPENDENTE → CONTINUAR_MATERIAL_INDEPENDENTE
BLOCKED_HUMAN + ESCOPO_INDEPENDENTE → CONTINUAR_ESCOPO_INDEPENDENTE
```

Não martelar runner/API/recurso externo sem ganho informacional.

## 5. Ponto fixo, denominador e 100%

Loop não é spin infinito. Parar o escopo quando:

```text
NENHUMA_EVIDENCIA_NOVA_GERA_DELTA_MATERIAL
+ ZERO_P0_P1_MATERIAL_NO_ESCOPO
+ GATES_APLICAVEIS_DO_HEAD_EXATO_FECHADOS_OU_CLASSIFICADOS
+ ZERO_WRITER_COLLISION
+ META_LUPA_SEM_NOVO_DELTA_REUTILIZAVEL
```

```text
MESMO_ERRO
+ ZERO_INFORMACAO_NOVA
+ ZERO_DELTA_DE_CRENCA
= DESPERDICIO_DE_CICLO
```

Nunca declarar `100%` por sensação. Antes de qualquer percentual, definir e fechar o `DENOMINATOR_APPLICABLE`.

```text
PERCENT_COMPLETE_ALLOWED=true somente se DENOMINATOR_TOTAL estiver fechado
DENOMINATOR_PASS = somente itens aplicáveis que PASSARAM no HEAD correto
```

`QUEUED`, `SKIPPED`, timeout, `UNKNOWN`, `BLOCKED_*`, `CIRCULAR_PROOF` ou instrumento indisponível nunca viram PASS.

Contraprova obrigatória: `9 PASS + 1 QUEUED|UNKNOWN|SKIPPED` não pode produzir `100%`.

## 6. Recuperação do passivo depois da missão viva

Depois de fechar o escopo atual, continuar no próximo passivo material sem reiniciar a missão e sem criar PR aleatória.

Prioridade:

```text
P0 MATERIAL
→ P1 MATERIAL
→ FALHA MECANICA COM CAUSA EXPLICITA
→ THREAD CORRIGIDA MAS ABERTA
→ GOVERNANCA ATIVA VELHA
→ REGRESSAO RECENTE
```

Classificar cada item antes de agir:

```text
CURADO
MATERIAL
SUPERSEDED
HISTORICAL
BLOCKED_HUMAN
BLOCKED_EXTERNAL
QUEUED
SKIPPED_NOT_PASS
UNKNOWN
```

```text
OUTDATED != CURADO
HISTORICAL != ACTIVE_GOVERNANCE
```

Para fechar finding/thread, provar **BYTE + COMPORTAMENTO + PAPEL_DO_ARTEFATO**.

## 6A. Unidade verificável, autoridade durável e falha limpa

Delta garimpado de práticas públicas de coordenação de agentes do projeto `swstegall/meteor-decomp`, reconciliado com os contratos existentes da Casa. A fonte externa é matéria-prima; estas regras só entram porque sobrevivem a `REUSE_BEFORE_CREATE` e fecham lacunas sem criar novo owner.

### Unidade de trabalho = menor escopo independentemente verificável

O projeto externo usa uma função por worker/PR para impedir colisão e tornar o resultado trivialmente verificável. Na CentralDark a unidade não precisa ser função; deve ser **o menor escopo material que possui owner, Writer e prova independentes**.

```text
UNIT_OF_WORK
= SMALLEST_INDEPENDENTLY_VERIFIABLE_SCOPE

UMA_UNIDADE
→ UM_OWNER
→ UM_WRITER
→ UM_DELTA_CAUSAL
→ UMA_PROVA_APLICAVEL
```

Não usar a unidade como desculpa para estreitar a intenção do CHEFE. A Casa decompõe internamente quantas unidades forem necessárias até satisfazer o `DESTINATION_LOCK`.

```text
UNIT_OF_WORK_IS_EXECUTION_BOUNDARY=true
UNIT_OF_WORK_IS_NOT_INTENT_BOUNDARY=true
NO_UNRELATED_CLEANUP_IN_ACTIVE_SCOPE=true
```

### Estado derivado não pode virar autoridade de coordenação

No caso externo, o pool YAML é regenerado e por isso não pode ser o ledger de claims; a coordenação durável mora em mecanismo próprio. Generalização CentralDark:

```text
REGENERATED|DERIVED|CACHE|VIEW
!= COORDINATION_AUTHORITY
```

Claim de Writer, lease, ownership ou progresso não deve depender de artefato que pode ser regenerado, sobrescrito ou recalculado sem preservar causalidade.

```text
COORDINATION_AUTHORITY_MUST_BE_DURABLE=true
DERIVED_STATUS_IS_VIEW_NOT_GOVERNMENT=true
PROFILE_IS_VIEW_NOT_GOVERNMENT=true
```

Quando o estado puder ser derivado de artefato canônico + Git + runtime, não criar flag manual concorrente só para repetir a mesma verdade.

```text
CANONICAL_ARTIFACT + GIT + RUNTIME
→ DERIVE_STATUS_WHEN_POSSIBLE
→ NO_SHADOW_LEDGER_WITHOUT_GAP
```

### Antes de escrever, ler irmãos provados e falhas anteriores

O projeto externo manda ler exemplos já resolvidos do mesmo módulo e post-mortems anteriores antes de tentar a função. A Casa generaliza isso como retrieval local de alta precisão:

```text
ANTES_DE_MUTAR
→ LOCALIZAR_OWNER
→ LER_2_OU_3_EXEMPLOS_PROVADOS_DO_MESMO_CONTORNO_QUANDO_EXISTIREM
→ LER_RECEIPTS/FALHAS_ANTERIORES_DO_MESMO_MECANISMO
→ EXTRAIR_IDIOMA_LOCAL
→ SÓ_ENTÃO_DELTA
```

Isso implementa `BIG_LIBRARY → PRECISE_RETRIEVAL → SMALL_CONTEXT` sem carregar o histórico inteiro.

```text
SIBLING_PROVEN_EXAMPLES_BEFORE_NOVEL_IMPLEMENTATION=true
PRIOR_FAILURES_ARE_INPUTS=true
LOCAL_IDIOM_BEFORE_GENERIC_PATTERN=true
```

### Parcial não é estado promovível

No projeto externo, `GREEN` é terminal; `PARTIAL/MISMATCH` não podem virar commit de solução. A equivalência CentralDark é epistemológica, não byte-a-byte para todo domínio:

```text
PARTIAL|MISMATCH|UNKNOWN|ERROR
!= PROMOTABLE_PASS
```

Se o orçamento de iteração acabar sem satisfazer o gate aplicável:

```text
NAO_PROMOVER_MEIA_SOLUCAO
→ REVERTER_MUTACAO_NAO_PROVADA_DO_ESCOPO_QUANDO_SEGURO
→ PRESERVAR_EVIDENCIA
→ REGISTRAR_BLOCKED_POSTMORTEM
→ CAUSA/HIPOTESES_TENTADAS/RESULTADOS/NEXT_CURSOR
→ LIBERAR_WRITER_QUANDO_APLICAVEL
```

O post-mortem é aprendizado de falha, não segunda fonte da verdade.

```text
FAILED_ATTEMPT_MUST_NOT_BECOME_BASELINE=true
LAST_GOOD_STATE_WINS_AFTER_UNPROVEN_ATTEMPT=true
BLOCKED_POSTMORTEM_IS_PROVENANCE_NOT_PASS=true
```

### O artefato resolvido é a prova primária; status manual é projeção

Quando um resultado pode ser observado diretamente no artefato canônico e validado pelo gate correspondente, evitar manter uma segunda flag manual como autoridade concorrente.

```text
SOLVED_ARTIFACT
+ APPLICABLE_VALIDATION
= PRIMARY_COMPLETION_EVIDENCE

MANUAL_STATUS
= PROJECTION|INDEX
!= SOURCE_OF_TRUTH
```

A regra não elimina receipts, checks ou índices; só impede que eles contradigam silenciosamente o objeto que dizem representar.

## 7. Aprendizado entre os dois

O objetivo não é decidir quem venceu a discussão.

```text
PARCEIRO PROVA QUE WRITER ERROU → OURO
WRITER PROVA QUE PARCEIRO ERROU → OURO
AMBOS FICAM UNKNOWN + EVIDENCIA NOVA → UNKNOWN MELHOR DEFINIDO → OURO
```

Só evoluir MetaLupa/regra/skill quando houver delta reutilizável real.

```text
INFORMATION_GAIN_REQUIRED=true
LEARNING_REQUIRES_EVIDENCE=true
LEARNING_DELTA_REQUIRED=true
NO_EGO_SCORE=true
SAME_ERROR_NO_NEW_INFO_IS_WASTE=true
```

Ao final de cada ciclo, perguntar:

```text
O_QUE_ESTA_RODADA_DESCOBRIU_QUE_O_METODO_AINDA_NAO_SABIA_DETECTAR?
```

Se a resposta não produzir delta reutilizável, não alterar o canônico. Se produzir, evoluir o **mesmo** mecanismo, com teste e contraprova; não criar skill paralela.

## 8. Propriedade da prova

Cada lei importante deve ter:

```text
FONTE_CANONICA
→ CONSUMIDOR_REAL
→ DONO_DA_PROVA
→ TESTE_NEGATIVO/CONTRAPROVA
→ ANCORA_OBSERVAVEL
```

```text
SELF_VALIDATION_WITHOUT_INDEPENDENT_COUNTERPROOF=UNPROVEN
CIRCULAR_PROOF=UNPROVEN
LAW_EXISTS_DOES_NOT_MEAN_LAW_PROVEN=true
```

Se ainda não existir provador real para uma lei, declarar `UNPROVEN` em vez de fabricar PASS. O parceiro não cria um segundo provador para a mesma responsabilidade só para aumentar o número de gates.

## 9. Reuso e criação

```text
REUSE_BEFORE_CREATE=true
NO_NEW_PR_IF_ACTIVE_SCOPE_ALREADY_EXISTS=true
NO_PARALLEL_MISSION=true
NO_V2_V3=true
NO_DUPLICATE_ARCHITECTURE=true
```

Se já existe componente responsável, refinar o canônico. Caminho novo só nasce com gap material provado.

## 10. Segurança e autorização

O papel de parceiro ou Writer autônomo **não amplia autorização**.

```text
PARTNER_DOES_NOT_EXPAND_DEPLOY_AUTHORITY=true
PARTNER_DOES_NOT_EXPAND_VPS_AUTHORITY=true
ZERO_DEPLOY_WHEN_MISSION_SAYS_ZERO_DEPLOY=true
NO_FORCE_PUSH=true
NO_SECRET_VALUES=true
NO_BYPASS=true
```

Deploy/VPS/produção seguem a autorização vigente da missão. `AUTONOMIA != AUTORIDADE`.

## 11. Relação com Expansão de Domínio

Dentro de uma Expansão de Domínio, Writer e parceiro compartilham o mesmo domínio da missão, mas papéis diferentes:

```text
MESMA_INTENCAO
+ MESMO_PERIMETRO
+ MESMA_FONTE_DA_VERDADE
+ WRITER_UNICO
+ PARCEIRO_READ_ONLY
→ CONTRAPROVA_SEM_COLISAO
```

O parceiro é capacidade acoplada ao domínio, nunca segundo chefe.

## 12. Observabilidade

Quando o loop/autonomia já tiver consumidor operacional observável e houver gap real, evoluir o painel existente; não criar painel novo.

Campos úteis quando aplicáveis:

```text
MISSAO_ATUAL
WRITER
PARTNERS/JUDGES
HEAD
CICLO_ATUAL
MATERIAL
CURADO
BLOCKED
QUEUED
CHECKS
ULTIMA_CALIBRACAO
PROXIMO_RECHECK
MOTIVO_DE_PARADA
DENOMINATOR_TOTAL
DENOMINATOR_PASS
```

Ausência de integração real com o painel = `UNPROVEN`, não PASS.

## 13. Saída de cada ciclo

```text
FEITO=
EVIDENCIA=
PENDENCIA=
PROXIMO_PASSO=
BOOT=
FIO_DA_MISSAO=

MAIN_HEAD=
ACTIVE_PR=
ACTIVE_HEAD=
WRITER=
PARTNERS=
LOOP_CYCLES=
DENOMINATOR_TOTAL=
DENOMINATOR_PASS=
MATERIAL=
CURADO=
SUPERSEDED=
HISTORICAL=
UNKNOWN=
BLOCKED_HUMAN=
BLOCKED_EXTERNAL=
QUEUED=
SKIPPED_NOT_PASS=
CIRCULAR_PROOF=
WRITER_COLLISION=
POINT_FIXED=
PERCENT_COMPLETE=
DEPLOY=
```

`PERCENT_COMPLETE` só é calculado quando `DENOMINATOR_TOTAL` estiver fechado.

## Regra curta da Casa

> **Entra → reancora no estado vivo → Writer trabalha → parceiro tenta quebrar → corrige mínimo → prova no mesmo HEAD → MetaLupa aprende só com delta real → continua no próximo material sem transformar o CHEFE em cabo humano → para apenas em ponto fixo ou bloqueio real da fronteira.**
