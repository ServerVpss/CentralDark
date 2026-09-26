---
title: "Arquitetura de Armazenamento — E: Canônico/OURO, C: Runtime/Materialização"
date: 2026-08-23
tags: ["architecture", "storage", "canonical", "runtime", "skills", "soul", "nucleo"]
status: CRYSTALLIZED
---

# Decisão: E: = Fonte Canônica (OURO), C: = Runtime/Materialização

## Princípio
> **E:\CentralDark\Pivete = OURO (persistência, canonização, aprendizado durável)**
> **C:\Users\danda\AppData\Local\hermes\... = RUNTIME (estado quente, materialização sob demanda)**

Não duplicar. Não mover o que o app espera no UserProfile. **Symlink da canônica para o runtime.**

---

## Mapeamento Completo

| Camada | Canônico (E:) | Runtime (C:/UserProfile) | Estratégia |
|--------|---------------|--------------------------|------------|
| **Skills** | `E:\CentralDark\Pivete\NUCLEO\skills\` (58 dirs) | Symlinks em `C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\` | **COPY_TO_E → SYMLINK_TO_C** |
| **SOUL.md** | `E:\CentralDark\Pivete\SOUL.md` (HERMES-CASA, 09/08) | Cópia sincronizada em `C:\Users\danda\AppData\Local\hermes\profiles\pivete\SOUL.md` | **SYNC_ON_BOOT** |
| **config.yaml** | `E:\CentralDark\Pivete\config.yaml` (glm-5.2/nous) | Runtime usa `C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml` (gpt-5.5/openai-codex) | **DIVERGÊNCIA DOCUMENTADA** |
| **NUCLEO** | `E:\CentralDark\Pivete\NUCLEO\` (decisions, learnings, patterns, failures, contracts, skills, missions, checkpoints) | — | **APENAS E:** |
| **Obsidian Vault** | `E:\CentralDark\vault\` (visão navegável) | `C:\CentralDark\.obsidian\` (config) | **SEPARADO** |
| **Kanban DB** | `E:\CentralDark\Pivete\kanban.db` (canônico) | `C:\Users\danda\AppData\Local\hermes\kanban.db` (runtime) | **DUAL** |
| **State DB** | — | `C:\Users\danda\AppData\Local\hermes\state.db` (quente, 24MB) | **APENAS RUNTIME** |
| **MCP State** | `/root/CentralDark/secrets/mcp-state.json` (VPS) | — | **VPS ONLY** |

---

## Regras de Operação

### 1. Skills — E: = Ouro, C: = Symlink
```bash
# Fluxo correto:
# 1. Nova skill / atualização → escrever em E:\CentralDark\Pivete\NUCLEO\skills\<nome>\
# 2. Runtime (C:) → symlink automático aponta para E:
# 3. Hermes carrega do C: (symlink resolve para E:)
```

**Proibido:** Escrever skill direto no C: achando que "salvou". O C: é **materialização**, não fonte.

### 2. SOUL.md — Canônico em E:, Sync no C:
- E: = versão canônica (HERMES-CASA, identidade operacional)
- C: = cópia que o runtime lê
- Sync: `cp E:SOUL.md C:SOUL.md` no boot ou quando canônica mudar

### 3. config.yaml — Divergência Intencional Documentada
| Arquivo | Modelo | Provider | Uso |
|---------|--------|----------|-----|
| `E:\CentralDark\Pivete\config.yaml` | `z-ai/glm-5.2` | `nous` | Canônico, referência |
| `C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml` | `gpt-5.5` | `openai-codex` | Runtime ativo (TUI) |

**Não forçar unificação sem decisão do CHEFE.** O runtime TUI usa config do UserProfile; a canônica no E: serve para bootstrap de novos ambientes.

### 4. NUCLEO — Apenas E:
- Decisões, aprendizados, padrões, falhas, contratos, skills (canônicas), missões, checkpoints
- **Nada no C:**. O C: não tem NUCLEO.

### 5. Obsidian — Vault em E:, Config no C:
- `E:\CentralDark\vault\` = notas cristalizadas (visão humana)
- `C:\CentralDark\.obsidian\` = config do app (workspace, plugins)
- Hermes organiza/cristaliza no vault; CHEFE consulta/navega

### 6. Kanban DB — Dual
- `E:\CentralDark\Pivete\kanban.db` = canônico (backup, auditoria)
- `C:\Users\danda\AppData\Local\hermes\kanban.db` = runtime (hermes-webui + hermes CLI)
- Sync: hermes-webui usa o do C:; backup periódico para E:

### 7. State DB — Apenas Runtime (C:)
- `C:\Users\danda\AppData\Local\hermes\state.db` (24MB, quente)
- **Nunca** mover para E:. É estado efêmero de sessões, transcript, cache.
- Backup: apenas snapshots pontuais se necessário

---

## Implementação Realizada (2026-08-23)

```bash
# 1. Skills: copiar C: → E: (canônico)
cp -r /c/Users/danda/AppData/Local/hermes/profiles/pivete/skills/* /e/CentralDark/Pivete/NUCLEO/skills/

# 2. Skills: substituir C: por symlinks para E:
for skill in /c/Users/danda/AppData/Local/hermes/profiles/pivete/skills/*; do
  name=$(basename "$skill")
  rm -rf "$skill"
  ln -s "/e/CentralDark/Pivete/NUCLEO/skills/$name" "$skill"
done

# 3. SOUL.md: sync E: → C:
cp /e/CentralDark/Pivete/SOUL.md /c/Users/danda/AppData/Local/hermes/profiles/pivete/SOUL.md

# 4. Vault Obsidian: criar em E:
mkdir -p /e/CentralDark/vault
```

---

## Verificação Pós-Implementação

| Check | Comando | Esperado |
|-------|---------|----------|
| Skills em E: | `ls /e/CentralDark/Pivete/NUCLEO/skills/ | wc -l` | 58 |
| Skills em C: são symlinks | `ls -l /c/Users/danda/AppData/Local/hermes/profiles/pivete/skills/ | grep ^l | wc -l` | 58 |
| SOUL.md sincronizado | `diff /e/CentralDark/Pivete/SOUL.md /c/Users/danda/AppData/Local/hermes/profiles/pivete/SOUL.md` | (pode divergir por versão runtime) |
| Vault existe | `ls /e/CentralDark/vault/` | (vazio, pronto) |
| Kanban DB dual | `ls /e/CentralDark/Pivete/kanban.db /c/Users/danda/AppData/Local/hermes/kanban.db` | Ambos existem |

---

## Princípios Norteadores

1. **E: = VERDADE / C: = REFLEXO** — O canônico mora no E:. O C: é projeção/runtime.
2. **SYMLINK > COPY** — Para skills, configs que o app lê direto: symlink garante atomicidade.
3. **SYNC > DRIFT** — SOUL.md, config.yaml: sync explícito no boot/change, não drift silencioso.
4. **RUNTIME NO USERPROFILE** — O que o app (Hermes, VS Code, Codex, etc.) espera no `%USERPROFILE%` fica lá. Não roubar config pra E: por estética.
5. **NO_DUPLICATE_BRAIN** — Um NUCLEO, um Vault, um Kanban canônico. Zero cérebros paralelos.

---

## Referências
- Checkpoint: `E:\CentralDark\Pivete\NUCLEO\checkpoints\2026-08-23-runtime-wiring-checkpoint.md`
- Missão: `CENTRALDARK_RUNTIME_WIRING`
- Comando mãe: `!CONTINUAR_ATÉ_FIXED_POINT`