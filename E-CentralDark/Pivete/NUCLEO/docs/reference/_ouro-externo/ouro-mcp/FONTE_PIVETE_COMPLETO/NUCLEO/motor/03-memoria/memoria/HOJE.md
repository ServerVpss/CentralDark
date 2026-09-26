# HOJE — 07/08/2026
## O QUE ACONTECEU
- Skill `padrao-telemetria-navegador` v1.2.0 criada e travada
- UIAccess configurado no .env (HERMES_CUA_DRIVER_CMD)
- 3 rodadas de calibração OK
- "oi" enviado e ChatGPT respondeu "oioi"
- Causa raiz documentada: default_driver sem UIAccess
- known_failures registrado na skill
## PADRÃO TRAVADO
```
DIGITAR:  type + delivery_mode=foreground + element_id=2186/2145
ENVIAR:   click index 2189 "Enviar prompt" background
TELA:     Chrome PID 1740, window_id 12391728, title "Explicação do Hermes"
CAMPO:    aria-label="Converse com o ChatGPT"
UIAccess: HERMES_CUA_DRIVER_CMD=C:/Users/danda/AppData/Local/Programs/Cua/cua-driver/bin/cua-driver-uia.exe
```
## INSTINTO SUPERIOR APRENDIDO
```
FASE 1:  URL muda → janela muda → "preciso achar de novo"
FASE 2:  PID 1740 → window_id mudou → nova URL → "adaptando..."
FASE 3:  N candidatos → score → melhor → valida → REGISTRA ASSINATURA
ASSINATURA = PID + window_id + title + URL + aba + elemento esperado
"PRESERVE O OURO": não guarda resultado — guarda o MECANISMO que permitiu reencontrar
```
## SÍNTESE NOVA (07/08 tarde)
```text
"Modelo = pensa | Skill = lembra | Logs = provam | Git = consolida"
"Preserva o ouro" = mecanismo, não estado
"Zero regressão" = toda evolução mantém ou melhora o comprovado
"Colapso expõe mecanismo; normalidade esconde"
```
## PRÓXIMO
- Loop 10 rodadas com ChatGPT — PRONTO (campo livre após envio ✅)
- UIAccess生效 após /reset
## 07/08 tarde — skill especialista-de-modelos v0.1.0 + descoberta voice_forbidden
- Skill `pivete/especialista-de-modelos` criada (SKILL/INDEX/TEMPLATES/REFERENCES + changelog)
- Página `modelos/gpt-5.5.md` v0.2.0 — 16 itens Class A (OpenAI System Card + Vellum), 8 itens rejeitados (github blog + blakecrosley)
- 5-classes aplicadas rigorosamente (sem popularidade, sem preço, sem plataforma)
- DESCOBERTA: áudio Telegram falha com `Voice_messages_forbidden` no chat 1901426549 desde 18/07. `hermes send` "sent" engana. Solução: MP3 como anexo (MEDIA:), não bolha de voz.
- REGRAS #30 nova: áudio sempre como anexo
- Atalhos criados: `~/bin/htui.sh` e `~/bin/htui.bat` = `hermes --tui --profile pivete`
- Diagnóstico: `model.default=gpt-5.5` + `model.provider=openai-codex` + `fallback_providers=[]` (vazio). MiniMax-M3 ainda não configurado.
- Pendência: ordem do Pivete pra trocar fallback (R2, precisa de autorização).
