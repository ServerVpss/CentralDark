# OUTRO - _ai.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\design-references\nexchat-original\code\src\assets\scss\components\_ai.scss
**SHA:** f42e397ed58cb18f
**Timestamp:** 2026-08-26T19:39:39.892340
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 12px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "sass:color";
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

.ai-assistant-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin: 8px 16px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary, #13ec5b) 15%, transparent), rgba($primary-blue, 0.15));
    border: 1px solid color-mix(in srgb, var(--color-primary, #13ec5b) 20%, transparent);
    border-radius: $radius-lg;
    cursor: pointer;
    transition: $transition-base;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transform: translateX(-100%);
        transition: 0.5s;
    }

    &:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary, #13ec5b) 25%, transparent), rgba($primary-blue, 0.25));
        border-color: color-mix(in srgb, var(--color-primary, #13ec5b) 40%, transparent);
        box-shadow: 0 8px 20px -5px color-mix(in srgb, var(--color-primary, #13ec5b) 20%, transparent);

        &::before {
            transform: translateX(100%);
        }

        .ai-icon {
            transform: scale(1.1) rotate(10deg);
        }
    }

    .ai-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, $primary, $primary-blue);
        border-radius: $radius-md;
        @include flex-center;
        color: $dark-bg;
        transition: $transition-base;

        span {
            font-size: 24px;
        }
    }

    .ai-info {
        text-align: left;

        h4 {
            font-size: 14px;
            font-weight: 700;
            color: $dark-text;
            margin: 0;
        }

        p {
            font-size: 11px;
            color: $primary;
            margin: 2px 0 0;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    }

    .ai-sparkle {
        position: absolute;
        top: 8px;
        right: 8px;
        color: $primary;
        font-size: 14px;
        animation: ai-pulse 2s infinite;
    }
}

@keyframes ai-pulse {

    0%,
    100% {
        opacity: 0.4;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.2);
    }
}

// AI Message Bubble Special Styles
.message-row.ai {
    .message-bubble {
        background: linear-gradient(135deg, $dark-surface, color-mix(in srgb, $dark-surface, white 5%)) !important;
        border: 1px solid color-mix(in srgb, var(--color-primary, #13ec5b) 20%, transparent) !important;
        position: relative;

        &::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            background: linear-gradient(135deg, $primary, $primary-blue);
            z-index: -1;
            opacity: 0.3;
            filter: blur(8px);
        }

        p {
            color: $dark-text;
        }
    }
}
```