---
title: "11 SKIL SH"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 11 — Skill via `skil.sh` (protocolo de propagação da Consciência)

## O problema

Toda vez que uma IA nova entrava no projeto (sessão limpa, conta nova, ferramenta diferente), começava do zero. Sem padrão de qualidade, sem regras inquebráveis, sem saber onde tá o quê. Resultado: warm-up demorado, repetição de erros, perda de contexto.

## A solução

Empacotar a Consciência num formato padrão (`SKILL.md` + scripts) e oferecer **3 caminhos** de instalação:

```text
   1. curl skil.sh           → IA com terminal
   2. MCP CentralDark        → IA via MCP
   3. SSH na VPS             → IA com SSH
```

Todos leem a mesma fonte (`skills/centraldark-consciencia/`), então nunca desincronizam.

## Por que `skil.sh`

`skil.sh` é um instalador zero-dependência da Voxel51 que:

1. Baixa uma pasta `skills/<nome>/` de um repo GitHub
2. Detecta o agente instalado (Claude Code, Cursor, Codex CLI, etc)
3. Copia pro path correto do agente
4. Roda `scripts/pos-instalacao.sh` (se existir)

Tudo em ~5 segundos, 1 comando.

## Por que MCP CentralDark também

Nem toda IA tem terminal. Lovable, Claude Desktop, n8n, ChatGPT custom — esses chamam MCP. Então o MCP CentralDark expõe `skill_listar` / `skill_instalar` / `skill_status` / `skill_atualizar`, e a IA cliente aplica o `SKILL.md` retornado como instrução de sistema.

## Por que SSH também

Modo emergência ou setup em massa. Se a IA já tem SSH na VPS, roda direto o `instalar-via-ssh.sh` que auto-detecta agente e copia.

## Fluxo de propagação

```text
  docs/CONSCIENCIA/CONSCIENCIA.md (FONTE MESTRA)
                  │
                  ▼
  skills/centraldark-consciencia/SKILL.md (RESUMO + REFS)
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
     skil.sh    MCP       SSH
        │         │         │
        ▼         ▼         ▼
     IA com   Lovable    IA com
     terminal Desktop    SSH na VPS
```

## Workflow que mantém tudo sincronizado

`.github/workflows/consciencia-sync.yml`

- Dispara quando `docs/PENDENCIAS.md` ou `docs/CONSCIENCIA/**` mudam
- Regenera `skills/centraldark-consciencia/pendencias-ativas.md`
- Commita automático

## Detalhes técnicos

Documentação completa: `docs/INSTALADOR/30-skill-consciencia.md`.
