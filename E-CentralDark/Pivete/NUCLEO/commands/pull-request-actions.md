# COMANDO - pull-request-actions.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\ui\pull-request-actions.mjs
**SHA:** db72c1e09ad54f92
**Timestamp:** 2026-08-28T02:37:57.197235
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = element("div", "pr-confirm");
- const run = () => options.onStateAction?.(action.id);
- execute: (operation) => runAction(messageHost, host, operation),
- execute: (operation) => runAction(messageHost, host, operation),

### Ouro Bruto (primeiros 5000 chars)
```
// The pull request action surface: the review vote, the state changes, the
// reviewer roster, and the linked work items. These are the operations the
// Azure DevOps web UI offers on a pull request, so the canvas is not a read-only
// mirror that sends the user to the browser to actually decide anything.

import { createActionMenu } from "./action-menu.mjs";
import { PULL_REQUEST_REVIEW_VOTING_ENABLED } from "./feature-flags.mjs";
import { createSearchPicker } from "./search-picker.mjs";

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

const WORK_ITEM_TYPE_COLORS = new Map([
    ["bug", "#cc293d"],
    ["epic", "#ff7b00"],
    ["feature", "#773b93"],
    ["issue", "#339947"],
    ["product backlog item", "#009ccc"],
    ["requirement", "#009ccc"],
    ["task", "#f2cb1d"],
    ["user story", "#009ccc"],
]);

export function workItemTypeColor(workItem) {
    const supplied = String(workItem?.typeColor || "").trim().replace(/^#/, "");
    if (/^[0-9a-f]{6}$/i.test(supplied)) {
        return `#${supplied}`;
    }
    return WORK_ITEM_TYPE_COLORS.get(String(workItem?.type || "").trim().toLowerCase()) || "#0078d4";
}

function workItemType(workItem, className = "pr-work-item-type") {
    const type = element("span", className, workItem?.type || "Work item");
    type.style.setProperty("--work-item-type-color", workItemTypeColor(workItem));
    return type;
}

function button(label, className, onClick, { disabled = false, title = "" } = {}) {
    const node = element("button", ["primer-button", className].filter(Boolean).join(" "), label);
    node.type = "button";
    if (title) {
        node.title = title;
    }
    if (disabled) {
        node.disabled = true;
    } else {
        node.addEventListener("click", onClick);
    }
    return node;
}

// The vote values Azure DevOps stores, in the order the menu offers them.
export const VOTE_OPTIONS = [
    { id: "approve", label: "Approve", vote: 10 },
    { id: "approve-with-suggestions", label: "Approve with suggestions", vote: 5 },
    { id: "wait-for-author", label: "Wait for author", vote: -5 },
    { id: "reject", label: "Reject", vote: -10, danger: true },
    { id: "reset", label: "Reset feedback", vote: 0 },
];

// The label for the action that records a vote. Distinct from the label for a
// vote already cast: "Reset feedback" is a thing you do, and rendering it as a
// reviewer's status read as though that were their verdict.
export function voteLabel(vote) {
    const value = Number(vote) || 0;
    return VOTE_OPTIONS.find((option) => option.vote === value)?.label || "No vote";
}

const VOTE_STATES = new Map([
    [10, "Approved"],
    [5, "Approved with suggestions"],
    [0, "No vote"],
    [-5, "Waiting for author"],
    [-10, "Rejected"],
]);

/** The label for a vote a reviewer has already cast. */
export function voteStateLabel(vote) {
    return VOTE_STATES.get(Number(vote) || 0) || "No vote";
}

export function voteTone(vote) {
    const value = Number(vote) || 0;
    if (value >= 5) return "met";
    if (value <= -5) return "not-met";
    return "in-progress";
}

function isActive(pr) {
    return String(pr.status || "").toLowerCase() === "active";
}

/**
 * The state changes available for a pull request, given its current status, as a
 * primary action plus the rest of the menu. This mirrors the Azure DevOps split
 * button: the action you almost always want is the button, the others are behind
 * the caret. Completed pull requests are terminal, so they offer no primary.
 */
export function stateActions(pr) {
    const status = String(pr.status || "").toLowerCase();
    if (status === "completed") {
        return { primary: null, items: [] };
    }
    if (status === "abandoned") {
        const reactivate = { id: "reactivate", label: "Reactivate" };
        return { primary: reactivate, items: [reactivate] };
    }
    if (pr.isDraft) {
        const publish = { id: "publish", label: "Publish" };
        return {
            primary: publish,
            items: [publish, { id: "abandon", label: "Abandon", danger: true, confirm: true }],
        };
    }
    const complete = { id: "complete", label: "Complete", confirm: true };
    return {
        primary: complete,
        items: [
            complete,
            { id: "mark-draft", label: "Mark as draft" },
            { id: "abandon", label: "Abandon", danger: true, confirm: true },
        ],
    };
}

/**
 * The signed-in user's own reviewer record, which is what the vote menu reflects.
 * A user who is not on the reviewer list has no vote, which Azure DevOps treats
 * as a vote of 0 the moment they cast one.
 */
export function myReviewer(pr) {
    const myId = String(pr.currentUser?.id || "").toLowerCase();
    if (!myId) {
        return null;
    }
    return (pr.reviewers
```