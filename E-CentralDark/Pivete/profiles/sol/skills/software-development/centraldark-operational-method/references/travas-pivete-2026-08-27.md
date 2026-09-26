# Travas Pivete — condensado 2026-08-27

## VPS mid-rebase (caso real medido pelo Claude na mesma Casa)
- Sintoma reportado "4655 commits pendentes" → medido: `4655` = comandos restantes de `git rebase`, não commits. HEAD detached, `REBASE_MERGE` + `REBASE_APPLY` ao mesmo tempo (estado duplo/residual).
- `git status --short` = 1869 linhas mexidas. `origin/main` vs HEAD da VPS = 5 atrás, 483 à frente (483 commits SÓ na VPS).
- `git rebase --abort` FAIL: arquivo untracked seria sobrescrito → QUARANTINE, não `rm -rf`.
- Causa raiz do travamento: arquivos com `chattr +i` (atributo imutável, `lsattr` mostra `----i---------e-------`). `chattr -i` = remover proteção de arquivo do Hermes → parar e perguntar (nível destroy, não é "permissão qualquer").
- Snapshot ANTES de mutar: `git bundle` incompleto (`--all` não pega HEAD detached/rebase/stash) → usar bundle completo com reflog: `git bundle create /root/snapshot-completo.bundle --all --reflog` (medido 8,5GB, incluiu os 483 commits locales). Bundle de 103MB só com `main` NÃO protege o estado em risco.

## MCP / acesso remoto
- `mcp.centralldark.com` respondeu 502 nesta sessão → VPS fica UNKNOWN da CLI Hermes. Gateway local `127.0.0.1:9119` = 200 (vivo). Site `8080` = 200. Router `8199/health` = 200.
- Sem MCP/SSH, não afirmar estado da VPS. Usar só o que o CHEFE cola do VSCode/outra sessão como evidência histórica, não estado atual.

## GitHub (gh auth real nesta sessão)
- `gh auth status` → `segredounlock` logado, token `gho_***` mascarado. `gh api /repos/ServerVpss/CentralDark/dependabot/alerts --paginate -q '.[] | select(.state=="open") | .security_advisory.severity' | sort | uniq -c` → contagem real de CVEs.
- Dependabot `open-pull-requests-limit` subido de 1→15 (PR do Claude) → backlog caiu de 206 para 201 alerts.
- Ancoragem baianês+bíblica: `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` ganhou `language_policy.cronica_baianes_biblica` (commit `b04dfad38`). É CONTRACT_DECLARED, não RUNTIME_PROVEN até outro engine obedecer numa sessão nova.

## Investigados nesta sessão (Casa)
1. `E:/CentralDark/workspace/docs/formulaa-consolidada` — 1.276 arqs, só-casa, fora do repo (medido find)
2. `E:/CentralDark/Pivete/CentralDark/docs` — 1.555 arqs, V1/V2 + legado (V2 veio de lovable-sync, removido)
3. `E:/CentralDark/workspace/CentralDark_SUPERPACK_DUAS_CAMADAS_2026-08-20` — pacote 2 camadas (PR #998, autor segredounlock)
4. `00-SUPER-PROMPT.md` (temp RAR) — consome BASE+PACOTE2, aponta PR #998
5. `casa-github-sync` — skill em `E:/CentralDark/_RECONCILIATION/OURO/FONTE_PIVETE_COMPLETO/NUCLEO/skills/casa-github-sync` (6 fases, push só com ordem)
- `vector-memory` EXISTE no repo (`.agents/skills/vector-memory`) → absorver delta, não criar
- `tecnicadalupa` AUSENTE no repo → criar só se gap real vs meta-lupa provado
