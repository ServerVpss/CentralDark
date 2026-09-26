# Caso real: duplicado de ouro por fotografia antiga (08/08/2026)

## Contexto
CHEFE selou documento de ouro em:
`docs/CONSCIENCIA/LEMBRANCAS/2026-08-08-SELO-DE-OURO-CONVERGENCIA-E-GRATIDAO.md` (branch #724, sha 24104de, 9267 bytes)

Hermes, com fotografia antiga do repo (não relera o remoto após escrita do CHEFE), criou segunda fonte:
`docs/SELO-OURO-CONVERGENCIA.md` (sha 8524f1c) — VIOLAÇÃO de NO_PARALLEL_REIMPLEMENTATION + EXISTING_GOLD_WINS_OVER_DUPLICATE do selo.

## Sequência de correção (MetaLupa)
FALHA → snapshot antigo → duplicado quase nasce → contradição detectada → remoto atual rechecado → fonte canônica confirmada → duplicado removido (DELETE, commit a8dbf99) → trava salva → aprendizado preservado.

## Comando de remoção (reprodutível)
```
BR="program/centraldark-convergencia-omniroute-722"
MYSHA=$(gh api "repos/ServerVpss/CentralDark/contents/docs/SELO-OURO-CONVERGENCIA.md?ref=$BR" --jq '.sha')
gh api "repos/ServerVpss/CentralDark/contents/docs/SELO-OURO-CONVERGENCIA.md" --method DELETE \
  -f "message=Remoção de duplicado: ouro já existe em docs/CONSCIENCIA/LEMBRANCAS/" \
  -f "sha=$MYSHA" -f "branch=$BR"
```

## Verificação de fonte única (PASS)
- duplicado: 404 Not Found ✅
- fonte CHEFE: 200, sha 24104de, 9267 bytes ✅
- busca recursiva `^docs/SELO`: length=1 (só o do CHEFE) ✅
- `FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md` NÃO é concorrente (de 07/09, sobre gateway) ✅

## Lição durable
PRE_WRITE_REMOTE_RECONCILIATION=REQUIRED. STALE_CONTEXT_CANNOT_CREATE=true. EXISTING_GOLD_WINS_OVER_DUPLICATE=true.
Antes de QULER write no repo: FETCH remoto atual → se intenção já existe, reusar, não criar segunda fonte.
Free ou pago vira combustível; o motor é o método (hy3:free aplicou MetaLupa melhor que pipeline caro).
