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
  "motivo_bloqueio": "só quando status = bloqueado/pendente",
  "area": "cockpit | hub | hermes | seguranca | infra | ia",
  "severidade": "p0 | p1 | p2 | p3",
  "palavras_chave": ["busca", "por", "termo"],
  "depende_de": ["id-outro-item", "..."],
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

Campo vazio = `"N/A"`. Nunca inventar. Campos novos (`area`, `severidade`, `palavras_chave`, `depende_de`) são opcionais e retrocompatíveis.

## Busca, filtros e dependências no painel

- Busca casa em título, id, palavras_chave e nos campos `onde/por_que/pra_que` do card.
- Chips filtram por **status**, **área** e **severidade**.
- `depende_de` alimenta o mapa reverso: se A depende de B, o painel mostra `🔒 bloqueando N` em B e `⛔ travado por N` em A.

## Editor inline (sem abrir JSON na mão)

Botão **editar** em cada item abre um drawer no cockpit. Ele **não grava direto** — monta o patch JSON pronto e oferece "Copiar patch". Você cola no arquivo e commita. Zero backend novo, respeita a trava do Supabase Lovable.

## Prova automática de entrega (SHA256)

```bash
node scripts/cockpit-avanco/registrar-entrega.mjs \
  --id <item-id> \
  --files caminho/a.tsx caminho/b.css \
  [--status feito] [--pct 100] [--prova "commit abc123"] [--dry]
```

O script lê o SHA256 do arquivo em `HEAD` (antes) e do working tree (depois), preenche `card.antes_sha256`, `card.depois_sha256`, `card.arquivos_modificados` e `atualizado_em` — tudo em um único commit junto do código.

## Lupa Check antes de adicionar item

1. **Zoom out** — o item pertence ao cockpit? Se não, não entra.
2. **Zoom in** — existe evidência (commit, arquivo, print, log)? Se não, `status = pendente`.
3. **Feynman** — dá pra explicar em 3 linhas leigas? Se não, volta pro rascunho.
4. **AutoLupa** — item parado > 7 dias sem mudança de `atualizado_em` → o painel destaca com selo amarelo.
5. **Dependência** — se `depende_de` aponta pra um item não-feito, este item vira "travado por N" no painel.
