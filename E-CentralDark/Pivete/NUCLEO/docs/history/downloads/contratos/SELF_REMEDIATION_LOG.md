# SELF-REMEDIATION LOG

## Falha detectada na remedição final

```text
SIGNATURE=sha256sum: CENTRALDARK_SESSION_MASTER_HANDOFF.zip: No such file or directory
```

## Causa
O sidecar `.sha256` usa corretamente o basename relativo do ZIP para portabilidade, mas a checagem foi chamada fora do diretório `/mnt/data`. O hash não divergiu; o verificador não localizou o alvo pelo caminho relativo.

## Correção mínima

```text
FAILURE
→ IDENTIFY_CAUSE=CWD_MISMATCH
→ PRESERVE_RELATIVE_SIDECAR
→ VERIFY_FROM_ZIP_DIRECTORY
→ RETEST ZIP + INTERNAL HASHES + SIDECAR
```

Não foi alterado o conteúdo semântico do contrato por causa desta falha operacional.

## Segunda falha observada

```text
SIGNATURE=TOOL_TIMEOUT_DURING_FULL_RETEST
```

Causa operacional: recompressão + verificações encadeadas excederam a janela da ferramenta. Estado foi re-medido; ZIP existia, mas o sidecar era anterior, portanto permaneceu `UNKNOWN` até novo fechamento.

Correção mínima: reconstruir o ZIP sem compressão (`ZIP_STORED`) para reduzir latência, recalcular o hash depois do fechamento e verificar o sidecar no diretório correto.
