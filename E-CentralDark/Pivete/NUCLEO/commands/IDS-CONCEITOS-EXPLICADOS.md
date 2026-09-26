# COMANDO - IDS-CONCEITOS-EXPLICADOS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\IDS-CONCEITOS-EXPLICADOS.md
**SHA:** c7a06da0b5dee0e4
**Timestamp:** 2026-08-28T02:02:36.289336
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > **Nova Regra:** Toda decisão CREATE deve incluir justificativa completa.

### Ouro Bruto (primeiros 5000 chars)
```
# IDS - Incremental Development System: Conceitos Explicados

**Documento de Referência Conceitual**
**Autor:** Pedro Valério Lopez (via Mind Clone)
**Data:** 2026-02-05
**Versão:** 1.0

> "Humans develop incrementally; AI agents develop generationally."
> — Princípio fundamental do IDS

---

## 📖 Índice

1. [O Problema Central](#o-problema-central)
2. [A Solução: IDS](#a-solução-ids)
3. [REUSE > ADAPT > CREATE](#reuse--adapt--create)
4. [Entity Registry (O Inventário)](#entity-registry-o-inventário)
5. [Decision Engine (O Cérebro)](#decision-engine-o-cérebro)
6. [Verification Gates (Os Portões)](#verification-gates-os-portões)
7. [Self-Healing (Auto-Cura)](#self-healing-auto-cura)
8. [Métricas de Sucesso](#métricas-de-sucesso)
9. [Glossário Visual](#glossário-visual)

---

## O Problema Central

### A Diferença Entre Humanos e IAs

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   👨‍💻 DESENVOLVEDOR HUMANO         🤖 AGENTE IA (sem IDS)      │
│                                                                 │
│   "Já existe algo parecido?"       "Vou criar do zero!"        │
│          ↓                                  ↓                   │
│   Busca código existente           Gera código novo            │
│          ↓                                  ↓                   │
│   Adapta 10 linhas                 Escreve 200 linhas          │
│          ↓                                  ↓                   │
│   ✅ Reutilização                  ❌ Duplicação                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🏠 Analogia: A Reforma vs. A Construção

Imagine que você quer um quarto novo na sua casa:

| Humano | IA (sem IDS) |
|--------|--------------|
| "Já tenho um quarto de hóspedes. Vou transformá-lo." | "Vou construir uma casa inteira nova!" |
| Compra tinta e móveis novos | Contrata arquiteto, engenheiro, pedreiros |
| Gasta R$ 5.000 e 1 semana | Gasta R$ 500.000 e 12 meses |
| Resultado: quarto novo | Resultado: casa nova (mas você só queria um quarto) |

**O IDS ensina a IA a pensar como o humano**: primeiro olhar o que já existe, depois decidir se reforma ou constrói.

---

## A Solução: IDS

O **Incremental Development System** é um conjunto de ferramentas e processos que força os agentes IA a:

1. **Consultar antes de criar** - Sempre olhar o inventário primeiro
2. **Seguir uma hierarquia** - REUSE > ADAPT > CREATE
3. **Justificar decisões** - Se criar algo novo, explicar por quê
4. **Passar por portões** - Verificação em cada etapa
5. **Auto-corrigir** - Sistema detecta e corrige problemas

### 🏪 Analogia: O Almoxarifado Inteligente

Pense no IDS como um almoxarifado de empresa com um funcionário muito rigoroso:

```
┌─────────────────────────────────────────────────────────────────┐
│                      🏪 ALMOXARIFADO IDS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Você: "Preciso de uma caneta azul"                            │
│                                                                 │
│  Almoxarife: "Deixa eu ver no sistema..."                      │
│              [Consulta Entity Registry]                         │
│                                                                 │
│              "Achei 3 opções:                                  │
│               - Caneta azul BIC (95% compatível) → REUSE       │
│               - Caneta preta BIC (80% + azul) → ADAPT          │
│               - Nada parecido → CREATE"                        │
│                                                                 │
│  Você: "Quero criar uma nova mesmo"                            │
│                                                                 │
│  Almoxarife: "Tá, mas preciso que você assine aqui             │
│               explicando por que a BIC azul não serve."        │
│               [CREATE Justification Required]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## REUSE > ADAPT > CREATE

Esta é a **hierarquia de decisão** do IDS. Sempre nesta ordem de prioridade.

### Os Três Níveis

| Decisão | Quando Usar | Score de Match | Analogia |
|---------|-------------|----------------|----------|
| **REUSE** | Já existe algo perfeito | ≥ 90% | Usar a mesma roupa de ontem (ainda está limpa) |
| **ADAPT** | Existe algo similar | 60-89% | Ajustar a barra da calça (serve, mas precisa de pequeno ajuste) |
| **CREATE** | Não existe nada útil | < 60% | Comprar roupa nova (nada no guarda-roupa serve) |

### 🎸 Analogia: O Músico e as Músicas

```
REUSE (≥90%):
"Preciso tocar uma música romântica no casamento"
→ "Já tenho 'Perfect' do Ed Sheeran no repertório. Us
```