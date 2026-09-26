# COMANDO - Navigational-Tracking Mitigations.html
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Navigational-Tracking Mitigations.html
**SHA:** 887a3fa740eb335c
**Timestamp:** 2026-08-26T19:39:34.649660
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <p class="issue" id="issue-c8879d93"><a class="self-link" href="https://privacycg.github.io/nav-tracking-mitigations/#issue-c8879d93"></a>TODO: Consider if we should do anything when the clock is move
- <p class="issue" id="issue-a6c4e61d"><a class="self-link" href="https://privacycg.github.io/nav-tracking-mitigations/#issue-a6c4e61d"></a> TODO: Verify that using <a data-link-type="dfn" href="https:/
- <div class="issue">TODO: Consider if we should do anything when the clock is moved
- <div class="issue"> TODO: Verify that using <a data-link-type="dfn" href="https://tools.ietf.org/html/rfc6265/#section-5.1.3">domain-match</a> catches all cookies for the <a data-link-type="dfn" href=
- // TODO: shared util
- // TODO: shared util

### Ouro Bruto (primeiros 5000 chars)
```
<!DOCTYPE html>
<!-- saved from url=(0081)https://privacycg.github.io/nav-tracking-mitigations/#bounce-tracking-mitigations -->
<html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  
  <title>Navigational-Tracking Mitigations</title>
  <meta content="width=device-width" name="viewport">
  <link href="./Navigational-Tracking Mitigations_files/cg-draft" rel="stylesheet">
  <meta content="Bikeshed version b25686b9f, updated Fri Mar 14 14:15:20 2025 -0700" name="generator">
  <link href="https://privacycg.github.io/nav-tracking-mitigations/" rel="canonical">
  <link href="https://www.w3.org/2008/site/images/favicon.ico" rel="icon">
  <meta content="b28a3a7479f6f5c68ebfe344f53fb924cc093065" name="revision">
  <meta content="dark light" name="color-scheme">
  <link href="./Navigational-Tracking Mitigations_files/dark.css" media="" rel="stylesheet" type="text/css">
<style>
#example-link-decoration-tracking code em {background-color: cyan}
</style>
<style>/* Boilerplate: style-autolinks */
.css.css, .property.property, .descriptor.descriptor {
    color: var(--a-normal-text);
    font-size: inherit;
    font-family: inherit;
}
.css::before, .property::before, .descriptor::before {
    content: "‘";
}
.css::after, .property::after, .descriptor::after {
    content: "’";
}
.property, .descriptor {
    /* Don't wrap property and descriptor names */
    white-space: nowrap;
}
.type { /* CSS value <type> */
    font-style: italic;
}
pre .property::before, pre .property::after {
    content: "";
}
[data-link-type="property"]::before,
[data-link-type="propdesc"]::before,
[data-link-type="descriptor"]::before,
[data-link-type="value"]::before,
[data-link-type="function"]::before,
[data-link-type="at-rule"]::before,
[data-link-type="selector"]::before,
[data-link-type="maybe"]::before {
    content: "‘";
}
[data-link-type="property"]::after,
[data-link-type="propdesc"]::after,
[data-link-type="descriptor"]::after,
[data-link-type="value"]::after,
[data-link-type="function"]::after,
[data-link-type="at-rule"]::after,
[data-link-type="selector"]::after,
[data-link-type="maybe"]::after {
    content: "’";
}

[data-link-type].production::before,
[data-link-type].production::after,
.prod [data-link-type]::before,
.prod [data-link-type]::after {
    content: "";
}

[data-link-type=element],
[data-link-type=element-attr] {
    font-family: Menlo, Consolas, "DejaVu Sans Mono", monospace;
    font-size: .9em;
}
[data-link-type=element]::before { content: "<" }
[data-link-type=element]::after  { content: ">" }

[data-link-type=biblio] {
    white-space: pre;
}

@media (prefers-color-scheme: dark) {
    :root {
        --selflink-text: black;
        --selflink-bg: silver;
        --selflink-hover-text: white;
    }
}
</style>
<style>/* Boilerplate: style-colors */
/* Any --*-text not paired with a --*-bg is assumed to have a transparent bg */
:root {
    color-scheme: light dark;

    --text: black;
    --bg: white;

    --unofficial-watermark: url(https://www.w3.org/StyleSheets/TR/2016/logos/UD-watermark);

    --logo-bg: #1a5e9a;
    --logo-active-bg: #c00;
    --logo-text: white;

    --tocnav-normal-text: #707070;
    --tocnav-normal-bg: var(--bg);
    --tocnav-hover-text: var(--tocnav-normal-text);
    --tocnav-hover-bg: #f8f8f8;
    --tocnav-active-text: #c00;
    --tocnav-active-bg: var(--tocnav-normal-bg);

    --tocsidebar-text: var(--text);
    --tocsidebar-bg: #f7f8f9;
    --tocsidebar-shadow: rgba(0,0,0,.1);
    --tocsidebar-heading-text: hsla(203,20%,40%,.7);

    --toclink-text: var(--text);
    --toclink-underline: #3980b5;
    --toclink-visited-text: var(--toclink-text);
    --toclink-visited-underline: #054572;

    --heading-text: #005a9c;

    --hr-text: var(--text);

    --algo-border: #def;

    --del-text: red;
    --del-bg: transparent;
    --ins-text: #080;
    --ins-bg: transparent;

    --a-normal-text: #034575;
    --a-normal-underline: #bbb;
    --a-visited-text: var(--a-normal-text);
    --a-visited-underline: #707070;
    --a-hover-bg: rgba(75%, 75%, 75%, .25);
    --a-active-text: #c00;
    --a-active-underline: #c00;

    --blockquote-border: silver;
    --blockquote-bg: transparent;
    --blockquote-text: currentcolor;

    --issue-border: #e05252;
    --issue-bg: #fbe9e9;
    --issue-text: var(--text);
    --issueheading-text: #831616;

    --example-border: #e0cb52;
    --example-bg: #fcfaee;
    --example-text: var(--text);
    --exampleheading-text: #574b0f;

    --note-border: #52e052;
    --note-bg: #e9fbe9;
    --note-text: var(--text);
    --noteheading-text: hsl(120, 70%, 30%);
    --notesummary-underline: silver;

    --assertion-border: #aaa;
    --assertion-bg: #eee;
    --assertion-text: black;

    --advisement-border: orange;
    --advisement-bg: #fec;
    --advisement-text: var(--text);
    --advisementheading-text: #b35f00;

    --warning-border: red;
    --warning-bg: hsla(40,100%,50%,0.95);
    --warning-text: var(--text);

    --amendment-borde
```