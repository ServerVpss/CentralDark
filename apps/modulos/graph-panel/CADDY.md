# Bloco Caddy do graph-panel

Adicionar como bloco novo, sem alterar os subdomínios existentes:

```caddyfile
grafo.centralldark.com {
  encode gzip zstd
  reverse_proxy 127.0.0.1:3030
}
```

Depois validar e recarregar:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```
