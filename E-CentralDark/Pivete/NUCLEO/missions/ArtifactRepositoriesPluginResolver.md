# MISSAO - ArtifactRepositoriesPluginResolver.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\plugin-use\org\gradle\plugin\use\resolve\internal\ArtifactRepositoriesPluginResolver.java
**SHA:** 5504ca361b8c0e76
**Timestamp:** 2026-08-28T02:51:13.568851
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- * TODO: Performing resolution here is likely quite inefficient. This performs resolution

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2016 the original author or authors.
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
package org.gradle.plugin.use.resolve.internal;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Joiner;
import org.gradle.api.artifacts.ArtifactView;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.ConfigurationContainer;
import org.gradle.api.artifacts.Dependency;
import org.gradle.api.artifacts.ExternalModuleDependency;
import org.gradle.api.artifacts.ModuleDependency;
import org.gradle.api.artifacts.ModuleIdentifier;
import org.gradle.api.artifacts.ModuleVersionSelector;
import org.gradle.api.artifacts.dsl.DependencyFactory;
import org.gradle.api.artifacts.repositories.ArtifactRepository;
import org.gradle.api.internal.artifacts.DefaultModuleIdentifier;
import org.gradle.api.internal.artifacts.DependencyResolutionServices;
import org.gradle.api.internal.artifacts.repositories.ArtifactRepositoryInternal;
import org.gradle.api.internal.plugins.PluginManagerInternal;
import org.gradle.plugin.management.internal.PluginCoordinates;
import org.gradle.plugin.management.internal.PluginRequestInternal;
import org.gradle.plugin.use.PluginId;

import java.util.Iterator;

import static com.google.common.base.Strings.isNullOrEmpty;

public class ArtifactRepositoriesPluginResolver implements PluginResolver {

    public static final String PLUGIN_MARKER_SUFFIX = ".gradle.plugin";

    @VisibleForTesting
    static final String SOURCE_NAME = "Plugin Repositories";

    private final DependencyResolutionServices resolutionServices;

    public ArtifactRepositoriesPluginResolver(DependencyResolutionServices resolutionServices) {
        this.resolutionServices = resolutionServices;
    }

    @Override
    public PluginResolutionResult resolve(PluginRequestInternal pluginRequest) {
        ModuleDependency markerDependency = getMarkerDependency(pluginRequest);
        String markerVersion = markerDependency.getVersion();
        if (isNullOrEmpty(markerVersion)) {
            return PluginResolutionResult.notFound(SOURCE_NAME, "plugin dependency must include a version number for this source");
        }

        boolean autoApplied = pluginRequest.getOrigin() == PluginRequestInternal.Origin.AUTO_APPLIED;
        if (exists(markerDependency) || autoApplied) {
            // Even if we don't find the auto-applied plugin version, continue trying to resolve it with a preferred version,
            // in case the user provides an explicit or transitive required version.
            // The resolution will fail if there is no user-provided required version, however it avoids us failing here
            // if the weak version is not present but never selected.
            return PluginResolutionResult.found(new ExternalPluginResolution(getDependencyFactory(), pluginRequest, autoApplied));
        } else {
            return handleNotFound("could not resolve plugin artifact '" + getNotation(markerDependency) + "'");
        }
    }

    static class ExternalPluginResolution implements PluginResolution {
        private final DependencyFactory dependencyFactory;
        private final PluginRequestInternal pluginRequest;
        private final boolean useWeakVersion;

        /**
         * @param dependencyFactory Creates dependency instances
         * @param pluginRequest The original plugin request.
         * @param useWeakVersion Whether a preferred version should be used for the plugin dependency.
         */
        public ExternalPluginResolution(DependencyFactory dependencyFactory, PluginRequestInternal pluginRequest, boolean useWeakVersion) {
            this.dependencyFactory = dependencyFactory;
            this.pluginRequest = pluginRequest;
            this.useWeakVersion = useWeakVersion;
        }

        @Override
        public PluginId getPluginId() {
            return pluginRequest.getId();
        }

        @Override
        public String getPluginVersion() {
            if (pluginRequest.getModule() != null) {
                return pluginRequest.getModule().getVersion();
            } else {
                return pluginRequest.getVersion();
            }
        }

        @Override
        public void accept(PluginResolutionVisitor visitor) {
            String id = pluginRequest.getId().getId();

            ModuleVersionSelector selector = pluginRequest.getModule();
            ModuleIdentifier module = selector != null
         
```