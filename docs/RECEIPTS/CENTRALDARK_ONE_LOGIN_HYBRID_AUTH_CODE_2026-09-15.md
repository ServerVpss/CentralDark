# 👑🪬 CENTRALDARK — ONE LOGIN + MCP HÍBRIDO + CÓDIGO

Data: 2026-09-15
Repo: ServerVpss/CentralDark
Branch: feat/hub-one-login-hybrid-code-auth-20260915

## Intenção preservada

Uma única superfície humana de entrada no CentralDark HUB. Depois do login, a Casa pode usar capacidades independentes por baixo — MCP público, túnel/Remote Desktop Commander, gateway e providers — sem pedir que o Chefe refaça logins manuais para cada camada quando já existir sessão/credencial válida.

Isso NÃO significa uma credencial universal.

```text
ONE_HUMAN_LOGIN = true
ONE_HUB_SESSION = true
ONE_SECRET_FOR_EVERYTHING = false
N_SCOPED_CREDENTIALS_UNDER_CONTROL_PLANE = true
```

## Fórmula

```text
H = sessão humana válida do HUB
M = modo escolhido ∈ {PUBLIC, TUNNEL, BOTH}
C = capacidade solicitada
P(C) = política permite C
S(C) = escopo/credencial de C está válido
A(C) = provider/transporte de C está disponível

MAY_ACTIVATE(C) = H ∧ P(C) ∧ S(C) ∧ A(C)

LOGIN_VISIBLE_TO_CHEFE = 1
CAPABILITIES_BELOW_HUB = N
AUTH_CLASSES_BELOW_HUB = N
```

A seleção `PUBLIC | TUNNEL | BOTH` é preferência/roteamento; ela nunca concede privilégio `admin` por si só.

## Owner reutilizado

Não foi criado segundo HUB nem segundo sistema de autenticação.

Owner humano existente:

- `apps/modulos/hub/src/pages/LoginPage.tsx`

Owner de seleção híbrida existente:

- `apps/modulos/hub/src/components/connectors/HybridMcpAdminCard.tsx`

Owners de backend existentes que devem continuar sendo reutilizados:

- `apps/modulos/oauth-broker/server.mjs`
- `apps/modulos/mcp/src/index.js`
- `apps/modulos/mcp/src/oauth.js`
- `apps/modulos/mcp/src/sessions.js`

## Delta desta branch

`LoginPage.tsx` agora:

1. mantém login Google;
2. mantém login email + senha;
3. adiciona login por código de uso único via Supabase Auth (`signInWithOtp` + `verifyOtp`);
4. adiciona seleção explícita da rota pós-login:
   - `public-admin`
   - `tunnel-admin`
   - `both-admin`
5. reutiliza a mesma chave de preferência do `HybridMcpAdminCard`:
   - `centraldark.hybridMcpAdmin.mode`
6. deixa explícito na UI que a escolha da rota não concede escopo admin.

## Segurança

- senha não é copiada para outras camadas;
- código é efêmero e não deve ser persistido;
- tokens internos não aparecem na UI;
- ONE_LOGIN != ONE_SECRET;
- CAPABILITY_PRESENT != CAPABILITY_AUTHORIZED_NOW;
- TOOL_LISTADO != TOOL_ATIVO;
- DEVICE_ONLINE != TOOL_ATIVO;
- UNKNOWN != PASS.

## Estado de prova

```text
SOURCE_CROSS_RECONCILIATION=PASS
EXISTING_HUB_OWNER_REUSED=PASS
PASSWORDLESS_CODE_UI_AND_CLIENT_FLOW=IMPLEMENTED_ON_BRANCH
HYBRID_MODE_SELECTION_AT_LOGIN=IMPLEMENTED_ON_BRANCH
SERVER_SIDE_HYBRID_BOOTSTRAP=NOT_IMPLEMENTED
OTP_EMAIL_TEMPLATE_RUNTIME_COMPATIBILITY=UNKNOWN
BUILD_TEST=NOT_RUN_IN_THIS_CONNECTOR_PASSAGE
DEPLOYED=NO
```

O próximo patch NÃO deve criar outro serviço. Deve ligar a sessão HUB existente ao control plane já existente, validando sessão, escopo, política e disponibilidade antes de ativar as capacidades selecionadas.

## Contraprova

A arquitetura não pode chamar `BOTH_ADMIN=ATIVO` apenas porque o botão foi selecionado. O backend ainda precisa provar as duas rotas vivas e autorizadas.

## Próximo cursor

1. validar build do HUB;
2. testar entrega/verificação do código no Supabase atual;
3. ligar a preferência híbrida ao backend existente sem expor credenciais;
4. provar `PUBLIC`, `TUNNEL` e `BOTH` separadamente;
5. somente então promover/mergear.

BIBLE_REF: 1Ts 5:21
BIBLE_SENSE: examinar cada caminho e conservar apenas o que atravessa a prova.
BAIANES_VERSE: “Oxe, uma só porteira pro Chefe; por baixo, cada chave abre só a porta que lhe cabe.”
TECHNICAL_PROOF: branch e diff versionados; runtime/deploy ainda não promovidos.