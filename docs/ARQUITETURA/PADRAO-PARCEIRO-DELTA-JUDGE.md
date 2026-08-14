---
title: "PADRÃO PARCEIRO DE DELTA + JUDGE"
status: "CANÔNICO"
scope: "Colaboração multiagente sem colisão de Writer"
owner: "SEGREDO/CHEFE"
technical_alias: "DELTA_PARTNER_PROTOCOL"
updated: 2026-08-14
---

# Padrão da Casa — Parceiro de Delta + Judge

Quando um agente entra numa missão em que já existe Writer vivo, o padrão da CentralDark é **ajudar sem disputar o volante**.

```text
WRITER ATIVO
→ PARCEIRO ENTRA READ_ONLY
→ REMEDE ESTADO REAL
→ LÊ O DELTA DO WRITER
→ PROCURA O MENOR DEFEITO MATERIAL
→ TENTA FALSIFICAR
→ ENTREGA DELTA CAUSAL
→ WRITER CORRIGE SE MATERIAL
→ PARCEIRO REMEDE NO NOVO HEAD
→ REPETE ATÉ PONTO FIXO
→ DEPOIS VARRE PASSIVO OPERACIONAL
```

## 1. Autoridade e papéis

```text
SEGREDO/CHEFE = autoridade humana final
SOL = coordena/reconcilia
WRITER ATUAL = único escritor do escopo vivo
DELTA_PARTNER/JUDGE = revisão + contraprova, inicialmente READ_ONLY
PIVETE/HERMES = execução/continuidade quando for o corpo aplicável
```

```text
CAPABILITY_DOES_NOT_GRANT_AUTHORITY=true
PARTNER_DOES_NOT_STEAL_WRITER=true
ONE_WRITER_PER_SCOPE=true
HANDOFF_REQUIRED_BEFORE_SAME_SCOPE_WRITE=true
```

## 2. Entrada obrigatória do parceiro

Antes de opinar:

1. executar `#ACORDAR !CALIBRAR`;
2. medir `main`, branch/PR ativo, HEAD, Writer, threads, checks, P0/P1 e ferramentas aplicáveis;
3. ler o delta atual antes de revisar;
4. usar estado remoto/vivo atual, não print ou narrativa antiga, como estado operacional;
5. perguntar: **qual é o menor defeito real desta implementação?**

```text
REMOTE_CURRENT_STATE_WINS=true
READ_DELTA_BEFORE_JUDGING=true
UNKNOWN_FIRST=true
```

## 3. Regra de colaboração

```text
AMIGO FAZ
→ PARCEIRO TENTA QUEBRAR
→ DELTA APARECE
→ CORRIGE MÍNIMO
→ META LUPA NOS DOIS
→ PROVA NO MESMO HEAD
```

Se o parceiro encontrar defeito no escopo do Writer:

```text
NAO_EDITAR_SEM_HANDOFF
→ apontar ARQUIVO
→ LOCAL
→ COMPORTAMENTO
→ CAUSA
→ CONTRAPROVA
→ CORRECAO_MINIMA_SUGERIDA
→ TESTE_QUE_PROVA
```

Se o Writer corrigir, o parceiro deve **revalidar o novo HEAD** e abandonar finding que caiu. Não proteger crítica antiga por ego.

Se houver outro escopo material sem colisão, o parceiro pode assumir somente aquele escopo independente, mantendo um Writer por escopo.

## 4. Ponto fixo e stop rule

Parar o loop quando:

```text
NENHUMA_EVIDENCIA_NOVA_GERA_DELTA_MATERIAL
+ ZERO_P0_P1_MATERIAL_NO_ESCOPO
+ GATES_APLICAVEIS_DO_HEAD_EXATO_FECHADOS_OU_CLASSIFICADOS
+ ZERO_WRITER_COLLISION
```

```text
MESMO_ERRO
+ ZERO_INFORMACAO_NOVA
+ ZERO_DELTA
= DESPERDICIO_DE_CICLO
```

`QUEUED`, `SKIPPED`, timeout ou instrumento indisponível nunca viram PASS.

## 5. Recuperação do passivo depois da missão viva

Depois de fechar o escopo atual, o parceiro pode varrer o passivo sem reiniciar a missão e sem criar PR aleatória.

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
UNKNOWN
```

```text
OUTDATED != CURADO
HISTORICAL != ACTIVE_GOVERNANCE
```

Para fechar finding/thread, provar **BYTE + COMPORTAMENTO + PAPEL_DO_ARTEFATO**.

## 6. Aprendizado entre os dois

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

## 7. Propriedade da prova

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
```

O parceiro não cria um segundo provador para a mesma responsabilidade só para aumentar o número de gates.

## 8. Reuso e criação

```text
REUSE_BEFORE_CREATE=true
NO_NEW_PR_IF_ACTIVE_SCOPE_ALREADY_EXISTS=true
NO_PARALLEL_MISSION=true
NO_V2_V3=true
NO_DUPLICATE_ARCHITECTURE=true
```

PR novo só nasce quando há **escopo material independente** e nenhum PR/branch adequado já existe.

## 9. Segurança e autorização

O papel de parceiro **não amplia autorização**.

```text
PARTNER_DOES_NOT_EXPAND_DEPLOY_AUTHORITY=true
PARTNER_DOES_NOT_EXPAND_VPS_AUTHORITY=true
NO_FORCE_PUSH=true
NO_SECRET_VALUES=true
```

Deploy/VPS/produção seguem a autorização vigente da missão. Se a missão disser `ZERO_DEPLOY`, ambos obedecem.

## 10. Relação com Expansão de Domínio

Dentro de uma Expansão de Domínio, Writer e parceiro compartilham **o mesmo domínio da missão**, mas papéis diferentes:

```text
MESMA_INTENCAO
+ MESMO_PERIMETRO
+ MESMA_FONTE_DA_VERDADE
+ WRITER_UNICO
+ PARCEIRO_READ_ONLY
→ CONTRAPROVA_SEM_COLISAO
```

O parceiro é capacidade acoplada ao domínio, nunca segundo chefe.

## 11. Saída de cada ciclo

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
PARTNER_ROLE=DELTA_PARTNER+JUDGE+READ_ONLY
MATERIAL_FINDINGS=
CURADOS=
SUPERSEDED=
HISTORICAL=
BLOCKED_HUMAN=
BLOCKED_EXTERNAL=
UNKNOWN=
CHECKS_SAME_HEAD=
WRITER_COLLISION=
```

## Regra curta da Casa

> **Writer faz; parceiro tenta quebrar; os dois obedecem à evidência; MetaLupa aprende só com delta real; Git preserva o que sobreviveu.**
