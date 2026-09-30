# Instalador MultiZap / clone-deck

## 🚀 Começar agora (VPS nova, do zero)

Entrou na VPS por SSH? Cola esta linha:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/segredounlock/centraldark-install/main/bootstrap.sh)
```

Ele verifica a máquina, prepara o mínimo e abre o menu do instalador. Passo a passo pra leigo: [`00-COMO-COMECAR.md`](00-COMO-COMECAR.md).

---

Documentação viva do instalador automático. Esta pasta é a **fonte única de verdade** para reconstruir o sistema do zero em qualquer VPS limpa.

## Estrutura desta pasta

| Arquivo | O que documenta |
|---|---|
| `00-COMO-COMECAR.md` | Guia passo a passo pro leigo: contratar VPS → SSH → bootstrap → menu |
| `README.md` | Este índice + visão geral |
| `01-arquitetura.md` | Componentes do sistema e como eles se conversam |
| `02-dependencias.md` | Tudo que precisa estar instalado na VPS, com versões mínimas |
| `03-portas-e-rede.md` | Mapa de portas internas, externas e rotas Caddy |
| `04-estrutura-pastas.md` | Layout obrigatório da VPS e função de cada subpasta |
| `05-secrets-e-env.md` | Variáveis necessárias e onde vivem, sem expor valor |
| `06-banco-supabase.md` | Migrações, RLS, GRANTs, schema mínimo |
| `07-servicos-pm2.md` | Processos PM2 e políticas de restart |
| `08-webhooks-e-deploy.md` | Webhook GitHub→VPS e fluxo de deploy |
| `09-validacoes-finais.md` | Checklist pós-instalação |
| `10-seguranca.md` | Regras invioláveis de segurança |
| `11-fluxo-do-installer.md` | Fases do `install.sh` |
| `12-historico-decisoes.md` | Decisões técnicas relevantes |
| `13-mcp.md` | MCP CentralDark |
| `14-conectar-ia-externa.md` | ChatGPT / Claude / Cursor no MCP |
| `15-cloudflare-api.md` | Referência Cloudflare API |
| `16-cloudflare-dns.md` | Cloudflare Connect Wizard |
| `17-dns-wildcard.md` | Wildcard DNS + Caddy + online-check |
| `18-conectar-pelo-celular.md` | Cloudflare por QR no terminal |
| `19-dependencias-auto.md` | `ensure_deps` |
| `20-bootstrap-url.md` | entrada única do bootstrap |
| `21-ui-aio.md` | interface do instalador |
| `22-menu-vps.md` | menu colorido da VPS |
| `23-auto-update.md` | auto-update do instalador |
| `24-rebuild-deterministico.md` | rebuild limpo e reproduzível |
| `30-skill-consciencia.md` | skill da Consciência CentralDark |
| `31-forja-total-drive-vps.md` | **Forja Total na VPS**: Drive auto-ingest + provenance + Memory Linker + Fixed Point heartbeat, reutilizando owners existentes |

## Regra de ouro

**Toda mudança no sistema (nova dependência, nova porta, novo serviço, nova variável, nova pasta) precisa de uma linha nova no arquivo correspondente desta pasta — no mesmo commit da mudança.** Se não foi documentado, o instalador vai falhar na próxima VPS limpa.

## Estado atual

- [x] Esqueleto da pasta criado
- [x] `install.sh` com fase de verificação (`--check`)
- [x] MCP CentralDark de pé em `mcp.centralldark.com` (porta 9100)
- [x] Cloudflare DNS automático via API
- [x] Fundação de rebuild determinístico
- [x] Caminho versionado da Forja Total/Drive para VPS (`31-forja-total-drive-vps.md`)
- [ ] Fixed Point global — só após runtime + contraprova + rendezvous; componente instalado não basta
- [ ] Fase de migração Supabase
- [ ] Fase de validação final completa
- [ ] Modo `--restore` para migração entre VPS

A doc é preenchida incrementalmente conforme cada peça do sistema é tocada.
