# OUTRO - _landing.scss
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\assets\scss\pages\_landing.scss
**SHA:** 71c009300cd09d57
**Timestamp:** 2026-08-26T19:33:47.758799
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 40px;
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.landing-footer {
    background-color: #050806;
    border-top: 1px solid $dark-border;
    padding: 80px 0 40px;

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 40px;

        @include respond-to('md') {
            grid-template-columns: 2fr 1fr 1fr 1fr;
        }
    }
}

.hero-section {
    position: relative;
    padding: 60px 0 40px;
    text-align: center;
    overflow: hidden;

    @include respond-to('md') {
        padding: 120px 0 80px;
    }

    &::before {
        content: '';
        position: absolute;
        top: -10%;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 40%;
        background: radial-gradient(circle, color-mix(in srgb, var(--color-primary, #13ec5b) 15%, transparent) 0%, transparent 70%);
        z-index: -1;
    }

    h1 {
        font-size: 2.25rem;
        line-height: 1.1;
        margin-bottom: 24px;
        background: linear-gradient(to bottom, #fff, #9db9a6);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        letter-spacing: -0.05em;

        @include respond-to('sm') {
            font-size: 3.5rem;
        }

        @include respond-to('md') {
            font-size: 5rem;
        }
    }

    p {
        max-width: 700px;
        margin: 0 auto 40px;
        font-size: 1rem;
        padding: 0 20px;

        @include respond-to('md') {
            font-size: 1.25rem;
            padding: 0;
        }
    }
}

.feature-card {
    background-color: $dark-surface;
    border: 1px solid $dark-border;
    padding: 24px;
    border-radius: $radius-lg;
    transition: $transition-smooth;
    text-align: left;

    @include respond-to('md') {
        padding: 32px;
    }

    &:hover {
        transform: translateY(-10px);
        border-color: $primary;
        box-shadow: $shadow-glow;
    }

    .icon-box {
        width: 56px;
        height: 56px;
        background-color: $primary-light;
        color: $primary;
        @include flex-center;
        border-radius: $radius-md;
        margin-bottom: 24px;

        span {
            font-size: 32px;
        }
    }

    h3 {
        margin-bottom: 12px;
    }

    p {
        font-size: 1rem;
        margin: 0;
    }
}

.demo-container {
    max-width: 1000px;
    margin: 40px auto;
    border-radius: $radius-xl;
    overflow: hidden;
    border: 1px solid $dark-border;
    box-shadow: $shadow-lg;
    background-color: $dark-bg;
    position: relative;

    @include respond-to('md') {
        margin: 60px auto;
    }

    .browser-header {
        height: 40px;
        background-color: $dark-surface;
        border-bottom: 1px solid $dark-border;
        padding: 0 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;

            &.red {
                background-color: #ff5f56;
            }

            &.yellow {
                background-color: #ffbd2e;
            }

            &.green {
                background-color: #27c93f;
            }
        }
    }
}
```