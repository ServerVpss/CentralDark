# Teste de Transcrição (STT) CentralDark — 04/08/2026

## Cenário
A rota `/v1/audio/transcriptions` foi identificada no `MANUAL.html` como viva, mas reportando 400 em testes de corpo vazio.

## Alvo
URL: `https://api.centralldark.com/v1/audio/transcriptions`
Método: `POST`
Auth: Nenhuma (Fronteira aberta/interna)
Modelo: `openai/gpt-4o-mini-transcribe`

## Receita de Teste (curl)
```bash
# Necessário usar caminho absoluto Windows se rodar via terminal Hermes
AUDIO="C:\Users\danda\AppData\Local\hermes\profiles\pivete\cache\audio\arquivo.ogg"

curl -s -X POST "https://api.centralldark.com/v1/audio/transcriptions" \
     -F "file=@$AUDIO" \
     -F "model=openai/gpt-4o-mini-transcribe" \
     -w "\nHTTP:%{http_code} total_time:%{time_total}\n"
```

## Resultado Comprovado
- **Status:** HTTP 200
- **Latência:** ~3.0s
- **Qualidade:** 100% (bateu com o texto original do TTS).
- **Veredito:** A ponte Supabase Edge -> Lovable para áudio está operacional e funcional.

## Pitfall
A rota de TTS (`/v1/audio/speech`) permanece retornando **HTTP 503 (rota morta)**. Não confundir o sucesso do STT com a disponibilidade do TTS.
