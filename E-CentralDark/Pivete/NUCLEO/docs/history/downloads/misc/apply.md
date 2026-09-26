# OUTRO - apply.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_with_macros-3.21.0\src\apply.rs
**SHA:** 0ba61aff7f87fc3e
**Timestamp:** 2026-08-28T02:35:37.496122
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- fn ty_pattern_matches_ty(ty_pattern: &Type, ty: &Type) -> bool {
- let len_match = len_pattern == len || len_pattern.to_token_stream().to_string() == "_";
- (Type::BareFn(ty_pattern), Type::BareFn(ty)) => ty_pattern == ty,
- (Type::ImplTrait(ty_pattern), Type::ImplTrait(ty)) => ty_pattern == ty,
- (Type::Macro(ty_pattern), Type::Macro(ty)) => ty_pattern == ty,
- fn path_pattern_matches_path(path_pattern: &Path, path: &Path) -> bool {
- (args_pattern, args) => args_pattern == args,
- qself_pattern == qself && path_pattern_matches_path(path_pattern, path)
- const_token_pattern == const_token
- && mutability_pattern == mutability

### Ouro Bruto (primeiros 5000 chars)
```
use darling::{ast::NestedMeta, Error as DarlingError, FromMeta};
use proc_macro::TokenStream;
use quote::ToTokens as _;
use syn::{
    parse::{Parse, ParseStream},
    punctuated::Punctuated,
    Attribute, Error, Field, Path, Token, Type, TypeArray, TypeGroup, TypeParen, TypePath, TypePtr,
    TypeReference, TypeSlice, TypeTuple,
};

/// Parsed form of a single rule in the `#[apply(...)]` attribute.
///
/// This parses tokens in the shape of `Type => Attribute`.
/// For example, `Option<String> => #[serde(default)]`.
struct AddAttributesRule {
    /// A type pattern determining the fields to which the attributes are applied.
    ty: Type,
    /// The attributes to apply.
    ///
    /// All attributes are appended to the list of existing field attributes.
    attrs: Vec<Attribute>,
}

impl Parse for AddAttributesRule {
    fn parse(input: ParseStream<'_>) -> Result<Self, Error> {
        let ty: Type = input.parse()?;
        input.parse::<Token![=>]>()?;
        let attr = Attribute::parse_outer(input)?;
        Ok(AddAttributesRule { ty, attrs: attr })
    }
}

/// Parsed form of the `#[apply(...)]` attribute.
///
/// The `apply` attribute takes a comma separated list of rules in the shape of `Type => Attribute`.
/// Each rule is stored as a [`AddAttributesRule`].
struct ApplyInput {
    metas: Vec<NestedMeta>,
    rules: Punctuated<AddAttributesRule, Token![,]>,
}

impl Parse for ApplyInput {
    fn parse(input: ParseStream<'_>) -> Result<Self, Error> {
        let mut metas: Vec<NestedMeta> = Vec::new();

        while input.peek2(Token![=]) && !input.peek2(Token![=>]) {
            let value = NestedMeta::parse(input)?;
            metas.push(value);
            if !input.peek(Token![,]) {
                break;
            }
            input.parse::<Token![,]>()?;
        }

        let rules: Punctuated<AddAttributesRule, Token![,]> =
            input.parse_terminated(AddAttributesRule::parse, Token![,])?;
        Ok(Self { metas, rules })
    }
}

pub fn apply(args: TokenStream, input: TokenStream) -> TokenStream {
    let args = syn::parse_macro_input!(args as ApplyInput);

    #[derive(FromMeta)]
    struct SerdeContainerOptions {
        #[darling(rename = "crate")]
        alt_crate_path: Option<Path>,
    }

    let container_options = match SerdeContainerOptions::from_list(&args.metas) {
        Ok(v) => v,
        Err(e) => {
            return TokenStream::from(e.write_errors());
        }
    };
    let serde_with_crate_path = container_options
        .alt_crate_path
        .unwrap_or_else(|| syn::parse_quote!(::serde_with));

    let res = match super::apply_function_to_struct_and_enum_fields_darling(
        input,
        &serde_with_crate_path,
        &prepare_apply_attribute_to_field(args),
    ) {
        Ok(res) => res,
        Err(err) => err.write_errors(),
    };
    TokenStream::from(res)
}

/// Create a function compatible with [`super::apply_function_to_struct_and_enum_fields`] based on [`ApplyInput`].
///
/// A single [`ApplyInput`] can apply to multiple field types.
/// To account for this a new function must be created to stay compatible with the function signature or [`super::apply_function_to_struct_and_enum_fields`].
fn prepare_apply_attribute_to_field(
    input: ApplyInput,
) -> impl Fn(&mut Field) -> Result<(), DarlingError> {
    move |field: &mut Field| {
        let has_skip_attr = super::field_has_attribute(field, "serde_with", "skip_apply");
        if has_skip_attr {
            return Ok(());
        }

        for matcher in input.rules.iter() {
            if ty_pattern_matches_ty(&matcher.ty, &field.ty) {
                field.attrs.extend(matcher.attrs.clone());
            }
        }
        Ok(())
    }
}

fn ty_pattern_matches_ty(ty_pattern: &Type, ty: &Type) -> bool {
    match (ty_pattern, ty) {
        // Groups are invisible groupings which can for example come from macro_rules expansion.
        // This can lead to a mismatch where the `ty` is "Group { Option<String> }" and the `ty_pattern` is "Option<String>".
        // To account for this we unwrap the group and compare the inner types.
        (
            Type::Group(TypeGroup {
                elem: ty_pattern, ..
            }),
            ty,
        ) => ty_pattern_matches_ty(ty_pattern, ty),
        (ty_pattern, Type::Group(TypeGroup { elem: ty, .. })) => {
            ty_pattern_matches_ty(ty_pattern, ty)
        }

        // Processing of the other types
        (
            Type::Array(TypeArray {
                elem: ty_pattern,
                len: len_pattern,
                ..
            }),
            Type::Array(TypeArray { elem: ty, len, .. }),
        ) => {
            let ty_match = ty_pattern_matches_ty(ty_pattern, ty);
            let len_match = len_pattern == len || len_pattern.to_token_stream().to_string() == "_";
            ty_match && len_match
        }
        (Type::BareFn(ty_pattern), Type::BareFn(ty)) => ty_pattern == ty,
        (Type::ImplTrait(ty_
```