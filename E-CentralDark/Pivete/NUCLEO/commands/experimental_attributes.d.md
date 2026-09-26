# COMANDO - experimental_attributes.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\esm\experimental_attributes.d.ts
**SHA:** 4755d51a9a47fcc9
**Timestamp:** 2026-08-28T02:21:41.889249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare const CICD_PIPELINE_ACTION_NAME_VALUE_RUN: "RUN";
- export declare const CLOUD_PLATFORM_VALUE_GCP_CLOUD_RUN: "gcp_cloud_run";
- export declare const DB_COSMOSDB_OPERATION_TYPE_VALUE_EXECUTE: "execute";
- export declare const ATTR_FAAS_COLDSTART: "faas.coldstart";
- export declare const ATTR_GEN_AI_PROMPT: "gen_ai.prompt";
- export declare const K8S_CONTAINER_STATUS_REASON_VALUE_CONTAINER_CANNOT_RUN: "ContainerCannotRun";

### Contratos
- export declare const AWS_ECS_LAUNCHTYPE_VALUE_FARGATE: "fargate";

### Gaps
- export declare const ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_PASSWORD_MISSING: "password_missing";
- export declare const ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_USER_MISSING: "user_missing";

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * This attribute represents the state of the application.
 *
 * @example created
 *
 * @note The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lifecycle-callbacks), and from which the `OS identifiers` are derived.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ATTR_ANDROID_APP_STATE: "android.app.state";
/**
 * Enum value "background" for attribute {@link ATTR_ANDROID_APP_STATE}.
 *
 * Any time after Activity.onPause() or, if the app has no Activity, Context.stopService() has been called when the app was in the foreground state.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ANDROID_APP_STATE_VALUE_BACKGROUND: "background";
/**
 * Enum value "created" for attribute {@link ATTR_ANDROID_APP_STATE}.
 *
 * Any time before Activity.onResume() or, if the app has no Activity, Context.startService() has been called in the app for the first time.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ANDROID_APP_STATE_VALUE_CREATED: "created";
/**
 * Enum value "foreground" for attribute {@link ATTR_ANDROID_APP_STATE}.
 *
 * Any time after Activity.onResume() or, if the app has no Activity, Context.startService() has been called when the app was in either the created or background states.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ANDROID_APP_STATE_VALUE_FOREGROUND: "foreground";
/**
 * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found in the [Android API levels documentation](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
 *
 * @example 33
 * @example 32
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ATTR_ANDROID_OS_API_LEVEL: "android.os.api_level";
/**
 * Deprecated. Use `android.app.state` attribute instead.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `android.app.state`.
 */
export declare const ATTR_ANDROID_STATE: "android.state";
/**
 * Enum value "background" for attribute {@link ATTR_ANDROID_STATE}.
 *
 * Any time after Activity.onPause() or, if the app has no Activity, Context.stopService() has been called when the app was in the foreground state.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ANDROID_STATE_VALUE_BACKGROUND: "background";
/**
 * Enum value "created" for attribute {@link ATTR_ANDROID_STATE}.
 *
 * Any time before Activity.onResume() or, if the app has no Activity, Context.startService() has been called in the app for the first time.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ANDROID_STATE_VALUE_CREATED: "created";
/**
 * Enum value "foreground" for attribute {@link ATTR_ANDROID_STATE}.
 *
 * Any time after Activity.onResume() or, if the app has no Activity, Context.startService() has been called when the app was in either the created or background states.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ANDROID_STATE_VALUE_FOREGROUND: "foreground";
/**
 * Unique identifier for a particular build or compilation of the application.
 *
 * @example 6cff0a7e-cefc-4668-96f5-1273d8b334d0
 * @example 9f2b833506aa6973a92fde9733e6271f
 * @example my-app-1.0.0-code-123
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export declare const ATTR_APP_BUILD_ID: "app.build_id";
/**
 * A unique identifier representing an instance of an end-user facing app crash.
 *
 * @example 083d3d2d-9a0e-47f8-be3d-bc3c5538ba38
 *
 * @note Its value **MAY** be meaningful and be used as a reference for telemetry and metadata recorded by
 * the same instrumentation (e.g. it is an ID generated by an external source that captured the crash).
 * It **MAY** come from a source external to the instrumentation such that it can be used to look up additional
 * data from other sources as well as 
```