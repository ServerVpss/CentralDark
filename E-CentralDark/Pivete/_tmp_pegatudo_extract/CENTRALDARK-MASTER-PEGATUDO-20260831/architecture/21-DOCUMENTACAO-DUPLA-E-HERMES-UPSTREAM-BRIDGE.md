# 21 — Documentação dupla, Code Gate e Hermes Upstream Bridge

## 1. Regra da Casa
Código material sem documentação rastreável não promove.

A documentação possui duas vistas obrigatórias:

1. **Técnica profissional** — contrato, owner, entrada, saída, efeitos, invariantes, erros, segurança, dependências, chamadores, testes, prova e revisão.
2. **Mapa mental** — resumo curto, emoji semântico e fluxo visual para recuperação rápida.

A segunda vista nunca substitui a primeira.

## 2. “Linha por linha” sem poluir o código
Não inserir comentário em cada linha. Cada linha material deve pertencer a uma faixa rastreável de símbolo/bloco:

`arquivo:linha-início..linha-fim → símbolo/bloco → owner → ficha técnica → testes → prova`

Isso permite auditoria integral preservando código limpo.

## 3. Gate obrigatório

`MATERIAL_CHANGE → CODE_DOCUMENTATION_GATE → TEST → COUNTERPROOF → DOCUMENTATION_GATE → RECEIPT`

Falha fechada quando faltar parser, owner, documentação ou revisão atual.

## 4. Comunicação
Modo padrão é **TRABALHO**: PT-BR técnico, curto, sem repetir pedido, emoji apenas como semântica/status.

**RESENHA** só é ativado por intenção explícita do operador. Pode usar baianês, humor e contexto bíblico, sem alterar fatos, autoridade ou gates.

## 5. Plug-and-play
Peça principal distribuível leva manifest, lineage, owner esperado, compatibilidade, dependências, docs, testes, falsificadores, install plan, rollback e receipt.

O agente instalador mede o alvo e localiza o owner; nunca instala em path adivinhado.

## 6. Hermes oficial x CentralDark CLI
Recomendação estrutural:

- Hermes oficial permanece **upstream de runtime/capabilities**.
- CentralDark mantém **CLI/TUI própria**, visual, aliases, governança, documentação e control plane.
- Atualização oficial é primeiro medida (`check-only`), classificada e ensaiada em ambiente descartável.
- Somente capabilities úteis e compatíveis são adaptadas aos owners atuais.
- Nunca substituir a carcaça CentralDark por pull cego do upstream.

### Fluxo

`UPSTREAM → CHECK → DIFF → CAPABILITY INVENTORY → OWNER MATCH → SANDBOX → TESTS → CENTRALDARK GATES → ADAPTER/OVERLAY → PROOF → PROMOTE`

O próprio Hermes oficial oferece atualização, snapshots/rollback e migração de config. Esses mecanismos são sensores/ferramentas do bridge; não anulam a governança CentralDark.

## 7. Toolchain JS/TS
Oxlint, Biome, Rolldown e TypeDoc entram apenas como candidatos medidos. Adoção começa em shadow mode e exige equivalência/regressão antes de substituir ferramentas atuais.

## 8. GitHub Profile
README principal deve ser contínuo: entregas podem terminar; CentralDark global não é marcada como finalizada. Status precisa ter data/revisão e não pode fingir 100% sem denominador.
