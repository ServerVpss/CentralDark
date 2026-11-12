# CentralDark — Instinto Superior

Corpo visual final da CentralDark. Este repositório reúne a landing trilíngue, autenticação Supabase, sala administrativa, cockpit de estado, comparação de repositório, Hermes, exportação e inventário do roteador.

## Autoridade e publicação

- Código visual canônico: `ServerVpss/CentralDark/apps/instinto-superior`.
- Contratos, runtime, governança e código visual convergem no mesmo repositório: `ServerVpss/CentralDark`.
- `ServerVpss/centraldark-instinto-superior` + Lovable: projeção/editor compatível; não são segunda autoridade nem owner paralelo.
- URL conhecida: <https://centraldark-instinto-superior.lovable.app>.

Uma URL conhecida ou uma sincronização declarada não prova que o HEAD está publicado. O cockpit só promove deploy quando consegue medir e comparar os SHAs; ausência de fonte aparece como `UNKNOWN`.

## Desenvolvimento

Requer Node.js 22 e npm.

```sh
npm ci
npm run lint
npm run build
npm run dev
```

## Rotas materiais

- `/`: corpo visual e doutrina.
- `/auth` e `/auth/callback`: e-mail/senha e OAuth PKCE.
- `/reset-password`: recuperação e troca de senha.
- `/cockpit`: entrada e estado público sem fingir runtime.
- `/sala-controle`: superfície autenticada e autorização administrativa real.
- `/repositorio`: leitura e comparação estrutural determinística do GitHub.
- `/roteador`: capacidades declaradas do Omni Router e probes vivos separados.

Veja `docs/CONVERGENCIA-CAPACIDADES-2026-09-25.md` para a matriz de reaproveitamento.


## Auth canônica — 18/10/2026 · validação de login

- **Projeto Supabase único aprovado:** lyoigsqluyktoclwdaft. Não criar projeto alternativo, não apontar para projeto Hermes histórico e não inserir valores de chaves em Git, logs ou receipts.
- **Contraprova de ambiente:** o bundle SSR/cliente servido em 18/10 já contém a referência do projeto, com variáveis VITE no build e aliases privados de runtime. Isso é independente do login válido.
- **Erro medido na API Auth:** POST /auth/v1/token → HTTP 400, grant_type=password, error_code=validation_failed. A documentação Supabase define esse código como parâmetros em formato inesperado. Não confundir com ausência de env, indisponibilidade global ou credenciais comprovadamente incorretas.
- **Menor delta no owner:** src/routes/auth.tsx normaliza e valida e-mail, mantém senha intacta, preserva autorização e Supabase Auth, traduz erros de validação/rate limit no formulário e captura falhas inesperadas sem derrubar a página. Não adiciona retries automáticos.
- **Prova pendente:** login E2E com conta autorizada, sessão SSR e RLS/role. Não transportar senha nem sessão do CHEFE para logs e testes. HTTP 200 não comprova login.
- **Questões separadas:** 21 avisos security_definer_view do Advisor e aviso de cota/grace-period exigem auditoria própria, sem alterar DDL, RLS ou faturamento neste fix.

## Contraprova de autenticação na VPS — 12/10/2026

- **Causa medida:** o serviço `centraldark-instinto-superior-web.service` estava ativo, mas seu processo Node não recebia `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`; middleware `src/integrations/supabase/auth-middleware.ts` exige ambas e o journal registrou `Missing Supabase environment variable(s)`. A checagem de admin/RLS permanece inalterada.
- **Fonte existente:** `.env.production.local` na VPS, modo 0600, já continha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` públicos do projeto Supabase canônico; nenhum valor foi transportado à main.
- **Menor delta:** gerar `/etc/centraldark/instinto-superior-auth-public.env` (0600, apenas aliases `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`, sem service-role) e adicionar drop-in `/etc/systemd/system/centraldark-instinto-superior-web.service.d/10-supabase-public.conf` com EnvironmentFile. Unit original intacta. Reinício somente do cockpit, não do MCP/Hermes.
- **Readback:** `ActiveState=active`, `MainPID=128667`, ambiente novo contém as duas variáveis e nenhuma SERVICE_ROLE; `/auth`, `/auth/callback`, `/sala-controle` HTTP 200; nenhum novo `Missing Supabase` desde a inicialização do novo PID às 17:28:18 UTC. **HTTP 200 não comprova login admin.**
- **Rollback:** remover somente drop-in `10-supabase-public.conf` e env derivado `instinto-superior-auth-public.env`, `systemctl daemon-reload`, reiniciar somente a unit do cockpit. Não mexer na `.env.production.local` nem em cookies.
- **NEXT_CURSOR:** reentrar pelo navegador em `/auth`, testar chamada SSR com sessão verdadeira e confirmar `admin=true`. O erro `chrome-extension://.../inject-scripts/set-global.js` é da extensão Chrome e deve ser testado separadamente; não é prova da causa server-side.
- **Reality Judge:** `RUNTIME_ENV=PASS`, `SSR_ROUTES=PASS`, `SESSION_SERVER_FN=UNKNOWN`, `ADMIN_LOGIN_E2E=UNKNOWN`, `EXTENSION_ERROR=SEPARATE`, `GLOBAL_FIXED_POINT=FALSE`.


## 🪬 Manifesto incremental do harness privado

O contrato evolutivo, os owners, o catálogo da Forja Viva, a gaveta histórica, a migração do HUD e o NEXT_CURSOR ficam em [INSTINTO-MANIFESTO-INCREMENTAL.md](docs/INSTINTO-MANIFESTO-INCREMENTAL.md). Acrescentar deltas nesse mesmo documento; não criar manifesto paralelo. Os snapshots de inventário não provam runtime ou deploy.


## Túnel OpenAI na Forja Linux — 2026-11-01T19:13:55.777094+00:00

@owner: instinto.admin.mcp; @code_ref: src/lib/mcp-admin.functions.ts; src/components/central/McpAdminIntegrado.tsx
@last_updated: 2026-11-01T19:13:55.777094+00:00
O Admin MCP reutiliza autenticação Supabase e user_roles admin para receber CONTROL_PLANE_API_KEY. O servidor habilitado por CENTRALDARK_LOCAL_TUNNEL_ENABLED=1 grava atomicamente ~/.config/tunnel-client/centraldark-casa.env com modo 0600; o observador systemd do mesmo usuário inicia centraldark-mcp-tunnel.service. O valor nunca é retornado, logado ou enviado ao Vault remoto. O Cofre Supabase permanece dono das outras credenciais; isto configura o owner local específico do túnel. Sem sessão/admin, sem escrita. Readiness não equivale a chamada pelo plugin. Ambiente Linux: checkout medido, sem impor /root/CentralDark.
Estado: implementação local, testes/runtime em validação; nenhuma promoção VPS. NEXT_CURSOR: build, HTTP, acesso admin e chave real, readyz e chamada no plugin.

@code_ref: src/lib/cockpit.functions.ts; @last_updated: 2026-11-01T19:22:05.143254+00:00. Inventário executa ss/pgrep no Linux nativo, sem exigir WSL/PowerShell. CASA é papel explícito, não deduzido de hostname. TCP/UDP e processo STDIO mantêm provas separadas de execução funcional.

Rotação de chave: após gravação privada, a função administrativa solicita restart exclusivamente da unit centraldark-mcp-tunnel.service (argumentos fixos, sem segredo). Falha no restart retorna SAVED_RESTART_PENDING; nunca retorna erro que finja que a gravação não ocorreu.


## Omni Router nativo conectado — 2026-11-01T19:41:24.979255+00:00

@code_ref: src/lib/cockpit.functions.ts; src/components/central/StatusPanel.tsx
@last_updated: 2026-11-01T19:41:24.979255+00:00
Owner API existente: apps/modulos/elite-gateway/scripts/centraldark_omni_router.py, iniciado pelo scripts/launch_omni_router_direct.py no Linux, loopback8099. Dependências isoladas na .venv do módulo, usando somente FastAPI/uvicorn/pydantic/requests do manifesto atual. Token privado no .env canônico e consumido server-side pelo cockpit apenas para o owner API loopback; não enviado a destinos externos ou navegador. Health do cockpit aponta ao mesmo owner8099, substituindo binding Windows9101 no ambiente local. Grafo/receipts seguem NOT_REVALIDATED quando só projetam arquivos; heartbeat mede processo, não inferência. Próxima prova: rotas reais, negação sem token, readback pelo cockpit e providers separados.

Screenpipe Linux: binário npm oficial da mesma versão0.4.51 já fixada no projeto; serviço nativo screenpipe.service do usuário, loopback3030 e dados privados em ~/.screenpipe. Captura local, sem cloud sync e telemetria desligada. Sensor identifica Forja Linux; no_input_device/disabled/no_audio não são rotulados como áudio detectado. Frames e áudio precisam de timestamps/contagem reais; health200 sozinho não prova captura.

## Regressão dos botões de sincronização — 2026-11-01T19:58:27.552347+00:00
@code_ref: src/lib/sync.functions.ts; src/components/central/AutoSyncButton.tsx
@last_updated: 2026-11-01T19:58:27.552347+00:00
Botão Main mede sem publicar e retorna conflito se SHAs diferem; consulta bem-sucedida não significa convergência. Casa/Forja reutiliza syncCasaMain, bloqueia drift antes de merge/push e não adiciona arquivos automaticamente. Seleção/publicação de arquivos permanece com writer-safe-push-main existente. O botão antes rotulado "Sincronizar Tudo" agora diz "Sincronizar Casa/Main": continua usando o alvo local, sem acionar VMware por trás. VPS/VMware continua ação explícita e bloqueia checkout remoto sujo. O painel reaproveita a leitura `centraldark/estado-vivo`: compara SHA de `main` com SHA da VPS apenas quando ambos foram medidos; mostra SIM, NÃO ou NÃO VERIFICADO. A leitura do rastreador só pode representar a Casa Windows se tiver origem Windows confirmada; um checkout Linux não substitui a leitura da Casa. Mesma revisão Git não é prova de deploy nem de ausência de arquivos locais. Triton fornece inferência de modelos de IA e não realiza Git/SSH sync. Sequência all interrompe no primeiro conflito, sem alcançar VPS. Regressão exige clique, readback do host e contraprova; navegação não é execução do motor.
