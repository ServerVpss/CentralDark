# Tunnel Gotchas

## Common Errors

### "Error 1016 (Origin DNS Error)"

**Cause:** Tunnel not running or not connected
**Solution:**
```bash
cloudflared tunnel info my-tunnel     # Check status
ps aux | grep cloudflared             # Verify running
journalctl -u cloudflared -n 100      # Check logs
```

### "Self-signed certificate rejected"

**Cause:** Origin using self-signed certificate
**Solution:**
```yaml
originRequest:
  noTLSVerify: true      # Dev only
  caPool: /path/to/ca.pem  # Custom CA
```

### "Connection timeout"

**Cause:** Origin slow to respond or timeout settings too low
**Solution:**
```yaml
originRequest:
  connectTimeout: 60s
  tlsTimeout: 20s
  keepAliveTimeout: 120s
```

### "Tunnel not starting"

**Cause:** Invalid config, missing credentials, or tunnel doesn't exist
**Solution:**
```bash
cloudflared tunnel ingress validate  # Validate config
ls -la ~/.cloudflared/*.json         # Verify credentials
cloudflared tunnel list              # Verify tunnel exists
```

### "Connection already registered"

**Cause:** Multiple replicas with same connector ID or stale connection
**Solution:**
```bash
# Check active connections
cloudflared tunnel info my-tunnel

# Wait 60s for stale connection cleanup, or restart with new connector ID
cloudflared tunnel run my-tunnel
```

### "Tunnel credentials rotated but connections fail"

**Cause:** Old cloudflared processes using expired credentials
**Solution:**
```bash
# Stop all cloudflared processes
pkill cloudflared

# Verify stopped
ps aux | grep cloudflared

# Restart with new credentials
cloudflared tunnel run my-tunnel
```

## Limits

| Resource/Limit | Value | Notes |
|----------------|-------|-------|
| Free tier | Unlimited tunnels | Unlimited traffic |
| Tunnel replicas | 1000 per tunnel | Max concurrent |
| Connection duration | No hard limit | Hours to days |
| Long-lived connections | May drop during updates | WebSocket, SSH, UDP |
| Replica registration | ~5s TTL | Old replica dropped after 5s no heartbeat |
| Token rotation grace | 24 hours | Old tokens work during grace period |

## Best Practices

### Security
1. Use token-based tunnels (config source: cloudflare) for centralized control
2. Enable Access policies for sensitive services
3. Rotate tunnel credentials regularly
4. After rotation: stop all old cloudflared processes within 24h grace period
5. Verify TLS certs (`noTLSVerify: false`)
6. Restrict `bastion` service type

### Performance
1. Run multiple replicas for HA (2-4 typical, load balanced automatically)
2. Replicas share same tunnel UUID, get unique connector IDs
3. Place `cloudflared` close to origin (same network)
4. Use HTTP/2 for gRPC (`http2Origin: true`)
5. Tune keepalive for long-lived connections
6. Monitor connection counts

### Configuration
1. Use environment variables for secrets
2. Version control config files
3. Validate before deploying (`cloudflared tunnel ingress validate`)
4. Test rules (`cloudflared tunnel ingress rule <URL>`)
5. Document rule order (first match wins)

### Operations
1. Monitor tunnel health in dashboard (shows active replicas)
2. Set up disconnect alerts (when replica count drops to 0)
3. Graceful shutdown for config updates
4. Update replicas in rolling fashion (update 1, wait, update next)
5. Keep `cloudflared` updated (1 year support window)
6. Use `--no-autoupdate` in prod; control updates manually

## Debug Mode

```bash
cloudflared tunnel --loglevel debug run my-tunnel
cloudflared tunnel ingress rule https://app.example.com
```

## Migration Strategies

### From Ngrok
```yaml
# Ngrok: ngrok http 8000
# Cloudflare Tunnel:
ingress:
  - hostname: app.example.com
    service: http://localhost:8000
  - service: http_status:404
```

### From VPN
```yaml
# Replace VPN with private network routing
warp-routing:
  enabled: true
```

```bash
cloudflared tunnel route ip add 10.0.0.0/8 my-tunnel
```

Users install WARP client instead of VPN.

});
```

### Secrets Management

```typescript
// ❌ NEVER hardcode secrets
const token = 'ghp_abc123';

// ✅ Use environment secrets
const token = env.GITHUB_TOKEN;

// Pass to sandbox via exec env
const result = await sandbox.exec('git clone ...', {
  env: { GIT_TOKEN: token }
});
```

### Preview URL Security
Preview URLs include auto-generated tokens:
```
https://8080-sandbox-abc123def456.yourdomain.com
```
Token changes on each expose operation, preventing unauthorized access.

## Limits

| Resource | Lite | Standard | Heavy |
|----------|------|----------|-------|
| RAM | 256MB | 512MB | 1GB |
| vCPU | 0.5 | 1 | 2 |

| Operation | Default Timeout | Override |
|-----------|----------------|----------|
| Container provisioning | 30s | `SANDBOX_INSTANCE_TIMEOUT_MS` |
| Port readiness | 90s | `SANDBOX_PORT_TIMEOUT_MS` |
| exec() | 120s | `timeout` option |
| sleepAfter | 10m | `sleepAfter` option |

**Performance**:
- **First deploy**: 2-3 min for container build
- **Cold start**: 2-3s when waking from sleep
- **Bucket mounting**: Production only (FUSE not in dev)

## Production Guide

See: https://developers.cloudflare.com/sandbox/guides/production-deployment/

## Resources

- [Official Docs](https://developers.cloudflare.com/sandbox/)
- [API Reference](https://developers.cloudflare.com/sandbox/api/)
- [Examples](https://github.com/cloudflare/sandbox-sdk/tree/main/examples)
- [npm Package](https://www.npmjs.com/package/@cloudflare/sandbox)
- [Discord Support](https://discord.cloudflare.com)
ticipants.joined.on(event, (data) => console.log(`[participants] ${event}:`, data)));
meeting.chat.on('chatUpdate', (data) => console.log('[chat] chatUpdate:', data));
```

## Security & Performance

### Security: Do NOT
- Expose `CLOUDFLARE_API_TOKEN` in client code, hardcode credentials in frontend
- Reuse participant tokens, store tokens in localStorage without encryption
- Allow client-side meeting creation

### Security: DO
- Generate tokens server-side only, use HTTPS, implement rate limiting
- Validate user auth before generating tokens, use `custom_participant_id` to map to your user system
- Set appropriate preset permissions per user role, rotate API tokens regularly

### Performance
- **CPU**: Lower video resolution/frameRate, disable video for audio-only, use `meeting.participants.active` for large meetings, implement virtual scrolling
- **Bandwidth**: Set max resolution in `mediaConfiguration`, disable screenshare audio if unneeded, use audio-only mode, implement adaptive bitrate
- **Memory**: Clean up event listeners on unmount, call `meeting.leave()` when done, don't store large participant arrays

## In This Reference
- [README.md](README.md) - Overview, core concepts, quick start
- [configuration.md](configuration.md) - SDK config, presets, wrangler setup
- [api.md](api.md) - Client SDK APIs, REST endpoints
- [patterns.md](patterns.md) - Common patterns, React hooks, backend integration
