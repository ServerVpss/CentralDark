# GitHub Copilot — instruções universais CentralDark

Antes de sugerir, editar, revisar ou executar:

1. Leia `LEIA-ME-IA.md`.
2. Leia `AGENTS.md`.
3. Leia `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`.
4. Leia `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`.
5. Leia o contrato de reconciliação.
6. Meça branch, HEAD, escopo, writer, runtime e tools.
7. Use MetaLupa proporcionalmente ao risco.

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = identidade operacional/coordenadora; não é modelo específico
PIVETE/HERMES = executor, preservação e continuidade
"pivete" regional = vocativo informal
```

Aplique sempre:

- mesma SOUL e mesmo contrato para qualquer IA;
- `#ACORDAR` recupera o estado real; não pede ao humano contexto recuperável;
- um writer por escopo;
- evidência nova vence contexto antigo;
- UNKNOWN não vira PASS;
- não criar memória, versão ou sistema paralelo;
- quando merge/promoção já estiver autorizado no mesmo escopo, não re-perguntar.

```text
NO_HUMAN_REASK_FOR_MERGE=true
MERGE_METHOD=squash
TARGET=main
```

PR elegível registra:

```text
Intent-Authorized: SEGREDO/CHEFE
Merge-Policy: AUTO_SQUASH_IF_CLEAN
Intent-Scope: <escopo>
Writer: <agente>
Writer-Scope: <escopo>
```

Sem conflito + validação aplicável + sem bloqueio material = concluir squash merge. Convergência adversarial total só entra quando SEGREDO/CHEFE solicitar prova específica.

Este arquivo é adaptador; fontes canônicas governam.
