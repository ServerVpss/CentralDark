---
name: integration-event-proof
description: "Use when claiming slash/gateway/Telegram integration done."
---

# Integration Event Proof

Class-level discipline for Hermes Casa (profile pivete) and similar agent gateways.

## Core law

```text
PROVE THE ORIGINAL USER EVENT
≠
prove a collateral path that looks the same
```

| Collateral (partial) | Original event (required for full PASS) |
|---|---|
| Bot API `sendMessage` with same keyboard | User slash `/command` through gateway dispatch |
| Unittest of pure engine/UI builder | Adapter + slash handler + live process load |
| Gateway restart then silence | Reproduce the failing command again |
| "I can import the function in a script" | Same code path the gateway process runs |

## Pivete gold metric

```text
FELICIDADE = distância(erro_inicial → resultado_funcional_diante_dos_olhos)
```

- Ouro = humano toca/clica e vê.
- Arquivo `PASS` sozinho não fecha integração de interface.
- Autoria da intenção: SEGREDO/PIVETE; mérito compartilhado; prova no ambiente real.

## Workflow when integration fails

```text
1. Capture real traceback (sanitize secrets/chat ids)
2. Separate: MANUAL_OK vs COMMAND_PATH_FAIL
3. Reproduce command path in isolation (no fake PASS from manual)
4. One Writer on the failing file (lock if available)
5. Reviewers read-only in parallel
6. Minimum patch
7. Retest ORIGINAL event
8. Mutant: break the fix → test must go red
9. Only then PASS
```

## Preferências Pivete (obrigatórias)

1. **Duplicata / goal que já existe** → parar e `srr`. Zero V1/V2/V3 paralelo. Estender ponto canônico.
2. **Direção clara + fatos no disco** → não perguntar o óbvio; só lacuna que muda alvo/auth/risco.
3. **Paralelo cirúrgico** → enquanto debug/código roda, operar gateway/Telegram no mesmo turno.
4. **Instinto Superior** → intenção humana + lógica + matemática dos fatos atuais; melhoria só se fatos justificarem.
5. **Zero regressão** → rota manual/conhecida permanece enquanto corrige o comando quebrado.

## Pitfalls (gateway Telegram / adapter)

1. **`Path` bare no adapter** — topo pode ser `Path as _Path`. Em helper novo: `from pathlib import Path as ComboPath` local.
2. **`NoneType` / `__dict__` em importlib** — não `module_from_spec` + `exec_module` com loader None. Preferir `import`+`reload` ou `runpy.run_path`.
3. **Menu manual ≠ slash verde** — documentar baseline dual; mutante no loader.
4. **Restart quieto ≠ PASS** — sem reproduzir o evento original, estado = NÃO_VERIFICADO.
5. **Notify** — card curto ao humano; traceback só em log local sanitizado.

## Related existing pieces (do not duplicate)

- `systematic-debugging` — root cause before patch
- `debug-realtime-cirurgico` — esteira WATCH/FINGERPRINT/LOCK (user-owned; adopt if curator should maintain)
- `combo-potencia` — pacote/menu (user-owned)
- `anti-zona-burra-gate` — affordance oficial > URL chutada (user-owned)
- `verification-before-completion` — hub; same spirit, broader

If those user-owned skills should receive patches from background curator:
`hermes curator adopt <name>`

## Support files

- `references/combo-potencia-slash-case.md` — concrete dual-path regression
- Runtime: `profiles/pivete/debug-cirurgico/cli.py combo-case`
