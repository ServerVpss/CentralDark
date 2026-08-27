---
title: "GITHUB LABELS OPERACIONAIS"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# Labels Operacionais CentralDark

## Identidade e autoridade

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
PIVETE/HERMES = executor, preservação e continuidade
MODELO = capacidade substituível
REALIDADE = juiz
```

Label roteia trabalho; **nunca concede autoridade humana**.

A autorização humana canônica é:

```text
👑 PERMITO-SEGREDO
```

`permito-pivete`, `PERMITO-PIVETE` e outros aliases históricos não pertencem à taxonomia operacional ativa. O histórico permanece nos registros antigos, sem promover PIVETE/HERMES/modelo/bot a autoridade.

## Padrão operacional global (TODO PR elegível)

Não é opcional e não vale só para um PR. O motor de autonomia materializa o padrão em **todos** os PRs com recibo válido.

```text
SELO_CANONICO_DE_PROMOCAO
= 👑 PERMITO-SEGREDO
+ 🔄 GIT
+ 🤖 AUTO

BASELINE_OPERACIONAL
= 🟡 IA-PRECISA-REVISAR
+ 🧠 AGENTE-* derivado do campo Writer

PADRAO_COMPLETO = SELO + BASELINE + AGENTE(S)
```

Derivação de agente (determinística a partir de `Writer:` no body):

```text
grok        → 🧠 AGENTE-GROK
chatgpt/sol → 🧠 AGENTE-CHATGPT
claude      → 🧠 AGENTE-CLAUDE
codex       → 🧠 AGENTE-CODEX
hermes/pivete → 🧠 AGENTE-HERMES
…
```

Owner: `scripts/github-autonomia-varredura.mjs` (`requiredOperationalLabels` + promote sweep).

```text
PR_ELEGIVEL + RECIBO_VALIDO
→ materializa labels faltantes do PADRAO_COMPLETO
→ recheck autonomia
→ só então promove
```

## Resultado confirmado de PR

A confirmação visual canônica é:

```text
✅ PR CONFIRMADO
```

Ela fica semanticamente **ao lado** de `👑 PERMITO-SEGREDO`, mas representa outra camada:

```text
👑 PERMITO-SEGREDO = AUTORIDADE HUMANA DELEGADA / INTENÇÃO
✅ PR CONFIRMADO   = RESULTADO DERIVADO APÓS PROVA OBSERVADA
🟢 SUCESSO         = RESULTADO PÓS-MERGE DO PROMOTOR
```

`✅ PR CONFIRMADO` e `🟢 SUCESSO` **nunca** entram no selo de entrada. O CI só materializa confirmação depois de observar, no mesmo PR:

```text
PR_MERGED=true
+ 👑 PERMITO-SEGREDO presente
+ 🟢 SUCESSO presente
+ comentário canônico de promoção presente
+ HEAD_PROVADO == PR.head.sha
+ MERGE_SHA == PR.merge_commit_sha
+ JUDGE_RECEIPT_SHA256 = 64 hex válido
→ ✅ PR CONFIRMADO
```

```text
PR_CONFIRMED_IS_DERIVED_RESULT=true
PR_CONFIRMED_IS_AUTHORITY=false
PR_CONFIRMED_IS_PROMOTION_INPUT=false
PR_CONFIRMED_CANNOT_SELF_PROVE=true
UNKNOWN != CONFIRMED
```

Owner do mecanismo: `scripts/github-pr-confirmado-label.mjs`, executado dentro de `.github/workflows/autonomia-promocao.yml` depois do promotor canônico.

## Lei do catálogo

```text
UMA_SEMÂNTICA = UMA_LABEL_CANÔNICA
LABEL_OPERACIONAL = MAIÚSCULAS
ALIAS_LEGADO = MIGRAR_ANTES_DE_APAGAR
SEM_CONSUMIDOR + SEM_ROTEAMENTO + SEM_VALOR_OPERACIONAL = REMOVER
PADRAO_OPERACIONAL_APLICA_A_TODO_PR_ELEGIVEL=true
```

`🧠 AGENTE-LOVABLE` e `assign:lovable` são obsoletos e não recebem novos trabalhos.

## Núcleo canônico

- `👑 PERMITO-SEGREDO`
- `✅ PR CONFIRMADO`
- `🔄 GIT`, `🔄 GIT-DIVERGÊNCIA`
- `🧠 AGENTE-CHATGPT`, `🧠 AGENTE-CLAUDE`, `🧠 AGENTE-CODEX`, `🧠 AGENTE-GROK`, `🧠 AGENTE-HERMES`, `🧠 AGENTE-JARVIS`, `🧠 AGENTE-SENTINELA`, `🧠 AGENTE-SUPABASE`
- `🤖 AUTO`, `🤖 AGENTIC-DEVOPS`, `🤖 IA-DOCUMENTAR`, `🤖 IA-EXECUTAR`, `🤖 IA-FRONTEND`, `🤖 IA-INFRA`, `🤖 IA-PESQUISAR`, `🤖 IA-REVISAR`, `🤖 IA-VALIDAR`
- `🐞 BUG`, `♻️ DUPLICADO`, `✨ MELHORIA`, `❓ DÚVIDA`, `🆘 AJUDA-NECESSÁRIA`, `🌱 BOM-PARA-INICIAR`, `🎨 FRONTEND`, `📚 DOCS`
- `🔐 SEGURANÇA`, `🔧 SELF-HEAL`, `🔴 ERRO`, `🔴 FALTA-EVIDÊNCIA`, `🔴 PRIORIDADE-ALTA`, `🔴 RISCO-SERVIDOR`, `🛠️ INFRA`
- `🛡️ SENTINELA`, `🟡 ATENÇÃO`, `🟡 IA-PRECISA-REVISAR`, `🟡 PENDÊNCIA`, `🟡 PRIORIDADE-MÉDIA`
- `🟢 CORREÇÃO-SEGURA`, `🟢 PRIORIDADE-BAIXA`, `🟢 PRONTO-PARA-IA`, `🟢 SUCESSO`, `🟢 SUPABASE`
- `🕸️ GRAPHIFY`, `🚫 INVÁLIDO`, `🧊 NÃO-FAZER`, `🧊 PARADO`, `🧩 DIVERGÊNCIA`, `🧭 PAINEL`, `SUPERSEDED`

## Alias legado → canônico

```text
assign:chatgpt      → 🧠 AGENTE-CHATGPT
assign:claude       → 🧠 AGENTE-CLAUDE
assign:codex        → 🧠 AGENTE-CODEX
assign:grok         → 🧠 AGENTE-GROK
assign:supabase-bot → 🧠 AGENTE-SUPABASE
auto                 → 🤖 AUTO
bug                  → 🐞 BUG
p1                   → 🔴 PRIORIDADE-ALTA
p2                   → 🟡 PRIORIDADE-MÉDIA
p3                   → 🟢 PRIORIDADE-BAIXA
sentinela            → 🛡️ SENTINELA
stale                → 🧊 PARADO
superseded           → SUPERSEDED
permito-segredo      → 👑 PERMITO-SEGREDO
📚 DOC               → 📚 DOCS
```

## Enforcement global de entrada

O catálogo é único; cada superfície apenas adapta a entrada. O comportamento deve ser o mesmo para humano, bot, modelo, MCP CentralDark, HUB ou cliente futuro que passe pelo contrato da Casa.

```text
LABEL_RECEBIDA
→ trim
→ comparação case-insensitive para aliases conhecidos
→ alias conhecido: converter para destino canônico
→ alias de autoridade SEGREDO: 👑 PERMITO-SEGREDO
→ alias de autoridade PIVETE/HERMES: descartar
→ assign:* desconhecido: descartar, não inventar agente
→ dedupe
→ GitHub recebe somente o conjunto normalizado
```

Regras de integração:

```text
GITHUB_UI/API/BOTS → catálogo GitHub canônico
MCP_CENTRALDARK → normaliza labels antes de criar issue no GitHub
HUB → usa o MCP canônico; não cria segundo motor de labels
AUTHORITY_APPROVAL → normaliza a label observada antes de decidir autorização
CANONICAL_VISUAL_LABEL=👑 PERMITO-SEGREDO
TEXT_ALIAS=permito-segredo
TEXT_ALIAS_IS_COMPATIBILITY_NOT_SECOND_LABEL=true
CONFIRMED_RESULT_LABEL=✅ PR CONFIRMADO
CONFIRMED_RESULT_LABEL_IS_NOT_AUTHORITY=true
OPERATIONAL_STANDARD_IS_GLOBAL=true
```

O HUB já descobre ferramentas pelo MCP; portanto herda a semântica do tool GitHub existente. Não duplicar catálogo, regra de autoridade ou normalizador dentro da interface.

```text
SURFACE_IS_ADAPTER_NOT_AUTHORITY=true
LABEL_NORMALIZATION_IS_INGRESS_CONTRACT=true
ONE_LABEL_SEMANTIC_ONE_CANONICAL_NAME=true
```

## Issue não é memória

```text
EVENTO
→ fingerprint
→ existe ferida material equivalente?
   SIM → atualizar evidência existente
   NÃO → provar materialidade
         → só então criar issue

CAUSA SUMIU
→ comprovar
→ fechar quando a política permitir
```

Workflow vermelho sozinho não cria automaticamente uma nova ferida. `SKIPPED`, `UNKNOWN`, `PENDING`, ausência de erro ou alerta histórico não são `PASS`.

## Regra final

```text
LABEL = SINAL
INTENÇÃO = SEGREDO/CHEFE
ESTADO = EVIDÊNCIA
EXECUÇÃO = CAPACIDADE AUTORIZADA
REALIDADE = JUIZ

👑 = AUTORIDADE
🔄 + 🤖 + 🟡 + 🧠 = PADRÃO OPERACIONAL GLOBAL
🟢 / ✅ = RESULTADO (pós-prova)
```
