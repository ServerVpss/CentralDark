# COMANDO - oferta-irresistivel.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\copywriting-squad\workflows\oferta-irresistivel.md
**SHA:** 00c7e1e5cdbae57d
**Timestamp:** 2026-08-28T02:19:39.590968
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** Cada obstáculo vira um componente nomeado.

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow: Oferta Irresistível

## Metadados
```yaml
id: oferta-irresistivel
versao: 1.1.0
duracao: 4-6 horas
complexidade: alta
output: Oferta estruturada que faz cliente se sentir estúpido se recusar
dependencies:
  optional_pre: []
  feeds_into:
    - vsl-matador.md (Grand Slam Offer reutilizavel na Fase 3)
    - lancamento-completo.md (Passo 2 pode ser pulado se oferta ja existe)
    - webinar-que-vende.md (oferta integrada ao pitch)
  checklists:
    - sugarman-31-triggers.md
```

---

## VISAO GERAL

Criar uma Grand Slam Offer usando o método Hormozi: oferta tão boa que o preço se torna irrelevante.

**Resultado esperado:** Stack de valor completo + garantia + posicionamento de preço.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Produto/serviço atual (pode ser básico)
- Conhecimento/expertise disponível
- Recursos que pode criar
- Público-alvo
- Concorrentes e seus preços
- Capacidade de entrega

### PASSO 2: INPUT VALUE
```yaml
produto_base:
  nome: ""
  formato: "curso|mentoria|servico|software|fisico"
  entrega_atual: []
  tempo_resultado: ""

expertise:
  conhecimentos: []
  ferramentas_que_domina: []
  resultados_proprios: []
  resultados_clientes: []

mercado:
  preco_concorrentes: ""
  gaps_concorrentes: []
  reclamacoes_comuns: []

capacidade:
  pode_criar: []
  pode_entregar: []
  limitacoes: []
```

### PASSO 3: PRE-CHECKLIST
- [ ] Tem expertise real no assunto?
- [ ] Consegue entregar resultado?
- [ ] Conhece os concorrentes?
- [ ] Sabe o que o público quer?
- [ ] Tem capacidade de criar novos componentes?

### PASSO 4: PERSONA/EXECUTOR

| Fase | Clone | Função |
|------|-------|--------|
| 1. Dream Outcome | @alex-hormozi | Identificar resultado dos sonhos |
| 2. Obstáculos | @dan-kennedy | Mapear todas as objeções |
| 3. Mecanismo | @todd-brown | Criar diferenciação |
| 4. Stack | @alex-hormozi | Montar componentes |
| 5. Garantia | @alex-hormozi | Criar reversão de risco |
| 6. Naming | @todd-brown | Nomear tudo |
| 7. Pricing | @alex-hormozi | Posicionar preço |

### PASSO 5: PROMPT DE EXECUÇÃO

---

#### FASE 1: Dream Outcome (30 min)
**Clone:** @alex-hormozi

**Executar:**

1. **Identificar o que o cliente REALMENTE quer:**
   - Não é o curso/mentoria/produto
   - É o RESULTADO que isso gera
   - É como ele vai SE SENTIR

2. **Perguntas para encontrar:**
   - Se pudesse acordar amanhã com um resultado mágico, qual seria?
   - O que ele conta pros amigos quando dá certo?
   - O que ele evita contar que quer?
   - Qual o status que ele busca?

3. **Formatar Dream Outcome:**
   ```
   "[AVATAR] consegue [RESULTADO ESPECÍFICO] em [TEMPO]
   sem [MAIOR OBSTÁCULO] e finalmente [DESEJO EMOCIONAL]"
   ```

**Output:** Dream Outcome documentado

---

#### FASE 2: Mapeamento de Obstáculos (45 min)
**Clone:** @dan-kennedy

**Listar TODOS os obstáculos entre o cliente e o Dream Outcome:**

**Categorias:**
1. **Obstáculos de CONHECIMENTO**
   - O que não sabe fazer?
   - O que não sabe que não sabe?

2. **Obstáculos de HABILIDADE**
   - O que sabe mas não consegue executar?
   - O que demora muito para fazer?

3. **Obstáculos de FERRAMENTA**
   - O que precisa e não tem?
   - O que tem mas é ruim/incompleto?

4. **Obstáculos de TEMPO**
   - O que demora demais?
   - O que compete pelo tempo dele?

5. **Obstáculos de CRENÇA**
   - O que acha que não funciona?
   - O que acha que não é pra ele?

6. **Obstáculos de SUPORTE**
   - Onde trava sem ajuda?
   - Onde precisa de feedback?

**Para cada obstáculo, listar:**
- Descrição
- Impacto (alto/médio/baixo)
- Solução possível

**Output:** Lista de 15-30 obstáculos categorizados

---

#### FASE 3: Mecanismo Único (30 min)
**Clone:** @todd-brown

**Criar diferenciação:**

1. **Por que outras soluções falham?**
   - Listar 3-5 razões

2. **O que sua solução faz diferente?**
   - Qual o "segredo" ou "descoberta"?
   - Qual o processo único?

3. **Nomear o mecanismo:**
   - Método [NOME]
   - Sistema [NOME]
   - Framework [NOME]
   - Protocolo [NOME]

**Fórmula:**
```
"Enquanto [concorrentes] focam em [abordagem comum],
o [NOME DO MÉTODO] ataca [causa raiz real] através de
[processo único], por isso [resultado diferente]."
```

**Output:** Unique Mechanism nomeado e explicado

---

#### FASE 4: Montar Stack de Valor (1-2h)
**Clone:** @alex-hormozi

**Para CADA obstáculo, criar uma SOLUÇÃO:**

**Estrutura por componente:**
```yaml
componente:
  nome_sexy: "" # Nome atraente, não genérico
  obstaculo_que_resolve: ""
  formato: "video|template|ferramenta|acesso|suporte|comunidade"
  entregavel: ""
  valor_standalone: "" # Quanto valeria se vendesse separado
  tempo_para_criar: ""
```

**Tipos de componentes:**

1. **CORE (Entrega Principal)**
   - O que resolve o problema principal
   - Ex: "Curso completo", "Mentoria", "Software"

2. **ACELERADORES**
   - Diminuem tempo até resultado
   - Ex: Templates prontos, Scripts, Checklists

3. **FACILITADORES**
   - Diminuem esforço necessário
   - Ex: Ferramentas, Automações, Suporte

4. **AMPL
```