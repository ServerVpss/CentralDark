# Cadeia Free Tier via Hermes — Estado Atual da Casa

> Data: 2026-10-25 | Autor: Filha 04 (t_6056a006) | Mãe: t_911e17ff

## Estado medido

| Item | Valor |
|------|-------|
| Primary provider | `llamacpp` (local, `http://127.0.0.1:18434/v1`) |
| Fallback chain | **VAZIA** (`hermes fallback list` → "No fallback providers configured") |
| Custom providers (config.yaml) | `jan` (local:1337), `kaggle` (cloudflare tunnel), `reads-bottle-fees-tcp` (cloudflare tunnel) |
| Built-in providers | `nous` (Hermes cloud, requer API key ativa), `edge` (TTS only) |
| Kanban dispatch provider | `anthropic` (claude-opus-4-6, via Hermes cloud — não free tier local) |

## CLI de fallback

```bash
hermes fallback list          # mostra cadeia atual
hermes fallback add           # picker interativo: escolhe provider + model
hermes fallback remove        # remove entrada da cadeia
hermes fallback clear         # limpa toda a cadeia
```

Fallback é tentado automaticamente quando o primary falha com rate-limit, overload ou connection error. A ordem da cadeia é a ordem de tentativa.

## Provedores free tier realmente disponíveis na Casa (2026-10-25)

### 1. llamacpp (local) — PRIMARY
- Endpoint: `http://127.0.0.1:18434/v1`
- Modelo: depende do que estiver carregado no llama-server
- Custo: zero (hardware local)
- Risco: indisponível se o servidor local não estiver rodando
- Status: **ATIVO como primary**

### 2. jan (local) — CANDIDATO A FALLBACK
- Endpoint: `http://127.0.0.1:1337/v1`
- Modelo configurado: `Jan-v3.5-4B-Q4_K_XL`
- Custo: zero (hardware local)
- Risco: modelo pequeno (4B params); Jan precisa estar rodando
- Status: **NÃO TESTADO como fallback** — key_env `HERMES_CUSTOM_JAN_API_KEY` pode exigir valor

### 3. kaggle / cloudflare tunnel — UNKNOWN
- Endpoint: `https://huge-atomic-emacs-everywhere.trycloudflare.com/v1`
- Modelo: `Qwen3.8-27B-Uncensored-GGUF:Q4_K_M`
- Custo: zero (free tier Kaggle + túnel)
- Risco: túnel Cloudflare é efêmero (URL muda a cada reinício); endpoint pode estar offline
- Status: **UNKNOWN** — URL provavelmente expirada

### 4. nous (Hermes cloud)
- Requer API key ativa (conta Nous)
- Custo: free tier limitado ou pago dependendo do plano
- Status: **NÃO MEDIDO** — necessita verificar se há quota free disponível

### 5. nvidia (usado em testes kanban anteriores)
- Provider: `nvidia`, Modelo: `nvidia/nemotron-3-ultra-550b-a55b`
- Foi testado com sucesso para kanban dispatch (t_2805243c, t_26e02a16)
- Custo: free tier NVIDIA tem limites de rate
- Status: **COMPROVADO para kanban dispatch**, não configurado como fallback

## Cadeia recomendada (quando provedores estiverem ativos)

```
PRIMARY:  llamacpp (local)
FALLBACK 1: jan (local, se rodando)
FALLBACK 2: nvidia (free tier, se API key configurada)
```

Cloudflare tunnels são efêmeros e não servem como fallback estável.

## Como configurar (quando validado)

```bash
# Adicionar fallback interativamente
hermes fallback add
# Selecionar provider e modelo no picker

# Ou via config.yaml diretamente em fallback_providers:
# fallback_providers:
#   - provider: jan
#     model: Jan-v3.5-4B-Q4_K_XL
```

## UNKNOWN / BLOCKED

- Nenhum fallback está configurado hoje
- jan e nvidia são candidatos mas não foram testados como fallback
- Cloudflare tunnels são instáveis para fallback permanente
- Configuração de fallback requer testar cada provider antes de adicionar

## NEXT_CURSOR

1. Testar `hermes fallback add` com jan (quando Jan estiver rodando)
2. Testar `hermes fallback add` com nvidia (quando API key estiver disponível)
3. Validar que rate-limit no primary dispara fallback automaticamente
4. Atualizar este documento com resultados medidos


## Seleção de modelo + reasoning — inventário operacional (25/10/2026)

### Ordem de autoridade para qualquer conclusão sobre Hermes Desktop/CLI/Kanban

1. **GitHub/documentação oficial NousResearch/Hermes Agent**: conferir comportamento atual upstream.
2. **Versão instalada na Casa**: `hermes --version`.
3. **Help da própria versão**: `hermes --help`, `hermes kanban create --help`, `hermes kanban set-model --help`.
4. **Estado local real**: `config.yaml`, schema do Kanban, task/run atual e, quando necessário, código instalado.
5. **Efeito observado**: worker, log, card, Desktop/Cockpit e readback.

Nunca declarar que uma capacidade do upstream já existe na Casa apenas porque está documentada no GitHub. Também não concluir que a Casa não suporta algo só porque um único comando CLI não expõe a opção: conferir schema/dashboard/core instalado.

### Fontes oficiais atuais

- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/desktop.md`
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/configuring-models.md`
- `https://github.com/NousResearch/hermes-agent/blob/main/hermes_cli/kanban_db.py`
- `https://github.com/NousResearch/hermes-agent/blob/main/plugins/kanban/dashboard/plugin_api.py`

O Desktop usa o mesmo core/config/sessões/skills do CLI. O seletor do compositor permite escolher modelo e esforço para a sessão quando o modelo suporta controle de raciocínio; Settings → Model define o default do perfil. Presets de esforço por modelo no Desktop são conveniência de sessão e não devem ser confundidos com configuração de crons/subagentes/Kanban.

### Casa medida nesta rodada

- Hermes: `v0.22.4+91.g944c3a4`, upstream local `944c3a43`; o próprio updater informou instalação **943 commits atrás** no momento da medição.
- Perfil `default`: `llamacpp/model`.
- `config.yaml` contém `reasoning_effort: low`, porém `hermes config show` mostrou `Reasoning: off` para a rota local observada. **Não promover o valor do YAML a esforço efetivo** sem o runtime/model catalog confirmar suporte.
- `hermes --help` desta Casa aceita por invocação: `none | minimal | low | medium | high | xhigh | max | ultra`.
- O schema local do Kanban já contém `reasoning_effort`, e o código instalado normaliza esse campo.
- O dashboard/plugin local aceita `reasoning_effort` e `clear_reasoning_effort` em PATCH/bulk, chamando `kanban_db.set_reasoning_effort`.
- O `hermes kanban create --help` desta versão **não exibe** uma flag `--reasoning`. Portanto: não inventar sintaxe CLI para essa instalação.
- `hermes kanban set-model ID MODELO --provider PROVEDOR` altera somente model/provider no próximo dispatch; reasoning é um knob separado.

### Valores reais de reasoning medidos nos cartões recentes

| Cartão | Modelo | Provider | reasoning_effort no Kanban | Resultado |
|---|---|---|---|---|
| `t_6056a006` | `claude-opus-4-6` | `anthropic` | `minimal` | DONE |
| `t_b4b70da6` | `claude-haiku-4-5-20251001` | `anthropic` | `low` | DONE |
| `t_7cfbaae4` | `claude-sonnet-4-5-20250929` | `anthropic` | `medium` | DONE |
| `t_cac7a577` (Raiku, nome operacional) | `claude-haiku-4-5-20251001` | `anthropic` | `NULL` / herda perfil | RUNNING na medição |

Esses quatro valores são **estado observado dos cartões**, não recomendação universal. Um resultado DONE não prova sozinho que aquele esforço é melhor para todo trabalho.

### Gatilho de escolha

```text
INTENT + COMPLEXIDADE + CONTEXTO + CUSTO/LATENCIA + PROVA ANTERIOR
  ↓
KIMETSU_BRAINSTORM + 17_RESPIRACOES
  ↓
ESCOLHER PERFIL
  ↓
ESCOLHER PROVIDER + MODEL
  ↓
ESCOLHER REASONING (se a rota/modelo suportar)
  ↓
DESPACHAR
  ↓
MEDIR QUALIDADE + TEMPO + ERRO + EFEITO
  ↓
PROMOVER COMO "melhor execução" SOMENTE COM COMPARAÇÃO MATERIAL
```

Heurística inicial, **não selo automático**:
- tarefa curta, inventário, leitura e baixa ambiguidade → começar no menor esforço comprovadamente suficiente;
- integração/código com várias dependências → subir esforço se evidência indicar ganho;
- causa desconhecida/contraprova crítica → priorizar qualidade/diagnóstico, não somente velocidade;
- modelo que não oferece reasoning control → registrar `REASONING_CONTROL=UNAVAILABLE|OFF`, nunca fingir `low`;
- `NULL` em task Kanban significa herança do perfil, não `none`.

### Troca sem alterar o perfil global

```powershell
hermes kanban set-model <ID> <MODELO> --provider <PROVEDOR>
hermes kanban show <ID> --json
hermes kanban runs <ID>
```

Para o esforço por cartão, usar **superfície suportada pela versão instalada** (dashboard/core) e fazer readback do campo `reasoning_effort`. Não editar SQLite diretamente. Se a CLI local ganhar flag oficial em atualização futura, confirmar primeiro em `--help` e no GitHub oficial.

### Aprendizado para a skill-mãe

O inventário deve guardar, por execução comprovada: `skill_chamada`, `gatilho`, `breath_id`, `perfil`, `provider`, `model`, `reasoning_effort`, `tempo`, `resultado`, `evidência`, `contraprova` e `contexto`. Só então uma combinação pode virar preferência para um tipo de missão; manter as alternativas preservadas para outros casos.
