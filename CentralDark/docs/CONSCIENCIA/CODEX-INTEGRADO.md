---
title: "CODEX INTEGRADO"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Codex integrado ao fluxo operacional

## Estado atual

O Codex foi integrado ao fluxo operacional do CentralDark / MultiZap no repositório oficial:

```txt
ServerVpss/CentralDark
```

Integração realizada via PR #1:

```txt
docs(codex): integrar Codex ao fluxo operacional
```

Merge realizado com squash na `main`.

## Arquivos integrados

- `AGENTS.md`
- `CODEX.md`
- `.github/codex/prompts/centraldark-system.md`
- `.github/pull_request_template.md`
- `.github/workflows/codex-validate.yml`
- `docs/CONSCIENCIA/REPOSITORIO-OFICIAL.md`

## O que o Codex passa a herdar

- Repositório oficial: `ServerVpss/CentralDark`.
- `segredounlock/clone-deck` é espelho/secundário e só deve ser usado com confirmação explícita.
- Ordem oficial de foco: MCP / Codex / Bot / CRM.
- Nunca expor segredo real.
- Não mexer em Caddy, Docker, WuzAPI, WhatsApp, CRM, banco real, domínio público ou ação destrutiva sem confirmação.
- Antes de alterar código, ler `AGENTS.md` e `CODEX.md`.
- Fazer patch mínimo.
- Rodar build/teste/lint quando aplicável.
- Explicar diff, risco e validação no PR.
- Considerar Mega Painel quando houver avanço relevante.
- Parar e consultar o usuário quando houver risco, dúvida, erro, contradição ou desvio.
- Não misturar git status sujo da VPS com tarefa atual.

## Validação do workflow

O workflow `codex-validate` foi criado para validar o kit Codex.

Durante a primeira execução, houve falso positivo porque o validador bloqueou o nome educativo de uma variável sensível citado em documentação. A regra foi corrigida para bloquear valores reais de segredo, não simples nomes usados em exemplo educativo.

Após a correção, o workflow passou com sucesso no PR.

## Regra aprendida

Ao criar scanners de segredo para documentação, não bloquear apenas nomes de variáveis como exemplo educativo. Bloquear padrões com aparência de valor real, chaves privadas, tokens ou atribuições sensíveis com conteúdo concreto.

## Próximo foco

Com o Codex integrado, o próximo bloco oficial é:

```txt
Bot / QR / chat ao vivo / contatos / fotos / grupos
```

CRM continua para depois.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
