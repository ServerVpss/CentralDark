## Objetivo
Trocar a chave usada pelo robô do CI (GitHub Actions) no teste automático do gateway. Sair de `ABACUS_API_KEY` (chave da Abacus) e passar pra `CENTRALDARK_API_KEY` (sua chave `cdk_live_...`).

## O que muda (curto)
- **Antes:** robô do CI usava chave da Abacus pra rodar o teste.
- **Depois:** robô passa a usar sua própria chave CentralDark.
- **Resultado prático:** você não depende mais de conta Abacus externa pro CI. O gateway continua puxando os 161 modelos da Abacus por dentro, isso não muda.

## O que NÃO muda
- Gateway `api.centralldark.com` segue igual.
- Claude Desktop segue igual.
- 161 modelos seguem sendo puxados normal.
- `ap7.site` continua morto e enterrado.

## Passos técnicos (PR #147)
1. Editar `.github/workflows/arsenal-adapter-tests.yml`:
   - Trocar `secrets.ABACUS_API_KEY` → `secrets.CENTRALDARK_API_KEY`.
   - Renomear a env var passada pro teste (`API_KEY` ou similar) pra apontar pra nova.
2. Confirmar que o secret `CENTRALDARK_API_KEY` existe no GitHub (`ServerVpss/CentralDark`). Se não existir, você cadastra em Settings → Secrets → Actions (a chave `cdk_live_...` que você já tem).
3. Ajustar `tests/models.test.mjs` se ele lê nome específico de env — só rename, sem mudar lógica.
4. Commit único na branch `pivete/adapter-auth-audit-fix`, push, esperar CI verde.
5. Registrar o ouro: linha curta no `docs/GOVERNANCA/MVP-MAPA-VIVO-CENTRALDARK.md` dizendo "CI agora usa CENTRALDARK_API_KEY".

## Pré-requisito seu
Confirmar: o secret `CENTRALDARK_API_KEY` já está cadastrado no repositório do GitHub? Se não estiver, você precisa colar ele lá uma vez (eu não vejo/toco em secret real).

## Manda "PERMITO" que eu faço.
