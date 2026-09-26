# What `#[derive(TryInto)]` generates

This derive allows you to convert enum variants into their corresponding
variant types.
One thing to note is that this derive doesn't actually generate an
implementation for the `TryInto` trait.
Instead it derives `TryFrom` for each variant in the enum and thus has an
indirect implementation of `TryInto` as recommended by the
[docs](https://doc.rust-lang.org/core/convert/trait.TryInto.html).

By using `#[try_into(owned, ref, ref_mut)]` it's possible to derive a `TryInto`
implementation for reference types as well.
You can pick any combination of `owned`, `ref` and `ref_mut`.
If that's not provided the default is `#[try_into(owned)]`.

With `#[try_into]` or `#[try_into(ignore)]` it's possible to indicate which
variants you want to derive `TryInto` for.




## Example usage

```rust
# use derive_more::TryInto;
#
#[derive(TryInto, Clone, Debug)]
#[try_into(owned, ref, ref_mut)]
enum MixedData {
    Int(u32),
    String(String),
}

let mixed_string = MixedData::String("foo".to_string());
let mixed_int1 = MixedData::Int(123);
let mixed_int2 = mixed_int1.clone();
let mut mixed_int3 = mixed_int1.clone();

assert_eq!(123u32, mixed_int1.try_into().unwrap());

let int_ref : &u32 = (&mixed_int2).try_into().unwrap();
assert_eq!(&123u32, int_ref);

let int_ref_mut : &mut u32 = (&mut mixed_int3).try_into().unwrap();
assert_eq!(&mut 123u32, int_ref_mut);

assert_eq!("foo".to_string(), String::try_from(mixed_string.clone()).unwrap());

assert!(u32::try_from(mixed_string).is_err());
```




## Structs

Deriving `TryInto` for structs is not supported because there is no failing
mode. Use `#[derive(Into)]` instead. `TryInto` will automatically get a
blanket implementation through `TryFrom`, automatically derived from `From`,
which `#[derive(Into)]` produces.




## Enums

When deriving `TryInto` for an enum, each enum variant gets its own
`TryFrom` implementation.
For instance, when deriving `TryInto` for an enum link this:

```rust
# use derive_more::TryInto;
#
#[derive(TryInto)]
enum MixedInts {
    SmallInt(i32),
    BigInt(i64),
    TwoSmallInts(i32, i32),
    NamedSmallInts { x: i64, y: i64 },
    UnsignedOne(u32),
    UnsignedTwo(u32),
    #[try_into(ignore)]
    NotImportant,
}
```

Code like this will be generated:

```rust
# enum MixedInts {
#     SmallInt(i32),
#     BigInt(i64),
#     TwoSmallInts(i32, i32),
#     NamedSmallInts { x: i64, y: i64 },
#     UnsignedOne(u32),
#     UnsignedTwo(u32),
# }
impl TryFrom<MixedInts> for (i32) {
    type Error = derive_more::TryIntoError<MixedInts>;
    fn try_from(value: MixedInts) -> Result<Self, derive_more::TryIntoError<MixedInts>> {
        match value {
            MixedInts::SmallInt(__0) => Ok(__0),
            _ => Err(derive_more::TryIntoError::new(value, "SmallInt", "i32")),
        }
    }
}
impl TryFrom<MixedInts> for (i64) {
    type Error = derive_more::TryIntoError<MixedInts>;
    fn try_from(value: MixedInts) -> Result<Self, derive_more::TryIntoError<MixedInts>> {
        match value {
            MixedInts::BigInt(__0) => Ok(__0),
            _ => Err(derive_more::TryIntoError::new(value, "BigInt", "i64")),
        }
    }
}
impl TryFrom<MixedInts> for (i32, i32) {
    type Error = derive_more::TryIntoError<MixedInts>;
    fn try_from(value: MixedInts) -> Result<Self, derive_more::TryIntoError<MixedInts>> {
        match value {
            MixedInts::TwoSmallInts(__0, __1) => Ok((__0, __1)),
            _ => Err(derive_more::TryIntoError::new(value, "TwoSmallInts", "(i32, i32)")),
        }
    }
}
impl TryFrom<MixedInts> for (i64, i64) {
    type Error = derive_more::TryIntoError<MixedInts>;
    fn try_from(value: MixedInts) -> Result<Self, derive_more::TryIntoError<MixedInts>> {
        match value {
            MixedInts::NamedSmallInts { x: __0, y: __1 } => Ok((__0, __1)),
            _ => Err(derive_more::TryIntoError::new(value, "NamedSmallInts", "(i64, i64)")),
        }
    }
}
impl TryFrom<MixedInts> for (u32) {
    type Error = derive_more::TryIntoError<MixedInts>;
    fn try_from(value: MixedInts) -> Result<Self, derive_more::TryIntoError<MixedInts>> {
        match value {
            MixedInts::UnsignedOne(__0) | MixedInts::UnsignedTwo(__0) => Ok(__0),
            _ => Err(derive_more::TryIntoError::new(value, "UnsignedOne", "u32")),
        }
    }
}
```

When deriving `TryInto` for an enum with Unit variants like this:

```rust
# use derive_more::TryInto;
#
#[derive(TryInto)]
enum EnumWithUnit {
    SmallInt(i32),
    Unit,
}
```

Code like this will be generated:

```rust
# enum EnumWithUnit {
#     SmallInt(i32),
#     Unit,
# }
impl TryFrom<EnumWithUnit> for (i32) {
    type Error = derive_more::TryIntoError<EnumWithUnit>;
    fn try_from(value: EnumWithUnit) -> Result<Self, derive_more::TryIntoError<EnumWithUnit>> {
        match value {
            EnumWithUnit::SmallInt(__0) => Ok(__0),
            _ => Err(derive_more::TryIntoError::new(value, "SmallInt", "i32")),
        }
    }
}
impl TryFrom<EnumWithUnit> for () {
    type Error = derive_more::TryIntoError<EnumWithUnit>;
    fn try_from(value: EnumWithUnit) -> Result<Self, derive_more::TryIntoError<EnumWithUnit>> {
        match value {
            EnumWithUnit::Unit => Ok(()),
            _ => Err(derive_more::TryIntoError::new(value, "Unit", "()")),
        }
    }
}
```




## Custom error

The `#[try_into(error(<ty>[, <conv>]))]` attribute can be used to convert the `TryIntoError` type
into a custom error type.

If the conversion function is not provided, the custom error type must implement
`From<derive_more::TryIntoError<T>>`.
The conversion function could be provided in the following forms:
- function (like `CustomError::new`);
- closure (like `|e| CustomError::new(e)`);
- function call (like `CustomError::factory()`).

This, however, doesn't support custom error with generic parameters, such as
`struct CustomError<T>(derive_more::TryIntoError<T>)` (newtype wrapper around `derive_more::TryIntoError`).

Given the following enum:
```rust
# use derive_more::TryInto;
#
struct CustomError(String);

impl<T> From<derive_more::TryIntoError<T>> for CustomError {
    fn from(value: derive_more::TryIntoError<T>) -> Self {
        Self(value.to_string())
    }
}

#[derive(TryInto, Clone, Debug)]
#[try_into(error(CustomError))]
enum MixedData {
    Int(u32),
    String(String),
}
```
Code like this is generated:
```rust
# use derive_more::TryIntoError;
#
# enum MixedData {
#     Int(u32),
#     String(String),
# }
#
# struct CustomError(String);
#
# impl<T> From<TryIntoError<T>> for CustomError {
#     fn from(value: TryIntoError<T>) -> Self {
#         Self(value.to_string())
#     }
# }
impl derive_more::core::convert::TryFrom<MixedData> for (u32) {
    type Error = CustomError;
    fn try_from(value: MixedData) -> Result<Self, CustomError> {
        match value {
            MixedData::Int(v) => Ok(v),
            _ => Err(derive_more::TryIntoError::new(value, "Int", "u32").into()),
        }
    }
}
impl derive_more::core::convert::TryFrom<MixedData> for (String) {
    type Error = CustomError;
    fn try_from(value: MixedData) -> Result<Self, CustomError> {
        match value {
            MixedData::String(v) => Ok(v),
            _ => Err(derive_more::TryIntoError::new(value, "String", "String").into()),
        }
    }
}
```


---

# OUTRO - try_into.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\try_into.rs
**SHA:** 17e3f98145367fbb
**Timestamp:** 2026-08-28T02:34:01.247441
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Use `Vec::extract_if` once MSRV is bumped to 1.87 or above.

### Ouro Bruto (primeiros 5000 chars)
```
use crate::utils::{
    add_extra_generic_param, numbered_vars, replace_self::DeriveInputExt as _,
    AttrParams, DeriveType, MultiFieldData, State,
};
use proc_macro2::TokenStream;
use quote::{format_ident, quote, ToTokens};

use crate::utils::{
    attr::{self, ParseMultiple as _},
    HashMap, Spanning,
};

/// Provides the hook to expand `#[derive(TryInto)]` into an implementation of `TryInto`.
#[allow(clippy::cognitive_complexity)]
pub fn expand(
    input: &syn::DeriveInput,
    trait_name: &'static str,
) -> syn::Result<TokenStream> {
    let input = &mut input.replace_self_type();
    let trait_attr = "try_into";

    // TODO: Use `Vec::extract_if` once MSRV is bumped to 1.87 or above.
    let (error_indices, error_attrs) = input
        .attrs
        .iter()
        .enumerate()
        .filter(|(_, attr)| {
            attr.path().is_ident(trait_attr)
                && attr.parse_args_with(detect_error_attr).is_ok()
        })
        .map(|(i, attr)| (i, attr.clone()))
        .unzip::<_, _, Vec<_>, Vec<_>>();
    for i in error_indices {
        _ = &mut input.attrs.remove(i);
    }
    let custom_error =
        attr::Error::parse_attrs(error_attrs, &format_ident!("{trait_attr}"))?
            .map(Spanning::into_inner);

    let state = State::with_attr_params(
        input,
        trait_name,
        trait_attr.into(),
        AttrParams {
            enum_: vec!["ignore", "owned", "ref", "ref_mut"],
            variant: vec!["ignore", "owned", "ref", "ref_mut"],
            struct_: vec!["ignore", "owned", "ref", "ref_mut"],
            field: vec!["ignore"],
        },
    ).map_err(|e| {
        // Temporary adjustment of attribute parsing errors until these attributes are reimplemented
        // via `utils::attr` machinery.
        let msg = &e.to_string();
        if msg == "Only a single attribute is allowed" {
            syn::Error::new(
                e.span(),
                "Only a single attribute is allowed.\n\
                 For the top-level attribute, an additional `#[try_into(error(...))]` may be \
                 provided.",
            )
        } else if msg.starts_with(
            "Attribute parameter not supported. Supported attribute parameters are:",
        ) {
            syn::Error::new(e.span(), format!("{msg}, error"))
        } else {
            e
        }
    })?;
    assert!(
        state.derive_type == DeriveType::Enum,
        "only enums can derive `TryInto`",
    );

    let mut variants_per_types = HashMap::default();

    for variant_state in state.enabled_variant_data().variant_states {
        let multi_field_data = variant_state.enabled_fields_data();
        let MultiFieldData {
            variant_info,
            field_types,
            ..
        } = multi_field_data.clone();
        for ref_type in variant_info.ref_types() {
            variants_per_types
                .entry((ref_type, field_types.clone()))
                .or_insert_with(Vec::new)
                .push(multi_field_data.clone());
        }
    }

    let mut tokens = TokenStream::new();

    for ((ref_type, ref original_types), ref multi_field_data) in variants_per_types {
        let input_type = &input.ident;

        let pattern_ref = ref_type.pattern_ref();
        let lifetime = ref_type.lifetime();
        let reference_with_lifetime = ref_type.reference_with_lifetime();

        let mut matchers = vec![];
        let vars = &numbered_vars(original_types.len(), "");
        for multi_field_data in multi_field_data {
            let patterns: Vec<_> = vars
                .iter()
                .map(|var| quote! { #pattern_ref #var })
                .collect();
            matchers.push(
                multi_field_data.matcher(&multi_field_data.field_indexes, &patterns),
            );
        }

        let vars = if vars.len() == 1 {
            quote! { #(#vars)* }
        } else {
            quote! { (#(#vars),*) }
        };

        let output_type = if original_types.len() == 1 {
            quote! { #(#original_types)* }.to_string()
        } else {
            let types = original_types
                .iter()
                .map(|t| quote! { #t }.to_string())
                .collect::<Vec<_>>();
            format!("({})", types.join(", "))
        };
        let variant_names = multi_field_data
            .iter()
            .map(|d| {
                d.variant_name
                    .expect("somehow there was no variant name")
                    .to_string()
            })
            .collect::<Vec<_>>()
            .join(", ");

        let generics_impl;
        let (_, ty_generics, where_clause) = input.generics.split_for_impl();
        let (impl_generics, _, _) = if ref_type.is_ref() {
            generics_impl = add_extra_generic_param(&input.generics, lifetime.clone());
            generics_impl.split_for_impl()
        } else {
            input.generics.split_for_impl()
        };

        let mut error_ty = quote! {
       
```