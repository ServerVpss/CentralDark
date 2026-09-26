# OUTRO - fallback.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\proc-macro2-1.0.107\src\fallback.rs
**SHA:** 416a3d24349c163d
**Timestamp:** 2026-08-28T02:35:00.159302
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = u32::try_from(*start).ok()?;
- let start = u32::try_from(*start).ok()?;

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(wrap_proc_macro)]
use crate::imp;
#[cfg(span_locations)]
use crate::location::LineColumn;
use crate::parse::{self, Cursor};
use crate::rcvec::{RcVec, RcVecBuilder, RcVecIntoIter, RcVecMut};
use crate::{Delimiter, Spacing, TokenTree};
use alloc::borrow::ToOwned as _;
use alloc::boxed::Box;
#[cfg(all(span_locations, not(fuzzing)))]
use alloc::collections::BTreeMap;
use alloc::format;
use alloc::string::{String, ToString as _};
#[cfg(all(span_locations, not(fuzzing)))]
use alloc::vec;
use alloc::vec::Vec;
#[cfg(all(span_locations, not(fuzzing)))]
use core::cell::RefCell;
#[cfg(span_locations)]
use core::cmp;
#[cfg(all(span_locations, not(fuzzing)))]
use core::cmp::Ordering;
use core::ffi::CStr;
use core::fmt::{self, Debug, Display, Write};
use core::mem::ManuallyDrop;
#[cfg(span_locations)]
use core::ops::Range;
use core::ops::RangeBounds;
use core::ptr;
use core::str;
#[cfg(feature = "proc-macro")]
use core::str::FromStr;
#[cfg(wrap_proc_macro)]
use std::panic;
#[cfg(span_locations)]
use std::path::PathBuf;
#[cfg(all(span_locations, not(fuzzing)))]
use std::thread_local;

/// Force use of proc-macro2's fallback implementation of the API for now, even
/// if the compiler's implementation is available.
pub fn force() {
    #[cfg(wrap_proc_macro)]
    crate::detection::force_fallback();
}

/// Resume using the compiler's implementation of the proc macro API if it is
/// available.
pub fn unforce() {
    #[cfg(wrap_proc_macro)]
    crate::detection::unforce_fallback();
}

#[derive(Clone)]
pub(crate) struct TokenStream {
    inner: RcVec<TokenTree>,
}

#[derive(Debug)]
pub(crate) struct LexError {
    pub(crate) span: Span,
}

impl LexError {
    pub(crate) fn span(&self) -> Span {
        self.span
    }

    pub(crate) fn call_site() -> Self {
        LexError {
            span: Span::call_site(),
        }
    }
}

impl TokenStream {
    pub(crate) fn new() -> Self {
        TokenStream {
            inner: RcVecBuilder::new().build(),
        }
    }

    pub(crate) fn from_str_checked(src: &str) -> Result<Self, LexError> {
        // Create a dummy file & add it to the source map
        let mut cursor = get_cursor(src);

        // Strip a byte order mark if present
        const BYTE_ORDER_MARK: &str = "\u{feff}";
        if cursor.starts_with(BYTE_ORDER_MARK) {
            cursor = cursor.advance(BYTE_ORDER_MARK.len());
        }

        parse::token_stream(cursor)
    }

    #[cfg(feature = "proc-macro")]
    pub(crate) fn from_str_unchecked(src: &str) -> Self {
        Self::from_str_checked(src).unwrap()
    }

    pub(crate) fn is_empty(&self) -> bool {
        self.inner.len() == 0
    }

    fn take_inner(self) -> RcVecBuilder<TokenTree> {
        let nodrop = ManuallyDrop::new(self);
        unsafe { ptr::read(&nodrop.inner) }.make_owned()
    }
}

fn push_token_from_proc_macro(mut vec: RcVecMut<TokenTree>, token: TokenTree) {
    // https://github.com/dtolnay/proc-macro2/issues/235
    match token {
        TokenTree::Literal(crate::Literal {
            #[cfg(wrap_proc_macro)]
                inner: crate::imp::Literal::Fallback(literal),
            #[cfg(not(wrap_proc_macro))]
                inner: literal,
            ..
        }) if literal.repr.starts_with('-') => {
            push_negative_literal(vec, literal);
        }
        _ => vec.push(token),
    }

    #[cold]
    fn push_negative_literal(mut vec: RcVecMut<TokenTree>, mut literal: Literal) {
        literal.repr.remove(0);
        let mut punct = crate::Punct::new('-', Spacing::Alone);
        punct.set_span(crate::Span::_new_fallback(literal.span));
        vec.push(TokenTree::Punct(punct));
        vec.push(TokenTree::Literal(crate::Literal::_new_fallback(literal)));
    }
}

// Nonrecursive to prevent stack overflow.
impl Drop for TokenStream {
    fn drop(&mut self) {
        let mut stack = Vec::new();
        let mut current = match self.inner.get_mut() {
            Some(inner) => inner.take().into_iter(),
            None => return,
        };
        loop {
            while let Some(token) = current.next() {
                let group = match token {
                    TokenTree::Group(group) => group.inner,
                    _ => continue,
                };
                #[cfg(wrap_proc_macro)]
                let group = match group {
                    crate::imp::Group::Fallback(group) => group,
                    crate::imp::Group::Compiler(_) => continue,
                };
                let mut group = group;
                if let Some(inner) = group.stream.inner.get_mut() {
                    stack.push(current);
                    current = inner.take().into_iter();
                }
            }
            match stack.pop() {
                Some(next) => current = next,
                None => return,
            }
        }
    }
}

pub(crate) struct TokenStreamBuilder {
    inner: RcVecBuilder<TokenTree>,
}

impl TokenStreamBuilder {
    pub(crate) fn new() -> Self {
        TokenStre
```