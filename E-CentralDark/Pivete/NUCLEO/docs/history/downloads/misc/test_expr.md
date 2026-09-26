# OUTRO - test_expr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-2.0.119\tests\test_expr.rs
**SHA:** 055cb9b33a5bb6ed
**Timestamp:** 2026-08-28T02:35:47.410229
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Some(Expr::Tuple),
- start: Some(Expr::Path {
- start: Some(Expr::Tuple),
- start: Some(Expr::Tuple),
- start: None,
- start: None,
- start: Some(Box::new(expr)),

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg(not(miri))]
#![recursion_limit = "1024"]
#![feature(rustc_private)]
#![allow(
    clippy::elidable_lifetime_names,
    clippy::match_like_matches_macro,
    clippy::needless_lifetimes,
    clippy::single_element_loop,
    clippy::too_many_lines,
    clippy::uninlined_format_args,
    clippy::unreadable_literal
)]

#[macro_use]
mod macros;
#[macro_use]
mod snapshot;

mod common;
mod debug;

use crate::common::visit::{AsIfPrinted, FlattenParens};
use proc_macro2::{Delimiter, Group, Ident, Span, TokenStream};
use quote::{quote, ToTokens as _};
use std::process::ExitCode;
use syn::punctuated::Punctuated;
use syn::visit_mut::VisitMut as _;
use syn::{
    parse_quote, token, AngleBracketedGenericArguments, Arm, BinOp, Block, Expr, ExprArray,
    ExprAssign, ExprAsync, ExprAwait, ExprBinary, ExprBlock, ExprBreak, ExprCall, ExprCast,
    ExprClosure, ExprConst, ExprContinue, ExprField, ExprForLoop, ExprIf, ExprIndex, ExprLet,
    ExprLit, ExprLoop, ExprMacro, ExprMatch, ExprMethodCall, ExprPath, ExprRange, ExprRawAddr,
    ExprReference, ExprReturn, ExprStruct, ExprTry, ExprTryBlock, ExprTuple, ExprUnary, ExprUnsafe,
    ExprWhile, ExprYield, GenericArgument, Label, Lifetime, Lit, LitInt, Macro, MacroDelimiter,
    Member, Pat, PatWild, Path, PathArguments, PathSegment, PointerMutability, QSelf, RangeLimits,
    ReturnType, Stmt, Token, Type, TypePath, UnOp,
};

#[test]
fn test_expr_parse() {
    let tokens = quote!(..100u32);
    snapshot!(tokens as Expr, @r#"
    Expr::Range {
        limits: RangeLimits::HalfOpen,
        end: Some(Expr::Lit {
            lit: 100u32,
        }),
    }
    "#);

    let tokens = quote!(..100u32);
    snapshot!(tokens as ExprRange, @r#"
    ExprRange {
        limits: RangeLimits::HalfOpen,
        end: Some(Expr::Lit {
            lit: 100u32,
        }),
    }
    "#);
}

#[test]
fn test_await() {
    // Must not parse as Expr::Field.
    let tokens = quote!(fut.await);

    snapshot!(tokens as Expr, @r#"
    Expr::Await {
        base: Expr::Path {
            path: Path {
                segments: [
                    PathSegment {
                        ident: "fut",
                    },
                ],
            },
        },
    }
    "#);
}

#[rustfmt::skip]
#[test]
fn test_tuple_multi_index() {
    let expected = snapshot!("tuple.0.0" as Expr, @r#"
    Expr::Field {
        base: Expr::Field {
            base: Expr::Path {
                path: Path {
                    segments: [
                        PathSegment {
                            ident: "tuple",
                        },
                    ],
                },
            },
            member: Member::Unnamed(Index {
                index: 0,
            }),
        },
        member: Member::Unnamed(Index {
            index: 0,
        }),
    }
    "#);

    for &input in &[
        "tuple .0.0",
        "tuple. 0.0",
        "tuple.0 .0",
        "tuple.0. 0",
        "tuple . 0 . 0",
    ] {
        assert_eq!(expected, syn::parse_str(input).unwrap());
    }

    for tokens in [
        quote!(tuple.0.0),
        quote!(tuple .0.0),
        quote!(tuple. 0.0),
        quote!(tuple.0 .0),
        quote!(tuple.0. 0),
        quote!(tuple . 0 . 0),
    ] {
        assert_eq!(expected, syn::parse2(tokens).unwrap());
    }
}

#[test]
fn test_macro_variable_func() {
    // mimics the token stream corresponding to `$fn()`
    let path = Group::new(Delimiter::None, quote!(f));
    let tokens = quote!(#path());

    snapshot!(tokens as Expr, @r#"
    Expr::Call {
        func: Expr::Group {
            expr: Expr::Path {
                path: Path {
                    segments: [
                        PathSegment {
                            ident: "f",
                        },
                    ],
                },
            },
        },
    }
    "#);

    let path = Group::new(Delimiter::None, quote! { #[inside] f });
    let tokens = quote!(#[outside] #path());

    snapshot!(tokens as Expr, @r#"
    Expr::Call {
        attrs: [
            Attribute {
                style: AttrStyle::Outer,
                meta: Meta::Path {
                    segments: [
                        PathSegment {
                            ident: "outside",
                        },
                    ],
                },
            },
        ],
        func: Expr::Group {
            expr: Expr::Path {
                attrs: [
                    Attribute {
                        style: AttrStyle::Outer,
                        meta: Meta::Path {
                            segments: [
                                PathSegment {
                                    ident: "inside",
                                },
                            ],
                        },
                    },
                ],
                path: Path {
                    segments: [
                        PathSegment {
                            ident: "f",
                        },

```

---

# OUTRO - test_expr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-3.0.3\tests\test_expr.rs
**SHA:** 8fde868c1cbfbf48
**Timestamp:** 2026-08-28T02:35:49.180422
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Some(Expr::Tuple),
- start: Some(Expr::Path {
- start: Some(Expr::Tuple),
- start: Some(Expr::Tuple),
- start: None,
- start: None,
- start: Some(Box::new(expr)),

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg(not(miri))]
#![recursion_limit = "1024"]
#![feature(rustc_private)]
#![allow(
    clippy::elidable_lifetime_names,
    clippy::match_like_matches_macro,
    clippy::needless_lifetimes,
    clippy::single_element_loop,
    clippy::too_many_lines,
    clippy::uninlined_format_args,
    clippy::unreadable_literal
)]

#[macro_use]
mod macros;
#[macro_use]
mod snapshot;

mod common;
mod debug;

use crate::common::visit::{AsIfPrinted, FlattenParens};
use proc_macro2::{Delimiter, Group, Ident, Span, TokenStream};
use quote::{quote, ToTokens as _};
use std::process::ExitCode;
use syn::punctuated::Punctuated;
use syn::visit_mut::VisitMut as _;
use syn::{
    parse_quote, token, AngleBracketedGenericArguments, Arm, BinOp, Block, BlockModifiers,
    ClosureModifiers, Expr, ExprArray, ExprAssign, ExprAsync, ExprAwait, ExprBinary, ExprBlock,
    ExprBreak, ExprCall, ExprCast, ExprClosure, ExprConst, ExprContinue, ExprField, ExprForLoop,
    ExprIf, ExprIndex, ExprLet, ExprLit, ExprLoop, ExprMacro, ExprMatch, ExprMethodCall, ExprPath,
    ExprRange, ExprRawAddr, ExprReference, ExprReturn, ExprStruct, ExprTry, ExprTryBlock,
    ExprTuple, ExprUnary, ExprUnsafe, ExprWhile, ExprYield, GenericArgument, Label, Lifetime, Lit,
    LitInt, Macro, MacroDelimiter, Member, Pat, PatGuard, PatWild, Path, PathArguments,
    PathSegment, PointerMutability, QSelf, RangeLimits, ReturnType, Stmt, Token, Type, TypePath,
    UnOp,
};

#[test]
fn test_expr_parse() {
    let tokens = quote!(..100u32);
    snapshot!(tokens as Expr, @r#"
    Expr::Range {
        limits: RangeLimits::HalfOpen,
        end: Some(Expr::Lit {
            lit: 100u32,
        }),
    }
    "#);

    let tokens = quote!(..100u32);
    snapshot!(tokens as ExprRange, @r#"
    ExprRange {
        limits: RangeLimits::HalfOpen,
        end: Some(Expr::Lit {
            lit: 100u32,
        }),
    }
    "#);
}

#[test]
fn test_await() {
    // Must not parse as Expr::Field.
    let tokens = quote!(fut.await);

    snapshot!(tokens as Expr, @r#"
    Expr::Await {
        base: Expr::Path {
            path: Path {
                segments: [
                    PathSegment {
                        ident: "fut",
                    },
                ],
            },
        },
    }
    "#);
}

#[rustfmt::skip]
#[test]
fn test_tuple_multi_index() {
    let expected = snapshot!("tuple.0.0" as Expr, @r#"
    Expr::Field {
        base: Expr::Field {
            base: Expr::Path {
                path: Path {
                    segments: [
                        PathSegment {
                            ident: "tuple",
                        },
                    ],
                },
            },
            member: Member::Unnamed(Index {
                index: 0,
            }),
        },
        member: Member::Unnamed(Index {
            index: 0,
        }),
    }
    "#);

    for &input in &[
        "tuple .0.0",
        "tuple. 0.0",
        "tuple.0 .0",
        "tuple.0. 0",
        "tuple . 0 . 0",
    ] {
        assert_eq!(expected, syn::parse_str(input).unwrap());
    }

    for tokens in [
        quote!(tuple.0.0),
        quote!(tuple .0.0),
        quote!(tuple. 0.0),
        quote!(tuple.0 .0),
        quote!(tuple.0. 0),
        quote!(tuple . 0 . 0),
    ] {
        assert_eq!(expected, syn::parse2(tokens).unwrap());
    }
}

#[test]
fn test_macro_variable_func() {
    // mimics the token stream corresponding to `$fn()`
    let path = Group::new(Delimiter::None, quote!(f));
    let tokens = quote!(#path());

    snapshot!(tokens as Expr, @r#"
    Expr::Call {
        func: Expr::Group {
            expr: Expr::Path {
                path: Path {
                    segments: [
                        PathSegment {
                            ident: "f",
                        },
                    ],
                },
            },
        },
    }
    "#);

    let path = Group::new(Delimiter::None, quote! { #[inside] f });
    let tokens = quote!(#[outside] #path());

    snapshot!(tokens as Expr, @r#"
    Expr::Call {
        attrs: [
            Attribute {
                style: AttrStyle::Outer,
                meta: Meta::Path {
                    segments: [
                        PathSegment {
                            ident: "outside",
                        },
                    ],
                },
            },
        ],
        func: Expr::Group {
            expr: Expr::Path {
                attrs: [
                    Attribute {
                        style: AttrStyle::Outer,
                        meta: Meta::Path {
                            segments: [
                                PathSegment {
                                    ident: "inside",
                                },
                            ],
                        },
                    },
                ],
                path: Path {
                    segments: [
                        PathSegment {
                   
```