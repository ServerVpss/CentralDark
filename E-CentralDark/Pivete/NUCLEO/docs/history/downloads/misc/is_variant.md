# What `#[derive(IsVariant)]` generates

When an enum is decorated with `#[derive(IsVariant)]`, for each variant `foo` in
the enum, a public instance method `is_foo(&self) -> bool` is generated. If you
don't want the `is_foo` method generated for a variant you can put the
`#[is_variant(ignore)]` attribute on that variant.




## Example usage

```rust
# use derive_more::IsVariant;
#
#[derive(IsVariant)]
enum Maybe<T> {
    Just(T),
    Nothing
}

assert!(Maybe::<()>::Nothing.is_nothing());
assert!(!Maybe::<()>::Nothing.is_just());
```


### What is generated?

The derive in the above example generates code like this:
```rust
# enum Maybe<T> {
#     Just(T),
#     Nothing
# }
impl<T> Maybe<T>{
    #[must_use]
    pub const fn is_just(&self) -> bool {
        matches!(self, Self::Just(..))
    }
    #[must_use]
    pub const fn is_nothing(&self) -> bool {
        matches!(self, Self::Nothing)
    }
}
```


---

# OUTRO - is_variant.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\is_variant.rs
**SHA:** 3fe36afa0e9a04e3
**Timestamp:** 2026-08-28T02:34:01.102071
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let data_pattern = match variant.fields {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::utils::{AttrParams, DeriveType, State};
use convert_case::{Case, Casing};
use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use syn::{DeriveInput, Fields, Result};

pub fn expand(input: &DeriveInput, trait_name: &'static str) -> Result<TokenStream> {
    let state = State::with_attr_params(
        input,
        trait_name,
        "is_variant".into(),
        AttrParams {
            enum_: vec!["ignore"],
            variant: vec!["ignore"],
            struct_: vec!["ignore"],
            field: vec!["ignore"],
        },
    )?;
    assert!(
        state.derive_type == DeriveType::Enum,
        "IsVariant can only be derived for enums",
    );

    let enum_name = &input.ident;
    let (imp_generics, type_generics, where_clause) = input.generics.split_for_impl();

    let mut funcs = vec![];
    for variant_state in state.enabled_variant_data().variant_states {
        let variant = variant_state.variant.unwrap();
        let fn_name = format_ident!(
            "is_{}",
            variant.ident.to_string().to_case(Case::Snake),
            span = variant.ident.span(),
        );
        let variant_ident = &variant.ident;

        let data_pattern = match variant.fields {
            Fields::Named(_) => quote! { {..} },
            Fields::Unnamed(_) => quote! { (..) },
            Fields::Unit => quote! {},
        };
        let func = quote! {
            #[doc = "Returns `true` if this value is of type `"]
            #[doc = stringify!(#variant_ident)]
            #[doc = "`. Returns `false` otherwise"]
            #[inline]
            #[must_use]
            pub const fn #fn_name(&self) -> bool {
                derive_more::core::matches!(self, #enum_name ::#variant_ident #data_pattern)
            }
        };
        funcs.push(func);
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

```