# MISSAO - ComponentModelBasePlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-base\org\gradle\language\base\plugins\ComponentModelBasePlugin.java
**SHA:** 918ea26a7fbdfdd4
**Timestamp:** 2026-08-28T02:51:01.335058
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Convert this to `@BinaryTasks` when we model a `NativeAssembly` instead of wiring compile tasks directly to LinkTask
- // TODO:LPTR We should collect all source sets in the project source set, however this messes up ComponentReportRenderer

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2014 the original author or authors.
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
package org.gradle.language.base.plugins;

import com.google.common.base.Joiner;
import org.gradle.api.Action;
import org.gradle.api.DefaultTask;
import org.gradle.api.GradleException;
import org.gradle.api.Incubating;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.internal.CollectionCallbackActionDecorator;
import org.gradle.api.internal.TaskInternal;
import org.gradle.api.internal.project.ProjectIdentifier;
import org.gradle.api.internal.tasks.TaskContainerInternal;
import org.gradle.api.internal.tasks.TaskDependencyUtil;
import org.gradle.api.plugins.ExtensionContainer;
import org.gradle.api.tasks.TaskContainer;
import org.gradle.internal.logging.text.TreeFormatter;
import org.gradle.internal.reflect.Instantiator;
import org.gradle.internal.service.ServiceRegistry;
import org.gradle.language.base.LanguageSourceSet;
import org.gradle.language.base.ProjectSourceSet;
import org.gradle.language.base.internal.ProjectLayout;
import org.gradle.language.base.internal.model.BinarySourceTransformations;
import org.gradle.language.base.internal.registry.DefaultLanguageTransformContainer;
import org.gradle.language.base.internal.registry.LanguageTransform;
import org.gradle.language.base.internal.registry.LanguageTransformContainer;
import org.gradle.model.Defaults;
import org.gradle.model.Each;
import org.gradle.model.Finalize;
import org.gradle.model.Model;
import org.gradle.model.ModelMap;
import org.gradle.model.Mutate;
import org.gradle.model.Path;
import org.gradle.model.RuleInput;
import org.gradle.model.RuleSource;
import org.gradle.model.RuleTarget;
import org.gradle.model.Rules;
import org.gradle.model.internal.core.Hidden;
import org.gradle.model.internal.core.NamedEntityInstantiator;
import org.gradle.platform.base.ApplicationSpec;
import org.gradle.platform.base.BinaryContainer;
import org.gradle.platform.base.BinarySpec;
import org.gradle.platform.base.ComponentSpecContainer;
import org.gradle.platform.base.ComponentType;
import org.gradle.platform.base.GeneralComponentSpec;
import org.gradle.platform.base.LibrarySpec;
import org.gradle.platform.base.PlatformAwareComponentSpec;
import org.gradle.platform.base.PlatformContainer;
import org.gradle.platform.base.SourceComponentSpec;
import org.gradle.platform.base.TypeBuilder;
import org.gradle.platform.base.VariantComponentSpec;
import org.gradle.platform.base.component.BaseComponentSpec;
import org.gradle.platform.base.internal.BinarySpecInternal;
import org.gradle.platform.base.internal.DefaultPlatformContainer;
import org.gradle.platform.base.internal.DefaultPlatformResolvers;
import org.gradle.platform.base.internal.HasIntermediateOutputsComponentSpec;
import org.gradle.platform.base.internal.PlatformAwareComponentSpecInternal;
import org.gradle.platform.base.internal.PlatformResolvers;
import org.gradle.platform.base.internal.dependents.BaseDependentBinariesResolutionStrategy;
import org.gradle.platform.base.internal.dependents.DefaultDependentBinariesResolver;
import org.gradle.platform.base.internal.dependents.DependentBinariesResolver;
import org.gradle.platform.base.plugins.BinaryBasePlugin;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static com.google.common.base.Strings.emptyToNull;

/**
 * Base plugin for component support.
 *
 * Adds a {@link org.gradle.platform.base.ComponentSpecContainer} named {@code components} to the model.
 *
 * For each binary instance added to the binaries container, registers a lifecycle task to create that binary.
 */
@Incubating
public abstract class ComponentModelBasePlugin implements Plugin<Project> {

    @Override
    public void apply(Project project) {
        project.getPluginManager().apply(LanguageBasePlugin.class);
        project.getPluginManager().apply(BinaryBasePlugin.class);
    }

    @SuppressWarnings("UnusedDeclaration")
    static class PluginRules extends RuleSource {
        @ComponentType
        void registerGeneralComponentSpec(TypeBuilder<GeneralComponentSpec> builder) {
            builder.defaultImplementation(BaseComponentSpec.class);
        }

        @ComponentType
        void registerLibrarySpec(TypeBuilder<LibrarySpec> builder) {
            builder.defaultImplementation(BaseComponentSpec.class);
        }

        @ComponentType
        void registerAppli
```