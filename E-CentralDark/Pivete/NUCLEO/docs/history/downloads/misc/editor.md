# OUTRO - editor.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\ui\editor.mjs
**SHA:** 28051f0469fb1fe3
**Timestamp:** 2026-08-28T02:37:57.711656
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const { selectionStart: start, selectionEnd: end, value } = textarea;
- const { selectionStart: start, selectionEnd: end, value } = textarea;
- const lineStart = value.lastIndexOf("\n", start - 1) + 1;
- const { selectionStart: start, selectionEnd: end, value } = textarea;
- const { selectionStart: start, selectionEnd: end, value } = textarea;
- const lineStart = value.lastIndexOf("\n", start - 1) + 1;
- const { selectionStart: start, selectionEnd: end, value } = textarea;

### Padroes
- const pattern = ordered ? /^\s*\d+[.)]\s/ : /^\s*[-*+]\s/;

### Ouro Bruto (primeiros 5000 chars)
```
// Editing surfaces for Azure DevOps canvas content.
//
// Every editable field here is either plain text, a fixed set of choices, or
// Markdown source. None of them is a contenteditable surface, and that is a
// deliberate constraint rather than a missing feature.
//
// A WYSIWYG editor over Azure DevOps content has to convert the edited document
// back into storage format on every save. That conversion is lossy in ways the
// user cannot see -- it rewrites formatting they never touched -- and proving it
// is not lossy requires comparing against Azure DevOps' own renderer, which only
// Azure DevOps has. Editing the source instead makes the question moot: the bytes
// saved are the bytes the user typed.
//
// Markdown fields get a toolbar that inserts syntax into the textarea and a
// preview rendered by the same renderer Azure DevOps uses, so the user can still
// see what they are writing.
//
// Fields share one shell: a toolbar, a body, and a form-level footer with save
// and cancel.

import { renderRichText } from "./rich-text.mjs";
import { isSafeWriteUrl } from "./rich-text-policy.mjs";
import { canEditStoredHtml, fromEditableHtml, toEditableFragment } from "./editable-html.mjs";

function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = String(text);
    }
    return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";

function pencilIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("fill", "currentColor");
    // The button carries the accessible name, so the glyph is decorative.
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute(
        "d",
        "M13.23 1.77a1.75 1.75 0 0 0-2.47 0L2.5 10.03c-.19.19-.33.43-.4.7l-.85 3.02a.6.6 0 0 0 .74.74l3.02-.85c.27-.08.51-.22.7-.4l8.26-8.27a1.75 1.75 0 0 0 0-2.47ZM10.4 3.9 12.1 5.6l-6.9 6.9-1.7-1.7Z",
    );
    svg.append(path);
    return svg;
}

/**
 * The affordance that turns a rendered field into an editor.
 *
 * Shared by both views so the two surfaces cannot drift apart, and icon-only so
 * it sits in a heading without competing with the content it edits.
 *
 * @param {string} label what is being edited, used for the accessible name
 * @param {() => void} onClick
 * @returns {HTMLButtonElement}
 */
export function editButton(label, onClick) {
    const button = element("button", "inline-edit");
    button.type = "button";
    button.title = `Edit ${label}`;
    button.setAttribute("aria-label", `Edit ${label}`);
    button.append(pencilIcon());
    button.addEventListener("click", onClick);
    return button;
}

const IS_APPLE = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent || "");

function normalizeShortcut(spec) {
    return typeof spec === "string" ? { key: spec, shift: false } : { shift: false, ...spec };
}

function shortcutLabel(spec) {
    const { key, shift } = normalizeShortcut(spec);
    // Apple orders modifiers control-option-shift-command.
    return IS_APPLE
        ? `${shift ? "\u21e7" : ""}\u2318${key.toUpperCase()}`
        : `Ctrl+${shift ? "Shift+" : ""}${key.toUpperCase()}`;
}

function shortcutsLabel(specs) {
    return specs.map(shortcutLabel).join(" or ");
}

// execCommand's state query throws in some hosts and is simply absent in others,
// so an unavailable answer is reported as "not active" rather than breaking the
// toolbar.
function markdownWrapped(textarea, delimiter) {
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    return value.slice(0, start).endsWith(delimiter) && value.slice(end).startsWith(delimiter);
}

function markdownLinePrefixed(textarea, ordered) {
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end);
    const lines = value.slice(lineStart, lineEnd).split("\n").filter((line) => line.trim());
    const pattern = ordered ? /^\s*\d+[.)]\s/ : /^\s*[-*+]\s/;
    return lines.length > 0 && lines.every((line) => pattern.test(line));
}

/**
 * A toolbar control.
 *
 * `isActive` makes the button reflect the formatting under the caret rather than
 * just firing a command, so the user can see what is on. `shortcut` is advertised
 * in the tooltip and bound by bindShortcuts.
 *
 * @param {string} label
 * @param {string} title
 * @param {() => void} onClick
 * @param {{ shortcut?: string, isActive?: () => boolean }} options
 */
function toolbarButton(label, title, onClick, { shortcut, isActive } = {}) {
    const button = ele
```