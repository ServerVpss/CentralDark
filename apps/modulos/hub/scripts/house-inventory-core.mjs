import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const INVENTORY_GROUPS = Object.freeze([
  'CAPACIDADES',
  'SKILLS',
  'APRENDIZADOS',
  'MINERACAO',
  'CRISTAIS',
  'ARTEFATOS',
  'FERRAMENTAS',
]);

const META_LABELS = Object.freeze({
  META_EXPANSAO_DE_DOMINIO: 'Meta Expansão de Domínio',
  META_MENOS_E_MAIS: 'Meta Menos É Mais',
  META_LUPA: 'Meta Lupa',
  META_INSTINTO_SUPERIOR: 'Meta Instinto Superior',
  META_METACOGNICAO_OPERACIONAL: 'Meta Metacognição Operacional',
  META_MINERACAO: 'Meta Mineração',
});

const META_OWNER = 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md';
const META_LEDGER_OWNER = '.agents/skills/meta-lupa/references/uso-ledger.jsonl';

function exists(repoRoot, relativePath) {
  return fs.existsSync(path.resolve(repoRoot, relativePath));
}

function read(repoRoot, relativePath) {
  return fs.readFileSync(path.resolve(repoRoot, relativePath), 'utf8');
}

function humanize(value) {
  return String(value)
    .replace(/[_.-]+/g, ' ')
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())
    .trim();
}

function frontmatterStatus(text) {
  const match = String(text).match(/^status:\s*["']?([^\n"']+)/mi);
  return match?.[1]?.trim().toUpperCase() || null;
}

function stableId(prefix, value) {
  const digest = crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
  return `${prefix}:${digest}`;
}

function resolveRevision(repoRoot, explicitRevision) {
  if (explicitRevision) return explicitRevision;
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA;
  if (fs.existsSync(path.resolve(repoRoot, '.git'))) {
    return execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  }
  return process.env.GITHUB_SHA ? `EVENT_SHA:${process.env.GITHUB_SHA}` : 'WORKTREE_UNRESOLVED';
}

function makeItem({
  id,
  name,
  group,
  type,
  status,
  owner,
  consumers = [],
  proof,
  summary,
  source = owner,
  recorded_at = null,
  temporal_scope = 'CURRENT_OWNER',
  sector = null,
  used_when = null,
  metrics = [],
  effect = null,
  limit = null,
}) {
  return {
    id,
    name,
    group,
    type,
    status,
    owner,
    where: owner,
    consumers: [...new Set(consumers)].sort(),
    proof,
    source,
    recorded_at,
    temporal_scope,
    sector,
    used_when,
    metrics: [...new Set(metrics)].filter(Boolean),
    effect,
    limit,
    summary: String(summary || '').replace(/\s+/g, ' ').trim().slice(0, 320),
  };
}

function parseJsonl(repoRoot, relativePath) {
  return read(repoRoot, relativePath)
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .map(({ line, number }) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`HOUSE_INVENTORY_LEDGER_PARSE_ERROR path=${relativePath} line=${number} cause=${error instanceof Error ? error.message : String(error)}`);
      }
    });
}

function scanSkills(repoRoot) {
  const root = path.resolve(repoRoot, '.agents/skills');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(root, name, 'SKILL.md')))
    .sort()
    .map((name) => {
      const owner = `.agents/skills/${name}/SKILL.md`;
      const text = read(repoRoot, owner);
      return makeItem({
        id: `skill:${name}`,
        name: humanize(name),
        group: 'SKILLS',
        type: 'SKILL',
        status: frontmatterStatus(text) || 'OWNER_PRESENT',
        owner,
        consumers: ['AGENTES'],
        proof: owner,
        sector: 'SKILLS',
        used_when: 'Quando a missão corresponde ao contrato físico desta skill.',
        effect: 'Aplica o procedimento especializado definido no owner da skill.',
        limit: 'A existência da skill não prova que ela foi executada nem que o runtime atual a carregou.',
        summary: `Skill física registrada em .agents/skills/${name}.`,
      });
    });
}

function scanMetaCapabilities(repoRoot) {
  if (!exists(repoRoot, META_OWNER)) return [];
  const text = read(repoRoot, META_OWNER);
  const canonicalStatus = frontmatterStatus(text) || 'OWNER_PRESENT';
  const tokens = Object.keys(META_LABELS)
    .filter((token) => new RegExp(`(^|[^A-Z0-9_])${token}([^A-Z0-9_]|$)`, 'm').test(text));
  return tokens.sort().map((token) => makeItem({
    id: `meta:${token}`,
    name: META_LABELS[token],
    group: 'CAPACIDADES',
    type: 'META_CAPABILITY',
    status: canonicalStatus,
    owner: META_OWNER,
    consumers: ['AGENTES', 'MEMORY_LINKER', 'META_LUPA'],
    proof: META_OWNER,
    sector: 'METACOGNICAO',
    used_when: 'Quando a missão precisa avaliar o próprio método, reduzir erro recorrente ou absorver aprendizado reutilizável.',
    effect: 'Orienta contraprova, aprendizagem e redução de repetição sem criar um segundo cérebro.',
    limit: 'Contrato conceitual não substitui teste, evidência nem estado de runtime.',
    summary: `${token} é lido do contrato META canônico; não é cadastro paralelo do HUB.`,
  }));
}

function scanLearnings(repoRoot) {
  const owner = 'docs/CONSCIENCIA/APRENDIZADOS.md';
  if (!exists(repoRoot, owner)) return [];
  const text = read(repoRoot, owner);
  const headings = text.split(/\r?\n/)
    .map((line) => line.match(/^###\s+(?:\d+[.)]\s*)?(.+?)\s*$/)?.[1]?.trim())
    .filter(Boolean);
  const unique = [...new Set(headings)];
  if (unique.length === 0) {
    return [makeItem({
      id: 'learning:index',
      name: 'Aprendizados Canônicos',
      group: 'APRENDIZADOS',
      type: 'LEARNING_INDEX',
      status: 'REGISTERED',
      owner,
      consumers: ['AGENTES', 'MEMORIA'],
      proof: owner,
      sector: 'MEMORIA_CANONICA',
      used_when: 'Quando um aprendizado já provado precisa sobreviver à sessão/modelo atual.',
      effect: 'Mantém o aprendizado disponível como memória durável da Casa.',
      limit: 'Registro persistente não prova que um consumidor específico o carregou nesta execução.',
      summary: 'Owner canônico dos aprendizados persistentes da Casa.',
    })];
  }
  return unique.map((title, index) => makeItem({
    id: stableId('learning', `${index}:${title}`),
    name: title,
    group: 'APRENDIZADOS',
    type: 'LEARNING',
    status: 'REGISTERED',
    owner,
    consumers: ['AGENTES', 'MEMORIA'],
    proof: owner,
    sector: 'MEMORIA_CANONICA',
    used_when: 'Quando o mesmo tipo de problema ou decisão reaparece.',
    effect: 'Reutiliza aprendizado persistente sem depender da memória de uma única sessão.',
    limit: 'O Inventário indexa o aprendizado; a prova e o detalhe continuam no owner.',
    summary: 'Aprendizado registrado no owner canônico; o Inventário guarda apenas o índice compacto.',
  }));
}

function scanMetaLedger(repoRoot) {
  if (!exists(repoRoot, META_LEDGER_OWNER)) return [];
  const events = parseJsonl(repoRoot, META_LEDGER_OWNER);
  const beginByUsage = new Map(
    events
      .filter((event) => event?.event === 'BEGIN' && event.usage_id)
      .map((event) => [String(event.usage_id), event]),
  );

  const fixedPoints = events
    .filter((event) => event?.event === 'FINAL' && event.point_fixed_evidential === true && event.autolupa_executed === true)
    .map((event) => {
      const begin = beginByUsage.get(String(event.usage_id || '')) || {};
      const mission = begin.mission_id || event.mission_id || event.usage_id || 'sem-missao';
      const passed = Number(event.pass ?? 0);
      const failed = Number(event.fail ?? 0);
      const xp = event.xp_gained ?? event.xp_valid ?? null;
      return makeItem({
        id: stableId('crystal', event.record_hash || event.usage_id || JSON.stringify(event)),
        name: `Fixed Point · ${humanize(mission)}`,
        group: 'CRISTAIS',
        type: 'FIXED_POINT_RECORD',
        status: 'RECORDED_FIXED_POINT',
        owner: META_LEDGER_OWNER,
        consumers: ['META_LUPA', 'SELO_XP', 'INVENTARIO'],
        proof: META_LEDGER_OWNER,
        source: META_LEDGER_OWNER,
        recorded_at: event.finished_at_utc || begin.started_at_utc || null,
        temporal_scope: 'HISTORICAL_RECORD',
        sector: 'CRISTALIZACAO',
        metrics: ['verdict', 'result', 'pass', 'fail', 'xp', 'record_hash'],
        effect: 'Preserva um ponto fixo histórico que sobreviveu à contraprova daquele uso.',
        limit: 'É registro histórico; não afirma estado runtime atual.',
        summary: `Registro histórico: verdict=${event.verdict ?? 'UNKNOWN'}; result=${event.result ?? 'UNKNOWN'}; pass=${passed}; fail=${failed}; xp=${xp ?? 'n/a'}. Não afirma estado runtime atual.`,
      });
    });

  const candidates = events
    .filter((event) => event?.event === 'CANDIDATE_REF')
    .map((event) => makeItem({
      id: stableId('ore', event.record_hash || event.usage_id || JSON.stringify(event)),
      name: `Minério candidato · ${humanize(event.mission_id || event.usage_id || 'sem-missao')}`,
      group: 'MINERACAO',
      type: 'LEARNING_CANDIDATE',
      status: 'RECORDED_CANDIDATE',
      owner: META_LEDGER_OWNER,
      consumers: ['META_LUPA', 'MEMORY_LINKER', 'INVENTARIO'],
      proof: META_LEDGER_OWNER,
      source: META_LEDGER_OWNER,
      recorded_at: event.started_at_utc || null,
      temporal_scope: 'HISTORICAL_RECORD',
      sector: 'MINERACAO',
      metrics: ['usage_id', 'mission_id', 'record_hash'],
      effect: 'Mantém matéria candidata disponível para confronto e possível absorção futura.',
      limit: 'Candidato não é ouro promovido nem autorização de escrita.',
      summary: 'Candidato histórico preservado no ledger; conteúdo detalhado permanece on-demand no owner.',
    }));

  return [...fixedPoints, ...candidates];
}

function fixedOwners(repoRoot) {
  const definitions = [
    {
      id: 'capability:parallel-perception', name: 'Percepção Paralela', group: 'CAPACIDADES', type: 'PERCEPTION_ORCHESTRA',
      owner: 'apps/modulos/HERMES-CORE/core/perception-orchestra.mjs', proof: 'apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs',
      consumers: ['HERMES_CORE', 'WRITER', 'JUDGE'], sector: 'COGNICAO_HERMES',
      used_when: 'Antes de uma mutação material quando a mesma intenção precisa ser atacada por ângulos diferentes.',
      metrics: ['elapsed_ms por braço', 'all_four_completed', 'missing_roles', 'unproven_roles', 'material_findings', 'ready_for_writer'],
      effect: 'Roda quatro leituras READ_ONLY e só produz no máximo um slot candidato de Writer quando o material fecha.',
      limit: 'Não escreve no alvo; quatro respostas não são quatro provas.',
      summary: 'Quatro ataques: lógica, implementação, regressão/falso-verde e simplificação; realidade decide, não votação de modelo.',
    },
    {
      id: 'capability:evidence-independence', name: 'Independência de Evidência', group: 'CAPACIDADES', type: 'EVIDENCE_GUARD',
      owner: 'apps/modulos/HERMES-CORE/core/perception-orchestra.mjs', proof: 'apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs',
      consumers: ['HERMES_CORE', 'JUDGE'], sector: 'PROVA_E_CONTRAPROVA',
      used_when: 'Quando vários agentes/modelos concordam e é preciso saber se trouxeram provas diferentes ou só eco da mesma fonte.',
      metrics: ['independence_key', 'evidence_ref', 'effective_independent_count', 'correlated_clusters', 'confidence_can_increase'],
      effect: 'Agrupa evidência correlacionada e impede contagem falsa de independência.',
      limit: 'Modelo/provider diferente por si só não torna a prova causalmente independente.',
      summary: 'Mede independência causal explícita para impedir que 20 respostas repetidas pareçam 20 provas.',
    },
    {
      id: 'capability:model-routing', name: 'Roteamento de Modelos', group: 'CAPACIDADES', type: 'MODEL_ROUTER',
      owner: 'apps/modulos/HERMES-CORE/core/routing-strategy.mjs', proof: 'apps/modulos/HERMES-CORE/core/routing-strategy.test.mjs',
      consumers: ['HERMES_CORE'], sector: 'ORQUESTRACAO_MODELOS',
      used_when: 'Quando o Hermes precisa ordenar o pool de modelos antes de uma chamada.',
      metrics: ['priority/order', 'cost_weight', 'timeout_ms', 'round_robin_offset_por_minuto'],
      effect: 'Reordena os modelos por priority, cost, latency configurada ou round_robin.',
      limit: 'cost_weight não é dinheiro real medido; latency usa timeout_ms configurado, não ping/latência real observada.',
      summary: 'Strategy do cadeia.json decide a ordem do pool sem transformar configuração em telemetria real.',
    },
    {
      id: 'capability:continuity-guard', name: 'Continuity Guard', group: 'CAPACIDADES', type: 'STATE_GUARD',
      owner: 'apps/modulos/HERMES-CORE/core/continuity-guard.mjs', proof: 'apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs',
      consumers: ['HERMES_CORE', 'DECISOR'], sector: 'CONTINUIDADE_ESTADO',
      used_when: 'Ao retomar missão/sessão e antes de DECIDE/APPLY quando o estado anterior será reutilizado.',
      metrics: ['head_sha', 'baseline.status', 'backup.status', 'rollback.status', 'receipt.result', 'reasons[]', 'fingerprint'],
      effect: 'Retorna READY quando o estado está completo e preso ao mesmo HEAD; senão bloqueia com motivos verificáveis.',
      limit: 'Valida o pacote de continuidade disponível; não prova sozinho runtime externo, VPS ou aparelho.',
      summary: 'Impede retomada em estado incompleto, autoridade divergente ou prova amarrada a outro HEAD.',
    },
    {
      id: 'capability:memory-linker', name: 'Memory Linker', group: 'CAPACIDADES', type: 'CAPABILITY',
      owner: 'scripts/memory-linker/README.md', proof: 'scripts/memory-linker/dream-review.test.mjs',
      consumers: ['DREAM_REVIEW', 'META_LUPA'], sector: 'MEMORIA_E_APRENDIZADO',
      used_when: 'Quando experiências/achados precisam ser deduplicados, comparados e encaminhados só se houver informação nova.',
      metrics: ['findingFingerprint', 'NO_NEW_INFORMATION|DELTA', 'unsafePaths', 'arquivo/commit/push receipt'],
      effect: 'Transforma matéria nova em candidato e corta repetição antes de acordar etapas caras.',
      limit: 'Não promove aprendizado sozinho; sem delta material, para.',
      summary: 'Refinaria determinística de memória, padrões, dedupe e candidatos.',
    },
    {
      id: 'capability:dream-review', name: 'Dream Review', group: 'CAPACIDADES', type: 'CAPABILITY',
      owner: 'scripts/memory-linker/dream-review.mjs', proof: 'scripts/memory-linker/dream-review.test.mjs',
      consumers: ['MEMORY_LINKER', 'META_LUPA'], sector: 'MEMORIA_DREAM',
      used_when: 'Na revisão ociosa/sonho de experiências e eventos já normalizados, sem escrever o canônico.',
      metrics: ['CANDIDATE|QUARANTINE', 'AUTO_ABSORB_ELIGIBLE', 'owner_evidence', 'consumer_evidence', 'source_class'],
      effect: 'Produz proposta candidata ou quarentena para contraprova, dono, consumidor e Writer autorizado.',
      limit: 'DIRECT_CANONICAL_MUTATION=false; código de Dream Review não prova scheduler ativo.',
      summary: 'Consolidação isolada que produz candidatos; não promove direto.',
    },
    {
      id: 'capability:semantic-core', name: 'Semantic Core', group: 'CAPACIDADES', type: 'CAPABILITY',
      owner: 'infra/mcp/SEMANTIC-CORE.md', proof: 'infra/mcp/tests',
      consumers: ['MCP', 'AGENTES'], sector: 'SEMANTICA_MCP',
      used_when: 'Quando ferramentas/agentes precisam compartilhar significado, fixtures e contratos semânticos.',
      effect: 'Mantém um contrato semântico verificável entre consumidores.',
      limit: 'Contrato documentado não prova que um endpoint/runtime específico está saudável agora.',
      summary: 'Contrato semântico com fixtures e contraprovas offline.',
    },
    {
      id: 'mining:source-delta', name: 'SOURCE_DELTA', group: 'MINERACAO', type: 'MINING_ENGINE',
      owner: 'scripts/memory-linker/SOURCE-DELTA.md', proof: 'scripts/memory-linker/source-delta-wiring.test.mjs',
      consumers: ['CATALOG_SYNC', 'MEMORY_LINKER'], sector: 'MINERACAO',
      used_when: 'Quando uma fonte volta a ser lida e é preciso saber se trouxe ouro novo ou repetiu o que já existia.',
      metrics: ['fingerprint', 'NO_CHANGE|MATERIAL_DELTA'],
      effect: 'Igualdade vira NO_CHANGE; diferença material segue para a refinaria.',
      limit: 'Diferença detectada ainda não é verdade nem ouro promovido.',
      summary: 'Sensor seletivo: NO_CHANGE para igualdade; delta material segue para refinaria.',
    },
    {
      id: 'mining:catalog-sync', name: 'Catalog Sync', group: 'MINERACAO', type: 'SOURCE_ADAPTER',
      owner: 'supabase/functions/catalog-sync/index.ts', proof: 'scripts/memory-linker/source-delta-wiring.test.mjs',
      consumers: ['HUB', 'SOURCE_DELTA'], sector: 'CATALOGO_MCP',
      used_when: 'Quando o catálogo MCP/releases cadastradas precisa ser medido e comparado.',
      effect: 'Entrega estado de catálogo ao SOURCE_DELTA sem criar outro minerador.',
      limit: 'Catálogo medido não prova disponibilidade física de cada ferramenta no runtime do consumidor.',
      summary: 'Adapter físico que mede catálogo MCP e releases cadastradas sem criar segundo minerador.',
    },
    {
      id: 'artifact:capability-compiler', name: 'Artefato → Capacidade', group: 'ARTEFATOS', type: 'ARTIFACT_ADAPTER',
      owner: 'scripts/memory-linker/artifact-capability.mjs', proof: 'scripts/memory-linker/artifact-capability.test.mjs',
      consumers: ['DREAM_REVIEW', 'META_LUPA'], sector: 'ARTEFATOS_E_CAPACIDADES',
      used_when: 'Quando arquivo, screenshot, pacote ou outro artefato precisa ser traduzido em sinais de capacidade.',
      metrics: ['classe do artefato', 'fingerprint', 'evidence refs', 'capability signals'],
      effect: 'Extrai sinais sem executar binário e envia candidatos para validação.',
      limit: 'Sinal extraído não vira skill nem capacidade provada automaticamente.',
      summary: 'Extrai sinais de capacidade sem executar binário e sem escrever skill diretamente.',
    },
    {
      id: 'crystal:fixed-point', name: 'Cristalização / Fixed Point', group: 'CRISTAIS', type: 'CRYSTAL_CONTRACT',
      owner: META_OWNER, proof: '.agents/skills/meta-lupa/guardrails/validar_selo_ponto_fixo.py',
      consumers: ['META_LUPA', 'SELO_XP'], sector: 'CRISTALIZACAO',
      used_when: 'Quando uma conclusão já passou por teste/contraprova e a rodada não contém informação material nova.',
      metrics: ['pass', 'fail', 'verdict', 'point_fixed_evidential', 'autolupa_executed', 'record_hash'],
      effect: 'Fecha a rodada como ponto fixo reutilizável e evita continuar pensando sem delta.',
      limit: 'Fixed point vale para o escopo/evidência daquela prova; HEAD ou evidência nova pode reabrir o problema.',
      summary: 'Fixed point encerra somente quando não há informação nova; selo é validado por guardrail.',
    },
    {
      id: 'learning:auto-outcome', name: 'Autoaprendizado por Outcome', group: 'APRENDIZADOS', type: 'LEARNING_SOURCE',
      owner: 'apps/modulos/hub/supabase/functions/learn-from-outcome/index.ts', proof: 'apps/modulos/hub/supabase/functions/learn-from-outcome/index.ts',
      consumers: ['HERMES', 'MEMORIA_VETORIAL'], sector: 'APRENDIZADO_POR_RESULTADO',
      used_when: 'Quando uma missão já possui resultado/feedback reaproveitável.',
      effect: 'Gera aprendizado derivado de outcome para memória vetorial.',
      limit: 'Não substitui ouro canônico nem prova independente.',
      summary: 'Fonte de aprendizados derivados de missões com feedback; não substitui ouro canônico.',
    },
    {
      id: 'learning:hermes-context-influence', name: 'Hermes/Trismegisto — Influência de Contexto', group: 'APRENDIZADOS', type: 'CONTEXT_EFFECT_GUARD',
      owner: 'docs/CONSCIENCIA/PIVETE-IA/PIVETE-07-HERMES-CADEIA.md', proof: 'docs/CONSCIENCIA/PIVETE-IA/PIVETE-07-HERMES-CADEIA.md',
      consumers: ['HERMES', 'DREAM_REVIEW', 'MEMORY_LINKER'], sector: 'COGNICAO_E_CONTEXTO',
      used_when: 'Quando material histórico, hermético, simbólico ou de persona entra em prompt, memória, RAG, exemplo ou nota recuperada.',
      metrics: ['source/provenance', 'source_class', 'target', 'evidence', 'learning_delta'],
      effect: 'Se o conteúdo for realmente carregado, pode alterar saliência, estilo, analogias, associações e decisões textuais do modelo.',
      limit: 'Não é poder sobrenatural e não concede acesso físico ao telefone/PC; sem consumo comprovado do conteúdo, o efeito causal fica UNKNOWN.',
      summary: 'Guardrail: texto simbólico pode ter efeito técnico real quando vira contexto; proveniência e consumo precisam ser separados de interpretação mística.',
    },
    {
      id: 'tools:observability-capsule', name: 'Observabilidade / Telemetria da Cápsula', group: 'FERRAMENTAS', type: 'OBSERVABILITY',
      owner: 'apps/modulos/status/capsula-observavel.mjs', proof: 'apps/modulos/status/capsula-observavel.test.mjs',
      consumers: ['HERMES', 'HUB', 'JUDGE'], sector: 'OBSERVABILIDADE',
      used_when: 'Quando uma mutação/aprendizado precisa deixar recibo observável sem transformar painel em fonte de verdade.',
      metrics: ['run_id', 'candidate_id', 'pass', 'fail', 'fingerprint', 'ready_for_promotion'],
      effect: 'Valida eventos, agrega ledger e gera snapshot derivado para o painel.',
      limit: 'A Cápsula não controla logs internos de iOS, Windows, navegador ou serviços externos e não autoriza deploy/merge por si só.',
      summary: 'Telemetria operacional do ciclo Hermes; registra o que o sistema observa, mas não vira autoridade sobre o runtime.',
    },
    {
      id: 'tools:mcp-catalog', name: 'Catálogo MCP', group: 'FERRAMENTAS', type: 'TOOL_CATALOG',
      owner: 'apps/modulos/hub/src/components/catalog/CatalogTab.tsx', proof: 'apps/modulos/hub/src/components/catalog/CatalogTab.tsx',
      consumers: ['HUB'], sector: 'FERRAMENTAS_MCP',
      used_when: 'Quando o operador precisa ver quais ferramentas estão cadastradas e onde pertencem.',
      effect: 'Mostra catálogo de ferramentas; o Inventário aponta para esse owner em vez de duplicar a lista.',
      limit: 'Cadastro não é prova automática de disponibilidade no runtime atual.',
      summary: 'Inventário de ferramentas continua no Catálogo; a aba Inventário apenas aponta para esse owner.',
    },
    {
      id: 'tools:hud-machine-inventory', name: 'HUD Machine Inventory', group: 'FERRAMENTAS', type: 'HUD_MACHINE_INDEX',
      owner: 'docs/HUD/CENTRALDARK-HUD-INVENTORY.json', proof: 'scripts/hud/generate-hud-inventory.mjs',
      consumers: ['CAPABILITY_HUD', 'HUD_STATIC', 'PR_MOTHER', 'AGENTES'], sector: 'HUD_E_GENEALOGIA',
      used_when: 'Na entrada GitHub/#ACORDAR e quando o sistema precisa mapear genealogia, metabolismo, determinismo, workflows, rotas ou superfícies sem carregar todos os owners no prompt.',
      metrics: ['inventory_fingerprint', 'skills', 'agents', 'workflows', 'ui_signals', 'genealogy_nodes', 'proven_claims', 'deterministic_owners', 'routes', 'sealed_baselines'],
      effect: 'Projeta o mapa machine-consumable completo e mantém SELO separado de LIVE; consumers selecionam apenas o cone pertinente.',
      limit: 'É índice derivado. Não substitui owner, runtime probe, GitHub readback nem prova atual de serviço.',
      summary: 'Índice completo do HUD gerado dos owners reais; evita redescoberta e preserva carga seletiva do catálogo.',
    },
  ];
  return definitions
    .filter((definition) => exists(repoRoot, definition.owner))
    .map((definition) => makeItem({
      ...definition,
      status: 'OWNER_PRESENT',
      proof: exists(repoRoot, definition.proof) ? definition.proof : definition.owner,
    }));
}

export function buildHouseInventory(repoRoot, { revision } = {}) {
  const resolvedRoot = path.resolve(repoRoot);
  const items = [
    ...scanSkills(resolvedRoot),
    ...scanMetaCapabilities(resolvedRoot),
    ...scanLearnings(resolvedRoot),
    ...scanMetaLedger(resolvedRoot),
    ...fixedOwners(resolvedRoot),
  ];
  const deduped = [...new Map(items.map((item) => [item.id, item])).values()]
    .sort((a, b) => `${a.group}\u0000${a.name}\u0000${a.id}`.localeCompare(`${b.group}\u0000${b.name}\u0000${b.id}`, 'pt-BR'));
  const counts = Object.fromEntries(INVENTORY_GROUPS.map((group) => [group, deduped.filter((item) => item.group === group).length]));
  return {
    schema_version: 2,
    source_of_truth: 'REPOSITORY_OWNERS',
    source_is_authority: false,
    second_truth: false,
    generated_from: resolveRevision(resolvedRoot, revision),
    groups: INVENTORY_GROUPS,
    counts,
    total: deduped.length,
    items: deduped,
  };
}

export function renderInventoryModule(inventory) {
  return [
    '// GENERATED FILE — do not edit by hand.',
    '// Owner: apps/modulos/hub/scripts/house-inventory-core.mjs',
    `export const HOUSE_INVENTORY = ${JSON.stringify(inventory, null, 2)} as const;`,
    '',
  ].join('\n');
}
