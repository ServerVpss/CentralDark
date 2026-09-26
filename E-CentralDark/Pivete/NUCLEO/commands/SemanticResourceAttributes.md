# COMANDO - SemanticResourceAttributes.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\esm\resource\SemanticResourceAttributes.js
**SHA:** afac47ab04f17b38
**Timestamp:** 2026-08-28T02:21:43.004653
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
- const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = 'gcp_cloud_run';
- export const CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN;

### Contratos
- const TMP_AWSECSLAUNCHTYPEVALUES_FARGATE = 'fargate';
- export const AWSECSLAUNCHTYPEVALUES_FARGATE = TMP_AWSECSLAUNCHTYPEVALUES_FARGATE;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { createConstMap } from '../internal/utils';
//----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
// Constant values for SemanticResourceAttributes
//----------------------------------------------------------------------------------------------------------
// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_CLOUD_PROVIDER = 'cloud.provider';
const TMP_CLOUD_ACCOUNT_ID = 'cloud.account.id';
const TMP_CLOUD_REGION = 'cloud.region';
const TMP_CLOUD_AVAILABILITY_ZONE = 'cloud.availability_zone';
const TMP_CLOUD_PLATFORM = 'cloud.platform';
const TMP_AWS_ECS_CONTAINER_ARN = 'aws.ecs.container.arn';
const TMP_AWS_ECS_CLUSTER_ARN = 'aws.ecs.cluster.arn';
const TMP_AWS_ECS_LAUNCHTYPE = 'aws.ecs.launchtype';
const TMP_AWS_ECS_TASK_ARN = 'aws.ecs.task.arn';
const TMP_AWS_ECS_TASK_FAMILY = 'aws.ecs.task.family';
const TMP_AWS_ECS_TASK_REVISION = 'aws.ecs.task.revision';
const TMP_AWS_EKS_CLUSTER_ARN = 'aws.eks.cluster.arn';
const TMP_AWS_LOG_GROUP_NAMES = 'aws.log.group.names';
const TMP_AWS_LOG_GROUP_ARNS = 'aws.log.group.arns';
const TMP_AWS_LOG_STREAM_NAMES = 'aws.log.stream.names';
const TMP_AWS_LOG_STREAM_ARNS = 'aws.log.stream.arns';
const TMP_CONTAINER_NAME = 'container.name';
const TMP_CONTAINER_ID = 'container.id';
const TMP_CONTAINER_RUNTIME = 'container.runtime';
const TMP_CONTAINER_IMAGE_NAME = 'container.image.name';
const TMP_CONTAINER_IMAGE_TAG = 'container.image.tag';
const TMP_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const TMP_DEVICE_ID = 'device.id';
const TMP_DEVICE_MODEL_IDENTIFIER = 'device.model.identifier';
const TMP_DEVICE_MODEL_NAME = 'device.model.name';
const TMP_FAAS_NAME = 'faas.name';
const TMP_FAAS_ID = 'faas.id';
const TMP_FAAS_VERSION = 'faas.version';
const TMP_FAAS_INSTANCE = 'faas.instance';
const TMP_FAAS_MAX_MEMORY = 'faas.max_memory';
const TMP_HOST_ID = 'host.id';
const TMP_HOST_NAME = 'host.name';
const TMP_HOST_TYPE = 'host.type';
const TMP_HOST_ARCH = 'host.arch';
const TMP_HOST_IMAGE_NAME = 'host.image.name';
const TMP_HOST_IMAGE_ID = 'host.image.id';
const TMP_HOST_IMAGE_VERSION = 'host.image.version';
const TMP_K8S_CLUSTER_NAME = 'k8s.cluster.name';
const TMP_K8S_NODE_NAME = 'k8s.node.name';
const TMP_K8S_NODE_UID = 'k8s.node.uid';
const TMP_K8S_NAMESPACE_NAME = 'k8s.namespace.name';
const TMP_K8S_POD_UID = 'k8s.pod.uid';
const TMP_K8S_POD_NAME = 'k8s.pod.name';
const TMP_K8S_CONTAINER_NAME = 'k8s.container.name';
const TMP_K8S_REPLICASET_UID = 'k8s.replicaset.uid';
const TMP_K8S_REPLICASET_NAME = 'k8s.replicaset.name';
const TMP_K8S_DEPLOYMENT_UID = 'k8s.deployment.uid';
const TMP_K8S_DEPLOYMENT_NAME = 'k8s.deployment.name';
const TMP_K8S_STATEFULSET_UID = 'k8s.statefulset.uid';
const TMP_K8S_STATEFULSET_NAME = 'k8s.statefulset.name';
const TMP_K8S_DAEMONSET_UID = 'k8s.daemonset.uid';
const TMP_K8S_DAEMONSET_NAME = 'k8s.daemonset.name';
const TMP_K8S_JOB_UID = 'k8s.job.uid';
const TMP_K8S_JOB_NAME = 'k8s.job.name';
const TMP_K8S_CRONJOB_UID = 'k8s.cronjob.uid';
const TMP_K8S_CRONJOB_NAME = 'k8s.cronjob.name';
const TMP_OS_TYPE = 'os.type';
const TMP_OS_DESCRIPTION = 'os.description';
const TMP_OS_NAME = 'os.name';
const TMP_OS_VERSION = 'os.version';
const TMP_PROCESS_PID = 'process.pid';
const TMP_PROCESS_EXECUTABLE_NAME = 'process.executable.name';
const TMP_PROCESS_EXECUTABLE_PATH = 'process.executable.path';
const TMP_PROCESS_COMMAND = 'process.command';
const TMP_PROCESS_COMMAND_LINE = 'process.command_line';
const TMP_PROCESS_COMMAND_ARGS = 'process.command_args';
const TMP_PROCESS_OWNER = 'process.owner';
const TMP_PROCESS_RUNTIME_NAME = 'process.runtime.name';
const TMP_PROCESS_RUNTIME_VERSION = 'process.runtime.version';
const TMP_PROCESS_RUNTIME_DESCRIPTION = 'process.runtime.description';
const TMP_SERVICE_NAME = 'service.name';
const TMP_SERVICE_NAMESPACE = 'service.namespace';
const TMP_SERVICE_INSTANCE_ID = 'service.instance.id';
const TMP_SERVICE_VERSION = 'service.version';
const TMP_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
const TMP_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
const TMP_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';
const TMP_TELEMETRY_AUTO_VERSION = 'telemetry.auto.version';
const TMP_WEBENGINE_NAME = 'webengine.name';
const TMP_WEBENGINE_VERSION = 'webengine.version';
const TMP_WEBENGINE_DESCRIPTION = 'webengine.description';
/**
 * Name of the cloud provider.
 *
 * @deprecated Use ATTR_CLOUD_PROV
```

---

# COMANDO - SemanticResourceAttributes.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\src\resource\SemanticResourceAttributes.js
**SHA:** 58977d3455899e20
**Timestamp:** 2026-08-28T02:21:46.261314
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- exports.TelemetrySdkLanguageValues = exports.TELEMETRYSDKLANGUAGEVALUES_WEBJS = exports.TELEMETRYSDKLANGUAGEVALUES_RUBY = exports.TELEMETRYSDKLANGUAGEVALUES_PYTHON = exports.TELEMETRYSDKLANGUAGEVALUES
- * **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
- const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = 'gcp_cloud_run';
- exports.CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN;

### Contratos
- exports.TelemetrySdkLanguageValues = exports.TELEMETRYSDKLANGUAGEVALUES_WEBJS = exports.TELEMETRYSDKLANGUAGEVALUES_RUBY = exports.TELEMETRYSDKLANGUAGEVALUES_PYTHON = exports.TELEMETRYSDKLANGUAGEVALUES
- const TMP_AWSECSLAUNCHTYPEVALUES_FARGATE = 'fargate';
- exports.AWSECSLAUNCHTYPEVALUES_FARGATE = TMP_AWSECSLAUNCHTYPEVALUES_FARGATE;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEMRESATTRS_K8S_STATEFULSET_NAME = exports.SEMRESATTRS_K8S_STATEFULSET_UID = exports.SEMRESATTRS_K8S_DEPLOYMENT_NAME = exports.SEMRESATTRS_K8S_DEPLOYMENT_UID = exports.SEMRESATTRS_K8S_REPLICASET_NAME = exports.SEMRESATTRS_K8S_REPLICASET_UID = exports.SEMRESATTRS_K8S_CONTAINER_NAME = exports.SEMRESATTRS_K8S_POD_NAME = exports.SEMRESATTRS_K8S_POD_UID = exports.SEMRESATTRS_K8S_NAMESPACE_NAME = exports.SEMRESATTRS_K8S_NODE_UID = exports.SEMRESATTRS_K8S_NODE_NAME = exports.SEMRESATTRS_K8S_CLUSTER_NAME = exports.SEMRESATTRS_HOST_IMAGE_VERSION = exports.SEMRESATTRS_HOST_IMAGE_ID = exports.SEMRESATTRS_HOST_IMAGE_NAME = exports.SEMRESATTRS_HOST_ARCH = exports.SEMRESATTRS_HOST_TYPE = exports.SEMRESATTRS_HOST_NAME = exports.SEMRESATTRS_HOST_ID = exports.SEMRESATTRS_FAAS_MAX_MEMORY = exports.SEMRESATTRS_FAAS_INSTANCE = exports.SEMRESATTRS_FAAS_VERSION = exports.SEMRESATTRS_FAAS_ID = exports.SEMRESATTRS_FAAS_NAME = exports.SEMRESATTRS_DEVICE_MODEL_NAME = exports.SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = exports.SEMRESATTRS_DEVICE_ID = exports.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = exports.SEMRESATTRS_CONTAINER_IMAGE_TAG = exports.SEMRESATTRS_CONTAINER_IMAGE_NAME = exports.SEMRESATTRS_CONTAINER_RUNTIME = exports.SEMRESATTRS_CONTAINER_ID = exports.SEMRESATTRS_CONTAINER_NAME = exports.SEMRESATTRS_AWS_LOG_STREAM_ARNS = exports.SEMRESATTRS_AWS_LOG_STREAM_NAMES = exports.SEMRESATTRS_AWS_LOG_GROUP_ARNS = exports.SEMRESATTRS_AWS_LOG_GROUP_NAMES = exports.SEMRESATTRS_AWS_EKS_CLUSTER_ARN = exports.SEMRESATTRS_AWS_ECS_TASK_REVISION = exports.SEMRESATTRS_AWS_ECS_TASK_FAMILY = exports.SEMRESATTRS_AWS_ECS_TASK_ARN = exports.SEMRESATTRS_AWS_ECS_LAUNCHTYPE = exports.SEMRESATTRS_AWS_ECS_CLUSTER_ARN = exports.SEMRESATTRS_AWS_ECS_CONTAINER_ARN = exports.SEMRESATTRS_CLOUD_PLATFORM = exports.SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = exports.SEMRESATTRS_CLOUD_REGION = exports.SEMRESATTRS_CLOUD_ACCOUNT_ID = exports.SEMRESATTRS_CLOUD_PROVIDER = void 0;
exports.CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = exports.CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = exports.CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = exports.CLOUDPLATFORMVALUES_AZURE_AKS = exports.CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = exports.CLOUDPLATFORMVALUES_AZURE_VM = exports.CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = exports.CLOUDPLATFORMVALUES_AWS_LAMBDA = exports.CLOUDPLATFORMVALUES_AWS_EKS = exports.CLOUDPLATFORMVALUES_AWS_ECS = exports.CLOUDPLATFORMVALUES_AWS_EC2 = exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = exports.CloudProviderValues = exports.CLOUDPROVIDERVALUES_GCP = exports.CLOUDPROVIDERVALUES_AZURE = exports.CLOUDPROVIDERVALUES_AWS = exports.CLOUDPROVIDERVALUES_ALIBABA_CLOUD = exports.SemanticResourceAttributes = exports.SEMRESATTRS_WEBENGINE_DESCRIPTION = exports.SEMRESATTRS_WEBENGINE_VERSION = exports.SEMRESATTRS_WEBENGINE_NAME = exports.SEMRESATTRS_TELEMETRY_AUTO_VERSION = exports.SEMRESATTRS_TELEMETRY_SDK_VERSION = exports.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = exports.SEMRESATTRS_TELEMETRY_SDK_NAME = exports.SEMRESATTRS_SERVICE_VERSION = exports.SEMRESATTRS_SERVICE_INSTANCE_ID = exports.SEMRESATTRS_SERVICE_NAMESPACE = exports.SEMRESATTRS_SERVICE_NAME = exports.SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = exports.SEMRESATTRS_PROCESS_RUNTIME_VERSION = exports.SEMRESATTRS_PROCESS_RUNTIME_NAME = exports.SEMRESATTRS_PROCESS_OWNER = exports.SEMRESATTRS_PROCESS_COMMAND_ARGS = exports.SEMRESATTRS_PROCESS_COMMAND_LINE = exports.SEMRESATTRS_PROCESS_COMMAND = exports.SEMRESATTRS_PROCESS_EXECUTABLE_PATH = exports.SEMRESATTRS_PROCESS_EXECUTABLE_NAME = exports.SEMRESATTRS_PROCESS_PID = exports.SEMRESATTRS_OS_VERSION = exports.SEMRESATTRS_OS_NAME = exports.SEMRESATTRS_OS_DESCRIPTION = exports.SEMRESATTRS_OS_TYPE = exports.SEMRESATTRS_K8S_CRONJOB_NAME = exports.SEMRESATTRS_K8S_CRONJOB_UID = exports.SEMRESATTRS_K8S_JOB_NAME = exports.SEMRESATTRS_K8S_JOB_UID = exports.SEMRESATTRS_K8S_DAEMONSET_NAME = exports.SEMRESATTRS_K8S_DAEMONSET_UID = void 0;
exports.TelemetrySdkLanguageValues = exports.TELEMETRYSDKLANGUAGEVALUES_WEBJS = exports.TELEMETRYSDKLANGUAGEVALUES_RUBY = exports.TELEMETRYSDKLANGUAGEVALUES_PYTHON = exports.TELEMETRYSDKLANGUAGEVALUES_PHP = exports.TELEMETRYSDKLANGUAGEVALUES_NODEJS = exports.TELEMETRYSDKLANGUAGEVALUES_JAVA = exports.TELEMETRYSDKLANGUAGEVALUES_GO = exports.TELEMETRYSDKLANGUAGEVALUES_ERLANG = exports.TELEMETRYSDKLANGUAGEVALUES_DOTNET = exports.TELEMETRYSDKLANGUAGEVALUES_CPP = exports.OsTypeValues = exports.OSTYPEVALUES_Z_OS = exports.OSTYPEVALUES_SOLARIS = exports.OSTYPEVALUES_AIX = exports.OSTYPEVALUES_HPUX = exports.OSTYPEVALUES_DRAGONFLYBSD = exports.OSTYPEVALUES_OPENBSD = exports.OSTYPEVALUES_NETBSD = exports.OSTYPEVALUES_FREEBSD = exports.OSTYPEVALUES_DARWIN = exports.OSTYPEVALUES_LINUX = exports.OSTYPEVALUES_WINDOWS = exports.HostArchValues = exports.HOST
```