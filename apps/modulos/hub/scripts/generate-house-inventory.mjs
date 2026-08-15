import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHouseInventory, renderInventoryModule } from './house-inventory-core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../../..');
const output = path.resolve(repoRoot, 'apps/modulos/hub/src/generated/houseInventory.ts');
const inventory = buildHouseInventory(repoRoot);

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, renderInventoryModule(inventory), 'utf8');

console.log(`HOUSE_INVENTORY_GENERATED total=${inventory.total} revision=${inventory.generated_from}`);
for (const group of inventory.groups) console.log(`HOUSE_INVENTORY_${group}=${inventory.counts[group]}`);
