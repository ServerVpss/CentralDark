---
title: "Evidência, contraprova e realidade — aprendizado da sessão"
status: "APRENDIZADO_HISTORICO"
date: 2026-08-17
authority: "SEGREDO/CHEFE"
scope: "Aprendizado observado na sessão; não substitui owners canônicos nem estado vivo"
canonical_owners:
  - LEIA-ME-IA.md
  - docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
  - docs/CONSCIENCIA/MULTIBUSSOLA.md
  - docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
related:
  - docs/CONSCIENCIA/APRENDIZADOS/2026-08-17-mapa-mental-intencao-comprimida.md
---

# Evidência, contraprova e realidade

Este registro cristaliza somente os deltas reutilizáveis que sobreviveram à sessão inteira. Ele não transforma conversa, print, consenso de modelos ou documentação em autoridade operacional. Estado atual continua exigindo remedição no alvo correto.

## 1. Palavra do modelo é hipótese

A sessão expôs repetidamente que narrativa de agente não basta para provar estado técnico.

```text
CLAIM
→ FONTE
→ LINK
→ SHA/REF
→ ESTADO_OBSERVADO_NO_ALVO
→ CONTRAPROVA
→ REMEDICAO
```

Contrato:

```text
MODEL_WORD != PROOF
REASONING != EVIDENCE
DOCUMENTED != EXECUTED
HISTORICAL_SNAPSHOT != LIVE_STATE
```

Um claim sem recibo continua hipótese, mesmo quando soa coerente ou é repetido por várias janelas.

## 2. Fixed point também precisa de recibo

A própria sessão produziu uma correção epistemológica: uma conclusão inicial declarou ausência de lacuna material e `FIXED POINT`, mas a remedição posterior mostrou PR ainda aberto e gates `QUEUED`. A conclusão correta passou a ser `FIXED_POINT=false` até o Judge aplicável concluir no mesmo HEAD.

```text
QUEUED != PASS
PENDING != PASS
SKIPPED != PASS
UNKNOWN != PASS
MERGEABLE != MERGED
```

Logo:

```text
FIXED_POINT
REQUIRES
  applicable_denominator_closed
  + same_target_proof
  + no_material_unknown
  + final_remeasurement
```

Escrever a palavra `FIXED_POINT` não cria fixed point.

## 3. Muitos olhos não multiplicam verdade

As montagens de múltiplas janelas mostraram uma arquitetura útil quando tratadas como percepções independentes, não como votos.

```text
N_JANELAS
→ N_NARRATIVAS_POSSIVEIS
→ N_HIPOTESES
→ EVIDENCIA_INDEPENDENTE
→ CONTRAPROVA
→ DEDUPE_CAUSAL
→ RENDEZVOUS
→ 1_ESTADO_RECONCILIADO_POR_ESCOPO
```

Contrato:

```text
CONSENSUS != TRUTH
REPETITION != EVIDENCE
ECHO != INDEPENDENT_CONFIRMATION
N_MODELS_AGREEING != N_PROOFS
```

O ganho informacional vem de diversidade epistemológica: uma frente recupera, outra mede dependências, outra tenta falsificar causalidade, outra confere SHA/estado, e o rendezvous elimina ecos.

## 4. MULTIBUSSOLA não existe para fabricar consenso

`!MULTIBUSSOLA` aumenta oportunidades de falsificação. Os eixos podem discordar; a função é descobrir qual hipótese sobrevive ao alvo observado.

```text
HIPOTESE_A
HIPOTESE_B
HIPOTESE_C
→ REALITY_JUDGES
→ BAD_CONCLUSION_DIES
```

Não é modelo contra modelo. É hipótese contra hipótese, com realidade como Judge.

```text
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
```

## 5. Print é evidência de conversa, não automaticamente de runtime

Os prints da sessão foram úteis para provar evolução de raciocínio, frases, mapas e convergência entre superfícies. Eles não substituíram GitHub vivo para claims sobre `main`, PR, CI ou Writer.

```text
PRINT_PROVES_VISIBLE_SURFACE_STATE
PRINT_DOES_NOT_AUTOMATICALLY_PROVE_CURRENT_REMOTE_STATE
```

Quando a matéria era operacional, a sessão voltou ao GitHub e remediu SHA/PR/runs antes de concluir.

## 6. Estado vivo vence memória e snapshot

Durante a própria investigação, `main` avançou por writers automáticos. Isso demonstrou que uma medição correta pode ficar velha minutos depois.

```text
T0_CORRECT
+ MATERIAL_CHANGE
→ T0_IS_HISTORY
→ REMEASURE_T1
```

Consequência: antes de promoção, merge, correção ou declaração final, remedir o alvo aplicável.

## 7. Writer concorrente deve bloquear e preservar

A sessão encontrou writers automáticos capazes de partir de estado anterior e aterrissar depois de matéria nova. Mesmo quando uma execução específica não sobrescreveu arquivos concorrentes, isso não validou resolução automática de divergência.

```text
DIVERGENCE
→ BLOCK
→ PRESERVE_BOTH_HISTORIES
→ EXPLICIT_RECONCILIATION
```

Não:

```text
DIVERGENCE
→ REBASE_WITH_CONFLICT_PREFERENCE
→ SILENT_CONTINUE
```

Ausência de overwrite observado em uma execução não prova segurança da política de conflito.

## 8. Receipt transporta intenção; não fabrica vontade humana

O aprendizado da ferida de authority ficou comprimido assim:

```text
VALID_CANONICAL_RECEIPT
+ TRUSTED_AUTHOR
+ SAME_REPO
+ COMPLETE_REQUIRED_FIELDS
→ TRANSPORT_ALREADY_GRANTED_INTENT
```

Mas:

```text
LOOSE_TEXT
OR FORK
OR UNTRUSTED_AUTHOR
OR INCOMPLETE_RECEIPT
→ MUST_NOT_CREATE_AUTHORITY
```

A distinção é material:

```text
TRANSPORTS_AUTHORITY != GRANTS_AUTHORITY
```

O objetivo é preservar autorização já concedida sem reask, sem permitir que texto, label, fork ou agente inventem nova vontade do CHEFE.

## 9. Dedupe é causal, não textual

Várias janelas podem trazer a mesma ferida com palavras diferentes. Contar ocorrências cria falsa confiança. O correto é reduzir por causa material e owner.

```text
MANY_REPORTS
→ SAME_CAUSE?
   YES → ONE_FINDING
   NO  → INDEPENDENT_DELTAS
```

Achado repetido é eco até prova de independência.

## 10. REUSE_BEFORE_CREATE também vale para memória

A sessão mostrou que novos visuais e formulações devem primeiro ser absorvidos por owner existente quando pertencem à mesma intenção. Novo artefato só se justifica quando existe gap reutilizável distinto.

```text
NEW_MATTER
→ EXISTING_OWNER_FITS?
   YES → EXTEND_DELTA
   NO  → REAL_GAP?
      YES → MINIMAL_NEW_ARTIFACT
      NO  → NO_CHANGE
```

Este arquivo existe porque o owner visual relacionado preserva intenção comprimida/200 janelas, enquanto este delta específico registra a disciplina epistemológica completa de evidência, falsificação, fixed point e autoridade observada ao longo da sessão.

## 11. Contraprova vale mais que concordância

A regra mais reutilizável da sessão:

```text
PALAVRA_DO_MODELO = HIPOTESE
RECIBO_NO_ALVO_CERTO = EVIDENCIA
EVIDENCIA_QUE_SOBREVIVE_A_CONTRAPROVA = CRISTAL
```

Confiança deve crescer por tentativas independentes de estar errado, não por contagem de vozes concordando.

## 12. Circuito final aprendido

```text
INTENCAO_DO_CHEFE
→ RECUPERAR_ESTADO
→ DECLARAR_CLAIM
→ ANCORAR_FONTE_LINK_SHA_REF
→ MEDIR_ALVO
→ FAN_OUT_DE_PERCEPCOES_QUANDO_HOUVER_GANHO
→ TENTAR_FALSIFICAR
→ DEDUPE_CAUSAL
→ ONE_WRITER_PER_SCOPE
→ MENOR_ACAO_AUTORIZADA
→ PROVA_NO_MESMO_ALVO
→ REMEDIR
→ FIXED_POINT_OU_NOVO_DELTA
→ REGISTRAR_SOMENTE_O_OURO
```

## Anti-regras cristalizadas

```text
NO_FALSE_GREEN=true
NO_CONSENSUS_AS_PROOF=true
NO_SCREENSHOT_AS_LIVE_RUNTIME=true
NO_HISTORY_AS_CURRENT_STATE=true
NO_AUTO_CONFLICT_RESOLUTION_FOR_MAIN_WRITERS=true
NO_AUTHORITY_FROM_LOOSE_TEXT=true
NO_DUPLICATE_OWNER_WITHOUT_GAP=true
NO_FIXED_POINT_WITH_OPEN_MATERIAL_UNKNOWN=true
INFORMATION_GAIN_REQUIRED=true
```

## Fio em uma linha

> **Muitos olhos criam mais chances de detectar erro; só evidência no alvo, sobrevivendo à contraprova e à remedição final, merece virar cristal.**
