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
    summary: String(summary || '').replace(/\s+/g, ' ').trim().slice(0, 240),
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
        summary: `Skill física registrada em .agents/skills/${name}.`,
      });
    });
}

function scanMetaCapabilities(repoRoot) {
  if (!exists(repoRoot, META_OWNER)) return [];
  const text = read(repoRoot, META_OWNER);
  const canonicalStatus = frontmatterStatus(text) || 'OWNER_PRESENT';
  const tokens = [...new Set(text.match(/^META_[A-Z0-9_]+$/gm) || [])]
    .filter((token) => Object.hasOwn(META_LABELS, token));
  return tokens.sort().map((token) => makeItem({
    id: `meta:${token}`,
    name: META_LABELS[token],
    group: 'CAPACIDADES',
    type: 'META_CAPABILITY',
    status: canonicalStatus,
    owner: META_OWNER,
    consumers: ['AGENTES', 'MEMORY_LINKER', 'META_LUPA'],
    proof: META_OWNER,
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
      summary: 'Candidato histórico preservado no ledger; conteúdo detalhado permanece on-demand no owner.',
    }));

  return [...fixedPoints, ...candidates];
}

function fixedOwners(repoRoot) {
  const definitions = [
    {
      id: 'capability:memory-linker', name: 'Memory Linker', group: 'CAPACIDADES', type: 'CAPABILITY',
      owner: 'scripts/memory-linker/README.md', proof: 'scripts/memory-linker/dream-review.test.mjs',
      consumers: ['DREAM_REVIEW', 'META_LUPA'], summary: 'Refinaria determinística de memória, padrões, dedupe e candidatos.',
    },
    {
      id: 'capability:dream-review', name: 'Dream Review', group: 'CAPACIDADES', type: 'CAPABILITY',
      owner: 'scripts/memory-linker/dream-review.mjs', proof: 'scripts/memory-linker/dream-review.test.mjs',
      consumers: ['MEMORY_LINKER', 'META_LUPA'], summary: 'Consolidação isolada que produz candidatos; não promove direto.',
    },
    {
      id: 'capability:semantic-core', name: 'Semantic Core', group: 'CAPACIDADES', type: 'CAPABILITY',
      owner: 'infra/mcp/SEMANTIC-CORE.md', proof: 'infra/mcp/tests',
      consumers: ['MCP', 'AGENTES'], summary: 'Contrato semântico com fixtures e contraprovas offline.',
    },
    {
      id: 'mining:source-delta', name: 'SOURCE_DELTA', group: 'MINERACAO', type: 'MINING_ENGINE',
      owner: 'scripts/memory-linker/SOURCE-DELTA.md', proof: 'scripts/memory-linker/source-delta-wiring.test.mjs',
      consumers: ['CATALOG_SYNC', 'MEMORY_LINKER'], summary: 'Sensor seletivo: NO_CHANGE para igualdade; delta material segue para refinaria.',
    },
    {
      id: 'mining:catalog-sync', name: 'Catalog Sync', group: 'MINERACAO', type: 'SOURCE_ADAPTER',
      owner: 'supabase/functions/catalog-sync/index.ts', proof: 'scripts/memory-linker/source-delta-wiring.test.mjs',
      consumers: ['HUB', 'SOURCE_DELTA'], summary: 'Adapter físico que mede catálogo MCP e releases cadastradas sem criar segundo minerador.',
    },
    {
      id: 'artifact:capability-compiler', name: 'Artefato → Capacidade', group: 'ARTEFATOS', type: 'ARTIFACT_ADAPTER',
      owner: 'scripts/memory-linker/artifact-capability.mjs', proof: 'scripts/memory-linker/artifact-capability.test.mjs',
      consumers: ['DREAM_REVIEW', 'META_LUPA'], summary: 'Extrai sinais de capacidade sem executar binário e sem escrever skill diretamente.',
    },
    {
      id: 'crystal:fixed-point', name: 'Cristalização / Fixed Point', group: 'CRISTAIS', type: 'CRYSTAL_CONTRACT',
      owner: META_OWNER, proof: '.agents/skills/meta-lupa/guardrails/validar_selo_ponto_fixo.py',
      consumers: ['META_LUPA', 'SELO_XP'], summary: 'Fixed point encerra somente quando não há informação nova; selo é validado por guardrail.',
    },
    {
      id: 'learning:auto-outcome', name: 'Autoaprendizado por Outcome', group: 'APRENDIZADOS', type: 'LEARNING_SOURCE',
      owner: 'apps/modulos/hub/supabase/functions/learn-from-outcome/index.ts', proof: 'apps/modulos/hub/supabase/functions/learn-from-outcome/index.ts',
      consumers: ['HERMES', 'MEMORIA_VETORIAL'], summary: 'Fonte de aprendizados derivados de missões com feedback; não substitui ouro canônico.',
    },
    {
      id: 'tools:mcp-catalog', name: 'Catálogo MCP', group: 'FERRAMENTAS', type: 'TOOL_CATALOG',
      owner: 'apps/modulos/hub/src/components/catalog/CatalogTab.tsx', proof: 'apps/modulos/hub/src/components/catalog/CatalogTab.tsx',
      consumers: ['HUB'], summary: 'Inventário de ferramentas continua no Catálogo; a aba Inventário apenas aponta para esse owner.',
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
    schema_version: 1,
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
