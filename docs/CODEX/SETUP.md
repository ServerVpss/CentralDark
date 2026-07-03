# Ambiente Local Codex

Este documento registra o ambiente recomendado para operar o repo CentralDark no Codex/Windows sem depender de ajustes manuais a cada tarefa.

## Objetivo

Reduzir limitacoes locais simples durante auditorias e correcoes seguras:

- consultar GitHub, issues, PRs, labels e workflows;
- validar YAML e JSON;
- validar workflows do GitHub Actions;
- validar scripts shell;
- evitar aliases quebrados do WindowsApps;
- manter ferramentas locais separadas de secrets e producao.

## Ferramentas recomendadas

| Ferramenta | Uso | Status neste ambiente |
| --- | --- | --- |
| `git` | status, diff, commit, push aprovado | presente |
| `rg` | busca rapida no repo | presente via `codex-bin` |
| `node` | scripts JS/MJS e validadores | presente |
| `npm.cmd` | npm no PowerShell sem cair em policy de `npm.ps1` | presente |
| `python` | validacoes auxiliares | presente via PATH/fallback local |
| `gh` | issues, PRs, labels, auth oficial GitHub | presente via `codex-bin` |
| `jq` | JSON em linha de comando | presente via `codex-bin` |
| `yq` | YAML em linha de comando | presente via `codex-bin` |
| `actionlint` | validar GitHub Actions | presente via `codex-bin` |
| `shellcheck` | validar scripts `.sh` | presente via `codex-bin` |

## Instalacao recomendada

Preferir instaladores oficiais ou `winget`, quando o ambiente permitir:

```powershell
winget install --id GitHub.cli
winget install --id jqlang.jq
winget install --id MikeFarah.yq
winget install --id rhysd.actionlint
winget install --id koalaman.shellcheck
winget install --id Python.Python.3.13
```

Se `winget` falhar por sessao WindowsApps, usar instalacao portatil local em:

```text
$env:USERPROFILE\Documents\Codex\tools\codex-bin
```

Essa pasta, chamada `codex-bin`, fica fora do repo e deve conter apenas binarios de ferramentas publicas. Ela nunca deve guardar tokens, secrets, `.env`, sessions, `.ssh`, `*.pem` ou `*.key`.

O instalador portatil do repo e:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev/install-codex-tools.ps1
```

Por padrao, ele baixa releases publicas oficiais para `$env:USERPROFILE\Documents\Codex\tools\codex-bin` e roda o checker ao final.
Tambem e possivel informar outro destino local:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev/install-codex-tools.ps1 -InstallDir "D:\CodexTools\codex-bin"
```

Ele nao executa `gh auth login`, nao salva token e nao altera secrets.

## GitHub CLI

Quando `gh` estiver instalado, usar login oficial via navegador:

```powershell
gh auth login --web
```

Nao colar token no chat.
Nao salvar token manualmente em arquivo do repo.
Nao commitar arquivos gerados por autenticacao.

## Python

O alias `WindowsApps\python.exe` pode falhar dentro do Codex. O checker procura primeiro `python` no PATH e, se necessario, usa o fallback local comum:

```text
$env:LOCALAPPDATA\Programs\Python\Python313\python.exe
```

Esse fallback evita depender de um usuario especifico do Windows.

## Verificacao

Rodar:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev/check-codex-tools.ps1
```

O script e read-only: nao instala, nao autentica, nao toca secrets e nao altera o repo.
