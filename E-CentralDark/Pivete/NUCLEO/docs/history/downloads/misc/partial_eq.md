# OUTRO - partial_eq.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\cmp\partial_eq.rs
**SHA:** c96b41097c549f4a
**Timestamp:** 2026-08-28T02:34:01.316638
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let self_pattern = all_fields
- let other_pattern = all_fields

### Ouro Bruto (primeiros 5000 chars)
```
//! Implementation of a [`PartialEq`] derive macro.

use proc_macro2::TokenStream;
use quote::{format_ident, quote, ToTokens};
use syn::{
    parse_quote,
    punctuated::{self, Punctuated},
    spanned::Spanned as _,
};

use crate::utils::{
    attr::{self, ParseMultiple as _},
    pattern_matching::FieldsExt as _,
    structural_inclusion::TypeExt as _,
    GenericsSearch, HashSet,
};

/// Expands a [`PartialEq`] derive macro.
pub fn expand(input: &syn::DeriveInput, _: &'static str) -> syn::Result<TokenStream> {
    let attr_name = format_ident!("partial_eq");
    let secondary_attr_name = format_ident!("eq");

    let mut has_skipped_variants = false;
    let mut variants = vec![];

    match &input.data {
        syn::Data::Struct(data) => {
            for attr_name in [&attr_name, &secondary_attr_name] {
                if attr::Skip::parse_attrs(&input.attrs, attr_name)?.is_some() {
                    has_skipped_variants = true;
                    break;
                }
            }
            if !has_skipped_variants {
                let mut skipped_fields = SkippedFields::default();
                'fields: for (n, field) in data.fields.iter().enumerate() {
                    for attr_name in [&attr_name, &secondary_attr_name] {
                        if attr::Skip::parse_attrs(&field.attrs, attr_name)?.is_some() {
                            _ = skipped_fields.insert(n);
                            continue 'fields;
                        }
                    }
                }
                variants.push((None, &data.fields, skipped_fields));
            }
        }
        syn::Data::Enum(data) => {
            'variants: for variant in &data.variants {
                for attr_name in [&attr_name, &secondary_attr_name] {
                    if attr::Skip::parse_attrs(&variant.attrs, attr_name)?.is_some() {
                        has_skipped_variants = true;
                        continue 'variants;
                    }
                }
                let mut skipped_fields = SkippedFields::default();
                'fields: for (n, field) in variant.fields.iter().enumerate() {
                    for attr_name in [&attr_name, &secondary_attr_name] {
                        if attr::Skip::parse_attrs(&field.attrs, attr_name)?.is_some() {
                            _ = skipped_fields.insert(n);
                            continue 'fields;
                        }
                    }
                }
                variants.push((Some(&variant.ident), &variant.fields, skipped_fields));
            }
        }
        syn::Data::Union(data) => {
            return Err(syn::Error::new(
                data.union_token.span(),
                "`PartialEq` cannot be derived for unions",
            ))
        }
    }

    Ok(StructuralExpansion {
        self_ty: (&input.ident, &input.generics),
        variants,
        has_skipped_variants,
        is_enum: matches!(input.data, syn::Data::Enum(_)),
    }
    .into_token_stream())
}

/// Indices of [`syn::Field`]s marked with an [`attr::Skip`].
type SkippedFields = HashSet<usize>;

/// Expansion of a macro for generating a structural [`PartialEq`] implementation of an enum or a
/// struct.
struct StructuralExpansion<'i> {
    /// [`syn::Ident`] and [`syn::Generics`] of the enum/struct.
    ///
    /// [`syn::Ident`]: struct@syn::Ident
    self_ty: (&'i syn::Ident, &'i syn::Generics),

    /// [`syn::Fields`] of the enum/struct to be compared in this [`StructuralExpansion`].
    variants: Vec<(Option<&'i syn::Ident>, &'i syn::Fields, SkippedFields)>,

    /// Indicator whether some original enum variants where skipped with an [`attr::Skip`].
    has_skipped_variants: bool,

    /// Indicator whether this expansion is for an enum.
    is_enum: bool,
}

impl StructuralExpansion<'_> {
    /// Generates body of the [`PartialEq::eq()`]/[`PartialEq::ne()`] method implementation for this
    /// [`StructuralExpansion`], if it's required.
    fn body(&self, eq: bool) -> Option<TokenStream> {
        // Special case: empty enum (also, no need for `ne()` method in this case).
        if self.is_enum && self.variants.is_empty() && !self.has_skipped_variants {
            return eq.then(|| quote! { match *self {} });
        }

        let no_fields_result = quote! { #eq };

        // Special case: fully skipped struct (also, no need for `ne()` method in this case).
        if !self.is_enum && self.variants.is_empty() && self.has_skipped_variants {
            return eq.then_some(no_fields_result);
        }
        // Special case: no fields to compare in struct/single-variant enum (also, no need for
        // `ne()` method in this case).
        if !(self.is_enum && self.has_skipped_variants)
            && self.variants.len() == 1
            && (self.variants[0].1.is_empty()
                || self.variants[0].1.len() == self.variants[0].2.len())
        {
            return eq.then_some(no_fields_result);
        }

        let
```