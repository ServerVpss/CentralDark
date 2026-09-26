# MISSAO - DistributionBasePlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugins-distribution\org\gradle\api\distribution\plugins\DistributionBasePlugin.java
**SHA:** 0e62cce6544a5b36
**Timestamp:** 2026-08-28T02:51:15.547403
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Maintain old behavior of checking for empty-string distribution base names.

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2012 the original author or authors.
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

package org.gradle.api.distribution.plugins;

import org.apache.commons.lang.StringUtils;
import org.gradle.api.DefaultTask;
import org.gradle.api.GradleException;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.distribution.Distribution;
import org.gradle.api.distribution.DistributionContainer;
import org.gradle.api.distribution.internal.DefaultDistributionContainer;
import org.gradle.api.file.CopySpec;
import org.gradle.api.internal.CollectionCallbackActionDecorator;
import org.gradle.api.internal.artifacts.dsl.LazyPublishArtifact;
import org.gradle.api.internal.file.FileOperations;
import org.gradle.api.internal.plugins.DefaultArtifactPublicationSet;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.plugins.BasePlugin;
import org.gradle.api.provider.Provider;
import org.gradle.api.tasks.Sync;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.api.tasks.bundling.AbstractArchiveTask;
import org.gradle.api.tasks.bundling.Tar;
import org.gradle.api.tasks.bundling.Zip;
import org.gradle.internal.reflect.Instantiator;
import org.gradle.util.internal.TextUtil;

import javax.inject.Inject;
import java.util.concurrent.Callable;

/**
 * A plugin that configures rules allowing projects to be packaged as a distribution.
 * <p>
 * As a base plugin, this plugin adds no distributions by default.
 * The {@link DistributionPlugin} adds a {@code main} distribution as a convention.
 *
 * @see <a href="https://docs.gradle.org/current/userguide/distribution_plugin.html">Distribution plugin reference</a>
 *
 * @since 8.13
 */
public abstract class DistributionBasePlugin implements Plugin<Project> {

    private static final String DISTRIBUTION_GROUP = "distribution";
    private static final String TASK_DIST_ZIP_NAME = "distZip";
    private static final String TASK_DIST_TAR_NAME = "distTar";
    private static final String TASK_ASSEMBLE_NAME = "assembleDist";

    private final Instantiator instantiator;
    private final FileOperations fileOperations;
    private final CollectionCallbackActionDecorator callbackActionDecorator;

    @Inject
    public DistributionBasePlugin(Instantiator instantiator, FileOperations fileOperations, CollectionCallbackActionDecorator callbackActionDecorator) {
        this.instantiator = instantiator;
        this.fileOperations = fileOperations;
        this.callbackActionDecorator = callbackActionDecorator;
    }

    @Override
    public void apply(final Project project) {
        project.getPluginManager().apply(BasePlugin.class);
        DefaultArtifactPublicationSet defaultArtifactPublicationSet = project.getExtensions().getByType(DefaultArtifactPublicationSet.class);

        DistributionContainer distributions = project.getExtensions().create(DistributionContainer.class, "distributions", DefaultDistributionContainer.class, Distribution.class, instantiator, project.getObjects(), fileOperations, callbackActionDecorator);
        distributions.all(dist -> configureDistribution((ProjectInternal) project, dist, defaultArtifactPublicationSet));

        // TODO: Maintain old behavior of checking for empty-string distribution base names.
        // It would be nice if we could do this as validation on the property itself.
        project.afterEvaluate(p -> {
            distributions.forEach(distribution -> {
                if (distribution.getDistributionBaseName().get().equals("")) {
                    throw new GradleException(String.format("Distribution '%s' must not have an empty distributionBaseName.", distribution.getName()));
                }
            });
        });
    }

    /**
     * Configures conventions and associated domain objects for a single distribution.
     */
    private static void configureDistribution(
        ProjectInternal project,
        Distribution dist,
        DefaultArtifactPublicationSet defaultArtifactPublicationSet
    ) {
        dist.getContents().from("src/" + dist.getName() + "/dist");

        String zipTaskName;
        String tarTaskName;
        String installTaskName;
        String assembleTaskName;

        if (dist.getName().equals(DistributionPlugin.MAIN_DISTRIBUTION_NAME)) {
            zipTaskName = TASK_DIST_ZIP_NAME;
            tarTaskName = TASK_DIST_TAR_NAME;
            installTaskName = DistributionPlugin.TASK_INSTALL_NAME;
            assembleTaskNam
```