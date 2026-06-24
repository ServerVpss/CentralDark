
# Sistema universal de notificação + limpeza segura

Objetivo: qualquer coisa que rode no seu ecossistema (VPS, bots, IAs, crons, Lovable, Elite Mapper) notifica do mesmo jeito, fica registrado no banco e no Telegram, e a limpeza de logs roda sozinha sem risco de apagar nada sensível. **Zero dependência de Lovable** — se um dia você sair, continua funcionando igual.

---

## Peça 1 — Edge function central `notify-telegram`

Endpoint único e público, autenticado por uma chave própria sua (`NOTIFY_API_KEY`), que qualquer sistema chama com um POST simples.

**Como qualquer coisa chama:**
```bash
curl -X POST https://<seu-backend>/functions/v1/notify-telegram \
  -H "X-Notify-Key: SUA_CHAVE" \
  -d '{"origem":"elite-mapper","tipo":"sucesso","titulo":"Varredura concluída","mensagem":"21.3GB em 8.3s"}'
```

**O que ela faz:**
- Valida a chave (sua, não da Lovable)
- Salva tudo na tabela `notifications_log` (histórico permanente, pesquisável)
- Envia formatado pro canal Telegram CentralDark — Status (que já replica pro grupo automaticamente)
- Suporta níveis: `info`, `sucesso`, `aviso`, `erro`, `critico` (cada um com emoji e tratamento diferente)
- Anti-spam: agrupa notificações idênticas em janela de 60s

---

## Peça 2 — Wrapper na VPS `/usr/local/bin/notify`

Um script bash de 20 linhas que vira comando global na VPS. Aí qualquer bot, cron, ou script seu chama com 1 linha:

```bash
notify elite-mapper sucesso "Varredura concluída" "21.3GB em 8.3s"
notify backup erro "Falha no rsync" "destino sem espaço"
```

A chave fica em `/etc/centraldark/notify.env` (permissão 600, só root lê). Funciona offline-tolerante: se a edge function tiver fora, ele tenta 3 vezes e guarda em `/var/log/centraldark/notify-pending.log` pra reenviar depois.

**Bônus:** módulo Python equivalente `notify.py` pra integrar direto no Elite Mapper (substitui ou complementa o `telegram_notifier.py` atual, mantendo o mesmo padrão central).

---

## Peça 3 — Limpador automático `clean-logs`

Seguindo o mesmo padrão arquitetural do Elite Mapper (Python, modular, com classifier e reporter), mas focado em logs e temporários — não em código.

**Whitelist de pastas seguras** (só essas são tocadas):
- `/var/log/centraldark/*.log` (logs do gateway e notify)
- `/var/log/pm2/*.log`
- `/tmp/centraldark-*`
- `/root/CentralDark/revisoes/` (>15 dias, alinhado com o que o Elite Mapper já identificou)
- `/root/CentralDark/apps/*/dist/` (builds antigos)

**Blacklist invioláveis** (NUNCA toca):
- `.env`, `.ssh/`, `secrets/`, `sessions/`, `*.pem`, `*.key`
- Qualquer coisa fora da whitelist
- Arquivos modificados nas últimas 24h

**Modos de execução:**
- `--dry-run` (padrão): só lista o que apagaria, gera relatório, notifica resumo
- `--apply`: executa de verdade, exige confirmação ou flag `--yes`
- `--auto`: modo cron, só apaga o que tem mais de X dias (configurável)

**Cron:** roda toda madrugada às 03:00 em modo `--auto`, notifica resumo no Telegram via `notify`.

**Relatório:** salva em `/var/log/centraldark/clean-logs/YYYY-MM-DD.md` no mesmo formato dos relatórios do Elite Mapper.

---

## Peça 4 — Tabela `notifications_log` no banco

Histórico unificado, pesquisável pelo painel:

| campo | descrição |
|---|---|
| `id`, `created_at` | identificação |
| `origem` | quem mandou (elite-mapper, backup, gateway, lovable, etc) |
| `tipo` | info / sucesso / aviso / erro / critico |
| `titulo`, `mensagem` | conteúdo |
| `metadata` | JSON livre (stats, links, contexto) |
| `telegram_message_id` | ID da mensagem enviada (pra editar/responder depois) |
| `sent_ok` | se chegou no Telegram |

Com RLS: só admin lê pelo painel. Edge function escreve com service role.

---

## Peça 5 — Integração com o que já existe

- **Elite Mapper:** trocar o `telegram_notifier.py` interno por chamada ao `notify` central (1 linha). Continua funcionando igual, mas agora aparece no histórico unificado.
- **Gateway GPT-4o:** logs críticos do `RotatingFileHandler` disparam `notify gateway erro ...` automaticamente quando o nível for ERROR.
- **PM2:** hook de restart/crash chama `notify pm2 aviso "<processo> reiniciou"`.
- **Lovable (eu):** quando eu fizer edit/deploy/migration daqui pra frente, eu chamo o mesmo endpoint. Você vê tudo no mesmo lugar — e o dia que parar de usar Lovable, o resto continua intacto.

---

## Detalhes técnicos

**Stack:**
- Edge function: Deno + Supabase JS, autenticação por header `X-Notify-Key` (segredo gerado, não exposto)
- Wrapper VPS: bash puro + `curl` (zero dependência)
- Módulo Python: stdlib `urllib.request` (zero pip install)
- Limpador: Python 3 stdlib (igual Elite Mapper), com `pathlib` + `os.scandir`

**Segurança:**
- `NOTIFY_API_KEY` gerada via `generate_secret` (32 chars), nunca em código
- Chave da VPS em `/etc/centraldark/notify.env` com chmod 600
- Edge function rejeita tudo sem header válido (401)
- Limpador tem dupla validação: whitelist + idade mínima

**Arquivos novos:**
- `supabase/functions/notify-telegram/index.ts`
- Migration: tabela `notifications_log` + RLS + GRANT
- Pra VPS (entrego o código, você ou eu via MCP coloca lá): `/usr/local/bin/notify`, `/etc/centraldark/notify.env.example`, `clean-logs/` (estrutura tipo Elite Mapper)

---

## Ordem de execução

1. Gera `NOTIFY_API_KEY` e cria migration da `notifications_log`
2. Cria a edge function `notify-telegram` e testa com curl
3. Entrega o wrapper bash + módulo Python + instruções de instalação na VPS
4. Cria o `clean-logs` (modular, Elite Mapper-style) com whitelist segura
5. Documenta tudo em `docs/NOTIFY/README.md` no repo CentralDark

Tudo isso fica no GitHub (`ServerVpss/CentralDark`), então qualquer outra IA que ler o repo entende o sistema sem precisar de mim.
