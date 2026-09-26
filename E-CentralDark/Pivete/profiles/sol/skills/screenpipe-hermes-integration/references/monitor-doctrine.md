# Monitor Doctrine — screenpipe-hermes-live-monitor

## O que monitora

Leitura única por ciclo, READ_ONLY — não altera nada, só mede e loga:

- Screenpipe `127.0.0.1:3030/health`
- Omni Router `127.0.0.1:8099/health`
- Hermes Desktop `127.0.0.1:8787/`
- Hermes Gateway `127.0.0.1:8080/`
- Sistema local rodando `health_check.sh`

Placar: 🟢🟡🔴 por serviço + resumo final (`tudo vivo` / `com aviso` / `algo caiu`).

## Design

- `--once`: roda um ciclo e sai — compatível com cron e teste manual
- Sem `--once`: loop infinito com `sleep` entre ciclos
- Log timestamped (UTC) em `live-monitor.log`
- Não tenta remediar automaticamente — o humano vê no log e decide
- health_check.sh é opcional por ciclo: se falhar, o serviço recebe 🟡 e o ciclo continua

## Interpretador Python

Este monitor foi configurado em 2026-09-01 no ambiente Hermes Agent desktop. O cronjob invoca o interpretador do venv do Hermes Agent. Se o ambiente mudar (nova instalação, migração, reformatação), verifique qual `python` resolve antes de confiar no cronjob — ajuste o caminho no prompt do job, não no script.

## Bash para health_check.sh

`health_check.sh` usa `tasklist`/`wmic` (binários nativos Windows). Precisa de um bash que consiga executar binários nativos:

- git-bash (`C:\Program Files\Git\usr\bin\bash.exe`) — funciona
- WSL/cygwin bash (`/usr/bin/bash`) — falha ao executar binários nativos (`execvpe`)

O script descobre e prefere o git-bash automaticamente. Se a máquina não tiver git-bash, o health_check local vaiReceber 🟡 e o ciclo segue.

## Arquivo

`scripts/screenpipe-hermes-live-monitor.py` — script estaticamente reexecutável.
