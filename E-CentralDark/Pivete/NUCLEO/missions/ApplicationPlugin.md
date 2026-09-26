# MISSAO - ApplicationPlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-application\org\gradle\api\plugins\ApplicationPlugin.java
**SHA:** 5595a3af991a0e6a
**Timestamp:** 2026-08-28T02:51:14.705181
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // @Todo: refactor this task configuration to extend a copy task and use replace tokens

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2024 the original author or authors.
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

import org.gradle.api.Action;
import org.gradle.api.GradleException;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.UncheckedIOException;
import org.gradle.api.distribution.Distribution;
import org.gradle.api.distribution.DistributionContainer;
import org.gradle.api.distribution.plugins.DistributionPlugin;
import org.gradle.api.file.CopySpec;
import org.gradle.api.file.FileCollection;
import org.gradle.api.internal.provider.PropertyFactory;
import org.gradle.api.plugins.internal.DefaultApplicationPluginConvention;
import org.gradle.api.plugins.internal.DefaultJavaApplication;
import org.gradle.api.plugins.internal.JavaPluginHelper;
import org.gradle.api.plugins.jvm.internal.JvmFeatureInternal;
import org.gradle.api.provider.Provider;
import org.gradle.api.provider.ProviderFactory;
import org.gradle.api.tasks.JavaExec;
import org.gradle.api.tasks.Sync;
import org.gradle.api.tasks.TaskContainer;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.api.tasks.application.CreateStartScripts;
import org.gradle.api.tasks.bundling.Jar;
import org.gradle.api.tasks.compile.JavaCompile;
import org.gradle.api.tasks.internal.JavaExecExecutableUtils;
import org.gradle.internal.deprecation.DeprecationLogger;
import org.gradle.jvm.toolchain.JavaToolchainService;
import org.gradle.jvm.toolchain.JavaToolchainSpec;

import javax.inject.Inject;
import java.io.File;
import java.util.concurrent.Callable;
import java.util.function.BiFunction;

import static org.gradle.api.distribution.plugins.DistributionPlugin.TASK_INSTALL_NAME;

/**
 * <p>A {@link Plugin} which packages and runs a project as a Java Application.</p>
 *
 * <p>The plugin can be configured via the {@link JavaApplication} extension.</p>
 *
 * @see <a href="https://docs.gradle.org/current/userguide/application_plugin.html">Application plugin reference</a>
 */
public abstract class ApplicationPlugin implements Plugin<Project> {
    public static final String APPLICATION_PLUGIN_NAME = "application";
    public static final String APPLICATION_GROUP = APPLICATION_PLUGIN_NAME;
    public static final String TASK_RUN_NAME = "run";
    public static final String TASK_START_SCRIPTS_NAME = "startScripts";
    public static final String TASK_DIST_ZIP_NAME = "distZip";
    public static final String TASK_DIST_TAR_NAME = "distTar";

    @Override
    public void apply(final Project project) {
        TaskContainer tasks = project.getTasks();

        project.getPluginManager().apply(JavaPlugin.class);
        project.getPluginManager().apply(DistributionPlugin.class);

        JvmFeatureInternal mainFeature = JavaPluginHelper.getJavaComponent(project).getMainFeature();

        JavaApplication extension = addExtension(project);
        addRunTask(project, mainFeature, extension);
        addCreateScriptsTask(project, mainFeature, extension);
        configureJavaCompileTask(mainFeature.getCompileJavaTask(), extension);
        configureInstallTask(project.getProviders(), tasks.named(TASK_INSTALL_NAME, Sync.class), extension);

        DistributionContainer distributions = project.getExtensions().getByType(DistributionContainer.class);
        Distribution mainDistribution = distributions.getByName(DistributionPlugin.MAIN_DISTRIBUTION_NAME);
        configureDistribution(project, mainFeature, mainDistribution, extension);
    }

    private void configureJavaCompileTask(TaskProvider<JavaCompile> javaCompile, JavaApplication pluginExtension) {
        javaCompile.configure(j -> j.getOptions().getJavaModuleMainClass().convention(pluginExtension.getMainClass()));
    }

    private void configureInstallTask(ProviderFactory providers, TaskProvider<Sync> installTask, JavaApplication pluginExtension) {
        installTask.configure(task -> task.doFirst(
            "don't overwrite existing directories",
            new PreventDestinationOverwrite(
                providers.provider(pluginExtension::getApplicationName),
                providers.provider(pluginExtension::getExecutableDir)
            )
        ));
    }

    private static class PreventDestinationOverwrite implements Action<Task> {
        private final Provider<String> applicationName;
        private final Provider<String> executableDir;

        private PreventDestinationOverwrite(Provider<String> application
```