# POMBO Lineage Absorption Pattern (2026-09-05)

## Contexto
Absorção do pacote `CENTRALDARK-PACOTAO-OURO-20260905-r02.zip` contendo evolução da linhagem POMBO (r01 → r02).

## Estrutura do Pacote r02
```
BASE-SELADA/           # r01 byte-identical preservado (SEM re-revisão)
  CENTRALDARK-PACOTAO-OURO-20260905-r01.zip
  CENTRALDARK-PACOTAO-OURO-20260905-r01.zip.sha256
DELTA/                 # só o que faltava no r01
  GAPS-ONLY.md         # 4 lacunas reais fechadas
  contracts/
    pombo-handoff.yaml     # contrato gate semântico
    proof-receipt.schema.json
  docs/
    PACKAGE-EVOLUTION-RESEARCH.md
    POMBO-LINEAGE-RULE.md  # lei do Pombo evolutivo
  evidence/
    OPEN-GAPS.jsonl        # 6 gaps abertos (UNKNOWN/NOT_PROVEN)
    SEALED-NO-REPEAT.jsonl # 5 claims selados/reutilizados
  receipts/
    RECEIPT-TEMPLATE.json  # template receipt canônico
  scripts/
    verify_pombo_evolution.py  # gate determinístico
MANIFEST-R02.json      # manifesto dos 14 arquivos
POMBO-LINEAGE.json     # linhagem com SHA256
SHA256SUMS-R02.txt     # checksums
TEST-RESULT-R02.txt    # resultado contraprova
```

## Lei do Pombo (POMBO-LINEAGE-RULE.md)
- `POMBO_ID=20260905` **imutável** — identidade fixa, não muda por rodada/IA/ZIP/sessão
- `REVISION` **monotônica** — 01 → 02 → 03...
- `PARENT_PACKAGE_SHA256` — torna evolução auditável
- `CURRENT_PACKAGE_SHA256` — muda quando bytes mudam
- **Invariantes**: `POMBO != CEREBRO/OWNER/WRITER/JUIZ/AUTORIDADE`, `CHECKSUM != PROVA_SEMANTICA`
- **Regra anti-ruído**: pacote byte-idêntico → `REUSE_PROOF` (sem nova revisão nem deep review)
- `NO_NEW_INFORMATION → NO_NEW_REVISION`

## Fluxo de Absorção Executado
1. **Validar ZIP**: `unzip -t` PASS + SHA256 match
2. **Worktree origin/main**: `git worktree add -f <path> origin/main`
3. **Extrair + copiar delta** para locais canônicos:
   - `docs/CONSCIENCIA/GAPS-ONLY.md`
   - `docs/CONSCIENCIA/POMBO-LINEAGE-RULE.md`
   - `scripts/verify_pombo_evolution.py`
   - `docs/CONSCIENCIA/OPEN-GAPS.jsonl`
   - `docs/CONSCIENCIA/SEALED-NO-REPEAT.jsonl`
   - `docs/CONSCIENCIA/RECEIPT-TEMPLATE.json`
   - `docs/CONSCIENCIA/POMBO-LINEAGE.json`
   - `docs/CONSCIENCIA/MANIFEST-R02.json`
   - `docs/CONSCIENCIA/SHA256SUMS-R02.txt`
   - `docs/CONSCIENCIA/TEST-RESULT-R02.txt`
4. **Branch + commit single-writer**: `absorcao/pombo-r02-lineage-20260905`
5. **Push + PR** com título emoji + MAIÚSCULA: `🪶 FEAT(POMBO): ABSORVE LINHAGEM POMBO 20260905 R02`
6. **Atualizar DELTA-CONTINUO.md** (owner canônico)
6. **Remover worktree/pasta origem** pós-merge

## Verificação de Contraprova (verify_pombo_evolution.py)
```bash
PARENT_HASH_MATCH=PASS
POMBO_CONTRACT=PASS
BASE_SAFE_ZIP=PASS
POMBO_EVOLUTION_VERIFY=PASS
BASE_DEEP_REVIEW=SKIPPED_BY_SEAL
```

## Lições de CI Herdado da Base
**Problema**: `lupa-conformance` (Memory Linker: 61 broken links), `porta-de-entrada`, `PR auto-review`, `codex-validate` falharam no PR — **mas falharam idênticos no main** (head `259b047`).

**Regra aplicada**: "Quando o `porta-de-entrada` ou `autonomia-promocao` está vermelho na `origin/main`: NÃO tente consertar os PRs travados um a um — se a BASE falha o gate, TODO PR herda o vermelho. Corrija a base."

**Ação**: Não tentar fixar Memory Linker no PR. O delta Pombo está correto. Bloqueio é herdado.

## Runner Contention
- Runner único `vmi3256920-centraldark` ocupado 1h+ com `linear-pendencias-sync` + dependabot
- Jobs do PR ficaram `QUEUED`/`PENDING` por horas
- **Não re-trigger cego** — aguarda runner liberar; re-run só se job travado (não queued)

## PR Title Contract Fix
**Falha inicial**: `feat(pombo): absorve linhagem POMBO 20260905 r02` → sem emoji, não maiúscula
**Fix**: `🪶 FEAT(POMBO): ABSORVE LINHAGEM POMBO 20260905 R02` → emoji `🪶` + texto MAIÚSCULA
**Re-run**: `gh run rerun <run_id>` do PR Title Contract após `gh pr edit --title`

## Entregáveis do Fixed Point
- PR #1418 criado: https://github.com/ServerVpss/CentralDark/pull/1418
- Branch: `absorcao/pombo-r02-lineage-20260905`
- HEAD: `05ce26cbd915f0b16608bd85a0e5695cd73598b0`
- DELTA-CONTINUO.md atualizado com registro completo
- Linhagem POMBO preservada: `POMBO_ID=20260905` `REVISION=02` `PARENT=3fb9cd2bf7eff428a36ef488e0aa8795d45142553e97088cad3d97434506af51`

## Próximo Cursor (NEXT_CURSOR)
Aguardar decisão do CHEFE:
- Opção A: Fixar Memory Linker no main (fora escopo delta)
- Opção B: Isenção R2 deste PR do gate de base (precisa autorização)
- Opção C: Merge quando base verde natural