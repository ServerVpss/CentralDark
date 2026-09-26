# COMANDO - mongoose.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\cjs\integrations\tracing\mongoose\vendored\mongoose.js
**SHA:** 0caa950df32c99ed
**Timestamp:** 2026-08-28T02:22:56.914810
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const aggregate = original.apply(this, arguments);

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const instrumentation = require('@opentelemetry/instrumentation');
const core = require('@sentry/core');
const serverUtils = require('@sentry/server-utils');
const utils = require('./utils.js');

const PACKAGE_NAME = "@sentry/instrumentation-mongoose";
const ORIGIN = "auto.db.otel.mongoose";
const contextCaptureFunctionsCommon = [
  "deleteOne",
  "deleteMany",
  "find",
  "findOne",
  "estimatedDocumentCount",
  "countDocuments",
  "distinct",
  "where",
  "$where",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace"
];
const contextCaptureFunctions6 = ["remove", "count", "findOneAndRemove", ...contextCaptureFunctionsCommon];
const contextCaptureFunctions7 = ["count", "findOneAndRemove", ...contextCaptureFunctionsCommon];
const contextCaptureFunctions8 = [...contextCaptureFunctionsCommon];
function getContextCaptureFunctions(moduleVersion) {
  if (!moduleVersion) {
    return contextCaptureFunctionsCommon;
  } else if (moduleVersion.startsWith("6.") || moduleVersion.startsWith("5.")) {
    return contextCaptureFunctions6;
  } else if (moduleVersion.startsWith("7.")) {
    return contextCaptureFunctions7;
  } else {
    return contextCaptureFunctions8;
  }
}
function instrumentRemove(moduleVersion) {
  return moduleVersion && (moduleVersion.startsWith("5.") || moduleVersion.startsWith("6.")) || false;
}
function needsDocumentMethodPatch(moduleVersion) {
  if (!moduleVersion || !moduleVersion.startsWith("8.")) {
    return false;
  }
  const minor = parseInt(moduleVersion.split(".")[1], 10);
  return minor >= 21;
}
const _STORED_PARENT_SPAN = /* @__PURE__ */ Symbol("stored-parent-span");
const _ALREADY_INSTRUMENTED = /* @__PURE__ */ Symbol("already-instrumented");
class MongooseInstrumentation extends instrumentation.InstrumentationBase {
  constructor(config = {}) {
    super(PACKAGE_NAME, core.SDK_VERSION, config);
  }
  init() {
    const module = new instrumentation.InstrumentationNodeModuleDefinition(
      "mongoose",
      // mongoose >= 9.7.0 publishes via diagnostics_channel and is instrumented by
      // `subscribeMongooseDiagnosticChannels` instead, so this IITM patcher must not
      // overlap it — otherwise every operation would emit two mongoose spans.
      [">=5.9.7 <9.7.0"],
      this.patch.bind(this),
      this.unpatch.bind(this)
    );
    return module;
  }
  patch(module, moduleVersion) {
    const moduleExports = module[Symbol.toStringTag] === "Module" && module.default ? module.default : module;
    this._wrap(moduleExports.Model.prototype, "save", this.patchOnModelMethods("save"));
    moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
    if (instrumentRemove(moduleVersion)) {
      this._wrap(moduleExports.Model.prototype, "remove", this.patchOnModelMethods("remove"));
    }
    if (needsDocumentMethodPatch(moduleVersion)) {
      this._wrap(moduleExports.Model.prototype, "updateOne", this._patchDocumentUpdateMethods("updateOne"));
      this._wrap(moduleExports.Model.prototype, "deleteOne", this._patchDocumentUpdateMethods("deleteOne"));
    }
    this._wrap(moduleExports.Query.prototype, "exec", this.patchQueryExec());
    this._wrap(moduleExports.Aggregate.prototype, "exec", this.patchAggregateExec());
    const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
    contextCaptureFunctions.forEach((funcName) => {
      this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
    });
    this._wrap(moduleExports.Model, "aggregate", this.patchModelAggregate());
    this._wrap(moduleExports.Model, "insertMany", this.patchModelStatic("insertMany"));
    this._wrap(moduleExports.Model, "bulkWrite", this.patchModelStatic("bulkWrite"));
    return moduleExports;
  }
  unpatch(module, moduleVersion) {
    const moduleExports = module[Symbol.toStringTag] === "Module" && module.default ? module.default : module;
    const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
    this._unwrap(moduleExports.Model.prototype, "save");
    moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
    if (instrumentRemove(moduleVersion)) {
      this._unwrap(moduleExports.Model.prototype, "remove");
    }
    if (needsDocumentMethodPatch(moduleVersion)) {
      this._unwrap(moduleExports.Model.prototype, "updateOne");
      this._unwrap(moduleExports.Model.prototype, "deleteOne");
    }
    this._unwrap(moduleExports.Query.prototype, "exec");
    this._unwrap(moduleExports.Aggregate.prototype, "exec");
    contextCaptureFunctions.forEach((funcName) => {
      this._unwrap(moduleExports.Query.prototype, funcName);
    });
    this._unwrap(moduleExports.Model, "aggregate");
    this._unwrap(moduleExports.Model, "insertMany");
    this._unwrap(moduleExports.Model, "bulkWrite");
  }
  patchAggregateExec() {
    const self = this;
    return (originalAggregate) => {
      return function exec(callback
```

---

# COMANDO - mongoose.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\esm\integrations\tracing\mongoose\vendored\mongoose.js
**SHA:** 62ce84465a9aac6c
**Timestamp:** 2026-08-28T02:23:05.134275
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const aggregate = original.apply(this, arguments);

### Ouro Bruto (primeiros 5000 chars)
```
import { InstrumentationBase, InstrumentationNodeModuleDefinition } from '@opentelemetry/instrumentation';
import { SDK_VERSION, getActiveSpan, withActiveSpan } from '@sentry/core';
import { startMongooseLegacySpan } from '@sentry/server-utils';
import { handleCallbackResponse, handlePromiseResponse } from './utils.js';

const PACKAGE_NAME = "@sentry/instrumentation-mongoose";
const ORIGIN = "auto.db.otel.mongoose";
const contextCaptureFunctionsCommon = [
  "deleteOne",
  "deleteMany",
  "find",
  "findOne",
  "estimatedDocumentCount",
  "countDocuments",
  "distinct",
  "where",
  "$where",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace"
];
const contextCaptureFunctions6 = ["remove", "count", "findOneAndRemove", ...contextCaptureFunctionsCommon];
const contextCaptureFunctions7 = ["count", "findOneAndRemove", ...contextCaptureFunctionsCommon];
const contextCaptureFunctions8 = [...contextCaptureFunctionsCommon];
function getContextCaptureFunctions(moduleVersion) {
  if (!moduleVersion) {
    return contextCaptureFunctionsCommon;
  } else if (moduleVersion.startsWith("6.") || moduleVersion.startsWith("5.")) {
    return contextCaptureFunctions6;
  } else if (moduleVersion.startsWith("7.")) {
    return contextCaptureFunctions7;
  } else {
    return contextCaptureFunctions8;
  }
}
function instrumentRemove(moduleVersion) {
  return moduleVersion && (moduleVersion.startsWith("5.") || moduleVersion.startsWith("6.")) || false;
}
function needsDocumentMethodPatch(moduleVersion) {
  if (!moduleVersion || !moduleVersion.startsWith("8.")) {
    return false;
  }
  const minor = parseInt(moduleVersion.split(".")[1], 10);
  return minor >= 21;
}
const _STORED_PARENT_SPAN = /* @__PURE__ */ Symbol("stored-parent-span");
const _ALREADY_INSTRUMENTED = /* @__PURE__ */ Symbol("already-instrumented");
class MongooseInstrumentation extends InstrumentationBase {
  constructor(config = {}) {
    super(PACKAGE_NAME, SDK_VERSION, config);
  }
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "mongoose",
      // mongoose >= 9.7.0 publishes via diagnostics_channel and is instrumented by
      // `subscribeMongooseDiagnosticChannels` instead, so this IITM patcher must not
      // overlap it — otherwise every operation would emit two mongoose spans.
      [">=5.9.7 <9.7.0"],
      this.patch.bind(this),
      this.unpatch.bind(this)
    );
    return module;
  }
  patch(module, moduleVersion) {
    const moduleExports = module[Symbol.toStringTag] === "Module" && module.default ? module.default : module;
    this._wrap(moduleExports.Model.prototype, "save", this.patchOnModelMethods("save"));
    moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
    if (instrumentRemove(moduleVersion)) {
      this._wrap(moduleExports.Model.prototype, "remove", this.patchOnModelMethods("remove"));
    }
    if (needsDocumentMethodPatch(moduleVersion)) {
      this._wrap(moduleExports.Model.prototype, "updateOne", this._patchDocumentUpdateMethods("updateOne"));
      this._wrap(moduleExports.Model.prototype, "deleteOne", this._patchDocumentUpdateMethods("deleteOne"));
    }
    this._wrap(moduleExports.Query.prototype, "exec", this.patchQueryExec());
    this._wrap(moduleExports.Aggregate.prototype, "exec", this.patchAggregateExec());
    const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
    contextCaptureFunctions.forEach((funcName) => {
      this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
    });
    this._wrap(moduleExports.Model, "aggregate", this.patchModelAggregate());
    this._wrap(moduleExports.Model, "insertMany", this.patchModelStatic("insertMany"));
    this._wrap(moduleExports.Model, "bulkWrite", this.patchModelStatic("bulkWrite"));
    return moduleExports;
  }
  unpatch(module, moduleVersion) {
    const moduleExports = module[Symbol.toStringTag] === "Module" && module.default ? module.default : module;
    const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
    this._unwrap(moduleExports.Model.prototype, "save");
    moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
    if (instrumentRemove(moduleVersion)) {
      this._unwrap(moduleExports.Model.prototype, "remove");
    }
    if (needsDocumentMethodPatch(moduleVersion)) {
      this._unwrap(moduleExports.Model.prototype, "updateOne");
      this._unwrap(moduleExports.Model.prototype, "deleteOne");
    }
    this._unwrap(moduleExports.Query.prototype, "exec");
    this._unwrap(moduleExports.Aggregate.prototype, "exec");
    contextCaptureFunctions.forEach((funcName) => {
      this._unwrap(moduleExports.Query.prototype, funcName);
    });
    this._unwrap(moduleExports.Model, "aggregate");
    this._unwrap(moduleExports.Model, "insertMany");
    this._unwrap(moduleExports.Model, "bulkWrite");
  }
  patchAggregateExec() {
    const self = this;
    return (originalAggregate) => {
      return functi
```

---

# COMANDO - mongoose.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\orchestrion\config\mongoose.js
**SHA:** 2a7433d4e0a9b00e
**Timestamp:** 2026-08-28T02:23:29.108923
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate"

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const subscribeInjection = require('./subscribe-injection.js');

const module$1 = { name: "mongoose", versionRange: ">=5.9.7 <9.7.0" };
const CONTEXT_CAPTURE_QUERY_METHODS = [
  "find",
  "findOne",
  "deleteOne",
  "deleteMany",
  "estimatedDocumentCount",
  "countDocuments",
  "distinct",
  "where",
  "$where",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace",
  // 5/6/7 only (removed in 8), inert in recent versions
  "remove",
  "count",
  "findOneAndRemove"
];
const mongooseConfig = [
  // Query execution
  // the span for most read/write operations. `op`, collection and model are
  // read off the `Query` at exec time.
  {
    channelName: "query_exec",
    module: { ...module$1, filePath: "lib/query.js" },
    functionQuery: { expressionName: "exec", kind: "Auto" }
  },
  // Aggregation pipeline execution.
  {
    channelName: "aggregate_exec",
    module: { ...module$1, filePath: "lib/aggregate.js" },
    functionQuery: { expressionName: "exec", kind: "Auto" }
  },
  // `doc.save()` (and its `$save` alias, which mongoose points at `save` on
  // require. the alias picks up the transformed body automatically, so no
  // separate entry is needed).
  {
    channelName: "model_save",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "save", kind: "Auto" }
  },
  // Static batch operations.
  {
    channelName: "model_insert_many",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "insertMany", kind: "Auto" }
  },
  {
    channelName: "model_bulk_write",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "bulkWrite", kind: "Auto" }
  },
  // `doc.remove()` (a document method, deprecated in 6 and removed in 7)
  // `expressionName: 'remove'` also matches the sibling `Model.remove`
  // *static* in this file, which no matcher can tell apart from the prototype
  // method; that static is deprecated and would just produce a redundant span
  // so the collision is accepted rather than dropping the doc-method span.
  {
    channelName: "model_remove",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "remove", kind: "Auto" }
  },
  // NOTE: document `updateOne`/`deleteOne` (mongoose 8.21+) are deliberately
  // NOT hooked here. The vendored OTel/IITM patcher wraps
  // `Model.prototype.updateOne`/`deleteOne`, but those delegate to
  // `Query.exec`, which the `query_exec` channel above already instruments
  // (its `this.op` is the right operation). Verified by the `mongoose-v8`
  // suite against a real mongoose 8.21+ under orchestrion. A dedicated hook
  // is also not possible cleanly: `expressionName: 'updateOne'` in
  // `lib/model.js` can't be told apart from the same-named `Model.updateOne`
  // *static* (the common query-builder form), so hooking it would double-span
  // every `Model.updateOne(...)` call.
  //
  // `Model.aggregate()` builds an `Aggregate` with no method to hook for
  // context capture, so hook the static itself and stash the active span
  // on the returned aggregate. `Sync`: it returns the aggregate.
  {
    channelName: "model_aggregate",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "aggregate", kind: "Sync" }
  },
  ...CONTEXT_CAPTURE_QUERY_METHODS.map((methodName) => ({
    channelName: `ctx_${methodName}`,
    module: { ...module$1, filePath: "lib/query.js" },
    functionQuery: { expressionName: methodName, kind: "Sync" }
  }))
];
const mongooseChannels = {
  MONGOOSE_QUERY_EXEC: "orchestrion:mongoose:query_exec",
  MONGOOSE_AGGREGATE_EXEC: "orchestrion:mongoose:aggregate_exec",
  MONGOOSE_MODEL_SAVE: "orchestrion:mongoose:model_save",
  MONGOOSE_MODEL_INSERT_MANY: "orchestrion:mongoose:model_insert_many",
  MONGOOSE_MODEL_BULK_WRITE: "orchestrion:mongoose:model_bulk_write",
  MONGOOSE_MODEL_REMOVE: "orchestrion:mongoose:model_remove",
  MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate"
};
const MONGOOSE_CONTEXT_CAPTURE_CHANNELS = CONTEXT_CAPTURE_QUERY_METHODS.map(
  (methodName) => `orchestrion:mongoose:ctx_${methodName}`
);
const mongooseSubscribeInjection = subscribeInjection.toSubscribeInjections(mongooseConfig);

exports.MONGOOSE_CONTEXT_CAPTURE_CHANNELS = MONGOOSE_CONTEXT_CAPTURE_CHANNELS;
exports.mongooseChannels = mongooseChannels;
exports.mongooseConfig = mongooseConfig;
exports.mongooseSubscribeInjection = mongooseSubscribeInjection;
//# sourceMappingURL=mongoose.js.map

```

---

# COMANDO - mongoose.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\orchestrion\config\mongoose.js
**SHA:** 1a50ebb188b55d06
**Timestamp:** 2026-08-28T02:23:36.837250
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate"

### Ouro Bruto (primeiros 5000 chars)
```
import { toSubscribeInjections } from './subscribe-injection.js';

const module$1 = { name: "mongoose", versionRange: ">=5.9.7 <9.7.0" };
const CONTEXT_CAPTURE_QUERY_METHODS = [
  "find",
  "findOne",
  "deleteOne",
  "deleteMany",
  "estimatedDocumentCount",
  "countDocuments",
  "distinct",
  "where",
  "$where",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace",
  // 5/6/7 only (removed in 8), inert in recent versions
  "remove",
  "count",
  "findOneAndRemove"
];
const mongooseConfig = [
  // Query execution
  // the span for most read/write operations. `op`, collection and model are
  // read off the `Query` at exec time.
  {
    channelName: "query_exec",
    module: { ...module$1, filePath: "lib/query.js" },
    functionQuery: { expressionName: "exec", kind: "Auto" }
  },
  // Aggregation pipeline execution.
  {
    channelName: "aggregate_exec",
    module: { ...module$1, filePath: "lib/aggregate.js" },
    functionQuery: { expressionName: "exec", kind: "Auto" }
  },
  // `doc.save()` (and its `$save` alias, which mongoose points at `save` on
  // require. the alias picks up the transformed body automatically, so no
  // separate entry is needed).
  {
    channelName: "model_save",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "save", kind: "Auto" }
  },
  // Static batch operations.
  {
    channelName: "model_insert_many",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "insertMany", kind: "Auto" }
  },
  {
    channelName: "model_bulk_write",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "bulkWrite", kind: "Auto" }
  },
  // `doc.remove()` (a document method, deprecated in 6 and removed in 7)
  // `expressionName: 'remove'` also matches the sibling `Model.remove`
  // *static* in this file, which no matcher can tell apart from the prototype
  // method; that static is deprecated and would just produce a redundant span
  // so the collision is accepted rather than dropping the doc-method span.
  {
    channelName: "model_remove",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "remove", kind: "Auto" }
  },
  // NOTE: document `updateOne`/`deleteOne` (mongoose 8.21+) are deliberately
  // NOT hooked here. The vendored OTel/IITM patcher wraps
  // `Model.prototype.updateOne`/`deleteOne`, but those delegate to
  // `Query.exec`, which the `query_exec` channel above already instruments
  // (its `this.op` is the right operation). Verified by the `mongoose-v8`
  // suite against a real mongoose 8.21+ under orchestrion. A dedicated hook
  // is also not possible cleanly: `expressionName: 'updateOne'` in
  // `lib/model.js` can't be told apart from the same-named `Model.updateOne`
  // *static* (the common query-builder form), so hooking it would double-span
  // every `Model.updateOne(...)` call.
  //
  // `Model.aggregate()` builds an `Aggregate` with no method to hook for
  // context capture, so hook the static itself and stash the active span
  // on the returned aggregate. `Sync`: it returns the aggregate.
  {
    channelName: "model_aggregate",
    module: { ...module$1, filePath: "lib/model.js" },
    functionQuery: { expressionName: "aggregate", kind: "Sync" }
  },
  ...CONTEXT_CAPTURE_QUERY_METHODS.map((methodName) => ({
    channelName: `ctx_${methodName}`,
    module: { ...module$1, filePath: "lib/query.js" },
    functionQuery: { expressionName: methodName, kind: "Sync" }
  }))
];
const mongooseChannels = {
  MONGOOSE_QUERY_EXEC: "orchestrion:mongoose:query_exec",
  MONGOOSE_AGGREGATE_EXEC: "orchestrion:mongoose:aggregate_exec",
  MONGOOSE_MODEL_SAVE: "orchestrion:mongoose:model_save",
  MONGOOSE_MODEL_INSERT_MANY: "orchestrion:mongoose:model_insert_many",
  MONGOOSE_MODEL_BULK_WRITE: "orchestrion:mongoose:model_bulk_write",
  MONGOOSE_MODEL_REMOVE: "orchestrion:mongoose:model_remove",
  MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate"
};
const MONGOOSE_CONTEXT_CAPTURE_CHANNELS = CONTEXT_CAPTURE_QUERY_METHODS.map(
  (methodName) => `orchestrion:mongoose:ctx_${methodName}`
);
const mongooseSubscribeInjection = toSubscribeInjections(mongooseConfig);

export { MONGOOSE_CONTEXT_CAPTURE_CHANNELS, mongooseChannels, mongooseConfig, mongooseSubscribeInjection };
//# sourceMappingURL=mongoose.js.map

```