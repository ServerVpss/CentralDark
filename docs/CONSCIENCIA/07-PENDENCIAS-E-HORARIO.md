---
title: "07 PENDENCIAS E HORARIO"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 07 — Pendências e horário

## Pendências — fonte ÚNICA

**Arquivo:** `docs/PENDENCIAS.md` (na raiz `docs/`)

Toda pendência do projeto vive ali. Sem exceção.

### Regras

- **Antes de começar qualquer tarefa nova:** abrir e ler `docs/PENDENCIAS.md`
- **Concluiu algo:** atualiza o item no MESMO commit, marcando `✅ CONCLUÍDO` + data + o que ficou no ar
- **Descobriu problema novo:** cria item com prioridade:
  - 🔴 alta
  - 🟡 média
  - 🟢 baixa
- **Mudou caminho/porta/serviço/secret:** atualiza item correspondente E o arquivo de `docs/INSTALADOR/` que documenta aquilo

### Proibido

- Espalhar pendência em READMEs, comentários soltos, ou na cabeça
- "Se não tá no `docs/PENDENCIAS.md`, não existe."

### No final de cada resposta com tarefa concluída

Mencionar curtinho qual pendência foi fechada. Ex: "Fechou a #8 do PENDENCIAS."

## Central de horário — fonte ÚNICA

**Pasta:** `central-horario/` (na raiz do repo)

Toda formatação de data/hora do projeto sai dali.

- **Fuso oficial:** `America/Sao_Paulo`
- **Nenhum componente formata data sozinho.** Importa da `central-horario/`.

### Por que

Garantir que toda data exibida (CRM, bot, painel, log) saia no mesmo fuso e formato, sem componente individual fazendo `new Date().toLocaleString()` com configuração diferente.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
