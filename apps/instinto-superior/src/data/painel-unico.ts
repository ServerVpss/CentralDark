// Inventário estático (só nomes, contagens e contratos) da consolidação no cockpit.
// Nada aqui comprova execução: estado vivo vem das medições; o que não tem fonte é UNKNOWN.
// Fontes: pasta Cristal 20260913 (Graph Lens), vault Obsidian HUD, painéis CentralDark históricos.

export type DonoVisual = "Admin" | "Sistema" | "Hermes" | "Downloads" | "Design";

export const MAPA_OWNERS: Array<{
  capacidade: string;
  fisico: string;
  visual: DonoVisual;
  estado: "PASS" | "UNKNOWN" | "AUTH_REQUIRED";
  nota: string;
}> = [
  {
    capacidade: "Usuários e papéis",
    fisico: "Supabase user_roles",
    visual: "Admin",
    estado: "PASS",
    nota: "Papel verificado no servidor.",
  },
  {
    capacidade: "Módulos",
    fisico: "apps/modulos (catálogo)",
    visual: "Admin",
    estado: "PASS",
    nota: "Lista, ordem e status.",
  },
  {
    capacidade: "Contas / Conexões (OAuth)",
    fisico: "apps/modulos/oauth-broker",
    visual: "Admin",
    estado: "UNKNOWN",
    nota: "Owner canônico das contas; sem medição viva aqui.",
  },
  {
    capacidade: "Hub de credenciais",
    fisico: "apps/modulos/hub",
    visual: "Admin",
    estado: "UNKNOWN",
    nota: "Entrada humana única de providers, chaves e rotas.",
  },
  {
    capacidade: "Cofre / Segurança",
    fisico: "Hub + papéis",
    visual: "Admin",
    estado: "UNKNOWN",
    nota: "Movido do Sistema para o Admin.",
  },
  {
    capacidade: "Saldo e consumo",
    fisico: "Hub (quando houver fonte)",
    visual: "Admin",
    estado: "AUTH_REQUIRED",
    nota: "Sem fonte autorizada: não inventa saldo.",
  },
  {
    capacidade: "Mega Painel / eventos / receipts",
    fisico: "Ledger + GitHub",
    visual: "Sistema",
    estado: "UNKNOWN",
    nota: "Atividade comprovada do repositório.",
  },
  {
    capacidade: "API, heartbeat, One Heart",
    fisico: "api.centralldark.com :9100",
    visual: "Sistema",
    estado: "UNKNOWN",
    nota: "Medido pela aba Runtime a cada 5s.",
  },
  {
    capacidade: "MCP",
    fisico: "apps/modulos/mcp",
    visual: "Sistema",
    estado: "UNKNOWN",
    nota: "Ver ferida do entrypoint OAuth abaixo.",
  },
  {
    capacidade: "Live Fabric / ARM Router / Graph",
    fisico: "apps/modulos/graph-panel e fabrics",
    visual: "Sistema",
    estado: "UNKNOWN",
    nota: "Projeção do que já existe.",
  },
  {
    capacidade: "Infraestrutura (VPS, Caddy, CI, Supabase)",
    fisico: "VPS + GitHub Actions",
    visual: "Sistema",
    estado: "UNKNOWN",
    nota: "CPU e saúde na aba Runtime.",
  },
  {
    capacidade: "Hermes Core 24/7 (:8899)",
    fisico: "apps/modulos/HERMES-CORE",
    visual: "Hermes",
    estado: "UNKNOWN",
    nota: "Executor; modelo é motor substituível.",
  },
  {
    capacidade: "Gateway, Serve, Webhook, missões, critic, Oracle loop",
    fisico: "HERMES-CORE",
    visual: "Hermes",
    estado: "UNKNOWN",
    nota: "Tudo do executor fica no botão Hermes.",
  },
  {
    capacidade: "Hermes Desktop e pacote",
    fisico: "public/downloads (manifesto)",
    visual: "Hermes",
    estado: "UNKNOWN",
    nota: "Execução física exige prova própria.",
  },
  {
    capacidade: "ZIP, instaladores, checksums",
    fisico: "Download Center",
    visual: "Downloads",
    estado: "UNKNOWN",
    nota: "Somente artefatos.",
  },
  {
    capacidade: "Skins, tokens, tipografia, previews",
    fisico: "DesignCenter",
    visual: "Design",
    estado: "PASS",
    nota: "Somente aparência.",
  },
];

export const FERIDA_MCP = {
  causa: "FULL_OAUTH_IMPLEMENTED_BUT_RUNTIME_ENTRYPOINT_BYPASSES_IT",
  resumo:
    "O OAuth completo já existe no código do MCP (OAuth 2.1, registro dinâmico, PKCE). O serviço centraldark-native-mcp-http estava rodando o entrypoint reduzido dist/mcp-server.js --http --compact --admin, que não monta essas rotas; o entrypoint oficial completo é dist/index.js.",
  rotas: [
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-authorization-server",
    "/register",
    "/authorize",
    "/token",
    "/oauth/start",
    "/oauth/callback",
  ],
  arquivos: [
    "apps/modulos/mcp/src/index.js",
    "apps/modulos/mcp/src/oauth.js",
    "apps/modulos/mcp/src/sessions.js",
    "apps/modulos/oauth-broker/server.mjs",
    "apps/modulos/hub/db/migrations/004_oauth_connectors.sql",
  ],
  acao: "Mesmo MCP, mesma porta :9100, mesmo domínio: trocar o entrypoint reduzido pelo completo. Sem segundo MCP. A correção vive no repositório CentralDark e na VPS, não neste cockpit.",
  regra:
    "Revalidar o unit e o processo :9100 antes de alterar; só depois contraprovar as rotas por fora.",
  estado: "UNKNOWN" as const,
};

export const CRISTAL = {
  pasta: "CentralDark-Capability-Cristal-20260913 · AGENTIC-SENIOR-GRAPH-LENS",
  leis: [
    "UNKNOWN_IS_NOT_PASS",
    "ACTION_IS_NOT_PROOF",
    "CURRENT_GT_HISTORY",
    "GENERATED != CANONICAL",
    "MODEL_IS_REPLACEABLE",
    "AGI_LIKE = meta de engenharia, não alegação",
  ],
  capacidades: { total: 175, EXISTING: 43, PARTIAL: 51, NEW_DELTA: 69, GAP: 10, VERIFY_LIVE: 2 },
  prioridades: { P0: 101, P1: 61, P2: 13 },
  dominios: [
    ["Media", 16],
    ["Cognitive", 16],
    ["Graph", 14],
    ["MCP", 13],
    ["Language", 10],
    ["Cockpit", 10],
    ["Agents", 10],
    ["Prompt", 10],
    ["Memory", 9],
    ["AI", 7],
    ["Runtime", 7],
    ["Agentic", 5],
    ["Trace", 5],
    ["Git", 6],
    ["QA", 6],
    ["Security", 4],
    ["Deploy", 3],
    ["Observability", 3],
    ["Accounts", 3],
    ["Database", 3],
    ["CI", 3],
    ["Autonomy", 3],
    ["Semantic", 4],
    ["Evaluation", 2],
    ["UI", 2],
    ["Operations", 1],
  ] as Array<[string, number]>,
  arsenal: {
    itens: 50,
    pacote: "4.0 / 4",
    runtime: "2.12 / 4",
    leitura: "Pacote completo no papel; evidência de runtime ainda parcial.",
  },
  placar: {
    antes: 8.21,
    depois: 8.56,
    nota: "Competência com base em evidências, não certificação.",
  },
  graphLens: {
    ativos:
      "27-GRAPH-AGENTIC-LENS-SITE/patch-candidate (graph-lens.js, graph-lens.css, layout-core.mjs, sample-graph.json)",
    regras: [
      "Anéis radiais com núcleo protegido e espinha primária",
      "Curvas Bézier contornando o núcleo",
      "Ranking de anomalias somente leitura: CONFLICT > UNKNOWN > ORPHAN > STALE > HIGH_DEGREE",
      "Fonte viva /api/graph?mode=vivo; sample-graph.json só como demonstração",
    ],
    estado: "UNKNOWN" as const,
  },
};

export const VAULT = {
  raiz: "Obsidian Vault › 🪬Centraldark -HUD🪬",
  notas: ["HUD.html", "Home.md", "Pendências.md", "Bem-vindo.md"],
  pluginsComunidade: [
    "obsidian-git",
    "dataview",
    "obsidian-excalidraw-plugin",
    "centraldark-grafo-vivo",
  ],
  menus: [
    { nome: "HUD", detalhe: "One Heart, cadeados, relógio, Cofre Obsidian, missões" },
    { nome: "MAPA", detalhe: "Grafos (JARVIS 3D, 2D, Celestial) e demais seções com busca" },
    { nome: "FORJA", detalhe: "Aba de construção do HUD" },
  ],
  oneHeart: {
    leitura: "/heartbeat + /health a cada 5s",
    ordemEndpoints: [
      "?api",
      "localStorage",
      "http://89.117.78.124:9100",
      "https://api.centralldark.com",
    ],
    frescorSeg: 15,
    nota: "Site em https não chama IP http direto: a leitura passa pelo servidor do cockpit.",
  },
  pendenciasChefe: [
    "Confirmar endereços do cockpit real para o Hermes andar nos 3 lugares",
    "Decidir motor do app: Tauri ou Electron",
    "Decidir se a memória fica dentro do vault ou separada",
    "Criar/sincronizar o vault pessoal com senha",
    "Consolidar o Hermes em 1 perfil só",
  ],
  pendenciasAgente: [
    "Filtrar GARIMPO-CHEFE (~800 imagens reais do ruído)",
    "Confirmar a equipe de agentes no Grok por screenshot",
    "Separar telepainel / CRM / Multizap / bot WhatsApp",
  ],
  diferenca:
    "HUD.html é a projeção estática do vault; apps/modulos/obsidian-plugin-grafo-vivo é o plugin vivo. O cockpit é o único corpo visual (ONE_SYSTEM_ONLY).",
};

export const PAINEIS_HISTORICOS = [
  { nome: "Painel CentralDark (md)", tipo: "Documento", destino: "Sistema › Infraestrutura" },
  { nome: "Painel CentralDark (html)", tipo: "Painel estático antigo", destino: "DONOR_HISTORY" },
  { nome: "Revisar Hermes HUD (2 versões)", tipo: "Revisão", destino: "Hermes" },
];

export const BIBLIOTECA: Array<{ grupo: string; itens: string[] }> = [
  { grupo: "Pesquisas profundas", itens: ["deep-research-report 0 a 4"] },
  {
    grupo: "Cadeias e receipts",
    itens: ["Cadeia da mudança do pacote ~400 MB", "RECEIPT-DELTA-PERICIA", "Esteira pr-format"],
  },
  { grupo: "Scripts e utilitários", itens: ["Hermes .bat", "set-bot-profile.sh"] },
  {
    grupo: "Textos de referência",
    itens: [
      "centraldark.txt",
      "Knowledge Hub (2 cópias idênticas)",
      "centraldark.pdf (90 páginas)",
      "Plano de reinstalação do sistema (docx e pdf)",
    ],
  },
  {
    grupo: "Convergência",
    itens: [
      "Diretriz MCP OAuth + 3 donos",
      "Diretriz convergência total VPS/Instinto/Admin/Sistema",
    ],
  },
];

// Painel CentralDark (artefato consolidado) — fotos datadas. São HISTÓRICO, não estado atual.
export const PAINEL_CENTRALDARK_FOTOS: Array<{
  id: string;
  titulo: string;
  data: string;
  nota: string;
  itens: Array<[string, string]>;
}> = [
  {
    id: "fluxo",
    titulo: "Fluxo da main",
    data: "28/09/2026 06:40",
    nota: "Medido só lendo. Já é histórico: a main de hoje precisa de nova medição.",
    itens: [
      ["main", "7a66fdd (prova do pulso da VPS, 06:36)"],
      ["Chuva de sincronização", "Ativa; roda no GitHub e atualiza cada pedido aberto com a main"],
      ["Fila do GitHub", "472 execuções esperando (no dia anterior perto de 1.440)"],
      ["Verificações dos pedidos", "Esperando aprovação; espera, não erro"],
      [
        "Trilho da chuva",
        "main recebe envio → workflow acorda → motor atualiza cada ramo → aviso por Gmail",
      ],
      [
        "Trilho da costura",
        "Só com conflito: reconcilia pedidos e resolve arquivo por arquivo pelo sentido",
      ],
      [
        "Trilho do pulso da VPS",
        "Aviso do GitHub → WebhookDeploy → reconciliador → microdeploy do dono; relógio de 60s como rede",
      ],
      [
        "Leis",
        "Híbrido por trilhos · vermelho é informação · fio bom fica guardado · pediu para olhar, só olha",
      ],
    ],
  },
  {
    id: "local",
    titulo: "Máquina local",
    data: "23/09/2026 18:58",
    nota: "Foto da pasta local de então; o estado de hoje pode ser outro.",
    itens: [
      ["Situação", "Fusão começada e não concluída"],
      ["Atrás do GitHub", "368 envios"],
      ["À frente do GitHub", "20 envios locais não mandados"],
      ["Arquivos preparados", "504 (213 modificados + 291 novos)"],
      ["Pasta local", "013dea8 · GitHub 529ed16"],
    ],
  },
  {
    id: "varredura",
    titulo: "Varredura",
    data: "20/09/2026 17:51",
    nota: "Mediu o computador na nuvem do Claude, não a VPS nem a máquina do Chefe.",
    itens: [
      ["Memória", "7,8 GiB · 2 processadores"],
      ["Disco livre", "30 GiB de 252 GiB"],
      ["Erros do sistema", "Nenhum grave"],
      ["PM2", "Ausente nesse computador (esperado)"],
    ],
  },
];
