# Changelog — Atendimento WhatsApp Gateway

## 1.0.0 — 2026-05-20

- Criação inicial do pacote de deploy isolado.
- Node Gateway (Express, porta 3100) com endpoints de conexão, envio e webhook.
- Docker Compose da WuzAPI/Whatsmeow + Postgres dedicado, bind em `127.0.0.1:8081`.
- Scripts: install-docker, start/stop, status, logs, backup.
- Documentação: README_DEPLOY, README_ROLLBACK, SECURITY.
- Isolamento total: nenhuma alteração no Baileys de Recargas Brasil.
