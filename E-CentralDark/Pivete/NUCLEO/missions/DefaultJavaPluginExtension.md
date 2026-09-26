# MISSAO - DefaultJavaPluginExtension.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-java-base\org\gradle\api\plugins\internal\DefaultJavaPluginExtension.java
**SHA:** 2277caaac7984e6f
**Timestamp:** 2026-08-28T02:51:17.759961
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Much of the logic below should become automatic.
- // TODO: This case should be deprecated.

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

package org.gradle.api.plugins.internal;

import groovy.lang.Closure;
import org.gradle.api.Action;
import org.gradle.api.InvalidUserCodeException;
import org.gradle.api.InvalidUserDataException;
import org.gradle.api.JavaVersion;
import org.gradle.api.NamedDomainObjectSet;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.ConfigurationContainer;
import org.gradle.api.component.AdhocComponentWithVariants;
import org.gradle.api.component.SoftwareComponentContainer;
import org.gradle.api.file.DirectoryProperty;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.java.archives.Manifest;
import org.gradle.api.java.archives.internal.DefaultManifest;
import org.gradle.api.jvm.ModularitySpec;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.plugins.FeatureSpec;
import org.gradle.api.plugins.JavaPluginExtension;
import org.gradle.api.plugins.JavaResolutionConsistency;
import org.gradle.api.plugins.jvm.internal.JvmFeatureInternal;
import org.gradle.api.reporting.ReportingExtension;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.SourceSetContainer;
import org.gradle.internal.Actions;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.jvm.DefaultModularitySpec;
import org.gradle.jvm.component.internal.JvmSoftwareComponentInternal;
import org.gradle.jvm.toolchain.JavaToolchainSpec;
import org.gradle.jvm.toolchain.internal.DefaultToolchainSpec;
import org.gradle.jvm.toolchain.internal.JavaToolchainSpecInternal;
import org.gradle.testing.base.plugins.TestingBasePlugin;
import org.gradle.util.internal.CollectionUtils;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.util.Collections;
import java.util.regex.Pattern;

import static org.gradle.api.attributes.DocsType.JAVADOC;
import static org.gradle.api.attributes.DocsType.SOURCES;
import static org.gradle.util.internal.ConfigureUtil.configure;

/**
 * Default implementation of {@link JavaPluginExtension}.
 *
 * This extension is used to implicitly configure all JVM-related {@link org.gradle.api.component.Component}s
 * in the project.  Some methods - such as {@link #registerFeature(String, Action)} -
 * are not applicable in this manner and will throw exceptions if used when multiple
 * {@link org.gradle.jvm.component.internal.JvmSoftwareComponentInternal JvmSoftwareComponentInternal}
 * components are present.
 *
 * At present there should only ever be one such component - the {@code java} component added by the {@link org.gradle.api.plugins.JavaPlugin JavaPlugin} - but
 * multiple components may be created by JVM language plugins in the future.
 */
@SuppressWarnings("JavadocReference")
public class DefaultJavaPluginExtension implements JavaPluginExtension {
    private static final Pattern VALID_FEATURE_NAME = Pattern.compile("[a-zA-Z0-9]+");
    private final SourceSetContainer sourceSets;

    private final JavaToolchainSpecInternal toolchainSpec;
    private final ObjectFactory objectFactory;
    private final ModularitySpec modularity;
    private final JavaToolchainSpec toolchain;
    private final ProjectInternal project;

    private final DirectoryProperty docsDir;
    private final DirectoryProperty testResultsDir;
    private final DirectoryProperty testReportDir;
    private JavaVersion srcCompat;
    private JavaVersion targetCompat;
    private boolean autoTargetJvm = true;

    @Inject
    public DefaultJavaPluginExtension(ProjectInternal project, SourceSetContainer sourceSets, DefaultToolchainSpec toolchainSpec) {
        this.docsDir = project.getObjects().directoryProperty();
        this.testResultsDir = project.getObjects().directoryProperty();
        this.testReportDir = project.getObjects().directoryProperty(); //TestingBasePlugin.TESTS_DIR_NAME;
        this.project = project;
        this.sourceSets = sourceSets;
        this.toolchainSpec = toolchainSpec;
        this.objectFactory = project.getObjects();
        this.modularity = objectFactory.newInstance(DefaultModularitySpec.class);
        this.toolchain = toolchainSpec;
        configureDefaults();
    }

    private void configureDefaults() {
        docsDir.convention(project.getLayout().getBuildDirectory().dir("docs"));
        testResultsDir.convention(project.getLayout().getBuildDirectory().dir(TestingBasePlugin.TEST_RESULTS_DIR_NAME
```