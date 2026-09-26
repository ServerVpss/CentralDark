# OUTRO - request.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\cjs\utils\request.js
**SHA:** 24a9f05ff245ddc2
**Timestamp:** 2026-08-28T02:21:54.270616
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Can we extract body data from the request?

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const debugBuild = require('../debug-build.js');
const debugLogger = require('./debug-logger.js');
const defaultPiiToCollectionOptions = require('./data-collection/defaultPiiToCollectionOptions.js');
const filteringSnippets = require('./data-collection/filtering-snippets.js');
const filterKeyValueData = require('./data-collection/filterKeyValueData.js');
const timer = require('./timer.js');

const MAX_BODY_BYTE_LENGTH = 1024 * 1024;
const TEXT_CONTENT_TYPES = [
  "text/",
  "application/json",
  "application/x-www-form-urlencoded",
  "application/xml",
  "application/graphql"
];
function getMaxBodyByteLength(maxRequestBodySize) {
  if (maxRequestBodySize === "small") return 1e3;
  if (maxRequestBodySize === "medium") return 1e4;
  return MAX_BODY_BYTE_LENGTH;
}
function winterCGHeadersToDict(winterCGHeaders) {
  const headers = {};
  try {
    winterCGHeaders.forEach((value, key) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  } catch {
  }
  return headers;
}
function headersToDict(reqHeaders) {
  const headers = /* @__PURE__ */ Object.create(null);
  try {
    Object.entries(reqHeaders).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      } else if (typeof value === "number") {
        headers[key] = String(value);
      }
    });
  } catch {
  }
  return headers;
}
function winterCGRequestToRequestData(req) {
  const headers = winterCGHeadersToDict(req.headers);
  return {
    method: req.method,
    url: req.url,
    query_string: extractQueryParamsFromUrl(req.url),
    headers
    // TODO: Can we extract body data from the request?
  };
}
function isTextualContentType(contentType) {
  if (!contentType) {
    return false;
  }
  const lowerContentType = contentType.toLowerCase();
  return TEXT_CONTENT_TYPES.some((type) => lowerContentType.includes(type));
}
async function captureBodyFromWinterCGRequest(request, isolationScope, maxRequestBodySize) {
  try {
    const contentType = request.headers.get("content-type");
    if (!isTextualContentType(contentType)) {
      debugBuild.DEBUG_BUILD && debugLogger.debug.log("Skipping body capture for non-textual content type:", contentType);
      return;
    }
    if (!request.body) {
      return;
    }
    const contentLength = request.headers.get("content-length");
    const maxBodySize = getMaxBodyByteLength(maxRequestBodySize);
    if (contentLength) {
      const length = parseInt(contentLength, 10);
      if (!isNaN(length) && length > MAX_BODY_BYTE_LENGTH) {
        debugBuild.DEBUG_BUILD && debugLogger.debug.log("Skipping body capture: body too large", length);
        return;
      }
    }
    const clonedRequest = request.clone();
    const bodyPromise = clonedRequest.text();
    const timeoutPromise = new Promise((resolve) => {
      timer.safeUnref(setTimeout(() => resolve(null), 2e3));
    });
    const body = await Promise.race([bodyPromise, timeoutPromise]);
    if (body === null) {
      debugBuild.DEBUG_BUILD && debugLogger.debug.log("Timeout reading request body");
      return;
    }
    if (!body) {
      return;
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(body);
    const bodyByteLength = bytes.length;
    let truncatedBody;
    if (bodyByteLength > maxBodySize) {
      const decoder = new TextDecoder();
      truncatedBody = `${decoder.decode(bytes.slice(0, maxBodySize - 3))}...`;
    } else {
      truncatedBody = body;
    }
    isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
    debugBuild.DEBUG_BUILD && debugLogger.debug.log("Captured request body:", bodyByteLength, "bytes");
  } catch (error) {
    debugBuild.DEBUG_BUILD && debugLogger.debug.error("Error capturing request body:", error);
  }
}
function httpRequestToRequestData(request) {
  const headers = request.headers || {};
  const forwardedHost = typeof headers["x-forwarded-host"] === "string" ? headers["x-forwarded-host"] : void 0;
  const host = forwardedHost || (typeof headers.host === "string" ? headers.host : void 0);
  const forwardedProto = typeof headers["x-forwarded-proto"] === "string" ? headers["x-forwarded-proto"] : void 0;
  const protocol = forwardedProto || request.protocol || (request.socket?.encrypted ? "https" : "http");
  const url = request.url || "";
  const absoluteUrl = getAbsoluteUrl({
    url,
    host,
    protocol
  });
  const data = request.body || void 0;
  const cookies = request.cookies;
  return {
    url: absoluteUrl,
    method: request.method,
    query_string: extractQueryParamsFromUrl(url),
    headers: headersToDict(headers),
    cookies,
    data
  };
}
function getAbsoluteUrl({
  url,
  protocol,
  host
}) {
  if (url?.startsWith("http")) {
    return url;
  }
  if (url && host) {
    return `${protocol}://${host}${url}`;
  }
  return void 0;
}
function httpHeadersToSpanAttributes(headers, dataCollect
```

---

# OUTRO - request.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\esm\utils\request.js
**SHA:** 67ea010a6d0ba07e
**Timestamp:** 2026-08-28T02:22:09.360673
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Can we extract body data from the request?

### Ouro Bruto (primeiros 5000 chars)
```
import { DEBUG_BUILD } from '../debug-build.js';
import { debug } from './debug-logger.js';
import { defaultPiiToCollectionOptions } from './data-collection/defaultPiiToCollectionOptions.js';
import { SENSITIVE_COOKIE_NAME_SNIPPETS, FILTERED_VALUE } from './data-collection/filtering-snippets.js';
import { filterKeyValueData } from './data-collection/filterKeyValueData.js';
import { safeUnref } from './timer.js';

const MAX_BODY_BYTE_LENGTH = 1024 * 1024;
const TEXT_CONTENT_TYPES = [
  "text/",
  "application/json",
  "application/x-www-form-urlencoded",
  "application/xml",
  "application/graphql"
];
function getMaxBodyByteLength(maxRequestBodySize) {
  if (maxRequestBodySize === "small") return 1e3;
  if (maxRequestBodySize === "medium") return 1e4;
  return MAX_BODY_BYTE_LENGTH;
}
function winterCGHeadersToDict(winterCGHeaders) {
  const headers = {};
  try {
    winterCGHeaders.forEach((value, key) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  } catch {
  }
  return headers;
}
function headersToDict(reqHeaders) {
  const headers = /* @__PURE__ */ Object.create(null);
  try {
    Object.entries(reqHeaders).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      } else if (typeof value === "number") {
        headers[key] = String(value);
      }
    });
  } catch {
  }
  return headers;
}
function winterCGRequestToRequestData(req) {
  const headers = winterCGHeadersToDict(req.headers);
  return {
    method: req.method,
    url: req.url,
    query_string: extractQueryParamsFromUrl(req.url),
    headers
    // TODO: Can we extract body data from the request?
  };
}
function isTextualContentType(contentType) {
  if (!contentType) {
    return false;
  }
  const lowerContentType = contentType.toLowerCase();
  return TEXT_CONTENT_TYPES.some((type) => lowerContentType.includes(type));
}
async function captureBodyFromWinterCGRequest(request, isolationScope, maxRequestBodySize) {
  try {
    const contentType = request.headers.get("content-type");
    if (!isTextualContentType(contentType)) {
      DEBUG_BUILD && debug.log("Skipping body capture for non-textual content type:", contentType);
      return;
    }
    if (!request.body) {
      return;
    }
    const contentLength = request.headers.get("content-length");
    const maxBodySize = getMaxBodyByteLength(maxRequestBodySize);
    if (contentLength) {
      const length = parseInt(contentLength, 10);
      if (!isNaN(length) && length > MAX_BODY_BYTE_LENGTH) {
        DEBUG_BUILD && debug.log("Skipping body capture: body too large", length);
        return;
      }
    }
    const clonedRequest = request.clone();
    const bodyPromise = clonedRequest.text();
    const timeoutPromise = new Promise((resolve) => {
      safeUnref(setTimeout(() => resolve(null), 2e3));
    });
    const body = await Promise.race([bodyPromise, timeoutPromise]);
    if (body === null) {
      DEBUG_BUILD && debug.log("Timeout reading request body");
      return;
    }
    if (!body) {
      return;
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(body);
    const bodyByteLength = bytes.length;
    let truncatedBody;
    if (bodyByteLength > maxBodySize) {
      const decoder = new TextDecoder();
      truncatedBody = `${decoder.decode(bytes.slice(0, maxBodySize - 3))}...`;
    } else {
      truncatedBody = body;
    }
    isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
    DEBUG_BUILD && debug.log("Captured request body:", bodyByteLength, "bytes");
  } catch (error) {
    DEBUG_BUILD && debug.error("Error capturing request body:", error);
  }
}
function httpRequestToRequestData(request) {
  const headers = request.headers || {};
  const forwardedHost = typeof headers["x-forwarded-host"] === "string" ? headers["x-forwarded-host"] : void 0;
  const host = forwardedHost || (typeof headers.host === "string" ? headers.host : void 0);
  const forwardedProto = typeof headers["x-forwarded-proto"] === "string" ? headers["x-forwarded-proto"] : void 0;
  const protocol = forwardedProto || request.protocol || (request.socket?.encrypted ? "https" : "http");
  const url = request.url || "";
  const absoluteUrl = getAbsoluteUrl({
    url,
    host,
    protocol
  });
  const data = request.body || void 0;
  const cookies = request.cookies;
  return {
    url: absoluteUrl,
    method: request.method,
    query_string: extractQueryParamsFromUrl(url),
    headers: headersToDict(headers),
    cookies,
    data
  };
}
function getAbsoluteUrl({
  url,
  protocol,
  host
}) {
  if (url?.startsWith("http")) {
    return url;
  }
  if (url && host) {
    return `${protocol}://${host}${url}`;
  }
  return void 0;
}
function httpHeadersToSpanAttributes(headers, dataCollection = false, lifecycle = "request") {
  const resolvedDataCollection = typeof dataCollection === "boolean" ? defaultPiiToCollectionOptions(dataCollection) : dataCollection;

```

---

# OUTRO - request.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_provider-2.2.0\src\request.rs
**SHA:** 9f8f444155dd118e
**Timestamp:** 2026-08-28T02:34:28.468198
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- /// Safety-usable invariant: validated bytes are ASCII only

### Principios
- /// Safety-usable invariant: validated bytes are ASCII only

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

#[cfg(feature = "alloc")]
use alloc::borrow::Cow;
#[cfg(feature = "alloc")]
use alloc::borrow::ToOwned;
#[cfg(feature = "alloc")]
use alloc::boxed::Box;
#[cfg(feature = "alloc")]
use alloc::string::String;
#[cfg(feature = "alloc")]
use core::cmp::Ordering;
use core::default::Default;
use core::fmt;
use core::fmt::Debug;
use core::hash::Hash;
use core::ops::Deref;
#[cfg(feature = "alloc")]
use zerovec::ule::VarULE;

pub use icu_locale_core::DataLocale;

/// The request type passed into all data provider implementations.
#[derive(Default, Debug, Clone, Copy, PartialEq, Eq)]
#[allow(clippy::exhaustive_structs)] // this type is stable
pub struct DataRequest<'a> {
    /// The data identifier for which to load data.
    ///
    /// If locale fallback is enabled, the resulting data may be from a different identifier
    /// than the one requested here.
    pub id: DataIdentifierBorrowed<'a>,
    /// Metadata that may affect the behavior of the data provider.
    pub metadata: DataRequestMetadata,
}

/// Metadata for data requests. This is currently empty, but it may be extended with options
/// for tuning locale fallback, buffer layout, and so forth.
#[derive(Default, Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
#[non_exhaustive]
pub struct DataRequestMetadata {
    /// Silent requests do not log errors. This can be used for exploratory querying, such as fallbacks.
    pub silent: bool,
    /// Whether to allow prefix matches for the data marker attributes.
    pub attributes_prefix_match: bool,
}

/// The borrowed version of a [`DataIdentifierCow`].
#[derive(Default, Debug, Clone, Copy, PartialEq, Eq)]
#[non_exhaustive]
pub struct DataIdentifierBorrowed<'a> {
    /// Marker-specific request attributes
    pub marker_attributes: &'a DataMarkerAttributes,
    /// The CLDR locale
    pub locale: &'a DataLocale,
}

impl fmt::Display for DataIdentifierBorrowed<'_> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        fmt::Display::fmt(self.locale, f)?;
        if !self.marker_attributes.is_empty() {
            write!(f, "/{}", self.marker_attributes.as_str())?;
        }
        Ok(())
    }
}

impl<'a> DataIdentifierBorrowed<'a> {
    /// Creates a [`DataIdentifierBorrowed`] for a borrowed [`DataLocale`].
    pub fn for_locale(locale: &'a DataLocale) -> Self {
        Self {
            locale,
            ..Default::default()
        }
    }

    /// Creates a [`DataIdentifierBorrowed`] for a borrowed [`DataMarkerAttributes`].
    pub fn for_marker_attributes(marker_attributes: &'a DataMarkerAttributes) -> Self {
        Self {
            marker_attributes,
            ..Default::default()
        }
    }

    /// Creates a [`DataIdentifierBorrowed`] for a borrowed [`DataMarkerAttributes`] and [`DataLocale`].
    pub fn for_marker_attributes_and_locale(
        marker_attributes: &'a DataMarkerAttributes,
        locale: &'a DataLocale,
    ) -> Self {
        Self {
            marker_attributes,
            locale,
        }
    }

    /// Converts this [`DataIdentifierBorrowed`] into a [`DataIdentifierCow<'static>`].
    ///
    /// ✨ *Enabled with the `alloc` Cargo feature.*
    #[cfg(feature = "alloc")]
    pub fn into_owned(self) -> DataIdentifierCow<'static> {
        DataIdentifierCow {
            marker_attributes: Cow::Owned(self.marker_attributes.to_owned()),
            locale: *self.locale,
        }
    }

    /// Borrows this [`DataIdentifierBorrowed`] as a [`DataIdentifierCow<'a>`].
    ///
    /// ✨ *Enabled with the `alloc` Cargo feature.*
    #[cfg(feature = "alloc")]
    pub fn as_cow(self) -> DataIdentifierCow<'a> {
        DataIdentifierCow {
            marker_attributes: Cow::Borrowed(self.marker_attributes),
            locale: *self.locale,
        }
    }
}

/// A data identifier identifies a particular version of data, such as "English".
///
/// It is a wrapper around a [`DataLocale`] and a [`DataMarkerAttributes`].
///
/// ✨ *Enabled with the `alloc` Cargo feature.*
#[derive(Debug, PartialEq, Eq, Hash, Clone)]
#[non_exhaustive]
#[cfg(feature = "alloc")]
pub struct DataIdentifierCow<'a> {
    /// Marker-specific request attributes
    pub marker_attributes: Cow<'a, DataMarkerAttributes>,
    /// The CLDR locale
    pub locale: DataLocale,
}

#[cfg(feature = "alloc")]
impl PartialOrd for DataIdentifierCow<'_> {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[cfg(feature = "alloc")]
impl Ord for DataIdentifierCow<'_> {
    fn cmp(&self, other: &Self) -> Ordering {
        self.marker_attributes
            .cmp(&other.marker_attributes)
            .then_with(|| self.locale.total_cmp(&other.locale))
    }
}

#[cfg(feature = "alloc")]
impl fmt::Display for DataIdentifierCow<'_> {
    fn fmt(&self, f: &mut fmt::Fo
```