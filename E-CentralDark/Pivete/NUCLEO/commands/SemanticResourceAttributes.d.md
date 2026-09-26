# COMANDO - SemanticResourceAttributes.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\semantic-conventions@1.43.0@@@1\build\esm\resource\SemanticResourceAttributes.d.ts
**SHA:** b01b6730bcd4b208
**Timestamp:** 2026-08-28T02:21:42.974106
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
- * **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
- export declare const CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = "gcp_cloud_run";
- GCP_CLOUD_RUN: 'gcp_cloud_run';

### Contratos
- export declare const AWSECSLAUNCHTYPEVALUES_FARGATE = "fargate";
- FARGATE: 'fargate';

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Name of the cloud provider.
 *
 * @deprecated Use ATTR_CLOUD_PROVIDER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_CLOUD_PROVIDER = "cloud.provider";
/**
 * The cloud account ID the resource is assigned to.
 *
 * @deprecated Use ATTR_CLOUD_ACCOUNT_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_CLOUD_ACCOUNT_ID = "cloud.account.id";
/**
 * The geographical region the resource is running. Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), or [Google Cloud regions](https://cloud.google.com/about/locations).
 *
 * @deprecated Use ATTR_CLOUD_REGION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_CLOUD_REGION = "cloud.region";
/**
 * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
 *
 * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
 *
 * @deprecated Use ATTR_CLOUD_AVAILABILITY_ZONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = "cloud.availability_zone";
/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 *
 * @deprecated Use ATTR_CLOUD_PLATFORM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_CLOUD_PLATFORM = "cloud.platform";
/**
 * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
 *
 * @deprecated Use ATTR_AWS_ECS_CONTAINER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_AWS_ECS_CONTAINER_ARN = "aws.ecs.container.arn";
/**
 * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
 *
 * @deprecated Use ATTR_AWS_ECS_CLUSTER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_AWS_ECS_CLUSTER_ARN = "aws.ecs.cluster.arn";
/**
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 *
 * @deprecated Use ATTR_AWS_ECS_LAUNCHTYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_AWS_ECS_LAUNCHTYPE = "aws.ecs.launchtype";
/**
 * The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
 *
 * @deprecated Use ATTR_AWS_ECS_TASK_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_AWS_ECS_TASK_ARN = "aws.ecs.task.arn";
/**
 * The task definition family this task definition is a member of.
 *
 * @deprecated Use ATTR_AWS_ECS_TASK_FAMILY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_AWS_ECS_TASK_FAMILY = "aws.ecs.task.family";
/**
 * The revision for this task definition.
 *
 * @deprecated Use ATTR_AWS_ECS_TASK_REVISION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_AWS_ECS_TASK_REVISION = "aws.ecs.task.revision";
/**
 * The ARN of an EKS cluster.
 *
 * @deprecated Use ATTR_AWS_EKS_CLUSTER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
 */
export declare const SEMRESATTRS_AWS_EKS_CLUSTER_ARN = "aws.eks.cluster.arn";
/**
 * The name(s) of the AWS log group(s) an application is writing to.
 *
 * Note: Multiple log groups must be supported for cases like multi-
```