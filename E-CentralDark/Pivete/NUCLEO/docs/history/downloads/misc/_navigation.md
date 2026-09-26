# OUTRO - _navigation.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\assets\scss\layout\_navigation.scss
**SHA:** ca0f34db2ccf4513
**Timestamp:** 2026-08-26T19:39:41.558643
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 16px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.navigation-rail {
    display: none;
    width: 72px;
    height: 100vh;
    background-color: $dark-bg;
    border-right: 1px solid $dark-border;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    z-index: 50;
    flex-shrink: 0;

    @include respond-to('md') {
        display: flex;
        width: 80px;
    }

    .logo {
        margin-bottom: 30px;
        color: $primary;

        span {
            font-size: 32px;
        }
    }

    .nav-items {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
    }

    .nav-item {
        width: 48px;
        height: 48px;
        @include flex-center;
        border-radius: $radius-md;
        color: $dark-text-muted;
        transition: $transition-base;
        position: relative;

        &:hover {
            color: $primary;
            background-color: $primary-light;
        }

        &.active {
            color: $primary;
            background-color: $primary-light;

            &::after {
                content: '';
                position: absolute;
                left: -15px;
                top: 20%;
                height: 60%;
                width: 4px;
                background-color: $primary;
                border-radius: 0 4px 4px 0;
            }
        }

        span {
            font-size: 24px;
        }
    }
}
```