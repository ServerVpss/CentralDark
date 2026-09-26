# MISSAO - JavaGradlePluginPlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugin-development\org\gradle\plugin\devel\plugins\JavaGradlePluginPlugin.java
**SHA:** 5ab56af4fc89452a
**Timestamp:** 2026-08-28T02:51:12.612459
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- static final String PLUGIN_DESCRIPTOR_PATTERN = "META-INF/" + GRADLE_PLUGINS + "/*.properties";
- static final String CLASSES_PATTERN = "**/*.class";

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2014 the original author or authors.
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

package org.gradle.plugin.devel.plugins;

import org.gradle.api.Action;
import org.gradle.api.JavaVersion;
import org.gradle.api.NonNullApi;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.artifacts.ArtifactView;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.component.ComponentIdentifier;
import org.gradle.api.artifacts.dsl.DependencyHandler;
import org.gradle.api.file.CopySpec;
import org.gradle.api.file.FileCollection;
import org.gradle.api.file.FileCopyDetails;
import org.gradle.api.internal.artifacts.dsl.dependencies.DependencyFactoryInternal;
import org.gradle.api.internal.artifacts.ivyservice.projectmodule.ProjectPublicationRegistry;
import org.gradle.api.internal.plugins.PluginDescriptor;
import org.gradle.api.internal.project.ProjectIdentity;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.internal.tasks.JvmConstants;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.api.plugins.JavaBasePlugin;
import org.gradle.api.plugins.JavaLibraryPlugin;
import org.gradle.api.plugins.JavaPluginExtension;
import org.gradle.api.plugins.internal.JavaPluginHelper;
import org.gradle.api.provider.Provider;
import org.gradle.api.tasks.ClasspathNormalizer;
import org.gradle.api.tasks.Copy;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.api.tasks.bundling.Jar;
import org.gradle.api.tasks.testing.Test;
import org.gradle.initialization.buildsrc.GradlePluginApiVersionAttributeConfigurationAction;
import org.gradle.internal.Describables;
import org.gradle.internal.DisplayName;
import org.gradle.internal.buildoption.InternalFlag;
import org.gradle.internal.buildoption.InternalOptions;
import org.gradle.internal.component.local.model.OpaqueComponentIdentifier;
import org.gradle.jvm.toolchain.JavaLauncher;
import org.gradle.jvm.toolchain.JavaToolchainService;
import org.gradle.plugin.devel.GradlePluginDevelopmentExtension;
import org.gradle.plugin.devel.PluginDeclaration;
import org.gradle.plugin.devel.tasks.GeneratePluginDescriptors;
import org.gradle.plugin.devel.tasks.PluginUnderTestMetadata;
import org.gradle.plugin.devel.tasks.ValidatePlugins;
import org.gradle.plugin.use.PluginId;
import org.gradle.plugin.use.internal.DefaultPluginId;
import org.gradle.plugin.use.resolve.internal.local.PluginPublication;
import org.gradle.process.CommandLineArgumentProvider;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;

import static org.gradle.api.internal.lambdas.SerializableLambdas.spec;

/**
 * A plugin for building java gradle plugins. Automatically generates plugin descriptors. Emits warnings for common error conditions. <p> Provides a direct integration with TestKit by declaring the
 * {@code gradleTestKit()} dependency for the test compile configuration and a dependency on the plugin classpath manifest generation task for the test runtime configuration. Default conventions can
 * be customized with the help of {@link GradlePluginDevelopmentExtension}.
 *
 * Integrates with the 'maven-publish' and 'ivy-publish' plugins to automatically publish the plugins so they can be resolved using the `pluginRepositories` and `plugins` DSL.
 *
 * @see <a href="https://docs.gradle.org/current/userguide/java_gradle_plugin.html">Gradle plugin development reference</a>
 */
@NonNullApi
public abstract class JavaGradlePluginPlugin implements Plugin<Project> {

    private static final Logger LOGGER = Logging.getLogger(JavaGradlePluginPlugin.class);

    static final String API_CONFIGURATION = JvmConstants.API_CONFIGURATION_NAME;
    static final String JAR_TASK = "jar";
    static final String PROCESS_RESOURCES_TASK = "processResources";
    static final String GRADLE_PLUGINS = "gradle-plugins";
    static final String PLUGIN_DESCRIPTOR_PATTERN = "META-INF/" + GRADLE_PLUGINS + "/*.properties";
    static final String CLASSES_PATTERN = "**/*.class";
    static final String BAD_IMPL_CLASS_WARNING_MESSAGE = "%s: A valid plugin descriptor was found for %s but the im
```