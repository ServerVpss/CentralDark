# Delta Contínuo Canônico + Banda Musical + Kanban Único (receita 31/08)

Padrão travado pelo CHEFE após a sessão do DELTA 4 / PR #1382. Complementa a
Regra 76 da `centraldark-operational-discipline`.

## 1. Delta útil = 1 dono, 1 PR, sob a banda

- Dono canônico de delta útil: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md`.
- NUNCA criar `DELTAUNIFICADOCENTRALDARK.md` (recibo inexistente; `gh search code` total_count=0).
- Todo delta passa pela BANDA MUSICAL:
  `BANDA_COMPASSO_GLOBAL.md` (partitura) → `LEIA-ME-IA.md` (porta carrega no boot)
  → `GraphRAG` (músico que toca partitura + aprendizado SEMPRE) → `GRAFO-VIVO` aponta.
- Gate `verify_repo_contract.py` derruba desafinação (não carregar a partitura = FAIL).

## 2. CI vermelho no PR ≠ regressão do PR

Quando `porta-de-entrada` / `codex-validate` / `build-counterproof-package` FAIL:
1. `gh run view <RUN_ID> --log-failed` (NÃO `gh api jobs/<id>/log` → 404).
2. Ler o JSON de `consolidation_protected_unproven` / `parallel_existing`.
3. Se `touched_locks:[]` e o FAIL é `parallel_existing: 12` (jarvis-lab-v2/v3/v4, Bolt/telepainel duplicados na BASE) → o vermelho é da **base main**, não do delta de 1 arquivo.
4. PR #1382 (DELTA 4) foi mergeado squash mesmo com esses FAILs porque o delta não os causou.
5. Contraprova: medir se o FAIL cita o arquivo do PR ou arquivo da base. Não bloquear merge por vermelho de base.

## 3. Kanban único (Hermes Desktop = WebUI)

- Quadro único = **GitHub Issues** (backend). Ambos os surfaces leem do mesmo backend.
- `gh issue create/edit/close` no ServerVpss/CentralDark. O link é a entrega.
- Não duplicar card nem criar segundo quadro.

## 4. Auto-merge quando-green (quando o CHEFE manda)

- `gh pr merge <n> --auto --squash` SÓ mergeia quando os gates ficam verdes.
- Se o repo bloquear auto-merge (`Auto merge is not allowed for this repository`), o agente:
  a) mede a causa do vermelho (item 2 acima);
  b) se for base, aperta `gh pr merge <n> --squash` direto (o CHEFE autorizou "aperta em merge squash");
  c) fecha/atualiza o kanban com a lei travada.
- NUNCA mergear no vermelho sem medir a causa (REALITY=JUDGE).

## 5. APLICAR NA FONTE DA VERDADE (não só chat) — correção final CHEFE 31/08

Quando o CHEFE manda "aplica na main, na fonte da verdade, não só em conversa paralela /
demonstração de entendimento":
- **Gravar a lei/intenção no dono canônico do repo (AGENTS.md / LEIA-ME-IA.md / DELTA-CONTINUO.md),
  via PR** — não ficar respondendo no chat repetindo a regra ("prova de entendimento" = wasted turn).
- A prova É o PR mergeado, não o texto no chat.
- Passo-a-passo testado (31/08, cadeado de governança → AGENTS.md):
  1. `gh api repos/ServerVpss/CentralDark/contents/AGENTS.md --jq '.sha'` (SHA atual)
  2. baixar `--jq '.content'` → `base64 -d` → append seção (REUSE_BEFORE_CREATE, sem arquivo novo)
  3. `gh api repos/.../git/refs -f "ref=refs/heads/<branch>" -f "sha=<origin/main_sha>"` (branch isolada da main)
  4. `gh api repos/.../contents/AGENTS.md --method PUT --input payload.json` (message+content(base64)+sha+branch)
  5. `gh pr create --base main --title ... --body ...`
  6. se CI vermelho for da BASE (item 2), `gh pr merge <n> --squash` (igual #1382/#1384); se for do patch, corrigir antes
- Caso 31/08: CADEADO DE GOVERNANÇA (consolidado travado, zero regressão, sem V2/V3, skill sob demanda,
  amarrar no motor+consciência) gravado em `AGENTS.md` via PR #1384 (MERGED 2026-08-31T04:41:44Z).
- Cadeado (não relaxar): agente não tem autoridade sobre o cristalizado; reflexo de autoridade do CHEFE
  obrigatório antes de mutar consolidado; versão paralela (jarvis-lab-v2/v3/v4 etc) = regressão.
- Pendência de raiz do vermelho: 12 paralelos V2/V3/V4 na base → issue #1385, consolidação exige
  reflexo CHEFE por arquivo (não apagar na surdina).
