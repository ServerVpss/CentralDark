# OUTRO - constructor_parser.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\urlpattern-0.3.0\src\constructor_parser.rs
**SHA:** 3373e1e4f50fc487
**Timestamp:** 2026-08-28T02:36:34.005555
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- component_start: usize,
- self.component_start = self.token_index;
- component_start: 0,

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

use crate::error::Error;
use crate::regexp::RegExp;
use crate::tokenizer::Token;
use crate::tokenizer::TokenType;
use crate::UrlPatternInit;

// Ref: https://wicg.github.io/urlpattern/#constructor-string-parser-state
#[derive(Debug, Eq, PartialEq)]
enum ConstructorStringParserState {
  Init,
  Protocol,
  Authority,
  Username,
  Password,
  Hostname,
  Port,
  Pathname,
  Search,
  Hash,
  Done,
}

// Ref: https://wicg.github.io/urlpattern/#constructor-string-parser
struct ConstructorStringParser<'a> {
  input: &'a str,
  token_list: Vec<Token>,
  result: UrlPatternInit,
  component_start: usize,
  token_index: usize,
  token_increment: usize,
  group_depth: usize,
  hostname_ipv6_bracket_depth: usize,
  protocol_matches_special_scheme: bool,
  state: ConstructorStringParserState,
}

impl<'a> ConstructorStringParser<'a> {
  // Ref: https://wicg.github.io/urlpattern/#rewind
  #[inline]
  fn rewind(&mut self) {
    self.token_index = self.component_start;
    self.token_increment = 0;
  }

  // Ref: https://wicg.github.io/urlpattern/#is-a-hash-prefix
  #[inline]
  fn is_hash_prefix(&self) -> bool {
    self.is_non_special_pattern_char(self.token_index, "#")
  }

  // Ref: https://wicg.github.io/urlpattern/#is-a-protocol-suffix
  #[inline]
  fn is_protocol_suffix(&self) -> bool {
    self.is_non_special_pattern_char(self.token_index, ":")
  }

  // Ref: https://wicg.github.io/urlpattern/#is-a-search-prefix
  fn is_search_prefix(&self) -> bool {
    if self.is_non_special_pattern_char(self.token_index, "?") {
      return true;
    }
    if self.token_list[self.token_index].value != "?" {
      return false;
    }
    if self.token_index == 0 {
      return true;
    }
    let previous_token = self.get_safe_token(self.token_index - 1);
    !matches!(
      previous_token.kind,
      TokenType::Name
        | TokenType::Regexp
        | TokenType::Close
        | TokenType::Asterisk
    )
  }

  // Ref: https://wicg.github.io/urlpattern/#is-a-password-prefix
  #[inline]
  fn is_password_prefix(&self) -> bool {
    self.is_non_special_pattern_char(self.token_index, ":")
  }

  // Ref: https://wicg.github.io/urlpattern/#is-a-port-prefix
  #[inline]
  fn is_port_prefix(&self) -> bool {
    self.is_non_special_pattern_char(self.token_index, ":")
  }

  // Ref: https://wicg.github.io/urlpattern/#is-a-pathname-start
  #[inline]
  fn is_pathname_start(&self) -> bool {
    self.is_non_special_pattern_char(self.token_index, "/")
  }

  // Ref: https://wicg.github.io/urlpattern/#is-an-identity-terminator
  #[inline]
  fn is_identity_terminator(&self) -> bool {
    self.is_non_special_pattern_char(self.token_index, "@")
  }

  // Ref: https://wicg.github.io/urlpattern/#is-a-non-special-pattern-char
  fn is_non_special_pattern_char(&self, index: usize, value: &str) -> bool {
    let token = self.get_safe_token(index);
    if token.value != value {
      false
    } else {
      matches!(
        token.kind,
        TokenType::Char | TokenType::EscapedChar | TokenType::InvalidChar
      )
    }
  }

  // Ref: https://wicg.github.io/urlpattern/#get-a-safe-token
  fn get_safe_token(&self, index: usize) -> &Token {
    if index < self.token_list.len() {
      &self.token_list[index]
    } else {
      assert!(!self.token_list.is_empty());
      let token = self.token_list.last().unwrap();
      assert!(token.kind == TokenType::End);
      token
    }
  }

  // Ref: https://wicg.github.io/urlpattern/#change-state
  fn change_state(
    &mut self,
    new_state: ConstructorStringParserState,
    skip: usize,
  ) {
    match self.state {
      ConstructorStringParserState::Protocol => {
        self.result.protocol = Some(self.make_component_string())
      }
      ConstructorStringParserState::Username => {
        self.result.username = Some(self.make_component_string())
      }
      ConstructorStringParserState::Password => {
        self.result.password = Some(self.make_component_string())
      }
      ConstructorStringParserState::Hostname => {
        self.result.hostname = Some(self.make_component_string())
      }
      ConstructorStringParserState::Port => {
        self.result.port = Some(self.make_component_string())
      }
      ConstructorStringParserState::Pathname => {
        self.result.pathname = Some(self.make_component_string())
      }
      ConstructorStringParserState::Search => {
        self.result.search = Some(self.make_component_string())
      }
      ConstructorStringParserState::Hash => {
        self.result.hash = Some(self.make_component_string())
      }
      ConstructorStringParserState::Init
      | ConstructorStringParserState::Authority
      | ConstructorStringParserState::Done => {}
    }

    if self.state != ConstructorStringParserState::Init
      && new_state != ConstructorStringParserState::Done
    {
      if matches!(
        self.state,
        ConstructorStringParserState::Protocol
          | Construct
```