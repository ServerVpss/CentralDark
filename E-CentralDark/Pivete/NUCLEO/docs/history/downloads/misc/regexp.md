# OUTRO - regexp.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\urlpattern-0.3.0\src\regexp.rs
**SHA:** 0062ecfa89058a1b
**Timestamp:** 2026-08-28T02:36:34.035693
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- fn parse(pattern: &str, flags: &str) -> Result<Self, ()>;
- fn parse(pattern: &str, flags: &str) -> Result<Self, ()> {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::parser::RegexSyntax;

pub trait RegExp: Sized {
  fn syntax() -> RegexSyntax;

  /// Generates a regexp pattern for the given string. If the pattern is
  /// invalid, the parse function should return an error.
  fn parse(pattern: &str, flags: &str) -> Result<Self, ()>;

  /// Matches the given text against the regular expression and returns the list
  /// of captures. The matches are returned in the order they appear in the
  /// regular expression. It is **not** prefixed with the full match. For groups
  /// that occur in the regular expression, but did not match, the corresponding
  /// capture should be `None`.
  ///
  /// Returns `None` if the text does not match the regular expression.
  fn matches<'a>(&self, text: &'a str) -> Option<Vec<Option<&'a str>>>;
}

impl RegExp for regex::Regex {
  fn syntax() -> RegexSyntax {
    RegexSyntax::Rust
  }

  fn parse(pattern: &str, flags: &str) -> Result<Self, ()> {
    regex::Regex::new(&format!("(?{flags}){pattern}")).map_err(|_| ())
  }

  fn matches<'a>(&self, text: &'a str) -> Option<Vec<Option<&'a str>>> {
    let captures = self.captures(text)?;

    let captures = captures
      .iter()
      .skip(1)
      .map(|c| c.map(|m| m.as_str()))
      .collect();

    Some(captures)
  }
}

```