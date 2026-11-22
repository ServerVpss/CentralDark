/**
 * Âncora canônica medida — CentralDark.
 *
 * ATENÇÃO DOUTRINÁRIA:
 * estes valores são um RECIBO DE MEDIÇÃO, não estado vivo.
 * HISTORY != CURRENT_STATE. UNKNOWN != PASS.
 * Nada aqui deve ser lido como "o repositório está assim agora".
 */
export const ANCORA_CANONICA = {
  repositorio: "ServerVpss/CentralDark",
  branch: "main",
  /** HEAD medida via leitura read-only no momento abaixo. */
  sourceHead: "05fd29181a74ddfaa95857f4eafb0622c388c765",
  headCurta: "05fd291",
  /** Data/hora UTC da medição registrada. */
  medidoEm: "2026-09-22T07:28Z",
  /** Owners canônicos declarados pela própria fonte. */
  owners: ["LEIA-ME-IA.md", "AGENTS.md", "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md"],
} as const;

/** Estado de prova de cada linha projetada. Verde só com prova medida. */
export type EstadoProva = "PROVADO" | "UNKNOWN" | "BLOQUEADO" | "HISTORICO";

/**
 * PROJEÇÃO VISUAL READ-ONLY.
 *
 * Este objeto é a fotografia de uma leitura externa feita em
 * ANCORA_CANONICA.medidoEm. A interface apenas REPRESENTA estes valores:
 * nada aqui executa, sincroniza ou observa em tempo real.
 * LOVABLE_IS_PROJECTION_SURFACE=true · EXTERNAL_WRITES=0
 */
export const PROJECAO_CONVERGIDA = {
  /** Commit de topo medido na fonte canônica. */
  head: {
    sha: ANCORA_CANONICA.sourceHead,
    curta: ANCORA_CANONICA.headCurta,
    titulo:
      "docs: renomeia frase de autorização PERMITO PIVETE → PERMITO SEGREDO em ai-review.html",
    autor: "segredounlock",
    data: "2026-09-22T07:17:34Z",
    tree: "bf82de459c346042e275d2129fedef2ba63738a9",
    assinatura: "PGP verified=false (unsigned)",
  },

  /** Owners normativos lidos, com identificador de conteúdo medido. */
  ownersMedidos: [
    {
      path: "AGENTS.md",
      sha: "d76704a490416834890d1e8b338d2d850aededd4",
      bytes: 40237,
      estado: "PROVADO" as EstadoProva,
      nota: "Owner único do contrato: boot obrigatório, identidade, contrato universal.",
    },
    {
      path: "docs/AGENTS.md",
      sha: "dd9312efc216cd7b9486b83dbe8e4b02be3d06ae",
      bytes: 1490,
      estado: "HISTORICO" as EstadoProva,
      nota: "Ponte de compatibilidade para consumidores antigos. Declara: NÃO é segunda identidade nem segundo contrato — aponta para LEIA-ME-IA.md + AGENTS.md da raiz.",
    },
    {
      path: "LEIA-ME-IA.md",
      sha: "2f05774340928183c39316b183a726dd161e05e7",
      bytes: 29899,
      estado: "PROVADO" as EstadoProva,
      nota: "Porta de entrada canônica declarada pelo próprio owner.",
    },
    {
      path: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md",
      sha: "5c84837cf924c8bc28eebc5bf6fcdc06a9703326",
      bytes: 36588,
      estado: "PROVADO" as EstadoProva,
      nota: "Identidade operacional SOL — lida como dado, não como boot vivo.",
    },
    {
      path: "docs/CONSCIENCIA/CONSCIENCIA.md",
      sha: "UNKNOWN",
      bytes: 0,
      estado: "HISTORICO" as EstadoProva,
      nota: "HISTORICAL_REDIRECT desde 2026-08-14 — não governa boot. Não reativar.",
    },
  ],

  /** Funil de promoção medido na fonte. Estado vivo, sem interpretação. */
  funil: {
    mae: {
      numero: 1562,
      titulo: "🔒 PR-MÃE · FUNIL PERMANENTE CENTRALDARK · NÃO MERGEAR",
      estado: "closed",
      mergeado: false,
      fechadoEm: "2026-09-21T18:03:50Z",
      contrato: "RENDEZVOUS_LEDGER_NOT_WRITER · DO_NOT_MERGE=true",
      estadoProva: "BLOQUEADO" as EstadoProva,
      tensao: "CANON diz rendezvous permanente; REALIDADE mediu fechada sem merge.",
    },
    filhos: [
      {
        numero: 1625,
        titulo: "🧿 AUDIT(LOVABLE): GARIMPO CENTRALDARK → PR-MÃE #1562",
        estado: "closed · merged 2026-09-22T01:25:10Z",
        vinculo: "PR_MOTHER=#1562 · merge_commit 0be34c7d",
        estadoProva: "PROVADO" as EstadoProva,
      },
      {
        numero: 1630,
        titulo: "🧪 FIX(AUTONOMIA): APROVA WORKFLOW ACTION_REQUIRED NO OWNER CANÔNICO",
        estado: "open",
        vinculo: "AUTO_SQUASH_IF_CLEAN · Writer=HERMES",
        estadoProva: "PROVADO" as EstadoProva,
      },
      {
        numero: 1579,
        titulo: "🧾 KERNEL: CHECK-LIST + FINALIZER + MICRO-GOAL CAUSAL",
        estado: "open",
        vinculo: "PR_MOTHER=#1562",
        estadoProva: "PROVADO" as EstadoProva,
      },
    ],
  },

  /**
   * Automações medidas na fonte. TOTAL é contagem lida; nenhuma foi disparada.
   * LISTED != RUNNING.
   */
  automacoes: {
    total: 79,
    ativasListadas: 79,
    disparadasPorEstaTela: 0,
    exemplos: [
      {
        nome: "Auto PR + Micro Deploy",
        arquivo: ".github/workflows/auto-pr-and-deploy.yml",
        estado: "PROVADO" as EstadoProva,
        nota: "Promoção + micro-deploy. Medida como ativa, não observada executando agora.",
      },
      {
        nome: "Autonomia — promoção segura",
        arquivo: ".github/workflows/autonomia-promocao.yml",
        estado: "PROVADO" as EstadoProva,
        nota: "Owner único da promoção. Alvo do conserto aberto em #1630.",
      },
      {
        nome: "Build CentralDark Architecture Package",
        arquivo: ".github/workflows/build-centraldark-architecture-package.yml",
        estado: "PROVADO" as EstadoProva,
        nota: "Empacotamento da arquitetura.",
      },
      {
        nome: "Hermes Core Signal Watch",
        arquivo: ".github/workflows/hermes-core-signal-watch.yml",
        estado: "UNKNOWN" as EstadoProva,
        nota: "Últimas execuções medidas terminaram como SKIPPED. SKIPPED != PASS.",
      },
    ],
  },

  /** Áreas de conhecimento lidas na documentação canônica. */
  areasConhecimento: [
    {
      path: "docs/ARQUITETURA",
      estado: "PROVADO" as EstadoProva,
      nota: "Contratos, ciclo mestre e método universal do motor.",
    },
    {
      path: "docs/CONSCIENCIA",
      estado: "PROVADO" as EstadoProva,
      nota: "Identidade, regras, lembranças e aprendizados.",
    },
    {
      path: "docs/AUDITORIAS",
      estado: "PROVADO" as EstadoProva,
      nota: "Auditorias arquivadas da própria casa.",
    },
    {
      path: "docs/APRENDIZADOS",
      estado: "PROVADO" as EstadoProva,
      nota: "Erro + correção herdados pela próxima superfície.",
    },
    {
      path: "docs/RECEIPTS",
      estado: "PROVADO" as EstadoProva,
      nota: "Recibos de medição — inclui o garimpo desta superfície.",
    },
    {
      path: "docs/RELATORIOS",
      estado: "PROVADO" as EstadoProva,
      nota: "Relatórios de reconciliação e fechamento.",
    },
  ],

  /**
   * Saúde separada em três provas distintas.
   * PROCESSO VIVO != PORTA RESPONDENDO != ROTA PÚBLICA SAUDÁVEL.
   */
  saude: [
    {
      camada: "PROCESS_ALIVE",
      alvo: "CentralDark-ContasAdmin",
      estado: "PROVADO" as EstadoProva,
      evidencia: "Processo medido online, sem reinício provocado por esta tela.",
    },
    {
      camada: "SERVICE_HEALTH",
      alvo: "porta interna 9400",
      estado: "UNKNOWN" as EstadoProva,
      evidencia: "Sem requisição HTTP possível desta superfície. NÃO medido.",
    },
    {
      camada: "PUBLIC_HEALTH",
      alvo: "rota pública /contas/health",
      estado: "UNKNOWN" as EstadoProva,
      evidencia: "Sem medição externa nesta rodada.",
    },
    {
      camada: "CONFIG_EFETIVA",
      alvo: "Caddy em uso no servidor",
      estado: "UNKNOWN" as EstadoProva,
      evidencia:
        "Arquivo do repositório e da VPS medidos idênticos (444 bytes); a configuração efetiva do serviço não foi lida.",
    },
    {
      camada: "CASA",
      alvo: "checkout local + sessão + log do Hermes",
      estado: "UNKNOWN" as EstadoProva,
      evidencia: "Nenhuma superfície local exposta aqui. Sem sessão, sem log, sem checkout medido.",
    },
  ],

  /** Micro-deploy medido antes de agir: nenhuma ação foi necessária. */
  microDeploy: {
    escopo: "configuração do proxy + serviço de contas",
    resultado: "NO-OP PROVADO",
    estado: "PROVADO" as EstadoProva,
    nota: "Conteúdo dos dois arquivos já equivalente à main. Marca de modificação no controle de versão não é conteúdo errado — comparar conteúdo antes de copiar evita risco sem ganho.",
    mutacoes: 0,
    reinicios: 0,
  },

  /**
   * Topologia conhecida. Cada nó diz QUEM é o dono real da execução.
   * A superfície Lovable nunca aparece como executor de runtime externo.
   */
  topologia: [
    {
      nome: "GitHub — ServerVpss/CentralDark",
      papel: "OWNER da verdade estrutural",
      dentroDoLovable: false,
      estado: "PROVADO" as EstadoProva,
      evidencia: "HEAD + owners + funil + 79 automações lidos nesta medição.",
    },
    {
      nome: "MCP CentralDark",
      papel: "TRANSPORTE de leitura/execução",
      dentroDoLovable: false,
      estado: "PROVADO" as EstadoProva,
      evidencia: "116 tools em runtime · 18 destrutivas · catálogo v1-f8ff6720fec3.",
    },
    {
      nome: "VPS — checkout e serviço",
      papel: "RUNTIME de execução real",
      dentroDoLovable: false,
      estado: "UNKNOWN" as EstadoProva,
      evidencia:
        "Checkout medido 50 commits atrás, árvore com alterações locais preservadas. Processo vivo; saúde HTTP não medida.",
    },
    {
      nome: "Casa — máquina local do Hermes",
      papel: "RUNTIME local",
      dentroDoLovable: false,
      estado: "UNKNOWN" as EstadoProva,
      evidencia: "Superfície local não exposta aqui. EXISTS != RUNNING.",
    },
    {
      nome: "Esta superfície (Lovable)",
      papel: "PROJEÇÃO visual read-only",
      dentroDoLovable: true,
      estado: "PROVADO" as EstadoProva,
      evidencia: "Renderiza medições. Não executa nem sincroniza nada externo.",
    },
  ],

  /** Recibo da fusão: o que a matriz decidiu, em números medidos. */
  matriz: {
    same: 6,
    localBetter: 3,
    canonicalBetter: 0,
    canonicalMissingLocal: 4,
    localUniqueUseful: 5,
    duplicate: 0,
    unknown: 3,
    escritasExternas: 0,
    conexoesNovas: 0,
    backendsNovos: 0,
  },
} as const;
