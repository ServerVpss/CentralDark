# OUTRO - dispatch.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\macros\dispatch.rs
**SHA:** c01e13dc2050ac69
**Timestamp:** 2026-08-28T02:37:39.393878
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ///     ArmPattern => arm_value,
- ///     ArmPattern => arm_parser,

### Ouro Bruto (primeiros 5000 chars)
```
/// `match` for parsers
///
/// While `match` works by accepting a value and returning values:
/// ```rust,ignore
/// let result_value = match scrutinee_value {
///     ArmPattern => arm_value,
/// };
/// ```
/// `dispatch!` composes parsers:
/// ```rust,ignore
/// let result_parser = dispatch!{scrutinee_parser;
///     ArmPattern => arm_parser,
/// };
/// ```
///
/// This is useful when parsers have unique prefixes to test for.
/// This offers better performance over
/// [`alt`][crate::combinator::alt] though it might be at the cost of duplicating parts of your grammar
/// if you needed to [`peek(input_parser)`][crate::combinator::peek] the scrutinee.
///
/// For tight control over the error in a catch-all case, use [`fail`][crate::combinator::fail].
///
/// # Example
///
/// ```rust
/// use winnow::prelude::*;
/// use winnow::combinator::dispatch;
/// # use winnow::token::take;
/// # use winnow::token::take_while;
/// # use winnow::combinator::fail;
///
/// fn integer(input: &mut &str) -> ModalResult<u64> {
///     dispatch! {take(2usize);
///         "0b" => take_while(1.., '0'..='1').try_map(|s| u64::from_str_radix(s, 2)),
///         "0o" => take_while(1.., '0'..='7').try_map(|s| u64::from_str_radix(s, 8)),
///         "0d" => take_while(1.., '0'..='9').try_map(|s| u64::from_str_radix(s, 10)),
///         "0x" => take_while(1.., ('0'..='9', 'a'..='f', 'A'..='F')).try_map(|s| u64::from_str_radix(s, 16)),
///         _ => fail::<_, u64, _>,
///     }
///     .parse_next(input)
/// }
///
/// assert_eq!(integer.parse_peek("0x100 Hello"), Ok((" Hello", 0x100)));
/// ```
///
/// ```rust
/// use winnow::prelude::*;
/// use winnow::combinator::dispatch;
/// # use winnow::token::any;
/// # use winnow::combinator::preceded;
/// # use winnow::combinator::empty;
/// # use winnow::combinator::fail;
///
/// fn escaped(input: &mut &str) -> ModalResult<char> {
///     preceded('\\', escape_seq_char).parse_next(input)
/// }
///
/// fn escape_seq_char(input: &mut &str) -> ModalResult<char> {
///     dispatch! {any;
///         'b' => empty.value('\u{8}'),
///         'f' => empty.value('\u{c}'),
///         'n' => empty.value('\n'),
///         'r' => empty.value('\r'),
///         't' => empty.value('\t'),
///         '\\' => empty.value('\\'),
///         '"' => empty.value('"'),
///         _ => fail::<_, char, _>,
///     }
///     .parse_next(input)
/// }
///
/// assert_eq!(escaped.parse_peek("\\nHello"), Ok(("Hello", '\n')));
/// ```
#[macro_export]
#[doc(hidden)] // forced to be visible in intended location
macro_rules! dispatch {
    (
        $scrutinee_parser:expr;
        $( $arm_pat:pat $(if $arm_pred:expr)? => $arm_parser: expr ),+ $(,)?
    ) => {
        $crate::combinator::trace("dispatch", move |i: &mut _|
        {
            use $crate::Parser;
            let initial = $scrutinee_parser.parse_next(i)?;
            match initial {
                $(
                    $arm_pat $(if $arm_pred)? => $arm_parser.parse_next(i),
                )*
            }
        })
    }
}

```

---

# OUTRO - dispatch.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\macros\dispatch.rs
**SHA:** 7c61bb6df5d7f43d
**Timestamp:** 2026-08-28T02:37:41.043076
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ///     ArmPattern => arm_value,
- ///     ArmPattern => arm_parser,

### Ouro Bruto (primeiros 5000 chars)
```
/// `match` for parsers
///
/// While `match` works by accepting a value and returning values:
/// ```rust,ignore
/// let result_value = match scrutinee_value {
///     ArmPattern => arm_value,
/// };
/// ```
/// `dispatch!` composes parsers:
/// ```rust,ignore
/// let result_parser = dispatch!{scrutinee_parser;
///     ArmPattern => arm_parser,
/// };
/// ```
///
/// This is useful when parsers have unique prefixes to test for.
/// This offers better performance over
/// [`alt`][crate::combinator::alt] though it might be at the cost of duplicating parts of your grammar
/// if you needed to [`peek(input_parser)`][crate::combinator::peek] the scrutinee.
///
/// For tight control over the error in a catch-all case, use [`fail`][crate::combinator::fail].
///
/// # Example
///
/// ```rust
/// # #[cfg(feature = "parser")] {
/// use winnow::prelude::*;
/// use winnow::combinator::dispatch;
/// # use winnow::token::take;
/// # use winnow::token::take_while;
/// # use winnow::combinator::fail;
///
/// fn integer(input: &mut &str) -> ModalResult<u64> {
///     dispatch! {take(2usize);
///         "0b" => take_while(1.., '0'..='1').try_map(|s| u64::from_str_radix(s, 2)),
///         "0o" => take_while(1.., '0'..='7').try_map(|s| u64::from_str_radix(s, 8)),
///         "0d" => take_while(1.., '0'..='9').try_map(|s| u64::from_str_radix(s, 10)),
///         "0x" => take_while(1.., ('0'..='9', 'a'..='f', 'A'..='F')).try_map(|s| u64::from_str_radix(s, 16)),
///         _ => fail::<_, u64, _>,
///     }
///     .parse_next(input)
/// }
///
/// assert_eq!(integer.parse_peek("0x100 Hello"), Ok((" Hello", 0x100)));
/// # }
/// ```
///
/// ```rust
/// # #[cfg(feature = "parser")] {
/// use winnow::prelude::*;
/// use winnow::combinator::dispatch;
/// # use winnow::token::any;
/// # use winnow::combinator::preceded;
/// # use winnow::combinator::empty;
/// # use winnow::combinator::fail;
///
/// fn escaped(input: &mut &str) -> ModalResult<char> {
///     preceded('\\', escape_seq_char).parse_next(input)
/// }
///
/// fn escape_seq_char(input: &mut &str) -> ModalResult<char> {
///     dispatch! {any;
///         'b' => empty.value('\u{8}'),
///         'f' => empty.value('\u{c}'),
///         'n' => empty.value('\n'),
///         'r' => empty.value('\r'),
///         't' => empty.value('\t'),
///         '\\' => empty.value('\\'),
///         '"' => empty.value('"'),
///         _ => fail::<_, char, _>,
///     }
///     .parse_next(input)
/// }
///
/// assert_eq!(escaped.parse_peek("\\nHello"), Ok(("Hello", '\n')));
/// # }
/// ```
#[macro_export]
#[doc(hidden)] // forced to be visible in intended location
macro_rules! dispatch {
    (
        $scrutinee_parser:expr;
        $( $arm_pat:pat $(if $arm_pred:expr)? => $arm_parser: expr ),+ $(,)?
    ) => {
        $crate::combinator::trace("dispatch", move |i: &mut _|
        {
            use $crate::Parser;
            let initial = $scrutinee_parser.parse_next(i)?;
            match initial {
                $(
                    $arm_pat $(if $arm_pred)? => $arm_parser.parse_next(i),
                )*
            }
        })
    }
}

```