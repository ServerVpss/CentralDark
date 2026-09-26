# Hardware Telemetry Path — Nuvoton + AMD ADL + D3D

## Descoberta (2026-08-23)

O hardware do CHEFE (i5-10400F + RX 580 + 24GB DDR4) expõe monitores reais via:

| Fonte | O que expõe | Uso |
|-------|-------------|-----|
| **Nuvoton NCT6791D** | CPU temp, package power, board sensors, fan RPM | CPU/Board monitoring |
| **AMD ADL** | GPU temp, hotspot, VRAM temp, clocks, fan RPM, power draw | GPU monitoring |
| **D3D** | Render state, GPU usage, VRAM usage | Graphics workload |

## Caminho da Telemetria

```
Nuvoton (CPU/Board/Fans) + AMD ADL (GPU) + D3D (Render)
        ↓
Hardware Telemetry Adapter (MCP tool)
        ↓
Hermes / MCP
        ↓
SOL Dashboard
```

## Sensores Individuais Necessários (GPU)

Para telemetria completa da RX 580, precisam ser expostos via AMD ADL:

- `GPU_TEMP` — temperatura do die
- `HOTSPOT` — hotspot temperature
- `FAN_RPM` — velocidade do cooler
- `VRAM_TEMP` — temperatura da memória
- `POWER_DRAW` — consumo em watts
- `GPU_CLOCK` / `MEM_CLOCK` — clocks atuais
- `GPU_USAGE` / `VRAM_USAGE` — utilização %

## Ferramentas de Validação

| Ferramenta | O que valida |
|------------|--------------|
| **HWiNFO64** (Sensors-only) | Leitura completa Nuvoton + AMD ADL |
| **MSI Afterburner + RivaTuner** | Overlay visual + logging |
| **Libre Hardware Monitor** | Open-source, painel local |
| **CPU-Z** | Identificação apenas (não monitora sensores) |

## Evidência da Sessão (2026-08-23)

| Snapshot | CPU Temp | CPU Power | GPU Core | Estado |
|----------|----------|-----------|----------|--------|
| 1 | 66°C | 50W | - | Quente/Puxando |
| 2 | 61°C | 36W | 300MHz | Tranquila/Idle |

**Conclusão:** A máquina muda de "respiração" conforme a carga muda. O bambu geme, mas não berra.

## Próximos Passos

1. Criar MCP tool `hardware_telemetry` que lê Nuvoton + AMD ADL + D3D
2. Expor sensores individuais da GPU (temp, hotspot, fan, VRAM, power)
3. Integrar no SOL Dashboard como cards de telemetria
4. Alertas baseados em thresholds (ex: CPU > 85°C, GPU hotspot > 95°C)