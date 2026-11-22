---
title: "📚 CENTRALDARK — FONTES / GITHUB / DRIVE"
status: "ATIVO_RECONCILIADO"
date: 2026-09-10
owner: "docs/RECEIPTS/CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION.md"
truth_scope: "FONTES_GITHUB_DRIVE_RECONCILIATION"
canonical: true
aliases:
  - "CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION_2026-09-10"
tags:
  - centraldark
  - receipts
  - fontes
  - github
  - google-drive
  - reconciliacao
  - hash
  - dedupe
  - grafo-vivo
related:
  - "[[CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES]]"
  - "[[PADRAO-RESPOSTA-SEGREDO-CHEFE]]"
  - "[[BANDA_INTENCAO_UNICA_COMPASSO]]"
links:
  - "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
  - "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
---

# 📚 CENTRALDARK — FONTES / GITHUB / DRIVE

## 🧠 Intenção

Manter Fontes, GitHub e Drive conectados sem misturar autoridade:

- 🏛️ GitHub manda no código, decisões e recibos.
- ☁️ Google Drive espelha para leitura humana.
- 📚 Fontes guardam contexto e prova, mas não provam execução.

## ✅ Limpeza já provada

- 📄 Inventário completo: 9.908 arquivos.
- 📚 50 páginas processadas.
- ✅ `more_pages=false`.
- 💾 Total catalogado: 17.393.174.903 bytes.
- 🧹 25 duplicatas byte-a-byte removidas do índice ativo.
- 📦 303.757.201 bytes removidos do índice ativo.
- ❓ Liberação física da quota continua UNKNOWN.

## 🔗 Regra de sincronização

Toda mudança material deve carregar:

- 🏛️ SHA da `main` no GitHub.
- 📄 caminho do arquivo.
- 🔐 hash de conteúdo quando a comparação for byte-a-byte.
- ☁️ id/link do Drive quando houver espelho.
- ⚖️ estado: PROVADO, BLOQUEADO ou NÃO SEI AINDA.

Se GitHub e Drive mudarem o mesmo conteúdo separadamente, não usar “último a escrever vence”. Criar recibo de conflito e reconciliar.

## ⚖️ Leis

- ❓ UNKNOWN != PASS.
- 🧾 ACTION != PROOF.
- 📄 DOCUMENTED != EXECUTED.
- 🚀 MERGED != DEPLOYED.
- 🔐 mesmo nome/tamanho sem hash não prova duplicata.
- 🗑️ mover para lixeira não prova quota física liberada.

## 🧭 Próximo passo

Continuar limpeza somente quando o hash byte-a-byte provar duplicata e manter GitHub/Drive ligados por recibo, sem criar uma segunda fonte oficial.

<!-- PR1788_MAIN_HERMES_DRIVE_RECONCILE_20261009 -->
## Snapshot MAIN ↔ VPS Hermes ↔ Google Drive ↔ Gemini (09/10/2026)

**Intenção:** eliminar ambiguidade entre código canônico, PR aberta, checkout executado, skill carregada e bibliotecas Google Drive, sem clonar cérebro, perder delta do Hermes ou transformar espelho histórico em verdade atual.

**SOURCE/T0:** `GitHub ServerVpss/CentralDark@main = 5344bd87074c334ddf3ac322ae7d6aaacecdf665`. PR #1788 estava `OPEN`; HEAD observado durante o update do Drive `35e89ca1ade0bfa2a076999ba06bb2ecf1dd28b6`. O PR está fora da main; não marcar código do PR como implantado.

### Checkpoint VPS materializado

Rota existente Casa `SEGREDO` → SSH `Segredo-VPS` → `/root/CentralDark`. Antes: `VPS_HEAD=e073059e0f76a53290886b56cbf668bf53d4b7f5`, `origin/main=5344bd87074c334ddf3ac322ae7d6aaacecdf665`, `branch=main`. Delta remoto: **2 arquivos, ambos docs**; dirty tracked: `.agents/skills/opus-magus/SKILL.md` e `scripts/register-github-webhook.sh`, **ambos sem sobreposição com os 2 docs**.

A mesma trava `/tmp/centraldark-auto-sync.lock` foi adquirida. Após provar `merge-base ancestor`, diff não sobreposto, branch/head exatos e `origin/main` esperado, executado **`git merge --ff-only`** sem stash, reset, clean, force ou restart. Verificação após a operação e segunda consulta SSH independente:

```text
CHECKOUT_SYNC=PASS
VPS_HEAD=5344bd87074c334ddf3ac322ae7d6aaacecdf665
REMOTE_MAIN=5344bd87074c334ddf3ac322ae7d6aaacecdf665
DIRTY_OPUS_SHA256=392520fd7026f49c31c062eb67d169c470466e2bae88a599c958e5e07154db8e (BEFORE=AFTER)
DIRTY_WEBHOOK_SHA256=edec195f7f7beb0bef9a4727496e928d472629564d9ab653358004d80c6faa77 (BEFORE=AFTER)
HUD_VPS_SHA256=00a35c33dce62aec5e34b72b1df6af784d6eca2e1451dd08bcfbda0c86ea9950
HERMES_SYSTEMD=active
HERMES_ACTIVE_SESSION_LOADED_SHA=UNKNOWN
MCP_RESTART=NOT_DONE
```

O primeiro SSH de sync terminou com código 127 **após** imprimir `CHECKOUT_SYNC=PASS` por CRLF residual na entrada padrão do script Bash; a **verificação SSH independente** confirmou HEAD final igual a `origin/main` e os dois dirty paths preservados. Não promover o exit code da primeira execução a PASS: a prova de sincronização é o readback separado.

### Skill-sync oficial: preservação do ouro distinto

Invocado `scripts/skill-sync-check.sh --apply` existente, fixando `CENTRALDARK_SKILL_SYNC_REF=5344bd87074c334ddf3ac322ae7d6aaacecdf665`; sem nova engine/scheduler. Saída:

```text
MAIN_SHA=5344bd87074c334ddf3ac322ae7d6aaacecdf665
AUTOSYNC_SKILLS=27
TARGETS=54
SYNCED=48
INSTALLED=0
UPDATED=0
ORACLE_REQUIRED=6
UNKNOWN=0
MAIN_RUNTIME_LOCK=PARTIAL
```

As **6 skills** `~/.hermes/skills` com conteúdo divergente de `main` e com readback SHA-256 também distinto da PR #1788 atual: `autonomous-ai-agents/hermes-agent`, `centraldark-reuse-runtime`, `kimetsu-brainstorm`, `software-development/centraldark-ops`, `centraldark-oracle-surface`, `hermes-agent-skill-authoring` (todas `SKILL.md`). **Nenhuma sobrescrita**; `ORACLE_REQUIRED_RUNTIME_DRIFT` merece classificação owner/writer antes de promover qualquer delta. `SYNCED != LOADED`.

### Google Drive: uma árvore organizada, outros espelhos históricos preservados

Consulta realizada via conector Google Drive de duas contas **em leitura**; a conta com pasta organizada `CentralDark/` possui o owner de escopo `00-ESCOPO-DRIVE-CENTRALDARK` e categorias `ESPELHOS-DO-GITHUB`, `LEMBRANCAS`, `HISTORICO`, `ESTUDOS-E-MATERIA`. Essa própria política confirma `GitHub canonical / Drive noncanonical` e proíbe edição/movimento de material fora de `CentralDark/`.

Feita **edição aditiva não destrutiva no Google Doc existente** `CentralDark/00-ESCOPO-DRIVE-CENTRALDARK`, com `requiredRevisionId` (controle de concorrência), marcador `CD_DRIVE_CURRENT_HERMES_MAIN_20261009`, HEAD GitHub, HEAD VPS, estado das 27 skills/6 divergências, PR `OPEN`, limites do Gemini e `NEXT_CURSOR`. **Nova revisão Google Docs e readback da mesma revisão = PASS; política histórica do documento preservada.** O ID completo e as credenciais do Drive não são gravados aqui; link restrito fica no próprio Google Drive.

Em outra conta Drive, arquivo `SYNC-RECEIPT.md` de **05/10/2026** no diretório `CURRENT-main-4da1d4d-2026-10-05` registra `MAIN_HEAD=4da1d4dca61329274a64e7d7a957eae6edd2493d`; ele é **HISTÓRICO** e não foi sobrescrito. Demais docs e vários `BRAIN.md/INDEX.md/VAULT` têm IDs distintos, **não** se consolidam por título/mtime e **não** foram espelhados em massa. Código `scripts/drive_reconcile.py` na main declara que `scan_remote` não funciona sem serviço Drive configurado; VPS `/root/.config/centraldark/drive/config.yaml` **ausente**, serviço `centraldark-google-drive.service` **inactive** na medição: `AUTONOMOUS_BULK_DRIVE_SYNC=NOT_PROVEN`.

### Gemini como consumidor sem duplicação

`GEMINI.md` atualizado **nesta PR** (commit `35e89ca1ade0bfa2a076999ba06bb2ecf1dd28b6`) com `GEMINI_DRIVE_MAIN_HERMES_PROVENANCE_BRIDGE_20261009`: sempre medir GitHub main atual, PR candidato, checkout VPS, SHA/runtime Hermes e revisão/arquivo Google Drive **separadamente**. Sem `last-write-wins`, sem importar antigo como lei nova, sem espalhar segredos.

**PLACAR:** `VPS_CHECKOUT=PASS`; `DIRTY_FILES_PRESERVED=PASS`; `SKILL_RUNTIME=PARTIAL(48/54,6_DRIFT)`; `DRIVE_CANONICAL_SCOPE_SNAPSHOT=PASS`; `GEMINI_ADAPTER_PR_CODE=PASS`; `GEMINI_LOADED=UNKNOWN`; `BULK_DRIVE_MIRROR=NOT_DONE`; `PR1788_OPEN`; `GLOBAL_FIXED_POINT=FALSE`.

**NEXT_CURSOR:** writer Hermes classificar as seis diferenças `RUNTIME` contra `main` e PR #1788; testes SAME_HEAD da PR; promoção por gate; skill-sync oficial / reload e loaded-source readback; integração Google Drive por owner `oauth-broker` e espelhos pré-existentes **sem cópias paralelas**; readback de acesso efetivo Gemini à conta Google correta; atualização do mesmo HUD com `SELADO` apenas quando cada camada tiver prova.
<!-- /PR1788_MAIN_HERMES_DRIVE_RECONCILE_20261009 -->
