# OUTRO - _status.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\design-references\nexchat-original\code\src\assets\scss\components\_status.scss
**SHA:** a9860546a5156eea
**Timestamp:** 2026-08-26T19:39:40.075308
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 16px;
- gap: 8px;
- gap: 16px;
- gap: 6px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.status-bar {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 0 4px 16px;
    @include scrollbar($width: 2px);

    .status-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        flex-shrink: 0;

        .status-ring {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            padding: 3px;
            border: 2px solid $primary;
            transition: $transition-base;

            &.viewed {
                border-color: $dark-border;
            }

            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
            }
        }

        span {
            font-size: 11px;
            font-weight: 500;
            color: $dark-text;
            max-width: 60px;
            @include text-truncate;
        }

        &.add-status {
            .status-ring {
                border: 2px dashed $dark-border;
                @include flex-center;
                color: $dark-text-muted;

                &:hover {
                    border-color: $primary;
                    color: $primary;
                }
            }
        }
    }
}

// Status Page Specific Styles
.status-list-sidebar {
    width: 100%;
    height: 100vh;
    background-color: $dark-surface;
    border-right: 1px solid $dark-border;
    display: flex;
    flex-direction: column;
    z-index: 20;

    @include respond-to('md') {
        width: 400px;
    }

    .sidebar-header {
        height: 72px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: $dark-glass;
        border-bottom: 1px solid $dark-border;
        flex-shrink: 0;

        .action-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: $dark-text-muted;
            @include flex-center;
            transition: $transition-base;

            &:hover {
                background-color: $dark-surface-light;
                color: $dark-text;
            }
        }
    }

    .sidebar-scroll {
        flex: 1;
        overflow-y: auto;
        @include scrollbar;
    }
}

.status-item-horizontal {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    gap: 16px;
    cursor: pointer;
    transition: $transition-base;
    border-left: 3px solid transparent;

    &:hover {
        background-color: $dark-surface-light;
    }

    &.active {
        background-color: color-mix(in srgb, var(--color-primary, #13ec5b) 5%, transparent);
        border-left-color: $primary;
    }

    .status-image-wrapper {
        position: relative;
        flex-shrink: 0;

        .status-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            object-fit: cover;
        }

        .add-badge {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 22px;
            height: 22px;
            background-color: $primary;
            color: $dark-bg;
            border-radius: 50%;
            @include flex-center;
            border: 2px solid $dark-surface;

            span {
                font-size: 16px;
                font-weight: bold;
            }
        }

        .status-ring {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            padding: 2px;
            border: 2px solid $primary;
            @include flex-center;

            &.viewed {
                border-color: $dark-border;
            }
        }
    }

    .status-info {
        flex: 1;
        min-width: 0;

        .status-name {
            font-size: 16px;
            font-weight: 600;
            color: $dark-text;
            margin-bottom: 4px;
        }

        .status-time {
            font-size: 13px;
            color: $dark-text-muted;
        }
    }
}

.section-title-alt {
    padding: 24px 24px 12px;

    h6 {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: $primary;
        font-weight: 700;
    }
}

// Viewer specific
.status-progress-container {
    padding: 20px 20px 10px;
    display: flex;
    gap: 6px;
    width: 100%;
    z-index: 100;
}

.status-progress-segment {
    height: 4px;
    flex: 1;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: $radius-full;
    overflow: hidden;
    position: relative;

    .progress-fill {
        position: absolute;
        inset: 0;
        background-color: #fff;
        width: 0;
        border-radius: $radius-full;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);

        &.completed {
            width: 100%;
        }

        &.active {
            animation: status-progress 5s linear f
```