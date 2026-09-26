# OUTRO - checks.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\core\checks.ts
**SHA:** e5dd4c62f0672a60
**Timestamp:** 2026-08-28T02:28:38.536966
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- if (isInt) bag.pattern = regexes.integer;
- ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
- pattern: RegExp;
- pattern: def.pattern.toString(),
- const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
- def.pattern = pattern;
- const pattern = new RegExp(`^${util.escapeRegex(def.prefix)}.*`);
- const pattern = new RegExp(`.*${util.escapeRegex(def.suffix)}$`);

### Ouro Bruto (primeiros 5000 chars)
```
// import { $ZodType } from "./schemas.js";

import * as core from "./core.js";
import type * as errors from "./errors.js";
import * as regexes from "./regexes.js";
import type * as schemas from "./schemas.js";
import * as util from "./util.js";

//////////////////////////////   CHECKS   ///////////////////////////////////////

export interface $ZodCheckDef {
  check: string;
  error?: errors.$ZodErrorMap<never> | undefined;
  /** If true, no later checks will be executed if this check fails. Default `false`. */
  abort?: boolean | undefined;
  /** If provided, the check runs only when this returns `true`. By default, it is skipped if prior parsing produced aborting issues. */
  when?: ((payload: schemas.ParsePayload) => boolean) | undefined;
}

export interface $ZodCheckInternals<T> {
  def: $ZodCheckDef;
  /** The set of issues this check might throw. */
  issc?: errors.$ZodIssueBase;
  check(payload: schemas.ParsePayload<T>): util.MaybeAsync<void>;
  onattach: ((schema: schemas.$ZodType) => void)[];
}

export interface $ZodCheck<in T = never> {
  _zod: $ZodCheckInternals<T>;
}

export const $ZodCheck: core.$constructor<$ZodCheck<any>> = /*@__PURE__*/ core.$constructor(
  "$ZodCheck",
  (inst, def) => {
    inst._zod ??= {} as any;
    inst._zod.def = def;
    inst._zod.onattach ??= [];
  }
);

///////////////////////////////////////
/////      $ZodCheckLessThan      /////
///////////////////////////////////////
export interface $ZodCheckLessThanDef extends $ZodCheckDef {
  check: "less_than";
  value: util.Numeric;
  inclusive: boolean;
}

export interface $ZodCheckLessThanInternals<T extends util.Numeric = util.Numeric> extends $ZodCheckInternals<T> {
  def: $ZodCheckLessThanDef;
  issc: errors.$ZodIssueTooBig<T>;
}

const numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date",
} as const;
export interface $ZodCheckLessThan<T extends util.Numeric = util.Numeric> extends $ZodCheck<T> {
  _zod: $ZodCheckLessThanInternals<T>;
}

export const $ZodCheckLessThan: core.$constructor<$ZodCheckLessThan> = /*@__PURE__*/ core.$constructor(
  "$ZodCheckLessThan",
  (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst._zod.onattach.push((inst) => {
      const bag = inst._zod.bag;
      const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      if (def.value < curr) {
        if (def.inclusive) bag.maximum = def.value;
        else bag.exclusiveMaximum = def.value;
      }
    });

    inst._zod.check = (payload) => {
      if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
        return;
      }

      payload.issues.push({
        origin,
        code: "too_big",
        maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
        input: payload.value,
        inclusive: def.inclusive,
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
export interface $ZodCheckGreaterThanDef extends $ZodCheckDef {
  check: "greater_than";
  value: util.Numeric;
  inclusive: boolean;
}

export interface $ZodCheckGreaterThanInternals<T extends util.Numeric = util.Numeric> extends $ZodCheckInternals<T> {
  def: $ZodCheckGreaterThanDef;
  issc: errors.$ZodIssueTooSmall<T>;
}

export interface $ZodCheckGreaterThan<T extends util.Numeric = util.Numeric> extends $ZodCheck<T> {
  _zod: $ZodCheckGreaterThanInternals<T>;
}

export const $ZodCheckGreaterThan: core.$constructor<$ZodCheckGreaterThan> = /*@__PURE__*/ core.$constructor(
  "$ZodCheckGreaterThan",
  (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst._zod.onattach.push((inst) => {
      const bag = inst._zod.bag;
      const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      if (def.value > curr) {
        if (def.inclusive) bag.minimum = def.value;
        else bag.exclusiveMinimum = def.value;
      }
    });

    inst._zod.check = (payload) => {
      if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
        return;
      }

      payload.issues.push({
        origin,
        code: "too_small",
        minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
        input: payload.value,
        inclusive: def.inclusive,
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckMultipleOf    /////
/////////////////////////////////////
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034

export interface $ZodCheckMultipleOfDef<T extends number | bigint = number | bigint> extends $ZodCheckDef {
  check: "multiple_of";
  va
```

---

# OUTRO - checks.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\checks.cjs
**SHA:** d9b6a4b1d366015f
**Timestamp:** 2026-08-28T02:29:44.360391
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- bag.pattern = regexes.integer;
- ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
- pattern: def.pattern.toString(),
- def.pattern ?? (def.pattern = regexes.lowercase);
- def.pattern ?? (def.pattern = regexes.uppercase);
- const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
- def.pattern = pattern;
- const pattern = new RegExp(`^${util.escapeRegex(def.prefix)}.*`);
- def.pattern ?? (def.pattern = pattern);
- const pattern = new RegExp(`.*${util.escapeRegex(def.suffix)}$`);

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
// import { $ZodType } from "./schemas.js";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ZodCheckOverwrite = exports.$ZodCheckMimeType = exports.$ZodCheckProperty = exports.$ZodCheckEndsWith = exports.$ZodCheckStartsWith = exports.$ZodCheckIncludes = exports.$ZodCheckUpperCase = exports.$ZodCheckLowerCase = exports.$ZodCheckRegex = exports.$ZodCheckStringFormat = exports.$ZodCheckLengthEquals = exports.$ZodCheckMinLength = exports.$ZodCheckMaxLength = exports.$ZodCheckSizeEquals = exports.$ZodCheckMinSize = exports.$ZodCheckMaxSize = exports.$ZodCheckBigIntFormat = exports.$ZodCheckNumberFormat = exports.$ZodCheckMultipleOf = exports.$ZodCheckGreaterThan = exports.$ZodCheckLessThan = exports.$ZodCheck = void 0;
const core = __importStar(require("./core.cjs"));
const regexes = __importStar(require("./regexes.cjs"));
const util = __importStar(require("./util.cjs"));
exports.$ZodCheck = core.$constructor("$ZodCheck", (inst, def) => {
    var _a;
    inst._zod ?? (inst._zod = {});
    inst._zod.def = def;
    (_a = inst._zod).onattach ?? (_a.onattach = []);
});
const numericOriginMap = {
    number: "number",
    bigint: "bigint",
    object: "date",
};
exports.$ZodCheckLessThan = core.$constructor("$ZodCheckLessThan", (inst, def) => {
    exports.$ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
        if (def.value < curr) {
            if (def.inclusive)
                bag.maximum = def.value;
            else
                bag.exclusiveMaximum = def.value;
        }
    });
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
            return;
        }
        payload.issues.push({
            origin,
            code: "too_big",
            maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
exports.$ZodCheckGreaterThan = core.$constructor("$ZodCheckGreaterThan", (inst, def) => {
    exports.$ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
        if (def.value > curr) {
            if (def.inclusive)
                bag.minimum = def.value;
            else
                bag.exclusiveMinimum = def.value;
        }
    });
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
            return;
        }
        payload.issues.push({
            origin,
            code: "too_small",
            minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
exports.$ZodCheckMultipleOf = 
/*@__PURE__*/ core.$constructor("$ZodCheckMultipleOf", (inst, def) => {
    exports.$ZodCheck.init(inst, def);
    inst._zod.onattach.push((inst) => {
        var _a;
        (_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
    });
    inst._zod.check = (payload) => {
        if (typeof payload.value !== typeof def.value)
            throw new Error("Cannot mix number and bigint in multiple_of check.");
        const isMultiple = typeof payload.value === "bigint"
            ? payload.value % def.value === BigInt(0)
            : util.floatSafeRemainder(payload.value, def.value) === 0;
        if (isMultiple)
            return;
        payload.issues.push({
            origin: typ
```       //   inpu
```

---

# OUTRO - checks.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\3bd1bf9ef9546718\.github\workflows\checks.yml
**SHA:** 530a90e670e68d09
**Timestamp:** 2026-08-28T02:53:11.454901
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: python .github/checks.py

### Ouro Bruto (primeiros 5000 chars)
```
name: checks
on:
  push:
    branches: [main]
  pull_request:
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Validate manifests, skills, adapters, evidence, and style
        run: python .github/checks.py

```