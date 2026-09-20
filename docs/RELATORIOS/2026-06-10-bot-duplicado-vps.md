# Relatório — Bot duplicado VPS × repo (rearme da pasta oficial)

**Data:** 2026-06-10
**Setor:** apps/bot, CentralDark/apps/bot, VPS, Caddy
**Severidade:** P1 (bot.multizap.dev servindo pasta inexistente)
**Status:** Migração feita no repo, aguardando deploy na VPS

---

## Observações

1. No repo `origin/main`, existiam **duas pastas do bot divergentes**:
   - `apps/bot/` — 206 arquivos, **atualizada** (com chat ao vivo, LiveBotStatus, LiveMessagesPreview, useLiveMessages, apiBase, mockWhatsapp). Hash da tree: `739fcbad`.
   - `CentralDark/apps/bot/` — 199 arquivos, **atrasada**. Hash da tree: `3bb8529c`.
   - Diferença: 199 arquivos exclusivos em `apps/bot`, 28.875 linhas a mais.

2. Na VPS:
   - `/root/apps/bot/` — espelho de `apps/bot/`, build novo em 03:17.
   - `/root/CentralDark/apps/bot/` — **sumiu** (renomeada às 03:03 para `bot.aposentada-20260610-030613`).
   - `git status` em `/root` mostrava ~30 arquivos deletados em `CentralDark/apps/bot/*`.

3. Caddy `/etc/caddy/Caddyfile` linha 17:
   ```
   bot.multizap.dev {
       root * /root/CentralDark/apps/bot/dist
       ...
   ```
   Apontando pra pasta que não existe mais → bot.multizap.dev quebrado.

## Entorno (upstream / downstream / adjacências)

- **Upstream:** algum script às 03:03 do dia 10/06 renomeou `/root/CentralDark/apps/bot` adicionando sufixo `aposentada-AAAAMMDD-HHMMSS`. Origem não identificada (não estava em `/root/scripts/` nem em `/root/CentralDark/scripts/`). Possivelmente script ad-hoc de "consolidação" rodado manualmente.
- **Downstream:** Caddy bot.multizap.dev passou a servir pasta inexistente. Chat ao vivo, mock WhatsApp e demais features novas que existiam no repo nunca chegaram ao domínio público.
- **Adjacência:** `CentralDark-BotServer` (PM2) em `/root/CentralDark/apps/bot-server` — não afetado, é outro app (backend).
- **Temporal:** mesma janela (03:01–03:17) recebeu múltiplos pulls + build em `/root/apps/bot` — sugere que algum agente automatizado tentou "unificar" sem registrar.

## Causa raiz (5 Porquês)

1. `bot.multizap.dev` serve pasta vazia. **→ porque** Caddy aponta pra `/root/CentralDark/apps/bot/dist` que não existe.
2. Não existe. **→ porque** a pasta foi renomeada às 03:03.
3. Foi renomeada. **→ porque** um script tentou aposentar a duplicata.
4. Existe duplicata. **→ porque** o repo manteve `apps/bot` (legado) e `CentralDark/apps/bot` (estrutura nova) em paralelo sem regra.
5. Sem regra. **→ porque** nunca houve decisão registrada em `docs/CONSCIENCIA/` definindo qual é a pasta oficial do bot.

## Decisão (registrada em `docs/CONSCIENCIA/12-PASTA-OFICIAL-BOT.md`)

**Opção A escolhida pelo usuário:** `CentralDark/apps/bot/` é a pasta oficial.

Justificativas:
- Alinhamento com a estrutura nova `CentralDark/apps/` (regra inquebrável em `04-ESTRUTURA-VPS.md`).
- Caddy já aponta pra `/root/CentralDark/apps/bot/dist` — não precisa mexer no Caddy.
- `/root/apps/bot` é vestígio do legado `/root/Multizap/apps/`.

## Ações executadas (repo)

1. ✅ Conteúdo de `apps/bot/` foi copiado para `CentralDark/apps/bot/` (206 arquivos, todos os módulos novos incluídos).
2. ✅ Criado `apps/bot/DEPRECATED.md` marcando a pasta antiga como obsoleta (sem apagar ainda).
3. ✅ Criado `docs/CONSCIENCIA/12-PASTA-OFICIAL-BOT.md` com a regra permanente.
4. ✅ Atualizado `docs/PENDENCIAS.md` com a tarefa de remoção futura.
5. ✅ Atualizado `docs/CONSCIENCIA/APRENDIZADOS.md` com a lição.

## Ações pendentes (VPS — não executadas neste lote)

Estas requerem confirmação explícita do usuário antes de qualquer rm/mv:

1. ⏳ Na VPS, rodar `git checkout -- CentralDark/apps/bot/` para restaurar a pasta a partir do repo atualizado.
2. ⏳ Rodar `npm ci && npm run build` em `/root/CentralDark/apps/bot`.
3. ⏳ Validar cadeia completa: curl `https://bot.multizap.dev` com marcador de versão nova.
4. ⏳ Mover `/root/CentralDark/apps/bot.aposentada-20260610-030613` → `/root/CentralDark/quarantine/`.
5. ⏳ Mover `/root/apps/bot` → `/root/CentralDark/quarantine/` (depois de 7 dias estáveis).
6. ⏳ Remover `apps/bot/` do repo (depois de 7 dias estáveis).

## Riscos latentes

- Se a VPS rodar `npm run build` antes do pull da nova versão, vai buildar a versão antiga e o problema continua.
- Se outro script "consolidador" rodar de novo, pode renomear `CentralDark/apps/bot` novamente. **Precisa achar e desativar esse script.**
- `apps/bot` ainda existe no repo — se algum CI/workflow buildar `apps/bot` por engano, sobe versão antiga em algum outro domínio.

## Monitoramento preventivo

- Sentinela deve checar: `find /root/CentralDark/apps -maxdepth 1 -name "*.aposentada*"` — se achar, abrir issue P1.
- Sentinela deve checar: `[ -d /root/CentralDark/apps/bot ] && [ -d /root/CentralDark/apps/bot/dist ]` — se faltar, abrir issue P0 (Caddy quebrado).
- Pendência aberta em `docs/PENDENCIAS.md` para investigar e desativar o script que renomeou a pasta.

## Recomendações priorizadas

1. **P1:** Aplicar deploy na VPS (`git pull` + build em `CentralDark/apps/bot`).
2. **P1:** Validar `bot.multizap.dev` com curl + marcador.
3. **P2:** Achar e desativar o script "aposentador" misterioso.
4. **P2:** Adicionar checker preventivo no sentinela.
5. **P3:** Após 7 dias estáveis, remover `apps/bot/` do repo e mover lixo da VPS pra quarantine.
