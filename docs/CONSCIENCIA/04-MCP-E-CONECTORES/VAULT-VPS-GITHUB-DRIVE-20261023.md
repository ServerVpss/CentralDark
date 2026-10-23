# CentralDark — índice seguro de localização do cofre

Data: 2026-10-23
Estado: INDEXADO; conteúdo NÃO copiado; credenciais NÃO expostas

## Localização verificada
- VPS: `/root/Vault-Cofre-CentralDark-20260930T105330Z.tar.gz` (aprox. 719 MiB; metadados verificados por comando remoto)
- VPS: `/root/SHARED.zip` (aprox. 18 MiB; metadados verificados por comando remoto)
- Nenhuma extração efetuada. Nenhuma credencial lida.

## Conectores medidos
- GitHub: identidade autenticada `segredounlock`, repositório `ServerVpss/CentralDark`.
- Google Drive: pasta `CENTRALDARK`, id `1eVFHzLZxsDmfjy1yL5-rbD4gO85B-7Uw`.
- VPS: MCP CentralDark, chamada remota de leitura com exitCode 0.

## Fronteira de confiança
- GitHub recebe somente catálogo e contratos SEM material secreto.
- Drive recebe somente documentos sanitizados, nunca ZIP/TAR de credenciais por padrão.
- Vault permanece na VPS e só deve ser consumido por executores explicitamente autorizados, com escopos e sem revelar valores em logs, chat, Git ou Drive.
- A presença das três conexões não comprova autorização interserviço automática, nem leitura do conteúdo do arquivo. Não inventar sincronização de segredos.

CURRENT=DISCOVERED_NOT_MOUNTED
NEXT_CURSOR=VERIFY_ARCHIVE_MANIFEST_WITHOUT_EXTRACTING_SECRETS_AND_DESIGN_SCOPED_CONSUMERS
