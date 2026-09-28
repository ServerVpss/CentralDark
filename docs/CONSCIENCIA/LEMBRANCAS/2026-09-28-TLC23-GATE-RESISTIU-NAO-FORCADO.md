---
title: "TLC23 — gate resistiu, nao foi forcado"
date: 2026-09-28
tags: ["lembranca", "centraldark", "tlc23", "horn", "cage", "gate", "fronteira", "receipt"]
source_commit: "f0d251c92fbf3e7784367da6cdcc5ef61dc2b930"
source_receipts: ["5880043335", "5880054892", "5880066544"]
base_main: "ba9625e4454990bbf3f910f843cfec72c2d74810"
---

# 🪬 Lembrança — TLC23: o gate resistiu, não foi forçado

## Selo

```text
CHEFE=verdade registrada, nao vitoria cantada
CANONICO=ServerVpss/CentralDark@main
ASSUNTO=gate_TLC23_cage_e_fronteira_de_shell
STATUS=LEMBRANCA_DURAVEL
VEREDITO=TLC23_SOURCE_PROVED + CAGE_BLOCKED + FINAL_SUCCESS_NAO_DECLARADO
```

## O que aconteceu de verdade

A gaiola TLC23 foi percorrida de ponta a ponta na parte que este corpo alcança. A identidade da
fonte ficou **provada**. O cage adversarial **não executou** — não por falha do gate, mas porque
o gate exige processo local (`git rev-parse`, variáveis de ambiente de runtime, arquivos em
disco) e este corpo tem apenas APIs HTTP.

Resultado medido:

```text
TLC23_SOURCE_IDENTITY       = PROVED  (sha256 b4e2a065... · 64/64 · 206674 bytes · corpo 5/5)
TLC23_BINDING               = UNKNOWN (1/13 provado; 12 exigem git+env locais)
TLC23_CAGE                  = BLOCKED / BINDING_NOT_PROVED
TLC23_CAGE_BYPASS_DETECTED  = false   (NAO executou — nao e resistencia provada)
FINAL_SUCCESS               = NAO DECLARADO (9 de 14 condicoes fechadas)
```

**A frase que resume:** o gate não foi vencido — ele foi atravessado até a fronteira, e parou lá
por falta de acesso. `BLOCKED != PASS`.

## Regra prática

```text
NAO_FORCAR_GATE_SEM_SHELL
→ medir a identidade da fonte (hash)         ← isto SIM este corpo faz
→ tentar o binding                           ← isto NAO (exige processo local)
→ declarar BLOCKED com blocker exato         ← isto SIM
→ NAO declarar vitoria sobre o que nao rodou ← isto NUNCA
```

## Quatro travas que esta sessão confirmou no código

1. **`ONLY_COMPLETE_TLC23_BODY_MAY_EXIT_AS_PASS`**
   - Lei literal do `tlc23_runtime_gate.py`. O corpo só "sai" quando o cage roda.
   - Citar hash não substitui rodar o cage.

2. **`BINDING_NOT_PROVED` trava o cage antes do primeiro round**
   - `if binding["verdict"] != "PASS": return BLOCKED / BINDING_NOT_PROVED`
   - O gate não roda sobre premissa não provada. Comportamento correto, não defeito.

3. **`PLAN != EXECUTION`**
   - `PLAN_PHRASES` inclui "vou executar" → veredito `BLOCKED`.
   - Dizer "vou fazer" e parar é falha mecânica, não prudência.

4. **`FAILURE` em job multi-step não é causa**
   - O job da porta encadeia ~25 passos com `set -euo pipefail`.
   - Atribuir a causa ao próprio commit sem medir o diff é falso-verde invertido.
   - Nesta sessão 4 hipóteses foram refutadas por medição: o commit (`+5/-3`, só o dispatcher),
     o esquema do contrato (`= 6`, conforme), os tokens do `AGENTS.md` (7/7 presentes) e a
     etiqueta do filho (`🤖 AUTO` está no catálogo). A causa segue `UNKNOWN` com o espaço
     reduzido de 25 para 21 passos.

## Ferida de produção registrada junto

Achada durante a caça ao gate, e mais urgente que ele:

```text
GET https://api.centralldark.com/heartbeat
ReferenceError: operational is not defined
  at /root/CentralDark/apps/modulos/mcp/dist/index.js:137:9
  at .../correlation.js:146:9
```

Três implicações medidas (todas hipótese, nenhuma confirmada como causa raiz): o runtime serve de
`/root/CentralDark` (o caminho que o ledger chama de sujo), o endpoint declarado como coração de
observabilidade retorna erro, e `dist/` pode estar dessincronizado de `src/`.

```text
SOURCE != RUNTIME · MERGED != DEPLOYED · EXISTS != RUNNING
```

## Frase curta

> O gate não é adversário a vencer. É cerca a respeitar — e quando falta a chave, o certo é
> dizer onde a cerca está, não fingir que pulou.

## Próximo executor

Se a tua superfície tiver shell, repositório em disco e as variáveis de runtime, roda:

```bash
export CENTRALDARK_RUNTIME_FINGERPRINT=<medido> HERMES_RUNTIME_FINGERPRINT=<medido>
python3 .agents/skills/centraldark-operational-method/scripts/tlc23_runtime_gate.py --binding-check
python3 .agents/skills/centraldark-operational-method/scripts/tlc23_runtime_gate.py --cage-test --iterations 64
```

O cage define 10 ataques (`PLAN_ONLY→BLOCKED`, `NO_ACTION/WRONG_TARGET/STALE_HEAD_OR_RUNTIME/
UNMEASURED_RESULT/POST_PROBE_FAILED/COUNTERPROOF_FOUND_REGRESSION/FIXED_POINT_FALSE→UNKNOWN`,
`NO_NEW_INFORMATION/SAME_STATE_NO_DELTA→NO_CHANGE`) e o `self_test` declara 9 invariantes.
`PASS` só vale com o corpo completo atravessado.

Se a tua superfície também não tiver shell: **declara o blocker exato, não a vitória.**
