---
title: "AI CLI Runtime no CENTRALDARK-OS — estado medido"
date: 2026-09-29
status: "PARCIAL — ver lacunas"
substitui: "texto do PR #1712 (fechado; continha afirmações não provadas)"
---

# AI CLI Runtime no CENTRALDARK-OS — estado medido

Medido por SSH em `root@100.67.163.91` em 2026-09-29. Nada abaixo é afirmado sem saída de comando.

## O que existe (provado)

```text
CLIs oficiais instaladas via npm global e verificadas por --version:
  claude  2.1.284 (Claude Code)   @anthropic-ai/claude-code
  gemini  0.61.0                  @google/gemini-cli
  codex   codex-cli 0.159.0       @openai/codex

Menu de autenticação (scripts próprios):
  /opt/centraldark/ai-cli-system/init.sh
  /opt/centraldark/ai-cli-system/launcher.sh
  /usr/local/bin/ai-cli-launcher  (symlink)
  /usr/local/bin/ai-cli-runtime   (symlink)

Atalho na área de trabalho da sessão gráfica:
  /home/CENTRAKDARK-OS/Área de Trabalho/AI-CLI-Runtime.desktop
  (usuário gráfico = CENTRAKDARK-OS, uid 1000; XDG_DESKTOP_DIR medido com xdg-user-dir)

Credenciais do menu gravadas em (dono = usuário gráfico):
  /opt/centraldark/.ai-cli-config/
  /opt/centraldark/.ai-cli-state/
```

## Lacunas (não provado)

- `ant-cli`, `grabvit`, `grok`: NÃO instalados. Não há pacote oficial confirmado. O menu ainda lista essas opções e elas não funcionam.
- Clique no atalho como usuário gráfico: NÃO testado (só criado, com `chmod 755` e `metadata::trusted`).
- Fluxos de autenticação (API key, OAuth) do menu: NÃO testados de ponta a ponta.
- Latência da rota Tailscale: NÃO medida. Qualquer número citado antes era inventado.

## Correções desta sessão

Registradas em `docs/APRENDIZADOS/2026-09-26-sessao-preservacao-casa-lei-do-rastro.md` §8, linhas 12–16, e nas regras `UNIVERSAL_PROOF_LAW_ALL_ENGINES` de `AGENTS.md`.

Os binários `claude`, `gemini`, `ant-cli`, `grabvit`, `grok-cli` e `codex` que existiam antes eram scripts falsos que só imprimiam versão inventada. Foram removidos. O pacote npm `grok-cli` (terceiro, proxy Anthropic, origem desconhecida) e o pacote `openai` foram removidos.
