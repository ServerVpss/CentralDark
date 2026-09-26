# MISSAO - MavenComponentParser.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\maven\org\gradle\api\publish\maven\internal\publication\MavenComponentParser.java
**SHA:** aee3a52212425cf7
**Timestamp:** 2026-08-28T02:50:40.629870
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: These warnings are not very useful. There are cases where a dependency declared

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2023 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.gradle.api.publish.maven.internal.publication;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Sets;
import org.gradle.api.GradleException;
import org.gradle.api.artifacts.DependencyArtifact;
import org.gradle.api.artifacts.DependencyConstraint;
import org.gradle.api.artifacts.ExcludeRule;
import org.gradle.api.artifacts.ExternalDependency;
import org.gradle.api.artifacts.ModuleDependency;
import org.gradle.api.artifacts.ModuleVersionIdentifier;
import org.gradle.api.artifacts.ProjectDependency;
import org.gradle.api.capabilities.Capability;
import org.gradle.api.component.SoftwareComponentVariant;
import org.gradle.api.internal.DocumentationRegistry;
import org.gradle.api.internal.artifacts.DefaultExcludeRule;
import org.gradle.api.internal.artifacts.DefaultModuleIdentifier;
import org.gradle.api.internal.artifacts.dependencies.DefaultProjectDependencyConstraint;
import org.gradle.api.internal.artifacts.dsl.dependencies.PlatformSupport;
import org.gradle.api.internal.artifacts.ivyservice.ivyresolve.strategy.DefaultVersionSelectorScheme;
import org.gradle.api.internal.artifacts.ivyservice.ivyresolve.strategy.MavenVersionSelectorScheme;
import org.gradle.api.internal.component.SoftwareComponentInternal;
import org.gradle.api.internal.provider.MergeProvider;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.api.provider.Provider;
import org.gradle.api.publish.internal.component.MavenPublishingAwareVariant;
import org.gradle.api.publish.internal.mapping.ComponentDependencyResolver;
import org.gradle.api.publish.internal.mapping.DependencyCoordinateResolverFactory;
import org.gradle.api.publish.internal.mapping.ResolvedCoordinates;
import org.gradle.api.publish.internal.mapping.VariantDependencyResolver;
import org.gradle.api.publish.internal.validation.PublicationWarningsCollector;
import org.gradle.api.publish.internal.validation.VariantWarningCollector;
import org.gradle.api.publish.internal.versionmapping.VersionMappingStrategyInternal;
import org.gradle.api.publish.maven.MavenArtifact;
import org.gradle.api.publish.maven.internal.dependencies.DefaultMavenDependency;
import org.gradle.api.publish.maven.internal.dependencies.DefaultMavenPomDependencies;
import org.gradle.api.publish.maven.internal.dependencies.MavenDependency;
import org.gradle.api.publish.maven.internal.dependencies.MavenPomDependencies;
import org.gradle.api.publish.maven.internal.dependencies.VersionRangeMapper;
import org.gradle.api.publish.maven.internal.validation.MavenPublicationErrorChecker;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.typeconversion.NotationParser;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Encapsulates all logic required to extract data from a {@link SoftwareComponentInternal} in order to
 * transform it to a representation compatible with Maven.
 */
public class MavenComponentParser {
    @VisibleForTesting
    public static final String INCOMPATIBLE_FEATURE = " contains dependencies that will produce a pom file that cannot be consumed by a Maven client.";
    @VisibleForTesting
    public static final String UNSUPPORTED_FEATURE = " contains dependencies that cannot be represented in a published pom file.";
    @VisibleForTesting
    public static final String PUBLICATION_WARNING_FOOTER =
        "These issues indicate information that is lost in the published 'pom' metadata file, " +
        "which may be an issue if the published library is consumed by an old Gradle version or Apache Maven.\n" +
        "The 'module' metadata file, which is used by Gradle 6+ is not affected.";

    /*
     * Maven supports wildcards in exclusion rules according to:
     * http://www.smartjava.org/content/maven-and-wildcard-exclusions
     * https://issues.apache.org/jira/browse/MNG-3832
     * This should be used for non-transitive dependencies
     */
    privat
```