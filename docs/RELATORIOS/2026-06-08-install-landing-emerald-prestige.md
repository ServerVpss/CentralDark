# Relatório — Redesign Emerald Prestige no `install.centralldark.com`

**Data:** 2026-06-08 BRT
**Tarefa:** Trocar o visual neon antigo da landing/docs do instalador por estilo SaaS empresarial.
**Status final:** ✅ no ar e validado ponta a ponta.

## Pedido do usuário

> "melhoer ss pagina para mi esat muito neon e nada profissional quero estilo sass emprsa organizaçao em primeiro luga pois ai e uma docmetaçao area d isntalaçaO!"

Escolhas confirmadas pelo usuário:
- **Paleta:** Emerald Prestige (verde escuro com creme + dourado)
- **Tipografia:** livre (escolhido **Space Grotesk** display + **Inter** body + **JetBrains Mono** code)
- **Layout:** Dashboard com seções

## O que foi feito

- Reescrito o `pageDocsShell()` em `CentralDark/apps/install-callback/server.js` (linhas ~929–1310).
- Removido o CSS legado `centraldark-landing-command-v2` (neon).
- Tokens novos: `--bg:#07120d`, superfícies creme, bordas esmeralda sutis, accent dourado `#c9a84c`.
- Fontes carregadas via Google Fonts (`Space Grotesk` + `Inter` + `JetBrains Mono`).
- Layout dashboard: appbar fixa com logo "C" gradiente, labels dourados em uppercase, hero grande, cards com hover sutil, hero de comando com botão "Copiar", grid de modos, lista de endpoints, grid de docs, toast e footer.

## Validação da cadeia completa (7/7)

1. ✅ Commit no repo: HEAD `59fdafc` em `main` (server.js no commit `ec9921a`).
2. ✅ Git HEAD na VPS bate (`/root` em `59fdafc`).
3. ✅ PM2 `Install-Callback` online após restart (uptime 3s, 2 restarts totais).
4. ✅ `ss -tlnp` confirma `node` em `127.0.0.1:9200`.
5. ✅ `curl http://127.0.0.1:9200/docs` retorna HTTP 200 com marcadores `Emerald Prestige` e `Space Grotesk`.
6. ✅ Caddy ativo apontando `install.centralldark.com → 127.0.0.1:9200` (`CentralDark/infra/caddy/install.Caddyfile`).
7. ✅ `curl https://install.centralldark.com/docs` retorna HTTP 200 com os mesmos marcadores da versão nova.

## Achado importante (virou aprendizado #34 e pendência)

PM2 `Install-Callback` tinha **43h de uptime e 0 restarts** após o pull do redesign — o Node.js continuava com o `server.js` antigo carregado em memória. O `post-deploy.sh` atual **não reinicia** esse serviço quando há mudança nas fontes do `install-callback`. Restart explícito (`pm2 restart Install-Callback --update-env`) foi necessário pra propagar o redesign.

→ Registrado em `docs/CONSCIENCIA/APRENDIZADOS.md` como item **#34**.
→ Pendência aberta em `docs/PENDENCIAS.md` (Alta) pra ensinar o `post-deploy.sh` a reiniciar o `Install-Callback` automaticamente.

## Arquivos alterados

- `CentralDark/apps/install-callback/server.js` — reescrita do `pageDocsShell()`.
- `docs/CONSCIENCIA/APRENDIZADOS.md` — item #34.
- `docs/PENDENCIAS.md` — pendência nova (Alta).
- `docs/RELATORIOS/2026-06-08-install-landing-emerald-prestige.md` — este arquivo.

## Comandos de validação reais usados

```bash
ssh-vps "pm2 restart Install-Callback --update-env"
curl -sS -H 'Accept: text/html' http://127.0.0.1:9200/docs \
  | grep -oE 'Emerald Prestige|Space Grotesk'
curl -sS -H 'Accept: text/html' https://install.centralldark.com/docs \
  | grep -oE 'Emerald Prestige|Space Grotesk'
```

Saída final: `Emerald Prestige` e `Space Grotesk` confirmados nas duas pontas.
