# COMANDO - docker-compose.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\multizap-gateway-deploy\wuzapi\docker-compose.yml
**SHA:** 85740884b194f4c7
**Timestamp:** 2026-08-26T19:31:33.362313
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- restart: always
- restart: always

### Ouro Bruto (primeiros 5000 chars)
```
# WuzAPI/Whatsmeow — ISOLADO do Baileys de Recargas Brasil.
# Versão final validada na VPS em 2026-05-20.
#
# Pontos críticos que destravaram o deploy:
#   - SEM atributo "version:" (obsoleto no Compose v2, gera warning).
#   - SEM container_name fixo (evita "Conflict: container name already in use"
#     de deploys anteriores). Nomes ficam <project>-<service>-1.
#   - project name fixo: multizap-gateway
#   - Rede explícita multizap-wuzapi-net.
#   - Postgres exposto na rede com ALIAS "postgres" (e também pelo nome do
#     serviço "postgreswuzapi"). DB_HOST=postgres porque versões recentes da
#     WuzAPI fazem lookup contra esse hostname interno.
#   - depends_on com condition: service_healthy garante ordem correta.
#   - Porta exposta SOMENTE em loopback: 127.0.0.1:${WUZAPI_PORT:-8081}:8080.
#   - Container WuzAPI escuta sempre em 8080 internamente.
#   - WUZAPI_GLOBAL_ENCRYPTION_KEY e WUZAPI_GLOBAL_HMAC_KEY carregados do .env.

name: multizap-gateway

services:
  postgreswuzapi:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-wuzapi_multizap}
      POSTGRES_USER: ${POSTGRES_USER:-wuzapi_multizap}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-wuzapi-multizap-data:/var/lib/postgresql/data
    networks:
      multizap-wuzapi-net:
        aliases:
          - postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10

  wuzapi:
    image: asternic/wuzapi:latest
    restart: always
    depends_on:
      postgreswuzapi:
        condition: service_healthy
    environment:
      WUZAPI_ADMIN_TOKEN: ${WUZAPI_ADMIN_TOKEN}
      WUZAPI_GLOBAL_ENCRYPTION_KEY: ${WUZAPI_GLOBAL_ENCRYPTION_KEY}
      WUZAPI_GLOBAL_HMAC_KEY: ${WUZAPI_GLOBAL_HMAC_KEY}
      TZ: ${TZ:-America/Sao_Paulo}
      # DB_HOST=postgres bate com o alias da rede acima.
      # Não trocar para "postgreswuzapi" — quebrou no teste real
      # (lookup postgreswuzapi on 127.0.0.53:53 connection refused).
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${POSTGRES_USER:-wuzapi_multizap}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB:-wuzapi_multizap}
    volumes:
      - wuzapi-multizap-data:/app/data
      - wuzapi-multizap-files:/app/files
    ports:
      - "127.0.0.1:${WUZAPI_PORT:-8081}:8080"
    networks:
      - multizap-wuzapi-net

volumes:
  postgres-wuzapi-multizap-data:
    name: postgres-wuzapi-multizap-data
  wuzapi-multizap-data:
    name: wuzapi-multizap-data
  wuzapi-multizap-files:
    name: wuzapi-multizap-files

networks:
  multizap-wuzapi-net:
    name: multizap-wuzapi-net
    driver: bridge

```

---

# COMANDO - docker-compose.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\atendimento-whatsapp-gateway-deploy\wuzapi\docker-compose.yml
**SHA:** be757196e91501b3
**Timestamp:** 2026-08-26T19:33:38.094126
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- restart: always
- restart: always

### Ouro Bruto (primeiros 5000 chars)
```
version: "3.9"

# WuzAPI/Whatsmeow — ISOLADO do Baileys de Recargas Brasil.
# Exposto somente em 127.0.0.1:8081 (loopback). Nada de porta pública.
# Banco e volumes têm nomes próprios (sufixo "-atendimento").

name: atendimento-whatsapp-gateway

services:
  postgres-wuzapi-atendimento:
    image: postgres:16-alpine
    container_name: postgres-wuzapi-atendimento
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-wuzapi-atendimento-data:/var/lib/postgresql/data
    networks:
      - atendimento-wuzapi-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10

  wuzapi-atendimento:
    image: ghcr.io/asternic/wuzapi:latest
    container_name: wuzapi-atendimento
    restart: always
    depends_on:
      postgres-wuzapi-atendimento:
        condition: service_healthy
    environment:
      WUZAPI_ADMIN_TOKEN: ${WUZAPI_ADMIN_TOKEN}
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB}
      DB_HOST: postgres-wuzapi-atendimento
      DB_PORT: 5432
      WUZAPI_PORT: ${WUZAPI_PORT}
      TZ: America/Fortaleza
    volumes:
      - wuzapi-atendimento-data:/app/data
      - wuzapi-atendimento-files:/app/files
    ports:
      # 127.0.0.1 = só acessível localmente (Node Gateway na mesma VPS).
      - "127.0.0.1:8081:${WUZAPI_PORT}"
    networks:
      - atendimento-wuzapi-net

volumes:
  postgres-wuzapi-atendimento-data:
    name: postgres-wuzapi-atendimento-data
  wuzapi-atendimento-data:
    name: wuzapi-atendimento-data
  wuzapi-atendimento-files:
    name: wuzapi-atendimento-files

networks:
  atendimento-wuzapi-net:
    name: atendimento-wuzapi-net
    driver: bridge

```

---

# COMANDO - docker-compose.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\docker-compose.yml
**SHA:** b336fe3dd3a7b3c0
**Timestamp:** 2026-08-28T02:56:09.563626
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- restart: unless-stopped

### Ouro Bruto (primeiros 5000 chars)
```
services:
  builder:
    image: centraldark-builder-bolt-dev-builder-bolt-dev:latest
    container_name: CentralDark-Builder
    env_file:
      - ./source/.env
    environment:
      - NODE_ENV=development
      - PORT=5173
      - HOST=0.0.0.0
      - VITE_HMR_PROTOCOL=ws
      - VITE_HMR_HOST=localhost
      - VITE_HMR_PORT=5175
      - CHOKIDAR_USEPOLLING=true
      - WATCHPACK_POLLING=true
      - RUNNING_IN_DOCKER=true
      - PUBLIC_ORIGIN=https://builder.centralldark.com
      - VITE_PUBLIC_APP_URL=https://builder.centralldark.com
      - VITE_LOG_LEVEL=debug
      # Anthropic via Elite Gateway local (rotaciona keys → ap7 → Anthropic)
      - ANTHROPIC_API_BASE_URL=http://host.docker.internal:8082
      # Elite Gateway CentralDark (OpenAI-compatible, rotaciona key interna)
      - OPENAI_LIKE_API_BASE_URL=https://api.centralldark.com/v1
      - OPENAI_LIKE_API_KEY=SEGREDO_ELITE_123
    extra_hosts:
      - host.docker.internal:host-gateway
    volumes:
      - type: bind
        source: ./source
        target: /app
        consistency: cached
      - CentralDark-Builder-node_modules:/app/node_modules
    ports:
      - 127.0.0.1:5174:5173
      - 127.0.0.1:5175:5175
    command: pnpm run dev --host 0.0.0.0
    labels:
      centraldark.app: builder
      centraldark.domain: builder.centralldark.com
      centraldark.mode: development
    restart: unless-stopped

volumes:
  CentralDark-Builder-node_modules:

```

---

# COMANDO - docker-compose.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\WebUI\docker-compose.yml
**SHA:** 2e65ecd0c0d7c995
**Timestamp:** 2026-08-28T02:56:40.925551
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- restart: unless-stopped

### Ouro Bruto (primeiros 5000 chars)
```
services:
  webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: CentralDark-WebUI
    environment:
      - WEBUI_NAME=CentralDark AI
      - DEFAULT_LOCALE=pt-BR
      - ENABLE_SIGNUP=false
      - SCARF_NO_ANALYTICS=true
      - DO_NOT_TRACK=true
      - ANONYMIZED_TELEMETRY=false
      # Multi-provider OpenAI-compatible: Elite Gateway, Groq, OpenRouter, Gemini
      - OPENAI_API_BASE_URLS=https://api.centralldark.com/v1;https://api.groq.com/openai/v1;https://openrouter.ai/api/v1;https://generativelanguage.googleapis.com/v1beta/openai/;http://host.docker.internal:8090/v1
      - OPENAI_API_KEYS=SEGREDO_ELITE_123;[REDIGIDO-PRESERVACAO];[REDIGIDO-PRESERVACAO];AQ.Ab8RN6LOW8_DIJ7vBdDIfQ-V9p6McU9O4IOxKt-ll9SYnvoYSA;arsenal-key-local-2026
      # Anthropic via Elite Gateway local (rotaciona keys → ap7 → Anthropic)
      - ANTHROPIC_API_BASE_URL=http://host.docker.internal:8082
      - ANTHROPIC_API_KEY=[REDIGIDO-PRESERVACAO]
      - WEBUI_SECRET_KEY=
      # Fix database is locked: timeout 30s + pool serializado (1 writer por vez)
      # SQLite + async não tolera concorrência; pool=1 evita disputa de lock no UPDATE user.last_active_at
      - DATABASE_URL=sqlite:////app/backend/data/webui.db?timeout=30
      - DATABASE_POOL_SIZE=1
      - DATABASE_POOL_MAX_OVERFLOW=0
    volumes:
      - open-webui:/app/backend/data
    ports:
      - 0.0.0.0:3000:8080
    extra_hosts:
      - host.docker.internal:host-gateway
    labels:
      centraldark.app: webui
      centraldark.domain: ui.centralldark.com
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    restart: unless-stopped

volumes:
  open-webui:
    external: true

```