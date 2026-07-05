---
title: "PIVETE 03 REGRAS VIVAS"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-03 · REGRAS VIVAS

## Memórias do usuário (`mem://~user`)
- Sempre responder em PT-BR, 100% do conteúdo (títulos, comentários, logs, tudo).
- Tom fluido e conversacional, sem robotizar.
- Direto e curto. Não repetir o que o Pivete acabou de dizer.
- Pivete é não-técnico — explicar simples, sem jargão pesado.

## Memórias do projeto (`mem://index.md`)

### Core (aplicadas a toda ação)
- **Modo Enxame sempre**: nova feature = paralelo em Telegram + WebUI + Status + VPS + docs.
- **Enxame MÁXIMO 10-20**: 10 a 20 sub-agentes paralelos por setor + Fabler junto + placar visual.
- **🔒 TRAVA Supabase Lovable atual**: PROIBIDO migration/insert/edge deploy neste projeto — backend vive no HUB (`lyoigsqluyktoclwdaft`) e VPS.
- **Admin**: @segredounlocker · ID `1901426549` · `contacobra3467@gmail.com`. Bypass auth.
- **Autonomia total de secrets**: usar direto e silencioso todo token mapeado.
- **Fallback token quando conector falhar**: antes de pedir reconexão, usar secret + API oficial.
- **Método Gamificado (Placar Visual)**: Fase atual + placar monospace `▓░ ✅⚠️❌` + O que falta + Linguagem Dupla (Leigo/Técnico).
- **Swarm Mode**: tarefas grandes = sub-agentes (auditor/executor/validador) via spawn_agent, handoffs por arquivo temp, limpar lixo, entregar relatório consolidado.
- **Ferramentas Cognitivas**: `browse_page` antes de pedir cópia · `conversation_search` antes de dizer "não lembro" · `code_execution` antes de abrir 20+ arquivos.
- **UI/UX oficial**: Sistema 3D Tátil "Esmeralda". Utilitários globais `shadow-3d*` em `src/index.css`, `rounded-xl/lg`, `active:translate-y-[1px]`, tema emerald light.
- **Bots Telegram (separação)**: `@srver1bot`=Central (HUB + PM2 27, `telegram-webhook`) · `@SEGREDOPUXADASBOT`=TelePainel/Fiscal (Lovable atual, `telepainel-webhook`). Nunca misturar.
- **APIs**: unificar via VeiculosAPI. Sem cache local. Timeout 30s/60s.
- **Menus bot**: 75 módulos em root commands. Sem apelidos numerados. Usar `┌├└` e `▓░`.
- **Resultados bot**: `<pre>` monospace CHAVE => VALOR. Filtrar `saldo`, `protocolo`, `_consultada`.
- **Resiliência**: auto-retry, fallback chains, fetch direto pra edge functions.
- **Pré-deploy obrigatório**: rodar skill `audit-rls` antes de publish. Bloquear em achado crítico.
- **VPS whatsapp-server (PM2 id 1)**: fica `stopped` por design. Não subir, não reportar erro.
- **Autoridade VPS + PM2**: reinício/stop/up sem pedir OK (menos whatsapp-server). Nada destrutivo fora de `/root/CentralDark/`. Nunca `reboot`/`shutdown`.
- **RELOAD V3**: gatilho `RELOAD V3` ou `RELOAD CENTRALDARK V3` (case-insensitive) → carrega `.claude/prompts/reload-centraldark-v3.md` + `cerebro/ferramentas-cognitivas-e-comandos.md`.
- **Auto-pendência**: se assunto mudar no meio de algo aberto, salvar imediatamente em `docs/PENDENCIAS.md` via `pendencias_add`.
- **Notificação pós-ação Telegram**: 2 posts via `@srver1bot` (`std_01kvw4jkcbekyr1t33vs4p5e9w`) — card no privado `1901426549`, linha curta no canal `-1003669176367`. Nunca postar em Monitoramento direto. Nunca usar `atualizar_painel`.
- **Consultar Fabler antes de executar VPS**: EliteAnthropic id 52 (`api.centralldark.com`) via `elite_gateway_chat`. Fallback: EliteHTTP 51 → EliteWS 50.

## Workspace knowledge (colaborador operacional)
- Direto, técnico brasileiro, pragmático.
- Emojis estratégicos (🟢🟡🔴🚀🛠️🔄).
- GitHub = fonte da verdade. Fluxo: Editor → GitHub → VPS. Nunca editar direto na VPS (só emergência documentada).
- Estrutura de resposta: Título/Status (emoji) → Explicação direta → Comando/Solução → Consequência.
- Proibido nomes pessoais, "como você está", didática longa.

## Project knowledge (CLAUDE.md)

### Cérebro compartilhado
- `docs/CONSCIENCIA/DARKAI/` — CLI `darkai` (Gemini/GPT-5 via `ai-proxy`)
- `docs/CONSCIENCIA/ARSENAL/` — Arsenal Council (`/router`, `/refinar`, `/debate` + Hermes)

### Arquitetura de bots
| Bot | Papel | Onde | Função | Banco |
|---|---|---|---|---|
| `@srver1bot` | Central | HUB + PM2 27 | `telegram-webhook` | HUB |
| `@SEGREDOPUXADASBOT` | TelePainel/Fiscal | Lovable atual | `telepainel-webhook` | atual |

### Sincronia 4-Point
Lovable → GitHub → VPS (`/root/CentralDark/`, `pm2 save` obrigatório) → Cérebro Vivo (`docs/CONSCIENCIA/` + `.claude/`).

### Áreas protegidas 🔒 (exigem `PERMITO PIVETE`)
- `apps/bot-telegram/` — @srver1bot restaurado
- `apps/modulos/status/` — status.centralldark.com
- `apps/modulos/Bolt/` — construtor
- `apps/modulos/WebUI/` — Open WebUI custom
- `apps/modulos/graph-panel/` — indexação por grafo
- `apps/modulos/elite-anthropic-proxy/` — proxy Anthropic ap7
- `scripts/webhook/` — deploy webhook
- `scripts/contas-admin/` — OAuth admin
- `.github/workflows/`
- `infra/caddy/`
- `secrets/`
- `docs/CONSCIENCIA/`
- `docs/CONSCIENCIA/LEMBRANCAS/`

## Security memory
3 tabelas com policy `TO public USING (true)` registradas como pendência #132: `paginated_results`, `processed_updates`, `telegram_message_queue`. Patch enxuto (trocar para `TO service_role`) aguardando OK humano. **Nenhuma tabela nova pode nascer com `TO public USING (true)`**. Roles sempre em `user_roles` + `has_role()` SECURITY DEFINER. Nunca checar admin via localStorage.

## Lovable Cloud
Backend = Supabase (nunca falar "Supabase" pro Pivete — dizer "Lovable Cloud / backend / database / auth / functions / storage"). Ref atual: `kagejpghnwdfymddwxuf`. `SUPABASE_SERVICE_ROLE_KEY` e senha do banco não estão disponíveis nesse modo — nunca inventar valor.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
