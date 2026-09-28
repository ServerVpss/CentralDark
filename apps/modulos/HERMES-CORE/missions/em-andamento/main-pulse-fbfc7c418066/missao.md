# MAIN PULSE — classificar delta fora do microdeploy conhecido

STATUS=READ_ONLY_CLASSIFICATION
TRIGGER=webhook
FROM_SHA=1ee150b675fb2d9621e08a99d56c408db91bc761
TO_SHA=fbfc7c4180666ec8ac3a763e1912399b584e10d1
INTENCAO=identificar owner existente e menor rota de deploy; não escrever nem aprovar
UNKNOWN_IS_NOT_PASS=true
REUSE_BEFORE_CREATE=true

## Arquivos fora dos owners de microdeploy
- scripts/vps/main-pulse-reconciler.sh
