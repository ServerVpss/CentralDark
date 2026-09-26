# NVIDIA NIM / Mistral Troubleshooting — 2026-09-03

## Contexto da Sessão
Usuário reportou erro `HTTP 404: Function '767b5b9a-3f9d-4c1d-86e8-fa861988cee7': Not found for account 'uPrWOJanfu9tBQ9HMhO9Jn0iII0pdXlKxGut5UY-J0A'` ao tentar usar `mistralai/mistral-large` via provider NVIDIA NIM (`https://integrate.api.nvidia.com/v1`).

## Diagnóstico Realizado

### Estado do Provider NVIDIA NIM
- **Endpoint**: `https://integrate.api.nvidia.com/v1`
- **Modelo testado**: `mistralai/mistral-large` (existe no catálogo)
- **NVIDIA_API_KEY no ambiente**: ❌ **VAZIA** (header `Authorization: Bearer ` ia vazio)
- **Erro real**: `HTTP 404 Function not found for account` = **API key ausente/inválida**, não modelo inexistente

### Catálogo NVIDIA NIM — Mistral Disponíveis
```bash
curl -s "https://integrate.api.nvidia.com/v1/models" | grep mistralai
```
Resultados:
- `mistralai/codestral-22b-instruct-v0.1`
- `mistralai/mistral-7b-instruct-v0.3`
- `mistralai/mistral-large`
- `mistralai/mistral-large-2-instruct`
- `mistralai/mistral-nemotron`
- `mistralai/mixtral-8x22b-v0.1`

### O que o VS Code USA para Mistral (probavelmente)
O VS Code com extensões (Continue, CodeGPT, etc.) costuma usar:
- **Ollama local** (`http://localhost:11434`) com `mistral` ou `mistral:7b`
- **LM Studio** local
- **OpenRouter** com key configurada
- **NÃO** costuma usar NVIDIA NIM direto para Mistral

### Alternativa Já Funcionando: Router 8099 + Nous
O **CentralDark Omni Router** (porta 8099) com engine `nous` já tem modelos Mistral gratuitos:
```bash
nous/mistralai/mistral-7b-instruct-v0.3
nous/mistralai/mistral-nemotron
nous/mistralai/mixtral-8x22b-v0.1
# ... outros mistralai no catálogo Nous
```

## Resolução Aplicada
**Não houve resolução final da NVIDIA_API_KEY** — usuário precisa fornecer a key ou confirmar onde está guardada.

Opções apresentadas (como caminhos, não perguntas):

| Opção | Ação | Status |
|-------|------|--------|
| **a) Configurar NVIDIA_API_KEY** | Passar key ou dizer onde está (Bitwarden, 1Password, .env, arquivo) | Requer key válida NVIDIA |
| **b) Usar Mistral via Nous (router 8099)** | `model: nous/mistralai/mistral-7b-instruct-v0.3` | Já funciona, gratuito |
| **c) Descobrir modelo do VS Code** | User diz qual modelo exato roda no VS Code (ex: `mistral:7b` Ollama) | Configurar fallback pra ele |
| **d) OpenRouter / Ollama local** | Se tiver Ollama rodando local ou recarregar OpenRouter | Depende de infra local |

## Lições para Próximas Sessões

1. **Erro 404 "Function not found for account" na NVIDIA NIM = API key ausente/inválida** — não é "modelo não existe", é autenticação. O endpoint retorna 404 bizarro quando o header `Authorization: Bearer` vai vazio.

2. **Sempre verificar `NVIDIA_API_KEY` no ambiente** antes de assumir que NVIDIA NIM está configurado — o Hermes não armazena essa key no `auth.json` automaticamente.

3. **O router 8099 (engine `nous`) já tem Mistral gratuito** — `nous/mistralai/mistral-7b-instruct-v0.3` e outros. Não precisa de NVIDIA NIM para Mistral.

4. **VS Code ≠ NVIDIA NIM** — o que roda no VS Code costuma ser Ollama/LM Studio/OpenRouter local. Não assumir que o mesmo modelo/provider funciona igual no Hermes.

5. **Testar endpoint direto com curl** antes de culpar o modelo:
   ```bash
   # Health check do modelo no catálogo
   curl -s "https://integrate.api.nvidia.com/v1/models" | grep mistralai
   
   # Testar com key (se tiver)
   curl -X POST "https://integrate.api.nvidia.com/v1/chat/completions" \
     -H "Authorization: Bearer $NVIDIA_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"mistralai/mistral-large","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
   ```

## Comandos de Diagnóstico Rápido

```bash
# Ver se NVIDIA_API_KEY existe
env | grep -i nvidia

# Ver catálogo NVIDIA
curl -s "https://integrate.api.nvidia.com/v1/models" | python3 -c "import sys,json; [print(m['id']) for m in json.load(sys.stdin)['data'] if 'mistral' in m['id'].lower()]"

# Testar router 8099 com Mistral via Nous
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"nous/mistralai/mistral-7b-instruct-v0.3","messages":[{"role":"user","content":"OK"}],"max_tokens":5}'
```

## Referências
- NVIDIA NIM API: https://integrate.api.nvidia.com/v1/models
- Hermes NVIDIA NIM Provider: https://hermes-agent.nousresearch.com/docs (provider 13 na lista `hermes model`)
- CentralDark Omni Router: `E:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`