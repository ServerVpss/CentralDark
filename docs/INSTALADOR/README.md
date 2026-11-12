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
| `32-builder-multiplataforma-centraldark.md` | **Comandos canônicos do CHEFE:** reset AionUI, rebuild Web/Linux/Windows, Rakazo e plano de integração Unigram no builder único |

## Cápsula de preservação do Installer físico da Casa (2026-10-28)

O aplicativo de instalação de openKylin e preservação do disco físico tem **owner operacional fora do Git**: `E:\VMs\CentralDark-Installer\`. Para permitir reconstrução após perda da Casa, foi criada aqui uma **cópia de distribuição**, não um segundo owner nem uma nova aplicação: [CentralDark-Installer-CASA-source-20261028.zip](CentralDark-Installer-CASA-source-20261028.zip).

- Arquivos preservados: `CentralDark-Installer.ps1`, `CentralDark-Installer-Launcher.cs`, `CentralDark-Installer.cmd`, `CentralDark-Installer.exe`, `CentralDark-MISSAO-OPUS.md`, `CentralDark-README.md`, `CentralDark-Relatorio_20261027_081912.txt`.
- SHA-256 do ZIP: `CD6020131E98317F512D20C6208ED4BDC5C1048FBEC5D90CD10D20DB678B4232`.
- O código atual descreve **planejamento dry-run** de preservação do NTFS, instalação Linux e reconciliação pós-boot; não prova backup externo nem instalação de openKylin. `INSTALLER_PACKAGE_SAVED != BACKUP_K_PROVED != INSTALLATION_PROVED`.
- Para restaurar este aplicativo, extrair o ZIP em um diretório de trabalho selecionado, verificar hash e executar os testes do código antes de qualquer uso. **Nunca executar automaticamente operações de partição, formatação ou boot por recuperar este pacote.**
- Repositorio privado é cópia de recuperação de código; não contém todos os arquivos do disco físico. Dados privados/serviços vivos dependem de backup externo validado.

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

<!-- CENTRALDARK_RUNNER_LINUX_PHASE_20261112 -->
## Fase incremental: runner Linux isolado (VMware agora, VPS futura)

Owner unico: `install.sh`. Fases explicitas e opcionais:

- `bash install.sh --runner-linux-check`: inventario local, somente leitura.
- `bash install.sh --runner-linux-install --dry-run`: plano sem gravacao.
- `bash install.sh --runner-linux-install`: pacote oficial Linux x64, SHA-256 e promocao atomica.
- `bash install.sh --runner-linux-activate --dry-run`: preflight sem token.
- `bash install.sh --runner-linux-activate`: registro e servico systemd, somente com nome e token efemero autorizados.

Cada host tem identidade, servico e `_work` exclusivos. GitHub distribui um job por runner e recebe resultado/checks; Hermes supervisiona sem segundo scheduler; HUD acompanha o PR equivalente. `REGISTERED != ONLINE` e `RUNNER_ONLINE != ACTIONS_STARTUP_OK`. O limite de billing da organizacao continua independente.

Detalhes: `02-dependencias.md`, `04-estrutura-pastas.md` e aprendizado tematico do runner em `docs/CONSCIENCIA/APRENDIZADOS/2026-10-18-VPS-RUNNER-EPHEMERAL-POSTJOB.md`.
<!-- /CENTRALDARK_RUNNER_LINUX_PHASE_20261112 -->
