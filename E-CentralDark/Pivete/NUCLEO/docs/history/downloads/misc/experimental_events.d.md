# OUTRO - experimental_events.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\esm\experimental_events.d.ts
**SHA:** 3b48f6249195e9c2
**Timestamp:** 2026-08-28T02:21:42.420863
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare const EVENT_SESSION_START: "session.start";

### Ouro Bruto (primeiros 5000 chars)
```
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
export declare const EVENT_APP_CRASH: "app.crash";
/**
 * This event indicates that the application has detected substandard UI rendering performance.
 *
 * @note Jank happens when the UI is rendered slowly enough for the user to experience some disruption or sluggishness.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const EVENT_APP_JANK: "app.jank";
/**
 * This event represents an instantaneous click on the screen of an application.
 *
 * @note The `app.screen.click` event can be used to indicate that a user has clicked or tapped on the screen portion of an application. Clicks outside of an application's active area **SHOULD NOT** generate this event. This event does not differentiate between touch/mouse down and touch/mouse up. Implementations **SHOULD** give preference to generating this event at the time the click is complete, typically on touch release or mouse up. The location of the click event **MUST** be provided in absolute screen pixels.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const EVENT_APP_SCREEN_CLICK: "app.screen.click";
/**
 * This event indicates that an application widget has been clicked.
 *
 * @note Use this event to indicate that visual application component has been clicked, typically through a user's manual interaction.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const EVENT_APP_WIDGET_CLICK: "app.widget.click";
/**
 * Deprecated. Use `azure.resource.log` instead.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `azure.resource.log`.
 */
export declare const EVENT_AZ_RESOURCE_LOG: "az.resource.log";
/**
 * Describes Azure Resource Log event, see [Azure Resource Log Top-level Schema](https://learn.microsoft.com/azure/azure-monitor/essentials/resource-logs-schema#top-level-common-schema) for more details.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const EVENT_AZURE_RESOURCE_LOG: "azure.resource.log";
/**
 * This event describes the website performance metrics introduced by Google, See [web vitals](https://web.dev/vitals).
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const EVENT_BROWSER_WEB_VITAL: "browser.web_vital";
/**
 * This event represents an exception that occurred during a database client operation, such as connection failures, query errors, timeouts, or other errors that prevent the operation from completing successfully.
 *
 * @note This event **SHOULD** be recorded when an exception occurs during database client operations.
 * Instrumentations **SHOULD** set the severity to WARN (severity number 13) when recording this event.
 * Instrumentations **MAY** provide a configuration option to populate exception events with the attributes captured on the corresponding database client span.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const EVENT_DB_CLIENT_OPERATION_EXCEPTION: "db.client.operation.exception";
/**
 * This event represents an occurrence of a lifecycle transition on Android or iOS platform.
 *
 * @note The event body fields **MUST** be used to describe the state of the application at the time of the 
```