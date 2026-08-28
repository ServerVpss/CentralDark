# bot-whatsapp — Bot de consultas no WhatsApp

**Destino na VPS:** `/root/CentralDark/apps/modulos/bot-whatsapp/`

Status: 🟡 **Só landing.** Produto ainda não implementado.

## Rota

| Rota | Página |
|---|---|
| `/whatsapp` | `LandingWhatsapp` |

## O que falta

- Integração com WuzAPI (já roda na VPS, mas isolada).
- Webhook de mensagens.
- Reaproveitar a engine de consultas do TelePainel.
- Tela de gestão de sessão / QR Code.

Quando o produto real for entrando, este módulo ganha `components/`, `hooks/` e demais pastas seguindo o mesmo padrão do TelePainel.
