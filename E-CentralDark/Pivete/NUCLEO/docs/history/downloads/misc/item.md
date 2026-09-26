# OUTRO - item.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\syn-2.0.119\src\item.rs
**SHA:** a4f290f4c31a357c
**Timestamp:** 2026-08-28T02:35:46.514198
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: https://rust-lang.github.io/rfcs/3323-restrictions.html
- // TODO: goes away once the migration period on rust-lang/rust#89122 is over

### Ouro Bruto (primeiros 5000 chars)
```
use crate::attr::Attribute;
use crate::data::{Fields, FieldsNamed, Variant};
use crate::derive::{Data, DataEnum, DataStruct, DataUnion, DeriveInput};
use crate::expr::Expr;
use crate::generics::{Generics, TypeParamBound};
use crate::ident::Ident;
use crate::lifetime::Lifetime;
use crate::mac::Macro;
use crate::pat::{Pat, PatType};
use crate::path::Path;
use crate::punctuated::Punctuated;
use crate::restriction::Visibility;
use crate::stmt::Block;
use crate::token;
use crate::ty::{Abi, ReturnType, Type};
use alloc::boxed::Box;
use alloc::vec::Vec;
#[cfg(feature = "parsing")]
use core::mem;
use proc_macro2::TokenStream;

ast_enum_of_structs! {
    /// Things that can appear directly inside of a module or scope.
    ///
    /// # Syntax tree enum
    ///
    /// This type is a [syntax tree enum].
    ///
    /// [syntax tree enum]: crate::expr::Expr#syntax-tree-enums
    #[cfg_attr(docsrs, doc(cfg(feature = "full")))]
    #[non_exhaustive]
    pub enum Item {
        /// A constant item: `const MAX: u16 = 65535`.
        Const(ItemConst),

        /// An enum definition: `enum Foo<A, B> { A(A), B(B) }`.
        Enum(ItemEnum),

        /// An `extern crate` item: `extern crate serde`.
        ExternCrate(ItemExternCrate),

        /// A free-standing function: `fn process(n: usize) -> Result<()> { ...
        /// }`.
        Fn(ItemFn),

        /// A block of foreign items: `extern "C" { ... }`.
        ForeignMod(ItemForeignMod),

        /// An impl block providing trait or associated items: `impl<A> Trait
        /// for Data<A> { ... }`.
        Impl(ItemImpl),

        /// A macro invocation, which includes `macro_rules!` definitions.
        Macro(ItemMacro),

        /// A module or module declaration: `mod m` or `mod m { ... }`.
        Mod(ItemMod),

        /// A static item: `static BIKE: Shed = Shed(42)`.
        Static(ItemStatic),

        /// A struct definition: `struct Foo<A> { x: A }`.
        Struct(ItemStruct),

        /// A trait definition: `pub trait Iterator { ... }`.
        Trait(ItemTrait),

        /// A trait alias: `pub trait SharableIterator = Iterator + Sync`.
        TraitAlias(ItemTraitAlias),

        /// A type alias: `type Result<T> = core::result::Result<T, MyError>`.
        Type(ItemType),

        /// A union definition: `union Foo<A, B> { x: A, y: B }`.
        Union(ItemUnion),

        /// A use declaration: `use alloc::collections::HashMap`.
        Use(ItemUse),

        /// Tokens forming an item not interpreted by Syn.
        Verbatim(TokenStream),

        // For testing exhaustiveness in downstream code, use the following idiom:
        //
        //     match item {
        //         #![cfg_attr(test, deny(non_exhaustive_omitted_patterns))]
        //
        //         Item::Const(item) => {...}
        //         Item::Enum(item) => {...}
        //         ...
        //         Item::Verbatim(item) => {...}
        //
        //         _ => { /* some sane fallback */ }
        //     }
        //
        // This way we fail your tests but don't break your library when adding
        // a variant. You will be notified by a test failure when a variant is
        // added, so that you can add code to handle it, but your library will
        // continue to compile and work for downstream users in the interim.
    }
}

ast_struct! {
    /// A constant item: `const MAX: u16 = 65535`.
    #[cfg_attr(docsrs, doc(cfg(feature = "full")))]
    pub struct ItemConst {
        pub attrs: Vec<Attribute>,
        pub vis: Visibility,
        pub const_token: Token![const],
        pub ident: Ident,
        pub generics: Generics,
        pub colon_token: Token![:],
        pub ty: Box<Type>,
        pub eq_token: Token![=],
        pub expr: Box<Expr>,
        pub semi_token: Token![;],
    }
}

ast_struct! {
    /// An enum definition: `enum Foo<A, B> { A(A), B(B) }`.
    #[cfg_attr(docsrs, doc(cfg(feature = "full")))]
    pub struct ItemEnum {
        pub attrs: Vec<Attribute>,
        pub vis: Visibility,
        pub enum_token: Token![enum],
        pub ident: Ident,
        pub generics: Generics,
        pub brace_token: token::Brace,
        pub variants: Punctuated<Variant, Token![,]>,
    }
}

ast_struct! {
    /// An `extern crate` item: `extern crate serde`.
    #[cfg_attr(docsrs, doc(cfg(feature = "full")))]
    pub struct ItemExternCrate {
        pub attrs: Vec<Attribute>,
        pub vis: Visibility,
        pub extern_token: Token![extern],
        pub crate_token: Token![crate],
        pub ident: Ident,
        pub rename: Option<(Token![as], Ident)>,
        pub semi_token: Token![;],
    }
}

ast_struct! {
    /// A free-standing function: `fn process(n: usize) -> Result<()> { ... }`.
    #[cfg_attr(docsrs, doc(cfg(feature = "full")))]
    pub struct ItemFn {
        pub attrs: Vec<Attribute>,
        pub vis: Visibility,
        pub sig: Signature,
        pub block: Box<Block>,
    }
}

ast_struct! {
    /// A block of foreign items: `extern "C"
```