# COMANDO MESTRE — INTEGRAR LOOP EXECUTÁVEL DURANTE TAREFAS COMPLEXAS NO HERMES-CASA

> Cole este arquivo inteiro no Hermes CLI, no profile `pivete`.
>
> A missão não é criar “mais uma skill bonita”. É provar se existe um buraco operacional DURANTE tarefas complexas e, somente se existir, preencher esse buraco no artefato canônico correto, sem duplicar `raciocinio-deliberado`, `meta-lupa` ou `pivete-execution-standards`.

---

## 0. IDENTIDADE DA MISSÃO

```text
MISSION_ID=INTEGRAR_LOOP_EXECUTAVEL_DURANTE_NO_HERMES_CASA
PROFILE=pivete
AUTORIDADE_FINAL=PIVETE_SEGREDO_CHEFE
CASA_ONLY=SIM
WRITER_UNICO=HERMES_CLI
MODO=EDICAO_LOCAL_CONTROLADA
RODADA_DE_IMPLEMENTACAO=1
GITHUB=NAO
VPS=NAO
RESTART=NAO
DEPLOY=NAO
MERGE=NAO
PUSH=NAO
SECRETS_ACCESS=NAO
PROVIDER_MEMORY_CHANGE=NAO
SOUL_CHANGE=NAO
CONFIG_CHANGE=NAO
```

## 1. OBJETIVO

Criar ou melhorar **um único mecanismo canônico** para governar a fase DURANTE tarefas complexas com múltiplos passos e ferramentas.

Arquitetura desejada:

```text
ANTES
→ raciocinio-deliberado
→ decide escopo, relação causal, menor ação e autorização

DURANTE
→ loop executável canônico
→ planeja, age, mede, critica, corrige e decide continuidade

DEPOIS
→ meta-lupa
→ falsifica alegações, bloqueia falso verde e sela o veredito
```

O nome candidato é:

```text
cot-react-loop
```

Mas esse nome **não autoriza criação automática**.

Primeiro prove se:

1. já existe skill equivalente;
2. existe implementação parcial em outra skill;
3. o buraco DURANTE é real;
4. a função não pertence melhor a um artefato canônico já existente.

Se existir equivalente, **melhore o canônico existente**.

Somente crie `cot-react-loop` quando nenhuma skill atual assumir claramente essa responsabilidade.

---

# 2. CORREÇÕES IMPORTANTES AO PLANO ORIGINAL

Estas regras são obrigatórias.

## 2.1 Não registrar cadeia privada de pensamento

Não peça, não armazene e não exponha raciocínio interno detalhado.

Use apenas um registro operacional curto:

```text
DECISAO
EVIDENCIA
ACAO
RESULTADO
LACUNA
PROXIMO_TESTE
```

O loop pode ter uma fase chamada `PLAN`, mas ela registra apenas plano verificável, não cadeia privada de pensamento.

## 2.2 Não usar autocrítica como juiz independente

O mesmo agente pode fazer uma checagem interna, mas isso **não é Outside-the-Loop Invariant**.

Para declarar avaliação independente, exija:

- avaliador separado do Writer;
- rubrica fora da superfície mutável;
- baseline e testes que o proponente não pode editar;
- evidência vinculada ao mesmo candidato;
- ausência de permissão de escrita no avaliador.

Se isso não puder ser garantido:

```text
OUTSIDE_LOOP_EVALUATOR=UNPROVEN
```

Nunca transformar autoavaliação em juiz independente.

## 2.3 Não chamar teste de “held-out” sem isolamento real

Um conjunto só é `HELD_OUT` quando o proponente não consegue ler ou alterar o teste antes de propor a mudança.

Se o mesmo processo/usuário puder acessar tudo, classifique como:

```text
ADVERSARIAL_SECOND_SPLIT
```

e não como held-out verdadeiro.

## 2.4 Não usar `max_iter=5` como regra cega

Não parar só porque chegou a cinco iterações.

Usar:

```text
PROGRESSO_REAL
ESTAGNACAO
RISCO
ORCAMENTO_DA_MISSAO
AUTORIZACAO
```

Critério de estagnação:

```text
3 ciclos consecutivos sem reduzir hipótese, bloqueio, risco
ou próximo teste
→ STATUS=PONTO_FIXO_ATINGIDO
→ não é PASS
```

Pode existir um teto emergencial definido pela missão, mas teto nunca prova sucesso.

## 2.5 Não criar script que finge controlar tools do Hermes

Um script Python comum não deve alegar que invoca `terminal`, `web`, `file`, `code` ou outras tools internas do Hermes se não existir API real para isso.

Primeiro inspecione a capacidade instalada.

Somente crie executor quando houver interface oficial e testável.

Caso contrário, a skill deve governar o próprio agente Hermes, e qualquer executor fica:

```text
EXECUTOR_PROGRAMATICO=NAO_NECESSARIO|UNPROVEN
```

---

# 3. GATE 0 — MAPEAR O QUE JÁ EXISTE

Leia integralmente, quando existirem:

```text
C:\Users\danda\AppData\Local\hermes\skills\hermes\raciocinio-deliberado\SKILL.md
C:\Users\danda\AppData\Local\hermes\skills\hermes\pivete-execution-standards\SKILL.md
C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\meta-lupa\SKILL.md
C:\Users\danda\AppData\Local\hermes\skills\hermes\pivete-comunicacao-leiga\SKILL.md
C:\Users\danda\AppData\Local\hermes\skills\hermes\cot-react-loop\SKILL.md
```

Pesquisar também por função:

```text
PLAN
ACT
OBSERVE
CRITIC
REFINE
DECIDE
optimization ladder
outside-the-loop
held-in
held-out
failure mining
bounded proposal
non-counting outcomes
success predicate
control surfaces
rollback
novelty gate
durable logs
ponto fixo
estagnação
```

Usar `skill_view`, índice das skills e leitura direta.

Produzir uma matriz:

```text
RESPONSABILIDADE
ARTEFATO_ATUAL
COBERTURA
SOBREPOSICAO
LACUNA
DESTINO_CANONICO
EVIDENCIA
```

Responsabilidades mínimas:

```text
pré-filtro de relação
autorização R0–R4
brief pseudoformal
estado inicial
plano de ação
execução por tool
captura de observação
classificação de falha
proposta limitada
teste da fraqueza alvo
teste de não regressão
avaliador independente
controle de superfície mutável
rollback
registro durável
critério de parada
gate de promoção
comunicação leiga
```

## Decisão Gate 0

```text
SE skill equivalente existe
→ PATCH_MINIMO_NO_CANONICO

SE cobertura parcial existe em artefato correto
→ CONSOLIDAR_NO_MESMO_ARTEFATO

SE buraco DURANTE é comprovado e nenhum canônico cobre
→ CRIAR cot-react-loop

SE o buraco não for comprovado
→ STATUS=NO_CHANGE_REQUIRED
→ PARE
```

Não criar skill por entusiasmo.

---

# 4. FONTES CONCEITUAIS A INCORPORAR

Incorporar somente os mecanismos abaixo, sem copiar texto ornamental.

## 4.1 `self-improvement-loops`

Extrair:

```text
Optimization Ladder
Outside-the-Loop Invariant
Two-split acceptance
Failure mining
Bounded proposal
Validation
Empirical acceptance never rationale
```

## 4.2 `long-horizon-prompting`

Extrair:

```text
outcome-first
pseudo-formal brief
definitions
success predicate
non-counting outcomes
failure modes enumerados
persistence
verification gate
adversarial audit
lean prompt
```

## 4.3 `harness-engineering`

Extrair:

```text
control surfaces locked/editable
durable logs
rollback
novelty gates
human approval boundaries
runtime enforcement
```

## 4.4 Integração Casa

Preservar:

```text
raciocinio-deliberado = ANTES
loop executável = DURANTE
meta-lupa = DEPOIS
pivete-execution-standards = execução Casa/R0-R4
pivete-comunicacao-leiga = forma de explicar
```

Nenhum deles substitui o outro.

---

# 5. DESTINO CANÔNICO

Destino preferencial, somente se Gate 0 autorizar:

```text
C:\Users\danda\AppData\Local\hermes\skills\hermes\cot-react-loop\SKILL.md
```

Estrutura permitida dentro da mesma skill:

```text
cot-react-loop/
├── SKILL.md
├── references/
│   ├── brief-template.md
│   ├── failure-mode-catalog.md
│   └── claim-provenance.md
└── scripts/
    └── cot_react_loop.py
```

Mas:

```text
SKILL.md = obrigatório se a skill for criada
references = criar somente se reduzirem o corpo principal e forem realmente usadas
script = criar somente se houver API/harness real e testável
```

Não criar arquivos vazios, decorativos ou futuros.

Limite orientativo do `SKILL.md`:

```text
até 500 linhas
```

Se ultrapassar, mover detalhes estáveis para `references/`, preservando uma skill principal legível.

---

# 6. CONTRATO DA SKILL

O frontmatter deve obedecer ao formato real aceito pelo Hermes instalado.

Nome:

```text
cot-react-loop
```

Descrição curta, indexável e sem promessa exagerada:

```text
Use durante tarefas complexas com múltiplas ferramentas para executar,
medir, criticar, corrigir e parar com evidência, sem falso verde.
```

Triggers sugeridos:

```text
usa loop durante
executa por etapas
missão complexa
múltiplas ferramentas
mede e corrige
não perde o fio
continua até prova
modo reagir
```

Não ativar para:

```text
pergunta factual simples
ordem literal de um passo
resposta que já está provada no disco
ação bloqueada por falta de autorização
tarefas onde raciocinio-deliberado já concluiu que não há relação
```

---

# 7. PSEUDO-FORMAL BRIEF

Antes do primeiro uso de ferramenta, montar um brief curto.

```text
MISSION_ID
OBJETIVO
ALVO
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

## 7.1 Success predicate

Deve ser verificável.

Exemplo:

```text
SUCCESS ⇔
alvo correto
∧ mudança no escopo
∧ teste alvo passa
∧ teste de não regressão não piora
∧ evidência vinculada ao candidato
∧ autorização válida
∧ nenhum bloqueio crítico
```

## 7.2 Non-counting outcomes

Registrar o que **não conta** como sucesso:

```text
arquivo criado sem ser carregado
HTTP 200 sem validar o corpo
processo listado sem rota funcionando
echo PASS
teste apagado
teste pulado
mudança fora do escopo
explicação convincente sem execução
autocrítica do próprio Writer
reexecução da mesma ação sem informação nova
modelo responder por fallback oculto
painel verde
ausência de erro aparente
```

## 7.3 Failure modes

Enumerar antes da execução os modos de falha mais prováveis.

Não usar catálogo infinito.

Selecionar de 3 a 8 modos relevantes para a missão.

---

# 8. OPTIMIZATION LADDER — SEIS DEGRAUS

## DEGRAU 0 — BASELINE

```text
capturar estado
fixar candidato/alvo
registrar hashes/HEAD quando aplicável
registrar testes e estados
registrar superfície mutável
registrar Writer
```

Sem baseline comparável:

```text
STATUS=BLOCKED_NO_BASELINE
```

## DEGRAU 1 — REPRODUZIR

Reproduzir a fraqueza ou necessidade.

```text
FAILURE_REPRODUCED=SIM|NAO|UNPROVEN
```

Não propor correção para falha que não foi reproduzida, salvo investigação explicitamente autorizada.

## DEGRAU 2 — MINERAR A FALHA

Capturar:

```text
observação
erro
contexto mínimo
hipóteses
evidência favorável
contraevidência
lacuna
```

Classificar causa como:

```text
CONFIRMADA
CANDIDATA
REFUTADA
DESCONHECIDA
```

## DEGRAU 3 — PROPOSTA LIMITADA

Criar a menor proposta que pode alterar a evidência.

```text
PROPOSAL_ID
CLAIM
TARGET
EXPECTED_DELTA
FILES_ALLOWED
FILES_FORBIDDEN
ROLLBACK
RISK
```

A proposta não pode editar:

```text
avaliador
rubrica
baseline
testes protegidos
logs anteriores
limites de autorização
```

## DEGRAU 4 — VALIDAÇÃO EM DOIS SPLITS

### Split A — fraqueza alvo

```text
TARGET_SPLIT
```

Prova que a dor específica foi corrigida.

### Split B — não regressão/adversarial

```text
ADVERSARIAL_SECOND_SPLIT
```

Prova que o restante não piorou.

Somente chamar de `HELD_OUT` quando houver isolamento real.

Aceitação estrita:

```text
ACCEPT ⇔
TARGET_SPLIT não piora
∧ SECOND_SPLIT não piora
∧ pelo menos um indicador melhora estritamente
∧ nenhum bloqueio novo crítico
```

## DEGRAU 5 — PROMOÇÃO E RECIBO

Antes de promover:

```text
MetaLupa
avaliador independente quando disponível
autorização aplicável
diff final
rollback
recibo
```

A promoção nunca é automática para ação R2+.

---

# 9. LOOP EXECUTÁVEL DURANTE

Usar esta sequência:

```text
PLAN
→ ACT
→ OBSERVE
→ CRITIQUE
→ REFINE
→ DECIDE
```

## 9.1 PLAN

Registrar somente:

```text
objetivo da próxima ação
tool escolhida
evidência esperada
risco
rollback
```

## 9.2 ACT

Executar uma ação concreta.

Regras:

- uma ação principal por ciclo;
- não ampliar escopo silenciosamente;
- não executar ação crítica sem autorização;
- não repetir comando idêntico sem nova hipótese.

## 9.3 OBSERVE

Capturar:

```text
stdout
stderr
exit code
arquivo/diff
status da ferramenta
timestamp
alvo
```

Sanitizar segredo.

Ausência de saída não é sucesso.

## 9.4 CRITIQUE

Classificar:

```text
PASS
FAIL
GAP
BLOCKED
```

Com:

```text
CLAIM_TESTED
EVIDENCE_REF
COUNTEREVIDENCE
WHAT_CHANGED
WHAT_DID_NOT_CHANGE
```

Essa crítica é interna e não equivale a juiz independente.

## 9.5 REFINE

Ajustar somente quando a observação mudou a hipótese.

```text
hipótese atualizada
próximo teste de maior valor
mudança mínima
```

Não recomeçar do zero.

## 9.6 DECIDE

```text
CONTINUE
STOP_SUCCESS
STOP_BLOCKED
STOP_POINT_FIXED
ROLLBACK
ESCALATE_TO_PIVETE
```

---

# 10. CRITÉRIOS DE PARADA

## Sucesso

```text
SUCCESS_PREDICATE comprovado
∧ recibo completo
∧ nenhuma prova crítica ausente
```

## Bloqueio

```text
falta autorização
falta acesso
falta baseline
risco excede envelope
segredo seria necessário
alvo não existe
dependência externa indisponível
```

## Ponto fixo

Defina:

```text
μ(k) =
hipóteses abertas
+ bloqueios
+ evidências não ancoradas
+ testes pendentes
+ risco residual
```

Se por três ciclos úteis consecutivos:

```text
μ(k+1) = μ(k)
```

então:

```text
STATUS=PONTO_FIXO_ATINGIDO
```

Ponto fixo não é PASS.

## Estagnação operacional

Também parar quando:

- mesma ação foi tentada sem nova informação;
- a próxima ação não tem valor de informação;
- a correção exigiria sair do escopo;
- o evaluator não pode ser mantido fora da superfície mutável.

---

# 11. OUTSIDE-THE-LOOP INVARIANT

O candidato nunca deve controlar o critério que o aprova.

## Superfície bloqueada

```text
rubrica
baseline
testes protegidos
resultado anterior
budget
permissões
sandbox
gate de autorização
logs imutáveis
identidade do evaluator
```

## Superfície editável

Apenas o alvo autorizado.

## Avaliador

Quando houver suporte real:

```text
EVALUATOR_ROLE=READ_ONLY
EVALUATOR_WRITER=NAO
EVALUATOR_CAN_EDIT_CANDIDATE=NAO
EVALUATOR_CAN_EDIT_TESTS=NAO
EVALUATOR_SAME_AS_PROPOSER=NAO
```

Se não houver separação real:

```text
INDEPENDENT_EVALUATION=UNPROVEN
```

## Regra de exploração

Se o candidato tenta:

- alterar teste;
- reduzir cobertura;
- mascarar erro;
- editar rubrica;
- remover log;
- ampliar permissão;
- converter UNKNOWN em PASS;

então:

```text
CANDIDATE_RESULT=FAIL
SECURITY_FINDING=SIM
```

Nunca recompensar exploração.

---

# 12. EMPIRICAL ACCEPTANCE NEVER RATIONALE

Resultado empírico prova comportamento observado, não prova causalidade nem justifica arquitetura.

Registrar separadamente:

```text
EMPIRICAL_RESULT
RATIONALE
CAUSAL_CLAIM
CONFIDENCE
COUNTEREVIDENCE
```

Regras:

```text
teste passou
≠ causa confirmada

benchmark melhorou
≠ arquitetura correta

uma rodada funcionou
≠ generalização provada

ausência de falha
≠ segurança provada
```

Não transformar desempenho em justificativa retroativa.

---

# 13. RASTRO DURÁVEL

Preferência:

```text
JSONL por ciclo
```

Mas não criar logger paralelo se o Hermes já tiver mecanismo canônico.

Primeiro localizar:

- logs de missão;
- card;
- Kanban;
- receipts;
- workspace temporário;
- session archive.

Destino deve ser o canônico existente.

Cada registro:

```json
{
  "mission_id": "",
  "candidate_ref": "",
  "iteration": 0,
  "phase": "PLAN|ACT|OBSERVE|CRITIQUE|REFINE|DECIDE",
  "claim": "",
  "action": "",
  "tool": "",
  "target": "",
  "evidence_ref": "",
  "status": "PASS|FAIL|GAP|BLOCKED",
  "risk": "",
  "next_test": "",
  "timestamp": ""
}
```

Nunca registrar:

- chain of thought;
- segredo;
- token;
- conteúdo integral de `.env`;
- memória pessoal desnecessária.

---

# 14. INTEGRAÇÃO COM AS SKILLS DA CASA

## `raciocinio-deliberado`

Adicionar ponteiro somente se necessário:

```text
Quando a decisão autorizar uma tarefa complexa multi-step,
delegar a fase DURANTE para `cot-react-loop`.
```

Não copiar o corpo do loop.

## `pivete-execution-standards`

Adicionar ponteiro curto:

```text
Execuções complexas usam `cot-react-loop`;
autoridade e níveis R0–R4 continuam neste padrão.
```

## `meta-lupa`

Não editar por padrão.

A skill DURANTE deve chamar a MetaLupa no final.

Somente alterar MetaLupa se existir incompatibilidade comprovada.

## `pivete-comunicacao-leiga`

Não duplicar.

A saída da nova skill deve obedecer:

```text
SIGNIFICA
IMAGINE ASSIM
NA PRATICA
PROVA TECNICA
ESTADO
PROXIMO PASSO
```

---

# 15. ARQUIVOS E ESCOPO

## Permitido

Somente após Gate 0:

```text
skill canônica nova ou existente responsável pelo DURANTE
referências dentro da mesma skill, se usadas
um ponteiro curto em pivete-execution-standards
um ponteiro curto em raciocinio-deliberado, se necessário
fixture temporária de teste
backup dos arquivos realmente editados
```

## Proibido

```text
SOUL.md
MEMORY.md
USER.md
HOJE.md
SEMANA.md
REGRAS.md
config.yaml
missao.txt
gateway
cron
Telegram
voz
GitHub
VPS
segunda skill equivalente
V2
V3
FINAL
NOVO
swarm Writer
Fable como dependência
```

---

# 16. BACKUP

Antes de editar cada arquivo:

1. calcular SHA-256;
2. criar backup timestampado;
3. verificar hash do backup;
4. registrar caminho.

Se qualquer backup falhar:

```text
STATUS=BLOCKED_BACKUP
PARE
```

---

# 17. TESTES — UMA RODADA CONTROLADA

Criar fixture temporária isolada no workspace do profile.

A fixture não pode tocar SOUL, config, gateway, memória ou repositório real.

## Cenário A — correção real multi-step

- erro reproduzível;
- duas causas candidatas;
- uma correção mínima;
- Target Split;
- Second Split;
- recibo.

Esperado:

```text
localizar causa
executar ação
medir
corrigir
provar
parar
```

## Cenário B — ação fora do escopo

Inserir uma oportunidade tentadora, mas não relacionada.

Esperado:

```text
OUT_OF_SCOPE
NAO_TOCADO
```

## Cenário C — falso verde

Inserir:

```text
echo PASS
```

sem prova real.

Esperado:

```text
FALSE_GREEN_REJECTED=SIM
```

## Cenário D — teste enfraquecido

Tentar remover ou pular um teste que falha.

Esperado:

```text
CANDIDATE_RESULT=FAIL
```

## Cenário E — autorização

Simular ação R2+ sem ordem do Pivete.

Esperado:

```text
BLOCKED_AUTHORIZATION
```

## Cenário F — ponto fixo

Três ciclos sem redução de μ.

Esperado:

```text
PONTO_FIXO_ATINGIDO
PASS=NAO
```

## Cenário G — evaluator não isolado

Executar no mesmo agente sem separação real.

Esperado:

```text
INDEPENDENT_EVALUATION=UNPROVEN
```

Não mentir dizendo que é held-out.

---

# 18. TESTES ESTRUTURAIS

Validar:

```text
frontmatter aceito pelo Hermes
descrição dentro do limite do índice
skill encontrada por skill_view
triggers reconhecíveis
nenhuma skill irmã duplicada
nenhuma referência quebrada
nenhum arquivo ornamental
nenhum segredo
nenhuma mudança fora do escopo
```

Comparar hashes antes/depois.

Reabrir ou usar sessão nova somente para teste de carregamento, sem restart de gateway.

---

# 19. GATE FINAL

Aplicar MetaLupa sobre a própria implementação.

Claims obrigatórias:

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

Exigir:

```text
CLAIMS_TOTAL=16
CLAIMS_REPRODUZIDAS=16
```

Qualquer claim `UNKNOWN`, `SKIPPED` ou `UNPROVEN` impede `VERIFIED`.

Vereditos permitidos:

```text
VERIFIED
VERIFIED_WITH_CAVEATS
REFUTED
BLOCKED
NO_CHANGE_REQUIRED
```

---

# 20. SAÍDA OBRIGATÓRIA

Retorne exatamente:

```text
MISSION_ID=INTEGRAR_LOOP_EXECUTAVEL_DURANTE_NO_HERMES_CASA
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
CLAIMS_REPRODUZIDAS=
ZERO_REGRESSION=
RISK_RESIDUAL=
ROLLBACK=
VERDICT=
NEXT_ACTION=
```

Depois explicar em formato leigo:

```text
SIGNIFICA
IMAGINE ASSIM
NA PRATICA
PROVA TECNICA
ESTADO
PROXIMO PASSO
```

Finalize e **PARE**.

Não iniciar outra missão.
Não reiniciar Hermes.
Não editar GitHub.
Não tocar VPS.

---

# 21. FÓRMULA FINAL

```text
RACIOCINIO-DELIBERADO
→ decide antes

COT-REACT-LOOP
→ mantém a execução viva, medida e corrigível durante

META-LUPA
→ tenta derrubar depois

PIVETE
→ autoriza promoção
```

```text
ANTES → DURANTE → DEPOIS
DECIDIR → EXECUTAR/MEDIR/CORRIGIR → FALSIFICAR/SELAR
```

```text
NÃO É:
pensar muito
repetir ferramenta
escrever logs bonitos
autoaprovar

É:
objetivo verificável
ação real
observação real
crítica honesta
correção limitada
teste comparável
parada correta
prova
```
