# Integração Screenpipe → Omni Router → Hermes Agent

Este documento descreve como conectar o Screenpipe ao Hermes Agent através do Omni Router, mantendo a camada de roteamento (CentralDark OMNI_ROUTER) como provedor OpenAI‑compatible.

## Pré‑requisitos

- Omni Router em execução na porta 8099 (ou outra porta escolhida).
- Arquivo de configuração do Omni Router (`config.yaml` ou similar) acessível para edição.
- Hermes Agent capaz de expor uma API OpenAI‑compatible (pode ser iniciado com `hermes server --port <porta>` ou já estar em modo server).

## Passos de configuração

### 1. Habilitar o motor hermes no Omni Router

Edite a seção `engines:` do arquivo de configuração:

```yaml
engines:
  hermes:
    configured: true
    transport: openai_compatible_http
    base_url: "http://127.0.0.1:<HERMES_PORT>/v1"   # ex.: 11434
    # api_key: ""   # somente se o Hermes exigir auth
```

- Substitua `<HERMES_PORT>` pela porta onde o Hermes Agent está escutando.
- Se o Hermes Agent não exigir autenticação, deixe `api_key` vazado ou comente a linha.

### 2. Reiniciar o Omni Router

Após salvar a alteração, reinicie o processo que está ouvindo na porta do Omni Router (ex.: `python run.py` ou o serviço que você utiliza). Verifique:

```bash
curl -s http://127.0.0.1:8099/health | jq .engines.hermes
# deve retornar configured: true
```

### 3. Verificar a lista de modelos

```bash
curl -s http://127.0.0.1:8099/v1/models | jq .
# deve aparecer um item com id: "hermes/hermes" (ou "hermes/<modelo>")
```

### 4. Testar a chamada direta (opcional)

```bash
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"hermes/hermes","messages":[{"role":"user","content":"test"}],"max_tokens":5}'
```

Resposta esperada: JSON com `choices[0].message.content` contendo uma resposta do Hermes.

### 5. Configurar o Screenpipe

No Screenpipe, acesse **Settings → Providers → Add Provider** e preencha:

| Campo                 | Valor                                            |
|-----------------------|--------------------------------------------------|
| Provider ID           | `centraldark-hermes` (ou outro nome de sua escolha) |
| Provider Name         | `CentralDark Hermes`                              |
| Base URL              | `http://127.0.0.1:8099/v1`                       |
| Model Source URL      | `http://127.0.0.1:8099/v1/models`                |
| Model                 | `auto` (deixa o Omni decidir) **ou** `hermes/hermes` (força o hermes) |
| API Key               | *deixe em branco* (a menos que você tenha configurado auth no Omni Router) |

Salve e clique em **Test Connection**. Se o Omni Router estiver com o motor hermes habilitado, o teste deve retornar *success*.

### 6. Uso

A partir deste ponto, sempre que o Screenpipe precisar chamar um modelo, ele enviará a requisição para o Omni Router, que por sua vez a encaminhará ao Hermes Agent. O Screenpipe continua fornecendo captura de tela, contexto do navegador e memória de sessão, enquanto o Hermes Agent realiza o raciocínio.

## Notas de segurança

- A chave do Screenpipe (`sp-...`) **não** deve ser colocada no campo API Key do provider; ela protege apenas a ponte do Screenpipe (porta 3030).
- O Omni Router só exige autenticação se você configurar `api_key` na engine hermes; caso contrário, a comunicação é livre dentro do localhost.
- Mantenha as portas (8099 para Omni, a porta do Hermes Agent) acessíveis apenas ao localhost ou a redes confiáveis.

## Referências internas

- `references/estilo.md` – diretrizes de estilo e emojis da Casa.
- `references/telemetry-pre-respiracao.md` – procedimento de telemetria read‑only antes de qualquer ação corretiva.
- `references/lint-ignore.md` – exclusões de diretórios externos do lint.