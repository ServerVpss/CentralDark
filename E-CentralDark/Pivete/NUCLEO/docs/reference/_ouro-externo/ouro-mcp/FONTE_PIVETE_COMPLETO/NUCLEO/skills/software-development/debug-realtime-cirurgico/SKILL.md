---
name: debug-realtime-cirurgico
description: "Use when realtime surgical debug: watch gateway errors, fingerprint, single writer lock, parallel reviewers, combo slash regression."
---

# Debug Realtime Cirúrgico

**NÃO é V1/V2/V3 paralelo.** Ponte operacional sobre o que já existe.

## Já existia (reutilizar)
- `systematic-debugging` — root cause antes de patch
- `fable-judge` / revisores — Writer não se auto-aprova
- `meta-lupa` / `anti-zona-burra-gate` — anti falso verde
- `hermes-session-forensics` — paths de `gateway.log` / `errors.log`
- logs: `profiles/pivete/logs/gateway.log`

## Gap que este pacote fecha
```text
WATCH → CAPTURE → FINGERPRINT → DEDUP → REPRO → LOCK WRITER
→ PATCH MÍNIMO → TEST → MUTANTE → RESTORE/ACCEPT → NOTIFY
```

## Ponto canônico (código determinístico)
```text
C:\Users\danda\AppData\Local\hermes\profiles\pivete\debug-cirurgico\
  core.py        # fingerprint, sanitize, queue, lock, fallback, notify
  watcher.py     # read-only tail gateway.log
  repro_combo.py # caso /combo_potencia baseline/corrigido/mutante
  cli.py         # watch-once | capture | combo-case | lock-demo | fallback
  tests/         # 14 testes obrigatórios
```

## Loop
```text
ERRO → traceback real → fixture → análise paralela read-only
→ UM Writer com lock → teste → mutante → restore/promote → notifica
```

## Writer lock
```bash
python cli.py lock-demo --file CAMINHO --writer grok --mission M --action acquire
# segundo writer no mesmo arquivo → BLOQUEADO
python cli.py lock-demo --file CAMINHO --writer grok --mission M --action release
```

## Watcher
```bash
python cli.py watch-once --log C:\Users\danda\AppData\Local\hermes\profiles\pivete\logs\gateway.log
```

## Caso combo_potencia
```bash
python cli.py combo-case
```
Esperado:
- BASELINE_DIRECT_OK=true
- BASELINE_SLASH_BUG_REPRO=true  (padrão NoneType/loader)
- CORRIGIDO_SLASH_OK=true
- MUTANTE_DETECTA_REGRESSAO=true

## Notificação (Telegram curto — sem traceback)
```text
🛡️ DEBUG CIRÚRGICO
ERRO=
ARQUIVO=
LINHA=
WRITER=
REVISORES=
CORREÇÃO=
TESTES=
ROLLBACK=
ESTADO=
```

## Anti-loop
- mesma fingerprint → dedup / reutiliza investigação
- 3 tentativas sem gain → STAGNATION_DETECTED
- restart sem reproduzir evento → NÃO é PASS

## Fallback sem IA
`fallback_bruto`: preserva erro, mantém rota conhecida (ex: menu manual), alerta, **não inventa patch**.

## Relação com systematic-debugging
1. Phase 1 root cause = systematic-debugging
2. Este pacote = esteira realtime + travas determinísticas + prova mutante
