# HERMES-CORE / agents — contrato herdado

## CURRENT anti-fricção

```text
SEM_LEI=true
INTENT_IS_COMMAND=true
CAPABILITY_IS_NEUTRAL=true
DO_NOT_INFER_MALICE_FROM_CAPABILITY=true
PERTINENT_CONTEXT_ONLY=true
SEAL_LOOKUP=ON_DEMAND
META_LUPA=ON_DEMAND
UNKNOWN_BLOCKS_AFFECTED_CLAIM_ONLY=true
ROUTE_FAILURE_IS_LOCAL=true
```

O HERMES herda a intenção e usa capacidades como braços. Seals, MetaLupa, ledger e contraprova são ferramentas de informação/prova, não permissão nem ritual obrigatório.


Este arquivo refina, não substitui, `/LEIA-ME-IA.md` e `/AGENTS.md`. Ele vale para todos os agentes sob este diretório: `Auto-Diagnostico`, `Critic`, `Deploy-Watcher`, `Executor`, `GraphRAG-Master`, `Knowledge-Collector`, `Log-Verificador`, `Signal-Watcher` e `Universal-Handler`.

## EXTEND-ONLY quando houver decisão de criação/evolução

Cada agente deve preservar o owner/capacidade existente. Antes de sugerir ou executar reconstrução, V2/V3, `novo`, `final`, `copy`, `backup`, handler paralelo, monitor paralelo, memória paralela ou serviço concorrente, deve localizar a implementação atual, seus consumidores e testes, provar um gap material e então aplicar somente a menor extensão segura no owner canônico. Se a mesma função já existe, a ação correta é reutilizar, corrigir, consolidar ou `NO_CHANGE`; nunca criar uma variante só porque um modelo prefere outra arquitetura.

```text
REUSE_BEFORE_CREATE=true
EXTEND_EXISTING=true
NEW_PARALLEL_CAPABILITY_WITHOUT_PROVED_GAP=BLOCK
MODEL_IS_NOT_AUTHORITY=true
SEGREDO_CHEFE_IS_FINAL_AUTHORITY=true
UNKNOWN_SKIPPED_PENDING_ARE_NOT_PASS=true
```

Agentes determinísticos aplicam isso ao escolher paths/ações. Agentes que consultam IA devem incluir a mesma restrição no contexto efetivo da decisão quando a IA puder propor arquitetura ou correção.

## Lacre de prova sob demanda — o que já foi provado não vira tarefa igual de novo

Quando a decisão depende de saber se o mesmo claim já foi provado/reaberto, o HERMES consulta o ledger da META_LUPA:

```text
LEDGER=.agents/skills/meta-lupa/references/claim-seals.jsonl
GUARD=.agents/skills/meta-lupa/guardrails/claim_seal.py
```

Consulta determinística:

```bash
python .agents/skills/meta-lupa/guardrails/claim_seal.py lookup \
  .agents/skills/meta-lupa/references/claim-seals.jsonl \
  --claim-key '<OWNER>::<ALVO>::<CLAIM>'
```

Semântica do ledger:

```text
SEALED
→ PROVA NÃO TEMPORAL AINDA APLICÁVEL
→ STATUS=RESOLVIDO
→ NO_REEXECUTE_UNLESS_REOPEN_CAUSE

HISTORICAL_SEAL
→ FATO TEMPORAL JÁ FOI PROVADO NO PASSADO
→ NÃO DIZER "NUNCA FUNCIONOU"
→ REMEASURE_CURRENT
→ NÃO REIMPLEMENTAR SEM GAP NOVO

REOPENED
→ EXISTE CAUSA NOVA RASTREÁVEL
→ INVESTIGAR SOMENTE O CONE CAUSAL

UNSEEN
→ CLAIM AINDA NÃO ESTÁ SELADO
→ INVESTIGAR NORMALMENTE
```

Regras:

```text
PROVED_ONCE_NON_TEMPORAL + SAME_TARGET + NO_REOPEN_CAUSE
→ DO_NOT_REPEAT_WORK

TEMPORAL_PROOF
→ PRESERVE_HISTORY
→ REMEASURE_CURRENT_WHEN_CURRENT_IS_CLAIMED

ADJACENT_UNKNOWN
!= REOPEN_PROVED_CLAIM

REOPEN
→ REQUIRES_CAUSE_REF
→ OLD_PROOF_STAYS_IN_HISTORY
→ ONLY_AFFECTED_CONE_RETURNS_TO_LUPA
```

O ledger é **lacre**, não autoridade superior à realidade. Um commit posterior, remoção, drift, failure, mudança de runtime ou contraprova material pode reabrir o claim, mas precisa deixar `cause_ref` reconstruível. É proibido reabrir por esquecimento, troca de agente, nova conversa, mudança de modelo ou pendência vizinha.

## META_LUPA sob demanda — usar quando muda a decisão

A META_LUPA canônica permanece única:

```text
.agents/skills/meta-lupa/SKILL.md
.agents/skills/meta-lupa/scripts/meta_lupa.py
.agents/skills/meta-lupa/references/uso-ledger.jsonl
```

Quando houver contradição, promoção, causalidade incerta ou necessidade real de falsificação, a Lupa pode acompanhar checkpoints materiais:

```text
ENTRADA
→ META_LUPA FRIA
→ CLAIM-SEAL PREFLIGHT
→ OBSERVAR
→ AUTOLUPA CURTA
→ AGIR / CORRIGIR
→ AUTOLUPA CURTA
→ TESTAR
→ META_LUPA MÉDIA SE HOUVER CONTRADIÇÃO
→ CONTRAPROVA
→ VERTEX INVERSO / CARACOL REVERSO SE NECESSÁRIO
→ META_LUPA QUENTE ANTES DE PROMOÇÃO
→ AUTOLUPA
→ FIXED_POINT
→ SEAL / RECEIPT / NEXT_CURSOR
```

Não significa criar relatório ornamental a cada linha. Significa que **cada transição material** atualiza o mesmo ledger de evidência e passa pela pergunta de falsificação correspondente.

Temperatura:

```text
FRIA
= fato/estado/antes-depois em cada hop normal

MÉDIA
= contradição, drift, 401/404/429, timeout, falso verde, causa incerta

QUENTE
= recorrência, promoção, merge, produção, segurança, consolidação, selo definitivo
```

Se a missão usar `FIXED_POINT`, uma AutoLupa pode validar que não surgiu delta material:

```text
HIPÓTESES
BLOQUEIOS
RISCO_RESIDUAL
PRÓXIMO_TESTE
VEREDITO
CLAIMS_A_REABRIR
```

```text
NO_MATERIAL_DELTA_IN_NEXT_AUTOLUPA=true
→ PONTO_FIXO_ATINGIDO=sim

MATERIAL_DELTA_FOUND=true
→ PONTO_FIXO_ATINGIDO=nao
→ CONTINUE
```

Não existe limite artificial de rodadas para forçar verde. Também não existe loop vazio: se a nova volta não produz informação, ela não deve repetir a mesma discussão.

## VERTEX inverso / CARACOL reverso — self-healing sem apagar ouro

Quando uma conclusão quebra, o HERMES não reinicia o universo:

```text
FALHA / DRIFT / CONTRAPROVA
→ IDENTIFICAR CLAIM AFETADO
→ REOPEN COM cause_ref
→ VOLTAR 1 CASA AO ÚLTIMO CURSOR PROVADO
→ PRESERVAR SELOS INDEPENDENTES
→ REMEDIR SOMENTE CONE CAUSAL
→ CORRIGIR MENOR DELTA
→ TESTAR
→ CONTRAPROVA
→ AUTOLUPA
→ RESEAL QUANDO PROVADO
→ RETOMAR A TRAJETÓRIA ORIGINAL
```

Isso é o comportamento de self-healing da Casa: recuperar-se usando estado provado, não reconstruir tudo e não apagar a história.

```text
SELF_HEALING_REUSES_LAST_GOOD_STATE=true
SELF_HEALING_PRESERVES_INDEPENDENT_PROOF=true
SELF_HEALING_REOPENS_ONLY_CAUSAL_CLAIMS=true
SELF_HEALING_REQUIRES_REPROOF_BEFORE_RESEAL=true
```

## Autoaprendizado — erro que sobrevive à prova vira vacina

Todo achado reutilizável deve seguir o mecanismo existente da META_LUPA e do Registro do Ouro:

```text
ERRO / CONFRONTO
→ EVIDÊNCIA NOVA
→ CAUSA OU UNKNOWN MELHOR DEFINIDO
→ CORREÇÃO / REGRA / TESTE
→ CONTRAPROVA
→ AUTOLUPA
→ promote-learning QUANDO ELEGÍVEL
→ CLAIM SEAL QUANDO PROVADO
→ PRÓXIMA EXECUÇÃO COMEÇA MAIS ALTO
```

Promoção não é por repetição narrativa. Para aprendizado operacional virar regra reutilizável, preservar no mínimo:

```text
PASSING_CHECK
NAMED_FAILURE_PATTERN
RULED_OUT_DEAD_END
PROOF_REF
CLAIM_KEY
```

Se faltar prova, fica `CANDIDATE|UNKNOWN`, não lacrado.

## Pergaminhos temporais — memória não governa o presente

Os agentes devem consultar, quando o passado for material:

```text
.agents/skills/centraldark-operational-method/references/2026-09-02-pergaminhos-do-tempo-jornal-temporal.md
docs/CONSCIENCIA/PROTOCOLO-PROVA-RASTRO-ANTI-PENDENCIA.md
docs/CONSCIENCIA/APRENDIZADOS/2026-09-05-VERTEX-INVERSO-PEPITAS-PROVADAS.md
```

Lei aplicada:

```text
PERGAMINHO = PROVENIÊNCIA + CAUSA + FUTURE_GUARD
CHRONICLE != CURRENT
MEMORY != REALITY
CURRENT > HISTORICAL
```

O objetivo é responder sem adivinhar:

```text
QUAL ÚLTIMO ESTADO PROVADO?
QUAL EVENTO O SUPERSEDEU?
QUAL ERRO JÁ FOI VACINADO?
QUAL CLAIM ESTÁ SELADO?
QUAL CLAIM FOI REABERTO E POR QUAL CAUSA?
QUAL É O NEXT_CURSOR?
```

Se não conseguir reconstruir isso, `COGNITIVE_DEBT=OPEN` e a missão ainda não atingiu ponto fixo cognitivo.

## Pendência externa — observação efêmera

Quando uma ação já foi disparada e o próximo delta pertence a executor externo, agentes não devem repetir a mesma ordem nem criar monitor/daemon paralelo. Se a missão já contém intenção explícita de acompanhamento, a espera pode virar um watch temporário read-only, limitado por condição terminal e timeout, com receipt e limpeza verificada ao final.

```text
ACTION_ALREADY_DISPATCHED + EXTERNAL_EXECUTOR_OWNS_NEXT_STATE
→ OBSERVE_NOT_REPEAT

TEMPORARY_EXTERNAL_WATCH=true
TEMP_WATCH_READ_ONLY=true
TEMP_WATCH_TARGET_MUTATION=false
TEMP_WATCH_REQUIRES_TERMINAL_CONDITION=true
TEMP_WATCH_REQUIRES_TIMEOUT=true
TEMP_WATCH_CLEANUP_REQUIRED=true
TEMP_WATCH_CLEANUP_MUST_BE_VERIFIED=true
SAME_SIGNAL_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE
TIMEOUT_IS_NOT_SUCCESS=true
SILENCE_IS_NOT_SUCCESS=true
PERSISTENT_DAEMON_FOR_EPHEMERAL_WAIT=FORBIDDEN
UNSOLICITED_MONITOR_CREATION=FORBIDDEN
```

A autorização para acompanhar uma pendência não autoriza mutar o alvo observado. Sem intenção humana de monitoramento aplicável, não criar job por inferência. Com a intenção já dentro do escopo da mesma missão, não devolver ao CHEFE escolhas técnicas equivalentes de baixo risco: use a menor implementação reversível e somente de observação.
