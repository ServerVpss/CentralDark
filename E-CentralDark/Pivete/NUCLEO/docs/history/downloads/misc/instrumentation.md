# OUTRO - instrumentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\cjs\integrations\tracing\graphql\vendored\instrumentation.js
**SHA:** 9e2b8fe79f5b4e0a
**Timestamp:** 2026-08-28T02:22:54.362211
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const fieldResolverForExecute = fieldResolver ?? defaultFieldResolved;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const instrumentation = require('@opentelemetry/instrumentation');
const InstrumentationNodeModuleFile = require('../../InstrumentationNodeModuleFile.js');
const _enum = require('./enum.js');
const AttributeNames = require('./enums/AttributeNames.js');
const symbols = require('./symbols.js');
const internalTypes = require('./internal-types.js');
const utils = require('./utils.js');
const core = require('@sentry/core');
const opentelemetry = require('@sentry/opentelemetry');

const PACKAGE_NAME = "@sentry/instrumentation-graphql";
const ORIGIN = "auto.graphql.otel.graphql";
const DEFAULT_CONFIG = {
  ignoreResolveSpans: false
};
const supportedVersions = [">=14.0.0 <17"];
class GraphQLInstrumentation extends instrumentation.InstrumentationBase {
  constructor(config = {}) {
    super(PACKAGE_NAME, core.SDK_VERSION, { ...DEFAULT_CONFIG, ...config });
  }
  setConfig(config = {}) {
    super.setConfig({ ...DEFAULT_CONFIG, ...config });
  }
  init() {
    const module = new instrumentation.InstrumentationNodeModuleDefinition("graphql", supportedVersions);
    module.files.push(this._addPatchingExecute());
    module.files.push(this._addPatchingParser());
    module.files.push(this._addPatchingValidate());
    return module;
  }
  _addPatchingExecute() {
    return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(
      "graphql/execution/execute.js",
      supportedVersions,
      // cannot make it work with appropriate type as execute function has 2
      //types and/cannot import function but only types
      (moduleExports) => {
        if (instrumentation.isWrapped(moduleExports.execute)) {
          this._unwrap(moduleExports, "execute");
        }
        this._wrap(moduleExports, "execute", this._patchExecute(moduleExports.defaultFieldResolver));
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "execute");
        }
      }
    );
  }
  _addPatchingParser() {
    return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(
      "graphql/language/parser.js",
      supportedVersions,
      (moduleExports) => {
        if (instrumentation.isWrapped(moduleExports.parse)) {
          this._unwrap(moduleExports, "parse");
        }
        this._wrap(moduleExports, "parse", this._patchParse());
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "parse");
        }
      }
    );
  }
  _addPatchingValidate() {
    return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(
      "graphql/validation/validate.js",
      supportedVersions,
      (moduleExports) => {
        if (instrumentation.isWrapped(moduleExports.validate)) {
          this._unwrap(moduleExports, "validate");
        }
        this._wrap(moduleExports, "validate", this._patchValidate());
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "validate");
        }
      }
    );
  }
  _patchExecute(defaultFieldResolved) {
    const instrumentation$1 = this;
    return function execute(original) {
      return function patchExecute() {
        let processedArgs;
        if (arguments.length >= 2) {
          const args = arguments;
          processedArgs = instrumentation$1._wrapExecuteArgs(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6],
            args[7],
            defaultFieldResolved
          );
        } else {
          const args = arguments[0];
          processedArgs = instrumentation$1._wrapExecuteArgs(
            args.schema,
            args.document,
            args.rootValue,
            args.contextValue,
            args.variableValues,
            args.operationName,
            args.fieldResolver,
            args.typeResolver,
            defaultFieldResolved
          );
        }
        const operation = utils.getOperation(processedArgs.document, processedArgs.operationName);
        const span = instrumentation$1._createExecuteSpan(operation, processedArgs);
        processedArgs.contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL] = {
          source: processedArgs.document ? processedArgs.document || processedArgs.document[symbols.OTEL_GRAPHQL_DATA_SYMBOL] : void 0,
          span,
          fields: {}
        };
        return core.withActiveSpan(span, () => {
          return instrumentation.safeExecuteInTheMiddle(
            () => {
              return original.apply(this, [processedArgs]);
            },
            (err, result) => {
              instrumentation$1._handleExecutionResult(span, err, result);
            }
          );
        });
      };
    };
  }
  _handleExecutionResult(span, err, result) {
    if (result === void 0 || err) {
      utils.endSp
```

---

# OUTRO - instrumentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\esm\integrations\tracing\graphql\vendored\instrumentation.js
**SHA:** bd85314df451af5a
**Timestamp:** 2026-08-28T02:23:02.896956
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const fieldResolverForExecute = fieldResolver ?? defaultFieldResolved;

### Ouro Bruto (primeiros 5000 chars)
```
import { InstrumentationBase, InstrumentationNodeModuleDefinition, isWrapped, safeExecuteInTheMiddle } from '@opentelemetry/instrumentation';
import { InstrumentationNodeModuleFile } from '../../InstrumentationNodeModuleFile.js';
import { SpanNames } from './enum.js';
import { AttributeNames } from './enums/AttributeNames.js';
import { OTEL_GRAPHQL_DATA_SYMBOL } from './symbols.js';
import { OPERATION_NOT_SUPPORTED } from './internal-types.js';
import { getOperation, endSpan, isPromise, addSpanSource, wrapFieldResolver, wrapFields } from './utils.js';
import { SDK_VERSION, withActiveSpan, spanToJSON, SPAN_STATUS_ERROR, getRootSpan, startInactiveSpan, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN } from '@sentry/core';
import { SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION } from '@sentry/opentelemetry';

const PACKAGE_NAME = "@sentry/instrumentation-graphql";
const ORIGIN = "auto.graphql.otel.graphql";
const DEFAULT_CONFIG = {
  ignoreResolveSpans: false
};
const supportedVersions = [">=14.0.0 <17"];
class GraphQLInstrumentation extends InstrumentationBase {
  constructor(config = {}) {
    super(PACKAGE_NAME, SDK_VERSION, { ...DEFAULT_CONFIG, ...config });
  }
  setConfig(config = {}) {
    super.setConfig({ ...DEFAULT_CONFIG, ...config });
  }
  init() {
    const module = new InstrumentationNodeModuleDefinition("graphql", supportedVersions);
    module.files.push(this._addPatchingExecute());
    module.files.push(this._addPatchingParser());
    module.files.push(this._addPatchingValidate());
    return module;
  }
  _addPatchingExecute() {
    return new InstrumentationNodeModuleFile(
      "graphql/execution/execute.js",
      supportedVersions,
      // cannot make it work with appropriate type as execute function has 2
      //types and/cannot import function but only types
      (moduleExports) => {
        if (isWrapped(moduleExports.execute)) {
          this._unwrap(moduleExports, "execute");
        }
        this._wrap(moduleExports, "execute", this._patchExecute(moduleExports.defaultFieldResolver));
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "execute");
        }
      }
    );
  }
  _addPatchingParser() {
    return new InstrumentationNodeModuleFile(
      "graphql/language/parser.js",
      supportedVersions,
      (moduleExports) => {
        if (isWrapped(moduleExports.parse)) {
          this._unwrap(moduleExports, "parse");
        }
        this._wrap(moduleExports, "parse", this._patchParse());
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "parse");
        }
      }
    );
  }
  _addPatchingValidate() {
    return new InstrumentationNodeModuleFile(
      "graphql/validation/validate.js",
      supportedVersions,
      (moduleExports) => {
        if (isWrapped(moduleExports.validate)) {
          this._unwrap(moduleExports, "validate");
        }
        this._wrap(moduleExports, "validate", this._patchValidate());
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "validate");
        }
      }
    );
  }
  _patchExecute(defaultFieldResolved) {
    const instrumentation = this;
    return function execute(original) {
      return function patchExecute() {
        let processedArgs;
        if (arguments.length >= 2) {
          const args = arguments;
          processedArgs = instrumentation._wrapExecuteArgs(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6],
            args[7],
            defaultFieldResolved
          );
        } else {
          const args = arguments[0];
          processedArgs = instrumentation._wrapExecuteArgs(
            args.schema,
            args.document,
            args.rootValue,
            args.contextValue,
            args.variableValues,
            args.operationName,
            args.fieldResolver,
            args.typeResolver,
            defaultFieldResolved
          );
        }
        const operation = getOperation(processedArgs.document, processedArgs.operationName);
        const span = instrumentation._createExecuteSpan(operation, processedArgs);
        processedArgs.contextValue[OTEL_GRAPHQL_DATA_SYMBOL] = {
          source: processedArgs.document ? processedArgs.document || processedArgs.document[OTEL_GRAPHQL_DATA_SYMBOL] : void 0,
          span,
          fields: {}
        };
        return withActiveSpan(span, () => {
          return safeExecuteInTheMiddle(
            () => {
              return original.apply(this, [processedArgs]);
            },
            (err, result) => {
              instrumentation._handleExecutionResult(span, err, result);
            }
          );
        });
      };
    };
  }
  _handleExecutionResult(span, err, result) {
    if (result === void 0 || err) 
```

---

# OUTRO - instrumentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\integrations\tracing-channel\express\instrumentation.js
**SHA:** d9549cf626a9691c
**Timestamp:** 2026-08-28T02:23:26.063633
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: NOOP,
- asyncStart: NOOP,
- start: NOOP,
- asyncStart: popLayerPathForLayer

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const attributes = require('@sentry/conventions/attributes');
const core = require('@sentry/core');
const debugBuild = require('../../../debug-build.js');
const channels = require('../../../orchestrion/channels.js');
const tracingChannel = require('../../../tracing-channel.js');
const route = require('./route.js');

const ORIGIN = "auto.http.express";
const ATTR_EXPRESS_NAME = "express.name";
const ATTR_EXPRESS_TYPE = "express.type";
const NOOP = () => {
};
let _isInstrumented = false;
function instrumentExpress(options, tracingChannel$1) {
  if (_isInstrumented) {
    return;
  }
  _isInstrumented = true;
  for (const channelName of [channels.CHANNELS.EXPRESS_REGISTER, channels.CHANNELS.ROUTER_REGISTER]) {
    tracingChannel$1(channelName).subscribe({
      start: NOOP,
      asyncStart: NOOP,
      asyncEnd: NOOP,
      error: NOOP,
      end: captureRegisteredLayerPath
    });
  }
  for (const channelName of [channels.CHANNELS.EXPRESS_HANDLE, channels.CHANNELS.ROUTER_HANDLE]) {
    debugBuild.DEBUG_BUILD && core.debug.log(`[orchestrion:express] subscribing to channel "${channelName}"`);
    const channel = tracingChannel$1(channelName);
    tracingChannel.bindTracingChannelToSpan(channel, (data) => getSpanForLayer(data, options), {
      beforeSpanEnd(_span, data) {
        data._sentryCleanup?.();
      }
    });
    channel.subscribe({
      start: NOOP,
      asyncEnd: NOOP,
      end: NOOP,
      error: NOOP,
      asyncStart: popLayerPathForLayer
    });
  }
}
function captureRegisteredLayerPath(data) {
  const stack = data.self?.stack;
  if (!Array.isArray(stack)) {
    return;
  }
  const layer = stack[stack.length - 1];
  if (layer) {
    route.setLayerRegisteredPath(layer, route.getLayerPath(data.arguments ?? []));
  }
}
function popLayerPathForLayer(data) {
  if (!data._sentryStoredLayer) {
    return;
  }
  data._sentryStoredLayer = false;
  const req = data.arguments?.[0];
  if (req) {
    route.popLayerPath(req);
  }
}
function getSpanForLayer(data, options) {
  const layer = data.self;
  const args = data.arguments;
  if (!layer || !Array.isArray(args)) {
    return void 0;
  }
  if (layer.handle?.length === 4) {
    return void 0;
  }
  if (layer.method && !layer.route) {
    return void 0;
  }
  const req = args[0];
  const res = args[1];
  if (!req) {
    return void 0;
  }
  if (!core.getActiveSpan()) {
    return void 0;
  }
  const type = getLayerType(layer);
  const registeredPath = route.getLayerRegisteredPath(layer);
  if (registeredPath != null) {
    route.pushLayerPath(req, registeredPath);
    data._sentryStoredLayer = true;
  }
  const constructedRoute = type === "request_handler" ? route.getConstructedRoute(req) : void 0;
  const matchedRoute = type === "request_handler" && constructedRoute != null ? route.getActualMatchedRoute(req, constructedRoute) : void 0;
  const name = type === "request_handler" ? constructedRoute || "request handler" : type === "router" ? layer.path ?? "/" : layer.name ?? "<anonymous>";
  if (matchedRoute) {
    setHttpServerSpanRoute(matchedRoute);
  }
  if (type === "request_handler" && constructedRoute) {
    const isolationScope = core.getIsolationScope();
    if (isolationScope !== core.getDefaultIsolationScope()) {
      const method = typeof req.method === "string" ? req.method.toUpperCase() : "GET";
      isolationScope.setTransactionName(`${method} ${constructedRoute}`);
    } else {
      debugBuild.DEBUG_BUILD && core.debug.warn(
        "[orchestrion:express] Isolation scope is still default isolation scope - skipping transaction name"
      );
    }
  }
  if (isLayerIgnored(name, type, options)) {
    return void 0;
  }
  const span = core.startInactiveSpan({
    name,
    attributes: {
      [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
      [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.express`,
      [ATTR_EXPRESS_NAME]: name,
      [ATTR_EXPRESS_TYPE]: type,
      ...matchedRoute ? { [attributes.HTTP_ROUTE]: matchedRoute } : {}
    }
  });
  if (res && typeof res.once === "function") {
    const onFinish = () => {
      span.end();
    };
    res.once("finish", onFinish);
    data._sentryCleanup = () => res.removeListener("finish", onFinish);
  }
  return span;
}
function getLayerType(layer) {
  if (layer.name === "router") {
    return "router";
  }
  if (layer.name === "bound dispatch" || layer.name === "handle") {
    return "request_handler";
  }
  return "middleware";
}
function setHttpServerSpanRoute(route) {
  const activeSpan = core.getActiveSpan();
  const rootSpan = activeSpan && core.getRootSpan(activeSpan);
  if (!rootSpan) {
    return;
  }
  if (core.spanToJSON(rootSpan).data[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] !== "http.server") {
    return;
  }
  rootSpan.setAttribute(attributes.HTTP_ROUTE, route);
}
function isLayerIgnored(name, type, options) {
  const { ignoreLayers, ignoreLayersType } = options;
  if (Array.isArray(ignoreLayersType) && ign
```

---

# OUTRO - instrumentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\integrations\tracing-channel\firebase\instrumentation.js
**SHA:** 5cac256abe1fb451
**Timestamp:** 2026-08-28T02:23:26.818973
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: (data) => void safe(() => functions.wrapFunctionsRegistration(data, triggerType)),
- asyncStart: NOOP,

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const diagnosticsChannel = require('node:diagnostics_channel');
const core = require('@sentry/core');
const debugBuild = require('../../../debug-build.js');
const channels = require('../../../orchestrion/channels.js');
const tracingChannel = require('../../../tracing-channel.js');
const firestore = require('./firestore.js');
const functions = require('./functions.js');

const FIRESTORE_OPERATIONS = [
  { channel: channels.CHANNELS.FIREBASE_FIRESTORE_ADD_DOC, spanName: "addDoc", useParent: false },
  { channel: channels.CHANNELS.FIREBASE_FIRESTORE_GET_DOCS, spanName: "getDocs", useParent: false },
  { channel: channels.CHANNELS.FIREBASE_FIRESTORE_SET_DOC, spanName: "setDoc", useParent: true },
  { channel: channels.CHANNELS.FIREBASE_FIRESTORE_DELETE_DOC, spanName: "deleteDoc", useParent: true }
];
const FUNCTIONS_TRIGGERS = [
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_HTTP_REQUEST, triggerType: "http.request" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_HTTP_CALL, triggerType: "http.call" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_CREATED, triggerType: "firestore.document.created" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_UPDATED, triggerType: "firestore.document.updated" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_DELETED, triggerType: "firestore.document.deleted" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_WRITTEN, triggerType: "firestore.document.written" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_SCHEDULER, triggerType: "scheduler.scheduled" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_STORAGE_FINALIZED, triggerType: "storage.object.finalized" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_STORAGE_ARCHIVED, triggerType: "storage.object.archived" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_STORAGE_DELETED, triggerType: "storage.object.deleted" },
  { channel: channels.CHANNELS.FIREBASE_FUNCTIONS_STORAGE_METADATA_UPDATED, triggerType: "storage.object.metadataUpdated" }
];
const NOOP = () => {
};
function safe(fn) {
  try {
    return fn();
  } catch (error) {
    debugBuild.DEBUG_BUILD && core.debug.warn("[orchestrion:firebase] error handling channel event", error);
    return void 0;
  }
}
function instrumentFirebase() {
  for (const { channel, spanName, useParent } of FIRESTORE_OPERATIONS) {
    tracingChannel.bindTracingChannelToSpan(
      diagnosticsChannel.tracingChannel(channel),
      (data) => safe(() => {
        const reference = data.arguments[0];
        if (!reference) {
          return void 0;
        }
        const spanReference = useParent ? reference.parent || reference : reference;
        return firestore.startFirestoreSpan(spanName, spanReference);
      })
    );
  }
  for (const { channel, triggerType } of FUNCTIONS_TRIGGERS) {
    diagnosticsChannel.tracingChannel(channel).subscribe({
      start: (data) => void safe(() => functions.wrapFunctionsRegistration(data, triggerType)),
      end: NOOP,
      asyncStart: NOOP,
      asyncEnd: NOOP,
      error: NOOP
    });
  }
}

exports.instrumentFirebase = instrumentFirebase;
//# sourceMappingURL=instrumentation.js.map

```

---

# OUTRO - instrumentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\integrations\tracing-channel\express\instrumentation.js
**SHA:** 4a578b3529a5a87f
**Timestamp:** 2026-08-28T02:23:34.890288
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: NOOP,
- asyncStart: NOOP,
- start: NOOP,
- asyncStart: popLayerPathForLayer

### Ouro Bruto (primeiros 5000 chars)
```
import { HTTP_ROUTE } from '@sentry/conventions/attributes';
import { debug, getActiveSpan, getIsolationScope, getDefaultIsolationScope, startInactiveSpan, SEMANTIC_ATTRIBUTE_SENTRY_OP, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, getRootSpan, spanToJSON, stringMatchesSomePattern } from '@sentry/core';
import { DEBUG_BUILD } from '../../../debug-build.js';
import { CHANNELS } from '../../../orchestrion/channels.js';
import { bindTracingChannelToSpan } from '../../../tracing-channel.js';
import { setLayerRegisteredPath, getLayerPath, getLayerRegisteredPath, pushLayerPath, getConstructedRoute, getActualMatchedRoute, popLayerPath } from './route.js';

const ORIGIN = "auto.http.express";
const ATTR_EXPRESS_NAME = "express.name";
const ATTR_EXPRESS_TYPE = "express.type";
const NOOP = () => {
};
let _isInstrumented = false;
function instrumentExpress(options, tracingChannel) {
  if (_isInstrumented) {
    return;
  }
  _isInstrumented = true;
  for (const channelName of [CHANNELS.EXPRESS_REGISTER, CHANNELS.ROUTER_REGISTER]) {
    tracingChannel(channelName).subscribe({
      start: NOOP,
      asyncStart: NOOP,
      asyncEnd: NOOP,
      error: NOOP,
      end: captureRegisteredLayerPath
    });
  }
  for (const channelName of [CHANNELS.EXPRESS_HANDLE, CHANNELS.ROUTER_HANDLE]) {
    DEBUG_BUILD && debug.log(`[orchestrion:express] subscribing to channel "${channelName}"`);
    const channel = tracingChannel(channelName);
    bindTracingChannelToSpan(channel, (data) => getSpanForLayer(data, options), {
      beforeSpanEnd(_span, data) {
        data._sentryCleanup?.();
      }
    });
    channel.subscribe({
      start: NOOP,
      asyncEnd: NOOP,
      end: NOOP,
      error: NOOP,
      asyncStart: popLayerPathForLayer
    });
  }
}
function captureRegisteredLayerPath(data) {
  const stack = data.self?.stack;
  if (!Array.isArray(stack)) {
    return;
  }
  const layer = stack[stack.length - 1];
  if (layer) {
    setLayerRegisteredPath(layer, getLayerPath(data.arguments ?? []));
  }
}
function popLayerPathForLayer(data) {
  if (!data._sentryStoredLayer) {
    return;
  }
  data._sentryStoredLayer = false;
  const req = data.arguments?.[0];
  if (req) {
    popLayerPath(req);
  }
}
function getSpanForLayer(data, options) {
  const layer = data.self;
  const args = data.arguments;
  if (!layer || !Array.isArray(args)) {
    return void 0;
  }
  if (layer.handle?.length === 4) {
    return void 0;
  }
  if (layer.method && !layer.route) {
    return void 0;
  }
  const req = args[0];
  const res = args[1];
  if (!req) {
    return void 0;
  }
  if (!getActiveSpan()) {
    return void 0;
  }
  const type = getLayerType(layer);
  const registeredPath = getLayerRegisteredPath(layer);
  if (registeredPath != null) {
    pushLayerPath(req, registeredPath);
    data._sentryStoredLayer = true;
  }
  const constructedRoute = type === "request_handler" ? getConstructedRoute(req) : void 0;
  const matchedRoute = type === "request_handler" && constructedRoute != null ? getActualMatchedRoute(req, constructedRoute) : void 0;
  const name = type === "request_handler" ? constructedRoute || "request handler" : type === "router" ? layer.path ?? "/" : layer.name ?? "<anonymous>";
  if (matchedRoute) {
    setHttpServerSpanRoute(matchedRoute);
  }
  if (type === "request_handler" && constructedRoute) {
    const isolationScope = getIsolationScope();
    if (isolationScope !== getDefaultIsolationScope()) {
      const method = typeof req.method === "string" ? req.method.toUpperCase() : "GET";
      isolationScope.setTransactionName(`${method} ${constructedRoute}`);
    } else {
      DEBUG_BUILD && debug.warn(
        "[orchestrion:express] Isolation scope is still default isolation scope - skipping transaction name"
      );
    }
  }
  if (isLayerIgnored(name, type, options)) {
    return void 0;
  }
  const span = startInactiveSpan({
    name,
    attributes: {
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.express`,
      [ATTR_EXPRESS_NAME]: name,
      [ATTR_EXPRESS_TYPE]: type,
      ...matchedRoute ? { [HTTP_ROUTE]: matchedRoute } : {}
    }
  });
  if (res && typeof res.once === "function") {
    const onFinish = () => {
      span.end();
    };
    res.once("finish", onFinish);
    data._sentryCleanup = () => res.removeListener("finish", onFinish);
  }
  return span;
}
function getLayerType(layer) {
  if (layer.name === "router") {
    return "router";
  }
  if (layer.name === "bound dispatch" || layer.name === "handle") {
    return "request_handler";
  }
  return "middleware";
}
function setHttpServerSpanRoute(route) {
  const activeSpan = getActiveSpan();
  const rootSpan = activeSpan && getRootSpan(activeSpan);
  if (!rootSpan) {
    return;
  }
  if (spanToJSON(rootSpan).data[SEMANTIC_ATTRIBUTE_SENTRY_OP] !== "http.server") {
    return;
  }
  rootSpan.setAttribute(HTTP_ROUTE, route);
}
function isLayerIgnored(name, type, options) {
  const { ignoreLayers, ignoreLayersType } = op
```

---

# OUTRO - instrumentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\integrations\tracing-channel\firebase\instrumentation.js
**SHA:** d9525973232d15a0
**Timestamp:** 2026-08-28T02:23:35.184868
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: (data) => void safe(() => wrapFunctionsRegistration(data, triggerType)),
- asyncStart: NOOP,

### Ouro Bruto (primeiros 5000 chars)
```
import * as diagnosticsChannel from 'node:diagnostics_channel';
import { debug } from '@sentry/core';
import { DEBUG_BUILD } from '../../../debug-build.js';
import { CHANNELS } from '../../../orchestrion/channels.js';
import { bindTracingChannelToSpan } from '../../../tracing-channel.js';
import { startFirestoreSpan } from './firestore.js';
import { wrapFunctionsRegistration } from './functions.js';

const FIRESTORE_OPERATIONS = [
  { channel: CHANNELS.FIREBASE_FIRESTORE_ADD_DOC, spanName: "addDoc", useParent: false },
  { channel: CHANNELS.FIREBASE_FIRESTORE_GET_DOCS, spanName: "getDocs", useParent: false },
  { channel: CHANNELS.FIREBASE_FIRESTORE_SET_DOC, spanName: "setDoc", useParent: true },
  { channel: CHANNELS.FIREBASE_FIRESTORE_DELETE_DOC, spanName: "deleteDoc", useParent: true }
];
const FUNCTIONS_TRIGGERS = [
  { channel: CHANNELS.FIREBASE_FUNCTIONS_HTTP_REQUEST, triggerType: "http.request" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_HTTP_CALL, triggerType: "http.call" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_CREATED, triggerType: "firestore.document.created" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_UPDATED, triggerType: "firestore.document.updated" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_DELETED, triggerType: "firestore.document.deleted" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_FIRESTORE_WRITTEN, triggerType: "firestore.document.written" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_SCHEDULER, triggerType: "scheduler.scheduled" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_STORAGE_FINALIZED, triggerType: "storage.object.finalized" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_STORAGE_ARCHIVED, triggerType: "storage.object.archived" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_STORAGE_DELETED, triggerType: "storage.object.deleted" },
  { channel: CHANNELS.FIREBASE_FUNCTIONS_STORAGE_METADATA_UPDATED, triggerType: "storage.object.metadataUpdated" }
];
const NOOP = () => {
};
function safe(fn) {
  try {
    return fn();
  } catch (error) {
    DEBUG_BUILD && debug.warn("[orchestrion:firebase] error handling channel event", error);
    return void 0;
  }
}
function instrumentFirebase() {
  for (const { channel, spanName, useParent } of FIRESTORE_OPERATIONS) {
    bindTracingChannelToSpan(
      diagnosticsChannel.tracingChannel(channel),
      (data) => safe(() => {
        const reference = data.arguments[0];
        if (!reference) {
          return void 0;
        }
        const spanReference = useParent ? reference.parent || reference : reference;
        return startFirestoreSpan(spanName, spanReference);
      })
    );
  }
  for (const { channel, triggerType } of FUNCTIONS_TRIGGERS) {
    diagnosticsChannel.tracingChannel(channel).subscribe({
      start: (data) => void safe(() => wrapFunctionsRegistration(data, triggerType)),
      end: NOOP,
      asyncStart: NOOP,
      asyncEnd: NOOP,
      error: NOOP
    });
  }
}

export { instrumentFirebase };
//# sourceMappingURL=instrumentation.js.map

```