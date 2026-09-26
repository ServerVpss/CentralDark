# OUTRO - _messages.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\design-references\nexchat-original\code\src\assets\scss\components\_messages.scss
**SHA:** 97b3e663d50ecc6a
**Timestamp:** 2026-08-26T19:39:40.041256
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 12px;
- gap: 2px;
- gap: 3px;
- gap: 10px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

@keyframes typing-wave {

    0%,
    60%,
    100% {
        transform: translateY(0);
    }

    30% {
        transform: translateY(-4px);
    }
}

// Audio Waveform
.audio-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
    min-width: 200px;

    .play-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: color-mix(in srgb, var(--color-primary, #13ec5b) 20%, transparent);
        color: $primary;
        @include flex-center;
        transition: $transition-base;

        span {
            font-size: 24px;
        }

        &:hover {
            background-color: $primary;
            color: $dark-bg;
            transform: scale(1.1);
        }
    }

    .waveform {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 2px;
        height: 24px;

        span {
            flex: 1;
            width: 3px;
            background-color: color-mix(in srgb, var(--color-primary, #13ec5b) 30%, transparent);
            border-radius: 4px;
            transition: height 0.3s ease;

            &.active {
                background-color: $primary;
                animation: waveform-pulse 1.2s infinite ease-in-out;
            }
        }
    }

    .duration {
        font-size: 11px;
        color: color-mix(in srgb, $dark-text 60%, transparent);
        font-weight: 600;
        margin-left: 4px;
    }
}

// Link Preview Card
.link-preview {
    margin-top: 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: $radius-lg;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: $transition-base;
    cursor: pointer;

    &:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateY(-2px);
    }

    .preview-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .preview-content {
        padding: 10px 12px;

        .site-name {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: $primary;
            margin-bottom: 4px;
        }

        .title {
            font-size: 14px;
            font-weight: 700;
            color: $dark-text;
            line-height: 1.4;
            margin-bottom: 4px;
            @include text-truncate;
        }

        .description {
            font-size: 12px;
            color: $dark-text-muted;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    }
}

@keyframes waveform-pulse {

    0%,
    100% {
        height: 40%;
    }

    50% {
        height: 100%;
    }
}

@keyframes reaction-pop {
    from {
        opacity: 0;
        transform: scale(0.5) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.typing-indicator {
    display: flex;
    gap: 3px;
    padding: 12px 18px;
    background-color: $dark-surface-light;
    border-radius: $radius-lg $radius-lg $radius-lg 4px;
    width: fit-content;
    margin-top: 4px;
    box-shadow: $shadow-sm;
    border: 1px solid rgba(255, 255, 255, 0.03);

    span {
        width: 5px;
        height: 5px;
        background-color: $primary;
        border-radius: 50%;
        opacity: 0.6;
        animation: typing-wave 1.2s infinite ease-in-out;

        &:nth-child(2) {
            animation-delay: 0.1s;
        }

        &:nth-child(3) {
            animation-delay: 0.2s;
        }
    }
}

.reaction-picker {
    position: absolute;
    top: -48px;
    background-color: $dark-glass;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $radius-full;
    padding: 6px 10px;
    display: flex;
    gap: 10px;
    box-shadow: $shadow-xl;
    z-index: 1000;
    animation: reaction-pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;

    &.me {
        right: 0;
        transform-origin: right bottom;
    }

    &.them {
        left: 0;
        transform-origin: left bottom;
    }

    button {
        font-size: 18px;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;

        &:hover {
            transform: scale(1.4) translateY(-2px);
        }

        &:active {
            transform: scale(0.9);
        }
    }
}
```