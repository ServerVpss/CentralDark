---
name: qa-teste-de-software
description: >
  Biblioteca QA autoconsultativa com progressive disclosure. Ativa em falhas,
  regressões, retomadas, checkpoints e pedidos explícitos de Enxame. Consulta
  somente o manifest e no máximo três Markdown únicos, devolve QA_CONTEXT_DELTA,
  preserva a missão atual e só consolida aprendizado com prova causal completa.
metadata:
  hermes:
    tags: [qa, consulta-seletiva, gatilho, enxame, aprendizado-causal, pivete]
    category: software-development
    related_skills: [meta-lupa]
    requires_tools: [terminal]
    progressive_disclosure: true
---

# QA SkillMaster — gatilho, consulta seletiva e aprendizado causal

## Contrato curto

```text
EVENTO REAL
→ manifest.json
→ top-3 heurísticas por gatilho real
→ no máximo 3 Markdown únicos
→ QA_CONTEXT_DELTA
→ Policy Gate
→ teste + regressão + caso negativo
→ aprendizado deduplicado
→ próxima sessão reutiliza
```

Esta skill é **módulo subordinado**. Ela não abre missão nova, não troca objetivo,
não abandona worktree, não muda Writer e não fecha a missão raiz.

## Eventos

- `TEST_FAILED`
- `NODE_CHECK_FAILED`
- `SEMANTIC_FAILURE_WITH_SYNTAX_PASS`
- `REGRESSION_FAILED`
- `TIMEOUT`
- `STATE_TRANSITION_ERROR`
- `NON_IDEMPOTENT_RESULT`
- `REPEATED_ERROR`
- `SESSION_CHECKPOINT`
- `SESSION_RESUME`
- `ENXAME_REQUEST`

Evento desconhecido sem gatilho real retorna `INCONCLUSIVO`. Prioridade nunca cria
match sozinha.

## Regras inegociáveis

- Não carregar o acervo inteiro.
- Não adaptar teste para aceitar código quebrado.
- Não promover `proven=true` sem contrato de prova.
- Não tratar erro de leitura, API, Judge ausente ou resultado vazio como PASS.
- Não ler `.env`, `secrets/`, `tokens/`, `sessions/` ou `.ssh/`.
- Não criar V1/V2/V3/NOVO/FINAL paralelo.
- Não executar Enxame sem pedido explícito.
- Não fazer merge, deploy, VPS, produção ou reescrita histórica.

## Runtime

| Arquivo | Responsabilidade |
|---|---|
| `classificar-evento.mjs` | normaliza evento e preserva missão/workspace |
| `router.mjs` | valida manifest; match real; top-3 |
| `consultar.mjs` | consulta trechos de até 3 Markdown únicos |
| `consolidar-delta.mjs` | produz `QA_CONTEXT_DELTA` fail-closed |
| `policy-gate.mjs` | `AUTO_APPLY` somente com todos os gates |
| `learning-store.mjs` | prova completa, hash estável e deduplicação |
| `enxame-runner.mjs` | CentralDark → OpenAI-compatible → Anthropic |
| `update-bot.mjs` | recebe evento/lote JSONL e deduplica entre sessões |
| `orchestrator.mjs` | coordena, mapeia e verifica o pacote |

## Enxame Ômega

Ativa somente por `ENXAME_REQUEST`, tag `enxame` ou `--enxame`.

Ordem de fallback:

1. `CENTRALDARK_API_KEY`;
2. `OPENAI_API_KEY`;
3. `ANTHROPIC_API_KEY`;
4. nenhuma funcional → `ENXAME_UNAVAILABLE`.

Credenciais são lidas apenas do ambiente já injetado. Nenhum arquivo de segredo é
aberto. O papel `fable-adversarial` tenta quebrar a hipótese antes do Judge.

## Aprendizado promovível

`proven=true` sozinho não vale. Exigir:

```text
SOURCE_IDS
ERRO_EXATO
CAUSA
CORRECAO_MINIMA
TESTE_ANTES=FAIL
TESTE_DEPOIS=PASS
REGRESSAO=PASS
CASO_NEGATIVO=PASS
FAIL=0
SKIPPED=0
UNKNOWN=0
ARQUIVOS_FORA_ESCOPO=0
HEAD_FINAL
ROLLBACK_OU_REVERSIBILIDADE
```

A identidade do aprendizado é determinística. Repetir o mesmo evento retorna
`EVENTO_JA_REGISTRADO`, não cria outra memória.

## Gatilho entre sessões

Para um evento único:

```bash
echo '{"event":"TEST_FAILED","evidence":{"error":"..."}}' \
  | node runtime/update-bot.mjs --stdin
```

Para lote incremental:

```bash
node runtime/update-bot.mjs --file eventos.jsonl
```

O checkpoint impede reprocessar o mesmo evento. O bot produz delta e receipt; não
altera código automaticamente.

## Verificação real

```bash
node runtime/orchestrator.mjs --self-map
node runtime/orchestrator.mjs --verify
```

`--verify` executa validação do manifest, `node --check`, testes discriminativos,
demo local e varredura contra leitura indevida de `.env`.
