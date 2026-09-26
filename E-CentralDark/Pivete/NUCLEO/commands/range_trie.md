# COMANDO - range_trie.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\nfa\thompson\range_trie.rs
**SHA:** 2304cab5cd580ca1
**Timestamp:** 2026-08-28T02:35:06.406140
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut tmp = [Utf8Range { start: 0, end: 0 }; 4];
- start: *r.start(),
- let nada = SplitRange::Old(Utf8Range { start: 0, end: 0 });
- let nada = SplitRange::Old(Utf8Range { start: 0, end: 0 });
- if self.range.start == self.range.end {
- Utf8Range { start: *range.start(), end: *range.end() }
- start: *r.start(),

### Ouro Bruto (primeiros 5000 chars)
```
/*
I've called the primary data structure in this module a "range trie." As far
as I can tell, there is no prior art on a data structure like this, however,
it's likely someone somewhere has built something like it. Searching for
"range trie" turns up the paper "Range Tries for Scalable Address Lookup,"
but it does not appear relevant.

The range trie is just like a trie in that it is a special case of a
deterministic finite state machine. It has states and each state has a set
of transitions to other states. It is acyclic, and, like a normal trie,
it makes no attempt to reuse common suffixes among its elements. The key
difference between a normal trie and a range trie below is that a range trie
operates on *contiguous sequences* of bytes instead of singleton bytes.
One could say say that our alphabet is ranges of bytes instead of bytes
themselves, except a key part of range trie construction is splitting ranges
apart to ensure there is at most one transition that can be taken for any
byte in a given state.

I've tried to explain the details of how the range trie works below, so
for now, we are left with trying to understand what problem we're trying to
solve. Which is itself fairly involved!

At the highest level, here's what we want to do. We want to convert a
sequence of Unicode codepoints into a finite state machine whose transitions
are over *bytes* and *not* Unicode codepoints. We want this because it makes
said finite state machines much smaller and much faster to execute. As a
simple example, consider a byte oriented automaton for all Unicode scalar
values (0x00 through 0x10FFFF, not including surrogate codepoints):

    [00-7F]
    [C2-DF][80-BF]
    [E0-E0][A0-BF][80-BF]
    [E1-EC][80-BF][80-BF]
    [ED-ED][80-9F][80-BF]
    [EE-EF][80-BF][80-BF]
    [F0-F0][90-BF][80-BF][80-BF]
    [F1-F3][80-BF][80-BF][80-BF]
    [F4-F4][80-8F][80-BF][80-BF]

(These byte ranges are generated via the regex-syntax::utf8 module, which
was based on Russ Cox's code in RE2, which was in turn based on Ken
Thompson's implementation of the same idea in his Plan9 implementation of
grep.)

It should be fairly straight-forward to see how one could compile this into
a DFA. The sequences are sorted and non-overlapping. Essentially, you could
build a trie from this fairly easy. The problem comes when your initial
range (in this case, 0x00-0x10FFFF) isn't so nice. For example, the class
represented by '\w' contains only a tenth of the codepoints that
0x00-0x10FFFF contains, but if we were to write out the byte based ranges
as we did above, the list would stretch to 892 entries! This turns into
quite a large NFA with a few thousand states. Turning this beast into a DFA
takes quite a bit of time. We are thus left with trying to trim down the
number of states we produce as early as possible.

One approach (used by RE2 and still by the regex crate, at time of writing)
is to try to find common suffixes while building NFA states for the above
and reuse them. This is very cheap to do and one can control precisely how
much extra memory you want to use for the cache.

Another approach, however, is to reuse an algorithm for constructing a
*minimal* DFA from a sorted sequence of inputs. I don't want to go into
the full details here, but I explain it in more depth in my blog post on
FSTs[1]. Note that the algorithm was not invented by me, but was published
in paper by Daciuk et al. in 2000 called "Incremental Construction of
MinimalAcyclic Finite-State Automata." Like the suffix cache approach above,
it is also possible to control the amount of extra memory one uses, although
this usually comes with the cost of sacrificing true minimality. (But it's
typically close enough with a reasonably sized cache of states.)

The catch is that Daciuk's algorithm only works if you add your keys in
lexicographic ascending order. In our case, since we're dealing with ranges,
we also need the additional requirement that ranges are either equivalent
or do not overlap at all. For example, if one were given the following byte
ranges:

    [BC-BF][80-BF]
    [BC-BF][90-BF]

Then Daciuk's algorithm would not work, since there is nothing to handle the
fact that the ranges overlap. They would need to be split apart. Thankfully,
Thompson's algorithm for producing byte ranges for Unicode codepoint ranges
meets both of our requirements. (A proof for this eludes me, but it appears
true.)

... however, we would also like to be able to compile UTF-8 automata in
reverse. We want this because in order to find the starting location of a
match using a DFA, we need to run a second DFA---a reversed version of the
forward DFA---backwards to discover the match location. Unfortunately, if
we reverse our byte sequences for 0x00-0x10FFFF, we get sequences that are
can overlap, even if they are sorted:

    [00-7F]
    [80-BF][80-9F][ED-ED]
    [80-BF][80-BF][80-8F][F4-F4]
    [80-BF][80-BF][80-BF][F1-F3]
    [80-BF][80-BF][90-BF][F0-F0]
    [80-BF][80-BF][E1-EC]
    [80-BF][80-
```