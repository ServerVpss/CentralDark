# DECISAO - lancamento-completo.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\copywriting-squad\workflows\lancamento-completo.md
**SHA:** 0d156401179a5ca2
**Timestamp:** 2026-08-28T02:19:39.575457
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Principio:** Nenhum lancamento sai da squad sem passar por todas as fases. Cada fase depende da anterior — pular fases e proibido.

### Principios
- **Principio:** Nenhum lancamento sai da squad sem passar por todas as fases. Cada fase depende da anterior — pular fases e proibido.

### Gaps
- - CURIOSITY GAP: "A tecnica de [personagem] para [beneficio]"

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow: Lancamento Completo

## Metadados
```yaml
id: lancamento-completo
versao: 2.0.0
duracao: 5-7 dias
complexidade: alta
output: Campanha completa de lancamento (VSL + emails + ads + sales page)
execution_model: one-time
dependencies:
  optional_pre:
    - oferta-irresistivel.md (se oferta ja existir, pular Passo 2)
    - sales-page-killer.md (se sales page for necessaria, executar em paralelo no Dia 4-5)
  checklists:
    - sugarman-31-triggers.md
    - audit-copy-hopkins.md
    - awareness-checklist.md
    - sales-letter-checklist.md
  templates:
    - vsl-script-tmpl.md
    - email-sequence-tmpl.md
    - sales-page-completa-tmpl.md
    - ad-creative-tmpl.md
    - bullets-fascinations-tmpl.md
```

---

## VISAO GERAL

Orquestrar a criacao de TODA a copy necessaria para um lancamento completo — desde fundacao estrategica ate otimizacao pos-audit. Combina os frameworks dos 15 clones em 7 dias estruturados com checkpoints e veto conditions em cada fase.

**Principio:** Nenhum lancamento sai da squad sem passar por todas as fases. Cada fase depende da anterior — pular fases e proibido.

**Resultado:** Campanha completa com VSL, sales page, sequencias de email, ads — tudo coeso e auditado.

**Duracao Estimada:** 5-7 dias de trabalho focado

**Clones Utilizados:**
- **Estrategistas (Dia 1-2):** Schwartz, Kennedy, Todd Brown, Hormozi
- **Estruturacao (Dia 3):** Georgi (RMBC)
- **Executores (Dia 4-5):** Schwartz, Carlton, Halbert, Benson, Bencivenga, Makepeace
- **Comunicacao (Dia 6):** Chaperon, Settle, Sugarman (triggers)
- **Otimizadores (Dia 7):** Hopkins, Dan Koe (content angle)

## Veto Conditions

- **VETO-LC-1:** Iniciar execucao (Dia 4) sem fundacao estrategica completa (Dia 1-2) → PARAR, completar estrategia
- **VETO-LC-2:** Pular RMBC (Dia 3) e ir direto para escrita → PARAR, RMBC e obrigatorio
- **VETO-LC-3:** Entregar sem audit de Hopkins (Dia 7) → PARAR, audit e obrigatorio
- **VETO-LC-4:** Awareness nao diagnosticado → PARAR, voltar ao Passo 1
- **VETO-LC-5:** VSL sem mecanismo unico definido → PARAR, ativar @todd-brown
- **VETO-LC-6:** Emails sem open loops entre eles → PARAR, ativar @andre-chaperon
- **VETO-LC-7:** Menos de 15 bullets/fascinations no lancamento inteiro → PARAR, criar mais com @gary-bencivenga
- **VETO-LC-8:** Oferta sem Value Equation aplicada → PARAR, ativar @alex-hormozi
- **VETO-LC-9:** Publicar campanha sem sequencia de carrinho abandonado → PARAR, e receita deixada na mesa

---

## INPUT VALUE

```yaml
produto:
  nome: ""
  tipo: "curso | mentoria | SaaS | servico | produto_fisico"
  preco: ""
  entrega: "imediata | data_especifica | rolling"

publico:
  avatar_resumo: ""
  awareness_estimado: "unaware | problem | solution | product | most_aware"
  tamanho_lista: ""
  canais_trafego: ["email", "ads", "organico", "afiliados"]

lancamento:
  tipo: "seed | interno | jeff_walker | webinar | challenge | direto"
  data_abertura: ""
  data_fechamento: ""
  duracao_carrinho: "3-7 dias"

assets_existentes:
  tem_oferta: true | false     # Se true, pular Passo 2
  tem_vsl: true | false        # Se true, pular Dia 4 Passo 2
  tem_lista_email: true | false
  provas_disponiveis: ["testimonials", "numeros", "casos", "estudos"]

restricoes:
  budget_ads: ""
  deadline: ""
  tom_marca: "formal | conversacional | agressivo | educativo"
```

---

## PRE-CHECKLIST

- [ ] Produto/servico definido com clareza
- [ ] Publico-alvo identificado (ao menos rascunho de avatar)
- [ ] Tipo de lancamento decidido
- [ ] Data de abertura e fechamento definidas
- [ ] Provas disponiveis listadas (testimonials, numeros, casos)
- [ ] Stack de valor (ao menos rascunho)
- [ ] Budget de ads definido (se aplicavel)
- [ ] Canais de trafego decididos

---

## FASE 1: FUNDACAO ESTRATEGICA (Dia 1-2)

### Passo 1: Diagnostico de Awareness
**Clone:** @eugene-schwartz

**Acoes:**
1. Mapear os 5 niveis de consciencia no mercado-alvo
2. Identificar onde esta a maioria do publico POR CANAL:
   - Lista de email → provavelmente Product/Solution Aware
   - Ads frios → provavelmente Unaware/Problem Aware
   - Organico/afiliados → varia
3. Definir tom e extensao de copy necessarios por canal:
   - Unaware → Copy LONGO, educativo, storytelling
   - Problem Aware → Copy medio-longo, agitar dor
   - Solution Aware → Copy medio, diferenciar com mecanismo
   - Product Aware → Copy medio-curto, stack + objecoes
   - Most Aware → Copy curto, oferta direta

**Output:** Diagnostico de awareness por canal + estrategia de abordagem

**CHECKPOINT 1:** Awareness documentado por canal? Se NAO → VETO-LC-4

---

### Passo 2: Construcao de Oferta
**Clone:** @alex-hormozi

**Acoes:**
1. Aplicar Value Equation: Valor = (Dream Outcome x Perceived Likelihood) / (Time x Effort)
2. Identificar Dream Outcome especifico
3. Listar todos problemas/obstaculos entre estado atual e dream outcome
4. Criar solucao para cada problema (cada problema = componente do stack)
5. Estruturar stack de valor (minimo 3 componentes + 1 bonus)
6. Definir garantia(s)
```