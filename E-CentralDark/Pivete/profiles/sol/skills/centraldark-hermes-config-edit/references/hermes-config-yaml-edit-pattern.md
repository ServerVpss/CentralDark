# Edição do config.yaml do Hermes — guia completo (CentralDark Casa, 2026-08-29)

## 1. Contexto

O skill `centraldark-hermes-config-edit` codifica o método de edição segura que surgiu
quando a sessão precisou reestruturar o config.yaml do Hermes para usar o CentralDark
Omni Router como único entrypoint, com os 7 free models na cadeia de fallback.

Problemas reais encontrados nesta sessão:
- `model.default` estava corrompido: uma string longa com os 7 modelos concatenados
  ("nous/tencent/hy3:free - nous/upstage/...") em vez de um único modelo.
- `providers.centraldark-router.models` só tinha 5 modelos (auto, glm-5.2, claude-code,
  hermes/hermes, tencent/hy3:free). Os demais 6 free models não estavam no router, o que
  quebra a regra "uma porta, muitos motores".
- `fallback_providers` tinha provider=nous, ao invés de centraldark-router.
- `hermes fallback list` reportou vazio mesmo com YAML válido porque a cadeia não era
  reconhecida pelo Hermes em estado errado.

## 2. Módulos disponíveis na venv do Hermes

O Python do sistema (C:\Users\danda\AppData\Local\Programs\Python\Python313\python.exe)
NÃO tem PyYAML. A venv do Hermes (C:\Users\danda\AppData\Local\hermes\hermes-agent\venv)
tem sim. Módulos confirmados nesta sessão:

- requests 2.33.0
- fastapi 0.133.1
- uvicorn 0.41.0
- pydantic 2.13.4
- urllib3 2.7.0
- yaml (PyYAML) — importável via sys.path.insert na pasta site-packages da venv

## 3. Script de validação

Este script carrega o config, faz snapshot sanitizado e reporta os pontos críticos.
Ele usa sys.path.insert para importar PyYAML corretamente.

```python
import sys, re
sys.path.insert(0, r'C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages')
import yaml, json
from pathlib import Path

config_path = Path(r'E:\CentralDark\Pivete\config.yaml')
with config_path.open('r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

if not isinstance(config, dict):
    raise SystemExit('Config not a dict')

model = config.get('model') or {}
router = config.get('providers', {}).get('centraldark-router', {})
fallback = config.get('fallback_providers')

print('model.provider:', model.get('provider'))
print('model.default:', model.get('default'))
print('model.aliases.free-tier-centraldark:', model.get('aliases', {}).get('free-tier-centraldark'))
print('providers.centraldark-router.models:', router.get('models'))
print('fallback_providers:', [ {'provider': e.get('provider'), 'model': e.get('model')} for e in (fallback or []) ])
```

## 4. Cross-check obrigatório

Após editar e re-parsear:

- `model.provider` é `centraldark-router`
- `model.default` é um único modelo (ex: `nous/tencent/hy3:free`)
- `model.default` NÃO é uma string com espaços e vários `nous/...`
- `providers.centraldark-router.models` contém todos os modelos que a cadeia de fallback
  deve rotear
- `fallback_providers` é uma LISTA de dicts com provider=centraldark-router e model
- `hermes fallback list` mostra a cadeia

## 5. O que NÃO fazer

- Não editar config.yaml com regex ou replace de bloco textual cego (`replace()` de string
  exata falha quando o texto não bate exato, como aconteceu nesta sessão).
- Não reescrever o arquivo inteiro manualmente sem preservar a árvore.
- Não adiconar modelo à cadeia sem confirmar que o router sabe roteá-lo (via /v1/models e
  invocação real POST /v1/chat/completions).
- Não declarar "pronto" antes de validar `hermes fallback list` e `hermes config show`.

## 6. Veredito desta sessão

O config.yaml foi reestruturado com sucesso:

- model.provider: centraldark-router
- model.default: nous/tencent/hy3:free
- model.aliases.free-tier-centraldark: nous/tencent/hy3:free
- providers.centraldark-router.models: 11 modelos (incluindo os 7 free)
- fallback_providers: 7 entradas, todas com provider=centraldark-router

O router não subiu nesta sessão (o script de boot do router depende de run_router.py,
que tenta executar o import do módulo com importlib e uvicorn, mas a porta 8099 não
ficou disponível antes do fim da sessão). Por isso a prova de invocação dos 7 modelos
não foi concluída; o fixed point não foi atingido.

Próxima sessão queabra essa missão deve:

1. subir o router com `python E:\CentralDark\Pivete\run_router.py` (ou equivável)
2. confirmar `curl http://127.0.0.1:8099/health` OK
3. fazer `curl http://127.0.0.1:8099/v1/models` e confirmar os 7 free models
4. testar invocação de cada um com POST /v1/chat/completions
5. validar `hermes fallback list`
6. contrapovoar (nova sessão Hermes, model.provider, fallback, invocação)

# Edição do config.yaml do Hermes — guia completo (CentralDark Casa, 2026-08-29)

## 1. Contexto

O skill `centraldark-hermes-config-edit` codifica o método de edição segura que surgiu
quando a sessão precisou reestruturar o config.yaml do Hermes para usar o CentralDark
Omni Router como único entrypoint, com os 7 free models na cadeia de fallback.

Problemas reais encontrados nesta sessão:
- `model.default` estava corrompido: uma string longa com os 7 modelos concatenados
  ("nous/tencent/hy3:free - nous/upstage/...") em vez de um único modelo.
- `providers.centraldark-router.models` só tinha 5 modelos; os demais 6 free models
  não estavam no router, o que quebra a regra "uma porta, muitos motores".
- `fallback_providers` tinha provider=nous ao invés de centraldark-router.
- `hermes fallback list` reportou vazio mesmo com YAML válido porque a cadeia não era
  reconhecida em estado errado.

## 2. Módulos disponíveis na venv do Hermes

O Python do sistema (Python313 na PATH) NÃO tem PyYAML. A venv do Hermes
(C:\Users\danda\AppData\Local\hermes\hermes-agent\venv) tem. Módulos confirmados:

- requests 2.33.0
- fastapi 0.133.1
- uvicorn 0.41.0
- pydantic 2.13.4
- urllib3 2.7.0
- yaml (PyYAML) — importável via sys.path.insert

## 3. Script de validação mínima

```python
import sys, re
sys.path.insert(0, r'C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages')
import yaml, json
from pathlib import Path

config_path = Path(r'E:\CentralDark\Pivete\config.yaml')
with config_path.open('r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

if not isinstance(config, dict):
    raise SystemExit('Config not a dict')

model = config.get('model') or {}
router = config.get('providers', {}).get('centraldark-router', {})
fallback = config.get('fallback_providers')

print('model.provider:', model.get('provider'))
print('model.default:', model.get('default'))
print('aliases.free-tier-centraldark:', model.get('aliases', {}).get('free-tier-centraldark'))
print('providers.centraldark-router.models:', router.get('models'))
print('fallback_providers:', [ {'provider': e.get('provider'), 'model': e.get('model')} for e in (fallback or []) ])
```

## 4. Cross-check obrigatório

- `model.provider` é `centraldark-router`
- `model.default` é um único modelo (ex: `nous/tencent/hy3:free`)
- `model.default` NÃO é string longa com vários `nous/...`
- `providers.centraldark-router.models` contém todos os modelos da cadeia
- `fallback_providers` é lista de dicts com provider=centraldark-router
- `hermes fallback list` mostra a cadeia

## 5. O que NÃO fazer

- Não usar regex nem replace textual cego de bloco YAML.
- Não reescrever o arquivo inteiro manualmente sem preservar a árvore de chaves.
- Não adicionar modelo à cadeia sem confirmar que o router sabe roteá-lo
  (ver `/v1/models` e POST /v1/chat/completions).
- Não declarar "pronto" antes de validar `hermes fallback list` e `hermes config show`.

## 6. Veredito desta sessão

O config.yaml foi reestruturado com sucesso:

- model.provider: centraldark-router
- model.default: nous/tencent/hy3:free
- aliases.free-tier-centraldark: nous/tencent/hy3:free
- providers.centraldark-router.models: 11 modelos (incluindo os 7 free)
- fallback_providers: 7 entradas, todas com provider=centraldark-router

O router não subiu nesta sessão — o script de boot do router ainda não foi executado com
sucesso (porta 8099 não ficou disponível antes do fim da sessão). Por isso a prova de
invocação dos 7 modelos não foi concluída; fixed point não foi atingido.

Próxima sessão que abrir esta missão deve:

1. subir o router (ex: `python E:\CentralDark\Pivete\run_router.py`)
2. confirmar `curl http://127.0.0.1:8099/health` OK
3. fazer `curl http://127.0.0.1:8099/v1/models` e confirmar os 7 free models
4. testar invocação de cada um via POST /v1/chat/completions
5. validar `hermes fallback list`
6. contrapovoar com nova sessão Hermes
