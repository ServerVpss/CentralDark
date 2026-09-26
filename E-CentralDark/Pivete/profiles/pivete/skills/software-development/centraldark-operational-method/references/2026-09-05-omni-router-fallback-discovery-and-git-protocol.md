# Omni Router Fallback Chain Discovery + Git Protocol (2026-09-05)

## Descoberta: Omni Router Já Tem Fallback Chain Completo

**Arquivo:** `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`

### Linhas-chave:
- **Linha 32**: `DEFAULT_FALLBACK_CHAIN = "nous,hermes,google,claude-code,xai,abacus,openai"`
- **Linhas 326-333**: `candidate_routes()` monta lista de providers na ordem, pulando não configurados
- **Linha 813**: `execute_with_failover()` tenta cada provider na ordem até PASS

### Comportamento:
1. `route_model("auto")` → retorna `DEFAULT_ENGINE` (default: `"nous"`)
2. `candidate_routes("auto")` → `[("nous", ""), ("hermes", ""), ("google", ""), ("claude-code", ""), ("xai", ""), ("abacus", ""), ("openai", "")]`
3. `execute_with_failover()` itera sobre candidates, chama `call_provider()` para cada
4. Se provider configurado e chamada OK → retorna resultado
5. Se falha → tenta próximo na cadeia
6. `CENTRALDARK_AUTO_FALLBACK` default `True` (env bool)

### Implicação:
**NÃO CRIAR OUTRO FALLBACK**. O `centraldark-router` no `config.yaml` do Hermes já aponta para `:8099/v1`. O Omni Router faz o fallback internamente. Provedores livres Nous funcionam (token lido do `E:\CentralDark\Pivete\auth.json`).

---

## Cadeia de Autenticação (Atualizada 2026-09-05)

| Componente | Status | Detalhes |
|------------|--------|----------|
| **Nous token** | ✅ Dinâmico | Lido do `E:\CentralDark\Pivete\auth.json` pelo Omni Router (`centraldark_omni_router.py:146`) |
| **Omni Router** | ✅ Ativo | Porta 8099 respondendo; engine `nous` com modelos free (`inclusionai/ling-3.0-flash-sante:free` 2.9s) |
| **MCP_CENTRALDARK_TOKEN** | ⚠️ Vazio local | Definido no `ecosystem.config.cjs:72` mas vazio local — vem do VPS via `sync-mcp-password.sh` do vault `/root/CentralDark/secrets/mcp-admin.password` |
| **Hermes profile** | ✅ Config | `centraldark-router` como provider, base_url `http://127.0.0.1:8099/v1` |
| **OPENAI_API_KEY** | ❌ Falta | OpenRouter — precisa no ambiente |
| **HERMES_AUTH_TOKEN** | ❌ Falta | Se usar Hermes local |
| **Claude Code trust** | ❌ Falta | `projects["E:/CentralDark/Pivete/CentralDark"].hasTrustDialogAccepted: true` no `~/.claude.json` |

---

## Git Push Protocol (Rebase + Push)

### Fluxo validado:
```bash
# 1. Resolver conflitos (house standard)
git add <arquivo_resolvido>
git rebase --continue

# 2. Se rejeitado (remote avançou):
git pull --rebase origin main
git push origin main
```

### Pitfalls evitados:
- **Não force-push** — nunca
- **Não push direto na main suja** — sempre rebase primeiro
- **Conflito UU** → usar `git-conflict-resolve-house-standard` skill (único padrão)
- **Merge conflict** → archaeology mínima dos dois lados antes de resolver
- **Accept Both** primeiro quando compatível; limpar duplicação/ordem depois

---

## CARACOL Background + Watch HTML Protocol

### Quando usuário pedir "CARACOL RODANDO ATÉ HH:MM":
1. **Atualizar watch HTML** (`docs/BRAIN/08-ARTEFATOS-VISUAIS/CentralDark_Reconciliation_Watch.html`):
   - Banner visível: `🌀 CARACOL RODANDO EM BACKGROUND ATÉ HH:MM DD/MM/AAAA`
   - Atualizar status Omni Router para 🟢 HEALTHY se provado
   - Manter Audio Mapping com `<audio controls src="original_*.mp3">`
   - Nota: "USAR O MESMO AUDIO ORIGINAL QUANDO APERTA PLAY!"

2. **Iniciar background** (Zendrive/verifier):
   ```bash
   terminal(background=true, notify_on_complete=false) → python verifier + sleep até horário
   ```

3. **Commit imediato na main**:
   ```bash
   git add watch.html
   git commit -m "watch: atualiza status CARACOL + Omni HEALTHY"
   git pull --rebase origin main
   git push origin main
   ```

4. **Confirmar**:
   - `process poll` → rodando + PASS
   - `grep banner` no HTML
   - `git log --oneline -1 main` → commit confirmado

---

## Windows WinError 206 (Command Line Too Long)

### Sintoma:
```
HTTP 502: {"detail":"claude_cli_start:[WinError 206] O nome do arquivo ou a extensão é muito grande"}
```

### Causa:
Windows `CreateProcess` limite de linha de comando (~32KB) excedido neste workspace grande (muitos untracked em `BRAIN/docs`, paths longos `E:\CentralDark\Pivete\...`, prompts pesados).

### Mitigações validadas:
- Usar CLI pinning/tools (`hermes sessions pin`) em vez de spawn direto
- Limpar untracked antes de trabalho pesado com Claude Code
- Preferir temp files para prompts longos (env-specific)
- Distinguir "session deleted" de "spawn failed for length" em testes

---

## Hermes Desktop Session Pinning (Sessões Críticas)

### Problema:
- Sidebar desktop (Shift-click) = **apenas visual/UI** — bugs de persistência documentados (dropa após restart, estado local frágil)
- Objeto da sessão permanece vivo (message_count aumenta, searchable via `session_search`)

### Para sessões que "devem ficar fixa" (SOL Orquestradora, interface principal do CHEFE):
```bash
# CLI durável
hermes sessions pin <id-ou-prefixo>
hermes sessions pinned  # verifica
```

### Workflow de validação (padrão do usuário):
1. User pin → "PINADO!"
2. Agent responde (execute first) → **confere via tools**:
   - `session_search <id>` para liveness (message_count subindo)
   - Report: "ainda viva" + "olha o sidebar"
3. User confirma UI pin

### Pitfall:
Assumir seção PINNED do desktop = confiável/durável. **Não é**. CLI + verificação tool + double-check visual do usuário.

---

## External Front + Agent Owns Git/Repo Actions

### Padrão validado:
- **GPT/ChatGPT** = frontmeira (prepara bootstrap, governance files)
- **User** = dá permissão uma vez ("Permitir uma vez" nos conectores)
- **Agent (eu)** = toma posse: usa screenpipe para ver, compara realidade local vs remoto, roda git, decide e executa
- **User** só notifica "terminou"

### Regra:
**NUNCA** devolver "qual botão", opções ou escolha pro user. User explicitamente exige "VOC MESMO RODA E VOCE MESMO COMPARA".

---

## Screenpipe Como Visão Principal (Boot no Motor)

### Quando user disser "usa o screenpipe", "ver a tela":
1. Query imediatamente screenpipe (:3030) — health primeiro
2. Search por termos relevantes (GitHub, Permitir, .claude, Update file, bootstrap) + frames recentes
3. Auth: `screenpipe auth token` ou `SCREENPIPE_API_KEY`; se bloquear, reportar uma vez e pedir token

### Integração com fluxo:
GPT frontmeira prepara → user "Permitir uma vez" → agent query screenpipe (confirma tela real) + mede git reality (local HEAD vs remoto/main) → executa menor ação segura

### CARACOL: metadata inclui frame visual; dedupe visual; nucleus usa contexto observado

---

## Build/Test/Lint Status (2026-09-05)

| Comando | Status | Evidência |
|---------|--------|-----------|
| `npm run test` | ✅ PASS | 8/8 testes (vitest, ~39s) |
| `npm run build` | ✅ PASS | vite build 2m 4s; warnings apenas chunk size >500kB + classe Tailwind ambígua |
| `npm run lint` | ⚠️ FALHOU (esperado) | 2172 problemas em `worktrees/pr1393-porta-tokens/` e untracked — **não no core modificado** |

### Bloqueador para commit `5fee0dd55`: **Nenhum**.
- Edit apenas no HTML de reconciliação (`docs/BRAIN/.../CentralDark_Reconciliation_Watch.html`)
- Não toca código core (`src/`, `apps/`)
- HTML não é lintado pelo eslint/vite

---

## Referências Cruzadas

- `references/2026-09-05-caracol-rodando-background-9am.md` — Protocolo CARACOL background completo
- `references/2026-09-05-fable-loop-metalupa-10-frentes-crystallization.md` — Cristalização FABLE LOOP + MetaLupa
- `references/hermes-desktop-pinning-persistence.md` — Detalhes pinning desktop
- `references/emoji-enforcement-and-user-info-recovery.md` — Enforcement emojis canônicos + recuperação fatos do CHEFE