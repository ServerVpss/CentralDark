# OUTRO - connection-view.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\ui\connection-view.mjs
**SHA:** d4d7f5e6e6a1af2a
**Timestamp:** 2026-08-28T02:37:58.609658
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- firstRun = false,

### Ouro Bruto (primeiros 5000 chars)
```
// The connection picker: where a user chooses the Azure DevOps organization the
// canvas reads from when the workspace has no Azure DevOps git remote to derive
// one from.
//
// Organization is the only required field. Azure DevOps answers work item and
// repository queries at organization scope, so asking for a project up front
// would demand more than the data needs. Pull requests are the exception —
// Azure DevOps has no organization-wide pull request route — so the form says
// so rather than letting a user discover it as an empty section.
//
// The panel is built once and then patched. Re-rendering it on every change
// would destroy the field the user is typing in, and would destroy the Save
// button between its mousedown and its mouseup, swallowing the click.

function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}

function connectionLabel(connection) {
    return [connection.organization, connection.project].filter(Boolean).join(" / ");
}

function sourceLabel(connection) {
    if (connection.isRemote) return "from this repository's git remote";
    if (connection.source === "default") return "your default";
    if (connection.source === "input") return "opened directly";
    return "last used";
}

// Each field is "pick one you have, or type one we could not list". A custom
// combobox keeps that fallback while avoiding native datalist behavior, which
// varies by browser and hides the other choices after an exact match is picked.
//
// The value is committed on both `input` and `change`. `input` alone leaves Save
// disabled until the field is blurred, and a blur is exactly what clicking a
// disabled Save does not cause. `change` alone loses a value chosen from the
// datalist dropdown in engines that do not raise `input` for that.
//
// Neither is trusted at save time: read() takes the values straight off the
// fields, so what the user can see is what gets saved.
function field(id, label, hint, { onInput, onCommit }) {
    const wrapper = element("label", "connection-field");
    const control = element("div", "connection-combobox");
    const input = element("input", "connection-input");
    input.type = "text";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", id);
    const list = element("div", "connection-options");
    list.id = id;
    list.setAttribute("role", "listbox");
    list.hidden = true;
    control.append(input, list);
    const hintNode = element("span", "connection-field-hint", hint);
    wrapper.append(element("span", "connection-field-label", label), control, hintNode);

    let values = [];
    let visibleValues = [];
    let activeIndex = -1;
    let filtering = false;

    const close = () => {
        list.hidden = true;
        activeIndex = -1;
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-activedescendant");
    };

    const setActive = (index) => {
        const options = [...list.querySelectorAll('[role="option"]')];
        if (!options.length) {
            activeIndex = -1;
            input.removeAttribute("aria-activedescendant");
            return;
        }
        activeIndex = (index + options.length) % options.length;
        for (const [optionIndex, option] of options.entries()) {
            option.setAttribute("aria-selected", String(optionIndex === activeIndex));
            option.classList.toggle("active", optionIndex === activeIndex);
        }
        input.setAttribute("aria-activedescendant", options[activeIndex].id);
        options[activeIndex].scrollIntoView?.({ block: "nearest" });
    };

    const choose = (value) => {
        input.value = value;
        onInput(value);
        close();
        onCommit?.(value);
    };

    const open = (filter) => {
        filtering = filter;
        const query = filter ? input.value.trim().toLocaleLowerCase() : "";
        visibleValues = values.filter((value) => !query || value.toLocaleLowerCase().includes(query));
        list.replaceChildren();
        for (const [index, value] of visibleValues.entries()) {
            const option = element("div", "connection-option", value);
            option.id = `${id}-option-${index}`;
            option.setAttribute("role", "option");
            option.setAttribute("aria-selected", "false");
            option.addEventListener("mousedown", (event) => {
                event.preventDefault();
                choose(value);
            });
            list.append(option);
        }
        list.hidden = !visibleValues.length;
        input.setAttribute("aria-expanded", String(visibleValues.length > 0));
        acti
```