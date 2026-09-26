# Monitores MultiZap

Três ferramentas pra acompanhar o sistema sem mexer em nada. Todas só **leem**.

## 1. Chat em tempo real (VPS)
Mostra ao vivo o webhook chegando da WuzAPI no Gateway e o repasse pro CRM.
Bom pra ver se a mensagem entrou quando alguém manda no WhatsApp.

```bash
bash /root/Multizap-repo/scripts/vps/multizap-monitor-chat.sh
```

O que aparece colorido: `webhook_wuzapi_in`, `message_fields_extracted`,
`forwarded_to_multizap`, `message.received`, `error/failed`, status 4xx/5xx.

## 2. Saúde geral (VPS)
Tela que atualiza sozinha a cada 10s mostrando OK/FALHA de:
PM2 Gateway, Docker WuzAPI, `/health` do Gateway, WuzAPI local, site
público (multizap.dev) e webhook do CRM.

```bash
bash /root/Multizap-repo/scripts/vps/multizap-monitor-health.sh
# intervalo customizado:
INTERVAL=5 bash /root/Multizap-repo/scripts/vps/multizap-monitor-health.sh
```

## 3. Realtime no navegador (CRM)
Mostra no Console do navegador toda mensagem que o Supabase Realtime
entrega pro `/app/chat`. Serve pra confirmar que o chat está recebendo
mesmo com conversa fechada.

Passos:
1. Abrir `https://multizap.dev/app/chat` (logado).
2. Apertar `F12` → aba **Console**.
3. Copiar e colar o conteúdo de `scripts/vps/multizap-monitor-realtime-browser.js`.
4. Mandar mensagem pelo WhatsApp e ver as linhas `[msg INSERT]` aparecerem.
5. Pra parar: `__mzMonitor.stop()`.

## Rollback
Nada pra reverter — todos são scripts de leitura.
