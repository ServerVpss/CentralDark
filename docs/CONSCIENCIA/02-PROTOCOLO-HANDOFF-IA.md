---
title: "02 PROTOCOLO HANDOFF IA"
date: 2026-06-29
updated: 2026-09-19
tags: ["consciencia", "handoff", "continuidade", "pombo-checksum"]
status: "CANÔNICO"
authority: "SEGREDO/CHEFE"
---

# Protocolo de handoff IA

Owner canônico da transferência de continuidade entre superfícies, sessões,
modelos e executores da mesma CentralDark.

Este protocolo não cria cérebro, owner, Writer, Judge ou autoridade paralela.
Ele transporta o fio da missão de forma verificável.

```text
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON

HISTORY != CURRENT_STATE
ACTION != PROOF
UNKNOWN != PASS
HANDOFF != NEW_MISSION
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
```

## 1. Regra operacional

Antes de produzir handoff material:

```text
#ACORDAR
→ medir estado vivo aplicável

!CALIBRAR
→ recuperar intenção + DESTINATION_LOCK vigentes

!MULTIBUSSOLA
→ reconciliar caminhos, hipóteses e resíduos materiais

!META_LUPA
→ tentar quebrar a conclusão antes de transportar
```

Se o estado material mudou durante a execução, recalibrar antes do handoff.
Histórico preserva proveniência; não governa o presente quando o presente pode
ser medido.

```text
ESTADO_MUDOU
→ REMEASURE
→ RECALIBRATE
→ UPDATE_STATE
→ SO_ENTAO_HANDOFF
```

## 2. Falha, prova e continuidade

```text
FALHOU
→ LER ERRO + ESTADO
→ LOCALIZAR CAUSA
→ REUTILIZAR OWNER EXISTENTE
→ MENOR DELTA
→ RETESTE
→ CONTRAPROVA

PROVOU
→ RECEIPT
→ SHA/CHECKSUM quando material
→ NEXT_CURSOR

NAO_PROVOU
→ NOT_PROVEN
```

Ação iniciada, arquivo criado, PR aberto, processo vivo, HTTP 200, texto do
agente ou screenshot isolado não provam comportamento que não medem.

```text
ACTION_STARTED != DONE
ACTION != PROOF
SCREENSHOT != LIVE_STATE
DOCUMENTED != EXECUTED
PROCESS_RUNNING != HEALTHY
HTTP_200 != CORRECT_BEHAVIOR
```

## 3. Pombo-correio com checksum

`POMBO-CORREIO COM CHECKSUM` é a linguagem humana da Casa para transporte
verificável de continuidade. A metáfora é cultural; o comportamento técnico é
este protocolo + receipts + Trigger Fabric.

```text
POMBO != CEREBRO
POMBO != OWNER
POMBO != WRITER
POMBO != JUIZ
POMBO != AUTORIDADE

POMBO =
TRANSPORTE
+ DESTINO_TRAVADO
+ ESTADO_REFERENCIADO
+ PROVENIENCIA
+ CHECKSUM/SHA
+ RECEIPT
+ UNKNOWN_PRESERVADO
+ RESIDUAL
+ NEXT_CURSOR
```

A autoridade continua sendo do SEGREDO/CHEFE. O transportador não redefine,
não estreita e não substitui o destino vigente.

## 4. Payload mínimo de handoff material

Quando aplicável ao escopo, preservar:

```text
CHEFE_INTENT
DESTINATION_LOCK
SOURCE_SURFACE
TARGET_SURFACE
OBSERVED_AT
HEAD_SHA / CONTENT_SHA256
OWNER
WRITER_SCOPE
STATE
EVIDENCE_REFS
UNKNOWNS
RESIDUAL
NEXT_CURSOR
```

Integridade:

```text
PAYLOAD_HASH_MATCH = BYTE_IDENTITY
PAYLOAD_HASH_MATCH != SEMANTIC_PROOF
CHECKSUM != PROVA_SEMANTICA
RECEIPT != AUTHORITY
```

## 5. Mensagem para a próxima IA

Após ação material concluída, deixar um bloco final equivalente a:

```text
MENSAGEM PARA A PROXIMA IA

INTENCAO / DESTINO:
- CHEFE_INTENT:
- DESTINATION_LOCK:

ESTADO MEDIDO:
- OBSERVED_AT:
- SOURCE_SURFACE:
- TARGET_SURFACE:
- HEAD_SHA / CONTENT_SHA256:
- OWNER:
- WRITER_SCOPE:
- STATE:

EVIDENCIA:
- EVIDENCE_REFS:

RESIDUO:
- UNKNOWNS:
- RESIDUAL:

CONTINUIDADE:
- NEXT_CURSOR:
- NEXT_ACTION:
```

Não preencher campo desconhecido com narrativa. Use `UNKNOWN` ou
`NOT_PROVEN` quando a realidade ainda não sustentar a afirmação.

## 6. Anti-papagaio

```text
"acho" | "deve" | "parece" | "provavelmente" | "ja estava"
→ NAO_GOVERNA_ESTADO

SEM_CHECKSUM_QUANDO_EXIGIDO = ENTREGA_INCOMPLETA
SEM_PROVENIENCIA = ENTREGA_INCOMPLETA
SEM_DESTINO_PRESERVADO = HANDOFF_INVALIDO
UNKNOWN_REMOVIDO_PARA_PARECER_VERDE = FAIL
HANDOFF_QUE_CRIA_OWNER_PARALELO = FAIL
HANDOFF_QUE_DEVOLVE_TRABALHO_MECANICO_AO_CHEFE = PAPAGAIO
```

Se a Casa consegue descobrir estado, owner, SHA, consumidor, ferramenta ou
próximo passo por meios autorizados, não devolve essa triagem ao CHEFE.

## 7. Transferência de aprendizado

Uma correção só conta como aprendida quando a ocorrência equivalente seguinte
reutiliza o comportamento sem nova instrução mecânica do CHEFE.

```text
HUMAN_CORRECTION
→ SIGNATURE
→ CAUSE / INVARIANT
→ OWNER_CANONICO
→ TESTE
→ CONTRAPROVA
→ RECEIPT
→ CRYSTAL
→ HANDOFF
→ NEXT_EVENT_REUSES
```

Se a instrução mecânica precisa ser repetida depois de promovida e provada:

```text
LEARNING_TRANSFER_FAIL
```

## 8. Invariantes de continuidade

```text
DESTINATION_LOCK_DEVE_SOBREVIVER_AO_HANDOFF=true
UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true
PROVENIENCIA_DEVE_SOBREVIVER_AO_HANDOFF=true
NEXT_CURSOR_DEVE_SOBREVIVER_AO_HANDOFF=true
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
```

## 9. Arquitetura descoberta no circuito

O circuito CHEFE → percepção → falsificação → Writer → executor → loop → juiz
→ aprendizado → estado atualizado não é apenas um organograma. Ele forma uma
arquitetura de controle em malha fechada orientada a evidência, com mutação
serializada e continuidade verificável.

```text
ARCHITECTURE_CLASS = PROOF_CARRYING_CLOSED_LOOP_CONTROL
STATE_MODEL = EPISTEMIC_STATE_MACHINE
MUTATION_MODEL = SERIALIZED_SINGLE_WRITER
CONTINUITY_MODEL = RECEIPT_PLUS_CHECKSUM_PLUS_NEXT_CURSOR
REALITY_IS_FINAL_JUDGE = true
NO_NEW_ENGINE_CREATED = true
```

Camadas e papéis:

```text
AUTHORITY_PLANE
  👑 CHEFE
  → CHEFE_INTENT + DESTINATION_LOCK

ORIENTATION_PLANE
  #ACORDAR → !CALIBRAR → !MULTIBUSSOLA
  → estado vivo + intenção vigente + hipóteses materiais

PERCEPTION_PLANE
  GRAFO + VIGIA + J.R.V.S.
  → observação/projeção/braços de percepção
  → READ_ONLY enquanto percebem
  → não substituem REALITY

FALSIFICATION_PLANE
  META LUPA
  → tenta refutar a hipótese antes da mutação

MUTATION_PLANE
  WRITER ÚNICO
  → uma caneta por escopo
  → SERIALIZE_MUTATION

EXECUTION_PLANE
  HERMES/PIVETE
  → executa e preserva continuidade quando aplicável

STABILIZATION_LOOP
  FABLE LOOP = nome de linguagem/Forja para iterar até estabilidade
  → FIXED_POINT_CANDIDATE != PASS
  → ação → medição → novo estado → repetir quando houver delta material

INDEPENDENT_JUDGMENT
  FABLE JUDGE = nome de linguagem/Forja para segundo leitor read-only
  → EXECUTOR_CANNOT_SELF_APPROVE=true
  → JUDGE_DOES_NOT_MUTATE=true
  → REALITY permanece o juiz final

REMEDIATION_LEARNING
  TÉCNICA DA LUPA
  → erro → mecanismo → owner existente → delta mínimo → reteste
  → aprendizado altera comportamento futuro

STATE_UPDATE
  GRAFO
  → projeção do estado atualizado
  → GRAPH_IS_DERIVED_NOT_AUTHORITY=true

CONTINUITY_PLANE
  POMBO_MODE=CHECKSUM_ON
  → estado medido + OBSERVED_AT + HEAD/SHA + evidência + UNKNOWN/residual
  → receipt + NEXT_CURSOR
  → próxima superfície continua sem redefinir o destino
```

Máquina de estados mínima:

```text
UNKNOWN
→ MEASURE
→ TEST
→ OBSERVE_REALITY
→ PROVADO | FALHOU | NOT_PROVEN

FALHOU
→ CAUSA
→ OWNER_EXISTENTE
→ DELTA_MINIMO
→ RETESTE
→ CONTRAPROVA

PROVADO
→ RECEIPT
→ SHA/CHECKSUM quando material
→ LEARNING
→ NEXT_CURSOR
→ PROXIMO #ACORDAR
```

Nomes da Forja como `FABLE LOOP`, `FABLE JUDGE`, `GRAFO`, `VIGIA` e `J.R.V.S.`
são linguagem/papéis do circuito. Só contam como engine/runtime separado se o
repo e a execução física provarem isso. O diagrama não concede autoridade de
runtime por si só.

## 10. Relações canônicas

- `LEIA-ME-IA.md` — boot e estado vivo.
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md` — loop cognitivo, falha como sensor e prova pública.
- `docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md` — cristal/proveniência da linguagem Pombo.
- `docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-fluxo-operacional-papagaio-off-pombo-on.md` — circuito de papéis promovido na #1145.
- `.agents/skills/visual-design-method/assets/forja-de-cartas.html` — linguagem visual que contém Fable Loop, Fable Judge e Técnica da Lupa.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/` — contratos, receipts e continuidade executável.
- `scripts/trigger-fabric/verify_repo_contract.py` — verificação determinística do contrato de repositório.

## 11. Critério de handoff válido

```text
DESTINATION_PRESERVED
AND CURRENT_STATE_MEASURED_WHEN_MATERIAL
AND PROVENANCE_PRESERVED
AND UNKNOWN_PRESERVED
AND NEXT_CURSOR_PRESERVED
AND OWNER_NOT_DUPLICATED
AND CLAIMS_CLASSIFIED_BY_EVIDENCE
```

Contrato em Git prova o contrato no Git. Não prova por si só que toda superfície
externa, Windows, VPS, sessão ou runtime já o herdou fisicamente.


## 12. PR como canal de comunicação e handoff vivo

Quando houver PR ativo no escopo da missão, ele é a superfície preferencial de comunicação operacional entre agentes, modelos e executores.

```text
PR = LEDGER_DE_COMUNICACAO_DA_MISSAO
PR != NOVA_AUTORIDADE
PR != SOURCE_OF_TRUTH_ISOLADA
PR != PROVA_DE_RUNTIME
MAIN_CURRENT + EVIDENCIA_ATUAL = ESTADO_CANONICO_APLICAVEL
```

O PR deve carregar ou referenciar o handoff vigente sem obrigar o CHEFE a repetir contexto em cada interface.

Campos mínimos quando materiais:

```text
PR_NUMBER
PR_HEAD
BASE_HEAD
CHEFE_INTENT
DESTINATION_LOCK
GOAL
FIO_DA_MISSAO
OWNER
WRITER_SCOPE
LAST_GOOD_STATE
EVIDENCE_REFS
UNKNOWNS
PENDENCIAS
NEXT_CURSOR
NEXT_ACTION
BOOT_PROFILE
```

Fluxo:

```text
CASA / CHAT / GEMINI / HERMES / OUTRA IA
→ LER PR ATIVO + HANDOFF
→ REMEDIR O QUE INVALIDOU
→ EXTRAIR DELTA UTIL
→ ATUALIZAR O MESMO FIO
→ ESCREVER NO PR SOMENTE O DELTA MATERIAL
→ PRESERVAR NEXT_CURSOR
```

Se o PR já estiver `MERGED/CLOSED`, ele vira genealogia/histórico. A continuação deve ocorrer no PR ativo correspondente ou em novo PR apenas quando houver escopo material realmente novo; nunca manter duas linhas concorrentes para o mesmo Writer scope.

```text
MERGED_PR = HISTORY + PROVENANCE
ACTIVE_PR = LIVE_COMMUNICATION_LEDGER
PR_BODY_OR_COMMENT != RUNTIME_PROOF
```

## 13. Gate pré-resposta — !CENTRALDARK antes de falar

Para qualquer resposta operacional, planejamento, diagnóstico, recomendação ou mutação relacionada à CentralDark, o agente deve primeiro verificar se sua leitura condiz com a intenção vigente do CHEFE.

```text
ANTES_DE_FALAR
→ !CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ recuperar PR/HANDOFF ativo quando disponível
→ comparar CHEFE_INTENT + DESTINATION_LOCK + GOAL + FIO_DA_MISSAO
→ medir CURRENT quando o fato for mensurável
→ reconciliar owner + Writer + evidência + UNKNOWN
→ só então responder
```

Isso não exige expor raciocínio interno. O agente reporta somente conclusão, estado, evidência, pendência e próximo cursor.

```text
CAN_MEASURE_NOW=true  → MEASURE
CAN_MEASURE_NOW=false → UNKNOWN
MEMORY_ONLY != CURRENT_STATE
PR_TEXT_ONLY != EXECUTED
SCREENSHOT_ONLY != CURRENT_RUNTIME
```

Se houver divergência entre a resposta pretendida e o handoff/estado vivo, corrigir a própria leitura antes de responder. Não corrigir a intenção do CHEFE para caber no modelo.

## 14. Formato obrigatório de fechamento do handoff

Quando uma resposta material da missão for concluída, terminar exatamente com estes campos, preenchidos com fatos ou `UNKNOWN`:

```text
Feito: [O que foi processado]
Evidência: [Prova técnica/lógica da validação]
Pendência: [O que depende de autorização, prova ou recurso ainda ausente]
Próximo passo: [Ação imediata recomendada ou NEXT_CURSOR]
Qual BOOT usar: [Perfil operacional adequado]
Fio da missão: [Intenção/objetivo que deve sobreviver para a próxima superfície]
```

Regras:

```text
SEM_EVIDENCIA → NÃO INVENTAR PASS
SEM_AUTORIZACAO → NÃO AMPLIAR ESCOPO
SEM_PR_ATIVO → USAR HANDOFF CANONICO + CURRENT STATE
PR_ATIVO → ATUALIZAR O MESMO FIO
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
