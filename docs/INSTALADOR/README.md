# Instalador MultiZap / clone-deck

## 🚀 Começar agora (VPS nova, do zero)

Entrou na VPS por SSH? Cola esta linha:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/segredounlock/centraldark-install/main/bootstrap.sh)
```

Ele verifica a máquina, prepara o mínimo e abre o menu do instalador. Passo a passo pra leigo: [`00-COMO-COMECAR.md`](00-COMO-COMECAR.md).

---

Documentação viva do instalador automático. Esta pasta é a **fonte única de verdade** para reconstruir o sistema do zero em qualquer VPS limpa.

## Estrutura desta pasta

| Arquivo | O que documenta |
|---|---|
| `00-COMO-COMECAR.md` | Guia passo a passo pro leigo: contratar VPS → SSH → bootstrap → menu |
| `README.md` | Este índice + visão geral |
| `01-arquitetura.md` | Componentes do sistema (apps/bot, apps/clone-deck, apps/crm, api/gateway, wuzapi, webhook, Caddy, Supabase) e como eles se conversam |
| `02-dependencias.md` | Tudo que precisa estar instalado na VPS, com versões mínimas |
| `03-portas-e-rede.md` | Mapa de portas internas, externas e rotas Caddy |
| `04-estrutura-pastas.md` | Layout obrigatório de `/root/Multizap/` e função de cada subpasta |
| `05-secrets-e-env.md` | Lista de variáveis de ambiente necessárias, onde vão e como o instalador as solicita (sem expor valor) |
| `06-banco-supabase.md` | Migrações, RLS, GRANTs, schema mínimo |
| `07-servicos-pm2.md` | Lista de processos PM2 (nome, comando, cwd, restart policy) |
| `08-webhooks-e-deploy.md` | Webhook GitHub→VPS, cron `gh-pull`, fluxo Lovable→GitHub→VPS |
| `09-validacoes-finais.md` | Checklist de testes pós-instalação (HTTP, portas, BD, bot, frontend) |
| `10-seguranca.md` | Regras invioláveis: nunca apagar sem confirmar, nunca expor secrets, etc. |
| `11-fluxo-do-installer.md` | Passo a passo de fases do `install.sh` |
| `12-historico-decisoes.md` | Log de decisões técnicas (cada mudança grande entra aqui) |
| `13-mcp.md` | Servidor MCP CentralDark (porta 9100, domínio `mcp.centralldark.com`, Caddy + PM2) |
| `14-conectar-ia-externa.md` | Como plugar ChatGPT / Claude / Cursor no MCP pra eles enxergarem a mesma consciência |
| `15-cloudflare-api.md` | Referência da API Cloudflare: formato do `cloudflare.env` e endpoints usados (caminho avançado) |
| `16-cloudflare-dns.md` | Cloudflare Connect Wizard — fluxo guiado por SSH (token → DNS → Caddy → relatório) |
| `17-dns-wildcard.md` | **Caminho oficial** — wildcard DNS (`@`, `www`, `*`) + Caddy + online-check automático |
| `18-conectar-pelo-celular.md` | **Conectar Cloudflare via QR no terminal** — `./install.sh --connect` abre sessão no `install.centralldark.com`, mostra QR e fica em long-poll |
| `19-dependencias-auto.md` | **`ensure_deps`** — instala automaticamente curl/jq/git/qrencode/dig/... antes de `--install` e `--connect`. Suporta apt/dnf/yum/apk/brew |
| `20-bootstrap-url.md` | **`curl -fsSL https://install.centralldark.com \| bash`** — entrada única; servidor devolve bootstrap + tarball auto-contido. Repo pode ficar privado |
| `21-ui-aio.md` | **Interface AutoScriptVPN-AIO** — banner vermelho, separadores ciano, lista de status, menu em 2 colunas |
| `22-menu-vps.md` | **Menu colorido da VPS (`cdmenu` / `cdstatus` / `menu`)** — estilo cabrata/autoscript, painel VPS INFO + status PM2, sem expor IP |
| `23-auto-update.md` | **Auto-update do instalador** — `install.sh` se atualiza sozinho a cada execução + flag `--update` + opção 10 no wizard |
| `30-skill-consciencia.md` | **Skill da Consciência CentralDark** — empacota regras invioláveis em formato instalável (`skil.sh` / MCP / SSH). 1 comando e qualquer IA nova fica no padrão |


## Regra de ouro

**Toda mudança no sistema (nova dependência, nova porta, novo serviço, nova variável, nova pasta) precisa de uma linha nova no arquivo correspondente desta pasta — no mesmo commit da mudança.** Se não foi documentado, o instalador vai falhar na próxima VPS limpa.

## Estado atual

- [x] Esqueleto da pasta criado
- [x] `install.sh` com fase de verificação (`--check`)
- [x] MCP CentralDark de pé em `mcp.centralldark.com` (porta 9100, PM2 `MCP-CentralDark`)
- [x] ChatGPT conectado via OAuth GitHub (provisório — OAuth próprio fica pra futuro)
- [x] Cloudflare DNS automático via API (`scripts/cloudflare/cf-sync.sh` + `--cloudflare-apply`) — qualquer conta nova só precisa do token + `cloudflare.env`
- [ ] Fase de instalação de dependências
- [ ] Fase de configuração de Caddy/PM2
- [ ] Fase de migração Supabase
- [ ] Fase de validação final (CHECKER END-TO-END — ver pendência #9)
- [ ] Modo `--restore` para migração entre VPS
- [ ] OAuth próprio CentralDark substituindo GitHub (futuro distante)

A doc é preenchida incrementalmente conforme cada peça do sistema é tocada.
