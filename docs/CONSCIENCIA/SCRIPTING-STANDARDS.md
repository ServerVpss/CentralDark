---
title: "SCRIPTING STANDARDS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Scripting Standards - Tema Netflix Centralizado

Este documento consolida o padrao oficial para scripts do CentralDark / MultiZap.

## Fontes da verdade

```txt
scripts/lib/theme.sh
scripts/lib/theme-node.mjs
```

Todos os scripts da VPS seguem o Tema Netflix Centralizado. Scripts Bash usam
`theme.sh`. Scripts Node usam `theme-node.mjs` com Chalk quando disponivel.
O tema Bash deve ser carregado automaticamente no terminal do root e tambem
carregado explicitamente por scripts que precisam renderizar saida operacional.

## Funcoes Bash disponiveis

- `netflix_header`
- `netflix_step`
- `netflix_success`
- `netflix_info`
- `netflix_warning`
- `netflix_error`
- `netflix_done`
- `netflix_confirm`
- `netflix_progress_bar`
- `netflix_loading`

## Funcoes Node disponiveis

- `netflixHeader`
- `netflixStep`
- `netflixSuccess`
- `netflixInfo`
- `netflixWarning`
- `netflixError`
- `netflixDone`
- `createSpinner`
- `runWithSpinner`
- `sanitizeLog`
- `writeLog`

## Exemplo minimo Bash

```bash
source "/root/CentralDark/scripts/lib/theme.sh"

netflix_header
netflix_step 1 4 "Validando ambiente"
netflix_success "Ambiente validado"
netflix_done
```

## Exemplo minimo Node

```js
import {
  netflixHeader,
  netflixStep,
  netflixSuccess,
  netflixDone,
} from './scripts/lib/theme-node.mjs';

netflixHeader();
netflixStep(1, 4, 'Validando ambiente');
netflixSuccess('Ambiente validado');
netflixDone();
```

## Regras obrigatorias

- Novos scripts devem utilizar as funcoes do tema para manter consistencia visual.
- Evitar criar cabecalhos, cores e estilos visuais manuais.
- Logs completos devem ir para `/root/Multizap/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/`.
- O terminal deve mostrar resumo limpo, sem despejar logs longos.
- Loading animado deve esconder log grande; o conteudo completo fica salvo em `revisoes/`.
- Scripts com risco devem usar `dry-run` e confirmacao explicita.
- Scripts Node devem usar `sanitizeLog` antes de imprimir ou persistir saidas de comandos.
- Nunca imprimir secrets, tokens, `.env`, sessoes, cookies ou connection strings.
- Scripts sensiveis nao devem tocar em VPS, Caddy, Docker, WuzAPI, WhatsApp,
  CRM, banco real, secrets ou `.env` sem aprovacao humana explicita.

## Carregamento no root

O terminal do root deve carregar o tema quando o arquivo existir:

```bash
[ -f /root/CentralDark/scripts/lib/theme.sh ] && source /root/CentralDark/scripts/lib/theme.sh
```

Esse carregamento nao substitui a obrigacao de scripts operacionais tambem
fazerem `source` do tema diretamente quando forem executados fora do shell
interativo.

## Dependencia Chalk

O `package.json` da raiz declara `chalk`. Em ambientes sem `node_modules`
instalado, `theme-node.mjs` cai para ANSI seguro sem quebrar o script. Para
execucoes oficiais, instalar dependencias da raiz antes de rodar scripts Node
que dependem do tema.
