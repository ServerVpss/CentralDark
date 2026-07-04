# Plano — Painel Hermes dentro do WebUI + rotas no api.centralldark.com

## O que muda em relação ao que já foi feito

Duas correções cirúrgicas, sem refazer o que já tá funcionando:

### 1. Rotas — tudo em `api.centralldark.com`
Hoje as rotas do Hermes vivem soltas no Elite HTTP Gateway (PM2 60) em caminhos tipo `/hermes/cadeia`. Isso fica, **mas passa a ser servido oficialmente pelo domínio único de API**: `https://api.centralldark.com` (mesmo host que já uso pro resto). Nada de subdomínio novo, nada de porta exposta.

Rotas finais (mesma API, só rota interna diferente):
- `GET  https://api.centralldark.com/hermes/cadeia`
- `PUT  https://api.centralldark.com/hermes/cadeia`
- `POST https://api.centralldark.com/hermes/cadeia/reverter`
- `GET  https://api.centralldark.com/hermes/cadeia/stats`

Ação técnica: conferir o bloco do Caddy que já roteia `api.centralldark.com` → Elite HTTP (porta interna do PM2 60) e garantir que `/hermes/*` cai no mesmo upstream. Se já cai (é reverse proxy genérico do host), **não mexe em nada** — só documenta. Se tiver `location` específico bloqueando, adiciono `/hermes/*` na mesma regra.

O arquivo `hermes_painel.html` standalone que criei antes **é removido** — não é mais servido pelo gateway, o painel vive no WebUI (item 2).

### 2. Painel Hermes vira card DENTRO do WebUI
Hoje o painel tá num HTML solto servido pelo gateway. Errado. O certo é card nativo no WebUI (`apps/modulos/WebUI/`), igual os outros cards que já existem lá.

O que entra no WebUI:
- **Novo card "Cadeia Hermes"** no mesmo padrão visual dos cards atuais (mesma sidebar, mesmo tema Esmeralda 3D tátil, mesmos componentes shadcn que o WebUI já usa).
- Conteúdo do card:
  - Lista dos 15 modelos + Elite fallback, reordenável (setas ⬆️⬇️ + drag no desktop).
  - Switch verde/cinza por modelo (ativo/inativo).
  - Campo de timeout (segundos) por modelo.
  - Botões **Salvar** / **Reverter última**.
  - Mini placar de win/loss (últimas 100 missões) puxado de `/hermes/cadeia/stats`.
- Toda a comunicação do card usa `fetch("https://api.centralldark.com/hermes/...")` com o mesmo token que o WebUI já envia hoje pras outras rotas de infra. Zero credencial nova.

## Ordem de execução

1. Descobrir onde ficam os cards atuais do WebUI (`apps/modulos/WebUI/`) pra encaixar o card Hermes no mesmo padrão — sem inventar layout novo.
2. Criar o card `CadeiaHermes` seguindo esse padrão + rotas HTTP.
3. Ajustar Caddy só se `/hermes/*` ainda não estiver liberado no `api.centralldark.com`.
4. Remover `hermes_painel.html` standalone e a rota `GET /hermes/painel` do gateway (não serve mais painel HTML — só JSON).
5. Testar no WebUI: reordenar, salvar, reverter, ver stats.

## O que fica intocado (já tá certo)
- `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/cadeia.json` — fonte da verdade, permanece.
- `decisor.mjs` com loader dinâmico + cache 60s + fallback — permanece.
- Endpoints JSON do gateway (`GET/PUT/POST /hermes/cadeia*`) — permanecem, só passam a ser chamados via `api.centralldark.com`.
- PM2 60 (Elite HTTP) e 66 (Hermes) — sem restart, sem mudança de env.

## Pergunta rápida antes de partir pro código
Confirma só uma coisa: o Caddy do `api.centralldark.com` já é reverse-proxy **genérico** pro Elite HTTP (repassa qualquer path), ou tem allowlist de rotas? Se souber, respondo direto; se não souber, eu inspeciono o Caddyfile na hora da execução e sigo — sem te travar.
