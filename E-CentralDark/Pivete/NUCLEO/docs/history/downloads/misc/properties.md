# OUTRO - properties.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\ajv@8.20.0@@@1\lib\vocabularies\jtd\properties.ts
**SHA:** 9300716812880452
**Timestamp:** 2026-08-28T02:24:02.378028
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- Missing = "missing",

### Ouro Bruto (primeiros 5000 chars)
```
import type {
  CodeKeywordDefinition,
  ErrorObject,
  KeywordErrorDefinition,
  SchemaObject,
} from "../../types"
import type {KeywordCxt} from "../../compile/validate"
import {propertyInData, allSchemaProperties, isOwnProperty} from "../code"
import {alwaysValidSchema, schemaRefOrVal} from "../../compile/util"
import {_, and, not, Code, Name} from "../../compile/codegen"
import {checkMetadata} from "./metadata"
import {checkNullableObject} from "./nullable"
import {typeErrorMessage, typeErrorParams, _JTDTypeError} from "./error"

enum PropError {
  Additional = "additional",
  Missing = "missing",
}

type PropKeyword = "properties" | "optionalProperties"

type PropSchema = {[P in string]?: SchemaObject}

export type JTDPropertiesError =
  | _JTDTypeError<PropKeyword, "object", PropSchema>
  | ErrorObject<PropKeyword, {error: PropError.Additional; additionalProperty: string}, PropSchema>
  | ErrorObject<PropKeyword, {error: PropError.Missing; missingProperty: string}, PropSchema>

export const error: KeywordErrorDefinition = {
  message: (cxt) => {
    const {params} = cxt
    return params.propError
      ? params.propError === PropError.Additional
        ? "must NOT have additional properties"
        : `must have property '${params.missingProperty}'`
      : typeErrorMessage(cxt, "object")
  },
  params: (cxt) => {
    const {params} = cxt
    return params.propError
      ? params.propError === PropError.Additional
        ? _`{error: ${params.propError}, additionalProperty: ${params.additionalProperty}}`
        : _`{error: ${params.propError}, missingProperty: ${params.missingProperty}}`
      : typeErrorParams(cxt, "object")
  },
}

const def: CodeKeywordDefinition = {
  keyword: "properties",
  schemaType: "object",
  error,
  code: validateProperties,
}

// const error: KeywordErrorDefinition = {
//   message: "should NOT have additional properties",
//   params: ({params}) => _`{additionalProperty: ${params.additionalProperty}}`,
// }

export function validateProperties(cxt: KeywordCxt): void {
  checkMetadata(cxt)
  const {gen, data, parentSchema, it} = cxt
  const {additionalProperties, nullable} = parentSchema
  if (it.jtdDiscriminator && nullable) throw new Error("JTD: nullable inside discriminator mapping")
  if (commonProperties()) {
    throw new Error("JTD: properties and optionalProperties have common members")
  }
  const [allProps, properties] = schemaProperties("properties")
  const [allOptProps, optProperties] = schemaProperties("optionalProperties")
  if (properties.length === 0 && optProperties.length === 0 && additionalProperties) {
    return
  }

  const [valid, cond] =
    it.jtdDiscriminator === undefined
      ? checkNullableObject(cxt, data)
      : [gen.let("valid", false), true]
  gen.if(cond, () =>
    gen.assign(valid, true).block(() => {
      validateProps(properties, "properties", true)
      validateProps(optProperties, "optionalProperties")
      if (!additionalProperties) validateAdditional()
    })
  )
  cxt.pass(valid)

  function commonProperties(): boolean {
    const props = parentSchema.properties as Record<string, any> | undefined
    const optProps = parentSchema.optionalProperties as Record<string, any> | undefined
    if (!(props && optProps)) return false
    for (const p in props) {
      if (Object.prototype.hasOwnProperty.call(optProps, p)) return true
    }
    return false
  }

  function schemaProperties(keyword: string): [string[], string[]] {
    const schema = parentSchema[keyword]
    const allPs = schema ? allSchemaProperties(schema) : []
    if (it.jtdDiscriminator && allPs.some((p) => p === it.jtdDiscriminator)) {
      throw new Error(`JTD: discriminator tag used in ${keyword}`)
    }
    const ps = allPs.filter((p) => !alwaysValidSchema(it, schema[p]))
    return [allPs, ps]
  }

  function validateProps(props: string[], keyword: string, required?: boolean): void {
    const _valid = gen.var("valid")
    for (const prop of props) {
      gen.if(
        propertyInData(gen, data, prop, it.opts.ownProperties),
        () => applyPropertySchema(prop, keyword, _valid),
        () => missingProperty(prop)
      )
      cxt.ok(_valid)
    }

    function missingProperty(prop: string): void {
      if (required) {
        gen.assign(_valid, false)
        cxt.error(false, {propError: PropError.Missing, missingProperty: prop}, {schemaPath: prop})
      } else {
        gen.assign(_valid, true)
      }
    }
  }

  function applyPropertySchema(prop: string, keyword: string, _valid: Name): void {
    cxt.subschema(
      {
        keyword,
        schemaProp: prop,
        dataProp: prop,
      },
      _valid
    )
  }

  function validateAdditional(): void {
    gen.forIn("key", data, (key: Name) => {
      const addProp = isAdditional(key, allProps, "properties", it.jtdDiscriminator)
      const addOptProp = isAdditional(key, allOptProps, "optionalProperties")
      const extra =
        addProp === true ? addOptProp : addOptProp === true ? ad
```

---

# OUTRO - properties.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_normalizer-2.2.0\src\properties.rs
**SHA:** 1799f430e5f837f2
**Timestamp:** 2026-08-28T02:34:22.087078
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Invariant: lvt ≤ HANGUL_S_COUNT = 1172
- // Invariant: t ≤ (1172 / HANGUL_T_COUNT = 1172 / 28 = 41)
- // Invariant: v ≤ (1172 / HANGUL_N_COUNT = 1172 / 588 ≈ 2)
- // Invariant: v < (HANGUL_N_COUNT / HANGUL_T_COUNT = 588 / 28 = 21)
- // Invariant: lvt < 1172

### Principios
- // Invariant: lvt ≤ HANGUL_S_COUNT = 1172
- // Invariant: t ≤ (1172 / HANGUL_T_COUNT = 1172 / 28 = 41)
- // Invariant: v ≤ (1172 / HANGUL_N_COUNT = 1172 / 588 ≈ 2)
- // Invariant: v < (HANGUL_N_COUNT / HANGUL_T_COUNT = 588 / 28 = 21)
- // Invariant: lvt < 1172

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

//! Access to the Unicode properties or property-based operations that
//! are required for NFC and NFD.
//!
//! Applications should generally use the full normalizers that are
//! provided at the top level of this crate. However, the APIs in this
//! module are provided for callers such as HarfBuzz that specifically
//! want access to the raw canonical composition operation e.g. for use in a
//! glyph-availability-guided custom normalizer.

use crate::char_from_u16;
use crate::char_from_u32;
use crate::in_inclusive_range;
use crate::provider::CanonicalCompositions;
use crate::provider::DecompositionData;
use crate::provider::DecompositionTables;
use crate::provider::NonRecursiveDecompositionSupplement;
use crate::provider::NormalizerNfcV1;
use crate::provider::NormalizerNfdDataV1;
use crate::provider::NormalizerNfdSupplementV1;
use crate::provider::NormalizerNfdTablesV1;
use crate::trie_value_has_ccc;
use crate::CanonicalCombiningClass;
use crate::BACKWARD_COMBINING_MARKER;
use crate::FDFA_MARKER;
use crate::HANGUL_L_BASE;
use crate::HANGUL_N_COUNT;
use crate::HANGUL_S_BASE;
use crate::HANGUL_S_COUNT;
use crate::HANGUL_T_BASE;
use crate::HANGUL_T_COUNT;
use crate::HANGUL_V_BASE;
use crate::HIGH_ZEROS_MASK;
use crate::LOW_ZEROS_MASK;
use crate::NON_ROUND_TRIP_MARKER;
use icu_provider::prelude::*;

/// Borrowed version of the raw canonical composition operation.
///
/// Callers should generally use `ComposingNormalizer` instead of this API.
/// However, this API is provided for callers such as HarfBuzz that specifically
/// want access to the raw canonical composition operation e.g. for use in a
/// glyph-availability-guided custom normalizer.
#[derive(Debug, Copy, Clone)]
pub struct CanonicalCompositionBorrowed<'a> {
    canonical_compositions: &'a CanonicalCompositions<'a>,
}

#[cfg(feature = "compiled_data")]
impl Default for CanonicalCompositionBorrowed<'static> {
    fn default() -> Self {
        Self::new()
    }
}

impl CanonicalCompositionBorrowed<'static> {
    /// Cheaply converts a [`CanonicalCompositionBorrowed<'static>`] into a [`CanonicalComposition`].
    ///
    /// Note: Due to branching and indirection, using [`CanonicalComposition`] might inhibit some
    /// compile-time optimizations that are possible with [`CanonicalCompositionBorrowed`].
    pub const fn static_to_owned(self) -> CanonicalComposition {
        CanonicalComposition {
            canonical_compositions: DataPayload::from_static_ref(self.canonical_compositions),
        }
    }

    /// Constructs a new `CanonicalComposition` using compiled data.
    ///
    /// ✨ *Enabled with the `compiled_data` Cargo feature.*
    ///
    /// [📚 Help choosing a constructor](icu_provider::constructors)
    #[cfg(feature = "compiled_data")]
    pub const fn new() -> Self {
        Self {
            canonical_compositions: crate::provider::Baked::SINGLETON_NORMALIZER_NFC_V1,
        }
    }
}

impl CanonicalCompositionBorrowed<'_> {
    /// Performs canonical composition (including Hangul) on a pair of
    /// characters or returns `None` if these characters don't compose.
    /// Composition exclusions are taken into account.
    ///
    /// # Examples
    ///
    /// ```
    /// let comp = icu::normalizer::properties::CanonicalCompositionBorrowed::new();
    ///
    /// assert_eq!(comp.compose('a', 'b'), None); // Just two non-composing starters
    /// assert_eq!(comp.compose('a', '\u{0308}'), Some('ä'));
    /// assert_eq!(comp.compose('ẹ', '\u{0302}'), Some('ệ'));
    /// assert_eq!(comp.compose('𝅗', '𝅥'), None); // Composition exclusion
    /// assert_eq!(comp.compose('ে', 'া'), Some('ো')); // Second is starter
    /// assert_eq!(comp.compose('ᄀ', 'ᅡ'), Some('가')); // Hangul LV
    /// assert_eq!(comp.compose('가', 'ᆨ'), Some('각')); // Hangul LVT
    /// ```
    #[inline(always)]
    pub fn compose(self, starter: char, second: char) -> Option<char> {
        crate::compose(
            self.canonical_compositions.canonical_compositions.iter(),
            starter,
            second,
        )
    }
}

/// The raw canonical composition operation.
///
/// Callers should generally use `ComposingNormalizer` instead of this API.
/// However, this API is provided for callers such as HarfBuzz that specifically
/// want access to the raw canonical composition operation e.g. for use in a
/// glyph-availability-guided custom normalizer.
#[derive(Debug)]
pub struct CanonicalComposition {
    canonical_compositions: DataPayload<NormalizerNfcV1>,
}

#[cfg(feature = "compiled_data")]
impl Default for CanonicalComposition {
    fn default() -> Self {
        Self::new().static_to_owned()
    }
}

impl CanonicalComposition {
    /// Constructs a borrowed version of this type for more efficient querying.
    pub fn as_borrowed(&self) -> CanonicalCom
```