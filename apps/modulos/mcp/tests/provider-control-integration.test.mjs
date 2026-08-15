import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (relative) => fs.readFileSync(path.resolve(here, relative), "utf8");

const bridge = read("../src/provider-admin-bridge.js");
const index = read("../src/index.js");
const adapter = read("../src/modes/admin/tools/admin-provider-control.js");
const dispatcher = read("../src/tools/core/mcp-admin.js");
const migration = read("../../hub/supabase/migrations/20260815_provider_control_plane.sql");
const ui = read("../../../../src/apps/modulos/telepainel/components/cofre/ProviderControlPlane.tsx");
const cofre = read("../../../../src/apps/modulos/telepainel/pages/Cofre.tsx");

test("Cofre reaproveita a rota existente e renderiza o cockpit sem segundo painel", () => {
  assert.match(cofre, /<TabsTrigger value="infra">/);
  assert.match(cofre, /<ProviderControlPlane\s*\/>/);
  assert.doesNotMatch(cofre, /BillingV2|ProviderV2|SecurityV2/);
});

test("browser usa JWT HUB e nunca recebe chave de provider ou ponte de agente", () => {
  assert.match(ui, /supabase\.auth\.getSession\(\)/);
  assert.match(ui, /Authorization: `Bearer \$\{accessToken\}`/);
  assert.doesNotMatch(ui, /x-ponte-chave/i);
  assert.doesNotMatch(ui, /CONTABO_CLIENT_SECRET|CONTABO_API_PASSWORD|CLOUDFLARE_API_TOKEN/);
  assert.doesNotMatch(bridge, /x-ponte-chave/i);
});

test("bridge revalida usuario + admin no HUB e limita chamada a provider tools", () => {
  assert.match(bridge, /\/auth\/v1\/user/);
  assert.match(bridge, /\/rest\/v1\/rpc\/has_role/);
  assert.match(bridge, /PROVIDER_TOOLS/);
  assert.match(bridge, /mcp_admin_call/);
  assert.match(index, /app\.post\("\/admin\/provider", providerAdminBridge\)/);
});

test("provider adapter nao aceita URL arbitraria e usa bases oficiais fixas", () => {
  assert.match(adapter, /https:\/\/api\.cloudflare\.com\/client\/v4/);
  assert.match(adapter, /https:\/\/api\.contabo\.com/);
  assert.match(adapter, /PROVIDER_QUERY_PARAM_NOT_ALLOWED/);
  assert.match(adapter, /PROVIDER_INPUT_CONTAINS_SENSITIVE_MATERIAL/);
  assert.doesNotMatch(adapter, /params\.url|input\.url|endpointUrl/);
});

test("dispatcher unico consome provider tools; nao existe segundo MCP", () => {
  assert.match(dispatcher, /adminProviderControlTools/);
  assert.match(dispatcher, /\.\.\.adminProviderControlTools/);
  assert.match(dispatcher, /name: "mcp_admin_call"/);
});

test("ledger e budget ficam no centraldark_private com deny direto ao browser", () => {
  assert.match(migration, /centraldark_private\.provider_operation_receipt/);
  assert.match(migration, /centraldark_private\.provider_budget/);
  assert.match(migration, /enable row level security/gi);
  assert.match(migration, /revoke all on centraldark_private\.provider_operation_receipt from public, anon, authenticated/);
  assert.match(migration, /revoke all on centraldark_private\.provider_budget from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.reserve_provider_operation[\s\S]*to service_role/);
  assert.match(migration, /grant execute on function public\.finalize_provider_operation[\s\S]*to service_role/);
  assert.doesNotMatch(migration, /card_number|payment_nonce|client_secret|api_password/);
});

test("budget guard nasce 80/100/120 e nao vira autorizacao de gasto", () => {
  assert.match(migration, /warn_percent numeric\(7,2\) not null default 80/);
  assert.match(migration, /alert_percent numeric\(7,2\) not null default 100/);
  assert.match(migration, /block_optional_percent numeric\(7,2\) not null default 120/);
  assert.match(ui, /nunca vira autorização automática de compra/);
});

test("mutacao continua fail-closed em duas camadas", () => {
  assert.match(adapter, /QUARANTINED_UNTIL_RUNTIME_COMPENSATION_PROVEN/);
  assert.match(adapter, /PROVIDER_MUTATION_RUNTIME_ENABLED/);
  assert.match(adapter, /PROVIDER_MUTATION_RUNTIME_UNPROVEN/);
  assert.match(dispatcher, /guardDestructive/);
  assert.match(dispatcher, /confirmAdmin/);
});
