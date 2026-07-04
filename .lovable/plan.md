# 🎯 Plano — Portas Ativas + Enxame Áudio (WebUI)

## Fase 1 — Mapa das Portas 🛠️
Rodar na VPS (via `vps_run_once_script`) e te devolver o placar visual:

```bash
ss -tlnp | awk 'NR>1 {print $4, $6}' | sort -u
pm2 jlist | jq -r '.[] | "\(.name) | pid=\(.pid) | status=\(.pm2_env.status) | port=\(.pm2_env.env.PORT // "-")"'
```

Saída: tabela `PORTA | SERVIÇO | STATUS` marcando 🟢/🔴 e destacando as do WebUI (8080/3000/8000 típicas do Open WebUI).

## Fase 2 — Enxame Áudio (10 sub-agentes paralelos) 🔊🚀

Todos disparados em paralelo via `spawn_agent`, cada um com escopo cirúrgico. Nada sequencial.

| # | Agente | Missão |
|---|--------|--------|
| 1 | **LogHunter-WebUI** | `pm2 logs open-webui --lines 500 --nostream` filtrando `audio\|whisper\|tts\|stt\|ffmpeg\|codec` |
| 2 | **STT-Scanner** | Checar backend Whisper/faster-whisper: modelo carregado, GPU/CPU, erro de load |
| 3 | **TTS-Scanner** | Checar engine TTS (OpenAI/ElevenLabs/local): chave, endpoint, voz configurada |
| 4 | **FFmpeg-Doctor** | `ffmpeg -version` + testar decode WebM/Opus (formato que o browser manda do mic) |
| 5 | **Codec-Auditor** | Ver se libopus/libvorbis/libmp3lame estão presentes no container/host |
| 6 | **Config-Reader** | Ler `config.json`/env do Open WebUI: `AUDIO_STT_ENGINE`, `AUDIO_TTS_ENGINE`, URLs |
| 7 | **Network-Probe** | Testar endpoints internos de áudio (`/api/v1/audio/transcriptions`, `/speech`) com curl |
| 8 | **Permission-Cop** | Checar permissões da pasta de upload/cache de áudio + espaço em disco |
| 9 | **Browser-Console** | Puxar erros do console do WebUI (via replay se houver, ou instruir teste) |
| 10 | **Fabler-Consult** | Consultar Fabler (`elite_gateway_chat`) com sintomas coletados pra segunda opinião |

Cada agente devolve: **causa provável + evidência (log/linha) + fix sugerido**.

## Fase 3 — Consolidação 📊
Placar único monospace:

```
ÁREA          STATUS   EVIDÊNCIA
▓▓▓▓▓▓▓▓░░  STT      🔴 erro X linha Y
▓▓▓▓▓▓░░░░  TTS      🟡 config faltando
...
```

+ **Diagnóstico final** (Leigo / Técnico) + **próximo passo** (1 clique).

## Fase 4 — Notificação 📣
Card no privado admin + linha no canal Status (regra padrão pós-ação).

---

**Regras respeitadas:** Modo Enxame, Método Gamificado, consultar Fabler, não mexer em áreas 🔒, autoridade VPS (só leitura nesta fase).

Confirma que disparo? 🚀
