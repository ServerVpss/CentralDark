# What `#[derive(Display)]` generates

Deriving `Display` will generate a `Display` implementation, with a `fmt`
method that matches `self` and each of its variants. In the case of a struct or union,
only a single variant is available, and it is thus equivalent to a simple `let` statement.
In the case of an enum, each of its variants is matched.

For each matched variant, a `write!` expression will be generated with
the supplied format, or an automatically inferred one.

You specify the format on each variant by writing e.g. `#[display("my val: {}", some_val * 2)]`.
For enums, you can either specify it on each variant, or on the enum as a whole.

For variants that don't have a format specified, it will simply defer to the format of the
inner variable. If there is no such variable, or there is more than 1, an error is generated.
The only exception are unit variants, for these the name of the variant will be used if no
format is specified. This can be controlled with the
[`#[display(rename_all = "...")]` attribute](#The-`rename_all`-attribute).




## The format of the format

You supply a format by attaching an attribute of the syntax: `#[display("...", args...)]`.
The format supplied is passed verbatim to `write!`.

The variables available in the arguments is `self` and each member of the
struct or enum variant, with members of tuple structs being named with a
leading underscore and their index, i.e. `_0`, `_1`, `_2`, etc. Due to
ownership/lifetime limitations the member variables are all references to the
fields, except when used directly in the format string. For most purposes this
detail doesn't matter, but it is quite important when using `Pointer`
formatting. If you don't use the `{field:p}` syntax, you have to dereference
once to get the address of the field itself, instead of the address of the
reference to the field:

```rust
# use derive_more::with_trait::Display;
#
#[derive(Display)]
#[display("{field:p} {:p}", *field)]
struct RefInt<'a> {
    field: &'a i32,
}

let a = &123;
assert_eq!(format!("{}", RefInt{field: &a}), format!("{a:p} {:p}", a));
```


### Other formatting traits

The syntax does not change, but the name of the attribute is the snake case version of the trait.
E.g. `Octal` -> `octal`, `Pointer` -> `pointer`, `UpperHex` -> `upper_hex`.

Note, that `Debug` has a slightly different API and semantics, described in its docs, and so,
requires a separate `debug` feature.


### Generic data types

When deriving `Display` (or other formatting trait) for a generic struct/enum, all generic type
arguments used during formatting are bound by respective formatting trait.
Bounds can only be inferred this way if a field is used directly in the interpolation.

E.g., for a structure `Foo` defined like this:
```rust
# use derive_more::Display;
#
# trait Trait { type Type; }
#
#[derive(Display)]
#[display("{a} {b} {c:?} {d:p}")]
struct Foo<'a, T1, T2: Trait, T3> {
    a: T1,
    b: <T2 as Trait>::Type,
    c: Vec<T3>,
    d: &'a T1,
}
```

The following where clauses would be generated:
* `T1: Display`
* `<T2 as Trait>::Type: Display`
* `Vec<T3>: Debug`
* `&'a T1: Pointer`


### Custom trait bounds

Sometimes you may want to specify additional trait bounds on your generic type parameters, so that they
could be used during formatting. This can be done with a `#[display(bound(...))]` attribute.

`#[display(bound(...))]` accepts code tokens in a format similar to the format
used in angle bracket list (or `where` clause predicates): `T: MyTrait, U: Trait1 + Trait2`.

`#[display("fmt", ...)]` arguments are parsed as an arbitrary Rust expression and passed to generated
`write!` as-is, it's impossible to meaningfully infer any kind of trait bounds for generic type parameters
used this way. That means that you'll **have to** explicitly specify all the required trait bounds of the
expression. Either in the struct/enum definition, or via `#[display(bound(...))]` attribute.

Explicitly specified bounds are added to the inferred ones. Note how no `V: Display` bound is necessary,
because it's inferred already.

```rust
# use derive_more::with_trait::Display;
#
# trait MyTrait { fn my_function(&self) -> i32; }
#
#[derive(Display)]
#[display(bound(T: MyTrait, U: Display))]
#[display("{} {} {}", a.my_function(), b.to_string().len(), c)]
struct MyStruct<T, U, V> {
    a: T,
    b: U,
    c: V,
}
```


### Transparency

If the `#[display("...", args...)]` attribute is omitted, the implementation transparently delegates to the format
of the inner type, so all the additional [formatting parameters][1] do work as expected:
```rust
# use derive_more::Display;
#
#[derive(Display)]
struct MyInt(i32);

assert_eq!(format!("{:03}", MyInt(7)), "007");
```

If the `#[display("...", args...)]` attribute is specified and can be trivially substituted with a transparent
delegation call to the inner type, then additional [formatting parameters][1] will work too:
```rust
# use derive_more::Display;
#
#[derive(Display)]
#[display("{_0:o}")] // the same as calling `Octal::fmt()`
struct MyOctalInt(i32);

// so, additional formatting parameters do work transparently
assert_eq!(format!("{:03}", MyOctalInt(9)), "011");

#[derive(Display)]
#[display("{_0:02b}")]   // cannot be trivially substituted with `Binary::fmt()`,
struct MyBinaryInt(i32); // because of specified formatting parameters

// so, additional formatting parameters have no effect
assert_eq!(format!("{:07}", MyBinaryInt(2)), "10");
```

If, for some reason, transparency in trivial cases is not desired, it may be suppressed explicitly
either with the [`format_args!()`] macro usage:
```rust
# use derive_more::Display;
#
#[derive(Display)]
#[display("{}", format_args!("{_0:o}"))] // `format_args!()` obscures the inner type
struct MyOctalInt(i32);

// so, additional formatting parameters have no effect
assert_eq!(format!("{:07}", MyOctalInt(9)), "11");
```
Or by adding [formatting parameters][1] which cause no visual effects:
```rust
# use derive_more::Display;
#
#[derive(Display)]
#[display("{_0:^o}")] // `^` is centering, but in absence of additional width has no effect
struct MyOctalInt(i32);

// and so, additional formatting parameters have no effect
assert_eq!(format!("{:07}", MyOctalInt(9)), "11");
```


### Shared enum format

Enums can have shared top-level `#[display("...", args...)]` attribute. Depending on its contents,
it can act either as a default format or a wrapping one.

#### Wrapping enum format

To act as a wrapping format, the shared top-level `#[display("...", args...)]` attribute should
contain at least one special `{_variant}` placeholder, which is then replaced by the format string
that's provided (or inferred) on the variant.
```rust
# use derive_more::Display;
#
#[derive(Display)]
#[display("Variant: {_variant} & {}", _variant)]
enum Enum {
    #[display("A {_0}")]
    A(i32),
    B { field: i32 },
    #[display("c")]
    C,
}

assert_eq!(Enum::A(1).to_string(), "Variant: A 1 & A 1");
assert_eq!(Enum::B { field: 2 }.to_string(), "Variant: 2 & 2");
assert_eq!(Enum::C.to_string(), "Variant: c & c");
```

#### Default enum format

If the shared top-level `#[display("...", args...)]` attribute contains no `{_variant}` placeholders,
then it acts as the default one for the variants without its own format.
```rust
# use derive_more::Display;
#
#[derive(Display)]
#[display("Variant: {_0} & {}", _0)] // fields can be used too!
enum Enum {
    #[display("A {_0}")]
    A(i32),
    B(u32),
    #[display("c")]
    C,
}

assert_eq!(Enum::A(1).to_string(), "A 1");
assert_eq!(Enum::B(2).to_string(), "Variant: 2 & 2");
assert_eq!(Enum::C.to_string(), "c");
```


### The `rename_all` attribute

When no format is specified, deriving `Display` uses the variant name verbatim as its format.
To control this the `#[display(rename_all = "...")]` attribute can be placed on structs, enums and variants.

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
# use derive_more::Display;
#
#[derive(Display)]
#[display(rename_all = "lowercase")]
enum Enum {
    VariantOne,
    #[display(rename_all = "kebab-case")] // overrides the top-level one
    VariantTwo
}

assert_eq!(Enum::VariantOne.to_string(), "variantone");
assert_eq!(Enum::VariantTwo.to_string(), "variant-two");
```




## Example usage

```rust
# use std::path::PathBuf;
#
# use derive_more::{Display, Octal, UpperHex};
#
#[derive(Display)]
struct MyInt(i32);

#[derive(Display)]
#[display("({x}, {y})")]
struct Point2D {
    x: i32,
    y: i32,
}

#[derive(Display)]
#[display("Enum E: {_variant}")]
enum E {
    Uint(u32),
    #[display("I am B {:b}", i)]
    Binary {
        i: i8,
    },
    #[display("I am C {}", _0.display())]
    Path(PathBuf),
}

#[derive(Display)]
#[display("Enum E2: {_0:?}")]
enum E2 {
    Uint(u32),
    String(&'static str, &'static str),
}

#[derive(Display)]
#[display("Hello there!")]
union U {
    i: u32,
}

#[derive(Octal)]
#[octal("7")]
struct S;

#[derive(UpperHex)]
#[upper_hex("UpperHex")]
struct UH;

#[derive(Display)]
struct Unit;

#[derive(Display)]
struct UnitStruct {}

#[derive(Display)]
#[display("{}", self.sign())]
struct PositiveOrNegative {
    x: i32,
}

impl PositiveOrNegative {
    fn sign(&self) -> &str {
        if self.x >= 0 {
            "Positive"
        } else {
            "Negative"
        }
    }
}

assert_eq!(MyInt(-2).to_string(), "-2");
assert_eq!(Point2D { x: 3, y: 4 }.to_string(), "(3, 4)");
assert_eq!(E::Uint(2).to_string(), "Enum E: 2");
assert_eq!(E::Binary { i: -2 }.to_string(), "Enum E: I am B 11111110");
assert_eq!(E::Path("abc".into()).to_string(), "Enum E: I am C abc");
assert_eq!(E2::Uint(2).to_string(), "Enum E2: 2");
assert_eq!(E2::String("shown", "ignored").to_string(), "Enum E2: \"shown\"");
assert_eq!(U { i: 2 }.to_string(), "Hello there!");
assert_eq!(format!("{:o}", S), "7");
assert_eq!(format!("{:X}", UH), "UpperHex");
assert_eq!(Unit.to_string(), "Unit");
assert_eq!(UnitStruct {}.to_string(), "UnitStruct");
assert_eq!(PositiveOrNegative { x: 1 }.to_string(), "Positive");
assert_eq!(PositiveOrNegative { x: -1 }.to_string(), "Negative");
```




[`format_args!()`]: https://doc.rust-lang.org/stable/std/macro.format_args.html

[1]: https://doc.rust-lang.org/stable/std/fmt/index.html#formatting-parameters


---

# CHROME - display.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\fmt\display.rs
**SHA:** d89038991be0df38
**Timestamp:** 2026-08-28T02:34:01.348254
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This limitation can be lifted, by analyzing the `shared_fmt` deeper and using

### Ouro Bruto (primeiros 5000 chars)
```
//! Implementation of [`fmt::Display`]-like derive macros.

#[cfg(doc)]
use std::fmt;

use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use syn::{
    ext::IdentExt as _,
    parse::{Parse, ParseStream},
    parse_quote,
    spanned::Spanned as _,
    token, LitStr,
};

use crate::utils::{
    attr::{self, ParseMultiple as _},
    Spanning,
};

use super::{trait_name_to_attribute_name, ContainsGenericsExt as _, FmtAttribute};

/// Expands a [`fmt::Display`]-like derive macro.
///
/// Available macros:
/// - [`Binary`](fmt::Binary)
/// - [`Display`](fmt::Display)
/// - [`LowerExp`](fmt::LowerExp)
/// - [`LowerHex`](fmt::LowerHex)
/// - [`Octal`](fmt::Octal)
/// - [`Pointer`](fmt::Pointer)
/// - [`UpperExp`](fmt::UpperExp)
/// - [`UpperHex`](fmt::UpperHex)
pub fn expand(input: &syn::DeriveInput, trait_name: &str) -> syn::Result<TokenStream> {
    let trait_name = normalize_trait_name(trait_name);
    let attr_name = format_ident!("{}", trait_name_to_attribute_name(trait_name));

    let attrs = ContainerAttributes::parse_attrs(&input.attrs, &attr_name)?
        .map(Spanning::into_inner)
        .unwrap_or_default();
    let trait_ident = format_ident!("{trait_name}");
    let ident = &input.ident;

    let type_params = input
        .generics
        .params
        .iter()
        .filter_map(|p| match p {
            syn::GenericParam::Type(t) => Some(&t.ident),
            syn::GenericParam::Const(..) | syn::GenericParam::Lifetime(..) => None,
        })
        .collect::<Vec<_>>();

    let ctx: ExpansionCtx = (&attrs, &type_params, ident, &trait_ident, &attr_name);
    let (bounds, body) = match &input.data {
        syn::Data::Struct(s) => expand_struct(s, ctx),
        syn::Data::Enum(e) => expand_enum(e, ctx),
        syn::Data::Union(u) => expand_union(u, ctx),
    }?;

    let (impl_gens, ty_gens, where_clause) = {
        let (impl_gens, ty_gens, where_clause) = input.generics.split_for_impl();
        let mut where_clause = where_clause
            .cloned()
            .unwrap_or_else(|| parse_quote! { where });
        where_clause.predicates.extend(bounds);
        (impl_gens, ty_gens, where_clause)
    };

    Ok(quote! {
        #[allow(deprecated)] // omit warnings on deprecated fields/variants
        #[allow(unreachable_code)] // omit warnings for `!` and other unreachable types
        #[automatically_derived]
        impl #impl_gens derive_more::core::fmt::#trait_ident for #ident #ty_gens #where_clause {
            fn fmt(
                &self, __derive_more_f: &mut derive_more::core::fmt::Formatter<'_>
            ) -> derive_more::core::fmt::Result {
                #body
            }
        }
    })
}

/// Representation of possible [`fmt::Display`]-like derive macro attributes placed on a container
/// (struct or enum variant).
///
/// ```rust,ignore
/// #[<attribute>("<fmt-literal>", <fmt-args>)]
/// #[<attribute>(bound(<where-predicates>))]
/// #[<attribute>(rename_all = "<casing>")]
/// ```
///
/// `#[<attribute>("...")]` and `#[<attribute>(rename_all = "...")]` can be specified only once,
/// while multiple `#[<attribute>(bound(...))]` are allowed.
#[derive(Debug, Default)]
struct ContainerAttributes {
    /// [`attr::RenameAll`] for case conversion.
    rename_all: Option<attr::RenameAll>,

    /// Common [`ContainerAttributes`].
    ///
    /// [`ContainerAttributes`]: super::ContainerAttributes
    common: super::ContainerAttributes,
}

impl Parse for ContainerAttributes {
    fn parse(input: ParseStream<'_>) -> syn::Result<Self> {
        mod ident {
            use syn::custom_keyword;

            custom_keyword!(bounds);
            custom_keyword!(bound);
            custom_keyword!(rename_all);
        }

        // We do check `FmtAttribute::check_legacy_fmt` eagerly here, because `.lookahead1()` won't
        // check for the `fmt =` ident below, to omit including it into the `ahead.error()`.
        FmtAttribute::check_legacy_fmt(input)?;

        // We use `.lookahead1()` with all possible idents to form a nice error message including
        // all the possible variants.
        let ahead = input.lookahead1();
        if ahead.peek(LitStr)
            || ahead.peek(ident::bounds)
            || ahead.peek(ident::bound)
            || ahead.peek(token::Where)
        {
            Ok(Self {
                common: input.parse()?,
                ..Default::default()
            })
        } else if ahead.peek(ident::rename_all) {
            Ok(Self {
                rename_all: Some(input.parse()?),
                ..Self::default()
            })
        } else {
            Err(ahead.error())
        }
    }
}

impl attr::ParseMultiple for ContainerAttributes {
    fn merge_attrs(
        prev: Spanning<Self>,
        new: Spanning<Self>,
        name: &syn::Ident,
    ) -> syn::Result<Spanning<Self>> {
        let Spanning {
            span: prev_span,
            item: mut prev,
        } = prev;
        let Spanning {
            span: ne
```

---

# CHROME - display.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\thiserror-1.0.69\src\display.rs
**SHA:** 96d41ba28038a699
**Timestamp:** 2026-08-28T02:36:01.967669
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: convert to generic associated type.

### Ouro Bruto (primeiros 5000 chars)
```
use core::fmt::Display;
use std::path::{self, Path, PathBuf};

#[doc(hidden)]
pub trait AsDisplay<'a>: Sealed {
    // TODO: convert to generic associated type.
    // https://github.com/dtolnay/thiserror/pull/253
    type Target: Display;

    fn as_display(&'a self) -> Self::Target;
}

impl<'a, T> AsDisplay<'a> for &T
where
    T: Display + 'a,
{
    type Target = &'a T;

    fn as_display(&'a self) -> Self::Target {
        *self
    }
}

impl<'a> AsDisplay<'a> for Path {
    type Target = path::Display<'a>;

    #[inline]
    fn as_display(&'a self) -> Self::Target {
        self.display()
    }
}

impl<'a> AsDisplay<'a> for PathBuf {
    type Target = path::Display<'a>;

    #[inline]
    fn as_display(&'a self) -> Self::Target {
        self.display()
    }
}

#[doc(hidden)]
pub trait Sealed {}
impl<T: Display> Sealed for &T {}
impl Sealed for Path {}
impl Sealed for PathBuf {}

```

---

# CHROME - display.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\thiserror-2.0.20\src\display.rs
**SHA:** 0e9f6faedf726e2d
**Timestamp:** 2026-08-28T02:36:03.580677
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: convert to generic associated type.

### Ouro Bruto (primeiros 5000 chars)
```
use core::fmt::Display;
#[cfg(feature = "std")]
use std::path::{self, Path, PathBuf};

#[doc(hidden)]
pub trait AsDisplay<'a>: Sealed {
    // TODO: convert to generic associated type.
    // https://github.com/dtolnay/thiserror/pull/253
    type Target: Display;

    fn as_display(&'a self) -> Self::Target;
}

impl<'a, T> AsDisplay<'a> for &T
where
    T: Display + ?Sized + 'a,
{
    type Target = &'a T;

    fn as_display(&'a self) -> Self::Target {
        *self
    }
}

#[cfg(feature = "std")]
impl<'a> AsDisplay<'a> for Path {
    type Target = path::Display<'a>;

    #[inline]
    fn as_display(&'a self) -> Self::Target {
        self.display()
    }
}

#[cfg(feature = "std")]
impl<'a> AsDisplay<'a> for PathBuf {
    type Target = path::Display<'a>;

    #[inline]
    fn as_display(&'a self) -> Self::Target {
        self.display()
    }
}

#[doc(hidden)]
pub trait Sealed {}
impl<T: Display + ?Sized> Sealed for &T {}
#[cfg(feature = "std")]
impl Sealed for Path {}
#[cfg(feature = "std")]
impl Sealed for PathBuf {}

// Add a synthetic second impl of AsDisplay to prevent the "single applicable
// impl" rule from making too weird inference decision based on the single impl
// for &T, which could lead to code that compiles with thiserror's std feature
// off but breaks under feature unification when std is turned on by an
// unrelated crate.
#[cfg(not(feature = "std"))]
mod placeholder {
    use super::{AsDisplay, Sealed};
    use core::fmt::{self, Display};

    #[allow(dead_code)]
    pub struct Placeholder;

    impl<'a> AsDisplay<'a> for Placeholder {
        type Target = Self;

        #[inline]
        fn as_display(&'a self) -> Self::Target {
            Placeholder
        }
    }

    impl Display for Placeholder {
        fn fmt(&self, _formatter: &mut fmt::Formatter) -> fmt::Result {
            unreachable!()
        }
    }

    impl Sealed for Placeholder {}
}

```