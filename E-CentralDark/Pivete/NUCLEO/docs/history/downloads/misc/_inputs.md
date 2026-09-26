# OUTRO - _inputs.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\design-references\nexchat-original\code\src\assets\scss\components\_inputs.scss
**SHA:** 7ed53488a443ee47
**Timestamp:** 2026-08-26T19:39:40.009471
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;

    label {
        font-size: 13px;
        font-weight: 600;
        color: $dark-text-muted;
    }
}

.input-control {
    width: 100%;
    background-color: $dark-surface-light;
    border: 1px solid $dark-border;
    border-radius: $radius-md;
    padding: 12px 16px;
    color: $dark-text;
    font-size: 14px;
    transition: $transition-base;

    &:focus {
        border-color: $primary;
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary, #13ec5b) 10%, transparent) !important;
        background-color: transparent;
        outline: none !important;
    }

    &::placeholder {
        color: $dark-text-muted;
        opacity: 0.5;
    }
}
```