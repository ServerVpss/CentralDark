# WuzAPI | Contrato de API e rotas operacionais (Casa / MultiZap / Hermes)

**Owner documental:** `docs/MAPA_EVENTOS_WUZAPI.md` + Skill-Mãe `.agents/skills/centraldark-operational-method/SKILL.md`.
**Atualizado:** 2026-11-05. **Status:** referência operacional de rotas; não é validação funcional de todos os endpoints.
**Origem do inventário:** catálogo Swagger/OAS exibido pelo CHEFE ("WUZAPI 3.0.0", `spec.yml`), confrontado com a WuzAPI da Casa em Docker. Não presumir que o número exibido no Swagger seja a versão do binário instalado.
**Runtime verificado na Casa:** `GET http://127.0.0.1:8081/health` = HTTP 200, versão informada `1.0.9`, `total_users=0`, `connected_users=0` no checkpoint; confirmar novamente somente quando importar. A rota `/spec.yml` isolada retornou 404; o Swagger/UI abriu em `/api`.

## Abrir a interface na Casa Windows

- **Admin:** http://127.0.0.1:8081/dashboard
- **Swagger da WuzAPI:** http://127.0.0.1:8081/api
- **Cliente:** http://127.0.0.1:8081/client/
- **Saúde:** http://127.0.0.1:8081/health
- **Login/pairing:** http://127.0.0.1:8081/login (conferir UI e autenticação antes de operar).
- Docker: `multizap-gateway-wuzapi-1`, imagem `asternic/wuzapi:latest`, porta do host **127.0.0.1:8081 → container :8080**; Postgres `multizap-gateway-postgreswuzapi-1` separado. Dentro da rede Docker usar porta de container, não assumir que `localhost:8081` funciona de qualquer máquina.
- Documentação upstream de referência: `asternic/wuzapi` no GitHub, Swagger exibido pela instância local. A disponibilidade específica depende da build em execução.

## Autenticação e proteção

- Rotas **normais**: cabeçalho `token` com **token do usuário** válido no banco WuzAPI.
- Rotas **/admin/**: cabeçalho `Authorization` com token administrativo `WUZAPI_ADMIN_TOKEN` definido no ambiente do serviço.
- **Nunca** colar tokens, arquivos `.env`, códigos QR ou conteúdo privado de mensagens nos recibos, commits ou chats; usar apenas marcadores de presença. `GET /health` não prova login, QR, encaminhamento nem entrega.
- **Não criar usuários, desconectar/logout, excluir, mudar configuração de webhook ou enviar mensagens** durante inventário/leitura sem intenção específica e controle de escopo.
- Identificadores: destinos aceitam números internacionais, `@s.whatsapp.net`, `@lid`, `@g.us` conforme endpoint. Preservar o JID completo em grupos; não converter LID desconhecido em telefone. Sucesso HTTP de envio ≠ confirmação de entrega.

## Endpoints catalogados (método e caminho)

**Sistema e administração**
- `GET /health`.
- `GET/POST /admin/users`; `GET/DELETE /admin/users/{id}`; `DELETE /admin/users/{id}/full` (destrutivo: também logout/limpeza).
- `GET/POST /admin/proxy-pool`; `PUT/DELETE /admin/proxy-pool/{id}`; `POST /admin/users/{id}/proxy-pool/release`.

**Sessão/QR e configuração do usuário**
- `GET /session/qr`, `GET /session/status`; `POST /session/connect`, `/session/disconnect`, `/session/logout`, `/session/pairphone`, `/session/proxy`, `/session/history`, `/session/hmac/config`; `GET /session/status`, `/session/qr`, `/session/passkey-status`, `/session/s3/config`, `/session/history`, `/session/hmac/config`.
- `POST /session/passkey-response`, `/session/passkey-confirm`, `/session/s3/config`, `/session/s3/test`; `DELETE /session/s3/config`, `/session/hmac/config`.

**Webhook da própria WuzAPI**
- `GET /webhook` (consultar), `POST /webhook` (definir), `PUT /webhook` (atualizar), `DELETE /webhook` (apagar).
- Antes de gravar, conferir URL e segredo do destino, dono da sessão, possível duplicação e efeito sobre usuários existentes.

**Mensagens e conversas**
- `GET /chat/conversations`, `GET /chat/messages`, `GET /chat/history`.
- `POST /chat/send/text`, `/chat/send/voice`, `/chat/send/edit`, `/chat/send/image`, `/chat/send/audio`, `/chat/send/document`, `/chat/send/template`, `/chat/send/video`, `/chat/send/sticker`, `/chat/send/location`, `/chat/send/contact`, `/chat/send/buttons`, `/chat/send/carousel`, `/chat/send/list`, `/chat/send/poll`.
- `POST /chat/delete`, `/chat/markread`, `/chat/react`, `/chat/request-unavailable-message`, `/chat/downloadimage`, `/chat/downloadsticker`, `/chat/downloadvideo`, `/chat/downloaddocument`, `/chat/downloadaudio`, `/chat/presence`, `/chat/markplayed`, `/chat/star`, `/chat/pinchat`, `/chat/mute`, `/chat/unread`, `/chat/poll/vote`.

**Usuários, presença e estado**
- `POST /user/info`, `/user/check`, `/user/presence`, `/user/avatar`, `/user/block`, `/user/unblock`, `/user/privacy`, `/user/business-profile`.
- `GET /user/contacts`, `/user/blocklist`, `/user/lid/{phone}`, `/user/privacy`.
- `POST /status/set/text`, `POST /call/reject`.

**Grupos**
- `GET /group/list`, `/group/invitelink`, `/group/info`, `/group/requestparticipants`.
- `POST /group/create`, `/group/locked`, `/group/memberaddmode`, `/group/ephemeral`, `/group/photo`, `/group/photo/remove`, `/group/leave`, `/group/name`, `/group/topic`, `/group/announce`, `/group/join`, `/group/inviteinfo`, `/group/updateparticipants`, `/group/updaterequestparticipants`, `/group/joinapprovalmode`.
- **Ponto para Hermes:** `POST /group/photo` muda a foto de um grupo; `POST /group/photo/remove` remove. O Gateway MultiZap possui rota para *consultar* foto do grupo, o que **não equivale** a possuir endpoint para alterá-la. Conferir implementação e permissões antes de adicionar o menor delta.

**Etiquetas e newsletters**
- `POST /labels/edit`, `/labels/chat`, `/labels/message`.
- `GET /newsletter/list`; `POST /newsletter/join`, `/newsletter/leave`, `/newsletter/mute`.

## Não confundir os três webhooks (fluxo operacional real)

1. **WuzAPI no Docker Casa** disponibiliza `/webhook` para configurar o encaminhamento de eventos dessa instância. **Não** é o endpoint receptor do MultiZap.
2. **MultiZap Gateway AkyronHost** recebe `POST /webhooks/wuzapi?connection_id=...`, autentica a origem e encaminha ao CRM. Gateway público: https://multizap-mvp.centralldark.com ; saúde `/health`, confirmada HTTP 200 após correção do 503 em 2026-11-05. Não presumir que o Docker da Casa e a instância da AkyronHost compartilham usuários ou sessões.
3. **CRM Lovable** recebe `POST /api/public/wuzapi/webhook` com cabeçalho `x-gateway-secret` (não compartilhar o valor). A rota também aceita GET de diagnóstico. A URL de produção para o **encaminhamento do Gateway** é https://multizap-mvp.centralldark.com/api/public/wuzapi/webhook, roteada pelo **mesmo Cloudflare Tunnel**, especificamente nesse path, para `https://atendimentoo.lovable.app`. A regra geral do Tunnel continua enviando demais caminhos para o Gateway AkyronHost `:4088`. Confirmado GET HTTP 200; **POST com mensagem real não foi validado**.
4. **Hermes** é consumidor/orquestrador a integrar por contrato autenticado; não há comprovação de integração Hermes ↔ Gateway WhatsApp neste checkpoint. Reutilizar a sessão existente; não duplicar motor ou pareamento.

## Regra rápida para o operador

**Intenção → identificar ambiente/porta → consultar este catálogo → conferir autenticação → leitura/diagnóstico → menor delta → teste proporcional → receipt.**
Use o **Swagger vivo** para esquemas JSON, parâmetros e códigos de erro; este índice não substitui especificações de payload. Não publicar segredos, não criar sessão por mera inspeção e não assumir `HTTP 200` de `/health` como entrega WhatsApp.

Relacionados: [Mapa de eventos](MAPA_EVENTOS_WUZAPI.md), Skill Mãe `../.agents/skills/centraldark-operational-method/SKILL.md`, código do `multizap-gateway-deploy/gateway`, `src/routes/api/public/wuzapi.webhook.ts`.

**PROMPT_SELF_CACHE_P15:** APLICÁVEL sem HIT medido. **KV_CACHE_P16:** UNKNOWN. **NEXT_CURSOR:** integração Hermes ↔ MultiZap com mensagem de teste real, somente sob intenção operacional específica. **FIXED_POINT:** documentação WuzAPI disponível e referenciada, após readback.

## Fontes oficiais obrigatórias e método de comparação (05/11/2026)

**Fonte de verdade upstream:** [WuzAPI, asternic/wuzapi](https://github.com/asternic/wuzapi) é a implementação REST multiusuário/multidispositivo; [whatsmeow, tulir/whatsmeow](https://github.com/tulir/whatsmeow) é a biblioteca Go que implementa o protocolo WhatsApp multidevice utilizada pela WuzAPI. Repositórios verificados pelo conector GitHub em 2026-11-05, ambos `main` e não arquivados. Referências das leituras: README WuzAPI blob `d7e31b13e127142f6e2c2e2c51232cb0f85e64ee`, README whatsmeow blob `4eaa56bfac1d7790def523a6e0be5887bbd3d5e4` (esses SHAs são dos **arquivos**, não necessariamente HEAD dos repositórios).

**Método cristalizado:** `INTENÇÃO → guia operacional local + Swagger vivo → WuzAPI upstream (endpoint/payload/evento) → whatsmeow upstream (comportamento de protocolo/JID/estado) → comparar versão e código da Casa + Gateway AkyronHost → diferença mínima → validação proporcional → receipt e NEXT_CURSOR`. Consultar diretamente os donos quando surgir dúvida, comportamento divergente, nova função ou regressão; **não copiar upstream cegamente**, não misturar biblioteca Go com API REST, não concluir suporte local só porque existe no GitHub. Preservar owners, configurações, sessões e escrita única. Registrar referência de commit/release realmente examinada em cada comparação futura.

**Interface comprovada nas capturas do CHEFE:** `http://127.0.0.1:8081/dashboard` mostra `Instances Management` e `Proxy Pool`; na captura aparecia `No instances found`, que só prova aquele instante. O formulário `Add Instance` inclui `Instance name`, `Token` obrigatório (token do usuário), `Webhook URL`, `Events` obrigatório, `Message History`, `History requested on pairing (days)`, opções de `Proxy`, `S3 Storage` e `HMAC Key` com `Submit`. O formulário `Add Proxy` pede `Label`, `Proxy URL`, `Max devices` e `Enabled`; **não** inserir proxy sem necessidade operacional demonstrada. As capturas não comprovam envio nem conexão WhatsApp.

**HMAC e webhooks:** o README oficial da WuzAPI documenta o cabeçalho `x-hmac-signature` com assinatura HMAC-SHA256 quando HMAC está configurado. A verificação depende do corpo recebido e `Content-Type`; para `application/json`, usar **bytes JSON originais** antes de interpretar/reformatar. Validar se o receptor Gateway/CRM já implementa a verificação antes de exigir ou girar chaves, e nunca revelar a chave mostrada mascarada no painel. Segredos e tokens não entram nos receipts.

**Portas e versões:** Swagger apresentado na conversa com título `WUZAPI 3.0.0 / OAS3` não substitui a versão runtime reportada pela Casa (`GET /health` informou `version=1.0.9` no checkpoint de 05/11). `http://127.0.0.1:8081/spec.yml` sozinho retornou HTTP 404; usar a interface Swagger `/api` e conferir a URL real que ela carrega. Separar `API disponível`, `sessão pareada` e `mensagem entregue`.

**PROMPT_SELF_CACHE_P15:** APLICÁVEL, sem HIT medido. **KV_CACHE_P16:** UNKNOWN. **NEXT_CURSOR:** para qualquer dúvida WuzAPI/whatsmeow, comparar upstream com código/versão instalada antes de propor mudança; não executar alteração por mera consulta.

## Gateway MultiZap local na Casa: checkpoint de teste (05/11/2026)

- **Intenção:** concentrar Gateway + WuzAPI + Postgres no **mesmo Docker da Casa**, preservando a sessão já pareada e o Gateway AkyronHost até a migração ser comprovada.
- **Fonte reaproveitada:** `F:\CentralDark\tmp\multizap-source-staging-20261104\multizap-gateway-deploy\gateway`, checkout `1dd1002`; nenhuma cópia paralela do projeto.
- **Build local:** `multizap-gateway-deploy/gateway/Dockerfile.gateway-local`; serviço adicional `gateway-local` definido em `multizap-gateway-deploy/wuzapi/docker-compose.gateway-local.yml`. O compose base da WuzAPI **não foi alterado**.
- **Nome do novo container:** `multizap-gateway-gateway-local-1`, imagem `centraldark/multizap-gateway-local:staging`, entrada somente em `http://127.0.0.1:4089` (porta `4088` dentro do container). Não exposto via Cloudflare.
- **Rede interna validada:** `gateway-local → http://wuzapi:8080/health` retornou HTTP 200; WuzAPI `http://127.0.0.1:8081/health` HTTP 200 com um usuário e uma sessão conectados.
- **Gateway staging:** `GET http://127.0.0.1:4089/health` = HTTP 200, `urls_ok=true`, **`parity_ok=false` por falta do caminho de `.env` esperado no servidor hospedado**. O health não significa credenciais ou mensagens funcionando.
- **Isolamento:** tokens de Gateway/WuzAPI deixados vazios intencionalmente no serviço de teste; `MULTIZAP_WEBHOOK_URL` vazio, **sem encaminhar eventos**; watchdog definido para o próximo dia (86.400.000 ms). O armazenamento de conexões locais é um volume Docker separado; não foi copiado o estado do Gateway AkyronHost.
- **Ciclo de reprodução:** dentro de `multizap-gateway-deploy/wuzapi`, executar `docker compose -f docker-compose.yml -f docker-compose.gateway-local.yml config --quiet` e `docker compose -f docker-compose.yml -f docker-compose.gateway-local.yml build gateway-local`. Para iniciar **somente** o serviço novo: `docker compose -f docker-compose.yml -f docker-compose.gateway-local.yml up -d --no-deps --no-build gateway-local`.
- **Dependência externa pendente:** no checkpoint, `https://multizap-mvp.centralldark.com/health` retornava **530 (Cloudflare 1033)**, com `cloudflared.exe` ausente dos processos Windows. O tunnel antigo apontava a AkyronHost e o webhook do Lovable; não foi alterado nem reiniciado. O erro de encaminhamento HTTP 403 anterior ainda não foi resolvido.
- **NEXT_CURSOR:** reconciliar dados/segredos do Gateway hospedado com a cópia local e confirmar envio + recebimento real sem perder a sessão; somente após isso considerar alteração do túnel e retirada da AkyronHost. Jan/Gemma e `centraldark-haiku` ficam fora deste escopo.
- **Controle:** `UNKNOWN ≠ PASS`; a migração de produção **não** foi concluída. Nenhuma sessão, secret, túnel ou serviço já funcionando foi alterado; `trinity-*` permanece fora do escopo.
