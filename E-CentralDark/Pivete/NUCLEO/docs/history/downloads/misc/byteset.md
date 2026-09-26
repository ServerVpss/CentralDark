# OUTRO - byteset.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\prefilter\byteset.rs
**SHA:** a0c737b19e316eff
**Timestamp:** 2026-08-28T02:35:06.842311
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = span.start + i;
- Some(Span { start: span.start, end: span.start + 1 })

### Ouro Bruto (primeiros 5000 chars)
```
use crate::util::{
    prefilter::PrefilterI,
    search::{MatchKind, Span},
};

#[derive(Clone, Debug)]
pub(crate) struct ByteSet([bool; 256]);

impl ByteSet {
    pub(crate) fn new<B: AsRef<[u8]>>(
        _kind: MatchKind,
        needles: &[B],
    ) -> Option<ByteSet> {
        #[cfg(not(feature = "perf-literal-multisubstring"))]
        {
            None
        }
        #[cfg(feature = "perf-literal-multisubstring")]
        {
            let mut set = [false; 256];
            for needle in needles.iter() {
                let needle = needle.as_ref();
                if needle.len() != 1 {
                    return None;
                }
                set[usize::from(needle[0])] = true;
            }
            Some(ByteSet(set))
        }
    }
}

impl PrefilterI for ByteSet {
    fn name(&self) -> &'static str {
        "byteset"
    }

    fn find(&self, haystack: &[u8], span: Span) -> Option<Span> {
        haystack[span].iter().position(|&b| self.0[usize::from(b)]).map(|i| {
            let start = span.start + i;
            let end = start + 1;
            Span { start, end }
        })
    }

    fn prefix(&self, haystack: &[u8], span: Span) -> Option<Span> {
        let b = *haystack.get(span.start)?;
        if self.0[usize::from(b)] {
            Some(Span { start: span.start, end: span.start + 1 })
        } else {
            None
        }
    }

    fn memory_usage(&self) -> usize {
        0
    }

    fn is_fast(&self) -> bool {
        false
    }
}

```