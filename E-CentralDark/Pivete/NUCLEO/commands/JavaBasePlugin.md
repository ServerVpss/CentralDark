# COMANDO - JavaBasePlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-java-base\org\gradle\api\plugins\JavaBasePlugin.java
**SHA:** 819254360b87ac47
**Timestamp:** 2026-08-28T02:51:17.708547
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Gradle 8.1+: Deprecate `getLibsDirectory` in BasePluginExtension and move it to `JavaPluginExtension`

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

package org.gradle.api.plugins;

import com.google.common.collect.ImmutableList;
import org.gradle.api.JavaVersion;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.ConfigurationContainer;
import org.gradle.api.attributes.LibraryElements;
import org.gradle.api.file.Directory;
import org.gradle.api.file.SourceDirectorySet;
import org.gradle.api.internal.ConventionMapping;
import org.gradle.api.internal.GeneratedSubclasses;
import org.gradle.api.internal.IConventionAware;
import org.gradle.api.internal.artifacts.configurations.ConfigurationRole;
import org.gradle.api.internal.artifacts.configurations.ConfigurationRoles;
import org.gradle.api.internal.artifacts.configurations.RoleBasedConfigurationContainerInternal;
import org.gradle.api.internal.artifacts.configurations.RoleBasedConfigurationCreationRequest;
import org.gradle.api.internal.artifacts.configurations.UsageDescriber;
import org.gradle.api.internal.file.FileTreeInternal;
import org.gradle.api.internal.plugins.DslObject;
import org.gradle.api.internal.provider.PropertyFactory;
import org.gradle.api.internal.tasks.DefaultSourceSetOutput;
import org.gradle.api.internal.tasks.JvmConstants;
import org.gradle.api.internal.tasks.compile.CompilationSourceDirs;
import org.gradle.api.internal.tasks.compile.JavaCompileExecutableUtils;
import org.gradle.api.internal.tasks.testing.TestExecutableUtils;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.plugins.internal.DefaultJavaPluginConvention;
import org.gradle.api.plugins.internal.DefaultJavaPluginExtension;
import org.gradle.api.plugins.internal.JavaConfigurationVariantMapping;
import org.gradle.api.plugins.internal.JvmPluginsHelper;
import org.gradle.api.plugins.internal.NaggingJavaPluginConvention;
import org.gradle.api.plugins.jvm.internal.JvmLanguageUtilities;
import org.gradle.api.plugins.jvm.internal.JvmPluginServices;
import org.gradle.api.provider.Provider;
import org.gradle.api.reporting.DirectoryReport;
import org.gradle.api.reporting.ReportingExtension;
import org.gradle.api.tasks.Copy;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.SourceSetContainer;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.api.tasks.compile.AbstractCompile;
import org.gradle.api.tasks.compile.JavaCompile;
import org.gradle.api.tasks.javadoc.Javadoc;
import org.gradle.api.tasks.javadoc.internal.JavadocExecutableUtils;
import org.gradle.api.tasks.testing.JUnitXmlReport;
import org.gradle.api.tasks.testing.Test;
import org.gradle.internal.Cast;
import org.gradle.internal.artifacts.configurations.AbstractRoleBasedConfigurationCreationRequest;
import org.gradle.internal.deprecation.DeprecatableConfiguration;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.internal.jvm.JavaModuleDetector;
import org.gradle.jvm.tasks.Jar;
import org.gradle.jvm.toolchain.JavaToolchainService;
import org.gradle.jvm.toolchain.JavaToolchainSpec;
import org.gradle.jvm.toolchain.internal.DefaultToolchainSpec;
import org.gradle.language.base.plugins.LifecycleBasePlugin;
import org.gradle.language.jvm.tasks.ProcessResources;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.io.File;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.function.BiFunction;
import java.util.function.Supplier;

/**
 * <p>A {@link org.gradle.api.Plugin} which compiles and tests Java source, and assembles it into a JAR file.</p>
 *
 * This plugin is automatically applied to most projects that build any JVM language source.  It creates a {@link JavaPluginExtension}
 * extension named {@code java} that is used to configure all jvm-related components in the project.
 *
 * It is responsible for configuring the conventions of any {@link SourceSet}s that are present and used by
 * (for example) the Java, Groovy, or Kotlin plugins.
 *
 * @see <a href="https://docs.gradle.org/current/userguide/java_plugin.html">Java plugin reference</a>
 */
public abstract class JavaBasePlugin implements Plugin<Project> {
    public static final String CHECK_TASK_NAME = LifecycleBasePlugin.CHECK_TASK_NAME;

    @SuppressWarnings("unused")
    public static final String VERIFICATION_GROUP = LifecycleBasePlugin.VERIFICATION_GROU
```