# C_HERMES_LOCAL — Mapeamento do Hermes
C:\Users\danda\AppData\Local\hermes

## Arquivos-chave
- SOUL.md = materialização da canonica (match exato, ALREADY_IN_MAIN)
- config.yaml = tts.edge.voice = pt-BR-FranciscaNeural (alterado nesta sessão)
- mcp-tokens/ = [REDACTED] (tokens OAuth, não ler)
- state.db = 17MB (sessoes)
- skills/
  - software-development/prompt-discipline (CRIADA nesta sessão)
  - github/ (7 skills)
  - hermes-agent/ (app + skills)

## Runtime
- hermes_cli serve (gateway) = PID 4748 (ESSENCIAL)
- dashboard = PID 10136 (morto, reabre se precisar)
- Chrome zumbi = PID 10916 (morto)

## computer_use / cua-driver
- wake word: onnxruntime DLL corrigido via VC++ Redist 2022 (MSVC 14.44)
- TTS: pt-BR funcionando
