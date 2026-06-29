---
title: "GITHUB PR OBSERVAR CODEX"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Tool · github_pr_observar_codex

## Objetivo

Criar uma ferramenta MCP limpa para verificar se o Codex atuou em um Pull Request ou Issue.

Ela deve evitar JSON poluído no chat e retornar apenas um resumo operacional.

## Entrada

- `owner` opcional, padrão `ServerVpss`
- `repo` opcional, padrão `CentralDark`
- `number` obrigatório
- `kind` opcional: `auto`, `pr` ou `issue`

## Saída esperada

```txt
PR #14
Check: success
Codex reagiu: sim/não
Codex comentou: sim/não
Codex fez review: sim/não
Evento reviewed: sim/não
Conclusão: escuta parcial / review real / sem ação Codex
```

## Regras de interpretação

- Reação 👍 do `chatgpt-codex-connector[bot]` significa escuta parcial.
- Comentário do bot em Issue significa que o conector está ativo no fluxo de issue.
- Evento `reviewed` no timeline significa revisão formal.
- Review/comment em arquivo de PR significa ação operacional de review.
- Check verde não prova revisão do Codex.

## Segurança

A ferramenta deve ser somente leitura.

Não deve:

- mergear PR;
- fechar issue;
- comentar;
- apagar branch;
- tocar produção;
- expor segredo real.

## Uso no fluxo

Antes de mergear PR relevante, consultar esta ferramenta para saber se houve ação do Codex.
