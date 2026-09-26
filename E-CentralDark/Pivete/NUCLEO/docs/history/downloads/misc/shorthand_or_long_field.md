# OUTRO - shorthand_or_long_field.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\darling-0.23.0\examples\shorthand_or_long_field.rs
**SHA:** ec2e2b155fd0803c
**Timestamp:** 2026-08-28T02:33:41.999091
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- let missing = from_str(
- println!("Error when missing: {}", missing);

### Ouro Bruto (primeiros 5000 chars)
```
//! Example showing potentially-nested meta item parsing with `darling::util::Override`.
//!
//! Based on https://stackoverflow.com/q/68046070/86381 by https://github.com/peterjoel

// The use of fields in debug print commands does not count as "used",
// which causes the fields to trigger an unwanted dead code warning.
#![allow(dead_code)]

use std::borrow::Cow;

use darling::{util::Override, FromDeriveInput, FromMeta};
use syn::{Ident, Path};

#[derive(Debug, FromDeriveInput)]
#[darling(attributes(myderive))]
struct MyDeriveInput {
    ident: Ident,
    /// We can infer the right "table" behavior for this derive, but we want the caller to be
    /// explicit that they're expecting the inference behavior to avoid cluttering some hypothetical
    /// database. Therefore this field is required, but can take word form or key-value form.
    ///
    /// To make this field optional, we could add `#[darling(default)]`, or we could
    /// wrap it in `Option` if the presence or absence of the word makes a difference.
    table: Override<Table>,
}

impl MyDeriveInput {
    fn table(&self) -> Cow<'_, Table> {
        match &self.table {
            Override::Explicit(value) => Cow::Borrowed(value),
            Override::Inherit => Cow::Owned(Table {
                name: self.ident.to_string(),
                value: None,
            }),
        }
    }
}

#[derive(Debug, Clone, FromMeta)]
struct Table {
    name: String,
    value: Option<Path>,
}

fn from_str(s: &str) -> darling::Result<MyDeriveInput> {
    FromDeriveInput::from_derive_input(&syn::parse_str(s)?)
}

fn main() {
    let missing = from_str(
        r#"
        #[derive(MyTrait)]
        struct Foo(u64);
    "#,
    )
    .unwrap_err();

    let short_form = from_str(
        r#"
        #[derive(MyTrait)]
        #[myderive(table)]
        struct Foo(u64);
    "#,
    )
    .unwrap();

    let long_form = from_str(
        r#"
        #[derive(MyTrait)]
        #[myderive(table(name = "Custom"))]
        struct Foo(u64);
    "#,
    )
    .unwrap();

    println!("Error when missing: {}", missing);
    println!("Short form: {:?}", short_form.table());
    println!("Long form: {:?}", long_form.table());
}

```