# PADRÃO — Gargalo Windows (Disco/Memória adaptativo)

> Atualização do PADRAO-GARGALO-CHROME-WINDOWS.md (que focava em Chrome/PID
> e ESTAVA INVERTIDO na árvore de parentesco).
> Medido vivo 2026-08-19. Dono: Pivete/Hermes. Autoridade: SEGREDO/CHEFE.

## Correção de erro anterior
- A árvore anotou `21516 → 23980` (21516 pai de 23980) — ESTAVA ERRADA.
- `wmic` real: `21516` é FILHO de `23980`. PID é volátil, não vira padrão.
- Regra sobrevive: **browser process = commandline sem `--type=`**. Nunca
  gravar PID fixo como padrão.

## Ordem de suspeita (invertida — disco primeiro)
1. **Disco** (mais lento a saturar, mais invisível)
2. **Commit/paginação** (causa oculta do item 1)
3. **RAM**
4. **CPU**
5. **Chrome** (último — medido 0,4%, inocente na sessão)

## Limiares calibrados desta máquina (23,9 GB RAM)
- CPU: gargalo se > 85% sustentado 60s (medi: 16,5% — folga)
- RAM: gargalo se livre < 3,6 GB = 15% de 24GB (medi: 10,7 GB — OK)
- Commit: ALERTA se commit/RAM_fisica > 85% (MEDIDO: 90,4% — ESTOURADO)
- Disco: gargalo se ativo > 90% E latência > 25ms (outro Hermes mediu 100%/142ms)
- GPU: gargalo se > 90% (medi: 5% — folga)

## Medição real 2026-08-19 (CIM/PowerShell, não narrativa)
```
RAM_Fisica_GB = 23.9
Commit_GB     = 21.6
Pressao_Pct   = 90.4%   ← PAGINANDO
PageFile      = C:\pagefile.sys (HDD), 8237 MB aloc, pico 740 MB
Discos: C:(HDD) 297GB livre | D/E/F/G (SSD) ociosos
```

## Causa raiz (hipótese de alta confiança ~90%)
Pagefile no HDD de 2010 enquanto 2 SSDs dormem a 0%.
Commit em 90,8% → Windows pagina no disco mais lento.

## Comandos de medição (READ_ONLY, MSYS_NO_PATHCONV=1)
```bat
:: Memória + pagefile (leve, não trava)
powershell -File mem-check.ps1

:: Disco latência (PODE travar se disco já saturado — rodar background)
powershell -File disk-check.ps1

:: Quem causa I/O
powershell -File io-top.ps1
```

## Regra adaptativa (Meta Menos é Mais)
1. Medir CPU% / RAM% / Disco% ativo / GPU% (≥2 amostras)
2. Identificar o ÚNICO com folga < 15% = gargalo
3. Se nenhum < 15% → NO_CHANGE (saudável)
4. Se 2+ < 15% → medir latência, maior ms = causa
5. Gravar delta vs padrão antigo, não sobrescrever cego

## Guardrail
- Padrão antigo é HIPÓTESE, medição atual é JUIZ. Recalcular sempre.
- PID é volátil — só a regra 'pai = chrome.exe sem --type=' sobrevive.
- Não mover pagefile sem ordem do CHEFE (é ação destrutiva/irreversível).
- Vault = segundo cérebro: padrão vive aqui + memória.
