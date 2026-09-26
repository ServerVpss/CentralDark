# /goal — ARSENAL MÁXIMO: HUB CENTRALDARK + SUPABASE + LOVABLE + HERMES

## AUTORIDADE E INTENÇÃO

Autoridade final: **Pivete**.

Objetivo humano desta missão:

> Transformar o botão **HUB** do cockpit Lovable na superfície central real da CentralDark, reaproveitando tudo que já existe no HUB, no repositório, na VPS, no Supabase, no Gateway e no Hermes — sem criar motor paralelo, sem repetir trabalho e sem depender de chats que somem.

A missão deve operar com alta autonomia, agentes em paralelo e uso livre dos modelos e rotas já disponíveis. Não economizar raciocínio ou tokens artificialmente. Economizar apenas trabalho duplicado, reescrita desnecessária e execução sem valor.

---

# RESULTADO FINAL ESPERADO

Entregar uma implementação revisável em branch própria contendo:

1. HUB integrado ao cockpit Lovable;
2. Supabase como plano de controle, estado e auditoria;
3. VPS/Hermes/Gateways preservados como plano de execução;
4. contratos reais entre frontend, Supabase e serviços existentes;
5. dados reais separados de demonstrações;
6. autenticação e autorização centralizadas;
7. missões, eventos, evidências e health observáveis;
8. nenhuma cópia desnecessária do backend atual;
9. testes, diff, commit, push da branch e PR pronto;
10. relatório canônico que permita retomar a missão sem depender deste chat.

Não fazer merge na `main`, deploy público final, restart de produção ou migração irreversível nesta rodada.

---

# FONTES DA VERDADE

## Repositório local validado

```text
E:\CentralDark\Pivete\CentralDark
```

Estado histórico já comprovado antes desta missão:

```text
REMOTE=https://github.com/ServerVpss/CentralDark.git
BRANCH=main
LOCAL_HEAD=8a5be39459b3a15c595e211aebe201fc19ce6c0a
ORIGIN_MAIN=8a5be39459b3a15c595e211aebe201fc19ce6c0a
ALTERACOES_LOCAIS=0
CLONE_VALIDADO=OK_LIMPO_E_ATUAL
```

Esse SHA é apenas referência histórica. Resolver novamente `origin/main` no início.

## HUB atual

```text
https://hub.centralldark.com/
```

## HUB na VPS

```text
/root/CentralDark/apps/modulos/hub
```

## HUB no repositório

Localizar no clone atualizado. Caminho provável:

```text
apps/modulos/hub
```

Não presumir se o caminho real divergir.

## Cockpit Lovable

Projeto CentralDark já aberto e conectado ao repositório. O botão `HUB` já existe no menu do cockpit.

## API central

```text
https://api.centraldark.com/
```

Mapear as rotas reais antes de usar.

---

# BOOT OBRIGATÓRIO

Antes de editar qualquer arquivo:

1. atualizar o clone por `fetch` + `pull --ff-only`;
2. ler integralmente:
   - `AGENTS.md`;
   - `CLAUDE.md`;
   - `CODEX.md`;
   - regras aplicáveis por diretório;
   - `docs/CONSCIENCIA/APRENDIZADOS.md`;
   - `docs/PENDENCIAS.md`;
   - mapa canônico;
   - arquitetura do HUB;
   - configuração Supabase existente;
   - contratos e rotas de API;
3. localizar a skill canônica pela identidade interna:
   ```yaml
   name: lupa-bayesiana
   ```
4. carregar integralmente:
   - `SKILL.md`;
   - referências;
   - scripts;
   - testes;
5. registrar o caminho real da skill.

## Regra sobre o arquivo baixado da skill

Não usar como fonte da verdade uma cópia manual baixada para `E:\CentralDark`.

A cópia visual/baixada serve somente como evidência de que a skill existe.

A fonte canônica é a versão encontrada no repositório conectado, com histórico Git.

Se a skill canônica não for encontrada ou se existirem duas candidatas conflitantes, retornar `BLOCKED_SKILL_IDENTITY` antes de editar.

---

# METALUPA OBRIGATÓRIA

Aplicar a `lupa-bayesiana` durante toda a missão:

```text
mapa
→ evidência
→ crença
→ teste
→ decisão
→ AutoLupa
→ consolidação
```

Princípios obrigatórios:

- preservar e evoluir o que já existe;
- não criar V2, backend concorrente, segundo HUB ou nova doutrina;
- separar fato, inferência e não confirmado;
- identidade de arquivo inclui caminho, Git SHA, revisão e hash;
- primeiro conflito material ativa `STOP-WRITE`;
- confiança não equivale a autorização;
- executor não sela o próprio verde;
- evidências correlacionadas não contam como provas independentes;
- porcentagens exigem numerador, denominador e escopo;
- sucesso não é presumido pela MetaLupa: deve ser comprovado por testes.

---

# ARQUITETURA-ALVO

Não migrar tudo para Edge Functions.

Usar esta separação:

```text
LOVABLE
→ interface, navegação, painéis e comandos humanos

SUPABASE
→ autenticação, RLS, estado, missões, filas, eventos,
  evidências, catálogo, Realtime e Edge Functions curtas

VPS / HERMES
→ agentes contínuos, gateways, MCP, DarkAI, navegador,
  builders, roteamento pesado, tarefas longas e runtime

METALUPA
→ validação, falsificação, STOP-WRITE e prova

PIVETE
→ prioridade, significado, autorização e decisão final
```

## Regra de Edge Functions

Edge Functions podem:

- autenticar;
- validar escopo;
- ler e agregar estado;
- receber comando;
- registrar auditoria;
- criar missão/fila;
- chamar API existente;
- receber webhook;
- fornecer health agregado.

Edge Functions não devem substituir:

- Hermes 24h;
- DarkAI;
- MCP;
- gateways permanentes;
- navegador headless;
- workers longos;
- processos PM2;
- tarefas de duração imprevisível;
- roteamento pesado contínuo.

---

# ORQUESTRA PARALELA

Criar um checkpoint compartilhado antes de delegar.

Usar no máximo um agente principal por função. Modelos são cérebros intercambiáveis, não novos setores.

## AGENTE 1 — ARQUITETO / SÍNTESE

Responsável por:

- mapa único;
- arquitetura-alvo;
- decisões;
- prevenção de duplicações;
- síntese final.

Preferência:

```text
Opus/Grok de maior capacidade disponível
```

Fallback:

```text
Gemini Pro / Sonnet / modelo operacional disponível
```

## AGENTE 2 — MAPA DO REPOSITÓRIO

Responsável por:

- HUB versionado;
- Supabase;
- Lovable/cockpit;
- APIs;
- contratos;
- dependências;
- testes existentes;
- mapa canônico;
- consumidores.

## AGENTE 3 — MAPA DA VPS

Responsável por:

- `/root/CentralDark/apps/modulos/hub`;
- serviços do HUB;
- processos relacionados;
- rotas;
- healthchecks;
- diferenças VPS × Git;
- código útil não versionado;
- runtime, logs e gerados classificados separadamente.

Não ler valores de `.env`, secrets, tokens, cookies ou chaves.

## AGENTE 4 — SUPABASE / PLANO DE CONTROLE

Responsável por:

- CLI;
- projeto já conectado;
- migrations existentes;
- tabelas;
- Auth/RLS;
- Edge Functions;
- Realtime;
- Queues/Cron quando realmente necessários;
- compatibilidade com a arquitetura atual.

## AGENTE 5 — LOVABLE / FRONTEND HUB

Responsável por:

- botão HUB;
- rotas;
- páginas;
- componentes;
- estados;
- dados reais;
- loading, erro e offline;
- integração com contratos existentes;
- preservação da identidade visual do cockpit.

## AGENTE 6 — ROUTER / PROVIDERS

Responsável por:

- `api.centraldark.com`;
- DarkAI;
- Abacus;
- Elite Gateway;
- Arsenal;
- MCP;
- Hermes;
- modelos e ferramentas;
- aliases;
- fallback;
- circuit breaker;
- custos e telemetria.

Não trocar o modelo global padrão nesta missão.

## AGENTE 7 — CRÍTICO INDEPENDENTE

Responsável por:

- procurar falso verde;
- questionar duplicações;
- comparar VPS × Git × Supabase × Lovable;
- revisar o diff sem herdar o veredito dos executores;
- executar AutoLupa final.

DarkAI, Gemini ou Grok podem atuar como crítico, desde que a revisão seja independente do executor da mudança.

---

# FASE 0 — SINCRONIZAÇÃO E IDENTIDADE

No PowerShell/local:

```powershell
git -C "E:\CentralDark\Pivete\CentralDark" fetch origin --prune
git -C "E:\CentralDark\Pivete\CentralDark" switch main
git -C "E:\CentralDark\Pivete\CentralDark" pull --ff-only origin main
```

Registrar:

```text
REMOTE
BRANCH
HEAD
ORIGIN_MAIN
STATUS
```

Se houver mudança local, preservar e classificar. Não usar `reset --hard`, `clean`, force ou sobrescrita.

Criar branch somente após leitura:

```text
feat/hub-control-plane-AAAA-MM-DD-HHMM
```

---

# FASE 1 — INVENTÁRIO ÚNICO

Produzir um manifesto único contendo:

```text
COMPONENTE
CAMINHO
AMBIENTE
FONTE_CANÔNICA
FUNÇÃO
ROTA/API
AUTENTICAÇÃO
DEPENDÊNCIAS
CONSUMIDORES
STATUS
HASH/SHA
DADO_REAL_OU_DEMO
AÇÃO_RECOMENDADA
```

Mapear no mínimo:

- Dashboard;
- Hermes;
- Gateway;
- Catálogo;
- Políticas;
- Conectores;
- Abacus;
- Auditoria;
- Logs;
- autenticação/conta;
- modelos;
- ferramentas;
- serviços;
- healthchecks;
- custos/PPM;
- missões;
- evidências.

Inventário externo conhecido para conferir, não presumir como atual:

```text
HUB v0.4.0
MCP Gateway healthy
Catálogo healthy
102 ferramentas
Abacus RouteLLM ativo
145 modelos
/status 200
DarkAI
Lovable Proxy
Zendriver
Elite Gateway
MCP
OAuth Broker
Hermes
Arsenal Council
Artifacts Builder
```

Classificar cada item como:

```text
COMPROVADO_AGORA
HISTÓRICO
INFERIDO
NÃO_CONFIRMADO
```

---

# FASE 2 — COMPARAÇÃO VPS × GIT

Comparar o HUB na VPS com o HUB do `origin/main` atual.

Registrar para cada arquivo:

```text
PATH_RELATIVO
VPS_SHA256
GIT_SHA256
VPS_ONLY
GIT_ONLY
MODIFICADO
RUNTIME
GERADO
SENSÍVEL
CANDIDATO_CANÔNICO
```

Ignorar como código recuperável:

- `.env`;
- secrets;
- tokens;
- cookies;
- credenciais;
- `node_modules`;
- cache;
- sessões;
- uploads;
- logs rotativos;
- builds reproduzíveis;
- temporários;
- bancos locais.

Não ignorar silenciosamente: classificar.

## Decisão

### Caso A — Git completo

Se tudo canônico estiver no Git:

```text
GIT_COMPLETO
```

Não copiar nada da VPS.

### Caso B — Código útil somente na VPS

Copiar somente candidatos comprovados para a branch da missão, mantendo caminhos canônicos.

Para cada arquivo recuperado:

- finalidade;
- hash;
- origem;
- dependência;
- teste;
- motivo de versionamento.

Nunca copiar runtime ou segredo.

---

# FASE 3 — SUPABASE CLI E PROJETO

Verificar:

```powershell
supabase --version
npx supabase --version
```

## Se a CLI existir

Usar a existente.

## Se não existir

Preferir, nesta ordem:

1. `npx supabase`;
2. instalação local oficial no Windows;
3. somente se o ambiente local estiver realmente bloqueado, usar CLI já existente na VPS para inspeção.

Não copiar binário da VPS para o Windows.

Não instalar globalmente sem necessidade.

## Projeto

Localizar configurações existentes no repositório:

```text
supabase/config.toml
supabase/migrations
supabase/functions
```

Confirmar se o projeto já está vinculado.

Se a autenticação da CLI não estiver ativa, não pedir token no chat. Entregar ao Pivete o comando de login oficial e aguardar.

Não criar segundo projeto Supabase se já existir um projeto canônico.

---

# FASE 4 — MODELO MÍNIMO DE DADOS

Reaproveitar tabelas existentes quando equivalentes.

Criar somente lacunas comprovadas.

Modelo lógico desejado:

```text
hub_services
hub_missions
hub_mission_events
hub_evidence
hub_connectors
hub_policies
hub_health_snapshots
hub_provider_usage
```

Não criar tabela nova se já existir equivalente com outro nome.

## Requisitos

### `hub_services`

- serviço;
- ambiente;
- endpoint;
- health;
- versão;
- última verificação;
- fonte;
- evidência.

### `hub_missions`

- missão;
- criador;
- agente;
- alvo;
- estado;
- autorização;
- timestamps;
- branch/SHA;
- risco;
- rollback.

### `hub_mission_events`

- evento append-only;
- missão;
- tipo;
- status;
- mensagem sanitizada;
- timestamp;
- hash encadeado quando houver suporte existente.

### `hub_evidence`

- missão;
- tipo;
- URL/path;
- SHA/hash;
- revisão;
- origem;
- validada por;
- status.

### `hub_connectors`

Guardar metadados e estado de conexão, nunca segredos expostos ao frontend.

### `hub_provider_usage`

- rota;
- modelo;
- provider;
- latência;
- tokens;
- custo;
- erro;
- fallback;
- timestamp.

---

# FASE 5 — EDGE FUNCTIONS MÍNIMAS

Antes de criar, pesquisar equivalentes.

Nomes lógicos desejados:

```text
hub-read
hub-command
hub-health
hub-audit
hub-connectors
```

Os nomes físicos podem seguir o padrão canônico do repositório.

## `hub-read`

Somente leitura:

- serviços;
- missões;
- eventos;
- health;
- catálogo;
- modelos;
- ferramentas;
- custos;
- conectores.

## `hub-command`

Fluxo:

```text
autenticar
→ validar escopo
→ registrar auditoria
→ criar missão/fila
→ devolver mission_id
```

Não executar tarefa longa dentro da função.

## `hub-health`

Agregar healthchecks existentes com timeout e resultado sanitizado.

## `hub-audit`

Registrar eventos de operação sem secrets.

## `hub-connectors`

Iniciar/consultar conexão de contas usando OAuth Broker existente quando ele for canônico.

Não reimplementar OAuth Broker sem prova de necessidade.

---

# FASE 6 — FILA, REALTIME E EXECUTOR

Reaproveitar mecanismo existente de missões/Hermes quando possível.

Arquitetura desejada:

```text
Lovable envia comando
→ Edge Function valida
→ missão durável é criada
→ Hermes/VPS consome
→ eventos são gravados
→ Realtime atualiza cockpit
→ evidências e SHA fecham a missão
```

Se já existir fila funcional, integrar.

Se não existir:

- usar mecanismo Supabase compatível disponível no projeto;
- evitar cron de polling agressivo;
- definir idempotência;
- impedir missão duplicada;
- permitir retry controlado;
- registrar dead-letter ou estado de falha.

---

# FASE 7 — LOVABLE / BOTÃO HUB

O botão `HUB` existente deve abrir a nova superfície, não outro aplicativo concorrente.

Criar/adaptar:

```text
HUB / Visão Geral
HUB / Missões
HUB / Serviços
HUB / Modelos e Gateway
HUB / Ferramentas
HUB / Conectores
HUB / Políticas
HUB / Auditoria
HUB / Evidências
```

## Interface

Cada cartão deve exibir:

- nome humano;
- finalidade;
- estado;
- origem;
- ambiente;
- versão;
- última validação;
- evidência;
- agente responsável;
- pendência;
- próxima ação;
- rollback quando existir.

## Estados obrigatórios

```text
loading
empty
offline
degraded
unauthorized
error
real-data
demo-data
```

Dados demonstrativos devem ser marcados explicitamente.

Não apresentar números estáticos como runtime real.

## Compatibilidade

Manter `hub.centraldark.com` funcionando durante a transição.

A nova área pode consumir o motor atual pelas APIs já existentes.

Não mover backend apenas para acompanhar o frontend.

---

# FASE 8 — ROTAS E PROVIDERS

Mapear os aliases existentes antes de criar outros.

Meta desejada:

```text
/general-fast
/reasoning
/code
/review
/vision
/research
/cheap
/critical
```

Não implementar aliases novos se o gateway já possuir equivalentes.

Registrar por chamada:

- alias;
- modelo;
- provider;
- fallback;
- latência;
- tokens;
- custo;
- status;
- circuit breaker.

O frontend e o Hermes devem depender da rota da CentralDark, não do fornecedor individual.

---

# FASE 9 — TESTES

Executar testes existentes e adicionar somente lacunas.

## Testes mínimos

1. clone sincronizado e branch correta;
2. skill `lupa-bayesiana` carregada;
3. nenhuma segunda skill/HUB/backend criado;
4. migrations reproduzíveis;
5. RLS bloqueia usuário sem permissão;
6. `hub-read` não vaza dados privados;
7. `hub-command` rejeita autorização inválida;
8. missão duplicada é idempotente;
9. evento de missão aparece no Realtime;
10. Hermes/VPS recebe missão de teste sem ação destrutiva;
11. healthcheck possui timeout;
12. serviço offline não derruba o HUB inteiro;
13. dados demo são marcados;
14. tokens não aparecem no frontend/log/diff;
15. botão HUB abre a nova área;
16. rotas atuais continuam funcionando;
17. rollback local da migration é demonstrado;
18. diff não toca áreas fora do escopo;
19. revisão independente encontra ou falsifica o verde;
20. AutoLupa final atinge ponto fixo evidencial.

Usar somente missões fictícias/não destrutivas nos testes.

---

# FASE 10 — EXECUÇÃO GIT

Permitido:

- criar branch da missão;
- editar arquivos necessários;
- executar testes;
- gerar migrations;
- servir Supabase localmente quando possível;
- usar preview Lovable;
- commit;
- push apenas da branch;
- abrir PR draft;
- anexar relatório e evidências.

Não permitido nesta rodada:

- merge na main;
- force-push;
- reset destrutivo;
- apagar histórico;
- deploy público final;
- restart de produção;
- migrations irreversíveis em produção;
- alterar DNS/Caddy/PM2;
- expor secrets.

---

# FASE 11 — DOCUMENTAÇÃO CANÔNICA

Não depender do chat para continuidade.

Criar um único relatório:

```text
docs/RELATORIOS/AAAA-MM-DD-hub-control-plane-lovable-supabase.md
```

Atualizar documentos canônicos existentes quando necessário.

Não criar arquitetura paralela se já existir documento equivalente.

O relatório deve conter:

- objetivo;
- estado inicial;
- fontes;
- mapa;
- arquitetura decidida;
- caminhos;
- migrations;
- Edge Functions;
- contratos;
- Lovable;
- VPS;
- rotas;
- testes;
- diff;
- commits;
- PR;
- riscos;
- rollback;
- pendências;
- próxima ação.

---

# GATES DE PARADA

Retornar `BLOCKED` somente quando:

- fonte canônica é ambígua;
- skill canônica não é encontrada;
- working tree possui alterações conflitantes;
- falta autenticação necessária;
- projeto Supabase canônico não pode ser identificado;
- operação exige secret não disponível ao executor;
- VPS e Git divergem sem origem comprovável;
- migration alcançaria produção desconhecida;
- teste crítico falha após correção mínima;
- o agente não consegue provar o estado.

Não bloquear por:

- trabalho grande;
- necessidade de instalar CLI oficial;
- necessidade de usar agentes;
- necessidade de consumir tokens;
- necessidade de criar branch;
- necessidade de testar em paralelo;
- existência de código legado mapeável.

---

# AUTOLUPA FINAL

Antes do veredito, responder internamente:

1. Reaproveitamos o motor existente?
2. Criamos algo semanticamente duplicado?
3. A Edge Function está executando trabalho que deveria ficar na VPS?
4. Algum dado demo parece real?
5. Algum secret aparece no frontend, log ou diff?
6. O Lovable depende de provider específico em vez da rota CentralDark?
7. A missão sobrevive à troca de modelo?
8. O relatório permite retomar sem chat?
9. O executor autosselou o resultado?
10. O crítico independente revisou o mesmo SHA?
11. A branch contém apenas o escopo?
12. O rollback foi demonstrado?
13. O PR mostra testes e evidências?
14. O Pivete continua sendo a autoridade final?
15. Há alguma contradição material não fechada?

Se houver contradição, corrigir o mínimo e repetir a revisão.

---

# SAÍDA FINAL OBRIGATÓRIA

```text
VEREDITO: READY_FOR_PIVETE_REVIEW | BLOCKED

MODELO_ORQUESTRADOR:
MODELOS_EXECUTORES:
MODELO_CRÍTICO:
SKILL_CANÔNICA:
SKILL_PATH:
REMOTE:
ORIGIN_MAIN_BEFORE:
BRANCH:
HEAD_FINAL:
WORKING_TREE:
VPS_HUB_PATH:
GIT_HUB_PATH:
SUPABASE_PROJECT:
SUPABASE_CLI:
LOVABLE_PROJECT:
ARQUITETURA:
TABELAS_REUTILIZADAS:
TABELAS_CRIADAS:
MIGRATIONS:
EDGE_FUNCTIONS_REUTILIZADAS:
EDGE_FUNCTIONS_CRIADAS:
ROTAS_REUTILIZADAS:
ROTAS_CRIADAS:
ARQUIVOS_VPS_RECUPERADOS:
DADOS_DEMO_REMOVIDOS_OU_MARCADOS:
TESTES_TOTAL:
TESTES_PASS:
TESTES_FAIL:
REVISAO_INDEPENDENTE:
AUTOLUPA:
ROLLBACK:
COMMIT:
PUSH:
PR:
PREVIEW:
RELATORIO:
EVIDENCIAS:
RISCOS_RESIDUAIS:
PENDENCIAS:
PROXIMA_ACAO_MINIMA:
```

## Critério para `READY_FOR_PIVETE_REVIEW`

- branch publicada;
- PR draft aberto;
- testes definidos aprovados;
- nenhum secret;
- nenhum deploy público;
- relatório salvo;
- Lovable preview funcional;
- crítico independente concluído;
- MetaLupa final sem contradição material conhecida.

Pare após a entrega.

---

# FIO DA MISSÃO

```text
clone atual
→ skill canônica
→ inventário paralelo
→ VPS × Git
→ arquitetura Supabase/VPS/Lovable
→ implementação mínima
→ testes
→ revisão independente
→ AutoLupa
→ branch + PR + preview
→ Pivete decide
```
