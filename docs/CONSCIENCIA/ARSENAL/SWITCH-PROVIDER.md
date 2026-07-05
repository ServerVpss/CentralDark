---
title: "Switch de Provider do ArsenalAdapter"
data: 2026-07-05
tags: ["arsenal", "adapter", "openrouter", "arsenal-proxy", "pm2", "switch"]
status: "ativo"
---

# 🔀 Switch de Provider do ArsenalAdapter

Ferramenta oficial pra alternar o `CentralDark-ArsenalAdapter` entre dois caminhos de LLM, **sem editar** o `ecosystem.config.cjs` (que continua sendo a fonte da verdade e o estado de boot do PM2).

## Por que existe

O `regras.json` do Arsenal Council pede modelos que hoje **não existem no Lovable AI Gateway** (via `arsenal-proxy`):

- `openai/gpt-5.4`, `openai/gpt-5.5`
- `anthropic/claude-sonnet-4-5`, `anthropic/claude-opus-4`

Pra usar esses modelos no conselho, o adapter precisa bater direto no OpenRouter. O switch permite ligar/desligar isso em 1 comando, com rollback igualmente em 1 comando, sem risco de perder o estado bom.

## Os dois modos

| Modo | `PROVIDER_BASE` | Chave |
|------|-----------------|-------|
| `proxy` (padrão) | `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/arsenal-proxy` | `arsenal-key-local-2026` |
| `openrouter` | `https://openrouter.ai/api/v1` | `OPENROUTER_KEY` (lida de `/root/CentralDark/secrets/openrouter.env`) |

O `server.mjs:42` já detecta sozinho se a URL contém `/functions/v1/` (usa exata) ou não (anexa `/chat/completions`), então nenhum código do adapter precisou mudar.

## Arquivos

- `apps/modulos/arsenal-openai-adapter/switch-provider.sh` — o script
- `apps/modulos/arsenal-openai-adapter/SWITCH-PROVIDER.md` — instruções operacionais
- `/root/CentralDark/secrets/openrouter.env` — **APENAS na VPS, fora do repo** — contém `OPENROUTER_KEY=sk-or-v1-…`

## Fluxo operacional

```bash
# Setup único (na VPS, uma vez)
mkdir -p /root/CentralDark/secrets
echo 'OPENROUTER_KEY=sk-or-v1-...' > /root/CentralDark/secrets/openrouter.env
chmod 600 /root/CentralDark/secrets/openrouter.env

cd /root/CentralDark/apps/modulos/arsenal-openai-adapter
chmod +x switch-provider.sh

# Uso
./switch-provider.sh status        # em qual modo tá
./switch-provider.sh openrouter    # liga OpenRouter direto
./switch-provider.sh proxy         # volta pra arsenal-proxy (Lovable)
```

## Rollback

Não existe "desfazer" separado — é só rodar o outro modo. E como o `ecosystem.config.cjs` continua apontando pra `arsenal-proxy`, qualquer `pm2 resurrect` / reboot sobe o adapter no modo seguro por padrão.

## Auditoria / limpeza no fim do projeto

```bash
./switch-provider.sh proxy
rm /root/CentralDark/secrets/openrouter.env
```

Sumiu do sistema. Nenhum vestígio da chave OpenRouter em código, env do PM2 salvo ou no repo.

## Decisões que ficaram registradas aqui

1. **Não alterar `ecosystem.config.cjs`** — ele é o estado consolidado, mexer nele quebraria o rollback automático de reboot.
2. **Chave OpenRouter fora do repo** — `secrets/openrouter.env` é local da VPS, com `chmod 600`.
3. **Adapter sem retry/fallback entre providers** — a troca é manual e explícita; nada de failover automático que mascare qual caminho está ativo.
4. **`arsenal-proxy` continua sendo o padrão** — modo `openrouter` é opt-in temporário enquanto o MAP da edge não é ampliado pra cobrir os modelos novos do `regras.json`.

## Ver também

- `apps/modulos/arsenal-openai-adapter/server.mjs` — auto-detecção de tipo de URL (linha 42)
- `supabase/functions/arsenal-proxy/index.ts` — MAP de modelos que ainda precisa expansão
- `docs/CONSCIENCIA/ARSENAL/regras.json` — conselho e modelos exigidos

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
