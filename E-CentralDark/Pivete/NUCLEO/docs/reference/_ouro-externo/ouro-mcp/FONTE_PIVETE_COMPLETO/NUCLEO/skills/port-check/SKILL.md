---
name: port-check
description: Verify TCP port listening and localhost connectivity.
version: 1.0
author: Hermes
tags: [network, troubleshooting, verification]
---
# Port Availability Verification

## When to use
Use when you need to confirm whether a specific TCP port is actively listening on the local machine (e.g., to verify a service is up before proceeding with further steps). Also verify that the service has been properly built if it requires a production build (e.g., Next.js apps) before starting.

## Steps
1. **Ensure the service is built** (if applicable). For Next.js apps, run `npm run build` (or the appropriate build script) and verify that the output directory (e.g., `.build/next` or `dist`) exists.
2. **Check listening state with netstat**  
   Run: `netstat -ano | findstr :<PORT>`  
   - If output shows a line with `LISTENING` and the port, the port is bound.  
   - If no output or exit code 1, nothing is listening.

3. **Test connectivity with curl**  
   Run: `curl -s http://127.0.0.1:<PORT>/ || echo "curl failed"`  
   - A successful request returns data (even empty) with exit code 0.  
   - Failure (no response, timeout, or error message) indicates the port is not reachable.

4. **Interpret results**  
   - **Both netstat shows LISTENING and curl succeeds** → Service is up and responding.  
   - **Netstat shows LISTENING but curl fails** → Service bound but not responding (may need different endpoint or authentication).  
   - **Netstat shows nothing** → No process is listening; start the service or verify configuration.

## Pitfalls
- Do not confuse a process bound to `0.0.0.0` vs `127.0.0.1`; `findstr` will catch both.  
- Some services may listen on IPv6 only; check `[::]:<PORT>` if IPv4 netstat is empty.  
- Firewall rules may block curl even if the process is listening; netstat will still show LISTENING.

## References
- See `references/netstat-curl-examples.md` for sample outputs and variations.