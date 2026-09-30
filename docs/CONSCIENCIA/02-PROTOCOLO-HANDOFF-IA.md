---
title: "02 PROTOCOLO HANDOFF IA"
date: 2026-06-29
updated: 2026-09-17
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

## 8.1. Fio Vivo — recuperação por pista mínima

Continuidade não exige carregar toda a história na cabeça do humano nem no contexto ativo. Uma pista curta pode resolver a ponte correta e recuperar apenas o fio necessário.

```text
UMA_PALAVRA_OU_SINAL
→ ENCONTRA_PONTE_EXISTENTE
→ ATRAVESSA
→ RECUPERA_CONTEXTO_MINIMO_NECESSARIO
→ REVALIDA_ESTADO_TEMPORAL_QUANDO_MATERIAL
→ CONTINUA_NO_NEXT_CURSOR
```

```text
CUE_IS_POINTER_NOT_AUTHORITY=true
CUE_MATCH_IS_NOT_FACT=true
CUE_DOES_NOT_CREATE_OWNER=true
PERSONAL_SYMBOL_MEANING_REQUIRES_CHEFE_DEFINITION=true
RAW_PERSONAL_MEDIA_DO_NOT_ENTER_GIT_BY_DEFAULT=true
HISTORY_RECOVERED_BY_CUE != CURRENT_STATE
```

Contexto pessoal pode preservar linguagem, trajetória e significado quando autorizado, mas não substitui medição técnica. O repo guarda o contrato/delta operacional; não precisa guardar foto pessoal bruta para preservar o aprendizado extraído dela.


## 8.2. Linhagem de cristais — nada provado fica para trás

O estado atual não apaga o que veio antes. Todo cristal material, componente
provado, owner, decisão persistida, receipt e handoff relevante vira entrada da
reconciliação seguinte. O histórico não governa o presente, mas também não pode
ser descartado só porque existe uma medição mais nova.

```text
CURRENT_DOES_NOT_ERASE_PAST=true
PAST_PROVEN_CRYSTAL_IS_RECONCILIATION_INPUT=true
HISTORY_IS_PROVENANCE_NOT_CURRENT_AUTHORITY=true
REUSE_MERGED_CRYSTAL_AND_EXISTING_OWNER=true
ABSORB_ONLY_MATERIAL_DELTA=true
NO_BLIND_COPY_FROM_HISTORY=true
NO_DELETE_HISTORY_WITHOUT_PROOF=true
```

Antes de fechar handoff, promover Fixed Point ou redesenhar o mapa, reconstruir
a linhagem material aplicável:

```text
PRs
+ commits
+ receipts
+ handoffs
+ cristais
+ owners
+ mapas
+ runtime proofs
+ aprendizados promovidos
→ CLASSIFY
→ DEDUPE
→ RECONCILE
→ LINK_TO_CURRENT_OWNER
→ PRESERVE_USEFUL_DELTA
```

Classificações mínimas:

```text
CURRENT
ABSORBED
SUPERSEDED
HISTORICAL
CANDIDATE
CONFLICTING
UNKNOWN
```

Para cada peça comprovada/materializada, preservar quando aplicável:

```text
CRYSTAL_REF
SOURCE_REF
OWNER_CANONICO
STATUS
DELTA_RETAINED
CONSUMER
HANDOFF_REF
EVIDENCE_REFS
COUNTERPROOF_REFS
NEXT_CURSOR
MISSING_LINKS
```

Invariantes:

```text
PROVEN_COMPONENT_MUST_HAVE_OWNER=true
PROVEN_COMPONENT_MUST_HAVE_HANDOFF=true
PROVEN_COMPONENT_MUST_BE_INDEXABLE=true
PROVEN_COMPONENT_WITHOUT_LINEAGE != FIXED_POINT
MAP_MOVE_WITHOUT_HANDOFF = INVALID
MAP_REDESIGN_WITHOUT_RECONCILIATION = INVALID
FORGOTTEN_PROVEN_COMPONENTS=0
```

Uma peça pode mudar de endereço, owner operacional ou relação, mas a mudança
precisa deixar ponte explícita para o estado anterior. O próximo agente deve
conseguir descobrir de onde veio, por que mudou, o que sobreviveu e qual é o
próximo cursor sem redesenhar a CentralDark do zero.

### Mapa visual / Figma como projeção da mesma linhagem

Quando uma superfície visual estiver disponível, ela projeta o mesmo grafo
canônico; não cria segunda verdade.

```text
CANONICAL_GRAPH
→ VISUAL_PROJECTION
→ FIGMA|FIGJAM|MERMAID|OBSIDIAN
```

```text
VISUAL_IS_TRUTH=false
FIGMA_IS_CAPABILITY_NOT_AUTHORITY=true
VISUAL_MUST_PRESERVE_CRYSTAL_LINEAGE=true
VISUAL_MUST_PRESERVE_OWNER_AND_HANDOFF=true
VISUAL_UPDATE_EXTENDS_EXISTING_MAP=true
VISUAL_RESTART_FROM_ZERO=false
```

Se Figma estiver indisponível, preservar a representação textual/Mermaid e
marcar a superfície visual como `UNKNOWN|UNAVAILABLE`; nunca fingir que a
materialização ocorreu.


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



## 9.1 Matriz de rotas autorizadas — nomeie o bloqueio, troque o transporte quando permitido

Quando uma ferramenta bloquear uma ação, é inválido responder apenas
`"camada de segurança bloqueou"`. O agente deve registrar o **nome exato da
ferramenta/camada**, a ação negada e qual rota autorizada foi tentada depois.

```text
GENERIC_SECURITY_LAYER_MESSAGE=INVALID
BLOCKER_MUST_NAME=TOOL|CLASSIFIER|ACTION|HOST|ROUTE
TRANSPORT_FAILURE_REQUIRES_AUTHORIZED_ALTERNATE_ROUTE=true
DO_NOT_BYPASS_A_TRUE_SAFETY_DENIAL=true
AUTHORIZED_ROUTE_SWITCH_IS_NOT_SAFETY_BYPASS=true
```

Rotas conhecidas da CentralDark, em ordem de pertinência ao alvo:

```text
1. CENTRALDARK_MCP
   - MCP Admin / catálogo / dispatcher / provider_read
   - admin_commit_main
   - admin_git_pull
   - admin_shell quando disponível e autorizado
   - vps_git_status / vps_read_file_safe / search_files / deploy_status

2. GITHUB
   - GitHub MCP / Contents API / push_files
   - PRs / issues / comments / checks / workflow dispatch
   - fonte canônica estrutural: ServerVpss/CentralDark@main

3. VPS_DIRECT
   - SSH direto para VPS
   - shell do runtime
   - systemd / PM2 / arquivos locais / portas / processos

4. TAILSCALE
   - SSH sobre tailnet
   - acesso privado entre Casa, VPS e CENTRALDARK-OS
   - preferir rota privada quando o alvo não precisa exposição pública

5. REMOTE_DESKTOP_COMMANDER
   - Casa/Windows SEGREDO
   - VPS quando device correspondente estiver online
   - filesystem + terminal + processos + portas conforme capability exposta

6. CASA
   - PowerShell / SSH alias / ferramentas locais
   - Casa é edge opcional; CASA_OFFLINE != VPS_BLOCKED

7. GITHUB_ACTIONS
   - workflow_dispatch / runners / deploy jobs / rerun
   - usar quando o workflow existente é o owner da ação

8. PROVIDER_APIS
   - Contabo API via owner CentralDark/provider tools
   - Cloudflare API via owner CentralDark/provider tools
   - Supabase e demais providers via owner já existente
   - painel externo é fallback humano, não primeira rota quando API owner existe

9. CENTRALDARK_PUBLIC_API
   - api.centralldark.com
   - mcp.centralldark.com
   - Hub/Instinto Superior como superfície administrativa quando capability existir
```

Regra de fallback:

```text
ROTA_A_FALHOU
→ NOMEAR ferramenta/camada exata + ação + erro
→ CLASSIFICAR:
   TRANSPORTE/PERMISSAO_LOCAL?
      → tentar próxima rota AUTORIZADA que preserve a mesma intenção
   NEGACAO_REAL_DE_SEGURANCA?
      → não contornar; registrar blocker exato
→ REMEDIR
→ CONTINUAR
```

Exemplos de nome correto de bloqueio:

- `Claude Code auto-mode classifier` bloqueou `chmod +x`.
- `Claude Code auto-mode classifier` bloqueou `git commit` por conteúdo referenciando paths sensíveis.
- `CentralDark MCP admin_git_pull` retornou timeout.
- `Remote Desktop Commander` device `SEGREDO` offline.
- `Tailscale SSH` falhou no transporte.
- `GitHub Actions` workflow/check falhou no HEAD exato.

Não chamar tudo isso de “camada de segurança”. O nome material do mecanismo faz
parte da prova e permite ao próximo executor escolher a rota correta sem devolver
trabalho mecânico ao CHEFE.

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

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
