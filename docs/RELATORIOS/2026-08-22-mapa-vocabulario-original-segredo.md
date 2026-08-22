# Mapa de vocabulário original — SEGREDO/CHEFE

> Status: AUDITORIA / NÃO É SEGUNDA FONTE DE VERDADE
> Data: 2026-08-22
> Autoridade da intenção e dos nomes quando comprovada: SEGREDO/CHEFE
> Writer desta rodada: SOL
> Regra: **sem correspondência 100% comprovada, não renomear**.

## 0. Motivo

O SEGREDO/CHEFE identificou um drift recorrente: ideias e modelos mentais dados por ele foram, em alguns pontos, reexpressos com nomes técnicos/genéricos que preservavam parte da função, mas quebravam a assimilação e a lógica visual da Casa.

A correção desta rodada não troca o motor técnico. Ela separa:

```text
NOME / MODELO MENTAL VISÍVEL DO CHEFE
→ preserva origem, intenção e assimilação

IDENTIFICADOR / MECANISMO INTERNO
→ pode permanecer técnico quando isso evita regressão
```

Regra operacional:

```text
CORRESPONDENCIA_100_POR_CENTO
→ PODE_RESTAURAR_NOME_VISIVEL

CORRESPONDENCIA_INCOMPLETA|AMBIGUA|SO_PARECIDA
→ MAPEAR
→ NAO_RENOMEAR
→ PEDIR/COLETAR_PROVA
```

## 1. Fonte original forte — Plano Mestre de 2026-07-26

Owner histórico consultado:

`docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`

O plano registra explicitamente que o objetivo não era transformar o CHEFE em operador de terminal, mas construir uma **fábrica visual autônoma de sites, módulos e negócios**.

Fluxo humano original:

```text
FALAR O QUE QUER
→ VER A CONSTRUÇÃO AO VIVO
→ AJUSTAR VISUALMENTE
→ APROVAR
→ PUBLICAR
→ VOLTAR SE PRECISAR
```

Papéis e territórios nomeados no plano:

```text
SEGREDO/CHEFE / PIVETE histórico = autoridade humana
SOL / JARVIS                  = braço direito / orquestração
HERMES-CASA                   = corpo residencial/interativo
WORKER/HERMES-VPS             = braço remoto permanente
BOLT / BUILDER                = fábrica visual
METALUPA                      = validação crítica / falso verde
GITHUB                        = histórico, comparação e recuperação
HUB                           = porta de administração/Builder/negócios
CASA                          = identidade, memória, voz, telas e contexto
VPS                           = fábrica/serviços permanentes no desenho histórico
```

### Botões originais — correspondência explícita

O plano lista literalmente:

```text
CRIAR
MELHORAR
VER AO VIVO
CORRIGIR
COMPARAR
PUBLICAR
VOLTAR
MOSTRAR PROVA
```

Esses oito nomes são o padrão visual prioritário quando existir uma ação atual de mesma semântica.

## 2. Correspondências atuais com 100% de confiança

### 2.1 `Deploy` → `PUBLICAR`

Estado observado em `apps/modulos/Bolt/source/app/components/deploy/DeployButton.tsx`:

```text
UI_ATUAL_ANTES=Deploy
PLANO_ORIGINAL=PUBLICAR
SEMANTICA=publicar o resultado em destino externo
CORRESPONDENCIA=100%
```

A camada visível foi restaurada nesta branch para `PUBLICAR` / `PUBLICAR NO <DESTINO>`. Os identificadores internos `DeployButton`, `handle*Deploy`, diretório `deploy/` e contratos técnicos foram preservados para não criar regressão por renomeação cosmética de implementação.

O fluxo visual de `apps/modulos/Bolt/source/app/components/deploy/DeployAlert.tsx` também mostrava `Deploy` na etapa cujo estado interno já é `deployStatus`. Essa etapa foi restaurada visualmente para `PUBLICAR`; o identificador interno permanece técnico.

### 2.2 `Diff` → `COMPARAR`

Estado observado em `apps/modulos/Bolt/source/app/components/workbench/Workbench.client.tsx`:

```text
value='diff'
text='Diff'
```

O plano original usa `COMPARAR` para a ação visual de comparação. A correspondência de superfície é 100%.

Decisão:

```text
UI_LABEL=COMPARAR
INTERNAL_VALUE='diff' PODE_PERMANECER
```

Ainda não alterado nesta costura: `Workbench.client.tsx` é um arquivo amplo e a API de atualização disponível substitui o arquivo inteiro. Como a mudança desejada é de duas labels, a restauração fica pendente até uma costura mínima que não aumente risco de regressão.

### 2.3 `Preview` → `VER AO VIVO`

Estado observado no mesmo Workbench:

```text
value='preview'
text='Preview'
```

O plano descreve repetidamente `VER A CONSTRUÇÃO AO VIVO`, `preview ao vivo` e lista o botão `VER AO VIVO`.

Correspondência de superfície: 100%.

Decisão:

```text
UI_LABEL=VER AO VIVO
INTERNAL_VALUE='preview' PODE_PERMANECER
COMPONENTE Preview.tsx PODE_PERMANECER TECNICO
```

Ainda não alterado pela mesma razão de mudança mínima descrita acima.

### 2.4 `Ask Bolt` em alertas de erro → `CORRIGIR`

Foram observados dois consumidores reais:

- `apps/modulos/Bolt/source/app/components/chat/ChatAlert.tsx`;
- `apps/modulos/Bolt/source/app/components/deploy/DeployAlert.tsx`.

Nos dois casos o botão visível `Ask Bolt` dispara uma mensagem cujo comando interno é literalmente `Fix this ... error`.

```text
UI_ATUAL_ANTES=Ask Bolt
COMANDO_REAL=Fix this <erro>
PLANO_ORIGINAL=CORRIGIR
CORRESPONDENCIA=100%
```

A camada visível foi restaurada para `CORRIGIR` nos dois consumidores, preservando a implementação interna e o conteúdo técnico enviado ao agente.

## 3. Cápsula — nome original comprovado, não substituir por genérico

Relíquia consultada: `SOL-SESSION-CAPSULE-20260729.zip`.

Evidência interna:

- `BOOTSTRAP.md`: “Você recebeu uma **cápsula de continuidade** da SOL/Jarvis do Pivete.”
- `03-raciocinio/ARQUITETURA-COGNITIVA.md`: `cápsula de estado = último fato, pendência e próximo gate`.
- `VALIDATION.md`: “Validação da cápsula”.

O repositório atual também preserva a materialização `Cápsula Observável`, mergeada no PR #667, com o nome operacional `Instinto Superior` explicitamente atribuído ao SEGREDO/CHEFE no próprio registro do PR.

Conclusão:

```text
CAPSULA=MODELO_MENTAL_ORIGINAL_CONFIRMADO
CAPSULA_OBSERVAVEL=IMPLEMENTACAO_ATUAL_CONFIRMADA
INSTINTO_SUPERIOR=NOME_OPERACIONAL_ATRIBUIDO_AO_CHEFE_CONFIRMADO
```

Não renomear isso para `training pipeline`, `learning session`, `evaluation engine` ou equivalentes na superfície do CHEFE. Esses termos podem existir somente como descrição técnica interna quando necessários.

## 4. Nomes originais já preservados — NÃO mexer

### Mega Painel

O desejo histórico registra `FASE C — Painel Jarvis` e o código atual mantém `CentralDark · Mega Painel` / `Mega Painel do Projeto`.

Status: **preservado**.

### Grafo Vivo

O Mega Pacotão histórico registra `FASE E — Grafo Vivo`; o ecossistema atual contém `obsidian-plugin-grafo-vivo` e painel `Grafo Vivo`.

Status: **preservado**.

### Casa / SOL / HERMES / Builder / HUB

Os nomes continuam presentes no plano, SOUL, arquitetura atual e relíquias.

Status: **preservar como camada humana principal**.

## 5. Nomes técnicos que NÃO podem ser renomeados só por semelhança

Foram observados no inventário atual:

```text
Continuity Guard
Memory Linker
Dream Review
Pattern Discovery
SOURCE_DELTA
Operational Score / Partitura Operacional
Evidence Envelope
Workbench
Preview.tsx
DiffView.tsx
DeployButton.tsx
```

Alguns parecem corresponder a ideias antigas, mas **parecer não é prova**.

Exemplos proibidos sem evidência adicional:

```text
Memory Linker ≠ automaticamente Memória Viva
Dream Review ≠ automaticamente Cápsula
Pattern Discovery ≠ automaticamente Consolidador de Ouro
Continuity Guard ≠ automaticamente Porta da Cápsula
```

Eles só serão renomeados externamente quando uma fonte original ou contrato atual provar a equivalência sem perda de função.

## 6. Nomes do organismo Hermes encontrados em relíquia

`HERMES_ORGANISMO_CANONICO_01-36_COMPLETO.zip` contém um manifesto com nomes como:

```text
Blueprint Geral
Metabolismo Cognitivo Inicial
Memória Viva
Grafo Vivo
Sistema Nervoso
Colônia Cognitiva
DNA Evolutivo
Kernel Cognitivo
Memória Distribuída
Sistema Imunológico Cognitivo
Metabolismo Cognitivo Contínuo
Planejador Executivo + Gramática Canônica
Motor de Objetivos
Decomposição e Priorização
Delegação e Writer Único
Paralelismo Seguro
Convergência Executiva
Consolidador de Ouro
Autoavaliação
Experiência e Aprendizagem
Consolidação Evolutiva
Adaptação e Mutação Segura
Benchmark Permanente
Superação Mensurável do Baseline
Timeline Cognitiva
Replay Determinístico
Auditoria Ponta a Ponta
Explicabilidade Operacional
Causalidade e Prova
Topologia Casa/VPS/Nós
Sincronização Distribuída
Tolerância a Falhas e Recuperação
Coordenação Distribuída
Integração Sistêmica
Validação Sistêmica e Deploy Gate
Pacote Mestre Canônico
```

Esses nomes são evidência histórica de nomenclatura do organismo, mas o manifesto isolado não prova autoria humana individual de cada rótulo nem equivalência 1:1 com módulos atuais. Portanto entram como **REFERÊNCIA PARA CRUZAMENTO**, não como autorização automática de renomeação.

A arquitetura dessa relíquia conecta explicitamente:

```text
Humano
→ Inbox Universal
→ Normalização determinística
→ Event Bus
→ Planner Executivo
→ Scheduler
→ Delegação por capacidade
→ Executores / Ferramentas / Modelos
→ Provas / Eventos / Artefatos
→ Auditoria + MetaLupa
→ Consolidador de Ouro
→ Memória Viva | Grafo/Índices | DNA/Skills/Gates
```

Isso é útil para descobrir parentesco semântico com módulos atuais, mas ainda não basta para renomeação 1:1 de `Memory Linker`, `Dream Review`, `Pattern Discovery` ou outros componentes recentes.

## 7. Política de linguagem já existente confirma a correção

Dois owners atuais já apontam na mesma direção:

- `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md`: ao falar com SEGREDO/CHEFE, usar primeiro nomes traduzidos; jargão só quando necessário.
- `docs/GLOSSARIO_TECNICO_LEIGO.md`: “a máquina segura a complexidade; o CHEFE recebe o significado”.

A cápsula histórica aprovada para handoff em 2026-07-29 é ainda mais explícita:

```text
Nomes criados por IA não são automaticamente nomes aprovados pelo Pivete.
```

E no Builder ela registra:

```text
PIVETE FALA
→ EU CRIO O CONTRATO
→ AGENTES EDITAM
→ PREVIEW MOSTRA
→ EU OBSERVO
→ AGENTES CORRIGEM
→ PIVETE APROVA
→ PUBLICAR
→ REGISTRAR
→ VOLTAR DISPONÍVEL
```

Portanto, preservar o vocabulário arquitetural humano na superfície não é uma regra nova inventada nesta rodada; é uma restauração de uma intenção já registrada historicamente.

## 8. Candidatos atuais inspecionados e rejeitados para renomeação automática

### `Start new chat` ≠ `CRIAR` ainda

O sidebar atual possui `Start new chat`, mas isso cria/inicia uma conversa; o botão original `CRIAR` pertence ao fluxo da fábrica visual e pode significar criar projeto/produto. Sem provar identidade de ação, não renomear.

### `Enhance prompt` ≠ `MELHORAR` ainda

O ChatBox atual possui `Enhance prompt`, mas melhora o **prompt**, enquanto o `MELHORAR` original pertence ao produto/projeto no fluxo do Builder. Sem equivalência de alvo, não renomear.

### `Report Bug` ≠ `CORRIGIR`

`Report Bug` abre um relatório externo; não executa correção. O `CORRIGIR` foi restaurado somente onde o consumidor realmente dispara `Fix this ... error`.

Essa distinção é o teste de 100%: palavras parecidas não bastam; **o efeito real precisa ser o mesmo**.

## 9. Regra para as próximas costuras

```text
1. RECUPERAR NOME ORIGINAL
2. PROVAR FUNCAO ATUAL
3. COMPARAR SEMANTICA
4. SE 100%:
   - restaurar nome VISIVEL do CHEFE
   - preservar identificador interno se a troca trouxer risco
5. SE <100%:
   - não mexer
   - registrar candidato
6. testar regressão
7. mostrar delta
```

Princípio:

```text
ESSENCIA_DO_CHEFE_NA_SUPERFICIE
+
RIGOR_TECNICO_POR_BAIXO
=
MESMA_CASA, SEM PERDER ASSIMILACAO
```

## 10. Estado desta rodada

```text
MAIN_MUTADA=NAO
BRANCH=fix/vocabulario-original-chefe-20260822
DEPLOY=NAO
RESTART=NAO
VPS=INTOCADA
FORCE_PUSH=NAO

PUBLICAR_UI=RESTAURADO_NA_BRANCH
CORRIGIR_UI=RESTAURADO_NA_BRANCH_EM_CONSUMIDORES_COM_FIX_REAL
COMPARAR_UI=100_PCT_CONFIRMADO_PENDENTE_COSTURA_MINIMA
VER_AO_VIVO_UI=100_PCT_CONFIRMADO_PENDENTE_COSTURA_MINIMA
CRIAR=MATCH_ATUAL_NAO_PROVADO
MELHORAR=MATCH_ATUAL_NAO_PROVADO
VOLTAR=MATCH_ATUAL_AINDA_NAO_RESOLVIDO
MOSTRAR_PROVA=MATCH_ATUAL_AINDA_NAO_RESOLVIDO
```
