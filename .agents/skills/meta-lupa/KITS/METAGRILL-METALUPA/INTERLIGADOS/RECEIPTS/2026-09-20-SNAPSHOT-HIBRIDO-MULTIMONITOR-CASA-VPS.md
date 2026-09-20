# 🖥️🪬 Snapshot híbrido — Casa + VPS + múltiplos monitores/workspaces

🔗 !CENTRALDARK → !># INTERLIGADOS → REALIDADE = JUIZ

## Intenção do CHEFE

Preservar a arquitetura visual e operacional mostrada nesta sessão como direção única da CentralDark: um sistema operacional agêntico próprio, flexível e híbrido, com Casa + VPS + agentes + MCP/Control API + Desktop/bridges, sem complexidade operacional espalhada para o usuário.

## Snapshot visual recebido nesta sessão

As imagens fornecidas pelo CHEFE mostram, como matéria de arquitetura/UX:

- uso simultâneo de múltiplos monitores;
- múltiplas áreas de trabalho virtuais do Windows;
- navegador, terminais, exploradores, GitHub, MCP/Admin e ferramentas coexistindo;
- tray/bridge com menu operacional e estado visual ONLINE_DECLARADO;
- CentralDark concebida como cockpit único para Builder, Runtime, PRs, Evidence, VPS, Hub, Desktop, Voz, Drive e Automação;
- objetivo de reduzir a necessidade de operar manualmente janelas e ferramentas dispersas;
- coexistência com o Windows em vez de exigir substituição imediata do SO hospedeiro.

As imagens são INPUT_DE_ARQUITETURA_E_UX. Elas não são prova automática de que cada módulo visualizado esteja implementado ou conectado em runtime.

## Contrato arquitetural cristalizado

CENTRALDARK_LOGICAL_KERNEL = camada operacional agêntica.  
WINDOWS_HOST = hospedeiro local atual.  
VPS_KERNEL_RUNTIME = braço remoto/sempre ligado.  
MCP_CONTROL_API = rota machine-facing única.  
DESKTOP_BRIDGE = braço humano-controlado para GUI quando necessário.  
HERMES = executor autorizado.  
MULTI_MONITOR = superfície observável.  
VIRTUAL_DESKTOPS = workspaces observáveis.  
SNAPSHOT = estado temporal + proveniência + evidência, não verdade eterna.

## Um sistema, várias superfícies

A topologia desejada é:

CHEFE/INTENÇÃO  
→ CentralDark cockpit  
→ contrato único  
→ router/capability owner  
→ MCP/Control API  
→ Casa e/ou VPS conforme capability  
→ agente/bridge necessário  
→ receipt/evidence  
→ snapshot temporal  
→ Reality Judge.

A escolha Casa/VPS deve ser por capacidade, disponibilidade, segurança, custo e necessidade de interação humana, não por criação de dois sistemas independentes.

ONE_SYSTEM_ONLY=true.  
ONE_CONTROL_DIRECTION=true.  
REUSE_BEFORE_CREATE=true.  
NO_PARALLEL_KERNEL=true.  
NO_PARALLEL_ADMIN=true.  
NO_PARALLEL_CONTROL_PLANE=true.

## Multi-monitor e workspaces

O contrato deve aceitar N monitores e N workspaces sem codificar um layout fixo.

Cada snapshot de Desktop, quando a capacidade estiver implementada e medida, deve poder registrar:

- timestamp;
- host/device/session;
- monitor count;
- monitor geometry e scaling quando disponíveis;
- workspace/virtual-desktop identity quando observável;
- janelas/processos relevantes;
- foreground/focus quando permitido;
- bridge/session owner;
- runtime SHA/versão aplicável;
- evidência/receipt;
- classificação temporal CURRENT/HISTORY.

A topologia de monitor não deve ser tratada como constante.

MONITOR_LAYOUT_NOW != PERMANENT_LAYOUT.  
UI_TRUNCATED != CONFIG_INVALID.  
SCREENSHOT_PRESENT != RUNTIME_PROVEN.  
ONLINE_DECLARADO != END_TO_END_PROVEN.

## Snapshot total sem virar vigilância caótica

“Snapshot total” significa capturar o estado operacional necessário para continuidade e depuração, com proveniência e limites, e não despejar continuamente todo conteúdo de tela sem necessidade.

A arquitetura deve preferir metadados e evidência mínima suficiente; captura visual detalhada entra quando a missão exige e quando o canal humano/bridge autoriza.

SNAPSHOT_REQUIRED_FIELDS = identidade temporal + superfície + versão/SHA + estado + receipt.  
SNAPSHOT_IS_APPEND_ONLY_EVIDENCE = preferido para histórico.  
CURRENT_OVER_HISTORY=true.  
UNKNOWN_IS_NOT_PASS=true.

## Estado vivo medido em 2026-09-20

### Bridge remoto

CASA device SEGREDO:
- status=online;
- auth_token=valid;
- app_version=0.2.48;
- session_id=97adfd95-35ad-4dfc-ba00-ae887443471a.

VPS device vmi3256920:
- status=online;
- auth_token=valid;
- app_version=0.2.51;
- session_id=6f945790-3015-4c2b-ae19-6f3cc22abd93.

### Casa

C:\CentralDark HEAD medido:
7d4fdaf54f8e0b45da10e20fb852d6eb4b7213a1.

Foram observados processos Hermes e múltiplos processos Node. Isso prova processos presentes, não prova por si só o Fixed Point global.

### VPS

/root/CentralDark HEAD medido:
f3c00f9c73c6691ef044bb237623e88ce57aaf38.

Serviços observados ativos incluem:
- GitHub Actions Runner da CentralDark;
- centraldark-dc-remote profiles conta1 e conta2;
- bridges públicos CentralDark via socat;
- openai-tunnel-client.

Portas observadas incluem listeners locais/públicos associados a 3000, 3100, 8000, 8080 e 8787.

O working tree da VPS está sujo com modificações e arquivos não rastreados. Portanto VPS_CURRENT_DIRTY=true e nenhuma sincronização destrutiva/checkout forçado foi executada.

## Contabo — estado da integração

A VPS vmi3256920 está online e operacional como máquina observada.

Porém o adapter canônico de provider, medido no runtime atual da VPS, retornou:

PROVIDER_CREDENTIALS_STATUS=PASS_AS_DIAGNOSTIC.  
CONTABO_CLIENT_ID=MISSING.  
CONTABO_CLIENT_SECRET=MISSING.  
CONTABO_API_USER=MISSING.  
CONTABO_API_PASSWORD=MISSING.

A leitura oficial allowlisted contabo/instances.list retornou CONTABO_CREDENTIALS_MISSING.

Conclusão temporal:

VPS_ONLINE=true.  
CONTABO_PROVIDER_API_CONNECTED=false.  
CONTABO_ACCOUNT_INSTANCE_LIST=UNKNOWN.  
CONTABO_CONTROL_PLANE_READ=BLOCKED_BY_MISSING_RUNTIME_CREDENTIALS.

Nenhum segredo foi solicitado, exibido ou copiado para Git.

## Divergência atual

PR_MOTHER #1562 HEAD anterior a este receipt:
8d51f8d07b51aec39783cbec15dc2e24cbca801e.

PR_CHILD #1597:
1486cf565dea87b3195a6d1105c9a343b8f67fec.

Casa e VPS ainda não estão no mesmo HEAD canônico.

GLOBAL_SAME_HEAD=false.  
GLOBAL_FIXED_POINT=false.  
MAIN_PUSH_ALLOWED_ONLY_AFTER_GATES=true.

## Guardrail de promoção

O pedido do CHEFE autoriza a direção e a cristalização, mas REALIDADE continua julgando promoção.

Não promover para main enquanto o SAME-HEAD obrigatório estiver vermelho/queued. Não sobrescrever o working tree sujo da VPS. Não usar reset --hard nem force-push para fabricar convergência.

MERGE_POLICY = INTENT_AUTHORIZED → AUTO_SQUASH_IF_CLEAN → MAIN.  
DIRTY_RUNTIME = PRESERVE → INVENTORY → RECONCILE → PROVE → DEPLOY.

## NEXT_CURSOR

1. manter este snapshot no PR-MÃE como ledger;
2. fechar gates vermelhos atuais sem afrouxá-los;
3. obter SAME-HEAD CI verde;
4. promover pela política canônica;
5. reconciliar VPS dirty tree sem perda;
6. sincronizar Casa e VPS ao SHA promovido;
7. provar package/launch Desktop;
8. provar monitor/workspace discovery em runtime antes de declarar suporte completo;
9. conectar Contabo provider API somente pelo secret store/runtime autorizado;
10. executar T1 Casa + VPS + MCP/Control API + bridge;
11. emitir novo snapshot CURRENT e mover este para HISTORY.

ROUTE_INTEGRATED=true.  
MULTI_MONITOR_ARCHITECTURE_PRESERVED=true.  
HYBRID_CASA_VPS_CONTRACT_PRESERVED=true.  
CONTABO_STATUS_MEASURED=true.  
MAIN_PROMOTED=false.  
VPS_MUTATED=false.  
GLOBAL_FIXED_POINT=false.
