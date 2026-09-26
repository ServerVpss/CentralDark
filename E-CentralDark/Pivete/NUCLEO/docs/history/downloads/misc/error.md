# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\util\error.rs
**SHA:** ecccd60e74063050
**Timestamp:** 2026-08-28T02:32:20.750264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: PatternID,
- pattern: PatternID,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::util::{
    primitives::{PatternID, SmallIndex},
    search::MatchKind,
};

/// An error that occurred during the construction of an Aho-Corasick
/// automaton.
///
/// Build errors occur when some kind of limit has been exceeded, either in the
/// number of states, the number of patterns of the length of a pattern. These
/// limits aren't part of the public API, but they should generally be large
/// enough to handle most use cases.
///
/// When the `std` feature is enabled, this implements the `std::error::Error`
/// trait.
#[derive(Clone, Debug)]
pub struct BuildError {
    kind: ErrorKind,
}

/// The kind of error that occurred.
#[derive(Clone, Debug)]
enum ErrorKind {
    /// An error that occurs when allocating a new state would result in an
    /// identifier that exceeds the capacity of a `StateID`.
    StateIDOverflow {
        /// The maximum possible id.
        max: u64,
        /// The maximum ID requested.
        requested_max: u64,
    },
    /// An error that occurs when adding a pattern to an Aho-Corasick
    /// automaton would result in an identifier that exceeds the capacity of a
    /// `PatternID`.
    PatternIDOverflow {
        /// The maximum possible id.
        max: u64,
        /// The maximum ID requested.
        requested_max: u64,
    },
    /// Occurs when a pattern string is given to the Aho-Corasick constructor
    /// that is too long.
    PatternTooLong {
        /// The ID of the pattern that was too long.
        pattern: PatternID,
        /// The length that was too long.
        len: usize,
    },
}

impl BuildError {
    pub(crate) fn state_id_overflow(
        max: u64,
        requested_max: u64,
    ) -> BuildError {
        BuildError { kind: ErrorKind::StateIDOverflow { max, requested_max } }
    }

    pub(crate) fn pattern_id_overflow(
        max: u64,
        requested_max: u64,
    ) -> BuildError {
        BuildError {
            kind: ErrorKind::PatternIDOverflow { max, requested_max },
        }
    }

    pub(crate) fn pattern_too_long(
        pattern: PatternID,
        len: usize,
    ) -> BuildError {
        BuildError { kind: ErrorKind::PatternTooLong { pattern, len } }
    }
}

#[cfg(feature = "std")]
impl std::error::Error for BuildError {}

impl core::fmt::Display for BuildError {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self.kind {
            ErrorKind::StateIDOverflow { max, requested_max } => {
                write!(
                    f,
                    "state identifier overflow: failed to create state ID \
                     from {}, which exceeds the max of {}",
                    requested_max, max,
                )
            }
            ErrorKind::PatternIDOverflow { max, requested_max } => {
                write!(
                    f,
                    "pattern identifier overflow: failed to create pattern ID \
                     from {}, which exceeds the max of {}",
                    requested_max, max,
                )
            }
            ErrorKind::PatternTooLong { pattern, len } => {
                write!(
                    f,
                    "pattern {} with length {} exceeds \
                     the maximum pattern length of {}",
                    pattern.as_usize(),
                    len,
                    SmallIndex::MAX.as_usize(),
                )
            }
        }
    }
}

/// An error that occurred during an Aho-Corasick search.
///
/// An error that occurs during a search is limited to some kind of
/// misconfiguration that resulted in an illegal call. Stated differently,
/// whether an error occurs is not dependent on the specific bytes in the
/// haystack.
///
/// Examples of misconfiguration:
///
/// * Executing a stream or overlapping search on a searcher that was built was
/// something other than [`MatchKind::Standard`](crate::MatchKind::Standard)
/// semantics.
/// * Requested an anchored or an unanchored search on a searcher that doesn't
/// support unanchored or anchored searches, respectively.
///
/// When the `std` feature is enabled, this implements the `std::error::Error`
/// trait.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MatchError(alloc::boxed::Box<MatchErrorKind>);

impl MatchError {
    /// Create a new error value with the given kind.
    ///
    /// This is a more verbose version of the kind-specific constructors, e.g.,
    /// `MatchError::unsupported_stream`.
    pub fn new(kind: MatchErrorKind) -> MatchError {
        MatchError(alloc::boxed::Box::new(kind))
    }

    /// Returns a reference to the underlying error kind.
    pub fn kind(&self) -> &MatchErrorKind {
        &self.0
    }

    /// Create a new "invalid anchored search" error. This occurs when the
    /// caller requests an anchored search but where anchored searches aren't
    /// supported.
    ///
    /// This is the same as calling `MatchError::new` with a
    /// [`MatchErrorKind::InvalidInputAnchored`] kin
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\error.rs
**SHA:** 40cfa53d126eae52
**Timestamp:** 2026-08-28T02:34:00.991654
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern = self.data.matcher(&[source], &[quote! { source }]);
- Some(quote! { #pattern => #expr })
- let pattern = self.data.matcher(&[source], &[quote! { source }]);
- #pattern => {
- let pattern = self.data.matcher(
- #pattern => {
- let pattern = self.data.matcher(&[backtrace], &[quote! { backtrace }]);
- #pattern => {

### Ouro Bruto (primeiros 5000 chars)
```
use proc_macro2::TokenStream;
use quote::quote;
use syn::{spanned::Spanned as _, Error, Result};

use crate::utils::{
    self, AttrParams, DeriveType, FullMetaInfo, HashSet, MetaInfo, MultiFieldData,
    State,
};

pub fn expand(
    input: &syn::DeriveInput,
    trait_name: &'static str,
) -> Result<TokenStream> {
    let syn::DeriveInput {
        ident, generics, ..
    } = input;

    let state = State::with_attr_params(
        input,
        trait_name,
        trait_name.to_lowercase(),
        allowed_attr_params(),
    )?;

    let type_params: HashSet<_> = generics
        .params
        .iter()
        .filter_map(|generic| match generic {
            syn::GenericParam::Type(ty) => Some(ty.ident.clone()),
            _ => None,
        })
        .collect();

    let (bounds, source, provide) = match state.derive_type {
        DeriveType::Named | DeriveType::Unnamed => render_struct(&type_params, &state)?,
        DeriveType::Enum => render_enum(&type_params, &state)?,
    };

    let source = source.map(|source| {
        // Not using `#[inline]` here on purpose, since this is almost never part
        // of a hot codepath.
        quote! {
            fn source(&self) -> Option<&(dyn derive_more::core::error::Error + 'static)> {
                use derive_more::__private::AsDynError as _;
                #source
            }
        }
    });

    let provide = provide.map(|provide| {
        // Not using `#[inline]` here on purpose, since this is almost never part
        // of a hot codepath.
        quote! {
            fn provide<'_request>(
                &'_request self,
                request: &mut derive_more::core::error::Request<'_request>,
            ) {
                #provide
            }
        }
    });

    let mut generics = generics.clone();

    if !type_params.is_empty() {
        let (_, ty_generics, _) = generics.split_for_impl();
        generics = utils::add_extra_where_clauses(
            &generics,
            quote! {
                where
                    #ident #ty_generics: derive_more::core::fmt::Debug
                                         + derive_more::core::fmt::Display
            },
        );
    }

    if !bounds.is_empty() {
        let bounds = bounds.iter();
        generics = utils::add_extra_where_clauses(
            &generics,
            quote! {
                where #(
                    #bounds: derive_more::core::fmt::Debug
                             + derive_more::core::fmt::Display
                             + derive_more::core::error::Error
                             + 'static
                ),*
            },
        );
    }

    let (impl_generics, ty_generics, where_clause) = generics.split_for_impl();

    let render = quote! {
        #[automatically_derived]
        impl #impl_generics derive_more::core::error::Error for #ident #ty_generics #where_clause {
            #source
            #provide
        }
    };

    Ok(render)
}

fn render_struct(
    type_params: &HashSet<syn::Ident>,
    state: &State,
) -> Result<(HashSet<syn::Type>, Option<TokenStream>, Option<TokenStream>)> {
    let parsed_fields = parse_fields(type_params, state)?;

    let source = parsed_fields.render_source_as_struct();
    let provide = cfg!(error_generic_member_access)
        .then(|| parsed_fields.render_provide_as_struct())
        .flatten();

    Ok((parsed_fields.bounds, source, provide))
}

fn render_enum(
    type_params: &HashSet<syn::Ident>,
    state: &State,
) -> Result<(HashSet<syn::Type>, Option<TokenStream>, Option<TokenStream>)> {
    let mut bounds = HashSet::default();
    let mut source_match_arms = Vec::new();
    let mut provide_match_arms = Vec::new();

    for variant in state.enabled_variant_data().variants {
        let default_info = FullMetaInfo {
            enabled: true,
            ..FullMetaInfo::default()
        };

        let state = State::from_variant(
            state.input,
            state.trait_name,
            state.trait_attr.clone(),
            allowed_attr_params(),
            variant,
            default_info,
        )?;

        let parsed_fields = parse_fields(type_params, &state)?;

        if let Some(expr) = parsed_fields.render_source_as_enum_variant_match_arm() {
            source_match_arms.push(expr);
        }

        if let Some(expr) = parsed_fields.render_provide_as_enum_variant_match_arm() {
            provide_match_arms.push(expr);
        }

        bounds.extend(parsed_fields.bounds.into_iter());
    }

    let render = |match_arms: &mut Vec<TokenStream>, unmatched| {
        if !match_arms.is_empty() && match_arms.len() < state.variants.len() {
            match_arms.push(quote! { _ => #unmatched });
        }

        (!match_arms.is_empty()).then(|| {
            quote! {
                match self {
                    #(#match_arms),*
                }
            }
        })
    };

    let source = render(&mut source_match_arms, quote! { None });
    
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-1.13.1\src\error.rs
**SHA:** 362c126a701852b3
**Timestamp:** 2026-08-28T02:35:04.460779
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Remove this method entirely on the next breaking semver release.

### Ouro Bruto (primeiros 5000 chars)
```
use alloc::string::{String, ToString};

use regex_automata::meta;

/// An error that occurred during parsing or compiling a regular expression.
#[non_exhaustive]
#[derive(Clone, PartialEq)]
pub enum Error {
    /// A syntax error.
    Syntax(String),
    /// The compiled program exceeded the set size
    /// limit. The argument is the size limit imposed by
    /// [`RegexBuilder::size_limit`](crate::RegexBuilder::size_limit). Even
    /// when not configured explicitly, it defaults to a reasonable limit.
    ///
    /// If you're getting this error, it occurred because your regex has been
    /// compiled to an intermediate state that is too big. It is important to
    /// note that exceeding this limit does _not_ mean the regex is too big to
    /// _work_, but rather, the regex is big enough that it may wind up being
    /// surprisingly slow when used in a search. In other words, this error is
    /// meant to be a practical heuristic for avoiding a performance footgun,
    /// and especially so for the case where the regex pattern is coming from
    /// an untrusted source.
    ///
    /// There are generally two ways to move forward if you hit this error.
    /// The first is to find some way to use a smaller regex. The second is to
    /// increase the size limit via `RegexBuilder::size_limit`. However, if
    /// your regex pattern is not from a trusted source, then neither of these
    /// approaches may be appropriate. Instead, you'll have to determine just
    /// how big of a regex you want to allow.
    CompiledTooBig(usize),
}

impl Error {
    pub(crate) fn from_meta_build_error(err: meta::BuildError) -> Error {
        if let Some(size_limit) = err.size_limit() {
            Error::CompiledTooBig(size_limit)
        } else if let Some(ref err) = err.syntax_error() {
            Error::Syntax(err.to_string())
        } else {
            // This is a little suspect. Technically there are more ways for
            // a meta regex to fail to build other than "exceeded size limit"
            // and "syntax error." For example, if there are too many states
            // or even too many patterns. But in practice this is probably
            // good enough. The worst thing that happens is that Error::Syntax
            // represents an error that isn't technically a syntax error, but
            // the actual message will still be shown. So... it's not too bad.
            //
            // We really should have made the Error type in the regex crate
            // completely opaque. Rookie mistake.
            Error::Syntax(err.to_string())
        }
    }
}

#[cfg(feature = "std")]
impl std::error::Error for Error {
    // TODO: Remove this method entirely on the next breaking semver release.
    #[allow(deprecated)]
    fn description(&self) -> &str {
        match *self {
            Error::Syntax(ref err) => err,
            Error::CompiledTooBig(_) => "compiled program too big",
        }
    }
}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match *self {
            Error::Syntax(ref err) => err.fmt(f),
            Error::CompiledTooBig(limit) => write!(
                f,
                "Compiled regex exceeds size limit of {limit} bytes.",
            ),
        }
    }
}

// We implement our own Debug implementation so that we show nicer syntax
// errors when people use `Regex::new(...).unwrap()`. It's a little weird,
// but the `Syntax` variant is already storing a `String` anyway, so we might
// as well format it nicely.
impl core::fmt::Debug for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match *self {
            Error::Syntax(ref err) => {
                let hr: String = core::iter::repeat('~').take(79).collect();
                writeln!(f, "Syntax(")?;
                writeln!(f, "{hr}")?;
                writeln!(f, "{err}")?;
                writeln!(f, "{hr}")?;
                write!(f, ")")?;
                Ok(())
            }
            Error::CompiledTooBig(limit) => {
                f.debug_tuple("CompiledTooBig").field(&limit).finish()
            }
        }
    }
}

```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-syntax-0.8.11\src\error.rs
**SHA:** e308b3ccad0bea92
**Timestamp:** 2026-08-28T02:35:07.686195
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: &'e str,
- pattern: err.pattern(),
- pattern: err.pattern(),
- pattern: &'p str,
- pattern: &fmter.pattern,
- fn assert_panic_message(pattern: &str, expected_msg: &str) {

### Ouro Bruto (primeiros 5000 chars)
```
use alloc::{
    format,
    string::{String, ToString},
    vec,
    vec::Vec,
};

use crate::{ast, hir};

/// This error type encompasses any error that can be returned by this crate.
///
/// This error type is marked as `non_exhaustive`. This means that adding a
/// new variant is not considered a breaking change.
#[non_exhaustive]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Error {
    /// An error that occurred while translating concrete syntax into abstract
    /// syntax (AST).
    Parse(ast::Error),
    /// An error that occurred while translating abstract syntax into a high
    /// level intermediate representation (HIR).
    Translate(hir::Error),
}

impl From<ast::Error> for Error {
    fn from(err: ast::Error) -> Error {
        Error::Parse(err)
    }
}

impl From<hir::Error> for Error {
    fn from(err: hir::Error) -> Error {
        Error::Translate(err)
    }
}

#[cfg(feature = "std")]
impl std::error::Error for Error {}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match *self {
            Error::Parse(ref x) => x.fmt(f),
            Error::Translate(ref x) => x.fmt(f),
        }
    }
}

/// A helper type for formatting nice error messages.
///
/// This type is responsible for reporting regex parse errors in a nice human
/// readable format. Most of its complexity is from interspersing notational
/// markers pointing out the position where an error occurred.
#[derive(Debug)]
pub struct Formatter<'e, E> {
    /// The original regex pattern in which the error occurred.
    pattern: &'e str,
    /// The error kind. It must impl fmt::Display.
    err: &'e E,
    /// The primary span of the error.
    span: &'e ast::Span,
    /// An auxiliary and optional span, in case the error needs to point to
    /// two locations (e.g., when reporting a duplicate capture group name).
    aux_span: Option<&'e ast::Span>,
}

impl<'e> From<&'e ast::Error> for Formatter<'e, ast::ErrorKind> {
    fn from(err: &'e ast::Error) -> Self {
        Formatter {
            pattern: err.pattern(),
            err: err.kind(),
            span: err.span(),
            aux_span: err.auxiliary_span(),
        }
    }
}

impl<'e> From<&'e hir::Error> for Formatter<'e, hir::ErrorKind> {
    fn from(err: &'e hir::Error) -> Self {
        Formatter {
            pattern: err.pattern(),
            err: err.kind(),
            span: err.span(),
            aux_span: None,
        }
    }
}

impl<'e, E: core::fmt::Display> core::fmt::Display for Formatter<'e, E> {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        let spans = Spans::from_formatter(self);
        if self.pattern.contains('\n') {
            let divider = repeat_char('~', 79);

            writeln!(f, "regex parse error:")?;
            writeln!(f, "{divider}")?;
            let notated = spans.notate();
            write!(f, "{notated}")?;
            writeln!(f, "{divider}")?;
            // If we have error spans that cover multiple lines, then we just
            // note the line numbers.
            if !spans.multi_line.is_empty() {
                let mut notes = vec![];
                for span in &spans.multi_line {
                    notes.push(format!(
                        "on line {} (column {}) through line {} (column {})",
                        span.start.line,
                        span.start.column,
                        span.end.line,
                        span.end.column - 1
                    ));
                }
                writeln!(f, "{}", notes.join("\n"))?;
            }
            write!(f, "error: {}", self.err)?;
        } else {
            writeln!(f, "regex parse error:")?;
            let notated = Spans::from_formatter(self).notate();
            write!(f, "{notated}")?;
            write!(f, "error: {}", self.err)?;
        }
        Ok(())
    }
}

/// This type represents an arbitrary number of error spans in a way that makes
/// it convenient to notate the regex pattern. ("Notate" means "point out
/// exactly where the error occurred in the regex pattern.")
///
/// Technically, we can only ever have two spans given our current error
/// structure. However, after toiling with a specific algorithm for handling
/// two spans, it became obvious that an algorithm to handle an arbitrary
/// number of spans was actually much simpler.
struct Spans<'p> {
    /// The original regex pattern string.
    pattern: &'p str,
    /// The total width that should be used for line numbers. The width is
    /// used for left padding the line numbers for alignment.
    ///
    /// A value of `0` means line numbers should not be displayed. That is,
    /// the pattern is itself only one line.
    line_number_width: usize,
    /// All error spans that occur on a single line. This sequence always has
    /// length equivalent to the number of lines in `pattern`, where the index
    /// of the sequence represents a line number
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-2.0.119\src\error.rs
**SHA:** 34a045645056452a
**Timestamp:** 2026-08-28T02:35:46.283702
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Span,
- start: span,
- let start = iter.next().map_or_else(Span::call_site, |t| t.span());
- pub(crate) fn new2<T: Display>(start: Span, end: Span, message: T) -> Error {
- fn new2(start: Span, end: Span, message: String) -> Error {

### Gaps
- // TODO: impl core::error::Error (requires Rust 1.81+)

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "parsing")]
use crate::buffer::Cursor;
use crate::ext::{PunctExt as _, TokenStreamExt as _};
use crate::thread::ThreadBound;
#[cfg(feature = "parsing")]
use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;
use core::fmt::{self, Debug, Display};
use core::slice;
use proc_macro2::{
    Delimiter, Group, Ident, LexError, Literal, Punct, Spacing, Span, TokenStream, TokenTree,
};
#[cfg(feature = "printing")]
use quote::ToTokens;

/// The result of a Syn parser.
pub type Result<T> = core::result::Result<T, Error>;

/// Error returned when a Syn parser cannot parse the input tokens.
///
/// # Error reporting in proc macros
///
/// The correct way to report errors back to the compiler from a procedural
/// macro is by emitting an appropriately spanned invocation of
/// [`compile_error!`] in the generated code. This produces a better diagnostic
/// message than simply panicking the macro.
///
/// [`compile_error!`]: core::compile_error!
///
/// When parsing macro input, the [`parse_macro_input!`] macro handles the
/// conversion to `compile_error!` automatically.
///
/// [`parse_macro_input!`]: crate::parse_macro_input!
///
/// ```
/// # extern crate proc_macro;
/// #
/// use proc_macro::TokenStream;
/// use syn::parse::{Parse, ParseStream, Result};
/// use syn::{parse_macro_input, ItemFn};
///
/// # const IGNORE: &str = stringify! {
/// #[proc_macro_attribute]
/// # };
/// pub fn my_attr(args: TokenStream, input: TokenStream) -> TokenStream {
///     let args = parse_macro_input!(args as MyAttrArgs);
///     let input = parse_macro_input!(input as ItemFn);
///
///     /* ... */
///     # TokenStream::new()
/// }
///
/// struct MyAttrArgs {
///     # _k: [(); { stringify! {
///     ...
///     # }; 0 }]
/// }
///
/// impl Parse for MyAttrArgs {
///     fn parse(input: ParseStream) -> Result<Self> {
///         # stringify! {
///         ...
///         # };
///         # unimplemented!()
///     }
/// }
/// ```
///
/// For errors that arise later than the initial parsing stage, the
/// [`.to_compile_error()`] or [`.into_compile_error()`] methods can be used to
/// perform an explicit conversion to `compile_error!`.
///
/// [`.to_compile_error()`]: Error::to_compile_error
/// [`.into_compile_error()`]: Error::into_compile_error
///
/// ```
/// # extern crate proc_macro;
/// #
/// # use proc_macro::TokenStream;
/// # use syn::{parse_macro_input, DeriveInput};
/// #
/// # const IGNORE: &str = stringify! {
/// #[proc_macro_derive(MyDerive)]
/// # };
/// pub fn my_derive(input: TokenStream) -> TokenStream {
///     let input = parse_macro_input!(input as DeriveInput);
///
///     // fn(DeriveInput) -> syn::Result<proc_macro2::TokenStream>
///     expand::my_derive(input)
///         .unwrap_or_else(syn::Error::into_compile_error)
///         .into()
/// }
/// #
/// # mod expand {
/// #     use proc_macro2::TokenStream;
/// #     use syn::{DeriveInput, Result};
/// #
/// #     pub fn my_derive(input: DeriveInput) -> Result<TokenStream> {
/// #         unimplemented!()
/// #     }
/// # }
/// ```
pub struct Error {
    messages: Vec<ErrorMessage>,
}

struct ErrorMessage {
    // Span is implemented as an index into a thread-local interner to keep the
    // size small. It is not safe to access from a different thread. We want
    // errors to be Send and Sync to play nicely with ecosystem crates for error
    // handling, so pin the span we're given to its original thread and assume
    // it is Span::call_site if accessed from any other thread.
    span: ThreadBound<SpanRange>,
    message: String,
}

// Cannot use core::ops::Range<Span> because that does not implement Copy,
// whereas ThreadBound<T> requires a Copy impl as a way to ensure no Drop impls
// are involved.
struct SpanRange {
    start: Span,
    end: Span,
}

#[cfg(test)]
struct _Test
where
    Error: Send + Sync;

impl Error {
    /// Usually the [`ParseStream::error`] method will be used instead, which
    /// automatically uses the correct span from the current position of the
    /// parse stream.
    ///
    /// Use `Error::new` when the error needs to be triggered on some span other
    /// than where the parse stream is currently positioned.
    ///
    /// [`ParseStream::error`]: crate::parse::ParseBuffer::error
    ///
    /// # Example
    ///
    /// ```
    /// use syn::{Error, Ident, LitStr, Result, Token};
    /// use syn::parse::ParseStream;
    ///
    /// // Parses input that looks like `name = "string"` where the key must be
    /// // the identifier `name` and the value may be any string literal.
    /// // Returns the string literal.
    /// fn parse_name(input: ParseStream) -> Result<LitStr> {
    ///     let name_token: Ident = input.parse()?;
    ///     if name_token != "name" {
    ///         // Trigger an error not on the current position of the stream,
    ///         // but on the position of the unexpected identifier.
    ///         return Err(Error::new(name_token.span(
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-3.0.3\src\error.rs
**SHA:** 5ed698f9dd63f167
**Timestamp:** 2026-08-28T02:35:48.272937
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Span,
- start: span,
- let start = iter.next().map_or_else(Span::call_site, |t| t.span());
- start: span.start.span(),
- end: if span.start == span.end {
- pub(crate) fn new2<T: Display>(start: Span, end: Span, message: T) -> Error {
- fn new2(start: Span, end: Span, message: String) -> Error {

### Gaps
- // TODO: impl core::error::Error (requires Rust 1.81+)

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "parsing")]
use crate::buffer::Cursor;
use crate::ext::{PunctExt as _, TokenStreamExt as _};
use crate::thread::ThreadBound;
#[cfg(feature = "parsing")]
use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;
use core::fmt::{self, Debug, Display};
#[cfg(feature = "parsing")]
use core::ops::Range;
use core::slice;
use proc_macro2::{
    Delimiter, Group, Ident, LexError, Literal, Punct, Spacing, Span, TokenStream, TokenTree,
};
#[cfg(feature = "printing")]
use quote::ToTokens;

/// The result of a Syn parser.
pub type Result<T> = core::result::Result<T, Error>;

/// Error returned when a Syn parser cannot parse the input tokens.
///
/// # Error reporting in proc macros
///
/// The correct way to report errors back to the compiler from a procedural
/// macro is by emitting an appropriately spanned invocation of
/// [`compile_error!`] in the generated code. This produces a better diagnostic
/// message than simply panicking the macro.
///
/// [`compile_error!`]: core::compile_error!
///
/// When parsing macro input, the [`parse_macro_input!`] macro handles the
/// conversion to `compile_error!` automatically.
///
/// [`parse_macro_input!`]: crate::parse_macro_input!
///
/// ```
/// # extern crate proc_macro;
/// #
/// use proc_macro::TokenStream;
/// use syn::parse::{Parse, ParseStream, Result};
/// use syn::{parse_macro_input, ItemFn};
///
/// # const IGNORE: &str = stringify! {
/// #[proc_macro_attribute]
/// # };
/// pub fn my_attr(args: TokenStream, input: TokenStream) -> TokenStream {
///     let args = parse_macro_input!(args as MyAttrArgs);
///     let input = parse_macro_input!(input as ItemFn);
///
///     /* ... */
///     # TokenStream::new()
/// }
///
/// struct MyAttrArgs {
///     # _k: [(); { stringify! {
///     ...
///     # }; 0 }]
/// }
///
/// impl Parse for MyAttrArgs {
///     fn parse(input: ParseStream) -> Result<Self> {
///         # stringify! {
///         ...
///         # };
///         # unimplemented!()
///     }
/// }
/// ```
///
/// For errors that arise later than the initial parsing stage, the
/// [`.to_compile_error()`] or [`.into_compile_error()`] methods can be used to
/// perform an explicit conversion to `compile_error!`.
///
/// [`.to_compile_error()`]: Error::to_compile_error
/// [`.into_compile_error()`]: Error::into_compile_error
///
/// ```
/// # extern crate proc_macro;
/// #
/// # use proc_macro::TokenStream;
/// # use syn::{parse_macro_input, DeriveInput};
/// #
/// # const IGNORE: &str = stringify! {
/// #[proc_macro_derive(MyDerive)]
/// # };
/// pub fn my_derive(input: TokenStream) -> TokenStream {
///     let input = parse_macro_input!(input as DeriveInput);
///
///     // fn(DeriveInput) -> syn::Result<proc_macro2::TokenStream>
///     expand::my_derive(input)
///         .unwrap_or_else(syn::Error::into_compile_error)
///         .into()
/// }
/// #
/// # mod expand {
/// #     use proc_macro2::TokenStream;
/// #     use syn::{DeriveInput, Result};
/// #
/// #     pub fn my_derive(input: DeriveInput) -> Result<TokenStream> {
/// #         unimplemented!()
/// #     }
/// # }
/// ```
pub struct Error {
    messages: Vec<ErrorMessage>,
}

struct ErrorMessage {
    // Span is implemented as an index into a thread-local interner to keep the
    // size small. It is not safe to access from a different thread. We want
    // errors to be Send and Sync to play nicely with ecosystem crates for error
    // handling, so pin the span we're given to its original thread and assume
    // it is Span::call_site if accessed from any other thread.
    span: ThreadBound<SpanRange>,
    message: String,
}

// Cannot use core::ops::Range<Span> because that does not implement Copy,
// whereas ThreadBound<T> requires a Copy impl as a way to ensure no Drop impls
// are involved.
struct SpanRange {
    start: Span,
    end: Span,
}

#[cfg(test)]
struct _Test
where
    Error: Send + Sync;

impl Error {
    /// Usually the [`ParseStream::error`] method will be used instead, which
    /// automatically uses the correct span from the current position of the
    /// parse stream.
    ///
    /// Use `Error::new` when the error needs to be triggered on some span other
    /// than where the parse stream is currently positioned.
    ///
    /// [`ParseStream::error`]: crate::parse::ParseBuffer::error
    ///
    /// # Example
    ///
    /// ```
    /// use syn::{Error, Ident, LitStr, Result, Token};
    /// use syn::parse::ParseStream;
    ///
    /// // Parses input that looks like `name = "string"` where the key must be
    /// // the identifier `name` and the value may be any string literal.
    /// // Returns the string literal.
    /// fn parse_name(input: ParseStream) -> Result<LitStr> {
    ///     let name_token: Ident = input.parse()?;
    ///     if name_token != "name" {
    ///         // Trigger an error not on the current position of the stream,
    ///         // but on the position of the unexpected identifier.
    
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\error.rs
**SHA:** c46648d6df9a3e5f
**Timestamp:** 2026-08-28T02:35:53.964423
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- IsolationPattern(#[from] tauri_utils::pattern::isolation::Error),
- #[error("invalid glob pattern: {0}")]

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::fmt;

/// A generic boxed error.
#[derive(Debug)]
pub struct SetupError(Box<dyn std::error::Error>);

impl From<Box<dyn std::error::Error>> for SetupError {
  fn from(error: Box<dyn std::error::Error>) -> Self {
    Self(error)
  }
}

// safety: the setup error is only used on the main thread
// and we exit the process immediately.
unsafe impl Send for SetupError {}
unsafe impl Sync for SetupError {}

impl fmt::Display for SetupError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    self.0.fmt(f)
  }
}

impl std::error::Error for SetupError {}

/// Runtime errors that can happen inside a Tauri application.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum Error {
  /// Runtime error.
  #[error("runtime error: {0}")]
  Runtime(#[from] tauri_runtime::Error),
  /// Window label must be unique.
  #[error("a window with label `{0}` already exists")]
  WindowLabelAlreadyExists(String),
  /// Webview label must be unique.
  #[error("a webview with label `{0}` already exists")]
  WebviewLabelAlreadyExists(String),
  /// Cannot use the webview reparent function on webview windows.
  #[error("cannot reparent when using a WebviewWindow")]
  CannotReparentWebviewWindow,
  /// Embedded asset not found.
  #[error("asset not found: {0}")]
  AssetNotFound(String),
  /// Failed to serialize/deserialize.
  #[error("JSON error: {0}")]
  Json(#[from] serde_json::Error),
  /// IO error.
  #[error("{0}")]
  Io(#[from] std::io::Error),
  /// Failed to load window icon.
  #[error("invalid icon: {0}")]
  InvalidIcon(std::io::Error),
  /// Invalid args when running a command.
  #[error("invalid args `{1}` for command `{0}`: {2}")]
  InvalidArgs(&'static str, &'static str, serde_json::Error),
  /// Encountered an error in the setup hook,
  #[error("error encountered during setup hook: {0}")]
  Setup(SetupError),
  /// Error initializing plugin.
  #[error("failed to initialize plugin `{0}`: {1}")]
  PluginInitialization(String, String),
  /// A part of the URL is malformed or invalid. This may occur when parsing and combining
  /// user-provided URLs and paths.
  #[error("invalid url: {0}")]
  InvalidUrl(url::ParseError),
  /// Task join error.
  #[error(transparent)]
  JoinError(#[from] tokio::task::JoinError),
  /// An error happened inside the isolation pattern.
  #[cfg(feature = "isolation")]
  #[error("isolation pattern error: {0}")]
  IsolationPattern(#[from] tauri_utils::pattern::isolation::Error),
  /// An invalid window URL was provided. Includes details about the error.
  #[error("invalid window url: {0}")]
  InvalidWebviewUrl(&'static str),
  /// Invalid glob pattern.
  #[error("invalid glob pattern: {0}")]
  GlobPattern(#[from] glob::PatternError),
  /// Image error.
  #[cfg(any(feature = "image-png", feature = "image-ico"))]
  #[error("failed to process image: {0}")]
  Image(#[from] image::error::ImageError),
  /// The Window's raw handle is invalid for the platform.
  #[error("Unexpected `raw_window_handle` for the current platform")]
  InvalidWindowHandle,
  /// JNI error.
  #[cfg(target_os = "android")]
  #[error("jni error: {0}")]
  Jni(#[from] jni::errors::Error),
  /// Failed to receive message .
  #[error("failed to receive message")]
  FailedToReceiveMessage,
  /// Menu error.
  #[error("menu error: {0}")]
  #[cfg(desktop)]
  Menu(#[from] muda::Error),
  /// Bad menu icon error.
  #[error(transparent)]
  #[cfg(desktop)]
  BadMenuIcon(#[from] muda::BadIcon),
  /// Tray icon error.
  #[error("tray icon error: {0}")]
  #[cfg(all(desktop, feature = "tray-icon"))]
  #[cfg_attr(docsrs, doc(cfg(all(desktop, feature = "tray-icon"))))]
  Tray(#[from] tray_icon::Error),
  /// Bad tray icon error.
  #[error(transparent)]
  #[cfg(all(desktop, feature = "tray-icon"))]
  #[cfg_attr(docsrs, doc(cfg(all(desktop, feature = "tray-icon"))))]
  BadTrayIcon(#[from] tray_icon::BadIcon),
  /// Path does not have a parent.
  #[error("path does not have a parent")]
  NoParent,
  /// Path does not have an extension.
  #[error("path does not have an extension")]
  NoExtension,
  /// Path does not have a basename.
  #[error("path does not have a basename")]
  NoBasename,
  /// Cannot resolve current directory.
  #[error("failed to read current dir: {0}")]
  CurrentDir(std::io::Error),
  /// Unknown path.
  #[cfg(not(target_os = "android"))]
  #[error("unknown path")]
  UnknownPath,
  /// Failed to invoke mobile plugin.
  #[cfg(target_os = "android")]
  #[error(transparent)]
  PluginInvoke(#[from] crate::plugin::mobile::PluginInvokeError),
  /// window not found.
  #[error("window not found")]
  WindowNotFound,
  /// The resource id is invalid.
  #[error("The resource id {0} is invalid.")]
  BadResourceId(crate::resources::ResourceId),
  /// The anyhow crate error.
  #[error(transparent)]
  Anyhow(#[from] anyhow::Error),
  /// webview not found.
  #[error("webview n
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-macros-0.2.32\src\error.rs
**SHA:** 1978fb4bc94fde73
**Timestamp:** 2026-08-28T02:36:08.982313
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- span_start: Option<Span>,
- span_start: Option<Span>,
- span_start: Option<Span>,
- span_start: Option<Span>,
- span_start: Option<Span>,

### Ouro Bruto (primeiros 5000 chars)
```
use std::borrow::Cow;
use std::fmt;

use proc_macro::{Delimiter, Group, Ident, Literal, Punct, Spacing, Span, TokenStream, TokenTree};

trait WithSpan {
    fn with_span(self, span: Span) -> Self;
}

impl WithSpan for TokenTree {
    fn with_span(mut self, span: Span) -> Self {
        self.set_span(span);
        self
    }
}

pub(crate) enum Error {
    MissingComponent {
        name: &'static str,
        span_start: Option<Span>,
        span_end: Option<Span>,
    },
    InvalidComponent {
        name: &'static str,
        value: String,
        span_start: Option<Span>,
        span_end: Option<Span>,
    },
    #[cfg(any(feature = "formatting", feature = "parsing"))]
    ExpectedString {
        span_start: Option<Span>,
        span_end: Option<Span>,
    },
    UnexpectedToken {
        tree: TokenTree,
    },
    UnexpectedEndOfInput,
    #[cfg(any(feature = "formatting", feature = "parsing"))]
    ByteStringNotPermitted {
        span_start: Option<Span>,
        span_end: Option<Span>,
    },
    Custom {
        message: Cow<'static, str>,
        span_start: Option<Span>,
        span_end: Option<Span>,
    },
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MissingComponent { name, .. } => write!(f, "missing component: {name}"),
            Self::InvalidComponent { name, value, .. } => {
                write!(f, "invalid component: {name} was {value}")
            }
            #[cfg(any(feature = "formatting", feature = "parsing"))]
            Self::ExpectedString { .. } => f.write_str("expected string literal"),
            Self::UnexpectedToken { tree } => write!(f, "unexpected token: {tree}"),
            Self::UnexpectedEndOfInput => f.write_str("unexpected end of input"),
            #[cfg(any(feature = "formatting", feature = "parsing"))]
            Self::ByteStringNotPermitted { .. } => f.write_str("byte strings are not permitted"),
            Self::Custom { message, .. } => f.write_str(message),
        }
    }
}

impl Error {
    fn span_start(&self) -> Span {
        match self {
            Self::MissingComponent { span_start, .. }
            | Self::InvalidComponent { span_start, .. }
            | Self::Custom { span_start, .. } => *span_start,
            #[cfg(any(feature = "formatting", feature = "parsing"))]
            Self::ExpectedString { span_start, .. }
            | Self::ByteStringNotPermitted { span_start, .. } => *span_start,
            Self::UnexpectedToken { tree } => Some(tree.span()),
            Self::UnexpectedEndOfInput => Some(Span::mixed_site()),
        }
        .unwrap_or_else(Span::mixed_site)
    }

    fn span_end(&self) -> Span {
        match self {
            Self::MissingComponent { span_end, .. }
            | Self::InvalidComponent { span_end, .. }
            | Self::Custom { span_end, .. } => *span_end,
            #[cfg(any(feature = "formatting", feature = "parsing"))]
            Self::ExpectedString { span_end, .. }
            | Self::ByteStringNotPermitted { span_end, .. } => *span_end,
            Self::UnexpectedToken { tree, .. } => Some(tree.span()),
            Self::UnexpectedEndOfInput => Some(Span::mixed_site()),
        }
        .unwrap_or_else(|| self.span_start())
    }

    pub(crate) fn to_compile_error(&self) -> TokenStream {
        let (start, end) = (self.span_start(), self.span_end());

        [
            TokenTree::from(Punct::new(':', Spacing::Joint)).with_span(start),
            TokenTree::from(Punct::new(':', Spacing::Alone)).with_span(start),
            TokenTree::from(Ident::new("core", start)),
            TokenTree::from(Punct::new(':', Spacing::Joint)).with_span(start),
            TokenTree::from(Punct::new(':', Spacing::Alone)).with_span(start),
            TokenTree::from(Ident::new("compile_error", start)),
            TokenTree::from(Punct::new('!', Spacing::Alone)).with_span(start),
            TokenTree::from(Group::new(
                Delimiter::Parenthesis,
                TokenStream::from(
                    TokenTree::from(Literal::string(&self.to_string())).with_span(end),
                ),
            ))
            .with_span(end),
        ]
        .iter()
        .cloned()
        .collect()
    }

    /// Like `to_compile_error`, but for use in macros that produce items.
    #[cfg(all(feature = "serde", any(feature = "formatting", feature = "parsing")))]
    pub(crate) fn to_compile_error_standalone(&self) -> TokenStream {
        let end = self.span_end();
        self.to_compile_error()
            .into_iter()
            .chain(std::iter::once(
                TokenTree::from(Punct::new(';', Spacing::Alone)).with_span(end),
            ))
            .collect()
    }
}

```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml-0.9.12+spec-1.1.0\src\de\error.rs
**SHA:** 528546478bbf6112
**Timestamp:** 2026-08-28T02:36:24.453090
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let line_start = match nl {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::alloc_prelude::*;

/// Errors that can occur when deserializing a type.
#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct Error {
    message: String,
    input: Option<alloc::sync::Arc<str>>,
    keys: Vec<String>,
    span: Option<core::ops::Range<usize>>,
}

impl Error {
    #[cfg(feature = "parse")]
    pub(crate) fn new(input: alloc::sync::Arc<str>, error: toml_parser::ParseError) -> Self {
        let mut message = String::new();
        message.push_str(error.description());
        if let Some(expected) = error.expected() {
            message.push_str(", expected ");
            if expected.is_empty() {
                message.push_str("nothing");
            } else {
                for (i, expected) in expected.iter().enumerate() {
                    if i != 0 {
                        message.push_str(", ");
                    }
                    match expected {
                        toml_parser::Expected::Literal(desc) => {
                            message.push_str(&render_literal(desc));
                        }
                        toml_parser::Expected::Description(desc) => message.push_str(desc),
                        _ => message.push_str("etc"),
                    }
                }
            }
        }

        let span = error.unexpected().map(|span| span.start()..span.end());

        Self {
            message,
            input: Some(input),
            keys: Vec::new(),
            span,
        }
    }

    pub(crate) fn custom<T>(msg: T, span: Option<core::ops::Range<usize>>) -> Self
    where
        T: core::fmt::Display,
    {
        Self {
            message: msg.to_string(),
            input: None,
            keys: Vec::new(),
            span,
        }
    }

    pub(crate) fn add_key(&mut self, key: String) {
        self.keys.insert(0, key);
    }

    /// What went wrong
    pub fn message(&self) -> &str {
        &self.message
    }

    /// The start/end index into the original document where the error occurred
    pub fn span(&self) -> Option<core::ops::Range<usize>> {
        self.span.clone()
    }

    pub(crate) fn set_span(&mut self, span: Option<core::ops::Range<usize>>) {
        self.span = span;
    }

    /// Provide the encoded TOML the error applies to
    pub fn set_input(&mut self, input: Option<&str>) {
        self.input = input.map(|s| s.into());
    }
}

#[cfg(feature = "serde")]
impl serde_core::de::Error for Error {
    fn custom<T>(msg: T) -> Self
    where
        T: core::fmt::Display,
    {
        Self::custom(msg.to_string(), None)
    }
}

fn render_literal(literal: &str) -> String {
    match literal {
        "\n" => "newline".to_owned(),
        "`" => "'`'".to_owned(),
        s if s.chars().all(|c| c.is_ascii_control()) => {
            format!("`{}`", s.escape_debug())
        }
        s => format!("`{s}`"),
    }
}

/// Displays a TOML parse error
///
/// # Example
///
/// TOML parse error at line 1, column 10
///   |
/// 1 | 00:32:00.a999999
///   |          ^
/// Unexpected `a`
/// Expected `digit`
/// While parsing a Time
/// While parsing a Date-Time
impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        let mut context = false;
        if let (Some(input), Some(span)) = (&self.input, self.span()) {
            context = true;

            let (line, column) = translate_position(input.as_bytes(), span.start);
            let line_num = line + 1;
            let col_num = column + 1;
            let gutter = line_num.to_string().len();
            let content = input.split('\n').nth(line).expect("valid line number");
            let highlight_len = span.end - span.start;
            // Allow highlight to go one past the line
            let highlight_len = highlight_len.min(content.len().saturating_sub(column));

            writeln!(f, "TOML parse error at line {line_num}, column {col_num}")?;
            //   |
            for _ in 0..=gutter {
                write!(f, " ")?;
            }
            writeln!(f, "|")?;

            // 1 | 00:32:00.a999999
            write!(f, "{line_num} | ")?;
            writeln!(f, "{content}")?;

            //   |          ^
            for _ in 0..=gutter {
                write!(f, " ")?;
            }
            write!(f, "|")?;
            for _ in 0..=column {
                write!(f, " ")?;
            }
            // The span will be empty at eof, so we need to make sure we always print at least
            // one `^`
            write!(f, "^")?;
            for _ in 1..highlight_len {
                write!(f, "^")?;
            }
            writeln!(f)?;
        }
        writeln!(f, "{}", self.message)?;
        if !context && !self.keys.is_empty() {
            writeln!(f, "in `{}`", self.keys.join("."))?;
        }

        Ok(())
    }
}

#[cfg(feature = "std")]
impl std::error::Error for Error {}
#[cfg(not(feature = "std"))]
#[cfg(feature = "serde")]
impl serde_core
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml-1.1.4+spec-1.1.0\src\de\error.rs
**SHA:** 761c2bed2a79be4d
**Timestamp:** 2026-08-28T02:36:25.415387
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let line_start = match nl {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::alloc_prelude::*;

/// Errors that can occur when deserializing a type.
#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct Error {
    message: String,
    input: Option<alloc::sync::Arc<str>>,
    keys: Vec<String>,
    span: Option<core::ops::Range<usize>>,
}

impl Error {
    #[cfg(feature = "parse")]
    pub(crate) fn new(input: alloc::sync::Arc<str>, error: toml_parser::ParseError) -> Self {
        let mut message = String::new();
        message.push_str(error.description());
        if let Some(expected) = error.expected() {
            message.push_str(", expected ");
            if expected.is_empty() {
                message.push_str("nothing");
            } else {
                for (i, expected) in expected.iter().enumerate() {
                    if i != 0 {
                        message.push_str(", ");
                    }
                    match expected {
                        toml_parser::Expected::Literal(desc) => {
                            message.push_str(&render_literal(desc));
                        }
                        toml_parser::Expected::Description(desc) => message.push_str(desc),
                        _ => message.push_str("etc"),
                    }
                }
            }
        }

        let span = error.unexpected().map(|span| span.start()..span.end());

        Self {
            message,
            input: Some(input),
            keys: Vec::new(),
            span,
        }
    }

    pub(crate) fn custom<T>(msg: T, span: Option<core::ops::Range<usize>>) -> Self
    where
        T: core::fmt::Display,
    {
        Self {
            message: msg.to_string(),
            input: None,
            keys: Vec::new(),
            span,
        }
    }

    pub(crate) fn add_key(&mut self, key: String) {
        self.keys.insert(0, key);
    }

    /// What went wrong
    pub fn message(&self) -> &str {
        &self.message
    }

    /// The start/end index into the original document where the error occurred
    pub fn span(&self) -> Option<core::ops::Range<usize>> {
        self.span.clone()
    }

    pub(crate) fn set_span(&mut self, span: Option<core::ops::Range<usize>>) {
        self.span = span;
    }

    /// Provide the encoded TOML the error applies to
    pub fn set_input(&mut self, input: Option<&str>) {
        self.input = input.map(|s| s.into());
    }
}

#[cfg(feature = "serde")]
impl serde_core::de::Error for Error {
    fn custom<T>(msg: T) -> Self
    where
        T: core::fmt::Display,
    {
        Self::custom(msg.to_string(), None)
    }
}

fn render_literal(literal: &str) -> String {
    match literal {
        "\n" => "newline".to_owned(),
        "`" => "'`'".to_owned(),
        s if s.chars().all(|c| c.is_ascii_control()) => {
            format!("`{}`", s.escape_debug())
        }
        s => format!("`{s}`"),
    }
}

/// Displays a TOML parse error
///
/// # Example
///
/// TOML parse error at line 1, column 10
///   |
/// 1 | 00:32:00.a999999
///   |          ^
/// Unexpected `a`
/// Expected `digit`
/// While parsing a Time
/// While parsing a Date-Time
impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        let mut context = false;
        if let (Some(input), Some(span)) = (&self.input, self.span()) {
            context = true;

            let (line, column) = translate_position(input.as_bytes(), span.start);
            let line_num = line + 1;
            let col_num = column + 1;
            let gutter = line_num.to_string().len();
            let content = input.split('\n').nth(line).expect("valid line number");
            let highlight_len = span.end - span.start;
            // Allow highlight to go one past the line
            let highlight_len = highlight_len.min(content.len().saturating_sub(column));

            writeln!(f, "TOML parse error at line {line_num}, column {col_num}")?;
            //   |
            for _ in 0..=gutter {
                write!(f, " ")?;
            }
            writeln!(f, "|")?;

            // 1 | 00:32:00.a999999
            write!(f, "{line_num} | ")?;
            writeln!(f, "{content}")?;

            //   |          ^
            for _ in 0..=gutter {
                write!(f, " ")?;
            }
            write!(f, "|")?;
            for _ in 0..=column {
                write!(f, " ")?;
            }
            // The span will be empty at eof, so we need to make sure we always print at least
            // one `^`
            write!(f, "^")?;
            for _ in 1..highlight_len {
                write!(f, "^")?;
            }
            writeln!(f)?;
        }
        writeln!(f, "{}", self.message)?;
        if !context && !self.keys.is_empty() {
            writeln!(f, "in `{}`", self.keys.join("."))?;
        }

        Ok(())
    }
}

impl core::error::Error for Error {}

fn translate_position(input: &[u8], index: usize) -> (usize, usize) {
    if input.is_empty(
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\error.rs
**SHA:** 9cdc49025dc06281
**Timestamp:** 2026-08-28T02:37:39.013844
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn append(self, input: &I, token_start: &<I as Stream>::Checkpoint) -> Self {
- fn add_context(self, input: &I, token_start: &<I as Stream>::Checkpoint, context: C) -> Self {
- token_start: &<I as Stream>::Checkpoint,
- err_start: &<I as Stream>::Checkpoint,
- fn append(self, _input: &I, _token_start: &<I as Stream>::Checkpoint) -> Self {
- _token_start: &<I as Stream>::Checkpoint,
- token_start: &<I as Stream>::Checkpoint,
- err_start: &<I as Stream>::Checkpoint,
- _token_start: &<I as Stream>::Checkpoint,
- _err_start: &<I as Stream>::Checkpoint,

### Ouro Bruto (primeiros 5000 chars)
```
//! # Error management
//!
//! Errors are designed with multiple needs in mind:
//! - Accumulate more [context][Parser::context] as the error goes up the parser chain
//! - Distinguish between [recoverable errors,
//!   unrecoverable errors, and more data is needed][ErrMode]
//! - Have a very low overhead, as errors are often discarded by the calling parser (examples: `repeat`, `alt`)
//! - Can be modified according to the user's needs, because some languages need a lot more information
//! - Help thread-through the [stream][crate::stream]
//!
//! To abstract these needs away from the user, generally `winnow` parsers use the [`ModalResult`]
//! alias, rather than [`Result`].  [`Parser::parse`] is a top-level operation
//! that can help convert to a `Result` for integrating with your application's error reporting.
//!
//! Error types include:
//! - [`EmptyError`] when the reason for failure doesn't matter
//! - [`ContextError`]
//! - [`InputError`] (mostly for testing)
//! - [`TreeError`] (mostly for testing)
//! - [Custom errors][crate::_topic::error]

#[cfg(feature = "alloc")]
use alloc::borrow::ToOwned;
use core::fmt;
use core::num::NonZeroUsize;

use crate::stream::AsBStr;
use crate::stream::Stream;
#[allow(unused_imports)] // Here for intra-doc links
use crate::Parser;

/// By default, the error type (`E`) is [`ContextError`].
///
/// When integrating into the result of the application, see
/// - [`Parser::parse`]
/// - [`ParserError::into_inner`]
pub type Result<O, E = ContextError> = core::result::Result<O, E>;

/// [Modal error reporting][ErrMode] for [`Parser::parse_next`]
///
/// - `Ok(O)` is the parsed value
/// - [`Err(ErrMode<E>)`][ErrMode] is the error along with how to respond to it
///
/// By default, the error type (`E`) is [`ContextError`].
///
/// When integrating into the result of the application, see
/// - [`Parser::parse`]
/// - [`ParserError::into_inner`]
pub type ModalResult<O, E = ContextError> = Result<O, ErrMode<E>>;

#[cfg(test)]
pub(crate) type TestResult<I, O> = ModalResult<O, InputError<I>>;

/// Contains information on needed data if a parser returned `Incomplete`
///
/// <div class="warning">
///
/// **Note:** This is only possible for `Stream` that are [partial][`crate::stream::StreamIsPartial`],
/// like [`Partial`][crate::Partial].
///
/// </div>
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Needed {
    /// Needs more data, but we do not know how much
    Unknown,
    /// Contains a lower bound on the buffer offset needed to finish parsing
    ///
    /// For byte/`&str` streams, this translates to bytes
    Size(NonZeroUsize),
}

impl Needed {
    /// Creates `Needed` instance, returns `Needed::Unknown` if the argument is zero
    pub fn new(s: usize) -> Self {
        match NonZeroUsize::new(s) {
            Some(sz) => Needed::Size(sz),
            None => Needed::Unknown,
        }
    }

    /// Indicates if we know how many bytes we need
    pub fn is_known(&self) -> bool {
        *self != Needed::Unknown
    }

    /// Maps a `Needed` to `Needed` by applying a function to a contained `Size` value.
    #[inline]
    pub fn map<F: Fn(NonZeroUsize) -> usize>(self, f: F) -> Needed {
        match self {
            Needed::Unknown => Needed::Unknown,
            Needed::Size(n) => Needed::new(f(n)),
        }
    }
}

/// Add parse error state to [`ParserError`]s
///
/// Needed for
/// - [`Partial`][crate::stream::Partial] to track whether the [`Stream`] is [`ErrMode::Incomplete`].
///   See also [`crate::_topic::partial`]
/// - Marking errors as unrecoverable ([`ErrMode::Cut`]) and not retrying alternative parsers.
///   See also [`crate::_tutorial::chapter_7#error-cuts`]
#[derive(Debug, Clone, PartialEq)]
pub enum ErrMode<E> {
    /// There was not enough data to determine the appropriate action
    ///
    /// More data needs to be buffered before retrying the parse.
    ///
    /// This must only be set when the [`Stream`] is [partial][`crate::stream::StreamIsPartial`], like with
    /// [`Partial`][crate::Partial]
    ///
    /// Convert this into an `Backtrack` with [`Parser::complete_err`]
    Incomplete(Needed),
    /// The parser failed with a recoverable error (the default).
    ///
    /// For example, a parser for json values might include a
    /// [`dec_uint`][crate::ascii::dec_uint] as one case in an [`alt`][crate::combinator::alt]
    /// combinator. If it fails, the next case should be tried.
    Backtrack(E),
    /// The parser had an unrecoverable error.
    ///
    /// The parser was on the right branch, so directly report it to the user rather than trying
    /// other branches. You can use [`cut_err()`][crate::combinator::cut_err] combinator to switch
    /// from `ErrMode::Backtrack` to `ErrMode::Cut`.
    ///
    /// For example, one case in an [`alt`][crate::combinator::alt] combinator found a unique prefix
    /// and you want any further errors parsing the case to be reported to the user.
    Cut(E),
}

impl<E> ErrMode<E> {
    /// 
```

---

# OUTRO - error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\error.rs
**SHA:** 9a4652846edefe04
**Timestamp:** 2026-08-28T02:37:40.703955
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn append(self, input: &I, token_start: &<I as Stream>::Checkpoint) -> Self {
- fn add_context(self, input: &I, token_start: &<I as Stream>::Checkpoint, context: C) -> Self {
- token_start: &<I as Stream>::Checkpoint,
- err_start: &<I as Stream>::Checkpoint,
- fn append(self, _input: &I, _token_start: &<I as Stream>::Checkpoint) -> Self {
- _token_start: &<I as Stream>::Checkpoint,
- token_start: &<I as Stream>::Checkpoint,
- err_start: &<I as Stream>::Checkpoint,
- _token_start: &<I as Stream>::Checkpoint,
- _err_start: &<I as Stream>::Checkpoint,

### Ouro Bruto (primeiros 5000 chars)
```
//! # Error management
//!
//! Errors are designed with multiple needs in mind:
//! - Accumulate more [context][Parser::context] as the error goes up the parser chain
//! - Distinguish between [recoverable errors,
//!   unrecoverable errors, and more data is needed][ErrMode]
//! - Have a very low overhead, as errors are often discarded by the calling parser (examples: `repeat`, `alt`)
//! - Can be modified according to the user's needs, because some languages need a lot more information
//! - Help thread-through the [stream][crate::stream]
//!
//! To abstract these needs away from the user, generally `winnow` parsers use the [`ModalResult`]
//! alias, rather than [`Result`].  [`Parser::parse`] is a top-level operation
//! that can help convert to a `Result` for integrating with your application's error reporting.
//!
//! Error types include:
//! - [`EmptyError`] when the reason for failure doesn't matter
//! - [`ContextError`]
//! - [`InputError`] (mostly for testing)
//! - [`TreeError`] (mostly for testing)
//! - [Custom errors][crate::_topic::error]

#[cfg(feature = "alloc")]
use alloc::borrow::ToOwned;
use core::fmt;

#[cfg(feature = "binary")]
use crate::binary::bits::Bits;
use crate::stream::AsBStr;
use crate::stream::Stream;
#[allow(unused_imports)] // Here for intra-doc links
use crate::Parser;

pub use crate::stream::Needed;

/// By default, the error type (`E`) is [`ContextError`].
///
/// When integrating into the result of the application, see
/// - [`Parser::parse`]
/// - [`ParserError::into_inner`]
pub type Result<O, E = ContextError> = core::result::Result<O, E>;

/// [Modal error reporting][ErrMode] for [`Parser::parse_next`]
///
/// - `Ok(O)` is the parsed value
/// - [`Err(ErrMode<E>)`][ErrMode] is the error along with how to respond to it
///
/// By default, the error type (`E`) is [`ContextError`].
///
/// When integrating into the result of the application, see
/// - [`Parser::parse`]
/// - [`ParserError::into_inner`]
pub type ModalResult<O, E = ContextError> = Result<O, ErrMode<E>>;

#[cfg(test)]
pub(crate) type TestResult<I, O> = ModalResult<O, InputError<I>>;

/// Add parse error state to [`ParserError`]s
///
/// Needed for
/// - [`Partial`][crate::stream::Partial] to track whether the [`Stream`] is [`ErrMode::Incomplete`].
///   See also [`crate::_topic::partial`]
/// - Marking errors as unrecoverable ([`ErrMode::Cut`]) and not retrying alternative parsers.
///   See also [`crate::_tutorial::chapter_7#error-cuts`]
#[derive(Debug, Clone, PartialEq)]
pub enum ErrMode<E> {
    /// There was not enough data to determine the appropriate action
    ///
    /// More data needs to be buffered before retrying the parse.
    ///
    /// This must only be set when the [`Stream`] is [partial][`crate::stream::StreamIsPartial`], like with
    /// [`Partial`][crate::Partial]
    ///
    /// Convert this into an `Backtrack` with [`Parser::complete_err`]
    Incomplete(Needed),
    /// The parser failed with a recoverable error (the default).
    ///
    /// For example, a parser for json values might include a
    /// [`dec_uint`][crate::ascii::dec_uint] as one case in an [`alt`][crate::combinator::alt]
    /// combinator. If it fails, the next case should be tried.
    Backtrack(E),
    /// The parser had an unrecoverable error.
    ///
    /// The parser was on the right branch, so directly report it to the user rather than trying
    /// other branches. You can use [`cut_err()`][crate::combinator::cut_err] combinator to switch
    /// from `ErrMode::Backtrack` to `ErrMode::Cut`.
    ///
    /// For example, one case in an [`alt`][crate::combinator::alt] combinator found a unique prefix
    /// and you want any further errors parsing the case to be reported to the user.
    Cut(E),
}

impl<E> ErrMode<E> {
    /// Tests if the result is Incomplete
    #[inline]
    pub fn is_incomplete(&self) -> bool {
        matches!(self, ErrMode::Incomplete(_))
    }

    /// Prevent backtracking, bubbling the error up to the top
    pub fn cut(self) -> Self {
        match self {
            ErrMode::Backtrack(e) => ErrMode::Cut(e),
            rest => rest,
        }
    }

    /// Enable backtracking support
    pub fn backtrack(self) -> Self {
        match self {
            ErrMode::Cut(e) => ErrMode::Backtrack(e),
            rest => rest,
        }
    }

    /// Applies the given function to the inner error
    pub fn map<E2, F>(self, f: F) -> ErrMode<E2>
    where
        F: FnOnce(E) -> E2,
    {
        match self {
            ErrMode::Incomplete(n) => ErrMode::Incomplete(n),
            ErrMode::Cut(t) => ErrMode::Cut(f(t)),
            ErrMode::Backtrack(t) => ErrMode::Backtrack(f(t)),
        }
    }

    /// Automatically converts between errors if the underlying type supports it
    pub fn convert<F>(self) -> ErrMode<F>
    where
        E: ErrorConvert<F>,
    {
        ErrorConvert::convert(self)
    }

    /// Unwrap the mode, returning the underlying error
    ///
    /// Returns `Err(self
```