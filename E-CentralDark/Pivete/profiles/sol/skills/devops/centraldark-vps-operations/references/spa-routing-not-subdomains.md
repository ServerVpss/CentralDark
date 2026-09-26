# SPA Routing — centralldark.com is One Domain, Multiple Layers

Session 2026-08-28. CHEFE clarified: "meu site é 1 domínio só várias camadas!"

## Pattern
Single Page Application with client-side routing. `try_files {path} /index.html` — every path layer is resolved by the frontend router, NOT separate backends or subdomains.

## Caddy config
```
centralldark.com, www.centralldark.com {
    try_files {path} /index.html
    ...
}
```

## Implication
Multiple "routes" under the same domain = one backend serving the SPA. Don't confuse path layers with separate services.
