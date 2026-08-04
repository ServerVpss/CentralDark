---
name: cot-react-loop
description: Use durante tarefas complexas com múltiplas ferramentas para executar, medir, criticar, corrigir e parar com evidência, sem falso verde.
---
# COT-REACT-LOOP
Governar a fase **DURANTE** tarefas complexas com múltiplos passos e ferramentas.
```text
ANTES   → raciocinio-deliberado → decide escopo, relação causal, menor ação e autorização
DURANTE → cot-react-loop        → planeja, age, mede, critica, corrige e decide continuidade
DEPOIS  → meta-lupa             → falsifica alegações, bloqueia falso verde e sela o veredito
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
- não alterar SOUL, memória, config, missão, gateway, cron, Telegram, voz, GitHub ou VPS sem missão própria e autorização explícita.
## 2. Ativação
Usar para missão complexa, múltiplas ferramentas, execução por etapas,
necessidade de medir/corrigir, risco de perder o fio ou ordem de continuar até prova.
Triggers:
```text
usa loop durante | executa por etapas | missão complexa | múltiplas ferramentas
mede e corrige | não perde o fio | continua até prova | modo reagir
```
Não ativar para pergunta factual simples, ordem literal de um passo, resposta
já provada no disco, ação bloqueada por falta de autorização ou tarefa cuja
relação causal já foi rejeitada por `raciocinio-deliberado`.
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
Antes de promover: MetaLupa, avaliador independente quando disponível,
autorização aplicável, diff final, rollback e recibo. Ação R2+ nunca é
promovida automaticamente.
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
Escolher exatamente um:
```text
CONTINUE | STOP_SUCCESS | STOP_BLOCKED
STOP_POINT_FIXED | ROLLBACK | ESCALATE_TO_PIVETE
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
## 11. Integração com a Casa
- `raciocinio-deliberado`: entrega somente tarefa complexa já autorizada.
- `pivete-execution-standards`: preserva autoridade e níveis R0–R4.
- `meta-lupa`: permanece intacta e é chamada ao final para falsificar claims.
- `pivete-comunicacao-leiga`: saída em `SIGNIFICA`, `IMAGINE ASSIM`,
  `NA PRATICA`, `PROVA TECNICA`, `ESTADO`, `PROXIMO PASSO`.
## 12. Backup antes de editar
Para cada arquivo autorizado:
```text
1. calcular SHA-256
2. criar backup timestampado
3. verificar hash do backup
4. registrar caminho
```
Falha: `STATUS=BLOCKED_BACKUP` e `DECIDE=STOP_BLOCKED`.
## 13. Testes obrigatórios da implementação
Ao instalar ou alterar esta skill, executar uma rodada controlada em fixture
temporária isolada.
- **A — correção multi-step:** localizar causa, agir, medir, corrigir, provar e parar.
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
ROLLBACK=
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
PIVETE                 → autoriza promoção
```
```text
ANTES → DURANTE → DEPOIS
DECIDIR → EXECUTAR/MEDIR/CORRIGIR → FALSIFICAR/SELAR
```
Não é pensar muito, repetir ferramenta, escrever logs bonitos ou autoaprovar.
É objetivo verificável, ação real, observação real, crítica honesta, correção
limitada, teste comparável, parada correta e prova.
