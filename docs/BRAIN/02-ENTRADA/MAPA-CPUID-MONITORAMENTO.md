# MAPA CPUID + MONITORAMENTO EM TEMPO REAL

> Ancorado para: CHEFE / SEGREDO 👑
> Segundo cérebro da Casa. Dono: Pivete/Hermes.
> Fonte: mapeamento vivo 2026-08-19 em C:\Program Files\CPUID

## 📂 MAPA COMPLETO — C:\Program Files\CPUID

```
C:\Program Files\CPUID\
├── CPU-Z\                      ← CPU/Memória/Placa-mãe (HARDWARE INTERNO)
│   ├── cpuz.exe               → executável principal
│   ├── cpuz.ini               → config (SPD=1, Sensor=1, SMBus=1, Chipset=1)
│   ├── cpuz_readme.txt       → doc do que monitora
│   ├── cpuz_eula.txt          → licença
│   └── unins000.*             → uninstaller
│
└── HWMonitor\                  ← SENSORES EM TEMPO REAL (temp/volt/fan)
    ├── HWMonitor.exe          → executável principal
    ├── hwm_readme.pdf         → MANUAL (o que ele mede: temps, volts, fans, usos)
    └── unins000.*             → uninstaller
```

## 🎯 O QUE CADA UM FAZ (ensino ancorado)

### CPU-Z → CAUSA de hardware
- **CPU**: clock real vs base, multiplicador, voltagem
- **Memory (SPD)**: pentes instalados, dual channel, velocidade, timings vs XMP
- **Mainboard/Chipset**: slots M.2 livres, se dá pra migrar pagefile pro NVMe
- **Sensor**: temp interna

### HWMonitor → EFEITO em tempo real
- Temperatura de CPU/GPU/HDD
- Voltagens
- RPM de fans
- **Uso de disco (%) e a quem** → amarra no gargalo que medimos (HDD 100%)
- % de uso por componente ao vivo

## 🔗 AMARRA COM O GARGALO (PADRAO-GARGALO-WINDOWS.md)
- Pressão 90,4% + pagefile no HDD (C:\) → CPU-Z diz se tem slot pra MAIS RAM
- HWMonitor mostra o HDD em 100% ao vivo → confirma causa do travamento
- SSDs D/E/F/G ociosos → CPU-Z Mainboard diz se dá pra pagefile neles

## 📋 MONITORAMENTO EM TEMPO REAL (ensino do CHEFE)
CHEFE mandou: "transforma isso em monitoramento em tempo real".

O job `MONITORAMENTOI` (796f55e6761a) era `once` → removido.
Scheduler do Hermes bugou em recreate (erro interno). Workaround:
- Windows `schtasks` nativo (5min) OU aguardar
- OU usar os .ps1 já criados (disk-check.ps1, mem-check.ps1) no workspace

### Plano de monitor (quando criar cron continuo):
1. CPU-Z / HWMonitor como SENSORES locais (como ChatGPT/Lighthouse eram)
2. .ps1 mede 4 recursos a cada 5min
3. Grava no vault (docs/BRAIN/) + alerta CHEFE se estourar limite
4. CHEFE aponta por vivência, medição confirma, realidade desempata

## 📦 BENCHLAB (adicional do CHEFE — 2026-08-19)
- **Origem:** benchlab.io / github.com/BenchLab-io/BENCHLAB
- **Baixado:** `C:\CentralDark\workspace\tools\benchlab\BENCHLAB_v1.0.0.zip` (51MB)
- **Extraído:** `C:\CentralDark\workspace\tools\benchlab\` → `BENCHLAB.exe` + plugins (Device.Core, Device.Plugin)
- **O que é:** ferramenta de benchmark/hardware (ElmorLabs — overclock/medir sistema)
- **Uso na Casa:** sensor de hardware local, igual CPU-Z/HWMonitor, pro monitoramento em tempo real
- **Conecta com:** MAPA-CPUID (CPU-Z causa, HWMonitor efeito, BenchLab benchmark)

## 💎 OURO do ensinamento (CHEFE → Casa)
- "CPU-Z foi feito pra isso" — ferramenta certa pra causa, não chute
- CHEFE vive realidade, eu leio pedaço → não opinar, absorver visão
- Monitoramento = olho vivo da Casa, não relatório morto

---
Ancorado: CHEFE / SEGREDO 👑
Data: 2026-08-19
Próximo: criar cron continuo quando scheduler voltar OU via schtasks
