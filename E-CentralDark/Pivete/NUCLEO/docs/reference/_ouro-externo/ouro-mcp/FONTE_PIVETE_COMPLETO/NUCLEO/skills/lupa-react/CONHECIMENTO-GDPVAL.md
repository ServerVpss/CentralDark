# GDPval — o conhecimento que muda como tu avalia teus agentes

Fonte: OpenAI, arXiv 2510.04374 (out/2025) + openai.com/index/gdpval

## O que é (fatos)
Benchmark que mede IA em **trabalho real economicamente valioso**: 44 profissões
dos 9 setores que mais contribuem pro PIB dos EUA, tarefas construídas por
profissionais com média de **14 anos de experiência** (gente de Apple, Google,
Goldman, McKinsey). Entregáveis reais: documentos, planilhas, slides, diagramas,
multimídia — com arquivos de referência, não prompt seco. Métrica primária:
**comparação direta contra o especialista humano** (win/loss). Subconjunto gold
de 220 tarefas é aberto, com serviço de correção automática.

## As 3 alavancas comprovadas no paper (usa isso TODO DIA)
O paper demonstrou que a performance sobe com:
1. **Mais esforço de raciocínio** — pedir o modo de pensar mais profundo nas
   tarefas que valem dinheiro; economizar nos triviais.
2. **Mais contexto da tarefa** — anexar o material de referência real (arquivo,
   exemplo do resultado esperado) em vez de descrever de cabeça.
3. **Mais scaffolding** — loop com ferramentas, verificação e portões (é
   exatamente o que este pacote monta: ReAct + Lupa + valor + segurança).

## A mentalidade (o salto)
Parar de perguntar "a resposta parece boa?" e passar a perguntar:
**"isso ganharia de um profissional de 14 anos entregando a mesma coisa?"**
O `valor_gate.py` deste pacote coloca essa pergunta em código: pontua entregável
completo, ancoragem em evidência, uso do material de referência, formato
profissional e risco declarado — e faz comparação direta A×B, igual à métrica
primária do GDPval.

## Descobertas do paper que te interessam
- Performance de fronteira melhora ~linearmente no tempo e já **se aproxima da
  qualidade de especialistas** nos entregáveis.
- **Modelo + supervisão humana** pode sair mais barato e rápido que o
  especialista sozinho — o teu papel de revisor com a Lupa é o multiplicador.
