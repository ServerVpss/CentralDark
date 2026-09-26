# ARQUITETURA CANÔNICA — CENTRALDARK LIVING LEARNING OS

## Camadas

```text
┌─────────────────────────────────────────────────────────────┐
│ CHEFE — intenção, aprovação, modo, kill switch             │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SOL OPERATOR PLANE — Desktop/WebUI local                   │
│ estado · fontes · fila · métricas · revisão · memória      │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ CAPTURE BUS                                                  │
│ URL · podcast · vídeo · áudio/transcrição · arquivo · nota  │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ RADAR                                                        │
│ External Human Radar + Personal Learning Stream             │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ HERMES                                                       │
│ normaliza · classifica · relaciona · executa pipeline       │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ FORJA                                                        │
│ dedupe · proveniência · contrap prova · teste · promoção    │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ MEMORY WRITER — único por escopo                            │
│ NUCLEO canônico → projeção Obsidian                         │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SOL DASHBOARD                                                │
│ “o que aprendeu?”, “de onde?”, “onde está?”, “por quê?”     │
└─────────────────────────────────────────────────────────────┘
```

## Dois fluxos, uma Forja

### Radar externo
```text
PESSOA/FONTE PÚBLICA
→ material profissional
→ proveniência
→ lens packet
→ conflito/teste
→ delta útil
```

### Aprendizado pessoal explícito
```text
CHEFE ATIVA SESSÃO
→ áudio/texto/link/arquivo selecionado
→ transcrição/referência
→ candidato
→ Forja
→ aprendizado
```

Ambos convergem na mesma Forja e no mesmo Memory Writer.

## Não criar

```text
segundo Hermes
segundo NUCLEO
segundo Obsidian
segundo dispatcher
segundo Human Mind Router por pessoa
segundo sistema de fila concorrente
```

## Windows

Alvo lógico:

```text
SOL Desktop
  ↓
local BFF/API
  ↓
Hermes Runtime / existing adapters
  ↓
Learning/Radar services
  ↓
NUCLEO + Obsidian projection
```

A arquitetura deve ser encaixada no runtime real medido. Paths aqui são lógicos, não autorização para mover arquivos cegamente.
