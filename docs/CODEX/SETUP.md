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

## Codex no VS Code: Conta Google e provedor Abacus

Existem duas autenticacoes independentes neste arranjo:

```text
CONTA CODEX/OPENAI VIA GOOGLE
!=
CREDENCIAL DO MODEL_PROVIDER ABACUS
```

O login em **Conta** no Codex autentica a superficie Codex/OpenAI. Ele nao
preenche automaticamente credenciais de um provedor de modelo customizado.
Da mesma forma, habilitar MCPs ou plugins nao autentica o `model_provider`.

### Quero usar minha conta Google no Codex, sem Abacus

Para esse caso, nao configurar um provider customizado. No `config.toml`:

1. remover a linha `model_provider = "abacus"`;
2. remover todo o bloco `[model_providers.abacus]`;
3. remover `review_model = "grok-4.5"`, porque esse modelo nao pertence a
   sessao Codex/OpenAI;
4. manter `model = "gpt-5.6-sol"` somente se ele aparecer como disponivel para
   a conta autenticada; disponibilidade nao deve ser presumida pelo texto local;
5. fechar e abrir novamente o VS Code;
6. abrir **Codex Settings -> Conta -> Entrar** e, na pagina de autenticacao,
   escolher **Continuar com Google** usando a conta desejada.

Configuracao minima candidata:

```toml
model = "gpt-5.6-sol"
model_reasoning_effort = "high"
service_tier = "default"
approvals_reviewer = "user"
personality = "pragmatic"
```

Nao copiar cookie, token OAuth ou `auth.json` para o `config.toml`. O navegador
conclui a autenticacao e o Codex guarda a sessao fora do repositorio. Se
`gpt-5.6-sol` nao aparecer na conta depois do login, selecionar na interface um
modelo realmente oferecido para aquela conta; trocar o nome no arquivo nao
concede acesso ao modelo.

As telas **Servidores MCP** e **Plug-ins** nao sao a tela de login. Elas conectam
ferramentas e extensoes depois que a Conta ja esta autenticada.

### Quero usar Abacus como provider customizado

Quando o `config.toml` tiver:

```toml
model_provider = "abacus"

[model_providers.abacus]
name = "Abacus RouteLLM"
base_url = "https://routellm.abacus.ai/v1"
wire_api = "responses"
env_key = "ABACUS_API_KEY"
```

o Codex procura `ABACUS_API_KEY` no ambiente do processo. O fluxo correto no
Windows e:

1. Em **Codex Settings -> Conta**, entrar na conta Codex/OpenAI e escolher Google
   quando essa opcao estiver disponivel.
2. Configurar separadamente a credencial do Abacus como variavel do usuario,
   sem gravar o valor no `config.toml`:

```powershell
$abacusKey = Read-Host "ABACUS_API_KEY"
[Environment]::SetEnvironmentVariable("ABACUS_API_KEY", $abacusKey, "User")
Remove-Variable abacusKey
```

3. Fechar **todas** as janelas do VS Code e abrir novamente. A extensao herda
   variaveis do processo que iniciou o VS Code; apenas recarregar a janela pode
   manter o ambiente antigo.
4. Verificar somente a presenca, nunca o valor:

```powershell
if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable("ABACUS_API_KEY", "User"))) {
  Write-Error "ABACUS_API_KEY ausente"
} else {
  Write-Host "ABACUS_API_KEY configurada"
}
```

Nao apontar um provider customizado esperando que ele reutilize o OAuth da
Conta Codex/OpenAI.

Regras de seguranca:

- nao colar API key em chat, issue, PR, log ou screenshot;
- nao colocar o valor da key em `config.toml`;
- nao adicionar a key em `[shell_environment_policy.set]`, pois esse bloco e
  configuracao persistida em texto;
- credencial exposta deve ser revogada/rotacionada no servico que a emitiu;
- depois da rotacao, atualizar somente o armazenamento local seguro e reiniciar
  o VS Code.

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
