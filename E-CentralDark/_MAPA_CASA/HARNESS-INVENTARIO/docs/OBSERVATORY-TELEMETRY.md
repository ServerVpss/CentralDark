# 🧿 CENTRALDARK OBSERVATORY — Telemetria Mensurável

## Missão
Transformar saúde, performance e comportamento da Casa em métricas auditáveis, com unidade, fonte, timestamp e escopo.

## Domínios
- 🎮 FPS/FRAME: FPS atual/médio, 1% low, frametime, p50/p95/p99, stutter, dropped frames.
- 🔊 AUDIO: dispositivo, sample rate, buffer, latência, dropout, driver, serviços, eventos.
- 🎥 VIDEO: capture FPS, encoder, bitrate, resolução, frames perdidos, encode latency.
- 🧠 CPU: uso total/core, clock, temperatura, potência, thermal throttle.
- 🎨 GPU: utilização, VRAM, clock, temperatura/hotspot, fan RPM, potência.
- 💾 STORAGE: throughput, IOPS, latência, temperatura, espaço livre.
- 🌐 NETWORK: throughput, ping, jitter, packet loss, bridge latency.
- 🤖 AGENT/RUNTIME: modelo, provider, response time, retry, fallback, tool latency, erros por categoria.

## Envelope universal de métrica
`timestamp + host + component + metric + value + unit + source + version + status + evidence + confidence + scope`

## Regra
`MEASURED != ABSOLUTE_TRUTH`; métrica vale no escopo e instante observados.
`100% COVERAGE = 100% DO DENOMINADOR DECLARADO`, nunca 100% do universo.
