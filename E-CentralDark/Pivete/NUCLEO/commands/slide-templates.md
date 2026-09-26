# COMANDO - slide-templates.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\daloopa\skills\ib-deck\references\slide-templates.md
**SHA:** 921ef00c5e2b4026
**Timestamp:** 2026-08-26T18:31:16.031364
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 30px;">
- <div style="display: flex; align-items: center; gap: 16px;">
- <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
- <div style="display: flex; gap: 12px; margin-bottom: 20px;">

### Ouro Bruto (primeiros 5000 chars)
```
# Slide Templates

HTML/CSS templates for each slide type. All slides use CSS custom properties from design-system.md.

## Base Slide CSS

```css
:root {
    --navy: #1B2A4A;
    --steel-blue: #4A6FA5;
    --gold: #C5A55A;
    --green: #27AE60;
    --red: #C0392B;
    --light-gray: #F8F9FA;
    --mid-gray: #E9ECEF;
    --dark-gray: #6C757D;
    --near-black: #343A40;
}

@page {
    size: 1280px 720px;
    margin: 0;
}

body {
    margin: 0;
    padding: 0;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif;
    color: var(--near-black);
}

.slide {
    width: 1280px;
    height: 720px;
    padding: 40px 50px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
}

.slide-header {
    font-size: 24px;
    font-weight: 700;
    color: var(--navy);
    border-bottom: 2px solid var(--gold);
    padding-bottom: 8px;
    margin-bottom: 20px;
}

.slide-footer {
    position: absolute;
    bottom: 15px;
    left: 50px;
    right: 50px;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    color: var(--dark-gray);
}
/* Slide footer should contain: left="Prepared by {FIRM_NAME}", center="CONFIDENTIAL" (if IB Advisory), right="Page N" */
/* Replace {FIRM_NAME} with user-specified firm or "Daloopa" (default). NEVER hallucinate a firm name. */

.confidential {
    color: var(--red);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}
```

## 1. Cover Slide

```html
<div class="slide" style="background: linear-gradient(135deg, var(--navy) 0%, #2C4066 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
    <div style="color: white; font-size: 36px; font-weight: 700; margin-bottom: 8px;">{COMPANY_NAME}</div>
    <div style="color: var(--gold); font-size: 20px; margin-bottom: 40px;">{DECK_TITLE}</div>
    <div style="color: rgba(255,255,255,0.7); font-size: 14px;">{DATE}</div>
    <!-- Replace {FIRM_NAME} with user-specified firm or "Daloopa" (default). NEVER hallucinate a firm name. -->
    <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 8px;">Prepared by {FIRM_NAME}</div>
    <div style="position: absolute; bottom: 30px; color: var(--red); font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">CONFIDENTIAL</div>
</div>
```

## 2. Disclaimer Slide

```html
<div class="slide" style="display: flex; flex-direction: column; justify-content: center; padding: 60px 80px;">
    <div style="font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 20px;">Important Disclaimer</div>
    <div style="font-size: 10px; color: var(--dark-gray); line-height: 1.8;">
        This presentation has been prepared solely for informational purposes. It does not constitute an offer to sell or a solicitation of an offer to buy any security. The information herein is based on sources believed to be reliable but is not guaranteed as to accuracy or completeness. Past performance is not indicative of future results. All financial data sourced from Daloopa (company filings).
    </div>
</div>
```

## 3. Table of Contents

```html
<div class="slide">
    <div class="slide-header">Table of Contents</div>
    <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 30px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 36px; height: 36px; background: var(--navy); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>
            <div style="font-size: 16px; color: var(--near-black);">Situation Overview</div>
        </div>
        <!-- Repeat for each section -->
    </div>
</div>
```

## 4. Section Divider

```html
<div class="slide" style="background: var(--navy); display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <div style="color: var(--gold); font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;">Section {N}</div>
    <div style="color: white; font-size: 32px; font-weight: 700;">{SECTION_TITLE}</div>
</div>
```

## 5. Executive Summary

```html
<div class="slide">
    <div class="slide-header">Executive Summary</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--navy); margin-bottom: 10px;">Situation Overview</div>
            <ul style="font-size: 12px; line-height: 1.8; padding-left: 16px;">
                <li>{point_1}</li>
                <li>{point_2}</li>
                <li>{point_3}</li>
            </ul>
        </div>
        <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--navy); margin-bottom: 10px;">Key Findings</div>
            <ul style="font-size: 12px; line-height: 1.8; padding-left: 16px;">
                <li>{finding_1}</li>
                <li
```