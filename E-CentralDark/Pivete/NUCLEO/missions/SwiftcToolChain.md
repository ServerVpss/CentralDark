# MISSAO - SwiftcToolChain.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\platform-native\org\gradle\nativeplatform\toolchain\internal\swift\SwiftcToolChain.java
**SHA:** 26b058e1076e97ba
**Timestamp:** 2026-08-28T02:51:11.499828
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: this is an approximation as we know swift currently supports only 64-bit runtimes - eventually, we'll want to query for this

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

package org.gradle.nativeplatform.toolchain.internal.swift;

import org.gradle.internal.file.PathToFileResolver;
import org.gradle.internal.operations.BuildOperationExecutor;
import org.gradle.internal.os.OperatingSystem;
import org.gradle.internal.reflect.Instantiator;
import org.gradle.internal.work.WorkerLeaseService;
import org.gradle.nativeplatform.internal.CompilerOutputFileNamingSchemeFactory;
import org.gradle.nativeplatform.platform.NativePlatform;
import org.gradle.nativeplatform.platform.internal.DefaultNativePlatform;
import org.gradle.nativeplatform.platform.internal.NativePlatformInternal;
import org.gradle.nativeplatform.toolchain.Swiftc;
import org.gradle.nativeplatform.toolchain.SwiftcPlatformToolChain;
import org.gradle.nativeplatform.toolchain.internal.ExtendableToolChain;
import org.gradle.nativeplatform.toolchain.internal.NativeLanguage;
import org.gradle.nativeplatform.toolchain.internal.PlatformToolProvider;
import org.gradle.nativeplatform.toolchain.internal.ToolType;
import org.gradle.nativeplatform.toolchain.internal.UnavailablePlatformToolProvider;
import org.gradle.nativeplatform.toolchain.internal.UnsupportedPlatformToolProvider;
import org.gradle.nativeplatform.toolchain.internal.metadata.CompilerMetaDataProvider;
import org.gradle.nativeplatform.toolchain.internal.swift.metadata.SwiftcMetadata;
import org.gradle.nativeplatform.toolchain.internal.tools.CommandLineToolSearchResult;
import org.gradle.nativeplatform.toolchain.internal.tools.DefaultCommandLineToolConfiguration;
import org.gradle.nativeplatform.toolchain.internal.tools.ToolSearchPath;
import org.gradle.platform.base.internal.toolchain.SearchResult;
import org.gradle.platform.base.internal.toolchain.ToolChainAvailability;
import org.gradle.process.internal.ExecActionFactory;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SwiftcToolChain extends ExtendableToolChain<SwiftcPlatformToolChain> implements Swiftc {
    public static final String DEFAULT_NAME = "swiftc";

    private final CompilerOutputFileNamingSchemeFactory compilerOutputFileNamingSchemeFactory;
    private final CompilerMetaDataProvider<SwiftcMetadata> compilerMetaDataProvider;
    private final Instantiator instantiator;
    private final ToolSearchPath toolSearchPath;
    private final ExecActionFactory execActionFactory;
    private final WorkerLeaseService workerLeaseService;
    private final Map<NativePlatform, PlatformToolProvider> toolProviders = new HashMap<>();

    public SwiftcToolChain(String name, BuildOperationExecutor buildOperationExecutor, OperatingSystem operatingSystem, PathToFileResolver fileResolver, ExecActionFactory execActionFactory, CompilerOutputFileNamingSchemeFactory compilerOutputFileNamingSchemeFactory, CompilerMetaDataProvider<SwiftcMetadata> compilerMetaDataProvider, Instantiator instantiator, WorkerLeaseService workerLeaseService) {
        this(name, buildOperationExecutor, operatingSystem, fileResolver, execActionFactory, compilerOutputFileNamingSchemeFactory, new ToolSearchPath(operatingSystem), compilerMetaDataProvider, instantiator, workerLeaseService);
    }

    SwiftcToolChain(String name, BuildOperationExecutor buildOperationExecutor, OperatingSystem operatingSystem, PathToFileResolver fileResolver, ExecActionFactory execActionFactory, CompilerOutputFileNamingSchemeFactory compilerOutputFileNamingSchemeFactory, ToolSearchPath tools, CompilerMetaDataProvider<SwiftcMetadata> compilerMetaDataProvider, Instantiator instantiator, WorkerLeaseService workerLeaseService) {
        super(name, buildOperationExecutor, operatingSystem, fileResolver);
        this.compilerOutputFileNamingSchemeFactory = compilerOutputFileNamingSchemeFactory;
        this.compilerMetaDataProvider = compilerMetaDataProvider;
        this.instantiator = instantiator;
        this.toolSearchPath = tools;
        this.execActionFactory = execActionFactory;
        this.workerLeaseService = workerLeaseService;
    }

    @Override
    public List<File> getPath() {
        return toolSearchPath.getPath();
    }

    @Override
    public void path(Object... pathEntries) {
        for (Object path : pathEntries) {
            toolSearchPath.path(resolve(path));
        }
    }

    private PlatformToolProvider createPlatformToolProvider(NativePlatformInternal targetPlatform) {
        
```