---
name: kaizen-sistema-um
description: Use quando a CentralDark precisar transformar estado solto em decisão tipada com probabilidade calibrada, registrar ou evoluir a Intenção Viva / Kaizen das 28 peças, ou mostrar e corrigir erros visíveis na tela.
metadata:
  type: operational
  version: "1.1"
  owner: SEGREDO/CHEFE
centraldark_autosync: true
---

# Kaizen Vivo · Sistema Um

Uma intenção, um coração, uma biblioteca, evolução a cada batida.

- OWNER da intenção: `docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md`
- Cristalização de 2026-10-08: `docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md`
- Seis Olhos (já existente): `.agents/skills/software-development/centraldark-oracle-surface/SKILL.md`
- Laço de edição viva (já existente, dono do fluxo): `.agents/skills/centraldark-live-editing-fabric/SKILL.md`

Esta skill não cria outro sistema: consulta e alimenta o que já existe.

## Quando usar
- Decisão operacional que cabe numa lista fechada de saídas (rotear tarefa, risco de PR, falso verde, gate de deploy, classificar, pontuar).
- O CHEFE traz nova matéria da mesma intenção do Kaizen (DELTA, não nova missão).
- É preciso dizer em que estado real está cada uma das 28 peças.
- Uma nota ou documento novo precisa herdar a intenção sem copiar a história.
- Apareceu erro na tela e o CHEFE quer corrigir só aquela parte.

## As sete batidas (ordem fixa) com os Seis Olhos
1. Vive e experimenta — DOMÍNIO conserva intenção e contexto.
2. Descobre — consultar APRENDIZADOS, NeuroLink, skills e `.agents/library-index.json` antes de investigar. SEIS OLHOS inventaria capacidades; AZUL atrai só evidência relevante.
3. Melhora — reusa o dono existente e corrige o menor ponto. VERMELHO afasta o velho, o duplicado e a arquitetura paralela; ROXO reconcilia no menor delta.
4. Comprova e deixa sua marca — INFINITO: nada sem prova vira verdade (PASS, DEGRADED, UNKNOWN, FAIL, BLOCKED).
5. Aprende — só o verificado vira conhecimento. CURA REVERSA: falha comprovada vira teste, recibo e skill melhor.
6. Reutiliza — não reinvestiga o que tem prova válida; replay de receita comprovada.
7. Continua evoluindo — DOMÍNIO mantém o fio até a conclusão demonstrada.

Os Seis Olhos são capacidade composta da skill Oráculo, não outro agente.

## Protocolo do Sistema Um (decisão tipada)
1. Defina o tipo ANTES: nome, pergunta e rótulos permitidos (mínimo 2).
2. Peça ao modelo APENAS JSON: `{"probabilidades":{rótulo:número,...},"motivo":"frase curta"}`.
3. Valide: rótulo fora da lista, valor negativo, não numérico ou soma zero = ERRO DE TIPO (falha, nunca PASS). Normalize para somar 1.
4. Rode várias amostras em paralelo; use a média e meça a concordância.
5. Decisão automática só se a confiança calibrada passar do limiar; abaixo disso, escala ao CHEFE.
6. Toda decisão nasce UNKNOWN até a realidade dar o gabarito.
7. Com gabaritos, meça acerto, erro de calibração (ECE), Brier e perda logarítmica; aprenda a correção de temperatura por tipo.
8. Limiar pela tabela cobertura × acerto: o menor que bate a meta (ex.: 95%) com amostra mínima.
9. Menos de 5 gabaritos = NOT_MEASURED. Menos de ~50 = correção ainda frágil.
10. Exporte gabaritos em linhas (JSONL) como matéria-prima de treino futuro.

Protótipo de referência: `docs/CONSCIENCIA/PROGRAMAS/kaizen-vivo/sistema-um-kaizen.html` (não é HUD paralelo; é bancada de estudo).

## Erros visíveis (sensor do laço de edição viva)
O fluxo do CHEFE (conversa → muda → vê → erro aparece → corrige só aquela parte → segue) já pertence a `centraldark-live-editing-fabric`. Esta skill só acrescenta o sensor que torna o erro visível:
- Fonte única: `apps/instinto-superior/public/centraldark-erros-visiveis.js`, carregado pelo `src/routes/__root.tsx`. Não duplicar.
- Captura erro de código, promessa rejeitada, console.error, recurso que não carregou e pedido de rede falho; traduz para português simples; remove parâmetros de endereço para não vazar chave.
- "Copiar pro Instinto" gera o relato (página, hora, explicação simples, mensagem técnica, onde, pilha). Ao receber esse relato: corrigir o menor ponto no dono existente, preservar o resto, testar de novo.
- Silêncio do sensor não prova que está tudo certo: é só o que aquela tela enxergou.
- Modo vigente: direto na `main`, sem PR novo (`AGENTS.md` → `PROMOTION_MODE=DIRECT_MAIN_SOFT_EVOLUTION`, `NEW_PR_DEFAULT=false`). Erro visto pelo CHEFE chega por foto, seta, log ou relato do 🧿. Todo push na `main` dispara `vps-exec-selfhosted.yml`, então cada push leva recibo no repositório e medição do efeito.

## Herança de notas (semente + cicatriz)
- Cada nota nova aponta para a mesma semente (o OWNER) em vez de copiar o texto inteiro.
- Guarda só o aprendizado novo, com vínculo à semente: a cicatriz é o aprendizado, não a ferida repetida.
- Repetição não vira conquista nova; hipótese sem prova não é promovida.
- Testar no escritor existente (`obsidian-writer.cjs`), nunca criar outro escritor. Estado: simulado; geração real UNKNOWN.

## Limites honestos
- Isto calibra a confiança por cima do modelo; não treina pesos. RLCD/Jev da TypeSafe não tem método publicado por inteiro.
- Escore interno não é probabilidade calibrada até a medição provar.
- Custo e velocidade do Jev são alegações da empresa, não medição nossa.
- Documentado não significa executado. Sincronizado não significa funcionando.

## Estado das 28 peças (atualizar só com evidência nova)
- 1–17 (Kaizen, feedback, aprendizado incremental, self-learning, self-correction, self-healing, contraprova, continuidade, reuso, menor delta, preservação, vibe coding, crowdtesting, CI sob demanda, prompt/self-cache, KV cache, RLCD): em estudo. Vibe coding tem dono operacional em `centraldark-live-editing-fabric`.
- 18 Biblioteca indexada: documentada (`.agents/library-index.json`).
- 19 Memória NeuroLink: código parcial (166 registros).
- 20 Skills sob demanda: documentada.
- 21 Oráculo: piloto; ciclo completo UNKNOWN.
- 22 Self-Learning Harvest: documentada.
- 23 Replay de aprendizado: código e testes presentes.
- 24 Promoção de memória: regras definidas; automação não comprovada.
- 25 Knowledge Compiler: documentada.
- 26 Saídas estruturadas e 27 Avaliação paralela com probabilidades: protótipo, sem prova viva.
- 28 Seis Olhos: contrato na skill Oráculo; execução no Hermes UNKNOWN.

## Travas
UNKNOWN não é PASS · ação não é prova · reuso antes de criar · um writer por escopo · preservar o verde · nunca vazar segredo (chave do modelo só em memória; endereço sem parâmetros) · toda escrita no repositório carrega SHA + caminho + link + releitura.

## Selo
👑 CHEFE (intenção) · 🪬 INSTINTO SUPERIOR (execução e continuidade) · 🧿 CONTRAPROVA (realidade julga). Não é um coração que nunca erra; é um coração que aprende a cada batida.
