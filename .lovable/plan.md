# Diagnóstico consolidado (3 agentes + investigação .env)

Os 3 sintomas não têm a mesma raiz. São **2 problemas distintos**, e o do MCP é independente. Resumo do que cada agente trouxe:

## O que está acontecendo

**1) Divergência VPS ↔ GitHub na `main`** — é só o arquivo `apps/projeto-dashboard/painel-data.json`. Três escritores diferentes mexem nele direto na `main` sem coordenar:

```text
   painel-auto-update.yml  ─┐
   sentinela-divergencias.yml ─┼─► commitam painel-data.json na main
   VPS (atualizar-painel-vivo.mjs) ─┘
```

Quando dois disparam perto, o último a tentar push leva "non-fast-forward". Hoje a VPS está 1 commit atrás de `origin/main` (commit `305d626` do bot está no GitHub, VPS ainda em `05e6d5c`).

**2) Zentinel-health com `pm2 restart all`** — script vive só na VPS (não está no Git). Roda a cada 45s, e se latência do chatgpt.com passa de 15s, reinicia **todos os 15 processos PM2** de uma vez (gateway, MCP, bots Telegram/WhatsApp, CRM, monitor…). Justo no momento em que o ChatGPT está lento — que é quando o gateway precisa estar de pé, não caindo.

**3) MCP em `/root/CentralDark/apps/mcp` lendo `.env` errado** — problema separado, não causa os outros dois. O painel-data.json não é escrito pelo MCP, é escrito pelo `atualizar-painel-vivo.mjs`. (O 4º agente ainda está investigando o caminho exato do `.env`, mas o provável é `/root/CentralDark/.env` com `load_dotenv()` não sendo chamado no server real da VPS.)

---

## Plano de ação (ordem importa)

### Etapa 1 — Resolver a divergência agora (1 comando, seguro)

Na VPS, descartar o commit local pendente de `painel-data.json` (é o único arquivo divergente e é regerado automaticamente):

```bash
cd /root/CentralDark
git fetch origin main
git reset --hard origin/main
```

**Por que é seguro:** confirmado pelo agente 1 que o único arquivo divergente é `painel-data.json`, e ele é reescrito pelo próprio script da VPS no próximo ciclo. Não perde código.

### Etapa 2 — Eliminar a causa raiz da race condition

Editar `.github/workflows/sentinela-divergencias.yml` para **remover o segundo push** (o que reescreve `painel-data.json`). O `painel-auto-update.yml` já cobre esse arquivo — não precisa o sentinela mexer também.

Trecho a remover/ajustar (linhas 54–65 do workflow, step "Atualizar Mega Painel"): tirar o `git commit + git push` do `painel-data.json`, deixar só o snapshot do sentinela.

### Etapa 3 — Adicionar `git pull --rebase` no script da VPS (cinto de segurança)

No `apps/projeto-dashboard/atualizar-painel-vivo.mjs` (ou no wrapper que chama ele na VPS), antes do `git commit`:

```bash
git pull --rebase -X theirs origin main
```

Assim mesmo que algum outro bot tenha pushado antes, a VPS rebaseia limpo e não dá conflito.

### Etapa 4 — Proteger o zentinel-health (trocar `pm2 restart all`)

Como o script não está no Git, isso é mudança direta na VPS. Trocar:

```js
// antes
exec('pm2 restart all')
// depois
exec('pm2 restart elite-http-gateway')
```

Opcional (recomendado): adicionar cooldown de 5 minutos pra não entrar em loop:

```js
const COOLDOWN_MS = 5 * 60_000
let lastRestart = 0
if (latency > 15_000 && Date.now() - lastRestart > COOLDOWN_MS) {
  exec('pm2 restart elite-http-gateway')
  lastRestart = Date.now()
}
```

E depois `pm2 save` pra persistir.

### Etapa 5 — Ajustar `.env` do MCP (depois que o 4º agente confirmar o caminho)

Provável correção: garantir que o `server.py` real do MCP na VPS chame:

```python
from dotenv import load_dotenv
load_dotenv("/root/CentralDark/.env")  # caminho absoluto, não relativo
```

E no `ecosystem.config.js` do PM2 do MCP, fixar `cwd: "/root/CentralDark"`. Sem isso, o MCP roda com defaults hardcoded.

---

## O que **não** vou tocar

- Não vou rodar `git reset --hard` sem teu OK explícito (é destrutivo).
- Não vou editar o workflow do sentinela sem teu OK.
- Não vou mexer no zentinel-health (script vive só na VPS — precisa SSH/run-once).
- Não vou alterar nada do MCP até o 4º agente voltar com o caminho exato do `.env`.

## Detalhes técnicos

- Repo afetado: `ServerVpss/CentralDark`, branch `main`.
- Arquivos no escopo: `.github/workflows/sentinela-divergencias.yml`, `apps/projeto-dashboard/atualizar-painel-vivo.mjs`, e (na VPS) o script do `zentinel-health` + `ecosystem.config.js` do MCP.
- Backup antes de qualquer escrita: snapshot dos arquivos via `vps_read_file_safe` + cópia em `/root/CentralDark/revisoes/`.
- Validação pós-mudança: `vps_git_status` limpo, `pm2 status` com todos os processos `online`, `deploy_status` retornando OK.

---

## Pergunta de aprovação

Posso seguir nessa ordem (1 → 5)? Ou prefere que eu execute só a Etapa 1 primeiro (resolver a divergência hoje) e a gente decide as outras depois com calma?
