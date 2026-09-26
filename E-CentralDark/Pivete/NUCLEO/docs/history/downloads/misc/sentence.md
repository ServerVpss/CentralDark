# OUTRO - sentence.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\unicode-segmentation-1.13.3\src\sentence.rs
**SHA:** 7fe9496fbd694f33
**Timestamp:** 2026-08-28T02:36:32.970799
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- sentence_start: Option<usize>,
- sentence_start: None,
- self.sentence_start = Some(start_pos)
- self.sentence_start = Some(break_pos);

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2012-2014 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use core::cmp;
use core::iter::Filter;

// All of the logic for forward iteration over sentences
mod fwd {
    use crate::tables::sentence::SentenceCat;
    use core::cmp;

    // Describe a parsed part of source string as described in this table:
    // https://unicode.org/reports/tr29/#Default_Sentence_Boundaries
    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    enum StatePart {
        Sot,
        Eot,
        Other,
        CR,
        LF,
        Sep,
        ATerm,
        UpperLower,
        ClosePlus,
        SpPlus,
        STerm,
    }

    #[derive(Debug, Clone, PartialEq, Eq)]
    struct SentenceBreaksState(pub [StatePart; 4]);

    const INITIAL_STATE: SentenceBreaksState = SentenceBreaksState([
        StatePart::Sot,
        StatePart::Sot,
        StatePart::Sot,
        StatePart::Sot,
    ]);

    #[derive(Debug, Clone)]
    pub struct SentenceBreaks<'a> {
        pub string: &'a str,
        pos: usize,
        state: SentenceBreaksState,
    }

    impl SentenceBreaksState {
        // Attempt to advance the internal state by one part
        // Whitespace and some punctutation will be collapsed
        fn next(&self, cat: SentenceCat) -> SentenceBreaksState {
            let &SentenceBreaksState(parts) = self;
            let parts = match (parts[3], cat) {
                (StatePart::ClosePlus, SentenceCat::SC_Close) => parts,
                (StatePart::SpPlus, SentenceCat::SC_Sp) => parts,
                _ => [
                    parts[1],
                    parts[2],
                    parts[3],
                    match cat {
                        SentenceCat::SC_CR => StatePart::CR,
                        SentenceCat::SC_LF => StatePart::LF,
                        SentenceCat::SC_Sep => StatePart::Sep,
                        SentenceCat::SC_ATerm => StatePart::ATerm,
                        SentenceCat::SC_Upper | SentenceCat::SC_Lower => StatePart::UpperLower,
                        SentenceCat::SC_Close => StatePart::ClosePlus,
                        SentenceCat::SC_Sp => StatePart::SpPlus,
                        SentenceCat::SC_STerm => StatePart::STerm,
                        _ => StatePart::Other,
                    },
                ],
            };
            SentenceBreaksState(parts)
        }

        fn end(&self) -> SentenceBreaksState {
            let &SentenceBreaksState(parts) = self;
            SentenceBreaksState([parts[1], parts[2], parts[3], StatePart::Eot])
        }

        // Helper function to check if state head matches a single `StatePart`
        fn match1(&self, part: StatePart) -> bool {
            let &SentenceBreaksState(parts) = self;
            part == parts[3]
        }

        // Helper function to check if first two `StateParts` in state match
        // the given two
        fn match2(&self, part1: StatePart, part2: StatePart) -> bool {
            let &SentenceBreaksState(parts) = self;
            part1 == parts[2] && part2 == parts[3]
        }
    }

    // https://unicode.org/reports/tr29/#SB8
    // TODO cache this, it is currently quadratic
    fn match_sb8(state: &SentenceBreaksState, ahead: &str) -> bool {
        let &SentenceBreaksState(parts) = state;
        let mut idx = if parts[3] == StatePart::SpPlus { 2 } else { 3 };
        if parts[idx] == StatePart::ClosePlus {
            idx -= 1
        }

        if parts[idx] == StatePart::ATerm {
            use crate::tables::sentence as se;

            for next_char in ahead.chars() {
                //( ¬(OLetter | Upper | Lower | ParaSep | SATerm) )* Lower
                match se::sentence_category(next_char).2 {
                    se::SC_Lower => return true,
                    se::SC_OLetter
                    | se::SC_Upper
                    | se::SC_Sep
                    | se::SC_CR
                    | se::SC_LF
                    | se::SC_STerm
                    | se::SC_ATerm => return false,
                    _ => continue,
                }
            }
        }

        false
    }

    // https://unicode.org/reports/tr29/#SB8a
    fn match_sb8a(state: &SentenceBreaksState) -> bool {
        // SATerm Close* Sp*
        let &SentenceBreaksState(parts) = state;
        let mut idx = if parts[3] == StatePart::SpPlus { 2 } else { 3 };
        if parts[idx] == StatePart::ClosePlus {
            idx -= 1
        }
        parts[idx] == StatePart::STerm || parts[idx] == StatePart::ATerm
    }

    // https://unicode.org/reports/tr29/#SB9
    fn match_sb9(state: &SentenceB
```