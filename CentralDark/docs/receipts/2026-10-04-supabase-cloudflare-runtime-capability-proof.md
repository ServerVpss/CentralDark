# Receipt — prova mínima de capacidades Supabase/Cloudflare — 2026-10-04

- Receipt owner reutilizado: `docs/receipts/`
- Catalog owner reutilizado: `SOURCES.json#mcp_centraldark`
- Contrato de autoridade: `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
- Escopo: somente as operações de leitura medidas nesta execução; sem alteração de credenciais, dados, configuração ou deploy.
- Proveniência: runtime findings fornecidos pela medição externa desta sessão.

## Separação de declaração e prova

| Provider | Tool medida | Declaração/catalogação | Runtime proof | Classificação | Status |
|---|---|---|---|---|---|
| Supabase | `mcp__supabase__list_projects` | Integração Supabase e operação de listagem de projetos são capacidades declaradas pelo catálogo de ferramentas. | A chamada de leitura retornou o projeto `lyoigsqluyktoclwdaft` com estado `ACTIVE_HEALTHY`. | `READ_ONLY_RUNTIME_PROOF` | `PASS` somente para esta leitura/observação |
| Cloudflare | `get_accounts_workers_workers` | Integração Cloudflare e operação de consulta de Workers são capacidades declaradas pelo catálogo de ferramentas. | A chamada de leitura executou e retornou lista vazia. | `READ_ONLY_RUNTIME_PROOF` | `PASS` somente para esta consulta sem resultados |

## Limite da prova

- Supabase: `CREATE`, `UPDATE`, `DELETE`, migrations, deploy de Edge Function, escrita de dados e autorização de mutação permanecem `UNKNOWN`.
- Cloudflare: criação/alteração/remoção de Workers, deploy, rotas, DNS, contas, credenciais e qualquer outra escrita permanecem `UNKNOWN`.
- A existência no catálogo não é execução; uma leitura bem-sucedida não prova CRUD, autorização de escrita, persistência nem efeito externo.
- Nenhum segredo, token, payload sensível ou resposta integral foi registrado.

## Veredito

`PARTIAL_RUNTIME_PROOF_WITH_EXPLICIT_UNKNOWN_WRITE_CAPABILITIES`

Não foi criado catálogo, receipt owner, router ou motor paralelo. Este registro estende o owner de receipts existente e referencia o catálogo existente.

NEXT_CURSOR: medir somente a operação CRUD autorizada e o readback correspondente, caso o escopo de escrita seja explicitamente solicitado; até lá, manter CRUD/escrita como `UNKNOWN`.
