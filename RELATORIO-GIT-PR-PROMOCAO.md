# Relatório de auditoria — setor Git/PR/Promoção, CentralDark

Contexto: repositório local em `K:\` (branch de trabalho `fix/cockpitshell-jsx`); remoto `origin` = `ServerVpss/CentralDark`.
Fonte de verdade: `git log origin/main` (commits de squash-merge com cabeçalhos de promoção Casa) + branches locais `pr-*` + `git status/branch` de `main` vs `origin/main`.

## Resumo dos critérios

| Critério | Status |
|---|---|
| (1) Todo PR autorizado (label PERMITO-SEGREDO / Authorization: SEGREDO_CHEFE) tem receipt válido + ponto fixo aprovado antes do merge | ATENDIDO para os 13 PRs da Casa processados localmente |
| (2) main remota == local após merge | NÃO ATENDIDO — branches divergentes |
| (3) Não há PR mergado sem prova | ATENDIDO para os PRs da Casa (todos com prova); auto-PRs antigos do bot não têm estrutura de prova Casa (não são PRs autorizados da Casa) |
| (4) Não há PR refutado sem motivo exato | ATENDIDO de forma vazia — nenhum PR refutado registrado localmente (sem branches/commits de recusa) |

## Mapa de PRs processados (branches `pr-*` locais)

### Merged com prova — 13 PRs (todos com `Validated-Head` igual à ponta do branch local `pr-*`, `Casa-Verified-Receipt-SHA256` presente, `Authorization: SEGREDO_CHEFE`, `Squash-Fixed-Point: PROVED_IN_SCOPE`)

| PR | Branch local (tip) | SHA do squash em origin/main | Receipt SHA256 | Assunto |
|---|---|---|---|---|
| #1912 | `pr-1912` = `21f0549b26` | `616e90aa00` (tip de origin/main) | `a0ca2e805a...` | RECONCILIAÇÃO W-SKILLS → MAIN |
| #1914 | `pr-1914` = `c19135faa3` | `47ae046014` | `ef33cb3fb4...` | FEAT(AIONUI): cockpit como página inicial |
| #1915 | `pr-1915` = `557a1bc91a` | `172d40f158` | `cef299d5cf...` | FIX(INSTINTO): verify-hud-zone |
| #1922 | `pr-1922` = `bac2bd179a` | `87386b82ac` | `4e7b8ad46f...` | CONSCIÊNCIA: recibo e next_cursor JEA |
| #1923 | `pr-1923` = `16b5597ea3` | `650123967f` | `7531ecf84d...` | DOCS(API): catalogar /gateway, /hub, /webhook |
| #1927 | `pr-1927` = `850e7f6018` | `9c9a6cc4e6` | `c1096885f9...` | FEAT(RECEIPTS): addressable presence/absence |
| #1930 | `pr-1930` = `9bd957c822` | `e6bb6e1b11` | `ee49130d26...` | FIX(VALIDATE): bootstrap de horário + badges |
| #1932 | `pr-1932` = `e02aabc61c` | `8757352e7c` | `1362ecd418...` | docs: GitHub-first sem runner |
| #1933 | `pr-1933` = `f985712ae6` | `a22a981e28` | `7b51020c17...` | fix(mcp): execute_command somente-leitura |
| #1935 | `pr-1935` = `24d8b6f36c` | `46bdd9bc6e` | `177451fc94...` | Auto PR: michelin-gate master loop |
| #1938 | `pr-1938` = `a504198e8f` | `61f9618d2c` | `2961bbcf98...` | feat(locale-pt-br): tradução pt-BR |
| #1939 | `pr-1939` = `c2a757d8dd` | `435dc09941` | `fd71b9351b...` | Auto PR: meta-lupa evidence-first |
| #1940 | `pr-1940` = `cbe47ae8ca` | `a39f82d31b` | `f99b8f4400...` | COSTURA: proveniência de intenção |

Verificação feita: `Validated-Head` de cada squash em `origin/main` bate exatamente com o tip SHA do branch `pr-<N>` local (prefixo de 7+ caracteres confere). Prova presente **antes/ao merge** nos cabeçalhos dos commits de origin/main.

### Pendentes — não mesclados, não refutados (6 branches locais, nenhuma menção em qualquer commit de origin/main)

| PR | Branch local (tip) | Assunto |
|---|---|---|
| #1911 | `e6aee49a7b` | Merge branch 'main' into fix/mcp-pairing-vscode-corpo-unico-20261022 |
| #1916 | `8d04a8f023` | fix(cockpit): religa sininho + abaInicial Painel Admin |
| #1920 | `6f2e7b4eff` | docs/aprendizado-220-terminal-visível-20261022 |
| #1921 | `33d004e235` | feat/harness-casa-jea-registro |
| #1926 | `65a25cea31` | docs/gabarito-endereço-ausência-presença-20261023 |
| #1931 | `819f75d206` | test(governance): cover operational method authorization |

Conclusão: aguardam promoção; não há registro de recusa (refutação) para nenhum deles.

### PRs antigos de origin/main (auto-PRs do github-actions[bot], não processados pela Casa)

Mesclados sem a estrutura de prova da Casa (sem `Validated-Head` / `Casa-Verified-Receipt-SHA256` / `Squash-Fixed-Point`): #1894, #1906, #1907, #1909, #1913, #1917, #1918, #1919, #1925, #1928, #1929, #1936, #1937 (entre outros). São merges automatizados do bot, não PRs autorizados com label PERMITO-SEGREDO da Casa — o critério (1) se aplica aos PRs autorizados da Casa, todos regulares.

## Status de sincronização: main local vs origin/main

| | SHA |
|---|---|
| main (local) | `fd0728fb3080f89273fed548e7eeae10e2effc6b` |
| origin/main (remoto) | `616e90aa00b480e7c39183b5c778335c2bbe2288` |
| merge-base | `7e89e43fef8418c2f773d7628449d33822f6e6b9` |

- main local está **ahead 9 / behind 233** em relação a origin/main → **NÃO SINCRONIZADAS** (divergentes).
- Os 9 commits à frente da main local são o conteúdo do PR #1928 fractionado em 9 commits (`fd0728fb30` … `a0fb01349e`), conteúdo que já existe squashado em origin/main como `e2799d53f8 (#1928)`.
- Para atender o critério (2), é necessário redefinir `main` local para `origin/main` (ou fazer fast-forward/rebase) — não houve sincronização após o último merge.

## Veredito

Critério 1: OK (13/13 PRs da Casa com receipt + ponto fixo comprovados). Critério 2: FALHA (main local ≠ origin/main). Critério 3: OK para PRs da Casa. Critério 4: OK (nenhuma refutação registrada localmente).

Ações pendentes: promover ou arquivar os 6 PRs pendentes (#1911, #1916, #1920, #1921, #1926, #1931) e sincronizar `main` local com `origin/main`.