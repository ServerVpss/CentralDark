# OUTRO - scan_expr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-2.0.119\src\scan_expr.rs
**SHA:** 1afda43a7f4e9d42
**Timestamp:** 2026-08-28T02:35:46.756493
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- static PATTERN: [(Input, Action); 15] = [

### Ouro Bruto (primeiros 5000 chars)
```
use self::{Action::*, Input::*};
use proc_macro2::{Delimiter, Ident, Spacing, TokenTree};
use syn::parse::{ParseStream, Result};
#[allow(unused_imports)]
//#[cfg_attr(not(test), expect(unused_imports))] // Rust 1.81+
use syn::Token;
use syn::{AngleBracketedGenericArguments, BinOp, Expr, ExprPath, Lifetime, Lit, Type};

enum Input {
    Keyword(&'static str),
    Punct(&'static str),
    ConsumeAny,
    ConsumeBinOp,
    ConsumeBrace,
    ConsumeDelimiter,
    ConsumeIdent,
    ConsumeLifetime,
    ConsumeLiteral,
    ConsumeNestedBrace,
    ExpectPath,
    ExpectTurbofish,
    ExpectType,
    CanBeginExpr,
    Otherwise,
    Empty,
}

enum Action {
    SetState(&'static [(Input, Action)]),
    IncDepth,
    DecDepth,
    Finish,
}

static INIT: [(Input, Action); 29] = [
    (ConsumeDelimiter, SetState(&POSTFIX)),
    (Keyword("async"), SetState(&ASYNC)),
    (Keyword("break"), SetState(&BREAK_LABEL)),
    (Keyword("const"), SetState(&CONST)),
    (Keyword("continue"), SetState(&CONTINUE)),
    (Keyword("for"), SetState(&FOR)),
    (Keyword("if"), IncDepth),
    (Keyword("let"), SetState(&PATTERN)),
    (Keyword("loop"), SetState(&BLOCK)),
    (Keyword("match"), IncDepth),
    (Keyword("move"), SetState(&CLOSURE)),
    (Keyword("return"), SetState(&RETURN)),
    (Keyword("static"), SetState(&CLOSURE)),
    (Keyword("try"), SetState(&BLOCK)),
    (Keyword("unsafe"), SetState(&BLOCK)),
    (Keyword("while"), IncDepth),
    (Keyword("yield"), SetState(&RETURN)),
    (Keyword("_"), SetState(&POSTFIX)),
    (Punct("!"), SetState(&INIT)),
    (Punct("#"), SetState(&[(ConsumeDelimiter, SetState(&INIT))])),
    (Punct("&"), SetState(&REFERENCE)),
    (Punct("*"), SetState(&INIT)),
    (Punct("-"), SetState(&INIT)),
    (Punct("..="), SetState(&INIT)),
    (Punct(".."), SetState(&RANGE)),
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeLifetime, SetState(&[(Punct(":"), SetState(&INIT))])),
    (ConsumeLiteral, SetState(&POSTFIX)),
    (ExpectPath, SetState(&PATH)),
];

static POSTFIX: [(Input, Action); 10] = [
    (Keyword("as"), SetState(&[(ExpectType, SetState(&POSTFIX))])),
    (Punct("..="), SetState(&INIT)),
    (Punct(".."), SetState(&RANGE)),
    (Punct("."), SetState(&DOT)),
    (Punct("?"), SetState(&POSTFIX)),
    (ConsumeBinOp, SetState(&INIT)),
    (Punct("="), SetState(&INIT)),
    (ConsumeNestedBrace, SetState(&IF_THEN)),
    (ConsumeDelimiter, SetState(&POSTFIX)),
    (Empty, Finish),
];

static ASYNC: [(Input, Action); 3] = [
    (Keyword("move"), SetState(&ASYNC)),
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeBrace, SetState(&POSTFIX)),
];

static BLOCK: [(Input, Action); 1] = [(ConsumeBrace, SetState(&POSTFIX))];

static BREAK_LABEL: [(Input, Action); 2] = [
    (ConsumeLifetime, SetState(&BREAK_VALUE)),
    (Otherwise, SetState(&BREAK_VALUE)),
];

static BREAK_VALUE: [(Input, Action); 3] = [
    (ConsumeNestedBrace, SetState(&IF_THEN)),
    (CanBeginExpr, SetState(&INIT)),
    (Otherwise, SetState(&POSTFIX)),
];

static CLOSURE: [(Input, Action); 7] = [
    (Keyword("async"), SetState(&CLOSURE)),
    (Keyword("move"), SetState(&CLOSURE)),
    (Punct(","), SetState(&CLOSURE)),
    (Punct(">"), SetState(&CLOSURE)),
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeLifetime, SetState(&CLOSURE)),
    (ConsumeIdent, SetState(&CLOSURE)),
];

static CLOSURE_ARGS: [(Input, Action); 2] = [
    (Punct("|"), SetState(&CLOSURE_RET)),
    (ConsumeAny, SetState(&CLOSURE_ARGS)),
];

static CLOSURE_RET: [(Input, Action); 2] = [
    (Punct("->"), SetState(&[(ExpectType, SetState(&BLOCK))])),
    (Otherwise, SetState(&INIT)),
];

static CONST: [(Input, Action); 3] = [
    (Keyword("move"), SetState(&CLOSURE)),
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeBrace, SetState(&POSTFIX)),
];

static CONTINUE: [(Input, Action); 2] = [
    (ConsumeLifetime, SetState(&POSTFIX)),
    (Otherwise, SetState(&POSTFIX)),
];

static DOT: [(Input, Action); 3] = [
    (Keyword("await"), SetState(&POSTFIX)),
    (ConsumeIdent, SetState(&METHOD)),
    (ConsumeLiteral, SetState(&POSTFIX)),
];

static FOR: [(Input, Action); 2] = [
    (Punct("<"), SetState(&CLOSURE)),
    (Otherwise, SetState(&PATTERN)),
];

static IF_ELSE: [(Input, Action); 2] = [(Keyword("if"), SetState(&INIT)), (ConsumeBrace, DecDepth)];
static IF_THEN: [(Input, Action); 2] =
    [(Keyword("else"), SetState(&IF_ELSE)), (Otherwise, DecDepth)];

static METHOD: [(Input, Action); 1] = [(ExpectTurbofish, SetState(&POSTFIX))];

static PATH: [(Input, Action); 4] = [
    (Punct("!="), SetState(&INIT)),
    (Punct("!"), SetState(&INIT)),
    (ConsumeNestedBrace, SetState(&IF_THEN)),
    (Otherwise, SetState(&POSTFIX)),
];

static PATTERN: [(Input, Action); 15] = [
    (ConsumeDelimiter, SetState(&PATTERN)),
    (Keyword("box"), SetState(&PATTERN)),
    (Keyword("in"), IncDepth),
    (Keyword("mut"), SetState(&PATTERN)),
    (Keyword("ref"), SetState(&PATTERN)),
    (Keyword("_"), SetState(&PATTERN)),
    (Punct("!"), SetState(&PATTERN)),
    (Pun
```

---

# OUTRO - scan_expr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\thiserror-impl-1.0.69\src\scan_expr.rs
**SHA:** d46ae7a3eaaa6476
**Timestamp:** 2026-08-28T02:36:05.113906
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- static PATTERN: [(Input, Action); 15] = [

### Ouro Bruto (primeiros 5000 chars)
```
use self::{Action::*, Input::*};
use proc_macro2::{Delimiter, Ident, Spacing, TokenTree};
use syn::parse::{ParseStream, Result};
use syn::{AngleBracketedGenericArguments, BinOp, Expr, ExprPath, Lifetime, Lit, Token, Type};

enum Input {
    Keyword(&'static str),
    Punct(&'static str),
    ConsumeAny,
    ConsumeBinOp,
    ConsumeBrace,
    ConsumeDelimiter,
    ConsumeIdent,
    ConsumeLifetime,
    ConsumeLiteral,
    ConsumeNestedBrace,
    ExpectPath,
    ExpectTurbofish,
    ExpectType,
    CanBeginExpr,
    Otherwise,
    Empty,
}

enum Action {
    SetState(&'static [(Input, Action)]),
    IncDepth,
    DecDepth,
    Finish,
}

static INIT: [(Input, Action); 28] = [
    (ConsumeDelimiter, SetState(&POSTFIX)),
    (Keyword("async"), SetState(&ASYNC)),
    (Keyword("break"), SetState(&BREAK_LABEL)),
    (Keyword("const"), SetState(&CONST)),
    (Keyword("continue"), SetState(&CONTINUE)),
    (Keyword("for"), SetState(&FOR)),
    (Keyword("if"), IncDepth),
    (Keyword("let"), SetState(&PATTERN)),
    (Keyword("loop"), SetState(&BLOCK)),
    (Keyword("match"), IncDepth),
    (Keyword("move"), SetState(&CLOSURE)),
    (Keyword("return"), SetState(&RETURN)),
    (Keyword("static"), SetState(&CLOSURE)),
    (Keyword("unsafe"), SetState(&BLOCK)),
    (Keyword("while"), IncDepth),
    (Keyword("yield"), SetState(&RETURN)),
    (Keyword("_"), SetState(&POSTFIX)),
    (Punct("!"), SetState(&INIT)),
    (Punct("#"), SetState(&[(ConsumeDelimiter, SetState(&INIT))])),
    (Punct("&"), SetState(&REFERENCE)),
    (Punct("*"), SetState(&INIT)),
    (Punct("-"), SetState(&INIT)),
    (Punct("..="), SetState(&INIT)),
    (Punct(".."), SetState(&RANGE)),
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeLifetime, SetState(&[(Punct(":"), SetState(&INIT))])),
    (ConsumeLiteral, SetState(&POSTFIX)),
    (ExpectPath, SetState(&PATH)),
];

static POSTFIX: [(Input, Action); 10] = [
    (Keyword("as"), SetState(&[(ExpectType, SetState(&POSTFIX))])),
    (Punct("..="), SetState(&INIT)),
    (Punct(".."), SetState(&RANGE)),
    (Punct("."), SetState(&DOT)),
    (Punct("?"), SetState(&POSTFIX)),
    (ConsumeBinOp, SetState(&INIT)),
    (Punct("="), SetState(&INIT)),
    (ConsumeNestedBrace, SetState(&IF_THEN)),
    (ConsumeDelimiter, SetState(&POSTFIX)),
    (Empty, Finish),
];

static ASYNC: [(Input, Action); 3] = [
    (Keyword("move"), SetState(&ASYNC)),
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeBrace, SetState(&POSTFIX)),
];

static BLOCK: [(Input, Action); 1] = [(ConsumeBrace, SetState(&POSTFIX))];

static BREAK_LABEL: [(Input, Action); 2] = [
    (ConsumeLifetime, SetState(&BREAK_VALUE)),
    (Otherwise, SetState(&BREAK_VALUE)),
];

static BREAK_VALUE: [(Input, Action); 3] = [
    (ConsumeNestedBrace, SetState(&IF_THEN)),
    (CanBeginExpr, SetState(&INIT)),
    (Otherwise, SetState(&POSTFIX)),
];

static CLOSURE: [(Input, Action); 6] = [
    (Keyword("async"), SetState(&CLOSURE)),
    (Keyword("move"), SetState(&CLOSURE)),
    (Punct(","), SetState(&CLOSURE)),
    (Punct(">"), SetState(&CLOSURE)),
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeLifetime, SetState(&CLOSURE)),
];

static CLOSURE_ARGS: [(Input, Action); 2] = [
    (Punct("|"), SetState(&CLOSURE_RET)),
    (ConsumeAny, SetState(&CLOSURE_ARGS)),
];

static CLOSURE_RET: [(Input, Action); 2] = [
    (Punct("->"), SetState(&[(ExpectType, SetState(&BLOCK))])),
    (Otherwise, SetState(&INIT)),
];

static CONST: [(Input, Action); 2] = [
    (Punct("|"), SetState(&CLOSURE_ARGS)),
    (ConsumeBrace, SetState(&POSTFIX)),
];

static CONTINUE: [(Input, Action); 2] = [
    (ConsumeLifetime, SetState(&POSTFIX)),
    (Otherwise, SetState(&POSTFIX)),
];

static DOT: [(Input, Action); 3] = [
    (Keyword("await"), SetState(&POSTFIX)),
    (ConsumeIdent, SetState(&METHOD)),
    (ConsumeLiteral, SetState(&POSTFIX)),
];

static FOR: [(Input, Action); 2] = [
    (Punct("<"), SetState(&CLOSURE)),
    (Otherwise, SetState(&PATTERN)),
];

static IF_ELSE: [(Input, Action); 2] = [(Keyword("if"), SetState(&INIT)), (ConsumeBrace, DecDepth)];
static IF_THEN: [(Input, Action); 2] =
    [(Keyword("else"), SetState(&IF_ELSE)), (Otherwise, DecDepth)];

static METHOD: [(Input, Action); 1] = [(ExpectTurbofish, SetState(&POSTFIX))];

static PATH: [(Input, Action); 4] = [
    (Punct("!="), SetState(&INIT)),
    (Punct("!"), SetState(&INIT)),
    (ConsumeNestedBrace, SetState(&IF_THEN)),
    (Otherwise, SetState(&POSTFIX)),
];

static PATTERN: [(Input, Action); 15] = [
    (ConsumeDelimiter, SetState(&PATTERN)),
    (Keyword("box"), SetState(&PATTERN)),
    (Keyword("in"), IncDepth),
    (Keyword("mut"), SetState(&PATTERN)),
    (Keyword("ref"), SetState(&PATTERN)),
    (Keyword("_"), SetState(&PATTERN)),
    (Punct("!"), SetState(&PATTERN)),
    (Punct("&"), SetState(&PATTERN)),
    (Punct("..="), SetState(&PATTERN)),
    (Punct(".."), SetState(&PATTERN)),
    (Punct("="), SetState(&INIT)),
    (Punct("@"), SetState(&PATTERN)),
    (Punct("|"), SetState(&PATTERN)),

```