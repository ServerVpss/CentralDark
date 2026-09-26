# REFERENCIA - ARQUITETURA-VISUAL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\copywriting-squad\docs\ARQUITETURA-VISUAL.md
**SHA:** 265ef90a0d0381ee
**Timestamp:** 2026-08-28T02:19:37.501218
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- │  REGRA: Não usar todos! Selecionar 5-10 relevantes.                        │

### Ouro Bruto (primeiros 5000 chars)
```
# Arquitetura Visual - Copywriting Squad

## Documentação de como cada agente trabalha dentro dos workflows

---

## 1. HIERARQUIA DOS TIERS

```
                         ┌─────────────────────────────────────┐
                         │          COPY MAESTRO               │
                         │      (Orquestrador Geral)           │
                         │   Decide quem entra em campo        │
                         └──────────────┬──────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│      TIER 1         │    │       TIER 2        │    │       TIER 3        │
│   ESTRATEGISTAS     │    │     EXECUTORES      │    │    OTIMIZADORES     │
│                     │    │                     │    │                     │
│  Usar ANTES de      │───►│  Usar PARA          │───►│  Usar DEPOIS de     │
│  escrever           │    │  escrever           │    │  escrever           │
│                     │    │                     │    │                     │
│  ┌───────────────┐  │    │  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │ Schwartz      │  │    │  │ Halbert       │  │    │  │ Hopkins       │  │
│  │ Kennedy       │  │    │  │ Carlton       │  │    │  └───────────────┘  │
│  │ Todd Brown    │  │    │  │ Makepeace     │  │    │                     │
│  │ Hormozi       │  │    │  │ Bencivenga    │  │    │  ┌───────────────┐  │
│  │ Georgi        │  │    │  │ Benson        │  │    │  │ Sugarman      │  │
│  └───────────────┘  │    │  │ Ogilvy        │  │    │  │ (Checklist)   │  │
│                     │    │  │ Settle        │  │    │  └───────────────┘  │
│  5 agentes          │    │  │ Chaperon      │  │    │                     │
│                     │    │  │ Dan Koe       │  │    │  1 agente +         │
│                     │    │  └───────────────┘  │    │  1 ferramenta       │
│                     │    │                     │    │                     │
│                     │    │  9 agentes          │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

---

## 2. O QUE CADA AGENTE FAZ

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TIER 1 - ESTRATEGISTAS                             │
│                        "Os Arquitetos da Fundação"                           │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ EUGENE SCHWARTZ │  ◄── SEMPRE PRIMEIRO
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Diagnosticar o nível de consciência do mercado                    │
│                                                                             │
│  INPUT:  Descrição do público + produto                                    │
│  OUTPUT: Classificação de awareness (1-5) + recomendações                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NÍVEIS DE CONSCIÊNCIA                                              │   │
│  │                                                                      │   │
│  │  1. UNAWARE ──────► Não sabe do problema    ──► Copy LONGO          │   │
│  │  2. PROBLEM AWARE ► Sabe do problema        ──► Copy MÉDIO-LONGO    │   │
│  │  3. SOLUTION AWARE► Conhece soluções        ──► Copy MÉDIO          │   │
│  │  4. PRODUCT AWARE ► Conhece seu produto     ──► Copy CURTO          │   │
│  │  5. MOST AWARE ───► Pronto pra comprar      ──► Copy MUITO CURTO    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMANDOS: *diagnostico, *awareness, *headline, *extensao                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  DAN KENNEDY    │
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Construir avatar profundo + estratégia high-ticket                │
│                                                                             │
│  INPUT:  Público-alvo básico                                               │
│  OUTPUT: Avatar detalhado + Framework 4Ms + objeções mapeadas              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FRAMEWORK 4Ms     
```