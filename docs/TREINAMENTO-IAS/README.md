# SISTEMA DE TREINAMENTO DAS IAs — CENTRAL DARK

## Estrutura de Pastas

```
TREINAMENTO-IAS/
├── README.md                    ← Este arquivo
├── protocolos/
│   ├── PROTOCOLO-V4-VETO-ABSOLUTO.md   ← Regras do grupo
│   ├── PROMPT-BASE-GRUPO.md            ← Prompt pra colar no grupo
│   └── PONTOS-DE-COMANDO.md            ← Comandos pra ativar as IAs
├── exemplos/
│   ├── EXEMPLOS-VETO-CLAUDE.md         ← Exemplos de veto da Claude
│   └── EXEMPLO-DECISAO-COMPLETA.md     ← Exemplo de decisão completa
├── decisoes/
│   └── DECISOES-CENTRAL-DARK.md        ← Registro oficial de decisões
└── logs/
    └── README-LOGS.md                  ← Instruções pra logs diários
```

## Como Usar

### 1. Configurar o Grupo
Cole o conteúdo de `protocolos/PROMPT-BASE-GRUPO.md` no grupo "Evolução" uma vez.

### 2. Ativar as IAs
Escolha um Ponto de Comando de `protocolos/PONTOS-DE-COMANDO.md` e cole no grupo.

### 3. Fluxo de Decisão
- Gemini e Groq propõem primeiro
- Claude revisa, ajusta ou veta
- Decisão final é registrada em `decisoes/DECISOES-CENTRAL-DARK.md`

### 4. Registrar Decisões
Depois que as IAs concordarem, copiar a decisão para `decisoes/DECISOES-CENTRAL-DARK.md`.

## Hierarquia

| IA | Papel | Poder |
|---|---|---|
| Claude Sonnet | Guardiã do Raciocínio | Veto absoluto |
| Gemini Flash | Arquiteta | Propor visão |
| Groq Llama | Executora | Propor código |
