# OUTRO - buildpack-mapping.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\render\skills\render-migrate-from-heroku\references\buildpack-mapping.md
**SHA:** 70efd55e8059bb13
**Timestamp:** 2026-08-26T18:42:42.593852
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - Next.js: `npm install && npm run build` (start: `npm start` or `next start`)

### Ouro Bruto (primeiros 5000 chars)
```
# Buildpack, Procfile, and Build Command Mapping

## Buildpack → Render Runtime + Build Command

Render needs explicit `buildCommand` and `startCommand`. Determine the runtime from local project files (dependency files, Procfile), or from Heroku buildpack URLs if available via MCP or `app.json`. Use these defaults, then refine based on the app's actual Procfile and package config.

### Node.js

| Buildpack | `heroku/nodejs` or `heroku-community/nodejs` |
|-----------|----------------------------------------------|
| Render runtime | `node` |
| Default build command | `npm install && npm run build` |
| Fallback build (no build script) | `npm install` |
| Detection | Check `package.json` for `build` script. If missing, use fallback. |

**Common variations:**
- Yarn: `yarn install && yarn build` (detect via `yarn.lock` presence)
- pnpm: `pnpm install && pnpm run build` (detect via `pnpm-lock.yaml`)
- TypeScript without build script: `npm install && npx tsc`
- Next.js: `npm install && npm run build` (start: `npm start` or `next start`)
- Vite/CRA (static): use `create_static_site` instead, publishPath `dist` or `build`

### Python

| Buildpack | `heroku/python` |
|-----------|-----------------|
| Render runtime | `python` |
| Default build command | `pip install -r requirements.txt` |
| Django build | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| Detection | Check for `requirements.txt`, `Pipfile`, or `pyproject.toml` |

**Common variations:**
- Pipenv: `pip install pipenv && pipenv install`
- Poetry: `pip install poetry && poetry install`
- Django: look for `collectstatic` in Procfile or `django` in requirements
- FastAPI/Flask: straightforward `pip install -r requirements.txt`

### Ruby

| Buildpack | `heroku/ruby` |
|-----------|---------------|
| Render runtime | `ruby` |
| Default build command | `bundle install` |
| Rails build | `bundle install && bundle exec rake assets:precompile` |
| Detection | Check for `Gemfile`. If `rails` gem present, use Rails build. |

### Go

| Buildpack | `heroku/go` |
|-----------|-------------|
| Render runtime | `go` |
| Default build command | `go build -o app .` |
| Detection | Check for `go.mod` |

### Rust

| Buildpack | `emk/rust` or custom |
|-----------|----------------------|
| Render runtime | `rust` |
| Default build command | `cargo build --release` |
| Start command | `./target/release/<binary-name>` |

### Java / Scala / PHP / Multi-buildpack

| Buildpack | Any not listed above |
|-----------|----------------------|
| Render runtime | `docker` |
| Action | Tell user they need a Dockerfile. Offer to generate one. |

## Procfile Parsing

Heroku Procfiles define process types. Extract these to map to Render services.

### Format
```
<process-type>: <command>
```

### Mapping Rules

| Procfile entry | Render service type | Render MCP tool | `startCommand` |
|---------------|--------------------|-----------------|-----------------| 
| `web: <cmd>` | Web Service | `create_web_service` | `<cmd>` |
| `worker: <cmd>` | Background Worker | Blueprint `type: worker` | `<cmd>` (MCP cannot create workers) |
| `clock: <cmd>` | Cron Job | `create_cron_job` | `<cmd>` (ask user for schedule) |
| `release: <cmd>` | Pre-deploy command | N/A | Add as build command suffix |

### Common Procfile Patterns

**Node.js:**
```
web: npm start
web: node server.js
web: next start -p $PORT
worker: node worker.js
```

**Python:**
```
web: gunicorn app:app
web: gunicorn myproject.wsgi --log-file -
web: uvicorn main:app --host 0.0.0.0 --port $PORT
worker: celery -A myproject worker
clock: celery -A myproject beat
release: python manage.py migrate
```

**Ruby:**
```
web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq
release: bundle exec rake db:migrate
```

### Runtime Version Handling

Do not assume or fabricate specific runtime versions for Render. Instead, carry over the version the Heroku app already uses:

| Heroku file | What it contains | Render equivalent |
|---|---|---|
| `runtime.txt` | `python-3.11.6` | Set `PYTHON_VERSION=3.11.6` env var |
| `runtime.txt` | `ruby-3.2.2` | Render auto-detects from `ruby-3.2.2` in `Gemfile` |
| `.node-version` or `engines` in `package.json` | `18.17.0` | Set `NODE_VERSION=18.17.0` env var |
| `.go-version` or `go.mod` | `1.21` | Render auto-detects from `go.mod` |

**Rules:**
- If the Heroku app pins a version via `runtime.txt` or similar, include the equivalent env var in the Blueprint
- If no version is pinned, do not specify one — Render uses its own defaults
- **Never state what Render's default version is** — it changes over time and any claim may be wrong

### PORT Handling

Heroku sets `$PORT` dynamically. Render also sets `PORT` (default 10000). Most Procfile commands work as-is. If the command hardcodes a port, it needs updating.

- `--port $PORT` → works on both platforms
- `--port 5000` → change to `--port $PORT` or `--port 10000`
- Render auto-detects the port for common frameworks

### R
```