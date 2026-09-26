---
name: dockerfile-multistage
category: docker-core
description: Create optimized multi-stage Docker builds to minimize image size
related_skills:
  - dockerfile-basics
  - docker-optimization
  - docker-security
---

# Multi-Stage Docker Builds

## When to Use

Use multi-stage builds when you need build tools (compilers, npm, etc.) during build but want a minimal production image without those tools.

## Quick Start

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
```

## Core Concepts

- **Build Stage Separation**: Use one stage for compilation, another for runtime - keeps build tools out of final image
- **COPY --from**: Transfer only artifacts needed for runtime from build stage to production stage
- **Image Size Reduction**: Final image contains only runtime dependencies, not build dependencies (often 60-80% smaller)

## Step-by-Step Guide

### 1. Define Build Stage

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install        # Includes devDependencies
COPY . .
RUN npm run build      # Compile TypeScript, bundle, etc.
```

### 2. Define Production Stage

```dockerfile
FROM node:20-alpine    # Fresh base image
WORKDIR /app
COPY --from=build /app/dist ./dist              # Built artifacts
COPY --from=build /app/node_modules ./node_modules  # Deps
```

### 3. Add Security & Runtime Config

```dockerfile
USER node              # Run as non-root
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 4. Build & Verify

```bash
docker build -t myapp:latest .
docker images myapp    # Check size reduction

# Compare with single-stage (no multi-stage)
# Multi-stage: ~150MB
# Single-stage: ~500MB
```

## Common Patterns

### Pattern 1: Node.js with TypeScript

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

FROM node:20-alpine
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
```

**Size reduction:** ~60-70% smaller than single-stage

### Pattern 2: Go Static Binary

```dockerfile
FROM golang:1.21-alpine AS build
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server

FROM scratch                        # Minimal base
COPY --from=build /app/server /server
CMD ["/server"]
```

**Size reduction:** 800MB → 10MB (98% reduction!)

### Pattern 3: Python with Compiled Dependencies

```dockerfile
FROM python:3.11-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt
COPY . .

FROM python:3.11-slim
COPY --from=build /root/.local /root/.local
COPY --from=build /app /app
WORKDIR /app
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "main.py"]
```

## Gotchas & Tips

**Common Mistakes:**
- ❌ Not using AS keyword to name build stage → can't reference it
- ❌ Copying entire build directory → includes unnecessary files
- ❌ Using same base image when smaller alternative exists for production

**Best Practices:**
- ✅ Name stages explicitly with AS keyword for clarity
- ✅ Use smallest viable base for production stage (alpine, distroless, scratch)
- ✅ COPY only specific artifacts, not entire directories
- ✅ Combine related RUN commands to reduce layers

**Advanced: Target Specific Stage**

```bash
# Build only the 'build' stage (for debugging)
docker build --target build -t myapp:build .

# Build default (final stage)
docker build -t myapp:prod .
```

## Size Comparison Example

**Before (Single-Stage):**
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/server.js"]
```
**Size:** ~950MB (includes npm, build tools, source code)

**After (Multi-Stage):**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

FROM node:20-alpine
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
```
**Size:** ~180MB (only runtime dependencies and compiled code)

**Savings:** 81% reduction!

## Related Skills

- Start with `dockerfile-basics` if new to Dockerfiles
- Use `docker-optimization` for advanced size reduction techniques
- Combine with `docker-security` for production hardening

💡 **Plugin**: For complete Docker setup, see `docker-fullstack` plugin
