# Plano — Subir Broker HUB na VPS 🚀

Frontend Lovable tá pronto, mas o destino `hub.centralldark.com` não tem serviço escutando. Precisa 3 movimentos coordenados na VPS (nada mais no Lovable).

## Diagnóstico atual

| Peça | Estado |
|---|---|
| Frontend Conectores + Login | 🟢 pronto no Lovable |
| GitHub sync | 🟢 commit feito |
| VPS pull | 🟡 2 commits atrás |
| `hub.centralldark.com` broker | 🔴 não existe |
| PM2 broker | 🔴 não tem processo |
| Supabase HUB `lyoigsqluyktoclwdaft` | 🔴 MCP sem secret pra checar |

## Ação (tudo na VPS via MCP, zero Lovable)

### 1. Forçar pull na VPS
Rodar `git pull` em `/root/CentralDark/` pra puxar os 2 commits pendentes.

### 2. Criar o broker `hub-broker`
Serviço Node/Bun mínimo em `/root/CentralDark/apps/hub-broker/` com 3 rotas:

- `POST /api/keys/store` → cifra a API key (AES-GCM com secret da VPS) e grava em `oauth_connections` do Supabase HUB
- `GET  /oauth/:provider/start` → redireciona pro OAuth do provider (Notion/GitHub/GDrive) com state assinado
- `GET  /oauth/:provider/callback` → troca code por token, cifra e salva
- `GET  /health` → `{ok:true}` pra monitoramento
- `POST /api/get-token` → devolve token decifrado pra edge function autorizada

Sobe no PM2 como `CentralDark-HubBroker` na porta interna 8790.

### 3. Rotear no Caddy
Adicionar bloco em `infra/caddy/` mapeando `hub.centralldark.com` → `localhost:8790`.

### 4. Confirmar tabelas no HUB Supabase
Checar `oauth_providers` e `oauth_connections` no `lyoigsqluyktoclwdaft` com GRANTs certos (`service_role` pro broker).

## Secrets que preciso na VPS (verificar/criar)
- `HUB_SUPABASE_URL`
- `HUB_SUPABASE_SERVICE_ROLE`
- `HUB_ENCRYPTION_KEY` (32 bytes pra AES-GCM)
- `NOTION_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`, `GDRIVE_CLIENT_ID/SECRET` (só pros OAuth reais — API keys tipo Grok/Claude não precisam)

## Fora deste plano
- Página de Login com auth real (fica pra depois — hoje o bypass `dev-pivete` cobre)
- OAuth Google no login (idem)

## Ordem de execução
1. `git pull` na VPS (via `vps_run_once_script`) — teste seco primeiro
2. Criar código do broker no repo local + commit + push (fluxo Lovable→GitHub→VPS)
3. Verificar secrets faltantes na VPS antes de subir o PM2
4. `pm2 start` + `pm2 save`
5. Reload Caddy
6. Testar `curl hub.centralldark.com/health` → deve retornar `{ok:true}`
7. Testar do frontend: clicar "Conectar Grok" e ver o toast verde

## Confirmação necessária antes de começar
Antes de eu executar, me confirma:
- (a) Pode criar o broker agora? Ou já existe um serviço parecido que só precisa ser corrigido?
- (b) O subdomínio `hub.centralldark.com` já tem DNS apontando pra VPS ou preciso pedir pra você configurar?
- (c) Os client_id/secret dos OAuth (Notion, GitHub, GDrive) já foram criados nos providers ou parto só com API keys (Grok, Claude, OpenAI, Gemini) numa v1?
