---
title: "GITHUB PROFISSIONAL E INTELIGENCIA VIVA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# GitHub profissional e inteligência viva do projeto

## Diretriz do usuário

O projeto CentralDark / MultiZap deve usar o GitHub de forma profissional, aproveitando o máximo possível das funcionalidades úteis para manter consistência, qualidade, rastreabilidade e automação.

O GitHub deve ser tratado como centro operacional do projeto, junto com MCP CentralDark, ChatGPT, Codex, Lovable, workflows, VPS/PM2, Bot/WhatsApp e Mega Painel.

## Princípio

Sempre que uma ação for feita no projeto, avaliar se existe uma forma melhor e mais profissional de usar recursos do GitHub para manter o repositório organizado e seguro.

Recursos a considerar quando aplicável:

- issues;
- pull requests;
- templates de issue e PR;
- labels;
- milestones;
- branch protection / rulesets;
- required checks;
- GitHub Actions;
- reusable workflows;
- environments;
- variables e secrets apenas por nome, nunca valor;
- releases;
- tags;
- webhooks;
- deployments;
- status checks;
- CODEOWNERS quando fizer sentido;
- dependabot/code scanning/secret scanning quando disponível;
- documentação viva.

## Mega Painel

O Mega Painel deve permanecer atualizado conforme o projeto evolui.

Mudanças importantes, erros, alertas, PRs relevantes, merges, workflows, validações, pendências e próximos passos devem ser refletidos no painel quando fizer sentido.

Nunca colocar segredo real no painel.

## Leitura obrigatória antes de agir

Antes de continuar uma tarefa, a IA/agente deve ler o que for necessário:

- arquivos raiz relevantes;
- READMEs;
- AGENTS.md;
- CODEX.md;
- docs/CONSCIENCIA;
- docs/PENDENCIAS.md;
- workflows relevantes;
- histórico e logs sanitizados quando necessário.

Não presumir. Se houver dúvida entre a raiz do projeto CentralDark e a raiz da VPS/root, investigar antes de agir.

## Raiz do projeto e raiz da VPS

Existe diferença entre:

```txt
raiz do repositório/projeto CentralDark
```

e

```txt
raiz da VPS/root
```

As duas devem ser entendidas antes de qualquer organização, leitura de README, ajuste de fluxo ou automação.

Não misturar arquivos da VPS com arquivos do repositório sem auditoria clara.

## Inteligência viva

O sistema deve evoluir com autoajuste e autoaprendizado operacional:

1. detectar erro, omissão, dúvida ou risco;
2. parar;
3. reconhecer o problema;
4. corrigir a rota;
5. registrar aprendizado ou pendência quando afetar o projeto;
6. atualizar AGENTS.md, CODEX.md, docs de consciência, workflows ou Mega Painel quando fizer sentido;
7. validar o resultado.

Isso não significa agir sem controle. Ações sensíveis continuam exigindo confirmação explícita do usuário.

## Próximos aprimoramentos sugeridos

- Auditar README da raiz do repositório CentralDark.
- Auditar README ou documentos relevantes na raiz da VPS/root sem expor segredo.
- Revisar se AGENTS.md e CODEX.md já refletem esta diretriz.
- Criar ou ajustar issue/PR templates profissionais.
- Avaliar branch protection/rulesets e checks obrigatórios.
- Automatizar atualização segura do Mega Painel após merges importantes.
- Criar matriz de workflows profissionais do projeto.
