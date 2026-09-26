# Antipadrões depreciados

| Antipadrão | Evidência | Substituto |
|---|---|---|
| `rglob` sem limite | coletor excedeu 301 s | coletores pequenos e limitados |
| lógica PowerShell complexa inline | 2/2 tentativas inválidas | `.ps1` visível + parser |
| reconstruir `...\NUL` | colisão com namespace Win32 | objeto enumerado reutilizado |
| interpretar resposta cortada | contrato não chegou completo | scroll semântico |
| aceitar hash do print como conversa | não prova ACK | NONCE + renderização + resposta |
| navegador isolado como aba pessoal | sessão desautenticada | vínculo autorizado ou abort |
| `npm ci` como prova do projeto | lockfile divergente | classificar gate como bloqueado |
| suíte verde como contrato | oráculo podia copiar defeito | contraexemplo independente |
| “aprendi” sem gate | alegação sem prova | positivo, negativo, limite, rollback |
| começar nova pasta/método | duplicação e drift | mapa único e extensão canônica |

`DEPRECATED` significa fora do caminho ativo. Nenhum item desta tabela autoriza
apagar os artefatos históricos correspondentes.

