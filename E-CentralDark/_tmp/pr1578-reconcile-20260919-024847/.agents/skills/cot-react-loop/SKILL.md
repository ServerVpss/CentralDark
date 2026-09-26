---
name: cot-react-loop
description: >-
  Use durante tarefas complexas com múltiplas ferramentas para executar, medir,
  criticar, corrigir e parar com evidência, sem falso verde. Também é descoberto
  automaticamente diante de ERROR, FAIL, DRIFT, REGRESSION, CONFLICT, UNKNOWN
  material, check vermelho, contrato/teste/hash divergente, estado obsoleto,
  autoridade ambígua ou tool failure; o gatilho abre diagnóstico, não autoridade.
---

# COT-REACT-LOOP

Governar a fase **DURANTE** tarefas complexas com múltiplos passos e ferramentas.

```text
ANTES   → raciocinio-deliberado → decide escopo, relação causal,
           menor ação e autorização
DURANTE → cot-react-loop        → planeja, age, mede,
           critica, corrige e decide continuidade
DEPOIS  → meta-lupa             → falsifica alegações, bloqueia falso verde
           e sela o veredito
```

Não substitui `raciocinio-deliberado`, `meta-lupa`, `pivete-execution-standards`
ou `pivete-comunicacao-leiga`.

## 1. Limites inegociáveis

```text
COT_NESTA_SKILL=CONTROLLED_OPERATIONAL_TRACE
CHAIN_OF_THOUGHT_STORAGE=PROIBIDO
```

Nunca pedir, registrar ou expor cadeia privada de pensamento. Registrar apenas:

```text
DECISAO | EVIDENCIA | ACAO | RESULTADO | LACUNA | PROXIMO_TESTE
```

Regras:

- autocrítica do Writer não é avaliação independente;
- não chamar teste de `HELD_OUT` sem isolamento real;
- teto de iterações nunca prova sucesso;
- não criar executor que finja controlar tools sem API oficial instalada e testada;
- não alterar SOUL, memória, config, missão, gateway, cron, Telegram, voz,
  GitHub ou VPS sem missão própria e autorização explícita.

## 2. Ativação

Usar para missão complexa, múltiplas ferramentas, execução por etapas,
necessidade de medir/corrigir, risco de perder o fio ou ordem de continuar até prova.
Triggers:

```text
usa loop durante | executa por etapas | missão complexa | múltiplas ferramentas
mede e corrige | não perde o fio | continua até prova | modo reagir
ERROR | FAIL | DRIFT | REGRESSION | CONFLICT | UNKNOWN material
check vermelho | contrato divergente | teste quebrado | hash drift
memória/estado obsoleto | autoridade ambígua | tool failure
```

Não ativar para pergunta factual simples, ordem literal de um passo, resposta
já provada no disco, ação bloqueada por falta de autorização ou tarefa cuja
relação causal já foi rejeitada por `raciocinio-deliberado`.

### 2.1 Auto-correction transversal sem skill paralela

O auto-trigger **não** concede escrita. Ele apenas entra em diagnóstico e
preserva `MISSION_ID`, alvo, Writer, HEAD e fio já existentes.

```text
TRIGGER MATERIAL
→ DETECTAR
→ LOCALIZAR CAUSA
→ REUSE_BEFORE_CREATE
→ CORRIGIR O MÍNIMO
→ PROVAR NO HEAD NOVO
→ META-LUPA/CONTRAPROVA APLICÁVEL
→ RETORNAR AO MESMO FIO
```

Para erro simples/local/reversível, usar o menor caminho causal e não inflar a
tarefa em loop complexo. Para erro amplo, recorrente ou multi-tool, continuar
pelo loop desta skill.

```text
SELF_HEALING=true
SELF_JUSTIFYING=false
REUSE_BEFORE_CREATE=true
RETURN_TO_MISSION_THREAD=true
UNKNOWN|SKIPPED|QUEUED|PENDING != PASS
```

Se outro Writer estiver ativo **no mesmo escopo**, permanecer `READ_ONLY` e
entregar somente delta; não disputar caneta:

```yaml
DELTA_MESSAGE:
  mission_id: ""
  from: "cot-react-loop"
  mode: READ_ONLY
  observed_state_sha: ""
  delta_type: "ERROR|FAIL|DRIFT|REGRESSION|CONFLICT|UNKNOWN|TOOL_FAILURE"
  severity: "P0|P1|P2|P3"
  do_not_rewind: true
  cause: ""
  minimal_fix: ""
  evidence: []
  apply_if: ""
  reject_if: ""
  proof_expected: []
```

Mesmo erro + zero informação nova + zero mudança = desperdício. Evidência que
mata hipótese/regra deve fazê-la mudar ou morrer; nunca ajustar teste ou
rebaixar canônico só para produzir verde.

### 2.2 Contexto estrutural antes da busca ampla

Quando a tarefa envolve código, a descoberta deve começar pelo mapa já existente
antes de varrer o repositório com `grep`, `glob` ou leituras amplas:

```text
INTENÇÃO
→ ÍNDICE/GRAFO/ROTA EXISTENTE
→ CANDIDATOS POR SIGNIFICADO
→ RELAÇÕES: callers, callees, imports, consumidores, testes
→ OWNER + ESCOPO
→ CONTEXTO MÍNIMO
→ BUSCA AMPLA SOMENTE SE O MAPA NÃO RESOLVER
```

Busca semântica só produz candidatos. Ela não escolhe sozinha entre funções que
compartilham vocabulário mas possuem efeitos opostos. O grafo é projeção; contrato,
consumidor, teste e runtime confirmam o alvo. Se não houver índice ou relação
suficiente, manter `UNKNOWN` e escalar a busca de forma explícita — nunca inventar
que o primeiro resultado é o owner.

```text
SEMANTIC_MATCH != OWNER_PROOF
GRAPH_RELATION != AUTHORITY
INDEX_MISS != FILE_ABSENCE
BROAD_SCAN_IS_FALLBACK=true
CONTEXT_MINIMUM_BEFORE_MODEL=true
```

A seleção do Bolt aplica essa regra com pré-classificação barata por caminho e
nome antes da chamada ao modelo, preservando a lista completa como fallback e
validando qualquer arquivo retornado contra o inventário original. O objetivo é
reduzir tokens e rodadas, não trocar prova estrutural por uma heurística lexical.

Quando a rota já foi provada para a mesma intenção, owner, ferramenta e estado,
reutilizar a decisão e executar o próximo passo determinístico. Reabrir somente
com nova evidência, falha observada, mudança material ou contradição provada.

## 3. Gate de entrada

Antes do primeiro uso de ferramenta, fixar:

```text
MISSION_ID | OBJETIVO | ALVO | WRITER | AUTHORIZATION_LEVEL
ESCOPO_PERMITIDO | ESCOPO_PROIBIDO | ROLLBACK
EVIDENCE_REQUIRED | STOP_CONDITIONS
```

Bloqueios:

```text
sem autorização     → STATUS=BLOCKED_AUTHORIZATION
sem baseline        → STATUS=BLOCKED_NO_BASELINE
alvo não fixado     → STATUS=BLOCKED_TARGET_UNPROVEN
backup falhou       → STATUS=BLOCKED_BACKUP
```

Em qualquer bloqueio: `DECIDE=STOP_BLOCKED`.

## 4. Brief pseudoformal obrigatório

Antes do primeiro `ACT`, montar:

```text
MISSION_ID
OBJETIVO
ALVO
CANDIDATE_REF
CANDIDATE_SHA256
BASELINE_REF
FIXTURE_REF
EVALUATION_REF
ESTADO_INICIAL
DEFINICOES
ESCOPO_PERMITIDO
ESCOPO_PROIBIDO
CONTROL_SURFACES_LOCKED
CONTROL_SURFACES_EDITABLE
SUCCESS_PREDICATE
NON_COUNTING_OUTCOMES
FAILURE_MODES
EVIDENCE_REQUIRED
ROLLBACK
AUTHORIZATION_LEVEL
WRITER
BUDGET
STOP_CONDITIONS
```

Campo inexistente deve ser `UNPROVEN`. Nunca inventar.

### 4.1 Identidade do candidato

Toda prova deve apontar para o mesmo `CANDIDATE_REF` e `CANDIDATE_SHA256`,
com `BASELINE_REF`, `FIXTURE_REF` e `EVALUATION_REF` correspondentes.
Se o candidato mudar:

```text
EVIDENCIA_ANTERIOR_INVALIDADA=SIM
NOVA_BASELINE_NECESSARIA=SIM
```

Nunca testar uma versão e promover outra.

### 4.2 Success predicate

```text
SUCCESS ⇔
alvo correto
∧ mudança dentro do escopo
∧ Target Split passa
∧ Second Split não piora
∧ pelo menos um indicador melhora estritamente
∧ evidência pertence ao mesmo candidato
∧ autorização válida
∧ nenhum bloqueio crítico
```

### 4.3 Non-counting outcomes

Não contam como sucesso:

- arquivo criado sem carregamento comprovado;
- HTTP 200 sem corpo validado;
- processo listado sem rota funcionando;
- `echo PASS`, painel verde ou ausência aparente de erro;
- teste apagado, pulado ou enfraquecido;
- mudança fora do escopo;
- explicação sem execução;
- autocrítica do próprio Writer;
- repetição idêntica sem informação nova;
- fallback oculto;
- resultado vazio de ferramenta;
- Git aparentemente limpo sem prova do conteúdo.

### 4.4 Failure modes

Antes da execução, escolher de 3 a 8 modos relevantes, por exemplo:
alvo incorreto, baseline contaminada, ação sem autorização, falso verde,
teste enfraquecido, fallback oculto, mudança fora do escopo e prova ligada
a candidato diferente. Não criar catálogo infinito.

### 4.5 Runtime image and tool output reading

Quando o usuário fornece screenshots ou tool output com status labels como
`MCP_AUTHENTICATED_E2E=PASS`, `TOOLS_LIST=HTTP_200`, `INITIALIZE=HTTP_200`,
o sistema JÁ ESTÁ autenticado e funcional. Esses labels são fatos do runtime,
não alegações a serem dubgadas.

Não confundir runtime local do navegador (ex: `ws://127.0.0.1:3030/connections/browser/ws?token=...` 403)
com falha do sistema central. O 403 do browser WebSocket é erro de runtime
local do usuário, não do nosso ecossistema. Se o MCP está autenticado e as
ferramentas listam normalmente, o WebSocket 403 é fora do escopo da missão
central e não requer ação no repositório.

```text
RUNTIME_LABELS_SHOW_PASS → SYSTEM_IS_AUTHENTICATED
BROWSER_WS_403 → RUNTIME_LOCAL_OUT_OF_SCOPE
MCP_AUTHENTICATED_E2E=PASS → NO_ACTION_NEEDED_ON_REPO
```

Se houver dúvida material sobre o estado, medir via `git ls-remote`,
`node --test`, `bash -n` — não via interpretação de screenshot.

### 4.5b Git Sequence — Fetch Before Push, Never Reset Hard

**Regra:** Antes de qualquer operação de push, pull ou merge, executar:
```bash
git fetch --no-tags origin refs/heads/main
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/main | cut -f1
```
Se `HEAD` local = `origin/main`, trabalho já está publicado — não criar
branch, não fazer push redundante. Se `origin/main` está AHEAD do local,
fazer merge antes de publicar. Se criando branch nova, basear em
`origin/main`, nunca em `main` local (que pode estar stale ou já conter
o commit publicado).

**Nunca** `git reset --hard <commit-antigo>` — destrói trabalho não
sincronizado com o remote. Se precisar descartar, usar `git reflog` para
encontrar o SHA anterior ou `git fetch origin` para recuperar do remote.

**Para criar PR-mãe:** após merge com `origin/main`, testes passando
(42/42), `git commit --amend --no-edit`, depois `gh pr create --base main
--head fix/writer-canonical-40`. O branch fix/writer-canonical-40 deve
estar baseado em `origin/main` atualizado. Se o trabalho já está em
`origin/main`, não criar branch — deletar branch local existente.

Pitfall: `git pull --ff-only` não funciona quando o branch local está
atrás (precisa de merge) ou quando está à frente (push pode rejeitar).
Sempre medir SHA local vs remote antes de decidir a operação.

### 4.6 Browser WebSocket 403 vs Central System Failure

**Regra:** Quando o usuário fornece screenshot mostrando `ws://127.0.0.1:3030/connections/browser/ws?token=...` com 403, mas `MCP_AUTHENTICATED_E2E=PASS`, `TOOLS_LIST=HTTP_200`, `INITIALIZE=HTTP_200`:
- O 403 é erro de runtime local do browser (conexão WebSocket do navegador para `127.0.0.1:3030`)
- O sistema central (MCP, GitHub, Casa) está funcionando normalmente
- NÃO agir no repositório — o problema é de runtime local, não do sistema central
- Registrar como `RUNTIME_LOCAL_OUT_OF_SCOPE` e continuar a missão principal

**Não confundir:**
- WebSocket 403 → runtime local browser → FORA DO ESCOPO
- MCP_AUTHENTICATED_E2E=PASS → sistema central autenticado → NO ACTION NEEDED
- Se houver dúvida real, medir via `git ls-remote`, `node --test`, `bash -n`

### 4.7 Execution Over Explanation — Do, Don't Fragment

**Regra cristalizada (Chefe, 2026-09-11):** "so conversa bonita nao serve".
O usuário NÃO quer fragmentos Q&A. Quer: ler integralmente → continuar a
história de forma conectada → executar.

**Quando o usuário diz "ler repo integramente e continuar a história":**
- Ler documentos completos, não apenas cabeçalhos
- Ler git log integralmente, não apenas últimos 5 commits
- Compreender contexto antes de responder às perguntas do usuário
- Executar o que foi prometido, não prometer e não executar
- Quando usuário dizer "pare de falar e faça", parar de narrar e executar

**Pitfall:** fragmentar uma leitura integral em múltiplas perguntas pontuais.
Isso é o erro exato que o Chefe corrigiu.

**Continuidade do mesmo escopo:** Se a correção já está autorizada, é
reversível e pertence ao mesmo owner/escopo, executar diretamente: separar
somente o delta, testar, commitar e publicar pela rota segura. Não criar
novo motor, skill, workflow ou parada de confirmação para cada variação da
mesma classe. Reabrir só com intenção nova, escopo novo, risco material,
contradição ou bloqueio real.

### 4.8 Standing Goal + `/goal` — continuidade material, não preâmbulo

O bloco mostrado antes de `/goal` é um **contrato de fase**, não um novo
motor. Ele deve reutilizar o mesmo `MISSION_ID`, goal pai, Writer, escopo e
predicado de sucesso até existir prova material de conclusão ou uma condição
terminal legítima.

```text
STANDING_GOAL=ACTIVE
GOAL_PARENT=STABLE
MICRO_GOAL=DERIVED_FROM_CURRENT_WOUND
PHASE_CONTRACT=REHYDRATE_NOT_REINVENT
PREAMBLE_IS_PROGRESS=false
ITERATION_COUNTER_IS_PROGRESS=false
PLANNING_TEXT_IS_DELIVERABLE=false
MISSING_REQUIRED_EVIDENCE_FORCE_CONTINUE=true
```

Antes de cada fase material, reidratar do estado já existente:

```text
MISSION_ID
OBJETIVO
ALVO
CANDIDATE_REF
CANDIDATE_SHA256
BASELINE_REF
FIXTURE_REF
EVALUATION_REF
ESTADO_INICIAL
DEFINICOES
ESCOPO_PERMITIDO
ESCOPO_PROIBIDO
CONTROL_SURFACES_LOCKED
CONTROL_SURFACES_EDITABLE
SUCCESS_PREDICATE
NON_COUNTING_OUTCOMES
FAILURE_MODES
EVIDENCE_REQUIRED
ROLLBACK
AUTHORIZATION_LEVEL
WRITER
BUDGET
STOP_CONDITIONS
```

Campos ausentes continuam `UNPROVEN`. Valores transitórios de uma execução
não viram arquitetura canônica.

Após cada ciclo:

```text
OBSERVE
→ COMPARE_REQUIRED_DELIVERABLES
→ UPDATE_EVIDENCE_MAP
→ IF_SUCCESS_PREDICATE_PROVEN: STOP_SUCCESS
→ ELSE_IF_HUMAN_FRONTIER_OR_EXACT_BLOCKER: STOP_BLOCKED
→ ELSE_IF_NO_NEW_INFORMATION: STOP_POINT_FIXED
→ ELSE: CONTINUE_TOWARD_STANDING_GOAL
```

`/goal` é somente superfície de introspecção do estado do goal; não cria
um goal novo, não altera autorização e não substitui prova.

```text
/goal RETURNS:
  GOAL_PARENT
  MISSION_ID
  SUCCESS_PREDICATE
  DELIVERABLES_REQUIRED
  DELIVERABLES_PROVEN
  DELIVERABLES_MISSING
  CURRENT_HEAD_OR_BASELINE
  CURRENT_WRITER
  CURRENT_SCOPE
  NEXT_CURSOR
```

Se a resposta do agente for apenas planejamento, boot, contrato ou narração
sem arquivo/diff/output/receipt exigido pelo goal, o avaliador deve manter:

```text
GOAL_STATUS=CONTINUE
REASON=NO_MATERIAL_DELIVERABLE_EVIDENCE
```

`EXECUTE_WITH_JUDGMENT` significa escolher o próximo passo dentro do escopo
já autorizado. Nunca significa ampliar permissão, alterar superfícies travadas,
ignorar Writer lease ou converter `UNKNOWN` em `PASS`.

O contador visual `10/20`, `18/20` etc. mede iterações do executor, não
porcentagem de conclusão. A conclusão é determinada apenas pelo
`SUCCESS_PREDICATE` e pela evidência requerida.

```text
STANDING_GOAL_SURVIVES_TURN=true
STANDING_GOAL_SURVIVES_TOOL_FAILURE=true
CHILD_FAILURE_DOES_NOT_REPLACE_PARENT_GOAL=true
CURRENT_WOUND_DRIVES_NEXT_MICRO_GOAL=true
GOAL_REOPENS_ONLY_ON_NEW_MATERIAL_EVIDENCE_OR_CONTRADICTION=true
```

## 5. Optimization Ladder

### Degrau 0 — BASELINE

Capturar estado, alvo, candidato, hash/HEAD aplicável, testes, superfície
mutável e Writer. Sem baseline: `STATUS=BLOCKED_NO_BASELINE`.

### Degrau 1 — REPRODUZIR

```text
FAILURE_REPRODUCED=SIM|NAO|UNPROVEN
```

Não corrigir falha não reproduzida, salvo investigação explicitamente autorizada.

### Degrau 2 — MINERAR A FALHA

Capturar:

```text
OBSERVACAO | ERRO | CONTEXTO_MINIMO | HIPOTESES
EVIDENCIA_FAVORAVEL | CONTRAEVIDENCIA | LACUNA
```

Classificar causa como `CONFIRMADA`, `CANDIDATA`, `REFUTADA` ou `DESCONHECIDA`.

### Degrau 3 — PROPOSTA LIMITADA

```text
PROPOSAL_ID | CLAIM | TARGET | EXPECTED_DELTA
FILES_ALLOWED | FILES_FORBIDDEN | ROLLBACK | RISK
```

A proposta não pode editar avaliador, rubrica, baseline, testes protegidos,
logs anteriores ou limites de autorização.

### Degrau 4 — VALIDAÇÃO EM DOIS SPLITS

`TARGET_SPLIT` prova a fraqueza alvo. `ADVERSARIAL_SECOND_SPLIT` prova
não regressão. Somente usar `HELD_OUT` quando o proponente não puder ler ou
alterar o teste antes da proposta.

```text
ACCEPT ⇔
TARGET_SPLIT não piora
∧ SECOND_SPLIT não piora
∧ pelo menos um indicador melhora estritamente
∧ nenhum bloqueio crítico novo
```

### Degrau 5 — PROMOÇÃO E RECIBO

Antes de promover: MetaLupa, avaliador independente comprovado,
autorização aplicável, diff final, rollback e recibo. Ação R2+ nunca é
promovida automaticamente.

Regra fail-closed:

```text
INDEPENDENT_EVALUATION=UNPROVEN
→ DECIDE=STOP_BLOCKED
→ VERDICT=BLOCKED
```

Sem avaliador separado comprovado, não usar `VERIFIED` nem `STOP_SUCCESS`.
Crítica interna do Writer continua útil para corrigir, mas nunca sela promoção.

## 6. Loop executável

```text
PLAN → ACT → OBSERVE → CRITIQUE → REFINE → DECIDE
```

### 6.1 PLAN

Registrar apenas:

```text
OBJETIVO_DA_PROXIMA_ACAO | TOOL_ESCOLHIDA
EVIDENCIA_ESPERADA | RISCO | ROLLBACK
```

### 6.2 ACT

Uma ação principal por ciclo. Não ampliar escopo silenciosamente, não executar
ação crítica sem autorização e não repetir comando idêntico sem nova hipótese.

### 6.3 OBSERVE

Capturar, quando existirem:

```text
STDOUT | STDERR | EXIT_CODE | ARQUIVO_OU_DIFF
STATUS_DA_FERRAMENTA | TIMESTAMP | ALVO | CANDIDATE_REF
```

Sanitizar segredo. Ausência de saída não é sucesso.

### 6.4 CRITIQUE

Classificar `PASS`, `FAIL`, `GAP` ou `BLOCKED` e registrar:

```text
CLAIM_TESTED | EVIDENCE_REF | COUNTEREVIDENCE
WHAT_CHANGED | WHAT_DID_NOT_CHANGE
```

Crítica interna não é juiz independente.

### 6.5 REFINE

Refinar somente quando a observação alterar a hipótese:

```text
HIPOTESE_ATUALIZADA | PROXIMO_TESTE_DE_MAIOR_VALOR | MUDANCA_MINIMA
```

Não recomeçar do zero.

### 6.6 DECIDE

Escolher exatamente um estado terminal ou de continuidade:

```text
CONTINUE | STOP_SUCCESS | STOP_BLOCKED
STOP_POINT_FIXED | ESCALATE_TO_PIVETE
```

Rollback é ação separada do veredito:

```text
ROLLBACK_STATUS=NOT_NEEDED | READY | DONE | FAILED
```

Exemplo de falha após mutação:

```text
DECIDE=STOP_BLOCKED
ROLLBACK_STATUS=DONE
```

## 7. Critérios de parada

### Sucesso

```text
SUCCESS_PREDICATE comprovado
∧ recibo completo
∧ nenhuma prova crítica ausente
```

### Bloqueio

Parar por falta de autorização, acesso ou baseline; risco acima do envelope;
necessidade de segredo; alvo inexistente; dependência externa indisponível.

### Ponto fixo

```text
μ(k) =
hipóteses abertas
+ bloqueios
+ evidências não ancoradas
+ testes pendentes
+ risco residual
```

Se `μ(k+1)=μ(k)` por três ciclos úteis consecutivos:

```text
STATUS=PONTO_FIXO_ATINGIDO
PASS=NAO
DECIDE=STOP_POINT_FIXED
```

Ponto fixo nunca é PASS.

### Estagnação operacional

Também parar quando a mesma ação foi tentada sem informação nova, o próximo
passo não tem valor de informação, a correção exige sair do escopo ou o
avaliador não pode permanecer fora da superfície mutável.

## 8. Outside-the-Loop Invariant

O candidato não controla o critério que o aprova.
Superfície bloqueada:

```text
rubrica | baseline | testes protegidos | resultado anterior | budget
permissões | sandbox | gate de autorização | logs imutáveis
identidade do evaluator
```

Superfície editável: somente o alvo autorizado.
Avaliador realmente separado:

```text
EVALUATOR_ROLE=READ_ONLY
EVALUATOR_WRITER=NAO
EVALUATOR_CAN_EDIT_CANDIDATE=NAO
EVALUATOR_CAN_EDIT_TESTS=NAO
EVALUATOR_SAME_AS_PROPOSER=NAO
```

Sem separação real:

```text
INDEPENDENT_EVALUATION=UNPROVEN
```

Se o candidato tentar alterar teste, reduzir cobertura, mascarar erro, editar
rubrica, remover log, ampliar permissão ou converter `UNKNOWN` em `PASS`:

```text
CANDIDATE_RESULT=FAIL
SECURITY_FINDING=SIM
```

## 9. Resultado empírico não é justificativa

Registrar separadamente:

```text
EMPIRICAL_RESULT | RATIONALE | CAUSAL_CLAIM | CONFIDENCE | COUNTEREVIDENCE
```

```text
teste passou          ≠ causa confirmada
benchmark melhorou    ≠ arquitetura correta
uma rodada funcionou  ≠ generalização provada
ausência de falha     ≠ segurança provada
```

## 10. Rastro durável

Primeiro localizar destino canônico existente: logs de missão, card, Kanban,
receipts, workspace temporário ou session archive. Não criar logger paralelo.
Quando JSONL for canônico:

```json
{"mission_id":"","candidate_ref":"","iteration":0,"phase":"PLAN|ACT|OBSERVE|CRITIQUE|REFINE|DECIDE","claim":"","action":"","tool":"","target":"","evidence_ref":"","status":"PASS|FAIL|GAP|BLOCKED","risk":"","next_test":"","timestamp":""}
```

Nunca registrar cadeia de pensamento, segredo, token, `.env` integral ou
memória pessoal desnecessária.

### 10.1 SEGRET_REDOACTION — Redaction Rule
**Regra:** Quando o CheFE diz "permito segredo", valores nunca são exibidos ou preservados. Substituir tudo que seja segredo, token, senha, API key, credential ou connection string por `[REDACTED]` em todo output, artifact, diff, receipt, log ou arquivo. Isso inclui screenshots — borrar ou omitir valores sensíveis antes de descrever.

```text
QUALQUER_VALOR_SECRETO → [REDACTED]
```

## 11. Integração com a Casa

- `raciocinio-deliberado`: entrega somente tarefa complexa já autorizada.
- `pivete-execution-standards`: preserva autoridade e níveis R0–R4.
- `meta-lupa`: permanece intacta e é chamada ao final para falsificar claims.
- `pivete-comunicacao-leiga`: saída em `SIGNIFICA`, `IMAGINE ASSIM`,
  `NA PRATICA`, `PROVA TECNICA`, `ESTADO`, `PROXIMO PASSO`.

## 12. Backup antes de editar

Para cada arquivo autorizado:

```text
1. calcular SHA-256 antes da edição
2. criar backup timestampado
3. calcular SHA-256 do backup
4. editar somente o alvo autorizado
5. calcular SHA-256 depois da edição
6. registrar caminho, baseline e candidato
```

Campos obrigatórios no recibo:

```text
SHA256_BEFORE=
BACKUP_REF=
BACKUP_SHA256=
SHA256_AFTER=
CANDIDATE_REF=
CANDIDATE_SHA256=
BASELINE_REF=
```

`GIT_BLOB_SHA1` pode provar identidade Git, mas não substitui os campos
`SHA-256` exigidos pelo contrato operacional. Falha: `STATUS=BLOCKED_BACKUP`,
`DECIDE=STOP_BLOCKED` e `ROLLBACK_STATUS=READY|DONE|FAILED`.

## 13. Testes obrigatórios da implementação

Ao instalar ou alterar esta skill, executar uma rodada controlada em fixture
temporária isolada.

- **A — correção multi-step:** localizar causa, agir, medir, corrigir, provar
  e parar.
- **B — fora do escopo:** `OUT_OF_SCOPE` e `NAO_TOCADO`.
- **C — falso verde:** `echo PASS` deve produzir `FALSE_GREEN_REJECTED=SIM`.
- **D — teste enfraquecido:** `CANDIDATE_RESULT=FAIL`.
- **E — autorização:** ação R2+ sem ordem deve produzir `BLOCKED_AUTHORIZATION`.
- **F — ponto fixo:** três ciclos sem reduzir `μ` devem produzir
  `PONTO_FIXO_ATINGIDO` e `PASS=NAO`.
- **G — evaluator não isolado:** `INDEPENDENT_EVALUATION=UNPROVEN` e
  `TRUE_HELD_OUT_AVAILABLE=NAO`.

## 14. Testes estruturais

Validar frontmatter aceito, descrição indexável, descoberta por `skill_view`,
triggers reconhecíveis, ausência de skill irmã duplicada, referências quebradas,
arquivo ornamental, segredo ou mudança fora do escopo. Comparar hashes antes e
depois. Testar carregamento em sessão nova sem reiniciar gateway.

## 15. Gate final

Aplicar MetaLupa sobre a implementação:

```text
C1=buraco DURANTE comprovado
C2=destino canônico correto
C3=nenhuma duplicação criada
C4=brief pseudoformal implementado
C5=Optimization Ladder implementada
C6=loop PLAN-ACT-OBSERVE-CRITIQUE-REFINE-DECIDE implementado
C7=non-counting outcomes implementados
C8=estagnação/ponto fixo implementados
C9=outside-loop tratado honestamente
C10=two-split sem falso held-out
C11=R0-R4 preservado
C12=MetaLupa preservada como pós-gate
C13=fixtures passaram
C14=falso verde rejeitado
C15=rollback comprovado
C16=carregamento em sessão nova comprovado
```

Registrar:

```text
CLAIMS_TOTAL=16
CLAIMS_APLICAVEIS=
CLAIMS_REPRODUZIDAS=
CLAIMS_NAO_APLICAVEIS=
```

`NAO_APLICAVEL` exige justificativa e evidência. Nunca esconder `UNKNOWN`,
`SKIPPED` ou `UNPROVEN`.
Vereditos: `VERIFIED`, `VERIFIED_WITH_CAVEATS`, `REFUTED`, `BLOCKED` ou
`NO_CHANGE_REQUIRED`.

O gate final permanece bloqueado até existir evidência real de:

```text
FIXTURES_A_G_EXECUTED=SIM
NEW_SESSION_LOADING_CHECK=PASS
C13_EVIDENCE=PASS
C14_EVIDENCE=PASS
C16_EVIDENCE=PASS
```

Enquanto qualquer item estiver `UNKNOWN`, `SKIPPED` ou `UNPROVEN`:

```text
STATUS=BLOCKED
VERDICT=BLOCKED
STOP_SUCCESS=PROIBIDO
VERIFIED=PROIBIDO
```

## 16. Saída obrigatória

```text
MISSION_ID=
STATUS=
PROFILE=pivete
GAP_DURANTE_PROVADO=
CANONICAL_DESTINATION=
SKILL_CREATED=
SKILL_UPDATED=
DUPLICATION_FOUND=
PARALLEL_SKILL_CREATED=NAO
FILES_READ=
FILES_CHANGED=
BACKUPS=
SHA256_BEFORE=
SHA256_AFTER=
CANDIDATE_REF=
CANDIDATE_SHA256=
BASELINE_REF=
FIXTURE_REF=
EVALUATION_REF=
BRIEF_IMPLEMENTED=
OPTIMIZATION_LADDER_IMPLEMENTED=
PLAN_ACT_OBSERVE_CRITIQUE_REFINE_DECIDE=
NON_COUNTING_OUTCOMES_IMPLEMENTED=
FAILURE_MODES_IMPLEMENTED=
BOUND_PROPOSAL_IMPLEMENTED=
TARGET_SPLIT_IMPLEMENTED=
SECOND_SPLIT_IMPLEMENTED=
TRUE_HELD_OUT_AVAILABLE=
OUTSIDE_LOOP_EVALUATOR=
CONTROL_SURFACES_LOCKED=
DURABLE_LOG_DESTINATION=
FALSE_GREEN_REJECTED=
TEST_WEAKENING_REJECTED=
AUTHORIZATION_GATE_PRESERVED=
POINT_FIXED_NOT_PASS=
RACIOCINIO_DELIBERADO_PRESERVED=
META_LUPA_PRESERVED=
EXECUTION_STANDARDS_PRESERVED=
COMMUNICATION_STYLE_PRESERVED=
EXECUTOR_PROGRAMATICO=
TESTS=
CLAIMS_TOTAL=16
CLAIMS_APLICAVEIS=
CLAIMS_REPRODUZIDAS=
CLAIMS_NAO_APLICAVEIS=
ZERO_REGRESSION=
RISK_RESIDUAL=
ROLLBACK_STATUS=
ROLLBACK_REF=
VERDICT=
NEXT_ACTION=
```

Depois explicar em:

```text
SIGNIFICA | IMAGINE ASSIM | NA PRATICA
PROVA TECNICA | ESTADO | PROXIMO PASSO
```

Finalizar e parar.

## 17. Fórmula operacional

```text
RACIOCINIO-DELIBERADO → decide antes
COT-REACT-LOOP        → executa, mede e corrige durante
META-LUPA             → tenta derrubar depois
SEGREDO/CHEFE          → autoridade final para promoção
```

```text
ANTES → DURANTE → DEPOIS
DECIDIR → EXECUTAR/MEDIR/CORRIGIR → FALSIFICAR/SELAR
```

Não é pensar muito, repetir ferramenta, escrever logs bonitos ou autoaprovar.
É objetivo verificável, ação real, observação real, crítica honesta, correção
limitada, teste comparável, parada correta e prova.