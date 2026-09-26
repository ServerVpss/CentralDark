# OUTRO - host.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\url-2.5.8\src\host.rs
**SHA:** 24bba45b14cb843e
**Timestamp:** 2026-08-28T02:36:33.239999
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut start = -1;
- start = i;
- start = -1;
- let start = i;

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2013-2016 The rust-url developers.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use crate::net::{Ipv4Addr, Ipv6Addr};
use alloc::borrow::Cow;
use alloc::borrow::ToOwned;
use alloc::string::String;
use alloc::vec::Vec;
use core::cmp;
use core::fmt::{self, Formatter};

use percent_encoding::{percent_decode, utf8_percent_encode, CONTROLS};
#[cfg(feature = "serde")]
use serde_derive::{Deserialize, Serialize};

use crate::parser::{ParseError, ParseResult};

#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub(crate) enum HostInternal {
    None,
    Domain,
    Ipv4(Ipv4Addr),
    Ipv6(Ipv6Addr),
}

impl From<Host<Cow<'_, str>>> for HostInternal {
    fn from(host: Host<Cow<'_, str>>) -> Self {
        match host {
            Host::Domain(ref s) if s.is_empty() => Self::None,
            Host::Domain(_) => Self::Domain,
            Host::Ipv4(address) => Self::Ipv4(address),
            Host::Ipv6(address) => Self::Ipv6(address),
        }
    }
}

/// The host name of an URL.
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]
#[derive(Clone, Debug, Eq, Ord, PartialOrd, Hash)]
pub enum Host<S = String> {
    /// A DNS domain name, as '.' dot-separated labels.
    /// Non-ASCII labels are encoded in punycode per IDNA if this is the host of
    /// a special URL, or percent encoded for non-special URLs. Hosts for
    /// non-special URLs are also called opaque hosts.
    Domain(S),

    /// An IPv4 address.
    /// `Url::host_str` returns the serialization of this address,
    /// as four decimal integers separated by `.` dots.
    Ipv4(Ipv4Addr),

    /// An IPv6 address.
    /// `Url::host_str` returns the serialization of that address between `[` and `]` brackets,
    /// in the format per [RFC 5952 *A Recommendation
    /// for IPv6 Address Text Representation*](https://tools.ietf.org/html/rfc5952):
    /// lowercase hexadecimal with maximal `::` compression.
    Ipv6(Ipv6Addr),
}

impl Host<&str> {
    /// Return a copy of `self` that owns an allocated `String` but does not borrow an `&Url`.
    pub fn to_owned(&self) -> Host<String> {
        match *self {
            Host::Domain(domain) => Host::Domain(domain.to_owned()),
            Host::Ipv4(address) => Host::Ipv4(address),
            Host::Ipv6(address) => Host::Ipv6(address),
        }
    }
}

impl Host<String> {
    /// Parse a host: either an IPv6 address in [] square brackets, or a domain.
    ///
    /// <https://url.spec.whatwg.org/#host-parsing>
    pub fn parse(input: &str) -> Result<Self, ParseError> {
        Host::<Cow<str>>::parse_cow(input.into()).map(|i| i.into_owned())
    }

    /// <https://url.spec.whatwg.org/#concept-opaque-host-parser>
    pub fn parse_opaque(input: &str) -> Result<Self, ParseError> {
        Host::<Cow<str>>::parse_opaque_cow(input.into()).map(|i| i.into_owned())
    }
}

impl<'a> Host<Cow<'a, str>> {
    pub(crate) fn parse_cow(input: Cow<'a, str>) -> Result<Self, ParseError> {
        if input.starts_with('[') {
            if !input.ends_with(']') {
                return Err(ParseError::InvalidIpv6Address);
            }
            return parse_ipv6addr(&input[1..input.len() - 1]).map(Host::Ipv6);
        }
        let domain: Cow<'_, [u8]> = percent_decode(input.as_bytes()).into();
        let domain: Cow<'a, [u8]> = match domain {
            Cow::Owned(v) => Cow::Owned(v),
            // if borrowed then we can use the original cow
            Cow::Borrowed(_) => match input {
                Cow::Borrowed(input) => Cow::Borrowed(input.as_bytes()),
                Cow::Owned(input) => Cow::Owned(input.into_bytes()),
            },
        };

        let domain = idna::domain_to_ascii_from_cow(domain, idna::AsciiDenyList::URL)?;

        if domain.is_empty() {
            return Err(ParseError::EmptyHost);
        }

        if ends_in_a_number(&domain) {
            let address = parse_ipv4addr(&domain)?;
            Ok(Host::Ipv4(address))
        } else {
            Ok(Host::Domain(domain))
        }
    }

    pub(crate) fn parse_opaque_cow(input: Cow<'a, str>) -> Result<Self, ParseError> {
        if input.starts_with('[') {
            if !input.ends_with(']') {
                return Err(ParseError::InvalidIpv6Address);
            }
            return parse_ipv6addr(&input[1..input.len() - 1]).map(Host::Ipv6);
        }

        let is_invalid_host_char = |c| {
            matches!(
                c,
                '\0' | '\t'
                    | '\n'
                    | '\r'
                    | ' '
                    | '#'
                    | '/'
                    | ':'
                    | '<'
                    | '>'
                    | '?
```