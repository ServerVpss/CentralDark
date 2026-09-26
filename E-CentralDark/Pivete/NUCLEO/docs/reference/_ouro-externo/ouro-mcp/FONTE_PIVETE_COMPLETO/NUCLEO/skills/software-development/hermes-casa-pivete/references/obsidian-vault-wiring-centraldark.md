# Obsidian vault wiring — CentralDark (Pivete, casa)

## Proven facts (02/08, R0 terminal inspection)

### 1. Onde o Obsidian guarda histórico de vaults
- Arquivo: `C:\Users\danda\AppData\Roaming\Obsidian\obsidian.json`
- Formato: `{ "vaults": { "<id>": { "path": "...", "ts": <ms>, "open": true|false } } }`
- **Armadilha**: um vault "registrado" (open:true) pode ser só um PONTEIRO — a pasta no disco
  pode não existir. Exemplo real: `C:\Users\danda\OneDrive\Documentos\Obsidian Vault`
  estava `open:true` mas NÃO existia no disco. O app lembra, o conteúdo sumiu.
- O `obsidian-app` (executável em `E:\CentralDark\obsidian-app\Obsidian.exe`) NÃO guarda
  histórico — o histórico fica só no `obsidian.json` acima.

### 2. Vault Brain real (recuperável, NÃO perdido)
- `E:\CentralDark\backups\vaults-antigos\Brain-Copia-bagunca\`
  - tem `.obsidian/` viva (app.json, workspace.json, plugins/, etc.)
  - tem `.obsidian.zip` (1.4 MB, backup)
  - tem estrutura completa: `00 - Mapa do Sistema`, `01 - Pendências`, `02 - Arquitetura`,
    `03 - MCP & Hub`, `04 - Design & Visual`, `05 - Documentação`, `06 - Decisões`,
    `07 - Reuniões & Notas`, `08 - Recursos`, `09 - Arquivo Morto`
- `E:\CentralDark\backups\vaults-antigos\Brain-vazio\` — só `.obsidian`, sem conteúdo.

### 3. Estrutura do repo `ServerVpss/CentralDark` (fonte da verdade)
- É o REPOSITÓRIO INTEIRO, não só o Brain.
- Raiz tem: `apps/`, `backups/`, `docs/`, `.agents/`, `.claude/`, `.cursor/`,
  `ecosystem.config.cjs`, `AGENTS.md`, `CLAUDE.md`, `CentralDark.code-workspace`, etc.
- Brain canônico está em `docs/BRAIN/` (2 níveis fundo).
- **`docs/BRAIN` NÃO tem `.obsidian`** → não é um vault pronto para abrir.
- O repo JÁ existe localmente em `E:\CentralDark\Pivete\CentralDark`
  (branch `feature/delta-canonico-core-20260731`, ~107 commits behind main).

## Misconception corrigido (pergunta do Pivete 02/08)
> "esse git clone ServerVpss/CentralDark em E:\CentralDark\Obsidian\Brain só iria clonar o brain?"

**NÃO.** `git clone <repo> <dir>` clona o repo INTEIRO. Se apontar Obsidian em
`E:\CentralDark\Obsidian\Brain` após esse clone, o Obsidian trata `apps/`,
`ecosystem.config.cjs`, `.agents/` etc. como notas. Bagunça. O Brain ficaria em
`E:\CentralDark\Obsidian\Brain\docs\BRAIN\` (aninhado) e sem `.obsidian`.

## Wiring preferido (R2 — precisa ordem do Pivete)
**Opção A (recomendada):** apontar o Obsidian no clone que JÁ existe.
- Vault = `E:\CentralDark\Pivete\CentralDark\docs\BRAIN`
- Criar `.obsidian` ali (R2). O `.git` fica 2 níveis acima → Obsidian Git sincroniza
  com `ServerVpss/CentralDark` (exatamente "ligar na fonte da verdade").
- Zero duplicação, zero pasta poluída, zero clone desperdiçado.

**Opção B:** sparse-checkout só do Brain (se quiser obrigatoriamente em `E:\CentralDark\Obsidian\Brain`):
```bash
git clone --sparse ServerVpss/CentralDark E:\CentralDark\Obsidian\Brain
cd E:\CentralDark\Obsidian\Brain
git sparse-checkout set docs/BRAIN
```
→ vault = `E:\CentralDark\Obsidian\Brain\docs\BRAIN` (ainda aninhado, mas só com o Brain).

## Gates
- Criar `.obsidian` / alterar estrutura de vault = **R2** (config de dir + possível gitignore).
  Perguntar antes de fazer.
- Não recriar vault do zero se o real já existe em `backups/vaults-antigos/` — Pivete disse
  "se não eu faço outro", mas na prática o vault não estava perdido.
- Nunca expor tokens do `.obsidian` (se tiver plugin de publish/git com credencial).
