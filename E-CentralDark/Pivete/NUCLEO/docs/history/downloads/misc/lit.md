# OUTRO - lit.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-2.0.119\src\lit.rs
**SHA:** 3be54784de36d2d8
**Timestamp:** 2026-08-28T02:35:46.567659
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = (*bytes.first()? == b'-') as usize;

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "parsing")]
use crate::ext::TokenStreamExt as _;
#[cfg(feature = "parsing")]
use crate::lookahead;
#[cfg(feature = "parsing")]
use crate::parse::{Parse, Parser};
use crate::{Error, Result};
use alloc::boxed::Box;
use alloc::ffi::CString;
#[cfg(feature = "parsing")]
use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;
use core::ffi::CStr;
use core::fmt::{self, Display};
#[cfg(feature = "extra-traits")]
use core::hash::{Hash, Hasher};
use core::str::{self, FromStr};
use proc_macro2::{Ident, Literal, Span};
#[cfg(feature = "parsing")]
use proc_macro2::{TokenStream, TokenTree};

ast_enum_of_structs! {
    /// A Rust literal such as a string or integer or boolean.
    ///
    /// # Syntax tree enum
    ///
    /// This type is a [syntax tree enum].
    ///
    /// [syntax tree enum]: crate::expr::Expr#syntax-tree-enums
    #[non_exhaustive]
    pub enum Lit {
        /// A UTF-8 string literal: `"foo"`.
        Str(LitStr),

        /// A byte string literal: `b"foo"`.
        ByteStr(LitByteStr),

        /// A nul-terminated C-string literal: `c"foo"`.
        CStr(LitCStr),

        /// A byte literal: `b'f'`.
        Byte(LitByte),

        /// A character literal: `'a'`.
        Char(LitChar),

        /// An integer literal: `1` or `1u16`.
        Int(LitInt),

        /// A floating point literal: `1f64` or `1.0e10f64`.
        ///
        /// Must be finite. May not be infinite or NaN.
        Float(LitFloat),

        /// A boolean literal: `true` or `false`.
        Bool(LitBool),

        /// A raw token literal not interpreted by Syn.
        Verbatim(Literal),
    }
}

ast_struct! {
    /// A UTF-8 string literal: `"foo"`.
    pub struct LitStr {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A byte string literal: `b"foo"`.
    pub struct LitByteStr {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A nul-terminated C-string literal: `c"foo"`.
    pub struct LitCStr {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A byte literal: `b'f'`.
    pub struct LitByte {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A character literal: `'a'`.
    pub struct LitChar {
        repr: Box<LitRepr>,
    }
}

struct LitRepr {
    token: Literal,
    suffix: Box<str>,
}

ast_struct! {
    /// An integer literal: `1` or `1u16`.
    pub struct LitInt {
        repr: Box<LitIntRepr>,
    }
}

struct LitIntRepr {
    token: Literal,
    digits: Box<str>,
    suffix: Box<str>,
}

ast_struct! {
    /// A floating point literal: `1f64` or `1.0e10f64`.
    ///
    /// Must be finite. May not be infinite or NaN.
    pub struct LitFloat {
        repr: Box<LitFloatRepr>,
    }
}

struct LitFloatRepr {
    token: Literal,
    digits: Box<str>,
    suffix: Box<str>,
}

ast_struct! {
    /// A boolean literal: `true` or `false`.
    pub struct LitBool {
        pub value: bool,
        pub span: Span,
    }
}

impl LitStr {
    pub fn new(value: &str, span: Span) -> Self {
        let mut token = Literal::string(value);
        token.set_span(span);
        LitStr {
            repr: Box::new(LitRepr {
                token,
                suffix: Box::<str>::default(),
            }),
        }
    }

    pub fn value(&self) -> String {
        let repr = self.repr.token.to_string();
        let (value, _suffix) = value::parse_lit_str(&repr).unwrap();
        String::from(value)
    }

    /// Parse a syntax tree node from the content of this string literal.
    ///
    /// All spans in the syntax tree will point to the span of this `LitStr`.
    ///
    /// # Example
    ///
    /// ```
    /// use syn::{Attribute, Error, Expr, Lit, Meta, Path, Result};
    ///
    /// // Parses the path from an attribute that looks like:
    /// //
    /// //     #[path = "a::b::c"]
    /// //
    /// // or returns `None` if the input is some other attribute.
    /// fn get_path(attr: &Attribute) -> Result<Option<Path>> {
    ///     if !attr.path().is_ident("path") {
    ///         return Ok(None);
    ///     }
    ///
    ///     if let Meta::NameValue(meta) = &attr.meta {
    ///         if let Expr::Lit(expr) = &meta.value {
    ///             if let Lit::Str(lit_str) = &expr.lit {
    ///                 return lit_str.parse().map(Some);
    ///             }
    ///         }
    ///     }
    ///
    ///     let message = "expected #[path = \"...\"]";
    ///     Err(Error::new_spanned(attr, message))
    /// }
    /// ```
    #[cfg(feature = "parsing")]
    #[cfg_attr(docsrs, doc(cfg(feature = "parsing")))]
    pub fn parse<T: Parse>(&self) -> Result<T> {
        self.parse_with(T::parse)
    }

    /// Invoke parser on the content of this string literal.
    ///
    /// All spans in the syntax tree will point to the span of this `LitStr`.
    ///
    /// # Example
    ///
    /// ```
    /// # use proc_macro2::Span;
    /// # use syn::{LitStr, Result};
    /// #
    /// # fn main() -> Result<()> {
    /// #     let lit_str = LitStr::new("a
```

---

# OUTRO - lit.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-3.0.3\src\lit.rs
**SHA:** b4afa58a52cba945
**Timestamp:** 2026-08-28T02:35:48.516868
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = (*bytes.first()? == b'-') as usize;

### Ouro Bruto (primeiros 5000 chars)
```
#[cfg(feature = "parsing")]
use crate::ext::TokenStreamExt as _;
#[cfg(feature = "parsing")]
use crate::lookahead;
#[cfg(feature = "parsing")]
use crate::parse::{Parse, Parser};
use crate::{Error, Result};
use alloc::boxed::Box;
use alloc::ffi::CString;
#[cfg(feature = "parsing")]
use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;
use core::ffi::CStr;
use core::fmt::{self, Display};
#[cfg(feature = "extra-traits")]
use core::hash::{Hash, Hasher};
use core::str::{self, FromStr};
use proc_macro2::{Ident, Literal, Span};
#[cfg(feature = "parsing")]
use proc_macro2::{TokenStream, TokenTree};

ast_enum_of_structs! {
    /// A Rust literal such as a string or integer or boolean.
    ///
    /// # Syntax tree enum
    ///
    /// This type is a [syntax tree enum].
    ///
    /// [syntax tree enum]: crate::expr::Expr#syntax-tree-enums
    #[non_exhaustive]
    pub enum Lit {
        /// A UTF-8 string literal: `"foo"`.
        Str(LitStr),

        /// A byte string literal: `b"foo"`.
        ByteStr(LitByteStr),

        /// A nul-terminated C-string literal: `c"foo"`.
        CStr(LitCStr),

        /// A byte literal: `b'f'`.
        Byte(LitByte),

        /// A character literal: `'a'`.
        Char(LitChar),

        /// An integer literal: `1` or `1u16`.
        Int(LitInt),

        /// A floating point literal: `1f64` or `1.0e10f64`.
        ///
        /// Must be finite. May not be infinite or NaN.
        Float(LitFloat),

        /// A boolean literal: `true` or `false`.
        Bool(LitBool),

        /// A raw token literal not interpreted by Syn.
        Verbatim(Literal),
    }
}

ast_struct! {
    /// A UTF-8 string literal: `"foo"`.
    pub struct LitStr {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A byte string literal: `b"foo"`.
    pub struct LitByteStr {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A nul-terminated C-string literal: `c"foo"`.
    pub struct LitCStr {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A byte literal: `b'f'`.
    pub struct LitByte {
        repr: Box<LitRepr>,
    }
}

ast_struct! {
    /// A character literal: `'a'`.
    pub struct LitChar {
        repr: Box<LitRepr>,
    }
}

struct LitRepr {
    token: Literal,
    suffix: Box<str>,
}

ast_struct! {
    /// An integer literal: `1` or `1u16`.
    pub struct LitInt {
        repr: Box<LitIntRepr>,
    }
}

struct LitIntRepr {
    token: Literal,
    digits: Box<str>,
    suffix: Box<str>,
}

ast_struct! {
    /// A floating point literal: `1f64` or `1.0e10f64`.
    ///
    /// Must be finite. May not be infinite or NaN.
    pub struct LitFloat {
        repr: Box<LitFloatRepr>,
    }
}

struct LitFloatRepr {
    token: Literal,
    digits: Box<str>,
    suffix: Box<str>,
}

ast_struct! {
    /// A boolean literal: `true` or `false`.
    pub struct LitBool {
        pub value: bool,
        pub span: Span,
    }
}

impl LitStr {
    pub fn new(value: &str, span: Span) -> Self {
        let mut token = Literal::string(value);
        token.set_span(span);
        LitStr {
            repr: Box::new(LitRepr {
                token,
                suffix: Box::<str>::default(),
            }),
        }
    }

    pub fn value(&self) -> String {
        let repr = self.repr.token.to_string();
        let (value, _suffix) = value::parse_lit_str(&repr).unwrap();
        String::from(value)
    }

    /// Parse a syntax tree node from the content of this string literal.
    ///
    /// All spans in the syntax tree will point to the span of this `LitStr`.
    ///
    /// # Example
    ///
    /// ```
    /// use syn::{Attribute, Error, Expr, Lit, Meta, Path, Result};
    ///
    /// // Parses the path from an attribute that looks like:
    /// //
    /// //     #[path = "a::b::c"]
    /// //
    /// // or returns `None` if the input is some other attribute.
    /// fn get_path(attr: &Attribute) -> Result<Option<Path>> {
    ///     if !attr.path().is_ident("path") {
    ///         return Ok(None);
    ///     }
    ///
    ///     if let Meta::NameValue(meta) = &attr.meta {
    ///         if let Expr::Lit(expr) = &meta.value {
    ///             if let Lit::Str(lit_str) = &expr.lit {
    ///                 return lit_str.parse().map(Some);
    ///             }
    ///         }
    ///     }
    ///
    ///     let message = "expected #[path = \"...\"]";
    ///     Err(Error::new_spanned(attr, message))
    /// }
    /// ```
    #[cfg(feature = "parsing")]
    #[cfg_attr(docsrs, doc(cfg(feature = "parsing")))]
    pub fn parse<T: Parse>(&self) -> Result<T> {
        self.parse_with(T::parse)
    }

    /// Invoke parser on the content of this string literal.
    ///
    /// All spans in the syntax tree will point to the span of this `LitStr`.
    ///
    /// # Example
    ///
    /// ```
    /// # use proc_macro2::Span;
    /// # use syn::{LitStr, Result};
    /// #
    /// # fn main() -> Result<()> {
    /// #     let lit_str = LitStr::new("a
```