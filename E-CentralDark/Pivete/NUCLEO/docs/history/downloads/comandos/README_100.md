# QA SkillMaster — consulta sob demanda, Enxame e memória causal

Pacote para:

```text
C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\qa.teste-de-software.MARKDOWN
```

## O que existe de verdade

- `SKILL.md`: contrato pequeno de progressive disclosure;
- `manifest.json`: gatilhos indexados e validados;
- `runtime/router.mjs`: match real; prioridade não inventa match;
- `runtime/consultar.mjs`: até três Markdown únicos, com path traversal bloqueado;
- `runtime/enxame-runner.mjs`: fallback CentralDark → OpenAI → Anthropic;
- `runtime/update-bot.mjs`: eventos em delta e deduplicação entre sessões;
- `runtime/policy-gate.mjs`: fail-closed;
- `runtime/learning-store.mjs`: contrato causal completo e fingerprint estável;
- `tests/`: regressões que quebravam a versão anterior;
- `skil.txt`: goal subordinado à missão atual;
- `01..05`: conteúdo original preservado.

## Bootstrap

```text
/goal C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\qa.teste-de-software.MARKDOWN\skil.txt
```

## Prova local

```bash
cd qa.teste-de-software.MARKDOWN
node runtime/orchestrator.mjs --self-map
node runtime/orchestrator.mjs --verify
node runtime/orchestrator.mjs
```

## Evento automático em delta

```bash
echo '{"event":"TEST_FAILED","mission":{"id":"PR664"},"evidence":{"error":"parser não reconheceu trailer"}}' \
  | node runtime/update-bot.mjs --stdin
```

O mesmo evento não é reprocessado na próxima sessão.

## Enxame

```bash
node runtime/enxame-runner.mjs --mode econo --prompt "diagnóstico"
```

Sem variável de API funcional, retorna `ENXAME_UNAVAILABLE`. O runtime não abre
`.env` e não imprime credenciais.

## Regra de ouro

```text
A skill não sabe tudo o tempo todo.
Ela reconhece o evento, consulta o mínimo, prova, registra e reutiliza.
```
