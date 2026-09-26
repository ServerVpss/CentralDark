# MISSAO - docker.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\docker.yaml
**SHA:** 03bd8d2ab2f9b0cb
**Timestamp:** 2026-08-28T02:56:10.241032
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo "name=$(echo '${{ github.repository }}' | tr '[:upper:]' '[:lower:]')" >> $GITHUB_OUTPUT
- run: docker buildx imagetools inspect ${{ env.REGISTRY }}/${{ steps.image.outputs.name }}:${{ steps.meta.outputs.version }}

### Ouro Bruto (primeiros 5000 chars)
```
name: Docker Publish

on:
  push:
    branches: [main, stable]
    tags: ['v*', '*.*.*']
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  packages: write
  contents: read
  id-token: write

env:
  REGISTRY: ghcr.io

jobs:
  docker-build-publish:
    runs-on: ubuntu-latest
    # timeout-minutes: 30
    steps:
      - name: Checkout code
        uses: actions/checkout@v7

      - name: Set lowercase image name
        id: image
        run: echo "name=$(echo '${{ github.repository }}' | tr '[:upper:]' '[:lower:]')" >> $GITHUB_OUTPUT

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v4
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for Docker image
        id: meta
        uses: docker/metadata-action@v6
        with:
          images: ${{ env.REGISTRY }}/${{ steps.image.outputs.name }}
          tags: |
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
            type=raw,value=stable,enable=${{ github.ref == 'refs/heads/stable' }}
            type=ref,event=tag
            type=sha,format=short
            type=raw,value=${{ github.ref_name }},enable=${{ startsWith(github.ref, 'refs/tags/') || github.ref == 'refs/heads/main' || github.ref == 'refs/heads/stable' }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v7
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          target: bolt-ai-production
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}


      - name: Check manifest
        run: docker buildx imagetools inspect ${{ env.REGISTRY }}/${{ steps.image.outputs.name }}:${{ steps.meta.outputs.version }}
```