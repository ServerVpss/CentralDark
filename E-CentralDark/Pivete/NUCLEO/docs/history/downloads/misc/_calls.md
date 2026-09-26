# OUTRO - _calls.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\design-references\nexchat-original\code\src\assets\scss\components\_calls.scss
**SHA:** 7afab3fd40422072
**Timestamp:** 2026-08-26T19:39:39.995471
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 8px;
- gap: 16px;
- gap: 12px;
- gap: 20px;
- gap: 6px;
- gap: 8px;
- gap: 32px;
- gap: 40px;
- gap: 20px;
- gap: 32px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "sass:color";
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

/* ==================================
   VIDEO CALL (FULLSCREEN ELITE)
================================== */
.video-call-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background-color: $dark-bg;
    overflow: hidden;
    color: #fff;
    font-family: inherit;
    animation: fade-in 0.4s ease-out forwards;

    .remote-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background-color: #000;

        img,
        video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.85);
            transition: filter 0.5s ease;
        }
    }

    .call-overlay-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        padding: 20px 16px;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
        z-index: 10;

        @include respond-to('md') {
            padding: 40px 32px;
        }

        .video-call-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .encryption-badge {
                display: flex;
                align-items: center;
                gap: 8px;
                background-color: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                padding: 10px 20px;
                border-radius: $radius-full;
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

                .material-symbols-outlined {
                    color: $primary;
                    font-size: 16px;
                }

                .divider {
                    width: 1px;
                    height: 14px;
                    background-color: rgba(255, 255, 255, 0.2);
                    margin: 0 6px;
                }

                .time {
                    opacity: 0.9;
                    letter-spacing: 0.5px;
                }
            }

            .header-actions {
                display: flex;
                gap: 16px;

                .icon-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    @include flex-center;
                    transition: $transition-base;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

                    &:hover {
                        background-color: rgba(255, 255, 255, 0.2);
                        transform: translateY(-2px);
                        border-color: rgba(255, 255, 255, 0.3);
                    }
                }
            }
        }
    }

    .local-video-pip {
        position: absolute;
        bottom: 120px;
        right: 16px;
        width: 100px;
        height: 150px;
        border-radius: $radius-xl;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        z-index: 10;
        background-color: $dark-bg;
        transition: $transition-smooth;
        cursor: pointer;

        @include respond-to('md') {
            bottom: 140px;
            right: 32px;
            width: 150px;
            height: 225px;
            border-width: 3px;
        }

        &:hover {
            transform: scale(1.05) translateY(-5px);
            border-color: $primary;
            box-shadow: $shadow-glow;
        }

        .local-video-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, $primary-blue, color.adjust($primary-blue, $lightness: -15%));
            color: #fff;
            font-size: 28px;
            font-weight: 800;
        }

        .user-label {
            position: absolute;
            bottom: 12px;
            left: 12px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #fff;
            font-weight: 700;
        }
    }

    .call-overlay-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 40px 32px;
        
```