# COMANDO - multizap-monitor-chat.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\scripts\vps\multizap-monitor-chat.sh
**SHA:** c530b91cf9e1034b
**Timestamp:** 2026-08-26T19:31:34.141395
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- PATTERN='webhook_wuzapi_in|message_fields_extracted|forwarded_to_multizap|message.received|group.updated|error|failed|"status":4[0-9]{2}|"status":5[0-9]{2}'

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# Monitor de chat em tempo real (VPS).
# Mostra ao vivo: webhook chegando da WuzAPI no Gateway, repasse pro CRM
# (multizap.dev) e erros. Filtra ruído. Sai com Ctrl+C.
#
# Uso:
#   bash multizap-monitor-chat.sh
#
# Não toca em nada — só lê logs.
set -uo pipefail

echo "=== Monitor de Chat — WuzAPI → Gateway → CRM ==="
echo "Pressione Ctrl+C para sair."
echo

# Trecho do log do Gateway que interessa pra chat:
#  - webhook_wuzapi_in       (chegou da WuzAPI)
#  - message_fields_extracted (parser conseguiu ler)
#  - forwarded_to_multizap   (enviou pro CRM)
#  - error / failed / 401 / 403 / 500
PATTERN='webhook_wuzapi_in|message_fields_extracted|forwarded_to_multizap|message.received|group.updated|error|failed|"status":4[0-9]{2}|"status":5[0-9]{2}'

pm2 logs MultiZap-Gateway --lines 30 --raw 2>&1 \
  | grep -E --line-buffered --color=always "$PATTERN"

```