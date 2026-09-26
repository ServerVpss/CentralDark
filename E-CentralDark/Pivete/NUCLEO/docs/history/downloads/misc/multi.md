# OUTRO - multi.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\combinator\multi.rs
**SHA:** 34480312a68c3398
**Timestamp:** 2026-08-28T02:37:39.311614
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = i.checkpoint();
- let start = i.checkpoint();
- let start = i.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
//! Combinators applying their child parser multiple times

use crate::combinator::trace;
use crate::error::FromExternalError;
use crate::error::ParserError;
use crate::stream::Accumulate;
use crate::stream::Range;
use crate::stream::Stream;
use crate::Parser;
use crate::Result;

/// [`Accumulate`] the output of a parser into a container, like `Vec`
///
/// This stops before `n` when the parser returns [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack]. To instead chain an error up, see
/// [`cut_err`][crate::combinator::cut_err].
///
/// To take a series of tokens, [`Accumulate`] into a `()`
/// (e.g. with [`.map(|()| ())`][Parser::map])
/// and then [`Parser::take`].
///
/// <div class="warning">
///
/// **Warning:** If the parser passed to `repeat` accepts empty inputs
/// (like `alpha0` or `digit0`), `repeat` will return an error,
/// to prevent going into an infinite loop.
///
/// </div>
///
/// # Example
///
/// Zero or more repetitions:
/// ```rust
/// # #[cfg(feature = "std")] {
/// # use winnow::{error::ErrMode, error::Needed};
/// # use winnow::prelude::*;
/// use winnow::combinator::repeat;
///
/// fn parser<'i>(s: &mut &'i str) -> ModalResult<Vec<&'i str>> {
///   repeat(0.., "abc").parse_next(s)
/// }
///
/// assert_eq!(parser.parse_peek("abcabc"), Ok(("", vec!["abc", "abc"])));
/// assert_eq!(parser.parse_peek("abc123"), Ok(("123", vec!["abc"])));
/// assert_eq!(parser.parse_peek("123123"), Ok(("123123", vec![])));
/// assert_eq!(parser.parse_peek(""), Ok(("", vec![])));
/// # }
/// ```
///
/// One or more repetitions:
/// ```rust
/// # #[cfg(feature = "std")] {
/// # use winnow::{error::ErrMode, error::Needed};
/// # use winnow::prelude::*;
/// use winnow::combinator::repeat;
///
/// fn parser<'i>(s: &mut &'i str) -> ModalResult<Vec<&'i str>> {
///   repeat(1.., "abc").parse_next(s)
/// }
///
/// assert_eq!(parser.parse_peek("abcabc"), Ok(("", vec!["abc", "abc"])));
/// assert_eq!(parser.parse_peek("abc123"), Ok(("123", vec!["abc"])));
/// assert!(parser.parse_peek("123123").is_err());
/// assert!(parser.parse_peek("").is_err());
/// # }
/// ```
///
/// Fixed number of repetitions:
/// ```rust
/// # #[cfg(feature = "std")] {
/// # use winnow::{error::ErrMode, error::Needed};
/// # use winnow::prelude::*;
/// use winnow::combinator::repeat;
///
/// fn parser<'i>(s: &mut &'i str) -> ModalResult<Vec<&'i str>> {
///   repeat(2, "abc").parse_next(s)
/// }
///
/// assert_eq!(parser.parse_peek("abcabc"), Ok(("", vec!["abc", "abc"])));
/// assert!(parser.parse_peek("abc123").is_err());
/// assert!(parser.parse_peek("123123").is_err());
/// assert!(parser.parse_peek("").is_err());
/// assert_eq!(parser.parse_peek("abcabcabc"), Ok(("abc", vec!["abc", "abc"])));
/// # }
/// ```
///
/// Arbitrary repetitions:
/// ```rust
/// # #[cfg(feature = "std")] {
/// # use winnow::{error::ErrMode, error::Needed};
/// # use winnow::prelude::*;
/// use winnow::combinator::repeat;
///
/// fn parser<'i>(s: &mut &'i str) -> ModalResult<Vec<&'i str>> {
///   repeat(0..=2, "abc").parse_next(s)
/// }
///
/// assert_eq!(parser.parse_peek("abcabc"), Ok(("", vec!["abc", "abc"])));
/// assert_eq!(parser.parse_peek("abc123"), Ok(("123", vec!["abc"])));
/// assert_eq!(parser.parse_peek("123123"), Ok(("123123", vec![])));
/// assert_eq!(parser.parse_peek(""), Ok(("", vec![])));
/// assert_eq!(parser.parse_peek("abcabcabc"), Ok(("abc", vec!["abc", "abc"])));
/// # }
/// ```
#[doc(alias = "many0")]
#[doc(alias = "count")]
#[doc(alias = "many0_count")]
#[doc(alias = "many1")]
#[doc(alias = "many1_count")]
#[doc(alias = "many_m_n")]
#[doc(alias = "repeated")]
#[doc(alias = "skip_many")]
#[doc(alias = "skip_many1")]
#[inline(always)]
pub fn repeat<Input, Output, Accumulator, Error, ParseNext>(
    occurrences: impl Into<Range>,
    parser: ParseNext,
) -> Repeat<ParseNext, Input, Output, Accumulator, Error>
where
    Input: Stream,
    Accumulator: Accumulate<Output>,
    ParseNext: Parser<Input, Output, Error>,
    Error: ParserError<Input>,
{
    Repeat {
        occurrences: occurrences.into(),
        parser,
        i: Default::default(),
        o: Default::default(),
        c: Default::default(),
        e: Default::default(),
    }
}

/// Customizable [`Parser`] implementation for [`repeat`]
pub struct Repeat<P, I, O, C, E>
where
    P: Parser<I, O, E>,
    I: Stream,
    C: Accumulate<O>,
    E: ParserError<I>,
{
    occurrences: Range,
    parser: P,
    i: core::marker::PhantomData<I>,
    o: core::marker::PhantomData<O>,
    c: core::marker::PhantomData<C>,
    e: core::marker::PhantomData<E>,
}

impl<ParseNext, Input, Output, Error> Repeat<ParseNext, Input, Output, (), Error>
where
    ParseNext: Parser<Input, Output, Error>,
    Input: Stream,
    Error: ParserError<Input>,
{
    /// Repeats the embedded parser, calling `op` to gather the results
    ///
    /// This stops before `n` when the parser returns [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack]. To instead chain an error up, see
    /// [`cut_er
```

---

# OUTRO - multi.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\combinator\multi.rs
**SHA:** e501e41ffa96d5bd
**Timestamp:** 2026-08-28T02:37:41.006149
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = i.checkpoint();
- let start = i.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
//! Combinators applying their child parser multiple times

use crate::combinator::trace;
use crate::error::FromExternalError;
use crate::error::ParserError;
use crate::stream::Accumulate;
use crate::stream::Range;
use crate::stream::Stream;
use crate::Parser;
use crate::Result;

/// Repeats the embedded parser, lazily returning the results
///
/// This can serve as a building block for custom parsers like [`repeat`].
/// To iterate over all of the input in your application, see [`Parser::parse_iter`].
///
/// Call the iterator's [`ParserIterator::finish`] method to get the remaining input if successful,
/// or the error value if we encountered an error.
///
/// On [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack], iteration will stop. To instead chain an error up, see [`cut_err`][crate::combinator::cut_err].
///
/// # Example
///
/// ```rust
/// # #[cfg(feature = "ascii")] {
/// # use winnow::prelude::*;
/// # use winnow::Result;
/// use winnow::{combinator::iterator, ascii::alpha1, combinator::terminated};
/// use std::collections::HashMap;
///
/// let mut data = "abc|defg|hijkl|mnopqr|123";
/// let mut it = iterator(&mut data, terminated(alpha1, "|"));
///
/// let parsed = it.map(|v| (v, v.len())).collect::<HashMap<_,_>>();
/// let res: Result<_> = it.finish();
///
/// assert_eq!(parsed, [("abc", 3usize), ("defg", 4), ("hijkl", 5), ("mnopqr", 6)].iter().cloned().collect());
/// assert_eq!(data, "123");
/// # }
/// ```
pub fn iterator<Input, Output, Error, ParseNext>(
    input: &mut Input,
    parser: ParseNext,
) -> ParserIterator<'_, ParseNext, Input, Output, Error>
where
    ParseNext: Parser<Input, Output, Error>,
    Input: Stream,
    Error: ParserError<Input>,
{
    ParserIterator {
        parser,
        input,
        state: State::Running,
        marker: Default::default(),
    }
}

/// Main structure associated to [`iterator`].
pub struct ParserIterator<'i, F, I, O, E>
where
    F: Parser<I, O, E>,
    I: Stream,
{
    parser: F,
    input: &'i mut I,
    state: State<E>,
    marker: core::marker::PhantomData<O>,
}

impl<F, I, O, E> ParserIterator<'_, F, I, O, E>
where
    F: Parser<I, O, E>,
    I: Stream,
    E: ParserError<I>,
{
    /// Returns the remaining input if parsing was successful, or the error if we encountered an error.
    pub fn finish(self) -> Result<(), E> {
        match self.state {
            State::Running | State::Done => Ok(()),
            State::Cut(e) => Err(e),
        }
    }
}

impl<F, I, O, E> core::iter::Iterator for &mut ParserIterator<'_, F, I, O, E>
where
    F: Parser<I, O, E>,
    I: Stream,
    E: ParserError<I>,
{
    type Item = O;

    fn next(&mut self) -> Option<Self::Item> {
        if matches!(self.state, State::Running) {
            let start = self.input.checkpoint();

            match self.parser.parse_next(self.input) {
                Ok(o) => {
                    self.state = State::Running;
                    Some(o)
                }
                Err(e) if e.is_backtrack() => {
                    self.input.reset(&start);
                    self.state = State::Done;
                    None
                }
                Err(e) => {
                    self.state = State::Cut(e);
                    None
                }
            }
        } else {
            None
        }
    }
}

enum State<E> {
    Running,
    Done,
    Cut(E),
}

/// [`Accumulate`] the output of a parser into a container, like `Vec` (bound by `occurrences`)
///
/// This stops before `n` when the parser returns [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack]. To instead chain an error up, see
/// [`cut_err`][crate::combinator::cut_err].
///
/// To take a series of tokens, [`Accumulate`] into a `()`
/// (e.g. with [`.map(|()| ())`][Parser::map])
/// and then [`Parser::take`].
///
/// It will return an `ErrMode::Backtrack(_)` if the set of tokens wasn't met or is out
/// of `occurrences` range.
///
/// <div class="warning">
///
/// **Warning:** If the parser passed to `repeat` accepts empty inputs
/// (like `alpha0` or `digit0`), `repeat` will return an error,
/// to prevent going into an infinite loop.
///
/// </div>
///
/// # Example
///
/// Zero or more repetitions:
/// ```rust
/// # #[cfg(feature = "std")] {
/// # use winnow::{error::ErrMode, error::Needed};
/// # use winnow::prelude::*;
/// use winnow::combinator::repeat;
///
/// fn parser<'i>(s: &mut &'i str) -> ModalResult<Vec<&'i str>> {
///   repeat(0.., "abc").parse_next(s)
/// }
///
/// assert_eq!(parser.parse_peek("abcabc"), Ok(("", vec!["abc", "abc"])));
/// assert_eq!(parser.parse_peek("abc123"), Ok(("123", vec!["abc"])));
/// assert_eq!(parser.parse_peek("123123"), Ok(("123123", vec![])));
/// assert_eq!(parser.parse_peek(""), Ok(("", vec![])));
/// # }
/// ```
///
/// One or more repetitions:
/// ```rust
/// # #[cfg(feature = "std")] {
/// # use winnow::{error::ErrMode, error::Needed};
/// # use winnow::prelude::*;
/// use winnow::combinator::repeat;
///
/// fn parser<'i
```