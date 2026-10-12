# Delegação econômica com prova

Use quando SOL precisar distribuir uma tarefa entre agentes sem aumentar custo ou duplicar trabalho.

Delegar não é multiplicar chamadas de modelo. SOL escolhe o menor caminho e usa scripts existentes para sondas mecânicas; agentes especializados entram apenas em tarefas independentes e delimitadas. Um agente investiga, outro implementa e outro testa somente quando isso reduz tempo ou aumenta a qualidade da prova — nunca para repetir a mesma pesquisa.

```text
SOL_COORDENA
→ VERIFICA_SE_JA_EXISTE
→ SCRIPT/PROBE_BARATO_PRIMEIRO
→ FAN_OUT_SOMENTE_TAREFAS_INDEPENDENTES
→ UM_WRITER_POR_ARQUIVO/ESCOPO
→ RESUMOS_CURTOS_COM_EVIDENCIA
→ SOL_TESTA_E_CONTRAPROVA
→ MAIN_READBACK + RECEIPT
```

```text
DELEGATION_IS_NOT_PROOF=true
PARALLELISM_SAVES_TIME_NOT_AUTOMATICALLY_TOKENS=true
REPEATED_RESEARCH_IS_FORBIDDEN=true
SPECIALIST_SCOPE_MUST_BE_DISJOINT=true
SOL_OWNS_FINAL_JUDGMENT=true
SHORT_EVIDENCE_BEATS_FULL_TRANSCRIPT=true
SCRIPT_BEFORE_MODEL_WHEN_MECHANICAL=true
```

O resultado do agente só vira a intenção seguinte depois de teste, readback na `main`/runtime quando aplicável e contraprova. Capacidade de contexto não é consumo de tokens; não usar o número de contexto do modelo como medição de custo.

## Cadeado persistente de consulta à main

Toda rodada, inclusive quando houver subagentes, começa pela `origin/main` atual. O coordenador registra o SHA, compara o trabalho contra ele e repete o readback imediatamente antes de qualquer commit, push, PR, deploy ou selo de runtime. Branch local, PR, receipt antigo, memória e resposta de agente são candidatos; não substituem a main atual.

```text
MAIN_FIRST_PRECHECK=MANDATORY
FETCH_ORIGIN_BEFORE_WORK=true
REMEASURE_MAIN_BEFORE_MUTATION=true
ONE_WRITER_PER_SCOPE=true
DIRTY_OR_BEHIND_MAIN= PRESERVE_AND_CLASSIFY
NO_BLIND_OVERWRITE=true
RUNTIME_SEAL_BINDS_TO_MAIN_SHA=true
DELEGATION_IS_NOT_MAIN_READBACK=true
```

O coordenador deve devolver `MAIN_SHA`, `OWNER`, `WRITER`, `SCOPE`, `BASELINE`, `RESULT`, `READBACK` e `NEXT_CURSOR`. Se a main mudar, o lote volta para comparação; não se promove o resultado antigo.
