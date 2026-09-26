# OUTRO - _messenger.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\assets\scss\layout\_messenger.scss
**SHA:** 28a9d0b4876c1684
**Timestamp:** 2026-08-26T19:39:41.530112
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 4px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.messenger-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: $dark-bg;

    .messenger-main {
        flex: 1;
        display: flex;
        min-width: 0;
        position: relative;
    }
}

// Mobile Bottom Nav
.mobile-nav {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    height: 64px;
    background-color: $dark-glass;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1000;
    border-radius: $radius-xl;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

    @include respond-to('md') {
        display: none;
    }

    .mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: $dark-text-muted;
        transition: $transition-base;
        flex: 1;
        gap: 4px;

        &.active {
            color: $primary;

            span.material-symbols-outlined {
                transform: translateY(-2px);
                filter: drop-shadow(0 0 8px color-mix(in srgb, var(--color-primary, #13ec5b) 40%, transparent));
            }
        }

        span.material-symbols-outlined {
            font-size: 24px;
            transition: $transition-base;
        }

        span:not(.material-symbols-outlined) {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    }
}
```