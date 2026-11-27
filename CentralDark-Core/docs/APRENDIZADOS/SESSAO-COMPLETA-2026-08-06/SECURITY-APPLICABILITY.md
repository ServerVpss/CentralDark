# Aplicabilidade de segurança — CentralDark

## Objetivo

Transformar o incidente de recuperação em controles permanentes, verificáveis e pequenos o suficiente para serem aplicados por qualquer agente sem reinterpretar a intenção.

## Controles obrigatórios

| Controle | Entrada | Prova de saída | Estado de falha |
|---|---|---|---|
| persistir antes de responder | artefato final | path + hash + tamanho | `BLOCKED_ARTIFACT_NOT_PERSISTED` |
| resolver identidade | arquivo candidato | SHA-256 e tamanho esperados | `BLOCKED_IDENTITY_MISMATCH` |
| validar ZIP | arquivo ZIP | CRC, entries, paths, symlinks | `BLOCKED_ARCHIVE_UNSAFE` |
| provar runtime | extração limpa | sintaxe + testes + contraprovas | `BLOCKED_RUNTIME_EVIDENCE` |
| verificar seal | manifest/code seal | missing/changed/untracked = 0 | `BLOCKED_CODE_SEAL` |
| bloquear leitura sensível | código extraído | scan sem achados reais | `BLOCKED_SECRET_FILE_READ` |
| empacotar completo | sessão acessível | ZIP agregado + manifesto | `BLOCKED_INCOMPLETE_BUNDLE` |
| promover aprendizado | PR revisado | merge humano | `PR_CANDIDATE_ONLY` |

## Invariantes

```text
HASH_DIVERGENTE_NUNCA_E_ACEITO
ZERO_TESTES_NUNCA_E_VERDE
SKIPPED_NUNCA_E_ZERO
ARQUIVO_NOVO_NAO_AUDITADO_NUNCA_E_IGNORADO
RESPOSTA_OCULTA_NAO_PROVA_PERDA_DE_ARTEFATO
PR_ABERTO_NAO_SIGNIFICA_CANONICO
REGISTRO_DOCUMENTAL_NAO_AUTORIZA_PRODUCAO
```

## Rollback

Reverter apenas o commit/PR documental e remover os blobs de evidência da branch. Nenhum serviço, banco, DNS, proxy, runner ou processo de produção é alterado por este registro.
