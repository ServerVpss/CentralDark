---
name: centraldark-config-management
display: CentralDark Configuration
description: CentralDark config changes, FABLE_LOOP settings.
---
## Purpose
This skill describes how to edit CentralDark YAML files safely. It
covers ensuring FABLE_LOOP remains READ_ONLY_CALIBRATION with
default_routing true.

## Steps
1. Locate target YAML file.
2. Apply a V4A patch with the patch tool.
3. Verify the diff; run any needed lint.
4. Commit & push.

## FABLE_LOOP
When updating FABLE_LOOP:
- `mode: READ_ONLY_CALIBRATION`
- `default_routing: true`
- `may_write_canonical: false`

## Support
See `references/` for example patches and snippets.
