# OUTRO - selection-traversal.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\dom_query-0.27.0\tests\selection-traversal.rs
**SHA:** 4b00b9a63c0eb424
**Timestamp:** 2026-08-28T02:34:04.349754
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- //TODO: to search by case-insensitive classes a matcher with quirks-mode need to be implemented

### Ouro Bruto (primeiros 5000 chars)
```
mod data;

use data::doc;
use data::doc_wiki;
use data::DMC_CONTENTS;
use data::{ANCESTORS_CONTENTS, LIST_CONTENTS};
use dom_query::Document;

use dom_query::NodeId;
use dom_query::Selection;
#[cfg(target_arch = "wasm32")]
use wasm_bindgen_test::*;

mod alloc;

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_select() {
    let doc = doc();
    let sel = doc.select("div.row-fluid");
    assert_eq!(sel.length(), 9);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_select_not_self() {
    let doc = doc();
    let sel = doc.select("h1").select("h1");
    assert_eq!(sel.length(), 0);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[should_panic]
fn test_select_invalid() {
    let doc = doc();
    let sel = doc.select(":+ ^");
    assert_eq!(sel.length(), 0);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_select_big() {
    let doc = doc_wiki();
    let sel = doc.select("li");
    assert_eq!(sel.length(), 420);
    let sel = doc.select("span");
    assert_eq!(sel.length(), 706);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_chained_select() {
    let doc = doc();
    let sel = doc.select("div.hero-unit").select(".row-fluid");
    assert_eq!(sel.length(), 4);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
#[should_panic]
fn test_chained_select_invalid() {
    let doc = doc();
    let sel = doc.select("div.hero-unit").select("");
    assert_eq!(sel.length(), 0);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_children() {
    let doc = doc();
    let sel = doc.select(".pvk-content").children();
    assert_eq!(sel.length(), 5)
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_children_empty() {
    let doc = doc();
    let sel = doc.select(".non-existing").children();
    assert_eq!(sel.length(), 0)
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_parent() {
    let doc = doc();
    let sel = doc.select(".container-fluid").parent();
    assert_eq!(sel.length(), 3)
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_parent_non_existing() {
    let doc = doc();
    let sel = doc.select(".non-existing").parent();
    assert_eq!(sel.length(), 0)
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_next() {
    let doc = doc();
    let sel = doc.select("h1").next_sibling();
    assert_eq!(sel.length(), 1)
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_next2() {
    let doc = doc();
    let sel = doc.select(".close").next_sibling();
    assert_eq!(sel.length(), 1)
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_next_none() {
    let doc = doc();
    let sel = doc.select("small").next_sibling();
    assert_eq!(sel.length(), 0)
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_nth_child() {
    let doc: Document = r#"<!DOCTYPE html>
    <html lang="en">
        <head></head>
    
        <body>
            <div id="bggrad"></div>
            <div class="container container-header"></div>
            <div class="container container-main">
                <nav class="navbar navbar-default navbar-static-top"></nav>
                <div class="row">
                    <div class="col-xs-12"></div>
                    <div class="col-xs-12"></div>
                    <div class="col-md-10">
                        <a href="\#">foo</a>
                    </div>
                </div>
            </div>
        </body>
    </html>"#
        .into();

    let a = doc
        .select("body > div.container.container-main > div.row:nth-child(2) > div.col-md-10 > a");

    assert!(a.length() == 1);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_doc_select_single() {
    let doc: Document = LIST_CONTENTS.into();

    let single_selection_count = doc.select_single(".list").length();
    assert_eq!(single_selection_count, 1);

    let multiple_selection_count = doc.select(".list").length();
    assert_eq!(multiple_selection_count, 2);
}

#[cfg_attr(not(target_arch = "wasm32"), test)]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen_test)]
fn test_select_single() {
    let doc: Document = LIST_CONTENTS.into();

    let single_selection_count = doc.select("div").select_single(".list").length();
    assert_eq!(
```