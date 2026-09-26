# COMANDO - ScalaRuntime.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\scala\org\gradle\api\tasks\ScalaRuntime.java
**SHA:** 33fa824ccff91004
**Timestamp:** 2026-08-28T02:51:33.086566
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Deprecate this class in 9.x when we de-incubate ScalaPluginExtension#getScalaVersion()

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2013 the original author or authors.
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
package org.gradle.api.tasks;

import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import org.gradle.api.Buildable;
import org.gradle.api.GradleException;
import org.gradle.api.Project;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.file.FileCollection;
import org.gradle.api.internal.artifacts.dependencies.DefaultExternalModuleDependency;
import org.gradle.api.internal.file.collections.FailingFileCollection;
import org.gradle.api.internal.file.collections.LazilyInitializedFileCollection;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.internal.tasks.TaskDependencyResolveContext;
import org.gradle.api.plugins.jvm.internal.JvmPluginServices;
import org.gradle.api.plugins.scala.ScalaPluginExtension;
import org.gradle.api.tasks.scala.internal.ScalaRuntimeHelper;

import javax.annotation.Nullable;
import java.io.File;

/**
 * Provides information related to the Scala runtime(s) used in a project. Added by the
 * {@code org.gradle.api.plugins.scala.ScalaBasePlugin} as a project extension named {@code scalaRuntime}.
 *
 * <p>Example usage:
 *
 * <pre class='autoTested'>
 *     plugins {
 *         id 'scala'
 *     }
 *
 *     repositories {
 *         mavenCentral()
 *     }
 *
 *     dependencies {
 *         implementation "org.scala-lang:scala-library:2.10.1"
 *     }
 *
 *     def scalaClasspath = scalaRuntime.inferScalaClasspath(configurations.compileClasspath)
 *     // The returned class path can be used to configure the 'scalaClasspath' property of tasks
 *     // such as 'ScalaCompile' or 'ScalaDoc', or to execute these and other Scala tools directly.
 * </pre>
 */
public abstract class ScalaRuntime {

    // TODO: Deprecate this class in 9.x when we de-incubate ScalaPluginExtension#getScalaVersion()

    private final Project project;
    private final JvmPluginServices jvmPluginServices;

    public ScalaRuntime(Project project) {
        this.project = project;
        this.jvmPluginServices = ((ProjectInternal) project).getServices().get(JvmPluginServices.class);
    }

    /**
     * Searches the specified class path for a 'scala-library' Jar, and returns a class path
     * containing a corresponding (same version) 'scala-compiler' Jar and its dependencies.
     *
     * <p>The returned class path may be empty, or may fail to resolve when asked for its contents.
     *
     * @param classpath a class path containing a 'scala-library' Jar
     * @return a class path containing a corresponding 'scala-compiler' Jar and its dependencies
     */
    public FileCollection inferScalaClasspath(final Iterable<File> classpath) {
        // alternatively, we could return project.getLayout().files(Runnable)
        // would differ in the following ways: 1. live (not sure if we want live here) 2. no autowiring (probably want autowiring here)
        return new LazilyInitializedFileCollection(((ProjectInternal) project).getTaskDependencyFactory()) {
            @Override
            public String getDisplayName() {
                return "Scala runtime classpath";
            }

            @Override
            public FileCollection createDelegate() {
                try {
                    return inferScalaClasspath();
                } catch (RuntimeException e) {
                    return new FailingFileCollection(getDisplayName(), e);
                }
            }

            private Configuration inferScalaClasspath() {
                File scalaLibraryJar = findScalaJar(classpath, "library");
                File scala3LibraryJar = findScalaJar(classpath, "library_3");
                boolean isScala3 = scala3LibraryJar != null;
                if (scalaLibraryJar == null && scala3LibraryJar == null) {
                    throw new GradleException(String.format("Cannot infer Scala class path because no Scala library Jar was found. "
                        + "Does %s declare dependency to scala-library? Searched classpath: %s.", project, classpath));
                }

                String scalaVersion;
                if (isScala3) {
                    scalaVersion = getScalaVersion(scala3LibraryJar);
                } else {
                    scalaVersion = getScalaVersion(scalaLibraryJar);
                }

                if (scalaVersion == null) {
                    throw new AssertionError(String.format("
```