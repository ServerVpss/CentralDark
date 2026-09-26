# MISSAO - DefaultJvmFeature.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-java-base\org\gradle\api\plugins\jvm\internal\DefaultJvmFeature.java
**SHA:** 079fc52734898c9a
**Timestamp:** 2026-08-28T02:51:18.034455
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Deprecate allowing user to extend main feature.
- // TODO: Why do we not always do this? Why only when we have an API?
- // TODO: Why are we using this non-standard name? For the `java` component, this

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2020 the original author or authors.
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
package org.gradle.api.plugins.jvm.internal;

import org.apache.commons.lang.StringUtils;
import org.gradle.api.GradleException;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.ConfigurationContainer;
import org.gradle.api.artifacts.ConfigurationPublications;
import org.gradle.api.artifacts.ConsumableConfiguration;
import org.gradle.api.artifacts.PublishArtifact;
import org.gradle.api.artifacts.type.ArtifactTypeDefinition;
import org.gradle.api.capabilities.Capability;
import org.gradle.api.internal.artifacts.configurations.ConfigurationRolesForMigration;
import org.gradle.api.internal.artifacts.configurations.RoleBasedConfigurationContainerInternal;
import org.gradle.api.internal.artifacts.dsl.LazyPublishArtifact;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.internal.tasks.DefaultSourceSet;
import org.gradle.api.internal.tasks.JvmConstants;
import org.gradle.api.plugins.BasePlugin;
import org.gradle.api.plugins.JavaPluginExtension;
import org.gradle.api.plugins.internal.JvmPluginsHelper;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.TaskContainer;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.api.tasks.bundling.Jar;
import org.gradle.api.tasks.compile.JavaCompile;
import org.gradle.internal.component.external.model.ImmutableCapabilities;
import org.gradle.util.internal.TextUtil;

import java.util.Set;

import static org.gradle.api.attributes.DocsType.JAVADOC;
import static org.gradle.api.attributes.DocsType.SOURCES;

/**
 * Represents a generic "Java feature", using the specified source set and its corresponding
 * configurations, compile task, and jar task. This feature creates a jar task and javadoc task, and
 * can optionally also create consumable javadoc and sources jar variants.
 *
 * <p>This can be used to create production libraries, applications, test suites, test fixtures,
 * or any other consumable JVM feature.</p>
 *
 * <p>This feature can conditionally be configured to instead "extend" the production code. In that case, this
 * feature creates additional dependency configurations which live adjacent to the main source set's dependency scopes,
 * which allow users to declare optional dependencies that the production code will compile and test against.
 * These extra dependencies are not published as part of the production variants, but as separate apiElements
 * and runtimeElements variants as defined by this feature. Then, users can declare a dependency on this
 * feature to get access to the optional dependencies.</p>
 *
 * <p>This "extending" functionality is fragile, in that it allows the production code to be compiled and
 * tested against dependencies which will not necessarily be present at runtime. For this reason, we are
 * planning to deprecate the "extending" functionality. For more information, see {@link #doExtendProductionCode}.</p>
 *
 * <p>For backwards compatibility reasons, when this feature is operating in the "extending" mode,
 * this feature is able to operate without the presence of the main feature, as long as the user
 * explicitly configures the project by manually creating a main and test source set themselves.
 * In that case, this feature will additionally create the jar and javadoc tasks which the main
 * source set would normally create. Additionally, this extension feature is able to create the
 * sources and javadoc variants that the main feature would also conditionally create.</p>
 */
public class DefaultJvmFeature implements JvmFeatureInternal {
    private static final String SOURCE_ELEMENTS_VARIANT_NAME_SUFFIX = "SourceElements";

    private final String name;
    private final SourceSet sourceSet;
    private final Set<Capability> capabilities;
    private final boolean extendProductionCode;

    // Services
    private final ProjectInternal project;
    private final JvmPluginServices jvmPluginServices;
    private final JvmLanguageUtilities jvmLanguageUtilities;

    // Tasks
    private final TaskProvider<Jar> jar;
    private final TaskProvider<JavaCompile> compileJava;

    // Dependency configurations
    private final Configuration implementation;
    private final Configuration runtimeOnly;
    private final Configuration compileOnly;

    // Configurable dependency configurations
    private Configuration compileOnlyApi;
    private Configuration
```