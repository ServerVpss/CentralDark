# OUTRO - experimental_events.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\esm\experimental_events.js
**SHA:** 85ac652690f99ad9
**Timestamp:** 2026-08-28T02:21:42.408844
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export const EVENT_SESSION_START = 'session.start';

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
//-----------------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/registry/ts-experimental/events.ts.j2
//-----------------------------------------------------------------------------------------------------------------
/**
 * This event represents a termination of a user-facing application due to
 * unrecoverable programming errors such as exceptions or signals that
 * indicate an error has happened at a lower level.
 *
 * @note Crash events can be produced asynchronously by an OTel SDK instance that is
 * not running in the application instance in which the crash happened. For
 * example, the instrumentation may report crashes from previous app instances
 * based on information found in tombstones on disk.
 * If the reporter of the crash is not the crashing application instance itself,
 * relevant resource attributes that identify the application instance that
 * crashed **MUST** be provided as event attributes so that the corresponding
 * attributes from the reporter's resource aren't used instead.
 * How the instrumentation will determine whether an instance of a crash has
 * already been reported and how the necessary data will be retrieved is left up
 * to the instrumentation. Providing enough data to dedupe is NOT **REQUIRED**.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_APP_CRASH = 'app.crash';
/**
 * This event indicates that the application has detected substandard UI rendering performance.
 *
 * @note Jank happens when the UI is rendered slowly enough for the user to experience some disruption or sluggishness.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_APP_JANK = 'app.jank';
/**
 * This event represents an instantaneous click on the screen of an application.
 *
 * @note The `app.screen.click` event can be used to indicate that a user has clicked or tapped on the screen portion of an application. Clicks outside of an application's active area **SHOULD NOT** generate this event. This event does not differentiate between touch/mouse down and touch/mouse up. Implementations **SHOULD** give preference to generating this event at the time the click is complete, typically on touch release or mouse up. The location of the click event **MUST** be provided in absolute screen pixels.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_APP_SCREEN_CLICK = 'app.screen.click';
/**
 * This event indicates that an application widget has been clicked.
 *
 * @note Use this event to indicate that visual application component has been clicked, typically through a user's manual interaction.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_APP_WIDGET_CLICK = 'app.widget.click';
/**
 * Deprecated. Use `azure.resource.log` instead.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `azure.resource.log`.
 */
export const EVENT_AZ_RESOURCE_LOG = 'az.resource.log';
/**
 * Describes Azure Resource Log event, see [Azure Resource Log Top-level Schema](https://learn.microsoft.com/azure/azure-monitor/essentials/resource-logs-schema#top-level-common-schema) for more details.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_AZURE_RESOURCE_LOG = 'azure.resource.log';
/**
 * This event describes the website performance metrics introduced by Google, See [web vitals](https://web.dev/vitals).
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_BROWSER_WEB_VITAL = 'browser.web_vital';
/**
 * This event represents an exception that occurred during a database client operation, such as connection failures, query errors, timeouts, or other errors that prevent the operation from completing successfully.
 *
 * @note This event **SHOULD** be recorded when an exception occurs during database client operations.
 * Instrumentations **SHOULD** set the severity to WARN (severity number 13) when recording this event.
 * Instrumentations **MAY** provide a configuration option to populate exception events with the attributes captured on the corresponding database client span.
 *
 * @experimental This event is experimental and is subject
```

---

# OUTRO - experimental_events.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\src\experimental_events.js
**SHA:** 90864ba2a738fd73
**Timestamp:** 2026-08-28T02:21:46.864808
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- exports.EVENT_SESSION_START = exports.EVENT_SESSION_END = exports.EVENT_RPC_SERVER_CALL_EXCEPTION = exports.EVENT_RPC_MESSAGE = exports.EVENT_RPC_CLIENT_CALL_EXCEPTION = exports.EVENT_MESSAGING_SETTLE
- exports.EVENT_SESSION_START = 'session.start';

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_SESSION_START = exports.EVENT_SESSION_END = exports.EVENT_RPC_SERVER_CALL_EXCEPTION = exports.EVENT_RPC_MESSAGE = exports.EVENT_RPC_CLIENT_CALL_EXCEPTION = exports.EVENT_MESSAGING_SETTLE_EXCEPTION = exports.EVENT_MESSAGING_SEND_EXCEPTION = exports.EVENT_MESSAGING_RECEIVE_EXCEPTION = exports.EVENT_MESSAGING_PROCESS_EXCEPTION = exports.EVENT_MESSAGING_CREATE_EXCEPTION = exports.EVENT_HTTP_SERVER_REQUEST_EXCEPTION = exports.EVENT_HTTP_CLIENT_REQUEST_EXCEPTION = exports.EVENT_GEN_AI_USER_MESSAGE = exports.EVENT_GEN_AI_TOOL_MESSAGE = exports.EVENT_GEN_AI_SYSTEM_MESSAGE = exports.EVENT_GEN_AI_EVALUATION_RESULT = exports.EVENT_GEN_AI_CLIENT_OPERATION_EXCEPTION = exports.EVENT_GEN_AI_CLIENT_INFERENCE_OPERATION_DETAILS = exports.EVENT_GEN_AI_CHOICE = exports.EVENT_GEN_AI_ASSISTANT_MESSAGE = exports.EVENT_FEATURE_FLAG_EVALUATION = exports.EVENT_FAAS_INVOCATION_EXCEPTION = exports.EVENT_DEVICE_APP_LIFECYCLE = exports.EVENT_DB_CLIENT_OPERATION_EXCEPTION = exports.EVENT_BROWSER_WEB_VITAL = exports.EVENT_AZURE_RESOURCE_LOG = exports.EVENT_AZ_RESOURCE_LOG = exports.EVENT_APP_WIDGET_CLICK = exports.EVENT_APP_SCREEN_CLICK = exports.EVENT_APP_JANK = exports.EVENT_APP_CRASH = void 0;
//-----------------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/registry/ts-experimental/events.ts.j2
//-----------------------------------------------------------------------------------------------------------------
/**
 * This event represents a termination of a user-facing application due to
 * unrecoverable programming errors such as exceptions or signals that
 * indicate an error has happened at a lower level.
 *
 * @note Crash events can be produced asynchronously by an OTel SDK instance that is
 * not running in the application instance in which the crash happened. For
 * example, the instrumentation may report crashes from previous app instances
 * based on information found in tombstones on disk.
 * If the reporter of the crash is not the crashing application instance itself,
 * relevant resource attributes that identify the application instance that
 * crashed **MUST** be provided as event attributes so that the corresponding
 * attributes from the reporter's resource aren't used instead.
 * How the instrumentation will determine whether an instance of a crash has
 * already been reported and how the necessary data will be retrieved is left up
 * to the instrumentation. Providing enough data to dedupe is NOT **REQUIRED**.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
exports.EVENT_APP_CRASH = 'app.crash';
/**
 * This event indicates that the application has detected substandard UI rendering performance.
 *
 * @note Jank happens when the UI is rendered slowly enough for the user to experience some disruption or sluggishness.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
exports.EVENT_APP_JANK = 'app.jank';
/**
 * This event represents an instantaneous click on the screen of an application.
 *
 * @note The `app.screen.click` event can be used to indicate that a user has clicked or tapped on the screen portion of an application. Clicks outside of an application's active area **SHOULD NOT** generate this event. This event does not differentiate between touch/mouse down and touch/mouse up. Implementations **SHOULD** give preference to generating this event at the time the click is complete, typically on touch release or mouse up. The location of the click event **MUST** be provided in absolute screen pixels.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
exports.EVENT_APP_SCREEN_CLICK = 'app.screen.click';
/**
 * This event indicates that an application widget has been clicked.
 *
 * @note Use this event to indicate that visual application component has been clicked, typically through a user's manual interaction.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
exports.EVENT_APP_WIDGET_CLICK = 'app.widget.click';
/**
 * Deprecated. Use `azure.resource.log` instead.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `azure.resource.log`.
 */
exports.EVENT_AZ_RESOURCE_LOG = 'az.resource.log';
/**
 * Describes Azure Resource Log event, see [Azure Resource Log Top-level Schema](https://learn.microsoft.com/azure/azure-monitor/essentials/r
```