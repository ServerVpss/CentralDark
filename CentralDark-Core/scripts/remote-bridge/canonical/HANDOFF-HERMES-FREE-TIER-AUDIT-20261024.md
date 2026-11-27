# HANDOFF FILHA 03 — Inventário Provedores Free Tier Hermes
**Tarefa:** t_b4b70da6 (FILHA 03 de MAE t_911e17ff)  
**Data:** 2026-10-25 ~01:23  
**Escopo:** Leitura hermes model/fallback/config (sanitizado) + validação nativa  
**Status:** CONCLUSÃO INICIAL — dados reais capturados

---

## 📋 Inventário Capturado

### Fallback Providers
- **Estado:** Nenhum provider fallback configurado
- **Comando nativo:** `hermes fallback list` → "No fallback providers configured"
- **Próximo passo:** Adicionar com `hermes fallback add`

### Profiles Hermes (via `hermes profile list`)
| Profile | Model | Gateway | Alias | Distribution |
|---------|-------|---------|-------|--------------|
| ◆default | model | running | — | — |
| hermes-vmware | gpt-5.6-luna-900k | running | hermes-vmware | — |

**Observação:** Timeout no comando após linha 2 (limite de output); recolhido parcialmente. Profile `hermes-vmware` com modelo interno Nous Research (não free tier público).

### Custom Providers (via config.yaml, linhas 385–392)
```yaml
custom_providers:
  - name: Reads-bottle-fees-tcp.trycloudflare.com
    base_url: https://reads-bottle-fees-tcp.trycloudflare.com/v1
    key_env: HERMES_CUSTOM_READS_BOTTLE_FEES_TCP_TRYCLOUDFLARE_COM_API_KEY
    model: hf.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF:Q4_K_M
    api_mode: chat_completions
    models:
      hf.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF:Q4_K_M: {}
    models_discovered: true
```

**Classificação:**
- **Provedor:** Cloudflare Tunnel (trycloudflare.com) — túnel gratuito
- **Modelo:** HuggingFace GGUF (Qwen 3.8B Uncensored) — open-source, livre para uso local
- **Free-tier Status:** ✓ Ambos livres; túnel requer auth (key_env), modelo sem custo
- **Testado:** Não confirmado nesta sessão (verificação de conectividade seria necessária)

### MCP Servers (Conectores)
Selecionados free-tier:
- **Linear** (enabled: true) — OAuth integrado
- **Notion** (enabled: true) — OAuth integrado
- **Supabase** (enabled: true) — OAuth integrado
- **Cloudflare** (enabled: true) — OAuth integrado, ~340 ferramentas (excludes aplicadas)
- **AWS-Knowledge** (enabled: true) — Knowledge base pública AWS

**Não free-tier:**
- **Figma** (OAuth, paid API)
- **Hugging Face** (disabled, paid compute)
- **Vercel** (disabled, paid infrastructure)

---

## 📊 Contrato de Dados (Filhas 04 + 05)

### Campos Normalizados

```json
{
  "fallback_providers": {
    "status": "unconfigured",
    "count": 0,
    "available_command": "hermes fallback add",
    "native_check": "hermes fallback list"
  },
  "profiles": [
    {
      "name": "default",
      "model": "model",
      "gateway_status": "running",
      "free_tier": null,
      "tested": false
    },
    {
      "name": "hermes-vmware",
      "model": "gpt-5.6-luna-900k",
      "gateway_status": "running",
      "free_tier": false,
      "tested": false,
      "provider": "nous_research_internal"
    }
  ],
  "custom_providers": [
    {
      "name": "Reads-bottle-fees-tcp.trycloudflare.com",
      "base_url": "https://reads-bottle-fees-tcp.trycloudflare.com/v1",
      "model": "hf.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF:Q4_K_M",
      "free_tier": true,
      "tested": false,
      "auth": "api_key (env)",
      "api_mode": "chat_completions"
    }
  ],
  "mcp_free_tier": [
    {
      "name": "Linear",
      "enabled": true,
      "free_tier": true,
      "auth_type": "oauth"
    },
    {
      "name": "Notion",
      "enabled": true,
      "free_tier": true,
      "auth_type": "oauth"
    },
    {
      "name": "Supabase",
      "enabled": true,
      "free_tier": true,
      "auth_type": "oauth"
    },
    {
      "name": "Cloudflare",
      "enabled": true,
      "free_tier": true,
      "auth_type": "oauth"
    },
    {
      "name": "AWS-Knowledge",
      "enabled": true,
      "free_tier": true,
      "auth_type": "none"
    }
  ]
}
```

---

## 🔄 Causalidade Falhas / Retries

| Falha | Causa | Retry Strategy | Próximo |
|-------|-------|-----------------|---------|
| Fallback não configurado | init gap — nenhum fallback adicionado | Criar com `hermes fallback add` | Testar após configuração |
| Custom provider: conexão timeout | Cloudflare tunnel pode estar offline | Poll com retry exponencial (2s, 4s, 8s) | health check antes de usar |
| MCP OAuth falha | Token expirado ou não autorizado | Refresh via `manage_connections` | Retry uma vez |
| Modelo HF timeout | Taxa rate-limited ou indisponibilidade | Aguardar 60s, depois retry | Fallback para outro modelo |

---

## ✅ Próximos Passos (Filhas 04 + 05)

1. **FILHA 04:** Testar conectividade real — health checks em cada provider (HF GGUF, Cloudflare tunnel, MCP OAuth)
2. **FILHA 05:** Definir retry policies e circuit-breaker para cada free-tier provider
3. **Integração:** Atualizar `hermes fallback` config com dados de prova; vincular à MAE t_911e17ff

---

## 📎 Referências
- Arquivo config: `C:\Users\Administrador\AppData\Local\hermes\config.yaml` (linhas 385–392, 290–362)
- Comando nativo: `hermes fallback list` (saída: "No fallback providers configured")
- Comando nativo: `hermes profile list` (timeout após ~2s)

---

**Escrito por:** default worker t_b4b70da6  
**Sem exposição:** tokens, secrets, senhas não inclusos  
**Sem modificação:** config, skill, UI intactos  
**Prova:** leitura de arquivo YAML + comando terminal  
