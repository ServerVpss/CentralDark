# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-admin\scripts\validate.mjs
**SHA:** cefbc8b94db3352a
**Timestamp:** 2026-08-26T18:41:20.165433
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let lastLineStart = 0;
- lastLineStart = match.index + match[0].length;
- this.start = startToken.start;
- start: this.start,
- this.start = start;
- exports.isNameStart = isNameStart;
- this.lineStart = 0;
- lexer.lineStart = position;
- lexer.lineStart = position;
- let chunkStart = position;

### Contratos
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Principios
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== void 0 ? _usageCount$possibleI : 0) + 1;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js
var require_version = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.versionInfo = exports.version = void 0;
    var version = "16.13.2";
    exports.version = version;
    var versionInfo = Object.freeze({
      major: 16,
      minor: 13,
      patch: 2,
      preReleaseTag: null
    });
    exports.versionInfo = versionInfo;
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js
var require_devAssert = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.devAssert = devAssert;
    function devAssert(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(message);
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js
var require_isPromise = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isPromise = isPromise;
    function isPromise(value) {
      return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isObjectLike = isObjectLike;
    function isObjectLike(value) {
      return typeof value == "object" && value !== null;
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js
var require_invariant = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.invariant = invariant;
    function invariant(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(
          message != null ? message : "Unexpected invariant triggered."
        );
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js
var require_location = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLocation = getLocation;
    var _invariant = require_invariant();
    var LineRegExp = /\r\n|[\n\r]/g;
    function getLocation(source, position) {
      let lastLineStart = 0;
      let line = 1;
      for (const match of source.body.matchAll(LineRegExp)) {
        typeof match.index === "number" || (0, _invariant.invariant)(false);
        if (match.index >= position) {
          break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
      }
      return {
        line,
        column: position + 1 - lastLineStart
      };
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/grap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-customer\scripts\validate.mjs
**SHA:** 0af31f6d4bc4df04
**Timestamp:** 2026-08-26T18:41:22.164315
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let lastLineStart = 0;
- lastLineStart = match.index + match[0].length;
- this.start = startToken.start;
- start: this.start,
- this.start = start;
- exports.isNameStart = isNameStart;
- this.lineStart = 0;
- lexer.lineStart = position;
- lexer.lineStart = position;
- let chunkStart = position;

### Contratos
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Principios
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== void 0 ? _usageCount$possibleI : 0) + 1;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js
var require_version = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.versionInfo = exports.version = void 0;
    var version = "16.13.2";
    exports.version = version;
    var versionInfo = Object.freeze({
      major: 16,
      minor: 13,
      patch: 2,
      preReleaseTag: null
    });
    exports.versionInfo = versionInfo;
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js
var require_devAssert = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.devAssert = devAssert;
    function devAssert(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(message);
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js
var require_isPromise = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isPromise = isPromise;
    function isPromise(value) {
      return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isObjectLike = isObjectLike;
    function isObjectLike(value) {
      return typeof value == "object" && value !== null;
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js
var require_invariant = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.invariant = invariant;
    function invariant(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(
          message != null ? message : "Unexpected invariant triggered."
        );
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js
var require_location = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLocation = getLocation;
    var _invariant = require_invariant();
    var LineRegExp = /\r\n|[\n\r]/g;
    function getLocation(source, position) {
      let lastLineStart = 0;
      let line = 1;
      for (const match of source.body.matchAll(LineRegExp)) {
        typeof match.index === "number" || (0, _invariant.invariant)(false);
        if (match.index >= position) {
          break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
      }
      return {
        line,
        column: position + 1 - lastLineStart
      };
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/grap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-hydrogen\scripts\validate.mjs
**SHA:** 7bbf4c0d0c1e24ba
**Timestamp:** 2026-08-26T18:41:26.089473
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = node.getStart(sourceFile);
- start: d.start,
- if (diagnostic.start === void 0 || diagnostic.length === void 0) {
- const diagnosticStart = diagnostic.start;

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

// src/agent-skills/scripts/validate_components.ts
import { readFileSync } from "fs";
import { parseArgs } from "util";

// src/types/api-types.ts
var Visibility = {
  PUBLIC: "public",
  EARLY_ACCESS: "earlyAccess",
  INTERNAL: "internal"
};
var APICategory = {
  GRAPHQL: "graphql",
  FUNCTIONS: "functions",
  FUNCTION_GRAPHQL: "function-graphql",
  // GraphQL schemas for Function input queries
  UI_FRAMEWORK: "ui-framework",
  THEME: "theme",
  CONFIGURATION: "configuration",
  EXECUTION: "execution",
  GUIDANCE: "guidance"
  // Procedural topics (onboarding, review checklists) — hand-maintained, no validation/search
};

// src/types/api-mapping.ts
function defineApis(apis) {
  return Object.fromEntries(
    Object.entries(apis).map(([name, config]) => [name, { name, ...config }])
  );
}
var SHOPIFY_APIS = defineApis({
  "use-shopify-cli": {
    displayName: "Use Shopify CLI",
    description: "Choose when the user needs **Shopify CLI** to run or fix something now: validate app or extension config on disk (`shopify.app.toml`, `shopify.app.<name>.toml`, `shopify.extension.toml`); run or troubleshoot store workflows (`shopify store auth`, `shopify store execute`); inventory or product changes by handle, SKU, or location name; or CLI setup, auth, upgrade issues. Emphasize **commands and operational steps**, not only authoring GraphQL. Skip for API-only understanding or codegen with no CLI execution. Examples: validate configuration before deploy; run an existing query via CLI; list products; missing `shopify store execute`.",
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false
  },
  ucp: {
    displayName: "UCP CLI",
    description: 'Use when the user wants to use the UCP CLI to find, compare, buy, or track products from online merchants, or to set up and troubleshoot the local UCP profile required for merchant-scoped operations. Covers global catalog search ("find me X under $Y"), named-merchant transactions ("buy this from Z.com"), order tracking, `ucp profile init`, `ucp doctor`, carts, checkout, orders, and UCP setup/help. Falls back to merchant-hosted handoff when direct in-protocol checkout isn\'t available.',
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false,
    skillName: "ucp",
    compatibility: "Requires UCP CLI",
    frontmatterExtras: { requires_bin: "ucp", command: "ucp" }
  },
  admin: {
    displayName: "Admin API",
    description: "Write or explain **Admin GraphQL** queries and mutations for apps and integrations that extend the Shopify admin. Use when the user wants to **understand, design, or generate** the operation itself\u2014even before deciding how to run it. Do **not** choose `admin` first for **app or extension config validation** \u2014use **`use-shopify-cli`**. Do **not** choose `admin` first to **execute** Admin GraphQL **now via Shopify CLI** or for CLI setup/troubleshooting on store workflows\u2014use **`use-shopify-cli`** (store auth/execute, handle/SKU/location lookups, inventory changes).",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "admin" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "productCreate mutation",
      context: "creating a product"
    }
  },
  "storefront-graphql": {
    displayName: "Storefront GraphQL API",
    description: "Use for custom storefronts requiring direct GraphQL queries/mutations for data fetching and cart operations. Choose this when you need full control over data fetching and rendering your own UI. NOT for Web Components - if the prompt mentions HTML tags like <shopify-store>, <shopify-cart>, use storefront-web-components instead.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "storefront" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "predictiveSearch query",
      context: "storefront search"
    }
  },
  partner: {
    displayName: "Partner API",
    description: "The Partner API lets you programmatically access data about your Partner Dashboard, including your apps, themes, and affiliate referrals.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "partner" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "transactions query",
      context: "partner transaction history"
    }
  },
  customer: {
    displayName: "Customer Account API",
    description: "The Customer Account API allows customers to access their own data including orders, payment methods, and addresses.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "customer" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "customer orders query",
      context: "customer order history"
    }
  },
  "payments-apps": {
    displayName: "Payments Ap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-functions\scripts\validate.mjs
**SHA:** 23a413818feb6f76
**Timestamp:** 2026-08-26T18:41:26.784358
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let lastLineStart = 0;
- lastLineStart = match.index + match[0].length;
- this.start = startToken.start;
- start: this.start,
- this.start = start;
- exports.isNameStart = isNameStart;
- this.lineStart = 0;
- lexer.lineStart = position;
- lexer.lineStart = position;
- let chunkStart = position;

### Contratos
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Principios
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== void 0 ? _usageCount$possibleI : 0) + 1;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js
var require_version = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.versionInfo = exports.version = void 0;
    var version = "16.13.2";
    exports.version = version;
    var versionInfo = Object.freeze({
      major: 16,
      minor: 13,
      patch: 2,
      preReleaseTag: null
    });
    exports.versionInfo = versionInfo;
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js
var require_devAssert = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.devAssert = devAssert;
    function devAssert(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(message);
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js
var require_isPromise = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isPromise = isPromise;
    function isPromise(value) {
      return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isObjectLike = isObjectLike;
    function isObjectLike(value) {
      return typeof value == "object" && value !== null;
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js
var require_invariant = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.invariant = invariant;
    function invariant(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(
          message != null ? message : "Unexpected invariant triggered."
        );
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js
var require_location = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLocation = getLocation;
    var _invariant = require_invariant();
    var LineRegExp = /\r\n|[\n\r]/g;
    function getLocation(source, position) {
      let lastLineStart = 0;
      let line = 1;
      for (const match of source.body.matchAll(LineRegExp)) {
        typeof match.index === "number" || (0, _invariant.invariant)(false);
        if (match.index >= position) {
          break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
      }
      return {
        line,
        column: position + 1 - lastLineStart
      };
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/grap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-partner\scripts\validate.mjs
**SHA:** 4c06d7663f9cf297
**Timestamp:** 2026-08-26T18:41:30.769185
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let lastLineStart = 0;
- lastLineStart = match.index + match[0].length;
- this.start = startToken.start;
- start: this.start,
- this.start = start;
- exports.isNameStart = isNameStart;
- this.lineStart = 0;
- lexer.lineStart = position;
- lexer.lineStart = position;
- let chunkStart = position;

### Contratos
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Principios
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== void 0 ? _usageCount$possibleI : 0) + 1;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js
var require_version = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.versionInfo = exports.version = void 0;
    var version = "16.13.2";
    exports.version = version;
    var versionInfo = Object.freeze({
      major: 16,
      minor: 13,
      patch: 2,
      preReleaseTag: null
    });
    exports.versionInfo = versionInfo;
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js
var require_devAssert = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.devAssert = devAssert;
    function devAssert(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(message);
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js
var require_isPromise = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isPromise = isPromise;
    function isPromise(value) {
      return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isObjectLike = isObjectLike;
    function isObjectLike(value) {
      return typeof value == "object" && value !== null;
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js
var require_invariant = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.invariant = invariant;
    function invariant(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(
          message != null ? message : "Unexpected invariant triggered."
        );
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js
var require_location = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLocation = getLocation;
    var _invariant = require_invariant();
    var LineRegExp = /\r\n|[\n\r]/g;
    function getLocation(source, position) {
      let lastLineStart = 0;
      let line = 1;
      for (const match of source.body.matchAll(LineRegExp)) {
        typeof match.index === "number" || (0, _invariant.invariant)(false);
        if (match.index >= position) {
          break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
      }
      return {
        line,
        column: position + 1 - lastLineStart
      };
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/grap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-payments-apps\scripts\validate.mjs
**SHA:** d03cc52e7d72fc5e
**Timestamp:** 2026-08-26T18:41:31.682424
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let lastLineStart = 0;
- lastLineStart = match.index + match[0].length;
- this.start = startToken.start;
- start: this.start,
- this.start = start;
- exports.isNameStart = isNameStart;
- this.lineStart = 0;
- lexer.lineStart = position;
- lexer.lineStart = position;
- let chunkStart = position;

### Contratos
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Principios
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== void 0 ? _usageCount$possibleI : 0) + 1;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js
var require_version = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.versionInfo = exports.version = void 0;
    var version = "16.13.2";
    exports.version = version;
    var versionInfo = Object.freeze({
      major: 16,
      minor: 13,
      patch: 2,
      preReleaseTag: null
    });
    exports.versionInfo = versionInfo;
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js
var require_devAssert = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.devAssert = devAssert;
    function devAssert(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(message);
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js
var require_isPromise = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isPromise = isPromise;
    function isPromise(value) {
      return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isObjectLike = isObjectLike;
    function isObjectLike(value) {
      return typeof value == "object" && value !== null;
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js
var require_invariant = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.invariant = invariant;
    function invariant(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(
          message != null ? message : "Unexpected invariant triggered."
        );
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js
var require_location = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLocation = getLocation;
    var _invariant = require_invariant();
    var LineRegExp = /\r\n|[\n\r]/g;
    function getLocation(source, position) {
      let lastLineStart = 0;
      let line = 1;
      for (const match of source.body.matchAll(LineRegExp)) {
        typeof match.index === "number" || (0, _invariant.invariant)(false);
        if (match.index >= position) {
          break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
      }
      return {
        line,
        column: position + 1 - lastLineStart
      };
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/grap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-polaris-admin-extensions\scripts\validate.mjs
**SHA:** 122c1a26c0ef785d
**Timestamp:** 2026-08-26T18:41:32.153291
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = node.getStart(sourceFile);
- start: d.start,
- if (diagnostic.start === void 0 || diagnostic.length === void 0) {
- const diagnosticStart = diagnostic.start;

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

// src/agent-skills/scripts/validate_components.ts
import { readFileSync } from "fs";
import { parseArgs } from "util";

// src/types/api-types.ts
var Visibility = {
  PUBLIC: "public",
  EARLY_ACCESS: "earlyAccess",
  INTERNAL: "internal"
};
var APICategory = {
  GRAPHQL: "graphql",
  FUNCTIONS: "functions",
  FUNCTION_GRAPHQL: "function-graphql",
  // GraphQL schemas for Function input queries
  UI_FRAMEWORK: "ui-framework",
  THEME: "theme",
  CONFIGURATION: "configuration",
  EXECUTION: "execution",
  GUIDANCE: "guidance"
  // Procedural topics (onboarding, review checklists) — hand-maintained, no validation/search
};

// src/types/api-mapping.ts
function defineApis(apis) {
  return Object.fromEntries(
    Object.entries(apis).map(([name, config]) => [name, { name, ...config }])
  );
}
var SHOPIFY_APIS = defineApis({
  "use-shopify-cli": {
    displayName: "Use Shopify CLI",
    description: "Choose when the user needs **Shopify CLI** to run or fix something now: validate app or extension config on disk (`shopify.app.toml`, `shopify.app.<name>.toml`, `shopify.extension.toml`); run or troubleshoot store workflows (`shopify store auth`, `shopify store execute`); inventory or product changes by handle, SKU, or location name; or CLI setup, auth, upgrade issues. Emphasize **commands and operational steps**, not only authoring GraphQL. Skip for API-only understanding or codegen with no CLI execution. Examples: validate configuration before deploy; run an existing query via CLI; list products; missing `shopify store execute`.",
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false
  },
  ucp: {
    displayName: "UCP CLI",
    description: 'Use when the user wants to use the UCP CLI to find, compare, buy, or track products from online merchants, or to set up and troubleshoot the local UCP profile required for merchant-scoped operations. Covers global catalog search ("find me X under $Y"), named-merchant transactions ("buy this from Z.com"), order tracking, `ucp profile init`, `ucp doctor`, carts, checkout, orders, and UCP setup/help. Falls back to merchant-hosted handoff when direct in-protocol checkout isn\'t available.',
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false,
    skillName: "ucp",
    compatibility: "Requires UCP CLI",
    frontmatterExtras: { requires_bin: "ucp", command: "ucp" }
  },
  admin: {
    displayName: "Admin API",
    description: "Write or explain **Admin GraphQL** queries and mutations for apps and integrations that extend the Shopify admin. Use when the user wants to **understand, design, or generate** the operation itself\u2014even before deciding how to run it. Do **not** choose `admin` first for **app or extension config validation** \u2014use **`use-shopify-cli`**. Do **not** choose `admin` first to **execute** Admin GraphQL **now via Shopify CLI** or for CLI setup/troubleshooting on store workflows\u2014use **`use-shopify-cli`** (store auth/execute, handle/SKU/location lookups, inventory changes).",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "admin" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "productCreate mutation",
      context: "creating a product"
    }
  },
  "storefront-graphql": {
    displayName: "Storefront GraphQL API",
    description: "Use for custom storefronts requiring direct GraphQL queries/mutations for data fetching and cart operations. Choose this when you need full control over data fetching and rendering your own UI. NOT for Web Components - if the prompt mentions HTML tags like <shopify-store>, <shopify-cart>, use storefront-web-components instead.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "storefront" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "predictiveSearch query",
      context: "storefront search"
    }
  },
  partner: {
    displayName: "Partner API",
    description: "The Partner API lets you programmatically access data about your Partner Dashboard, including your apps, themes, and affiliate referrals.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "partner" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "transactions query",
      context: "partner transaction history"
    }
  },
  customer: {
    displayName: "Customer Account API",
    description: "The Customer Account API allows customers to access their own data including orders, payment methods, and addresses.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "customer" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "customer orders query",
      context: "customer order history"
    }
  },
  "payments-apps": {
    displayName: "Payments Ap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-polaris-checkout-extensions\scripts\validate.mjs
**SHA:** e69dbf3d6af2d5a2
**Timestamp:** 2026-08-26T18:41:32.995991
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = node.getStart(sourceFile);
- start: d.start,
- if (diagnostic.start === void 0 || diagnostic.length === void 0) {
- const diagnosticStart = diagnostic.start;

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

// src/agent-skills/scripts/validate_components.ts
import { readFileSync } from "fs";
import { parseArgs } from "util";

// src/types/api-types.ts
var Visibility = {
  PUBLIC: "public",
  EARLY_ACCESS: "earlyAccess",
  INTERNAL: "internal"
};
var APICategory = {
  GRAPHQL: "graphql",
  FUNCTIONS: "functions",
  FUNCTION_GRAPHQL: "function-graphql",
  // GraphQL schemas for Function input queries
  UI_FRAMEWORK: "ui-framework",
  THEME: "theme",
  CONFIGURATION: "configuration",
  EXECUTION: "execution",
  GUIDANCE: "guidance"
  // Procedural topics (onboarding, review checklists) — hand-maintained, no validation/search
};

// src/types/api-mapping.ts
function defineApis(apis) {
  return Object.fromEntries(
    Object.entries(apis).map(([name, config]) => [name, { name, ...config }])
  );
}
var SHOPIFY_APIS = defineApis({
  "use-shopify-cli": {
    displayName: "Use Shopify CLI",
    description: "Choose when the user needs **Shopify CLI** to run or fix something now: validate app or extension config on disk (`shopify.app.toml`, `shopify.app.<name>.toml`, `shopify.extension.toml`); run or troubleshoot store workflows (`shopify store auth`, `shopify store execute`); inventory or product changes by handle, SKU, or location name; or CLI setup, auth, upgrade issues. Emphasize **commands and operational steps**, not only authoring GraphQL. Skip for API-only understanding or codegen with no CLI execution. Examples: validate configuration before deploy; run an existing query via CLI; list products; missing `shopify store execute`.",
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false
  },
  ucp: {
    displayName: "UCP CLI",
    description: 'Use when the user wants to use the UCP CLI to find, compare, buy, or track products from online merchants, or to set up and troubleshoot the local UCP profile required for merchant-scoped operations. Covers global catalog search ("find me X under $Y"), named-merchant transactions ("buy this from Z.com"), order tracking, `ucp profile init`, `ucp doctor`, carts, checkout, orders, and UCP setup/help. Falls back to merchant-hosted handoff when direct in-protocol checkout isn\'t available.',
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false,
    skillName: "ucp",
    compatibility: "Requires UCP CLI",
    frontmatterExtras: { requires_bin: "ucp", command: "ucp" }
  },
  admin: {
    displayName: "Admin API",
    description: "Write or explain **Admin GraphQL** queries and mutations for apps and integrations that extend the Shopify admin. Use when the user wants to **understand, design, or generate** the operation itself\u2014even before deciding how to run it. Do **not** choose `admin` first for **app or extension config validation** \u2014use **`use-shopify-cli`**. Do **not** choose `admin` first to **execute** Admin GraphQL **now via Shopify CLI** or for CLI setup/troubleshooting on store workflows\u2014use **`use-shopify-cli`** (store auth/execute, handle/SKU/location lookups, inventory changes).",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "admin" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "productCreate mutation",
      context: "creating a product"
    }
  },
  "storefront-graphql": {
    displayName: "Storefront GraphQL API",
    description: "Use for custom storefronts requiring direct GraphQL queries/mutations for data fetching and cart operations. Choose this when you need full control over data fetching and rendering your own UI. NOT for Web Components - if the prompt mentions HTML tags like <shopify-store>, <shopify-cart>, use storefront-web-components instead.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "storefront" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "predictiveSearch query",
      context: "storefront search"
    }
  },
  partner: {
    displayName: "Partner API",
    description: "The Partner API lets you programmatically access data about your Partner Dashboard, including your apps, themes, and affiliate referrals.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "partner" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "transactions query",
      context: "partner transaction history"
    }
  },
  customer: {
    displayName: "Customer Account API",
    description: "The Customer Account API allows customers to access their own data including orders, payment methods, and addresses.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "customer" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "customer orders query",
      context: "customer order history"
    }
  },
  "payments-apps": {
    displayName: "Payments Ap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-polaris-customer-account-extensions\scripts\validate.mjs
**SHA:** 3bf467c66c69627f
**Timestamp:** 2026-08-26T18:41:34.598514
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = node.getStart(sourceFile);
- start: d.start,
- if (diagnostic.start === void 0 || diagnostic.length === void 0) {
- const diagnosticStart = diagnostic.start;

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

// src/agent-skills/scripts/validate_components.ts
import { readFileSync } from "fs";
import { parseArgs } from "util";

// src/types/api-types.ts
var Visibility = {
  PUBLIC: "public",
  EARLY_ACCESS: "earlyAccess",
  INTERNAL: "internal"
};
var APICategory = {
  GRAPHQL: "graphql",
  FUNCTIONS: "functions",
  FUNCTION_GRAPHQL: "function-graphql",
  // GraphQL schemas for Function input queries
  UI_FRAMEWORK: "ui-framework",
  THEME: "theme",
  CONFIGURATION: "configuration",
  EXECUTION: "execution",
  GUIDANCE: "guidance"
  // Procedural topics (onboarding, review checklists) — hand-maintained, no validation/search
};

// src/types/api-mapping.ts
function defineApis(apis) {
  return Object.fromEntries(
    Object.entries(apis).map(([name, config]) => [name, { name, ...config }])
  );
}
var SHOPIFY_APIS = defineApis({
  "use-shopify-cli": {
    displayName: "Use Shopify CLI",
    description: "Choose when the user needs **Shopify CLI** to run or fix something now: validate app or extension config on disk (`shopify.app.toml`, `shopify.app.<name>.toml`, `shopify.extension.toml`); run or troubleshoot store workflows (`shopify store auth`, `shopify store execute`); inventory or product changes by handle, SKU, or location name; or CLI setup, auth, upgrade issues. Emphasize **commands and operational steps**, not only authoring GraphQL. Skip for API-only understanding or codegen with no CLI execution. Examples: validate configuration before deploy; run an existing query via CLI; list products; missing `shopify store execute`.",
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false
  },
  ucp: {
    displayName: "UCP CLI",
    description: 'Use when the user wants to use the UCP CLI to find, compare, buy, or track products from online merchants, or to set up and troubleshoot the local UCP profile required for merchant-scoped operations. Covers global catalog search ("find me X under $Y"), named-merchant transactions ("buy this from Z.com"), order tracking, `ucp profile init`, `ucp doctor`, carts, checkout, orders, and UCP setup/help. Falls back to merchant-hosted handoff when direct in-protocol checkout isn\'t available.',
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false,
    skillName: "ucp",
    compatibility: "Requires UCP CLI",
    frontmatterExtras: { requires_bin: "ucp", command: "ucp" }
  },
  admin: {
    displayName: "Admin API",
    description: "Write or explain **Admin GraphQL** queries and mutations for apps and integrations that extend the Shopify admin. Use when the user wants to **understand, design, or generate** the operation itself\u2014even before deciding how to run it. Do **not** choose `admin` first for **app or extension config validation** \u2014use **`use-shopify-cli`**. Do **not** choose `admin` first to **execute** Admin GraphQL **now via Shopify CLI** or for CLI setup/troubleshooting on store workflows\u2014use **`use-shopify-cli`** (store auth/execute, handle/SKU/location lookups, inventory changes).",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "admin" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "productCreate mutation",
      context: "creating a product"
    }
  },
  "storefront-graphql": {
    displayName: "Storefront GraphQL API",
    description: "Use for custom storefronts requiring direct GraphQL queries/mutations for data fetching and cart operations. Choose this when you need full control over data fetching and rendering your own UI. NOT for Web Components - if the prompt mentions HTML tags like <shopify-store>, <shopify-cart>, use storefront-web-components instead.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "storefront" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "predictiveSearch query",
      context: "storefront search"
    }
  },
  partner: {
    displayName: "Partner API",
    description: "The Partner API lets you programmatically access data about your Partner Dashboard, including your apps, themes, and affiliate referrals.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "partner" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "transactions query",
      context: "partner transaction history"
    }
  },
  customer: {
    displayName: "Customer Account API",
    description: "The Customer Account API allows customers to access their own data including orders, payment methods, and addresses.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "customer" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "customer orders query",
      context: "customer order history"
    }
  },
  "payments-apps": {
    displayName: "Payments Ap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-pos-ui\scripts\validate.mjs
**SHA:** efb258d0999d18b6
**Timestamp:** 2026-08-26T18:41:35.517251
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = node.getStart(sourceFile);
- start: d.start,
- if (diagnostic.start === void 0 || diagnostic.length === void 0) {
- const diagnosticStart = diagnostic.start;

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

// src/agent-skills/scripts/validate_components.ts
import { readFileSync } from "fs";
import { parseArgs } from "util";

// src/types/api-types.ts
var Visibility = {
  PUBLIC: "public",
  EARLY_ACCESS: "earlyAccess",
  INTERNAL: "internal"
};
var APICategory = {
  GRAPHQL: "graphql",
  FUNCTIONS: "functions",
  FUNCTION_GRAPHQL: "function-graphql",
  // GraphQL schemas for Function input queries
  UI_FRAMEWORK: "ui-framework",
  THEME: "theme",
  CONFIGURATION: "configuration",
  EXECUTION: "execution",
  GUIDANCE: "guidance"
  // Procedural topics (onboarding, review checklists) — hand-maintained, no validation/search
};

// src/types/api-mapping.ts
function defineApis(apis) {
  return Object.fromEntries(
    Object.entries(apis).map(([name, config]) => [name, { name, ...config }])
  );
}
var SHOPIFY_APIS = defineApis({
  "use-shopify-cli": {
    displayName: "Use Shopify CLI",
    description: "Choose when the user needs **Shopify CLI** to run or fix something now: validate app or extension config on disk (`shopify.app.toml`, `shopify.app.<name>.toml`, `shopify.extension.toml`); run or troubleshoot store workflows (`shopify store auth`, `shopify store execute`); inventory or product changes by handle, SKU, or location name; or CLI setup, auth, upgrade issues. Emphasize **commands and operational steps**, not only authoring GraphQL. Skip for API-only understanding or codegen with no CLI execution. Examples: validate configuration before deploy; run an existing query via CLI; list products; missing `shopify store execute`.",
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false
  },
  ucp: {
    displayName: "UCP CLI",
    description: 'Use when the user wants to use the UCP CLI to find, compare, buy, or track products from online merchants, or to set up and troubleshoot the local UCP profile required for merchant-scoped operations. Covers global catalog search ("find me X under $Y"), named-merchant transactions ("buy this from Z.com"), order tracking, `ucp profile init`, `ucp doctor`, carts, checkout, orders, and UCP setup/help. Falls back to merchant-hosted handoff when direct in-protocol checkout isn\'t available.',
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false,
    skillName: "ucp",
    compatibility: "Requires UCP CLI",
    frontmatterExtras: { requires_bin: "ucp", command: "ucp" }
  },
  admin: {
    displayName: "Admin API",
    description: "Write or explain **Admin GraphQL** queries and mutations for apps and integrations that extend the Shopify admin. Use when the user wants to **understand, design, or generate** the operation itself\u2014even before deciding how to run it. Do **not** choose `admin` first for **app or extension config validation** \u2014use **`use-shopify-cli`**. Do **not** choose `admin` first to **execute** Admin GraphQL **now via Shopify CLI** or for CLI setup/troubleshooting on store workflows\u2014use **`use-shopify-cli`** (store auth/execute, handle/SKU/location lookups, inventory changes).",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "admin" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "productCreate mutation",
      context: "creating a product"
    }
  },
  "storefront-graphql": {
    displayName: "Storefront GraphQL API",
    description: "Use for custom storefronts requiring direct GraphQL queries/mutations for data fetching and cart operations. Choose this when you need full control over data fetching and rendering your own UI. NOT for Web Components - if the prompt mentions HTML tags like <shopify-store>, <shopify-cart>, use storefront-web-components instead.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "storefront" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "predictiveSearch query",
      context: "storefront search"
    }
  },
  partner: {
    displayName: "Partner API",
    description: "The Partner API lets you programmatically access data about your Partner Dashboard, including your apps, themes, and affiliate referrals.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "partner" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "transactions query",
      context: "partner transaction history"
    }
  },
  customer: {
    displayName: "Customer Account API",
    description: "The Customer Account API allows customers to access their own data including orders, payment methods, and addresses.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "customer" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "customer orders query",
      context: "customer order history"
    }
  },
  "payments-apps": {
    displayName: "Payments Ap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-storefront-graphql\scripts\validate.mjs
**SHA:** 620ba46e5b09fe87
**Timestamp:** 2026-08-26T18:41:37.139307
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let lastLineStart = 0;
- lastLineStart = match.index + match[0].length;
- this.start = startToken.start;
- start: this.start,
- this.start = start;
- exports.isNameStart = isNameStart;
- this.lineStart = 0;
- lexer.lineStart = position;
- lexer.lineStart = position;
- let chunkStart = position;

### Contratos
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Principios
- var require_invariant = __commonJS({
- exports.invariant = invariant;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== void 0 ? _usageCount$possibleI : 0) + 1;
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();
- var _invariant = require_invariant();

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js
var require_version = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.versionInfo = exports.version = void 0;
    var version = "16.13.2";
    exports.version = version;
    var versionInfo = Object.freeze({
      major: 16,
      minor: 13,
      patch: 2,
      preReleaseTag: null
    });
    exports.versionInfo = versionInfo;
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js
var require_devAssert = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/devAssert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.devAssert = devAssert;
    function devAssert(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(message);
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js
var require_isPromise = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isPromise.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isPromise = isPromise;
    function isPromise(value) {
      return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js
var require_isObjectLike = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/isObjectLike.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isObjectLike = isObjectLike;
    function isObjectLike(value) {
      return typeof value == "object" && value !== null;
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js
var require_invariant = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/jsutils/invariant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.invariant = invariant;
    function invariant(condition, message) {
      const booleanCondition = Boolean(condition);
      if (!booleanCondition) {
        throw new Error(
          message != null ? message : "Unexpected invariant triggered."
        );
      }
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js
var require_location = __commonJS({
  "../../node_modules/.pnpm/graphql@16.13.2/node_modules/graphql/language/location.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLocation = getLocation;
    var _invariant = require_invariant();
    var LineRegExp = /\r\n|[\n\r]/g;
    function getLocation(source, position) {
      let lastLineStart = 0;
      let line = 1;
      for (const match of source.body.matchAll(LineRegExp)) {
        typeof match.index === "number" || (0, _invariant.invariant)(false);
        if (match.index >= position) {
          break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
      }
      return {
        line,
        column: position + 1 - lastLineStart
      };
    }
  }
});

// ../../node_modules/.pnpm/graphql@16.13.2/node_modules/grap
```

---

# COMANDO - validate.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\shopify\skills\shopify-polaris-app-home\scripts\validate.mjs
**SHA:** cf75de6b3b0c9814
**Timestamp:** 2026-08-26T18:43:44.427844
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = node.getStart(sourceFile);
- start: d.start,
- if (diagnostic.start === void 0 || diagnostic.length === void 0) {
- const diagnosticStart = diagnostic.start;

### Gaps
- //TODO: Need to find the appropriate packages for Storefront Web Components.

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

// src/agent-skills/scripts/validate_components.ts
import { readFileSync } from "fs";
import { parseArgs } from "util";

// src/types/api-types.ts
var Visibility = {
  PUBLIC: "public",
  EARLY_ACCESS: "earlyAccess",
  INTERNAL: "internal"
};
var APICategory = {
  GRAPHQL: "graphql",
  FUNCTIONS: "functions",
  FUNCTION_GRAPHQL: "function-graphql",
  // GraphQL schemas for Function input queries
  UI_FRAMEWORK: "ui-framework",
  THEME: "theme",
  CONFIGURATION: "configuration",
  EXECUTION: "execution",
  GUIDANCE: "guidance"
  // Procedural topics (onboarding, review checklists) — hand-maintained, no validation/search
};

// src/types/api-mapping.ts
function defineApis(apis) {
  return Object.fromEntries(
    Object.entries(apis).map(([name, config]) => [name, { name, ...config }])
  );
}
var SHOPIFY_APIS = defineApis({
  "use-shopify-cli": {
    displayName: "Use Shopify CLI",
    description: "Choose when the user needs **Shopify CLI** to run or fix something now: validate app or extension config on disk (`shopify.app.toml`, `shopify.app.<name>.toml`, `shopify.extension.toml`); run or troubleshoot store workflows (`shopify store auth`, `shopify store execute`); inventory or product changes by handle, SKU, or location name; or CLI setup, auth, upgrade issues. Emphasize **commands and operational steps**, not only authoring GraphQL. Skip for API-only understanding or codegen with no CLI execution. Examples: validate configuration before deploy; run an existing query via CLI; list products; missing `shopify store execute`.",
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false
  },
  ucp: {
    displayName: "UCP CLI",
    description: 'Use when the user wants to use the UCP CLI to find, compare, buy, or track products from online merchants, or to set up and troubleshoot the local UCP profile required for merchant-scoped operations. Covers global catalog search ("find me X under $Y"), named-merchant transactions ("buy this from Z.com"), order tracking, `ucp profile init`, `ucp doctor`, carts, checkout, orders, and UCP setup/help. Falls back to merchant-hosted handoff when direct in-protocol checkout isn\'t available.',
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false,
    skillName: "ucp",
    compatibility: "Requires UCP CLI",
    frontmatterExtras: { requires_bin: "ucp", command: "ucp" }
  },
  admin: {
    displayName: "Admin API",
    description: "Write or explain **Admin GraphQL** queries and mutations for apps and integrations that extend the Shopify admin. Use when the user wants to **understand, design, or generate** the operation itself\u2014even before deciding how to run it. Do **not** choose `admin` first for **app or extension config validation** \u2014use **`use-shopify-cli`**. Do **not** choose `admin` first to **execute** Admin GraphQL **now via Shopify CLI** or for CLI setup/troubleshooting on store workflows\u2014use **`use-shopify-cli`** (store auth/execute, handle/SKU/location lookups, inventory changes).",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "admin" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "productCreate mutation",
      context: "creating a product"
    }
  },
  "storefront-graphql": {
    displayName: "Storefront GraphQL API",
    description: "Use for custom storefronts requiring direct GraphQL queries/mutations for data fetching and cart operations. Choose this when you need full control over data fetching and rendering your own UI. NOT for Web Components - if the prompt mentions HTML tags like <shopify-store>, <shopify-cart>, use storefront-web-components instead.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "storefront" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "predictiveSearch query",
      context: "storefront search"
    }
  },
  partner: {
    displayName: "Partner API",
    description: "The Partner API lets you programmatically access data about your Partner Dashboard, including your apps, themes, and affiliate referrals.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "partner" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "transactions query",
      context: "partner transaction history"
    }
  },
  customer: {
    displayName: "Customer Account API",
    description: "The Customer Account API allows customers to access their own data including orders, payment methods, and addresses.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    schemaSource: { shopifyDevPrefix: "customer" },
    validation: true,
    exampleVectorStoreQuery: {
      query: "customer orders query",
      context: "customer order history"
    }
  },
  "payments-apps": {
    displayName: "Payments Ap
```