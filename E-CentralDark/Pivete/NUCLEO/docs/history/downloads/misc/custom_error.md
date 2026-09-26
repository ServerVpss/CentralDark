# OUTRO - custom_error.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\examples\custom_error.rs
**SHA:** 64bf5a6bde9feb45
**Timestamp:** 2026-08-28T02:37:39.619881
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- _token_start: &<I as Stream>::Checkpoint,

### Ouro Bruto (primeiros 5000 chars)
```
use winnow::error::AddContext;
use winnow::error::ErrMode;
use winnow::error::FromExternalError;
use winnow::error::ParserError;
use winnow::prelude::*;
use winnow::stream::Stream;

#[derive(Debug)]
pub enum CustomError<I> {
    MyError,
    Winnow(I),
    External {
        cause: Box<dyn std::error::Error + Send + Sync + 'static>,
        input: I,
    },
}

impl<I: Stream + Clone> ParserError<I> for CustomError<I> {
    type Inner = Self;

    fn from_input(input: &I) -> Self {
        CustomError::Winnow(input.clone())
    }

    fn into_inner(self) -> Result<Self::Inner, Self> {
        Ok(self)
    }
}

impl<C, I: Stream> AddContext<I, C> for CustomError<I> {
    #[inline]
    fn add_context(
        self,
        _input: &I,
        _token_start: &<I as Stream>::Checkpoint,
        _context: C,
    ) -> Self {
        self
    }
}

impl<I: Stream + Clone, E: std::error::Error + Send + Sync + 'static> FromExternalError<I, E>
    for CustomError<I>
{
    #[inline]
    fn from_external_error(input: &I, e: E) -> Self {
        CustomError::External {
            cause: Box::new(e),
            input: input.clone(),
        }
    }
}

pub fn parse<'s>(_input: &mut &'s str) -> ModalResult<&'s str, CustomError<&'s str>> {
    Err(ErrMode::Backtrack(CustomError::MyError))
}

fn main() {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let err = parse.parse_next(&mut "").unwrap_err();
        assert!(matches!(err, ErrMode::Backtrack(CustomError::MyError)));
    }
}

```