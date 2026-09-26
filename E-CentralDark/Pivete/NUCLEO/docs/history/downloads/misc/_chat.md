# OUTRO - _chat.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\assets\scss\layout\_chat.scss
**SHA:** 22bb72f9b355eff2
**Timestamp:** 2026-08-26T19:39:41.467668
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 12px;
- gap: 12px;
- gap: 8px;
- gap: 20px;
- gap: 12px;
- gap: 12px; // Gap between input and send button
- gap: 12px;
- gap: 4px;
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "sass:color";
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.chat-window {
    display: flex;
    flex: 1;
    height: 100vh;
    background-color: $dark-bg;
    overflow: hidden;
    position: relative;

    .pinned-message-bar {
        position: absolute;
        top: 72px;
        left: 0;
        right: 0;
        z-index: 50;
        padding: 8px 20px;
        background: color-mix(in srgb, $dark-surface 60%, transparent);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
        transition: $transition-base;

        &:hover {
            background: color-mix(in srgb, $dark-surface 80%, transparent);

            .pin-icon {
                transform: rotate(-15deg) scale(1.1);
            }
        }

        .pin-icon {
            color: $primary;
            font-size: 20px;
            transition: $transition-base;
        }

        .pinned-content {
            flex: 1;
            min-width: 0;

            h4 {
                font-size: 12px;
                font-weight: 700;
                color: $primary;
                margin: 0;
            }

            p {
                font-size: 13px;
                color: $dark-text-muted;
                @include text-truncate;
                margin: 0;
            }
        }

        .close-pinned {
            color: $dark-text-muted;
            font-size: 18px;

            &:hover {
                color: $dark-text;
            }
        }
    }

    .main-chat-area {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        position: relative;
        background-color: $dark-bg;

        &::before {
            content: '';
            position: absolute;
            width: 150%;
            height: 150%;
            top: -25%;
            left: -25%;
            background:
                radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--color-primary, #13ec5b) 8%, transparent) 0%, transparent 40%),
                radial-gradient(circle at 80% 70%, rgba($primary-blue, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 50% 10%, rgba($primary-purple, 0.05) 0%, transparent 40%);
            filter: blur(80px);
            animation: aurora-float 20s ease-in-out infinite alternate;
            z-index: 0;
            pointer-events: none;
        }

        .bg-pattern {
            position: absolute;
            inset: 0;
            opacity: 0.15;
            z-index: 1;
            pointer-events: none;
            background-image: radial-gradient(color-mix(in srgb, var(--color-primary, #13ec5b) 20%, transparent) 1px, transparent 1px);
            background-size: 32px 32px;
        }
    }

    @keyframes aurora-float {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }

        100% {
            transform: translate(-5%, -5%) rotate(5deg);
        }
    }

    // Header
    .chat-header {
        height: 64px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: $dark-glass;
        backdrop-filter: blur(10px);
        border-bottom: 1px solid $dark-border;
        z-index: 10;

        @include respond-to('md') {
            height: 72px;
            padding: 0 24px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;

            img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }

            .details {
                h3 {
                    font-size: 16px;
                    color: $dark-text;
                }

                p {
                    font-size: 12px;
                    color: $success;
                }
            }
        }

        .header-actions {
            display: flex;
            gap: 8px;

            .action-btn {
                width: 40px;
                height: 40px;
                border-radius: $radius-md;
                color: $dark-text-muted;
                @include flex-center;
                transition: $transition-base;

                &:hover {
                    background-color: $dark-surface-light;
                    color: $dark-text;
                }
            }
        }
    }

    // Messages Area
    .messages-container {
        flex: 1;
        padding: 20px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        @include scrollbar;
        z-index: 1;
        position: relative;

        @include respond-to('md') {
            padding: 32px 24px;
        }

        .drag-overlay {
            position: absolute
```