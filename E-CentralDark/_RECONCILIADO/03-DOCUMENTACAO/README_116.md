# WuzAPI Atendimento (Docker)

Instância **isolada** da WuzAPI/Whatsmeow para o CRM Atendimento.

- **Não compartilha** banco, volume ou rede com o Baileys de Recargas Brasil.
- Exposta somente em `127.0.0.1:8081` (loopback). O Node Gateway (porta 3100) é quem fala com ela.
- Banco Postgres dedicado: `wuzapi_atendimento`.

## Subir

```bash
cp .env.example .env
nano .env             # troque TODOS os tokens/senhas
docker compose up -d
docker ps
```

## Logs

```bash
docker logs -f wuzapi-atendimento
docker logs -f postgres-wuzapi-atendimento
```

## Parar (sem afetar Recargas Brasil)

```bash
docker compose down
```

## Nginx (opcional)

Veja `nginx.conf.example` se quiser expor publicamente — **não recomendado**.
O fluxo correto é Node Gateway → WuzAPI local.
