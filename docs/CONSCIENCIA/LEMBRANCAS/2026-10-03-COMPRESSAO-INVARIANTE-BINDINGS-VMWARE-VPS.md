# 2026-10-03 — Compressão por invariante, estado vivo e bindings VMware → VPS

## Fio causal
A sessão começou pela tentativa de entender cerca de 70 workflows e a hipótese do CHEFE de que a quantidade bruta escondia poucas famílias. A hipótese sobreviveu como método, não como número fixo: contar arquivos não define arquitetura. Primeiro classificar efeito, owner e gatilho; depois comprimir manifestações equivalentes em famílias; finalmente usar relógio/dispatcher comum quando a semântica permitir.

## Estado vivo medido
- PR #1742: jobs self-hosted/Linux medidos ficaram queued com runner_name vazio. Isso não prova execução em Casa, VMware ou VPS.
- Selo Fabric medido: ubuntu-latest; cone diferente do self-hosted.
- VPS: Desktop Commander offline não significou VPS down. A Casa alcançou TCP/22.
- Casa→VPS: aliases SSH existentes, mas a sessão não fechou; não criar rota nova por reflexo.
- VMware/CENTRALDARK-OS: possui alias segredo-vpss, identidade SSH configurada e alcança TCP/22 da VPS diretamente.
- SHARED/ssh e SHARED/secrets são visíveis dentro da VMware.
- Os bindings SSH comparados entre SHARED/ssh e ~/.ssh na VM têm identidade de bytes equivalente por SHA-256 e permissões privadas adequadas.
- O bloqueio atual é host identity/known_hosts stale: a chave de host atual observada difere da armazenada. Duas leituras independentes retornaram o mesmo fingerprint atual, mas promoção exige âncora independente/autorizada.
- Nenhum valor de segredo foi promovido ao Git.

## Lei de compressão
```text
FODA-SE_O_NUMERO_BRUTO
→ IDENTIFICAR_EFEITO
→ IDENTIFICAR_OWNER
→ AGRUPAR_POR_INVARIANTE
→ MEDIR_FAMILIAS_REAIS
→ REUSAR_RELOGIO/DISPATCHER
→ DESPACHAR_N_CAPABILITIES
```

“70 → 7” é uma semente mental para procurar compressão. O resultado pode ser 7, 17 ou outro número; quem decide é a classificação do CURRENT.

## Lei de continuidade de rota
```text
CASA = host físico / ponte quando necessária
VMWARE = corpo/forja/executor local
SHARED/ssh + SHARED/secrets = bindings/cofre acessíveis à VM
VPS = twin headless 24/7

ROUTE_OFFLINE != HOST_DOWN
TCP_PASS != SSH_AUTH_PASS
KEY_PRESENT != LOGIN_PROVEN
KNOWN_HOSTS_STALE != LOGIN_KEY_ABSENT
```

A direção arquitetural é tornar a VMware operacionalmente autossuficiente para a rota VPS, sem exigir Casa como salto SSH. Isso não significa duplicar todos os segredos na VPS nem espalhá-los pelo filesystem; cada runtime consome somente bindings necessários.

## Segurança e prova
Segredos permanecem fora do Git. Fingerprint de host é material de verificação pública, mas mudança de fingerprint não é aceita automaticamente. A nova identidade deve ser validada por âncora independente/autorizada antes de alterar known_hosts.

## Next cursor
Validar identidade atual da VPS; atualizar somente known_hosts afetado; provar VMware→VPS autenticado; depois matricular/provar runner VMware com runner_name real e somente então comprimir/rebindar workflows por famílias.
