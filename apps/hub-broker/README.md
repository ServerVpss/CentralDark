# hub-broker

Broker de conectores do CentralDark. Vive **exclusivamente na VPS**, escuta em `127.0.0.1:8790` e é publicado pelo Caddy em `https://hub.centralldark.com`.

## Papel
- Frontend (Lovable) manda `POST /api/keys/store` → broker cifra (AES-256-GCM) e grava no Supabase HUB.
- Frontend manda o usuário pra `GET /oauth/:provider/start` → broker faz o dance OAuth e volta com o token cifrado.
- Edge functions do HUB chamam `POST /api/get-token` (com `X-Internal-Token`) pra recuperar o token em claro na hora de usar.

## Rotas
| Método | Path | Quem chama | O que faz |
|---|---|---|---|
| GET | `/health` | monitor | ping + lista providers OAuth ativos |
| POST | `/api/keys/store` | frontend | grava API key cifrada |
| GET | `/oauth/:provider/start` | frontend (redirect) | inicia OAuth |
| GET | `/oauth/:provider/callback` | provider | recebe code, troca por token, cifra e grava |
| POST | `/api/get-token` | edge functions HUB | devolve token decifrado (auth interna) |
| GET | `/api/connections` | frontend | lista conexões do user (metadata) |

## Deploy
```bash
cd /root/CentralDark
git pull
cd apps/hub-broker
npm install
cp .env.example .env   # e preencher
pm2 start ecosystem.config.cjs
pm2 save
```

## Schema no HUB
Rodar `db/schema.sql` uma vez no SQL editor do projeto `lyoigsqluyktoclwdaft`.
