---
name: directory-watch
description: Monitor directory file changes in real-time with SHA256.
category: syscheck
---

# Directory Watch — monitoramento de árvore de arquivos

## Gatilhos
- Quando precisar observar uma árvore de arquivos em tempo real (novos, modificados, removidos) a cada N segundos.
- Quando precisar de prova de mudança (antes/depois SHA256) e não apenas timestamp.
- Quando quiser registrar logs de mudanças para auditoria ou rastreamento forense.

## Como usar
Recomenda-se o script incluso antes de inventar ferramenta própria:

```bash
# Rodar o monitor (detecta automaticamente ~/.screenpipe e caminhos padrão):
python scripts/monitor_filetree.py --interval 5

# Especificar pasta ao forçar caminho:
python scripts/monitor_filetree.py --watch /c/Users/danda/.screenpipe --interval 2

# Salvar log de mudanças em diretório específico:
python scripts/monitor_filetree.py --log-dir /c/Users/danda/watch-logs
```

O script:
- faz snapshot inicial dos arquivos (SHA256, tamanho);
- a cada `--interval` segundos, compara snapshot com estado atual;
- reporta eventos: `➕ added`, `✏️ modified` (com hash antes/depois e tamanho), `➖ removed`;
- salva log contínuo no arquivo `monitor-changes.log` no diretório de log (ou `~/screenpipe-monitor` por padrão);
- finaliza com Ctrl+C e exibe resumo de eventos registrados.

## Instruções
- O script usa Python 3 padrão (os, time, datetime, hashlib) — nada externo, sem dependência de pacotes.
- Hash SHA256 de cada arquivo para detectar mudança real de conteúdo, não apenas timestamp.
- Ignora erros de permissão e arquivos não-lidos.
- Intervalo default 5s. Ajuste conforme necessidade (ex: `--interval 2` para detecção mais agressiva).
- O script emite para stdout e anexa ao log arquivo; serve tanto para uso interativo quanto como base para automação que consome o log.

## Quê pode vir depois
- Integração com notificação externa (hook ao detectar evento específico).
- Filtro por glob ou extensão (`*.log`, `*.json`).
- Rupture detection: sinalizar sequência rápida de eventos (possível escrita concorrente).
- Exportação estruturada em JSONL para consumo downstream.

## Referências
- Veja `references/screenpipe-watch-examples.md` para casos de uso e exemplos de comandos usados nesta sessão.
- Script includo: `scripts/monitor_filetree.py`.

## Autoria
Criado a partir de sessão Hermes 1/9/2026 — monitoramento de pasta Screenpipe e código de exemplo de uso.
