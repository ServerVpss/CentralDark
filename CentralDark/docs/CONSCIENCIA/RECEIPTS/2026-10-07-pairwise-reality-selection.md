# 💎 Receipt — Pairwise Reality Selection

RECEIPT_ID=PAIRWISE_REALITY_SELECTION_2026_10_07
OWNER=.agents/skills/centraldark-operational-method/SKILL.md
STATUS=PASS
CURRENT_HEAD_AT_PROOF=e2aaf4cb5a1ebfb003f5331a4d21616c75d8dcd2
GATE=scripts/trigger-fabric/verify_repo_contract.py::PAIRWISE_REALITY_SELECTION_CRYSTAL

## Origem observada

Uma superfície externa apresentou duas opções candidatas e pediu preferência humana.

Fato observado:
- duas opções comparáveis foram apresentadas;
- havia ação explícita de preferência e opção de pular.

Não promovido como fato:
- identidade dos modelos internos;
- motivo de seleção da conta/sessão;
- roteamento oculto;
- mecanismo interno de treinamento/experimento.

EXTERNAL_UI_IS_SEMANTIC_INPUT_NOT_INTERNAL_PROOF=true

## Delta absorvido no método existente

A CentralDark reutiliza MULTIBÚSSOLA + CONTRAPROVA + REALITY JUDGE + FIXED_POINT.

```text
PAIRWISE_REALITY_SELECTION=true
PAIRWISE_IS_CONDITIONAL_NOT_RITUAL=true

INTENÇÃO
→ REUSE/DETERMINISTIC_FAST_PATH
→ SE AINDA HOUVER DUAS OU MAIS ROTAS MATERIALMENTE VIÁVEIS
→ NORMALIZAR MESMA INTENÇÃO + ALVO + BASELINE/BINDINGS + EVIDÊNCIA
→ EXECUTAR/PROVAR SEM DUPLICAR WRITER
→ CONTRAPROVAR
→ REALITY_JUDGE_COMPARA_EFEITO
→ WINNER | TIE | UNKNOWN
→ WINNER: CRISTAL + FINGERPRINT + REPLAY
```

## Critério

Para claim técnico, o vencedor é escolhido pelo efeito observável:
- correção;
- completude;
- ausência de regressão;
- estabilidade;
- reversibilidade;
- aderência ao owner/escopo;
- custo/latência quando material.

ELOQUENCE_OR_MODEL_CONFIDENCE_IS_NOT_WINNER_PROOF=true
NO_DISCRIMINATING_EVIDENCE=NO_WINNER
TIE_OR_INCOMPARABLE=UNKNOWN

Quando a intenção é subjetiva, preferência humana decide a preferência; Reality Judge continua restrito à prova técnica.

HUMAN_PREFERENCE_SELECTS_SUBJECTIVE_GOALS=true
REALITY_JUDGE_SELECTS_TECHNICAL_EFFECT_WINNER=true

## Segurança de arquitetura

A comparação pareada não cria dois sistemas nem dois writers.

PARALLEL_READS_OR_PROBES_ALLOWED=true
PARALLEL_MUTATION_SAME_SCOPE_FORBIDDEN=true
ONE_WRITER_PER_MUTABLE_SCOPE=true
LOSER_IS_NOT_DELETED_BLINDLY=true

Se já existe caminho provado com fingerprint compatível, replay vence experimentação redundante.

REPLAY_WINNER_BEFORE_REDISCOVERY=true
CHANGED_FINGERPRINT=REVALIDATE_AFFECTED_CONE_ONLY

## Cristal do vencedor

WINNER_REQUIRES=PROOF+COUNTERPROOF+EFFECT_READBACK
WINNER_CRYSTAL_REQUIRES=OWNER+SEQUENCE+BINDINGS+FINGERPRINT+PROOF+COUNTERPROOF+EXPECTED_EFFECT+EVIDENCE+NEXT_CURSOR

## Fingerprint

METHOD_COMMIT=9931b011ec699abf4e43108382e5a1663db1af10
GATE_COMMIT=e2aaf4cb5a1ebfb003f5331a4d21616c75d8dcd2
METHOD_OWNER=.agents/skills/centraldark-operational-method/SKILL.md
GATE_OWNER=scripts/trigger-fabric/verify_repo_contract.py

## Prova

Em worktree isolado baseado em `origin/main@9931b011ec699abf4e43108382e5a1663db1af10`:
- gate `PAIRWISE_REALITY_SELECTION_CRYSTAL` incluído;
- `python scripts/trigger-fabric/verify_repo_contract.py .` → exit 0;
- `REPO_CONTRACT_VERIFY=PASS`;
- nenhum novo agent/skill/workflow/owner criado.

## Contraprova

- comparação pareada não roda por ritual;
- rota determinística/replay existente tem prioridade;
- sem evidência discriminante não há vencedor;
- UI externa não prova mecanismo interno da plataforma;
- humano continua autoridade para preferência subjetiva;
- Reality Judge julga efeito técnico, não autoridade humana.

## Replay

1. Resolver intenção, alvo e owner.
2. Tentar replay/fast path já provado.
3. Somente se restar ambiguidade material, formar candidatos comparáveis.
4. Normalizar baseline/bindings/evidência.
5. Provar e contraprovar.
6. Reality Judge escolhe vencedor técnico por efeito.
7. Selar receita/fingerprint/evidência.
8. Próximo executor tenta replay antes de redescobrir.
9. Fingerprint divergente reabre somente cone afetado.

EXPECTED_EFFECT=REALITY_SELECTS_BEST_PROVEN_ROUTE_WITHOUT_CREATING_PARALLEL_SYSTEM
NEXT_CURSOR=REUSE_PAIRWISE_REALITY_SELECTION_ONLY_WHEN_MATERIAL_AMBIGUITY_SURVIVES_FAST_PATH
