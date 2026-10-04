# 2026-10-04 — PR-Agent ligado à IA local CURRENT

## Correção

O workflow `.github/workflows/pr-agent.yml` estava ligado a três provedores cloud:

```text
Groq → Llama3-70B
Gemini → Flash
Anthropic → Claude
```

Isso não respeitava o binding local CentralDark. O owner foi mantido e corrigido para um único review pelo bridge local existente.

## Binding atual

```text
GitHub Actions self-hosted Linux
→ http://127.0.0.1:18435/health
→ resolve model CURRENT
→ http://127.0.0.1:18435/v1
→ PR-Agent
→ GitHub PR review
```

O job resolve `LOCAL_MODEL` no início da execução e exporta:

```text
CONFIG__AI_PROVIDER=openai
CONFIG__MODEL=openai/$LOCAL_MODEL
OPENAI__API_BASE=http://127.0.0.1:18435/v1
OPENAI__KEY=local-kylin
CONFIG__FALLBACK_MODELS=[]
```

O valor do modelo não está fixado no workflow. O `GITHUB_ENV` é usado para transportar o modelo resolvido ao passo seguinte; `CONFIG__MODEL` é montado no shell do próprio passo de review, depois da resolução.

## Removido

```text
GROQ_API_KEY
GEMINI_API_KEY
ANTHROPIC_API_KEY
ANTHROPIC_BASE_URL
```

Não há fallback cloud silencioso.

## Verificação

```text
workflow YAML parse: PASS
local workflow assertions: PASS
git diff --check: PASS
bridge live /health: 200
current local model measured: kylin-qwen-plus
```

## Decisão

```text
LOCAL_PR_REVIEW=REUSE_EXISTING_KYLIN_BRIDGE
SECOND_REVIEW_ENGINE=false
CLOUD_REVIEW_BINDING=false
MODEL_STATIC_IDENTITY=false
RESOLVE_AT_JOB_START=true
FALLBACK_CLOUD=false
```

A quantidade anterior de três jobs não representava três inteligências locais; eram três provedores cloud. O workflow agora não finge diversidade: usa o executor local CURRENT real.

## Disparo de prova

Foi adicionado `workflow_dispatch` para testar um PR existente sem fabricar um evento de pull request:

```text
workflow: pr-agent.yml
pr_number: 1748
run: 37227037321
head_sha: 2e3743a5817db1fd7d68acb4b3449b5907460039
```

Readback GitHub:

```text
status=queued
conclusion=UNKNOWN
runner=UNKNOWN
```

No momento da medição, os quatro runners Linux self-hosted estavam `online=true` e `busy=true`. Portanto o review local ainda não executou; não é `PASS` nem `FAIL`.

## Lote executado — falha real e correção

O run `37227037321` chegou ao runner `centraldark-vps-2`, mas falhou antes do PR-Agent porque `actions/setup-python@v6` tentou instalar Python 3.12, inexistente no openKylin 3.0:

```text
The version '3.12' with architecture 'x64' was not found for openKylin 3.0.
```

Correção mínima publicada no workflow:

```text
removido actions/setup-python@v6
usar python3 já existente no runner
python3 --version medido no job
continue-on-error=false
runner/model/source/execution_class registrados
```

Novo dispatch:

```text
run: 37228462840
head: b0f9e61df6
status: queued
conclusion: UNKNOWN
```

O run está aguardando runner; não foi promovido a PASS.

## Lote executado — falha seguinte do consumidor

A execução local fora do Actions reproduziu o próximo erro depois de remover o bloqueio do Python:

```text
Model openai/kylin-qwen-plus is not defined in MAX_TOKENS
and no custom_model_max_tokens is set
```

O bridge respondeu diretamente `HTTP 200` para a mesma rota e modelo, então o problema estava no orçamento/configuração do PR-Agent, não no endpoint local.

Correção publicada:

```text
CONFIG__CUSTOM_MODEL_MAX_TOKENS=8192
```

O PR-Agent ainda retornou `Failed to generate prediction` depois desse ajuste; portanto o parsing/compatibilidade da resposta cognitiva continua `UNKNOWN`, sem review promovido.

## Next cursor

`publicar workflow → disparar/medir um run de PR → provar health/model binding → provar PR-Agent usando 127.0.0.1:18435 → confirmar review publicado → receipt → retomar Self-Evolution com o mesmo resolver`
