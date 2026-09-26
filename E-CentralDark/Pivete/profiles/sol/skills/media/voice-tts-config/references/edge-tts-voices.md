# Edge TTS — Vozes e Referências

## Links oficiais

- Doc oficial: https://edge-tts.readthedocs.io/en/latest/
- GitHub: https://github.com/EdgeTTS/EdgeTTS

## Vozes pt-BR (Brasil)

| Código | Gênero | Estilo |
|--------|--------|--------|
| `pt-BR-FranciscaNeural` | Feminino | Suave, padrão |
| `pt-BR-AntonioNeural` | Masculino | Sério, profissional |
| `pt-BR-ThalitaNeural` | Feminino | Jovem, natural |

## Pitfall

Sem especificar `voice`, o Edge TTS pode cair no inglês padrão mesmo com texto em PT-BR. Sempre passar `voice` explícito.

## CLI de teste

```bash
edge-tts --voice pt-BR-FranciscaNeural --text "Olá Pivete!" --write-media teste.mp3
edge-tts --voice pt-BR-AntonioNeural --text "Olá Pivete!" --write-media teste.mp3
edge-tts --voice pt-BR-ThalitaNeural --text "Olá Pivete!" --write-media teste.mp3
```
