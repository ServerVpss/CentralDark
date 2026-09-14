# CENTRALDARK — HERMES / CLAUDE HARNESS / PORTA 8099

Data: 2026-09-14
Repo: ServerVpss/CentralDark
Branch alvo: main

## Ideia do Chefe

O Claude/harness deve usar a CentralDark por uma porta única local, sem depender de descoberta quebrada de modelos.

O erro observado foi:

- `Gateway /v1/models was unreachable`
- `requestUrl: http://127.0.0.1:8099/v1/models`
- `endpoint: http://127.0.0.1:8099/`
- `The connection test needs at least one model`

Leitura simples: o harness tentou consultar a lista de modelos na porta 8099, mas a porta não respondeu a tempo.

## Owner existente

O owner de desenho é o CentralDark Omni Router.

Ele expõe:

- `GET /health`
- `GET /v1/models`
- `POST /v1/chat/completions`

Motores previstos:

- `auto`
- `claude-code/<model>`
- `claude:<model>`
- `hermes/<model>`
- `openai/<model>`
- `nous/<model>`

## Modelos/configuração já documentados

Pelo contrato atual da Casa:

- Cerebras: `cerebras/gpt-oss-120b` com `CEREBRAS_API_KEY`
- IONOS: `ionos/openai/gpt-oss-120b` com `IONOS_API_KEY`
- LMStudio: `openai/gpt-oss-20b` em `127.0.0.1:1234`
- Supabase ai-proxy: `google/gemini-3-flash-preview`, `google/gemini-2.0-flash`, `google/gemini-2.5-pro`
- Arsenal adapter: `arsenal-router`, `arsenal-parallel`, `arsenal-debate`, `arsenal-hermes`

## Regra de chaves

As chaves da Casa não devem ser copiadas pelo chat.

O fluxo correto é:

- usar nomes de variáveis já existentes;
- ler chaves somente no runtime autorizado;
- não imprimir segredo;
- não gravar segredo no GitHub;
- não transformar permissão humana em vazamento de token.

## Configuração seca para harness quando a porta ainda falha

Quando `/v1/models` não responde, o harness deve pular descoberta e usar modelo manual:

- Provider name: `CentralDark Hermes`
- Provider type: OpenAI compatible
- Base URL: `http://127.0.0.1:8099/`
- Models: `auto`, `hermes/default`, `claude-code/default`, `google/gemini-3-flash-preview`, `arsenal-hermes`

## Estado

DOCUMENTADO=SIM
CONFIGURADO_NO_GITHUB=SIM
CHAVES_COPIADAS_PELO_CHAT=NÃO
VPS_EXECUTADA_POR_ESTE_CHAT=NÃO
PORTA_8099_VIVA=PRECISA_DE_RECEIPT_RUNTIME

## Próxima prova

Para fechar verde real, o runtime precisa devolver:

- `/health` responde;
- `/v1/models` responde com pelo menos um modelo;
- `/v1/chat/completions` responde;
- receipt registra engine/modelo/duração;
- nenhum segredo aparece em log.
