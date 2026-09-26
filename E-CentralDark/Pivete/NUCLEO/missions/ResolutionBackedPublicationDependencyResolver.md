# MISSAO - ResolutionBackedPublicationDependencyResolver.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\publish\org\gradle\api\publish\internal\mapping\ResolutionBackedPublicationDependencyResolver.java
**SHA:** d1016faa9fea3034
**Timestamp:** 2026-08-28T02:51:25.696078
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Using the display name here is not great, however it is the same as the variant name.
- // TODO: We should enhance this warning to list the conflicting dependencies.
- // TODO: We should enhance this warning to list the conflicting dependencies.

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

import org.gradle.api.GradleException;
import org.gradle.api.InvalidUserDataException;
import org.gradle.api.artifacts.DependencyConstraint;
import org.gradle.api.artifacts.ExternalDependency;
import org.gradle.api.artifacts.ModuleDependency;
import org.gradle.api.artifacts.ModuleIdentifier;
import org.gradle.api.artifacts.ModuleVersionIdentifier;
import org.gradle.api.artifacts.ProjectDependency;
import org.gradle.api.artifacts.capability.CapabilitySelector;
import org.gradle.api.artifacts.component.ComponentIdentifier;
import org.gradle.api.artifacts.component.ComponentSelector;
import org.gradle.api.artifacts.component.ModuleComponentIdentifier;
import org.gradle.api.artifacts.component.ModuleComponentSelector;
import org.gradle.api.artifacts.component.ProjectComponentIdentifier;
import org.gradle.api.artifacts.component.ProjectComponentSelector;
import org.gradle.api.artifacts.result.DependencyResult;
import org.gradle.api.artifacts.result.ResolvedComponentResult;
import org.gradle.api.artifacts.result.ResolvedDependencyResult;
import org.gradle.api.artifacts.result.ResolvedVariantResult;
import org.gradle.api.artifacts.result.UnresolvedDependencyResult;
import org.gradle.api.attributes.AttributeContainer;
import org.gradle.api.internal.artifacts.ImmutableModuleIdentifierFactory;
import org.gradle.api.internal.artifacts.ProjectComponentIdentifierInternal;
import org.gradle.api.internal.artifacts.dependencies.DefaultProjectDependencyConstraint;
import org.gradle.api.internal.artifacts.dependencies.ProjectDependencyInternal;
import org.gradle.api.internal.artifacts.ivyservice.projectmodule.ProjectDependencyPublicationResolver;
import org.gradle.api.internal.attributes.AttributeContainerInternal;
import org.gradle.api.internal.attributes.AttributeDesugaring;
import org.gradle.api.internal.attributes.ImmutableAttributes;
import org.gradle.api.publish.internal.validation.VariantWarningCollector;
import org.gradle.internal.component.local.model.ProjectComponentSelectorInternal;
import org.gradle.util.Path;

import javax.annotation.Nullable;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;

/**
 * A {@link VariantDependencyResolver} that analyzes a resolution result to determine the
 * resolved coordinates for a given dependency.
 *
 * <p>The configuration being resolved should declare the same dependencies as the variant
 * being published. Then, each outgoing edge of the analyzed resolution result will correspond
 * to each declared dependency on the published variant. We build a mapping from requested
 * coordinates to resolved coordinates. Then, when resolving individual variant or component
 * coordinates, we can look up in the map to determine what coordinates should be published
 * for a given declared dependency.</p>
 */
public class ResolutionBackedPublicationDependencyResolver implements VariantDependencyResolver, ComponentDependencyResolver {

    private final ProjectDependencyPublicationResolver projectDependencyResolver;
    private final ImmutableModuleIdentifierFactory moduleIdentifierFactory;
    private final AttributeDesugaring attributeDesugaring;

    private final ResolvedMappings mappings;

    public ResolutionBackedPublicationDependencyResolver(
        ProjectDependencyPublicationResolver projectDependencyResolver,
        ImmutableModuleIdentifierFactory moduleIdentifierFactory,
        ResolvedComponentResult rootComponent,
        ResolvedVariantResult rootVariant,
        AttributeDesugaring attributeDesugaring
    ) {
        this.projectDependencyResolver = projectDependencyResolver;
        this.moduleIdentifierFactory = moduleIdentifierFactory;
        this.attributeDesugaring = attributeDesugaring;

        this.mappings = calculateMappings(rootComponent, rootVariant, projectDependencyResolver, moduleIdentifierFactory);
    }

    private static ResolvedMappings calculateMappings(
        ResolvedComponentResult rootComponent,
        ResolvedVariantResult rootVariant,
        ProjectDependencyPublicationResolver projectDependencyResolver,
        ImmutableModuleIdentifierFactory moduleIdentifierFactory
    ) {
        Set<ModuleDependencyKey> incompatibleModuleDeps = new HashSet<>();
       
```