# VPS Guardião Trava — Investigação 2026-08-27

## Sintoma relatado pelo CHEFE
Bot @Guardiaodopivete_bot "meio burro" — só sugere, não age.
Suspeita: dois Hermes (local vs VPS) e bot solto.

## Causa real (MEDIDA no código, não chute)
- `infra/guardiao/guardiao.py` linha ~81:
  "Modo 'auto' solicitado mas NÃO está implementado nesta versão.
   Aguardando aprovação humana explícita. Forçando modo='propor'."
- Só existe lógica `propor`. Modo `auto` NUNCA foi implementado.
- `infra/guardiao/ecosystem.config.cjs` (VPS): `GUARDIAO_MODO: "propor"` travado.
- `docs/CONSCIENCIA/REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md`:
  atualizado 14/08/2026 por `SegredoiDev` → virou `HISTORICAL_DECISION`
  (aposentado), mas o código/PM2 não seguiu a aposentadoria.

## Quem fez / Porquê
- Regra original: decisão do CHEFE (25/06/2026), janela até 08/07/2026 por segurança.
- 14/08: CHEFE mandou aposentar a regra e alinhar autoridade.
- Resultado: doc aposentado, porém `ecosystem.config.cjs` da VPS ainda trava `propor`
  e o `guardiao.py` nem sabe fazer `auto`. Daí o bot parece "burro".

## Fluxo correto de reconcile (R4 — VPS)
1. `git log` do arquivo → achar AUTOR + DATA da trava.
2. Ler o doc-regra → pode estar `HISTORICAL_DECISION` (não vigente).
3. MEDIR o código atual (guardiao.py / ecosystem.config.cjs) → o que REALMENTE roda.
4. Verificar se o modo alvo FOI IMPLEMENTADO. Se não, remover a trava = no-op.
5. Só agir com ordem explícita do CHEFE (R4). Nunca destravar sozinho.

## Lição (pitfall cristalizado)
Remover a trava sozinha NÃO destrava o bot — código não sabe fazer 'auto'.
Alinhar doc↔código em VPS é R2/R4 e exige ordem do CHEFE.
CHEFE: "VERIFICA ANTES PRA NAO ESTRAGA VEJA E SE E INTENCIONAL".
