# MAIN PULSE — classificar delta fora do microdeploy conhecido

STATUS=READ_ONLY_CLASSIFICATION
TRIGGER=webhook
FROM_SHA=7a66fdd588b91d2d275b205391bf7e149fee12c0
TO_SHA=1ee150b675fb2d9621e08a99d56c408db91bc761
INTENCAO=identificar owner existente e menor rota de deploy; não escrever nem aprovar
UNKNOWN_IS_NOT_PASS=true
REUSE_BEFORE_CREATE=true

## Arquivos fora dos owners de microdeploy
- docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
- docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
