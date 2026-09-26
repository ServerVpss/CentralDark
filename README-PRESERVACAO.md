# 🧊 Preservação da Casa (SEGREDO) — 2026-09-26

Cópia de segurança feita **antes de formatar o computador da Casa**, a pedido do SEGREDO/CHEFE.
Este ramo é **cofre de preservação**, não é código ativo. Nada aqui foi absorvido no `main` ainda.
A absorção do ouro nos donos existentes do `main` é o passo seguinte (sem V2, sem arquitetura paralela).

## De onde veio
| Pasta aqui | Origem na máquina |
|---|---|
| `E-CentralDark/` | pastas **não versionadas** de `E:\CentralDark` |
| `hermes-profile/` | `%LOCALAPPDATA%\hermes` (SOUL, profile, config, memórias, skills, cron, scripts, tools) |
| `C-CentralDark/` | 2 arquivos editados e não commitados de `C:\CentralDark` |
| `E-CentralDark/_staged-git/` | arquivo preparado e não commitado em `E:\CentralDark` |

Commits locais que não estavam no GitHub foram salvos no ramo `preservacao/casa-c-main-20260926`.
Todos os outros ramos locais já existiam no GitHub (conferido: 0 commits fora).

## Filtro aplicado
- Só texto (md, txt, json, yaml, html, scripts, código), até 1 MB por arquivo.
- **Removido por já estar idêntico no `main`** (mesma impressão digital git): ver `_MANIFESTO-DEDUP.tsv` (`NO_GITHUB`).
- **Removido por ser cópia repetida** dentro da própria Casa: `_MANIFESTO-DEDUP.tsv` (`DUPLICADO_DE` → aponta a cópia mantida).
- **Fora de propósito:** chaves/tokens/.env/auth, banco de conversas, caches, node_modules, worktrees, cópias inteiras do repositório (`E:\CentralDark\CentralDark`, `full`, `clean`), pasta `GARIMPO-CHEFE` (despejo cru da pasta de usuário antiga), `05-DEVEDORES-CONTATOS` (dados de terceiros).
- **Segredos redigidos:** valores trocados por `[REDIGIDO-PRESERVACAO]`; lista dos arquivos em `SEGREDOS-REDIGIDOS.tsv` (só caminho e tipo, nunca valor). Reverificado: 0 segredos restantes.

## Restaurar
`git fetch origin preservacao/casa-arquivos-20260926 && git worktree add ../casa-preservada preservacao/casa-arquivos-20260926`
