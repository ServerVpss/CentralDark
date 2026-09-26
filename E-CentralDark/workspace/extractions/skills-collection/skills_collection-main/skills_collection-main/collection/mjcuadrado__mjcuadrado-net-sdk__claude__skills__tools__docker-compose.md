---
name: docker-compose
description: Orquestación de múltiples contenedores con Docker Compose para desarrollo local
version: 0.1.0
tags: [docker-compose, orchestration, devops, local-development, multi-container]
---

# Docker Compose Skill

## 📚 Resumen

**Docker Compose** es una herramienta para definir y ejecutar aplicaciones Docker multi-contenedor. Usa un archivo YAML para configurar los servicios de tu aplicación, y con un solo comando, crear e iniciar todos los servicios.

**Beneficios:**
- 🎯 **Simplicidad:** Define toda la app en un archivo YAML
- 🔄 **Reproducibilidad:** Mismo entorno en todos los equipos
- ⚡ **Velocidad:** Un comando para todo (up/down)
- 🌐 **Networking:** Red automática entre servicios
- 📦 **Desarrollo Local:** Ideal para full-stack development

---

## 🚀 Instalación

### Linux

```bash
# Docker Compose v2 viene con Docker Desktop
# Verificar versión
docker compose version

# Si no está instalado
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verificar
docker compose version
```

### macOS / Windows

```bash
# Docker Compose viene incluido con Docker Desktop
docker compose version
```

**Nota:** Usar `docker compose` (v2) en lugar de `docker-compose` (v1 deprecated)

---

## 📝 Estructura Básica

### docker-compose.yml Mínimo

```yaml
version: '3.8'

services:
  # Servicio 1
  web:
    image: nginx:alpine
    ports:
      - "8080:80"

  # Servicio 2
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
```

### Anatomía de docker-compose.yml

```yaml
version: '3.8'  # Versión de Compose file format

# Servicios (contenedores)
services:
  nombre-servicio:
    # Opciones de configuración
    build: ./path/to/dockerfile
    image: nombre-imagen:tag
    container_name: mi-contenedor
    ports:
      - "host:container"
    environment:
      - VAR=value
    volumes:
      - ./host:/container
    networks:
      - mi-red
    depends_on:
      - otro-servicio

# Networks personalizadas
networks:
  mi-red:
    driver: bridge

# Volumes persistentes
volumes:
  mi-volumen:
    driver: local
```

---

## 🏗️ Configuración de Servicios

### Build vs Image

```yaml
services:
  # Usando imagen pre-construida
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"

  # Construyendo desde Dockerfile
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - VERSION=1.0.0
    ports:
      - "3000:3000"

  # Build con target específico (multi-stage)
  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "5173:5173"
```

### Puertos

```yaml
services:
  web:
    image: nginx
    ports:
      # host:container
      - "8080:80"           # Mapear 8080 del host a 80 del container
      - "443:443"
      - "127.0.0.1:9000:9000"  # Solo localhost

    # expose: Solo visible para otros servicios (no para host)
    expose:
      - "3000"
```

### Variables de Entorno

```yaml
services:
  api:
    image: myapi
    environment:
      # Inline
      - NODE_ENV=production
      - API_KEY=secret123

      # Desde .env file
    env_file:
      - .env
      - .env.production

    # Variable del sistema del host
    environment:
      - DATABASE_URL=${DATABASE_URL}
```

**.env file:**
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@db:5432/mydb
API_KEY=dev_key_123
```

### Volúmenes

```yaml
services:
  db:
    image: postgres:15-alpine
    volumes:
      # Named volume (persistente)
      - postgres_data:/var/lib/postgresql/data

      # Bind mount (desarrollo)
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro

  app:
    image: myapp
    volumes:
      # Bind mount para hot reload
      - ./src:/app/src

      # Named volume para node_modules
      - node_modules:/app/node_modules

# Declarar volumes
volumes:
  postgres_data:
  node_modules:
```

### Redes

```yaml
services:
  frontend:
    image: react-app
    networks:
      - frontend-net

  backend:
    image: api-app
    networks:
      - frontend-net
      - backend-net

  database:
    image: postgres
    networks:
      - backend-net

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
```

**Comunicación entre servicios:**
```javascript
// Frontend puede acceder a backend usando el nombre del servicio
fetch('http://backend:3000/api/users')
```

### Dependencias

```yaml
services:
  db:
    image: postgres:15-alpine

  backend:
    image: myapi
    depends_on:
      - db  # Inicia db antes que backend

  frontend:
    image: myui
    depends_on:
      - backend

# Con health checks (más robusto)
services:
  db:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: myapi
    depends_on:
      db:
        condition: service_healthy  # Espera a que db esté healthy
```

---

## 🎯 Ejemplo Full Stack (.NET + React + PostgreSQL)

### Estructura del Proyecto

```
proyecto/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   └── MyApi/
├── frontend/
│   ├── Dockerfile
│   └── src/
└── postgres/
    └── init.sql
```

### docker-compose.yml Completo

```yaml
version: '3.8'

services:
  # ================================
  # PostgreSQL Database
  # ================================
  db:
    image: postgres:15-alpine
    container_name: myapp-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-myapp}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ================================
  # .NET Backend API
  # ================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: myapp-backend
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT:-5000}:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=${DB_NAME:-myapp};Username=${DB_USER:-postgres};Password=${DB_PASSWORD:-postgres}
      - ASPNETCORE_URLS=http://+:80
    volumes:
      # Hot reload en desarrollo
      - ./backend/MyApi:/app
      - backend_nuget:/root/.nuget/packages
    networks:
      - backend-net
      - frontend-net
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ================================
  # React Frontend
  # ================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: myapp-frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-5173}:5173"
    environment:
      - VITE_API_URL=http://localhost:${BACKEND_PORT:-5000}
    volumes:
      # Hot reload
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
      - frontend_node_modules:/app/node_modules
    networks:
      - frontend-net
    depends_on:
      - backend
    stdin_open: true
    tty: true

# ================================
# Networks
# ================================
networks:
  backend-net:
    driver: bridge
  frontend-net:
    driver: bridge

# ================================
# Volumes
# ================================
volumes:
  postgres_data:
    driver: local
  backend_nuget:
    driver: local
  frontend_node_modules:
    driver: local
```

### .env File

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres_dev_password
DB_NAME=myapp_dev
DB_PORT=5432

# Backend
BACKEND_PORT=5000

# Frontend
FRONTEND_PORT=5173
```

### Dockerfile Backend (Development)

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development

WORKDIR /app

# Copiar archivos de proyecto
COPY ["MyApi/MyApi.csproj", "MyApi/"]
RUN dotnet restore "MyApi/MyApi.csproj"

# Copiar código
COPY . .
WORKDIR "/app/MyApi"

# Instalar dotnet-ef para migraciones
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

EXPOSE 80

# Hot reload con watch
CMD ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:80"]
```

### Dockerfile Frontend (Development)

```dockerfile
FROM node:18-alpine AS development

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

EXPOSE 5173

# Vite dev server con HMR
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## 🛠️ Comandos de Docker Compose

### Ciclo de Vida

```bash
# Iniciar todos los servicios
docker compose up

# Detached mode (background)
docker compose up -d

# Iniciar servicios específicos
docker compose up backend db

# Construir antes de iniciar
docker compose up --build

# Forzar recreación de contenedores
docker compose up --force-recreate

# Parar servicios (contenedores siguen existiendo)
docker compose stop

# Parar servicios específicos
docker compose stop backend

# Iniciar servicios parados
docker compose start

# Reiniciar servicios
docker compose restart

# Parar y eliminar contenedores
docker compose down

# Parar y eliminar contenedores + volumes
docker compose down -v

# Parar y eliminar contenedores + images
docker compose down --rmi all
```

### Build

```bash
# Construir todas las imágenes
docker compose build

# Construir sin cache
docker compose build --no-cache

# Construir servicio específico
docker compose build backend

# Construir con argumentos
docker compose build --build-arg VERSION=1.0.0
```

### Logs

```bash
# Ver logs de todos los servicios
docker compose logs

# Follow logs
docker compose logs -f

# Logs de servicio específico
docker compose logs backend

# Últimas N líneas
docker compose logs --tail=100 backend

# Logs con timestamps
docker compose logs -t
```

### Ejecución de Comandos

```bash
# Ejecutar comando en servicio corriendo
docker compose exec backend /bin/sh
docker compose exec db psql -U postgres

# Ejecutar comando en nuevo contenedor
docker compose run backend npm test

# Sin crear dependencias
docker compose run --no-deps backend npm test
```

### Inspección

```bash
# Listar servicios
docker compose ps

# Listar todos (incluso parados)
docker compose ps -a

# Ver configuración procesada
docker compose config

# Validar archivo compose
docker compose config --quiet

# Ver imágenes
docker compose images

# Ver volumes
docker volume ls
```

---

## 🔧 Perfiles (Profiles)

### Servicios Opcionales

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine

  backend:
    build: ./backend

  # Solo en desarrollo
  pgadmin:
    image: dpage/pgadmin4
    profiles: ["dev"]
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"

  # Solo en testing
  test-db:
    image: postgres:15-alpine
    profiles: ["test"]
    environment:
      POSTGRES_DB: test_db
```

**Uso:**
```bash
# Sin perfiles (solo db y backend)
docker compose up

# Con perfil dev (db + backend + pgadmin)
docker compose --profile dev up

# Con perfil test
docker compose --profile test up
```

---

## ⚡ Optimización y Best Practices

### 1. Usar .dockerignore

```
# .dockerignore en cada servicio
node_modules/
dist/
.git/
*.md
.env
coverage/
```

### 2. Health Checks

```yaml
services:
  api:
    image: myapi
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 3. Restart Policies

```yaml
services:
  db:
    image: postgres
    restart: unless-stopped  # Recomendado para producción

  # Opciones:
  # no - No reiniciar (default)
  # always - Siempre reiniciar
  # on-failure - Solo si falla
  # unless-stopped - Siempre excepto si fue parado manualmente
```

### 4. Resource Limits

```yaml
services:
  backend:
    image: myapi
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 5. Múltiples Archivos Compose

```yaml
# docker-compose.yml (base)
version: '3.8'
services:
  db:
    image: postgres:15-alpine

# docker-compose.override.yml (desarrollo, se aplica automáticamente)
version: '3.8'
services:
  db:
    ports:
      - "5432:5432"

# docker-compose.prod.yml (producción)
version: '3.8'
services:
  db:
    restart: always
```

**Uso:**
```bash
# Development (usa base + override automáticamente)
docker compose up

# Production (usa base + prod)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

## 🔒 Security Best Practices

### 1. No Hardcodear Secretos

```yaml
# ❌ Malo
services:
  db:
    environment:
      POSTGRES_PASSWORD: supersecret123

# ✅ Bueno - Usar .env
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

### 2. Usar Secrets (Docker Swarm)

```yaml
version: '3.8'

services:
  db:
    image: postgres
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: [REDIGIDO-PRESERVACAO]

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 3. Networks Aisladas

```yaml
services:
  frontend:
    networks:
      - public

  backend:
    networks:
      - public
      - private

  db:
    networks:
      - private  # DB solo accesible por backend

networks:
  public:
  private:
    internal: true  # Sin acceso a internet
```

---

## 🎯 Casos de Uso Comunes

### Desarrollo Local Full Stack

```bash
# Iniciar todo
docker compose up -d

# Ver logs
docker compose logs -f backend

# Ejecutar migraciones
docker compose exec backend dotnet ef database update

# Tests
docker compose exec backend dotnet test

# Acceder a DB
docker compose exec db psql -U postgres -d myapp

# Parar todo
docker compose down
```

### CI/CD Testing

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  test-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: test_db

  test-runner:
    build:
      context: .
      target: test
    environment:
      DATABASE_URL: postgresql://postgres@test-db:5432/test_db
    depends_on:
      - test-db
    command: npm test
```

```bash
# Ejecutar tests
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## 🔗 Integración con mjcuadrado-net-sdk

### Stack Completo del SDK

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    networks:
      - backend-net

  # .NET Backend (TDD-implementer output)
  backend:
    build: ./backend
    environment:
      ConnectionStrings__DefaultConnection: Host=db;Database=${DB_NAME};
    networks:
      - backend-net
      - frontend-net
    depends_on:
      - db

  # React Frontend (frontend-builder output)
  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://backend:80
    networks:
      - frontend-net
    depends_on:
      - backend

networks:
  backend-net:
  frontend-net:

volumes:
  postgres_data:
```

---

## 📚 Recursos

**Documentación Oficial:**
- Docker Compose Docs: https://docs.docker.com/compose/
- Compose File Reference: https://docs.docker.com/compose/compose-file/
- Compose CLI Reference: https://docs.docker.com/compose/reference/

**Best Practices:**
- Production Guide: https://docs.docker.com/compose/production/
- Networking: https://docs.docker.com/compose/networking/

**Skills Relacionadas:**
- tools/docker.md - Docker fundamentals
- devops/ci-cd.md - Integración continua

---

**Versión:** 0.1.0
**Última Actualización:** 2025-11-22
**Mantenido por:** mjcuadrado-net-sdk
