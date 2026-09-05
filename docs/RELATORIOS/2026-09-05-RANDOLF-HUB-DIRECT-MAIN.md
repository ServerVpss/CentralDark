---
title: "Receipt — RANDOLF + Hub Único + cadeia CentralDark"
status: "SOURCE_COMMITTED_RUNTIME_NOT_PROVEN"
date: 2026-09-05
intent_authority: "SEGREDO/CHEFE"
repository: "ServerVpss/CentralDark"
---

# INTENÇÃO

Unificar todas as superfícies CentralDark sob a mesma direção lógica, sem segundo cérebro ou pipeline paralelo:

```text
SEGREDO/CHEFE — INTENÇÃO + GOAL
→ !CENTRALDARK / CENTRALDARK_AI_BOOT
→ HISTORY RENDEZVOUS
→ RANDOLF / LAST_GOOD_STATE + RECEIPT + NEXT_CURSOR
→ CAPABILITY LINEAGE
→ DEDUPE / ABSORB
→ ONE SURVIVING DELTA
→ ENEIAS quando material
→ SOL
→ MULTIBÚSSOLA
→ META LUPA
→ RECONCILIAR EXISTING OWNER
→ ONE WRITER
→ HERMES/PIVETE
→ CONTRAPROVA
→ REMEDIÇÃO
→ REALITY JUDGE
→ FIXED_POINT
→ HUB DE CONHECIMENTO / GRAFO / RECEIPT / CURSOR
→ MICRO_DEPLOY ou FULL_DEPLOY conforme cone causal
→ BOOT
↺ CARACOL REVERSO quando houver divergência
```

# DELTA PROMOVIDO DIRETAMENTE PARA MAIN

A autorização humana desta passagem foi explícita para promover diretamente à `main` somente o delta considerado material e reaproveitável. Isso não converte commit em deploy nem elimina a necessidade de prova do HEAD aplicável.

## RANDOLF e fluxo único

| Commit | Delta |
|---|---|
| `aea5a6707ae1449d55639de2efdee856c13a9b73` | Oficializa RANDOLF como continuidade/persistência auditável, não segundo cérebro. |
| `cf46dbd9cf7dd126ff1e89be17c3ade934cb17f3` | Cria contrato do Hub Único de Conhecimento: Obsidian, webhooks, runtime, GitHub e web retrieval convergem no mesmo núcleo. |
| `1fd593f0226c54e22273a7d1b0be6beafea637ed` | Fixa política 80–90% para uso controlado e micro-deploy por cone causal; percentual não vira prova. |
| `ad71bdcdec9370cb44b3bab59cdbce1520a4220f` | Liga RANDOLF + ENEIAS + SOL + MULTIBÚSSOLA + META LUPA + HERMES + CARACOL no `CENTRALDARK_AI_BOOT`. |

## Ingestão, Obsidian e plugins

| Commit | Delta |
|---|---|
| `23d0f9e14ab3bf90244b3d7a0e752ba3391a7719` | Adiciona `POST /memoria/ingest` autenticado; todo evento nasce `CANDIDATE`, com checksum e `encoding_suspect`. |
| `6ed6a7d774848e20d41e06ea0a00633a04e9baad` | Adiciona cliente do Hub no plugin Grafo Vivo. |
| `9a308f9f86b6f6a349211963409ca64a7fc3e72d` | Configura URL/token local do Hub no plugin Obsidian. |
| `f9846da48e656dbae74a87b423341ffa39a7e403` | Adiciona comando explícito “Enviar nota ativa para o Hub de conhecimento”. |
| `7909d791485177f50e789cd22a8392238a01cd84` | Corrige o HUD/Watch: banner CARACOL antigo deixa de fingir runtime CURRENT e passa a projetar o fluxo único. |

## Contraprova e limpeza de conflitos residuais

A primeira medição do HEAD `7909d791...` revelou um run inválido de `.github/workflows/dependabot-auto-merge.yml` sem jobs. A causa material foi encontrada no próprio arquivo: marcadores Git `<<<<<<<`, `=======`, `>>>>>>>` persistidos na `main`. O mesmo padrão foi localizado em owners do HERMES e Fixed Point Fabric. A correção não desligou gate; restaurou os owners e removeu conflito textual inválido.

| Commit | Delta |
|---|---|
| `fcaec763086f0a0602a4657f9caba3ab3089fc20` | Remove marcadores de conflito do workflow Dependabot, preserva fail-closed, Signal Watcher, mergeability e resolver único. |
| `ce2185173633c0ba614fea94f2d64573368b2f36` | Restaura sintaxe do HERMES Executor; remove catches/returns duplicados e marcadores residuais. |
| `dc5037238d2235edda8eba5ea084d429bbbc86db` | Restaura CLI Fixed Point e comando `rollback`. |
| `b58de21edddda155e7dab2ff260512b00287d299` | Restaura baseline/rollback no engine Fixed Point. |
| `720ba361c2dbc7b9e534298db60abb189c1be704` | Recoloca contrato Fixed Point limpo e completo. |
| `8e4c5282bd58821c4c9cf237172568aa35473aac` | Limpa FABLE LOOP, padroniza texto em pt-BR e mantém método read-only. |
| `505d0b8e50ce489b8ad0268613afa0f0ad76d951` | Limpa README Fixed Point e preserva baseline protegido. |
| `0b6b133ed0afc50379bf6819039fad6a0e8f791d` | Limpa State Library e preserva a cadeia de proveniência recuperável. |

# AUTO-CORREÇÃO E CALIGRAFIA

A regra aplicada foi:

```text
RAW_MATERIAL
→ PRESERVAR_PROVENIENCIA
→ NORMALIZAR_UTF8_NFC
→ CORRIGIR_TEXTO_DETERMINISTICO
→ MOJIBAKE_INCERTO = ENCODING_SUSPECT
→ NÃO_INVENTAR_CONTEÚDO
```

Marcadores de conflito Git em código/contratos foram tratados como erro estrutural, não como texto histórico. Linguagem humana tocada nesta passagem foi normalizada para pt-BR e terminologia da Casa sem alterar identificadores técnicos.

# HUB ÚNICO — BOUNDARIES

```text
OBSIDIAN_NOTE / OBSIDIAN_PLUGIN / WEBHOOK / GITHUB / CHAT / AGENTE / FIRECRAWL / RUNTIME
→ KNOWLEDGE_EVENT
→ HUB ÚNICO
→ DEDUPE
→ PROVENIÊNCIA
→ CANDIDATE
→ MEMORY-LINKER / KNOWLEDGE-COMPILER
→ EXISTING OWNER
→ ONE WRITER
→ TESTE / CONTRAPROVA / GATE
→ MAIN QUANDO APLICÁVEL
```

Firecrawl é capacidade opcional de web retrieval atrás do mesmo roteador de capacidades. Cloud vs self-host é decisão de provider/infra, não uma nova arquitetura, um novo cérebro ou uma nova autoridade.

# ESTADO MEDIDO ANTES DESTE RECEIPT

```text
PRE_RECEIPT_MAIN=0b6b133ed0afc50379bf6819039fad6a0e8f791d
DEPENDABOT_INVALID_WORKFLOW_CAUSE=PROVED_CONFLICT_MARKERS_ON_MAIN
DEPENDABOT_INVALID_WORKFLOW_FIX=COMMITTED
CURRENT_EXACT_HEAD_RUNS_AT_MEASUREMENT=QUEUED_OR_PENDING
NEW_FAILURE_AT_PRE_RECEIPT_HEAD=NOT_OBSERVED_IN_ACTIONS_QUERY
```

A ausência de nova falha nessa consulta não equivale a PASS: os workflows ainda estavam pendentes/queued no momento da medição.

# PROMOÇÃO E DEPLOY

```text
SOURCE_ON_MAIN=PROVED
RANDOLF_ON_MAIN=PROVED
KNOWLEDGE_HUB_CONTRACT_ON_MAIN=PROVED
OBSIDIAN_TO_HUB_SOURCE_ON_MAIN=PROVED
FIXED_POINT_CONFLICT_MARKERS_REPAIRED=PROVED_FOR_TOUCHED_OWNERS

OBSIDIAN_PLUGIN_LIVE_RUNTIME=UNKNOWN
MEMORIA_INGEST_LIVE_RUNTIME=UNKNOWN
FIRECRAWL_RUNTIME=UNKNOWN
MICRO_DEPLOY_EXECUTED_BY_THIS_PASSAGE=NOT_PROVEN
FULL_DEPLOY_EXECUTED_BY_THIS_PASSAGE=NOT_PROVEN
GLOBAL_RUNTIME_FIXED_POINT=NOT_PROVEN
```

`COMMITTED != DEPLOYED`. `WORKFLOW_GREEN != RUNTIME_PROOF`.

# PRÓXIMO CURSOR

```text
1. medir o HEAD criado por este receipt;
2. exigir conclusão dos gates aplicáveis do HEAD exato;
3. testar build/sintaxe dos owners tocados;
4. provar endpoint /memoria/ingest no runtime antes de chamar webhook de vivo;
5. provar plugin Obsidian → receipt CANDIDATE;
6. executar/promover micro-deploy somente quando o owner/artefato/runtime aplicável estiver identificado;
7. usar full deploy somente se o cone causal cruzar componentes e exigir promoção conjunta;
8. registrar SHA → artefato → deploy → runtime T1.
```

# VEREDITO

```text
ARCHITECTURE_DIRECTION=APPROVED_BY_INTENT
SOURCE_INTEGRATION=COMMITTED_TO_MAIN
STRUCTURAL_CONFLICT_REPAIR=COMMITTED_TO_MAIN
SAME_HEAD_GATES=PENDING_AT_LAST_MEASUREMENT
RUNTIME_DEPLOY=EVIDENCE_MISSING
REALITY_JUDGE=NOT_GLOBAL_PASS_YET
```
