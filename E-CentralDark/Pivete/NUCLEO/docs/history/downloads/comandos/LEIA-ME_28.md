# 🎙️ CentralDark — Kit de Vozes

Pasta pra você ouvir todas as vozes e gerar áudio em casa, Pivete.

## 1. Ouvir as vozes
Abre o **`index.html`** no navegador (clique duplo). São 13 vozes, cada uma com play e descrição.

## 2. Gerar áudio seu (Windows)
No PowerShell, dentro desta pasta:

```powershell
.\gerar-voz.ps1 -Texto "Fala Pivete, o Hermes ta vivo" -Voz nova
```

Ele gera o MP3 e já abre tocando.

Parâmetros:
- `-Texto` — o que falar (obrigatório)
- `-Voz` — uma das 13 (padrão `nova`)
- `-Velocidade` — 0.25 a 4.0 (padrão 1.0)
- `-Instrucoes` — direção de sotaque/emoção
- `-Saida` — nome do arquivo

## 3. As 13 vozes

| Voz | Perfil | Onde usar |
|---|---|---|
| `alloy` | neutra | padrão seguro, serve pra tudo |
| `ash` | firme grave | alerta e aviso de sistema |
| `ballad` | suave emotiva | narração lenta |
| `coral` | feminina clara | atendimento |
| `echo` | masculina seca | relatório direto |
| `fable` | narrador | leitura longa, história |
| `onyx` | grave profunda | locutor, autoridade |
| `nova` | feminina energética | **a mais usada em bot** |
| `sage` | madura serena | explicação técnica |
| `shimmer` | leve e doce | boas-vindas |
| `verse` | teatral | mais expressiva de todas |
| `marin` | conversacional | parece gente falando |
| `cedar` | masculina calorosa | papo próximo |

## 4. A rota

```
POST https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/audio-speech
```

Corpo (JSON):
```json
{
  "input": "texto",
  "voice": "nova",
  "response_format": "mp3",
  "instructions": "Fale em portugues brasileiro nativo.",
  "speed": 1.0
}
```

Formatos aceitos: `mp3`, `wav`, `opus`, `aac`, `flac`.
Pra streaming em tempo real, manda `"stream_format": "sse"`.

> ⚠️ Não existe voz chamada `sol`. Isso é nome de **modelo** (`gpt-5.6-sol`), não de voz. O gateway devolve 400 se pedir.
