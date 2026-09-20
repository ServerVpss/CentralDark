# Organizacao Segura da VPS MultiZap

Status: regra operacional inicial.
Escopo atual: preparar estrutura e mapear `apps/bot`, sem mover CRM.

## Explicacao leiga

A VPS esta funcionando, mas tem pastas antigas e arquivos soltos. A regra agora e organizar sem quebrar producao.

Primeiro criamos a estrutura final dentro de `/root/Multizap`. Depois mapeamos o que existe. So depois movemos algo, um bloco por vez, com backup e relatorio.

## Ordem oficial

1. Preparar arvore final.
2. Mapear o `apps/bot`.
3. Consolidar QR temporario do WhatsApp.
4. Validar chat ao vivo.
5. Validar contatos.
6. Validar fotos de perfil.
7. Validar grupos.
8. So depois mapear CRM, portal e web.

## Arvore alvo

```txt
/root/Multizap/
├─ apps/
│  ├─ bot/
│  ├─ crm/
│  ├─ portal/
│  └─ web/
├─ api/
│  ├─ gateway/
│  ├─ whatsapp/
│  │  └─ qrcode/
│  ├─ webhooks/
│  └─ integrations/
├─ consciencia/
│  ├─ ia/
│  ├─ analises/
│  └─ memoria/
├─ central-notificacoes/
│  ├─ logs/
│  ├─ telegram/
│  ├─ eventos/
│  └─ filas/
├─ credenciais/
│  ├─ env/
│  └─ vault-futuro/
├─ guarda/
│  ├─ scripts/
│  ├─ status/
│  ├─ incidentes/
│  ├─ scans/
│  └─ auth/
├─ backups/
│  ├─ diarios/
│  ├─ semanais/
│  └─ manuais/
├─ deploy-hooks/
│  ├─ github/
│  ├─ post-deploy/
│  └─ rollback/
├─ quarantine/
└─ revisoes/
```

## Logs

Nao criar uma nova pasta `central-logs` como regra futura.

Cada modulo deve guardar seus logs dentro da propria area ou dentro da revisao da rodada:

```txt
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/logs/bot/
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/logs/gateway/
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/logs/whatsapp/
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/logs/pm2/
```

## QR Code WhatsApp

O QR Code e temporario.

Caminho oficial futuro na VPS:

```txt
/root/Multizap/api/whatsapp/qrcode/
├─ current.png
├─ current.txt
└─ metadata.json
```

Regras:

- QR deve ser gerado pelo Gateway/WuzAPI.
- Bot, CRM e Portal apenas consomem endpoint oficial.
- Quando conectar, apagar QR temporario.
- Quando expirar, apagar QR temporario.
- Nunca versionar QR no Git.

## O que nao fazer agora

- Nao mover CRM.
- Nao alterar Caddy sem backup.
- Nao reiniciar `pm2 restart all`.
- Nao mover WuzAPI antes de mapear volumes e docker-compose.
- Nao imprimir valores privados em relatorios.

## Scripts desta fase

```txt
scripts/vps-organizacao/001-preparar-arvore-multizap.sh
scripts/vps-organizacao/002-mapear-apps-bot.sh
```

Esses scripts sao seguros porque:

- nao movem servicos;
- nao reiniciam PM2;
- nao alteram Caddy;
- nao imprimem valores privados;
- geram relatorio em `/root/Multizap/revisoes/`.
