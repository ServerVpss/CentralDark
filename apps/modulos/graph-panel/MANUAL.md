# Manual rápido

## Ver painel

Acesse `https://grafo.centralldark.com`.

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

## Caddy

Adicionar um bloco novo para `grafo.centralldark.com` apontando para `127.0.0.1:3030`.
