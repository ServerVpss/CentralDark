# Auxiliary Models — API workflow

## Problema
`auxiliary.vision.provider: "main"` ou `"auto"` resolve para o modelo principal da sessão. Se o modelo não suporta imagem, `vision_analyze` retorna 400:
```
This LLM does not support image uploads
```

Config feita na Web UI (ex: `gemini-2.5-flash-image` via RouteLLM) **pode não salvar** se o gateway não recarregar o config.

## API para corrigir (Hermes Studio MCP)

### 1. Ler estado atual
Endpoint: `GET /api/hermes/config/auxiliary-models`

Retorna `tasks[]` + `auxiliary`. Ver `auxiliary.vision.provider` — `"main"` ou `"auto"` = modelo principal, provável sem visão.

### 2. Aplicar config de visão
Endpoint: `PUT /api/hermes/config/auxiliary-models`

**CRÍTICO:** O body deve incluir **TODAS as tarefas auxiliares**, não só `vision`. Enviar só `vision` retorna `{"error": "Missing auxiliary config"}`.

Fluxo:
1. Fazer GET para pegar o body completo atual.
2. Ajustar `vision` no JSON.
3. Fazer PUT com o JSON completo.

Exemplo body que funcionou (02/08):

```json
{
  "auxiliary": {
    "vision": {
      "provider": "routellm",
      "model": "gemini-2.5-flash-image",
      "timeout": 120,
      "download_timeout": 30
    },
    "web_extract": {"provider": "openrouter", "model": "inclusionai/ling-3.0-flash:free"},
    "compression": {"provider": "gemini", "model": "gemini-3.1-flash-lite"},
    "skills_hub": {"provider": "openrouter", "model": "google/gemma-4-26b-a4b-it:free"},
    "title_generation": {"provider": "openrouter", "model": "inclusionai/ling-3.0-flash:free"},
    "curator": {"provider": "openrouter", "model": "google/gemma-4-26b-a4b-it:free"}
  }
}
```

### 3. Provar
```python
vision_analyze(image_url="https://picsum.photos/300/200", question="descreva")
```
Sucesso = descrição textual. Falha = provider/modelo sem visão ou rota quebrada.

## TTS — provider hermes-studio vs edge vs openai

O Pivete usa voz **Francisca (pt-BR-FranciscaNeural)** via Edge.

| Provider | Voz | Funciona? |
|---|---|---|
| `hermes-studio` | Francisca (Edge) via Hermes | ✅ Correto |
| `edge` | Francisca direto | ✅ Funciona |
| `openai` | echo (inglês) | ❌ Não é Francisca |

**Regra:** usar `provider="hermes-studio"` para garantir Francisca. `openai` gera voz em inglês.

Config fonte: `config.yaml` L398-410:
```yaml
tts:
  provider: "hermes-studio"
  edge:
    voice: "pt-BR-FranciscaNeural"
```
