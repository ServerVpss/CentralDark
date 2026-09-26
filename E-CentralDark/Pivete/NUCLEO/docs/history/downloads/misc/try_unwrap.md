# What `#[derive(TryUnwrap)]` generates

This works almost like `Unwrap`.
When an enum is decorated with `#[derive(TryUnwrap)]`, for each variant `foo` in the enum, with fields `(a, b, c, ...)` a public instance method `try_unwrap_foo(self) -> Result<(a, b, c, ...), TryUnwrapError<Self>>` is generated.
If you don't want the `try_unwrap_foo` method generated for a variant, you can put the `#[try_unwrap(ignore)]` attribute on that variant.
If you want to treat a reference, you can put the `#[try_unwrap(ref)]` attribute on the enum declaration or that variant, then `try_unwrap_foo_ref(self) -> Result<(&a, &b, &c, ...), TryUnwrapError<&Self>>` will be generated. You can also use mutable references by putting `#[unwrap(ref_mut)]`.
However, unlike `Unwrap`, it does not panic if the conversion fails. Also, values that fail to convert are not dropped but returned as an `Err`.

## Example usage

```rust
# use derive_more::TryUnwrap;
# 
# #[derive(Debug, PartialEq)]
#[derive(TryUnwrap)]
#[try_unwrap(ref)]
enum Maybe<T> {
    Nothing,
    Just(T),
}

fn main() {
    assert_eq!(Maybe::Just(1).try_unwrap_just(), Ok(1));

    // Unlike `Unwrap`, it does not panic.
    assert_eq!(
        Maybe::<()>::Nothing.try_unwrap_just().map_err(|err| err.input),
        Err(Maybe::<()>::Nothing), // and the value is returned!
    );
    assert_eq!(
        Maybe::Just(2).try_unwrap_nothing().map_err(|err| err.input),
        Err(Maybe::Just(2)),
    );
    assert_eq!(
        Maybe::<()>::Nothing.try_unwrap_just().map_err(|err| err.to_string()),
        Err("Attempt to call `Maybe::try_unwrap_just()` on a `Maybe::Nothing` value".into()),
    );

    assert_eq!((&Maybe::Just(42)).try_unwrap_just_ref(), Ok(&42));
}
```

### What is generated?

The derive in the above example code generates the following code:
```rust
# use derive_more::TryUnwrapError;
#
# enum Maybe<T> {
#     Just(T),
#     Nothing,
# }
#
impl<T> Maybe<T> {
    pub fn try_unwrap_nothing(self) -> Result<(), TryUnwrapError<Self>> {
        match self {
            Maybe::Nothing => Ok(()),
            val @ _ => Err(todo!("TryUnwrapError::new(val, /* omitted */)")),
        }
    }
    pub fn try_unwrap_nothing_ref(&self) -> Result<(), TryUnwrapError<&Self>> {
        match self {
            Maybe::Nothing => Ok(()),
            val @ _ => Err(todo!("TryUnwrapError::new(val, /* omitted */)")),
        }
    }
    pub fn try_unwrap_just(self) -> Result<T, TryUnwrapError<Self>> {
        match self {
            Maybe::Just(field_0) => Ok(field_0),
            val @ _ => Err(todo!("TryUnwrapError::new(val, /* omitted */)")),
        }
    }
    pub fn try_unwrap_just_ref(&self) -> Result<&T, TryUnwrapError<&Self>> {
        match self {
            Maybe::Just(field_0) => Ok(field_0),
            val @ _ => Err(todo!("TryUnwrapError::new(val, /* omitted */)")),
        }
    }
}
```


---

# OUTRO - try_unwrap.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\try_unwrap.rs
**SHA:** b9056b5d62974c42
**Timestamp:** 2026-08-28T02:34:01.243417
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern = quote! { #enum_name :: #variant_ident #data_pattern };
- #pattern => derive_more::core::result::Result::Ok(#ret_value),
- #pattern => derive_more::core::result::Result::Ok(#ret_value),
- #pattern => derive_more::core::result::Result::Ok(#ret_value),
- let data_pattern = match variant.fields {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::utils::{AttrParams, DeriveType, State};
use convert_case::{Case, Casing};
use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use syn::{DeriveInput, Fields, Ident, Result, Type};

pub fn expand(input: &DeriveInput, trait_name: &'static str) -> Result<TokenStream> {
    let state = State::with_attr_params(
        input,
        trait_name,
        "try_unwrap".into(),
        AttrParams {
            enum_: vec!["ignore", "owned", "ref", "ref_mut"],
            variant: vec!["ignore", "owned", "ref", "ref_mut"],
            struct_: vec!["ignore"],
            field: vec!["ignore"],
        },
    )?;
    assert!(
        state.derive_type == DeriveType::Enum,
        "TryUnwrap can only be derived for enums",
    );

    let enum_name = &input.ident;
    let (imp_generics, type_generics, where_clause) = input.generics.split_for_impl();

    let variant_data = state.enabled_variant_data();

    let mut funcs = vec![];
    for (variant_state, info) in
        Iterator::zip(variant_data.variant_states.iter(), variant_data.infos)
    {
        let variant = variant_state.variant.unwrap();
        let fn_name = format_ident!(
            "try_unwrap_{ident}",
            ident = variant.ident.to_string().to_case(Case::Snake),
            span = variant.ident.span(),
        );
        let ref_fn_name = format_ident!(
            "try_unwrap_{ident}_ref",
            ident = variant.ident.to_string().to_case(Case::Snake),
            span = variant.ident.span(),
        );
        let mut_fn_name = format_ident!(
            "try_unwrap_{ident}_mut",
            ident = variant.ident.to_string().to_case(Case::Snake),
            span = variant.ident.span(),
        );
        let variant_ident = &variant.ident;
        let (data_pattern, ret_value, data_types) = get_field_info(&variant.fields);
        let pattern = quote! { #enum_name :: #variant_ident #data_pattern };

        let (failed_block, failed_block_ref, failed_block_mut) = (
            failed_block(&state, enum_name, &fn_name),
            failed_block(&state, enum_name, &ref_fn_name),
            failed_block(&state, enum_name, &mut_fn_name),
        );

        let doc_owned = format!(
            "Attempts to unwrap this value to the `{enum_name}::{variant_ident}` variant.\n",
        );
        let doc_ref = format!(
            "Attempts to unwrap this reference to the `{enum_name}::{variant_ident}` variant.\n",
        );
        let doc_mut = format!(
            "Attempts to unwrap this mutable reference to the `{enum_name}::{variant_ident}` variant.\n",
        );
        let doc_else = "Returns a [TryUnwrapError] with the original value if this value is of any other type.";
        let func = quote! {
            #[inline]
            #[track_caller]
            #[doc = #doc_owned]
            #[doc = #doc_else]
            pub fn #fn_name(self) -> derive_more::core::result::Result<
                (#(#data_types),*), derive_more::TryUnwrapError<Self>
            > {
                match self {
                    #pattern => derive_more::core::result::Result::Ok(#ret_value),
                    val @ _ => #failed_block,
                }
            }
        };

        let ref_func = quote! {
            #[inline]
            #[track_caller]
            #[doc = #doc_ref]
            #[doc = #doc_else]
            pub fn #ref_fn_name(&self) -> derive_more::core::result::Result<
                (#(&#data_types),*), derive_more::TryUnwrapError<&Self>
            > {
                match self {
                    #pattern => derive_more::core::result::Result::Ok(#ret_value),
                    val @ _ => #failed_block_ref,
                }
            }
        };

        let mut_func = quote! {
            #[inline]
            #[track_caller]
            #[doc = #doc_mut]
            #[doc = #doc_else]
            pub fn #mut_fn_name(&mut self) -> derive_more::core::result::Result<
                (#(&mut #data_types),*), derive_more::TryUnwrapError<&mut Self>
            > {
                match self {
                    #pattern => derive_more::core::result::Result::Ok(#ret_value),
                    val @ _ => #failed_block_mut,
                }
            }
        };

        if info.owned && state.default_info.owned {
            funcs.push(func);
        }
        if info.ref_ && state.default_info.ref_ {
            funcs.push(ref_func);
        }
        if info.ref_mut && state.default_info.ref_mut {
            funcs.push(mut_func);
        }
    }

    let imp = quote! {
        #[allow(deprecated)] // omit warnings on deprecated fields/variants
        #[allow(unreachable_code)] // omit warnings for `!` and other unreachable types
        #[automatically_derived]
        impl #imp_generics #enum_name #type_generics #where_clause {
            #(#funcs)*
        }
    };

    Ok(imp)
}

fn get_field_info(fields: &Fields) -> (TokenStream, TokenStream, Vec<&Type>) {
    match fields {
        Fi
```