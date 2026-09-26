# Técnica da Lupa  
### Versão Premium — Método de Revisão Crítica, Prova e Decisão de Alta Performance

**Ferramenta única de decisão para líderes, arquitetos, builders, revisores humanos e agentes de IA.**

> **Status deste arquivo:** versão consolidada para aprovação.  
> **Princípio de preservação:** melhorar o que já existe, sem criar método, lei, documento ou estrutura paralela desnecessária.  
> **Última evolução:** 19/07/2026 — correção mínima aplicada na própria Lupa após incidente real (auditoria `mission_panel`, ver `REVISAO-TECNICA-DA-LUPA.md` §28 e "Histórico de Evolução" no final deste arquivo). Nenhuma Lupa paralela foi criada.

---

## Posicionamento

A maioria das pessoas aprova o que *parece* bom.  
Poucas pessoas têm disciplina para rejeitar o que *só parece* bom.

A **Técnica da Lupa** existe para separar:

- Solução real × Solução teatral
- Complexidade necessária × Complexidade ornamental
- Progresso × Movimento
- Evidência × Suposição
- Sistema vivo × Status aparentemente verde
- Correção mínima × Reescrita desnecessária
- Fonte da verdade × Narrativa sem prova

Ela foi desenhada para contextos de alto custo de erro:

- sistemas em produção;
- arquiteturas críticas;
- produtos que precisam escalar;
- mudanças que afetam clientes;
- operações com dados sensíveis;
- orquestração de agentes;
- decisões que custam dinheiro, reputação ou continuidade operacional.

A Lupa não substitui testes, observabilidade, revisão formal, autorização ou histórico no Git.  
Ela organiza esses elementos em uma decisão única, rastreável e proporcional ao risco.

---

## Regra de Ouro

> **Quando já existe uma estrutura válida, não crie outra para competir com ela. Leia, preserve, una, corrija e evolua o que existe.**

Aplicação obrigatória:

1. **Evidência primeiro.**
2. **Correção mínima.**
3. **Preservar o que já funciona.**
4. **Histórico no Git.**
5. **Registrar o ouro no final.**

Consequências práticas:

- não criar nova fila se uma fila existente pode ser corrigida;
- não criar novo workflow se o atual pode ser ajustado;
- não criar novo documento canônico para repetir outro;
- não abrir novo PR apenas para escapar de um PR problemático;
- não reescrever vários módulos quando um patch localizado resolve;
- não remover ideias válidas anteriores;
- não tratar aparência de saúde como prova de funcionamento;
- não executar ação destrutiva, deploy, restart, reset ou promoção sem autorização correspondente.

A Regra de Ouro não proíbe evolução.  
Ela proíbe duplicação desnecessária, perda de conhecimento e complexidade criada sem benefício comprovado.

---

## Filosofia Central

> “Se você não consegue explicar de forma simples, você ainda não entendeu o suficiente para aprovar.”

Essa frase não é motivacional. É operacional.

A Técnica da Lupa combina três movimentos:

1. **Zoom Out** — visão de sistema, valor real e alinhamento;
2. **Zoom In** — implementação, risco, integração e sustentabilidade;
3. **Técnica de Feynman** — teste de compreensão profunda.

Os três movimentos continuam sendo o núcleo do método.

Porém:

> **Passar em Zoom Out, Zoom In e Feynman torna a entrega compreensível e revisável. A aprovação exige evidência proporcional ao risco.**

Explicação não substitui execução.  
Status não substitui comportamento real.  
Comentário não substitui review formal.  
Mock não substitui prova final de integração.  
Uma nota alta não anula bloqueio crítico.

---

## Objetivo Operacional

A Técnica da Lupa deve responder, com clareza e prova:

1. O problema é real?
2. A solução é necessária?
3. A solução preserva o que já funciona?
4. É a menor correção suficiente?
5. A complexidade se justifica?
6. O risco está identificado?
7. A integração foi validada?
8. O rollback é possível?
9. A segurança foi preservada?
10. O comportamento real foi executado?
11. A prova pertence exatamente ao código revisado?
12. A decisão foi registrada na fonte correta?

---

## Quando Aplicar

Use obrigatoriamente quando um agente ou humano entregar:

- arquitetura nova ou grande refatoração;
- alteração em gateway, roteamento ou fallback;
- plano de implementação significativo;
- código de alto impacto;
- sistema multi-componente;
- mudança de autenticação, autorização ou permissões;
- migração de banco ou manipulação de dados;
- circuit breaker, rate limit ou deduplicação;
- mudança em produção;
- prompt complexo ou orquestração de agentes;
- novo workflow, fila, painel, serviço ou abstração;
- qualquer proposta “completa demais” ou bonita demais para o tamanho do problema;
- correção em componente que atende clientes reais;
- mudança que possa interromper receita, operação ou trabalho.

Regra de rigor:

> **Quanto maior o impacto, a irreversibilidade ou a aparência de completude, mais forte deve ser a prova.**

A boa apresentação não é evidência de erro.  
Ela apenas não reduz o rigor necessário.

---

## Proporcionalidade pelo Risco

Antes da revisão, classifique o risco.

| Nível | Definição | Exemplos | Exigência mínima |
|---|---|---|---|
| **R0 — Informativo** | Sem alteração funcional | texto, comentário, documentação sem efeito operacional | leitura e coerência |
| **R1 — Baixo** | Mudança localizada e reversível | estilo, cópia, ajuste isolado | teste direto e diff |
| **R2 — Médio** | Afeta fluxo interno ou integração limitada | módulo, endpoint secundário, automação interna | regressão, integração e rollback definido |
| **R3 — Alto** | Afeta fluxo crítico, autenticação, dados ou clientes | gateway, fallback, pagamentos, permissões | cenários completos, revisão independente e rollback validado |
| **R4 — Crítico** | Pode causar indisponibilidade ampla, vazamento ou perda de dados | produção, migração destrutiva, segredo exposto, acesso privilegiado | bloqueio por padrão até prova completa e autorização explícita |

Regras:

- na dúvida entre dois níveis, use o mais alto;
- risco pode subir durante a revisão;
- risco não deve ser reduzido apenas porque a mudança parece pequena;
- alteração curta em autenticação ou produção pode ser R4;
- documentação falsa sobre estado operacional também pode elevar o risco.

---

## Linguagem de Evidência

Toda análise deve separar três categorias.

### Evidência

Algo observado diretamente e reproduzível.

Exemplos:

- diff do código;
- teste executado;
- saída de check;
- resposta de endpoint;
- log sanitizado;
- comportamento funcional;
- commit identificado;
- review formal ligado ao mesmo código.

### Inferência

Conclusão lógica baseada em evidências, ainda sujeita a confirmação.

Exemplo:

> O timeout provavelmente não aciona o fallback porque a exceção é tratada antes do router.

### Suposição

Informação ainda não comprovada.

Exemplo:

> O serviço deve estar saudável porque o processo aparece online.

Formato recomendado:

```text
EVIDÊNCIA:
INFERÊNCIA:
SUPOSIÇÃO:
COMO CONFIRMAR:
```

É proibido apresentar inferência ou suposição como fato confirmado.

---

## Fonte da Verdade

Antes de aplicar a Lupa, identifique o alvo exato.

```text
REPOSITÓRIO:
BRANCH:
PR:
HEAD_SHA:
ISSUE/MISSÃO:
AMBIENTE:
SERVIÇO:
DOCUMENTO CANÔNICO:
ESTADO ATUAL OBSERVADO:
```

Sem fonte da verdade identificada:

- a revisão pode analisar código antigo;
- a evidência pode pertencer a outro commit;
- o teste pode não refletir o que será promovido;
- duas versões podem ser tratadas como oficiais;
- o registro pode perpetuar informação incorreta.

A Lupa deve bloquear aprovação quando não for possível ligar a prova ao alvo revisado.

---

# Framework Completo

## 1. Zoom Out — Visão de Sistema

Objetivo: responder se **vale a pena** seguir em frente.

### 1.1 Realidade vs Aparência

- Isso resolve o problema real ou apenas cria a ilusão de solução completa?
- Existe implementação ou apenas documentação, promessa, mock ou interface?
- O status apresentado mede trabalho real ou somente processo ativo?
- A entrega resolve a causa ou disfarça o sintoma?
- Existe evidência de comportamento de ponta a ponta?
- O resultado pode ser demonstrado sem depender da narrativa do autor?

### 1.2 Impacto no que Já Funciona

- Essa mudança toca, altera ou reescreve fluxos estáveis?
- Circuit breakers, rate limits, deduplicação, autenticação, rastreabilidade ou funis críticos são afetados?
- Há consumidores indiretos do módulo?
- A assinatura, o retorno e os efeitos colaterais continuam compatíveis?
- O custo de regressão justifica o benefício?
- Existe uma forma menos invasiva de alcançar o mesmo resultado?

### 1.3 Complexidade vs Valor Real

- O benefício justifica claramente a complexidade adicionada?
- Estamos resolvendo poucos problemas com muitas peças novas?
- A solução cria mais estados, filas, workers, bancos, painéis ou workflows?
- Quantos pontos novos de falha foram adicionados?
- Qual o custo de manutenção em 3, 6 e 12 meses?
- O componente novo substitui algo ou apenas passa a coexistir?
- O sistema ficará mais simples depois da mudança?

### 1.4 Alinhamento Estratégico

- Isso avança o objetivo prioritário atual?
- Está resolvendo problema secundário enquanto o bloqueio principal continua?
- Estamos otimizando a métrica certa?
- Existe um fio de missão explícito?
- A mudança ajuda a próxima etapa ou abre outra frente?
- O benefício é operacional, financeiro, técnico ou apenas visual?

### 1.5 Preservação e Não Duplicação

- Já existe componente, documento, fila, workflow, regra ou módulo com esta responsabilidade?
- É possível evoluir o existente?
- Por que uma estrutura nova seria necessária?
- A nova estrutura cria duas fontes da verdade?
- Haverá migração, desativação ou convivência indefinida?
- A proposta preserva decisões válidas anteriores?
- A mudança viola a Regra de Ouro?

Quando existir solução válida já instalada, a preferência é:

```text
ler → entender → corrigir → testar → registrar
```

e não:

```text
ignorar → duplicar → abandonar → criar novamente
```

### 1.6 Cliente, Negócio e Continuidade

- Quantos clientes, usuários ou processos podem ser afetados?
- Existe janela segura?
- A mudança pode impedir trabalho, receita ou acesso?
- O cenário de pior caso foi descrito?
- O risco para clientes reais justifica o benefício?
- O teste pode ser feito sem usar dados ou tráfego real?
- Existe isolamento entre teste e produção?

---

## 2. Zoom In — Visão Técnica e de Risco

Objetivo: responder se **é seguro, comprovável e sustentável** implementar.

### 2.1 Estado Atual

Antes de propor correção:

- reproduza o problema;
- registre o comportamento atual;
- identifique a versão executada;
- confirme o ambiente;
- diferencie serviço ativo de serviço funcional;
- localize os pontos reais de entrada e saída;
- identifique dependências e consumidores.

Pergunta obrigatória:

> O que prova que o problema existe exatamente onde estamos mexendo?

### 2.2 Correção Mínima

- Qual é a menor mudança que resolve o problema?
- É necessário reescrever ou apenas ajustar?
- O patch preserva interfaces e contratos?
- A mudança está restrita ao escopo autorizado?
- Arquivos não relacionados foram alterados?
- O diff é explicável linha por linha?
- A solução reduz ou aumenta a dívida?
- Existe mudança cosmética misturada com correção crítica?

Correção mínima não significa correção incompleta.  
Significa resolver a causa com a menor superfície de risco suficiente.

### 2.3 Contratos e Integrações

Para cada módulo alterado:

- quais arquivos o chamam?
- quais argumentos são enviados?
- quais tipos e formatos são esperados?
- qual retorno é consumido?
- pode lançar exceção?
- retorna estado estruturado?
- existem valores padrão?
- há comportamento silencioso?
- existem integrações externas?
- versões antigas continuam chamando o contrato anterior?

Regra obrigatória:

> **Ao recriar ou alterar um módulo, localizar todos os call sites e casar assinatura, retorno e efeitos colaterais.**

Teste isolado não substitui teste de integração.

> **Regra adicional (incidente real, 19/07/2026):** nome de evento, hook ou gatilho não é especificação. Antes de tratar um hook como proxy de um conceito de negócio (ex.: "fim de sessão" = "fim de missão"), leia o comentário/docstring do próprio call site que o dispara e confirme a frequência real (uma vez por sessão? uma vez por turno? uma vez por chamada de rede?). Um plugin de observabilidade tratou `on_session_end` — que a documentação do próprio framework descreve como disparado "no fim de TODO turno" — como se fosse "fim de missão", e passou a editar um card de status a cada mensagem do usuário. A suposição vinha do nome do hook, não da evidência do código. **Frequência de disparo não confirmada por leitura do call site é suposição, não evidência**, e deve ser tratada como tal na Linguagem de Evidência (seção acima).

### 2.4 Plano de Regressão

- Existe plano explícito e executável?
- Quais fluxos críticos precisam continuar funcionando?
- Quais testes cobrem o comportamento antigo?
- Há casos positivos, negativos e limites?
- Quem executa?
- Em qual ambiente?
- Qual resultado é considerado falha?
- O teste está ligado ao mesmo `HEAD_SHA` revisado?
- O fluxo real foi exercitado?

### 2.5 Rollback Seguro

- Se falhar, como reverter?
- Qual é o comando ou procedimento exato?
- Quais arquivos, serviços e dados são afetados?
- Quanto tempo a reversão leva?
- O rollback depende de outra pessoa ou ferramenta?
- Existe risco de perda de dados?
- O rollback foi validado ou só descrito?
- Feature flag é suficiente?
- A reversão restaura realmente o estado anterior?
- Há migração incompatível que impeça retorno?

Rollback escrito e nunca testado continua sendo hipótese.

### 2.6 Tratamento de Legado

- O legado está isolado ou apenas contornado?
- Os caminhos antigos continuam vivos?
- Existe motivo comprovado para mantê-los?
- Há plano concreto de remoção?
- A mudança cria compatibilidade duplicada indefinidamente?
- O novo código depende de comportamento não documentado?
- Estamos reduzindo ou aumentando dívida técnica?
- A documentação antiga será atualizada no mesmo fluxo?

### 2.7 Manutenibilidade

- Outra pessoa competente consegue manter isso?
- O autor é o único que entende o fluxo?
- Os nomes representam a responsabilidade real?
- O código contém abstrações desnecessárias?
- A solução aumenta a superfície de falha?
- Existe documentação suficiente no ponto correto?
- O comportamento inesperado falha de maneira clara?
- O sistema degrada com segurança?

### 2.8 Observabilidade

- Existem logs úteis, sanitizados e correlacionáveis?
- Há métricas de sucesso, falha, latência e fallback?
- Existe trace do caminho crítico?
- É possível distinguir erro de aplicação, rede, credencial e permissão?
- O sistema registra qual provider ou rota foi usada?
- É possível identificar circuit breaker aberto?
- O log revela segredo?
- Um operador consegue diagnosticar a causa sem adivinhar?

Pergunta operacional:

> Quando isso quebrar fora do horário normal, a evidência disponível aponta a causa ou apenas mostra que algo falhou?

### 2.9 Segurança e Permissões

Verifique obrigatoriamente:

- secrets, tokens, chaves e `.env`;
- autenticação;
- autorização;
- privilégio mínimo;
- dados pessoais;
- sanitização de erros;
- logs;
- branches remotas;
- histórico Git;
- dependências;
- acesso de agentes;
- ações destrutivas;
- produção.

Bloquear quando houver:

- segredo exposto;
- pedido para colar segredo em chat;
- credencial registrada em log;
- branch ou commit contendo segredo ainda acessível;
- permissão maior que a necessária;
- alteração em produção sem autorização;
- ação destrutiva sem plano e autorização;
- erro interno devolvido ao cliente sem sanitização.

### 2.10 Dados e Migrações

- A mudança altera schema?
- É compatível com versão anterior?
- Há backfill?
- O backfill é idempotente?
- Existe backup válido?
- O rollback preserva dados criados após a migração?
- Há risco de duplicação?
- O teste usa dados sintéticos?
- Há isolamento de clientes reais?
- A operação pode ser pausada?

Migração irreversível sem prova e autorização é bloqueio crítico.

### 2.11 Dependências e Provedores

- A dependência é necessária?
- A versão está fixada?
- Existe risco de mudança externa?
- O provider possui limites, timeout e política de erro?
- O fallback respeita semântica e formato?
- Erro de credencial está sendo mascarado como indisponibilidade?
- Rate limit está sendo tratado corretamente?
- O mock está claramente marcado?
- Existe degradação limpa?
- O retorno entre providers é normalizado?

### 2.12 Saúde Real vs Falso Verde

Não aceite como prova final, isoladamente:

- processo online;
- PM2 verde;
- container healthy;
- porta aberta;
- HTTP 200 em endpoint superficial;
- screenshot;
- log solto;
- comentário de IA;
- mock;
- teste unitário isolado;
- check de commit antigo.

Exija trabalho real:

```text
entrada válida
→ processamento real
→ integração real
→ resultado observável
→ registro correto
→ recuperação ou rollback
```

### 2.13 Atribuição de Mudança — Timestamps e Escopo Real

*Adicionado em 19/07/2026 após incidente real: um revisor bloqueou uma entrega alegando que 7 arquivos pré-existentes tinham sido "alterados fora do escopo". A alegação estava tecnicamente correta (os arquivos realmente apareciam como modificados) e a conclusão estava errada (as mudanças eram de uma fase anterior da mesma missão, feitas horas antes, já testadas e aprovadas). O revisor não tinha como saber isso sozinho — mas quem recebeu o veredito tinha, e só descobriu comparando timestamps.*

Antes de aceitar (ou de emitir) um bloqueio por "arquivo fora de escopo alterado":

- comparar o `mtime` dos arquivos apontados com o horário de início da sessão/mudança atual;
- verificar se a mudança já está documentada em um registro anterior (PR, commit, seção de relatório) com prova de teste/aprovação própria;
- checar se o controle de versão distingue arquivo **novo** (`??`/untracked) de arquivo **modificado** (`M`) — a alegação "só criamos arquivos novos" só é verificável assim, não por leitura de diretório;
- nunca aceitar "está diferente do HEAD" como prova de "foi esta mudança que alterou" sem checar quando a alteração realmente ocorreu.

Um veredito de bloqueio baseado em atribuição errada deve ser corrigido com evidência (timestamp, log, seção de relatório anterior) e registrado como tal — não silenciosamente ignorado, nem aceito sem checagem. Isso não enfraquece o revisor: um revisor sem acesso ao histórico completo da missão **deve** apontar o que parece fora de escopo; quem consolida o veredito é quem tem (ou deve buscar) o contexto pra confirmar ou refutar.

### 2.14 Efeitos Colaterais Externos — Freio de Emergência e Debounce

*Adicionado em 19/07/2026: um plugin novo que passou a chamar uma API externa (Telegram) real não tinha nenhuma forma de ser desligado em runtime além de reiniciar o processo inteiro ou desligar TODOS os plugins de uma vez — e um dos seus próprios gatilhos (erro de API) podia disparar repetidamente durante uma instabilidade real, sem limite.*

Para qualquer mudança que passe a produzir efeito colateral fora do processo (mensagem, chamada de API de terceiro, webhook, notificação):

- existe uma forma de desligar **só esse efeito colateral**, em runtime, sem precisar reiniciar o processo nem desligar outras funcionalidades? (ex.: variável de ambiente checada a cada chamada)
- gatilhos ligados a **erro ou retry** têm proteção contra repetição rápida (debounce/cooldown)? Retry storm em um provedor instável é justamente o momento em que esse tipo de gatilho mais dispara — se não tiver freio, a instabilidade de um sistema vira flood em outro;
- o registro local (log/auditoria) continua completo mesmo quando o efeito externo é suprimido pelo freio de emergência ou pelo debounce? (suprimir o efeito externo não deve suprimir a evidência).

Isso complementa a seção 2.5 (Rollback Seguro): rollback é "desfazer a mudança"; freio de emergência é "conter o efeito sem precisar desfazer nada".

---

## 3. Técnica de Feynman — Teste de Compreensão Profunda

Este é o filtro mais poderoso e mais negligenciado.

**Regra:**  
Se você não consegue explicar a solução de forma simples, clara e sem jargão desnecessário, você ainda não entendeu o suficiente para aprová-la.

### Como aplicar

1. Explique a solução para uma pessoa inteligente que não conhece o domínio.
2. Mostre o caminho da entrada até o resultado.
3. Identifique onde a explicação depende de palavras vagas.
4. Volte aos pontos vagos e procure evidência.
5. Remova complexidade que não consegue justificar.
6. Explique o que pode falhar.
7. Explique como detectar e reverter.
8. Só considere a entrega compreendida quando o “porquê”, o “como” e a prova estiverem claros.

### Perguntas Feynman obrigatórias

- Qual é o problema real em uma frase?
- O que acontece hoje?
- O que será alterado?
- Por que essa é a melhor abordagem agora?
- O que acontece se removermos a parte mais complexa?
- Qual é o caminho mais simples que resolve 80% do problema?
- O que já existe e será preservado?
- Qual contrato pode quebrar?
- Como sabemos que funcionou?
- Como sabemos que não quebrou outra coisa?
- Como voltamos atrás?
- Qual evidência ainda falta?

Falha no Feynman não prova que a solução está errada.  
Prova que ainda não está suficientemente compreendida para ser aprovada.

---

# Gate de Evidência

Uma entrega somente pode avançar quando a evidência for proporcional ao risco.

## O que uma prova válida deve ligar

```text
REPOSITÓRIO
→ BRANCH
→ PR
→ HEAD_SHA
→ CENÁRIO
→ EXECUÇÃO
→ RESULTADO
→ VEREDITO
```

A evidência deve responder:

1. O que acontecia antes?
2. Qual código mudou?
3. Qual teste foi executado?
4. Qual resultado apareceu?
5. A prova pertence exatamente ao código revisado?
6. O resultado é reproduzível?
7. O dado apresentado está sanitizado?
8. O teste cobriu integração real?

## Evidências válidas

- diff revisável;
- teste automatizado;
- teste funcional controlado;
- saída de build;
- check do CI;
- log sanitizado com correlation ID;
- métrica;
- trace;
- resposta de endpoint;
- movimentação real de estado;
- review formal;
- commit e `HEAD_SHA`;
- procedimento de rollback validado;
- comparação antes/depois.

## Evidências insuficientes quando isoladas

- “funcionou aqui”;
- screenshot sem contexto;
- processo ativo;
- comentário de revisor;
- descrição do autor;
- plano sem execução;
- mock sem integração real;
- log sem commit ou horário;
- teste antigo;
- saída truncada;
- ausência de erro;
- interface bonita;
- porcentagem sem método de cálculo.

---

# Bloqueios Absolutos

Uma entrega deve ser marcada como **BLOQUEADA**, independentemente de nota ou aparência, quando existir:

1. ausência de fonte da verdade;
2. ausência de critério de sucesso;
3. evidência incompatível com o `HEAD_SHA`;
4. mudança crítica sem regressão;
5. alto impacto sem rollback executável;
6. segredo, token, chave ou `.env` exposto;
7. ação destrutiva sem autorização;
8. deploy, restart, reset ou promoção sem autorização;
9. alteração ampla quando correção localizada resolve;
10. criação de estrutura concorrente sem necessidade comprovada;
11. impacto em fluxo estável sem teste;
12. ausência de observabilidade mínima;
13. mudança R3 ou R4 revisada apenas pelo próprio autor;
14. mock apresentado como prova final;
15. documentação contradizendo a implementação;
16. migração irreversível sem proteção;
17. evidência antiga, incompleta ou não reproduzível;
18. risco conhecido para clientes sem isolamento;
19. erro interno ou segredo retornado ao usuário;
20. tentativa de mascarar falha de credencial como falha genérica;
21. aprovação baseada apenas em status verde;
22. suposição apresentada como fato.

Um bloqueio não significa destruição da proposta.  
Significa que a próxima ação correta é corrigir a causa mínima e repetir a prova.

---

# Validação por Cenários

Toda mudança R2, R3 ou R4 deve ser testada por cenários reais ou representativos.

Um cenário não é aprovado por explicação.  
Precisa de execução observável.

## Formato obrigatório do cenário

```markdown
### Cenário: [nome]

Risco:
R0 | R1 | R2 | R3 | R4

Fonte da verdade:
- Repositório:
- Branch:
- PR:
- HEAD_SHA:
- Ambiente:

Estado inicial:
- comportamento atual;
- dependências;
- controles ativos.

Problema reproduzido:
- passos;
- resultado observado;
- evidência.

Ação proposta:
- correção mínima;
- arquivos afetados;
- autorização necessária.

Resultado esperado:
- comportamento principal;
- comportamento de erro;
- preservação de fluxo antigo;
- observabilidade;
- segurança.

Execução:
- comando, check ou procedimento;
- sem incluir secrets;
- dados de teste usados.

Evidência:
- teste;
- log sanitizado;
- métrica ou trace;
- diff;
- check ligado ao HEAD_SHA.

Regressão:
- fluxos preservados;
- resultado.

Rollback:
- procedimento;
- resultado do teste ou limitação declarada.

Veredito:
APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR

Pendência:
- nenhuma, ou descrição objetiva.

Registro:
- PR;
- commit;
- pendência;
- aprendizado;
- estado atual.
```

---

## Cenários Mínimos por Tipo de Mudança

### Correção localizada

- comportamento que falhava;
- comportamento corrigido;
- fluxo vizinho preservado;
- entrada inválida;
- rollback simples.

### Gateway, router ou fallback

- provider principal saudável;
- timeout;
- erro 401/403;
- rate limit 429;
- erro 5xx;
- circuit breaker aberto;
- fallback saudável;
- fallback indisponível;
- recuperação do principal;
- resposta normalizada;
- erro sanitizado;
- ausência de secret;
- rota antiga preservada;
- mock claramente identificado.

### Autenticação e autorização

- usuário válido;
- usuário inválido;
- usuário sem permissão;
- token expirado;
- tentativa de escalada;
- revogação;
- auditoria;
- erro sanitizado;
- privilégio mínimo.

### Banco de dados e migração

- schema anterior;
- aplicação da migração;
- compatibilidade;
- leitura e escrita;
- duplicidade;
- idempotência;
- rollback;
- dados sintéticos;
- falha parcial;
- recuperação.

### Hermes ou orquestração

- missão válida entra;
- missão é assumida;
- estado muda corretamente;
- execução termina;
- resultado é registrado;
- notificação ocorre;
- formato inválido é tratado;
- falha do executor é visível;
- retry não duplica execução;
- processo online executa trabalho real.

### Interface e painel

- dado real, não mock;
- loading;
- vazio;
- erro;
- atualização;
- permissão;
- responsividade;
- acessibilidade essencial;
- não expõe informação sensível;
- não apresenta falso verde.

### Plugin, hook ou integração de observabilidade

*Categoria adicionada em 19/07/2026, a partir de incidente real (auditoria `mission_panel`).*

- a frequência real de disparo do evento/hook foi confirmada por leitura do código-fonte, não suposta pelo nome (ver 2.13);
- estado compartilhado entre disparos concorrentes tem exclusão mútua (lock), não só "na prática não deve colidir";
- retry ou nova tentativa para a MESMA unidade lógica não produz um segundo efeito externo (mensagem, chamada, registro) — idempotência real, testada com concorrência de verdade, não só sequencial;
- gatilho ligado a erro/retry tem debounce (ver 2.14);
- existe freio de emergência em runtime, sem depender de restart (ver 2.14);
- falha do plugin/hook não derruba nem atrasa perceptivelmente o fluxo principal que o hospeda;
- efeito externo (mensagem, notificação) é idempotente por unidade lógica — edita/atualiza em vez de duplicar, quando a plataforma permitir;
- docstring/comentário do módulo descreve o comportamento REAL atual, não uma intenção antiga que o código já ultrapassou;
- log de erro do plugin não vaza token, segredo nem o conteúdo completo do payload enviado externamente.

---

# Prova do Cenário

A prova deve ficar vinculada ao fluxo existente de revisão.

## Pacote mínimo

```markdown
## Prova da Técnica da Lupa

HEAD_SHA:
[sha]

Problema real:
[uma frase]

Estado anterior:
[evidência]

Correção mínima:
[o que foi alterado]

Cenários executados:
- [cenário]: PASS | FAIL | BLOCKED

Evidências:
- diff:
- checks:
- teste funcional:
- log sanitizado:
- métrica/trace:
- rollback:

Regressões verificadas:
- [fluxo]: PASS | FAIL

Bloqueios:
- nenhum, ou lista objetiva.

Inferências:
- [quando houver]

Suposições pendentes:
- [quando houver]

Veredito:
APTO PARA REVIEW | CONDICIONADO | CORRIGIR | BLOQUEADO
```

## Regras da prova

- um revisor deve produzir um registro único e atualizável;
- evitar comentários duplicados;
- evitar placeholders abandonados;
- review formal deve estar ligado ao `HEAD_SHA`;
- acordo sem ação não conta como conclusão;
- revisão automática não substitui decisão;
- mudança no código após a prova invalida a prova anterior;
- execução em commit diferente deve ser repetida ou justificada;
- evidência sensível deve ser sanitizada;
- não registrar secrets em comentário, artefato ou log.

---

# Cadeia de Decisão

A Lupa organiza responsabilidades sem misturá-las.

```text
Builder implementa
→ Actions e testes provam
→ Revisores analisam
→ Juiz/Critic emite veredito
→ Autoridade responsável ratifica ações críticas
→ Git registra
```

## Responsabilidades

### Builder

- aplica correção mínima;
- explica o diff;
- executa testes;
- não aprova a própria mudança crítica;
- não esconde limitações.

### Actions e testes

- produzem evidência reproduzível;
- executam verificações ligadas ao commit;
- não tomam decisão estratégica;
- falham claramente.

### Revisores

- procuram regressão, duplicação, risco e falsa evidência;
- opinam com base no mesmo `HEAD_SHA`;
- não criam ruído repetido;
- não substituem o juiz;
- apontam tudo que parece fora de escopo, mesmo sem ter contexto histórico completo — isso é esperado e correto, não é falha do revisor.

### Juiz/Critic

- consolida evidências;
- aplica bloqueios;
- emite um único veredito;
- diferencia falta de prova de erro confirmado;
- **antes de aceitar um bloqueio de "escopo" ou "arquivo alterado indevidamente", verifica atribuição real (timestamp, histórico, registro anterior) — um revisor sem contexto completo pode apontar corretamente um sintoma e errar a causa; quem consolida é quem confirma ou refuta com evidência (ver 2.13).**

### Autoridade responsável

- ratifica ações críticas;
- autoriza produção, restart, deploy, reset ou destruição;
- aceita ou rejeita risco residual.

---

# Matriz de Avaliação

A pontuação auxilia a decisão, mas nunca supera bloqueios absolutos.

| Critério | Peso |
|---|---:|
| Problema e valor real | 15 |
| Evidência e prova | 15 |
| Regressão e testes | 15 |
| Correção mínima e preservação | 10 |
| Rollback e recuperação | 10 |
| Segurança e permissões | 10 |
| Complexidade e manutenção | 10 |
| Contratos e integração | 5 |
| Observabilidade | 5 |
| Feynman e clareza | 5 |
| **Total** | **100** |

## Faixas

| Resultado | Ação |
|---|---|
| Bloqueio absoluto | **BLOQUEAR**, independentemente da nota |
| 90–100 | **APROVAR**, se não houver bloqueios |
| 80–89 | **CONDICIONAR** a ajustes localizados |
| 70–79 | **CORRIGIR** e repetir cenários |
| Abaixo de 70 | **REJEITAR A FORMA ATUAL** e simplificar |

A nota deve ser explicada.  
Porcentagem sem evidência ou método de cálculo não conta como prova.

---

# Matriz de Decisão

| Situação | Ação recomendada |
|---|---|
| Passa em Zoom Out + Zoom In + Feynman + prova | Aprovar conforme risco e autorização |
| Problemas leves e localizados | Correção mínima e reavaliação |
| Falha em realidade vs aparência | Bloquear até prova funcional |
| Falha em complexidade vs valor | Exigir simplificação |
| Falha em rollback ou regressão | Bloquear promoção |
| Falha no Feynman | Devolver para esclarecimento |
| Aumenta dívida sem plano | Exigir isolamento ou redução |
| Cria estrutura concorrente | Voltar ao componente existente |
| Status verde sem trabalho real | Executar cenário de ponta a ponta |
| Evidência não pertence ao HEAD_SHA | Invalidar prova |
| Expõe secret ou dado sensível | Bloqueio crítico e tratamento seguro |
| Mudança crítica sem revisor independente | Não aprovar |
| Mock apresentado como produção | Bloquear |
| Documentação diverge do código | Corrigir a fonte da verdade |

---

# Registro

A decisão deve ser registrada **onde o sistema já registra esse tipo de informação**, sem criar fonte paralela.

## 1. PR e commit

Usar para:

- diff;
- evidência da mudança;
- checks;
- review;
- veredito;
- histórico técnico.

Quando tudo funcionou e não surgiu conhecimento reutilizável, PR e commit podem ser suficientes.

## 2. Pendências existentes

Registrar no documento de pendências já utilizado quando:

- teste não foi concluído;
- risco permanece;
- autorização ainda falta;
- dependência externa impede conclusão;
- ação futura possui critério de fechamento.

Formato:

```markdown
### Pendência: [título]

Origem:
PR, issue ou missão.

Estado:
O que foi comprovado e o que falta.

Risco:
R0 | R1 | R2 | R3 | R4

Próxima ação:
A menor ação necessária.

Critério de fechamento:
Evidência objetiva necessária.
```

## 3. Aprendizados existentes

Registrar no documento de aprendizados já utilizado somente quando surgir uma lição:

- comprovada;
- reutilizável;
- não óbvia;
- capaz de prevenir repetição.

Formato:

```markdown
### [número]. [título]

Categoria:
[erro-correcao | arquitetura | segurança | operação]

Data:
AAAA-MM-DD

Contexto:
O que ocorreu.

Evidência:
PR, commit, testes e comportamento observado.

Aprendizado:
Regra reutilizável.

Aplicação futura:
Onde verificar novamente.
```

Não registrar como aprendizado:

- opinião não testada;
- promessa;
- hipótese;
- resumo duplicado;
- detalhe sem utilidade futura.

## 4. Estado atual existente

Atualizar o documento de estado atual somente quando o estado operacional realmente mudou.

Exemplo:

```text
Antes:
Serviço online, execução funcional não comprovada.

Depois:
Fluxo executado de ponta a ponta no commit identificado.

Evidência:
PR, commit, check e cenário.
```

## 5. Registro do ouro

Ao concluir:

- preserve a decisão reutilizável;
- registre causa, prova e prevenção;
- não copie todo o chat;
- não crie documento paralelo;
- conecte ao fio da missão;
- diferencie concluído de pendente.

---

# Saída Obrigatória da Lupa

Toda aplicação completa deve terminar com:

```text
VEREDITO:
APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR

RISCO:
R0 | R1 | R2 | R3 | R4

NOTA:
__/100

FONTE DA VERDADE:
repositório, branch, PR e HEAD_SHA

PROBLEMA REAL:
uma frase

EVIDÊNCIA:
o que foi observado

INFERÊNCIAS:
conclusões ainda sujeitas a confirmação

SUPOSIÇÕES:
o que não foi comprovado

O QUE ESTÁ CERTO:
partes preservadas

FALHAS ENCONTRADAS:
causas, não apenas sintomas

BLOQUEIOS:
nenhum ou lista objetiva

CORREÇÃO MÍNIMA:
menor ajuste suficiente

CENÁRIOS:
executados, aprovados, falhos e não aplicáveis

REGRESSÃO:
resultado

ROLLBACK:
procedimento e validação

SEGURANÇA:
resultado

FEYNMAN:
explicação simples

PENDÊNCIA:
o que falta

PRÓXIMO PASSO:
uma ação

REGISTRO:
onde ficará o histórico

FIO DA MISSÃO:
etapa atual → próxima etapa → validação → registro
```

---

# Versões de Uso

## Versão Completa

Aplicar quando:

- risco R3 ou R4;
- arquitetura;
- produção;
- autenticação;
- dados;
- gateway;
- fallback;
- grande refatoração;
- impacto em clientes.

Executar:

```text
fonte da verdade
→ classificação de risco
→ Zoom Out
→ Zoom In
→ Feynman
→ cenários
→ prova
→ veredito
→ registro
```

---

## Versão Rápida — Checklist de Bolso

### Fonte e risco

- [ ] Identifiquei repositório, branch, PR e `HEAD_SHA`.
- [ ] Classifiquei o risco.
- [ ] Separei evidência, inferência e suposição.

### Zoom Out

- [ ] Resolve o problema real?
- [ ] Preserva o que já funciona?
- [ ] Evita estrutura paralela?
- [ ] O valor justifica a complexidade?
- [ ] Alinha com a missão atual?
- [ ] Protege clientes e continuidade?

### Zoom In

- [ ] Reproduzi o estado atual?
- [ ] A correção é mínima?
- [ ] Verifiquei todos os call sites?
- [ ] Confirmei a frequência real de disparo (não supus pelo nome do hook/evento)?
- [ ] Tem regressão?
- [ ] Tem rollback?
- [ ] Se cria efeito colateral externo: tem freio de emergência e debounce?
- [ ] Trata legado?
- [ ] É manutenível?
- [ ] É observável?
- [ ] Está seguro?
- [ ] Executa trabalho real?
- [ ] Se um revisor apontou "arquivo fora de escopo": comparei timestamp antes de aceitar como bloqueio?

### Feynman

- [ ] Consigo explicar em linguagem simples?
- [ ] Sei dizer por que esta abordagem é melhor agora?
- [ ] Sei explicar o que pode falhar?
- [ ] Sei mostrar como provar e reverter?

### Prova e registro

- [ ] A evidência pertence ao mesmo `HEAD_SHA`?
- [ ] Cenários críticos foram executados?
- [ ] Não existe bloqueio absoluto?
- [ ] O resultado foi registrado no lugar existente correto?

---

## Versão Ultra-Compacta — Para Agentes

```text
Antes de aprovar qualquer entrega, aplique a Técnica da Lupa única:

Regra de Ouro:
Melhore o que existe. Não crie estrutura paralela sem necessidade comprovada.
Evidência primeiro. Correção mínima. Preserve o que funciona. Registre no Git.

Fonte:
Identifique repositório, branch, PR, HEAD_SHA, ambiente e risco R0–R4.

Zoom Out:
1. Resolve o problema real ou só parece completo?
2. Preserva o que já funciona?
3. Já existe estrutura com a mesma função?
4. A complexidade é justificada pelo valor?
5. Alinha com a missão e protege clientes?

Zoom In:
6. O estado atual foi reproduzido?
7. A correção é a menor suficiente?
8. Todos os call sites, contratos e retornos foram validados?
9. A frequência real de disparo de hooks/eventos foi confirmada no código, não suposta pelo nome?
10. Existe regressão, rollback, segurança e observabilidade?
11. Efeito colateral externo (mensagem, API de terceiro) tem freio de emergência em runtime e debounce contra erro/retry?
12. "Arquivo fora de escopo" apontado por revisor foi checado por timestamp antes de virar bloqueio?
13. O fluxo real foi executado de ponta a ponta?

Feynman:
14. Consigo explicar problema, solução, risco, prova e rollback sem jargão?

Prova:
15. A evidência pertence ao mesmo HEAD_SHA?
16. Cenários reais foram executados?
17. Status verde, mock, screenshot ou comentário não são prova final.
18. Bloqueio absoluto supera qualquer nota.

Saída:
VEREDITO, RISCO, NOTA, EVIDÊNCIA, FALHAS, CORREÇÃO MÍNIMA,
CENÁRIOS, REGRESSÃO, ROLLBACK, SEGURANÇA, PENDÊNCIA,
PRÓXIMO PASSO, REGISTRO e FIO DA MISSÃO.
```

---

# Anti-Padrões que a Lupa Detecta

- solução “completa” demais para o tamanho do problema;
- abstração criada para impressionar;
- nova estrutura que repete uma existente;
- resposta a PR ruim abrindo outro PR;
- mais revisores usados para compensar ausência de juiz;
- status verde sem trabalho real;
- mock apresentado como produção;
- comentário apresentado como veredito;
- teste isolado em módulo integrado;
- assinatura ou retorno incompatível com consumidores;
- rollback apenas no papel;
- feature flag cobrindo legado sem plano;
- erro de credencial mascarado;
- fallback escondendo falha crítica;
- log vazando segredo;
- documentação divergindo do código;
- porcentagem sem prova;
- screenshot sem origem;
- refatoração ampla misturada com correção;
- ação destrutiva sem autorização;
- complexidade que existe para parecer avanço;
- autor incapaz de explicar a própria solução;
- IA apresentando hipótese como fato;
- aprendizado registrado antes da comprovação;
- criação de nova lei para repetir regra já existente;
- bloqueio de revisor aceito (ou emitido) sem checar se o "arquivo fora de escopo" é, na verdade, mudança anterior já aprovada (ver 2.13);
- hook, evento ou callback tratado como proxy de um conceito de negócio sem confirmar a frequência real de disparo no código-fonte (ver 2.13);
- efeito colateral externo novo (mensagem, API de terceiro) sem freio de emergência em runtime (ver 2.14);
- gatilho ligado a erro/retry sem debounce, virando flood externo durante instabilidade (ver 2.14).

---

# Como Institucionalizar sem Criar Burocracia Paralela

1. Usar este arquivo como a única definição da Técnica da Lupa.
2. Inserir a versão compacta nos agentes de revisão que já existem.
3. Melhorar o workflow atual em vez de criar outro.
4. Usar checks existentes sempre que puderem ser ampliados.
5. Manter um comentário atualizável por revisor.
6. Exigir review formal ligado ao `HEAD_SHA`.
7. Exigir revisão independente em R3 e R4.
8. Registrar pendência, aprendizado e estado nos documentos já existentes.
9. Não transformar cada revisão em novo documento.
10. Reavaliar a própria Lupa quando um incidente revelar lacuna real.

---

# Autocrítica da Própria Lupa

A Técnica da Lupa também deve ser submetida a si mesma.

Perguntas:

- Ela criou regra duplicada?
- Está exigindo burocracia sem reduzir risco?
- Cada exigência produz evidência útil?
- Existe ponto subjetivo sem critério?
- Um agente consegue aplicá-la consistentemente?
- Um operador leigo consegue entender o veredito?
- Ela diferencia risco baixo de risco crítico?
- Bloqueia falso verde?
- Preserva a estrutura existente?
- Registra somente o ouro?
- Pode ser usada sem acesso a secrets?
- Impede execução sem autorização?
- O resultado é rastreável?
- A versão rápida continua fiel à completa?
- A versão para agentes mantém os bloqueios essenciais?

Quando uma falha real revelar nova lacuna:

```text
incidente
→ evidência
→ causa raiz
→ correção mínima nesta mesma Lupa
→ teste da correção
→ histórico no Git
```

Não criar uma “nova Lupa” para corrigir a Lupa atual.

---

# Limite de Garantia

A Técnica da Lupa não pode prometer que nenhum sistema jamais falhará.

Ela pode exigir e comprovar:

- 100% das regras conhecidas avaliadas;
- 100% dos cenários definidos executados ou justificados;
- 100% das evidências ligadas à fonte revisada;
- 0 bloqueios críticos conhecidos no momento da decisão;
- rastreabilidade completa;
- risco residual declarado;
- autorização correspondente.

A formulação correta é:

> **Aprovado dentro do escopo, evidências, cenários e estado conhecidos no momento da revisão.**

Prometer infalibilidade absoluta seria criar falsa segurança — exatamente o tipo de aparência que a Lupa existe para detectar.

---

# Histórico de Evolução

Registro mínimo de quando a própria Lupa foi corrigida por um incidente real — não um changelog de toda mudança do sistema, só da técnica em si (ver "Autocrítica da Própria Lupa").

## 19/07/2026 — Auditoria `mission_panel` (Hermes, profile pivete)

**Origem:** aplicação formal da Lupa Premium sobre o plugin `mission_panel` (missão registrada em `REVISAO-TECNICA-DA-LUPA.md` §28, mesmo diretório). Read-only, sem restart, sem canário real.

**Incidentes reais que expuseram lacuna na técnica, não só no código revisado:**

1. Revisor de Regressão bloqueou a entrega citando 7 arquivos "modificados fora do escopo". Eram mudanças de fases anteriores da mesma missão (16:38–18:52 do dia anterior), já testadas e aprovadas — não relacionadas à mudança revisada. A Lupa não tinha uma regra explícita para esse cenário → seção **2.13** adicionada.
2. Um plugin tratou `on_session_end` como "fim de missão" só pelo nome do hook; o hook na verdade dispara a cada turno. A Lupa cobrava "casar assinatura, retorno e efeitos colaterais" (2.3) mas não cobrava explicitamente "confirmar frequência real de disparo" → regra adicional em **2.3** e nova categoria de cenário **"Plugin, hook ou integração de observabilidade"**.
3. O plugin passou a chamar uma API externa real sem freio de emergência em runtime, e um de seus gatilhos (erro de API) não tinha proteção contra disparo repetido durante instabilidade → seção **2.14** adicionada.

**Correção mínima aplicada nesta mesma Lupa** (não foi criada Lupa paralela nem V2):
- 2.3: regra sobre frequência real de disparo vs. suposição pelo nome;
- 2.13 (nova): atribuição de mudança via timestamp antes de aceitar bloqueio de "escopo";
- 2.14 (nova): freio de emergência e debounce para efeito colateral externo;
- nova categoria de Cenário Mínimo: "Plugin, hook ou integração de observabilidade";
- 4 novos Anti-Padrões;
- responsabilidade do Juiz/Critic explicitada: verificar atribuição antes de aceitar bloqueio de escopo.

**Evidência:** `REVISAO-TECNICA-DA-LUPA.md` §28 (mesmo diretório) — achados dos 3 revisores, correções aplicadas no código do plugin, 64 testes passando, rollback provado em cópia. Nada foi copiado deste chat para cá; só a lição reutilizável, no formato que a própria seção "Autocrítica da Própria Lupa" já exige.

---

# Nota Final

A Técnica da Lupa não existe para travar progresso.  
Ela existe para proteger progresso real de progresso ilusório.

Seu objetivo não é produzir crítica bonita.  
É gerar uma decisão:

- segura;
- mínima;
- comprovável;
- reversível;
- rastreável;
- alinhada;
- preservadora;
- honesta sobre seus limites.

Em ambientes de alta velocidade, especialmente com agentes de IA, a capacidade de dizer **“não aprovado ainda”** com evidência é uma vantagem operacional.

Use com rigor.  
Use com honestidade.  
Use para melhorar o que já existe.  
Use principalmente quando a entrega estiver bonita demais para ser aceita sem prova.

---

**Técnica da Lupa — Versão Premium**  
**Método único de revisão crítica para sistemas que precisam sobreviver ao contato com a realidade.**
