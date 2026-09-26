---
name: qa-teste-de-software
description: >
  Biblioteca QA autoconsultativa com progressive disclosure, contraprovas
  executáveis e aprendizagem causal. Ativa em falhas, regressões, retomadas,
  checkpoints e pedidos explícitos de Enxame. Consulta o manifest e no máximo
  três Markdown únicos, devolve QA_CONTEXT_DELTA e opera fail-closed.
metadata:
  hermes:
    tags: [qa, consulta-seletiva, gatilho, enxame, aprendizado-causal, pivete]
    category: software-development
    related_skills: [meta-lupa]
    requires_tools: [terminal]
    progressive_disclosure: true
---

# QA SkillMaster — gatilho, contraprova e aprendizado causal

## Contrato curto

```text
MISSÃO REAL EXISTENTE
→ EVENTO REAL
→ manifest.json validado
→ top-3 caminhos únicos por gatilho real
→ trechos seletivos de no máximo 3 Markdown
→ QA_CONTEXT_DELTA tipado e sanitizado
→ Policy Gate fail-closed
→ teste antes/depois + regressão + caso negativo
→ recibo content-addressed ligado ao contrato + SHA
→ aprendizado armazenado revalidado contra fingerprint e recibo
→ próxima sessão reutiliza
```

Esta skill é **módulo subordinado**. Ela não abre missão nova, não troca objetivo,
não abandona worktree, não muda Writer e não fecha a missão raiz.

Missão sem `mission.id` retorna:

```text
STATUS=BLOCKED_MISSION_REQUIRED
MISSAO_ATUAL_PRESERVADA=NAO
PROXIMO_ESTADO=INALTERADO
```

## Execução por visão inteira

Quando o território já estiver conhecido, não corrigir achados um por um:

```text
PROMESSAS DO PACOTE
→ MATRIZ DE CONTRAPROVAS
→ INVARIANTES VIOLADOS
→ CAUSAS COMUNS
→ UMA CORREÇÃO COESA POR CAUSA
→ REGRESSÕES PERMANENTES
→ EXTRAÇÃO LIMPA
→ PROVA FINAL
```

Passo a passo permanece válido somente para descobrir território ainda desconhecido.

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
match sozinha. `INCONCLUSIVO` não avança checkpoint e pode ser reavaliado depois.

## Regras inegociáveis

- Não carregar o acervo inteiro.
- Não adaptar teste para aceitar código quebrado.
- Não promover `proven=true`, palavras `PASS` ou `sourceIds` textuais sem recibo content-addressed existente e ligado ao contrato exato.
- Não tratar suíte vazia, erro de leitura, API, Judge ausente ou resposta vazia como PASS.
- Contadores só equivalem a zero quando são `0` numérico ou texto `"0"`; `SIM` bloqueia.
- Não ler `.env`, `secrets/`, `tokens/`, `sessions/` ou `.ssh/`.
- Redigir PAT, JWT, Slack, Stripe, Telegram, Bearer, chaves e connection strings.
- Não criar V1/V2/V3/NOVO/FINAL paralelo.
- Não executar Enxame sem pedido explícito.
- Não fazer merge, deploy, VPS, produção ou reescrita histórica.

## Runtime

| Arquivo | Responsabilidade |
|---|---|
| `classificar-evento.mjs` | normaliza evento sem inventar missão |
| `router.mjs` | valida manifest, paths únicos, match real e top-3 clampado |
| `consultar.mjs` | usa `realpath` e consulta até 3 Markdown internos |
| `consolidar-delta.mjs` | produz delta de linha segura; conteúdo externo fica prefixado |
| `policy-gate.mjs` | `AUTO_APPLY` somente com todos os gates e zeros reais |
| `learning-store.mjs` | recibo content-addressed, SHA, integridade armazenada, lock vivo e deduplicação |
| `enxame-runner.mjs` | CentralDark → OpenAI-compatible → Anthropic |
| `update-bot.mjs` | claim atômico; bloqueado/inconclusivo não checkpointa |
| `orchestrator.mjs` | self-map, verificação, suíte não vazia e recibo |

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

Exigir:

```text
SOURCE_IDS contendo pelo menos `receipt:<sha256>` existente em `learning/receipts/`
COMMIT opcional no formato `commit:<sha-git>`
RECEIPT_CONTRACT_DIGEST igual ao contrato exato do aprendizado
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
HEAD_FINAL com SHA Git de 40 ou 64 hex
ROLLBACK_OU_REVERSIBILIDADE
```

`inventado`, `banana`, placeholders, recibo ausente/adulterado e HEAD textual nunca promovem ouro.
Na reutilização, fingerprint, contract digest, prova e recibo são recalculados. Concorrência
no mesmo padrão é serializada por lock que não é roubado enquanto o processo dono estiver vivo.

## Gatilho entre sessões

```bash
echo '{"event":"TEST_FAILED","mission":{"id":"M1"},"evidence":{"error":"..."}}' \
  | node runtime/update-bot.mjs --stdin
```

Para lote incremental:

```bash
node runtime/update-bot.mjs --file eventos.jsonl
```

O bot produz delta e receipt; não altera código automaticamente.

## Verificação real

```bash
node runtime/orchestrator.mjs --self-map
node runtime/orchestrator.mjs --verify
```

`--verify` exige pelo menos um arquivo de teste e `pass === total > 0`, além de
zero `fail`, `skipped`, `cancelled` e `todo`. Também revalida
`AUDITORIA/FILE-HASHES.sha256`: alteração, remoção ou arquivo novo não auditado derruba o PASS.
As contraprovas permanentes vivem em `tests/contraprovas-p0.test.mjs`.
