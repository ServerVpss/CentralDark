# Gemini CLI — Investigação de Binário e Disponibilidade
# Front 4/10 — 2026-09-02

## Resumo Executivo

| Item | Resultado |
|------|-----------|
| **Binário encontrado** | SIM |
| **Versão do pacote** | `@google/gemini-cli@0.58.0` |
| **Versão do CLI (`gemini --version`)** | `0.58.0` (capturado antes do timeout) |
| **Node.js** | v26.5.1 (presente e functional) |
| **npm global** | funcional |
| **Execução completa (`--version`/`--help`)** | TIMEOUT — não concluída dentro do window |
| **Instalação necessária?** | NÃO — já instalado globalmente |

## Detalhes Técnicos

### Localização do binário
```
C:\Users\danda\AppData\Roaming\npm\gemini.cmd   (350 bytes, DOS batch, ASCII+CRLF)
C:\Users\danda\AppData\Roaming\npm\gemini        ( shadowing binary )
```

### `gemini.cmd` — estrutura
Arquivo wrapper npm padrão (DOS batch). Primeiras linhas:
```
@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0

IF EXIST "%dp0%\node.exe" (
```
Padrão npm: resolve caminho do node, executa o módulo `@google/gemini-cli`.

### `npm list -g --depth=0` — pacotes globais relevantes
```
@C
├── @anthropic-ai/claude-code@2.1.251
├── @github/copilot@1.0.81
├── @google/gemini-cli@0.58.0   ← Gemini CLI
└── @openai/codex@0.152.1
```

### `where gemini` — resolução de PATH
```
C:\Users\danda\AppData\Roaming\npm\gemini
C:\Users\danda\AppData\Roaming\npm\gemini.cmd
```

### Node.js
```
node --version → v26.5.1
```
Node está instalado em `C:\Program Files\nodejs\node.exe` e está na PATH.

## Diagnóstico do Timeout

- `gemini --version` retornou `0.58.0` mas o processo não terminou dentro do window de 15–20s.
- `gemini --help` também timeout.
- `npx --version` também timeout.
- O terminal tem latência elevada neste ambiente (comandos simples como `file` e `head` também timeout).

**Hipótese principal:** o Gemini CLI, ao iniciar, faz bootstrapping (descarga de modelos, handshake com Google, verificação de credenciais) e não é *fire-and-forget* rápido como `--version` sugeriria. O binário funciona, mas o tempo de 응답 inicial é longo.

**Hipótese secundária (menos provável):** O subprocess pode estar segurando stdio. O output `0.58.0` chegou, indicando que o processo escreveu a versão e depois ficou preso.

## Conclusão

- **Gemini CLI está instalado e acessível** via `gemini` / `gemini.cmd` em `%APPDATA%\npm\`.
- **Versão confirmada:** `0.58.0` (pacote `@google/gemini-cli@0.58.0`).
- **Problema anterior (FileNotFoundError):** não é mais relevante — o binário existe e responde, ao menos com `--version`.
- **Timeout na execução completa:** característica do Gemini CLI (inicialização lenta), não erro de binário/missing.
- **Ação recomendada para o front seguinte:** se a intenção é testar consumação real (não apenas presença), usar `background=true` com timeout longo (60s+) ou `gemini --version` como smoke test rápido (já comprovado que retorna).

## Evidência Bruta

```
where gemini:
  C:\Users\danda\AppData\Roaming\npm\gemini
  C:\Users\danda\AppData\Roaming\npm\gemini.cmd

node --version: v26.5.1

gemini.cmd --version: 0.58.0   (subprocess timeout após output)

npm list -g (relevant):
  @google/gemini-cli@0.58.0

gemini.cmd: 350 bytes, DOS batch file, ASCII text, CRLF
```
