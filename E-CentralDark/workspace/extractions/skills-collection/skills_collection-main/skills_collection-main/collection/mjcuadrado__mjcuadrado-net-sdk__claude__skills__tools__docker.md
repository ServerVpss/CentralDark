---
name: docker
description: Containerización de aplicaciones con Docker - best practices, multi-stage builds, security
version: 0.1.0
tags: [docker, containers, devops, deployment, security]
---

# Docker Skill

## 📚 Resumen

**Docker** es una plataforma de containerización que permite empaquetar aplicaciones con todas sus dependencias en contenedores ligeros, portables y autosuficientes.

**Beneficios:**
- 📦 **Portabilidad:** Ejecuta en cualquier lugar (dev, staging, prod)
- 🔒 **Aislamiento:** Aplicaciones aisladas sin conflictos
- ⚡ **Eficiencia:** Más ligero que VMs
- 🔄 **Consistencia:** Mismo entorno en todas las fases
- 🚀 **Escalabilidad:** Fácil de escalar horizontalmente

---

## 🚀 Instalación

### Linux (Ubuntu/Debian)

```bash
# Actualizar repositorios
sudo apt-get update

# Instalar dependencias
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Añadir GPG key de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Añadir repositorio
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
docker --version
```

### macOS / Windows

```bash
# Descargar Docker Desktop desde:
# https://www.docker.com/products/docker-desktop

# Verificar instalación
docker --version
docker compose version
```

### Configuración Post-Instalación (Linux)

```bash
# Permitir ejecutar docker sin sudo
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker run hello-world
```

---

## 📦 Conceptos Básicos

### Imagen vs Contenedor

```
┌─────────────────┐
│     Imagen      │  ← Plantilla inmutable (class)
│  (read-only)    │
└────────┬────────┘
         │
         ├─► Contenedor 1  ← Instancia en ejecución
         ├─► Contenedor 2  ← Otra instancia
         └─► Contenedor 3
```

**Imagen:** Template inmutable con código, runtime, librerías, config
**Contenedor:** Instancia en ejecución de una imagen

### Arquitectura

```
┌──────────────────────────────────┐
│      Docker Client (CLI)          │
└─────────────┬────────────────────┘
              │
┌─────────────▼────────────────────┐
│      Docker Daemon (dockerd)      │
│  ┌────────────────────────────┐  │
│  │   Container Runtime         │  │
│  │  ┌──────┐  ┌──────┐        │  │
│  │  │ App1 │  │ App2 │        │  │
│  │  └──────┘  └──────┘        │  │
│  └────────────────────────────┘  │
└───────────────────────────────────┘
```

---

## 📝 Dockerfile Básico

### Estructura Simple

```dockerfile
# Imagen base
FROM node:18-alpine

# Metadata
LABEL maintainer="tu@email.com"
LABEL version="1.0"

# Directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Usuario no-root (seguridad)
USER node

# Comando de inicio
CMD ["node", "index.js"]
```

### Instrucciones Principales

```dockerfile
# FROM - Imagen base (REQUERIDO, debe ser la primera)
FROM node:18-alpine

# WORKDIR - Establece directorio de trabajo
WORKDIR /app

# COPY - Copia archivos del host al contenedor
COPY src/ /app/src/

# ADD - Similar a COPY, pero puede descomprimir y descargar URLs
ADD archive.tar.gz /app/

# RUN - Ejecuta comandos durante la construcción
RUN npm install && npm run build

# ENV - Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# ARG - Variables de construcción (solo en build time)
ARG VERSION=1.0.0

# EXPOSE - Documenta puertos expuestos (informativo)
EXPOSE 3000

# USER - Cambia usuario (seguridad)
USER node

# VOLUME - Define punto de montaje
VOLUME ["/data"]

# CMD - Comando por defecto (puede ser sobrescrito)
CMD ["npm", "start"]

# ENTRYPOINT - Comando principal (no se sobrescribe)
ENTRYPOINT ["node"]
CMD ["index.js"]  # Parámetros por defecto para ENTRYPOINT
```

---

## 🏗️ Multi-Stage Builds

### .NET Backend (Optimizado)

```dockerfile
# ================================
# Stage 1: Build
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyecto y restaurar dependencias
COPY ["MyApp/MyApp.csproj", "MyApp/"]
COPY ["MyApp.Core/MyApp.Core.csproj", "MyApp.Core/"]
RUN dotnet restore "MyApp/MyApp.csproj"

# Copiar código fuente y compilar
COPY . .
WORKDIR "/src/MyApp"
RUN dotnet build "MyApp.csproj" -c Release -o /app/build

# ================================
# Stage 2: Publish
# ================================
FROM build AS publish
RUN dotnet publish "MyApp.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ================================
# Stage 3: Runtime (Final)
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Instalar dependencias adicionales si es necesario
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser /app
USER appuser

# Copiar artefactos publicados desde stage anterior
COPY --from=publish /app/publish .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Metadata
LABEL org.opencontainers.image.title="MyApp"
LABEL org.opencontainers.image.version="1.0.0"

EXPOSE 80
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

**Beneficios:**
- Imagen final: ~200 MB (vs ~700 MB con SDK)
- Solo contiene runtime, no SDK
- Más rápido de descargar y desplegar

### Node.js/React Frontend (Optimizado)

```dockerfile
# ================================
# Stage 1: Build
# ================================
FROM node:18-alpine AS build
WORKDIR /app

# Instalar dependencias (cache layer)
COPY package*.json ./
RUN npm ci

# Copiar código y compilar
COPY . .
RUN npm run build

# ================================
# Stage 2: Runtime con Nginx
# ================================
FROM nginx:alpine AS final

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos desde build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

---

## ⚡ Optimización de Imágenes

### 1. Usar Imágenes Base Pequeñas

```dockerfile
# ❌ Malo - 1 GB
FROM ubuntu:latest

# ✅ Bueno - 5 MB
FROM alpine:latest

# ✅ Bueno para Node.js - 40 MB
FROM node:18-alpine

# ✅ Bueno para .NET - 200 MB
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
```

### 2. Ordenar Capas por Frecuencia de Cambio

```dockerfile
# ✅ Correcto - Dependencias primero (cambian poco)
COPY package*.json ./
RUN npm ci

# Código fuente después (cambia frecuentemente)
COPY . .
```

```dockerfile
# ❌ Incorrecto - Invalida cache en cada cambio
COPY . .
RUN npm ci
```

### 3. Combinar Comandos RUN

```dockerfile
# ❌ Malo - 3 capas
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# ✅ Bueno - 1 capa
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

### 4. Usar .dockerignore

```
# .dockerignore
node_modules/
npm-debug.log
.git/
.gitignore
*.md
.env
.DS_Store
coverage/
dist/
.vscode/
.idea/
```

### 5. Multi-Stage Builds

```dockerfile
# Elimina herramientas de build de la imagen final
FROM node:18 AS build
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## 🔒 Security Best Practices

### 1. No Ejecutar como Root

```dockerfile
# ❌ Malo - Ejecuta como root
FROM node:18-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"]

# ✅ Bueno - Usuario no-root
FROM node:18-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node
CMD ["node", "index.js"]
```

### 2. Escanear Vulnerabilidades

```bash
# Escanear imagen con Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image myapp:latest

# Escanear con Docker Scout (built-in)
docker scout cves myapp:latest
```

### 3. No Incluir Secretos

```dockerfile
# ❌ NUNCA hacer esto
ENV API_KEY=supersecret123
COPY .env .

# ✅ Usar secrets en runtime
# docker run -e API_KEY=$API_KEY myapp
```

### 4. Usar Imágenes Oficiales Verificadas

```dockerfile
# ✅ Imagen oficial de Docker Hub
FROM node:18-alpine

# ✅ Imagen oficial de Microsoft
FROM mcr.microsoft.com/dotnet/aspnet:8.0
```

### 5. Limitar Capacidades

```bash
# Ejecutar con capacidades limitadas
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp
```

### 6. Read-Only Filesystem

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
USER node

# Ejecutar con filesystem read-only
# docker run --read-only --tmpfs /tmp myapp
```

---

## 🌐 Networking

### Tipos de Networks

```bash
# Bridge (por defecto) - Contenedores en mismo host
docker network create my-bridge-network

# Host - Usa red del host directamente
docker run --network host myapp

# None - Sin red
docker run --network none myapp

# Overlay - Multi-host (Swarm/Kubernetes)
docker network create --driver overlay my-overlay-network
```

### Conectar Contenedores

```bash
# Crear network
docker network create app-network

# Ejecutar contenedores en la misma network
docker run -d --name backend --network app-network myapi
docker run -d --name frontend --network app-network myui

# Frontend puede acceder a backend usando: http://backend:3000
```

### Exponer Puertos

```dockerfile
# En Dockerfile
EXPOSE 3000
```

```bash
# Mapear puerto host:container
docker run -p 8080:3000 myapp  # http://localhost:8080

# Mapear todos los puertos expuestos a puertos aleatorios
docker run -P myapp

# Ver puertos mapeados
docker port <container-id>
```

---

## 💾 Volumes y Persistencia

### Tipos de Persistencia

```
┌────────────────────────────────────────┐
│ 1. Volumes (Recomendado)               │
│    Gestionados por Docker              │
│    /var/lib/docker/volumes/            │
├────────────────────────────────────────┤
│ 2. Bind Mounts                         │
│    Mapea directorio del host           │
│    /path/on/host → /path/in/container  │
├────────────────────────────────────────┤
│ 3. tmpfs (en memoria)                  │
│    Temporal, se pierde al parar        │
└────────────────────────────────────────┘
```

### Volumes

```bash
# Crear volume
docker volume create my-data

# Listar volumes
docker volume ls

# Inspeccionar volume
docker volume inspect my-data

# Usar volume en contenedor
docker run -v my-data:/app/data myapp

# Eliminar volume
docker volume rm my-data

# Eliminar volumes no usados
docker volume prune
```

### Bind Mounts

```bash
# Mapear directorio del host
docker run -v $(pwd)/data:/app/data myapp

# Read-only bind mount
docker run -v $(pwd)/config:/app/config:ro myapp
```

### tmpfs (Memoria)

```bash
# Montar en memoria (no persiste)
docker run --tmpfs /app/temp myapp
```

### Dockerfile con Volumes

```dockerfile
FROM postgres:15-alpine

# Define volume (punto de montaje)
VOLUME ["/var/lib/postgresql/data"]

EXPOSE 5432
```

---

## 🛠️ Comandos Comunes

### Gestión de Imágenes

```bash
# Construir imagen
docker build -t myapp:1.0 .
docker build -t myapp:latest --build-arg VERSION=1.0.0 .

# Listar imágenes
docker images
docker image ls

# Eliminar imagen
docker rmi myapp:1.0
docker image rm myapp:1.0

# Eliminar imágenes no usadas
docker image prune
docker image prune -a  # Todas las no usadas

# Ver historial de imagen
docker history myapp:latest

# Inspeccionar imagen
docker inspect myapp:latest

# Etiquetar imagen
docker tag myapp:1.0 myapp:latest

# Push a registry
docker push myregistry.com/myapp:1.0
```

### Gestión de Contenedores

```bash
# Ejecutar contenedor
docker run myapp
docker run -d --name myapp-container myapp  # Detached
docker run -it myapp /bin/sh                # Interactive

# Listar contenedores
docker ps           # En ejecución
docker ps -a        # Todos (incluso parados)

# Parar contenedor
docker stop <container-id>
docker stop $(docker ps -q)  # Parar todos

# Iniciar contenedor parado
docker start <container-id>

# Reiniciar contenedor
docker restart <container-id>

# Eliminar contenedor
docker rm <container-id>
docker rm -f <container-id>  # Forzar (si está corriendo)

# Eliminar contenedores parados
docker container prune

# Ver logs
docker logs <container-id>
docker logs -f <container-id>  # Follow
docker logs --tail 100 <container-id>

# Ejecutar comando en contenedor corriendo
docker exec -it <container-id> /bin/sh
docker exec <container-id> ls /app

# Ver estadísticas
docker stats
docker stats <container-id>

# Inspeccionar contenedor
docker inspect <container-id>

# Copiar archivos
docker cp <container-id>:/app/log.txt ./log.txt
docker cp ./config.json <container-id>:/app/
```

---

## 🐛 Debugging

### Ver Logs

```bash
# Logs en tiempo real
docker logs -f <container-id>

# Últimas 100 líneas
docker logs --tail 100 <container-id>

# Logs con timestamps
docker logs -t <container-id>

# Logs desde un tiempo específico
docker logs --since 2024-01-01T00:00:00 <container-id>
```

### Ejecutar Shell en Contenedor

```bash
# Bash (si está disponible)
docker exec -it <container-id> /bin/bash

# Sh (Alpine)
docker exec -it <container-id> /bin/sh

# Ver procesos
docker exec <container-id> ps aux
```

### Inspeccionar Estado

```bash
# Información detallada
docker inspect <container-id>

# IP del contenedor
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-id>

# Variables de entorno
docker inspect -f '{{.Config.Env}}' <container-id>
```

### Debugging de Build

```bash
# Ver cada paso del build
docker build --progress=plain -t myapp .

# Build sin cache
docker build --no-cache -t myapp .

# Build hasta un stage específico
docker build --target build -t myapp-build .
```

---

## 📊 Limpieza del Sistema

```bash
# Eliminar todo lo no usado (CUIDADO)
docker system prune -a

# Eliminar solo contenedores parados
docker container prune

# Eliminar solo imágenes no usadas
docker image prune

# Eliminar solo volumes no usados
docker volume prune

# Eliminar solo networks no usadas
docker network prune

# Ver uso de espacio
docker system df
```

---

## 🔗 Integración con mjcuadrado-net-sdk

### Dockerfile para .NET Backend

```dockerfile
# Ver sección Multi-Stage Builds arriba
# Adaptado para proyectos del SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# ... resto del build
```

### Dockerfile para React Frontend

```dockerfile
# Ver sección Multi-Stage Builds arriba
# Adaptado para proyectos con Vite + React
FROM node:18-alpine AS build
# ... resto del build
```

---

## 📚 Recursos

**Documentación Oficial:**
- Docker Docs: https://docs.docker.com/
- Dockerfile Reference: https://docs.docker.com/engine/reference/builder/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/

**Security:**
- Docker Security: https://docs.docker.com/engine/security/
- CIS Docker Benchmark: https://www.cisecurity.org/benchmark/docker

**Tools:**
- Docker Scout: https://docs.docker.com/scout/
- Trivy: https://github.com/aquasecurity/trivy

**Skills Relacionadas:**
- tools/docker-compose.md - Orquestación de servicios
- devops/ci-cd.md - Integración continua

---

**Versión:** 0.1.0
**Última Actualización:** 2025-11-22
**Mantenido por:** mjcuadrado-net-sdk
