# CENTRALDARK — TRIGGER FABRIC FULL PACKAGE

Família canônica para interligar gatilhos da Casa aos owners existentes sem criar segundo cérebro, dispatcher, MCP, promotor ou workflow paralelo.

## Trigger mestre humano

```text
#ACORDAR + !CALIBRAR + !MULTIBUSSOLA
```

Todo bot/modelo/agente que entra na CentralDark herda o mesmo boot da Casa. O composto recupera estado, calibra intenção/escopo/tools/prova, abre eixos materiais, converge no rendezvous, ativa MetaLupa proporcionalmente ao risco, roteia para owners existentes e passa toda saída material pelo `OUTPUT_GUARD` antes do `REALITY_JUDGE`.

```text
BOT_ENTRY
→ CENTRALDARK_AI_BOOT
→ DESTINATION_LOCK
→ #ACORDAR A1..A5
→ !CALIBRAR C1..C5
→ !MULTIBUSSOLA material
→ !META_LUPA adaptativa
→ RENDEZVOUS
→ OWNER
→ ONE_WRITER
→ EXECUTE_MINIMAL_DELTA
→ OUTPUT_GUARD
→ REALITY_JUDGE
→ RECEIPT / LAST_GOOD_STATE / NEXT_CURSOR
```

`ENGINE != OWNER`: Mistral, GPT, Claude, Codex, Grok, Gemini e motores futuros carregam a mesma Casa. Hermes/PIVETE preserva execução e continuidade quando seu runtime estiver realmente vivo e medido.

## Conteúdo desta família

- `ARCHITECTURE.md`
- `ARCHITECTURE.mmd`
- `CONTRACT.yml`
- `TRIGGERS.yml`
- `ENGINE_BINDING.yml`
- `ADVERSARIAL_HANDOFF.yml`
- `LIVE_STATE.md`
- `HISTORY.md`
- `COUNTERPROOF.md`
- `RASTRO.md`
- `RECEIPT.md`
- `SOURCES.json`

A workflow existente `.github/workflows/trigger-fabric-package.yml` gera também:

- `ARCHITECTURE.png`
- `MANIFEST.json`
- `SHA256SUMS.txt`
- `VERIFY-RESULT.txt`
- `CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip`

## CI / PR / labels — REUSE_BEFORE_CREATE

Esta família não cria segundo pipeline. Reutiliza:

```text
.github/workflows/porta-de-entrada.yml
.github/workflows/autonomia-promocao.yml
.github/workflows/trigger-fabric-package.yml
```

`autonomia-promocao` executa a verificação do contrato desta família antes de promover. A taxonomia de labels continua em `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md`: label é sinal, não autoridade; `👑 PERMITO-SEGREDO` representa autoridade humana delegada e `✅ PR CONFIRMADO` é somente resultado derivado pós-prova.

## Anti-ruído e continuidade

```text
NO_NEW_INFORMATION → NO_CHANGE → NEXT
BYTE_IDENTICAL → PROCESS_ONCE_KEEP_PROVENANCE
LAST_GOOD_STATE → INPUT_DIFF → TARGETED_REVALIDATION → NEXT_CURSOR
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
```

## Limite da prova

```text
PACKAGE_100_PERCENT = permitido somente se o verificador do pacote passar
GLOBAL_RUNTIME_100_PERCENT = NOT_PROVEN
ENGINE_BINDING_DOCUMENTED != ENGINE_RUNTIME_LOADED
```

O pacote prova integridade/reprodutibilidade do artefato. Código presente no repositório não prova que o mesmo runtime está vivo agora no Windows/VPS.

## Base viva

A família não congela HEAD como verdade permanente. `LIVE_STATE.md` registra a última medição e qualquer HEAD posterior exige remedição antes de promover claim de estado atual.
