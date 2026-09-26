# MISSAO - GroovyBasePlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-groovy\org\gradle\api\plugins\GroovyBasePlugin.java
**SHA:** 5d7aeb54c4a8de50
**Timestamp:** 2026-08-28T02:51:16.083981
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: `classes` should be a little more tied to the classesDirs for a SourceSet so every plugin

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2009 the original author or authors.
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

import com.google.common.collect.Sets;
import org.gradle.api.JavaVersion;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.artifacts.ConfigurationContainer;
import org.gradle.api.attributes.LibraryElements;
import org.gradle.api.file.ConfigurableFileCollection;
import org.gradle.api.file.FileCollection;
import org.gradle.api.internal.classpath.ModuleRegistry;
import org.gradle.api.internal.plugins.DslObject;
import org.gradle.api.internal.tasks.DefaultSourceSet;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.plugins.internal.DefaultJavaPluginExtension;
import org.gradle.api.plugins.internal.JvmPluginsHelper;
import org.gradle.api.plugins.jvm.internal.JvmLanguageUtilities;
import org.gradle.api.provider.Provider;
import org.gradle.api.reporting.ReportingExtension;
import org.gradle.api.tasks.GroovyRuntime;
import org.gradle.api.tasks.GroovySourceDirectorySet;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.api.tasks.compile.GroovyCompile;
import org.gradle.api.tasks.javadoc.Groovydoc;
import org.gradle.api.tasks.javadoc.GroovydocAccess;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.jvm.toolchain.JavaLauncher;
import org.gradle.jvm.toolchain.JavaToolchainService;

import javax.annotation.Nullable;
import javax.inject.Inject;

import java.util.function.Supplier;

import static org.gradle.api.internal.lambdas.SerializableLambdas.spec;

/**
 * Extends {@link org.gradle.api.plugins.JavaBasePlugin} to provide support for compiling and documenting Groovy
 * source files.
 *
 * @see <a href="https://docs.gradle.org/current/userguide/groovy_plugin.html">Groovy plugin reference</a>
 */
public abstract class GroovyBasePlugin implements Plugin<Project> {
    public static final String GROOVY_RUNTIME_EXTENSION_NAME = "groovyRuntime";

    private final ObjectFactory objectFactory;
    private final ModuleRegistry moduleRegistry;
    private final JvmLanguageUtilities jvmLanguageUtils;

    @Inject
    public GroovyBasePlugin(
        ObjectFactory objectFactory,
        ModuleRegistry moduleRegistry,
        JvmLanguageUtilities jvmPluginServices
    ) {
        this.objectFactory = objectFactory;
        this.moduleRegistry = moduleRegistry;
        this.jvmLanguageUtils = jvmPluginServices;
    }

    @Override
    public void apply(Project project) {
        project.getPluginManager().apply(JavaBasePlugin.class);

        GroovyRuntime groovyRuntime = project.getExtensions().create(GROOVY_RUNTIME_EXTENSION_NAME, GroovyRuntime.class, project);

        configureCompileDefaults(project, groovyRuntime);
        configureSourceSetDefaults(project);
        configureGroovydoc(project, groovyRuntime);
    }

    private void configureCompileDefaults(Project project, GroovyRuntime groovyRuntime) {
        project.getTasks().withType(GroovyCompile.class).configureEach(compile -> {
            compile.getConventionMapping().map(
                "groovyClasspath",
                () -> groovyRuntime.inferGroovyClasspath(compile.getClasspath())
            );

            DefaultJavaPluginExtension javaExtension = (DefaultJavaPluginExtension) project.getExtensions().getByType(JavaPluginExtension.class);
            JvmPluginsHelper.configureCompileDefaults(compile, javaExtension, (@Nullable JavaVersion rawConvention, Supplier<JavaVersion> javaVersionSupplier) -> {
                if (rawConvention != null) {
                    return rawConvention;
                }
                return JavaVersion.toVersion(compile.getJavaLauncher().get().getMetadata().getLanguageVersion().toString());
            });
        });
    }

    private void configureSourceSetDefaults(Project project) {
        javaPluginExtension(project).getSourceSets().all(sourceSet -> {

            GroovySourceDirectorySet groovySource = getGroovySourceDirectorySet(sourceSet);
            sourceSet.getExtensions().add(GroovySourceDirectorySet.class, "groovy", groovySource);
            groovySource.srcDir("src/" + sourceSet.getName() + "/groovy");

            // Explicitly capture only a FileCollection in the lambda below for compatibility with configuration-cache.
            final FileCollection groovySourceFiles = groovySource;
            sourceSet.getResources().getFilter().exclude(
 
```