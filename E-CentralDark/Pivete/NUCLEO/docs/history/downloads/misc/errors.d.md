# OUTRO - errors.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\meriyah@6.1.4@@@1\dist\types\errors.d.ts
**SHA:** c5f96783b58c1ed2
**Timestamp:** 2026-08-28T02:24:47.135961
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: number;
- constructor(start: Location, end: Location, type: Errors, ...params: string[]);

### Ouro Bruto (primeiros 5000 chars)
```
import { type _Node, type SourceLocation } from './estree';
import { type Location } from './common';
export declare const enum Errors {
    Unexpected = 0,
    StrictOctalEscape = 1,
    TemplateOctalLiteral = 2,
    TemplateEightAndNine = 3,
    InvalidPrivateIdentifier = 4,
    InvalidUnicodeEscapeSequence = 5,
    InvalidCodePoint = 6,
    InvalidHexEscapeSequence = 7,
    StrictDecimalWithLeadingZero = 8,
    StrictOctalLiteral = 9,
    ExpectedNumberInRadix = 10,
    MissingExponent = 11,
    InvalidBigInt = 12,
    IDStartAfterNumber = 13,
    InvalidEightAndNine = 14,
    StrictEightAndNine = 15,
    UnterminatedString = 16,
    UnterminatedTemplate = 17,
    UnterminatedComment = 18,
    InvalidDynamicUnicode = 19,
    IllegalCharacter = 20,
    MissingHexDigits = 21,
    InvalidImplicitOctal = 22,
    InvalidStringLT = 23,
    InvalidEscapeIdentifier = 24,
    ExpectedToken = 25,
    CantAssignTo = 26,
    InvalidLHSAsyncArrow = 27,
    SuperNoConstructor = 28,
    InvalidSuperProperty = 29,
    UnexpectedToken = 30,
    AwaitInParameter = 31,
    YieldInParameter = 32,
    InvalidExponentiationLHS = 33,
    UnterminatedRegExp = 34,
    UnexpectedTokenRegExpFlag = 35,
    DuplicateRegExpFlag = 36,
    AccessorWrongArgs = 37,
    BadSetterRestParameter = 38,
    DeclNoName = 39,
    StrictFunctionName = 40,
    RestMissingArg = 41,
    InvalidGeneratorGetter = 42,
    InvalidGeneratorSetter = 43,
    InvalidComputedPropName = 44,
    InvalidGetSetGenerator = 45,
    InvalidAsyncGetter = 46,
    InvalidGenMethodShorthand = 47,
    InvalidLineBreak = 48,
    InvalidArrowDestructLHS = 49,
    InvalidBindingDestruct = 50,
    InvalidAsyncArrow = 51,
    StaticPrototype = 52,
    InvalidConstructor = 53,
    DuplicateConstructor = 54,
    InvalidIncDecTarget = 55,
    InvalidIncDecNew = 56,
    InvalidAssignmentTarget = 57,
    InvalidRestTrailing = 58,
    DeclarationMissingInitializer = 59,
    ForInOfLoopInitializer = 60,
    ForInOfLoopMultiBindings = 61,
    InvalidShorthandPropInit = 62,
    DuplicateProto = 63,
    InvalidLetBoundName = 64,
    InvalidNewUnary = 65,
    IllegalUseStrict = 66,
    DisallowedLetInStrict = 67,
    IllegalContinue = 68,
    IllegalBreak = 69,
    InvalidLetBracket = 70,
    InvalidDestructuringTarget = 71,
    RestDefaultInitializer = 72,
    InvalidRestNotLast = 73,
    InvalidRestArg = 74,
    InvalidRestDefault = 75,
    StrictFunction = 76,
    SloppyFunction = 77,
    WebCompatFunction = 78,
    ClassForbiddenAsStatement = 79,
    CantAssignToInOfForLoop = 80,
    InvalidAssignmentInOfForLoop = 81,
    InvalidForAwait = 82,
    InvalidTemplateContinuation = 83,
    RestrictedLetProduction = 84,
    UnexpectedLetStrictReserved = 85,
    InvalidCatchParams = 86,
    InvalidCatchParamDefault = 87,
    NoCatchOrFinally = 88,
    MultipleDefaultsInSwitch = 89,
    NewlineAfterThrow = 90,
    StrictWith = 91,
    IllegalReturn = 92,
    InvalidForLHSBinding = 93,
    InvalidNewTarget = 94,
    InvalidEscapedKeyword = 95,
    MissingPrivateIdentifier = 96,
    DisallowedInContext = 97,
    AwaitOutsideAsync = 98,
    InvalidStrictLet = 99,
    InvalidLetConstBinding = 100,
    InvalidLetClassName = 101,
    KeywordNotId = 102,
    InvalidImportExportSloppy = 103,
    UnicodeOverflow = 104,
    InvalidExportImportSource = 105,
    InvalidKeywordAsAlias = 106,
    InvalidDefaultImport = 107,
    TrailingDecorators = 108,
    GeneratorConstructor = 109,
    AwaitIdentInModuleOrAsyncFunc = 110,
    YieldIdentInModule = 111,
    HtmlCommentInWebCompat = 112,
    StrictInvalidLetInExprPos = 113,
    NotAssignableLetArgs = 114,
    ForOfLet = 115,
    InvalidInvokedBlockBodyArrow = 116,
    InvalidAccessedBlockBodyArrow = 117,
    UnexpectedStrictReserved = 118,
    StrictEvalArguments = 119,
    InvalidDecoratorSemicolon = 120,
    StrictDelete = 121,
    InvalidPatternTail = 122,
    AsyncFunctionInSingleStatementContext = 123,
    InvalidTernaryYield = 124,
    InvalidArrowPostfix = 125,
    InvalidObjLitKeyStar = 126,
    DeletePrivateField = 127,
    InvalidStaticClassFieldConstructor = 128,
    InvalidClassFieldConstructor = 129,
    InvalidClassFieldArgEval = 130,
    InvalidGeneratorFunction = 131,
    AsyncRestrictedProd = 132,
    UnexpectedCharAfterObjLit = 133,
    InvalidObjLitKey = 134,
    InvalidKeyToken = 135,
    LabelRedeclaration = 136,
    InvalidNestedStatement = 137,
    UnknownLabel = 138,
    InvalidImportTail = 139,
    InvalidJSONImportBinding = 140,
    ImportNotOneArg = 141,
    InvalidImportNew = 142,
    InvalidSpreadInImport = 143,
    IncompleteArrow = 144,
    DuplicateBinding = 145,
    DuplicatePrivateIdentifier = 146,
    DuplicateExportBinding = 147,
    UndeclaredExportedBinding = 148,
    UnexpectedPrivateField = 149,
    DuplicateLetConstBinding = 150,
    CantAssignToValidRHS = 151,
    ContinuousNumericSeparator = 152,
    TrailingNumericSeparator = 153,
    InvalidJSXAttributeValue = 154,
    ExpectedJSXClosingTag = 155,
    Adjacen
```

---

# OUTRO - errors.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\error\errors.d.mts
**SHA:** 15f31848dd9456cd
**Timestamp:** 2026-08-28T02:25:12.034529
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: string | RegExp;

### Ouro Bruto (primeiros 5000 chars)
```
export type TValidationError = TAdditionalPropertiesError | TAnyOfError | TBooleanError | TConstError | TContainsError | TDependenciesError | TDependentRequiredError | TEnumError | TExclusiveMaximumError | TExclusiveMinimumError | TFormatError | TGuardError | TIfError | TMaximumError | TMaxItemsError | TMaxLengthError | TMaxPropertiesError | TMinimumError | TMinItemsError | TMinLengthError | TMinPropertiesError | TMultipleOfError | TNotError | TOneOfError | TPatternError | TPropertyNamesError | TRefineError | TRequiredError | TTypeError | TUnevaluatedItemsError | TUnevaluatedPropertiesError | TUniqueItemsError;
export declare function IsValidationError(value: unknown): value is TValidationError;
export type TLocalizedValidationError = TValidationError & {
    message: string;
};
export declare function IsLocalizedValidationError(value: unknown): value is TLocalizedValidationError;
export type TLocalizedValidationMessageCallback = (error: TValidationError) => string;
export interface TValidationErrorBase {
    keyword: string;
    schemaPath: string;
    instancePath: string;
    params: object;
}
export interface TAdditionalPropertiesError extends TValidationErrorBase {
    keyword: 'additionalProperties';
    params: {
        additionalProperties: string[];
    };
}
export interface TAnyOfError extends TValidationErrorBase {
    keyword: 'anyOf';
    params: {};
}
export interface TBooleanError extends TValidationErrorBase {
    keyword: 'boolean';
    params: {};
}
export interface TConstError extends TValidationErrorBase {
    keyword: 'const';
    params: {
        allowedValue: unknown;
    };
}
export interface TContainsError extends TValidationErrorBase {
    keyword: 'contains';
    params: {
        minContains: number;
        maxContains?: number;
    };
}
export interface TDependenciesError extends TValidationErrorBase {
    keyword: 'dependencies';
    params: {
        property: string;
        dependencies: string[];
    };
}
export interface TDependentRequiredError extends TValidationErrorBase {
    keyword: 'dependentRequired';
    params: {
        property: string;
        dependencies: string[];
    };
}
export interface TEnumError extends TValidationErrorBase {
    keyword: 'enum';
    params: {
        allowedValues: unknown[];
    };
}
export interface TExclusiveMaximumError extends TValidationErrorBase {
    keyword: 'exclusiveMaximum';
    params: {
        comparison: '<';
        limit: number | bigint;
    };
}
export interface TExclusiveMinimumError extends TValidationErrorBase {
    keyword: 'exclusiveMinimum';
    params: {
        comparison: '>';
        limit: number | bigint;
    };
}
export interface TFormatError extends TValidationErrorBase {
    keyword: 'format';
    params: {
        format: string;
    };
}
export interface TGuardError extends TValidationErrorBase {
    keyword: '~guard';
    params: {
        errors: object[];
    };
}
export interface TIfError extends TValidationErrorBase {
    keyword: 'if';
    params: {
        failingKeyword: 'then' | 'else';
    };
}
export interface TMaximumError extends TValidationErrorBase {
    keyword: 'maximum';
    params: {
        comparison: '<=';
        limit: number | bigint;
    };
}
export interface TMaxItemsError extends TValidationErrorBase {
    keyword: 'maxItems';
    params: {
        limit: number;
    };
}
export interface TMaxLengthError extends TValidationErrorBase {
    keyword: 'maxLength';
    params: {
        limit: number;
    };
}
export interface TMaxPropertiesError extends TValidationErrorBase {
    keyword: 'maxProperties';
    params: {
        limit: number;
    };
}
export interface TMinimumError extends TValidationErrorBase {
    keyword: 'minimum';
    params: {
        comparison: '>=';
        limit: number | bigint;
    };
}
export interface TMinItemsError extends TValidationErrorBase {
    keyword: 'minItems';
    params: {
        limit: number;
    };
}
export interface TMinLengthError extends TValidationErrorBase {
    keyword: 'minLength';
    params: {
        limit: number;
    };
}
export interface TMinPropertiesError extends TValidationErrorBase {
    keyword: 'minProperties';
    params: {
        limit: number;
    };
}
export interface TMultipleOfError extends TValidationErrorBase {
    keyword: 'multipleOf';
    params: {
        multipleOf: number | bigint;
    };
}
export interface TMinimumError extends TValidationErrorBase {
    keyword: 'minimum';
    params: {
        comparison: '>=';
        limit: number | bigint;
    };
}
export interface TNotError extends TValidationErrorBase {
    keyword: 'not';
    params: {};
}
export interface TOneOfError extends TValidationErrorBase {
    keyword: 'oneOf';
    params: {
        passingSchemas: number[];
    };
}
export interface TPatternError extends TValidationErrorBase {
    keyword: 'pattern';
    params: {
        pattern: string | RegExp;
    };
}
export interface TPropertyNamesError extends TValidationErrorBase {
  
```

---

# OUTRO - errors.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\errors.d.ts
**SHA:** d56ce400ce234c80
**Timestamp:** 2026-08-28T02:29:47.916378
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: string;

### Ouro Bruto (primeiros 5000 chars)
```
import type { $ZodCheck, $ZodStringFormats } from "./checks.js";
import { $constructor } from "./core.js";
import type { $ZodType } from "./schemas.js";
import type { StandardSchemaV1 } from "./standard-schema.js";
import * as util from "./util.js";
export interface $ZodIssueBase {
    readonly code?: string;
    readonly input?: unknown;
    readonly path: PropertyKey[];
    readonly message: string;
}
export type $ZodInvalidTypeExpected = "string" | "number" | "int" | "boolean" | "bigint" | "symbol" | "undefined" | "null" | "never" | "void" | "date" | "array" | "object" | "tuple" | "record" | "map" | "set" | "file" | "nonoptional" | "nan" | "function" | (string & {});
export interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase {
    readonly code: "invalid_type";
    readonly expected: $ZodInvalidTypeExpected;
    readonly input?: Input;
}
export interface $ZodIssueTooBig<Input = unknown> extends $ZodIssueBase {
    readonly code: "too_big";
    readonly origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
    readonly maximum: number | bigint;
    readonly inclusive?: boolean;
    readonly exact?: boolean;
    readonly input?: Input;
}
export interface $ZodIssueTooSmall<Input = unknown> extends $ZodIssueBase {
    readonly code: "too_small";
    readonly origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
    readonly minimum: number | bigint;
    /** True if the allowable range includes the minimum */
    readonly inclusive?: boolean;
    /** True if the allowed value is fixed (e.g.` z.length(5)`), not a range (`z.minLength(5)`) */
    readonly exact?: boolean;
    readonly input?: Input;
}
export interface $ZodIssueInvalidStringFormat extends $ZodIssueBase {
    readonly code: "invalid_format";
    readonly format: $ZodStringFormats | (string & {});
    readonly pattern?: string;
    readonly input?: string;
}
export interface $ZodIssueNotMultipleOf<Input extends number | bigint = number | bigint> extends $ZodIssueBase {
    readonly code: "not_multiple_of";
    readonly divisor: number;
    readonly input?: Input;
}
export interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase {
    readonly code: "unrecognized_keys";
    readonly keys: string[];
    readonly input?: Record<string, unknown>;
}
interface $ZodIssueInvalidUnionNoMatch extends $ZodIssueBase {
    readonly code: "invalid_union";
    readonly errors: $ZodIssue[][];
    readonly input?: unknown;
    readonly discriminator?: string | undefined;
    readonly options?: util.Primitive[];
    readonly inclusive?: true;
}
interface $ZodIssueInvalidUnionMultipleMatch extends $ZodIssueBase {
    readonly code: "invalid_union";
    readonly errors: [];
    readonly input?: unknown;
    readonly discriminator?: string | undefined;
    readonly inclusive: false;
}
export type $ZodIssueInvalidUnion = $ZodIssueInvalidUnionNoMatch | $ZodIssueInvalidUnionMultipleMatch;
export interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase {
    readonly code: "invalid_key";
    readonly origin: "map" | "record";
    readonly issues: $ZodIssue[];
    readonly input?: Input;
}
export interface $ZodIssueInvalidElement<Input = unknown> extends $ZodIssueBase {
    readonly code: "invalid_element";
    readonly origin: "map" | "set";
    readonly key: unknown;
    readonly issues: $ZodIssue[];
    readonly input?: Input;
}
export interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase {
    readonly code: "invalid_value";
    readonly values: util.Primitive[];
    readonly input?: Input;
}
export interface $ZodIssueCustom extends $ZodIssueBase {
    readonly code: "custom";
    readonly params?: Record<string, any> | undefined;
    readonly input?: unknown;
}
export interface $ZodIssueStringCommonFormats extends $ZodIssueInvalidStringFormat {
    format: Exclude<$ZodStringFormats, "regex" | "jwt" | "starts_with" | "ends_with" | "includes">;
}
export interface $ZodIssueStringInvalidRegex extends $ZodIssueInvalidStringFormat {
    format: "regex";
    pattern: string;
}
export interface $ZodIssueStringInvalidJWT extends $ZodIssueInvalidStringFormat {
    format: "jwt";
    algorithm?: string;
}
export interface $ZodIssueStringStartsWith extends $ZodIssueInvalidStringFormat {
    format: "starts_with";
    prefix: string;
}
export interface $ZodIssueStringEndsWith extends $ZodIssueInvalidStringFormat {
    format: "ends_with";
    suffix: string;
}
export interface $ZodIssueStringIncludes extends $ZodIssueInvalidStringFormat {
    format: "includes";
    includes: string;
}
export type $ZodStringFormatIssues = $ZodIssueStringCommonFormats | $ZodIssueStringInvalidRegex | $ZodIssueStringInvalidJWT | $ZodIssueStringStartsWith | $ZodIssueStringEndsWith | $ZodIssueStringIncludes;
export type $ZodIssue = $ZodIssueInvalidType | $ZodIssueTooBig | $ZodIssueTooSmall | $ZodIssueInvalidStringFormat | $ZodIssueNotMultipleOf | $ZodIssueUnrecogniz
`````