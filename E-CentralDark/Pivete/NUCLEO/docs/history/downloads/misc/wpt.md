# OUTRO - wpt.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\url-2.5.8\tests\wpt.rs
**SHA:** 2d083ab72ad8cc9b
**Timestamp:** 2026-08-28T02:36:33.347785
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- println!("tests were expected to fail but did not run:");

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2013-2014 The rust-url developers.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

//! Data-driven tests imported from web-platform-tests

use serde_json::Value;
use std::collections::HashMap;
use std::fmt::Write;
#[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
use std::sync::Mutex;
use url::Url;

// https://rustwasm.github.io/wasm-bindgen/wasm-bindgen-test/usage.html
#[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
use wasm_bindgen_test::{console_log, wasm_bindgen_test, wasm_bindgen_test_configure};
#[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
wasm_bindgen_test_configure!(run_in_browser);

// wpt has its own test driver, but we shoe-horn this into wasm_bindgen_test
// which will discard stdout and stderr. So, we make println! go to
// console.log(), so we see failures that do not result in panics.

#[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
static PRINT_BUF: Mutex<Option<String>> = Mutex::new(None);

#[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
macro_rules! print {
    ($($arg:tt)*) => {
        let v = format!($($arg)*);
        {
            let mut buf = PRINT_BUF.lock().unwrap();
            if let Some(buf) = buf.as_mut() {
                buf.push_str(&v);
            } else {
                *buf = Some(v);
            }
        }
    };
}

#[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
macro_rules! println {
    () => {
        let buf = PRINT_BUF.lock().unwrap().take();
        match buf {
            Some(buf) => console_log!("{buf}"),
            None => console_log!(""),
        }
    };
    ($($arg:tt)*) => {
        let buf = PRINT_BUF.lock().unwrap().take();
        match buf {
            Some(buf) => {
                let v = format!($($arg)*);
                console_log!("{buf}{v}");
            },
            None => console_log!($($arg)*),
        }
    }
}

#[derive(Debug, serde_derive::Deserialize)]
struct UrlTest {
    input: String,
    base: Option<String>,
    #[serde(flatten)]
    result: UrlTestResult,
}

#[derive(Debug, serde_derive::Deserialize)]
#[serde(untagged)]
#[allow(clippy::large_enum_variant)]
enum UrlTestResult {
    Ok(UrlTestOk),
    Fail(UrlTestFail),
}

#[derive(Debug, serde_derive::Deserialize)]
struct UrlTestOk {
    href: String,
    protocol: String,
    username: String,
    password: String,
    host: String,
    hostname: String,
    port: String,
    pathname: String,
    search: String,
    hash: String,
}

#[derive(Debug, serde_derive::Deserialize)]
struct UrlTestFail {
    failure: bool,
}

#[derive(Debug, serde_derive::Deserialize)]
struct SetterTest {
    href: String,
    new_value: String,
    expected: SetterTestExpected,
}

#[derive(Debug, serde_derive::Deserialize)]
struct SetterTestExpected {
    href: Option<String>,
    protocol: Option<String>,
    username: Option<String>,
    password: Option<String>,
    host: Option<String>,
    hostname: Option<String>,
    port: Option<String>,
    pathname: Option<String>,
    search: Option<String>,
    hash: Option<String>,
}

#[cfg_attr(all(target_arch = "wasm32", target_os = "unknown"), wasm_bindgen_test)]
fn main() {
    let mut filter = None;
    let mut args = std::env::args().skip(1);
    while filter.is_none() {
        if let Some(arg) = args.next() {
            if arg == "--test-threads" {
                args.next();
                continue;
            }
            filter = Some(arg);
        } else {
            break;
        }
    }

    let mut expected_failures = include_str!("expected_failures.txt")
        .lines()
        .collect::<Vec<_>>();

    let mut errors = vec![];

    // Copied from https://github.com/web-platform-tests/wpt/blob/master/url/
    let url_json: Vec<Value> = serde_json::from_str(include_str!("urltestdata.json"))
        .expect("JSON parse error in urltestdata.json");
    let url_tests = url_json
        .into_iter()
        .filter(|val| val.is_object())
        .map(|val| serde_json::from_value::<UrlTest>(val).expect("parsing failed"))
        .collect::<Vec<_>>();

    let setter_json: HashMap<String, Value> =
        serde_json::from_str(include_str!("setters_tests.json"))
            .expect("JSON parse error in setters_tests.json");
    let setter_tests = setter_json
        .into_iter()
        .filter(|(k, _)| k != "comment")
        .map(|(k, v)| {
            let test = serde_json::from_value::<Vec<SetterTest>>(v).expect("parsing failed");
            (k, test)
        })
        .collect::<HashMap<_, _>>();

    for url_test in url_tests {
        let mut name = format!("<{}>", url_test.input.escape_default());
        if let Some(base) = &url_test.base {
            write!(&mut name, " against <{}>", bas
```