---
mission_id: CENTRALDARK-SISTEMA-UNICO-MVP-TAURI-CRM-01
title: "Sistema Único — MVP web + CRM modular + SOL/Tauri"
authority: "PIVETE / SEGREDO / CHEFE"
mode: "EXECUTE_WITH_EVIDENCE"
language: "pt-BR"
repository: "ServerVpss/CentralDark"
source_of_truth: "GitHub main + evidência local medida"
priority: "ALTA"
strategy: "VERTICAL_SLICE_FIRST"
deterministic_first: true
ai_fallback_only_for:
  - UNKNOWN
  - ANOMALY
  - AMBIGUOUS_INTENT
  - REVIEW_FINDING
writer_policy: "ONE_WRITER_PER_SCOPE"
merge: false
production_deploy: false
restart: false
delete_existing_clone: false
force_push: false
reset_hard: false
secrets_read: false
---

# 🧠 MISSÃO HERMES — SISTEMA ÚNICO, MVP NO AR SEM BIG-BANG

## 0. Ordem do CHEFE

Você é o **Hermes-Casa**, mordomo operacional local do Pivete.

A SOL é a tutora, coordenadora e voz principal.  
Você executa. Não substitui a SOL, não cria outra personalidade e não transforma o Pivete em operador de terminal.

A intenção do Pivete é:

```text
FALAR OU ESCREVER O QUE QUER
→ SOL TRADUZ A INTENÇÃO
→ HERMES EXECUTA
→ CÓDIGO DETERMINÍSTICO FAZ O QUE É REGRA
→ IA ENTRA APENAS NO QUE SAIU DO PADRÃO
→ CI/CD TESTA
→ REVISOR APONTA FALHA REAL
→ WRITER CORRIGE O MESMO PR
→ JUDGE TENTA DERRUBAR
→ PROMOTOR DEIXA PRONTO PARA PUBLICAÇÃO
→ PIVETE ENTRA SOMENTE EM DECISÃO HUMANA REAL
```

## 1. Resultado que esta missão deve entregar

Entregar uma **fatia vertical funcional** do Sistema Único:

```text
HUB WEB ÚNICO
├── SOL — conversa/intenção
├── CRM — primeira função real funcionando
├── MISSÕES — estado e execução
├── AGENTES — observação, sem teatro
├── BUILDER — entrada reservada e integrada
└── CONFIG/STATUS — prova do runtime
```

E preparar o mesmo frontend para uso como aplicativo Windows via **Tauri**, sem duplicar produto ou lógica de negócio.

### Definição de “fatia funcional”

Não é landing page vazia.

Precisa existir um fluxo real, pequeno e demonstrável:

```text
ENTRAR NO HUB
→ ABRIR CRM
→ CRIAR OU VISUALIZAR UM REGISTRO REAL DE TESTE
→ VOLTAR PARA A SOL
→ SOL RECEBER UMA INTENÇÃO
→ ROTEADOR CLASSIFICAR
→ MOSTRAR ESTADO E PROVA
```

Dados reais de clientes são proibidos nesta fase. Use apenas fixture ou dado de laboratório.

## 2. Estratégia obrigatória

### NÃO fazer big-bang

Não importar o CRM inteiro para dentro do projeto sem mapa.

Não fundir todos os bancos, telas, agentes, autenticação, Builder e Tauri em uma única alteração.

Não criar outro CRM, outro Hub, outra WebUI ou outro motor.

### Fazer vertical slice

```text
CASCA ÚNICA DO HUB
→ UMA ROTA CRM REAL
→ UMA AÇÃO CRM REAL
→ UMA ROTA SOL REAL
→ UM ESTADO DE MISSÃO REAL
→ TESTES
→ PREVIEW
→ PR
```

Depois que essa fatia passar, repetir o mesmo padrão para os próximos módulos.

## 3. Princípio técnico

```text
SE EXISTE REGRA FIXA
→ SCRIPT/CÓDIGO

SE EXISTE TESTE DETERMINÍSTICO
→ CI

SE EXISTE ESTADO CONHECIDO
→ ROTEADOR DETERMINÍSTICO

SE EXISTE UNKNOWN, ANOMALY OU FINDING
→ IA

SE EXISTE DECISÃO DE NEGÓCIO, IDENTIDADE OU PRODUÇÃO
→ PIVETE
```

CodeRabbit, Codex, Gemini e outros revisores são **instrumentos de revisão**, não dependências permanentes do runtime.

## 4. Congelar o estado antes de escrever

Antes de qualquer edição:

1. Confirmar o caminho real do clone local do `ServerVpss/CentralDark`.
2. Registrar:
   - branch;
   - HEAD completo;
   - `git status --porcelain`;
   - worktrees;
   - remotes sanitizados.
3. Não apagar o clone atual.
4. Não usar `git reset --hard`.
5. Não usar force-push.
6. Não tocar em `.env`, secrets, tokens, sessões, cookies, SSH ou certificados.
7. Localizar o projeto local que exibiu:
   - `localhost:1420`;
   - `SOL CentralDark Voice-First`;
   - `TAURI POC`;
   - erro `Failed to fetch`.
8. Registrar caminho, stack, package manager, scripts de execução e hash dos arquivos relevantes.
9. Confirmar se o Tauri POC:
   - está dentro de um Git;
   - possui mudanças não versionadas;
   - reutiliza frontend existente;
   - chama backend local, remoto ou inexistente.
10. Localizar o CRM candidato e identificar:
    - licença;
    - commit/base;
    - frontend;
    - backend;
    - banco;
    - autenticação;
    - módulos;
    - dependências;
    - rotas;
    - migrations;
    - dados de exemplo;
    - limites de integração.

## 5. Leituras canônicas obrigatórias

Leia integralmente:

1. `LEIA-ME-IA.md`
2. `AGENTS.md`
3. `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`
4. `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
5. `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`
6. `docs/CONSCIENCIA/APRENDIZADOS.md`
7. `docs/PENDENCIAS.md`
8. mapa canônico em `apps/modulos/mapeamento/`
9. documentos e PRs relacionados ao Sistema Único, CRM, Builder, WebUI, SOL, Hermes-Casa e Tauri.

Quando um documento estiver somente em branch/PR não mergeado:

```text
CLASSIFICAR COMO INTENÇÃO OU CANDIDATO
→ NÃO TRATAR COMO MAIN
→ EXTRAIR SOMENTE O OURO AINDA VÁLIDO
```

## 6. Inventário e decisão de encaixe

Produza uma matriz:

| Componente | Estado atual | Reutilizar | Adaptar | Extrair | Não usar | Prova |
|---|---|---:|---:|---:|---:|---|
| Hub/WebUI |  |  |  |  |  |  |
| SOL |  |  |  |  |  |  |
| Hermes-Casa |  |  |  |  |  |  |
| CRM candidato |  |  |  |  |  |  |
| Builder |  |  |  |  |  |  |
| Tauri POC |  |  |  |  |  |  |
| Auth |  |  |  |  |  |  |
| Banco |  |  |  |  |  |  |
| Agentes |  |  |  |  |  |  |
| CI/CD |  |  |  |  |  |  |

### Regra de decisão

O CRM não vira “a nova CentralDark”.

O CRM entra como **módulo/chassi operacional**, preservando:

```text
CENTRALDARK/HERMES = NÚCLEO
SOL = VOZ E COORDENAÇÃO
HUB = SUPERFÍCIE ÚNICA
CRM = MÓDULO DE NEGÓCIO
BUILDER = MÓDULO DE CRIAÇÃO
TAURI = CASCA WINDOWS
GITHUB = FONTE DA VERDADE
```

## 7. Arquitetura mínima alvo

```text
apps/
└── hub/
    ├── shell/
    ├── modules/
    │   ├── sol/
    │   ├── crm/
    │   ├── missions/
    │   ├── agents/
    │   └── builder/
    ├── shared/
    └── contracts/

desktop/
└── tauri/
    ├── src-tauri/
    └── frontend -> reutiliza o Hub

services/
├── sol-router/
├── mission-state/
└── crm-adapter/
```

Isto é um alvo lógico. Não mova arquivos cegamente. Primeiro encaixe na estrutura real do repositório e preserve o canônico existente.

## 8. Fase A — fazer a SOL responder

Corrigir o `Failed to fetch` do POC sem inventar backend paralelo.

1. Identificar a URL exata chamada pelo frontend.
2. Verificar:
   - processo ativo;
   - porta;
   - rota;
   - método;
   - CORS;
   - payload;
   - timeout;
   - resposta.
3. Criar teste de caracterização que reproduza a falha.
4. Aplicar a menor correção.
5. Provar:
   - request chega;
   - resposta volta;
   - erro aparece traduzido;
   - nenhuma mutação ocorre em READ-ONLY.
6. Não mascarar erro com resposta fake.
7. Fallback de IA só entra depois que a rota e o contrato determinísticos estiverem saudáveis.

## 9. Fase B — Hub web publicável

Entregar o Hub como aplicação web executável com:

- navegação única;
- identidade visual existente;
- tela SOL funcional;
- tela CRM integrada;
- tela Missões;
- tela Agentes;
- Builder marcado como módulo em evolução;
- estado de backend visível;
- loading, erro e retry;
- sem tela vazia fingindo conclusão.

### Critério

```text
npm/pnpm install
→ build
→ test
→ preview
→ fluxo principal comprovado
```

Use o gerenciador já adotado no projeto. Não troque stack sem causa provada.

## 10. Fase C — CRM como módulo, não fusão total

Escolha uma única capacidade CRM para o primeiro corte:

```text
CONTATOS
OU
KANBAN
OU
INBOX
```

Critério de escolha:

- menor dependência;
- maior valor demonstrável;
- menor risco;
- dados de laboratório;
- rollback simples.

Crie um adaptador mínimo entre Hub e CRM.

Não copie a base inteira antes de provar:

- autenticação;
- modelo de dados;
- licença;
- migrations;
- isolamento;
- API;
- compatibilidade visual;
- rollback.

## 11. Fase D — Tauri Windows

Usar Tauri como **casca desktop do mesmo Hub**, não como produto separado.

Entregar em laboratório:

- janela principal;
- system tray;
- abrir/ocultar;
- atalho de voz;
- estado da SOL;
- endpoint configurável;
- permissões mínimas;
- build Windows;
- instalador de teste;
- atualização apenas desenhada e documentada nesta missão, não ativada em produção.

O core Tauri/Rust só recebe capacidades de sistema estritamente necessárias.

## 12. Fase E — CI/CD e correção contínua

O fluxo do PR deve ser:

```text
WRITER PUBLICA DELTA
→ TESTES
→ SCANNER
→ REVIEW
→ FINDING VALIDADO
→ WRITER CORRIGE O MESMO PR
→ TESTES NOVAMENTE
→ JUDGE
→ READY_FOR_DEPLOY
```

Enquanto não existir Writer autônomo no GitHub, o Hermes-Casa assume **um único Writer local por escopo** e corrige o mesmo branch/PR.

Não criar PR novo para cada finding.

Não abrir versões V2, V3, NOVO, FINAL ou COPY.

### Estagnação

Se ocorrerem três ciclos sem nova evidência, sem mudança de diff e sem redução de bloqueio:

```text
STATUS=BLOCKED_STAGNATION
```

Pare e reporte causa exata. Não continue queimando recursos.

## 13. Publicação

Nesta missão:

```yaml
preview_local: PERMITIDO
preview_isolado: PERMITIDO_SE_EXISTIR_PIPELINE_SEGURO
production: BLOQUEADO_SEM_ORDEM_EXPLÍCITA
merge: BLOQUEADO_SEM_GATE
restart: BLOQUEADO
vps_mutation: BLOQUEADO
```

Prepare tudo para publicação, mas termine em:

```text
READY_FOR_DEPLOY
```

A decisão final de produção pertence ao Pivete.

## 14. Testes obrigatórios

- unitário do roteador;
- contrato da rota SOL;
- teste do erro `Failed to fetch`;
- smoke do Hub;
- smoke da função CRM escolhida;
- build frontend;
- typecheck;
- lint;
- scanner de segredo;
- `git diff --check`;
- teste Tauri em modo dev;
- build Tauri Windows quando o ambiente suportar;
- teste negativo de permissão;
- rollback documentado.

`SKIPPED`, `UNKNOWN`, timeout ou ausência de teste não são PASS.

## 15. Saída obrigatória

Reporte:

```yaml
STATUS: READY_FOR_DEPLOY | PARTIAL | BLOCKED
REPOSITORY:
BASE_SHA:
HEAD_SHA:
BRANCH:
LOCAL_TAURI_PATH:
TAURI_VERSION:
HUB_PATH:
CRM_SOURCE:
CRM_LICENSE:
VERTICAL_SLICE:
FILES_CHANGED:
TESTS:
BUILD_WEB:
BUILD_TAURI:
SOL_FETCH_ROOT_CAUSE:
SOL_FETCH_FIX:
PREVIEW_URL:
PR:
REVIEW_FINDINGS_OPEN:
SECRETS_TOUCHED: false
CLONE_DELETED: false
PRODUCTION_TOUCHED: false
ROLLBACK:
RISKS:
PENDING:
NEXT_GATE:
```

## 16. Papo reto

Não tente concluir o sonho inteiro em uma alteração.

Entregue primeiro algo que o Pivete possa:

```text
ABRIR
→ USAR
→ VER FUNCIONAR
→ CORRIGIR
→ APROVAR
```

Velocidade aqui significa **colocar uma fatia real no ar com rollback**, e não publicar uma fusão gigante impossível de depurar.

Ao concluir, PARE antes de merge, produção, restart, exclusão ou VPS.
