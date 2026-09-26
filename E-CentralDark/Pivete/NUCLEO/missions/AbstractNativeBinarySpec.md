# MISSAO - AbstractNativeBinarySpec.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\internal\AbstractNativeBinarySpec.java
**SHA:** 6f08237d2bf2e897
**Timestamp:** 2026-08-28T02:51:05.776642
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO:HH Use managed views for this, only applied when the respective language is applied

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

package org.gradle.nativeplatform.internal;

import com.google.common.collect.ImmutableMap;
import org.gradle.api.file.FileCollection;
import org.gradle.api.internal.file.FileCollectionFactory;
import org.gradle.language.nativeplatform.DependentSourceSet;
import org.gradle.language.nativeplatform.internal.DependentSourceSetInternal;
import org.gradle.nativeplatform.BuildType;
import org.gradle.nativeplatform.Flavor;
import org.gradle.nativeplatform.NativeComponentSpec;
import org.gradle.nativeplatform.NativeDependencySet;
import org.gradle.nativeplatform.NativeLibraryBinary;
import org.gradle.nativeplatform.PreprocessingTool;
import org.gradle.nativeplatform.Tool;
import org.gradle.nativeplatform.internal.resolve.NativeBinaryRequirementResolveResult;
import org.gradle.nativeplatform.internal.resolve.NativeBinaryResolveResult;
import org.gradle.nativeplatform.internal.resolve.NativeDependencyResolver;
import org.gradle.nativeplatform.platform.NativePlatform;
import org.gradle.nativeplatform.platform.internal.NativePlatformInternal;
import org.gradle.nativeplatform.tasks.ObjectFilesToBinary;
import org.gradle.nativeplatform.toolchain.NativeToolChain;
import org.gradle.nativeplatform.toolchain.internal.NativeToolChainInternal;
import org.gradle.nativeplatform.toolchain.internal.PlatformToolProvider;
import org.gradle.nativeplatform.toolchain.internal.PreCompiledHeader;
import org.gradle.platform.base.binary.BaseBinarySpec;
import org.gradle.platform.base.internal.BinaryBuildAbility;
import org.gradle.platform.base.internal.ToolSearchBuildAbility;

import java.io.File;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

public abstract class AbstractNativeBinarySpec extends BaseBinarySpec implements NativeBinarySpecInternal {
    private final Set<? super Object> libs = new LinkedHashSet<Object>();
    private final Tool linker = new DefaultTool();
    private final Tool staticLibArchiver = new DefaultTool();

    // TODO:HH Use managed views for this, only applied when the respective language is applied
    private final Tool assembler = new DefaultTool();
    private final PreprocessingTool cCompiler = new DefaultPreprocessingTool();
    private final PreprocessingTool cppCompiler = new DefaultPreprocessingTool();
    private final PreprocessingTool objcCompiler = new DefaultPreprocessingTool();
    private final PreprocessingTool objcppCompiler = new DefaultPreprocessingTool();
    private final PreprocessingTool rcCompiler = new DefaultPreprocessingTool();
    private final Map<String, Tool> toolsByName = ImmutableMap.<String, Tool>builder()
            .put("assembler", assembler)
            .put("cCompiler", cCompiler)
            .put("cppCompiler", cppCompiler)
            .put("objcCompiler", objcCompiler)
            .put("objcppCompiler", objcppCompiler)
            .put("rcCompiler", rcCompiler)
            .build();

    private PlatformToolProvider toolProvider;
    private Flavor flavor;
    private NativeToolChain toolChain;
    private NativePlatform targetPlatform;
    private BuildType buildType;
    private NativeDependencyResolver resolver;
    private Map<File, PreCompiledHeader> prefixFileToPCH = new HashMap<>();
    private FileCollectionFactory fileCollectionFactory;

    @Override
    public String getDisplayName() {
        return getNamingScheme().getDescription();
    }

    @Override
    public NativeComponentSpec getComponent() {
        return getComponentAs(NativeComponentSpec.class);
    }

    @Override
    public Flavor getFlavor() {
        return flavor;
    }

    @Override
    public void setFlavor(Flavor flavor) {
        this.flavor = flavor;
    }

    @Override
    public NativeToolChain getToolChain() {
        return toolChain;
    }

    @Override
    public void setToolChain(NativeToolChain toolChain) {
        this.toolChain = toolChain;
    }

    @Override
    public NativePlatform getTargetPlatform() {
        return targetPlatform;
    }

    @Override
    public void setTargetPlatform(NativePlatform targetPlatform) {
        this.targetPlatform = targetPlatform;
    }

    @Override
    public BuildType getBuildType() {
        return buildType;
    }

    @Override
    public void setBuildType(BuildType buildType) {
        this.buildType = bu
```