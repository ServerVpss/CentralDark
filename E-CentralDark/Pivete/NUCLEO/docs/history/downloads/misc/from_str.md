# What `#[derive(FromStr)]` generates

Deriving `FromStr` only works for enums/structs with no fields
or newtypes (structs with only a single field). The result is
that you will be able to call the `parse()` method on a string
to convert it to your newtype. This only works when the wrapped
type implements `FromStr` itself.




## Forwarding

Deriving forwarding implementation is only supported for newtypes
(structs with only a single field).


### Tuple structs

When deriving `FromStr` for a tuple struct with one field:
```rust
# use derive_more::FromStr;
#
#[derive(FromStr, Debug, Eq, PartialEq)]
struct MyInt(i32);

assert_eq!("5".parse::<MyInt>().unwrap(), MyInt(5));
```

Code like this is generated:
```rust
# struct MyInt(i32);
impl derive_more::core::str::FromStr for MyInt {
    type Err = <i32 as derive_more::core::str::FromStr>::Err;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(i32::from_str(s)?))
    }
}
```


### Regular structs

When deriving `FromStr` for a regular struct with one field:
```rust
# use derive_more::FromStr;
#
#[derive(FromStr, Debug, Eq, PartialEq)]
struct Point1D {
    x: i32,
}

assert_eq!("100".parse::<Point1D>().unwrap(), Point1D { x: 100 });
```

Code like this is generated:
```rust
# struct Point1D {
#     x: i32,
# }
impl derive_more::core::str::FromStr for Point1D {
    type Err = <i32 as derive_more::core::str::FromStr>::Err;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self {
            x: i32::from_str(s)?,
        })
    }
}
```




## Flat representation

Deriving flat string representation is only supported for empty enums and
structs (with no fields).


### Empty enums

When deriving `FromStr` for enums with empty variants, it will generate a
`from_str()` method converting strings matching the variant name to the variant.
If using a case-insensitive match would give a unique variant (i.e. you don't have
both `MyEnum::Foo` and `MyEnum::foo` variants), then case-insensitive matching will
be used, otherwise it will fall back to exact string matching.

Since the string may not match any variants an error type is needed, so the
`derive_more::FromStrError` is used for that purpose.

Given the following enum:
```rust
# use derive_more::FromStr;
#
#[derive(FromStr, Debug, Eq, PartialEq)]
enum EnumNoFields {
    Foo,
    Bar,
    Baz,
    BaZ,
}

assert_eq!("foo".parse::<EnumNoFields>().unwrap(), EnumNoFields::Foo);
assert_eq!("Foo".parse::<EnumNoFields>().unwrap(), EnumNoFields::Foo);
assert_eq!("FOO".parse::<EnumNoFields>().unwrap(), EnumNoFields::Foo);

assert_eq!("Bar".parse::<EnumNoFields>().unwrap(), EnumNoFields::Bar);
assert_eq!("bar".parse::<EnumNoFields>().unwrap(), EnumNoFields::Bar);

assert_eq!("Baz".parse::<EnumNoFields>().unwrap(), EnumNoFields::Baz);
assert_eq!("BaZ".parse::<EnumNoFields>().unwrap(), EnumNoFields::BaZ);
assert_eq!(
    "other".parse::<EnumNoFields>().unwrap_err().to_string(),
    "Invalid `EnumNoFields` string representation",
);
```

Code like this is generated:
```rust
# use core::str::FromStr;
#
# enum EnumNoFields {
#     Foo,
#     Bar,
#     Baz,
#     BaZ,
# }
#
impl derive_more::core::str::FromStr for EnumNoFields {
    type Err = derive_more::FromStrError;
    fn from_str(s: &str) -> Result<Self, <Self as FromStr>::Err> {
        Ok(match s.to_lowercase().as_str() {
            "foo" => Self::Foo,
            "bar" => Self::Bar,
            "baz" if s == "Baz" => Self::Baz,
            "baz" if s == "BaZ" => Self::BaZ,
            _ => return Err(derive_more::FromStrError::new("EnumNoFields")),
        })
    }
}
```


### Empty structs

Deriving `FromStr` for structs with no fields is similar to enums,
but involves only case-insensitive matching by now.

Given the following struct:
```rust
# use derive_more::FromStr;
#
#[derive(FromStr, Debug, Eq, PartialEq)]
struct Foo;

assert_eq!("foo".parse::<Foo>().unwrap(), Foo);
assert_eq!("Foo".parse::<Foo>().unwrap(), Foo);
assert_eq!("FOO".parse::<Foo>().unwrap(), Foo);
```

Code like this is generated:
```rust
# use core::str::FromStr;
#
# struct Foo;
#
impl derive_more::core::str::FromStr for Foo {
    type Err = derive_more::FromStrError;
    fn from_str(s: &str) -> Result<Self, <Self as FromStr>::Err> {
        Ok(match s.to_lowercase().as_str() {
            "foo" => Self,
            _ => return Err(derive_more::FromStrError::new("Foo")),
        })
    }
}
```


### The `rename_all` attribute

To control the concrete string representation of the name verbatim,
the `#[from_str(rename_all = "...")]` attribute can be placed on structs,
enums and variants.

The available casings are:
- `lowercase`
- `UPPERCASE`
- `PascalCase`
- `camelCase`
- `snake_case`
- `SCREAMING_SNAKE_CASE`
- `kebab-case`
- `SCREAMING-KEBAB-CASE`

```rust
# use derive_more::FromStr;
#
#[derive(FromStr, Debug, Eq, PartialEq)]
#[from_str(rename_all = "lowercase")]
enum Enum {
    VariantOne,
    #[from_str(rename_all = "kebab-case")] // overrides the top-level one
    VariantTwo
}

assert_eq!("variantone".parse::<Enum>().unwrap(), Enum::VariantOne);
assert_eq!("variant-two".parse::<Enum>().unwrap(), Enum::VariantTwo);
```

> **NOTE**: Using `#[from_str(rename_all = "...")]` attribute disables
> any case-insensitivity where applied. This is also true for any enum
> variant whose name or string representation is similar to the variant
> being marked:
> ```rust
> # use derive_more::FromStr;
> #
> # #[allow(non_camel_case_types)]
> #[derive(FromStr, Debug, Eq, PartialEq)]
> enum Enum {
>    Foo,  // case-insensitive
>    #[from_str(rename_all = "SCREAMING_SNAKE_CASE")]
>    BaR,  // case-sensitive (marked with attribute)
>    Bar,  // case-sensitive (name is similar to the marked `BaR` variant)
>    Ba_R, // case-sensitive (string representation is similar to the marked `BaR` variant)
> }
> #
> # assert_eq!("Foo".parse::<Enum>().unwrap(), Enum::Foo);
> # assert_eq!("FOO".parse::<Enum>().unwrap(), Enum::Foo);
> # assert_eq!("foo".parse::<Enum>().unwrap(), Enum::Foo);
> #
> # assert_eq!("BA_R".parse::<Enum>().unwrap(), Enum::BaR);
> # assert_eq!("Bar".parse::<Enum>().unwrap(), Enum::Bar);
> # assert_eq!("Ba_R".parse::<Enum>().unwrap(), Enum::Ba_R);
> ```




## Custom error

The `#[from_str(error(<ty>[, <conv>]))]` attribute can be used to convert the `FromStr`' `Err` type
into a custom error type.

If the conversion function is not provided, the custom error type must implement `From<FromStr::Err>`.
The conversion function could be provided in the following forms:
- function (like `CustomError::new`);
- closure (like `|e| CustomError::new(e)`);
- function call (like `CustomError::factory()`).


### Forwarding

Given the following struct:
```rust
# use derive_more::{From, FromStr};
#
#[derive(From)]
struct CustomError(core::num::ParseIntError);

#[derive(FromStr, Debug, Eq, PartialEq)]
#[from_str(error(CustomError))]
struct MyInt(i32);
```
Code like this is generated:
```rust
# use core::str::FromStr;
# use derive_more::From;
#
# #[derive(From)]
# struct CustomError(core::num::ParseIntError);
#
# struct MyInt(i32);
#
impl derive_more::core::str::FromStr for MyInt {
    type Err = CustomError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        FromStr::from_str(s)
            .map(|v| Self(v))
            .map_err(Into::into)
    }
}
```

For the explicitly specified error conversion:
```rust
# use derive_more::FromStr;
#
struct CustomError(core::num::ParseIntError);

impl CustomError {
    fn new(err: core::num::ParseIntError) -> Self {
        Self(err)
    }
}

#[derive(FromStr, Debug, Eq, PartialEq)]
#[from_str(error(CustomError, CustomError::new))]
struct MyInt(i32);
```
Code like this is generated:
```rust
# use core::str::FromStr;
#
# struct CustomError(core::num::ParseIntError);
#
# impl CustomError {
#     fn new(err: core::num::ParseIntError) -> Self {
#         Self(err)
#     }
# }
#
# struct MyInt(i32);
#
impl derive_more::core::str::FromStr for MyInt {
    type Err = CustomError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        FromStr::from_str(s)
            .map(|v| Self(v))
            .map_err(CustomError::new)
    }
}
```

Custom error for a newtype struct with one named field, *e.g*,
```rust
# use derive_more::{From, FromStr};
#
#[derive(From)]
struct CustomError(core::num::ParseIntError);

#[derive(FromStr)]
#[from_str(error(CustomError))]
struct Point1D {
    x: i32,
}
```
works similarly.


### Flat representation

Custom error type is also supported for empty enums and unit structs.

Given the following enum:
```rust
# use derive_more::{From, FromStr};
#
#[derive(From)]
struct CustomError(derive_more::FromStrError);

#[derive(FromStr, Debug, Eq, PartialEq)]
#[from_str(error(CustomError))]
enum EnumNoFields {
    Foo,
    Bar,
    Baz,
}
```
Code like this is generated:
```rust
# use core::str::FromStr;
# use derive_more::From;
#
# #[derive(From)]
# struct CustomError(derive_more::FromStrError);
#
# enum EnumNoFields {
#     Foo,
#     Bar,
#     Baz,
# }
#
impl derive_more::core::str::FromStr for EnumNoFields {
    type Err = CustomError;
    fn from_str(s: &str) -> Result<Self, <Self as FromStr>::Err> {
        Ok(match s.to_lowercase().as_str() {
            "foo" => Self::Foo,
            "bar" => Self::Bar,
            "baz" => Self::Baz,
            _ => return Err(derive_more::FromStrError::new("EnumNoFields").into()),
        })
    }
}
```

For the explicitly specified error conversion:
```rust
# use derive_more::FromStr;
#
struct CustomError(derive_more::FromStrError);

impl CustomError {
   pub fn new(err: derive_more::FromStrError) -> Self {
       Self(err)
   }
}

#[derive(FromStr, Debug, Eq, PartialEq)]
#[from_str(error(CustomError, CustomError::new))]
enum EnumNoFields {
    Foo,
    Bar,
    Baz,
}
```
Code like this is generated:
```rust
# use core::str::FromStr;
#
# struct CustomError(derive_more::FromStrError);
#
# impl CustomError {
#    pub fn new(err: derive_more::FromStrError) -> Self {
#        Self(err)
#    }
# }
#
# enum EnumNoFields {
#     Foo,
#     Bar,
#     Baz,
# }
#
impl derive_more::core::str::FromStr for EnumNoFields {
    type Err = CustomError;
    fn from_str(s: &str) -> Result<Self, <Self as FromStr>::Err> {
        Ok(match s.to_lowercase().as_str() {
            "foo" => Self::Foo,
            "bar" => Self::Bar,
            "baz" => Self::Baz,
            _ => return Err(CustomError::new(derive_more::FromStrError::new("EnumNoFields"))),
        })
    }
}
```

Custom error type for unit structs, *e.g*,
```rust
# use derive_more::{From, FromStr};
#
#[derive(From)]
struct CustomError(derive_more::FromStrError);

#[derive(FromStr)]
#[from_str(error(CustomError))]
struct Foo;
```
works similarly.


---

# OUTRO - from_str.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\from_str.rs
**SHA:** d717624c6bc684dd
**Timestamp:** 2026-08-28T02:34:01.015699
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Unite these two conditions via `&&` once MSRV is bumped to 1.88 or above.

### Ouro Bruto (primeiros 5000 chars)
```
//! Implementation of a [`FromStr`] derive macro.

#[cfg(doc)]
use std::str::FromStr;
use std::{collections::HashMap, iter};

use proc_macro2::TokenStream;
use quote::{format_ident, quote, ToTokens};
use syn::{parse::Parse, parse_quote, spanned::Spanned as _};

use crate::utils::{
    attr::{self, ParseMultiple as _},
    Either, GenericsSearch, Spanning,
};

/// Expands a [`FromStr`] derive macro.
pub fn expand(input: &syn::DeriveInput, _: &'static str) -> syn::Result<TokenStream> {
    match &input.data {
        syn::Data::Struct(data) => Ok(if data.fields.is_empty() {
            FlatExpansion::try_from(input)?.into_token_stream()
        } else {
            ForwardExpansion::try_from(input)?.into_token_stream()
        }),
        syn::Data::Enum(_) => Ok(FlatExpansion::try_from(input)?.into_token_stream()),
        syn::Data::Union(data) => Err(syn::Error::new(
            data.union_token.span(),
            "`FromStr` cannot be derived for unions",
        )),
    }
}

/// Expansion of a macro for generating a forwarding [`FromStr`] implementation of a struct.
struct ForwardExpansion<'i> {
    /// [`syn::Ident`] and [`syn::Generics`] of the struct.
    ///
    /// [`syn::Ident`]: struct@syn::Ident
    self_ty: (&'i syn::Ident, &'i syn::Generics),

    /// [`syn::Field`] representing the wrapped type to forward implementation on.
    inner: &'i syn::Field,

    /// Optional [`attr::Error`] enabling conversion into a custom error type.
    custom_error: Option<attr::Error>,
}

impl<'i> TryFrom<&'i syn::DeriveInput> for ForwardExpansion<'i> {
    type Error = syn::Error;

    fn try_from(input: &'i syn::DeriveInput) -> syn::Result<Self> {
        let syn::Data::Struct(data) = &input.data else {
            return Err(syn::Error::new(
                input.span(),
                "expected a struct for forward `FromStr` derive",
            ));
        };

        // TODO: Unite these two conditions via `&&` once MSRV is bumped to 1.88 or above.
        if data.fields.len() != 1 {
            return Err(syn::Error::new(
                data.fields.span(),
                "only structs with single field can derive `FromStr`",
            ));
        }
        let Some(inner) = data.fields.iter().next() else {
            return Err(syn::Error::new(
                data.fields.span(),
                "only structs with single field can derive `FromStr`",
            ));
        };

        let custom_error =
            attr::Error::parse_attrs(&input.attrs, &format_ident!("from_str"))?
                .map(Spanning::into_inner);

        Ok(Self {
            self_ty: (&input.ident, &input.generics),
            inner,
            custom_error,
        })
    }
}

impl ToTokens for ForwardExpansion<'_> {
    /// Expands a forwarding [`FromStr`] implementations for a struct.
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let inner_ty = &self.inner.ty;
        let ty = self.self_ty.0;

        let generics_search = GenericsSearch::from(self.self_ty.1);
        let mut generics = self.self_ty.1.clone();
        if generics_search.any_in(inner_ty) {
            generics.make_where_clause().predicates.push(parse_quote! {
                #inner_ty: derive_more::core::str::FromStr
            });
        }
        let (impl_generics, ty_generics, where_clause) = generics.split_for_impl();

        let constructor = self.inner.self_constructor([parse_quote! { v }]);

        let mut error_ty =
            quote! { <#inner_ty as derive_more::core::str::FromStr>::Err };
        let mut error_conv = quote! {};
        if let Some(custom_error) = &self.custom_error {
            error_ty = custom_error.ty.to_token_stream();
            error_conv = custom_error.conv.as_ref().map_or_else(
                || quote! { .map_err(derive_more::core::convert::Into::into) },
                |conv| quote! { .map_err(#conv) },
            );
        }

        quote! {
            #[automatically_derived]
            impl #impl_generics derive_more::core::str::FromStr for #ty #ty_generics #where_clause {
                type Err = #error_ty;

                #[inline]
                fn from_str(s: &str) -> derive_more::core::result::Result<Self, Self::Err> {
                    derive_more::core::str::FromStr::from_str(s).map(|v| #constructor)#error_conv
                }
            }
        }.to_tokens(tokens);
    }
}

/// Expansion of a macro for generating a flat [`FromStr`] implementation of an enum or a struct.
struct FlatExpansion<'i> {
    /// [`syn::Ident`] and [`syn::Generics`] of the enum/struct.
    ///
    /// [`syn::Ident`]: struct@syn::Ident
    self_ty: (&'i syn::Ident, &'i syn::Generics),

    /// [`syn::Ident`]s along with the matched values (enum variants or struct itself), and
    /// a value-specific [`attr::RenameAll`] overriding [`FlatExpansion::rename_all`], if any.
    ///
    /// [`syn::Ident`]: struct@syn::Ident
    matches: Vec<(
        &'i syn::Ident,
        Either<&'i syn::DataS
```