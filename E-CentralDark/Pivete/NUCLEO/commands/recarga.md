# COMANDO - recarga.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.git.desativado-20260630-013358\recarg17asbrasil-main\recarga.css
**SHA:** 7fb768a636caeac0
**Timestamp:** 2026-08-28T02:39:03.120697
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 10px;
- gap: 8px;
- gap: 28px;
- gap: 10px;
- gap: 12px;
- gap: 8px;
- gap: 15px;
- gap: 15px;
- gap: 15px;
- gap: 10px;

### Ouro Bruto (primeiros 5000 chars)
```
/* Recarga Page - Layout chamativo */
.recarga-page {
    --recarga-primary: #0f172a;
    --recarga-accent: #f59e0b;
    --recarga-accent-2: #fbbf24;
    --recarga-bg: linear-gradient(165deg, #0f172a 0%, #1e293b 45%, #334155 100%);
    --recarga-card: #ffffff;
    --recarga-text: #0f172a;
    --recarga-muted: #64748b;
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--recarga-bg);
    font-family: 'Outfit', 'Inter', sans-serif;
    overflow-x: hidden;
}

.recarga-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.recarga-header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.recarga-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 700;
    color: var(--recarga-primary);
}

.recarga-logo .logo-icon {
    font-size: 26px;
    filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4));
}

.admin-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-primary);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.admin-link:hover {
    background: var(--card-bg-light);
    border-color: var(--border-light);
}

.recarga-main {
    padding: 32px 20px 48px;
    padding-left: max(20px, env(safe-area-inset-left));
    padding-right: max(20px, env(safe-area-inset-right));
    padding-bottom: max(48px, env(safe-area-inset-bottom));
}

.recarga-container {
    max-width: 560px;
    margin: 0 auto;
    width: 100%;
}

.recarga-step {
    display: none;
    background: var(--recarga-card);
    border-radius: 24px;
    padding: 0;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(0, 0, 0, 0.12);
    border: none;
    overflow: hidden;
}

.recarga-step.active {
    display: block;
}

/* Landing / Hero chamativo */
.recarga-landing {
    max-width: 560px;
    margin: 0 auto;
    padding: 0;
    text-align: center;
}

.landing-hero {
    position: relative;
    padding: 56px 32px 48px;
    background: linear-gradient(180deg, #fff8f0 0%, #ffffff 35%, #f8fafc 100%);
}

.landing-glow {
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
    pointer-events: none;
}

.landing-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
}

.landing-icon-wrap {
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    border-radius: 24px;
    box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4);
    animation: landing-pulse 2.5s ease-in-out infinite;
}

@keyframes landing-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4); }
    50% { transform: scale(1.05); box-shadow: 0 16px 40px rgba(245, 158, 11, 0.5); }
}

.landing-icon {
    font-size: 44px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.landing-title {
    font-family: 'Outfit', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: var(--recarga-primary);
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.landing-title-accent {
    display: inline-block;
    background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.landing-desc {
    font-size: 17px;
    color: var(--recarga-muted);
    line-height: 1.6;
    margin: 0;
    max-width: 380px;
}

.landing-benefits {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
}

.landing-pill {
    display: inline-flex;
    align-items: center;
    padding: 10px 18px;
    background: rgba(245, 158, 11, 0.12);
    color: #b45309;
    font-size: 14px;
    font-weight: 600;
    border-radius: 999px;
    border: 1px solid rgba(245, 158, 11, 0.25);
}

.btn-landing-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    max-width: 340px;
    padding: 20px 36px;
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 28px rgba(245, 158, 11, 0.45);
}

.btn-landing-cta:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(245, 158, 11, 0.5);
}

.btn-landing-cta:active {
    transform: tran
```