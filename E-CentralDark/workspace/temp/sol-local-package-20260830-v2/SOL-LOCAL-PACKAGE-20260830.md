# Pacote SOL local - 2026-08-30

## Escopo

Pacote local da superficie SOL em `E:/CentralDark/workspace/sol/02-APP-SOL/SOL-DESKTOP-POC-ACTIVE/apps/sol-desktop`, com gateway local, adaptador STT e provas de voz. O pacote nao inclui segredos, caches, bancos pessoais ou `node_modules`.

## Provas executadas

| Sinal | Resultado | Evidencia |
| --- | --- | --- |
| UI Vite local | PASS | `http://127.0.0.1:1420/` ativo |
| Ingress SOL | PASS | `GET http://127.0.0.1:8787/health` -> 200; `stt_adapter=true` |
| Chat SOL | PASS | `POST /v1/sol/respond` -> 200 |
| STT local | PASS | multipart `POST /v1/audio/transcriptions` -> 200; `proof=SOL_STT_LOCAL` |
| TTS Kokoro | PASS | `POST http://127.0.0.1:8880/v1/audio/speech` -> 200; WAV valido |
| Testes | PASS | 3 arquivos, 6 testes |
| Build Vite | PASS | `npm run build` concluido |
| Contraprova de diff | PASS | `git diff --check` sem saida |

## Artefatos de voz

- STT: `E:/CentralDark/workspace/sol/03-VOZ/provas/sol-stt-local.receipt.json`
- TTS original: `E:/CentralDark/workspace/sol/03-VOZ/provas/sol-kokoro-local.wav`
- TTS contraprova: `E:/CentralDark/workspace/sol/03-VOZ/provas/sol-kokoro-counterproof-20260830.wav`
- SHA-256 TTS contraprova: `FC53EB9CDCFD1C90D98D336607918AFB69DABEFBD7507347B02ABBF714B64BD7`

## Limites honestos

- `MICROPHONE_CAPTURE=UNKNOWN`: a captura fisica pelo WebView/Tauri nao foi simulada por clique nesta sessao.
- `NATIVE_TAURI_BUILD=BLOCKED`: o binario debug sem assinatura foi bloqueado pelo Windows Code Integrity; nao foi desativada nenhuma protecao.
- `HERMES_PHYSICAL_REHOME=PENDING`: a reorganizacao do clone em uso aguarda o processo que mantem os arquivos abertos.
- `GRAPHIFY_FULL_RECONCILIATION=PENDING`: o grafo controlado deve rodar depois de congelar a arvore e silenciar o runtime.

## Regra de fechamento

Este pacote e `LOCAL_RUNTIME_VOICE_PASS`, nao `FIXED_POINT_LOCAL`. A declaracao final continua condicionada as provas pendentes acima.
