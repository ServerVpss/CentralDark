# Project Memory

## Core
- **Identidade**: usuário = Pivete, IA = pivete. Tony Stark é só vibe, não confundir. Detalhes: [Identidade Pivete](mem://preferences/identidade-pivete).
- **Admin**: @segredounlocker (ID: 1901426549) / contacobra3467@gmail.com. Bypasses auth checks.
- **Autonomia de secrets**: admin concedeu uso direto e silencioso de todo token/secret já mapeado — nunca pedir permissão pra usar. Detalhes: [Autonomia Secrets](mem://preferences/autonomia-absoluta-secrets).
- **Fallback token quando conector falhar**: antes de pedir reconexão, usar token direto das secrets (Lovable Cloud → VPS `/root/CentralDark/secrets/`) e chamar a API oficial. Detalhes: [Fallback Tokens](mem://preferences/fallback-tokens-secrets).
- **Método Gamificado (Placar Visual)**: toda resposta de diagnóstico/comparação/debug usa Fase atual + Placar visual monospace (▓░ + ✅⚠️❌) + O que falta + Linguagem Dupla (Leigo/Técnico). Detalhes: [Método Gamificado](mem://preferences/metodo-gamificado-placar-visual).
- **Swarm Mode**: tarefas grandes/complexas → desdobrar em sub-agentes (auditor/executor/validador) via spawn_agent, sem pedir plano; handoffs por arquivos temporários; limpar todo lixo ao final; entregar só relatório consolidado. Detalhes: [Swarm Mode](mem://preferences/swarm-mode-sub-agentes).
- **Ferramentas Cognitivas**: usar `browse_page` antes de pedir cópia de texto; `conversation_search` antes de dizer "não lembro"; `code_execution` antes de abrir 20+ arquivos. Detalhes: [Ferramentas Cognitivas](mem://architecture/ferramentas-cognitivas-ia).
- **Estrutura local Windows do Pivete**: `E:\CentralDark\` tem 5 pastas oficiais (`repo`, `obsidian-app`, `vault` [junction], `grok-tela`, `backups`). Vault vive dentro de `repo\docs\BRAIN\`. Nomes minúsculos, sem espaço. Detalhes: [Estrutura Local](mem://preferences/estrutura-local-windows-pivete).
- **UI/UX (oficial)**: Sistema 3D Tátil estilo app nativo, apelido curto **"Esmeralda"**. Utilitários globais `shadow-3d`, `shadow-3d-soft`, `shadow-3d-primary`, `shadow-3d-destructive`, `shadow-3d-pressed`, `shadow-side-right` em `src/index.css`. `rounded-xl`/`rounded-lg`, `active:translate-y-[1px]`. Tema emerald, light default.
- **Architecture**: Supabase Realtime sync, `Deno.serve` Edge Functions with expanded CORS. Progressive Web App.
- **APIs**: Unify queries under VeiculosAPI (iSeek migrated). Direct queries only—no local caching. Strict timeouts (30s/60s).
- **Bot Menus**: 75 modules in root commands (e.g., `/cpf`). No numbered aliases. Use `┌├└` and `▓░`.
- **Bot Results**: Use `<pre>` for monospace CHAVE => VALOR results. Filter admin metadata (`saldo`, `protocolo`, `_consultada`).
- **Resilience**: Auto-retry, fallback chains (`FALLBACK_CHAINS`), direct `fetch` fallback for Edge Functions.
- **Pré-Deploy Obrigatório**: Antes de qualquer publish/deploy, ou após migration/edge function nova, rodar a skill `audit-rls` automaticamente. Bloquear publish se houver achado crítico.
- **VPS — whatsapp-server**: PM2 id 1 fica `stopped` por padrão (estado desejado). Não subir automaticamente, não reportar como erro.
- **Prompt RELOAD CENTRALDARK**: versão consolidada pronta pra reuso no Claude em `.claude/prompts/reload-centraldark-v3.md`.
- **Gatilho RELOAD V3**: ao detectar `RELOAD V3` ou `RELOAD CENTRALDARK V3` (case-insensitive) na mensagem do usuário, carregar imediatamente `.claude/prompts/reload-centraldark-v3.md` + `cerebro/ferramentas-cognitivas-e-comandos.md` e operar sob esse contexto consolidado, sem pedir confirmação.
- **Auto-pendência ao cortar assunto**: se o usuário mudar de assunto ou a conversa cortar no meio de algo em aberto, salvar IMEDIATAMENTE o tópico anterior em `docs/PENDENCIAS.md` via `pendencias_add` antes de responder o novo. Detalhes: [Auto-salvar Pendência](mem://preferences/auto-salvar-pendencia-ao-cortar).
