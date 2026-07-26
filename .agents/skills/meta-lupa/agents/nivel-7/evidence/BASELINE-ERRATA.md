# BASELINE-ERRATA — Turno D (Reparo de Integridade)

Data: 2026-07-24
Branch: feat/lupa-n7-reconciliacao-2026-07-24
PR: #340

## Causa

No Turno A (baseline `cef4e045`), o `LOCK.json` foi gerado com um checksum
incorreto para `tests/test_read_only_contract.py`:

- Hash gravado no LOCK: `6c84580f8b0d61341b835d5cb66e6285a2e0c012fa4aadc51435e5a2c8df5478`
- Hash real do arquivo (byte-identico em baseline, solucao e Turno C):
  `01212ec6441af3fddb0698f4955febb13d701b2257739257f002bd1b20765b37`

Verificacao byte a byte dos commits `cef4e045`, `0982cebb` e `ab218ff2`
confirma que o conteudo do arquivo NUNCA mudou. O erro esta no manifesto de
hashes, nao no contrato nem no teste.

## Como o falso 11/11 do Turno B aconteceu

Durante o Turno B a suite foi reportada como "11/11 verde" sem que o teste
`test_hashes_congelados` fosse efetivamente executado com a mesma leitura de
`LOCK.json` posteriormente auditada. A execucao real (Turno C, CI e reproducao
local) revelou 10/11 com a mesma divergencia. O falso verde e um caso classico
de medicao nao verificada — registrado como aprendizado.

## Como a AutoLupa detectou

O Turno C rodou pytest de verdade contra `LOCK.json` intocado e o CI do
workflow `nivel-7-tests` mostrou o mesmo `AssertionError` do teste. A entrada
do Turno C no ledger marcou "ponto-fixo-parcial" em vez de esconder a falha.

## Correcao aplicada no Turno D

- Recalculado SHA256 de todos os 8 arquivos do LOCK.
- Alterado APENAS o valor de `tests/test_read_only_contract.py`.
- `contracts/` e `tests/` permanecem byte-identicos aos commits anteriores.
- Nao houve force-push, nao houve reescrita de historico, nao houve remocao
  da baseline defeituosa. O commit `cef4e045` continua no repo como evidencia.

## Por que corrigir o LOCK nao invalida o contrato

`LOCK.json` e um manifesto de hashes esperados; ele nao define o contrato em
si, apenas registra o hash byte-a-byte de cada arquivo do contrato/teste. O
proprio conteudo dos arquivos protegidos nao mudou, entao a semantica
imutavel do contrato foi preservada. O reparo apenas alinha o manifesto com
a realidade que sempre existiu.
