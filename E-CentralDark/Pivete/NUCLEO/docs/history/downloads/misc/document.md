# OUTRO - document.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml_parser-1.1.3+spec-1.1.0\src\parser\document.rs
**SHA:** a9c00e6755ea4c24
**Timestamp:** 2026-08-28T02:36:26.911633
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = stream.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
use winnow::stream::Offset as _;
use winnow::stream::Stream as _;
use winnow::stream::TokenSlice;

use super::EventReceiver;
use crate::ErrorSink;
use crate::Expected;
use crate::ParseError;
#[cfg(feature = "debug")]
use crate::debug::DebugErrorSink;
#[cfg(feature = "debug")]
use crate::debug::DebugEventReceiver;
use crate::decoder::Encoding;
use crate::lexer::Token;
use crate::lexer::TokenKind;

/// Parse lexed tokens into [`Event`][super::Event]s
pub fn parse_document(
    tokens: &[Token],
    receiver: &mut dyn EventReceiver,
    error: &mut dyn ErrorSink,
) {
    let mut tokens = TokenSlice::new(tokens);
    #[cfg(feature = "debug")]
    let mut receiver = DebugEventReceiver::new(receiver);
    #[cfg(feature = "debug")]
    let receiver = &mut receiver;
    #[cfg(feature = "debug")]
    let mut error = DebugErrorSink::new(error);
    #[cfg(feature = "debug")]
    let error = &mut error;
    document(&mut tokens, receiver, error);
    eof(&mut tokens, receiver, error);
}

/// Parse lexed tokens into [`Event`][super::Event]s
pub fn parse_key(tokens: &[Token], receiver: &mut dyn EventReceiver, error: &mut dyn ErrorSink) {
    let mut tokens = TokenSlice::new(tokens);
    #[cfg(feature = "debug")]
    let mut receiver = DebugEventReceiver::new(receiver);
    #[cfg(feature = "debug")]
    let receiver = &mut receiver;
    #[cfg(feature = "debug")]
    let mut error = DebugErrorSink::new(error);
    #[cfg(feature = "debug")]
    let error = &mut error;
    key(&mut tokens, "invalid key", receiver, error);
    eof(&mut tokens, receiver, error);
}

/// Parse lexed tokens into [`Event`][super::Event]s
pub fn parse_simple_key(
    tokens: &[Token],
    receiver: &mut dyn EventReceiver,
    error: &mut dyn ErrorSink,
) {
    let mut tokens = TokenSlice::new(tokens);
    #[cfg(feature = "debug")]
    let mut receiver = DebugEventReceiver::new(receiver);
    #[cfg(feature = "debug")]
    let receiver = &mut receiver;
    #[cfg(feature = "debug")]
    let mut error = DebugErrorSink::new(error);
    #[cfg(feature = "debug")]
    let error = &mut error;
    simple_key(&mut tokens, "invalid key", receiver, error);
    eof(&mut tokens, receiver, error);
}

/// Parse lexed tokens into [`Event`][super::Event]s
pub fn parse_value(tokens: &[Token], receiver: &mut dyn EventReceiver, error: &mut dyn ErrorSink) {
    let mut tokens = TokenSlice::new(tokens);
    #[cfg(feature = "debug")]
    let mut receiver = DebugEventReceiver::new(receiver);
    #[cfg(feature = "debug")]
    let receiver = &mut receiver;
    #[cfg(feature = "debug")]
    let mut error = DebugErrorSink::new(error);
    #[cfg(feature = "debug")]
    let error = &mut error;
    value(&mut tokens, receiver, error);
    eof(&mut tokens, receiver, error);
}

type Stream<'i> = TokenSlice<'i, Token>;

/// Parse a TOML Document
///
/// Only the order of [`Event`][super::Event]s is validated and not [`Event`][super::Event] content nor semantics like duplicate
/// keys.
///
/// ```abnf
/// toml = expression *( newline expression )
///
/// expression =  ws [ comment ]
/// expression =/ ws keyval ws [ comment ]
/// expression =/ ws table ws [ comment ]
///
/// ;; Key-Value pairs
///
/// keyval = key keyval-sep val
/// key = simple-key / dotted-key
/// val = string / boolean / array / inline-table / date-time / float / integer
///
/// simple-key = quoted-key / unquoted-key
///
/// ;; Quoted and dotted key
///
/// quoted-key = basic-string / literal-string
/// dotted-key = simple-key 1*( dot-sep simple-key )
///
/// dot-sep   = ws %x2E ws  ; . Period
/// keyval-sep = ws %x3D ws ; =
///
/// ;; Array
///
/// array = array-open [ array-values ] ws-comment-newline array-close
///
/// array-open =  %x5B ; [
/// array-close = %x5D ; ]
///
/// array-values =  ws-comment-newline val ws-comment-newline array-sep array-values
/// array-values =/ ws-comment-newline val ws-comment-newline [ array-sep ]
///
/// array-sep = %x2C  ; , Comma
///
/// ;; Table
///
/// table = std-table / array-table
///
/// ;; Standard Table
///
/// std-table = std-table-open key std-table-close
///
/// ;; Inline Table
///
/// inline-table = inline-table-open [ inline-table-keyvals ] ws-comment-newline inline-table-close
///
/// inline-table-keyvals =  ws-comment-newline keyval ws-comment-newline inline-table-sep inline-table-keyvals
/// inline-table-keyvals =/ ws-comment-newline keyval ws-comment-newline [ inline-table-sep ]
///
/// ;; Array Table
///
/// array-table = array-table-open key array-table-close
/// ```
fn document(tokens: &mut Stream<'_>, receiver: &mut dyn EventReceiver, error: &mut dyn ErrorSink) {
    while let Some(current_token) = tokens.next_token() {
        match current_token.kind() {
            TokenKind::LeftSquareBracket => on_table(tokens, current_token, receiver, error),
            TokenKind::RightSquareBracket => {
                on_missing_std_table(tokens, current_token, receiver, error);
            }
            TokenKind::LiteralString => on_expression_key(
            
```