# Manual rápido

## Ver painel

Acesse `https://admin.centralldark.com/admin` e abra a aba `🌌 Grafo Celestial`.

## Atualizar dados

No painel, clique em `Run Lovable` para gerar um novo grafo.

Também dá para rodar direto na VPS:

```bash
cd /root/CentralDark/apps/modulos/graph-panel
python3 scripts/pipeline-lovable.py
```

## Rodar reserva graphifyy

```bash
cd /root/CentralDark/apps/modulos/graph-panel
bash scripts/pipeline-graphifyy.sh
```

## PM2

```bash
cd /root/CentralDark/apps/modulos/graph-panel
pm2 start ecosystem.config.cjs
pm2 save
```

## Exposição

Não criar subdomínio próprio. O MCP Admin autentica e projeta o serviço local `127.0.0.1:3030` pela rota `/admin/grafo/` dentro do mesmo painel.
