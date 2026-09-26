# OUTRO - make_varule.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-derive-0.11.3\src\make_varule.rs
**SHA:** e4924643935ab82e
**Timestamp:** 2026-08-28T02:37:46.598024
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // Todo: index type should be settable by attribute
- // Todo: index type should be settable by attribute

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::utils::{self, FieldInfo};
use proc_macro2::Span;
use proc_macro2::TokenStream as TokenStream2;
use quote::{quote, ToTokens};
use syn::spanned::Spanned;
use syn::{
    parse_quote, Data, DeriveInput, Error, Field, Fields, GenericArgument, Ident, Lifetime,
    PathArguments, Type, TypePath,
};

pub fn make_varule_impl(ule_name: Ident, mut input: DeriveInput) -> TokenStream2 {
    if input.generics.type_params().next().is_some()
        || input.generics.const_params().next().is_some()
        || input.generics.lifetimes().count() > 1
    {
        return Error::new(
            input.generics.span(),
            "#[make_varule] must be applied to a struct without any type or const parameters and at most one lifetime",
        )
        .to_compile_error();
    }

    let sp = input.span();
    let attrs = match utils::extract_attributes_common(&mut input.attrs, sp, true) {
        Ok(val) => val,
        Err(e) => return e.to_compile_error(),
    };

    let lt = input.generics.lifetimes().next();

    if let Some(lt) = lt {
        if lt.colon_token.is_some() || !lt.bounds.is_empty() {
            return Error::new(
                input.generics.span(),
                "#[make_varule] must be applied to a struct without lifetime bounds",
            )
            .to_compile_error();
        }
    }

    let lt = lt.map(|l| &l.lifetime);

    let name = &input.ident;
    let input_span = input.span();

    let fields = match input.data {
        Data::Struct(ref mut s) => &mut s.fields,
        _ => {
            return Error::new(input.span(), "#[make_varule] must be applied to a struct")
                .to_compile_error();
        }
    };

    if fields.is_empty() {
        return Error::new(
            input.span(),
            "#[make_varule] must be applied to a struct with at least one field",
        )
        .to_compile_error();
    }

    let mut sized_fields = vec![];
    let mut unsized_fields = vec![];

    let mut custom_varule_idents = vec![];

    for field in fields.iter_mut() {
        match utils::extract_field_attributes(&mut field.attrs) {
            Ok(i) => custom_varule_idents.push(i),
            Err(e) => return e.to_compile_error(),
        }
    }

    for (i, field) in fields.iter().enumerate() {
        match UnsizedField::new(field, i, custom_varule_idents[i].clone()) {
            Ok(o) => unsized_fields.push(o),
            Err(_) => sized_fields.push(FieldInfo::new_for_field(field, i)),
        }
    }

    if unsized_fields.is_empty() {
        let last_field_index = fields.len() - 1;
        let last_field = fields.iter().next_back().unwrap();

        let e = UnsizedField::new(
            last_field,
            last_field_index,
            custom_varule_idents[last_field_index].clone(),
        )
        .unwrap_err();
        return Error::new(last_field.span(), e).to_compile_error();
    }

    if unsized_fields[0].field.index != fields.len() - unsized_fields.len()
        && unsized_fields[0].field.field.ident.is_none()
    {
        return Error::new(
            unsized_fields.first().unwrap().field.field.span(),
            "#[make_varule] requires its unsized fields to be at the end for tuple structs",
        )
        .to_compile_error();
    }

    let unsized_field_info = UnsizedFields::new(unsized_fields, attrs.vzv_format);

    let mut field_inits = crate::ule::make_ule_fields(&sized_fields);
    let last_field_ule = unsized_field_info.varule_ty();

    let setter = unsized_field_info.varule_setter();
    let vis = &unsized_field_info.varule_vis();
    field_inits.push(quote!(#vis #setter #last_field_ule));

    let semi = utils::semi_for(fields);
    let repr_attr = utils::repr_for(fields);
    let field_inits = utils::wrap_field_inits(&field_inits, fields);
    let vis = &input.vis;

    let doc = format!(
        "[`VarULE`](zerovec::ule::VarULE) type for [`{name}`]. See [`{name}`] for documentation."
    );
    let varule_struct: DeriveInput = parse_quote!(
        #[repr(#repr_attr)]
        #[doc = #doc]
        #[allow(missing_docs)]
        #vis struct #ule_name #field_inits #semi
    );

    let derived = crate::varule::derive_impl(&varule_struct, unsized_field_info.varule_validator());

    let maybe_lt_bound = lt.as_ref().map(|lt| quote!(<#lt>));

    let encode_impl = make_encode_impl(
        &sized_fields,
        &unsized_field_info,
        name,
        &ule_name,
        &maybe_lt_bound,
    );

    let zf_and_from_impl = make_zf_and_from_impl(
        &sized_fields,
        &unsized_field_info,
        fields,
        name,
        &ule_name,
        lt,
        input_span,
        attrs.skip_from,
    );

    let eq_impl = quote!(
        impl core::cmp::PartialEq for #ule_name {
            fn eq(&self, other: &Self) -> 
```