# MISSÃO — LUPA AUTO-REGISTRO · ARSENAL TOTAL PARALELIZADO

## COMANDO ÚNICO DO PIVETE

```text
Leia integralmente este arquivo e execute como contrato operacional.

RESOLVE. VÁ ATÉ O FIM.
PERMITO PIVETE SEM AÇÃO DESTRUTIVA. 🔒🚀
```

## ESCOPO CONGELADO DESTA AUTORIZAÇÃO

Esta autorização vale **somente para esta missão**:

> Implementar, provar e publicar em branch/PR o auto-registro obrigatório de cada uso da `lupa-bayesiana` na fonte da verdade `ServerVpss/CentralDark`.

Permitido nesta missão:

```text
inventário read-only de recursos
leitura integral dos manuais
uso de CLI e modelos autenticados
delegação paralela
Git fetch/search/log/show/diff
inspeção read-only da VPS
inspeção read-only de Supabase e Edge Functions
criar branch de missão
editar somente os artefatos canônicos necessários
testar, corrigir e retestar
commit, push e PR draft
acompanhar e corrigir gates
```

Proibido nesta missão:

```text
merge
deploy
restart
PM2
alterar produção
alterar DNS/firewall/Caddy
force-push
reset destrutivo
apagar histórico
ler ou imprimir valores de .env
expor tokens, chaves, cookies ou headers
executar missão diferente
```

A autorização expira quando o PR estiver pronto para revisão do Pivete.

---

# REGRA SUPREMA DE EXECUÇÃO

Usar a `lupa-bayesiana`:

```text
antes da missão
durante cada decisão
sobre cada agente delegado
sobre a consolidação
sobre o próprio orquestrador
no encerramento
```

A AutoLupa não promete infalibilidade. Ela obriga:

```text
erro
→ detectar
→ classificar
→ corrigir
→ testar
→ reabrir o candidato
→ repetir até ponto fixo evidencial
```

Bloqueio temporário não encerra a missão:

```text
provider falhou
→ fallback

consent gate
→ traduzir a autorização nominal existente

non-fast-forward
→ fetch + inspeção + integração sem force

teste falhou
→ corrigir + retestar

agente travou
→ preservar checkpoint + substituir agente

rota indisponível
→ procurar rota já existente no território
```

Não declarar sucesso por entusiasmo. Declarar somente por evidência reproduzível.

---

# ORQUESTRAÇÃO HIERÁRQUICA DE CIMA PARA BAIXO

## Nível 0 — Pivete

```text
autoridade final
intenção
escopo
permissão
decisão de merge/deploy
```

## Nível 1 — Hermes Orquestrador

Hermes:

```text
mantém o fio
congela missão/ref/SHA
descobre recursos
distribui trabalho
impede duplicação
recebe evidências
consolida
aplica AutoLupa em si mesmo
```

Hermes não executa sozinho tudo que pode ser delegado.

## Nível 2 — Chefes de frente

Disparar em paralelo, conforme disponibilidade:

### Frente A — Descoberta territorial

Mapear:

```text
repo local
refs remotas
branches
commits
PRs
Actions
skills
manuais
scripts
testes
VPS read-only
Supabase read-only
Edge Functions
CLIs
providers
modelos
agentes existentes
```

### Frente B — Arquitetura do auto-registro

Responsável por:

```text
ledger
schema
usage_id
BEGIN/FINAL
idempotência
anti-recursão
recuperação
trailers de commit
promoção de aprendizado
```

### Frente C — Implementação

Responsável por alterar o motor e arquivos canônicos, sem criar V2.

### Frente D — Testes determinísticos e propriedades

Responsável por:

```text
testes existentes
novos testes
falsos verdes históricos
sanitização
concorrência
replay
interrupção
Windows/Linux
```

### Frente E — Segurança adversarial

Responsável por procurar:

```text
secrets
paths sensíveis
injeção
corrida de escrita
registro divergente
falsificação de recibo
elevação de permissão
vazamento em logs
```

### Frente F — Kit Boas-Vindas e propagação

Responsável por localizar e atualizar somente os pontos reais de entrada:

```text
00-COMECE-AQUI-IA.md
CLAUDE.md
AGENTS.md
README.md
docs/GOVERNANCA/BOOT-IA.md
.claude/BOOT-PIVETE.md
.github/copilot-instructions.md
GEMINI.md
GROK.md
```

Não criar substituto para arquivo ausente. Encontrar a ref correta que o contém.

### Frente G — Crítico independente

Recebe o mesmo candidato congelado sem conhecer o veredito do implementador.

### Frente H — Consolidação e AutoLupa final

Agrupa evidências correlacionadas, remove XP duplicado, confronta resultados e tenta falsificar o ponto fixo.

---

# USO DE TODOS OS AGENTES E MODELOS DISPONÍVEIS

## Inventário obrigatório

Antes de delegar, produzir inventário sanitizado:

```text
PROVIDER
MODELO
STATUS
ROTA/CLI
CAPACIDADE
LIMITE ATUAL
PAPEL ATRIBUÍDO
```

Procurar recursos existentes por:

```text
Hermes model inventory
darkai --help
darkai model list ou equivalente
CLIs instaladas
providers configurados
gateway existente
Supabase ai-proxy
rotas documentadas no repositório
```

Não ler nem imprimir o valor de `WEBUI_LOVABLE_KEY` ou qualquer secret.

Rota conhecida pode ser usada somente por cliente já autenticado:

```text
Supabase Edge Function ai-proxy
modelo por payload
DarkAI CLI
```

Preferir:

```text
darkai --model <modelo> "<contrato da frente>"
```

ou o cliente oficial já configurado.

Não montar manualmente headers contendo secrets em saída ou relatório.

## Distribuição recomendada

```text
modelo forte de arquitetura
→ Frente B

modelo forte de código
→ Frente C

modelos rápidos
→ shards de testes, busca e inventário

modelo crítico independente
→ Frente G

modelo diferente do implementador
→ segurança e falsificação

DarkAI
→ debate, crítica e comparação independente

Gemini
→ varredura ampla, documentação e análise estrutural

Grok
→ investigação adversarial e crítica

Codex/Claude ou melhor coder disponível
→ implementação e testes
```

Isso é preferência, não premissa. Usar o inventário real.

## Todos os recursos, sem redundância inútil

Usar todos os agentes **relevantes e disponíveis**.

Se sobrarem agentes após preencher todas as frentes:

```text
dividir testes em shards
executar críticos cegos adicionais
revisar plataformas Windows/Linux
revisar segurança
revisar compatibilidade
revisar documentação
```

Não enviar dez agentes para produzir a mesma resposta.

---

# PROTOCOLO DE DELEGAÇÃO

Cada agente recebe contrato completo:

```text
MISSION_ID
PARENT_AGENT
ROLE
SOURCE_OF_TRUTH
WORKSPACE_BRANCH
WORKSPACE_HEAD
SKILL_PATH
SKILL_REF
SKILL_COMMIT_SHA
CANDIDATE_REF
CONTRACT_DIGEST
ALLOWED_PATHS
FORBIDDEN_PATHS
TOOLS
TESTS
EXPECTED_EVIDENCE
STOP_CONDITIONS
ROLLBACK
HANDOFF
```

Cada agente deve retornar:

```text
ROLE
MODEL
INPUT_SHA
FILES_READ
COMMANDS
FINDINGS
EVIDENCE
DEFECT_IDS
DUPLICATE_DEFECT_IDS
SCORE_NUMERATOR
SCORE_DENOMINATOR
VETO
RISK
RECOMMENDATION
```

Sem denominador, não existe percentual válido.

---

# PARALELISMO SEGURO

## Podem rodar juntos

```text
busca Git
inventário de modelos
leitura de documentação
mapeamento de VPS read-only
mapeamento Supabase read-only
revisão de segurança
design de testes
críticos independentes
```

## Devem ser serializados

```text
escrita no mesmo arquivo
geração de candidate_ref
geração de contract_digest
commit
push
atualização de PR
consolidação final
```

Um único escritor canônico.

Agentes auxiliares produzem:

```text
stdout
diff proposto
artefato temporário ignorado
parecer estruturado
```

O escritor canônico incorpora somente após revisão.

---

# VARREDURA DE TODO O TERRITÓRIO

Pesquisar até esgotar rotas relevantes:

## Repositório

```text
working tree
origin/main
origin/pivete/dev
origin/pivete/auditoria
branches de missão
todos os refs
git history
PRs
Actions
docs
skills
scripts
tests
workflows
```

## Máquina local

```text
clone canônico
CLIs instaladas
Hermes
inventário de providers
sem ler secrets
```

## VPS — somente leitura

```text
estrutura de módulos
scripts existentes
agentes
rotas
serviços
documentação
estado necessário à missão
```

Não copiar `.env`, secrets, caches, sessões, bancos, logs sensíveis ou chaves.

## Supabase — somente leitura, salvo código da missão já versionado

```text
Edge Functions existentes
schemas
migrations
funções de AI proxy
tabelas/ledgers equivalentes
políticas
```

Não criar infraestrutura paralela antes de provar que não há equivalente.

---

# CHECKPOINT ÚNICO COMPARTILHADO

Manter um manifesto de execução sanitizado, preferencialmente temporário/ignorado até consolidação:

```text
MISSION_ID
CURRENT_PHASE
WORKSPACE_HEAD
CANDIDATE_REF
CONTRACT_DIGEST
AGENTS_STARTED
AGENTS_FINISHED
OPEN_DEFECTS
FIXED_DEFECTS
TEST_STATE
PR_STATE
NEXT_ACTION
```

Toda frente lê o mesmo checkpoint.

Nenhum agente redefine a missão.

---

# POLÍTICA DE CONTINUIDADE

Não parar por erro intermediário.

Quando uma frente bloquear:

```text
registrar causa
preservar checkpoint
seguir nas frentes independentes
acionar fallback
voltar ao bloqueio
```

Somente aceitar `BLOCKED_REAL` depois de provar:

```text
todas as rotas autorizadas tentadas
todos os fallbacks relevantes tentados
credencial necessária realmente ausente
ação restante exige permissão destrutiva não concedida
evidências registradas
```

---

# RESULTADO DESTA MISSÃO

A missão não é “pesquisar”. É entregar funcional:

```text
auto-registro BEGIN/FINAL
ledger idempotente
anti-recursão
sanitização
recuperação
trailers
Kit Boas-Vindas
testes
AutoLupa
branch
commit
push
PR draft
checks verdes
```

Sem merge, deploy ou restart.

---

# BOOT BASE INCORPORADO

A partir daqui, todas as regras abaixo permanecem obrigatórias e fazem parte do mesmo contrato.

---

# BOOT — AUTO-REGISTRO OBRIGATÓRIO DA LUPA NA FONTE DA VERDADE

## ORDEM CANÔNICA DO PIVETE

```text
TODA VEZ QUE A LUPA-BAYESIANA FOR CARREGADA OU INVOCADA,
O USO DEVE SER REGISTRADO AUTOMATICAMENTE NO REPOSITÓRIO
SERVERVPSS/CENTRALDARK, FONTE DA VERDADE.

NÃO BASTA DIZER “USEI A LUPA”.
É OBRIGATÓRIO PROVAR:
CAMINHO + REF + SHA DA SKILL + MISSÃO + AUTOLUPA + RESULTADO.

RESOLVE. VÁ ATÉ O FIM.
PERMITO PIVETE SEM AÇÃO DESTRUTIVA. 🔒🚀
```

Esta autorização cobre branch, arquivos canônicos, testes, commit, push e PR necessários para implementar o mecanismo, sem merge, deploy, restart, force-push, secrets ou alteração destrutiva.

---

# MISSÃO

Implementar na skill canônica:

```text
.agents/skills/lupa-bayesiana/
```

um mecanismo obrigatório, automático, idempotente, auditável e recuperável para registrar **cada uso real da Lupa Bayesiana** no repositório fonte da verdade.

O mecanismo precisa diferenciar:

```text
USO DA SKILL
→ sempre gera recibo de uso

APRENDIZADO NOVO COMPROVADO
→ além do recibo, evolui a mesma skill,
   adiciona teste de regressão
   e registra aprendizado canônico
```

Não transformar todo uso em regra nova.  
Não transformar todo uso em XP.  
Não criar segunda Lupa.

---

# PRINCÍPIO CENTRAL

```text
carregar a skill
→ abrir recibo BEGIN
→ executar a missão
→ aplicar AutoLupa
→ corrigir e retestar
→ fechar recibo FINAL
→ registrar no Git
→ promover somente aprendizado novo comprovado
```

Um agente não pode declarar:

```text
LUPA_USADA=SIM
```

sem prova persistida na fonte da verdade.

---

# FONTE DA VERDADE E IDENTIDADE

```text
REPOSITÓRIO:
ServerVpss/CentralDark

SKILL_CANÔNICA:
.agents/skills/lupa-bayesiana/SKILL.md

IDENTIDADE:
name: lupa-bayesiana

MARCADOR DE BOOT:
LUPA_BAYESIANA_BOOT_REQUIRED

MARCADOR DE REGISTRO:
LUPA_USE_RECEIPT_REQUIRED
```

Primeiro localizar a branch/ref atual que realmente contém a skill e o Kit Boas-Vindas. Não presumir `main`, `pivete/dev` ou a branch de PR.

Registrar:

```text
WORKSPACE_BRANCH
WORKSPACE_HEAD
SKILL_PATH
SKILL_REF
SKILL_COMMIT_SHA
SKILL_BLOB_SHA
```

Quando Git estiver disponível, cópia baixada, cache, File Library, texto de conversa ou Lovable não substituem a ref canônica. Podem ser ponte ou evidência auxiliar.

---

# REGRA DE OURO DE CONSOLIDAÇÃO

Antes de criar qualquer arquivo, procurar mecanismo equivalente já existente.

Pesquisar:

```text
uso-ledger
usage-ledger
lupa receipt
lupa usage
audit ledger
event ledger
mission ledger
candidate_ref
contract_digest
APRENDIZADOS
RELATORIOS
```

Decisão:

```text
equivalente compatível existe
→ evoluir o existente

não existe mecanismo capaz de registrar alta frequência
→ criar somente UM ledger dentro da mesma skill
```

Caminho recomendado, somente se não existir equivalente:

```text
.agents/skills/lupa-bayesiana/references/uso-ledger.jsonl
```

Esse ledger é recurso interno da mesma skill. Não é Lupa paralela, V2 ou novo método.

Não usar `docs/CONSCIENCIA/APRENDIZADOS.md` como log de todo uso. Esse arquivo recebe apenas aprendizados novos consolidados.

---

# IMPLEMENTAÇÃO NO MESMO MOTOR

Reutilizar e ampliar o motor existente:

```text
.agents/skills/lupa-bayesiana/scripts/lupa_bayesiana.py
```

Não criar segundo script se o motor existente comportar subcomandos.

Subcomandos obrigatórios:

```text
begin-use
finish-use
verify-ledger
promote-learning
```

Interface mínima esperada:

```bash
python scripts/lupa_bayesiana.py begin-use \
  --repo ServerVpss/CentralDark \
  --mission-id "<id>" \
  --skill-path ".agents/skills/lupa-bayesiana/SKILL.md" \
  --skill-ref "<ref>" \
  --skill-commit-sha "<sha>" \
  --workspace-head "<sha>" \
  --mode "<read-only|edit|audit|deploy>"

python scripts/lupa_bayesiana.py finish-use \
  --mission-id "<id>" \
  --verdict "<APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR>" \
  --autolupa "<sim|nao>" \
  --point-fixed "<sim|nao>" \
  --tests-manifest "<arquivo-ou-json>" \
  --evidence-manifest "<arquivo-ou-json>"

python scripts/lupa_bayesiana.py verify-ledger

python scripts/lupa_bayesiana.py promote-learning \
  --usage-id "<id>"
```

Adaptar a interface à arquitetura real, preservando compatibilidade com comandos existentes.

---

# RECIBO DE USO

Cada utilização possui um `usage_id` determinístico:

```text
usage_id = SHA-256(
  schema_version
  + repo
  + mission_id
  + skill_commit_sha
  + workspace_head
)
```

Usar serialização canônica, UTF-8 e ordem estável de campos.

O ledger é append-only e possui dois eventos por uso:

```text
BEGIN
FINAL
```

## Evento BEGIN

Registrar imediatamente após a skill ser lida e antes da análise de fundo:

```json
{
  "schema_version": 1,
  "event": "BEGIN",
  "usage_id": "...",
  "started_at_utc": "...",
  "repo": "ServerVpss/CentralDark",
  "mission_id": "...",
  "workspace_branch": "...",
  "workspace_head": "...",
  "skill_path": ".agents/skills/lupa-bayesiana/SKILL.md",
  "skill_ref": "...",
  "skill_commit_sha": "...",
  "skill_blob_sha": "...",
  "mode": "read-only|edit|audit|deploy",
  "authorization": "PERMITO PIVETE SEM AÇÃO DESTRUTIVA",
  "source": "git",
  "record_hash": "..."
}
```

## Evento FINAL

Registrar depois da AutoLupa e dos retestes:

```json
{
  "schema_version": 1,
  "event": "FINAL",
  "usage_id": "...",
  "finished_at_utc": "...",
  "verdict": "APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR",
  "autolupa_executed": true,
  "point_fixed_evidential": true,
  "own_errors_found": [],
  "corrections": [],
  "test_suites": 0,
  "checks": 0,
  "test_cases": 0,
  "property_cases": 0,
  "pass": 0,
  "fail": 0,
  "files_changed": [],
  "pr": null,
  "evidence": [],
  "new_defect_ids": [],
  "duplicate_defect_ids": [],
  "xp_valid": 0,
  "xp_rejected": 0,
  "residual_risk": [],
  "result": "CONCLUIDO|PARCIAL|BLOQUEADO",
  "record_hash": "..."
}
```

Campos ausentes devem ser `null`, `[]` ou zero. Não inventar valores.

---

# SEGURANÇA DO LEDGER

É proibido registrar:

```text
tokens
senhas
cookies
chaves privadas
chaves públicas completas
conteúdo de .env
authorization headers
IPs sensíveis sem necessidade
e-mails pessoais desnecessários
paths contendo usuário quando não forem essenciais
corpo integral de logs sensíveis
```

Antes da escrita:

```text
sanitizar
→ validar schema
→ validar UTF-8
→ calcular record_hash
→ varrer secrets
→ append atômico
```

Se detectar dado sensível:

```text
não escrever o dado
→ substituir por [REDACTED]
→ registrar sensitive_data_blocked=true
→ continuar com recibo sanitizado
```

---

# ANTI-DUPLICAÇÃO

Antes de escrever:

```text
buscar usage_id + event
```

Regras:

```text
BEGIN já existe
→ não duplicar

FINAL já existe com mesmo record_hash
→ idempotente, retornar sucesso

FINAL já existe com conteúdo divergente
→ BLOQUEAR
→ registrar conflito
→ exigir nova revisão
```

O mesmo erro encontrado por vários comitês continua sendo um defeito único agrupado pela causa raiz.

---

# ANTI-RECURSÃO

Registrar o uso da Lupa usa a própria Lupa, mas não pode gerar loop infinito de recibos.

Criar guard interno:

```text
LUPA_REGISTRATION_MODE=1
```

Regras:

```text
registro normal da missão
→ gera BEGIN + FINAL

execução interna feita apenas para gravar/verificar o recibo
→ não abre outro recibo

AutoLupa sobre o mecanismo de registro
→ pertence ao usage_id original
```

Nunca criar:

```text
recibo do recibo
recibo do recibo do recibo
```

Adicionar teste determinístico contra recursão.

---

# RECUPERAÇÃO DE INTERRUPÇÃO

No BOOT, executar:

```text
verify-ledger
```

Detectar:

```text
BEGIN sem FINAL
```

Para cada uso incompleto:

```text
confirmar se a missão ainda existe
→ recuperar checkpoint
→ finalizar com evidência
OU
→ registrar FINAL com result=BLOQUEADO e causa real
```

Não apagar BEGIN órfão.

---

# ESTRATÉGIA GIT

## Missão com branch/PR existente

O registro deve entrar no mesmo branch e no mesmo PR da missão.

```text
diff da missão
+ recibo da Lupa
+ testes
= mesmo PR
```

## Missão read-only sem branch de alteração

Não modificar `main` diretamente.

Preferência:

```text
reutilizar branch de auditoria/registro existente
```

Se não existir, criar uma única branch rolante:

```text
audit/lupa-usage-ledger
```

e um único PR draft rolante para o ledger, evitando um PR novo por uso.

Antes de criar, procurar se já existe.

## Conflito/non-fast-forward

```text
fetch
→ inspecionar remoto
→ integrar sem force
→ deduplicar usage_id
→ retestar
→ push normal
```

Proibido:

```text
force-push
reset --hard
apagar registros
reescrever ledger para esconder erro
```

---

# TRAILERS DE COMMIT

Todo commit produzido por missão que utilizou a Lupa deve incluir trailers:

```text
Lupa-Used: true
Lupa-Usage-ID: <usage_id>
Lupa-Skill-Path: .agents/skills/lupa-bayesiana/SKILL.md
Lupa-Skill-Ref: <ref>
Lupa-Skill-Commit: <sha>
AutoLupa: executed
Point-Fixed-Evidential: yes|no
```

Os trailers complementam o ledger; não o substituem.

Testar parser dos trailers.

---

# PROMOÇÃO DE APRENDIZADO

O recibo registra uso.  
`promote-learning` registra somente aprendizado novo comprovado.

Gate obrigatório:

```text
defeito novo?
reproduzível?
mesmo candidato?
mesmo contrato?
não duplicado?
causa raiz identificada?
correção validada?
teste de reincidência criado?
crítico independente validou?
```

Somente após todos verdes:

1. atualizar a mesma `SKILL.md` ou recurso canônico;
2. adicionar teste;
3. atualizar `references/casos.md`;
4. registrar no próximo número real de `docs/CONSCIENCIA/APRENDIZADOS.md`;
5. gerar novo `contract_digest` se o contrato mudou;
6. abrir/atualizar o mesmo PR.

Não conceder XP por:

```text
elogio
opinião
erro não reproduzido
mesmo defeito repetido
snapshot rejeitado
mudança cosmética
autodeclaração do executor
```

---

# BOOT OBRIGATÓRIO DAS IAS

Atualizar os pontos de entrada existentes, sem criar equivalentes paralelos:

```text
00-COMECE-AQUI-IA.md
CLAUDE.md
AGENTS.md
README.md
docs/GOVERNANCA/BOOT-IA.md
.claude/BOOT-PIVETE.md
.github/copilot-instructions.md
GEMINI.md
GROK.md
```

Somente os arquivos realmente existentes na ref correta.

Inserir:

```text
LUPA_BAYESIANA_BOOT_REQUIRED
LUPA_USE_RECEIPT_REQUIRED
```

Antes de qualquer ação, exigir:

```text
LUPA_BAYESIANA_BOOT_REQUIRED: SIM
LUPA_USE_RECEIPT_REQUIRED: SIM
SKILL_PATH:
SKILL_REF:
SKILL_COMMIT_SHA:
USAGE_ID:
BEGIN_RECEIPT_RECORDED: SIM/NÃO
```

No encerramento:

```text
AUTOLUPA_EXECUTED:
OWN_ERRORS_FOUND:
CORRECTIONS:
RETESTS:
POINT_FIXED_EVIDENTIAL:
FINAL_RECEIPT_RECORDED:
LEDGER_REF:
LEDGER_RECORD_HASH:
```

Sem BEGIN válido:

```text
BOOT_BLOQUEADO
```

Sem FINAL após AutoLupa:

```text
MISSÃO_NÃO_SELADA
```

---

# TESTES OBRIGATÓRIOS

Preservar todos os testes existentes e adicionar, no mesmo diretório canônico:

1. `usage_id` determinístico;
2. serialização estável;
3. `record_hash` reproduzível;
4. BEGIN único;
5. FINAL único;
6. replay idempotente;
7. conflito de FINAL divergente;
8. BEGIN órfão detectado;
9. recuperação de missão interrompida;
10. sanitização de token;
11. sanitização de chave;
12. sanitização de `.env`;
13. separação de suítes/checks/casos/propriedades;
14. anti-recursão;
15. commit trailers presentes;
16. marcador nos arquivos de entrada existentes;
17. ausência da skill bloqueia BOOT;
18. cache não vence Git;
19. aprendizado duplicado não recebe XP;
20. uso simples não altera a skill;
21. novo aprendizado válido gera teste;
22. `contract_digest` muda quando o contrato muda;
23. ledger JSONL válido linha por linha;
24. nenhum secret no diff;
25. rollback preserva ledger histórico.

Executar propriedades matemáticas existentes.

Não declarar números históricos sem executá-los nesta rodada.

---

# AUTOLUPA DO PRÓPRIO MECANISMO

Antes do PR:

1. O registro pode falhar silenciosamente?
2. Um agente pode alegar uso sem BEGIN?
3. Um agente pode concluir sem FINAL?
4. O mesmo uso pode ser duplicado?
5. O ledger pode conter segredo?
6. O registro pode criar loop infinito?
7. Conflito remoto pode apagar recibo?
8. Um uso comum pode inflar XP?
9. Um erro repetido pode ser contado novamente?
10. O ledger virou documento paralelo à skill?
11. Há caminho duplicado?
12. O mecanismo funciona em Windows e Linux?
13. O parser preserva UTF-8?
14. Outro agente consegue reproduzir o hash?
15. O registro permite retomar após queda?
16. A branch correta foi usada?
17. O mesmo SHA foi testado e revisado?
18. O PR contém somente paths autorizados?
19. O Pivete continua sendo autoridade final?
20. Existe risco residual não declarado?

Corrigir e repetir até ponto fixo evidencial.

---

# BRANCH, COMMIT E PR

Localizar primeiro branch e PR atuais.

Preferência:

```text
atualizar o PR existente da lupa
```

Se a branch atual estiver obsoleta ou não contiver os pontos reais de entrada:

```text
criar uma única branch a partir de pivete/dev atual:
feat/lupa-auto-registro-fonte-verdade-AAAA-MM-DD-HHMM
```

Abrir um único PR draft para a branch correta.

Permitido:

```text
fetch
branch
edit
test
commit
push
PR draft
labels de autorização
acompanhar checks
corrigir checks
```

Proibido:

```text
merge
deploy
restart
force
main direta
VPS
secrets
apagar histórico
```

---

# RELATÓRIO

Atualizar relatório canônico existente da Lupa.

Se não existir relatório correspondente, criar somente:

```text
docs/RELATORIOS/AAAA-MM-DD-lupa-auto-registro-fonte-verdade.md
```

O relatório deve provar:

```text
mecanismo anterior
lacuna encontrada
arquivos reutilizados
ledger escolhido
schema
anti-recursão
idempotência
sanitização
recuperação
trailers
testes
AutoLupa
branch
commit
PR
rollback
risco residual
```

Não criar outro documento canônico da técnica.

---

# SAÍDA FINAL OBRIGATÓRIA

```text
VEREDITO:
REPO:
WORKSPACE_BRANCH:
WORKSPACE_HEAD:
SKILL_PATH:
SKILL_REF:
SKILL_COMMIT_SHA:
LEDGER_PATH:
LEDGER_REF:
SCHEMA_VERSION:
BEGIN_HOOK:
FINAL_HOOK:
ANTI_RECURSION:
IDEMPOTENCY:
SANITIZATION:
RECOVERY:
COMMIT_TRAILERS:
BOOT_FILES_UPDATED:
LEARNING_PROMOTION:
SUITES_TOTAL:
CHECKS_TOTAL:
TEST_CASES_TOTAL:
PROPERTY_CASES_TOTAL:
PASS:
FAIL:
AUTOLUPA_ITERATIONS:
AUTOLUPA_FINDINGS:
CORRECTIONS:
POINT_FIXED_EVIDENTIAL:
FILES_CHANGED:
BRANCH:
COMMIT:
PUSH:
PR:
CHECKS:
MERGE=0
DEPLOY=0
RESTART=0
ROLLBACK:
RESIDUAL_RISK:
NEXT_ACTION:
```

## Gate final

Só declarar:

```text
READY_FOR_PIVETE_REVIEW
```

quando:

```text
cada uso gera BEGIN
cada conclusão gera FINAL
registro é idempotente
registro não recursa
secrets são bloqueados
interrupção é recuperável
trailers são verificáveis
BOOT exige recibo
aprendizado só sobe com prova
testes estão verdes
AutoLupa atingiu ponto fixo
branch publicada
PR draft aberto
zero merge/deploy/restart
```

---

# FIO DA MISSÃO

```text
entrar no repositório
→ ler skill canônica
→ provar path/ref/SHA
→ abrir BEGIN
→ executar missão
→ AutoLupa
→ corrigir/retestar
→ fechar FINAL
→ commit trailer
→ push/PR
→ aprendizado novo?
   ├─ não: somente recibo
   └─ sim: teste + evolução da mesma skill + APRENDIZADOS
→ ponto fixo
→ Pivete revisa
```
