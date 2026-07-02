---
title: "INSTALAR VPS"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# Instalação dos wrappers de notificação na VPS

> Todos os comandos abaixo são executados **na VPS** (root ou sudo).
> Antes de começar, peça à Lovable a `NOTIFY_API_KEY` e a URL do projeto Supabase.

---

## 1. Criar o diretório de configuração

```bash
sudo mkdir -p /etc/centraldark
sudo chmod 700 /etc/centraldark
```

## 2. Criar o arquivo de configuração

```bash
sudo tee /etc/centraldark/notify.env >/dev/null <<'EOF'
# Endpoint da edge function (mesmo para dev/prod)
NOTIFY_URL="https://<SEU-PROJETO>.supabase.co/functions/v1/notify-telegram"
# Chave própria — NÃO é a chave da Lovable
NOTIFY_API_KEY="<COLAR_AQUI_VALOR_GERADO>"
EOF
sudo chmod 600 /etc/centraldark/notify.env
```

> `chmod 600` = só o root lê. Ninguém mais no sistema vê a chave.

## 3. Instalar o wrapper bash

Copie o arquivo `infra/notify/notify.sh` deste repo para `/usr/local/bin/notify`:

```bash
sudo cp infra/notify/notify.sh /usr/local/bin/notify
sudo chmod +x /usr/local/bin/notify
```

Teste:

```bash
notify vps sucesso "Wrapper instalado" "Notify universal pronto na VPS"
```

Você deve receber a notificação no Telegram e ver entrar no `/mega-painel`.

## 4. Instalar o módulo Python

```bash
sudo cp infra/notify/notify.py /usr/local/lib/centraldark/notify.py
```

Pra usar em qualquer script Python:

```python
import sys
sys.path.insert(0, "/usr/local/lib/centraldark")
from notify import notify

notify("elite-mapper", "sucesso", "Varredura ok", "21.3GB")
```

## 5. (Opcional) Migrar o Elite Mapper

No `telegram_notifier.py` do Elite Mapper, substitua a chamada interna
para o Telegram por:

```python
from notify import notify
notify(origem="elite-mapper", tipo="sucesso", titulo=..., mensagem=...)
```

Continua funcionando igual, mas agora aparece no histórico unificado e no Mega Painel.

## 6. (Opcional) Integrar com PM2

Edite o ecosystem do PM2 e adicione um hook de restart:

```bash
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 30
```

Para notificar em restarts/crashes, instale `pm2-server-monit` ou crie um
trigger no `pm2 startup`. Exemplo de cron de health check:

```cron
*/5 * * * * /usr/local/bin/notify vps info "health-check" "ping ok" >/dev/null 2>&1
```

Se essa notificação parar de chegar por 30 min, é sinal de queda → painel acende
o alerta automaticamente (dead-man's switch — roadmap).

## 7. Verificações finais

- [ ] `notify` responde com `{"ok":true,...}`
- [ ] Notificação aparece no Telegram
- [ ] Notificação aparece no `/mega-painel` em tempo real (sem refresh)
- [ ] `/etc/centraldark/notify.env` está com `chmod 600`
- [ ] Logs em `/var/log/centraldark/notify-pending.log` quando offline (fallback)

## Troubleshooting

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| `401 unauthorized` | chave errada ou env não carregada | confira `/etc/centraldark/notify.env` |
| `400 invalid_input` | faltou origem/titulo/mensagem | revise o comando |
| Telegram não chega | bot inativo no `telegram_bots` ou chat errado | confira `is_active=true` e `chat_id` |
| Painel não atualiza | Realtime caiu | F5 na página; conferir aba network |

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
