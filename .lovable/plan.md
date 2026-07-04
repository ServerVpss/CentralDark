# Plano: consertar hub.centralldark.com de vez

## O que o enxame descobriu

- **Onde tá servido:** Caddy da VPS, servindo o estático de `/root/CentralDark/apps/modulos/hub/dist/`.
- **Por que tava cru:** `dist/` fica no `.gitignore`. Quando dá `git pull` sem rodar `npm run build` depois, os `/assets/*.css` viram 404 e o site renderiza HTML pelado.
- **Estado agora:** o CSS voltou (build feito hoje 08:27 UTC, CSS retorna 200 com 23kb de Tailwind). Meu print anterior pegou o momento sem build.
- **Problema que sobrou:** o painel mostra **"Saúde do Sistema: Indisponível"** — é backend/API que o HUB tenta chamar e não responde.

## O que vou fazer (3 frentes)

### 1. Confirmar visualmente que o CSS tá OK agora
Novo screenshot de `hub.centralldark.com` pra bater o olho e confirmar (o print que tu viu antes era antigo/sem build).

### 2. Blindar contra o problema voltar
Criar/atualizar hook de deploy na VPS pra que TODO `git pull` no `apps/modulos/hub/` rode automaticamente:
```
npm install --silent && npm run build
```
Isso vai num script `/root/CentralDark/scripts/deploy-hub.sh` + gancho no webhook de deploy que já existe em `scripts/webhook/`. Zero chance do site voltar a ficar cru.

### 3. Diagnosticar o "Indisponível"
Investigar qual endpoint o Dashboard do HUB chama pra medir saúde (código em `apps/modulos/hub/src/components/dashboard/`), ver se o path tá certo no Caddy (`hub.centralldark.com/api/*` → broker/HUB Supabase), e consertar o que tiver quebrado (rota faltando, CORS, ou proxy ausente no Caddyfile).

## Ordem de execução

1. Screenshot fresh do site → confirmar CSS
2. Ler `DashboardTab.tsx` + `useMCP` pra ver qual endpoint bate "Indisponível"
3. Testar o endpoint direto na VPS pra saber se é 404, CORS, ou serviço off
4. Aplicar correção (broker/proxy/rota)
5. Criar script de auto-build pós-git-pull
6. Screenshot final com Dashboard "Operacional"

## Detalhes técnicos

- Não vou mexer no OAuthBroker (aquele plano das 3 edições cirúrgicas fica separado — só executo se tu autorizar depois)
- Não vou mexer em `apps/bot-telegram/`, `apps/modulos/status/`, `apps/modulos/Bolt/`, `apps/modulos/WebUI/` (áreas 🔒)
- Alterações no `.github/workflows/` ou `infra/caddy/` só depois de te mostrar o diff

## O que preciso de ti

Só um "vai" pra eu sair executando. Se tu quiser que eu pule alguma frente (ex: só consertar o Indisponível e deixar auto-build pra depois), me diz.
