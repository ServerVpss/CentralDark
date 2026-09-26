# MISSAO - NativeComponents.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\internal\NativeComponents.java
**SHA:** e9c28a38317845ac
**Timestamp:** 2026-08-28T02:51:06.322713
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- //TODO:HH wire binary libs via executable
- //TODO:HH installTask.dependsOn(executable)

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
package org.gradle.nativeplatform.internal;

import org.apache.commons.lang.StringUtils;
import org.gradle.api.Action;
import org.gradle.api.DefaultTask;
import org.gradle.api.Task;
import org.gradle.api.file.FileCollection;
import org.gradle.api.internal.resolve.ProjectModelResolver;
import org.gradle.language.base.plugins.LifecycleBasePlugin;
import org.gradle.model.ModelMap;
import org.gradle.model.internal.registry.ModelRegistry;
import org.gradle.model.internal.type.ModelTypes;
import org.gradle.nativeplatform.NativeBinarySpec;
import org.gradle.nativeplatform.NativeComponentSpec;
import org.gradle.nativeplatform.NativeDependencySet;
import org.gradle.nativeplatform.NativeExecutableFileSpec;
import org.gradle.nativeplatform.NativeInstallationSpec;
import org.gradle.nativeplatform.tasks.InstallExecutable;
import org.gradle.nativeplatform.tasks.LinkExecutable;
import org.gradle.platform.base.BinaryContainer;
import org.gradle.platform.base.ComponentSpec;
import org.gradle.platform.base.ComponentSpecContainer;
import org.gradle.platform.base.VariantComponentSpec;
import org.gradle.platform.base.internal.BinaryNamingScheme;
import org.gradle.platform.base.internal.BinarySpecInternal;
import org.gradle.platform.base.internal.dependents.DependentBinariesResolvedResult;
import org.gradle.platform.base.internal.dependents.DependentBinariesResolver;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

public class NativeComponents {

    private static final String ASSEMBLE_DEPENDENTS_TASK_NAME = "assembleDependents";
    private static final String BUILD_DEPENDENTS_TASK_NAME = "buildDependents";

    public static void createExecutableTask(final NativeBinarySpecInternal binary, final File executableFile) {
        String taskName = binary.getNamingScheme().getTaskName("link");
        binary.getTasks().create(taskName, LinkExecutable.class, new Action<LinkExecutable>() {
            @Override
            public void execute(LinkExecutable linkTask) {
                linkTask.setDescription("Links " + binary.getDisplayName());
                linkTask.getToolChain().set(binary.getToolChain());
                linkTask.getTargetPlatform().set(binary.getTargetPlatform());
                linkTask.getLinkedFile().set(executableFile);
                linkTask.getLinkerArgs().set(binary.getLinker().getArgs());

                linkTask.lib(new BinaryLibs(binary) {
                    @Override
                    protected FileCollection getFiles(NativeDependencySet nativeDependencySet) {
                        return nativeDependencySet.getLinkFiles();
                    }
                });
                binary.builtBy(linkTask);
            }
        });
    }

    public static void createInstallTask(final NativeBinarySpecInternal binary, final NativeInstallationSpec installation, final NativeExecutableFileSpec executable, final BinaryNamingScheme namingScheme) {
        binary.getTasks().create(namingScheme.getTaskName("install"), InstallExecutable.class, new Action<InstallExecutable>() {
            @Override
            public void execute(InstallExecutable installTask) {
                installTask.setDescription("Installs a development image of " + binary.getDisplayName());
                installTask.setGroup(LifecycleBasePlugin.BUILD_GROUP);
                installTask.getToolChain().set(executable.getToolChain());
                installTask.getTargetPlatform().set(binary.getTargetPlatform());
                installTask.getExecutableFile().set(executable.getFile());
                installTask.getInstallDirectory().set(installation.getDirectory());
                //TODO:HH wire binary libs via executable
                installTask.lib(new BinaryLibs(binary) {
                    @Override
                    protected FileCollection getFiles(NativeDependencySet nativeDependencySet) {
                        return nativeDependencySet.getRuntimeFiles();
                    }
                });

                //TODO:HH installTask.dependsOn(executable)
                installTask.dependsOn(binary);
            }
        });
    }

    public static void createBuildDependentComponentsTasks(ModelMap<Task> tasks, ComponentSpecContainer components) {
        for (final VariantComponentSpec component : components.withType(NativeComponentS
```