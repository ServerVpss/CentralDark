# OUTRO - canonicalize_and_process.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\urlpattern-0.3.0\src\canonicalize_and_process.rs
**SHA:** d92c696d0b444bf4
**Timestamp:** 2026-08-28T02:36:33.632191
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- url.set_port(Some(port)).unwrap(); // TODO: dont unwrap, instead ParseError

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

// NOTE to all: the code in this crate sometimes slightly diverges from the
// precise wording of the spec, because rust-url does not expose all the
// routines exactly as the spec wants. The end behaviour should be identical.

use crate::Error;

// https://wicg.github.io/urlpattern/#canon-encoding-callbacks

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-protocol
pub fn canonicalize_protocol(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  url::Url::parse(&format!("{value}://dummy.test"))
    .map(|url| url.scheme().to_owned())
    .map_err(Error::Url)
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-username
pub fn canonicalize_username(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  let mut url = url::Url::parse("http://dummy.test").unwrap();
  // Note: unwrap is safe, because this is a HTTP url that supports username.
  url.set_username(value).unwrap();
  Ok(url.username().to_string())
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-password
pub fn canonicalize_password(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  let mut url = url::Url::parse("http://dummy.test").unwrap();
  // Note: unwrap is safe, because this is a HTTP url that supports password.
  url.set_password(Some(value)).unwrap();
  Ok(url.password().unwrap().to_string())
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-hostname
pub fn canonicalize_hostname(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  let mut url = url::Url::parse("http://dummy.test").unwrap();
  url.set_host(Some(value)).map_err(Error::Url)?;
  Ok(url::quirks::hostname(&url).to_string())
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-an-ipv6-hostname
pub fn canonicalize_ipv6_hostname(value: &str) -> Result<String, Error> {
  let valid_ipv6 = value
    .chars()
    .all(|c| c.is_ascii_hexdigit() || matches!(c, '[' | ']' | ':'));
  if !valid_ipv6 {
    Err(Error::Url(url::ParseError::InvalidIpv6Address))
  } else {
    Ok(value.to_ascii_lowercase())
  }
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-port
pub fn canonicalize_port(
  value: &str,
  mut protocol: Option<&str>,
) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  if let Some("") = protocol {
    protocol = None;
  }
  let port = value
    .parse::<u16>()
    .map_err(|_| Error::Url(url::ParseError::InvalidPort))?;
  // Note: this unwrap is safe, because the protocol was previously parsed to be
  // valid.
  let mut url =
    url::Url::parse(&format!("{}://dummy.test", protocol.unwrap_or("dummy")))
      .unwrap();
  url.set_port(Some(port)).unwrap(); // TODO: dont unwrap, instead ParseError
  Ok(url::quirks::port(&url).to_string())
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-pathname
pub fn canonicalize_pathname(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  let leading_slash = value.starts_with('/');
  let modified_value = if !leading_slash {
    format!("/-{value}")
  } else {
    value.to_string()
  };
  let mut url = url::Url::parse("http://dummy.test").unwrap();
  url.set_path(&modified_value);
  let mut pathname = url::quirks::pathname(&url);
  if !leading_slash {
    pathname = &pathname[2..];
  }
  Ok(pathname.to_string())
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-an-opaque-pathname
pub fn canonicalize_an_opaque_pathname(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  let mut url = url::Url::parse("data:dummy,test").unwrap();
  url.set_path(value);
  Ok(url::quirks::pathname(&url).to_string())
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-search
pub fn canonicalize_search(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  let mut url = url::Url::parse("http://dummy.test").unwrap();
  url.set_query(Some(value));
  Ok(url.query().unwrap_or("").to_string())
}

// Ref: https://wicg.github.io/urlpattern/#canonicalize-a-search
pub fn canonicalize_hash(value: &str) -> Result<String, Error> {
  if value.is_empty() {
    return Ok(String::new());
  }
  let mut url = url::Url::parse("http://dummy.test").unwrap();
  url.set_fragment(Some(value));
  Ok(url.fragment().unwrap_or("").to_string())
}

#[derive(Debug, Eq, PartialEq)]
pub enum ProcessType {
  Pattern,
  Url,
}

// Ref: https://wicg.github.io/urlpattern/#process-protocol-for-init
pub fn process_protocol_init(
  value: &str,
  kind: &ProcessType,
) -> Result<String, Error> {
  let stripped_value = value.strip_suffix(':').unwrap_or(value);
  if kind == &ProcessType::Pattern {
    Ok(stripped_value.to_string())
  } else {
    canonicalize_protocol(stripped_value)
  }
}

/
```