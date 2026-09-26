# MISSAO - DefaultMavenPublication.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\maven\org\gradle\api\publish\maven\internal\publication\DefaultMavenPublication.java
**SHA:** b5cbac9476cce750
**Timestamp:** 2026-08-28T02:50:40.608748
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This method should be removed in favor of lazily adding artifacts to the publication state.
- // TODO: introduce something like a NormalizedMavenArtifact to capture the required MavenArtifact

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

package org.gradle.api.publish.maven.internal.publication;

import org.gradle.api.Action;
import org.gradle.api.DomainObjectCollection;
import org.gradle.api.DomainObjectSet;
import org.gradle.api.InvalidUserDataException;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.artifacts.ModuleVersionIdentifier;
import org.gradle.api.artifacts.PublishArtifact;
import org.gradle.api.component.SoftwareComponent;
import org.gradle.api.file.Directory;
import org.gradle.api.internal.CollectionCallbackActionDecorator;
import org.gradle.api.internal.CompositeDomainObjectSet;
import org.gradle.api.internal.artifacts.DefaultModuleVersionIdentifier;
import org.gradle.api.internal.artifacts.Module;
import org.gradle.api.internal.artifacts.configurations.DependencyMetaDataProvider;
import org.gradle.api.internal.artifacts.ivyservice.ivyresolve.parser.MavenVersionUtils;
import org.gradle.api.internal.attributes.AttributesFactory;
import org.gradle.api.internal.attributes.ImmutableAttributes;
import org.gradle.api.internal.component.SoftwareComponentInternal;
import org.gradle.api.internal.file.FileCollectionFactory;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.internal.tasks.TaskDependencyFactory;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.provider.Property;
import org.gradle.api.provider.ProviderFactory;
import org.gradle.api.provider.SetProperty;
import org.gradle.api.publish.VersionMappingStrategy;
import org.gradle.api.publish.internal.CompositePublicationArtifactSet;
import org.gradle.api.publish.internal.DefaultPublicationArtifactSet;
import org.gradle.api.publish.internal.PublicationArtifactInternal;
import org.gradle.api.publish.internal.PublicationArtifactSet;
import org.gradle.api.publish.internal.versionmapping.VersionMappingStrategyInternal;
import org.gradle.api.publish.maven.MavenArtifact;
import org.gradle.api.publish.maven.MavenArtifactSet;
import org.gradle.api.publish.maven.MavenPom;
import org.gradle.api.publish.maven.internal.artifact.AbstractMavenArtifact;
import org.gradle.api.publish.maven.internal.artifact.DefaultMavenArtifactSet;
import org.gradle.api.publish.maven.internal.artifact.DerivedMavenArtifact;
import org.gradle.api.publish.maven.internal.artifact.SingleOutputTaskMavenArtifact;
import org.gradle.api.publish.maven.internal.publisher.MavenNormalizedPublication;
import org.gradle.api.publish.maven.internal.publisher.MavenPublicationCoordinates;
import org.gradle.api.publish.maven.internal.validation.MavenPublicationErrorChecker;
import org.gradle.api.tasks.TaskDependency;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.internal.Cast;
import org.gradle.internal.Describables;
import org.gradle.internal.DisplayName;
import org.gradle.internal.typeconversion.NotationParser;
import org.gradle.util.internal.CollectionUtils;
import org.gradle.util.internal.GUtil;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.io.File;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import static java.util.stream.Collectors.toMap;

public abstract class DefaultMavenPublication implements MavenPublicationInternal {

    private final String name;
    private final AttributesFactory attributesFactory;
    private final TaskDependencyFactory taskDependencyFactory;
    private final String projectDisplayName;
    private final Directory buildDir;

    private final VersionMappingStrategyInternal versionMappingStrategy;
    private final MavenPomInternal pom;
    private final DefaultMavenArtifactSet mainArtifacts;
    private final PublicationArtifactSet<MavenArtifact> metadataArtifacts;
    private final PublicationArtifactSet<MavenArtifact> derivedArtifacts;
    private final PublicationArtifactSet<MavenArtifact> publishableArtifacts;
    private final SetProperty<MavenArtifact> componentArtifacts;
    private final Set<String> silencedVariants = new HashSet<>();
    private MavenArtifact pomArtifact;
    private SingleOutputTaskMavenArtifact moduleMetadataArtifact;
    private TaskProvider<? extends Task> moduleDescriptorGenerator;
    private boolean isPublishWithOriginalFileName;
    private boolean alias;
    private boolean populated;
    private boolean artifactsOverridden;
    private boolean sil
```