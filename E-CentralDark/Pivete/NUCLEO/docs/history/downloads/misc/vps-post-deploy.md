# OUTRO - vps-post-deploy.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\infra\configs\vps-post-deploy.yml
**SHA:** ef43a08ba4bc8cfc
**Timestamp:** 2026-08-26T19:32:49.978987
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: VPS Post-Deploy

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'scripts/post-deploy.sh'
      - 'clone-deck-webhook-deploy/**'
      - 'server/src/bridge/**'
      - 'integracoes/telegram/**'

jobs:
  signal:
    name: Signal VPS to run post-deploy
    runs-on: ubuntu-latest
    timeout-minutes: 2
    
    steps:
      - name: Signal via Supabase
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
        run: |
          # Criar uma entrada em system_logs que sinaliza post-deploy
          sudo apt-get install -y -qq postgresql-client > /dev/null 2>&1
          psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
            INSERT INTO public.system_logs (action, level, created_at)
            VALUES ('deploy.post_deploy_requested', 'info', NOW())
          " && echo "✅ Post-deploy sinalizado via Supabase" || echo "⚠️ Falha ao sinalizar"

```