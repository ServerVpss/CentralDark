# 13 — Cofre de Secrets Centralizado

**Regra:** todo secret/.env do CentralDark vive em um único lugar:

```
/root/CentralDark/secrets/
```

## Por que

- Evita .env espalhado por dezenas de pastas (risco de vazar, esquecer, divergir).
- Um único ponto de rotação de chave.
- Backup e auditoria simples.

## O que NÃO fazer

- Não criar `.env` em pastas de app (use o cofre).
- Não commitar `.env` no repo.
- Não copiar valor de secret pra chat, log, PR ou painel.

## Quarentena

Arquivos `.env*` antigos foram movidos (não apagados) pra:

```
/root/CentralDark/quarantine/envs-<timestamp>/
```

Cada pasta original ficou com um `ENV-README.md` apontando pra cá.

## Script

`CentralDark/scripts/run-once/quarentenar-todos-envs-vps.sh` faz a varredura
e a movimentação. Dois modos: `dry-run` (só lista) e `apply` (move).

Última execução registrada: `/root/CentralDark/revisoes/20260610-164551-quarentenar-envs`
