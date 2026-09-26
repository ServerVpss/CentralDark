# QA SkillMaster — pacote único com contraprova executável

Destino:

```text
C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\qa.teste-de-software.MARKDOWN
```

## O que existe de verdade

- `SKILL.md`: contrato curto de progressive disclosure e execução por causa comum;
- `manifest.json`: 17 gatilhos com IDs e caminhos únicos;
- `runtime/router.mjs`: match real, top-3 clampado e manifest fail-closed;
- `runtime/consultar.mjs`: até três Markdown internos, com `realpath`;
- `runtime/consolidar-delta.mjs`: missão real obrigatória e campos de uma linha;
- `runtime/policy-gate.mjs`: contadores só aceitam zero real;
- `runtime/learning-store.mjs`: recibo content-addressed, SHA, integridade armazenada, lock vivo e deduplicação;
- `runtime/update-bot.mjs`: claim atômico e reavaliação de `INCONCLUSIVO`;
- `runtime/enxame-runner.mjs`: fallback CentralDark → OpenAI → Anthropic;
- `tests/contraprovas-p0.test.mjs`: contraprovas permanentes de estado, concorrência, sanitização e integridade;
- `skil.txt`: goal subordinado à missão atual;
- `01..05`: conteúdo original do PACOTÃO preservado, inclusive material bruto;
- `AUDITORIA/`: comando do adversário, matriz, preservação do legado, hashes e recibo da árvore.

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

A verificação exige suíte não vazia, todos os testes verdes e correspondência integral
com `AUDITORIA/FILE-HASHES.sha256`. `INCONCLUSIVO`, `BLOCKED`, `UNKNOWN`, `SKIPPED`,
ausência de missão, arquivo alterado ou arquivo novo sem hash não viram PASS.

## Evento automático em delta

```bash
echo '{"event":"TEST_FAILED","mission":{"id":"PR664"},"evidence":{"error":"parser não reconheceu trailer"}}' \
  | node runtime/update-bot.mjs --stdin
```

Evento concluído é deduplicado. Evento `INCONCLUSIVO` não avança checkpoint e
pode ser reavaliado quando o conhecimento mudar.

## Enxame

```bash
node runtime/enxame-runner.mjs --mode econo --prompt "diagnóstico"
```

Sem variável de API funcional, retorna `ENXAME_UNAVAILABLE`. O runtime não abre
`.env` e não imprime credenciais.

## Regra de ouro

```text
Não corrigir achados um por um quando a causa já pode ser agrupada.
Mapear promessas → executar contraprovas → corrigir causas → regressões → prova limpa.
```

## Aprendizado com prova material

Um aprendizado só é promovido quando `sourceIds` contém pelo menos um
`receipt:<sha256>` real em `learning/receipts/`, cujo conteúdo está ligado por
`contractDigest` ao erro, causa, correção, testes, contadores e HEAD daquele registro.
Alterar o JSON depois da promoção invalida a reutilização.
