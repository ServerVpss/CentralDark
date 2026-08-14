# GitHub Copilot — instruções universais CentralDark

Antes de sugerir, editar, revisar ou executar:

1. Leia `LEIA-ME-IA.md`.
2. Leia `AGENTS.md`.
3. Leia `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`.
4. Leia `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`.
5. Leia `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`.
6. Leia `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` quando aplicável.
7. Use `.agents/skills/meta-lupa/SKILL.md` proporcionalmente ao risco e confira `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`.
8. Meça branch, HEAD, escopo, writer, runtime e tools.
9. Emita uma vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.

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
