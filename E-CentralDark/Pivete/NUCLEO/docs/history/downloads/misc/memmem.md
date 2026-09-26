# OUTRO - memmem.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\prefilter\memmem.rs
**SHA:** c10ad4f1a48919c0
**Timestamp:** 2026-08-28T02:35:06.852580
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = span.start + i;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::util::{
    prefilter::PrefilterI,
    search::{MatchKind, Span},
};

#[derive(Clone, Debug)]
pub(crate) struct Memmem {
    #[cfg(not(all(feature = "std", feature = "perf-literal-substring")))]
    _unused: (),
    #[cfg(all(feature = "std", feature = "perf-literal-substring"))]
    finder: memchr::memmem::Finder<'static>,
}

impl Memmem {
    pub(crate) fn new<B: AsRef<[u8]>>(
        _kind: MatchKind,
        needles: &[B],
    ) -> Option<Memmem> {
        #[cfg(not(all(feature = "std", feature = "perf-literal-substring")))]
        {
            None
        }
        #[cfg(all(feature = "std", feature = "perf-literal-substring"))]
        {
            if needles.len() != 1 {
                return None;
            }
            let needle = needles[0].as_ref();
            let finder = memchr::memmem::Finder::new(needle).into_owned();
            Some(Memmem { finder })
        }
    }
}

impl PrefilterI for Memmem {
    fn name(&self) -> &'static str {
        "memmem"
    }

    fn find(&self, haystack: &[u8], span: Span) -> Option<Span> {
        #[cfg(not(all(feature = "std", feature = "perf-literal-substring")))]
        {
            unreachable!()
        }
        #[cfg(all(feature = "std", feature = "perf-literal-substring"))]
        {
            self.finder.find(&haystack[span]).map(|i| {
                let start = span.start + i;
                let end = start + self.finder.needle().len();
                Span { start, end }
            })
        }
    }

    fn prefix(&self, haystack: &[u8], span: Span) -> Option<Span> {
        #[cfg(not(all(feature = "std", feature = "perf-literal-substring")))]
        {
            unreachable!()
        }
        #[cfg(all(feature = "std", feature = "perf-literal-substring"))]
        {
            let needle = self.finder.needle();
            if haystack[span].starts_with(needle) {
                Some(Span { end: span.start + needle.len(), ..span })
            } else {
                None
            }
        }
    }

    fn memory_usage(&self) -> usize {
        #[cfg(not(all(feature = "std", feature = "perf-literal-substring")))]
        {
            unreachable!()
        }
        #[cfg(all(feature = "std", feature = "perf-literal-substring"))]
        {
            self.finder.needle().len()
        }
    }

    fn is_fast(&self) -> bool {
        #[cfg(not(all(feature = "std", feature = "perf-literal-substring")))]
        {
            unreachable!()
        }
        #[cfg(all(feature = "std", feature = "perf-literal-substring"))]
        {
            true
        }
    }
}

```