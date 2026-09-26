---
name: docker-compose-setup
category: docker-core
description: Setup multi-container applications with Docker Compose
related_skills:
  - dockerfile-multistage
  - docker-networking
  - docker-volumes
---

# Docker Compose Setup

## When to Use

Use Docker Compose when you need to run multiple containers together (e.g., web app + database + cache) or want to simplify complex `docker run` commands.

## Quick Start

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker compose up -d    # Start all services
docker compose down     # Stop and remove
```

## Core Concepts

- **Services**: Each container in your application (web, db, cache, etc.)
- **Networks**: Services on same network can communicate by service name
- **Volumes**: Persist data across container restarts
- **depends_on**: Define startup order (db starts before web)

## Step-by-Step Guide

### 1. Create docker-compose.yml

```yaml
version: '3.8'

services:
  # Your services here
```

### 2. Define Services

```yaml
services:
  web:
    build: .                    # Build from Dockerfile in current dir
    ports:
      - "3000:3000"            # host:container
    environment:
      NODE_ENV: production
    depends_on:
      - db
      - redis
```

### 3. Add Database

```yaml
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myuser"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 4. Define Volumes

```yaml
volumes:
  postgres_data:              # Named volume, managed by Docker
  redis_data:
```

### 5. Start Services

```bash
docker compose up -d          # Detached mode
docker compose logs -f web    # Follow logs
docker compose ps             # List services
docker compose down           # Stop all
```

## Common Patterns

### Pattern 1: Full Stack App

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Pattern 2: Development with Hot Reload

```yaml
services:
  web:
    build: .
    volumes:
      - ./src:/app/src         # Mount source for hot reload
    environment:
      - NODE_ENV=development
    command: npm run dev        # Override CMD for dev mode
```

### Pattern 3: Environment-Specific Configs

**Base config** (`docker-compose.yml`):
```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
```

**Dev overrides** (`docker-compose.override.yml` - auto-loaded):
```yaml
services:
  web:
    volumes:
      - ./src:/app/src
    environment:
      - DEBUG=true
```

**Production** (`docker-compose.prod.yml`):
```yaml
services:
  web:
    image: myapp:latest       # Use pre-built image
    restart: always
    deploy:
      replicas: 3
```

**Usage:**
```bash
# Development (uses compose.yml + compose.override.yml automatically)
docker compose up

# Production (explicit override)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Essential Commands

```bash
# Start services
docker compose up -d

# Rebuild images
docker compose up --build

# View logs
docker compose logs -f [service]

# Execute command in service
docker compose exec web sh
docker compose exec db psql -U user -d app

# Stop services
docker compose stop
docker compose down            # Stop and remove containers
docker compose down -v         # Also remove volumes

# Scale service
docker compose up -d --scale web=3

# Check service status
docker compose ps
```

## Gotchas & Tips

**Common Mistakes:**
- ❌ Not defining `depends_on` → services start in wrong order
- ❌ Hardcoding localhost → use service names instead (db, redis, etc.)
- ❌ Forgetting volumes → data lost on container restart
- ❌ Not using healthchecks → app starts before DB ready

**Best Practices:**
- ✅ Use service names for inter-service communication (not localhost)
- ✅ Define healthchecks for databases
- ✅ Use named volumes for data persistence
- ✅ Separate dev and prod configs with override files
- ✅ Use `.env` file for secrets (don't commit!)

**Environment Variables:**

```bash
# .env file (don't commit!)
DATABASE_URL=postgresql://user:pass@db:5432/app
SECRET_KEY=my-secret-key
```

```yaml
# docker-compose.yml
services:
  web:
    env_file:
      - .env
```

**Wait for Database Ready:**

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy    # Wait for healthcheck

  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
      timeout: 3s
      retries: 5
```

## Related Skills

- Use `dockerfile-multistage` to optimize service images
- See `docker-networking` for advanced network configuration
- See `docker-volumes` for data persistence patterns
- Use `docker-security` for production hardening

💡 **Plugin**: For complete Docker setup with Compose, see `docker-fullstack` plugin
