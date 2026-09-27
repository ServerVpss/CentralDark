# Ambiente Local Codex

Este documento registra o ambiente recomendado para operar o repo CentralDark no Codex/Windows sem depender de ajustes manuais a cada tarefa.

## Objetivo

Reduzir limitacoes locais simples durante auditorias e correcoes seguras:

- consultar GitHub, issues, PRs, labels e workflows;
- validar YAML e JSON;
- validar workflows do GitHub Actions;
- validar scripts shell;
- evitar aliases quebrados do WindowsApps;
- manter ferramentas locais separadas de secrets e producao;
- impedir bypass de provider quando a missao exige a porta unica CentralDark.

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

## Codex no VS Code: conta OpenAI/Google e porta unica CentralDark

Existem duas coisas diferentes:

```text
CONTA CODEX/OPENAI VIA GOOGLE
!=
ROTA DE MODELO DA CENTRALDARK
```

O login em **Conta** autentica a superficie Codex/OpenAI. A rota de modelo da Casa deve obedecer ao contrato atual:

```text
CODEX
  -> CENTRALDARK OMNI ROUTER
     -> provider permitido/disponivel
        -> failover quando aplicavel
```

`ABACUS_API_KEY`, `XAI_API_KEY`, `NOUS_API_KEY` e demais credenciais de upstream pertencem ao router/owner do provider. Elas nao devem ser requisito direto da superficie Codex quando `ONE_ROUTER_ENTRYPOINT=true`.

### Perfil oficial da Casa: Codex -> CentralDark

O Omni Router atual oferece API OpenAI-compativel em `http://127.0.0.1:8099/v1` e suporta `responses` e `chat/completions`.

Configuracao candidata no `~/.codex/config.toml`:

```toml
model = "auto"
model_provider = "centraldark"

[model_providers.centraldark]
name = "CentralDark Omni Router"
base_url = "http://127.0.0.1:8099/v1"
wire_api = "responses"
requires_openai_auth = false
request_max_retries = 0
```

Nao definir `env_key` quando o router local estiver sem autenticacao propria.

Se `CENTRALDARK_ROUTER_TOKEN` estiver habilitado no runtime, usar somente a credencial do router:

```toml
[model_providers.centraldark]
name = "CentralDark Omni Router"
base_url = "http://127.0.0.1:8099/v1"
wire_api = "responses"
env_key = "CENTRALDARK_ROUTER_TOKEN"
requires_openai_auth = false
request_max_retries = 0
```

Assim o Codex conhece uma credencial de entrada da Casa; ele nao precisa conhecer credenciais dos providers internos.

### Por que Abacus direto deixou de ser o padrao

Este arranjo antigo:

```toml
model_provider = "abacus"

[model_providers.abacus]
base_url = "https://routellm.abacus.ai/v1"
wire_api = "responses"
env_key = "ABACUS_API_KEY"
```

faz a superficie parar antes de chegar ao Omni Router quando a variavel esta ausente. Isso e `SURFACE_ROUTE_DRIFT` para a politica atual da Casa.

Abacus continua podendo existir como provider interno do Omni Router. Nesse papel, se a chave estiver ausente ou a rota falhar, o router pode classificar a tentativa e seguir para outra rota permitida em vez de transformar um provider opcional em falha global da superficie.

### Quero usar a conta OpenAI/Google sem o router da Casa

Isso continua possivel somente como diagnostico/uso explicitamente fora do fluxo `ONE_ROUTER_ENTRYPOINT`.

Nesse caso, remova `model_provider = "centraldark"`, entre em **Codex Settings -> Conta**, e use apenas os modelos realmente disponibilizados para a conta autenticada.

Nao confundir essa opcao com o fluxo operacional da CentralDark.

### Reinicio e verificacao

Aplicativos desktop e extensoes podem manter configuracao/ambiente do processo antigo. Depois de alterar `~/.codex/config.toml`:

1. fechar todas as janelas do VS Code/Codex;
2. garantir que o Omni Router esteja no endpoint esperado;
3. abrir novamente;
4. iniciar uma sessao nova;
5. confirmar no status do Codex que o provider e `centraldark`;
6. provocar uma chamada simples e verificar no receipt do Omni qual provider respondeu e se `fallback_used` mudou.

A ausencia de `ABACUS_API_KEY` na superficie Codex nao deve mais ser tratada como falha quando o provider configurado e `centraldark`.

## Regras de seguranca

- nao colar API key em chat, issue, PR, log ou screenshot;
- nao colocar valores de secrets no `config.toml`;
- nao adicionar secret em `[shell_environment_policy.set]`;
- credencial exposta deve ser revogada/rotacionada no servico que a emitiu;
- cada provider interno guarda sua propria credencial no owner apropriado;
- a superficie conhece no maximo a credencial da porta CentralDark quando ela existir;
- `MISSING_OPTIONAL_PROVIDER_KEY != GLOBAL_SURFACE_FAILURE`;
- `UNKNOWN != PASS`.

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

Para o roteamento CentralDark, a verificacao material adicional e:

```text
GET  http://127.0.0.1:8099/health
GET  http://127.0.0.1:8099/v1/models
POST http://127.0.0.1:8099/v1/responses
```

Esses endpoints documentados nao provam runtime por si so; o PASS exige resposta observada no runtime atual.