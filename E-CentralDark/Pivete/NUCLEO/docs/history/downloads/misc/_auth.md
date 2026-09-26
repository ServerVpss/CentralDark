# OUTRO - _auth.scss
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\assets\scss\pages\_auth.scss
**SHA:** c178f0f48f7e03a3
**Timestamp:** 2026-08-26T19:33:59.648323
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 12px;
- gap: 12px;
- gap: 8px;
- gap: 16px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $dark-bg;
    padding: 24px;
    position: relative;
    overflow: hidden;
    overflow-y: auto;

    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--color-primary, #13ec5b) 5%, transparent) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba($primary-blue, 0.05) 0%, transparent 50%);
        pointer-events: none;
    }

    .auth-card {
        width: 100%;
        max-width: 440px;
        background-color: $dark-glass;
        backdrop-filter: blur(12px);
        border: 1px solid $dark-border;
        border-radius: $radius-2xl;
        padding: 32px 24px;
        box-shadow: $shadow-xl;
        position: relative;
        z-index: 10;

        @include respond-to('md') {
            padding: 48px;
        }

        .auth-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 40px;

            span {
                font-size: 40px;
                color: $primary;
            }

            h2 {
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -1px;
            }
        }

        .auth-header {
            text-align: center;
            margin-bottom: 32px;

            h1 {
                font-size: 24px;
                margin-bottom: 8px;
            }

            p {
                color: $dark-text-muted;
                font-size: 14px;
            }
        }
    }

    .auth-footer {
        margin-top: 32px;
        text-align: center;
        font-size: 14px;
        color: $dark-text-muted;

        a {
            color: $primary;
            font-weight: 600;
            margin-left: 4px;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

.social-auth {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 32px;

    .social-btn {
        height: 48px;
        border: 1px solid $dark-border;
        border-radius: $radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        transition: $transition-base;

        &:hover {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }

        img {
            width: 20px;
            height: 20px;
        }
    }
}

.auth-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    color: $dark-text-muted;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background-color: $dark-border;
    }
}
```