# 31 — Forja Total + Drive na VPS

status: CANONICAL_INSTALL_PATH
owner_runtime: CentralDark-SyncDrive + fixed-point-fabric
owner_governance: CENTRALDARK-TRIGGER-FABRIC

## Objetivo

Rodar na VPS, sem depender da Casa, o loop que observa `DELTAUNIFICADOCENTRALDARK*` no Google Drive e entrega matéria nova ao Memory Linker com provenance, hash, dedupe, secret scan e gates da Casa.

```text
Google Drive / DELTAUNIFICADOCENTRALDARK*
→ rclone read-only do documento alvo
→ secret scan
→ SHA-256 + dedupe + lock
→ scripts/memory-linker/inbox (CANDIDATE)
→ inbox-sentinel / Dream Review
→ MetaLupa
→ OWNER
→ TESTE
→ CONTRAPROVA
→ REALITY
→ FIXED_POINT
→ REGISTRA
```

Drive não vira autoridade. Matéria bruta não sobrescreve SOUL, owner, main ou runtime.

## Owners reutilizados

- Trigger: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`
- Alias: `scripts/trigger-fabric/boot_forja_total.py` → `!CENTRALDARK`
- Transporte contínuo: PM2 `CentralDark-SyncDrive`
- Loop versionado: `scripts/sync-loop.sh`
- Ingest unitário: `scripts/drive-ingest-once.sh`
- Entrada de matéria: `scripts/memory-linker/inbox/`
- Secret scan: `scripts/lupa/pr_secret_scan.py`
- Fixed Point: `apps/modulos/fixed-point-fabric/`
- Visual: `docs/ARQUITETURA/CENTRALDARK-FORJA-VIVA/VISUAL-NAMING-REGISTRY.yml`
- Dependabot: owner já existente; nenhum segundo cérebro/runner lógico.

## Pré-requisito externo

A VPS precisa ter o remote rclone `gdrive:` autenticado e acesso a `gdrive:CentralDark`. Credencial fica apenas na VPS; não entra no Git, receipt ou log.

## Instalação idempotente

Do clone canônico:

```bash
bash scripts/installer/install-forja-total-vps.sh
```

O instalador:

1. instala dependências faltantes suportadas;
2. falha fechado se `gdrive:` não estiver autenticado;
3. promove os scripts no owner PM2 `CentralDark-SyncDrive`;
4. prova leitura real do delta e roteamento pelo sentinel;
5. gera localmente o segredo do heartbeat se ainda não existir, sem imprimi-lo;
6. instala o Fixed Point heartbeat somente em loopback;
7. bloqueia se a porta `9119` já pertencer a outro runtime;
8. prova heartbeat assinado;
9. registra `FIXED_POINT=NOT_CLAIMED` até o rendezvous final.

## Rebuild / GitHub Actions

Workflow: `.github/workflows/centraldark-fixed-point-fabric.yml`.

O workflow usa o mesmo instalador, no SHA exato. `MERGED != DEPLOYED`; só o runtime observado fecha o componente.

## Rollback

Durante a promoção do Drive, os dois scripts runtime são copiados para diretório temporário antes da mutação. Falha antes do PASS restaura os arquivos anteriores e tenta reiniciar o mesmo owner PM2.

O heartbeat não atropela porta ocupada. Se `9119` estiver em uso por outro runtime, o Drive pode permanecer comprovadamente ativo e o workflow encerra como `PARTIAL/BLOCKED`, não como verde falso.

## Estados

```text
DRIVE_INGEST_RUNTIME=PASS
VPS_HEARTBEAT_HEALTH=PASS
FORJA_TOTAL_STATUS=VPS_COMPONENTS_PASS
FIXED_POINT=NOT_CLAIMED
NEXT_CURSOR=CASA_GITHUB_SCREENPIPE_RENDEZVOUS
```

`FIXED_POINT` global exige reconciliação adicional; este instalador não promove sozinho a própria prova.
