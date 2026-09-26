# OUTRO - utils.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\src\utils.rs
**SHA:** c2fce7b58662efae
**Timestamp:** 2026-08-23T14:17:00.236684
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let capture_start = Instant::now();
- let capture_start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use crate::capture_screenshot_by_window::{
    capture_all_visible_windows, CapturedWindow, WindowFilters,
};
use crate::custom_ocr::CustomOcrConfig;
use crate::monitor::SafeMonitor;
use image::DynamicImage;
use image_compare::{Algorithm, Metric, Similarity};
use screenpipe_db::CustomOcrConfig as DBCustomOcrConfig;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::time::{Duration, Instant};
use tracing::{debug, warn};

#[derive(Clone, Debug, Default)]
pub enum OcrEngine {
    Unstructured,
    #[default]
    Tesseract,
    WindowsNative,
    AppleNative,
    Custom(CustomOcrConfig),
}

impl From<OcrEngine> for screenpipe_db::OcrEngine {
    fn from(val: OcrEngine) -> Self {
        match val {
            OcrEngine::Unstructured => screenpipe_db::OcrEngine::Unstructured,
            OcrEngine::Tesseract => screenpipe_db::OcrEngine::Tesseract,
            OcrEngine::WindowsNative => screenpipe_db::OcrEngine::WindowsNative,
            OcrEngine::AppleNative => screenpipe_db::OcrEngine::AppleNative,
            OcrEngine::Custom(config) => {
                screenpipe_db::OcrEngine::Custom(DBCustomOcrConfig::from(config))
            }
        }
    }
}

impl From<screenpipe_db::OcrEngine> for OcrEngine {
    fn from(engine: screenpipe_db::OcrEngine) -> Self {
        match engine {
            screenpipe_db::OcrEngine::Unstructured => OcrEngine::Unstructured,
            screenpipe_db::OcrEngine::Tesseract => OcrEngine::Tesseract,
            screenpipe_db::OcrEngine::WindowsNative => OcrEngine::WindowsNative,
            screenpipe_db::OcrEngine::AppleNative => OcrEngine::AppleNative,
            screenpipe_db::OcrEngine::Custom(config) => OcrEngine::Custom(config.into()),
        }
    }
}

impl OcrEngine {
    pub fn platform_default() -> Self {
        #[cfg(target_os = "macos")]
        {
            Self::AppleNative
        }
        #[cfg(target_os = "windows")]
        {
            Self::WindowsNative
        }
        #[cfg(target_os = "linux")]
        {
            Self::Tesseract
        }
    }
}

impl std::str::FromStr for OcrEngine {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "tesseract" => Ok(Self::Tesseract),
            "windows-native" => Ok(Self::WindowsNative),
            "unstructured" => Ok(Self::Unstructured),
            "apple-native" => Ok(Self::AppleNative),
            _ => Ok(Self::platform_default()),
        }
    }
}

#[cfg(test)]
#[allow(clippy::items_after_test_module)]
mod tests {
    use super::*;

    #[test]
    fn ocr_engine_from_str_tesseract() {
        assert!(matches!(
            "tesseract".parse::<OcrEngine>().unwrap(),
            OcrEngine::Tesseract
        ));
    }

    #[test]
    fn ocr_engine_from_str_windows_native() {
        assert!(matches!(
            "windows-native".parse::<OcrEngine>().unwrap(),
            OcrEngine::WindowsNative
        ));
    }

    #[test]
    fn ocr_engine_from_str_unstructured() {
        assert!(matches!(
            "unstructured".parse::<OcrEngine>().unwrap(),
            OcrEngine::Unstructured
        ));
    }

    #[test]
    fn ocr_engine_from_str_apple_native() {
        assert!(matches!(
            "apple-native".parse::<OcrEngine>().unwrap(),
            OcrEngine::AppleNative
        ));
    }

    #[test]
    fn ocr_engine_from_str_unknown_returns_platform_default() {
        let engine = "something-else".parse::<OcrEngine>().unwrap();
        // platform_default varies by OS, just ensure it doesn't error
        let default = OcrEngine::platform_default();
        assert_eq!(
            std::mem::discriminant(&engine),
            std::mem::discriminant(&default)
        );
    }
}

pub fn calculate_hash(image: &DynamicImage) -> u64 {
    let mut hasher = DefaultHasher::new();
    image.as_bytes().hash(&mut hasher);
    hasher.finish()
}

pub fn compare_images_histogram(
    image1: &DynamicImage,
    image2: &DynamicImage,
) -> anyhow::Result<f64> {
    let image_one = image1.to_luma8();
    let mut image_two = image2.to_luma8();
    // Resize to match if dimensions differ (e.g. monitor resolution change)
    if image_one.dimensions() != image_two.dimensions() {
        image_two = image::imageops::resize(
            &image_two,
            image_one.width(),
            image_one.height(),
            image::imageops::FilterType::Nearest,
        );
    }
    image_compare::gray_similarity_histogram(Metric::Hellinger, &image_one, &image_two)
        .map_err(|e| anyhow::anyhow!("Failed to compare images: {}", e))
}

pub fn compare_images_ssim(image1: &DynamicImage, image2: &DynamicImage) -> f64 {
    let image_one = image1.to_luma8();
    let mut image_two = image2.to_luma8();
    // Resize to match if dimensions differ (e.g. monitor resolution change)
    if image_one.dimensions() != image_two.dimensions() {
        image_two = image::imageops::resize(
            &image_two,
            image_one.width(),
            image_one.he
```

---

# OUTRO - utils.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\src\utils.rs
**SHA:** c2fce7b58662efae612559dbb0558ffa668cee4b8ca715bcba45933bf09a2aae
**Timestamp:** 2026-08-23T23:43:56.211683
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let capture_start = Instant::now();
- let capture_start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use crate::capture_screenshot_by_window::{
    capture_all_visible_windows, CapturedWindow, WindowFilters,
};
use crate::custom_ocr::CustomOcrConfig;
use crate::monitor::SafeMonitor;
use image::DynamicImage;
use image_compare::{Algorithm, Metric, Similarity};
use screenpipe_db::CustomOcrConfig as DBCustomOcrConfig;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::time::{Duration, Instant};
use tracing::{debug, warn};

#[derive(Clone, Debug, Default)]
pub enum OcrEngine {
    Unstructured,
    #[default]
    Tesseract,
    WindowsNative,
    AppleNative,
    Custom(CustomOcrConfig),
}

impl From<OcrEngine> for screenpipe_db::OcrEngine {
    fn from(val: OcrEngine) -> Self {
        match val {
            OcrEngine::Unstructured => screenpipe_db::OcrEngine::Unstructured,
            OcrEngine::Tesseract => screenpipe_db::OcrEngine::Tesseract,
            OcrEngine::WindowsNative => screenpipe_db::OcrEngine::WindowsNative,
            OcrEngine::AppleNative => screenpipe_db::OcrEngine::AppleNative,
            OcrEngine::Custom(config) => {
                screenpipe_db::OcrEngine::Custom(DBCustomOcrConfig::from(config))
            }
        }
    }
}

impl From<screenpipe_db::OcrEngine> for OcrEngine {
    fn from(engine: screenpipe_db::OcrEngine) -> Self {
        match engine {
            screenpipe_db::OcrEngine::Unstructured => OcrEngine::Unstructured,
            screenpipe_db::OcrEngine::Tesseract => OcrEngine::Tesseract,
            screenpipe_db::OcrEngine::WindowsNative => OcrEngine::WindowsNative,
            screenpipe_db::OcrEngine::AppleNative => OcrEngine::AppleNative,
            screenpipe_db::OcrEngine::Custom(config) => OcrEngine::Custom(config.into()),
        }
    }
}

impl OcrEngine {
    pub fn platform_default() -> Self {
        #[cfg(target_os = "macos")]
        {
            Self::AppleNative
        }
        #[cfg(target_os = "windows")]
        {
            Self::WindowsNative
        }
        #[cfg(target_os = "linux")]
        {
            Self::Tesseract
        }
    }
}

impl std::str::FromStr for OcrEngine {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "tesseract" => Ok(Self::Tesseract),
            "windows-native" => Ok(Self::WindowsNative),
            "unstructured" => Ok(Self::Unstructured),
            "apple-native" => Ok(Self::AppleNative),
            _ => Ok(Self::platform_default()),
        }
    }
}

#[cfg(test)]
#[allow(clippy::items_after_test_module)]
mod tests {
    use super::*;

    #[test]
    fn ocr_engine_from_str_tesseract() {
        assert!(matches!(
            "tesseract".parse::<OcrEngine>().unwrap(),
            OcrEngine::Tesseract
        ));
    }

    #[test]
    fn ocr_engine_from_str_windows_native() {
        assert!(matches!(
            "windows-native".parse::<OcrEngine>().unwrap(),
            OcrEngine::WindowsNative
        ));
    }

    #[test]
    fn ocr_engine_from_str_unstructured() {
        assert!(matches!(
            "unstructured".parse::<OcrEngine>().unwrap(),
            OcrEngine::Unstructured
        ));
    }

    #[test]
    fn ocr_engine_from_str_apple_native() {
        assert!(matches!(
            "apple-native".parse::<OcrEngine>().unwrap(),
            OcrEngine::AppleNative
        ));
    }

    #[test]
    fn ocr_engine_from_str_unknown_returns_platform_default() {
        let engine = "something-else".parse::<OcrEngine>().unwrap();
        // platform_default varies by OS, just ensure it doesn't error
        let default = OcrEngine::platform_default();
        assert_eq!(
            std::mem::discriminant(&engine),
            std::mem::discriminant(&default)
        );
    }
}

pub fn calculate_hash(image: &DynamicImage) -> u64 {
    let mut hasher = DefaultHasher::new();
    image.as_bytes().hash(&mut hasher);
    hasher.finish()
}

pub fn compare_images_histogram(
    image1: &DynamicImage,
    image2: &DynamicImage,
) -> anyhow::Result<f64> {
    let image_one = image1.to_luma8();
    let mut image_two = image2.to_luma8();
    // Resize to match if dimensions differ (e.g. monitor resolution change)
    if image_one.dimensions() != image_two.dimensions() {
        image_two = image::imageops::resize(
            &image_two,
            image_one.width(),
            image_one.height(),
            image::imageops::FilterType::Nearest,
        );
    }
    image_compare::gray_similarity_histogram(Metric::Hellinger, &image_one, &image_two)
        .map_err(|e| anyhow::anyhow!("Failed to compare images: {}", e))
}

pub fn compare_images_ssim(image1: &DynamicImage, image2: &DynamicImage) -> f64 {
    let image_one = image1.to_luma8();
    let mut image_two = image2.to_luma8();
    // Resize to match if dimensions differ (e.g. monitor resolution change)
    if image_one.dimensions() != image_two.dimensions() {
        image_two = image::imageops::resize(
            &image_two,
            image_one.width(),
            image_one.he
```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\core@2.10.0@@@1\build\esm\baggage\utils.js
**SHA:** c841aca4d873d718
**Timestamp:** 2026-08-28T02:21:04.415416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = 0;
- start = end + 1;

### Ouro Bruto (primeiros 5000 chars)
```
import { baggageEntryMetadataFromString } from '@opentelemetry/api';
import { BAGGAGE_ITEMS_SEPARATOR, BAGGAGE_PROPERTIES_SEPARATOR, BAGGAGE_KEY_PAIR_SEPARATOR, BAGGAGE_MAX_TOTAL_LENGTH, BAGGAGE_MAX_NAME_VALUE_PAIRS, BAGGAGE_MAX_PER_NAME_VALUE_PAIRS, } from './constants';
export function serializeKeyPairs(keyPairs) {
    return keyPairs.reduce((hValue, current) => {
        const value = `${hValue}${hValue !== '' ? BAGGAGE_ITEMS_SEPARATOR : ''}${current}`;
        return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
    }, '');
}
export function getKeyPairs(baggage) {
    return baggage.getAllEntries().map(([key, value]) => {
        let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
        // include opaque metadata if provided
        // NOTE: we intentionally don't URI-encode the metadata - that responsibility falls on the metadata implementation
        if (value.metadata !== undefined) {
            entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
        }
        return entry;
    });
}
export function parsePairKeyValue(entry) {
    if (!entry)
        return;
    const metadataSeparatorIndex = entry.indexOf(BAGGAGE_PROPERTIES_SEPARATOR);
    const keyPairPart = metadataSeparatorIndex === -1
        ? entry
        : entry.substring(0, metadataSeparatorIndex);
    const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
    if (separatorIndex <= 0)
        return;
    const rawKey = keyPairPart.substring(0, separatorIndex).trim();
    const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
    if (!rawKey || !rawValue)
        return;
    let key;
    let value;
    try {
        key = decodeURIComponent(rawKey);
        value = decodeURIComponent(rawValue);
    }
    catch {
        return;
    }
    let metadata;
    if (metadataSeparatorIndex !== -1 &&
        metadataSeparatorIndex < entry.length - 1) {
        const metadataString = entry.substring(metadataSeparatorIndex + 1);
        metadata = baggageEntryMetadataFromString(metadataString);
    }
    return { key, value, metadata };
}
/**
 * Parses a single baggage header string into the provided record, applying limits defined in this package.
 * Uses indexOf/substring in a while loop to avoid allocating a full array of split entries.
 * Returns the updated pair count so callers can track totals across multiple header values.
 */
export function parseBaggageHeaderString(value, baggage, count, totalSize) {
    let start = 0;
    while (start < value.length && count < BAGGAGE_MAX_NAME_VALUE_PAIRS) {
        const end = value.indexOf(BAGGAGE_ITEMS_SEPARATOR, start);
        const entryEnd = end === -1 ? value.length : end;
        const entryLength = entryEnd - start;
        if (entryLength <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS) {
            const keyPair = parsePairKeyValue(value.substring(start, entryEnd));
            if (keyPair) {
                // Comma separator is counted for every accepted entry after the first
                const entrySize = (count === 0 ? 0 : 1) + entryLength;
                if (totalSize + entrySize > BAGGAGE_MAX_TOTAL_LENGTH)
                    break;
                baggage[keyPair.key] = keyPair.metadata
                    ? { value: keyPair.value, metadata: keyPair.metadata }
                    : { value: keyPair.value };
                count++;
                totalSize += entrySize;
            }
        }
        if (end === -1)
            break;
        start = end + 1;
    }
    return [count, totalSize];
}
/**
 * Parse a string serialized in the baggage HTTP Format (without metadata):
 * https://github.com/w3c/baggage/blob/master/baggage/HTTP_HEADER_FORMAT.md
 */
export function parseKeyPairsIntoRecord(value) {
    const result = {};
    if (typeof value === 'string' && value.length > 0) {
        value.split(BAGGAGE_ITEMS_SEPARATOR).forEach(entry => {
            const keyPair = parsePairKeyValue(entry);
            if (keyPair !== undefined && keyPair.value.length > 0) {
                result[keyPair.key] = keyPair.value;
            }
        });
    }
    return result;
}
//# sourceMappingURL=utils.js.map
```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\core@2.10.0@@@1\build\src\baggage\utils.js
**SHA:** b478df619fbed01c
**Timestamp:** 2026-08-28T02:21:15.161281
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = 0;
- start = end + 1;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKeyPairsIntoRecord = exports.parseBaggageHeaderString = exports.parsePairKeyValue = exports.getKeyPairs = exports.serializeKeyPairs = void 0;
const api_1 = require("@opentelemetry/api");
const constants_1 = require("./constants");
function serializeKeyPairs(keyPairs) {
    return keyPairs.reduce((hValue, current) => {
        const value = `${hValue}${hValue !== '' ? constants_1.BAGGAGE_ITEMS_SEPARATOR : ''}${current}`;
        return value.length > constants_1.BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
    }, '');
}
exports.serializeKeyPairs = serializeKeyPairs;
function getKeyPairs(baggage) {
    return baggage.getAllEntries().map(([key, value]) => {
        let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
        // include opaque metadata if provided
        // NOTE: we intentionally don't URI-encode the metadata - that responsibility falls on the metadata implementation
        if (value.metadata !== undefined) {
            entry += constants_1.BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
        }
        return entry;
    });
}
exports.getKeyPairs = getKeyPairs;
function parsePairKeyValue(entry) {
    if (!entry)
        return;
    const metadataSeparatorIndex = entry.indexOf(constants_1.BAGGAGE_PROPERTIES_SEPARATOR);
    const keyPairPart = metadataSeparatorIndex === -1
        ? entry
        : entry.substring(0, metadataSeparatorIndex);
    const separatorIndex = keyPairPart.indexOf(constants_1.BAGGAGE_KEY_PAIR_SEPARATOR);
    if (separatorIndex <= 0)
        return;
    const rawKey = keyPairPart.substring(0, separatorIndex).trim();
    const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
    if (!rawKey || !rawValue)
        return;
    let key;
    let value;
    try {
        key = decodeURIComponent(rawKey);
        value = decodeURIComponent(rawValue);
    }
    catch {
        return;
    }
    let metadata;
    if (metadataSeparatorIndex !== -1 &&
        metadataSeparatorIndex < entry.length - 1) {
        const metadataString = entry.substring(metadataSeparatorIndex + 1);
        metadata = (0, api_1.baggageEntryMetadataFromString)(metadataString);
    }
    return { key, value, metadata };
}
exports.parsePairKeyValue = parsePairKeyValue;
/**
 * Parses a single baggage header string into the provided record, applying limits defined in this package.
 * Uses indexOf/substring in a while loop to avoid allocating a full array of split entries.
 * Returns the updated pair count so callers can track totals across multiple header values.
 */
function parseBaggageHeaderString(value, baggage, count, totalSize) {
    let start = 0;
    while (start < value.length && count < constants_1.BAGGAGE_MAX_NAME_VALUE_PAIRS) {
        const end = value.indexOf(constants_1.BAGGAGE_ITEMS_SEPARATOR, start);
        const entryEnd = end === -1 ? value.length : end;
        const entryLength = entryEnd - start;
        if (entryLength <= constants_1.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS) {
            const keyPair = parsePairKeyValue(value.substring(start, entryEnd));
            if (keyPair) {
                // Comma separator is counted for every accepted entry after the first
                const entrySize = (count === 0 ? 0 : 1) + entryLength;
                if (totalSize + entrySize > constants_1.BAGGAGE_MAX_TOTAL_LENGTH)
                    break;
                baggage[keyPair.key] = keyPair.metadata
                    ? { value: keyPair.value, metadata: keyPair.metadata }
                    : { value: keyPair.value };
                count++;
                totalSize += entrySize;
            }
        }
        if (end === -1)
            break;
        start = end + 1;
    }
    return [count, totalSize];
}
exports.parseBaggageHeaderString = parseBaggageHeaderString;
/**
 * Parse a string serialized in the baggage HTTP Format (without metadata):
 * https://github.com/w3c/baggage/blob/master/baggage/HTTP_HEADER_FORMAT.md
 */
function parseKeyPairsIntoRecord(value) {
    const result = {};
    if (typeof value === 'string' && value.length > 0) {
        value.split(constants_1.BAGGAGE_ITEMS_SEPARATOR).forEach(entry => {
            const keyPair = parsePairKeyValue(entry);
            if (keyPair !== undefined && keyPair.value.length > 0) {
                result[keyPair.key] = keyPair.value;
            }
        });
    }
    return result;
}
exports.parseKeyPairsIntoRecord = parseKeyPairsIntoRecord;
//# sourceMappingURL=utils.js.map
```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\cjs\integrations\express\utils.js
**SHA:** 5317b564a6f20df0
**Timestamp:** 2026-08-28T02:21:48.758273
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- exports.isRoutePattern = isRoutePattern;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const requestLayerStore = require('./request-layer-store.js');
const types = require('./types.js');
const string = require('../../utils/string.js');

const asErrorAndMessage = (error) => error instanceof Error ? [error, error.message] : [String(error), String(error)];
function isRoutePattern(route) {
  return route.includes(":") || route.includes("*");
}
const getLayerMetadata = (route, layer, layerPath) => {
  if (layer.name === "router") {
    const maybeRouterPath = getRouterPath("", layer);
    const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
    return {
      attributes: {
        [types.ATTR_EXPRESS_NAME]: extractedRouterPath,
        [types.ATTR_EXPRESS_TYPE]: types.ExpressLayerType_ROUTER
      },
      name: `router - ${extractedRouterPath}`
    };
  } else if (layer.name === "bound dispatch" || layer.name === "handle") {
    return {
      attributes: {
        [types.ATTR_EXPRESS_NAME]: (route || layerPath) ?? "request handler",
        [types.ATTR_EXPRESS_TYPE]: types.ExpressLayerType_REQUEST_HANDLER
      },
      name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
    };
  } else {
    return {
      attributes: {
        [types.ATTR_EXPRESS_NAME]: layer.name,
        [types.ATTR_EXPRESS_TYPE]: types.ExpressLayerType_MIDDLEWARE
      },
      name: `middleware - ${layer.name}`
    };
  }
};
const getRouterPath = (path, layer) => {
  const stackLayer = Array.isArray(layer.handle?.stack) ? layer.handle?.stack?.[0] : void 0;
  if (stackLayer?.route?.path) {
    return `${path}${stackLayer.route.path}`;
  }
  if (stackLayer && Array.isArray(stackLayer?.handle?.stack)) {
    return getRouterPath(path, stackLayer);
  }
  return path;
};
const isLayerIgnored = (name, type, config) => {
  if (Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type)) {
    return true;
  }
  if (!Array.isArray(config?.ignoreLayers)) {
    return false;
  }
  try {
    return string.stringMatchesSomePattern(name, config.ignoreLayers, true);
  } catch {
  }
  return false;
};
function getActualMatchedRoute(req, constructedRoute) {
  const layersStore = requestLayerStore.getStoredLayers(req);
  if (layersStore.length === 0) {
    return void 0;
  }
  if (layersStore.every((path) => path === "/")) {
    return req.originalUrl === "/" ? "/" : void 0;
  }
  if (constructedRoute === "*") {
    return constructedRoute;
  }
  if (constructedRoute.includes("/") && (constructedRoute.includes(",") || constructedRoute.includes("\\") || constructedRoute.includes("*") || constructedRoute.includes("["))) {
    return constructedRoute;
  }
  const normalizedRoute = constructedRoute.startsWith("/") ? constructedRoute : `/${constructedRoute}`;
  const isValidRoute = normalizedRoute.length > 0 && (req.originalUrl === normalizedRoute || req.originalUrl.startsWith(normalizedRoute) || isRoutePattern(normalizedRoute));
  return isValidRoute ? normalizedRoute : void 0;
}
function getConstructedRoute(req) {
  const layersStore = requestLayerStore.getStoredLayers(req);
  let constructedRoute = "";
  for (const path of layersStore) {
    if (path === "/" || path === "/*") {
      continue;
    }
    constructedRoute += !constructedRoute || constructedRoute.endsWith("/") ? path : `/${path}`;
  }
  return constructedRoute.replace(/\/{2,}/g, "/");
}
const getLayerPath = (args) => {
  const firstArg = args[0];
  if (Array.isArray(firstArg)) {
    return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
  }
  return extractLayerPathSegment(firstArg);
};
const extractLayerPathSegment = (arg) => typeof arg === "string" ? arg : arg instanceof RegExp || typeof arg === "number" ? String(arg) : void 0;
const isExpressWithRouterPrototype = (express) => isExpressRouterPrototype(express?.Router?.prototype);
const isExpressRouterPrototype = (routerProto) => (typeof routerProto === "object" || typeof routerProto === "function") && !!routerProto && "route" in routerProto && typeof routerProto.route === "function";
const isExpressWithoutRouterPrototype = (express) => isExpressRouterPrototype(express.Router) && !isExpressWithRouterPrototype(express);
function getStatusCodeFromResponse(error) {
  const statusCode = error.status || error.statusCode || error.status_code || error.output?.statusCode;
  return statusCode ? parseInt(statusCode, 10) : 500;
}
function defaultShouldHandleError(error) {
  const status = getStatusCodeFromResponse(error);
  return status >= 500;
}

exports.asErrorAndMessage = asErrorAndMessage;
exports.defaultShouldHandleError = defaultShouldHandleError;
exports.getActualMatchedRoute = getActualMatchedRoute;
exports.getConstructedRoute = getConstructedRoute;
exports.getLayerMetadata = getLayerMetadata;
exports.getLayerPath = getLayerPath;
exports.getRouterPath = getRouterPath;
exports.isExpressWithRouterPrototype = isExpressWithRouterPrototype;
exports.isExpressWith
```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\cjs\integrations\tracing\graphql\vendored\utils.js
**SHA:** e39a87c6c531abf3
**Timestamp:** 2026-08-28T02:22:54.475594
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = typeof inputStart === "number" ? inputStart : loc.start;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const _enum = require('./enum.js');
const AttributeNames = require('./enums/AttributeNames.js');
const symbols = require('./symbols.js');

const OPERATION_VALUES = Object.values(_enum.AllowedOperationTypes);
const isPromise = (value) => {
  return typeof value?.then === "function";
};
function addSpanSource(span, loc, start, end) {
  if (core.getClient()?.getDataCollectionOptions().graphQL.document === true) {
    const source = getSourceFromLocation(loc, start, end);
    span.setAttribute(AttributeNames.AttributeNames.SOURCE, source);
  }
}
function createFieldIfNotExists(contextValue, info, path) {
  let field = getField(contextValue, path);
  if (field) {
    return { field, spanAdded: false };
  }
  const parentSpan = getParentFieldSpan(contextValue, path);
  field = {
    span: createResolverSpan(contextValue, info, path, parentSpan)
  };
  addField(contextValue, path, field);
  return { field, spanAdded: true };
}
function createResolverSpan(contextValue, info, path, parentSpan) {
  const attributes = {
    [AttributeNames.AttributeNames.FIELD_NAME]: info.fieldName,
    [AttributeNames.AttributeNames.FIELD_PATH]: path.join("."),
    [AttributeNames.AttributeNames.FIELD_TYPE]: info.returnType.toString(),
    [AttributeNames.AttributeNames.PARENT_NAME]: info.parentType.name
  };
  const span = core.startInactiveSpan({
    name: `${_enum.SpanNames.RESOLVE} ${attributes[AttributeNames.AttributeNames.FIELD_PATH]}`,
    attributes,
    parentSpan
  });
  const document = contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].source;
  const fieldNode = info.fieldNodes.find((fieldNode2) => fieldNode2.kind === "Field");
  if (fieldNode) {
    addSpanSource(span, document.loc, fieldNode.loc?.start, fieldNode.loc?.end);
  }
  return span;
}
function endSpan(span, error) {
  if (error) {
    span.setStatus({ code: core.SPAN_STATUS_ERROR, message: error.message });
  }
  span.end();
}
function getOperation(document, operationName) {
  if (!document || !Array.isArray(document.definitions)) {
    return void 0;
  }
  if (operationName) {
    return document.definitions.filter((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1).find((definition) => operationName === definition?.name?.value);
  } else {
    return document.definitions.find((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1);
  }
}
function addField(contextValue, path, field) {
  return contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")] = field;
}
function getField(contextValue, path) {
  return contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")];
}
function getParentFieldSpan(contextValue, path) {
  for (let i = path.length - 1; i > 0; i--) {
    const field = getField(contextValue, path.slice(0, i));
    if (field) {
      return field.span;
    }
  }
  return getRootSpan(contextValue);
}
function getRootSpan(contextValue) {
  return contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].span;
}
function pathToArray(path) {
  const flattened = [];
  let curr = path;
  while (curr) {
    flattened.push(String(curr.key));
    curr = curr.prev;
  }
  return flattened.reverse();
}
function repeatBreak(i) {
  return repeatChar("\n", i);
}
function repeatSpace(i) {
  return repeatChar(" ", i);
}
function repeatChar(char, to) {
  let text = "";
  for (let i = 0; i < to; i++) {
    text += char;
  }
  return text;
}
const KindsToBeRemoved = [_enum.TokenKind.FLOAT, _enum.TokenKind.STRING, _enum.TokenKind.INT, _enum.TokenKind.BLOCK_STRING];
function getSourceFromLocation(loc, inputStart, inputEnd) {
  let source = "";
  if (loc?.startToken) {
    const start = typeof inputStart === "number" ? inputStart : loc.start;
    const end = typeof inputEnd === "number" ? inputEnd : loc.end;
    let next = loc.startToken.next;
    let previousLine = 1;
    while (next) {
      if (next.start < start) {
        next = next.next;
        previousLine = next?.line;
        continue;
      }
      if (next.end > end) {
        next = next.next;
        previousLine = next?.line;
        continue;
      }
      let value = next.value || next.kind;
      let space = "";
      if (KindsToBeRemoved.indexOf(next.kind) >= 0) {
        value = "*";
      }
      if (next.kind === _enum.TokenKind.STRING) {
        value = `"${value}"`;
      }
      if (next.kind === _enum.TokenKind.EOF) {
        value = "";
      }
      if (next.line > previousLine) {
        source += repeatBreak(next.line - previousLine);
        previousLine = next.line;
        space = repeatSpace(next.column - 1);
      } else {
        if (next.line === next.prev?.line) {
          space = repeatSpace(next.start - (next.prev?.end || 0));
        }
      }
      source += space + value;
      if (next) {
        next = next.next;
      }
    }
  }
  return source;
}
function wrapFields(type, getConfig) {
  if (!type || type[symbols.OTEL
```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\cjs\integrations\tracing\mysql2\vendored\utils.js
**SHA:** c23b36de0f77ecda
**Timestamp:** 2026-08-28T02:22:58.124936
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") {

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const attributes = require('@sentry/conventions/attributes');
const semconv = require('./semconv.js');

function getConnectionAttributes(config) {
  const { host, port, database, user } = getConfig(config);
  const attrs = {
    [semconv.ATTR_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
    // oxlint-disable-next-line typescript/no-deprecated
    [attributes.DB_NAME]: database,
    [attributes.DB_USER]: user,
    // oxlint-disable-next-line typescript/no-deprecated
    [attributes.NET_PEER_NAME]: host
  };
  const portNumber = parseInt(port, 10);
  if (!isNaN(portNumber)) {
    attrs[attributes.NET_PEER_PORT] = portNumber;
  }
  return attrs;
}
function getConfig(config) {
  const { host, port, database, user } = config?.connectionConfig || config || {};
  return { host, port, database, user };
}
function getJDBCString(host, port, database) {
  let jdbcString = `jdbc:mysql://${host || "localhost"}`;
  if (typeof port === "number") {
    jdbcString += `:${port}`;
  }
  if (typeof database === "string") {
    jdbcString += `/${database}`;
  }
  return jdbcString;
}
function getQueryText(query, format, values) {
  const [querySql, queryValues] = typeof query === "string" ? [query, values] : [query.sql, hasValues(query) ? values || query.values : values];
  try {
    if (format && queryValues) {
      return format(querySql, queryValues);
    } else {
      return querySql;
    }
  } catch {
    return "Could not determine the query due to an error in formatting";
  }
}
function hasValues(obj) {
  return "values" in obj;
}
function getSpanName(query) {
  const rawQuery = typeof query === "object" ? query.sql : query;
  const firstSpace = rawQuery?.indexOf(" ");
  if (typeof firstSpace === "number" && firstSpace !== -1) {
    return rawQuery?.substring(0, firstSpace);
  }
  return rawQuery;
}
const once = (fn) => {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    return fn(...args);
  };
};
function getConnectionPrototypeToInstrument(connection) {
  const connectionPrototype = connection.prototype;
  const basePrototype = Object.getPrototypeOf(connectionPrototype);
  if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") {
    return basePrototype;
  }
  return connectionPrototype;
}

exports.getConnectionAttributes = getConnectionAttributes;
exports.getConnectionPrototypeToInstrument = getConnectionPrototypeToInstrument;
exports.getQueryText = getQueryText;
exports.getSpanName = getSpanName;
exports.once = once;
//# sourceMappingURL=utils.js.map

```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\esm\integrations\tracing\graphql\vendored\utils.js
**SHA:** 05a5bb0f8b94a6ea
**Timestamp:** 2026-08-28T02:23:03.113221
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = typeof inputStart === "number" ? inputStart : loc.start;

### Ouro Bruto (primeiros 5000 chars)
```
import { SPAN_STATUS_ERROR, getClient, isObjectLike, withActiveSpan, startInactiveSpan } from '@sentry/core';
import { AllowedOperationTypes, TokenKind, SpanNames } from './enum.js';
import { AttributeNames } from './enums/AttributeNames.js';
import { OTEL_PATCHED_SYMBOL, OTEL_GRAPHQL_DATA_SYMBOL } from './symbols.js';

const OPERATION_VALUES = Object.values(AllowedOperationTypes);
const isPromise = (value) => {
  return typeof value?.then === "function";
};
function addSpanSource(span, loc, start, end) {
  if (getClient()?.getDataCollectionOptions().graphQL.document === true) {
    const source = getSourceFromLocation(loc, start, end);
    span.setAttribute(AttributeNames.SOURCE, source);
  }
}
function createFieldIfNotExists(contextValue, info, path) {
  let field = getField(contextValue, path);
  if (field) {
    return { field, spanAdded: false };
  }
  const parentSpan = getParentFieldSpan(contextValue, path);
  field = {
    span: createResolverSpan(contextValue, info, path, parentSpan)
  };
  addField(contextValue, path, field);
  return { field, spanAdded: true };
}
function createResolverSpan(contextValue, info, path, parentSpan) {
  const attributes = {
    [AttributeNames.FIELD_NAME]: info.fieldName,
    [AttributeNames.FIELD_PATH]: path.join("."),
    [AttributeNames.FIELD_TYPE]: info.returnType.toString(),
    [AttributeNames.PARENT_NAME]: info.parentType.name
  };
  const span = startInactiveSpan({
    name: `${SpanNames.RESOLVE} ${attributes[AttributeNames.FIELD_PATH]}`,
    attributes,
    parentSpan
  });
  const document = contextValue[OTEL_GRAPHQL_DATA_SYMBOL].source;
  const fieldNode = info.fieldNodes.find((fieldNode2) => fieldNode2.kind === "Field");
  if (fieldNode) {
    addSpanSource(span, document.loc, fieldNode.loc?.start, fieldNode.loc?.end);
  }
  return span;
}
function endSpan(span, error) {
  if (error) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
  }
  span.end();
}
function getOperation(document, operationName) {
  if (!document || !Array.isArray(document.definitions)) {
    return void 0;
  }
  if (operationName) {
    return document.definitions.filter((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1).find((definition) => operationName === definition?.name?.value);
  } else {
    return document.definitions.find((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1);
  }
}
function addField(contextValue, path, field) {
  return contextValue[OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")] = field;
}
function getField(contextValue, path) {
  return contextValue[OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")];
}
function getParentFieldSpan(contextValue, path) {
  for (let i = path.length - 1; i > 0; i--) {
    const field = getField(contextValue, path.slice(0, i));
    if (field) {
      return field.span;
    }
  }
  return getRootSpan(contextValue);
}
function getRootSpan(contextValue) {
  return contextValue[OTEL_GRAPHQL_DATA_SYMBOL].span;
}
function pathToArray(path) {
  const flattened = [];
  let curr = path;
  while (curr) {
    flattened.push(String(curr.key));
    curr = curr.prev;
  }
  return flattened.reverse();
}
function repeatBreak(i) {
  return repeatChar("\n", i);
}
function repeatSpace(i) {
  return repeatChar(" ", i);
}
function repeatChar(char, to) {
  let text = "";
  for (let i = 0; i < to; i++) {
    text += char;
  }
  return text;
}
const KindsToBeRemoved = [TokenKind.FLOAT, TokenKind.STRING, TokenKind.INT, TokenKind.BLOCK_STRING];
function getSourceFromLocation(loc, inputStart, inputEnd) {
  let source = "";
  if (loc?.startToken) {
    const start = typeof inputStart === "number" ? inputStart : loc.start;
    const end = typeof inputEnd === "number" ? inputEnd : loc.end;
    let next = loc.startToken.next;
    let previousLine = 1;
    while (next) {
      if (next.start < start) {
        next = next.next;
        previousLine = next?.line;
        continue;
      }
      if (next.end > end) {
        next = next.next;
        previousLine = next?.line;
        continue;
      }
      let value = next.value || next.kind;
      let space = "";
      if (KindsToBeRemoved.indexOf(next.kind) >= 0) {
        value = "*";
      }
      if (next.kind === TokenKind.STRING) {
        value = `"${value}"`;
      }
      if (next.kind === TokenKind.EOF) {
        value = "";
      }
      if (next.line > previousLine) {
        source += repeatBreak(next.line - previousLine);
        previousLine = next.line;
        space = repeatSpace(next.column - 1);
      } else {
        if (next.line === next.prev?.line) {
          space = repeatSpace(next.start - (next.prev?.end || 0));
        }
      }
      source += space + value;
      if (next) {
        next = next.next;
      }
    }
  }
  return source;
}
function wrapFields(type, getConfig) {
  if (!type || type[OTEL_PATCHED_SYMBOL]) {
    return;
  }
  const fields = type.getFields();
  type[OTEL_PATCHED_SYMBOL] = true;
  Object.keys(f
```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\esm\integrations\tracing\mysql2\vendored\utils.js
**SHA:** e9d7a46070f8ef1c
**Timestamp:** 2026-08-28T02:23:05.560291
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") {

### Ouro Bruto (primeiros 5000 chars)
```
import { NET_PEER_NAME, DB_USER, DB_NAME, NET_PEER_PORT } from '@sentry/conventions/attributes';
import { ATTR_DB_CONNECTION_STRING } from './semconv.js';

function getConnectionAttributes(config) {
  const { host, port, database, user } = getConfig(config);
  const attrs = {
    [ATTR_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
    // oxlint-disable-next-line typescript/no-deprecated
    [DB_NAME]: database,
    [DB_USER]: user,
    // oxlint-disable-next-line typescript/no-deprecated
    [NET_PEER_NAME]: host
  };
  const portNumber = parseInt(port, 10);
  if (!isNaN(portNumber)) {
    attrs[NET_PEER_PORT] = portNumber;
  }
  return attrs;
}
function getConfig(config) {
  const { host, port, database, user } = config?.connectionConfig || config || {};
  return { host, port, database, user };
}
function getJDBCString(host, port, database) {
  let jdbcString = `jdbc:mysql://${host || "localhost"}`;
  if (typeof port === "number") {
    jdbcString += `:${port}`;
  }
  if (typeof database === "string") {
    jdbcString += `/${database}`;
  }
  return jdbcString;
}
function getQueryText(query, format, values) {
  const [querySql, queryValues] = typeof query === "string" ? [query, values] : [query.sql, hasValues(query) ? values || query.values : values];
  try {
    if (format && queryValues) {
      return format(querySql, queryValues);
    } else {
      return querySql;
    }
  } catch {
    return "Could not determine the query due to an error in formatting";
  }
}
function hasValues(obj) {
  return "values" in obj;
}
function getSpanName(query) {
  const rawQuery = typeof query === "object" ? query.sql : query;
  const firstSpace = rawQuery?.indexOf(" ");
  if (typeof firstSpace === "number" && firstSpace !== -1) {
    return rawQuery?.substring(0, firstSpace);
  }
  return rawQuery;
}
const once = (fn) => {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    return fn(...args);
  };
};
function getConnectionPrototypeToInstrument(connection) {
  const connectionPrototype = connection.prototype;
  const basePrototype = Object.getPrototypeOf(connectionPrototype);
  if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") {
    return basePrototype;
  }
  return connectionPrototype;
}

export { getConnectionAttributes, getConnectionPrototypeToInstrument, getQueryText, getSpanName, once };
//# sourceMappingURL=utils.js.map

```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\graphql\utils.js
**SHA:** f0b6abf98a3b0e4b
**Timestamp:** 2026-08-28T02:23:24.267114
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ranges.push({ start: token.start, end: token.end, kind: token.kind });

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const attributes = require('@sentry/conventions/attributes');
const core = require('@sentry/core');

const ORIGINAL_DESCRIPTION_ATTRIBUTE = "original-description";
const REDACTED_LITERAL_KINDS = /* @__PURE__ */ new Set(["Int", "Float", "String", "BlockString"]);
function renameRootSpanWithOperation(span, operationType, operationName) {
  const rootSpan = core.getRootSpan(span);
  if (rootSpan === span) {
    return;
  }
  const rootSpanJson = core.spanToJSON(rootSpan);
  const newOperation = operationName ? `${operationType} ${operationName}` : operationType;
  const existingOperations = rootSpanJson.data[attributes.SENTRY_GRAPHQL_OPERATION];
  let operations;
  if (Array.isArray(existingOperations)) {
    operations = [...existingOperations, newOperation];
  } else if (typeof existingOperations === "string") {
    operations = [existingOperations, newOperation];
  } else {
    operations = newOperation;
  }
  rootSpan.setAttribute(attributes.SENTRY_GRAPHQL_OPERATION, operations);
  const originalDescription = rootSpanJson.data[ORIGINAL_DESCRIPTION_ATTRIBUTE] ?? rootSpanJson.description;
  if (!rootSpanJson.data[ORIGINAL_DESCRIPTION_ATTRIBUTE]) {
    rootSpan.setAttribute(ORIGINAL_DESCRIPTION_ATTRIBUTE, originalDescription);
  }
  rootSpan.updateName(`${originalDescription} (${getGraphqlOperationNamesFromAttribute(operations)})`);
}
function getGraphqlOperationNamesFromAttribute(attr) {
  if (Array.isArray(attr)) {
    const sorted = attr.slice().sort();
    if (sorted.length <= 5) {
      return sorted.join(", ");
    }
    return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
  }
  return attr;
}
function getOperationSpanName(operationType, operationName, fallbackName) {
  if (operationType && operationName) {
    return `${operationType} ${operationName}`;
  }
  if (operationType) {
    return operationType;
  }
  return fallbackName;
}
function hasResultErrors(result) {
  if (core.isObjectLike(result) && "errors" in result) {
    const errors = result.errors;
    return Array.isArray(errors) && errors.length > 0;
  }
  return false;
}
function redactGraphqlDocument(document) {
  const loc = document?.loc;
  const body = loc?.source?.body;
  if (typeof body !== "string" || !loc?.startToken) {
    return void 0;
  }
  try {
    const ranges = [];
    for (let token = loc.startToken; token; token = token.next) {
      if (REDACTED_LITERAL_KINDS.has(token.kind)) {
        ranges.push({ start: token.start, end: token.end, kind: token.kind });
      }
    }
    let out = body;
    for (let i = ranges.length - 1; i >= 0; i--) {
      const { start, end, kind } = ranges[i];
      const replacement = kind === "String" || kind === "BlockString" ? '"*"' : "*";
      out = out.slice(0, start) + replacement + out.slice(end);
    }
    return out;
  } catch {
    return void 0;
  }
}
function collectGraphqlDocument(document) {
  if (core.getClient()?.getDataCollectionOptions().graphQL.document !== true) {
    return void 0;
  }
  return redactGraphqlDocument(document);
}

exports.collectGraphqlDocument = collectGraphqlDocument;
exports.getOperationSpanName = getOperationSpanName;
exports.hasResultErrors = hasResultErrors;
exports.renameRootSpanWithOperation = renameRootSpanWithOperation;
//# sourceMappingURL=utils.js.map

```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\graphql\utils.js
**SHA:** d679f4c7f2658d82
**Timestamp:** 2026-08-28T02:23:30.771704
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ranges.push({ start: token.start, end: token.end, kind: token.kind });

### Ouro Bruto (primeiros 5000 chars)
```
import { SENTRY_GRAPHQL_OPERATION } from '@sentry/conventions/attributes';
import { getClient, isObjectLike, getRootSpan, spanToJSON } from '@sentry/core';

const ORIGINAL_DESCRIPTION_ATTRIBUTE = "original-description";
const REDACTED_LITERAL_KINDS = /* @__PURE__ */ new Set(["Int", "Float", "String", "BlockString"]);
function renameRootSpanWithOperation(span, operationType, operationName) {
  const rootSpan = getRootSpan(span);
  if (rootSpan === span) {
    return;
  }
  const rootSpanJson = spanToJSON(rootSpan);
  const newOperation = operationName ? `${operationType} ${operationName}` : operationType;
  const existingOperations = rootSpanJson.data[SENTRY_GRAPHQL_OPERATION];
  let operations;
  if (Array.isArray(existingOperations)) {
    operations = [...existingOperations, newOperation];
  } else if (typeof existingOperations === "string") {
    operations = [existingOperations, newOperation];
  } else {
    operations = newOperation;
  }
  rootSpan.setAttribute(SENTRY_GRAPHQL_OPERATION, operations);
  const originalDescription = rootSpanJson.data[ORIGINAL_DESCRIPTION_ATTRIBUTE] ?? rootSpanJson.description;
  if (!rootSpanJson.data[ORIGINAL_DESCRIPTION_ATTRIBUTE]) {
    rootSpan.setAttribute(ORIGINAL_DESCRIPTION_ATTRIBUTE, originalDescription);
  }
  rootSpan.updateName(`${originalDescription} (${getGraphqlOperationNamesFromAttribute(operations)})`);
}
function getGraphqlOperationNamesFromAttribute(attr) {
  if (Array.isArray(attr)) {
    const sorted = attr.slice().sort();
    if (sorted.length <= 5) {
      return sorted.join(", ");
    }
    return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
  }
  return attr;
}
function getOperationSpanName(operationType, operationName, fallbackName) {
  if (operationType && operationName) {
    return `${operationType} ${operationName}`;
  }
  if (operationType) {
    return operationType;
  }
  return fallbackName;
}
function hasResultErrors(result) {
  if (isObjectLike(result) && "errors" in result) {
    const errors = result.errors;
    return Array.isArray(errors) && errors.length > 0;
  }
  return false;
}
function redactGraphqlDocument(document) {
  const loc = document?.loc;
  const body = loc?.source?.body;
  if (typeof body !== "string" || !loc?.startToken) {
    return void 0;
  }
  try {
    const ranges = [];
    for (let token = loc.startToken; token; token = token.next) {
      if (REDACTED_LITERAL_KINDS.has(token.kind)) {
        ranges.push({ start: token.start, end: token.end, kind: token.kind });
      }
    }
    let out = body;
    for (let i = ranges.length - 1; i >= 0; i--) {
      const { start, end, kind } = ranges[i];
      const replacement = kind === "String" || kind === "BlockString" ? '"*"' : "*";
      out = out.slice(0, start) + replacement + out.slice(end);
    }
    return out;
  } catch {
    return void 0;
  }
}
function collectGraphqlDocument(document) {
  if (getClient()?.getDataCollectionOptions().graphQL.document !== true) {
    return void 0;
  }
  return redactGraphqlDocument(document);
}

export { collectGraphqlDocument, getOperationSpanName, hasResultErrors, renameRootSpanWithOperation };
//# sourceMappingURL=utils.js.map

```

---

# OUTRO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\fast-uri@3.1.6@@@1\lib\utils.js
**SHA:** a523a2da0a4cc335
**Timestamp:** 2026-08-28T02:24:15.430296
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let bestStart = -1
- let runStart = -1
- if (runStart === -1) runStart = i
- bestStart = runStart
- runStart = -1

### Ouro Bruto (primeiros 5000 chars)
```
'use strict'

/** @type {(value: string) => boolean} */
const isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu)

/** @type {(value: string) => boolean} */
const isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u)

/** @type {(value: string) => boolean} */
const isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu)

/** @type {(value: string) => boolean} */
const isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu)

/** @type {(value: string) => boolean} */
const isPathCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/u)

/** @type {(value: string) => boolean} */
const isQueryFragmentCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]$/u)

/** @type {(value: string) => boolean} */
const isUserinfoCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:]$/u)

const BYTE_HEX = new Array(256)
{
  const HEX_DIGITS = '0123456789ABCDEF'
  for (let i = 0; i < 256; i++) {
    BYTE_HEX[i] = '%' + HEX_DIGITS[i >> 4] + HEX_DIGITS[i & 0xF]
  }
}
function percentEncodeNonAscii (cp) {
  if (cp < 0x800) {
    return BYTE_HEX[0xC0 | (cp >> 6)] +
           BYTE_HEX[0x80 | (cp & 0x3F)]
  }
  if (cp < 0x10000) {
    return BYTE_HEX[0xE0 | (cp >> 12)] +
           BYTE_HEX[0x80 | ((cp >> 6) & 0x3F)] +
           BYTE_HEX[0x80 | (cp & 0x3F)]
  }
  return BYTE_HEX[0xF0 | (cp >> 18)] +
         BYTE_HEX[0x80 | ((cp >> 12) & 0x3F)] +
         BYTE_HEX[0x80 | ((cp >> 6) & 0x3F)] +
         BYTE_HEX[0x80 | (cp & 0x3F)]
}

/**
 * @param {Array<string>} input
 * @returns {string}
 */
function stringArrayToHexStripped (input) {
  let acc = ''
  let code = 0
  let i = 0

  for (i = 0; i < input.length; i++) {
    code = input[i].charCodeAt(0)
    if (code === 48) {
      continue
    }
    if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102))) {
      return ''
    }
    acc += input[i]
    break
  }

  for (i += 1; i < input.length; i++) {
    code = input[i].charCodeAt(0)
    if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102))) {
      return ''
    }
    acc += input[i]
  }
  return acc
}

/** @type {(value: string) => boolean} */
const isHextet = RegExp.prototype.test.bind(/^[\dA-Fa-f]{1,4}$/)

/** @type {(value: string) => boolean} */
const isIPvFuture = RegExp.prototype.test.bind(/^[vV][\dA-Fa-f]+\.[A-Za-z\d\-._~!$&'()*+,;=:]+$/)

/** @type {(value: string) => boolean} */
const isZoneCharacter = RegExp.prototype.test.bind(/^[A-Za-z\d\-._~]$/)

/**
 * @param {string} value
 * @returns {boolean}
 */
const nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u)

/**
 * @param {string} zone
 * @returns {boolean}
 */
function isZoneIdentifier (zone) {
  if (zone.length === 0) return false

  for (let i = 0; i < zone.length; i++) {
    if (isZoneCharacter(zone[i])) continue
    if (zone[i] === '%' && i + 2 < zone.length && isHexPair(zone.slice(i + 1, i + 3))) {
      i += 2
      continue
    }
    return false
  }

  return true
}

/**
 * Compresses the longest run of zero hextets to "::" per RFC 5952. A run of a
 * single zero hextet is left uncompressed. On ties the leftmost run wins.
 *
 * @param {string[]} hextets
 * @returns {string}
 */
function compressIPv6ZeroRun (hextets) {
  let bestStart = -1
  let bestLength = 0
  let runStart = -1
  let runLength = 0
  for (let i = 0; i < hextets.length; i++) {
    if (hextets[i] === '0') {
      if (runStart === -1) runStart = i
      runLength++
      if (runLength > bestLength) {
        bestLength = runLength
        bestStart = runStart
      }
    } else {
      runStart = -1
      runLength = 0
    }
  }

  if (bestLength < 2) return hextets.join(':')

  const head = hextets.slice(0, bestStart).join(':')
  const tail = hextets.slice(bestStart + bestLength).join(':')
  return head + '::' + tail
}

/**
 * Validates an IPv6 address against the alternatives in RFC 3986 section
 * 3.2.2 and returns the same address with leading hextet zeroes removed.
 * An embedded IPv4 address counts as two hextets and is only valid at the end.
 *
 * @param {string} input
 * @returns {string|undefined}
 */
function normalizeIPv6Address (input) {
  const compression = input.indexOf('::')
  if (compression !== -1 && input.indexOf('::', compression + 1) !== -1) return undefined

  const left = compression === -1 ? input.split(':') : input.slice(0, compression).split(':')
  const right = compression === -1 ? [] : input.slice(compression + 2).split(':')
  if (compression !== -1) {
    if (left.length === 1 && left[0] === '') left.length = 0
    if (right.length === 1 && right[0] === '') right.length = 0
  }

  const parts = left.concat(right)
  let hextetCount = 0
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part === '') return undefined

    if (part.indexOf('.') !== -1) {
      if (i
```

---

# OUTRO - utils.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\derive_more-impl-2.1.1\src\utils.rs
**SHA:** 4801ae8348907fa5
**Timestamp:** 2026-08-28T02:34:01.295783
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Remove this eventually, once all macros migrate to

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg_attr(
    not(all(feature = "add", feature = "mul")),
    allow(dead_code, unused_mut)
)]

use proc_macro2::TokenStream;
use quote::{format_ident, quote, ToTokens};
use syn::{
    parse_quote, punctuated::Punctuated, spanned::Spanned, Attribute, Data,
    DeriveInput, Error, Field, Fields, FieldsNamed, FieldsUnnamed, GenericParam,
    Generics, Ident, Index, Result, Token, Type, TypeGenerics, TypeParamBound, Variant,
    WhereClause,
};

#[cfg(any(
    feature = "add",
    feature = "add_assign",
    feature = "as_ref",
    feature = "debug",
    feature = "display",
    feature = "eq",
    feature = "from",
    feature = "from_str",
    feature = "into",
    feature = "mul",
    feature = "mul_assign",
    feature = "try_from",
    feature = "try_into",
))]
pub(crate) use self::either::Either;
#[cfg(any(feature = "from", feature = "into"))]
pub(crate) use self::fields_ext::FieldsExt;
#[cfg(any(
    feature = "add",
    feature = "add_assign",
    feature = "as_ref",
    feature = "eq",
    feature = "from_str",
    feature = "mul",
    feature = "mul_assign",
))]
pub(crate) use self::generics_search::GenericsSearch;
#[cfg(any(
    feature = "add",
    feature = "add_assign",
    feature = "as_ref",
    feature = "debug",
    feature = "display",
    feature = "eq",
    feature = "from",
    feature = "from_str",
    feature = "into",
    feature = "mul",
    feature = "mul_assign",
    feature = "try_from",
    feature = "try_into",
))]
pub(crate) use self::spanning::Spanning;

#[derive(Clone, Copy, Default)]
pub struct DeterministicState;

impl std::hash::BuildHasher for DeterministicState {
    type Hasher = std::collections::hash_map::DefaultHasher;

    fn build_hasher(&self) -> Self::Hasher {
        Self::Hasher::default()
    }
}

pub type HashMap<K, V> = std::collections::HashMap<K, V, DeterministicState>;
pub type HashSet<K> = std::collections::HashSet<K, DeterministicState>;

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
pub enum RefType {
    No,
    Ref,
    Mut,
}

impl RefType {
    pub fn lifetime(self) -> TokenStream {
        match self {
            RefType::No => quote! {},
            _ => quote! { '__deriveMoreLifetime },
        }
    }

    pub fn reference(self) -> TokenStream {
        match self {
            RefType::No => quote! {},
            RefType::Ref => quote! { & },
            RefType::Mut => quote! { &mut },
        }
    }

    pub fn mutability(self) -> TokenStream {
        match self {
            RefType::Mut => quote! { mut },
            _ => quote! {},
        }
    }

    pub fn pattern_ref(self) -> TokenStream {
        match self {
            RefType::Ref => quote! { ref },
            RefType::Mut => quote! { ref mut },
            RefType::No => quote! {},
        }
    }

    pub fn reference_with_lifetime(self) -> TokenStream {
        if !self.is_ref() {
            return quote! {};
        }
        let lifetime = self.lifetime();
        let mutability = self.mutability();
        quote! { &#lifetime #mutability }
    }

    pub fn is_ref(self) -> bool {
        !matches!(self, RefType::No)
    }

    pub fn from_attr_name(name: &str) -> Self {
        match name {
            "owned" => RefType::No,
            "ref" => RefType::Ref,
            "ref_mut" => RefType::Mut,
            _ => panic!("`{name}` is not a `RefType`"),
        }
    }
}

pub fn numbered_vars(count: usize, prefix: &str) -> Vec<Ident> {
    (0..count).map(|i| format_ident!("__{prefix}{i}")).collect()
}

pub fn field_idents<'a>(fields: &'a [&'a Field]) -> Vec<&'a Ident> {
    fields
        .iter()
        .map(|f| {
            f.ident
                .as_ref()
                .expect("Tried to get field names of a tuple struct")
        })
        .collect()
}

pub fn get_field_types_iter<'a>(
    fields: &'a [&'a Field],
) -> Box<dyn Iterator<Item = &'a Type> + 'a> {
    Box::new(fields.iter().map(|f| &f.ty))
}

pub fn get_field_types<'a>(fields: &'a [&'a Field]) -> Vec<&'a Type> {
    get_field_types_iter(fields).collect()
}

pub fn add_extra_type_param_bound_op_output<'a>(
    generics: &'a Generics,
    trait_ident: &'a Ident,
) -> Generics {
    let mut generics = generics.clone();
    for type_param in &mut generics.type_params_mut() {
        let type_ident = &type_param.ident;
        let bound: TypeParamBound = parse_quote! {
            derive_more::core::ops::#trait_ident<Output = #type_ident>
        };
        type_param.bounds.push(bound)
    }

    generics
}

pub fn add_extra_ty_param_bound<'a>(
    generics: &'a Generics,
    bound: &'a TokenStream,
) -> Generics {
    let mut generics = generics.clone();
    let bound: TypeParamBound = parse_quote! { #bound };
    for type_param in &mut generics.type_params_mut() {
        type_param.bounds.push(bound.clone())
    }

    generics
}

pub fn add_extra_generic_param(
    generics: &Generics,
    generic_param: TokenStream,
) -> Generics {
    let generic_param: GenericParam = parse_quote! { #generi
```