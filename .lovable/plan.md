## Objetivo

Descobrir por que o GitHub parou de disparar o webhook de deploy no dia 28/06, consertar, e deixar a pasta `docs/CONSCIENCIA/ARSENAL/hermes-vivo/` 100% espelhada entre Lovable, GitHub e VPS.

## O que sabemos agora

- **VPS travada no commit `5dfdf11f6`** (28/06). GitHub já está em `bd5cc9e68`.
- **Webhook PM2 `CentralDark-WebhookDeploy` está online** escutando `http://127.0.0.1:9300`, sem erros no log.
- **Último POST recebido do GitHub: 28/06/2026 17:47** — nada depois disso.
- Na VPS existem 4 arquivos operacionais do Hermes (`daemon.mjs`, `executor.mjs`, `notify.mjs`, `CentralDark-Hermes.config.cjs`) que nunca subiram pro GitHub (`untracked`).
- No Lovable/GitHub existem 2 arquivos (`README.md`, `plano-visual.png`) que ainda não desceram pra VPS.

## Etapa 1 — Diagnóstico do webhook GitHub (só leitura)

1. Listar webhooks configurados no repo `ServerVpss/CentralDark` (ferramenta MCP `github_list_webhooks`).
2. Ver últimos disparos de cada webhook — se estão retornando 200, 401, 502 ou "no response".
3. Confirmar se a URL pública do webhook (provavelmente `https://webhook.centralldark.com/...` via Caddy) ainda responde.

Resultado esperado: descobrir se foi (a) webhook deletado, (b) URL quebrada no Caddy, (c) GitHub desabilitou por falhas repetidas, ou (d) segredo/assinatura mudou.

## Etapa 2 — Reparo do webhook

Dependendo do achado da Etapa 1:

- **Se foi desabilitado por falhas** → reabilitar no GitHub e disparar um "redeliver" do último payload.
- **Se URL quebrou** → conferir Caddy (`infra/caddy/`) e o mapeamento do subdomínio.
- **Se webhook sumiu** → recriar apontando pra URL pública correta com o secret certo.

## Etapa 3 — Sincronização imediata (uma vez o webhook OK)

Puxar manualmente na VPS pra não esperar o próximo commit:

```bash
cd /root/CentralDark
git fetch origin main
git reset --hard origin/main
```

Isso traz o `README.md` e a `plano-visual.png` pra pasta `hermes-vivo/` da VPS. (O `reset --hard` não mexe em arquivos untracked, então os `.mjs` operacionais continuam no lugar.)

## Etapa 4 — Subir os operacionais do Hermes pra fonte da verdade

Ler os 4 arquivos untracked da VPS (`daemon.mjs`, `executor.mjs`, `notify.mjs`, `CentralDark-Hermes.config.cjs`) e commitar no GitHub via MCP. Assim eles descem automaticamente pro Lovable pelo sync bidirecional e a pasta fica idêntica nos 3 pontos.

## Etapa 5 — Validação final

Rodar `deploy_status` + `vps_list_dir_safe` na pasta `hermes-vivo/` e conferir o mesmo conjunto de arquivos nos 3 lugares (Lovable, GitHub, VPS). Postar card curto no privado admin do Telegram com o resultado (conforme regra de notificação pós-ação).

## Regras respeitadas

- Nada destrutivo na VPS além do `git reset --hard origin/main` (padrão do próprio webhook).
- `whatsapp-server` PM2 id 1 não é tocado.
- Áreas protegidas (`infra/caddy/`, `scripts/webhook/`) só serão lidas na Etapa 1; qualquer alteração ali passa por autorização "PERMITO PIVETE".

## Detalhes técnicos (para a IA que for executar)

- Repo: `ServerVpss/CentralDark`, branch `main`.
- Webhook local: porta `9300`, script em `scripts/webhook/deploy` (área protegida — só ler).
- Comando de sync padrão do próprio webhook: `git reset --hard origin/main`.
- Notificação obrigatória ao fim: card completo em `1901426549` + linha curta no canal Status `-1003669176367`, via connector Telegram já linkado (`@srver1bot`).
