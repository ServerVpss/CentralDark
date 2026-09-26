# OUTRO - source.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml_parser-1.1.3+spec-1.1.0\src\source.rs
**SHA:** 88f17fc3876bc219
**Timestamp:** 2026-08-28T02:36:26.725196
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: usize,
- pub fn new_unchecked(start: usize, end: usize) -> Self {
- start: self.start + offset,
- start: span.start + self,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::ErrorSink;
use crate::Expected;
use crate::decoder::Encoding;
use crate::decoder::StringBuilder;
use crate::lexer::Lexer;

/// Data encoded as TOML
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Source<'i> {
    input: &'i str,
}

impl<'i> Source<'i> {
    pub fn new(input: &'i str) -> Self {
        Self { input }
    }

    /// Start lexing the TOML encoded data
    pub fn lex(&self) -> Lexer<'i> {
        Lexer::new(self.input)
    }

    /// Access the TOML encoded `&str`
    pub fn input(&self) -> &'i str {
        self.input
    }

    /// Return a subslice of the input
    pub fn get(&self, span: impl SourceIndex) -> Option<Raw<'i>> {
        span.get(self)
    }

    /// Return an unchecked subslice of the input
    ///
    /// ## Safety
    ///
    /// Callers of this function are responsible that these preconditions are satisfied:
    /// - The starting index must not exceed the ending index;
    /// - Indexes must be within bounds of the original slice;
    /// - Indexes must lie on UTF-8 sequence boundaries.
    ///
    /// Or one of:
    /// - `span` came from [`Source::lex`]
    ///
    /// Failing any of those, the returned string slice may reference invalid memory or violate the invariants communicated by `str` type.
    #[cfg(feature = "unsafe")]
    pub unsafe fn get_unchecked(&self, span: impl SourceIndex) -> Raw<'i> {
        // SAFETY: Same safety guarantees are required
        unsafe { span.get_unchecked(self) }
    }

    /// Return a subslice of the input
    fn get_raw_str(&self, span: Span) -> Option<&'i str> {
        let index = span.start()..span.end();
        self.input.get(index)
    }

    /// Return an unchecked subslice of the input
    ///
    /// ## Safety
    ///
    /// Callers of this function are responsible that these preconditions are satisfied:
    /// - The starting index must not exceed the ending index;
    /// - Indexes must be within bounds of the original slice;
    /// - Indexes must lie on UTF-8 sequence boundaries.
    ///
    /// Or one of:
    /// - `span` came from [`Source::lex`]
    ///
    /// Failing any of those, the returned string slice may reference invalid memory or violate the invariants communicated by `str` type.
    #[cfg(feature = "unsafe")]
    unsafe fn get_raw_str_unchecked(&self, span: Span) -> &'i str {
        let index = span.start()..span.end();
        // SAFETY: Same safety guarantees are required
        unsafe { self.input.get_unchecked(index) }
    }
}

/// A slice of [`Source`]
#[derive(Copy, Clone, Debug)]
pub struct Raw<'i> {
    raw: &'i str,
    encoding: Option<Encoding>,
    span: Span,
}

impl<'i> Raw<'i> {
    pub fn new_unchecked(raw: &'i str, encoding: Option<Encoding>, span: Span) -> Self {
        Self {
            raw,
            encoding,
            span,
        }
    }

    pub fn decode_key(&self, output: &mut dyn StringBuilder<'i>, error: &mut dyn ErrorSink) {
        let mut error = |err: crate::ParseError| {
            error.report_error(err.rebase_spans(self.span.start));
        };
        match self.encoding {
            Some(Encoding::LiteralString) => {
                crate::decoder::string::decode_literal_string(*self, output, &mut error);
            }
            Some(Encoding::BasicString) => {
                crate::decoder::string::decode_basic_string(*self, output, &mut error);
            }
            Some(Encoding::MlLiteralString) => {
                error.report_error(
                    crate::ParseError::new("keys cannot be multi-line literal strings")
                        .with_expected(&[
                            Expected::Description("basic string"),
                            Expected::Description("literal string"),
                        ])
                        .with_unexpected(Span::new_unchecked(0, self.len())),
                );
                crate::decoder::string::decode_ml_literal_string(*self, output, &mut error);
            }
            Some(Encoding::MlBasicString) => {
                error.report_error(
                    crate::ParseError::new("keys cannot be multi-line basic strings")
                        .with_expected(&[
                            Expected::Description("basic string"),
                            Expected::Description("literal string"),
                        ])
                        .with_unexpected(Span::new_unchecked(0, self.len())),
                );
                crate::decoder::string::decode_ml_basic_string(*self, output, &mut error);
            }
            None => crate::decoder::string::decode_unquoted_key(*self, output, &mut error),
        }
    }

    #[must_use]
    pub fn decode_scalar(
        &self,
        output: &mut dyn StringBuilder<'i>,
        error: &mut dyn ErrorSink,
    ) -> crate::decoder::scalar::ScalarKind {
        let mut error = |err: crate::ParseError| {
            error.report_error(err.rebase_spans(self.span.start));
        };
        match self.encoding 
```