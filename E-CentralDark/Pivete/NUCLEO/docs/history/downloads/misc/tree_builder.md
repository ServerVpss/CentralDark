# OUTRO - tree_builder.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\markup5ever-0.38.0\interface\tree_builder.rs
**SHA:** 94fe1ad3474e5e5e
**Timestamp:** 2026-08-28T02:34:47.578853
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- /// TODO:This should default to `fn finish(self) -> Self::Output { self }`,

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2017 The html5ever Project Developers. See the
// COPYRIGHT file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

//! This module contains functionality for managing the DOM, including adding/removing nodes.
//!
//! It can be used by a parser to create the DOM graph structure in memory.

use crate::interface::{Attribute, ExpandedName, QualName};
use std::borrow::Cow;
use std::fmt::Debug;
use tendril::StrTendril;
use web_atoms::{LocalName, Namespace};

pub use self::NodeOrText::{AppendNode, AppendText};
pub use self::QuirksMode::{LimitedQuirks, NoQuirks, Quirks};

/// Something which can be inserted into the DOM.
///
/// Adjacent sibling text nodes are merged into a single node, so
/// the sink may not want to allocate a `Handle` for each.
pub enum NodeOrText<Handle> {
    AppendNode(Handle),
    AppendText(StrTendril),
}

/// A document's quirks mode, for compatibility with old browsers. See [quirks mode on wikipedia]
/// for more information.
///
/// [quirks mode on wikipedia]: https://en.wikipedia.org/wiki/Quirks_mode
#[derive(PartialEq, Eq, Copy, Clone, Hash, Debug)]
pub enum QuirksMode {
    /// Full quirks mode
    Quirks,
    /// Almost standards mode
    LimitedQuirks,
    /// Standards mode
    NoQuirks,
}

/// Special properties of an element, useful for tagging elements with this information.
#[derive(Default)]
#[non_exhaustive]
pub struct ElementFlags {
    /// A document fragment should be created, associated with the element,
    /// and returned in TreeSink::get_template_contents.
    ///
    /// See [template-contents in the whatwg spec][whatwg template-contents].
    ///
    /// [whatwg template-contents]: https://html.spec.whatwg.org/multipage/#template-contents
    pub template: bool,

    /// This boolean should be recorded with the element and returned
    /// in TreeSink::is_mathml_annotation_xml_integration_point
    ///
    /// See [html-integration-point in the whatwg spec][whatwg integration-point].
    ///
    /// [whatwg integration-point]: https://html.spec.whatwg.org/multipage/#html-integration-point
    pub mathml_annotation_xml_integration_point: bool,
}

/// A constructor for an element.
///
/// # Examples
///
/// Create an element like `<div class="test-class-name"></div>`:
pub fn create_element<Sink>(sink: &Sink, name: QualName, attrs: Vec<Attribute>) -> Sink::Handle
where
    Sink: TreeSink,
{
    let mut flags = ElementFlags::default();
    match name.expanded() {
        expanded_name!(html "template") => flags.template = true,
        expanded_name!(mathml "annotation-xml") => {
            flags.mathml_annotation_xml_integration_point = attrs.iter().any(|attr| {
                attr.name.expanded() == expanded_name!("", "encoding")
                    && (attr.value.eq_ignore_ascii_case("text/html")
                        || attr.value.eq_ignore_ascii_case("application/xhtml+xml"))
            })
        },
        _ => {},
    }
    sink.create_element(name, attrs, flags)
}

/// An abstraction over any type that can represent an element's local name and namespace.
pub trait ElemName: Debug {
    fn ns(&self) -> &Namespace;
    fn local_name(&self) -> &LocalName;

    #[inline(always)]
    fn expanded(&self) -> ExpandedName<'_> {
        ExpandedName {
            ns: self.ns(),
            local: self.local_name(),
        }
    }
}

/// Methods a parser can use to create the DOM. The DOM provider implements this trait.
///
/// Having this as a trait potentially allows multiple implementations of the DOM to be used with
/// the same parser.
pub trait TreeSink {
    /// `Handle` is a reference to a DOM node.  The tree builder requires
    /// that a `Handle` implements `Clone` to get another reference to
    /// the same node.
    type Handle: Clone;

    /// The overall result of parsing.
    ///
    /// This should default to Self, but default associated types are not stable yet.
    /// [rust-lang/rust#29661](https://github.com/rust-lang/rust/issues/29661)
    type Output;

    //
    type ElemName<'a>: ElemName
    where
        Self: 'a;

    /// Consume this sink and return the overall result of parsing.
    ///
    /// TODO:This should default to `fn finish(self) -> Self::Output { self }`,
    /// but default associated types are not stable yet.
    /// [rust-lang/rust#29661](https://github.com/rust-lang/rust/issues/29661)
    fn finish(self) -> Self::Output;

    /// Signal a parse error.
    fn parse_error(&self, msg: Cow<'static, str>);

    /// Get a handle to the `Document` node.
    fn get_document(&self) -> Self::Handle;

    /// What is the name of this element?
    ///
    /// Should never be called on a non-element node;
    /// feel f
```