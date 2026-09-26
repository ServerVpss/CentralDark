# OUTRO - _buttons.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\design-references\nexchat-original\code\src\assets\scss\components\_buttons.scss
**SHA:** 1a2501954a37d3bd
**Timestamp:** 2026-08-26T19:39:39.962506
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "sass:color";
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: $radius-md;
    font-weight: 600;
    font-size: 14px;
    transition: $transition-base;
    cursor: pointer;

    &.btn-primary {
        background-color: var(--color-primary, #13ec5b);
        color: $dark-bg;

        &:hover {
            background-color: color-mix(in srgb, var(--color-primary, #13ec5b), white 15%);
            box-shadow: $shadow-glow;
        }
    }

    &.btn-secondary {
        background-color: $dark-surface-light;
        color: $dark-text;

        &:hover {
            background-color: color-mix(in srgb, $dark-surface-light, white 5%);
        }
    }

    &.btn-ghost {
        background: none;
        color: $dark-text-muted;

        &:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: $dark-text;
        }
    }
}
```