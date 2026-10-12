# 🚪🔌💎🧠 PORTA → HUB → RUBY → CÉREBRO

Status: PROPOSTA ARQUITETURAL EM PR  
Autoridade: SEGREDO/CHEFE  
Fonte da verdade operacional: GitHub `ServerVpss/CentralDark` + estado real medido  
Princípio: `REUSE_BEFORE_CREATE` / `ONE_SYSTEM_ONLY` / `NO_V1_V2_V3`

## Intenção

Comprimir a arquitetura visível da CentralDark sem remover capacidades existentes. O CHEFE precisa enxergar uma estrada única e saber, em poucas palavras, para que serve cada bloco.

```text
👤 CHEFE
   ↓
🚪 PORTA
   ↓
🔌 HUB
   ↓
💎 RUBY
   ↓
🧠 CÉREBRO
   ↓
🦾 EXECUÇÃO
   ↓
✅ PROVA
   ↺ aprendizado reutilizável
```

A compressão é de interface e roteamento. MCP, Gateway, memória vetorial, Knowledge Compiler, Harvester, MetaLupa, Multibússola, FLASH, SOL e Hermes continuam existindo como capacidades internas; não viram sistemas paralelos.

## 🚪 PORTA — entrar corretamente

Serve para: identidade, regras, escopo, autoridade e boot.

Owner existente: `LEIA-ME-IA.md` + owners canônicos carregados por ele.

```text
QUALQUER IA/AGENTE/PLUGIN
→ PORTA
→ aprende quem manda, o que pode fazer e como recuperar estado
```

A Porta não é conector e não armazena contas.

## 🔌 HUB — conectar tudo

Serve para: ser a caixa única de contas, serviços, APIs, assinaturas e fontes acessíveis à Casa.

Owner físico existente: `apps/modulos/hub/`.

Exemplos já representados no Hub: OpenAI, Claude, Gemini, Grok/xAI, DeepSeek, Mistral, Perplexity, Cohere, Groq, OpenRouter, Together, Fireworks, Kimi, Qwen, Hugging Face, Replicate, Stability, fal.ai, ElevenLabs, Notion, GitHub, Google Drive, Gmail, Supabase, Cloudflare, Contabo, Telegram, Lovable e EFI Pay.

Regra de expansão:

```text
SERVIÇO NOVO + CONECTOR POSSÍVEL
→ REUSAR HUB
→ registrar conta/conexão
→ expor função curta ao CHEFE
→ não criar rota lateral
```

Cada item precisa informar ao CHEFE, no mínimo:

```text
ÍCONE + NOME
STATUS: CONECTADO | NÃO CONECTADO | ERRO
SERVE PARA: <frase curta>
CONTAS: <quantidade/labels quando aplicável>
ACESSO: <resumo humano das capacidades>
```

Capacidade técnica não equivale a autorização operacional.

## 💎 RUBY — direcionar

Serve para: decidir para onde vai o que entrou pelo Hub.

`RUBY` é o nome da camada lógica de roteamento definida pelo CHEFE. Não exige criar um segundo Gateway/MCP/roteador se capacidades existentes cobrirem a função.

```text
CONTA      → ferramenta/serviço correspondente
ARQUIVO    → biblioteca/memória/estudo
CONVERSA   → contexto/memória/mineração quando aplicável
CONSULTA   → fonte adequada
TAREFA     → capacidade/executor adequado
RESULTADO  → prova + memória/cristalização quando houver delta reutilizável
```

Implementação deve preferir composição dos owners existentes de Gateway/MCP/roteamento.

## 🧠 CÉREBRO — compreender, lembrar e aprender

Serve para: disponibilizar conhecimento e transformar matéria em aprendizado reutilizável sem importar dogma.

Subfunções existentes ficam ocultas atrás desta caixa visual:

```text
📚 BIBLIOTECA
   corpus de estudo: livros, PDFs, áudio, pessoas, humanidade, ciência, história

🧠 MEMÓRIA
   contexto, lembranças e decisões recuperáveis

🔎 BUSCA SEMÂNTICA / VECTOR MEMORY
   encontra conteúdo por significado

📥 INBOX
   material novo ainda não classificado

⛏️ HARVESTER / KNOWLEDGE COMPILER / FORJA
   extrai, deduplica, cruza, contraprova e destila

👁️ METALUPA / MULTIBÚSSOLA
   falsificação, causalidade, dependências e visão global

💎 CRISTAL
   aprendizado provado e reutilizável

⚡ FLASH
   usa cristal pronto sem pagar a mineração inteira novamente
```

### 📚 Biblioteca física + grafo semântico

Owner material da biblioteca: `docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md`.

```text
PDF | EPUB | JWPUB
→ source_id + hash + proveniência
→ referência indexada
→ tags/facetas
→ wikilinks/backlinks
→ MOC
→ cognição | skill-candidate | conversa
→ Knowledge Compiler / FORJA
→ cristal quando provado
```

O roteador determinístico vive em `scripts/memory-linker/library-router.mjs` e reutiliza a área já existente de memória/linkagem, em vez de criar um segundo cérebro.

A mesma entrada pode alimentar cognição, uma skill candidata e referência de conversa sem ser copiada para três depósitos. Tags dizem **em que gaveta semântica entra**; links dizem **com que nota/capacidade concreta conversa**; MOCs organizam o bairro.

Referência contextual só aparece com relevância suficiente. Sem texto-fonte ingerido, a Casa pode citar a referência (`📖 Livro 1:2`), mas não inventa a citação textual.

Leis:

```text
BIBLIOTECA != CANÔNICO
FONTE != AUTORIDADE
FONTE_PRIMÁRIA != VERDADE_AUTOMÁTICA
MUITO_MINÉRIO_ENTRA → POUCO_OURO_SAI
RAW_CORPUS_LOAD_ON_DEMAND=true
LIBRARY_REFERENCE != TECHNICAL_PROOF
NO_SOURCE_TEXT → DO_NOT_INVENT_QUOTE
PRIVATE_CHAIN_OF_THOUGHT_NOT_PERSISTED=true
DELIBERATION_SUMMARY_ALLOWED=true
```

## 🦾 EXECUÇÃO — agir no alvo certo

Serve para: transformar decisão em ação observável.

```text
☀️ SOL    → coordena/reconcilia
🦾 HERMES → executa/preserva/continua
🌍 RUNTIME → onde o efeito realmente acontece
✅ PROVA   → mede o mesmo alvo do claim
```

Casa, VPS e público são runtimes diferentes. Uma missão local não deve exigir VPS sem claim de VPS. Publicação/deploy continua exigindo intenção explícita por ciclo/target.

## Estrada única

```text
🚪 ENTRAR
→ 🔌 CONECTAR
→ 💎 DIRECIONAR
→ 🧠 COMPREENDER
→ 🦾 AGIR
→ ✅ PROVAR
→ 🔁 APRENDER
```

Nenhuma conexão nova deve criar estrada paralela por conveniência.

```text
NEW_CONNECTION != NEW_ARCHITECTURE
NEW_SOURCE != NEW_BRAIN
NEW_MODEL != NEW_IDENTITY
NEW_INFORMATION != REBUILD_ALL
```

## Critério de implementação

Ao evoluir esta arquitetura:

1. medir owner e runtime existentes;
2. reutilizar Hub/MCP/Gateway/memória/mineração atuais;
3. adicionar somente o menor delta que feche o gap;
4. manter uma rota por capacidade/fronteira;
5. testar consumidores materiais;
6. contraprovar;
7. remedir T0 → T1;
8. não declarar deploy/produção sem prova no runtime correspondente.

## Continuidade por setor — Hub de Contas + preflight cruzado (2026-10-12)

**INTENÇÃO do SEGREDO/CHEFE:** não confundir falha de uma conta, conector ou caminho com falha do organismo inteiro. A CentralDark trabalha com as fontes que realmente responderam, declara exatamente o setor inacessível e mantém o fluxo. Este delta estende o **Hub único existente**, o monitor canônico e a gramática de resposta; não cria segundo monitor, broker, cérebro, cron, writer ou permissão.

**Owners existentes:** `apps/modulos/hub/` (contas/capabilities), `apps/modulos/oauth-broker/server.mjs` (autorizações do Hub), `apps/bot-telegram/services/account-hub.cjs` (projeção Telegram), `.agents/skills/centraldark-operational-method/SKILL.md` (método), monitor já existente **Núcleo canônico CentralDark** (somente leitura, horário). Credenciais da conta Gmail conectada ao ChatGPT **não** provam automaticamente autorização no broker da VPS; cada rota exige leitura real e proveniência.

### Política operacional: `FALHA_LOCAL_NAO_E_COLAPSO_GLOBAL=true`

```text
INTENCAO_VIGENTE
→ HUB/CONTAS: quais identidades, providers e rotas JÁ EXISTEM?
→ TENTAR FONTES PERTINENTES (em paralelo quando possível):
     GMAIL (separar cada conta) | GITHUB MAIN/PRS/COMMITS | VPS/RUNTIME | DOCS/OWNERS
→ PARA CADA SETOR: ACESSO_OK | SEM_ACESSO | FALHA_LEITURA | INCONCLUSIVO | NAO_PERTINENTE
→ CROSS-CHECK COM FONTE DISPONÍVEL + TIMESTAMP + SHA QUANDO APLICÁVEL
→ CONTINUAR NAS FRENTES QUE RESPONDERAM
→ RESPOSTA: O QUE FUNCIONOU + O QUE NÃO TEM ACESSO + EFEITO / PRÓXIMO CURSOR
→ DELTA MATERIAL AUTORIZADO: CHECAR SOMENTE PROVAS NECESSÁRIAS ÀQUELE ESCOPO
→ REGISTRAR RECIBO E CONTRAPROVA; NÃO PROMOVER UNKNOWN A PASS
```

**Exemplo correto:** `Gmail CONTACOBRA = SEM_ACESSO; Gmail SONASMARCAS = ACESSO_OK; GitHub PR #... = PASS_LEITURA (não significa checks PASS); VPS = ACESSO_OK; DOCS = ACESSO_OK; CRUZAMENTO = PARCIAL`. A falta do primeiro Gmail não impede ler o segundo, o GitHub, a VPS e os docs. Se **GitHub** não responder, não afirmar SHA ou checks atuais a partir de um alerta antigo de e-mail; continuar com VPS/docs e informar `GitHub = SEM_ACESSO`. Se **VPS** não responder, não afirmar runtime atual a partir do código da main; continuar com GitHub/Gmail/docs. Uma indisponibilidade bloqueia **somente** a afirmação ou ação dependente da fonte ausente, nunca a atividade independente.

**Falha técnica versus falta de autorização:** sessão expirou, token ausente, conexão recusada, falha de leitura e acesso não concedido precisam de motivos separados quando conhecidos; não inferir autenticação sem prova do provedor. Não contornar proteção de acesso, não revelar segredos, não marcar `OFFLINE` todos os serviços porque um único conector falhou.

**Critério de FIXED POINT local:** estado de cada setor discriminado, fontes disponíveis efetivamente consultadas, correlação de alertas Gmail com PR/commit atual quando possível, claims restritos à evidência, nenhuma duplicação de owners e `NEXT_CURSOR` explícito para o setor indisponível. Monitor periódico é somente leitura e não autoriza merge/deploy/mutação. Registro documental e monitor configurado **não provam** execução do método em todos os agentes; isso requer readback do runtime pertinente.

## Interface humana

O CHEFE vê função e direção; detalhe interno só sobe quando muda decisão.

```text
🟢 CONECTADO — Google Drive
Serve para: arquivos e biblioteca
Contas: 2
Acesso: leitura/escrita autorizada

🟡 NÃO CONECTADO — Notion
Serve para: notas e conhecimento

🔴 ERRO — GitHub
Serve para: fonte da verdade
Problema: autenticação
```

`MENOS_E_MAIS=true`: uma Porta, um Hub, um Ruby lógico, um Cérebro composto, uma saída de execução/prova.