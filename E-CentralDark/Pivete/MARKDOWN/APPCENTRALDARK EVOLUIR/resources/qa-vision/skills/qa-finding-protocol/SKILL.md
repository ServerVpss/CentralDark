---
name: qa-finding-protocol
description: Protocolo canônico de registro de findings de QA no contrato TASK/items/F-XXX.md (1 arquivo por bug) — formato F-XXX, ciclo de status, faixas de ID por worker, evidência e anti-duplicata. Use sempre que for registrar, atualizar ou verificar um finding no QA Vision Lab.
---

# qa-finding-protocol

O contrato `<workspace>/TASK/items/F-XXX.md` é a fonte única de verdade da
operação de QA — **1 arquivo por bug**, nunca um ledger único (registrar cria
`TASK/items/F-XXX.md`, nunca appenda). Vista ao vivo com prioridade: `pnpm hub` →
`http://127.0.0.1:7788/tasks?filter=bugs`. Todo finding segue ESTE formato — sem variação:

```
# F-XXX — <título curto>

## F-XXX | categoria: funcional|usabilidade|visual|performance | severidade: alta|média|baixa | status: aberto
- Tela: <evidência — path do screenshot OU arquivo:linha se review estático>
- Passos: 1) ... 2) ...
- Esperado: ...
- Observado: ...
- (resolvedor) Correção: <preenchido pelo resolvedor ao corrigir>
```

## Ciclo de status

`aberto` → `corrigido` → `verificado` | `reaberto` | `precisa-decisão`

- `aberto` — registrado, ninguém corrigiu.
- `corrigido` — resolvedor aplicou fix + validou + anotou em `Correção:`.
- `verificado` — navegador reproduziu os passos pós-fix e confirmou.
- `reaberto` — reproduziu e AINDA quebra (nota do que persiste + nova evidência).
- `precisa-decisão` — dúvida de produto; pergunta objetiva no finding, decisão
  é do usuário.

Só o navegador promove pra `verificado`/`reaberto`. Só o resolvedor marca
`corrigido`. Ninguém pula estados.

## Faixas de ID (anti-colisão)

- Navegador (visão): `F-0XX`
- Reviewers estáticos: faixa própria POR reviewer, definida no briefing —
  `F-2XX`, `F-3XX`, `F-4XX`...

Antes de registrar: liste `TASK/items/`, ache o maior ID da SUA faixa, use o
próximo. Nunca recicle ID, nunca registre fora da sua faixa.

## Evidência (obrigatória)

- Finding visual/funcional de navegação: path do screenshot (frame numerado).
- Finding de review estático: `arquivo:linha` + trecho citado em Observado.
- Sem evidência = não é finding.

## Anti-duplicata

ANTES de registrar, busque em `TASK/items/` (grep pelo componente/arquivo/sintoma):

- Mesmo defeito já registrado → NÃO duplique. Se você tem evidência nova,
  acrescente uma linha ao `F-XXX.md` existente.
- Mesmo sintoma, causa diferente comprovada → registre novo finding e
  referencie o antigo ("relacionado a F-XXX").
- Finding `corrigido`/`verificado` que voltou → status `reaberto` no MESMO ID,
  nunca um ID novo.

## Severidade

- `alta` — bloqueia uso ou release; perda de dados; feature principal quebrada.
- `média` — atrapalha mas tem workaround.
- `baixa` — polish, cosmético.
