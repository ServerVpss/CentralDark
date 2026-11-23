# CentralDark — Ledger Surface Anchor

STATUS=HISTORICAL_PROVENANCE_ANCHOR
ROLE=PR_MOTHER_SURFACE_RETIRED_HUD_CURRENT_PROJECTION_ACTIVE
AUTHORITY=MAIN_CURRENT
HUD_OWNER=apps/modulos/Bolt/source/app/components/centraldark/CentralDarkUnifiedHud.client.tsx
LEGACY_PREDECESSORS=#1562,#1757
PR_MOTHER_ROLE=RETIRED
NO_NEW_PR_MOTHER=true
COMMENTS_AS_PRIMARY_RECEIPT_STORE=false
RECEIPTS_LIVE_IN_REPOSITORY=true
HUD_IS_CURRENT_PROJECTION=true
HUD_IS_NOT_AUTHORITY=true
CHECKLIST_DAILY_OWNER=HUD
SHELL_IS_MUTABLE=true
LEGACY_IS_PRESERVED=true


<!-- CENTRALDARK_SOL_HERMES_RESILIENT_PR_ANCHOR_20261018 -->
## Âncora persistente do fio SOL → Hermes — 2026-10-18

Esta seção **não restaura um PR-mãe**, não cria owner, não move writer nem promove merge. Preserva o registro no repositório e usa os PRs **já abertos** como referências de trabalho, nunca como segundo banco de receipts.

\`\`\`text
LINEAGE=LEGACY_PR_1562 -> LEGACY_PR_1757 -> HUD_CURRENT
LEGACY_PRS=RETIRED_CLOSED_UNMERGED
ACTIVE_SURFACE=HUD_CURRENT_PROJECTION
HUD_OWNER=apps/modulos/Bolt/source/app/components/centraldark/CentralDarkUnifiedHud.client.tsx
HUD_FEED=apps/modulos/Bolt/source/app/routes/api.github-stats.ts
RECEIPT_CANONICAL=docs/CONSCIENCIA/APRENDIZADOS.md
RECIPE_CANONICAL=docs/CONSCIENCIA/REGRA-COMITE-DELTA-CONTINUO.md
RECIPE_ID=CENTRALDARK_SUPABASE_HUB_SOL_HERMES_20261018
PR_HERMES_LANE=1829
PR_DELEGATION_CATALOG_LANE=1837
PR_FUTURE_STATE=ALWAYS_REMEASURE_GITHUB_CURRENT
NO_REOPEN_LEGACY=true
NO_NEW_MOTHER_PR=true
NO_PARALLEL_OWNER=true
\`\`\`

**Receipts já comprovados:** aprendizado #195 \`51e74377d2a4a69d0c80e64c0fdbe78d1200ae1c\`; receita \`b5f60a753b8599558ce2c817107677a2e72b7de1\`; vínculo Hermes \`4625937755b3ada5cb96bf67163efc2c6dff9abc\`; aprendizado #196 \`3f3ad4f53d7f2f0250f663de70641ad44918d1f8\`; causa exata \`a351a869869c1d60868258186afe46a0012f9b12\`. Provas T0 são herdadas quando a identidade causal permanecer válida; nenhuma repetição de SQL/descoberta de owner por cerimônia.

**Distribuição de escopos, sem deslocamento de writer:**
- [PR #1829](https://github.com/ServerVpss/CentralDark/pull/1829) = trilho **Hermes Core / prompt existente**, compatível com o vínculo consumível SOL→Hermes. Em 2026-10-18 estava **OPEN**, mas \`mergeable=false\`; não confundir aberto com pronto para merge. A branch própria e o trabalho dela permanecem intactos.
- [PR #1837](https://github.com/ServerVpss/CentralDark/pull/1837) = trilho **Skill Workshop/MCP e delegação Hermes portátil**, sem converter a skill em segundo executor; independente da correção documental do prompt.
- Nenhum dos PRs assume o papel lógico de PR-mãe. O **HUD CURRENT existente** projeta as lanes correntes a partir do GitHub e exibe \`PASS/FAIL/UNKNOWN/BLOCKED\`, com receipts duráveis na \`main\`.

**Estado físico da última tentativa:** \`HERMES_PROMOTION=BLOCKED\`; \`HERMES_CONSUMPTION=UNKNOWN\`. \`centraldark_deploy_micro_fallback\` e \`centraldark_deploy_apply_learning\` permanecem em \`destrutivasEmRevisao\` no manifesto real. Não alterar permissão, ignorar quarentena, limpar checkout com trabalho de terceiros ou converter documentação em execução.

\`\`\`text
NEXT_CURSOR=REVIEW_APPROVED_SECURITY_MANIFEST_THEN_SCOPED_HERMES_RUNTIME_ACK
REUSE_T0=true_WHEN_CAUSAL_FINGERPRINT_UNCHANGED
NEW_T1_RECEIPT_ONLY_AFTER_REAL_EFFECT=true
COMMENTS_NOT_PRIMARY_LEDGER=true
NO_MERGE_AND_NO_DEPLOY_BY_ANCHOR=true
\`\`\`
<!-- /CENTRALDARK_SOL_HERMES_RESILIENT_PR_ANCHOR_20261018 -->
