# CANDIDATE RECEIPT — AionUi + Celestial / Mapas — 2026-10-06

PR=#1748
PARENT_HEAD=c893a949b3051ae8a96cc4bc8b910857534c55e7
SCOPE=AionUi menu + existing GraphPanel owner
STATUS=CODE_CANDIDATE_PENDING_RUNTIME_PROOF

## Delta

- native AionUi route: `/settings/maps`
- menu: `Celestial / Mapas`
- existing GraphPanel embedded through configurable same-origin binding
- views: Galaxy, 2D, 3D/Celestial, Modules, Vault
- skins: Emerald, Operational, Forge
- one client store: `gd`
- one graph API contract: `/api/graph?mode=...`
- Rakazo HTTPS mixed-content guard added

## Static gates

- overlay guards assert every AionUi insertion anchor
- no new brain, router, runtime or graph owner
- runtime claims intentionally withheld

```text
DOCUMENTED != EXECUTED
COMMIT != DEPLOY
RUNTIME_PROOF=UNKNOWN
MICRODEPLOY_RECIPE=scripts/vps/main-pinned-microdeploy.sh
NEXT_CURSOR=overlay test + package + same-head microdeploy + browser readback
```
