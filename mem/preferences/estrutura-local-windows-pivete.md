---
name: Estrutura Local do Pivete (Windows E:\CentralDark)
description: Como o pivete organiza a máquina local dele — pastas oficiais, convenções de nome, onde vive o vault Obsidian
type: preference
---

# Estrutura Local — `E:\CentralDark\` (Windows do Pivete)

Consolidada em 02/07/2026. Espelha a lógica do repo (Sincronia 4-Point).

```
E:\CentralDark\
├─ repo\           ← clone do GitHub CentralDark (código-fonte, docs, CLAUDE.md)
├─ obsidian-app\   ← só o Obsidian.exe + DLLs (o programa)
├─ vault\          ← JUNCTION (mklink /J) → repo\docs\BRAIN
├─ grok-tela\      ← projeto "Jarvis pessoal" (voz + ver tela) — em construção
└─ backups\        ← dumps, vaults antigos, zips
    └─ vaults-antigos\
        ├─ Brain-vazio\
        └─ Brain-Copia-bagunca\
```

## Regras

1. **Nomes minúsculos, sem espaço, sem CamelCase.** `repo`, não `BrainRepo`. `grok-tela`, não `GrokTela`.
2. **Vault vive DENTRO do repo** (`repo\docs\BRAIN\`) — assim é versionado pelo Git automaticamente. `E:\CentralDark\vault\` é só uma junction (`mklink /J`) pra abrir rápido.
3. **`obsidian-app\` só tem o programa.** Nenhum vault mora ali (senão, atualizar o Obsidian pode apagar notas).
4. **`backups\` é o único lugar aceito** pra guardar cópias, versões antigas, dumps, exports.
5. **Nunca ter mais de 1 vault ativo.** O vault oficial é `repo\docs\BRAIN\`. Qualquer outro é backup ou lixo.

## Comando pra recriar a junction (se sumir)

```cmd
E: && cd \CentralDark && mklink /J vault repo\docs\BRAIN
```
Precisa CMD como Administrador.

## Futuro (`grok-tela\`)

Vai virar assistente estilo Jarvis — voz + captura de tela + orquestração das IAs (Claude/Gemini/GPT via `darkai`). Hoje é só esqueleto (`cache\`, `config\`, `logs\`, `scripts\`).
