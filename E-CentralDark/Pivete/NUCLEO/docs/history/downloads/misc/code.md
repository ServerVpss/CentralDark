# OUTRO - code.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\ajv\lib\vocabularies\code.ts
**SHA:** f4bf46f24e44512a
**Timestamp:** 2026-08-26T19:32:07.666346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export function usePattern({gen, it: {opts}}: KeywordCxt, pattern: string): Name {

### Gaps
- missing: Name
- export function reportMissingProp(cxt: KeywordCxt, missing: Name): void {

### Ouro Bruto (primeiros 5000 chars)
```
import type {AnySchema, SchemaMap} from "../types"
import type {SchemaCxt} from "../compile"
import type {KeywordCxt} from "../compile/validate"
import {CodeGen, _, and, or, not, nil, strConcat, getProperty, Code, Name} from "../compile/codegen"
import {alwaysValidSchema, Type} from "../compile/util"
import N from "../compile/names"
import {useFunc} from "../compile/util"
export function checkReportMissingProp(cxt: KeywordCxt, prop: string): void {
  const {gen, data, it} = cxt
  gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
    cxt.setParams({missingProperty: _`${prop}`}, true)
    cxt.error()
  })
}

export function checkMissingProp(
  {gen, data, it: {opts}}: KeywordCxt,
  properties: string[],
  missing: Name
): Code {
  return or(
    ...properties.map((prop) =>
      and(noPropertyInData(gen, data, prop, opts.ownProperties), _`${missing} = ${prop}`)
    )
  )
}

export function reportMissingProp(cxt: KeywordCxt, missing: Name): void {
  cxt.setParams({missingProperty: missing}, true)
  cxt.error()
}

export function hasPropFunc(gen: CodeGen): Name {
  return gen.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: _`Object.prototype.hasOwnProperty`,
  })
}

export function isOwnProperty(gen: CodeGen, data: Name, property: Name | string): Code {
  return _`${hasPropFunc(gen)}.call(${data}, ${property})`
}

export function propertyInData(
  gen: CodeGen,
  data: Name,
  property: Name | string,
  ownProperties?: boolean
): Code {
  const cond = _`${data}${getProperty(property)} !== undefined`
  return ownProperties ? _`${cond} && ${isOwnProperty(gen, data, property)}` : cond
}

export function noPropertyInData(
  gen: CodeGen,
  data: Name,
  property: Name | string,
  ownProperties?: boolean
): Code {
  const cond = _`${data}${getProperty(property)} === undefined`
  return ownProperties ? or(cond, not(isOwnProperty(gen, data, property))) : cond
}

export function allSchemaProperties(schemaMap?: SchemaMap): string[] {
  return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : []
}

export function schemaProperties(it: SchemaCxt, schemaMap: SchemaMap): string[] {
  return allSchemaProperties(schemaMap).filter(
    (p) => !alwaysValidSchema(it, schemaMap[p] as AnySchema)
  )
}

export function callValidateCode(
  {schemaCode, data, it: {gen, topSchemaRef, schemaPath, errorPath}, it}: KeywordCxt,
  func: Code,
  context: Code,
  passSchema?: boolean
): Code {
  const dataAndSchema = passSchema ? _`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data
  const valCxt: [Name, Code | number][] = [
    [N.instancePath, strConcat(N.instancePath, errorPath)],
    [N.parentData, it.parentData],
    [N.parentDataProperty, it.parentDataProperty],
    [N.rootData, N.rootData],
  ]
  if (it.opts.dynamicRef) valCxt.push([N.dynamicAnchors, N.dynamicAnchors])
  const args = _`${dataAndSchema}, ${gen.object(...valCxt)}`
  return context !== nil ? _`${func}.call(${context}, ${args})` : _`${func}(${args})`
}

const newRegExp = _`new RegExp`

export function usePattern({gen, it: {opts}}: KeywordCxt, pattern: string): Name {
  const u = opts.unicodeRegExp ? "u" : ""
  const {regExp} = opts.code
  const rx = regExp(pattern, u)

  return gen.scopeValue("pattern", {
    key: rx.toString(),
    ref: rx,
    code: _`${regExp.code === "new RegExp" ? newRegExp : useFunc(gen, regExp)}(${pattern}, ${u})`,
  })
}

export function validateArray(cxt: KeywordCxt): Name {
  const {gen, data, keyword, it} = cxt
  const valid = gen.name("valid")
  if (it.allErrors) {
    const validArr = gen.let("valid", true)
    validateItems(() => gen.assign(validArr, false))
    return validArr
  }
  gen.var(valid, true)
  validateItems(() => gen.break())
  return valid

  function validateItems(notValid: () => void): void {
    const len = gen.const("len", _`${data}.length`)
    gen.forRange("i", 0, len, (i) => {
      cxt.subschema(
        {
          keyword,
          dataProp: i,
          dataPropType: Type.Num,
        },
        valid
      )
      gen.if(not(valid), notValid)
    })
  }
}

export function validateUnion(cxt: KeywordCxt): void {
  const {gen, schema, keyword, it} = cxt
  /* istanbul ignore if */
  if (!Array.isArray(schema)) throw new Error("ajv implementation error")
  const alwaysValid = schema.some((sch: AnySchema) => alwaysValidSchema(it, sch))
  if (alwaysValid && !it.opts.unevaluated) return

  const valid = gen.let("valid", false)
  const schValid = gen.name("_valid")

  gen.block(() =>
    schema.forEach((_sch: AnySchema, i: number) => {
      const schCxt = cxt.subschema(
        {
          keyword,
          schemaProp: i,
          compositeRule: true,
        },
        schValid
      )
      gen.assign(valid, _`${valid} || ${schValid}`)
      const merged = cxt.mergeValidEvaluated(schCxt, schValid)
      // can short-circuit if `unevaluatedProperties/Items` not supported (opts.u
```

---

# OUTRO - code.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\ajv@8.20.0@@@1\dist\vocabularies\code.js
**SHA:** 9212ddf8bd0a4c3b
**Timestamp:** 2026-08-28T02:23:52.834775
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInDa
- exports.usePattern = usePattern;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
const codegen_1 = require("../compile/codegen");
const util_1 = require("../compile/util");
const names_1 = require("../compile/names");
const util_2 = require("../compile/util");
function checkReportMissingProp(cxt, prop) {
    const { gen, data, it } = cxt;
    gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._) `${prop}` }, true);
        cxt.error();
    });
}
exports.checkReportMissingProp = checkReportMissingProp;
function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
    return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._) `${missing} = ${prop}`)));
}
exports.checkMissingProp = checkMissingProp;
function reportMissingProp(cxt, missing) {
    cxt.setParams({ missingProperty: missing }, true);
    cxt.error();
}
exports.reportMissingProp = reportMissingProp;
function hasPropFunc(gen) {
    return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._) `Object.prototype.hasOwnProperty`,
    });
}
exports.hasPropFunc = hasPropFunc;
function isOwnProperty(gen, data, property) {
    return (0, codegen_1._) `${hasPropFunc(gen)}.call(${data}, ${property})`;
}
exports.isOwnProperty = isOwnProperty;
function propertyInData(gen, data, property, ownProperties) {
    const cond = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
    return ownProperties ? (0, codegen_1._) `${cond} && ${isOwnProperty(gen, data, property)}` : cond;
}
exports.propertyInData = propertyInData;
function noPropertyInData(gen, data, property, ownProperties) {
    const cond = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(property)} === undefined`;
    return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
}
exports.noPropertyInData = noPropertyInData;
function allSchemaProperties(schemaMap) {
    return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
}
exports.allSchemaProperties = allSchemaProperties;
function schemaProperties(it, schemaMap) {
    return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
}
exports.schemaProperties = schemaProperties;
function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
    const dataAndSchema = passSchema ? (0, codegen_1._) `${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
    const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData],
    ];
    if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
    const args = (0, codegen_1._) `${dataAndSchema}, ${gen.object(...valCxt)}`;
    return context !== codegen_1.nil ? (0, codegen_1._) `${func}.call(${context}, ${args})` : (0, codegen_1._) `${func}(${args})`;
}
exports.callValidateCode = callValidateCode;
const newRegExp = (0, codegen_1._) `new RegExp`;
function usePattern({ gen, it: { opts } }, pattern) {
    const u = opts.unicodeRegExp ? "u" : "";
    const { regExp } = opts.code;
    const rx = regExp(pattern, u);
    return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._) `${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`,
    });
}
exports.usePattern = usePattern;
function validateArray(cxt) {
    const { gen, data, keyword, it } = cxt;
    const valid = gen.name("valid");
    if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
    }
    gen.var(valid, true);
    validateItems(() => gen.break());
    return valid;
    function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._) `${data}.length`);
        gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
                keyword,
                dataProp: i,
                dataPropType: util_1.Type.Num,
            }, valid);
            gen.if((0, codegen_1.not)(valid), notValid);
        })
```