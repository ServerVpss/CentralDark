import fs from 'node:fs';
import path from 'node:path';

const SUPPLEMENT_ROOT = 'apps/modulos/hub/scripts/inventory-supplements';

export const INVENTORY_SUPPLEMENT_SOURCE = 'SANITIZED_INVENTORY_SUPPLEMENTS';

export function loadInventorySupplements(repoRoot, allowedGroups = []) {
  const root = path.resolve(repoRoot, SUPPLEMENT_ROOT);
  if (!fs.existsSync(root)) return [];

  const allowed = new Set(allowedGroups);
  const items = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })
    .filter((candidate) => candidate.isFile() && candidate.name.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))) {
    const absolute = path.join(root, entry.name);
    const relative = path.relative(repoRoot, absolute).split(path.sep).join('/');
    const parsed = JSON.parse(fs.readFileSync(absolute, 'utf8'));

    if (parsed?.kind !== 'SANITIZED_INVENTORY_SUPPLEMENT' || parsed?.sanitized !== true || parsed?.source_is_authority !== false) {
      throw new Error(`HOUSE_INVENTORY_SUPPLEMENT_INVALID path=${relative}`);
    }
    if (!Array.isArray(parsed.items)) {
      throw new Error(`HOUSE_INVENTORY_SUPPLEMENT_ITEMS_INVALID path=${relative}`);
    }

    for (const item of parsed.items) {
      if (!item?.id || !item?.name || !item?.type || !item?.group || !item?.owner || !item?.summary) {
        throw new Error(`HOUSE_INVENTORY_SUPPLEMENT_ITEM_INVALID path=${relative}`);
      }
      if (allowed.size > 0 && !allowed.has(item.group)) {
        throw new Error(`HOUSE_INVENTORY_SUPPLEMENT_GROUP_INVALID path=${relative} group=${item.group}`);
      }
      items.push(item);
    }
  }

  return [...new Map(items.map((entry) => [entry.id, entry])).values()]
    .sort((a, b) => `${a.group}\u0000${a.name}\u0000${a.id}`.localeCompare(`${b.group}\u0000${b.name}\u0000${b.id}`, 'pt-BR'));
}
