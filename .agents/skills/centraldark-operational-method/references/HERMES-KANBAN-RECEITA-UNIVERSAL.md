# Hermes Kanban — receita universal da CentralDark

> **Owner único:** `centraldark-operational-method`. Esta receita descreve a delegação. Não cria outra skill, outro Kanban ou outro executor.

## 0. Princípio e evidência

**Um comando para todas as intenções:** `hermes kanban create`. Criar, excluir, editar, inspecionar ou testar são **verbos no texto da missão**, não comandos Kanban alternativos. `kanban complete`, `kanban archive` e `kanban block` alteram o cartão, **não substituem ações sobre arquivos**.

**PONTO FIXO DO FLUXO WINDOWS (24/10/2026):** duas missões concluídas no mesmo Kanban da Casa, mesmo perfil `default` e provedor NVIDIA. `t_2805243c` terminou `DONE` com conteúdo do TXT lido e conferido; `t_26e02a16` terminou `DONE` com ausência do TXT conferida no Windows. **CRIAR=PASS, EXCLUIR=PASS para os alvos e condições testados.** Isso prova o método de delegação e readback desse fluxo; não é prova antecipada de todo formato/operação futura. Não alterar o comando comprovado para generalizar: mudar apenas os valores de intenção e seu critério de validação.

## 1. Resolver a intenção em tempo de execução

| Campo | Significado | Regra |
|---|---|---|
| `AMBIENTE_ALVO` | Casa Windows ou VPS Linux | Interpretar o pedido atual; nunca inferir apenas pelo terminal do ChatGPT. |
| `WORKSPACE_ALVO` | Diretório de trabalho da missão | **Variável obrigatória quando a intenção exigir um diretório**. Definida pelo pedido atual, não fixar `C:\root` nem `/root`. |
| `TITULO` | Nome curto do cartão | Refletir a ação atual. |
| `DESCRICAO` | Instrução integral para o Hermes | Verbo, alvo, limite de escopo, evidência esperada e o que fazer diante de bloqueio. |
| `PERFIL` | Assignee Kanban | Selecionar no ambiente **correto** após `kanban assignees`. Na Casa testada: `default`. |
| `PROVEDOR` / `MODELO` | Backend de IA | Usar par existente no Hermes alvo, aprovado e acessível. Não hardcode global. |
| `CHAVE_IDEMPOTENCIA` | Chave única por intenção + alvo | Mesma intenção em retry = mesma chave; outra intenção (excluir em vez de criar) = chave nova. |
| `ID_MISSAO` | ID devolvido por `create` | Registrar e consultar; nunca adivinhar nem reutilizar ID de outra missão. |

Se o pedido não definir um local necessário, resolver pelo contexto autorizado do usuário ou pedir apenas o dado essencial. Não transformar o exemplo de ontem no workspace padrão. Não interpolar paths vindos de textos não confiáveis sem validar o alvo e a permissão.

## 2. Escolher o executor: duas rotas, sem misturar máquinas

| Rota | Executável indicado | Origem da evidência |
|---|---|---|
| **Casa/Windows** | `C:\Users\Administrador\AppData\Local\hermes\bin\hermes.exe` | Executável realmente usado no teste local. |
| **VPS/Linux** | `/root/.hermes/hermes-agent/.hermes/bin/hermes` | Declarado em `K:\scripts\vps\neurolink-gateway-dispatch.sh`, linha `HERMES=`; **`test -x` comprovado na VPS em 24/10/2026**. Perfis/modelos/workspace VPS ainda exigem medição própria. |

Na Casa, Desktop Commander executa o CLI local autorizado. Para a VPS, usar somente uma rota já autorizada para executar **no host VPS**, nunca rodar o binário Linux no Windows. O `.sh` de NeuroLink demonstra a rota VPS; não deve se tornar um segundo dispatcher universal.

## 3. Receita Windows Casa (PowerShell)

Este é um **template genérico**, não uma ordem para usar qualquer diretório específico. Preencha os valores de cada missão com a intenção atual.

```powershell
$Hermes = 'C:\Users\Administrador\AppData\Local\hermes\bin\hermes.exe'
$WorkspaceTarget = $WorkspaceDefinidoPelaIntencao
$Title = $TituloDefinidoPelaIntencao
$Mission = $DescricaoDefinidaPelaIntencao
$IdempotencyKey = $ChaveUnicaDaIntencao
$AgentProfile = 'default'   # apenas porque o perfil foi medido na Casa
$Provider = $ProvedorEscolhido
$Model = $ModeloEscolhido

if (!(Test-Path -LiteralPath $Hermes -PathType Leaf)) { throw 'HERMES_CASA_AUSENTE' }
if ([string]::IsNullOrWhiteSpace($WorkspaceTarget) -or !(Test-Path -LiteralPath $WorkspaceTarget -PathType Container)) { throw 'WORKSPACE_ALVO_INVALIDO' }
if ([string]::IsNullOrWhiteSpace($Mission) -or [string]::IsNullOrWhiteSpace($Title)) { throw 'INTENCAO_INCOMPLETA' }
& $Hermes kanban assignees
$Mission | & $Hermes kanban create --assignee $AgentProfile --goal --goal-max-turns 5 --workspace "dir:$WorkspaceTarget" --idempotency-key $IdempotencyKey --body-file - --model $Model --provider $Provider --json $Title
```

`$WorkspaceDefinidoPelaIntencao`, `$TituloDefinidoPelaIntencao` etc. são valores a resolver **antes** de executar; não são configurações persistentes. O perfil também deve ser revalidado quando o executor ou instalação mudar.

## 4. Receita VPS Linux (Bash)

Executar **somente dentro da VPS já autorizada**; variáveis vêm da missão atual:

```bash
set -euo pipefail
HERMES='/root/.hermes/hermes-agent/.hermes/bin/hermes'
WORKSPACE_TARGET="${WORKSPACE_TARGET:?workspace da intencao nao informado}"
MISSION_TITLE="${MISSION_TITLE:?titulo nao informado}"
MISSION_BODY="${MISSION_BODY:?descricao nao informada}"
IDEMPOTENCY_KEY="${IDEMPOTENCY_KEY:?chave nao informada}"
AGENT_PROFILE="${AGENT_PROFILE:?perfil medido na VPS nao informado}"
MODEL_PROVIDER="${MODEL_PROVIDER:?provedor valido na VPS nao informado}"
MODEL_NAME="${MODEL_NAME:?modelo valido na VPS nao informado}"
test -x "$HERMES" || { echo 'HERMES_VPS_AUSENTE'; exit 2; }
test -d "$WORKSPACE_TARGET" || { echo 'WORKSPACE_ALVO_INVALIDO'; exit 2; }
"$HERMES" kanban assignees
printf '%s\n' "$MISSION_BODY" | "$HERMES" kanban create --assignee "$AGENT_PROFILE" --goal --goal-max-turns 5 --workspace "dir:$WORKSPACE_TARGET" --idempotency-key "$IDEMPOTENCY_KEY" --body-file - --model "$MODEL_NAME" --provider "$MODEL_PROVIDER" --json "$MISSION_TITLE"
```

**Não assumir `default` ou NVIDIA na VPS:** descobrir quais perfis/modelos existem naquela instalação. Os caminhos Linux e Windows não são intercambiáveis.

## 5. Matriz de modelos e escolha segura

| Modelo/provedor | Estado medido | Uso |
|---|---|---|
| `nvidia/nemotron-3-ultra-550b-a55b` / `nvidia` | **PASS em missão real na Casa**: fez o TXT no cartão `t_2805243c`. | Opção comprovada para esse ambiente enquanto acessível. |
| `jann` / `custom` via túnel Cloudflare | **FAIL observado** no mesmo cartão: `APIConnectionError`. | Não usar como opção confiável sem revalidar conectividade. |
| **Qualquer outro par** | **UNKNOWN** até teste e evidência. | É permitido usar quando configurado, autorizado e medido. Não reduzir o sistema a um modelo único. |

Consultar catálogo/perfis disponíveis no Hermes alvo; não inferir disponibilidade só pelo nome. Os campos `--model` e `--provider` existem no CLI e substituem o default **somente no cartão**. Evitar mudar configurações globais do perfil para resolver uma missão específica.

**Recuperação de falhas, Kimetsu e não duplicação:** seguir também [o protocolo específico de recuperação, contexto, pausa, deduplicação e modelo local](KANBAN-KIMETSU-RECUPERACAO-E-DELTA-20261025.md). Não relançar uma execução que falhou por contexto apenas trocando `--model`: medir causa e corrigir antes. Arquivar somente duplicatas comprovadas, preservando a missão-mãe e os registros.

## 6. Readback obrigatório

1. `hermes kanban show ID_MISSAO --json`: conferir ambiente/workspace, `assignee`, `model_override`, estado.
2. `hermes kanban runs ID_MISSAO`: ver execução e eventuais erros; `READY`, `RUNNING`, `DONE` são estados distintos.
3. Verificar no **host de destino** o efeito exato descrito na missão; se a intenção for exclusão, provar **ausência do arquivo alvo**; se for criação, provar existência e conteúdo.
4. Conferir que nenhum alvo fora do escopo foi alterado; em caso de bloqueio registrar evidência.
5. Só declarar sucesso quando estado e efeito real estiverem comprovados. Enfileiramento/assignee não são execução.

## 7. Dois testes da mesma receita (exemplos, não defaults)

- **Criar:** corpo da missão pede criar arquivo temporário num diretório aprovado, e conteúdo exato. Cartão `t_2805243c`, `DONE`, arquivo e conteúdo comprovados.
- **Excluir:** corpo pediu remover **somente o arquivo do teste**, sem excluir a pasta. Cartão `t_26e02a16` foi criado com o mesmo `kanban create`, já com `--assignee default` e `--model/--provider`. **Resultado confirmado:** `DONE` / `completed`; alvo ausente no readback do Windows. Os dois testes estão fechados, cada um com prova própria.

**Regras imutáveis:** intenção do usuário define o alvo; manter Casa e VPS isoladas; uma skill canônica; reutilizar o Kanban existente; nenhuma mutação GitHub, VPS ou Cockpit fora da missão autorizada.