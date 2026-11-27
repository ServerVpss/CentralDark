---
name: fable-loop
gate: FABLE_LOOP | !CALIBRAR | !ACORDAR | #ACORDAR
author: HERMES-CASA (perfil pivete), derivado de cot-react-loop e learning-crystal-loop
canonical_sha_target: AUTO
status: CRYSTALLIZED_AS_READ_ONLY_METHOD
default_routing: false
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# FABLE LOOP — método de calibração e estabilização

Fable Loop é um método de leitura, calibração e estabilização dentro do ciclo canônico da CentralDark. Não é agente, roteador, provedor, identidade nem segundo cérebro. O roteamento padrão permanece fechado até que a Meta Lupa prove a promoção por comparação controlada aplicável.

TRIGGERS: `#FABLE_LOOP` | `!FABLE_LOOP` | `#ACORDAR` + intenção explícita de loop contínuo.

## Pré-flight obrigatório

Antes do primeiro ciclo:

- MEDIR HEAD do repositório, writer, worktree, remote e runtime aplicável;
- REUTILIZAR `cot-react-loop` ou owner equivalente já existente; não duplicar;
- FIXAR o writer medido antes de qualquer mutação autorizada;
- manter HERMES como executor e um observador independente como contraprova.

## Ciclo

Cada volta deve reduzir pelo menos um `UNKNOWN` ou uma contradição material:

1. MAPEAR — intenção, estado, escopo, owner e alvo de prova;
2. LER — repositório canônico, contratos e evidência CURRENT;
3. ENTENDER — comparar com capacidade existente; reutilizar antes de criar;
4. BUSCAR CONTRADIÇÃO — inspecionar o lado independente;
5. TESTAR CRENÇA — executar teste discriminante, medir e registrar hash/receipt quando aplicável;
6. CORRIGIR — atualizar somente a menor interpretação ou delta sustentado pela prova;
7. ACEITAR — somente quando a prova sobreviveu à contraprova independente;
8. RECONCILIAR — reter o bem provado, descartar somente o delta derrotado e manter UNKNOWN explícito;
9. SELAR/REABRIR — reutilizar claim seal; selar aceite e reabrir somente com causa material nova;
10. REINDEXAR — atualizar índice/receipt existente, não fabricar novo contexto paralelo;
11. REPETIR — parar no ponto fixo aplicável ou preservar a fronteira `UNKNOWN`.

## Contrato de aceite e reconciliação

```text
FABLE_PROOF_COUNTERPROOF_CLOSURE=true
ACCEPTANCE_RESULT_ENUM=ACCEPTED|PARTIAL|REJECTED|UNKNOWN
FABLE_ACCEPT_ONLY_AFTER_COUNTERPROOF_SURVIVAL=true
FABLE_RECONCILE_PARTIAL_FAILURE=true
FABLE_PRESERVE_PROVEN_GOOD=true
FABLE_UNKNOWN_IS_NOT_ACCEPTED=true
FABLE_SEALED_CLAIM_NO_RECHECK_WITHOUT_NEW_CAUSE=true
```

Fable é método de calibração: não ganha autoridade para aceitar por voto. O
aceite é consequência do mesmo gate determinístico do HERMES/Meta-Lupa.
## TLC23 / Horn como método compartilhado

```text
EVIDÊNCIA
→ 🔥 META-GRILL estressa premissas
→ 🌀 FABLE_LOOP estabiliza a leitura
→ 🔎 META-LUPA tenta falsificar
→ 🔄 RECONCILIAÇÃO DETERMINÍSTICA
→ TLC23 / HORN fecha somente quando não nasce fato material novo
→ ⚖️ REALIDADE
```

Regras:

```text
TLC23_SHARED_METHOD=true
TLC23_IS_NOT_SECOND_ROUTER=true
PROOF_REUSE_WHEN_FINGERPRINT_UNCHANGED=true
NO_NEW_MATERIAL_FACT=REUSE_PROOF_NO_REPEAT
ACCEPTANCE_IS_NOT_PROOF=true
DETERMINISTIC_RECONCILIATION_BEFORE_NEW_ARCHITECTURE=true
```

O PDF não precisa ser relido/reprovado do zero quando sua identidade e as premissas causais continuam iguais. Mudança material invalida somente o cone afetado; prova independente preservada continua reutilizável.

## Fixed point do método

O método só pode encerrar a sua rodada quando:

- o `REALITY_JUDGE` possuir prova aplicável;
- o candidato permanecer no HEAD medido;
- nenhum `UNKNOWN` tiver sido convertido em `PASS`;
- nenhum sinal parcial tiver sido promovido a prova.

Isso é ponto fixo do método; não equivale automaticamente a `GLOBAL_FIXED_POINT`.

## Role gate

- HERMES = executor e writer apenas no escopo autorizado;
- OBSERVER = leitor independente e contraprova; não escreve no mesmo escopo;
- RENDEZVOUS = compara observações sem votar a verdade;
- REALITY_JUDGE = decide `PASS`, `RECONCILE` ou `UNKNOWN`;
- `ONE_WRITER_PER_SCOPE` = nunca dois editores no mesmo escopo.

## Fallback e contraprova

Obrigatório para risco material:

- se o executor reporta `PASS`, o observador mede por caminho independente;
- se as observações divergem, reconciliar; não declarar `PASS`;
- troca de provedor ou transporte exige falha material medida, não preferência.

## Anti-teatro

- não afirmar que uma skill foi carregada sem lê-la;
- não transformar conversa crua em delta canônico;
- não criar V2/V3 ou loop paralelo;
- não repetir leitura concluída sem nova evidência.

## Binding canônico

```yaml
owner: .agents/skills/fable-loop/SKILL.md
mode: READ_ONLY_CALIBRATION
default_routing: false
may_write_canonical: false
promotion_gate: META_LUPA_SAME_CONTROL
```
