# ARQUITETURA — Duas Artes Visuais CentralDark

## 1. Intenção do pacote

Preservar em um único envelope verificável duas peças visuais complementares:

- **Arte 01 — Amadurecimento tático da Casa**: representa a passagem de intenção para coordenação, execução, julgamento e aprendizado.
- **Arte 02 — Ouro sendo coletado**: representa visualmente o garimpo/compilação de material enquanto a Casa trabalha sobre um fluxo disciplinado.

O pacote é visual. Ele não cria owner, engine, runtime, workflow ou autoridade nova.

## 2. Mapa operacional representado

```text
SEGREDO/CHEFE
    ↓ intenção + autoridade
#ACORDAR
    ↓ estado vivo primeiro
!CALIBRAR
    ↓ intenção + destino
!MULTIBÚSSOLA
    ↓ percepção material
SOL
    ↓ coordena / reconcilia
WRITER ÚNICO
    ↓ mutação serializada
HERMES
    ↓ executa / preserva
EVIDÊNCIA + CONTRAPROVA
    ↓
REALITY JUDGE
    ├─ FALHOU  → remediar → medir novamente
    └─ PROVOU  → receipt → aprendizado → próximo estado
```

## 3. Invariantes preservados

```text
ONE_SYSTEM_ONLY = true
REUSE_BEFORE_CREATE = true
ONE_WRITER_PER_SCOPE = true
PARALLELIZE_PERCEPTION = true
SERIALIZE_MUTATION = true
ACTION != PROOF
UNKNOWN != PASS
REALITY = JUDGE
PAPAGAIO_MODE = OFF
POMBO_MODE = CHECKSUM_ON
```

## 4. Camadas do pacote

```text
PACOTE
├── assets/
│   ├── 01_CENTRALDARK_AMADURECIMENTO_TATICO_DA_CASA.png
│   └── 02_CENTRALDARK_OURO_SENDO_COLETADO.png
├── README.md
├── ARQUITETURA.md
├── MANIFEST.json
├── RECEIPT.json
└── SHA256SUMS.txt
```

## 5. Fronteira de prova

A semântica desenhada nas imagens é uma representação.

```text
VISUAL_ALIAS != CANONICAL_OWNER
VISUAL_CLAIM != LIVE_STATE
CHECKSUM != RUNTIME_PROOF
PACKAGE_INTEGRITY != DEPLOYMENT_PROOF
```

O que este pacote pode provar: que os dois PNGs e os metadados associados foram entregues juntos e podem ser verificados byte a byte.

O que este pacote não pode provar: que qualquer estado de CI, PR, VPS, Hermes, deploy ou execução mostrado graficamente esteja ativo no momento.
