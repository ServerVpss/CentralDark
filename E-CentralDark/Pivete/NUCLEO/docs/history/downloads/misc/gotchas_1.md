# KV Gotchas & Troubleshooting

## Common Errors

### "Stale Read After Write"

**Cause:** Eventual consistency means writes may not be immediately visible in other regions
**Solution:** Don't read immediately after write; return confirmation without reading or use the local value you just wrote. Writes visible immediately in same location, ≤60s globally

```typescript
// ❌ BAD: Read immediately after write
await env.KV.put("key", "value");
const value = await env.KV.get("key"); // May be null in other regions!

// ✅ GOOD: Use the value you just wrote
const newValue = "value";
await env.KV.put("key", newValue);
return new Response(newValue); // Don't re-read
```

### "429 Rate Limit on Concurrent Writes"

**Cause:** Multiple concurrent writes to same key exceeding 1 write/second limit
**Solution:** Use sequential writes, unique keys for concurrent operations, or implement retry with exponential backoff

```typescript
async function putWithRetry(
  kv: KVNamespace,
  key: string,
  value: string,
  maxAttempts = 5
): Promise<void> {
  let delay = 1000;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await kv.put(key, value);
      return;
    } catch (err) {
      if (err instanceof Error && err.message.includes("429")) {
        if (i === maxAttempts - 1) throw err;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
}
```

### "Inefficient Multiple Gets"

**Cause:** Making multiple individual get() calls instead of bulk operation
**Solution:** Use bulk get with array of keys: `env.USERS.get(["user:1", "user:2", "user:3"])` to reduce to 1 operation

### "Null Reference Error"

**Cause:** Attempting to use value without checking for null when key doesn't exist
**Solution:** Always handle null returns - KV returns `null` for missing keys, not undefined

```typescript
// ❌ BAD: Assumes value exists
const config = await env.KV.get("config", "json");
return config.theme; // TypeError if null!

// ✅ GOOD: Null checks
const config = await env.KV.get("config", "json");
return config?.theme ?? "default";

// ✅ GOOD: Early return
const config = await env.KV.get("config", "json");
if (!config) return new Response("Not found", { status: 404 });
return new Response(config.theme);
```

### "Negative Lookup Caching"

**Cause:** Keys that don't exist are cached as "not found" for up to 60s
**Solution:** Creating a key after checking won't be visible until cache expires

```typescript
// Check → create pattern has race condition
const exists = await env.KV.get("key"); // null, cached as "not found"
if (!exists) {
  await env.KV.put("key", "value");
  // Next get() may still return null for ~60s due to negative cache
}

// Alternative: Always assume key may not exist, use defaults
const value = await env.KV.get("key") ?? "default-value";
```

## Performance Tips

| Scenario | Recommendation | Why |
|----------|----------------|-----|
| Large values (>1MB) | Use `stream` type | Avoids buffering entire value in memory |
| Many small keys | Coalesce into one JSON object | Reduces operations, improves cache hit rate |
| High write volume | Spread across different keys | Avoid 1 write/second per-key limit |
| Cold reads | Increase `cacheTtl` parameter | Reduces latency for frequently-read data |
| Bulk operations | Use array form of get() | Single operation, better performance |

## Cost Examples

**Free tier:**
- 100K reads/day = 3M/month ✅
- 1K writes/day = 30K/month ✅
- 1GB storage ✅

**Example paid workload:**
- 10M reads/month = $5.00
- 100K writes/month = $0.50
- 1GB storage = $0.50
- **Total: ~$6/month**

## Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Key size | 512 bytes | Maximum key length |
| Value size | 25 MiB | Maximum value; 413 error if exceeded |
| Metadata size | 1024 bytes | Maximum metadata per key |
| cacheTtl minimum | 60s | Minimum cache TTL |
| Write rate per key | 1 write/second | All plans; 429 error if exceeded |
| Propagation time | ≤60s | Global propagation time |
| Bulk get max | 100 keys | Maximum keys per bulk operation |
| Operations per Worker | 1,000 | Per request (bulk counts as 1) |
| Reads pricing | $0.50 per 10M | Per million reads |
| Writes pricing | $5.00 per 1M | Per million writes |
| Deletes pricing | $5.00 per 1M | Per million deletes |
| Storage pricing | $0.50 per GB-month | Per GB per month |
| Base64 encoding | Required | For binary files |

## API Rate Limits

| Limit Type | Value | Scope |
|------------|-------|-------|
| Client API | 1200 requests / 5 min | Per account |
| Client API | 200 requests / sec | Per IP address |
| GraphQL | Varies by query cost | Query complexity |

See [Cloudflare API Rate Limits](https://developers.cloudflare.com/fundamentals/api/reference/limits/) for details.

## Operational Limits

| Operation | Limit | Notes |
|-----------|-------|-------|
| CPU time (custom limits) | Up to Workers plan limit | Set per-invocation in dispatch worker |
| Subrequests (custom limits) | Up to Workers plan limit | Set per-invocation in dispatch worker |
| Outbound Worker subrequests | Not intercepted for DO/mTLS | Only regular fetch() calls |
| TCP sockets with outbound | Disabled | `connect()` API unavailable |

See [README.md](./README.md), [configuration.md](./configuration.md), [api.md](./api.md), [patterns.md](./patterns.md)
API rate limit | 1200 req/5min | Per token |
| Health check delay | 6 hours | New maintenance alert subscriptions |
om/workers/wrangler/commands/
- Examples: https://github.com/cloudflare/workers-sdk/tree/main/templates
- Discord: https://discord.gg/cloudflaredev

## See Also

- [README.md](./README.md) - Commands
- [configuration.md](./configuration.md) - Config
- [api.md](./api.md) - Programmatic API
- [patterns.md](./patterns.md) - Workflows
| 300s | 300s | Set via `limits.cpu_ms` |
| DO classes | 100 | 500 | Distinct DO class definitions |
| SQL columns | 100 | 100 | Per table |
| SQL statement size | 100 KB | 100 KB | Max SQL query size |
| WebSocket message size | 32 MiB | 32 MiB | Per message |
| Request throughput | ~1K req/s | ~1K req/s | Per DO (soft limit - shard for more) |
| Alarms per DO | 1 | 1 | Use queue pattern for multiple events |
| Total DOs | Unlimited | Unlimited | Create as many instances as needed |
| WebSockets | Unlimited | Unlimited | Within 128MB memory limit per DO |
| Memory per DO | 128 MB | 128 MB | In-memory state + WebSocket buffers |

## Hibernation Caveats

1. **Memory cleared** - All in-memory variables lost; reconstruct from storage or `deserializeAttachment()`
2. **Constructor reruns** - Runs on wake; avoid expensive operations, use lazy initialization
3. **No guarantees** - DO may evict instead of hibernate; design for both
4. **Attachment limit** - `serializeAttachment()` data must be JSON-serializable, keep small
5. **Alarm wakes DO** - Alarm prevents hibernation until handler completes
6. **WebSocket state not automatic** - Must explicitly persist with `serializeAttachment()` or storage

## See Also

- **[Patterns](./patterns.md)** - Workarounds for common limitations
- **[API](./api.md)** - Storage limits and quotas
- **[Configuration](./configuration.md)** - Setting CPU limits
ion: when the element sits *below* the conceptual pivot in scene Y, the literal CSS value places the pivot even further below, and the orbit ends up entirely off-screen.

**Fix**: If a rotation animation's element is never on-screen during the loop, try negating `(transformOrigin.y - 1) * 100%` as the CSS Y. For `transformOrigin.y = 3.098`, that's `-209.8%`. Verify by watching one full loop. This is a debugging check, not a definitive rule — the underlying resolution logic isn't fully documented.

## Static assets bake the t=0 state of animated properties

**Symptom**: An element with an opacity (or transform) animation that *starts* at zero / off-screen ships as a permanently-invisible asset. Animating the parent's opacity back to 1 doesn't recover visibility — multiplied by the SVG group's baked `opacity="0"`, the product stays 0.

**Why**: Figma's asset exporter renders the design at timeline t=0 and serializes the result. Properties animated from an invisible initial state (opacity 0, off-canvas translate, scale 0) are present in the static asset.

**Fix**: When an animated element renders blank despite a correct opacity animation, inspect the asset bytes (`curl <asset-url>`) and check for hardcoded `opacity` / `transform` on the root group. Either inline the SVG with the static values stripped, or move the opacity animation onto a wrapper element whose initial state is `opacity: 1`.

## Performance

- Apply `will-change` only to elements that are actively animating, not everywhere — it forces GPU layer promotion and costs memory.
- Never approximate a spring as a cubic-bezier. Springs are physics; beziers are shape, and the feel differs. For a 2-keyframe track use Motion.dev's `type: "spring"`; for 3+ keyframes keep the baked easing array.

## Don't preserve these: no known issues

If the tool returns `codeSnippets`, trust them. The gotchas above describe cases where (a) the tool doesn't emit snippets, (b) the runtime has a known limitation, or (c) the LLM is adapting snippets to a different library and needs to preserve non-obvious semantics.

## Related

- Back to [../SKILL.md](../SKILL.md)
- [framework-recommendations.md](framework-recommendations.md) for library-specific easing/origin syntax
- [unsupported-and-fallbacks.md](unsupported-and-fallbacks.md) for features without cleanup export paths
