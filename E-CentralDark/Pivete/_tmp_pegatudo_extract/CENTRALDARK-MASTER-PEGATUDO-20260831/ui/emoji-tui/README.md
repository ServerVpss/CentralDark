# CentralDark Emoji/TUI Pack

Presentation layer only. It provides semantic icons, optional emoji sets, RGB variables and non-blocking CLI/TUI animations without changing canonical event IDs.

## Runtime profiles

- `professional` (default): restrained, max 2 decorative emoji per line.
- `expressive`: richer CLI/TUI presentation.
- `plain`: no emoji, no RGB, no animation; intended for CI, logs and redirected output.

## Full emoji synchronization

`external-sources.yml` defines optional reference providers. `scripts/sync_emoji_catalog.py` can ingest a saved HTML page or URL and normalize emoji-only values into `emoji-registry.json`. External text is not copied into the registry.

## Environment variables

- `CD_TUI_PROFILE=professional|expressive|plain`
- `CD_TUI_REDUCED_MOTION=1`
- `CD_RGB_ACCENT=R,G,B`
- `CD_RGB_OK=R,G,B`
- `CD_RGB_WARN=R,G,B`
- `CD_RGB_FAIL=R,G,B`
- standard `NO_COLOR` disables RGB.
