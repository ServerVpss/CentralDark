# COMANDO - rich-text-policy.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\ui\rich-text-policy.mjs
**SHA:** d1df6e76c3bbed89
**Timestamp:** 2026-08-28T02:37:57.158686
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- function withoutComments(html, pattern = COMMENT_OR_TAG) {

### Ouro Bruto (primeiros 5000 chars)
```
// The write-side markup policies, shared by the browser editor and the canvas server.
//
// The read-side sanitizer in rich-text.mjs is deliberately permissive: it has to
// render whatever Azure DevOps already holds, so it allows ~50 tags and silently
// drops what it cannot show (style attributes, font tags, colors). That is fine
// for rendering and fatal for editing -- saving a sanitized render would write the
// stripped version back over the original.
//
// Two policies live here, because there are two different questions to ask.
//
//   1. validateWriteHtml -- "could this editor have produced this markup?" A small
//      allow-list, used for the agent-facing update_work_item action, where the
//      caller is authoring new markup rather than preserving existing markup. The
//      editor should never emit a violation, so the server rejects rather than
//      rewrites: a violation is a bug we want to hear about, not something to
//      paper over.
//   2. validateEditableHtml -- "is any of this executable?" Used for canvas edits,
//      where the content handed back is mostly content Azure DevOps already had
//      and this canvas never authored. Rewriting that content is the silent data
//      loss the read-only fallback existed to prevent, so the only thing refused
//      is markup that runs.
//
// Both are intentionally string-based and DOM-free so the same code runs in the
// browser and in node.

// Elements the editor can produce, and that Azure DevOps renders predictably.
// `div` is here because the Azure DevOps web editor wraps almost everything in
// one; excluding it would trip the fidelity gate on the majority of real fields.
export const WRITE_TAGS = new Set([
    "a", "blockquote", "br", "code", "div", "em", "h1", "h2", "h3", "h4",
    "li", "ol", "p", "pre", "s", "strong", "u", "ul",
]);

// Attributes allowed per tag. Everything else -- style, class, id, colors, event
// handlers, width/height -- is a violation rather than something to strip.
export const WRITE_ATTRIBUTES = {
    a: new Set(["href", "title"]),
};

// Tags the editor never emits but which browsers love to inject via contenteditable
// or a paste. Called out separately so the violation message can be specific.
const BROWSER_JUNK_TAGS = new Set(["font", "span", "b", "i", "strike", "center", "big", "small"]);

const SAFE_WRITE_URL = /^(?:https?:\/\/|mailto:|#|\/(?![/\\]))/i;

// Attributes that carry a URL, and so decide what a click or a load reaches.
// Checking only href and src leaves `action`, `formaction`, and the rest as ways
// to smuggle a javascript: scheme past both policies and into Azure DevOps, where
// their renderer is the one that would run it.
export const URL_ATTRIBUTES = new Set([
    "action", "background", "cite", "data", "formaction", "href", "longdesc",
    "ping", "poster", "src", "srcset", "xlink:href",
]);

/**
 * Whether a URL-bearing attribute holds a scheme that is not allowed.
 *
 * @param {string} name attribute name, lower-cased
 * @param {string} value attribute value
 * @returns {boolean}
 */
export function hasUnsafeUrl(name, value) {
    if (!URL_ATTRIBUTES.has(name)) {
        return false;
    }
    // srcset is a comma-separated candidate list, each entry a URL followed by an
    // optional descriptor, so the whole value is never a URL on its own.
    const candidates = name === "srcset"
        ? String(value ?? "").split(",").map((entry) => entry.trim().split(/\s+/)[0])
        : [value];
    return candidates.some((candidate) => !isSafeWriteUrl(candidate));
}

// Matches a tag and captures its name and raw attribute text. The tag name must
// follow "<" or "</" immediately, which is what an HTML parser requires: "< p>" is
// text, not a tag, so treating it as one would refuse prose for no reason.
//
// A bare "<" is allowed inside the attribute run because the tokenizer allows it:
// once a tag is open, "<" is an ordinary attribute-name character and does not
// start anything. Excluding it would end the match early and let the comment
// branch of COMMENT_OR_TAG claim text the browser reads as attributes, hiding a
// real handler from the scan:
//
//   <a <!-- onclick="alert(1)" --> href="#">
//
// which parses as <a <!--="" onclick="alert(1)" --=""> -- a live onclick.
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

const ATTRIBUTE = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`]+)))?/g;

// Elements that legitimately have no closing tag, so an unbalanced-tag check must
// not count them as unclosed.
const VOID_TAGS = new Set(["br"]);

// The full HTML void set, for the preserve policy below. WRITE_TAGS is small
// enough that `br` is the only one it can contain; the preserve policy admits any
// element Azure DevOps already stores, so it needs the rest too.
const ALL_VOID_TAGS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
    "param", "source", "track", "wbr",
]);

// 
```