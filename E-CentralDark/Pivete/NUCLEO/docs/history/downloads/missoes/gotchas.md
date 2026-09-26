# DDoS Gotchas

## Common Errors

### "False positives blocking legitimate traffic"

**Cause**: Sensitivity too high, wrong action, or missing exceptions
**Solution**:
1. Lower sensitivity for specific rule/category
2. Use `log` action first to validate (Enterprise Advanced)
3. Add exception with custom expression (e.g., allowlist IPs)
4. Query flagged requests via GraphQL Analytics API to identify patterns

### "Attacks getting through"

**Cause**: Sensitivity too low or wrong action
**Solution**: Increase to `default` sensitivity and use `block` action:
```typescript
const config = {
  rules: [{
    expression: "true",
    action: "execute",
    action_parameters: { id: managedRulesetId, overrides: { sensitivity_level: "default", action: "block" } },
  }],
};
```

### "Adaptive rules not working"

**Cause**: Insufficient traffic history (needs 7 days)
**Solution**: Wait for baseline to establish, check dashboard for adaptive rule status

### "Zone override ignored"

**Cause**: Account overrides conflict with zone overrides
**Solution**: Configure at zone level OR remove zone overrides to use account-level

### "Log action not available"

**Cause**: Not on Enterprise Advanced DDoS plan
**Solution**: Use `managed_challenge` with low sensitivity for testing

### "Rule limit exceeded"

**Cause**: Too many override rules (Free/Pro/Business: 1, Enterprise Advanced: 10)
**Solution**: Combine conditions in single expression using `and`/`or`

### "Cannot override rule"

**Cause**: Rule is read-only
**Solution**: Check API response for read-only indicator, use different rule

### "Cannot disable DDoS protection"

**Cause**: DDoS managed rulesets cannot be fully disabled (always-on protection)
**Solution**: Set `sensitivity_level: "eoff"` for minimal mitigation

### "Expression not allowed"

**Cause**: Custom expressions require Enterprise Advanced plan
**Solution**: Use `expression: "true"` for all traffic, or upgrade plan

### "Managed ruleset not found"

**Cause**: Zone/account doesn't have DDoS managed ruleset, or incorrect phase
**Solution**: Verify ruleset exists via `client.rulesets.list()`, check phase name (`ddos_l7` or `ddos_l4`)

## API Error Codes

| Error Code | Message | Cause | Solution |
|------------|---------|-------|----------|
| 10000 | Authentication error | Invalid/missing API token | Check token has DDoS permissions |
| 81000 | Ruleset validation failed | Invalid rule structure | Verify `action_parameters.id` is managed ruleset ID |
| 81020 | Expression not allowed | Custom expressions on wrong plan | Use `"true"` or upgrade to Enterprise Advanced |
| 81021 | Rule limit exceeded | Too many override rules | Reduce rules or upgrade (Enterprise Advanced: 10) |
| 81022 | Invalid sensitivity level | Wrong sensitivity value | Use: `default`, `medium`, `low`, `eoff` |
| 81023 | Invalid action | Wrong action for plan | Enterprise Advanced only: `log` action |

## Limits

| Resource/Limit | Free/Pro/Business | Enterprise | Enterprise Advanced |
|----------------|-------------------|------------|---------------------|
| Override rules per zone | 1 | 1 | 10 |
| Custom expressions | ✗ | ✗ | ✓ |
| Log action | ✗ | ✗ | ✓ |
| Adaptive DDoS | ✗ | ✓ | ✓ |
| Traffic history required | - | 7 days | 7 days |

## Tuning Strategy

1. Start with `log` action + `medium` sensitivity
2. Monitor for 24-48 hours
3. Identify false positives, add exceptions
4. Gradually increase to `default` sensitivity
5. Change action from `log` → `managed_challenge` → `block`
6. Document all adjustments

## Best Practices

- Test during low-traffic periods
- Use zone-level for per-site tuning
- Reference IP lists for easier management
- Set appropriate alert thresholds (avoid noise)
- Combine with WAF for layered defense
- Avoid over-tuning (keep config simple)

See [patterns.md](./patterns.md) for progressive rollout examples.
 Error Message | Likely Cause | Fix |
|---------------|--------------|-----|
| `401 Unauthorized` | Missing/invalid token | Check token has catalog+storage permissions |
| `403 Forbidden` | Token lacks storage permissions | Add R2 Storage Bucket Item permission |
| `404 Not Found` | Catalog not enabled or wrong URI | Run `wrangler r2 bucket catalog enable` |
| `409 Conflict` | Table/namespace already exists | Use try/except or load existing |
| `422 Unprocessable Entity` | Schema validation failed | Check type compatibility, required fields |
| `CommitFailedException` | Concurrent write conflict | Add retry logic with backoff |
| `NamespaceAlreadyExistsError` | Namespace exists | Use try/except or load existing |
| `NoSuchTableError` | Table doesn't exist | Check namespace+table name, create first |
| `TypeError: Cannot cast` | PyArrow type mismatch | Cast data to match Iceberg schema |

## Debugging Checklist

When things go wrong, check in order:

1. ✅ **Catalog enabled:** `npx wrangler r2 bucket catalog status <bucket>`
2. ✅ **Token permissions:** Both R2 Data Catalog + R2 Storage in dashboard
3. ✅ **Connection test:** `catalog.list_namespaces()` succeeds
4. ✅ **URI format:** HTTPS, includes `/iceberg/`, correct bucket name
5. ✅ **Warehouse name:** Matches bucket name exactly
6. ✅ **Namespace exists:** Create before `create_table()`
7. ✅ **Enable debug logging:** `logging.basicConfig(level=logging.DEBUG)`
8. ✅ **PyIceberg version:** `pip install --upgrade pyiceberg` (≥0.5.0)
9. ✅ **File health:** Compact if >1000 files or avg <10MB
10. ✅ **Snapshot count:** Expire if >100 snapshots

## Enable Debug Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
# Now operations show HTTP requests/responses
```

## Resources

- [Cloudflare Community](https://community.cloudflare.com/c/developers/workers/40)
- [Cloudflare Discord](https://discord.cloudflare.com) - #r2 channel
- [PyIceberg GitHub](https://github.com/apache/iceberg-python/issues)
- [Apache Iceberg Slack](https://iceberg.apache.org/community/)

## Next Steps

- [patterns.md](patterns.md) - Working examples
- [api.md](api.md) - API reference
: Every request makes network calls to production bindings
**Solution**: Use local bindings for development; reserve `--remote` for final validation

## Common Errors

### "Module not found"
**Cause**: Dependencies not bundled or build output incorrect
**Solution**: Check build output directory, ensure dependencies bundled

### "Binding not found"
**Cause**: Binding not configured or types out of sync
**Solution**: Verify wrangler.jsonc, run `npx wrangler types`

### "Request exceeded CPU limit"
**Cause**: Code execution too slow or heavy compute
**Solution**: Optimize hot paths, upgrade to Workers Paid

### "Script too large"
**Cause**: Bundle size exceeds limit
**Solution**: Tree-shake, use dynamic imports, code-split

### "Too many subrequests"
**Cause**: Exceeded 50 subrequest limit
**Solution**: Batch or reduce fetch calls

### "KV key not found"
**Cause**: Key doesn't exist or wrong namespace
**Solution**: Check namespace matches environment

### "D1 error"
**Cause**: Wrong database_id or missing migrations
**Solution**: Verify config, run `wrangler d1 migrations list`

## Limits Reference (Jan 2026)

| Resource | Free | Paid |
|----------|------|------|
| Functions Requests | 100k/day | Unlimited |
| CPU Time | 10ms/req | 30ms/req |
| Memory | 128MB | 128MB |
| Script Size | 1MB | 10MB |
| Subrequests | 50/req | 1,000/req |
| Deployments | 500/month | 5,000/month |

**Tip**: Hitting CPU limit? Optimize hot paths or upgrade to Workers Paid plan.

[Full limits](https://developers.cloudflare.com/pages/platform/limits/)

## Getting Help

1. Check [Pages Docs](https://developers.cloudflare.com/pages/)
2. Search [Discord #functions](https://discord.com/channels/595317990191398933/910978223968518144)
3. Review [Workers Examples](https://developers.cloudflare.com/workers/examples/)
4. Check framework-specific docs/adapters
