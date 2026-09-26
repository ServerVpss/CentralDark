# OUTRO - chapter_3.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\_tutorial\chapter_3.rs
**SHA:** e2d6ab100599d968
**Timestamp:** 2026-08-28T02:37:38.722406
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- //!     let start = input.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
//! # Chapter 3: Sequencing and Alternatives
//!
//! In the last chapter, we saw how to create parsers using prebuilt parsers.
//!
//! In this chapter, we explore two other widely used features:
//! sequencing and alternatives.
//!
//! ## Sequencing
//!
//! Now that we can create more interesting parsers, we can sequence them together, like:
//!
//! ```rust
//! # use winnow::prelude::*;
//! # use winnow::Result;
//! # use winnow::token::take_while;
//! #
//! fn parse_prefix<'s>(input: &mut &'s str) -> Result<&'s str> {
//!     "0x".parse_next(input)
//! }
//!
//! fn parse_digits<'s>(input: &mut &'s str) -> Result<&'s str> {
//!     take_while(1.., (
//!         ('0'..='9'),
//!         ('A'..='F'),
//!         ('a'..='f'),
//!     )).parse_next(input)
//! }
//!
//! fn main()  {
//!     let mut input = "0x1a2b Hello";
//!
//!     let prefix = parse_prefix.parse_next(&mut input).unwrap();
//!     let digits = parse_digits.parse_next(&mut input).unwrap();
//!
//!     assert_eq!(prefix, "0x");
//!     assert_eq!(digits, "1a2b");
//!     assert_eq!(input, " Hello");
//! }
//! ```
//!
//! To sequence these together, you can just put them in a tuple:
//! ```rust
//! # use winnow::prelude::*;
//! # use winnow::Result;
//! # use winnow::token::take_while;
//! #
//! # fn parse_prefix<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     "0x".parse_next(input)
//! # }
//! #
//! # fn parse_digits<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     take_while(1.., (
//! #         ('0'..='9'),
//! #         ('A'..='F'),
//! #         ('a'..='f'),
//! #     )).parse_next(input)
//! # }
//! #
//! //...
//!
//! fn main()  {
//!     let mut input = "0x1a2b Hello";
//!
//!     let (prefix, digits) = (
//!         parse_prefix,
//!         parse_digits
//!     ).parse_next(&mut input).unwrap();
//!
//!     assert_eq!(prefix, "0x");
//!     assert_eq!(digits, "1a2b");
//!     assert_eq!(input, " Hello");
//! }
//! ```
//!
//! Frequently, you won't care about the literal and you can instead use one of the provided combinators,
//! like [`preceded`]:
//! ```rust
//! # use winnow::prelude::*;
//! # use winnow::Result;
//! # use winnow::token::take_while;
//! use winnow::combinator::preceded;
//!
//! # fn parse_prefix<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     "0x".parse_next(input)
//! # }
//! #
//! # fn parse_digits<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     take_while(1.., (
//! #         ('0'..='9'),
//! #         ('A'..='F'),
//! #         ('a'..='f'),
//! #     )).parse_next(input)
//! # }
//! #
//! //...
//!
//! fn main() {
//!     let mut input = "0x1a2b Hello";
//!
//!     let digits = preceded(
//!         parse_prefix,
//!         parse_digits
//!     ).parse_next(&mut input).unwrap();
//!
//!     assert_eq!(digits, "1a2b");
//!     assert_eq!(input, " Hello");
//! }
//! ```
//!
//! See [`combinator`] for more sequencing parsers.
//!
//! ## Alternatives
//!
//! Sometimes, we might want to choose between two parsers; and we're happy with
//! either being used.
//!
//! To retry a parse result, we can save off a [`Stream::checkpoint`] and later restore the parser
//! back to that position with [`Stream::reset`]:
//! ```rust
//! # use winnow::prelude::*;
//! # use winnow::Result;
//! # use winnow::token::take_while;
//! use winnow::stream::Stream;
//!
//! fn parse_digits<'s>(input: &mut &'s str) -> Result<(&'s str, &'s str)> {
//!     let start = input.checkpoint();
//!     if let Ok(output) = ("0b", parse_bin_digits).parse_next(input) {
//!         return Ok(output);
//!     }
//!
//!     input.reset(&start);
//!     if let Ok(output) = ("0o", parse_oct_digits).parse_next(input) {
//!         return Ok(output);
//!     }
//!
//!     input.reset(&start);
//!     if let Ok(output) = ("0d", parse_dec_digits).parse_next(input) {
//!         return Ok(output);
//!     }
//!
//!     input.reset(&start);
//!     ("0x", parse_hex_digits).parse_next(input)
//! }
//!
//! // ...
//! # fn parse_bin_digits<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     take_while(1.., (
//! #         ('0'..='1'),
//! #     )).parse_next(input)
//! # }
//! #
//! # fn parse_oct_digits<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     take_while(1.., (
//! #         ('0'..='7'),
//! #     )).parse_next(input)
//! # }
//! #
//! # fn parse_dec_digits<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     take_while(1.., (
//! #         ('0'..='9'),
//! #     )).parse_next(input)
//! # }
//! #
//! # fn parse_hex_digits<'s>(input: &mut &'s str) -> Result<&'s str> {
//! #     take_while(1.., (
//! #         ('0'..='9'),
//! #         ('A'..='F'),
//! #         ('a'..='f'),
//! #     )).parse_next(input)
//! # }
//!
//! fn main() {
//!     let mut input = "0x1a2b Hello";
//!
//!     let (prefix, digits) = parse_digits.parse_next(&mut input).unwrap();
//!
//!     assert_eq!(input, " Hello");
//!     assert_eq!(prefix, "0x");
//!     assert_eq!(digits, "1a2b");
//!
//!     assert!(parse_digits(&mut "ghiWorld").is_err
```