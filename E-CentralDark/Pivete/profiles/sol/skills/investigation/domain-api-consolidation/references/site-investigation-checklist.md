# Site Investigation Checklist — Domain/API Consolidation

Use como guia rápido para investigar conformidade 1-dominio-1-API.

## 1. Identificar domínios expostos

### DNS / Registros
- [ ] Listar subdomínios conhecidos (www, api, ui, app, graph, etc)
- [ ] Verificar se há domínios alternativos/redirecionados
- [ ] Checar certificados SSL — quantos domínios distintos?

### Configurações locais
- [ ] `docker-compose.yml` — variáveis `DOMAIN`, `centraldark.domain`, portas expostas
- [ ] PM2 ecosystem — scripts de start, env vars de domínio
- [ ] Caddy/Nginx — server blocks, server_name, proxy_pass
- [ ] Arquivos com `.com`/`.br` — referências de domínio

## 2. Identificar APIs/endpoints expostos

### Backend services
- [ ] Cada service expõe qual porta/roteiro?
- [ ] Rota única `/api/*` ou múltiplos endpoints?
- [ ] CORS origins declarados em cada service

### Gateway / proxy
- [ ] Tem API gateway único ou múltiplos?
- [ ] Roteamento por path ou por subdomínio?
- [ ] Versionamento de API exposto?

## 3. Cruzar domain → backend

| Domínio | Backend | Porta | Observação |
|---------|---------|-------|------------|
| (preencher) | (preencher) | (preencher) | (preencher) |

## 4. Verificar 1:1

- [ ] Número de domínios = 1?
- [ ] Número de APIs expostas = 1?
- [ ] Mesmo backend atende todo o domínio?
- [ ] Premissa bate com o mapeado?

## 5. Oportunidades de consolidação

- [ ] Subdomínios redundantes podem ser unificados?
- [ ] Múltiplos backends podem ser consolidados?
- [ ] CORS/perms simplificáveis?

## 6. Limitações

- [ ] O que não deu pra medir daqui (VPS, DNS externo, etc)?
- [ ] UNKNOWN declarado onde não alcançável?
