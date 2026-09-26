# HANDOFF — COMO ENCAIXAR NO RUNTIME HERMES

## Owners já existentes observados no repositório

- `LEIA-ME-IA.md` — boot global.
- `AGENTS.md` — contrato geral.
- `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md` — autoaperfeiçoamento/scaffold.
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` — orquestração e Writer único.
- `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs` — quatro percepções READ_ONLY + contraprova.
- `.agents/skills/knowledge-compiler/` — owner existente de compilação/cristalização de conhecimento.
- `.agents/skills/session-intelligence-harvester/` — owner existente para colher sessão/evidência.

## Integração mínima, sem segundo sistema

```text
INTENT RECEIVED
→ continuity/live-state guard
→ capability/owner discovery
→ knowledge-compiler lookup by signature
→ perception gate when mutation is material/ambiguous
→ one writer executes minimal delta
→ test/receipt
→ counterproof
→ residual?
    yes: minimal remediation loop
    no: knowledge-compiler absorbs reusable delta
→ fixed-point receipt
→ return
```

## O que falta provar no runtime físico

- Que todos esses owners são chamados automaticamente no mesmo ciclo.
- Que o loop remedia e repete sem intervenção humana mecânica.
- Que o aprendizado promovido altera a próxima execução.
- Que o processo sobrevive restart/reload quando esse claim for necessário.

Esses itens permanecem `UNKNOWN` nesta sessão porque não há acesso ao processo físico local/VPS do Hermes.
