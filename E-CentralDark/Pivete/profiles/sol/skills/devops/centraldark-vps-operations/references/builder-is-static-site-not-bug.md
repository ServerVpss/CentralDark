# Builder is a Static Site — Not a Bug

## Diagnosis

`builder.centralldark.com` has no backend — and that's correct.

### Evidence

```
apps/web/dist/
├── assets/
├── data/
├── favicon.ico
├── index.html
├── manifest.json
├── placeholder.svg
└── robots.txt
```

- No `package.json`
- No `vite.config.*`
- No build system
- Static HTML/assets only

### Why :5174 is dead

`:5174` is the Vite dev-server port. It only exists when someone runs `npm run dev`. There is no production backend for this domain.

### History

The Caddy config pointed `builder.centralldark.com` → `:5174` expecting a Vite dev server. But no one was running `npm run dev`. The domain was "born dead."

### Lesson

Don't invent backends. If a domain has no `package.json`, no build system, and only static files, it's a static site. Either:
1. Serve it with `file_server` from the static dir
2. Or leave the domain unconfigured

Don't point Caddy to a Vite dev port and expect it to work in production.
