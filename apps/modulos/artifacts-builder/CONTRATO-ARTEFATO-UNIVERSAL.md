# Contrato Universal de Artefato — CentralDark

Extensão do `apps/modulos/artifacts-builder/` existente. Não é produto novo —
o motor, a fila de missões, o servidor HTTP e os 13 artefatos já em produção
continuam exatamente como estavam. Isto é aditivo.

Refs: delta "ARTEFATO UNIVERSAL CENTRALDARK" em #668 (SEGREDO/CHEFE), issue
#604, #711, #637.

## O que entrou

| Arquivo | Papel |
|---|---|
| `core/schema.mjs` | Schema universal (`buildArtifactRecord`, `validateArtifact`), IDs e digests determinísticos |
| `core/security.mjs` | Sanitização + classificação de caminho sensível, **portado** de `scripts/lupa/pr-learning-artifact.mjs` (#668) |
| `core/session-report.mjs` | Primeiro renderer dedicado por tipo (`session-report`), paleta BLACK+GREEN já em produção |
| `core/orchestrator.mjs` | Patch aditivo: novos tipos com renderer dedicado passam por `construirArtefatoDedicado()`; índice global agora lê schema antigo e novo sem quebrar; **bugfix real** achado testando: `/health` derrubava o processo (dois handlers de `request` disputando a mesma resposta) |
| `scripts/generate-artifact-session-report.mjs` | Gera o primeiro artefato nativo a partir de evidência real do GitHub |
| `public/motor-teste-centraldark-relatorio-sessao-20260808/` | O artefato em si, já construído e testado |

## O que foi reaproveitado de #668 (não reescrito)

| Capacidade | Veredito | Origem |
|---|---|---|
| Sanitização de segredo (`sanitizeText`) | **ABSORB_GOLD** | `scripts/lupa/pr-learning-artifact.mjs` |
| Classificação de caminho sensível fail-closed | **ABSORB_GOLD** | idem |
| Digest determinístico (SHA-256, payload canonicalizado) | **REFINE** — mesmo princípio, adaptado pra cobrir qualquer `artifact_type`, não só PR |
| `artifact != aprovação` | **REUSE** — mesma semântica, `security.visibility` + rodapé com disclaimer explícito |
| Mermaid / Canvas HTML / YAML | **NOT_APPLICABLE nesta rodada** — o primeiro artefato nativo (`session-report`) não precisa de nenhum dos três pra ser compreendido; ficam disponíveis como próximos `artifact_type` quando um caso real pedir |
| Identificação de modelo/agente produtor | **REFINE** — #668 tinha o campo mas nunca parseava; aqui `producer.model`/`producer.writer_session` são campos de primeira classe no schema, `UNKNOWN` explícito quando não provável |

`.ref-668` não faz parte deste PR — foi só uma cópia de leitura local, descartada.

## Pacotes 01–36 afetados

Nenhum pacote novo criado.

- **25 — Timeline Cognitiva**: `session-report` renderiza timeline real de commits/merges.
- **28 — Explicabilidade Operacional**: camada humana (`purpose`, `story`, `pending`) + camada máquina (`manifest.json`) no mesmo artefato.
- **34 — Integração Sistêmica**: schema comum entre Artifact Builder e qualquer produtor (Claude/GPT/Gemini/Codex/Hermes).
- **36 — Pacote Mestre Canônico**: esta capacidade registrada aqui, não em ZIP separado.

`PACKAGE_DELTA_PENDING_BYTES`: os bytes de
`HERMES_ORGANISMO_CANONICO_01-36_COMPLETO.zip` não estavam acessíveis nesta
sessão (só o repositório remoto via `gh`, sem esse arquivo local). Não
inventei que o pacotão foi atualizado — isso fica pendente de quem tiver os
bytes reais.

## Deliberadamente NÃO feito nesta rodada (declarado, não fabricado)

- Biblioteca `/artefatos` com filtros completos (agente/modelo/missão/tipo/data/módulo/PR/issue/estado/pacote) — o índice global (`atualizarIndiceGlobal`) já lista todos os artefatos com schema tolerante; uma rota dedicada com filtros é trabalho novo, não uma extensão de uma linha.
- API REST (`GET /api/artifacts`, `/:id`, `/:id/manifest`) — o servidor atual serve estático; adicionar rotas JSON é seguro mas é escopo novo, não incluído pra manter o PR revisável.
- Renderer 3D — declarado `3D_NOT_APPLICABLE` para `session-report` (um relatório não precisa de 3D pra ser entendido). Fica disponível como capability futura quando um `artifact_type` realmente se beneficiar (ex.: mapa de dependências, grafo).
- Reempacotamento do ZIP 01–36 — bytes não disponíveis, ver acima.

## Segurança verificada

- `sanitizeText` bloqueia PAT/Bearer/JWT/provider key/bot token/chave privada — 5 testes.
- `isSensitivePath`/`classifyPaths` bloqueiam `.env`, `secrets/`, `.ssh/`, `.pem`/`.key` — `state` vira `BLOCKED` automaticamente, nunca silencioso.
- Nenhum `.env`, token, cookie, PAT, chave SSH ou connection string em nenhum arquivo deste PR (busca manual antes de commitar).
