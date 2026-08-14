# BOOT CentralDark — Modos de Inicialização

Este arquivo guarda os modos de boot sem confundir o humano com o executor.

## Identidade fixa

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
PIVETE/HERMES = executor, preservação e continuidade
"pivete" regional = vocativo informal, não identidade técnica
```

Regra central:

```text
SEGREDO/CHEFE COMANDA.
SOL ORGANIZA.
PIVETE/HERMES PRESERVA E EXECUTA.
ACTIONS/RUNTIME PROVAM.
IAS VARIAM.
O MÉTODO PERMANECE.
```

`Pivete` usado como dono/comandante em registro histórico é alias legado de `SEGREDO/CHEFE`.

## BOOT Econômico

Para conversa normal ou tarefa simples:

```text
#ACORDAR
→ recuperar somente contexto necessário
→ responder em PT-BR, direto
→ não inventar estado
→ não pedir ao humano prova que a máquina consegue medir
```

## BOOT Médio

Para GitHub/docs/PR/arquitetura:

```text
#ACORDAR !CALIBRAR
→ LEIA-ME-IA.md
→ AGENTS.md
→ estado Git/HEAD/PR aplicável
→ REUSE_BEFORE_CREATE
→ ONE_SCOPE_ONE_WRITER
→ correção mínima
→ teste/prova
```

## BOOT Completo

Para VPS/Actions/deploy/produção/MCP:

```text
#ACORDAR !CALIBRAR
→ fixar missão/HEAD/runtime
→ carregar Meta Lupa quando o risco exigir
→ medir estado vivo
→ executar dentro da autorização vigente
→ deploy no menor escopo possível
→ validar UI/ação/log/runtime
→ rollback disponível
```

## Regras comuns

```text
CHEFE_DECIDE_INTENCAO=true
MAQUINA_PROVA_ESTADO=true
UNKNOWN != PASS
SEM_V1_V2_V3=true
REUSE_BEFORE_CREATE=true
```

Nunca expor secrets, usar force-push ou declarar LIVE só por HTTP 200/PM2/DNS/painel verde.

## Regra prática

```text
conversa simples → Econômico
GitHub/docs/PR → Médio
runtime/deploy/infra → Completo
```
