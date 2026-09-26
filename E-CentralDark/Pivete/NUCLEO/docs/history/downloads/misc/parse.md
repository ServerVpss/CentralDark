# OUTRO - parse.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\libcjs\patch\parse.js
**SHA:** d64b16ba5a9eeca2
**Timestamp:** 2026-08-28T02:24:08.985070
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- oldStart: +chunkHeader[1],
- newStart: +chunkHeader[3],

### Gaps
- // TODO: It seems awkward that we indiscriminately trim off

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePatch = parsePatch;
/**
 * Parses a unified diff format patch into a structured patch object.
 *
 * `parsePatch` has some understanding of Git's particular dialect of unified diff format.
 * When parsing a Git patch, each index in the result may contain additional
 * fields (`isRename`, `isBinary`, etc) not included in the data structure returned by
 * `structuredPatch`; see the `StructuredPatch` interface for a full list.
 *
 * @return a JSON object representation of the patch, suitable for use with the `applyPatch`
 * method. This parses to the same structure returned by `structuredPatch`, except that
 * `oldFileName` and `newFileName` may be `undefined` if the patch doesn't contain enough
 * information to determine them (e.g. a hunk-only patch with no file headers).
 */
function parsePatch(uniDiff) {
    const diffstr = uniDiff.split(/\n/), list = [];
    let i = 0;
    // These helper functions identify line types that can appear between files
    // in a multi-file patch. Keeping them in one place avoids subtle
    // inconsistencies from having the same regexes duplicated in multiple places.
    // Matches `diff --git ...` lines specifically.
    function isGitDiffHeader(line) {
        return (/^diff --git /).test(line);
    }
    // Matches lines that denote the start of a new diff's section in a
    // multi-file patch: `diff --git ...`, `Index: ...`, or `diff -r ...`.
    function isDiffHeader(line) {
        return isGitDiffHeader(line)
            || (/^Index:\s/).test(line)
            || (/^diff(?: -r \w+)+\s/).test(line);
    }
    // Matches `--- ...` and `+++ ...` file header lines.
    function isFileHeader(line) {
        return (/^(---|\+\+\+)\s/).test(line);
    }
    // Matches `@@ ...` hunk header lines.
    function isHunkHeader(line) {
        return (/^@@\s/).test(line);
    }
    function parseIndex() {
        var _a;
        const index = {};
        index.hunks = [];
        list.push(index);
        // Parse diff metadata
        let seenDiffHeader = false;
        while (i < diffstr.length) {
            const line = diffstr[i];
            // File header (---, +++) or hunk header (@@) found; end parsing diff metadata
            if (isFileHeader(line) || isHunkHeader(line)) {
                break;
            }
            // The next two branches handle recognized diff headers. Note that
            // isDiffHeader deliberately does NOT match arbitrary `diff`
            // commands like `diff -u -p -r1.1 -r1.2`, because in some
            // formats (e.g. CVS diffs) such lines appear as metadata within
            // a single file's header section, after an `Index:` line. See the
            // diffx documentation (https://diffx.org) for examples.
            //
            // In both branches: if we've already seen a diff header for *this*
            // file and now we encounter another one, it must belong to the
            // next file, so break.
            if (isGitDiffHeader(line)) {
                if (seenDiffHeader) {
                    return;
                }
                seenDiffHeader = true;
                index.isGit = true;
                // Parse the old and new filenames from the `diff --git` header and
                // tentatively set oldFileName and newFileName from them. These may
                // be overridden below by `rename from` / `rename to` or `copy from` /
                // `copy to` extended headers, or by --- and +++ lines. But for Git
                // diffs that lack all of those (e.g. mode-only changes, binary
                // file changes without rename), these are the only filenames we
                // get.
                // parseGitDiffHeader returns null if the header can't be parsed
                // (e.g. unterminated quoted filename, or unexpected format). In
                // that case we skip setting filenames here; they may still be
                // set from --- / +++ or rename from / rename to lines below.
                const paths = parseGitDiffHeader(line);
                if (paths) {
                    index.oldFileName = paths.oldFileName;
                    index.newFileName = paths.newFileName;
                }
                // Consume Git extended headers (`old mode`, `new mode`, `rename from`,
                // `rename to`, `similarity index`, `index`, `Binary files ... differ`,
                // etc.)
                i++;
                while (i < diffstr.length) {
                    const extLine = diffstr[i];
                    // Stop consuming extended headers if we hit a file header,
                    // hunk header, or another diff header.
                    if (isFileHeader(extLine) || isHunkHeader(extLine) || isDiffHeader(extLine)) {
                        break;
                    }
                    // Parse `rename from` / `rename to` lines - these give us
                   
```

---

# OUTRO - parse.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\libesm\patch\parse.js
**SHA:** 0d8c9a406b8ee41b
**Timestamp:** 2026-08-28T02:24:10.282573
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- oldStart: +chunkHeader[1],
- newStart: +chunkHeader[3],

### Gaps
- // TODO: It seems awkward that we indiscriminately trim off

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Parses a unified diff format patch into a structured patch object.
 *
 * `parsePatch` has some understanding of Git's particular dialect of unified diff format.
 * When parsing a Git patch, each index in the result may contain additional
 * fields (`isRename`, `isBinary`, etc) not included in the data structure returned by
 * `structuredPatch`; see the `StructuredPatch` interface for a full list.
 *
 * @return a JSON object representation of the patch, suitable for use with the `applyPatch`
 * method. This parses to the same structure returned by `structuredPatch`, except that
 * `oldFileName` and `newFileName` may be `undefined` if the patch doesn't contain enough
 * information to determine them (e.g. a hunk-only patch with no file headers).
 */
export function parsePatch(uniDiff) {
    const diffstr = uniDiff.split(/\n/), list = [];
    let i = 0;
    // These helper functions identify line types that can appear between files
    // in a multi-file patch. Keeping them in one place avoids subtle
    // inconsistencies from having the same regexes duplicated in multiple places.
    // Matches `diff --git ...` lines specifically.
    function isGitDiffHeader(line) {
        return (/^diff --git /).test(line);
    }
    // Matches lines that denote the start of a new diff's section in a
    // multi-file patch: `diff --git ...`, `Index: ...`, or `diff -r ...`.
    function isDiffHeader(line) {
        return isGitDiffHeader(line)
            || (/^Index:\s/).test(line)
            || (/^diff(?: -r \w+)+\s/).test(line);
    }
    // Matches `--- ...` and `+++ ...` file header lines.
    function isFileHeader(line) {
        return (/^(---|\+\+\+)\s/).test(line);
    }
    // Matches `@@ ...` hunk header lines.
    function isHunkHeader(line) {
        return (/^@@\s/).test(line);
    }
    function parseIndex() {
        var _a;
        const index = {};
        index.hunks = [];
        list.push(index);
        // Parse diff metadata
        let seenDiffHeader = false;
        while (i < diffstr.length) {
            const line = diffstr[i];
            // File header (---, +++) or hunk header (@@) found; end parsing diff metadata
            if (isFileHeader(line) || isHunkHeader(line)) {
                break;
            }
            // The next two branches handle recognized diff headers. Note that
            // isDiffHeader deliberately does NOT match arbitrary `diff`
            // commands like `diff -u -p -r1.1 -r1.2`, because in some
            // formats (e.g. CVS diffs) such lines appear as metadata within
            // a single file's header section, after an `Index:` line. See the
            // diffx documentation (https://diffx.org) for examples.
            //
            // In both branches: if we've already seen a diff header for *this*
            // file and now we encounter another one, it must belong to the
            // next file, so break.
            if (isGitDiffHeader(line)) {
                if (seenDiffHeader) {
                    return;
                }
                seenDiffHeader = true;
                index.isGit = true;
                // Parse the old and new filenames from the `diff --git` header and
                // tentatively set oldFileName and newFileName from them. These may
                // be overridden below by `rename from` / `rename to` or `copy from` /
                // `copy to` extended headers, or by --- and +++ lines. But for Git
                // diffs that lack all of those (e.g. mode-only changes, binary
                // file changes without rename), these are the only filenames we
                // get.
                // parseGitDiffHeader returns null if the header can't be parsed
                // (e.g. unterminated quoted filename, or unexpected format). In
                // that case we skip setting filenames here; they may still be
                // set from --- / +++ or rename from / rename to lines below.
                const paths = parseGitDiffHeader(line);
                if (paths) {
                    index.oldFileName = paths.oldFileName;
                    index.newFileName = paths.newFileName;
                }
                // Consume Git extended headers (`old mode`, `new mode`, `rename from`,
                // `rename to`, `similarity index`, `index`, `Binary files ... differ`,
                // etc.)
                i++;
                while (i < diffstr.length) {
                    const extLine = diffstr[i];
                    // Stop consuming extended headers if we hit a file header,
                    // hunk header, or another diff header.
                    if (isFileHeader(extLine) || isHunkHeader(extLine) || isDiffHeader(extLine)) {
                        break;
                    }
                    // Parse `rename from` / `rename to` lines - these give us
                    // unambiguous filenames. These lines don't include the
                    // a/ and b/ prefixes that
```

---

# OUTRO - parse.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\eventsource-parser@3.1.1@@@1\src\parse.ts
**SHA:** 51541ac36a5a2cc7
**Timestamp:** 2026-08-28T02:24:13.731862
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const valueStart =
- function parseLine(chunk: string, start: number, end: number) {
- if (start === end) {
- const valueStart = chunk.charCodeAt(start + 5) === SPACE ? start + 6 : start + 5

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * EventSource/Server-Sent Events parser
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html
 */
import {ParseError} from './errors.ts'
import type {EventSourceParser, ParserConfig} from './types.ts'

// ASCII codes used in the hot parsing paths.
const LF = 10
const CR = 13
const SPACE = 32

// oxlint-disable-next-line no-unused-vars
function noop(_arg: unknown) {
  // intentional noop
}

/**
 * Creates a new EventSource parser.
 *
 * @param config - Parser configuration. Accepts callbacks (see {@link ParserCallbacks})
 *   and options like `maxBufferSize` (see {@link ParserConfig}).
 *
 * @returns A new EventSource parser, with `feed` and `reset` methods.
 * @public
 */
export function createParser(config: ParserConfig): EventSourceParser {
  if (typeof config === 'function') {
    throw new TypeError(
      '`config` must be an object, got a function instead. Did you mean `createParser({onEvent: fn})`?',
    )
  }

  const {onEvent = noop, onError = noop, onRetry = noop, onComment, maxBufferSize} = config

  // Trailing bytes from prior `feed()` calls that did not yet form a complete line.
  // Stored as an array of fragments and only joined when a line terminator arrives.
  // Concatenating per-feed (`prefix + chunk`) is O(N²) when a single SSE line spans
  // many chunks (e.g. a large `data:` payload streamed in tiny slices, or an MCP-style
  // server that emits one giant content block). Buffering as fragments + joining once
  // makes the same workload linear.
  const pendingFragments: string[] = []

  // Running total of `pendingFragments` lengths, kept in sync with the array so the
  // `maxBufferSize` check doesn't have to walk the fragment list on every feed.
  let pendingFragmentsLength = 0

  let isFirstChunk = true
  let id: string | undefined
  let data = ''
  let dataLines = 0
  let eventType: string | undefined

  // Set after a `maxBufferSize` overflow. Once tripped, `feed()` throws until
  // `reset()` is called — see the comment on `maxBufferSize` in `ParserConfig`.
  let terminated = false

  /**
   * Feeds a chunk of the SSE stream to the parser. Any trailing bytes that do
   * not yet form a complete line are held back and prepended to the next chunk,
   * so callers can pass arbitrary slices of the stream without worrying about
   * line boundaries.
   *
   * Per the SSE spec, a UTF-8 BOM (0xEF 0xBB 0xBF) at the start of the very
   * first chunk is stripped before parsing.
   *
   * @see https://html.spec.whatwg.org/multipage/server-sent-events.html#parsing-an-event-stream
   */
  function feed(chunk: string) {
    if (terminated) {
      throw new Error(
        'Cannot feed parser: it was terminated after exceeding the configured max buffer size. Call `reset()` to resume parsing.',
      )
    }

    if (isFirstChunk) {
      isFirstChunk = false
      // Match and strip UTF-8 BOM from the start of the stream, if present.
      // (Per the spec, this is only valid at the very start of the stream)
      if (
        chunk.charCodeAt(0) === 0xef &&
        chunk.charCodeAt(1) === 0xbb &&
        chunk.charCodeAt(2) === 0xbf
      ) {
        chunk = chunk.slice(3)
      }
    }

    // Hot path: no buffered prefix from a prior partial line. Hand the chunk
    // straight to `processLines`, exactly like the original implementation.
    // Zero new work in the common case (every chunk ends with `\n\n`).
    if (pendingFragments.length === 0) {
      const trailing = processLines(chunk)
      if (trailing !== '') {
        pendingFragments.push(trailing)
        pendingFragmentsLength = trailing.length
      }
      checkBufferSize()
      return
    }

    // We have a buffered prefix. If this chunk also has no terminator, append
    // to the buffer without concatenating — that's the O(N²) trap we're
    // avoiding (large single `data:` payload split across many tiny chunks).
    if (chunk.indexOf('\n') === -1 && chunk.indexOf('\r') === -1) {
      pendingFragments.push(chunk)
      pendingFragmentsLength += chunk.length
      checkBufferSize()
      return
    }

    // Terminator arrived. Join the accumulated fragments + this chunk once,
    // process, and buffer any new trailing partial line.
    pendingFragments.push(chunk)
    const input = pendingFragments.join('')
    pendingFragments.length = 0
    pendingFragmentsLength = 0
    const trailing = processLines(input)
    if (trailing !== '') {
      pendingFragments.push(trailing)
      pendingFragmentsLength = trailing.length
    }
    checkBufferSize()
  }

  function checkBufferSize() {
    if (maxBufferSize === undefined) return
    if (pendingFragmentsLength + data.length <= maxBufferSize) return

    terminated = true
    pendingFragments.length = 0
    pendingFragmentsLength = 0
    id = undefined
    data = ''
    dataLines = 0
    eventType = undefined
    onError(
      new ParseError(`Buffered data exceeded max buffer size of ${maxBufferSize} characters`, {
        type: 'max-buffer-size-excee
```

---

# OUTRO - parse.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\mime-0.3.17\src\parse.rs
**SHA:** 3610253295af9780
**Timestamp:** 2026-08-28T02:34:49.374927
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.pos;
- start = i + 1;
- Some((i, b'+')) if i > start => {
- Some((i, b';')) if i > start => {
- start = i;
- fn params_from_str(s: &str, iter: &mut Enumerate<Bytes>, mut start: usize) -> Result<ParamSource, ParseError> {
- Some((i, b' ')) if i == start => {
- start = i + 1;
- Some((i, b'=')) if i > start => {
- start = i + 1;

### Ouro Bruto (primeiros 5000 chars)
```
#[allow(unused, deprecated)]
use std::ascii::AsciiExt;
use std::error::Error;
use std::fmt;
use std::iter::Enumerate;
use std::str::Bytes;

use super::{Mime, MimeIter, Source, ParamSource, Indexed, CHARSET, UTF_8};

#[derive(Debug)]
pub enum ParseError {
    MissingSlash,
    MissingEqual,
    MissingQuote,
    InvalidToken {
        pos: usize,
        byte: u8,
    },
}

impl ParseError {
    fn s(&self) -> &str {
        use self::ParseError::*;

        match *self {
            MissingSlash => "a slash (/) was missing between the type and subtype",
            MissingEqual => "an equals sign (=) was missing between a parameter and its value",
            MissingQuote => "a quote (\") was missing from a parameter value",
            InvalidToken { .. } => "an invalid token was encountered",
        }
    }
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        if let ParseError::InvalidToken { pos, byte } = *self {
            write!(f, "{}, {:X} at position {}", self.s(), byte, pos)
        } else {
            f.write_str(self.s())
        }
    }
}

impl Error for ParseError {
    // Minimum Rust is 1.15, Error::description was still required then
    #[allow(deprecated)]
    fn description(&self) -> &str {
        self.s()
    }
}

impl<'a> MimeIter<'a> {
    /// A new iterator over mimes or media types
    pub fn new(s: &'a str) -> Self {
        Self {
            pos: 0,
            source: s,
        }
    }
}

impl<'a> Iterator for MimeIter<'a> {
    type Item = Result<Mime, &'a str>;

    fn next(&mut self) -> Option<Self::Item> {
        let start = self.pos;
        let len = self.source.bytes().len();

        if start >= len {
            return None
        }

        // Try parsing the whole remaining slice, until the end
        match parse(&self.source[start ..len]) {
            Ok(value) => {
                self.pos = len;
                Some(Ok(value))
            }
            Err(ParseError::InvalidToken { pos, .. }) => {
                // The first token is immediately found to be wrong by `parse`. Skip it
                if pos == 0 {
                    self.pos += 1;
                    return self.next()
                }
                let slice = &self.source[start .. start + pos];
                // Try parsing the longest slice (until the first invalid token)
                return match parse(slice) {
                    Ok(mime) => {
                        self.pos = start + pos + 1;
                        Some(Ok(mime))
                    }
                    Err(_) => {
                        if start + pos < len {
                            // Skip this invalid slice,
                            // try parsing the remaining slice in the next iteration
                            self.pos = start + pos;
                            Some(Err(slice))
                        } else {
                            None
                        }
                    }
                }
            }
            // Do not process any other error condition: the slice is malformed and
            // no character is found to be invalid: a character is missing
            Err(_) => None,
        }
    }
}

pub fn parse(s: &str) -> Result<Mime, ParseError> {
    if s == "*/*" {
        return Ok(::STAR_STAR);
    }

    let mut iter = s.bytes().enumerate();
    // toplevel
    let mut start;
    let slash;
    loop {
        match iter.next() {
            Some((_, c)) if is_token(c) => (),
            Some((i, b'/')) if i > 0 => {
                slash = i;
                start = i + 1;
                break;
            },
            None => return Err(ParseError::MissingSlash), // EOF and no toplevel is no Mime
            Some((pos, byte)) => return Err(ParseError::InvalidToken {
                pos: pos,
                byte: byte,
            })
        };

    }

    // sublevel
    let mut plus = None;
    loop {
        match iter.next() {
            Some((i, b'+')) if i > start => {
                plus = Some(i);
            },
            Some((i, b';')) if i > start => {
                start = i;
                break;
            },
            Some((_, c)) if is_token(c) => (),
            None => {
                return Ok(Mime {
                    source: Source::Dynamic(s.to_ascii_lowercase()),
                    slash: slash,
                    plus: plus,
                    params: ParamSource::None,
                });
            },
            Some((pos, byte)) => return Err(ParseError::InvalidToken {
                pos: pos,
                byte: byte,
            })
        };
    }

    // params
    let params = params_from_str(s, &mut iter, start)?;

    let src = match params {
        ParamSource::Utf8(_)  => s.to_ascii_lowercase(),
        ParamSource::Custom(semicolon, ref indices) => lower_ascii_with_params(s, semicolon, indices),
        ParamSource::None => {
            // Chop 
```

---

# OUTRO - parse.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\proc-macro2-1.0.107\src\parse.rs
**SHA:** 1257d423e9311dda
**Timestamp:** 2026-08-28T02:35:00.299704
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Pattern: FnMut(char) -> bool,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::fallback::{
    self, is_ident_continue, is_ident_start, Group, Ident, LexError, Literal, Span, TokenStream,
    TokenStreamBuilder,
};
use crate::{Delimiter, Punct, Spacing, TokenTree};
use alloc::borrow::ToOwned as _;
use alloc::string::ToString as _;
use alloc::vec::Vec;
use core::char;
use core::str::{Bytes, CharIndices, Chars};

#[derive(Copy, Clone, Eq, PartialEq)]
pub(crate) struct Cursor<'a> {
    pub(crate) rest: &'a str,
    #[cfg(span_locations)]
    pub(crate) off: u32,
}

impl<'a> Cursor<'a> {
    pub(crate) fn advance(&self, bytes: usize) -> Cursor<'a> {
        let (_front, rest) = self.rest.split_at(bytes);
        Cursor {
            rest,
            #[cfg(span_locations)]
            off: self.off + _front.chars().count() as u32,
        }
    }

    pub(crate) fn starts_with(&self, s: &str) -> bool {
        self.rest.starts_with(s)
    }

    pub(crate) fn starts_with_char(&self, ch: char) -> bool {
        self.rest.starts_with(ch)
    }

    pub(crate) fn starts_with_fn<Pattern>(&self, f: Pattern) -> bool
    where
        Pattern: FnMut(char) -> bool,
    {
        self.rest.starts_with(f)
    }

    pub(crate) fn is_empty(&self) -> bool {
        self.rest.is_empty()
    }

    fn len(&self) -> usize {
        self.rest.len()
    }

    fn as_bytes(&self) -> &'a [u8] {
        self.rest.as_bytes()
    }

    fn bytes(&self) -> Bytes<'a> {
        self.rest.bytes()
    }

    fn chars(&self) -> Chars<'a> {
        self.rest.chars()
    }

    fn char_indices(&self) -> CharIndices<'a> {
        self.rest.char_indices()
    }

    fn parse(&self, tag: &str) -> Result<Cursor<'a>, Reject> {
        if self.starts_with(tag) {
            Ok(self.advance(tag.len()))
        } else {
            Err(Reject)
        }
    }
}

pub(crate) struct Reject;
type PResult<'a, O> = Result<(Cursor<'a>, O), Reject>;

fn skip_whitespace(input: Cursor) -> Cursor {
    let mut s = input;

    while !s.is_empty() {
        let byte = s.as_bytes()[0];
        if byte == b'/' {
            if s.starts_with("//")
                && (!s.starts_with("///") || s.starts_with("////"))
                && !s.starts_with("//!")
            {
                let (cursor, _) = take_until_newline_or_eof(s);
                s = cursor;
                continue;
            } else if s.starts_with("/**/") {
                s = s.advance(4);
                continue;
            } else if s.starts_with("/*")
                && (!s.starts_with("/**") || s.starts_with("/***"))
                && !s.starts_with("/*!")
            {
                match block_comment(s) {
                    Ok((rest, _)) => {
                        s = rest;
                        continue;
                    }
                    Err(Reject) => return s,
                }
            }
        }
        match byte {
            b' ' | 0x09..=0x0d => {
                s = s.advance(1);
                continue;
            }
            b if b.is_ascii() => {}
            _ => {
                let ch = s.chars().next().unwrap();
                if is_whitespace(ch) {
                    s = s.advance(ch.len_utf8());
                    continue;
                }
            }
        }
        return s;
    }
    s
}

fn block_comment(input: Cursor) -> PResult<&str> {
    if !input.starts_with("/*") {
        return Err(Reject);
    }

    let mut depth = 0usize;
    let bytes = input.as_bytes();
    let mut i = 0usize;
    let upper = bytes.len() - 1;

    while i < upper {
        if bytes[i] == b'/' && bytes[i + 1] == b'*' {
            depth += 1;
            i += 1; // eat '*'
        } else if bytes[i] == b'*' && bytes[i + 1] == b'/' {
            depth -= 1;
            if depth == 0 {
                return Ok((input.advance(i + 2), &input.rest[..i + 2]));
            }
            i += 1; // eat '/'
        }
        i += 1;
    }

    Err(Reject)
}

fn is_whitespace(ch: char) -> bool {
    // Rust treats left-to-right mark and right-to-left mark as whitespace
    ch.is_whitespace() || ch == '\u{200e}' || ch == '\u{200f}'
}

fn word_break(input: Cursor) -> Result<Cursor, Reject> {
    match input.chars().next() {
        Some(ch) if is_ident_continue(ch) => Err(Reject),
        Some(_) | None => Ok(input),
    }
}

// Rustc's representation of a macro expansion error in expression position or
// type position.
const ERROR: &str = "(/*ERROR*/)";

pub(crate) fn token_stream(mut input: Cursor) -> Result<TokenStream, LexError> {
    let mut tokens = TokenStreamBuilder::new();
    let mut stack = Vec::new();

    loop {
        input = skip_whitespace(input);

        if let Ok((rest, ())) = doc_comment(input, &mut tokens) {
            input = rest;
            continue;
        }

        #[cfg(span_locations)]
        let lo = input.off;

        let Some(first) = input.bytes().next() else {
            return match stack.last() {
                None => Ok(tokens.build()),
                #[cfg(span_locations)]
    
```