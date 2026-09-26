# CONTRATO - TaskContainerDelegate.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\kotlin-dsl\org\gradle\kotlin\dsl\support\delegates\TaskContainerDelegate.kt
**SHA:** cd53adc05d23a189
**Timestamp:** 2026-08-28T02:50:38.455475
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- abstract class TaskContainerDelegate : TaskContainer {
- abstract val delegate: TaskContainer

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
import org.gradle.api.DomainObjectCollection
import org.gradle.api.NamedDomainObjectCollectionSchema
import org.gradle.api.NamedDomainObjectContainer
import org.gradle.api.Namer
import org.gradle.api.Rule
import org.gradle.api.Task
import org.gradle.api.provider.Provider
import org.gradle.api.specs.Spec
import org.gradle.api.tasks.TaskCollection
import org.gradle.api.tasks.TaskContainer
import org.gradle.api.tasks.TaskProvider

import java.util.SortedMap
import java.util.SortedSet


/**
 * Facilitates the implementation of the [TaskContainer] interface by delegation via subclassing.
 */
abstract class TaskContainerDelegate : TaskContainer {

    internal
    abstract val delegate: TaskContainer

    override fun contains(element: Task): Boolean =
        delegate.contains(element)

    override fun addAll(elements: Collection<Task>): Boolean =
        delegate.addAll(elements)

    override fun named(predicate: Spec<String>): TaskCollection<Task> =
        delegate.named(predicate)

    override fun matching(spec: Spec<in Task>): TaskCollection<Task> =
        delegate.matching(spec)

    override fun matching(closure: Closure<Any>): TaskCollection<Task> =
        delegate.matching(closure)

    override fun clear() =
        delegate.clear()

    override fun addRule(rule: Rule): Rule =
        delegate.addRule(rule)

    override fun addRule(description: String, ruleAction: Closure<Any>): Rule =
        delegate.addRule(description, ruleAction)

    override fun addRule(description: String, ruleAction: Action<String>): Rule =
        delegate.addRule(description, ruleAction)

    override fun configure(configureClosure: Closure<Any>): NamedDomainObjectContainer<Task> =
        delegate.configure(configureClosure)

    override fun addAllLater(provider: Provider<out Iterable<Task>>) =
        delegate.addAllLater(provider)

    @Deprecated("Use register instead. There is no matching method taking a map notation, so you will have replace the map with proper arguments. See https://docs.gradle.org/current/userguide/task_configuration_avoidance.html for more information.")
    @Suppress("DEPRECATION")
    override fun create(options: Map<String, *>): Task =
        delegate.create(options)

    @Deprecated("Use register instead. There is no matching method taking a map notation, so you will have replace the map with proper arguments. See https://docs.gradle.org/current/userguide/task_configuration_avoidance.html for more information.")
    @Suppress("DEPRECATION")
    override fun create(options: Map<String, *>, configureClosure: Closure<Any>): Task =
        delegate.create(options, configureClosure)

    @Deprecated("Use register instead. See https://docs.gradle.org/current/userguide/task_configuration_avoidance.html for more information.", ReplaceWith("register(name, configureClosure)"))
    @Suppress("DEPRECATION")
    override fun create(name: String, configureClosure: Closure<Any>): Task =
        delegate.create(name, configureClosure)

    @Deprecated("Use register instead. See https://docs.gradle.org/current/userguide/task_configuration_avoidance.html for more information.", ReplaceWith("register(name)"))
    @Suppress("DEPRECATION")
    override fun create(name: String): Task =
        delegate.create(name)

    @Deprecated("Use register instead. See https://docs.gradle.org/current/userguide/task_configuration_avoidance.html for more information.", ReplaceWith("register(name, type)"))
    @Suppress("DEPRECATION")
    override fun <T : Task> create(name: String, type: Class<T>): T =
        delegate.create(name, type)

    @Deprecated("Use register instead. See https://docs.gradle.org/current/userguide/task_configuration_avoidance.html for more information.", ReplaceWith("register(name, type, *constructorArgs)"))
    @Suppress("DEPRECATION")
    override fun <T : Task> create(name: String, type: Class<T>, vararg constructorArgs: Any?): T =
        delegate.create(name, type, *constructorArgs)

    @Deprecated("Use register instead. See https://docs.gradle.org/current/userguide/task_configuration_avoidance.html for more information.", ReplaceWith("register(name, type, configuration)"))
    @Suppress("DEPRECATION")
    override fun <T : Task> create(name: String, type: Class<T>, configuration: 
```