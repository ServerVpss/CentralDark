# OUTRO - literal_trie.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\nfa\thompson\literal_trie.rs
**SHA:** 3b5cf36842a31f8b
**Timestamp:** 2026-08-28T02:35:06.287157
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: t.byte,
- start: t.byte,
- let start = builder.add_union(f.union)?;
- let chunk_start = self.active_chunk_start();
- let start = self.active_chunk_start();

### Ouro Bruto (primeiros 5000 chars)
```
use core::mem;

use alloc::{vec, vec::Vec};

use crate::{
    nfa::thompson::{self, compiler::ThompsonRef, BuildError, Builder},
    util::primitives::{IteratorIndexExt, StateID},
};

/// A trie that preserves leftmost-first match semantics.
///
/// This is a purpose-built data structure for optimizing 'lit1|lit2|..|litN'
/// patterns. It can *only* handle alternations of literals, which makes it
/// somewhat restricted in its scope, but literal alternations are fairly
/// common.
///
/// At a 5,000 foot level, the main idea of this trie is make an alternation of
/// literals look more like a DFA than an NFA via epsilon removal.
///
/// More precisely, the main issue is in how alternations are compiled into
/// a Thompson NFA. Namely, each alternation gets a single NFA "union" state
/// with an epsilon transition for every branch of the alternation pointing to
/// an NFA state corresponding to the start of that branch. The main problem
/// with this representation is the cost of computing an epsilon closure. Once
/// you hit the alternation's start state, it acts as a sort of "clog" that
/// requires you to traverse all of the epsilon transitions to compute the full
/// closure.
///
/// While fixing such clogs in the general case is pretty tricky without going
/// to a DFA (or perhaps a Glushkov NFA, but that comes with other problems).
/// But at least in the case of an alternation of literals, we can convert
/// that to a prefix trie without too much cost. In theory, that's all you
/// really need to do: build the trie and then compile it to a Thompson NFA.
/// For example, if you have the pattern 'bar|baz|foo', then using a trie, it
/// is transformed to something like 'b(a(r|z))|f'. This reduces the clog by
/// reducing the number of epsilon transitions out of the alternation's start
/// state from 3 to 2 (it actually gets down to 1 when you use a sparse state,
/// which we do below). It's a small effect here, but when your alternation is
/// huge, the savings is also huge.
///
/// And that is... essentially what a LiteralTrie does. But there is one
/// hiccup. Consider a regex like 'sam|samwise'. How does a prefix trie compile
/// that when leftmost-first semantics are used? If 'sam|samwise' was the
/// entire regex, then you could just drop the 'samwise' branch entirely since
/// it is impossible to match ('sam' will always take priority, and since it
/// is a prefix of 'samwise', 'samwise' will never match). But what about the
/// regex '\b(sam|samwise)\b'? In that case, you can't remove 'samwise' because
/// it might match when 'sam' doesn't fall on a word boundary.
///
/// The main idea is that 'sam|samwise' can be translated to 'sam(?:|wise)',
/// which is a precisely equivalent regex that also gets rid of the clog.
///
/// Another example is 'zapper|z|zap'. That gets translated to
/// 'z(?:apper||ap)'.
///
/// We accomplish this by giving each state in the trie multiple "chunks" of
/// transitions. Each chunk barrier represents a match. The idea is that once
/// you know a match occurs, none of the transitions after the match can be
/// re-ordered and mixed in with the transitions before the match. Otherwise,
/// the match semantics could be changed.
///
/// See the 'State' data type for a bit more detail.
///
/// Future work:
///
/// * In theory, it would be nice to generalize the idea of removing clogs and
/// apply it to the NFA graph itself. Then this could in theory work for
/// case insensitive alternations of literals, or even just alternations where
/// each branch starts with a non-epsilon transition.
/// * Could we instead use the Aho-Corasick algorithm here? The aho-corasick
/// crate deals with leftmost-first matches correctly, but I think this implies
/// encoding failure transitions into a Thompson NFA somehow. Which seems fine,
/// because failure transitions are just unconditional epsilon transitions?
/// * Or perhaps even better, could we use an aho_corasick::AhoCorasick
/// directly? At time of writing, 0.7 is the current version of the
/// aho-corasick crate, and that definitely cannot be used as-is. But if we
/// expose the underlying finite state machine API, then could we use it? That
/// would be super. If we could figure that out, it might also lend itself to
/// more general composition of finite state machines.
#[derive(Clone)]
pub(crate) struct LiteralTrie {
    /// The set of trie states. Each state contains one or more chunks, where
    /// each chunk is a sparse set of transitions to other states. A leaf state
    /// is always a match state that contains only empty chunks (i.e., no
    /// transitions).
    states: Vec<State>,
    /// Whether to add literals in reverse to the trie. Useful when building
    /// a reverse NFA automaton.
    rev: bool,
}

impl LiteralTrie {
    /// Create a new literal trie that adds literals in the forward direction.
    pub(crate) fn forward() -> LiteralTrie {
        let root = State::default();
        LiteralTrie { states: vec![ro
```