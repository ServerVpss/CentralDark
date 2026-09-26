# OUTRO - _sidebar.scss
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\assets\scss\layout\_sidebar.scss
**SHA:** 9cd22d3559f6743f
**Timestamp:** 2026-08-26T19:39:41.601559
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 16px;
- gap: 10px;
- gap: 16px;
- gap: 6px;
- gap: 6px;
- gap: 16px;
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
@use "sass:color";
@use "../abstracts/variables" as *;
@use "../abstracts/mixins" as *;

// Helper to keep color vars robust in both modes
$surface-strong: var(--color-surface-hover);
$surface-glass: rgba(17, 24, 19, 0.4);

.chat-list-container {
    width: 100%;
    height: 100vh;
    background-color: rgb(var(--color-background-dark));
    border-right: 1px solid var(--color-scrollbar-thumb);
    display: flex;
    flex-direction: column;
    z-index: 10;
    transition: $transition-smooth;

    @include respond-to('md') {
        width: 380px;
    }

    .list-header {
        padding: 24px 10px 16px;
        position: relative;
        z-index: 2;

        h2 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: rgb(var(--color-white));
        }

        .header-actions button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgb(var(--color-surface-dark));
            border: 1px solid var(--color-scrollbar-thumb);
            color: rgb(var(--color-text-secondary));
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover {
                background: rgb(var(--color-surface-hover));
                color: var(--color-primary);
                transform: rotate(90deg);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
        }

        .search-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            background-color: rgb(var(--color-surface-dark));
            border-radius: 16px;
            padding: 12px 16px;
            border: 1px solid var(--color-scrollbar-thumb);
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

            &:focus-within {
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
                background-color: rgb(var(--color-surface-hover));
            }

            .material-symbols-outlined {
                color: rgb(var(--color-text-secondary));
                font-size: 20px;
                margin-right: 12px;
                transition: color 0.3s ease;
            }

            &:focus-within .material-symbols-outlined {
                color: var(--color-primary);
            }

            input {
                flex: 1;
                background: transparent;
                border: none;
                color: rgb(var(--color-white));
                font-size: 15px;
                font-family: inherit;
                outline: none;

                &::placeholder {
                    color: color-mix(in srgb, var(--color-text-secondary) 80%, transparent);
                    font-weight: 500;
                }
            }
        }

        .status-bar {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            padding: 20px 0 10px;
            margin: 0 -8px;
            padding-left: 8px;
            padding-right: 8px;
            @include scrollbar;

            &::-webkit-scrollbar {
                height: 0px; // Hide scrollbar for cleaner look
            }

            .status-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                min-width: 64px;

                span {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgb(var(--color-white));
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 64px;
                    text-align: center;
                    transition: $transition-base;
                }

                .status-ring {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    padding: 2.5px;
                    background: linear-gradient(45deg, var(--color-primary), #3b82f6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 10px color-mix(in srgb, var(--color-primary) 20%, transparent);

                    &.viewed {
                        background: var(--color-scrollbar-thumb);
                        box-shadow: none;
                        opacity: 0.7;
                    }

                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                 
```