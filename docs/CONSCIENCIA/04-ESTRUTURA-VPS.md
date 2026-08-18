---
title: "04 ESTRUTURA VPS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-08-08
status: "OPERACIONAL"
---

# 04 — Estrutura da VPS

## Regra vigente

```text
REPO_CANONICO=ServerVpss/CentralDark
VPS_ROOT_CANONICO=/root/CentralDark
CENTRALDARK_ROOT_ONLY_REQUIRED=SIM
EXTERNAL_ROOT_DEFAULT=OUT_OF_SCOPE
/root/Multizap/apps/clone-deck=OUT_OF_SCOPE
```

A árvore operacional da CentralDark é **somente** `/root/CentralDark`.
Diretórios irmãos em `/root`, inclusive `/root/Multizap`, não fazem parte do
território operacional por padrão e não podem ser usados como fonte da verdade,
runtime permanente ou fallback silencioso da CentralDark.

## Árvore canônica

```text
/root/CentralDark/
├─ apps/
├─ infra/
├─ scripts/
├─ logs/
├─ revisoes/
└─ demais componentes versionados/operacionais do ServerVpss/CentralDark
```

A árvore viva deve ser medida novamente antes de operação crítica; a estrutura
acima define **fronteira**, não inventário completo de runtime.

## Repositório principal na VPS

```text
PATH=/root/CentralDark
REMOTE=ServerVpss/CentralDark
BRANCH_CANONICA=main
```

Qualquer checkout em outro diretório ou apontando para outro repositório é
`EXTERNAL` até prova e reconciliação.

## Regra para dependência externa

Se um recurso necessário para a CentralDark existir apenas fora da raiz
canônica, não se mantém a dependência por conveniência.

```text
CAPTURE_READ_ONLY
→ PROVAR_CONSUMIDOR_E_DEPENDENCIA
→ LOCALIZAR_EQUIVALENTE_JA_EXISTENTE_NA_CENTRALDARK
→ SE_NAO_EXISTIR, TRANSPLANTAR_DELTA_MINIMO_PARA_CENTRALDARK
→ ADAPTAR_CONSUMIDORES
→ TESTAR
→ CONTRAPROVAR
→ PROMOVER_NO_REPO_CANONICO
→ EXTERNO=HISTORICAL|SUPERSEDED
```

A captura externa não concede autorização para mover, apagar, reiniciar ou
reescrever o recurso original. Primeiro o código entra na CentralDark e prova
que funciona a partir da raiz canônica.

## `/root/Multizap`

`/root/Multizap` é **histórico/externo** para a CentralDark atual.

```text
/root/Multizap=OUT_OF_SCOPE
/root/Multizap/apps/clone-deck=OUT_OF_SCOPE
CLONE_DECK_COMO_REPO_PRINCIPAL=NAO
FALLBACK_PARA_MULTIZAP=PROIBIDO
```

Referências antigas podem permanecer em arquivo histórico para explicar a
origem do sistema, mas não podem governar checker, deploy, workflow, runtime ou
novo código.

## Workflows e automação

Antes de criar workflow novo, atualizar o mecanismo existente que já cobre a
capacidade.

```text
WORKFLOW_REUSE_REQUIRED=SIM
AI_DETERMINISTIC_FALLBACK_REQUIRED=SIM

BUSCAR_EXISTENTE
→ ABRIR_IMPLEMENTACAO
→ PROVAR_GAP
→ ESTENDER_EXISTENTE
```

Quando houver IA no fluxo:

```text
DETERMINISTICO_PRIMEIRO
→ IA_PARA_UNKNOWN_OU_ANALISE_SEMANTICA
→ SE_IA_CAIR: FALLBACK_DETERMINISTICO_OU_FAIL_CLOSED
→ 429|TIMEOUT|MODEL_OFFLINE != PASS
```

Padrões já existentes que devem ser reaproveitados incluem o deploy canônico
self-hosted e a revisão de PR que mantém gates determinísticos independentes do
parecer de modelo.

## Regra de manutenção

Toda IA que tocar código operacional deve:

1. trabalhar dentro de `ServerVpss/CentralDark`;
2. preferir alteração no artefato/workflow existente;
3. impedir introdução de caminho operacional novo para `/root/Multizap`;
4. deixar teste/contraprova que detecte regressão da fronteira;
5. não criar V2/V3/NOVO/FINAL/COPY para capacidade já existente.

---

## Conexões rápidas

- `LEIA-ME-IA.md` — porta universal
- `AGENTS.md` — contrato dos agentes
- `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` — reutilização obrigatória
- `scripts/lupa/validar-porta-de-entrada.mjs` — gate determinístico
