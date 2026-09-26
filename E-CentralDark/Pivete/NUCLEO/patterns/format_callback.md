# PADRAO - format_callback.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\ipc\format_callback.rs
**SHA:** e9de68956b9437f4
**Timestamp:** 2026-08-28T02:35:54.386766
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: this number should be benchmarked and checked for optimal range, I set 10 KiB arbitrarily

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use serde::Serialize;
use serde_json::value::RawValue;
use serialize_to_javascript::Serialized;

use super::CallbackFn;

/// The information about this is quite limited. On Chrome/Edge and Firefox, [the maximum string size is approximately 1 GB](https://stackoverflow.com/a/34958490).
///
/// [From MDN:](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#description)
///
/// ECMAScript 2016 (ed. 7) established a maximum length of 2^53 - 1 elements. Previously, no maximum length was specified.
///
/// In Firefox, strings have a maximum length of 2\*\*30 - 2 (~1GB). In versions prior to Firefox 65, the maximum length was 2\*\*28 - 1 (~256MB).
const MAX_JSON_STR_LEN: usize = usize::pow(2, 30) - 2;

/// Minimum size JSON needs to be in order to convert it to JSON.parse with [`format_json`].
// TODO: this number should be benchmarked and checked for optimal range, I set 10 KiB arbitrarily
// we don't want to lose the gained object parsing time to extra allocations preparing it
const MIN_JSON_PARSE_LEN: usize = 10_240;

/// Transforms & escapes a JSON value.
///
/// If it's an object or array, JSON.parse('{json}') is used, with the '{json}' string properly escaped.
/// The return value of this function can be safely used on [`eval`](crate::Window#method.eval) calls.
///
/// Single quotes chosen because double quotes are already used in JSON. With single quotes, we only
/// need to escape strings that include backslashes or single quotes. If we used double quotes, then
/// there would be no cases that a string doesn't need escaping.
///
/// The function takes a closure to handle the escaped string in order to avoid unnecessary allocations.
///
/// # Safety
///
/// The ability to safely escape JSON into a JSON.parse('{json}') relies entirely on 2 things.
///
/// 1. `serde_json`'s ability to correctly escape and format json into a string.
/// 2. JavaScript engines not accepting anything except another unescaped, literal single quote
///    character to end a string that was opened with it.
fn serialize_js_with<F: FnOnce(&str) -> String>(
  json_string: String,
  options: serialize_to_javascript::Options,
  cb: F,
) -> crate::Result<String> {
  // get a raw &str representation of a serialized json value.

  let raw = RawValue::from_string(json_string)?;

  // from here we know json.len() > 1 because an empty string is not a valid json value.
  let json = raw.get();
  let first = json.as_bytes()[0];

  #[cfg(debug_assertions)]
  if first == b'"' {
    assert!(
      json.len() < MAX_JSON_STR_LEN,
      "passing a string larger than the max JavaScript literal string size"
    )
  }

  let return_val = if json.len() > MIN_JSON_PARSE_LEN && (first == b'{' || first == b'[') {
    let serialized = Serialized::new(&raw, &options).into_string();
    // only use JSON.parse('{arg}') for arrays and objects less than the limit
    // smaller literals do not benefit from being parsed from json
    if serialized.len() < MAX_JSON_STR_LEN {
      cb(&serialized)
    } else {
      cb(json)
    }
  } else {
    cb(json)
  };

  Ok(return_val)
}

/// Formats a function name and a serializable argument to be evaluated as callback.
///
/// See [`format_raw`] for more information.
pub fn format<T: Serialize>(function_name: CallbackFn, arg: &T) -> crate::Result<String> {
  format_raw(function_name, serde_json::to_string(arg)?)
}

/// Formats a function name and a raw JSON string argument to be evaluated as callback.
///
/// This will serialize primitive JSON types (e.g. booleans, strings, numbers, etc.) as JavaScript literals,
/// but will serialize arrays and objects whose serialized JSON string is smaller than 1 GB and larger
/// than 10 KiB with `JSON.parse('...')`.
/// See [json-parse-benchmark](https://github.com/GoogleChromeLabs/json-parse-benchmark).
pub fn format_raw(function_name: CallbackFn, json_string: String) -> crate::Result<String> {
  let callback_id = function_name.0;
  serialize_js_with(json_string, Default::default(), |arg| {
    format_raw_js(callback_id, arg)
  })
}

/// Formats a function name and a JavaScript string argument to be evaluated as callback.
pub fn format_raw_js(callback_id: u32, js: impl AsRef<str>) -> String {
  fn format_inner(callback_id: u32, js: &str) -> String {
    format!("window.__TAURI_INTERNALS__.runCallback({callback_id}, {js})")
  }
  format_inner(callback_id, js.as_ref())
}

/// Formats a serializable Result type to its Promise response.
///
/// See [`format_result_raw`] for more information.
pub fn format_result<T: Serialize, E: Serialize>(
  result: Result<T, E>,
  success_callback: CallbackFn,
  error_callback: CallbackFn,
) -> crate::Result<String> {
  match result {
    Ok(res) => format(success_callback, &res),
    Err(err) => format(error_callback, &err),
  }
}

/// Formats a Result type of raw JSON s
```