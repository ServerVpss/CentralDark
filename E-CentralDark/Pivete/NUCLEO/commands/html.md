# COMANDO - html.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\plugin-eval\src\renderers\html.js
**SHA:** 538cd6149a669939
**Timestamp:** 2026-08-26T18:40:46.429457
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- chatPrompt: guide.recommendedWorkflow.chatPrompt,
- <h1>Benchmark Run: ${escapeHtml(result.target.name)}</h1>

### Gaps
- gap: 1rem;

### Ouro Bruto (primeiros 5000 chars)
```
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function renderList(items) {
  if (items.length === 0) {
    return "<p>None.</p>";
  }
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderOptionalList(items, emptyLabel = "None.") {
  return renderList(Array.isArray(items) && items.length > 0 ? items : [emptyLabel]);
}

function renderChecks(checks) {
  if (checks.length === 0) {
    return "<p>No checks recorded.</p>";
  }

  return `<ul>${checks
    .map(
      (check) =>
        `<li><strong>${escapeHtml(check.id)}</strong> [${escapeHtml(check.status)}] ${escapeHtml(check.message)}</li>`,
    )
    .join("")}</ul>`;
}

function renderMetrics(metrics) {
  if (metrics.length === 0) {
    return "<p>No metrics recorded.</p>";
  }

  return `<ul>${metrics
    .map(
      (metric) =>
        `<li><strong>${escapeHtml(metric.id)}</strong>: ${escapeHtml(metric.value)} ${escapeHtml(metric.unit)} (${escapeHtml(metric.band)})</li>`,
    )
    .join("")}</ul>`;
}

function renderDeductions(summary) {
  if (!summary.deductions || summary.deductions.length === 0) {
    return "<p>No deductions were applied.</p>";
  }

  return `<ul>${summary.deductions
    .map(
      (entry) =>
        `<li><strong>-${escapeHtml(entry.penalty)} points</strong> <code>${escapeHtml(entry.id)}</code> [${escapeHtml(entry.status)}/${escapeHtml(entry.severity)}] ${escapeHtml(entry.message)}</li>`,
    )
    .join("")}</ul>`;
}

function renderCategoryDeductions(summary) {
  if (!summary.categoryDeductions || summary.categoryDeductions.length === 0) {
    return "<p>No category deductions recorded.</p>";
  }

  return `<ul>${summary.categoryDeductions
    .map(
      (entry) =>
        `<li><strong>${escapeHtml(entry.category)}</strong>: -${escapeHtml(entry.totalPenalty)} points across ${escapeHtml(entry.checks)} check${entry.checks === 1 ? "" : "s"}</li>`,
    )
    .join("")}</ul>`;
}

function renderObservedUsage(observedUsage) {
  if (!observedUsage) {
    return "<p>No observed usage supplied.</p>";
  }

  const items = [
    `Samples: ${observedUsage.sampleCount}`,
    `Observed input avg: ${observedUsage.inputTokens.average}`,
    `Observed output avg: ${observedUsage.outputTokens.average}`,
    `Observed total avg: ${observedUsage.totalTokens.average}`,
  ];

  if (observedUsage.cachedTokens.total > 0) {
    items.push(`Observed cached avg: ${observedUsage.cachedTokens.average}`);
  }

  if (observedUsage.estimateComparison) {
    items.push(`Estimated active tokens: ${observedUsage.estimateComparison.estimatedActiveTokens}`);
    items.push(`Estimate delta: ${observedUsage.estimateComparison.deltaTokens}`);
    items.push(`Estimate ratio: ${observedUsage.estimateComparison.deltaRatio} (${observedUsage.estimateComparison.band})`);
  }

  return renderList(items);
}

function renderMeasurementPlan(plan) {
  if (!plan) {
    return "<p>No measurement plan available.</p>";
  }

  return `<p>${escapeHtml(plan.summary)}</p><ul>${plan.toolsets
    .map(
      (toolset) =>
        `<li><strong>${escapeHtml(toolset.label)}</strong> [${escapeHtml(toolset.priority)}] ${escapeHtml(toolset.goal)}</li>`,
    )
    .join("")}</ul>`;
}

function renderWorkflowGuide(guide) {
  if (!guide) {
    return "<p>No chat workflow guidance available.</p>";
  }

  const startHere = guide.startHere || {
    chatPrompt: guide.recommendedWorkflow.chatPrompt,
    routingExplanation: guide.recommendedWorkflow.summary,
    startCommand: guide.recommendedWorkflow.startCommand,
    firstCommand: guide.recommendedWorkflow.firstCommand,
  };

  return [
    `<p>${escapeHtml(guide.beginnerSummary)}</p>`,
    `<p><strong>Start with this chat request:</strong> ${escapeHtml(`"${startHere.chatPrompt}"`)}</p>`,
    `<p><strong>Why this path:</strong> ${escapeHtml(startHere.routingExplanation)}</p>`,
    `<p><strong>Quick local entrypoint:</strong> <code>${escapeHtml(startHere.startCommand)}</code></p>`,
    `<p><strong>Plugin Eval will run first:</strong> <code>${escapeHtml(startHere.firstCommand)}</code></p>`,
    "<h3>Other chat requests you can use</h3>",
    renderList(
      guide.entrypoints.map(
        (entry) => `${entry.label}: say "${entry.chatPrompt}" then run ${entry.firstCommand}`,
      ),
    ),
  ].join("");
}

function renderNextAction(nextAction) {
  if (!nextAction) {
    return "<p>No recommended next step.</p>";
  }

  return renderList([
    nextAction.label,
    `Why: ${nextAction.why}`,
    ...(nextAction.chatPrompt ? [`Chat request: "${nextAction.chatPrompt}"`] : []),
    ...(nextAction.command ? [`Local command: ${nextAction.command}`] : []),
  ]);
}

export function renderHtml(result) {
  if (result.kind === "workflow-guide") {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Plugin Eval Start Here</title>
  </head>
  <body>
  
```

---

# COMANDO - html.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-utils-2.9.3\src\html.rs
**SHA:** ac50a409966214e0
**Timestamp:** 2026-08-28T02:36:00.677429
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- use crate::pattern::isolation::IsolationJavascriptCodegen;

### Gaps
- // TODO: Verify this, this is not found in the HTML spec, see https://github.com/tauri-apps/tauri/pull/14265#discussion_r2415396842

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! The module to process HTML in Tauri.

use std::path::{Path, PathBuf};

use html5ever::{
  interface::QualName,
  namespace_url, ns,
  serialize::{HtmlSerializer, SerializeOpts, Serializer, TraversalScope},
  tendril::TendrilSink,
  LocalName,
};
pub use kuchiki::NodeRef;
use kuchiki::{Attribute, ExpandedName, NodeData};
use serde::Serialize;
#[cfg(feature = "isolation")]
use serialize_to_javascript::DefaultTemplate;

#[cfg(feature = "isolation")]
use crate::pattern::isolation::IsolationJavascriptCodegen;
use crate::{
  assets::{SCRIPT_NONCE_TOKEN, STYLE_NONCE_TOKEN},
  config::{DisabledCspModificationKind, PatternKind},
};

// taken from <https://github.com/kuchiki-rs/kuchiki/blob/57ee6920d835315a498e748ba4b07a851ae5e498/src/serializer.rs#L12>
fn serialize_node_ref_internal<S: Serializer>(
  node: &NodeRef,
  serializer: &mut S,
  traversal_scope: TraversalScope,
) -> crate::Result<()> {
  match (traversal_scope, node.data()) {
    (ref scope, NodeData::Element(element)) => {
      if *scope == TraversalScope::IncludeNode {
        let attrs = element.attributes.borrow();

        // Unfortunately we need to allocate something to hold these &'a QualName
        let attrs = attrs
          .map
          .iter()
          .map(|(name, attr)| {
            (
              QualName::new(attr.prefix.clone(), name.ns.clone(), name.local.clone()),
              &attr.value,
            )
          })
          .collect::<Vec<_>>();

        serializer.start_elem(
          element.name.clone(),
          attrs.iter().map(|&(ref name, value)| (name, &**value)),
        )?
      }

      let children = match element.template_contents.as_ref() {
        Some(template_root) => template_root.children(),
        None => node.children(),
      };
      for child in children {
        serialize_node_ref_internal(&child, serializer, TraversalScope::IncludeNode)?
      }

      if *scope == TraversalScope::IncludeNode {
        serializer.end_elem(element.name.clone())?
      }
      Ok(())
    }

    (_, &NodeData::DocumentFragment) | (_, &NodeData::Document(_)) => {
      for child in node.children() {
        serialize_node_ref_internal(&child, serializer, TraversalScope::IncludeNode)?
      }
      Ok(())
    }

    (TraversalScope::ChildrenOnly(_), _) => Ok(()),

    (TraversalScope::IncludeNode, NodeData::Doctype(doctype)) => {
      serializer.write_doctype(&doctype.name).map_err(Into::into)
    }
    (TraversalScope::IncludeNode, NodeData::Text(text)) => {
      serializer.write_text(&text.borrow()).map_err(Into::into)
    }
    (TraversalScope::IncludeNode, NodeData::Comment(text)) => {
      serializer.write_comment(&text.borrow()).map_err(Into::into)
    }
    (TraversalScope::IncludeNode, NodeData::ProcessingInstruction(contents)) => {
      let contents = contents.borrow();
      serializer
        .write_processing_instruction(&contents.0, &contents.1)
        .map_err(Into::into)
    }
  }
}

/// Serializes the node to HTML.
pub fn serialize_node(node: &NodeRef) -> Vec<u8> {
  let mut u8_vec = Vec::new();
  let mut ser = HtmlSerializer::new(
    &mut u8_vec,
    SerializeOpts {
      traversal_scope: TraversalScope::IncludeNode,
      ..Default::default()
    },
  );
  serialize_node_ref_internal(node, &mut ser, TraversalScope::IncludeNode).unwrap();
  u8_vec
}

/// Parses the given HTML string.
pub fn parse(html: String) -> NodeRef {
  kuchiki::parse_html().one(html).document_node
}

fn with_head<F: FnOnce(&NodeRef)>(document: &NodeRef, f: F) {
  if let Ok(ref node) = document.select_first("head") {
    f(node.as_node())
  } else {
    let node = NodeRef::new_element(
      QualName::new(None, ns!(html), LocalName::from("head")),
      None,
    );
    f(&node);
    document.prepend(node)
  }
}

fn inject_nonce(document: &NodeRef, selector: &str, token: &str) {
  if let Ok(elements) = document.select(selector) {
    for target in elements {
      let node = target.as_node();
      let element = node.as_element().unwrap();

      let mut attrs = element.attributes.borrow_mut();
      // if the node already has the `nonce` attribute, skip it
      if attrs.get("nonce").is_some() {
        continue;
      }
      attrs.insert("nonce", token.into());
    }
  }
}

/// Inject nonce tokens to all scripts and styles.
pub fn inject_nonce_token(
  document: &NodeRef,
  dangerous_disable_asset_csp_modification: &DisabledCspModificationKind,
) {
  if dangerous_disable_asset_csp_modification.can_modify("script-src") {
    inject_nonce(document, "script[src^='http']", SCRIPT_NONCE_TOKEN);
  }
  if dangerous_disable_asset_csp_modification.can_modify("style-src") {
    inject_nonce(document, "style", STYLE_NONCE_TOKEN);
  }
}

/// Injects a content security policy to the HTML.
pub fn inject_csp(document: &NodeRef, csp: &str) {
  with_head(document, |head| {
    head.append(create
```