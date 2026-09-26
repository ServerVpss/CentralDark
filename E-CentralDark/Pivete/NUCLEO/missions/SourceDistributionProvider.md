# MISSAO - SourceDistributionProvider.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\kotlin-dsl\org\gradle\kotlin\dsl\resolver\SourceDistributionProvider.kt
**SHA:** 8c0ffd5fc485dd27
**Timestamp:** 2026-08-28T02:50:38.294913
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO:kotlin-dsl consider commenting out this clause once the 1st 6.0 snapshot is out

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2017 the original author or authors.
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

package org.gradle.kotlin.dsl.resolver

import org.gradle.api.Action
import org.gradle.api.Project
import org.gradle.api.artifacts.Dependency
import org.gradle.api.artifacts.repositories.IvyArtifactRepository
import org.gradle.api.artifacts.transform.TransformAction
import org.gradle.api.artifacts.transform.TransformParameters
import org.gradle.api.artifacts.transform.TransformSpec
import org.gradle.api.attributes.Attribute
import org.gradle.api.internal.project.ProjectInternal
import org.gradle.kotlin.dsl.*
import org.gradle.util.GradleVersion
import java.io.File


interface SourceDistributionProvider {
    fun sourceDirs(): Collection<File>
}


class SourceDistributionResolver(private val project: Project) : SourceDistributionProvider {

    companion object {
        val artifactType: Attribute<String> = Attribute.of("artifactType", String::class.java)
        const val ZIP_TYPE = "zip"
        const val SOURCE_DIRECTORY = "src-directory"
    }

    override fun sourceDirs(): Collection<File> =
        try {
            sourceDirs
        } catch (ex: Exception) {
            project.logger.warn("Unexpected exception while resolving Gradle distribution sources: ${ex.message}", ex)
            emptyList()
        }

    private
    val sourceDirs by lazy {
        createSourceRepository()
        registerTransforms()
        transientConfigurationForSourcesDownload().files
    }

    private
    fun registerTransforms() {
        registerTransform<FindGradleSources> {
            from.attribute(artifactType, ZIP_TYPE)
            to.attribute(artifactType, SOURCE_DIRECTORY)
        }
    }

    private
    fun transientConfigurationForSourcesDownload() =
        detachedConfigurationFor(gradleSourceDependency()).apply {
            attributes.attribute(artifactType, SOURCE_DIRECTORY)
        }

    private
    fun detachedConfigurationFor(dependency: Dependency) =
        configurations.detachedConfiguration(dependency)

    private
    fun gradleSourceDependency() = dependencies.create(
        group = "gradle",
        name = "gradle",
        version = dependencyVersion(gradleVersion),
        configuration = null,
        classifier = "src",
        ext = "zip"
    )

    private
    fun createSourceRepository() = ivy {
        val repoName = repositoryNameFor(gradleVersion)
        name = "Gradle $repoName"
        setUrl("https://services.gradle.org/$repoName")
        metadataSources {
            artifact()
        }
        patternLayout {
            if (isSnapshot(gradleVersion)) {
                ivy("/dummy") // avoids a lookup that interferes with version listing
            }
            artifact("[module]-[revision](-[classifier])(.[ext])")
        }
    }

    private
    fun repositoryNameFor(gradleVersion: String) =
        if (isSnapshot(gradleVersion)) "distributions-snapshots" else "distributions"

    private
    fun dependencyVersion(gradleVersion: String) =
        if (isSnapshot(gradleVersion)) toVersionRange(gradleVersion) else gradleVersion

    private
    fun isSnapshot(gradleVersion: String) = gradleVersion.contains('+')

    private
    fun toVersionRange(gradleVersion: String) =
        "(${minimumGradleVersion()}, $gradleVersion]"

    private
    inline fun <reified T : TransformAction<TransformParameters.None>> registerTransform(configure: Action<TransformSpec<TransformParameters.None>>) =
        dependencies.registerTransform(T::class.java, configure)

    private
    fun ivy(configure: Action<IvyArtifactRepository>) =
        repositories.ivy(configure)

    private
    fun minimumGradleVersion(): String {
        val baseVersionString = GradleVersion.version(gradleVersion).baseVersion.version
        val (major, minor) = baseVersionString.split('.')
        return when (minor) {
            // TODO:kotlin-dsl consider commenting out this clause once the 1st 6.0 snapshot is out
            "0" -> {
                // When testing against a `major.0` snapshot we need to take into account
                // that source distributions matching the major version might not have
                // been published yet. In that case we adjust the constraint to include
                // source distributions beginning from the previous major version.
                "${previous(major)}.0"
            }

            else -> {
                // Otherwise include source dist
```