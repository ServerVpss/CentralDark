# CONTRATO - ProjectDelegate.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\kotlin-dsl\org\gradle\kotlin\dsl\support\delegates\ProjectDelegate.kt
**SHA:** 682b123d219d7f14
**Timestamp:** 2026-08-28T02:50:38.430503
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- abstract class ProjectDelegate : Project {
- DeprecationLogger.deprecateType(ProjectDelegate::class.java)
- abstract val delegate: Project

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2019 the original author or authors.
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

package org.gradle.kotlin.dsl.support.delegates

import groovy.lang.Closure
import org.gradle.api.Action
import org.gradle.api.AntBuilder
import org.gradle.api.NamedDomainObjectContainer
import org.gradle.api.NamedDomainObjectFactory
import org.gradle.api.PathValidation
import org.gradle.api.Project
import org.gradle.api.ProjectState
import org.gradle.api.Task
import org.gradle.api.artifacts.ConfigurationContainer
import org.gradle.api.artifacts.dsl.ArtifactHandler
import org.gradle.api.artifacts.dsl.DependencyFactory
import org.gradle.api.artifacts.dsl.DependencyHandler
import org.gradle.api.artifacts.dsl.DependencyLockingHandler
import org.gradle.api.artifacts.dsl.RepositoryHandler
import org.gradle.api.component.SoftwareComponentContainer
import org.gradle.api.file.ConfigurableFileCollection
import org.gradle.api.file.ConfigurableFileTree
import org.gradle.api.file.CopySpec
import org.gradle.api.file.DeleteSpec
import org.gradle.api.file.FileTree
import org.gradle.api.file.ProjectLayout
import org.gradle.api.file.SyncSpec
import org.gradle.api.initialization.dsl.ScriptHandler
import org.gradle.api.invocation.Gradle
import org.gradle.api.logging.Logger
import org.gradle.api.logging.LoggingManager
import org.gradle.api.model.ObjectFactory
import org.gradle.api.plugins.ExtensionContainer
import org.gradle.api.plugins.ObjectConfigurationAction
import org.gradle.api.plugins.PluginContainer
import org.gradle.api.plugins.PluginManager
import org.gradle.api.project.IsolatedProject
import org.gradle.api.provider.Provider
import org.gradle.api.provider.ProviderFactory
import org.gradle.api.resources.ResourceHandler
import org.gradle.api.tasks.TaskContainer
import org.gradle.api.tasks.WorkResult
import org.gradle.internal.accesscontrol.AllowUsingApiForExternalUse
import org.gradle.internal.deprecation.DeprecationLogger
import org.gradle.normalization.InputNormalizationHandler
import org.gradle.process.ExecResult
import org.gradle.process.ExecSpec
import org.gradle.process.JavaExecSpec
import java.io.File
import java.net.URI
import java.util.concurrent.Callable


/**
 * Facilitates the implementation of the [Project] interface by delegation via subclassing.
 */
@Deprecated("Will be removed in Gradle 9.0")
abstract class ProjectDelegate : Project {

    init {
        @Suppress("DEPRECATION")
        if (!org.gradle.kotlin.dsl.precompile.PrecompiledProjectScript::class.java.isAssignableFrom(this::class.java)) {
            DeprecationLogger.deprecateType(ProjectDelegate::class.java)
                .willBeRemovedInGradle9()
                .undocumented()
                .nagUser()
        }
    }

    internal
    abstract val delegate: Project

    override fun getGroup(): Any =
        delegate.group

    override fun afterEvaluate(action: Action<in Project>) =
        delegate.afterEvaluate(action)

    override fun afterEvaluate(closure: Closure<*>) =
        delegate.afterEvaluate(closure)

    override fun getDefaultTasks(): MutableList<String> =
        delegate.defaultTasks

    @Deprecated("The concept of conventions is deprecated. Use extensions instead.")
    override fun getConvention(): @Suppress("deprecation") org.gradle.api.plugins.Convention =
        @Suppress("deprecation")
        delegate.convention

    override fun getLogger(): Logger =
        delegate.logger

    @Deprecated("Use layout.buildDirectory instead", ReplaceWith("layout.buildDirectory.get().asFile"))
    override fun getBuildDir(): File =
        @Suppress("DEPRECATION")
        delegate.buildDir

    override fun getAnt(): AntBuilder =
        delegate.ant

    override fun getVersion(): Any =
        delegate.version

    override fun getRootProject(): Project =
        delegate.rootProject

    override fun depthCompare(otherProject: Project): Int =
        delegate.depthCompare(otherProject)

    override fun getGradle(): Gradle =
        delegate.gradle

    override fun getAllTasks(recursive: Boolean): MutableMap<Project, MutableSet<Task>> =
        delegate.getAllTasks(recursive)

    override fun uri(path: Any): URI =
        delegate.uri(path)

    override fun copySpec(closure: Closure<*>): CopySpec =
        delegate.copySpec(closure)

    override fun copySpec(action: Action<in CopySpec>): CopySpec =
        delegate.copySpec(action)

    override fun copySpec(): CopySpec =
        delegate.copySpec()

    override
```