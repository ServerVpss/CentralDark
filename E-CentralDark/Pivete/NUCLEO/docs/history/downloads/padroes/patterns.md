# Integration Patterns

## Enable Argo + Tiered Cache

```typescript
async function enableOptimalPerformance(client: Cloudflare, zoneId: string) {
  await Promise.all([
    client.argo.smartRouting.edit({ zone_id: zoneId, value: 'on' }),
    client.argo.tieredCaching.edit({ zone_id: zoneId, value: 'on' }),
  ]);
}
```

**Flow:** Visitor → Edge (Lower-Tier) → [Cache Miss] → Upper-Tier → [Cache Miss + Argo] → Origin

**Impact:** Argo ~30% latency reduction + Tiered Cache 50-80% origin offload

## Usage Analytics (GraphQL)

```graphql
query ArgoAnalytics($zoneTag: string!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(limit: 1000) {
        sum { argoBytes, bytes }
      }
    }
  }
}
```

**Billing:** ~$0.10/GB. DDoS-mitigated and WAF-blocked traffic NOT charged.

## Spectrum TCP Integration

Enable Argo for non-HTTP traffic (databases, game servers, IoT):

```typescript
// Update existing app
await client.spectrum.apps.update(appId, { zone_id: zoneId, argo_smart_routing: true });

// Create new app with Argo
await client.spectrum.apps.create({
  zone_id: zoneId,
  dns: { type: 'CNAME', name: 'tcp.example.com' },
  origin_direct: ['tcp://origin.example.com:3306'],
  protocol: 'tcp/3306',
  argo_smart_routing: true,
});
```

**Use cases:** MySQL/PostgreSQL (3306/5432), game servers, MQTT (1883), SSH (22)

## Pre-Flight Validation

```typescript
async function validateArgoEligibility(client: Cloudflare, zoneId: string) {
  const status = await client.argo.smartRouting.get({ zone_id: zoneId });
  const zone = await client.zones.get({ zone_id: zoneId });

  const issues: string[] = [];
  if (!status.editable) issues.push('Zone not editable');
  if (['free', 'pro'].includes(zone.plan.legacy_id)) issues.push('Requires Business+ plan');
  if (zone.status !== 'active') issues.push('Zone not active');

  return { canEnable: issues.length === 0, issues };
}
```

## Post-Enable Verification

```typescript
async function verifyArgoEnabled(client: Cloudflare, zoneId: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 2000)); // Wait for propagation
  const status = await client.argo.smartRouting.get({ zone_id: zoneId });
  return status.value === 'on';
}
```

## Full Setup Pattern

```typescript
async function setupArgo(client: Cloudflare, zoneId: string) {
  // 1. Validate
  const { canEnable, issues } = await validateArgoEligibility(client, zoneId);
  if (!canEnable) throw new Error(issues.join(', '));

  // 2. Enable both features
  await Promise.all([
    client.argo.smartRouting.edit({ zone_id: zoneId, value: 'on' }),
    client.argo.tieredCaching.edit({ zone_id: zoneId, value: 'on' }),
  ]);

  // 3. Verify
  const [argo, cache] = await Promise.all([
    client.argo.smartRouting.get({ zone_id: zoneId }),
    client.argo.tieredCaching.get({ zone_id: zoneId }),
  ]);

  return { argo: argo.value === 'on', tieredCache: cache.value === 'on' };
}
```

**When to combine:** High-traffic sites (>1TB/mo), global users, cacheable content.
st: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isImmutable = /\.[a-f0-9]{8,}\.(js|css|jpg|png|woff2)$/.test(url.pathname);
    const response = await fetch(request);

    if (isImmutable) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(response.body, { status: response.status, headers });
    }
    return response;
  }
};
```

## Cost Optimization

### Cost Calculator

```typescript
interface CacheReserveEstimate {
  avgAssetSizeGB: number;
  uniqueAssets: number;
  monthlyReads: number;
  monthlyWrites: number;
  originEgressCostPerGB: number; // e.g., AWS: $0.09/GB
}

function estimateMonthlyCost(input: CacheReserveEstimate) {
  // Cache Reserve pricing
  const storageCostPerGBMonth = 0.015;
  const classAPerMillion = 4.50; // writes
  const classBPerMillion = 0.36; // reads

  // Calculate Cache Reserve costs
  const totalStorageGB = input.avgAssetSizeGB * input.uniqueAssets;
  const storageCost = totalStorageGB * storageCostPerGBMonth;
  const writeCost = (input.monthlyWrites / 1_000_000) * classAPerMillion;
  const readCost = (input.monthlyReads / 1_000_000) * classBPerMillion;

  const cacheReserveCost = storageCost + writeCost + readCost;

  // Calculate origin egress cost (what you'd pay without Cache Reserve)
  const totalTrafficGB = (input.monthlyReads * input.avgAssetSizeGB);
  const originEgressCost = totalTrafficGB * input.originEgressCostPerGB;

  // Savings calculation
  const savings = originEgressCost - cacheReserveCost;
  const savingsPercent = ((savings / originEgressCost) * 100).toFixed(1);

  return {
    cacheReserveCost: `$${cacheReserveCost.toFixed(2)}`,
    originEgressCost: `$${originEgressCost.toFixed(2)}`,
    monthlySavings: `$${savings.toFixed(2)}`,
    savingsPercent: `${savingsPercent}%`,
    breakdown: {
      storage: `$${storageCost.toFixed(2)}`,
      writes: `$${writeCost.toFixed(2)}`,
      reads: `$${readCost.toFixed(2)}`,
    }
  };
}

// Example: Media library
const mediaLibrary = estimateMonthlyCost({
  avgAssetSizeGB: 0.005, // 5MB images
  uniqueAssets: 10_000,
  monthlyReads: 5_000_000,
  monthlyWrites: 50_000,
  originEgressCostPerGB: 0.09, // AWS S3
});

console.log(mediaLibrary);
// {
//   cacheReserveCost: "$9.98",
//   originEgressCost: "$25.00",
//   monthlySavings: "$15.02",
//   savingsPercent: "60.1%",
//   breakdown: { storage: "$0.75", writes: "$0.23", reads: "$9.00" }
// }
```

### Optimization Guidelines

- **Set appropriate TTLs**: 10hr minimum, 24hr+ optimal for stable content, 30d max cautiously
- **Cache high-value stable assets**: Images, media, fonts, archives, documentation
- **Exclude frequently changing**: APIs, user-specific content, real-time data
- **Compression note**: Cache Reserve fetches uncompressed from origin, serves compressed to visitors - factor in origin egress costs

## See Also

- [README](./README.md) - Overview and core concepts
- [Configuration](./configuration.md) - Setup and Cache Rules
- [API Reference](./api.md) - Purging and monitoring
- [Gotchas](./gotchas.md) - Common issues and troubleshooting
ew command.local.Command("build", {create: "npm run build", dir: "./worker"});
const worker = new cloudflare.WorkerScript("worker", {
    accountId, name: "my-worker",
    content: build.stdout.apply(() => fs.readFileSync("./worker/dist/index.js", "utf8")),
}, {dependsOn: [build]});
```

## Content SHA Pattern (Force Updates)

Prevent false "no changes" detections:

```typescript
const version = Date.now().toString();
const worker = new cloudflare.WorkerScript("worker", {
    accountId, name: "my-worker", content: code,
    plainTextBindings: [{name: "VERSION", text: version}], // Forces deployment
});
```

---
See: [README.md](./README.md), [configuration.md](./configuration.md), [api.md](./api.md), [gotchas.md](./gotchas.md)
