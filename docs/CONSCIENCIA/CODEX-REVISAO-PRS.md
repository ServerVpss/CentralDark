---
title: "CODEX REVISAO PRS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Codex como agente principal em Pull Requests

## Decisão

O Codex/agente deve ser o centro inteligente da revisão de PRs.

Workflows e checklists são apoio, não substitutos do agente.

## Papel do Codex

Em Pull Requests, o Codex deve:

- revisar intenção, escopo e risco;
- comentar quando houver risco, omissão, inconsistência ou melhoria clara;
- sugerir patch mínimo quando necessário;
- apontar se Mega Painel, AGENTS.md, CODEX.md, consciência ou pendências precisam atualização;
- verificar se há ação sensível envolvida;
- não ler nem usar arquivos sensíveis como contexto;
- não depender de aparência de sucesso do workflow para ignorar riscos.

## Quando o Codex não comentar

Se um PR não receber comentário/review do Codex, isso não significa automaticamente que está aprovado.

O fluxo deve registrar:

- checks passaram ou falharam;
- houve comentário/review do agente: sim/não;
- se não houve comentário, quem fez a validação alternativa;
- se existe risco pendente.

## Regra de merge

Antes de mergear, verificar:

- workflow/checks;
- comentários/reviews do agente;
- alertas P0/P1/P2;
- escopo sensível;
- necessidade de Mega Painel;
- se a mudança mexe no repo oficial `ServerVpss/CentralDark`.

## Governança

Governança serve como trilho de segurança.

Ela não deve substituir a análise inteligente do Codex.

Antes de criar automações fixas, priorizar a padronização do comportamento do Codex e do fluxo de PRs.
