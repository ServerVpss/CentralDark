# MISSAO - XCTestConventionPlugin.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\testing-native\org\gradle\nativeplatform\test\xctest\plugins\XCTestConventionPlugin.java
**SHA:** 3eefcbd9cfbe48b7
**Timestamp:** 2026-08-28T02:51:54.960109
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Need to lazily configure compile task
- // TODO: Ultimately, this should be some kind of 3rd party dependency that's visible to dependency management.

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

package org.gradle.nativeplatform.test.xctest.plugins;

import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.artifacts.Dependency;
import org.gradle.api.file.ConfigurableFileCollection;
import org.gradle.api.file.RegularFile;
import org.gradle.api.internal.attributes.AttributesFactory;
import org.gradle.api.internal.project.ProjectInternal;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.provider.Provider;
import org.gradle.api.provider.ProviderFactory;
import org.gradle.api.provider.SetProperty;
import org.gradle.api.tasks.Sync;
import org.gradle.api.tasks.TaskContainer;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.language.base.plugins.LifecycleBasePlugin;
import org.gradle.language.internal.NativeComponentFactory;
import org.gradle.language.nativeplatform.internal.Dimensions;
import org.gradle.language.nativeplatform.internal.Names;
import org.gradle.language.nativeplatform.internal.toolchains.ToolChainSelector;
import org.gradle.language.nativeplatform.tasks.UnexportMainSymbol;
import org.gradle.language.swift.ProductionSwiftComponent;
import org.gradle.language.swift.SwiftApplication;
import org.gradle.language.swift.SwiftComponent;
import org.gradle.language.swift.SwiftPlatform;
import org.gradle.language.swift.internal.DefaultSwiftBinary;
import org.gradle.language.swift.internal.DefaultSwiftPlatform;
import org.gradle.language.swift.plugins.SwiftBasePlugin;
import org.gradle.language.swift.tasks.SwiftCompile;
import org.gradle.model.internal.registry.ModelRegistry;
import org.gradle.nativeplatform.TargetMachine;
import org.gradle.nativeplatform.TargetMachineFactory;
import org.gradle.nativeplatform.platform.internal.DefaultNativePlatform;
import org.gradle.nativeplatform.tasks.LinkMachOBundle;
import org.gradle.nativeplatform.test.plugins.NativeTestingBasePlugin;
import org.gradle.nativeplatform.test.xctest.SwiftXCTestBinary;
import org.gradle.nativeplatform.test.xctest.SwiftXCTestBundle;
import org.gradle.nativeplatform.test.xctest.SwiftXCTestSuite;
import org.gradle.nativeplatform.test.xctest.internal.DefaultSwiftXCTestBinary;
import org.gradle.nativeplatform.test.xctest.internal.DefaultSwiftXCTestBundle;
import org.gradle.nativeplatform.test.xctest.internal.DefaultSwiftXCTestExecutable;
import org.gradle.nativeplatform.test.xctest.internal.DefaultSwiftXCTestSuite;
import org.gradle.nativeplatform.test.xctest.tasks.InstallXCTestBundle;
import org.gradle.nativeplatform.test.xctest.tasks.XCTest;
import org.gradle.nativeplatform.toolchain.NativeToolChain;
import org.gradle.nativeplatform.toolchain.internal.NativeToolChainInternal;
import org.gradle.nativeplatform.toolchain.internal.NativeToolChainRegistryInternal;
import org.gradle.nativeplatform.toolchain.internal.PlatformToolProvider;
import org.gradle.nativeplatform.toolchain.internal.xcode.MacOSSdkPlatformPathLocator;
import org.gradle.util.internal.GUtil;

import javax.inject.Inject;
import java.io.File;
import java.util.Arrays;

import static org.gradle.language.nativeplatform.internal.Dimensions.tryToBuildOnHost;
import static org.gradle.language.nativeplatform.internal.Dimensions.useHostAsDefaultTargetMachine;

/**
 * A plugin that sets up the infrastructure for testing native binaries with XCTest test framework. It also adds conventions on top of it.
 *
 * @since 4.2
 */
public abstract class XCTestConventionPlugin implements Plugin<Project> {
    private final MacOSSdkPlatformPathLocator sdkPlatformPathLocator;
    private final ToolChainSelector toolChainSelector;
    private final NativeComponentFactory componentFactory;
    private final ObjectFactory objectFactory;
    private final AttributesFactory attributesFactory;
    private final TargetMachineFactory targetMachineFactory;

    @Inject
    public XCTestConventionPlugin(MacOSSdkPlatformPathLocator sdkPlatformPathLocator, ToolChainSelector toolChainSelector, NativeComponentFactory componentFactory, ObjectFactory objectFactory, AttributesFactory attributesFactory, TargetMachineFactory targetMachineFactory) {
        this.sdkPlatformPathLocator = sdkPlatformPathLocator;
        this.toolChainSelector = toolChainSelector;
        this.componentFactory = componentFactory;
        this.objectFactory = objectFactory;
        this.attributesFactory = attributesFactory;
        this.targetMachineFactory = targetMachineFactor
```