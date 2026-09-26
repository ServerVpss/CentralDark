## O que muda na minha postura

Toda vez que a edição for em algo que vive **direto na VPS** (código MCP, install-callback, scripts em `/root/...`), eu paro de pedir "quer que eu rode?" e entrego **um único comando copia-e-cola** que faz tudo em sequência:

1. `git pull` (puxa a edição que acabei de commitar do repo)
2. `npm ci` / `npm install` (se mexi em dep)
3. `npm run build`
4. `pm2 restart <serviço> --update-env`
5. `pm2 save`
6. `curl` de validação no domínio público (cadeia completa)

Tudo num bloco só, com `set -e` pra parar se quebrar.

### Formato padrão da entrega

````bash
ssh root@vmi3256920 'set -e && cd /root/CentralDark/apps/mcp && \
  git -C /root pull --ff-only && \
  npm run build && \
  pm2 restart MCP-CentralDark --update-env && pm2 save && \
  sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://mcp.centralldark.com/status'
````

Ou, se você já tá logado na VPS, a versão sem `ssh root@...` no começo.

## Onde documento isso

Crio **um arquivo novo** + atualizo **a memória central** + cito no índice:

```
docs/
└── CONSCIENCIA/
    └── 13-COMANDO-UNICO-VPS.md      ← NOVO — regra + templates por serviço
```

Conteúdo do arquivo:
- A regra ("toda edição na VPS vira 1 comando one-shot")
- Templates prontos por serviço:
  - MCP CentralDark (`/root/CentralDark/apps/mcp`)
  - install-callback (`/root/CentralDark/apps/install-callback`)
  - webhook-bot, telegram-bot, supabase-sync
- Checklist de validação pós-deploy (cadeia completa 7 passos resumida em 1 curl)
- Quando NÃO usar one-shot (Caddy, Docker, banco real → continua pedindo confirmação)

E atualizo:
- `docs/CONSCIENCIA/CONSCIENCIA.md` (índice mestre) → linha apontando pro 13
- `mem://index.md` → nova regra Core: "EDIÇÃO NA VPS = COMANDO ÚNICO"
- Novo `mem://comando-unico-vps` com os templates

## O que NÃO muda

- Permissões sensíveis (Caddy, Docker, WuzAPI, banco, secrets, `rm -rf`, domínio) continuam exigindo sua confirmação antes do comando.
- Edições que são só Lovable (frontend do CRM, etc.) continuam pelo fluxo normal de commit + sync automático — não precisam de comando manual.

## Arquivos que vou tocar quando você aprovar

1. `docs/CONSCIENCIA/13-COMANDO-UNICO-VPS.md` (novo)
2. `docs/CONSCIENCIA/CONSCIENCIA.md` (adiciona link)
3. `mem://comando-unico-vps` (novo)
4. `mem://index.md` (adiciona regra Core + referência)

Sem mexer em código de produção. Pronto pra aprovar?