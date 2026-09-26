# MISSAO - gotchas.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\cloudflare\skills\cloudflare\references\pulumi\gotchas.md
**SHA:** 96ad9f0bb2204a96
**Timestamp:** 2026-08-26T18:31:04.304699
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Pattern: Export Pulumi config to wrangler.toml

### Ouro Bruto (primeiros 5000 chars)
```
# Troubleshooting & Best Practices

## Common Errors

### "No bundler/build step" - Pulumi uploads raw code

**Problem:** Worker fails with "Cannot use import statement outside a module"
**Cause:** Pulumi doesn't bundle Worker code - uploads exactly what you provide
**Solution:** Build Worker BEFORE Pulumi deploy

```typescript
// WRONG: Pulumi won't bundle this
const worker = new cloudflare.WorkerScript("worker", {
    content: fs.readFileSync("./src/index.ts", "utf8"), // Raw TS file
});

// RIGHT: Build first, then deploy
import * as command from "@pulumi/command";
const build = new command.local.Command("build", {
    create: "npm run build",
    dir: "./worker",
});
const worker = new cloudflare.WorkerScript("worker", {
    content: build.stdout.apply(() => fs.readFileSync("./worker/dist/index.js", "utf8")),
}, {dependsOn: [build]});
```

### "wrangler.toml not consumed" - Config drift

**Problem:** Local wrangler dev works, Pulumi deploy fails
**Cause:** Pulumi ignores wrangler.toml - must duplicate config
**Solution:** Generate wrangler.toml from Pulumi or keep synced manually

```typescript
// Pattern: Export Pulumi config to wrangler.toml
const workerConfig = {
    name: "my-worker",
    compatibilityDate: "2025-01-01",
    compatibilityFlags: ["nodejs_compat"],
};

new command.local.Command("generate-wrangler", {
    create: pulumi.interpolate`cat > wrangler.toml <<EOF
name = "${workerConfig.name}"
compatibility_date = "${workerConfig.compatibilityDate}"
compatibility_flags = ${JSON.stringify(workerConfig.compatibilityFlags)}
EOF`,
});
```

### "False no-changes detection" - Content SHA unchanged

**Problem:** Worker code updated, Pulumi says "no changes"
**Cause:** Content hash identical (whitespace/comment-only change)
**Solution:** Add build timestamp or version to force update

```typescript
const version = Date.now().toString();
const worker = new cloudflare.WorkerScript("worker", {
    content: code,
    plainTextBindings: [{name: "VERSION", text: version}], // Forces new deployment
});
```

### "D1 migrations don't run on pulumi up"

**Problem:** Database schema not applied after D1 database created
**Cause:** Pulumi creates database but doesn't run migrations
**Solution:** Use Command resource with dependsOn

```typescript
const db = new cloudflare.D1Database("db", {accountId, name: "mydb"});

// Run migrations after DB created
const migration = new command.local.Command("migrate", {
    create: pulumi.interpolate`wrangler d1 execute ${db.name} --file ./schema.sql`,
}, {dependsOn: [db]});

// Worker depends on migrations
const worker = new cloudflare.WorkerScript("worker", {
    d1DatabaseBindings: [{name: "DB", databaseId: db.id}],
}, {dependsOn: [migration]});
```

### "Missing required property 'accountId'"

**Problem:** `Error: Missing required property 'accountId'`
**Cause:** Account ID not provided in resource configuration
**Solution:** Add to stack config

```yaml
# Pulumi.<stack>.yaml
config:
  cloudflare:accountId: "abc123..."
```

### "Binding name mismatch"

**Problem:** Worker fails with "env.MY_KV is undefined"
**Cause:** Binding name in Pulumi != name in Worker code
**Solution:** Match exactly (case-sensitive)

```typescript
// Pulumi
kvNamespaceBindings: [{name: "MY_KV", namespaceId: kv.id}]

// Worker code
export default { async fetch(request, env) { await env.MY_KV.get("key"); }}
```

### "API token permissions insufficient"

**Problem:** `Error: authentication error (10000)`
**Cause:** Token lacks required permissions
**Solution:** Grant token permissions: Account.Workers Scripts:Edit, Account.Account Settings:Read

### "Resource not found after import"

**Problem:** Imported resource shows as changed on next `pulumi up`
**Cause:** State mismatch between actual resource and Pulumi config
**Solution:** Check property names/types match exactly

```bash
pulumi import cloudflare:index/workerScript:WorkerScript my-worker <account_id>/<worker_name>
pulumi preview # If shows changes, adjust Pulumi code to match actual resource
```

### "v6.x Worker versioning confusion"

**Problem:** Worker deployed but not receiving traffic
**Cause:** v6.x requires Worker + WorkerVersion + WorkersDeployment (3 resources)
**Solution:** Use WorkerScript (auto-versioning) OR full versioning pattern

```typescript
// SIMPLE: WorkerScript auto-versions (default behavior)
const worker = new cloudflare.WorkerScript("worker", {
    accountId, name: "my-worker", content: code,
});

// ADVANCED: Manual versioning for gradual rollouts (v6.x)
const worker = new cloudflare.Worker("worker", {accountId, name: "my-worker"});
const version = new cloudflare.WorkerVersion("v1", {
    accountId, workerId: worker.id, content: code, compatibilityDate: "2025-01-01",
});
const deployment = new cloudflare.WorkersDeployment("prod", {
    accountId, workerId: worker.id, versionId: version.id,
});
```

## Best Practices

1. **Always set compatibilityDate** - Locks Worker behavior, prevents breaking changes
2. **Build bef
```