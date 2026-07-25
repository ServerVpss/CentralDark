# Cockpit — Avanço (fonte única)

Arquivo canônico: `docs/CONSCIENCIA/COCKPIT-AVANCO.json`
Consumido por: aba **AVANÇO** em `/admin/cockpit`.

Sem v1/v2/v3. Editar o JSON = painel reflete no próximo reload.

## Formato de cada item

```jsonc
{
  "id": "kebab-case-unico",
  "titulo": "Frase curta",
  "status": "feito" | "andando" | "pendente" | "bloqueado",
  "porcentagem": 0-100,
  "atualizado_em": "YYYY-MM-DD",
  "motivo_bloqueio": "só quando status = bloqueado",
  "card": {
    "antes_sha256": "…",
    "depois_sha256": "…",
    "arquivos_modificados": ["…"],
    "outros_arquivos_tocados": "…",
    "restart_executed": "sim/não + qual",
    "instalado_no_hermes": "sim/não + caminho",
    "onde": "…",
    "por_que": "problema real que resolve",
    "pra_que": "benefício concreto",
    "como_usar": "passo curto",
    "quando_usar": "cenário",
    "por_que_usar_isso": "trade-off",
    "prova": "link/commit/print/log",
    "tutorial": ["passo 1", "passo 2", "…"]
  }
}
```

Campo vazio = `"N/A"`. Nunca inventar.

## Lupa Check antes de adicionar item

1. **Zoom out** — o item pertence ao cockpit? Se não, não entra.
2. **Zoom in** — existe evidência (commit, arquivo, print, log)? Se não, `status = pendente`.
3. **Feynman** — dá pra explicar em 3 linhas leigas? Se não, volta pro rascunho.
4. **AutoLupa** — item parado > 7 dias sem mudança de `atualizado_em` → o painel destaca com selo amarelo.
