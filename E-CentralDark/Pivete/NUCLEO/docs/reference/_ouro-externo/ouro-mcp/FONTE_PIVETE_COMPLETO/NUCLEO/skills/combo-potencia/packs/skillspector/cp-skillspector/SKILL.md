---
name: cp-skillspector
description: SkillSpector (NVIDIA) offline — auditar skills antes de instalar.
---

# cp-skillspector — auditor de skills (NVIDIA)

ORIGEM: https://github.com/NVIDIA/SkillSpector
VENDOR: C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\SkillSpector

## Função
Auditar skill externa ANTES de promover/instalar no índice vivo.

## Uso típico (quando Pivete mandar auditar)
```bash
cd "C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\SkillSpector"
# ver README do vendor para CLI atual; não inventar subcomando
python -m pip show skillspector 2>/dev/null || true
ls
```

## Regra Casa
Não instalar skill externa no índice global sem:
1. audit SkillSpector (ou equivalente)
2. checar duplicata semântica Casa
3. ordem explícita do Pivete

## NÃO é skill de workflow de coding — é scanner.
