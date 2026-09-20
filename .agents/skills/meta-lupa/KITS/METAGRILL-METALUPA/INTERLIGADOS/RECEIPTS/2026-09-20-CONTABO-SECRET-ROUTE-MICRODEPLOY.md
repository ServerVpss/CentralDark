# 🔐🪬 Contabo secret route — microdeploy sem sair do contrato

🔗 !CENTRALDARK → !># INTERLIGADOS → REALIDADE = JUIZ

## Fato medido

O runtime da VPS não possui CONTABO_CLIENT_ID, CONTABO_CLIENT_SECRET, CONTABO_API_USER e CONTABO_API_PASSWORD carregados no ambiente atual do MCP.

A Casa também não possui essas quatro variáveis nos escopos Process/User/Machine medidos.

## Credencial existente encontrada sem revelar valor

O workflow canônico existente:

.github/workflows/vps-reboot-forensic.yml

referencia exatamente os quatro GitHub Actions Secrets:

- CONTABO_CLIENT_ID
- CONTABO_CLIENT_SECRET
- CONTABO_API_USER
- CONTABO_API_PASSWORD

Nenhum valor foi lido, copiado, commitado ou exibido.

O mapa redigido de secrets na VPS também registra presença histórica dessas quatro identidades de secret, com hashes/lengths redigidos. Esse mapa é evidência de rota/nome; não substitui o secret store.

## Decisão

REUSE_BEFORE_CREATE=true.

Não criar nova key, nova credencial, novo cofre ou nova rota paralela.

A fonte deve continuar sendo GitHub Actions Secrets já vinculada ao workflow. O microdeploy deve hidratar o runtime somente durante execução autorizada, sem materializar valor no Git e sem ecoar secret em logs.

## Lacuna encontrada

scripts/vps/hydrate-provider-secrets.sh atualmente hidrata Cloudflare e Buildkite, mas não hidrata os quatro nomes Contabo.

Portanto:

CONTABO_SECRET_SOURCE=GITHUB_ACTIONS_SECRETS_EXISTING_ROUTE.
CONTABO_SECRET_VALUE_READ=false.
CONTABO_SECRET_VALUE_EXPOSED=false.
CONTABO_MCP_RUNTIME_HYDRATED=false.
CONTABO_PROVIDER_READ_CURRENT=BLOCKED_MISSING_RUNTIME_CREDENTIALS.

## Próximo delta útil

Estender o hydrator canônico existente para aceitar os quatro CONTABO_* e escrever apenas no secret runtime autorizado/MCP env com modo 0600; disparar via workflow que já possui os secrets; reiniciar somente o serviço MCP afetado; testar provider_credentials_status e provider_read(contabo, instances.list); emitir receipt redigido.

Nenhum reset --hard, force-push ou substituição do working tree sujo da VPS é permitido.

CURRENT > HISTORY.
UNKNOWN != PASS.
ONE_SYSTEM_ONLY=true.
NO_PARALLEL_SECRET_ROUTE=true.
