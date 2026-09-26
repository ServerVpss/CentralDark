# OUTRO - format_item.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-macros-0.2.32\src\format_description\format_item.rs
**SHA:** 1a06f3c7bb5b5c11
**Timestamp:** 2026-08-28T02:36:09.154479
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: opening_bracket,
- start: opening_bracket,
- start: opening_bracket,
- start: second_fd.opening_bracket,
- start: opening_bracket,

### Ouro Bruto (primeiros 5000 chars)
```
use std::num::NonZero;
use std::str::{self, FromStr};

use super::{Error, Location, OptionExt as _, Span, Spanned, Unused, ast, unused};
use crate::FormatDescriptionVersion;
use crate::format_description::{SpannedValue as _, public};

macro_rules! parse_modifiers {
    ($version:expr, $modifiers:expr, struct {}) => {{
        struct Parsed {}
        drop(($version, $modifiers));
        Ok(Parsed {})
    }};
    ($version:expr, $modifiers:expr, struct { $($field:ident : $modifier:ident),* $(,)? }) => {
        'block: {
            struct Parsed {
                $($field: Option<Spanned<<$modifier as ModifierValue>::Type>>),*
            }

            let mut parsed = Parsed {
                $($field: None),*
            };

            for modifier in $modifiers {
                $(if ident_eq($version, *modifier.key, stringify!($field)) {
                    if parsed.$field.is_some() {
                        break 'block Err(modifier.key.span.error("duplicate modifier key"));
                    }
                    match <$modifier>::from_modifier_value($version, &modifier.value) {
                        Ok(value) => {
                            parsed.$field = Some(
                                <<$modifier as ModifierValue>::Type>::from(value)
                                    .spanned(modifier.value.span)
                            )
                        },
                        Err(err) => break 'block Err(err),
                    }
                    continue;
                })*
                break 'block Err(modifier.key.span.error("invalid modifier key"));
            }

            Ok(parsed)
        }
    };
}

fn ident_eq(version: FormatDescriptionVersion, provided: &str, expected: &str) -> bool {
    if version.is_at_least_v3() {
        provided == expected
    } else {
        provided.len() == expected.len()
            && core::iter::zip(provided.bytes(), expected.bytes())
                .all(|(p, e)| p.to_ascii_lowercase() == e)
    }
}

pub(super) fn parse<'a>(
    ast_items: impl Iterator<Item = Result<ast::Item<'a>, Error>>,
) -> impl Iterator<Item = Result<Item<'a>, Error>> {
    ast_items.map(|ast_item| ast_item.and_then(Item::from_ast))
}

pub(super) enum Item<'a> {
    Literal(&'a [u8]),
    StringLiteral(&'a str),
    Component(Component),
    Optional {
        value: Vec<Self>,
        format: Spanned<bool>,
        _span: Unused<Span>,
    },
    First {
        value: Vec<Vec<Self>>,
        _span: Unused<Span>,
    },
}

impl<'a> Item<'a> {
    pub(super) fn from_ast(ast_item: ast::Item<'a>) -> Result<Self, Error> {
        Ok(match ast_item {
            ast::Item::Literal {
                version,
                value: Spanned { value, span },
            } => {
                if let Ok(value) = str::from_utf8(value) {
                    Item::StringLiteral(value)
                } else if version.is_at_least_v3() {
                    return Err(span.error("v3 format descriptions must be valid UTF-8"));
                } else {
                    Item::Literal(value)
                }
            }
            ast::Item::Component {
                version,
                opening_bracket,
                _leading_whitespace: _,
                name,
                modifiers,
                nested_format_descriptions,
                _trailing_whitespace: _,
                closing_bracket,
            } => {
                if let Some(first_nested_fd) = nested_format_descriptions.first()
                    && first_nested_fd.leading_whitespace.is_none()
                {
                    return Err(Span {
                        start: opening_bracket,
                        end: closing_bracket,
                    }
                    .error("missing leading whitespace before nested format description"));
                }

                if ident_eq(version, *name, "optional") {
                    Self::optional_from_parts(
                        version,
                        opening_bracket,
                        &modifiers,
                        nested_format_descriptions,
                        closing_bracket,
                    )?
                } else if ident_eq(version, *name, "first") {
                    let _modifiers = parse_modifiers!(version, modifiers, struct {})?;

                    if version.is_at_least_v3() && nested_format_descriptions.is_empty() {
                        return Err(Span {
                            start: opening_bracket,
                            end: closing_bracket,
                        }
                        .error(
                            "the `first` component requires at least one nested format description",
                        ));
                    }

                    let items = nested_format_descriptions
                        .into_iter()
                        .map(|nested_format_description| {
                            nested_format_descri
```