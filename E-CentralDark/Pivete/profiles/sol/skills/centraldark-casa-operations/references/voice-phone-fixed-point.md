# Voz no Telefone — Ponto Fixo e Detour Evitado (sessão 30/08)

## Contexto
CHEFE queria **falar com o Hermes por voz no telefone**. O agente desviou para
subir o Hermes WebUI na 8788 + Tailscale Serve (HTTPS) pensando que era o alvo.
CHEFE cortou: "MAIS AXOP QUE NAO PECISA SUBIR HEREMS EU SO QUERO FALA PELO
TELEFONE POW SO ISO FALA POR VOZ AINDA NAO CNECTOU! ESSE E O PONTO FIXCO ATUAL!"

## Lição (CORTANTE — embed no fluxo, não só memória)
- Quando o objetivo FINAL é voz no celular, NÃO desviar para subir WebUI/chat
  visual. Medir o que já existe e fechar o gap real de voz.
- Hermes já roda (PID estável). O ponto é **voz não conectou**, não "precisa
  subir Hermes".

## O que a Casa já tem (medido nesta sessão)
- `config.yaml` do Hermes tem TTS/STT configurados:
  ```yaml
  tts:
    voice: pt-BR-FranciscaNeural
    command: 'curl ... http://127.0.0.1:8648/api/hermes/voice/proxy/default/v1/tts'
  stt:
    model: whisper-1
  voice:
    auto_tts: true
  ```
- A voz do Hermes SAÍA por `http://127.0.0.1:8648/api/hermes/voice/...` —
  depende do servidor `hermes-web-ui` / `hermes-studio` na **8648**.
- Os 4 MCP `hermes-studio-*` (api/browser/devices/use) no `config.yaml`
  apontam para `HERMES_WEB_UI_URL: http://127.0.0.1:8648` e para binário
  `C:\Users\danda\AppData\Roaming\npm\node_modules\hermes-web-ui\bin\hermes-studio-mcp.mjs`.
- **Estado medido:** o pacote `hermes-web-ui` npm global NÃO está instalado
  (binário inexistente) → MCP caem com `Connection closed` e a voz na 8648
  está morta.

## Rotas reais de voz no telefone (não detour)
1. **Hermex** (app iOS do Hermes): tem microfone/alto-falante nativos. Pode não
   usar o `tts.command` da 8648 — testar o micro nele direto.
2. **Telegram** (bot já conectado, chat_id `1901426549` visto no log): resposta
   em áudio do Hermes depende da 8648 viva.

## Comandos de diagnóstico (reutilizáveis)
```bash
# Porta de voz viva?
netstat -ano | grep ":8648"

# Onde os MCP de estúdio apontam?
grep -n "hermes-studio\|8648" "C:\Users\danda\AppData\Local\hermes\config.yaml"

# Pacote hermes-web-ui instalado?
npm ls -g 2>&1 | grep -i hermes
npm root -g
```

## Cron jobs pulando (não erro crítico)
Log mostrou jobs `Telemetry collection` / `screenpipe-monitor` SKIPPED por
"global inference config drifted" (provider mudou pra `nous/tencent/hy3:free`).
O scheduler pausa por segurança (anti-spend). Para reativar:
`cronjob action=update job_id=<id> provider=nous model=tencent/hy3:free`
ou manter pulando — não quebra nada.
