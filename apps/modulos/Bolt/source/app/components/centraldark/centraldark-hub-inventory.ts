export type InventoryState = 'SOURCE_PROVED' | 'RUNTIME_PROBE' | 'PARTIAL' | 'GAP' | 'OPTIONAL_PLUGIN';

export type HubCapability = {
  id: string;
  label: string;
  state: InventoryState;
  owner: string;
  detail: string;
};

export type AccountSurface = {
  id: string;
  label: string;
  accountModel: string;
  quota: 'OBSERVABLE' | 'ADAPTER_REQUIRED' | 'NOT_APPLICABLE';
  detail: string;
};

export const hubCapabilities: HubCapability[] = [
  {
    id: 'CENTRALDARK_DESKTOP',
    label: 'CentralDark.exe / Electron',
    state: 'SOURCE_PROVED',
    owner: 'apps/modulos/Bolt/source',
    detail: 'Owner desktop canônico, instalador Windows, auto-update, SOL widget e cockpit.',
  },
  {
    id: 'CENTRALDARK_COCKPIT',
    label: 'Cockpit unificado',
    state: 'SOURCE_PROVED',
    owner: 'CentralDarkCockpitShell.client.tsx',
    detail: 'Sidebar, workspace, status, owner map e sinais observáveis já existem no mesmo app.',
  },
  {
    id: 'SOL_WIDGET',
    label: 'SOL / HUD flutuante',
    state: 'SOURCE_PROVED',
    owner: 'app/routes/sol-widget.tsx + electron/main/ui/window.ts',
    detail: 'Janela always-on-top, móvel, redimensionável e com bounds persistidos.',
  },
  {
    id: 'OMNI_ROUTER',
    label: 'Omni Router',
    state: 'RUNTIME_PROBE',
    owner: 'electron/main/index.ts',
    detail: 'Health probe já exposto pelo bridge CentralDark.',
  },
  {
    id: 'SCREENPIPE',
    label: 'Screenpipe',
    state: 'RUNTIME_PROBE',
    owner: 'resources/runtime/manifest.json',
    detail: 'Sensor local opcional; health probe já existe sem virar autoridade.',
  },
  {
    id: 'HERMES',
    label: 'Hermes',
    state: 'PARTIAL',
    owner: 'resources/runtime/manifest.json',
    detail: 'Sidecar previsto no capsule; bundle_status continua UNKNOWN no contrato atual.',
  },
  {
    id: 'DESKTOP_COMMANDER',
    label: 'Remote Desktop Commander',
    state: 'SOURCE_PROVED',
    owner: 'resources/runtime/manifest.json',
    detail: 'Modelo multi-account isolado com perfis principal e conta2 já cristalizado.',
  },
  {
    id: 'MCP',
    label: 'MCP CentralDark',
    state: 'SOURCE_PROVED',
    owner: 'apps/modulos/mcp',
    detail: 'MCP é braço do mesmo organismo; runtime vivo precisa de probe próprio.',
  },
  {
    id: 'GITHUB',
    label: 'GitHub',
    state: 'SOURCE_PROVED',
    owner: 'app/routes/api.github-stats.ts + GitHub workflows',
    detail: 'Estatísticas autenticadas e automações do repositório já existem.',
  },
  {
    id: 'DEPENDABOT',
    label: 'Dependabot',
    state: 'SOURCE_PROVED',
    owner: '.github/dependabot.yml',
    detail: 'Sensor de delta de dependências. Não é engine de analytics; alimenta o HUD como evento do ciclo.',
  },
  {
    id: 'CODERABBIT',
    label: 'CodeRabbit',
    state: 'SOURCE_PROVED',
    owner: '.coderabbit.yaml + scripts/coderabbit-bridge.mjs',
    detail: 'Revisor/sensor de PR; mantém papel de review, sem autoridade de runtime.',
  },
  {
    id: 'OPENAI',
    label: 'OpenAI / ChatGPT',
    state: 'SOURCE_PROVED',
    owner: '@ai-sdk/openai + connectors',
    detail: 'Provider e conectores existem; telemetria de plano/limite por conta ainda requer adapter autorizado.',
  },
  {
    id: 'ANTHROPIC',
    label: 'Anthropic / Claude',
    state: 'SOURCE_PROVED',
    owner: '@ai-sdk/anthropic',
    detail: 'Provider existe no desktop; harness Claude Code/account quota ainda não está unificado no HUD.',
  },
  {
    id: 'GEMINI',
    label: 'Google Gemini',
    state: 'SOURCE_PROVED',
    owner: '@ai-sdk/google',
    detail: 'Provider existe no desktop; conta/limite precisa de adapter próprio.',
  },
  {
    id: 'CODEX_VSCODE',
    label: 'Codex / VS Code',
    state: 'PARTIAL',
    owner: 'desktop + editor/workbench',
    detail: 'Editor, terminal, Git e workbench existem; harness/conta/limites do Codex ainda não estão consolidados.',
  },
  {
    id: 'BROWSER',
    label: 'Browser / navegação',
    state: 'PARTIAL',
    owner: 'Electron + renderer',
    detail: 'Superfície web existe; painel único de permissões/sessões/cookies ainda não foi consolidado no CentralDark.exe.',
  },
];

export const accountSurfaces: AccountSurface[] = [
  { id: 'GMAIL', label: 'Gmail', accountModel: 'OAuth no Contas / Hub existente', quota: 'NOT_APPLICABLE', detail: 'Conta Gmail já pertence ao oauth-broker canônico; leitura/envio autorizado e notificações humanas reutilizam esse owner, sem criar mail-hub paralelo.' },
  { id: 'CHATGPT', label: 'ChatGPT', accountModel: 'multi-account desejado', quota: 'ADAPTER_REQUIRED', detail: 'Plano, uso restante, reset e capacidades precisam de fonte autorizada.' },
  { id: 'CLAUDE_CODE', label: 'Claude Code', accountModel: 'harness por sessão', quota: 'ADAPTER_REQUIRED', detail: 'Unificar sessão, capacidades e limites sem raspar UI.' },
  { id: 'GEMINI', label: 'Gemini', accountModel: 'provider/account', quota: 'ADAPTER_REQUIRED', detail: 'Provider existe; conta e quota ainda não entram no cockpit.' },
  { id: 'CODEX_VSCODE', label: 'Codex / VS Code', accountModel: 'workspace + account', quota: 'ADAPTER_REQUIRED', detail: 'Workbench existe; falta adapter de conta/limite/harness.' },
  { id: 'DESKTOP_COMMANDER_1', label: 'Desktop Commander · principal', accountModel: 'isolated HOME', quota: 'NOT_APPLICABLE', detail: 'Perfil runtime já declarado no capsule.' },
  { id: 'DESKTOP_COMMANDER_2', label: 'Desktop Commander · conta2', accountModel: 'isolated HOME', quota: 'NOT_APPLICABLE', detail: 'Segundo perfil runtime já declarado no capsule.' },
];

export const hubGaps: HubCapability[] = [
  { id: 'PROVIDER_USAGE_ADAPTERS', label: 'Adapters de uso/limites por provedor', state: 'GAP', owner: 'a definir por capability-contract-router', detail: 'Necessário para mostrar plano, uso restante, reset e rate limits sem inferência.' },
  { id: 'UNIFIED_ACCOUNT_REGISTRY', label: 'Registro unificado de contas', state: 'GAP', owner: 'estender oauth-broker; não criar segundo auth', detail: 'Precisa ligar identidades, sessões e capabilities em um catálogo único. Gmail permanece neste owner existente; não criar segundo auth/mail hub.' },
  { id: 'CLAUDE_CODE_HARNESS', label: 'Harness Claude Code', state: 'GAP', owner: 'capability-contract-router', detail: 'Adapter explícito para sessão/capabilities; não substituir provider Anthropic existente.' },
  { id: 'CODEX_HARNESS', label: 'Harness Codex / VS Code', state: 'GAP', owner: 'capability-contract-router', detail: 'Adapter explícito para workspace, sessão e telemetria.' },
  { id: 'MCP_LIVE_SNAPSHOT', label: 'Snapshot MCP vivo no desktop', state: 'GAP', owner: 'Electron bridge estreito', detail: 'Expor health/toolCount/version por IPC tipado, sem liberar Node ao renderer.' },
  { id: 'DEPENDABOT_EVENT_FEED', label: 'Feed Dependabot → HUD', state: 'GAP', owner: 'GitHub adapter', detail: 'Contar PRs/deltas e mudanças de dependência como eventos observáveis.' },
  { id: 'CODERABBIT_EVENT_FEED', label: 'Feed CodeRabbit → HUD', state: 'GAP', owner: 'coderabbit bridge', detail: 'Projetar findings/reviews no HUD sem promover review a verdade runtime.' },
  { id: 'HUD_RECEIPT_STREAM', label: 'Receipt stream do HUD', state: 'GAP', owner: 'brain-memory / receipts', detail: 'Persistir mudanças observadas com timestamp, source_ref e causa.' },
];

export const optionalAnalyticsPlugins: HubCapability[] = [
  { id: 'POSTHOG', label: 'PostHog', state: 'OPTIONAL_PLUGIN', owner: 'plugin externo opcional', detail: 'Product analytics, feature flags, errors e LLM analytics. Não obrigatório para o core.' },
  { id: 'DATADOG', label: 'Datadog', state: 'OPTIONAL_PLUGIN', owner: 'plugin externo opcional', detail: 'Observabilidade de produção. Preview e dependente da conta/região suportada.' },
];
