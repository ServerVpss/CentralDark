# OUTRO - rich-text.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\rich-text.test.mjs
**SHA:** c743bf4d03578576
**Timestamp:** 2026-08-28T02:37:58.784377
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- test("corpus: snake_case placeholders keep their underscores", { ...needsDom, todo: "intraword emphasis" }, () => {

### Ouro Bruto (primeiros 5000 chars)
```
// Run with: node --test rich-text.test.mjs
//
// The renderer is the vendored markdown-it, pinned to the version Azure DevOps
// ships, so these tests are really asserting that the canvas previews a
// description the way Azure DevOps will render it after the save.
//
// The line-break cases are the reason the vendored bundle exists. Azure DevOps
// never sets markdown-it's `breaks` option, so a bare newline is not a line break
// and two trailing spaces are. A renderer that assumes otherwise silently drops
// authored line breaks the moment the description is saved.
import assert from "node:assert/strict";
import test from "node:test";

import { BOT_MARKUP, COLLAPSIBLE_MARKUP, TYPE_PARAMETERS } from "./rich-text.corpus.mjs";

// These extensions ship without node_modules, so jsdom is not guaranteed to be
// present. Skip rather than fail when it is missing, and run with:
//   npm install jsdom && node --test rich-text.test.mjs
let JSDOM;
try {
    ({ JSDOM } = await import("jsdom"));
} catch {
    JSDOM = null;
}
const needsDom = { skip: JSDOM ? false : "jsdom is not installed" };

let renderRichText;
let markdownToHtml;
let looksLikeHtml;
if (JSDOM) {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.DOMParser = dom.window.DOMParser;
    globalThis.Node = dom.window.Node;
    ({ renderRichText, markdownToHtml, looksLikeHtml } = await import("./ui/rich-text.mjs"));
}

function render(markdown) {
    const host = document.createElement("div");
    renderRichText(host, markdown, { format: "markdown" });
    return host.innerHTML;
}

test("a bare newline is not a line break, the way Azure DevOps renders it", needsDom, () => {
    assert.doesNotMatch(markdownToHtml("line one\nline two"), /<br>/);
});

test("two trailing spaces are a line break, the way Azure DevOps renders it", needsDom, () => {
    assert.match(markdownToHtml("line one  \nline two"), /<br>/);
});

test("a blank line starts a new paragraph", needsDom, () => {
    const html = markdownToHtml("para one\n\npara two");
    assert.equal((html.match(/<p>/g) || []).length, 2);
});

test("tables render, because pull request descriptions support them", needsDom, () => {
    const html = render("| a | b |\n|---|---|\n| 1 | 2 |");
    assert.match(html, /<table>/);
    assert.match(html, /<th>a<\/th>/);
});

test("task lists render as checkboxes", needsDom, () => {
    const html = render("- [x] done\n- [ ] todo");
    assert.match(html, /type="checkbox"/);
    assert.match(html, /checked/);
});

test("strikethrough renders", needsDom, () => {
    assert.match(markdownToHtml("~~gone~~"), /<s>gone<\/s>/);
});

test("bare URLs are linkified", needsDom, () => {
    // The sanitizer adds target/rel on the way out, so match the href only.
    assert.match(render("see https://example.com now"), /<a href="https:\/\/example\.com"/);
});

test("a fenced block keeps its language hint", needsDom, () => {
    assert.match(render("```js\nconst a = 1;\n```"), /class="language-js"/);
});

test("a script tag in Markdown is visible source text, never an element", needsDom, () => {
    const html = render("<script>alert(1)</script>");
    assert.doesNotMatch(html, /<script/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("inline HTML an author wrote is rendered, the way Azure DevOps renders it", needsDom, () => {
    const html = render('feedback: <a href="https://example.com" title="Thumbs up"><strong>yes</strong></a>');
    assert.match(html, /<a href="https:\/\/example\.com"/);
    assert.match(html, /<strong>yes<\/strong>/);
    assert.doesNotMatch(html, /&lt;a /);
});

test("an HTML comment in Markdown does not show up as text", needsDom, () => {
    const html = render("visible\n\n<!-- Policy app identification -->");
    assert.match(html, /visible/);
    assert.doesNotMatch(html, /Policy app identification/);
});

test("emoji shortcodes render as emoji, the way Azure DevOps renders them", needsDom, () => {
    assert.match(render("nice work :thumbsup:"), /👍/);
});

test("a shortcode inside authored HTML still renders", needsDom, () => {
    // How PullRequestQuantifier labels its feedback links: a shortcode nested in
    // inline HTML, which only renders if both the HTML and the emoji pass work.
    const html = render('<a href="https://example.com" title="Thumbs up"><strong>:thumbsup:</strong></a>');
    assert.match(html, /<strong>👍<\/strong>/);
    assert.doesNotMatch(html, /:thumbsup:/);
});

test("an unusable link scheme never becomes a link", needsDom, () => {
    const html = render("[click](javascript:alert(1))");
    // markdown-it refuses the scheme outright, so the source stays literal text.
    // What matters is that no anchor carries it.
    assert.doesNotMatch(html, /href=/);
    assert.doesNotMatch(html, /<a\b/);
});

test("inline rendering does not wrap the result in
```