# OUTRO - _documentation.scss
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\assets\scss\pages\_documentation.scss
**SHA:** f1f7db861eea653a
**Timestamp:** 2026-08-26T19:33:47.930412
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 12px;
- gap: 8px;
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "sass:color";
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.docs-page {
    background-color: $dark-bg;
    min-height: 100vh;
    display: flex;

    .docs-sidebar {
        width: 300px;
        height: 100vh;
        border-right: 1px solid $dark-border;
        background-color: $dark-surface;
        position: sticky;
        top: 0;
        padding: 32px;
        display: none;
        flex-direction: column;
        flex-shrink: 0;

        @include respond-to('md') {
            display: flex;
        }

        .docs-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 48px;

            span {
                color: $primary;
                font-size: 32px;
            }

            h2 {
                font-size: 20px;
                font-weight: 800;
            }
        }

        nav {
            ul {
                display: flex;
                flex-direction: column;
                gap: 8px;

                li {
                    a {
                        display: block;
                        padding: 10px 16px;
                        border-radius: $radius-md;
                        font-size: 14px;
                        font-weight: 600;
                        color: $dark-text-muted;
                        transition: $transition-base;

                        &:hover {
                            color: $dark-text;
                            background-color: rgba(255, 255, 255, 0.05);
                        }

                        &.active {
                            color: $primary;
                            background-color: $primary-light;
                        }
                    }
                }
            }
        }
    }

    .docs-content {
        flex: 1;
        padding: 40px 24px;
        max-width: 1400px;
        margin: 0 auto;

        @include respond-to('md') {
            padding: 64px;
        }

        .breadcrumb {
            display: flex;
            gap: 8px;
            font-size: 13px;
            color: $dark-text-muted;
            margin-bottom: 32px;
        }

        h1 {
            font-size: 32px;
            margin-bottom: 16px;
            background: linear-gradient(to bottom, #fff, #9db9a6);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;

            @include respond-to('md') {
                font-size: 48px;
            }
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            color: $dark-text-muted;
            margin-bottom: 24px;

            @include respond-to('md') {
                font-size: 18px;
                margin-bottom: 48px;
            }
        }

        section {
            padding-top: 64px;
            margin-bottom: 64px;
            border-top: 1px solid $dark-border;

            h2 {
                font-size: 32px;
                margin-bottom: 24px;
            }

            h3 {
                font-size: 24px;
                margin-top: 40px;
                margin-bottom: 16px;
            }

            p {
                font-size: 16px;
                margin-bottom: 24px;
            }

            pre {
                background-color: $dark-surface-light;
                padding: 24px;
                border-radius: $radius-lg;
                overflow-x: auto;
                font-family: 'JetBrains Mono', monospace;
                font-size: 14px;
                border: 1px solid $dark-border;
                margin-bottom: 32px;

                code {
                    color: $primary;
                }
            }
        }
    }
}
```