# Localizando Vaults e Estruturas da Casa (ex: BRAIN / Obsidian Vault)

**Trigger:** CHEFE pergunta "onde está o meu vault / X que funciona na Casa?" ou similar (ex: "IDENTIFICA ONDE STA O MEU VALT QUE FUNCIONA NA CSA", "na main remoto ou em casa?").

**Método (execute first, report direto):**

1. Medir **local (casa)**:
   - Path absoluto (ex: `E:\CentralDark\Pivete\CentralDark\docs\BRAIN\`).
   - Verificar: ls, presença de `.obsidian/` (sinal de vault Obsidian), estrutura de pastas/arquivos.

2. Medir **remoto canonical (main)**:
   - `git ls-tree origin/main <caminho>` (confirma dir existe no main).
   - `git show origin/main:<caminho>/arquivo-chave.md | head -N` (ex: BRAIN.md para auto-descrição).
   - HEAD main: medir `git rev-parse origin/main`.

3. Medir deltas:
   - `git diff --stat origin/main -- <caminho>`
   - Branch atual, HEAD local, untracked/mods.

4. Reportar conciso (tabela preferida para forense):
   | Localização     | Existe? | Status                  | Detalhe |
   |-----------------|---------|-------------------------|---------|
   | Local (casa)    | Sim     | Com deltas / untracked  | path + .obsidian + estrutura (trabalho em progresso) |
   | Remoto main     | Sim     | Base canônica           | ServerVpss/CentralDark origin/main |

5. Confirmar identidade por auto-descrição no arquivo (ex: BRAIN.md: "Entrada humana do vault/Obsidian. **BRAIN é navegação derivada**, não runtime, autoridade...").

**Regras invariantes:**
- main remoto = fonte estrutural da verdade (GITHUB_CODE / CANONICO).
- Local = estado vivo atual + deltas (pode divergir por branch/pr).
- BRAIN (`docs/BRAIN/`) = vault Obsidian da Casa para navegação/mapa do cérebro (derivada, não primária).
- Sempre PATH ABSOLUTO.
- Formato: tabela + nota curta. Sem montes de texto.
- Integrar com MEDIR_AGORA, HIERARQUIA DE PRECEDÊNCIA DE REALIDADE, CASA TRUST MAP.
- Se .obsidian presente → vault Obsidian; confirmar lendo frontmatter ou BRAIN.md.

**Exemplo de execução (sessão ORQUESTRAÇÃO SOL):**
- Local: docs/BRAIN/ com .obsidian/app.json etc.
- Remoto: ls-tree confirma subdirs 00-MAPA-SISTEMA etc. no origin/main.
- Diff: mods em BRAIN.md, INDEX, novos untracked.
- Conclusão: vault existe nos dois; main = canônico; local = atual com trabalho.

**Pitfalls a evitar:**
- Não assumir só porque existe local → está no main.
- Não hardcode SHA; medir HEAD vivo.
- Não inventar; só o medido agora.
- BRAIN é derivada (navegação humana), não substitui SOUL/Git/runtime.

Referência cruzada: HIERARQUIA DE PRECEDÊNCIA DE REALIDADE, LOCALIZAÇÃO SOL, Forense multi-frente (tabela 🟢🟡🔴).