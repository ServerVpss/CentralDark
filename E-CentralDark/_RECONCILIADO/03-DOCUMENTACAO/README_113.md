# WhatsApp Gateway

Camada de integração do `apps/bot-server` com o WhatsApp usado no projeto.

## Estado atual

Base de contratos criada. Ainda não está ligada em PM2, Docker, WuzAPI real ou sessões.

## Referências

- **WuzAPI / asternic**: fonte principal prática dos endpoints reais do projeto.
- **whatsmeow / tulir**: motor conceitual por baixo, usado para entender eventos e limites do WhatsApp multi-device.
- **WazAPI.net**: referência visual e de organização de API/documentação, não fonte principal de implementação.

## Escopo da fase

- Health/status sanitizado da instância.
- Chats e mensagens.
- Contatos e perfil/avatar.
- Grupos e participantes.
- Webhooks recebidos.
- HMAC/assinatura antes de processar webhook.

## Bloqueios de segurança

Não fazer nesta fase sem confirmação explícita:

- resetar WhatsApp;
- logout;
- apagar sessão;
- ler ou expor arquivos de sessão;
- reiniciar Docker/WuzAPI;
- alterar `.env` real;
- mexer em CRM, Caddy ou banco real.
