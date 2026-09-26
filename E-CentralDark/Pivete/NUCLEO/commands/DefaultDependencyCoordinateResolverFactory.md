# COMANDO - DefaultDependencyCoordinateResolverFactory.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\publish\org\gradle\api\publish\internal\mapping\DefaultDependencyCoordinateResolverFactory.java
**SHA:** 9300fc1678534604
**Timestamp:** 2026-08-28T02:51:25.704524
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;

### Gaps
- * TODO: While this is currently static, we should selectively enable it in order to run
- * TODO: Once dependency mapping is stabilized, we should be able to turn this off / remove it entirely

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

package org.gradle.api.publish.internal.mapping;

import com.google.common.annotations.VisibleForTesting;
import org.gradle.api.InvalidUserDataException;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.artifacts.DependencyConstraint;
import org.gradle.api.artifacts.ExternalDependency;
import org.gradle.api.artifacts.ModuleVersionIdentifier;
import org.gradle.api.artifacts.ProjectDependency;
import org.gradle.api.artifacts.result.ResolutionResult;
import org.gradle.api.artifacts.result.ResolvedComponentResult;
import org.gradle.api.artifacts.result.ResolvedVariantResult;
import org.gradle.api.component.SoftwareComponentVariant;
import org.gradle.api.internal.artifacts.ImmutableModuleIdentifierFactory;
import org.gradle.api.internal.artifacts.dependencies.DefaultProjectDependencyConstraint;
import org.gradle.api.internal.artifacts.dependencies.ProjectDependencyInternal;
import org.gradle.api.internal.artifacts.ivyservice.projectmodule.ProjectDependencyPublicationResolver;
import org.gradle.api.internal.attributes.AttributeContainerInternal;
import org.gradle.api.internal.attributes.AttributeDesugaring;
import org.gradle.api.internal.attributes.ImmutableAttributes;
import org.gradle.api.internal.provider.Providers;
import org.gradle.api.provider.Provider;
import org.gradle.api.publish.internal.component.ResolutionBackedVariant;
import org.gradle.api.publish.internal.validation.VariantWarningCollector;
import org.gradle.api.publish.internal.versionmapping.VariantVersionMappingStrategyInternal;
import org.gradle.api.publish.internal.versionmapping.VersionMappingStrategyInternal;
import org.gradle.util.Path;

import javax.annotation.Nullable;
import javax.inject.Inject;

/**
 * Default implementation of {@link DependencyCoordinateResolverFactory} that
 * resolves dependencies using version mapping.
 */
public class DefaultDependencyCoordinateResolverFactory implements DependencyCoordinateResolverFactory {

    /**
     * Determines whether we implement publication versionMapping with the legacy implementation
     * or the new dependency mapping implementation.
     *
     * TODO: While this is currently static, we should selectively enable it in order to run
     *       versionMapping tests against both implementations.
     *
     * TODO: Once dependency mapping is stabilized, we should be able to turn this off / remove it entirely
     */
    private static final boolean USE_LEGACY_VERSION_MAPPING = true;

    private final ProjectDependencyPublicationResolver projectDependencyResolver;
    private final ImmutableModuleIdentifierFactory moduleIdentifierFactory;
    private final AttributeDesugaring attributeDesugaring;

    @Inject
    public DefaultDependencyCoordinateResolverFactory(
        ProjectDependencyPublicationResolver projectDependencyResolver,
        ImmutableModuleIdentifierFactory moduleIdentifierFactory,
        AttributeDesugaring attributeDesugaring
    ) {
        this.projectDependencyResolver = projectDependencyResolver;
        this.moduleIdentifierFactory = moduleIdentifierFactory;
        this.attributeDesugaring = attributeDesugaring;
    }

    @Override
    public Provider<DependencyResolvers> createCoordinateResolvers(SoftwareComponentVariant variant, VersionMappingStrategyInternal versionMappingStrategy) {
        Configuration configuration = null;
        if (variant instanceof ResolutionBackedVariant) {
            ResolutionBackedVariant resolutionBackedVariant = (ResolutionBackedVariant) variant;
            configuration = resolutionBackedVariant.getResolutionConfiguration();

            if (resolutionBackedVariant.getPublishResolvedCoordinates()) {
                if (configuration == null) {
                    throw new InvalidUserDataException("Cannot enable dependency mapping without configuring a resolution configuration.");
                } else {
                    return getDependencyMappingResolver(configuration);
                }
            }
        }

        ImmutableAttributes attributes = ((AttributeContainerInternal) variant.getAttributes()).asImmutable();
        VariantVersionMappingStrategyInternal versionMapping = versionMappingStrategy.findStrategyForVariant(attributes);

        // Fallback to component coordinate mapping if variant mapping is not enabled
        Provider<? extends ComponentDependencyResolver> componentR
```