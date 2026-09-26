# MISSAO - JavaPlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-java\org\gradle\api\plugins\JavaPlugin.java
**SHA:** ef0b3c1750547041
**Timestamp:** 2026-08-28T02:51:16.856641
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- project.getPluginManager().apply("org.gradle.jvm-test-suite"); // TODO: change to reference plugin class by name after project dependency cycles untangled; this will affect ApplyPluginBuildOperationIn
- // TODO: This process of manually adding variants to the component should be handled automatically when adding the feature to the component.
- // TODO: This approach is not necessarily correct for non-main features. All publications will attempt to use the main feature's

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2010 the original author or authors.
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

package org.gradle.api.plugins;

import org.gradle.api.NamedDomainObjectProvider;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.Dependency;
import org.gradle.api.attributes.Usage;
import org.gradle.api.file.FileCollection;
import org.gradle.api.internal.artifacts.configurations.RoleBasedConfigurationContainerInternal;
import org.gradle.api.internal.component.SoftwareComponentContainerInternal;
import org.gradle.api.internal.plugins.DefaultArtifactPublicationSet;
import org.gradle.api.internal.plugins.DslObject;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.internal.tasks.JvmConstants;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.plugins.internal.JavaConfigurationVariantMapping;
import org.gradle.api.plugins.jvm.JvmTestSuite;
import org.gradle.api.plugins.jvm.internal.DefaultJvmFeature;
import org.gradle.api.plugins.jvm.internal.JvmFeatureInternal;
import org.gradle.api.publish.PublishingExtension;
import org.gradle.api.publish.internal.PublicationInternal;
import org.gradle.api.publish.internal.versionmapping.VersionMappingStrategyInternal;
import org.gradle.api.publish.ivy.IvyPublication;
import org.gradle.api.publish.maven.MavenPublication;
import org.gradle.api.publish.plugins.PublishingPlugin;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.SourceSetContainer;
import org.gradle.api.tasks.TaskCollection;
import org.gradle.api.tasks.TaskContainer;
import org.gradle.api.tasks.bundling.Jar;
import org.gradle.api.tasks.diagnostics.DependencyInsightReportTask;
import org.gradle.api.tasks.testing.Test;
import org.gradle.internal.execution.BuildOutputCleanupRegistry;
import org.gradle.jvm.component.internal.DefaultJvmSoftwareComponent;
import org.gradle.jvm.component.internal.JvmSoftwareComponentInternal;
import org.gradle.testing.base.TestingExtension;

import javax.inject.Inject;
import java.util.Collections;


/**
 * <p>A {@link Plugin} which compiles and tests Java source, and assembles it into a JAR file.</p>
 *
 * This plugin creates a built-in {@link JvmTestSuite test suite} named {@code test} that represents the {@link Test} task for Java projects.
 *
 * @see <a href="https://docs.gradle.org/current/userguide/java_plugin.html">Java plugin reference</a>
 * @see <a href="https://docs.gradle.org/current/userguide/jvm_test_suite_plugin.html">JVM test suite plugin reference</a>
 */
public abstract class JavaPlugin implements Plugin<Project> {
    /**
     * The name of the task that processes resources.
     */
    public static final String PROCESS_RESOURCES_TASK_NAME = JvmConstants.PROCESS_RESOURCES_TASK_NAME;

    /**
     * The name of the lifecycle task which outcome is that all the classes of a component are generated.
     */
    public static final String CLASSES_TASK_NAME = JvmConstants.CLASSES_TASK_NAME;

    /**
     * The name of the task which compiles Java sources.
     */
    public static final String COMPILE_JAVA_TASK_NAME = JvmConstants.COMPILE_JAVA_TASK_NAME;

    /**
     * The name of the task which processes the test resources.
     */
    public static final String PROCESS_TEST_RESOURCES_TASK_NAME = JvmConstants.PROCESS_TEST_RESOURCES_TASK_NAME;

    /**
     * The name of the lifecycle task which outcome is that all test classes of a component are generated.
     */
    public static final String TEST_CLASSES_TASK_NAME = JvmConstants.TEST_CLASSES_TASK_NAME;

    /**
     * The name of the task which compiles the test Java sources.
     */
    public static final String COMPILE_TEST_JAVA_TASK_NAME = JvmConstants.COMPILE_TEST_JAVA_TASK_NAME;

    /**
     * The name of the task which triggers execution of tests.
     */
    public static final String TEST_TASK_NAME = JvmConstants.TEST_TASK_NAME;

    /**
     * The name of the task which generates the component main jar.
     */
    public static final String JAR_TASK_NAME = JvmConstants.JAR_TASK_NAME;

    /**
     * The name of the task which generates the component javadoc.
     */
    public static final String JAVADOC_TASK_NAME = JvmConstants.JAVADOC_TASK_NAME;

    /**
     * The name of the API configuration, where dependencies exported by a component at compile time should
     * be declared.
     *
     * @since 3.4
     */
    publi
```