# COMANDO - email-diario-lucrativo.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\copywriting-squad\workflows\email-diario-lucrativo.md
**SHA:** a6479dac4bbd2940
**Timestamp:** 2026-08-28T02:19:39.315378
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Estrutura padrão:**

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow: Email Diário Lucrativo

## Metadados
```yaml
id: email-diario-lucrativo
versao: 1.1.0
duracao: Setup 1 dia + Ongoing
complexidade: media
output: Sistema de email diário que monetiza lista
execution_model: recurring (setup 1 dia, ongoing diario)
dependencies:
  optional_pre:
    - maquina-de-leads.md (lista construida para receber emails)
  feeds_into:
    - reativacao-lista.md (quando lista esfria, reativar)
  checklists:
    - sugarman-31-triggers.md
```

---

## VISAO GERAL

Criar um sistema de email diário estilo Ben Settle que constrói relacionamento E vende todos os dias. Infotainment: Informação + Entretenimento.

**Resultado esperado:** Framework para escrever 1 email por dia que engaja e converte.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Produto(s) a ser promovido
- Sua personalidade/estilo
- Histórias e experiências pessoais
- Lista de emails existente
- Frequência desejada (diário/3x semana)

### PASSO 2: INPUT VALUE
```yaml
produtos:
  - nome: ""
    link: ""
    preco: ""

personalidade:
  tom: "irreverente|profissional|amigavel|provocador"
  temas_interesse: []
  opinioes_fortes: []
  historias_marcantes: []

lista:
  tamanho: ""
  engajamento_atual: ""
  frequencia_atual: ""
```

### PASSO 3: PRE-CHECKLIST
- [ ] Tem pelo menos 1 produto para promover?
- [ ] Consegue escrever com personalidade própria?
- [ ] Tem histórias/experiências para compartilhar?
- [ ] Lista tolera frequência alta?

### PASSO 4: PERSONA/EXECUTOR

| Fase | Clone | Função |
|------|-------|--------|
| 1. Personalidade | @ben-settle | Definir 3X Personality |
| 2. Estrutura | @ben-settle | Template de email |
| 3. Temas | @dan-koe | Banco de ideias |
| 4. Storytelling | @gary-halbert | Técnicas de história |
| 5. Triggers | Sugarman | Gatilhos por email |

### PASSO 5: PROMPT DE EXECUÇÃO

---

#### FASE 1: Definir 3X Personality (1h)
**Clone:** @ben-settle

**Executar:**
1. Identificar sua personalidade natural
2. Amplificar 3X (exagerar traços marcantes)
3. Definir:
   - Opiniões fortes que vai defender
   - Coisas que odeia/critica
   - Coisas que ama/defende
   - Expressões características
   - Tom de voz

**Exemplo de amplificação:**
- Natural: "Não gosto de reuniões"
- 3X: "Reuniões são o câncer da produtividade. Toda reunião é uma confissão de falha de comunicação."

**Output:** Persona document com personalidade 3X

---

#### FASE 2: Template de Email Diário (30 min)
**Clone:** @ben-settle

**Estrutura padrão:**

```
SUBJECT LINE
- Curiosa OU controversa OU intrigante
- Nunca genérica
- Exemplos:
  - "Por que demiti meu melhor cliente"
  - "A mentira que te contaram sobre [X]"
  - "Isso me fez perder R$50.000"

ABERTURA (2-3 linhas)
- Hook imediato
- História ou observação
- Gancho emocional

CORPO (5-10 parágrafos curtos)
- Desenvolver história/ideia
- Incluir opinião forte
- Ensinar algo (valor real)
- Transição natural para produto

PITCH (3-5 linhas)
- Conectar história com produto
- Benefício principal
- CTA simples

ASSINATURA
- Nome
- PS. (opcional - muito lido)
```

**Output:** Template documentado

---

#### FASE 3: Banco de Temas (1h)
**Clone:** @dan-koe

**Criar 50 ideias de temas:**

**Categorias:**
1. **Histórias pessoais** (15 temas)
   - Fracassos e lições
   - Vitórias e como conseguiu
   - Momentos embaraçosos
   - Descobertas surpreendentes

2. **Opiniões controversas** (10 temas)
   - Contra crenças do mercado
   - Críticas a práticas comuns
   - Posições impopulares

3. **Lições de filmes/livros/séries** (10 temas)
   - Conectar entretenimento com negócios
   - Analogias inusitadas

4. **Bastidores** (10 temas)
   - Como você trabalha
   - Erros que cometeu
   - Decisões difíceis

5. **Rants/Reclamações** (5 temas)
   - O que te irrita no mercado
   - Práticas que você odeia

**Output:** Lista de 50 temas com hooks

---

#### FASE 4: Técnicas de Storytelling (30 min)
**Clone:** @gary-halbert

**Estruturas de história para emails:**

**1. PROBLEMA → DESCOBERTA → LIÇÃO**
- Estava com problema X
- Descobri Y por acidente
- Agora faço Z (e você deveria também)

**2. CONFISSÃO**
- Preciso confessar algo
- Eu costumava [erro]
- Até que [virada]

**3. BASTIDOR**
- Ontem aconteceu algo
- [detalhe específico]
- E isso me lembrou de [produto]

**4. CONTRARIAN**
- Todo mundo diz que [crença comum]
- Mas isso está errado porque
- A verdade é [sua opinião]

**5. CLIENTE/CASE**
- Fulano me procurou com [problema]
- Fizemos [solução]
- Resultado: [número específico]

**Output:** 5 estruturas de storytelling documentadas

---

#### FASE 5: Gatilhos por Tipo de Email
**Ferramenta:** Sugarman Triggers

**Mapeamento:**

| Tipo de Email | Triggers Prioritários |
|---------------|----------------------|
| História pessoal | #24 Human, #25 Storytelling, #02 Honesty |
| Opinião forte | #16 Harmonize, #31 Fear, #03 Integrity |
| Lição prática | #05 Value, #28 Specificity, #23 Simplicity |
| Bastidores | #22 Exclusivity, #19 Curiosity, #24 Human |
| Rant | #31 Fear, #17 Belong, #16 Ha
```