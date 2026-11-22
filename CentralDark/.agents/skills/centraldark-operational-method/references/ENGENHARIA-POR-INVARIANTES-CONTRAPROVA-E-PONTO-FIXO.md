# Engenharia operacional por invariantes, hipóteses, contraprova e ponto fixo

<!-- CENTRALDARK_INVARIANT_MATH_OPS_20261122 -->
**Owner único:** `.agents/skills/centraldark-operational-method/SKILL.md` (Skill Mãe).
**Natureza:** receita/referência reutilizável da Skill Mãe, não skill, agente, gate, scheduler, router, cérebro ou sistema de memória novo.
**Origem:** execução CentralDark/Cloudflare de 22/11/2026, intenção do SEGREDO/CHEFE, SOL coordenando, Hermes executando, realidade julgando.
**Estado da receita:** aprendizado documental derivado de caso real. Consumo automático por outros runtimes exige teste próprio; método não substitui RULES, META-LUPA, Michelin, Kaizen, Gramática SOL, Kimetsu ou os owners existentes.

## 1. Nome e significado preciso

**Engenharia Orientada a Invariantes com Verificação Formal Parcial, Eliminação de Hipóteses, Contraprova e Reconciliação Incremental.**

É um método operacional de raciocínio e execução testável, **não** uma demonstração matemática formal completa do sistema, nem certificação automática do agente. A disciplina vem de converter intenção em condições observáveis, diferenciar prova de suposição e só promover conclusões no escopo exato da evidência.

Princípios históricos usados como analogias úteis, sem atribuir falsamente métodos modernos aos autores antigos:
- **Axiomas e demonstração (tradição euclidiana):** escrever as condições que nenhuma transição pode violar. Aqui, as condições são contratos de engenharia e **devem ser testadas**; não são verdades matemáticas universais.
- **Lógica de proposições e não contradição (tradição aristotélica):** explicitar afirmação, premissa e inferência. A lógica de **três valores** usada para `VERDADEIRO/FALSO/DESCONHECIDO` é formalização moderna, não um terceiro valor inventado por Aristóteles.
- **Eliminação de incógnitas (tradição algébrica, inclusive métodos chineses antigos):** reduzir hipóteses usando medições discriminantes. Não confundir a analogia com solução de equações lineares.
- **Indução matemática (estrutura base + passo):** verificar estado inicial e preservação de invariantes em cada transição. Evidência pontual de algumas transições **não equivale** a prova formal de todos os estados possíveis.
- **Teoria dos grafos:** mapear nós, dependências, rotas, donos, riscos, origens e fronteiras de teste.
- **Contraprova/falsificação:** procurar deliberadamente um caso que desminta o sucesso antes de promovê-lo.

## 2. Axiomas operacionais e semântica

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
UNKNOWN != PASS
ACTION != PROOF
EXISTS != RUNNING
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
HTTP_200 != SITE_CORRETO
HTTPS_VALIDO != ROTA_CORRETA
PREVIEW != PRODUCAO
LAST_GOOD_STATE_MUST_BE_PRESERVED=true
RUNTIME_CONSUMPTION_REQUIRES_PROOF=true
```

Para cada missão, definir invariantes **aplicáveis** ao alvo (exemplo A1 a A5):
- **A1 Identidade/autorização:** conta, projeto, host e escopo corretos; credencial legítima e mínimo privilégio.
- **A2 Integridade:** entrada permitida, artefatos íntegros, ausência de segredos; hashes e manifesto vinculados ao conteúdo certo.
- **A3 Preservação:** serviços, rotas e recursos fora do delta não regressam.
- **A4 Verificabilidade:** efeito medido por saída real e observação suficientemente independente.
- **A5 Reversibilidade/linhagem:** último estado bom, diff, origem, possibilidade efetiva de reversão e responsável.

```text
APROVADO(escopo,tempo) = A1 ∧ A2 ∧ A3 ∧ A4 ∧ A5
```

A conjunção é lógica: **não é soma nem média ponderada**, e só se aplica aos critérios obrigatórios definidos **para aquele escopo**. Um critério material desconhecido deixa o veredito PENDENTE; um critério obrigatório demonstradamente reprovado produz FALHOU para o claim; progresso paralelo comprovado continua preservado.

Tabela operacional trivalente:
- `VERDADEIRO ∧ VERDADEIRO = VERDADEIRO`
- `VERDADEIRO ∧ DESCONHECIDO = DESCONHECIDO`
- `FALSO ∧ X = FALSO` para qualquer X.
- `DESCONHECIDO` não deve ser convertido em `FALSO` sem teste nem em `VERDADEIRO` por narrativa.

`APROVADO = A1 ∧ ... ∧ An` é uma **especificação de aceite**. `AÇÃO + PROVA` não é igualdade matemática: é uma disciplina de correspondência entre afirmação, alvo, estado e evidência.

## 3. Modelo de estados, fronteiras e fingerprints

Representar uma missão por:
```text
S = (INTENCAO, ESCOPO, CONTA/HOST, REF/HEAD, OWNER, WRITER,
     LAST_GOOD, RECURSOS, HIPOTESES, EVIDENCIAS, PENDENCIAS)
T(S, delta) -> S'
```

Cada transição material exige:
```text
PRECONDICOES_COMPROVADAS
+ DELTA_MINIMO_AUTORIZADO
+ POSTCONDICOES_MEDIDAS
+ CONTRAPROVA_DE_REGRESSAO
= TRANSICAO_ELEGIVEL_A_PASS
```

A elegibilidade só vale no alvo, tempo e versão observados. Evidência é uma tupla:
`(claim, repo/ref/commit ou host/processo, rota, instante, instrumento, saída bruta, hash quando aplicável)`.
Registrar um **fingerprint** que delimite entradas relevantes (HEAD, arquivo, rotas, versão implantada, config); manter evidências válidas enquanto o fingerprint correspondente não mudar. Se mudar, **remeça só o cone afetado**. Não voltar à Fase 0 por reflexo.

## 4. Funil de hipóteses — eliminação disciplinada

Para cada falha:
1. Descrever **resultado esperado x resultado observado** e seu escopo.
2. Listar hipóteses H1..Hn que tenham resultados testáveis; separar causa comprovada de explicação apenas possível.
3. Escolher o teste mais barato que **discrimine** hipóteses concorrentes e evite mutação.
4. Executar uma vez, salvar comando, contexto, código de saída, cabeçalhos/corpo/log e timestamp.
5. Atualizar `VERDADEIRO/FALSO/DESCONHECIDO` **para a hipótese medida**, não para todo o sistema.
6. Quando um teste não acrescenta informação com o mesmo fingerprint, **não repetir**. Abrir outra rota/instrumento legitimamente disponível.
7. Se uma hipótese for eliminada, manter o rastro e avançar para o próximo bloqueio real.

O método opcional de escolha por valor da informação pertence à META-LUPA:
`VOI = perda_antes - perda_depois - custo_do_teste`.
Sem baseline ou custos medidos, **não inventar VOI, probabilidade, prior, LR, posterior ou ganhos numéricos**; fazer priorização qualitativa e registrar a incerteza. Evidências correlacionadas de uma mesma execução não contam como testes independentes.

## 5. Grafo de dependências e fronteiras

Montar `G=(V,E)`, com V representando serviço/processo/conta/Worker/rota/artefato e E representando invocação, depende-de, encaminhamento ou autorização. Registrar direção, host, rede e owner de cada aresta.

Exemplo de publicação:
```text
Navegador --HTTPS--> Cloudflare Worker --asset--> HTML/CSS/JS
Navegador --HTTPS--> gateway.centralldark.com --tunnel--> Hermes
Navegador --HTTPS--> mcp.centralldark.com --auth--> MCP
```

Não inferir que `127.0.0.1:18080` na Casa e na Hostinger representa a mesma origem: localhost é relativo ao **conector/processo**. `MCP`, `Gateway`, `Caddy`, Worker e TLS têm caminhos distintos; `túnel HEALTHY` não prova todos os serviços.

Aplicar menor delta só à aresta causal afetada. Desenho não vira observabilidade; conferir o comportamento real.

## 6. Ciclo operacional único, sem ritual infinito

```text
INTENCAO / DELTA
→ BOOT e OWNER PERTINENTES (reutilizar leituras válidas)
→ ESTADO CURRENT, LAST_GOOD e FINGERPRINT
→ META-GRILL / META-LUPA QUANDO PRODUZEM INFORMAÇÃO
→ AXIOMAS E CRITERIOS DE ACEITE
→ HIPOTESES + GRAFO + TESTE DISCRIMINANTE
→ RECEITA/OWNER EXISTENTES + MENOR DELTA AUTORIZADO
→ TESTE POSITIVO + CONTRAPROVA NEGATIVA + REGRESSAO
→ RECONCILIACAO INCREMENTAL
→ RECIBO ESCOPADO
→ FIXED_POINT QUANDO APROVADO
→ !DELTAÚTIL / !AURÉOLA CANÔNICA (owner + readback real)
→ PROXIMO PASSO HUMANO
```

A profundidade é **adaptativa**. Pergunta simples não exige oito cerimônias; tarefa crítica exige prova proporcional ao risco. Gatilhos como `!CENTRALDARK !METALUPA` solicitam o método existente, **não** autorizam nova skill, gate, ciclo paralelo ou repetição sem ganho de informação.

**Trava antiloop:** ao detectar repetição ou contexto misturado, parar somente o bloco falho, recuperar o último PASS, reconfirmar intenção/owner/hipótese ainda aberta e continuar do menor cursor válido. Troca de modelo não apaga histórico; resumir contexto não equivale a consumi-lo.

## 7. Teste, contraprova, indução e decisão

**Base da indução operacional:** inventário inicial válido `I(S0)`, acompanhado de prova.
**Passo operacional:** para cada transição autorizada, medir `I(Sn)` e confirmar as pós-condições antes de promover `I(Sn+1)`.
**Limite:** isso não garante todos os estados futuros, interrupções nem interleavings não testados.

Três perspectivas de teste no caso de site:
- **Rede:** TLS verificável sem `-k`, HTTP status, Content-Type, corpo que identifique produto certo, assets respondendo, sem desafio inesperado nem login do serviço errado.
- **Navegador:** página renderizada, recursos carregados, console crítico, navegação; print visual **não substitui** medição de TLS/asset da mesma URL.
- **Regressão:** DNS, Gateway, MCP, túnel, Worker reservado, hosts e credenciais fora do escopo intactos.

Contraprova pergunta: “qual observação invalidaria esta conclusão?” Exemplos: HTTPS válido abrindo Hermes em vez do site; 200 com challenge; Worker cadastrado sem rota ativa; script publicado sem assets; token autenticado sem permissão do endpoint necessário; commit sem deploy; hash do arquivo fonte comparado com versão errada.

**Decisão:** `APROVADO` somente para todos critérios do escopo; `PENDENTE` se falta medição; `FALHOU` se há contradição medida. Mesmo com A1..A5 verdadeiros para prévia, domínio principal e runtime são missões independentes. `FIXED_POINT` cobre somente alvo/versão/escopo, não “zero pendências do universo”.

**Reversão:** preservar último estado bom e preferir rollback/retorno à versão anterior do Worker. **Excluir o Worker não é reversão trivial** quando o mesmo recurso abriga histórico/rotas; avaliar antes.

## 8. Caso demonstrativo — publicação estática Cloudflare, 22/11/2026

**Intenção:** publicar uma prévia do site CentralDark sem túnel para o site, na conta oficial, preservando Gateway Hermes, MCP, DNS e Hostinger.

**Eventos e conclusões escopadas:**
1. Caddy na Hostinger servia HTML localmente em `:18080`, mas `centralldark.com` abria Hermes. `HTTP_LOCAL_200` e `TLS_VALIDO` não provavam o **site correto** no apex.
2. Primeira prévia `centraldark-site-preview.zigzag-authority.workers.dev` foi criada em conta temporária; navegador mostrou conteúdo, mas conta temporária **não** era identidade canônica. A correção foi reutilizar a conta oficial.
3. Token limitado a DNS não autorizou publicação por Wrangler. Global API Key legada permitiu algumas chamadas REST `workers/scripts`, mas não substituiu automaticamente o fluxo moderno `workers/services` + Static Assets. Não colocar segredo global nos recibos. Para operações futuras, preferir credenciais restritas e oficiais.
4. Worker oficial `centraldark-site-preview` e subdomínio `centraldark.workers.dev` foram registrados. `enabled=true` sozinho não provava conteúdo nem HTTPS. O erro `1042` pode ter **mais de uma causa**; ausência de binding Static Assets é uma lacuna real, **não prova causal suficiente de 1042**.
5. O executor usou REST antigo para publicar **assets incorporados ao código Worker**; isso é diferente de `Workers Static Assets` nativo. A página renderizou no navegador e o Hermes relatou `HTTP 200` com HTML/CSS/JS e SHA-256 dos três principais recursos. A identidade dos hashes deve ser vinculada ao mesmo artefato observado, sem generalizar para toda aplicação.
6. Contraprova independente fornecida no PowerShell, em `2026-11-22T21:16:10Z`: `curl -fsSIL https://centraldark-site-preview.centraldark.workers.dev/` devolveu `HTTP/1.1 200 OK`, `Content-Type: text/html; charset=utf-8`, `Server: cloudflare`, com validação TLS normal do cliente. Junto ao print do navegador, sustenta **prévia HTTPS funcional** naquela observação, não certifica domínio principal, backend dinâmico, runtime futuro nem mecanismo nativo Static Assets.
7. Produção: `centralldark.com` **não** foi migrado por essa prova. A afirmação “nenhuma regressão” precisa do inventário de escopo e readback; não usar a mera presença de outro Worker como verificação global.

**Resultado do experimento:** avanço observado no escopo da prévia, com correção de hipóteses e preservação de fronteiras. **Não** reivindicar validação causal estatística “o método aumentou taxa de sucesso em X%” a partir desta execução única. Técnicas análogas devem ser testadas em outras missões antes de afirmações gerais de eficácia.

**Aprendizado discriminante:** a vitória não foi um 200 isolado. Foi a sequência de separar conta temporária/oficial, token/endpoint, script/asset, rota/conteúdo, HTTP/HTTPS e prévia/produção, sempre reduzindo somente o bloqueio do momento.

## 9. Modelo de recibo e replay

```yaml
METODO_OPERACIONAL:
  intencao: <objetivo_humano>
  scope: <alvo_exato>
  repo_ref_head: <valor_medido_ou_UNKNOWN>
  owner: <caminho_existente>
  writer: <identidade_do_escritor>
  ultimo_bom: <estado_e_prova>
  fingerprint: <entradas_relevantes>
  invariantes:
    identidade: VERDADEIRO|FALSO|DESCONHECIDO
    integridade: VERDADEIRO|FALSO|DESCONHECIDO
    preservacao: VERDADEIRO|FALSO|DESCONHECIDO
    verificabilidade: VERDADEIRO|FALSO|DESCONHECIDO
    reversibilidade: VERDADEIRO|FALSO|DESCONHECIDO
  hipotese_discriminada: <H e teste>
  delta_exato: <arquivo_ou_recurso>
  evidencia: <comando|HTTP|log|artefato|URL|instante|hash>
  contraprova: <negativos_com_resultados_reais>
  regressao: <recursos_que_foram_comparados>
  estado: APROVADO|PENDENTE|FALHOU
  fixed_point_scope: <alvo_ou_NAO_ATINGIDO>
  aprendizado: <delta_util_sem_duplicata>
  proximo_passo: <menor_acao_material>
```

**Portas de controle para próxima missão:** validar o fingerprint, recuperar último PASS, ler esta referência somente se pertinente; executar teste discriminante novo em vez de refazer toda auditoria. O registro em `main` **não** demonstra que Hermes ou qualquer outra superfície já consumiu esta nova versão.

**Referências relacionadas:** `../SKILL.md`; `fixed-point-terminal-receipt-contraprova.md`; `AUTO-MELHORIA-COM-PROVA.md`; `../../meta-lupa/references/matematica-e-calibracao.md`; `../../../docs/CONSCIENCIA/APRENDIZADOS.md`; `../../../docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md`.
<!-- /CENTRALDARK_INVARIANT_MATH_OPS_20261122 -->
