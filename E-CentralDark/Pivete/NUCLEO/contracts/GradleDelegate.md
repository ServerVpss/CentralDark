# CONTRATO - GradleDelegate.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\kotlin-dsl\org\gradle\kotlin\dsl\support\delegates\GradleDelegate.kt
**SHA:** 11848d6d335cb919
**Timestamp:** 2026-08-28T02:50:38.401051
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- abstract class GradleDelegate : Gradle {
- DeprecationLogger.deprecateType(GradleDelegate::class.java)
- abstract val delegate: Gradle

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
import org.gradle.BuildListener
import org.gradle.BuildResult
import org.gradle.StartParameter
import org.gradle.api.Action
import org.gradle.api.Project
import org.gradle.api.ProjectEvaluationListener
import org.gradle.api.execution.TaskExecutionGraph
import org.gradle.api.initialization.IncludedBuild
import org.gradle.api.initialization.Settings
import org.gradle.api.invocation.Gradle
import org.gradle.api.invocation.GradleLifecycle
import org.gradle.api.plugins.ExtensionContainer
import org.gradle.api.plugins.ObjectConfigurationAction
import org.gradle.api.plugins.PluginContainer
import org.gradle.api.plugins.PluginManager
import org.gradle.internal.deprecation.DeprecationLogger
import java.io.File


/**
 * Facilitates the implementation of the [Gradle] interface by delegation via subclassing.
 */
@Deprecated("Will be removed in Gradle 9.0")
abstract class GradleDelegate : Gradle {

    init {
        @Suppress("DEPRECATION")
        if (!org.gradle.kotlin.dsl.InitScriptApi::class.java.isAssignableFrom(this::class.java)) {
            DeprecationLogger.deprecateType(GradleDelegate::class.java)
                .willBeRemovedInGradle9()
                .undocumented()
                .nagUser()
        }
    }

    internal
    abstract val delegate: Gradle

    override fun getGradleVersion(): String =
        delegate.gradleVersion

    override fun getGradleUserHomeDir(): File =
        delegate.gradleUserHomeDir

    override fun getGradleHomeDir(): File? =
        delegate.gradleHomeDir

    override fun getLifecycle(): GradleLifecycle =
        delegate.lifecycle

    override fun getParent(): Gradle? =
        delegate.parent

    override fun getRootProject(): Project =
        delegate.rootProject

    override fun rootProject(action: Action<in Project>) =
        delegate.rootProject(action)

    override fun allprojects(action: Action<in Project>) =
        delegate.allprojects(action)

    override fun getTaskGraph(): TaskExecutionGraph =
        delegate.taskGraph

    override fun getStartParameter(): StartParameter =
        delegate.startParameter

    override fun addProjectEvaluationListener(listener: ProjectEvaluationListener): ProjectEvaluationListener =
        delegate.addProjectEvaluationListener(listener)

    override fun removeProjectEvaluationListener(listener: ProjectEvaluationListener) =
        delegate.removeProjectEvaluationListener(listener)

    override fun beforeSettings(closure: Closure<*>) =
        delegate.beforeSettings(closure)

    override fun beforeSettings(action: Action<in Settings>) =
        delegate.beforeSettings(action)

    override fun beforeProject(closure: Closure<Any>) =
        delegate.beforeProject(closure)

    override fun beforeProject(action: Action<in Project>) =
        delegate.beforeProject(action)

    override fun afterProject(closure: Closure<Any>) =
        delegate.afterProject(closure)

    override fun afterProject(action: Action<in Project>) =
        delegate.afterProject(action)

    override fun settingsEvaluated(closure: Closure<Any>) =
        delegate.settingsEvaluated(closure)

    override fun settingsEvaluated(action: Action<in Settings>) =
        delegate.settingsEvaluated(action)

    override fun projectsLoaded(closure: Closure<Any>) =
        delegate.projectsLoaded(closure)

    override fun projectsLoaded(action: Action<in Gradle>) =
        delegate.projectsLoaded(action)

    override fun projectsEvaluated(closure: Closure<Any>) =
        delegate.projectsEvaluated(closure)

    override fun projectsEvaluated(action: Action<in Gradle>) =
        delegate.projectsEvaluated(action)

    @Suppress("DEPRECATION")
    override fun buildFinished(closure: Closure<Any>) =
        delegate.buildFinished(closure)

    @Suppress("DEPRECATION")
    override fun buildFinished(action: Action<in BuildResult>) =
        delegate.buildFinished(action)

    override fun addBuildListener(buildListener: BuildListener) =
        delegate.addBuildListener(buildListener)

    override fun addListener(listener: Any) =
        delegate.addListener(listener)

    override fun removeListener(listener: Any) =
        delegate.removeListener(listener)

    @Suppress("DEPRECATION")
    @Deprecated("Will be removed in Gradle 9. Logging customization through listene
```