# What `#[derive(Unwrap)]` generates

When an enum is decorated with `#[derive(Unwrap)]`, for each variant `foo` in the enum, with fields `(a, b, c, ...)` a public instance method `unwrap_foo(self) -> (a, b, c, ...)` is generated.
If you don't want the `unwrap_foo` method generated for a variant, you can put the `#[unwrap(ignore)]` attribute on that variant.
If you want to treat a reference, you can put the `#[unwrap(ref)]` attribute on the enum declaration or that variant, then `unwrap_foo_ref(self) -> (&a, &b, &c, ...)` will be generated. You can also use mutable references by putting `#[unwrap(ref_mut)]`.




## Example usage

```rust
# use derive_more::Unwrap;
# 
# #[derive(Debug, PartialEq)]
#[derive(Unwrap)]
#[unwrap(ref)]
enum Maybe<T> {
    Just(T),
    Nothing,
}

fn main() {
    assert_eq!(Maybe::Just(1).unwrap_just(), 1);

    // Panics if variants are different
    // assert_eq!(Maybe::<()>::Nothing.unwrap_just(), /* panic */);
    // assert_eq!(Maybe::Just(2).unwrap_nothing(), /* panic */);

    assert_eq!((&Maybe::Just(42)).unwrap_just_ref(), &42);
}
```


### What is generated?

The derive in the above example code generates the following code:
```rust
# enum Maybe<T> {
#     Just(T),
#     Nothing,
# }
#
impl<T> Maybe<T> {
    pub fn unwrap_nothing(self) -> () {
        match self {
            Maybe::Nothing => (),
            _ => panic!(),
        }
    }
    pub fn unwrap_nothing_ref(&self) -> () {
        match self {
            Maybe::Nothing => (),
            _ => panic!(),
        }
    }
    pub fn unwrap_just(self) -> T {
        match self {
            Maybe::Just(field_0) => field_0,
            _ => panic!(),
        }
    }
    pub fn unwrap_just_ref(&self) -> &T {
        match self {
            Maybe::Just(field_0) => field_0,
            _ => panic!(),
        }
    }
}
```


---

# OUTRO - unwrap.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\unwrap.rs
**SHA:** 92470f4591f2dc38
**Timestamp:** 2026-08-28T02:34:01.291261
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern = quote! { #enum_name :: #variant_ident #data_pattern };
- #pattern => #ret_value,
- #pattern => #ret_value,
- #pattern => #ret_value,
- let data_pattern = match variant.fields {
- quote! { #enum_name :: #variant_ident #data_pattern => panic!(#panic_msg) }

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
        "unwrap".into(),
        AttrParams {
            enum_: vec!["ignore", "owned", "ref", "ref_mut"],
            variant: vec!["ignore", "owned", "ref", "ref_mut"],
            struct_: vec!["ignore"],
            field: vec!["ignore"],
        },
    )?;
    assert!(
        state.derive_type == DeriveType::Enum,
        "Unwrap can only be derived for enums",
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
            "unwrap_{ident}",
            ident = variant.ident.to_string().to_case(Case::Snake),
            span = variant.ident.span(),
        );
        let ref_fn_name = format_ident!(
            "unwrap_{ident}_ref",
            ident = variant.ident.to_string().to_case(Case::Snake),
            span = variant.ident.span(),
        );
        let mut_fn_name = format_ident!(
            "unwrap_{ident}_mut",
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
            "Unwraps this value to the `{enum_name}::{variant_ident}` variant.\n",
        );
        let doc_ref = format!(
            "Unwraps this reference to the `{enum_name}::{variant_ident}` variant.\n",
        );
        let doc_mut = format!(
            "Unwraps this mutable reference to the `{enum_name}::{variant_ident}` variant.\n",
        );
        let doc_else = "Panics if this value is of any other type.";

        let func = quote! {
            #[inline]
            #[track_caller]
            #[doc = #doc_owned]
            #[doc = #doc_else]
            pub fn #fn_name(self) -> (#(#data_types),*) {
                match self {
                    #pattern => #ret_value,
                    val @ _ => #failed_block,
                }
            }
        };

        let ref_func = quote! {
            #[inline]
            #[track_caller]
            #[doc = #doc_ref]
            #[doc = #doc_else]
            pub fn #ref_fn_name(&self) -> (#(&#data_types),*) {
                match self {
                    #pattern => #ret_value,
                    val @ _ => #failed_block_ref,
                }
            }
        };

        let mut_func = quote! {
            #[inline]
            #[track_caller]
            #[doc = #doc_mut]
            #[doc = #doc_else]
            pub fn #mut_fn_name(&mut self) -> (#(&mut #data_types),*) {
                match self {
                    #pattern => #ret_value,
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
        Fields::Named(_) => panic!("cannot unwrap anonymous records"),
        Fields::Unnamed(ref fields) => {
            let (idents, types) = fields
                .unnamed
                .iter()
                .enumerate()
                .map(|(n, it)| (format_ident!("field_{n}"), &it.ty))
                .unzip::<_, _, Vec<_>, Vec<_>>();
            (quote! { (#(#idents),*) }, quote! { (#(#idents),*) }, types)
        }
        Fields::Unit => (quote! {}, quote! { () }, vec![]),
    }
}

fn failed_block(state: &S
```