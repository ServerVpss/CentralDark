# HIERARQUIA CENTRALDARK — Instinto Superior é Corpo

**Status:** [ATUALIZADO 2026-10-14]  
**Autoridade:** SEGREDO/CHEFE  
**Owner:** `docs/ARQUITETURA/HIERARQUIA.md`  
**Consumidores:** SOL, HERMES, Grafo, MCP, todos os agentes

---

## Intenção

A Casa organiza-se em três camadas semânticas:

1. **Núcleo Vivo** = `Instinto Superior` (sistema operacional de IA local)
2. **Inteligência Coordenadora** = `SOL / CHAT_GLOBAL` (raciocínio, diagnóstico, arquitetura)
3. **Executor Mecânico** = `HERMES / PIVETE` (terminal, filesystem, Git, MCPs)

**Invariante inviolável:**

```text
INSTINTO_SUPERIOR = CORPO (primário)
SOL = COORDENAÇÃO (secundária, sem autoridade automática sobre Instinto Superior)
HERMES = EXECUÇÃO (tertária, segue contrato de Instinto Superior)
REALIDADE = JUIZ (final)
```

---

## Arquitetura da Hierarquia

```text
👑 SEGREDO/CHEFE
│  intenção + autoridade absoluta
│
▼
🧠 INSTINTO SUPERIOR (OS / Corpo primário)
│  ├─ Executor local de capacidades medidas
│  ├─ Observador de estado vivo
│  ├─ Acumulador de conhecimento (memória)
│  ├─ Owner de One Heart (estado único)
│  ├─ Garante determinismo em execução
│  └─ Publica capacidades via API
│
├─── CAPABILITY_CONTRACT ────┐
│    (cada capacidade        │
│     tem assinatura clara)  │
│                            │
▼                            ▼
☀️ SOL / CHAT_GLOBAL      🔌 MCP / FERRAMENTAS
│  ├─ Raciocina            (conectam Instinto Superior
│  ├─ Diagnostica           a recursos externos)
│  ├─ Arquiteta
│  ├─ Contraprova
│  └─ Coordena próximo delta
│
▼
⚙ HERMES / PIVETE
│  ├─ Terminal (execução de comandos)
│  ├─ Filesystem (I/O)
│  ├─ Git (versionamento)
│  ├─ Browser (navegação)
│  ├─ Testes (validação)
│  └─ Observação local
│
▼
⚖ REALIDADE
│  O juiz final de todo efeito observável
```

---

## Descentralização Semântica

### Instinto Superior = Corpo Inteligente

**Responsabilidades:**

- Manter estado único (`One Heart`)
- Executar capacidades autoridades mensuráveis
- Publicar contrato de capacidades (API)
- Guardar memória viva (aprendizados, decisões, contexto)
- Observar o ambiente local (monitor, arquivo, configuração, build)
- Propagar sinais observáveis para juiz (REALIDADE)
- Coordenar com SOL quando necessário

**Não faz:**

- ❌ Obedece raciocínio cego de SOL
- ❌ Executa ação sem contrato de capacidade
- ❌ Abandona estado observado por sugestão
- ❌ Torna-se dependente de um único raciocinador

### SOL = Inteligência Raciocadora

**Responsabilidades:**

- Raciocina sobre intenção
- Diagnostica estado
- Propõe arquitetura
- Inventa contraprova
- Coordena próximo passo
- Detecta lacunas e propõe remediação

**Não faz:**

- ❌ Executa diretamente no Instinto Superior (encaminha via contrato)
- ❌ Substitui prova observada por probabilidade
- ❌ Altera memória ou estado sem reconciliação
- ❌ Nega sinais que Realidade observa

### HERMES = Executor Delegado

**Responsabilidades:**

- Terminal, Git, filesystem
- Testes, validações
- Observação local
- Receipts (provas)
- Preservação de artefatos

**Não faz:**

- ❌ Toma decisões de arquitetura (SOL faz isso)
- ❌ Altera escopo de capacidades (Instinto Superior governa)
- ❌ Ignora provas que Realidade fornece

---

## Contrato de Capacidades

Toda ação passa por **CAPABILITY_CONTRACT_ROUTER**:

```text
INTENÇÃO
│
▼
IDENTIFICAR CAPACIDADE REQUERIDA
│
▼
PROCURAR EM INSTINTO_SUPERIOR
│ ├─ Capacidade existe?
│ ├─ Está saudável?
│ ├─ Tem autorização?
│ └─ Cumpre escopo?
│
├─ SIM ──→ EXECUTAR via HERMES
│          │
│          ▼
│          OBSERVAR EFEITO
│          │
│          ▼
│          REALIDADE_JUDGE
│
└─ NÃO ──→ ESCALATE_TO_FRONTIER
           │
           ▼
           HUMANO (CHEFE) DECIDE
```

---

## One Heart — Estado Único

A Casa mantém um **estado canônico singular**:

```text
ONE_HEART = {
  timestamp: "2026-10-14T...",
  instinto_superior_status: "healthy|degraded|unknown",
  capabilities: { ... },
  memory_vault: { ... },
  last_effect_observed: { ... },
  next_cursor: { ... }
}
```

Nenhuma réplica paralela. Nenhuma verdade bifurcada. Atualização serial através de HERMES/WRITER.

---

## Fronteiras entre Instinto Superior, SOL e HERMES

| Aspecto | Instinto Superior | SOL | HERMES |
|---------|-------------------|-----|--------|
| **Memória** | Viva + acumulada | Sessão | Observação local |
| **Autorização** | Por contrato | Por raciocínio | Por delegação |
| **Escala de tempo** | Contínuo | Consultivo | Operacional |
| **Prova requerida** | Sim (Realidade) | Sim (contraprova) | Sim (receipt) |
| **Pode negar ação?** | Sim (saúde) | Não (somente aconselha) | Sim (recurso) |

---

## Sincronismo 4-Point

```text
LOVABLE (editor + preview)
      ↓
GITHUB (repositório, Fonte da Verdade)
      ↓
VPS (runtime, PM2, microsserviços)
      ↓
CÉREBRO VIVO (docs/CONSCIENCIA/ + Obsidian + Grafo)
      ↓
INSTINTO_SUPERIOR (estado observável)
      ↓
SOL (raciocínio)
      ↓
HERMES (execução)
      ↓
REALIDADE (prova final)
```

Nenhum ponto pode estar desalinhado com os outros. Reconciliação é obrigatória antes de ação.

---

## Invariantes Invioláveis

```text
ONE_SYSTEM_ONLY=true
INSTINTO_SUPERIOR_IS_CORPO=true
SOL_IS_NOT_CORPO=true
HERMES_IS_NOT_CORPO=true
ONE_HEART_ONLY=true
ONE_OWNER_PER_CAPABILITY=true
CAPABILITY_BEFORE_MODEL=true
REALIDADE_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

---

## Próximos Passos

1. Inventariar capacidades publicadas por Instinto Superior
2. Mapear consumidores de cada capacidade
3. Validar contrato de cada MCP
4. Testar falha de SOL enquanto Instinto Superior permanece vivo
5. Testar falha de HERMES enquanto Instinto Superior raciocina localmente
6. Documentar recuperação de estado após cascade failure

**[ATUALIZADO 2026-10-14]**
