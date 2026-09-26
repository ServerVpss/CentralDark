# COMANDO - experimental_attributes.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\esm\experimental_attributes.js
**SHA:** f54ca8e687211581
**Timestamp:** 2026-08-28T02:21:41.987419
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export const CICD_PIPELINE_ACTION_NAME_VALUE_RUN = "RUN";
- export const CLOUD_PLATFORM_VALUE_GCP_CLOUD_RUN = "gcp_cloud_run";
- export const DB_COSMOSDB_OPERATION_TYPE_VALUE_EXECUTE = "execute";
- export const ATTR_FAAS_COLDSTART = 'faas.coldstart';
- export const ATTR_GEN_AI_PROMPT = 'gen_ai.prompt';
- export const K8S_CONTAINER_STATUS_REASON_VALUE_CONTAINER_CANNOT_RUN = "ContainerCannotRun";

### Contratos
- export const AWS_ECS_LAUNCHTYPE_VALUE_FARGATE = "fargate";

### Gaps
- export const ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_PASSWORD_MISSING = "password_missing";
- export const ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_USER_MISSING = "user_missing";

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
//----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/registry/stable/attributes.ts.j2
//----------------------------------------------------------------------------------------------------------
/**
 * This attribute represents the state of the application.
 *
 * @example created
 *
 * @note The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lifecycle-callbacks), and from which the `OS identifiers` are derived.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_APP_STATE = 'android.app.state';
/**
 * Enum value "background" for attribute {@link ATTR_ANDROID_APP_STATE}.
 *
 * Any time after Activity.onPause() or, if the app has no Activity, Context.stopService() has been called when the app was in the foreground state.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_APP_STATE_VALUE_BACKGROUND = "background";
/**
 * Enum value "created" for attribute {@link ATTR_ANDROID_APP_STATE}.
 *
 * Any time before Activity.onResume() or, if the app has no Activity, Context.startService() has been called in the app for the first time.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_APP_STATE_VALUE_CREATED = "created";
/**
 * Enum value "foreground" for attribute {@link ATTR_ANDROID_APP_STATE}.
 *
 * Any time after Activity.onResume() or, if the app has no Activity, Context.startService() has been called when the app was in either the created or background states.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_APP_STATE_VALUE_FOREGROUND = "foreground";
/**
 * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found in the [Android API levels documentation](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
 *
 * @example 33
 * @example 32
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_OS_API_LEVEL = 'android.os.api_level';
/**
 * Deprecated. Use `android.app.state` attribute instead.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `android.app.state`.
 */
export const ATTR_ANDROID_STATE = 'android.state';
/**
 * Enum value "background" for attribute {@link ATTR_ANDROID_STATE}.
 *
 * Any time after Activity.onPause() or, if the app has no Activity, Context.stopService() has been called when the app was in the foreground state.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_STATE_VALUE_BACKGROUND = "background";
/**
 * Enum value "created" for attribute {@link ATTR_ANDROID_STATE}.
 *
 * Any time before Activity.onResume() or, if the app has no Activity, Context.startService() has been called in the app for the first time.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_STATE_VALUE_CREATED = "created";
/**
 * Enum value "foreground" for attribute {@link ATTR_ANDROID_STATE}.
 *
 * Any time after Activity.onResume() or, if the app has no Activity, Context.startService() has been called when the app was in either the created or background states.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_STATE_VALUE_FOREGROUND = "foreground";
/**
 * Unique identifier for a particular build or compilation of the application.
 *
 * @example 6cff0a7e-cefc-4668-96f5-1273d8b334d0
 * @example 9f2b833506aa6973a92fde9733e6271f
 * @example my-app-1.0.0-code-123
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_APP_BUILD_ID = 'app.build_id';
/**
 * A unique identifier representing an instance of an end-user facing app crash.
 *
 * @example 083d3d2d-9a0e-47f8-be3d-bc3c5538ba38
 *
 * @note Its valu
```

---

# COMANDO - experimental_attributes.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\src\experimental_attributes.js
**SHA:** 18e9b78725c08761
**Timestamp:** 2026-08-28T02:21:45.989248
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- exports.CLOUD_PLATFORM_VALUE_AWS_APP_RUNNER = exports.CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_OPENSHIFT = exports.CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_FC = exports.CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_ECS = ex
- exports.ATTR_CLOUDFOUNDRY_APP_INSTANCE_ID = exports.ATTR_CLOUDFOUNDRY_APP_ID = exports.ATTR_CLOUDEVENTS_EVENT_TYPE = exports.ATTR_CLOUDEVENTS_EVENT_SUBJECT = exports.ATTR_CLOUDEVENTS_EVENT_SPEC_VERSIO
- exports.ATTR_DB_COSMOSDB_REGIONS_CONTACTED = exports.DB_COSMOSDB_OPERATION_TYPE_VALUE_UPSERT = exports.DB_COSMOSDB_OPERATION_TYPE_VALUE_REPLACE = exports.DB_COSMOSDB_OPERATION_TYPE_VALUE_READ_FEED = e
- exports.FAAS_INVOKED_PROVIDER_VALUE_ALIBABA_CLOUD = exports.ATTR_FAAS_INVOKED_PROVIDER = exports.ATTR_FAAS_INVOKED_NAME = exports.ATTR_FAAS_INVOCATION_ID = exports.ATTR_FAAS_INSTANCE = exports.ATTR_FA
- exports.ATTR_GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK = exports.ATTR_GEN_AI_RESPONSE_MODEL = exports.ATTR_GEN_AI_RESPONSE_ID = exports.ATTR_GEN_AI_RESPONSE_FINISH_REASONS = exports.ATTR_GEN_AI_REQUEST_TOP_
- exports.ATTR_K8S_PERSISTENTVOLUME_NAME = exports.ATTR_K8S_PERSISTENTVOLUME_LABEL = exports.ATTR_K8S_PERSISTENTVOLUME_ANNOTATION = exports.ATTR_K8S_NODE_SYSTEM_CONTAINER_NAME = exports.K8S_NODE_CONDITI
- exports.CICD_PIPELINE_ACTION_NAME_VALUE_RUN = "RUN";
- exports.CLOUD_PLATFORM_VALUE_GCP_CLOUD_RUN = "gcp_cloud_run";
- exports.DB_COSMOSDB_OPERATION_TYPE_VALUE_EXECUTE = "execute";
- exports.ATTR_FAAS_COLDSTART = 'faas.coldstart';

### Contratos
- exports.ATTR_AWS_REQUEST_ID = exports.ATTR_AWS_LOG_STREAM_NAMES = exports.ATTR_AWS_LOG_STREAM_ARNS = exports.ATTR_AWS_LOG_GROUP_NAMES = exports.ATTR_AWS_LOG_GROUP_ARNS = exports.ATTR_AWS_LAMBDA_RESOUR
- exports.AWS_ECS_LAUNCHTYPE_VALUE_FARGATE = "fargate";

### Gaps
- exports.ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_LOCKED_OUT = exports.ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_FAILURE = exports.ATTR_ASPNETCORE_IDENTITY_SIGN_IN_RESULT = exports.ASPNETCORE_IDENTITY_R
- exports.ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_PASSWORD_MISSING = "password_missing";
- exports.ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_USER_MISSING = "user_missing";

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_LOCKED_OUT = exports.ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_FAILURE = exports.ATTR_ASPNETCORE_IDENTITY_SIGN_IN_RESULT = exports.ASPNETCORE_IDENTITY_RESULT_VALUE_SUCCESS = exports.ASPNETCORE_IDENTITY_RESULT_VALUE_FAILURE = exports.ATTR_ASPNETCORE_IDENTITY_RESULT = exports.ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_USER_MISSING = exports.ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_SUCCESS_REHASH_NEEDED = exports.ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_SUCCESS = exports.ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_PASSWORD_MISSING = exports.ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_FAILURE = exports.ATTR_ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT = exports.ATTR_ASPNETCORE_IDENTITY_ERROR_CODE = exports.ASPNETCORE_AUTHORIZATION_RESULT_VALUE_SUCCESS = exports.ASPNETCORE_AUTHORIZATION_RESULT_VALUE_FAILURE = exports.ATTR_ASPNETCORE_AUTHORIZATION_RESULT = exports.ATTR_ASPNETCORE_AUTHORIZATION_POLICY = exports.ATTR_ASPNETCORE_AUTHENTICATION_SCHEME = exports.ASPNETCORE_AUTHENTICATION_RESULT_VALUE_SUCCESS = exports.ASPNETCORE_AUTHENTICATION_RESULT_VALUE_NONE = exports.ASPNETCORE_AUTHENTICATION_RESULT_VALUE_FAILURE = exports.ATTR_ASPNETCORE_AUTHENTICATION_RESULT = exports.ATTR_ARTIFACT_VERSION = exports.ATTR_ARTIFACT_PURL = exports.ATTR_ARTIFACT_HASH = exports.ATTR_ARTIFACT_FILENAME = exports.ATTR_ARTIFACT_ATTESTATION_ID = exports.ATTR_ARTIFACT_ATTESTATION_HASH = exports.ATTR_ARTIFACT_ATTESTATION_FILENAME = exports.ATTR_APP_WIDGET_NAME = exports.ATTR_APP_WIDGET_ID = exports.ATTR_APP_SCREEN_NAME = exports.ATTR_APP_SCREEN_ID = exports.ATTR_APP_SCREEN_COORDINATE_Y = exports.ATTR_APP_SCREEN_COORDINATE_X = exports.ATTR_APP_JANK_THRESHOLD = exports.ATTR_APP_JANK_PERIOD = exports.ATTR_APP_JANK_FRAME_COUNT = exports.ATTR_APP_INSTALLATION_ID = exports.ATTR_APP_CRASH_ID = exports.ATTR_APP_BUILD_ID = exports.ANDROID_STATE_VALUE_FOREGROUND = exports.ANDROID_STATE_VALUE_CREATED = exports.ANDROID_STATE_VALUE_BACKGROUND = exports.ATTR_ANDROID_STATE = exports.ATTR_ANDROID_OS_API_LEVEL = exports.ANDROID_APP_STATE_VALUE_FOREGROUND = exports.ANDROID_APP_STATE_VALUE_CREATED = exports.ANDROID_APP_STATE_VALUE_BACKGROUND = exports.ATTR_ANDROID_APP_STATE = void 0;
exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_PASSKEY = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_LOCKOUT_END_DATE = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_LOCKOUT_ENABLED = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_EMAIL = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_AUTHENTICATION_TOKEN = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SECURITY_STAMP = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_RESET_PASSWORD = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_RESET_AUTHENTICATOR_KEY = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_RESET_ACCESS_FAILED_COUNT = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REPLACE_CLAIM = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_PASSWORD = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_PASSKEY = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_LOGIN = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_FROM_ROLES = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_CLAIMS = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_AUTHENTICATION_TOKEN = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REDEEM_TWO_FACTOR_RECOVERY_CODE = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_PASSWORD_REHASH = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_GENERATE_NEW_TWO_FACTOR_RECOVERY_CODES = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CONFIRM_EMAIL = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CHANGE_PHONE_NUMBER = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CHANGE_PASSWORD = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CHANGE_EMAIL = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_TO_ROLES = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_PASSWORD = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_LOGIN = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_CLAIMS = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ACCESS_FAILED = exports.ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_OTHER = exports.ATTR_ASPNETCORE_IDENTITY_USER_UPDATE_TYPE = exports.ASPNETCORE_IDENTITY_TOKEN_VERIFIED_VALUE_SUCCESS = exports.ASPNETCORE_IDENTITY_TOKEN_VERIFIED_VALUE_FAILURE = exports.ATTR_ASPNETCORE_IDENTITY_TOKEN_VERIFIED = exports.ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_TWO_FACTOR = exports.ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_RESET_PASSWORD = exports.ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_EMAIL_CONFIRMATION = exports.ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_CHANGE_PHONE_NUMBER = exports.ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_CHANGE_EMAIL = exports.
```