# RETOMADA — Monitoramento 24h (handoff entre sessões / contas / IAs)

> Última atualização: 2026-06-27. Se você é uma IA nova retomando isto, leia este arquivo
> inteiro ANTES de mexer em qualquer coisa.

## 🔒 TRAVA / SENHA (CRÍTICO — leia primeiro)
- Pastas PROTEGIDAS: `apps/modulos/Monitoramento24h` e `apps/modulos/hub`.
- Só pode EDITAR com a frase exata do administrador: **"Permito pivete"**.
- Trava técnica: `.claude/settings.json` (hook PreToolUse) → `.claude/hooks/trava-protecao.py`
  (bloqueia Write/Edit/Bash-destrutivo nessas pastas, salvo se existir o sentinela
  `~/.claude/permito-pivete.unlock`, criado SÓ quando o admin diz a senha; remover ao terminar).
- **NUNCA** tocar em `/root/Multizap`. `whatsapp-server` e `MultiZap-Gateway` ficam `stopped`.

## ✅ JÁ FEITO (Fase 1 e 2)
- Trava criada e testada (ativa nesta máquina).
- Segurança: `pm2 save` + backup em `/root/CentralDark/.backups/monitoramento24h-*`.
- Árvore criada em `apps/modulos/Monitoramento24h/`:
  - `agentes/{Guardiao-Notificacoes, Guardiao-Consciencia, Guardiao-Analista, _MODELO-DE-AGENTE}`
  - `nucleo/{mcp-conector, fila-aprovacoes, lib}` · `artefatos/` · `regras/guardiao_rules.yaml`
  - `scripts/{status.sh, parar-todos.sh, backup.sh}`
  - `registro-agentes.json` (permissões: ler✅ notificar✅ agir-sozinho❌)
  - `.env` (600) + `.env.example` + `.gitignore` · `LEIA-PRIMEIRO.md` + `PROTECAO.md` + `.protegido`
- Zero-downtime confirmado: PM2 seguiu 15 online de 17 (os 2 stopped são corretos).

## 🗺️ CÓDIGO VIVO (não mover sem migração validada — Fase 2b)
- Guardiao-Notificacoes = PM2 `CentralDark-TelegramBot` → `/root/CentralDark/apps/bot-telegram/bot.cjs`
- Guardiao-Consciencia  = PM2 `guardiao-consciencia` → `/root/CentralDark/infra/guardiao/guardiao.py`
- Guardiao-Analista     = PM2 `guardiao-analista` → `/root/CentralDark/infra/guardiao/analista/analista.py`

## ⏭️ PRÓXIMOS PASSOS (pendentes)
- **Fase 2b:** migrar código vivo (re-apontar PM2) com validação, zero-downtime.
- **Fase 3:** `nucleo/servidor.mjs` + `mcp-conector` (provedor-agnóstico: Claude/GPT/Grok/Mistral)
  + `fila-aprovacoes` (human-in-the-loop).
- **Fase 4:** painel "Monitoramento 24h" em `apps/modulos/hub`; servir `hub.centralldark.com`
  (Caddy: `infra/caddy/landings-centraldark.Caddyfile`). Botões: Stop Agentes, Pausar/Retomar,
  Modo Só-Leitura, Aceitar/Rejeitar, Reiniciar, Renomear, Permissões, Logs, Modo Manutenção, Plugar via MCP.
- **Fase 5:** commit/push, página no Notion, pendência de sub-módulos futuros, atualizar `painel-data.json`.

## 📌 DECISÕES JÁ TOMADAS
- Estrutura = Opção A (garagem `agentes/`).
- human-in-the-loop: agente SUGERE, admin APROVA no painel (nada destrutivo automático).
- MCP = ponto único de plug; sistema AI-agnóstico (não preso ao Claude).
- Plano completo: `/root/.claude/plans/voce-consegue-fazer-um-piped-flamingo.md`
- Idioma sempre PT-BR. Commits da sessão CLI são do usuário (sem Co-Authored-By).
