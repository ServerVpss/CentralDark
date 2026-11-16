---
name: centraldark-integration-verification
description: "Use when checking CentralDark integration across surfaces."
version: 1.0.0
author: Hermes Agent
license: MIT
related_skills:
  - centraldark-ops
  - skill-synchronization
metadata:
  hermes:
    tags: [CentralDark, integration, verification, runtime, consumers]
    related_skills: [centraldark-ops, skill-synchronization]
---

# CentralDark integration verification

## When to Use

Use when checking whether a module, status directory, API, adapter, capability, or operational surface has actually been absorbed by a higher-level CentralDark surface. Also use when documentation claims integration but the runtime consumer or source-of-truth binding is uncertain.

Verifique integração por evidência causal, não por nomes parecidos ou documentação. O objetivo é distinguir código existente, contrato de ponte, consumidor real e efeito observado na superfície superior.

## Regras permanentes

```text
UNKNOWN != PASS
DOCUMENTED != CONSUMED
ACTION != INTEGRATION
ADAPTER_WITHOUT_CONSUMER = CONTRACT_PRESENT_NOT_CONSUMED
UNTRACKED_FILE != CANONICAL_PROOF
ALTERNATE_SOURCE != FULL_ABSORPTION
RUNTIME_READBACK_REQUIRED_FOR_PASS
```

Responda em português direto, sem papagaio. Quando o usuário perguntar se “já foi integrado”, entregue um veredito por escopo: integrado, parcial ou não provado; não devolva uma lista de decisões para o usuário escolher.

## Procedimento

1. Descobrir o donor e o alvo

   - Localize a pasta/artefato que contém as capacidades originais.
   - Localize a superfície superior que supostamente as absorveu.
   - Identifique o owner canônico e a fonte de runtime de cada lado.
   - Se o nome do alvo estiver ambíguo, use o caminho, imports e rotas para resolver; pergunte apenas se a máquina não puder distinguir os alvos.

2. Inventariar as capacidades do donor

   - Liste os arquivos, endpoints, exports ou seções que representam capacidades reais.
   - Agrupe por função, não por arquivo: painel, infraestrutura, MCP, diagnóstico, conselho, cápsula, grafo, receipts, módulos administrativos e semelhantes.
   - Não conte dependências (`node_modules`, bundles gerados ou cópias históricas) como consumidores.

3. Provar a ponte no código

   Procure, no alvo, cada uma destas formas de consumo:

   - import/export direto;
   - rota ou handler que chama o adapter;
   - fetch para endpoint do donor;
   - leitura de banco explicitamente mapeada ao donor;
   - transformação de schema que preserva a origem;
   - job/runtime que publica a projeção para a superfície.

   Um arquivo adaptador isolado, comentário dizendo “já integrado”, inventário, componente com o mesmo rótulo ou endpoint apenas existente não fecha esta etapa.

4. Distinguir fontes substitutas

   Se a superfície lê uma fonte diferente da pasta analisada — por exemplo, tabela Supabase de módulos, dados estáticos, snapshot histórico ou probes independentes — registre isso como integração própria ou parcial. Não chame a função de “absorção completa” enquanto os dados do donor não atravessarem uma ponte demonstrável.

5. Verificar o estado do repositório

   - Confirme se adapter, consumidor e testes estão rastreados no Git.
   - Arquivo novo não rastreado é evidência local de trabalho, não parte comprovada do cânone.
   - Compare HEAD, branch e checkout efetivo antes de usar documentação histórica como prova atual.

6. Fazer readback do runtime

   - Execute o teste existente ou consulte a rota real.
   - Confirme o status HTTP/JSON, origem, freshness e efeito renderizado quando aplicável.
   - Separe “processo vivo”, “endpoint respondendo”, “dados observados” e “feature consumida”; cada camada precisa de sua própria prova.
   - Se não houver consumer executável ou readback, mantenha o claim como `UNKNOWN` ou `CONTRACT_PRESENT_NOT_CONSUMED`.

7. Validar a implementação na mesma ordem do claim

   - Para UI autenticada, prove separadamente: rota/gate de autenticação, navegação até a seção, presença do conteúdo e acessibilidade dos controles; uma renderização pública ou um componente source não prova a sessão autenticada.
   - Para builds que geram artefatos SSR/Nitro, execute também o pós-processador do owner (`build:vps`, não apenas `vite build`). Se o build principal passar e o pós-processador falhar por mudança de formato, inspecione o artefato real e prove o invariante necessário no entry efetivamente carregado; não relaxe a asserção contando qualquer arquivo parecido.
   - Antes de declarar cadeia Casa → transporte → VPS → MCP, teste DNS/rota e acesso read-only. Separe explicitamente HEAD local, HEAD remoto e HEAD implantado; um serviço MCP saudável não prova que o cockpit está publicado, e uma porta local respondendo não prova autenticação ou consumo da feature. Se o canal não puder ser alcançado, mantenha o efeito, cursor e deploy como `UNKNOWN`, sem transformar documentação histórica em prova.

8. Emitir a matriz e o veredito

   Use uma linha por capacidade:

   ```text
   CAPABILITY | DONOR | ADAPTER/OWNER | CONSUMER | RUNTIME_READBACK | VERDICT
   ```

   Classifique:

   - `PASS`: consumidor efetivo e readback comprovados;
   - `PARTIAL`: parte das capacidades integrada, ou a superfície mede capacidades equivalentes por outra fonte;
   - `UNKNOWN`: falta prova material de consumidor ou runtime;
   - `BLOCKED`: existe causa exata impedindo a verificação.

9. Termine com três listas curtas: já integrado, parcialmente representado, ainda não provado. Não declare integração total quando qualquer capacidade material permanecer apenas em documentação, adapter sem consumidor ou fonte paralela.

10. Registrar o receipt mesmo quando houver bloqueio

   - Inclua HEAD local/remoto, estado do worktree, owner, comandos realmente executados, resultados, versão/fingerprint, evidência de runtime, blockers exatos e `NEXT_CURSOR`.
   - Não faça pull/reset/clean/deploy a partir de checkout sujo ou divergente para “fechar” o placar. Preserve o trabalho e reporte `FIXED_POINT=false` quando a prova material faltar.
   - Diferencie sempre `SOURCE_PASS`, `RUNTIME_UNKNOWN`, `MERGED` e `DEPLOYED`; nenhum substitui o outro.

## Armadilhas generalizáveis

- Grepe primeiro o consumidor real e depois a documentação: comentários e inventários descrevem intenção, mas imports, rotas e handlers mostram o caminho causal.
- Não confunda um painel administrativo com a pasta de status só porque ambos exibem “módulos”: uma tabela de módulos e snapshots operacionais podem ter owners, freshness e contratos diferentes.
- Não promova um adaptador novo a integração antes de localizar seu import ou endpoint consumidor: sem essa ligação, o código apenas define uma possibilidade.
- Não trate um endpoint geral de health como prova de cada feature: health prova a rota respondendo, não a projeção correta, freshness ou efeito da capacidade.
- Não use uma cópia local suja como cânone sem marcar o estado: arquivos não rastreados e mudanças não commitadas podem explicar o comportamento local, mas não provam promoção nem deploy.
- Não transforme ausência de referência textual em prova de inexistência sem procurar também rotas, imports, configuração, chamadas dinâmicas e readback; a conclusão correta pode ser `UNKNOWN`.

## Building new cockpit integrations

When the task is not just verifying but BUILDING a new integration section, see `references/cockpit-cerebro-build-pattern.md` for the full pattern: server functions, doc parsers, typed returns, and UI components.

## Formato de registro técnico de verificação

Os campos abaixo documentam a prova. Na conversa com o CHEFE, explicar o resultado, a evidência e a pendência em português natural, sem imprimir um formulário obrigatório. Quando for solicitado relatório técnico, usar:

```text
VEREDITO=PASS|PARTIAL|UNKNOWN|BLOCKED
ESCOPO=<donor> → <superfície>

INTEGRADO:
- <capacidade> — <prova curta>

PARCIALMENTE REPRESENTADO:
- <capacidade> — <fonte alternativa ou cone incompleto>

NÃO PROVADO/BLOQUEADO:
- <capacidade> — <fio exato e evidência faltante>

PROVA_FINAL=<comando, rota, teste ou readback executado>
```
