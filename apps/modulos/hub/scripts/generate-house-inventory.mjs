import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHouseInventory, renderInventoryModule } from './house-inventory-core.mjs';
import { buildOperationalInventoryExtras, OPERATIONAL_INVENTORY_SOURCES } from './operational-inventory-extras.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../../..');
const output = path.resolve(repoRoot, 'apps/modulos/hub/src/generated/houseInventory.ts');
const baseInventory = buildHouseInventory(repoRoot);
const extras = buildOperationalInventoryExtras(repoRoot);
const items = [...new Map([...baseInventory.items, ...extras].map((item) => [item.id, item])).values()]
  .sort((a, b) => `${a.group}\u0000${a.name}\u0000${a.id}`.localeCompare(`${b.group}\u0000${b.name}\u0000${b.id}`, 'pt-BR'));
const counts = Object.fromEntries(baseInventory.groups.map((group) => [group, items.filter((item) => item.group === group).length]));
const inventory = {
  ...baseInventory,
  supplemental_sources: OPERATIONAL_INVENTORY_SOURCES,
  supplemental_source_is_authority: false,
  counts,
  total: items.length,
  items,
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, renderInventoryModule(inventory), 'utf8');

console.log(`HOUSE_INVENTORY_GENERATED total=${inventory.total} revision=${inventory.generated_from}`);
for (const group of inventory.groups) console.log(`HOUSE_INVENTORY_${group}=${inventory.counts[group]}`);
console.log(`HOUSE_INVENTORY_SUPPLEMENTAL=${extras.length}`);
